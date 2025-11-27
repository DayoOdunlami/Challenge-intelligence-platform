'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import type { BaseEntity, Domain, UniversalRelationship } from '@/lib/base-entity';
import { buildNetworkFromBaseEntities } from '@/lib/toolkit/buildNetworkFromBaseEntities';

const DOMAIN_COLORS: Record<Domain, string> = {
  'atlas': '#3B82F6',         // blue
  'navigate': '#10B981',      // green
  'cpc-internal': '#006E51',  // CPC green
  'reference': '#6B7280',     // gray
  'cross-domain': '#F97316',  // orange
};

export interface UnifiedNetworkGraphD3Props {
  entities: BaseEntity[];
  relationships: UniversalRelationship[];
  className?: string;
  onNodeSelect?: (entity: BaseEntity | null) => void;
}

type GraphNode = {
  id: string;
  name: string;
  type: string;
  symbolSize: number;
  itemStyle: { color: string };
  fullData: BaseEntity;
} & d3.SimulationNodeDatum;

type GraphLink = {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
} & d3.SimulationLinkDatum<GraphNode>;

const resolveNodeId = (value: GraphNode | string | number) =>
  typeof value === 'object' ? value.id : String(value);

export function UnifiedNetworkGraphD3({
  entities,
  relationships,
  className = '',
  onNodeSelect,
}: UnifiedNetworkGraphD3Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 700 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Build graph data from unified schema
  const { nodes: rawNodes, links: rawLinks } = useMemo(
    () => buildNetworkFromBaseEntities(entities, relationships),
    [entities, relationships]
  );

  // Convert to D3 format
  const nodes = useMemo<GraphNode[]>(() => {
    return rawNodes.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      symbolSize: node.symbolSize || 20,
      itemStyle: node.itemStyle,
      fullData: node.fullData,
    }));
  }, [rawNodes]);

  const links = useMemo<GraphLink[]>(() => {
    return rawLinks.map((link) => ({
      source: link.source,
      target: link.target,
      value: link.value || 1,
    }));
  }, [rawLinks]);

  // Build adjacency map for highlighting
  const adjacency = useMemo(() => {
    const adj = new Map<string, Set<string>>();
    links.forEach((link) => {
      const sourceId = resolveNodeId(link.source);
      const targetId = resolveNodeId(link.target);
      if (!adj.has(sourceId)) adj.set(sourceId, new Set());
      if (!adj.has(targetId)) adj.set(targetId, new Set());
      adj.get(sourceId)!.add(targetId);
      adj.get(targetId)!.add(sourceId);
    });
    return adj;
  }, [links]);

  // Compute highlighted nodes (selected/hovered + neighbors)
  const highlightedIds = useMemo(() => {
    const highlightSet = new Set<string>();
    const activeId = hoveredId || selectedId;
    if (!activeId) return highlightSet;
    
    highlightSet.add(activeId);
    const neighbors = adjacency.get(activeId);
    if (neighbors) {
      neighbors.forEach((neighborId) => highlightSet.add(neighborId));
    }
    return highlightSet;
  }, [selectedId, hoveredId, adjacency]);

  // Update dimensions
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

  // Main D3 rendering (based on Toolkit's D3NetworkGraphView)
  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const { width, height } = dimensions;
    svg.attr('width', width).attr('height', height);

    // Create groups
    const zoomContainer = svg.append('g').attr('class', 'zoom-container');
    const linkGroup = zoomContainer.append('g').attr('class', 'links');
    const nodeGroup = zoomContainer.append('g').attr('class', 'nodes');

    // Setup zoom
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        zoomContainer.attr('transform', event.transform);
      });
    
    const initialZoom = d3.zoomIdentity.scale(0.65).translate(width * 0.15, height * 0.15);
    svg.call(zoomBehavior);
    svg.call(zoomBehavior.transform, initialZoom);

    // Create simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d) => (d.symbolSize || 20) + 5));

    simulationRef.current = simulation;

    // Draw links
    const link = linkGroup
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.5)
      .attr('opacity', (d) => {
        if (!selectedId && !hoveredId) return 0.6;
        const sourceId = resolveNodeId(d.source);
        const targetId = resolveNodeId(d.target);
        return highlightedIds.has(sourceId) && highlightedIds.has(targetId) ? 1 : 0.1;
      })
      .attr('stroke-width', (d) => {
        if (!selectedId && !hoveredId) return 1.5;
        const sourceId = resolveNodeId(d.source);
        const targetId = resolveNodeId(d.target);
        return highlightedIds.has(sourceId) && highlightedIds.has(targetId) ? 3 : 0.5;
      });

    // Draw nodes (exactly like Toolkit)
    const node = nodeGroup
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => d.symbolSize || 20)
      .attr('fill', (d) => {
        const domain = d.fullData?.domain as Domain | undefined;
        return domain && DOMAIN_COLORS[domain] ? DOMAIN_COLORS[domain] : d.itemStyle.color;
      })
      .attr('stroke', (d) => {
        if (d.id === selectedId) return '#fbbf24';
        return highlightedIds.has(d.id) ? '#6366f1' : '#ffffff';
      })
      .attr('stroke-width', (d) => {
        if (d.id === selectedId) return 4;
        return highlightedIds.has(d.id) ? 2 : 1;
      })
      .attr('opacity', (d) => {
        if (!selectedId && !hoveredId) return 1;
        return highlightedIds.has(d.id) ? 1 : 0.25;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        const newId = d.id === selectedId ? null : d.id;
        setSelectedId(newId);
        if (onNodeSelect) {
          const entity = newId ? entities.find((e) => e.id === newId) ?? null : null;
          onNodeSelect(entity);
        }
      })
      .on('mouseenter', (event, d) => {
        setHoveredId(d.id);
      })
      .on('mouseleave', () => {
        setHoveredId(null);
      });

    // Drag behavior
    const dragBehavior = d3
      .drag<SVGCircleElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active && simulation) {
          simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && simulation) {
          simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      });
    node.call(dragBehavior);

    // Add labels (only on hover or selected)
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
        if (d.id === selectedId || d.id === hoveredId) return 1;
        return 0;
      });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (typeof d.source === 'object' ? d.source.x! : 0))
        .attr('y1', (d) => (typeof d.source === 'object' ? d.source.y! : 0))
        .attr('x2', (d) => (typeof d.target === 'object' ? d.target.x! : 0))
        .attr('y2', (d) => (typeof d.target === 'object' ? d.target.y! : 0));

      node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
      label.attr('x', (d) => d.x!).attr('y', (d) => d.y!);
    });

    // Click background to deselect
    svg.on('click', () => {
      setSelectedId(null);
      setHoveredId(null);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, dimensions, selectedId, hoveredId, highlightedIds, entities, onNodeSelect]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}

