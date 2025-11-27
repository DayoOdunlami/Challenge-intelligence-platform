# Unified Network Graph - Current Code

## Problem
Nodes are rendering as "blobs" instead of proper circles. Need to debug why.

## Current Component Code
Location: `src/components/visualizations/UnifiedNetworkGraph.tsx`

```typescript
'use client';

import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

import type { BaseEntity, Domain, UniversalRelationship } from '@/lib/base-entity';
import { buildNetworkFromBaseEntities } from '@/lib/toolkit/buildNetworkFromBaseEntities';

// Dynamically import to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

const DOMAIN_COLORS: Record<Domain, string> = {
  'atlas': '#3B82F6',         // blue
  'navigate': '#10B981',      // green
  'cpc-internal': '#006E51',  // CPC green
  'reference': '#6B7280',     // gray
  'cross-domain': '#F97316',  // orange
};

export interface UnifiedNetworkGraphProps {
  entities: BaseEntity[];
  relationships: UniversalRelationship[];
  mode?: '2d' | '3d';
  className?: string;
  fitToCanvas?: boolean;
  clickToFocus?: boolean;
  onNodeSelect?: (entity: BaseEntity | null) => void;
}

export function UnifiedNetworkGraph({
  entities,
  relationships,
  mode = '2d',
  className = '',
  fitToCanvas = true,
  clickToFocus = true,
  onNodeSelect,
}: UnifiedNetworkGraphProps) {
  const graphRef = useRef<any>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);

  // Build graph data
  const { nodes, links } = useMemo(
    () => buildNetworkFromBaseEntities(entities, relationships),
    [entities, relationships]
  );

  // Build adjacency map for neighbor detection
  const adjacency = useMemo(() => {
    const adj = new Map<string, Set<string>>();
    links.forEach((link: any) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      if (!adj.has(sourceId)) adj.set(sourceId, new Set());
      if (!adj.has(targetId)) adj.set(targetId, new Set());
      adj.get(sourceId)!.add(targetId);
      adj.get(targetId)!.add(sourceId);
    });
    return adj;
  }, [links]);

  // Compute highlighted nodes (hovered + neighbors)
  const highlightedNodes = useMemo(() => {
    const highlightSet = new Set<string>();
    if (!hoverNode) return highlightSet;
    
    highlightSet.add(hoverNode);
    
    // Add neighbors
    const neighbors = adjacency.get(hoverNode);
    if (neighbors) {
      neighbors.forEach((neighborId) => highlightSet.add(neighborId));
    }
    
    return highlightSet;
  }, [hoverNode, adjacency]);

  // Handle node hover
  const handleNodeHover = useCallback((node: any) => {
    setHoverNode(node?.id ?? null);
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    const id = node?.id ?? null;
    setHoverNode(null);

    if (onNodeSelect) {
      const entity = id ? entities.find((e) => e.id === id) ?? null : null;
      onNodeSelect(entity);
    }

    // Click-to-focus zoom
    if (clickToFocus && id && node && graphRef.current && mode === '2d') {
      if (typeof node.x === 'number' && typeof node.y === 'number') {
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(2, 1000);
      }
    }
  }, [clickToFocus, entities, mode, onNodeSelect]);

  // Fit to canvas on load
  useEffect(() => {
    if (!fitToCanvas || !graphRef.current || nodes.length === 0) return;

    const timer = setTimeout(() => {
      try {
        graphRef.current?.zoomToFit(400, 50);
      } catch {
        // ignore if graph not ready yet
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [fitToCanvas, nodes.length]);

  if (mode !== '2d') {
    return <div className="p-4 text-gray-500">3D mode not yet implemented</div>;
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <ForceGraph2D
        ref={graphRef}
        graphData={{ nodes, links }}
        nodeId="id"
        nodeLabel="name"
        nodeRelSize={6}
        // Particles on highlighted links
        linkDirectionalParticles={(link: any) => {
          if (!hoverNode) return 0;
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          return highlightedNodes.has(sourceId) && highlightedNodes.has(targetId) ? 3 : 0;
        }}
        linkDirectionalParticleWidth={3}
        linkDirectionalParticleSpeed={0.01}
        // Node color by domain
        nodeColor={(node: any) => {
          const domain = node.fullData?.domain as Domain | undefined;
          return domain && DOMAIN_COLORS[domain] ? DOMAIN_COLORS[domain] : '#6b7280';
        }}
        // Use default node rendering, add opacity overlay and labels
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          if (node.x === undefined || node.y === undefined) return;
          
          const nodeId = node.id;
          const isHighlighted = highlightedNodes.has(nodeId);
          const isHovered = nodeId === hoverNode;
          
          // Dim non-highlighted nodes with white overlay
          if (hoverNode && !isHighlighted) {
            const nodeSize = node.symbolSize || 20;
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
            ctx.fill();
          }
          
          // Draw border for hovered node
          if (isHovered) {
            const nodeSize = node.symbolSize || 20;
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          
          // Draw label only on hover or very close zoom
          if (isHovered || globalScale >= 2.5) {
            const nodeSize = node.symbolSize || 20;
            ctx.globalAlpha = 1;
            const label = node.name as string;
            const fontSize = Math.max(8, 12 / globalScale);
            ctx.font = isHovered ? `bold ${fontSize}px Sans-Serif` : `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isHovered ? '#000' : '#6b7280';
            const maxLength = 28;
            const text = label.length > maxLength ? `${label.slice(0, maxLength)}…` : label;
            ctx.fillText(text, node.x, node.y + nodeSize + 4);
          }
        }}
        // Use default link rendering, add opacity overlay
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={(link: any, ctx: CanvasRenderingContext2D) => {
          if (!hoverNode) return;
          
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          const isHighlighted = highlightedNodes.has(sourceId) && highlightedNodes.has(targetId);
          
          // Dim non-highlighted links with white overlay
          if (!isHighlighted) {
            const source = typeof link.source === 'object' ? link.source : nodes.find((n: any) => n.id === link.source);
            const target = typeof link.target === 'object' ? link.target : nodes.find((n: any) => n.id === link.target);
            
            if (source && target && source.x !== undefined && source.y !== undefined && target.x !== undefined && target.y !== undefined) {
              ctx.globalAlpha = 0.9;
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(source.x, source.y);
              ctx.lineTo(target.x, target.y);
              ctx.stroke();
            }
          }
        }}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        onBackgroundClick={() => {
          setHoverNode(null);
        }}
      />
    </div>
  );
}
```

## Data Builder Code
Location: `src/lib/toolkit/buildNetworkFromBaseEntities.ts`

The nodes are built with:
- `symbolSize`: A number (typically 24-55 based on funding, or 35 default)
- `fullData`: The original BaseEntity
- `id`, `name`, `type`, `group`, `symbol`, `itemStyle`

## Issue
The problem is likely:
1. `node.symbolSize` is being used as a radius, but it might be an area/value
2. The overlay is covering the nodes completely
3. The default node rendering might not be working with `nodeRelSize={6}`

## Reference
Based on: https://vasturiano.github.io/force-graph/example/highlight/

