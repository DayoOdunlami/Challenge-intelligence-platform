'use client';

import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import * as d3 from 'd3';
import type { BaseEntity, Domain, UniversalRelationship } from '@/lib/base-entity';

// Dynamically import to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const DOMAIN_COLORS: Record<Domain, string> = {
  atlas: '#3B82F6',
  navigate: '#10B981',
  'cpc-internal': '#006E51',
  reference: '#6B7280',
  'cross-domain': '#F97316',
};

const ENTITY_TYPE_COLORS: Record<string, string> = {
  challenge: '#F59E0B',
  stakeholder: '#3B82F6',
  technology: '#8B5CF6',
  project: '#10B981',
  capability: '#EC4899',
  initiative: '#006E51',
  authority: '#6B7280',
  priority: '#EF4444',
};

const MODE_COLORS: Record<string, string> = {
  rail: '#DC2626',
  aviation: '#2563EB',
  maritime: '#0891B2',
  highways: '#CA8A04',
  'integrated-transport': '#7C3AED',
  'cross-modal': '#6B7280',
};

const THEME_COLORS: Record<string, string> = {
  autonomy: '#8B5CF6',
  'people-experience': '#EC4899',
  'hubs-and-clusters': '#F59E0B',
  decarbonisation: '#10B981',
  'planning-and-operation': '#3B82F6',
  industry: '#6B7280',
  'data-and-digital': '#06B6D4',
};

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type ClusterBy = 'domain' | 'entityType' | 'mode' | 'theme' | 'none';
export type ColorBy = 'domain' | 'entityType' | 'mode' | 'theme' | 'cluster';

interface GraphNode {
  id: string;
  name: string;
  domain: Domain;
  entityType: string;
  modes?: string[];
  themes?: string[];
  val: number;
  color: string;
  entity: BaseEntity;
  // Clustering
  cluster: string;
  clusterIndex: number;
  // Force simulation
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  // Neighbor lookup
  neighbors: GraphNode[];
  links: GraphLink[];
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  weight?: number;
}

interface ClusterInfo {
  id: string;
  label: string;
  color: string;
  nodeIds: string[];
  // Calculated centroid
  cx: number;
  cy: number;
  cz: number;
}

export interface UnifiedNetworkGraphProps {
  entities: BaseEntity[];
  relationships: UniversalRelationship[];
  mode?: '2d' | '3d';
  colorBy?: ColorBy;
  clusterBy?: ClusterBy;
  showClusterHulls?: boolean;
  className?: string;
  fitToCanvas?: boolean;
  clickToFocus?: boolean;
  showLabelsOnHover?: boolean;
  clusterStrength?: number;
  onNodeSelect?: (entity: BaseEntity | null) => void;
}

// ─────────────────────────────────────────────────────────────
// CLUSTERING UTILITIES
// ─────────────────────────────────────────────────────────────

function getClusterValue(entity: BaseEntity, clusterBy: ClusterBy): string {
  switch (clusterBy) {
    case 'domain':
      return entity.domain;
    case 'entityType':
      return entity.entityType;
    case 'mode':
      // Check metadata.custom for modes (set by adapters)
      const modes = (entity.metadata?.custom as { modes?: string[] })?.modes;
      return modes?.[0] || 'unknown';
    case 'theme':
      // Check metadata.custom for themes (set by adapters)
      const themes = (entity.metadata?.custom as { strategicThemes?: string[] })?.strategicThemes;
      return themes?.[0] || 'unknown';
    case 'none':
    default:
      return 'all';
  }
}

function getClusterColor(clusterValue: string, clusterBy: ClusterBy): string {
  switch (clusterBy) {
    case 'domain':
      return DOMAIN_COLORS[clusterValue as Domain] || '#6B7280';
    case 'entityType':
      return ENTITY_TYPE_COLORS[clusterValue] || '#6B7280';
    case 'mode':
      return MODE_COLORS[clusterValue] || '#6B7280';
    case 'theme':
      return THEME_COLORS[clusterValue] || '#6B7280';
    default:
      return '#6B7280';
  }
}

function getNodeColor(entity: BaseEntity, colorBy: ColorBy, clusterValue?: string): string {
  switch (colorBy) {
    case 'domain':
      return DOMAIN_COLORS[entity.domain] || '#6B7280';
    case 'entityType':
      return ENTITY_TYPE_COLORS[entity.entityType] || '#6B7280';
    case 'mode':
      const modes = (entity.metadata?.custom as { modes?: string[] })?.modes;
      return MODE_COLORS[modes?.[0] || ''] || '#6B7280';
    case 'theme':
      const themes = (entity.metadata?.custom as { strategicThemes?: string[] })?.strategicThemes;
      return THEME_COLORS[themes?.[0] || ''] || '#6B7280';
    case 'cluster':
      return clusterValue ? getClusterColor(clusterValue, 'entityType') : '#6B7280';
    default:
      return '#6B7280';
  }
}

