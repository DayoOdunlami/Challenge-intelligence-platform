'use client';

import { useEffect, useRef, useState, useMemo, useCallback, ReactNode } from 'react';
import * as d3 from 'd3';
import { CirclePackingNode } from '@/data/toolkit/circlePackingData';
import {
  buildNetworkFromCircleData,
  NetworkLink,
  NetworkNode,
} from '@/lib/toolkit/buildNetworkFromCircleData';
import { StakeholderInsightPanel } from './StakeholderInsightPanel';

type D3NetworkGraphViewProps = {
  selectedId: string | null;
  highlightedIds: Set<string> | null;
  selectedNode: CirclePackingNode | null;
  relatedEntities: CirclePackingNode[];
  onSelectNodeAction: (id: string | null) => void;
  showEmbeddedControls?: boolean;
  showEmbeddedInsights?: boolean;
  onControlsRender?: ((renderControls: (() => ReactNode) | null) => void) | null;
  onControlsVisibilityChange?: (visible: boolean) => void;
  onInsightsVisibilityChange?: (visible: boolean) => void;
  insightsToggleEnabled?: boolean;
};

const TYPE_COLORS: Record<string, string> = {
  government: '#006E51',
  intermediary: '#2d8f6f',
  academia: '#7b2cbf',
  industry: '#e76f51',
  project: '#f4a261',
  working_group: '#264653',
};

const GROUP_COLORS: Record<string, string> = {
  stakeholder: '#4A90E2',
  project: '#f4a261',
  working_group: '#264653',
};

type GraphNode = NetworkNode & d3.SimulationNodeDatum & { key: string };
type GraphLink = Omit<NetworkLink, 'source' | 'target'> & d3.SimulationLinkDatum<GraphNode>;

