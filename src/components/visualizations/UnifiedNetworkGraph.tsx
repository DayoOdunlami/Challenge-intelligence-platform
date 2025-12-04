'use client';

import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { BaseEntity, Domain, UniversalRelationship } from '@/lib/base-entity';

// Dynamically import to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const DOMAIN_COLORS: Record<Domain, string> = {
  atlas: '#3B82F6',        // blue
  navigate: '#10B981',     // green
  'cpc-internal': '#006E51', // CPC green
  reference: '#6B7280',    // gray
  'cross-domain': '#F97316', // orange
};

const ENTITY_TYPE_COLORS: Record<string, string> = {
  challenge: '#F59E0B',    // amber
  stakeholder: '#3B82F6',  // blue
  technology: '#8B5CF6',   // purple
  project: '#10B981',      // green
  capability: '#EC4899',   // pink
  initiative: '#006E51',   // CPC green
  focus_area: '#006E51',   // CPC green (same as initiative)
  milestone: '#F5A623',    // CPC amber/gold
  stage: '#9B59B6',        // purple
  authority: '#6B7280',    // gray
  priority: '#EF4444',     // red
};

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface GraphNode {
  id: string;
  name: string;
  domain: Domain;
  entityType: string;
  val: number; // Node size value
  color: string;
  entity: BaseEntity; // Original entity reference
  // Added by force simulation
  x?: number;
  y?: number;
  z?: number;
  // For neighbor lookup
  neighbors: GraphNode[];
  links: GraphLink[];
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  weight?: number;
}

export interface UnifiedNetworkGraphProps {
  entities: BaseEntity[];
  relationships: UniversalRelationship[];
  mode?: '2d' | '3d';
  colorBy?: 'domain' | 'entityType';
  className?: string;
  fitToCanvas?: boolean;
  clickToFocus?: boolean;
  showLabelsOnHover?: boolean;
  onNodeSelect?: (entity: BaseEntity | null) => void;
}

// ─────────────────────────────────────────────────────────────
// GRAPH DATA BUILDER
// ─────────────────────────────────────────────────────────────
function buildGraphData(
  entities: BaseEntity[],
  relationships: UniversalRelationship[],
  colorBy: 'domain' | 'entityType' = 'domain'
): { nodes: GraphNode[]; links: GraphLink[] } {
  // Build nodes
  const nodes: GraphNode[] = entities.map((entity) => ({
    id: entity.id,
    name: entity.name,
    domain: entity.domain,
    entityType: entity.entityType,
    val: getNodeValue(entity),
    color: colorBy === 'domain'
      ? DOMAIN_COLORS[entity.domain] || '#6B7280'
      : ENTITY_TYPE_COLORS[entity.entityType] || '#6B7280',
    entity,
    neighbors: [],
    links: [],
  }));

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Build links (only include links where both nodes exist)
  const links: GraphLink[] = relationships
    .filter((r) => nodeMap.has(r.source) && nodeMap.has(r.target))
    .map((r) => ({
      source: r.source,
      target: r.target,
      type: r.type,
      weight: r.strength,
    }));

  // Cross-link nodes with neighbors and links for quick lookup
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

  return { nodes, links };
}

function getNodeValue(entity: BaseEntity): number {
  // Size based on funding if available
  if (entity.metadata?.funding?.amount) {
    return Math.max(1, Math.log10(entity.metadata.funding.amount / 100000));
  }
  // Default size by entity type
  switch (entity.entityType) {
    case 'stakeholder':
      return 3;
    case 'project':
    case 'initiative':
      return 2;
    default:
      return 1;
  }
}

// ─────────────────────────────────────────────────────────────
// COLOR UTILITIES
// ─────────────────────────────────────────────────────────────
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 107, g: 114, b: 128 }; // gray fallback
}

function rgbToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export function UnifiedNetworkGraph({
  entities,
  relationships,
  mode = '2d',
  colorBy = 'domain',
  className = '',
  fitToCanvas = true,
  clickToFocus = true,
  showLabelsOnHover = true,
  onNodeSelect,
}: UnifiedNetworkGraphProps) {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Highlight state
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<GraphNode>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<GraphLink>>(new Set());

  // Build graph data
  const graphData = useMemo(
    () => buildGraphData(entities, relationships, colorBy),
    [entities, relationships, colorBy]
  );

  // ─────────────────────────────────────────────────────────────
  // EVENT HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleNodeHover = useCallback((node: any) => {
    const graphNode = node as GraphNode | null;
    // Clear previous highlights
    const newHighlightNodes = new Set<GraphNode>();
    const newHighlightLinks = new Set<GraphLink>();

    if (graphNode) {
      // Add hovered node
      newHighlightNodes.add(graphNode);
      // Add all neighbors
      graphNode.neighbors.forEach((neighbor) => newHighlightNodes.add(neighbor));
      // Add all connected links
      graphNode.links.forEach((link) => newHighlightLinks.add(link));
    }

    setHoverNode(graphNode);
    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  }, []);

  const handleNodeClick = useCallback(
    (node: any) => {
      const graphNode = node as GraphNode | null;
      if (onNodeSelect) {
        onNodeSelect(graphNode?.entity ?? null);
      }
      // Click-to-focus zoom
      if (clickToFocus && graphNode && graphRef.current) {
        if (mode === '2d') {
          graphRef.current.centerAt(graphNode.x, graphNode.y, 1000);
          graphRef.current.zoom(4, 1000);
        } else {
          // 3D: position camera to look at node
          const distance = 120;
          graphRef.current.cameraPosition(
            {
              x: graphNode.x! + distance,
              y: graphNode.y! + distance,
              z: graphNode.z! + distance,
            },
            graphNode, // lookAt
            1000  // transition duration
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

  // ─────────────────────────────────────────────────────────────
  // FIT TO CANVAS
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fitToCanvas || !graphRef.current || graphData.nodes.length === 0) return;

    const timer = setTimeout(() => {
      try {
        graphRef.current?.zoomToFit(400, 60);
      } catch {
        // Graph not ready
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [fitToCanvas, graphData.nodes.length]);

  // ─────────────────────────────────────────────────────────────
  // SHARED PROPS (used by both 2D and 3D)
  // ─────────────────────────────────────────────────────────────
  const sharedProps = {
    ref: graphRef,
    graphData: graphData,
    nodeId: 'id',
    nodeLabel: 'name',
    nodeVal: 'val',
    // Node color with highlight effect
    nodeColor: (node: any) => {
      const graphNode = node as GraphNode;
      if (!hoverNode) return graphNode.color;
      return highlightNodes.has(graphNode) ? graphNode.color : rgbToRgba(graphNode.color, 0.2);
    },
    // Link styling
    linkColor: (link: any) => {
      const graphLink = link as GraphLink;
      if (!hoverNode) return 'rgba(156, 163, 175, 0.4)'; // gray-400
      return highlightLinks.has(graphLink) ? '#F59E0B' : 'rgba(156, 163, 175, 0.1)';
    },
    linkWidth: (link: any) => {
      const graphLink = link as GraphLink;
      return highlightLinks.has(graphLink) ? 2 : 1;
    },
    // Directional particles on highlighted links
    linkDirectionalParticles: (link: any) => {
      const graphLink = link as GraphLink;
      return highlightLinks.has(graphLink) ? 4 : 0;
    },
    linkDirectionalParticleWidth: 3,
    linkDirectionalParticleColor: () => '#F59E0B',
    // Interactions
    onNodeHover: handleNodeHover,
    onNodeClick: handleNodeClick,
    onBackgroundClick: handleBackgroundClick,
  };

  // ─────────────────────────────────────────────────────────────
  // 2D SPECIFIC PROPS
  // ─────────────────────────────────────────────────────────────
  const render2D = () => (
    <ForceGraph2D
      {...sharedProps}
      // Node rendering
      nodeCanvasObjectMode={(node: any) => {
        const graphNode = node as GraphNode;
        return highlightNodes.has(graphNode) ? 'before' : undefined;
      }}
      nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const graphNode = node as GraphNode;
        if (graphNode.x === undefined || graphNode.y === undefined) return;

        // Draw highlight ring for highlighted nodes
        const size = Math.sqrt(graphNode.val) * 4 + 2;
        
        ctx.beginPath();
        ctx.arc(graphNode.x, graphNode.y, size + 2, 0, 2 * Math.PI);
        ctx.fillStyle = graphNode === hoverNode ? '#F59E0B' : 'rgba(245, 158, 11, 0.5)';
        ctx.fill();

        // Draw label on hover
        if (showLabelsOnHover && graphNode === hoverNode) {
          const label = graphNode.name;
          const fontSize = Math.max(12, 14 / globalScale);
          ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          
          // Text background
          const textWidth = ctx.measureText(label).width;
          const padding = 4;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(
            graphNode.x - textWidth / 2 - padding,
            graphNode.y + size + 4,
            textWidth + padding * 2,
            fontSize + padding
          );
          
          // Text
          ctx.fillStyle = '#1F2937';
          ctx.fillText(label, graphNode.x, graphNode.y + size + 6);
        }
      }}
      // Enable zoom/pan
      enableZoomInteraction={true}
      enablePanInteraction={true}
    />
  );

  // ─────────────────────────────────────────────────────────────
  // 3D SPECIFIC PROPS
  // ─────────────────────────────────────────────────────────────
  const render3D = () => (
    <ForceGraph3D
      {...sharedProps}
      // Node opacity for highlight effect
      nodeOpacity={0.9}
      // Link opacity
      linkOpacity={0.6}
      // Enable orbit controls
      enableNavigationControls={true}
      // Background color
      backgroundColor="#f8fafc"
    />
  );

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className={`relative w-full h-full bg-slate-50 ${className}`}>
      {mode === '2d' ? render2D() : render3D()}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-3 text-xs">
        <div className="font-semibold text-gray-700 mb-2">
          {colorBy === 'domain' ? 'Domains' : 'Entity Types'}
        </div>
        <div className="space-y-1">
          {colorBy === 'domain'
            ? Object.entries(DOMAIN_COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-gray-600 capitalize">{key.replace('-', ' ')}</span>
                </div>
              ))
            : Object.entries(ENTITY_TYPE_COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-gray-600 capitalize">{key}</span>
                </div>
              ))}
        </div>
      </div>
      {/* Mode indicator */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm px-3 py-1.5 text-xs font-medium text-gray-600">
        {mode.toUpperCase()} View • {graphData.nodes.length} nodes • {graphData.links.length} links
      </div>
    </div>
  );
}