function computeClusters(nodes: GraphNode[], clusterBy: ClusterBy): ClusterInfo[] {
  if (clusterBy === 'none') return [];

  const clusterMap = new Map<string, string[]>();
  nodes.forEach((node) => {
    if (!clusterMap.has(node.cluster)) {
      clusterMap.set(node.cluster, []);
    }
    clusterMap.get(node.cluster)!.push(node.id);
  });

  return Array.from(clusterMap.entries()).map(([value, nodeIds]) => ({
    id: `cluster-${value}`,
    label: value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    color: getClusterColor(value, clusterBy),
    nodeIds,
    cx: 0,
    cy: 0,
    cz: 0,
  }));
}

// ─────────────────────────────────────────────────────────────
// GRAPH DATA BUILDER
// ─────────────────────────────────────────────────────────────

function buildGraphData(
  entities: BaseEntity[],
  relationships: UniversalRelationship[],
  colorBy: ColorBy,
  clusterBy: ClusterBy
): { nodes: GraphNode[]; links: GraphLink[]; clusters: ClusterInfo[] } {
  // Build cluster index
  const clusterValues = new Map<string, number>();
  entities.forEach((entity) => {
    const cluster = getClusterValue(entity, clusterBy);
    if (!clusterValues.has(cluster)) {
      clusterValues.set(cluster, clusterValues.size);
    }
  });

  // Build nodes
  const nodes: GraphNode[] = entities.map((entity) => {
    const cluster = getClusterValue(entity, clusterBy);
    return {
      id: entity.id,
      name: entity.name,
      domain: entity.domain,
      entityType: entity.entityType,
      modes: (entity.metadata?.custom as { modes?: string[] })?.modes,
      themes: (entity.metadata?.custom as { strategicThemes?: string[] })?.strategicThemes,
      val: getNodeValue(entity),
      color:
        colorBy === 'cluster'
          ? getClusterColor(cluster, clusterBy)
          : getNodeColor(entity, colorBy),
      entity,
      cluster,
      clusterIndex: clusterValues.get(cluster) || 0,
      neighbors: [],
      links: [],
    };
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Build links
  const links: GraphLink[] = relationships
    .filter((r) => nodeMap.has(r.source) && nodeMap.has(r.target))
    .map((r) => ({
      source: r.source,
      target: r.target,
      type: r.type,
      weight: r.metadata?.confidence || 0.5, // Use confidence as weight proxy
    }));

  // Cross-link nodes with neighbors
  links.forEach((link) => {
    const sourceNode = nodeMap.get(link.source as string);
    const targetNode = nodeMap.get(link.target as string);
    if (sourceNode && targetNode) {
      sourceNode.neighbors.push(targetNode);
      targetNode.neighbors.push(sourceNode);
      sourceNode.links.push(link);
      targetNode.links.push(link);
    }
  });

  // Compute clusters
  const clusters = computeClusters(nodes, clusterBy);

  return { nodes, links, clusters };
}

function getNodeValue(entity: BaseEntity): number {
  // Check funding from metadata
  if (entity.metadata?.funding?.amount) {
    const amount = entity.metadata.funding.amount as number;
    if (amount > 0) {
      return Math.max(2, Math.min(8, Math.log10(amount / 10000)));
    }
  }
  
  // Default sizes by entity type
  switch (entity.entityType) {
    case 'stakeholder':
      return 5;
    case 'project':
    case 'initiative':
      return 4;
    case 'capability':
      return 3;
    default:
      return 3;
  }
}

// ─────────────────────────────────────────────────────────────
// INITIAL CLUSTER POSITIONING
// ─────────────────────────────────────────────────────────────

function applyInitialClusterPositions(
  nodes: GraphNode[],
  clusters: ClusterInfo[],
  is3D: boolean = false
) {
  if (clusters.length <= 1) return;

  const radius = 120; // Reduced significantly for tighter domain clusters
  clusters.forEach((cluster, index) => {
    const angle = (2 * Math.PI * index) / clusters.length;
    const clusterNodes = nodes.filter((n) => cluster.nodeIds.includes(n.id));

    // Calculate cluster center position
    const centerX = Math.cos(angle) * radius;
    const centerY = Math.sin(angle) * radius;
    const centerZ = is3D ? (Math.random() - 0.5) * 100 : 0;

    // Position nodes in a grid within the cluster (tighter spacing)
    const cols = Math.max(1, Math.ceil(Math.sqrt(clusterNodes.length)));
    const spacing = 45; // Reduced from 60 for more compact clusters

    clusterNodes.forEach((node, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      node.x = centerX + (col - cols / 2) * spacing;
      node.y = centerY + (row - cols / 2) * spacing;
      if (is3D) {
        node.z = centerZ + (Math.random() - 0.5) * 50;
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────
// COLOR UTILITIES
// ─────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(107, 114, 128, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─────────────────────────────────────────────────────────────
// CLUSTER HULL RENDERING (2D)
// ─────────────────────────────────────────────────────────────

function paintClusterHulls(
  ctx: CanvasRenderingContext2D,
  clusters: ClusterInfo[],
  nodes: GraphNode[]
) {
  clusters.forEach((cluster) => {
    const clusterNodes = nodes.filter((n) => cluster.nodeIds.includes(n.id));
    if (clusterNodes.length < 3) return;

    // Get node positions
    const points: [number, number][] = clusterNodes
      .filter((n) => n.x !== undefined && n.y !== undefined)
      .map((n) => [n.x!, n.y!]);

    if (points.length < 3) return;

    // Compute convex hull
    const hull = d3.polygonHull(points);
    if (!hull) return;

    // Expand hull slightly for padding
    const centroid = d3.polygonCentroid(hull);
    const expandedHull = hull.map(([x, y]) => {
      const dx = x - centroid[0];
      const dy = y - centroid[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      const expand = 30; // Padding in pixels
      return [x + (dx / dist) * expand, y + (dy / dist) * expand] as [number, number];
    });

    // Draw hull
    ctx.beginPath();
    ctx.moveTo(expandedHull[0][0], expandedHull[0][1]);
    expandedHull.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.closePath();

    // Fill with transparent color
    ctx.fillStyle = hexToRgba(cluster.color, 0.08);
    ctx.fill();

    // Stroke
    ctx.strokeStyle = hexToRgba(cluster.color, 0.3);
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw cluster label
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.fillStyle = hexToRgba(cluster.color, 0.8);
    ctx.textAlign = 'center';
    ctx.fillText(cluster.label, centroid[0], centroid[1] - clusterNodes.length * 3 - 40);
  });
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function UnifiedNetworkGraph({
  entities,
  relationships,
  mode = '2d',
  colorBy = 'domain',
  clusterBy = 'none',
  showClusterHulls = false,
  className = '',
  fitToCanvas = true,
  clickToFocus = true,
  showLabelsOnHover = true,
  clusterStrength = 0.3,
  onNodeSelect,
}: UnifiedNetworkGraphProps) {
  const graphRef = useRef<{ d3Force: (name: string, force?: any) => any; d3ReheatSimulation: () => void; centerAt: (x: number, y: number, duration: number) => void; zoom: (level: number, duration: number) => void; zoomToFit: (duration: number, padding: number) => void; cameraPosition: (pos: { x: number; y: number; z: number }, lookAt: any, duration: number) => void } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Highlight state
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<GraphNode>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<GraphLink>>(new Set());

  // Build graph data
  const graphData = useMemo(
    () => buildGraphData(entities, relationships, colorBy, clusterBy),
    [entities, relationships, colorBy, clusterBy]
  );

  // Apply initial cluster positions
  useEffect(() => {
    if (clusterBy !== 'none' && graphData.clusters.length > 0) {
      applyInitialClusterPositions(graphData.nodes, graphData.clusters, mode === '3d');
    }
  }, [graphData, clusterBy, mode]);

  // ─────────────────────────────────────────────────────────────
  // CUSTOM CLUSTER FORCE
  // ─────────────────────────────────────────────────────────────

  const clusterForce = useCallback(() => {
    if (clusterBy === 'none') return null;

    const nodes = graphData.nodes;

    // Create a force function
    const force = (alpha: number) => {
      // Calculate current cluster centroids
      const clusterCentroids = new Map<
        string,
        { cx: number; cy: number; cz: number; count: number }
      >();

      nodes.forEach((node) => {
        if (!clusterCentroids.has(node.cluster)) {
          clusterCentroids.set(node.cluster, { cx: 0, cy: 0, cz: 0, count: 0 });
        }
        const centroid = clusterCentroids.get(node.cluster)!;
        centroid.cx += node.x || 0;
        centroid.cy += node.y || 0;
        centroid.cz += node.z || 0;
        centroid.count += 1;
      });

      // Average to get centroids
      clusterCentroids.forEach((centroid) => {
        if (centroid.count > 0) {
          centroid.cx /= centroid.count;
          centroid.cy /= centroid.count;
          centroid.cz /= centroid.count;
        }
      });

      // Apply force toward centroid
      nodes.forEach((node) => {
        const centroid = clusterCentroids.get(node.cluster);
        if (!centroid || centroid.count <= 1) return;

        const dx = centroid.cx - (node.x || 0);
        const dy = centroid.cy - (node.y || 0);
        const dz = centroid.cz - (node.z || 0);
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist > 0) {
          const strength = dist * clusterStrength * alpha;
          node.vx = (node.vx || 0) + (dx / dist) * strength;
          node.vy = (node.vy || 0) + (dy / dist) * strength;
          if (mode === '3d') {
            node.vz = (node.vz || 0) + (dz / dist) * strength;
          }
        }
      });
    };

    // Return as a D3 force
    return force;
  }, [graphData.nodes, graphData.clusters, clusterBy, clusterStrength, mode]);

  // ─────────────────────────────────────────────────────────────
  // CONFIGURE FORCES
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!graphRef.current) return;

    const fg = graphRef.current;

    // Configure link force with cluster-aware strength
    fg.d3Force('link')?.strength((link: GraphLink) => {
      if (clusterBy === 'none') return 0.3;

      const sourceNode =
        typeof link.source === 'object'
          ? link.source
          : graphData.nodes.find((n) => n.id === link.source);
      const targetNode =
        typeof link.target === 'object'
          ? link.target
          : graphData.nodes.find((n) => n.id === link.target);

      if (!sourceNode || !targetNode) return 0.3;

      // Same cluster: stronger link
      // Different cluster: weaker link
      return sourceNode.cluster === targetNode.cluster ? 0.7 : 0.1;
    });

    // Configure charge force (reduced to allow clusters closer together)
    fg.d3Force('charge')?.strength(-120);

    // Add cluster force
    const clusterF = clusterForce();
    if (clusterF) {
      fg.d3Force('cluster', clusterF);
    } else {
      fg.d3Force('cluster', null);
    }

    // Reheat simulation
    fg.d3ReheatSimulation();
  }, [clusterBy, clusterForce, graphData.nodes]);

  // ─────────────────────────────────────────────────────────────
  // EVENT HANDLERS
  // ─────────────────────────────────────────────────────────────

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    const newHighlightNodes = new Set<GraphNode>();
    const newHighlightLinks = new Set<GraphLink>();

    if (node) {
      newHighlightNodes.add(node);
      node.neighbors.forEach((neighbor) => newHighlightNodes.add(neighbor));
      node.links.forEach((link) => newHighlightLinks.add(link));
    }

    setHoverNode(node);
    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode | null) => {
      onNodeSelect?.(node?.entity ?? null);

      if (clickToFocus && node && graphRef.current) {
        if (mode === '2d') {
          graphRef.current.centerAt(node.x, node.y, 1000);
          graphRef.current.zoom(3, 1000);
        } else {
          const distance = 150;
          graphRef.current.cameraPosition(
            { x: node.x! + distance, y: node.y!, z: node.z! + distance },
            node,
            1000
          );
        }
      }
    },
    [clickToFocus, mode, onNodeSelect]
  );

  const handleBackgroundClick = useCallback(() => {
    setHoverNode(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // Fit to canvas
  useEffect(() => {
    if (!fitToCanvas || !graphRef.current || graphData.nodes.length === 0) return;

    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit(400, 50); // Reduced padding for better fit
    }, 800);

    return () => clearTimeout(timer);
  }, [fitToCanvas, graphData.nodes.length]);

  // ─────────────────────────────────────────────────────────────
  // SHARED PROPS
  // ─────────────────────────────────────────────────────────────

  const sharedProps = {
    ref: graphRef,
    graphData: graphData,
    nodeId: 'id',
    nodeLabel: 'name',
    nodeVal: 'val',
    nodeColor: (node: GraphNode) => {
      if (!hoverNode) return node.color;
      return highlightNodes.has(node) ? node.color : hexToRgba(node.color, 0.15);
    },
    linkColor: (link: GraphLink) => {
      if (!hoverNode) return 'rgba(156, 163, 175, 0.3)';
      return highlightLinks.has(link) ? '#F59E0B' : 'rgba(156, 163, 175, 0.05)';
    },
    linkWidth: (link: GraphLink) => (highlightLinks.has(link) ? 2.5 : 1),
    linkDirectionalParticles: (link: GraphLink) => (highlightLinks.has(link) ? 4 : 0),
    linkDirectionalParticleWidth: 3,
    linkDirectionalParticleColor: () => '#F59E0B',
    onNodeHover: handleNodeHover,
    onNodeClick: handleNodeClick,
    onBackgroundClick: handleBackgroundClick,
    cooldownTicks: 200,
    d3AlphaDecay: 0.02,
    d3VelocityDecay: 0.3,
  };

  // ─────────────────────────────────────────────────────────────
  // 2D RENDER
  // ─────────────────────────────────────────────────────────────

  const render2D = () => (
    <ForceGraph2D
      {...sharedProps}
      nodeCanvasObjectMode={(node: GraphNode) =>
        highlightNodes.has(node) ? 'before' : undefined
      }
      nodeCanvasObject={(node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
        if (node.x === undefined || node.y === undefined) return;

        const size = Math.sqrt(node.val) * 4 + 2;

        // Highlight ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
        ctx.fillStyle = node === hoverNode ? '#F59E0B' : hexToRgba('#F59E0B', 0.4);
        ctx.fill();

        // Label on hover
        if (showLabelsOnHover && node === hoverNode) {
          const label = node.name;
          const fontSize = Math.max(11, 13 / globalScale);
          ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const textWidth = ctx.measureText(label).width;
          const padding = 4;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fillRect(
            node.x - textWidth / 2 - padding,
            node.y + size + 6,
            textWidth + padding * 2,
            fontSize + padding * 2
          );

          ctx.fillStyle = '#1F2937';
          ctx.fillText(label, node.x, node.y + size + 8);
        }
      }}
      onRenderFramePost={(ctx: CanvasRenderingContext2D) => {
        if (showClusterHulls && clusterBy !== 'none') {
          paintClusterHulls(ctx, graphData.clusters, graphData.nodes);
        }
      }}
      enableZoomInteraction={true}
      enablePanInteraction={true}
    />
  );

  // ─────────────────────────────────────────────────────────────
  // 3D RENDER
  // ─────────────────────────────────────────────────────────────

  const render3D = () => (
    <ForceGraph3D
      {...sharedProps}
      nodeOpacity={0.9}
      linkOpacity={0.5}
      enableNavigationControls={true}
      backgroundColor="#f8fafc"
    />
  );

  // ─────────────────────────────────────────────────────────────
  // LEGEND ITEMS
  // ─────────────────────────────────────────────────────────────

  const legendItems = useMemo(() => {
    if (clusterBy !== 'none' && showClusterHulls) {
      return graphData.clusters.map((c) => ({ label: c.label, color: c.color }));
    }

    switch (colorBy) {
      case 'domain':
        return Object.entries(DOMAIN_COLORS).map(([k, v]) => ({
          label: k.replace(/-/g, ' '),
          color: v,
        }));
      case 'entityType':
        return Object.entries(ENTITY_TYPE_COLORS).map(([k, v]) => ({
          label: k,
          color: v,
        }));
      case 'mode':
        return Object.entries(MODE_COLORS).map(([k, v]) => ({
          label: k.replace(/-/g, ' '),
          color: v,
        }));
      case 'theme':
        return Object.entries(THEME_COLORS).map(([k, v]) => ({
          label: k.replace(/-/g, ' '),
          color: v,
        }));
      default:
        return [];
    }
  }, [colorBy, clusterBy, showClusterHulls, graphData.clusters]);

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-slate-50 ${className}`}>
      {mode === '2d' ? render2D() : render3D()}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-3 text-xs max-h-64 overflow-y-auto">
        <div className="font-semibold text-gray-700 mb-2 capitalize">
          {clusterBy !== 'none'
            ? `Clusters: ${clusterBy.replace(/([A-Z])/g, ' $1')}`
            : colorBy.replace(/([A-Z])/g, ' $1')}
        </div>
        <div className="space-y-1">
          {legendItems.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-600 capitalize truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info badge */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm px-3 py-1.5 text-xs font-medium text-gray-600">
        {mode.toUpperCase()} • {graphData.nodes.length} nodes • {graphData.links.length} links
        {clusterBy !== 'none' && ` • ${graphData.clusters.length} clusters`}
      </div>

      {/* Cluster toggle hint */}
      {clusterBy !== 'none' && !showClusterHulls && (
        <div className="absolute bottom-4 right-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs text-amber-700">
          Tip: Enable "Show Cluster Hulls" to see cluster boundaries
        </div>
      )}
    </div>
  );
}

export default UnifiedNetworkGraph;