const buildCirclePath = (cx: number, cy: number, radius: number) =>
  `M ${cx},${cy} m -${radius},0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;

const computePodPath = (points: Array<{ x: number; y: number }>): string => {
  if (!points.length) return '';
  if (points.length === 1) {
    return buildCirclePath(points[0].x, points[0].y, 50);
  }

  const cx = d3.mean(points, (p) => p.x) ?? 0;
  const cy = d3.mean(points, (p) => p.y) ?? 0;
  const maxDistance = d3.max(points, (p) => Math.hypot(p.x - cx, p.y - cy)) ?? 0;
  const radius = Math.max(60, maxDistance + 50);
  return buildCirclePath(cx, cy, radius);
};

const resolveNodeId = (value: GraphNode | string | number) =>
  typeof value === 'object' ? value.id : String(value);

export function D3NetworkGraphView({
  selectedId,
  highlightedIds,
  selectedNode,
  relatedEntities,
  onSelectNodeAction,
  showEmbeddedControls = true,
  showEmbeddedInsights = true,
  onControlsRender = null,
  onControlsVisibilityChange,
  onInsightsVisibilityChange,
  insightsToggleEnabled = true,
}: D3NetworkGraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const particlesRef = useRef<Map<string, { progress: number; link: GraphLink }>>(new Map());
  const lastSearchZoomRef = useRef<string>('');
  const [dimensions, setDimensions] = useState({ width: 800, height: 700 });
  const [groupingMode, setGroupingMode] = useState<'entity_type' | 'stakeholder_category' | 'random'>('stakeholder_category');
  const [forceRepulsion, setForceRepulsion] = useState(600);
  const [edgeLength, setEdgeLength] = useState(250);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGroupPods, setShowGroupPods] = useState(false);
  const [showLinkDirection, setShowLinkDirection] = useState(true);
  const [animatePaths, setAnimatePaths] = useState(true);
  const [animateLinkFlow, setAnimateLinkFlow] = useState(false);
  const [highlightSearchResults, setHighlightSearchResults] = useState(true);
  const [searchFiltersResults, setSearchFiltersResults] = useState(false);
  const [zoomToSearchResults, setZoomToSearchResults] = useState(true);

  const baseNetwork = useMemo(() => buildNetworkFromCircleData(), []);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    () => new Set(baseNetwork.categories.map((category) => category.key))
  );

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredNetwork = useMemo(() => {
    let nodes = baseNetwork.nodes;

    if (normalizedSearchQuery && searchFiltersResults) {
      nodes = nodes.filter((node) => {
        const name = node.name.toLowerCase();
        const description = node.fullData.description?.toLowerCase() || '';
        return name.includes(normalizedSearchQuery) || description.includes(normalizedSearchQuery);
      });
    }

    if (activeCategories.size === 0) {
      nodes = [];
    } else if (activeCategories.size !== baseNetwork.categories.length) {
      nodes = nodes.filter((node) => activeCategories.has(node.type));
    }

    const allowedIds = new Set(nodes.map((node) => node.id));
    const links = baseNetwork.links.filter(
      (link) => allowedIds.has(link.source) && allowedIds.has(link.target)
    );

    return { nodes, links };
  }, [baseNetwork, normalizedSearchQuery, searchFiltersResults, activeCategories]);

  const searchMatchedIds = useMemo(() => {
    if (!normalizedSearchQuery) return new Set<string>();
    const matches = new Set<string>();
    baseNetwork.nodes.forEach((node) => {
      const name = node.name.toLowerCase();
      const description = node.fullData.description?.toLowerCase() || '';
      if (name.includes(normalizedSearchQuery) || description.includes(normalizedSearchQuery)) {
        matches.add(node.id);
      }
    });
    return matches;
  }, [baseNetwork, normalizedSearchQuery]);

  // Update dimensions on resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 700,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Main D3 rendering
  useEffect(() => {
    if (!svgRef.current || !filteredNetwork.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const { width, height } = dimensions;
    svg.attr('width', width).attr('height', height);
    const centerX = width / 2;
    const centerY = height / 2;

    // Create groups for layers (pods, links, nodes)
    const zoomContainer = svg.append('g').attr('class', 'zoom-container');
    const podGroup = zoomContainer.append('g').attr('class', 'pods');
    const linkGroup = zoomContainer.append('g').attr('class', 'links');
    const nodeGroup = zoomContainer.append('g').attr('class', 'nodes');

    // Setup zoom / pan with initial zoom out
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        zoomContainer.attr('transform', event.transform);
      });
    
    // Set initial zoom to show more of the graph (zoom out)
    const initialZoom = d3.zoomIdentity.scale(0.65).translate(width * 0.15, height * 0.15);
    const applyZoomTransform = (transform: d3.ZoomTransform) => {
      svg.call(zoomBehavior.transform, transform);
    };
    svg.call(zoomBehavior);
    svg.call(zoomBehavior.transform, initialZoom);
    zoomRef.current = zoomBehavior;
    if (!zoomToSearchResults) {
      lastSearchZoomRef.current = '';
    }

    const focusOnNodes = (targetNodes: typeof nodes, animate = true) => {
      if (!targetNodes.length) return;
      const xs = targetNodes.map((node) => node.x ?? 0);
      const ys = targetNodes.map((node) => node.y ?? 0);
      const minX = d3.min(xs) ?? 0;
      const maxX = d3.max(xs) ?? 0;
      const minY = d3.min(ys) ?? 0;
      const maxY = d3.max(ys) ?? 0;
      const padding = 150;
      const nodesWidth = Math.max(1, maxX - minX);
      const nodesHeight = Math.max(1, maxY - minY);
      const scale = Math.min(
        2.5,
        Math.max(
          0.4,
          Math.min(width / (nodesWidth + padding), height / (nodesHeight + padding))
        )
      );
      const translateX = width / 2 - scale * (minX + nodesWidth / 2);
      const translateY = height / 2 - scale * (minY + nodesHeight / 2);
      const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
      if (animate) {
        svg.transition().duration(450).call(zoomBehavior.transform, transform);
      } else {
        applyZoomTransform(transform);
      }
    };
    const resetToInitialView = () => {
      onSelectNodeAction(null);
      if (normalizedSearchQuery) {
        setSearchQuery('');
      }
      lastSearchZoomRef.current = '';
      focusOnNodes(nodes, false);
    };

    // Prepare nodes with initial positions based on grouping
    const nodes: GraphNode[] = filteredNetwork.nodes.map((node) => {
      const key = groupingMode === 'entity_type' ? node.group : node.type;
      return {
        ...node,
        x: centerX + (Math.random() - 0.5) * 200,
        y: centerY + (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
        fx: undefined,
        fy: undefined,
        key,
      };
    });

    // Group nodes by key for initial positioning
    if (groupingMode !== 'random') {
      const groups = new Map<string, typeof nodes>();
      nodes.forEach((node) => {
        if (!groups.has(node.key)) groups.set(node.key, []);
        groups.get(node.key)!.push(node);
      });

      const groupKeys = Array.from(groups.keys());
      const radius = 300;
      groupKeys.forEach((key, index) => {
        const groupNodes = groups.get(key)!;
        const angle = (2 * Math.PI * index) / Math.max(groupKeys.length, 1);
        const centerX_offset = Math.cos(angle) * radius;
        const centerY_offset = Math.sin(angle) * radius;

        groupNodes.forEach((node, i) => {
          const cols = Math.max(1, Math.ceil(Math.sqrt(groupNodes.length)));
          const row = Math.floor(i / cols);
          const col = i % cols;
          node.x = centerX + centerX_offset + (col - cols / 2) * 80;
          node.y = centerY + centerY_offset + (row - cols / 2) * 80;
        });
      });
    }

    // Create links (preserve line style metadata)
    const links: GraphLink[] = filteredNetwork.links.map((link) => ({
      ...link,
      source: nodes.find((n) => n.id === link.source) || link.source,
      target: nodes.find((n) => n.id === link.target) || link.target,
    }));

    // Custom force to pull nodes toward their group centroid (from Stack Overflow article approach)
    // This implements the "adjust node positions to move closer to group centroid" strategy
    const groupCentroidForce = () => {
      if (groupingMode === 'random') return;
      
      const force = (alpha: number) => {
        // Calculate centroids for each group
        const groups = new Map<string, { nodes: GraphNode[]; cx: number; cy: number }>();
        
        nodes.forEach((node) => {
          const key = groupingMode === 'entity_type' ? node.group : node.type;
          if (!groups.has(key)) {
            groups.set(key, { nodes: [], cx: 0, cy: 0 });
          }
          groups.get(key)!.nodes.push(node);
        });

        // Calculate centroid for each group
        groups.forEach((group) => {
          if (group.nodes.length === 0) return;
          const cx = d3.mean(group.nodes, (n) => n.x!) ?? 0;
          const cy = d3.mean(group.nodes, (n) => n.y!) ?? 0;
          group.cx = cx;
          group.cy = cy;
        });

        // Pull nodes toward their group centroid
        const groupStrength = 0.2; // Adjust this to control how strongly nodes are pulled to centroid
        nodes.forEach((node) => {
          const key = groupingMode === 'entity_type' ? node.group : node.type;
          const group = groups.get(key);
          if (!group || group.nodes.length <= 1) return;
          
          const dx = group.cx - (node.x ?? 0);
          const dy = group.cy - (node.y ?? 0);
          const distance = Math.hypot(dx, dy);
          
          if (distance > 0) {
            // Apply force proportional to distance from centroid
            const force = distance * groupStrength * alpha;
            node.vx = (node.vx ?? 0) + (dx / distance) * force;
            node.vy = (node.vy ?? 0) + (dy / distance) * force;
          }
        });
      };
      
      return force;
    };

    // Create force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance((d) => {
            const sourceId = resolveNodeId(d.source);
            const targetId = resolveNodeId(d.target);
            const link = filteredNetwork.links.find(
              (l) => l.source === sourceId && l.target === targetId
            );
            return link ? edgeLength * (link.value || 1) : edgeLength;
          })
          .strength((d) => {
            const sourceId = resolveNodeId(d.source);
            const targetId = resolveNodeId(d.target);
            const sourceNode = typeof d.source === 'object' ? d.source : nodes.find((n) => n.id === sourceId);
            const targetNode = typeof d.target === 'object' ? d.target : nodes.find((n) => n.id === targetId);
            
            if (groupingMode === 'entity_type' && sourceNode && targetNode) {
              // Weaken inter-group links significantly (as per Stack Overflow article)
              return sourceNode.group === targetNode.group ? 0.8 : 0.15;
            } else if (groupingMode === 'stakeholder_category' && sourceNode && targetNode) {
              // For stakeholder category mode, check if same type
              return sourceNode.type === targetNode.type ? 0.7 : 0.2;
            }
            return 0.5;
          })
      )
      .force('charge', d3.forceManyBody<GraphNode>().strength(-forceRepulsion))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide<GraphNode>().radius((d) => (d.symbolSize || 20) + 5));

    // Add custom group centroid force (applied in tick handler instead of as a force)
    const applyGroupCentroidForce = groupCentroidForce();

    simulationRef.current = simulation;

    // Create arrow markers for directional links
    const defs = svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(148,163,184,0.6)');
    const glowFilter = defs
      .append('filter')
      .attr('id', 'selected-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', 6).attr('result', 'blur');
    const merge = glowFilter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    const shouldHighlightSearch = highlightSearchResults && normalizedSearchQuery.length > 0;


    // Draw links
    const link = linkGroup
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => d.lineStyle?.color || 'rgba(148,163,184,0.6)')
      .attr('stroke-width', (d) => d.lineStyle?.width || 1.5)
      .attr('marker-end', showLinkDirection ? 'url(#arrowhead)' : null)
      .attr('opacity', (d) => {
        const baseOpacity = d.lineStyle?.opacity ?? 0.65;
        if (!selectedId || !highlightedIds || highlightedIds.size === 0) return baseOpacity;
        const sourceId = resolveNodeId(d.source);
        const targetId = resolveNodeId(d.target);
        const isHighlighted = highlightedIds.has(sourceId) && highlightedIds.has(targetId);
        if (animatePaths && selectedId) {
          const isFromSelected = sourceId === selectedId || targetId === selectedId;
          return isHighlighted ? Math.min(1, baseOpacity + 0.35) : isFromSelected ? 0.55 : 0.15;
        }
        return isHighlighted ? Math.min(1, baseOpacity + 0.25) : 0.2;
      })
      .attr('stroke-width', (d) => {
        const baseWidth = d.lineStyle?.width || 1.5;
        if (!selectedId || !highlightedIds || highlightedIds.size === 0) return baseWidth;
        const sourceId = resolveNodeId(d.source);
        const targetId = resolveNodeId(d.target);
        const isHighlighted = highlightedIds.has(sourceId) && highlightedIds.has(targetId);
        return isHighlighted ? baseWidth * 1.6 : Math.max(1, baseWidth * 0.6);
      })
      .on('click', (event) => {
        event.stopPropagation();
      });


    // Draw nodes
    const node = nodeGroup
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => d.symbolSize || 20)
      .attr('fill', (d) => TYPE_COLORS[d.type] || d.itemStyle.color)
      .attr('stroke', (d) => {
        if (d.id === selectedId) return '#fbbf24';
        if (shouldHighlightSearch && searchMatchedIds.has(d.id)) return '#10b981';
        return highlightedIds?.has(d.id) ? '#6366f1' : '#ffffff';
      })
      .attr('stroke-width', (d) => {
        if (d.id === selectedId) return 4;
        if (shouldHighlightSearch && searchMatchedIds.has(d.id)) return 2.5;
        return highlightedIds?.has(d.id) ? 2 : 1;
      })
      .attr('filter', (d) => (d.id === selectedId ? 'url(#selected-glow)' : null))
      .attr('opacity', (d) => {
        if (!selectedId || !highlightedIds) {
          if (shouldHighlightSearch && searchMatchedIds.has(d.id)) return 1;
          return 1;
        }
        return highlightedIds.has(d.id) ? 1 : 0.25;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectNodeAction(d.id === selectedId ? null : d.id);
      });

    // Drag behaviour
    const dragBehaviour = d3
      .drag<SVGCircleElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active && simulationRef.current) {
          simulationRef.current.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && simulationRef.current) {
          simulationRef.current.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      });
    node.call(dragBehaviour);

    // Add labels
    const label = nodeGroup
      .selectAll<SVGTextElement, GraphNode>('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.symbolSize || 20) + 15)
      .attr('font-size', '10px')
      .attr('fill', '#334155')
      .text((d) => d.name)
      .attr('opacity', (d) => {
        if (!selectedId || !highlightedIds) return 1;
        return highlightedIds.has(d.id) ? 1 : 0.25;
      });

    svg.on('click', () => {
      resetToInitialView();
    });

    // Particle animation for link flow
    const particleGroup = linkGroup.append('g').attr('class', 'particles');
    const particleMap = particlesRef.current;
    let particleIdCounter = 0;
    let animationFrameId: number | null = null;

    // Update positions on tick
    simulation.on('tick', () => {
      // Apply group centroid force (as per Stack Overflow article approach)
      if (applyGroupCentroidForce) {
        applyGroupCentroidForce(simulation.alpha());
      }
      
      // Update link positions
      const linkUpdate = link
        .attr('x1', (d) => (typeof d.source === 'object' ? d.source.x! : 0))
        .attr('y1', (d) => (typeof d.source === 'object' ? d.source.y! : 0))
        .attr('x2', (d) => (typeof d.target === 'object' ? d.target.x! : 0))
        .attr('y2', (d) => (typeof d.target === 'object' ? d.target.y! : 0));

      // Animate path transitions when selection changes (only if animatePaths is enabled)
      if (animatePaths && selectedId) {
        linkUpdate
          .transition()
          .duration(200)
          .ease(d3.easeCubicOut)
          .attr('opacity', (d) => {
            const sourceId = resolveNodeId(d.source);
            const targetId = resolveNodeId(d.target);
            const isHighlighted = highlightedIds?.has(sourceId) && highlightedIds?.has(targetId);
            const isFromSelected = sourceId === selectedId || targetId === selectedId;
            const baseOpacity = d.lineStyle?.opacity ?? 0.65;
            return isHighlighted ? Math.min(1, baseOpacity + 0.35) : isFromSelected ? 0.55 : 0.15;
          })
          .attr('stroke-width', (d) => {
            const sourceId = resolveNodeId(d.source);
            const targetId = resolveNodeId(d.target);
            const isHighlighted = highlightedIds?.has(sourceId) && highlightedIds?.has(targetId);
            const baseWidth = d.lineStyle?.width || 1.5;
            return isHighlighted ? baseWidth * 1.6 : Math.max(1, baseWidth * 0.6);
          });
      }

      node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
      label.attr('x', (d) => d.x!).attr('y', (d) => d.y!);

      if (zoomToSearchResults) {
        if (normalizedSearchQuery && searchMatchedIds.size > 0 && lastSearchZoomRef.current !== normalizedSearchQuery) {
          const matchedNodes = nodes.filter(
            (node) => searchMatchedIds.has(node.id) && node.x !== undefined && node.y !== undefined
          );
          if (matchedNodes.length) {
            focusOnNodes(matchedNodes);
            lastSearchZoomRef.current = normalizedSearchQuery;
          }
        } else if (normalizedSearchQuery && searchMatchedIds.size === 0 && lastSearchZoomRef.current) {
          lastSearchZoomRef.current = '';
          applyZoomTransform(initialZoom);
        } else if (!normalizedSearchQuery && lastSearchZoomRef.current) {
          lastSearchZoomRef.current = '';
          applyZoomTransform(initialZoom);
        }
      }

      // Animate link flow particles (handled via animation frame for smoother performance)
      if (!animateLinkFlow) {
        particleGroup.selectAll('*').remove();
        particleMap.clear();
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }

      // Update convex hull pods
      if (showGroupPods) {
        podGroup.selectAll('*').remove();
        
        const groups = new Map<string, Array<{ x: number; y: number }>>();
        nodes.forEach((node) => {
          const key = groupingMode === 'entity_type' ? node.group : node.type;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push({ x: node.x!, y: node.y! });
        });

        groups.forEach((points, key) => {
          if (points.length === 0) return;
          const podPath = computePodPath(points);
          if (!podPath) return;

          const color = groupingMode === 'entity_type' 
            ? GROUP_COLORS[key] || '#94a3b8'
            : TYPE_COLORS[key] || '#94a3b8';

          podGroup
            .append('path')
            .attr('d', podPath)
            .attr('fill', color)
            .attr('fill-opacity', 0.1)
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.3)
            .attr('pointer-events', 'none');
        });
      }
    });

    // Animation loop for link flow particles
    const animateParticles = () => {
      if (!animateLinkFlow || !particleGroup.node()) {
        return;
      }

      // Spawn new particles occasionally (only on highlighted links when selected)
      const activeLinks = selectedId && highlightedIds
        ? links.filter((l) => {
            const sourceId = resolveNodeId(l.source);
            const targetId = resolveNodeId(l.target);
            return highlightedIds.has(sourceId) && highlightedIds.has(targetId);
          })
        : links;

      if (Math.random() < 0.04 && activeLinks.length > 0) {
        const randomLink = activeLinks[Math.floor(Math.random() * activeLinks.length)];
        if (randomLink) {
          const id = `particle-${particleIdCounter++}`;
          particleMap.set(id, { progress: 0, link: randomLink });
        }
      }

      // Update and draw particles
      const particleKeys = Array.from(particleMap.keys());
      const particles = particleGroup.selectAll<SVGCircleElement, string>('circle.particle').data(particleKeys);
      const typedParticles = particles as d3.Selection<SVGCircleElement, string, SVGGElement, unknown>;
      
      const particleSelection = particles
        .enter()
        .append('circle')
        .attr('class', 'particle')
        .attr('r', 2.5)
        .attr('fill', '#3b82f6')
        .attr('opacity', 0.8)
        .merge(typedParticles);
      
      particleSelection
        .each(function (id) {
          const particle = particleMap.get(id);
          if (!particle) {
            d3.select(this).remove();
            return;
          }
          
          const { link: linkData, progress } = particle;
          // Find nodes from the simulation
          const sourceId = resolveNodeId(linkData.source);
          const targetId = resolveNodeId(linkData.target);
          const source = nodes.find((n) => n.id === sourceId);
          const target = nodes.find((n) => n.id === targetId);
          
          if (!source || !target || source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) {
            particleMap.delete(id);
            d3.select(this).remove();
            return;
          }
          
          const x = source.x + (target.x - source.x) * progress;
          const y = source.y + (target.y - source.y) * progress;
          
          d3.select(this).attr('cx', x).attr('cy', y);
          
          particle.progress += 0.015;
          if (particle.progress >= 1) {
            particleMap.delete(id);
            d3.select(this).remove();
          }
        });
      
      particles.exit().remove();
      
      animationFrameId = requestAnimationFrame(animateParticles);
    };

    // Start animation loop if enabled
    if (animateLinkFlow) {
      animationFrameId = requestAnimationFrame(animateParticles);
    }

    // Cleanup
    return () => {
      svg.on('click', null);
      simulation.stop();
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      particleMap.clear();
    };
  }, [
    filteredNetwork,
    dimensions,
    groupingMode,
    forceRepulsion,
    edgeLength,
    selectedId,
    highlightedIds,
    showGroupPods,
    showLinkDirection,
    animatePaths,
    animateLinkFlow,
    highlightSearchResults,
    searchMatchedIds,
    zoomToSearchResults,
    normalizedSearchQuery,
    onSelectNodeAction,
  ]);

  const renderControls = useCallback(() => (
    <>
      <div className="flex flex-wrap gap-4 px-4">
        <div className="flex items-center gap-2 text-sm">
          <label className="text-xs text-slate-600 whitespace-nowrap">Group by:</label>
          <select
            value={groupingMode}
            onChange={(e) => setGroupingMode(e.target.value as typeof groupingMode)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="entity_type">Entity Type</option>
            <option value="stakeholder_category">Stakeholder Category</option>
            <option value="random">Random</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showGroupPods}
            onChange={(e) => setShowGroupPods(e.target.checked)}
            className="rounded"
          />
          Show Group Pods
        </label>
      </div>

      <div className="px-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 whitespace-nowrap">Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities..."
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="px-4 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={searchFiltersResults}
            onChange={(e) => setSearchFiltersResults(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-slate-700">Filter graph when searching</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={zoomToSearchResults}
            onChange={(e) => {
              setZoomToSearchResults(e.target.checked);
              if (!e.target.checked) {
                lastSearchZoomRef.current = '';
              }
            }}
            className="rounded"
          />
          <span className="text-xs text-slate-700">Zoom to search results</span>
        </label>
      </div>

      <div className="px-4 flex flex-wrap gap-2 text-sm">
        {baseNetwork.categories.map((category) => {
          const active = activeCategories.has(category.key);
          const color = TYPE_COLORS[category.key] || '#64748b';
          return (
            <label
              key={category.key}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-full cursor-pointer transition ${
                active
                  ? 'border-blue-500 bg-blue-50 text-slate-800'
                  : 'border-slate-200 text-slate-400 bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() =>
                  setActiveCategories((prev) => {
                    const next = new Set(prev);
                    if (next.has(category.key)) {
                      next.delete(category.key);
                    } else {
                      next.add(category.key);
                    }
                    return next;
                  })
                }
                className="hidden"
              />
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-medium">{category.label}</span>
            </label>
          );
        })}
      </div>

      <div className="px-4 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600">Repulsion:</label>
          <input
            type="range"
            min="200"
            max="900"
            step="50"
            value={forceRepulsion}
            onChange={(e) => setForceRepulsion(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-slate-500 w-12">{forceRepulsion}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600">Edge Length:</label>
          <input
            type="range"
            min="50"
            max="300"
            step="25"
            value={edgeLength}
            onChange={(e) => setEdgeLength(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-slate-500 w-12">{edgeLength}</span>
        </div>
      </div>

      <div className="px-4 flex flex-wrap gap-4 text-sm border-t border-slate-200 pt-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLinkDirection}
            onChange={(e) => setShowLinkDirection(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-slate-700">Show Link Direction</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={animatePaths}
            onChange={(e) => setAnimatePaths(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-slate-700">Animate Paths</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={animateLinkFlow}
            onChange={(e) => setAnimateLinkFlow(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-slate-700">Animate Link Flow</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={highlightSearchResults}
            onChange={(e) => setHighlightSearchResults(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-slate-700">Highlight Search Results</span>
        </label>
      </div>
    </>
  ), [
    groupingMode,
    showGroupPods,
    searchQuery,
    searchFiltersResults,
    zoomToSearchResults,
    baseNetwork,
    activeCategories,
    forceRepulsion,
    edgeLength,
    showLinkDirection,
    animatePaths,
    animateLinkFlow,
    highlightSearchResults,
  ]);

  useEffect(() => {
    if (!onControlsRender) return;
    onControlsRender(renderControls);
    return () => {
      onControlsRender(null);
    };
  }, [onControlsRender, renderControls]);

  // Hide toggle buttons when external controls are provided (via onControlsRender)
  const usingExternalControls = Boolean(onControlsRender);
  
  return (
    <div className={usingExternalControls ? "w-full h-full" : "flex flex-col gap-4"}>
      {!usingExternalControls && (showEmbeddedControls ? (
        <div className="relative flex flex-col gap-4 bg-white/70 rounded-xl border border-slate-200 py-2">
          <button
            className="self-end mr-4 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            onClick={() => onControlsVisibilityChange?.(false)}
          >
            Hide inline controls
          </button>
          {renderControls()}
        </div>
      ) : (
        <div className="flex justify-end px-4 -mb-2">
          <button
            className="text-xs px-3 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => onControlsVisibilityChange?.(true)}
          >
            Show inline controls
          </button>
        </div>
      ))}

      <div className={usingExternalControls ? "w-full h-full flex-1" : `flex flex-col ${showEmbeddedInsights ? 'lg:flex-row' : ''} gap-4`}>
        <div
          ref={containerRef}
          className={usingExternalControls ? "w-full h-full min-h-[500px] flex-1" : "flex-1 bg-white rounded-xl shadow border border-slate-200"}
          style={usingExternalControls ? { minHeight: '500px' } : { height: '700px' }}
        >
          <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
        </div>
        {!usingExternalControls && (showEmbeddedInsights ? (
          <div className="w-full lg:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4 relative">
            {insightsToggleEnabled && (
              <button
                className="absolute top-2 right-2 text-[10px] text-slate-500 hover:text-slate-700 transition-colors"
                onClick={() => onInsightsVisibilityChange?.(false)}
              >
                Hide
              </button>
            )}
            <StakeholderInsightPanel
              selectedNode={selectedNode}
              relatedEntities={relatedEntities}
              onSelectNodeAction={onSelectNodeAction}
              emptyState="Click any node in the graph to view its details, connections, and related entities."
            />
          </div>
        ) : (
          insightsToggleEnabled && (
          <div className="flex justify-end px-4">
            <button
              className="text-xs px-3 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => onInsightsVisibilityChange?.(true)}
            >
              Show inline insights
            </button>
          </div>
        )))}
      </div>
    </div>
  );
}

