'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Challenge, NetworkNode, NetworkLink } from '@/lib/types';
// Import types only
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sector } from '@/lib/types';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">Loading graph...</div>
});

// Helper functions
function getSectorColor(sector: Sector): string {
  // Check if CPC theme is active
  const isCPCTheme = document.documentElement.getAttribute('data-theme') === 'cpc'
  
  if (isCPCTheme) {
    const cpcColors: Record<Sector, string> = {
      rail: '#006E51',      // CPC Primary Teal
      energy: '#50C878',    // CPC Success Green
      local_gov: '#F5A623', // CPC Warning Amber
      transport: '#4A90E2', // CPC Info Blue
      built_env: '#2E2D2B', // CPC Charcoal
      aviation: '#CCE2DC'   // CPC Mint Green
    };
    return cpcColors[sector] || '#6b7280';
  } else {
    // Default colors
    const defaultColors: Record<Sector, string> = {
      rail: '#3b82f6',      // blue
      energy: '#22c55e',    // green
      local_gov: '#a855f7', // purple
      transport: '#f59e0b', // orange
      built_env: '#ef4444', // red
      aviation: '#06b6d4'   // cyan
    };
    return defaultColors[sector] || '#6b7280';
  }
}

// Calculate similarity between two challenges using Jaccard similarity + bonuses
function calculateSimilarity(ch1: Challenge, ch2: Challenge): number {
  // Keyword overlap (Jaccard similarity)
  const keywords1 = new Set(ch1.keywords);
  const keywords2 = new Set(ch2.keywords);
  
  const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
  const union = new Set([...keywords1, ...keywords2]);
  
  const keywordScore = union.size > 0 ? intersection.size / union.size : 0;
  
  // Problem type match bonus
  const problemScore = ch1.problem_type.primary === ch2.problem_type.primary ? 0.3 : 0;
  
  // Cross-sector signals bonus
  const crossSectorMatch = ch1.sector.secondary.some(s => 
    s === ch2.sector.primary || ch2.sector.secondary.includes(s)
  ) ? 0.2 : 0;
  
  return Math.min(1, keywordScore + problemScore + crossSectorMatch);
}

// Build similarity matrix for all challenges
function buildSimilarityMatrix(challenges: Challenge[], threshold: number = 0.2) {
  const edges = [];
  
  for (let i = 0; i < challenges.length; i++) {
    for (let j = i + 1; j < challenges.length; j++) {
      const similarity = calculateSimilarity(challenges[i], challenges[j]);
      
      // Only create edge if similarity > threshold
      if (similarity > threshold) {
        edges.push({
          source: challenges[i].id,
          target: challenges[j].id,
          similarity,
          width: similarity * 3
        });
      }
    }
  }
  
  return edges;
}

function toNetworkGraphData(challenges: Challenge[]): { nodes: NetworkNode[], links: NetworkLink[] } {
  const nodes: NetworkNode[] = challenges.map(ch => ({
    id: ch.id,
    label: ch.title,
    sector: ch.sector.primary,
    value: Math.max(2, Math.min(12, (ch.funding.amount_max || 100000) / 100000)), // node size 2-12
    color: getSectorColor(ch.sector.primary)
  }));
  
  const similarityEdges = buildSimilarityMatrix(challenges);
  const links: NetworkLink[] = similarityEdges.map(edge => ({
    source: edge.source,
    target: edge.target,
    similarity: edge.similarity,
    width: edge.width
  }));
  
  return { nodes, links };
}

interface NetworkGraphProps {
  challenges: Challenge[];
  selectedChallenge?: Challenge | null;
  onChallengeSelect?: (challenge: Challenge) => void;
  className?: string;
}

export function NetworkGraph({ 
  challenges, 
  selectedChallenge, 
  onChallengeSelect,
  className = '' 
}: NetworkGraphProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<{ nodes: NetworkNode[], links: NetworkLink[] }>(() => ({ nodes: [], links: [] }));
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(0);

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Camera orbit effect - using zoom and pan for 2D graph
  useEffect(() => {
    if (!isOrbiting || !fgRef.current) return;

    const interval = setInterval(() => {
      setOrbitAngle(prev => prev + 0.005); // Gentle rotation speed
      
      if (fgRef.current) {
        const centerX = 0;
        const centerY = 0;
        const radius = 100; // Orbit radius
        const x = centerX + Math.cos(orbitAngle) * radius;
        const y = centerY + Math.sin(orbitAngle) * radius;
        
        // Use centerAt method for 2D graph
        fgRef.current.centerAt(x, y, 1000); // 1000ms transition
      }
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [isOrbiting, orbitAngle]);

  // Stop orbit on user interaction
  const handleUserInteraction = useCallback(() => {
    if (isOrbiting) {
      setIsOrbiting(false);
    }
  }, [isOrbiting]);

  // Transform challenges to graph data
  useEffect(() => {
    if (challenges.length > 0 && typeof window !== 'undefined') {
      setIsLoading(true);
      try {
        const data = toNetworkGraphData(challenges);
        setGraphData(data);
      } catch (error) {
        console.error('Error transforming challenge data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [challenges]);

  // Handle node click
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = useCallback((node: any) => {
    handleUserInteraction(); // Stop orbit on interaction
    const challenge = challenges.find(c => c.id === node.id);
    if (challenge && onChallengeSelect) {
      onChallengeSelect(challenge);
    }
  }, [challenges, onChallengeSelect, handleUserInteraction]);

  // Handle node hover
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node);
  }, []);

  // Custom node rendering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label;
    const fontSize = 12 / globalScale;
    const nodeRadius = Math.sqrt(node.value) * 2;
    
    // Highlight selected node
    const isSelected = selectedChallenge?.id === node.id;
    const isHovered = hoveredNode?.id === node.id;
    
    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x || 0, node.y || 0, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = node.color;
    
    if (isSelected) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3 / globalScale;
      ctx.stroke();
    } else if (isHovered) {
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }
    
    ctx.fill();

    // Draw label if zoomed in enough or node is selected/hovered
    if (globalScale > 1.5 || isSelected || isHovered) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#333';
      ctx.font = `${fontSize}px Arial`;
      
      // Truncate long labels
      const maxLength = 30;
      const displayLabel = label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
      
      ctx.fillText(displayLabel, node.x || 0, (node.y || 0) + nodeRadius + fontSize);
    }
  }, [selectedChallenge, hoveredNode]);

  // Custom link rendering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const start = (typeof link.source === 'string' ? graphData.nodes.find(n => n.id === link.source) : link.source);
    const end = (typeof link.target === 'string' ? graphData.nodes.find(n => n.id === link.target) : link.target);
    
    if (!start.x || !start.y || !end.x || !end.y) return;

    // Draw link with thickness based on similarity
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = `rgba(100, 100, 100, ${link.similarity * 0.6})`;
    ctx.lineWidth = link.width;
    ctx.stroke();
  }, [graphData.nodes]);

  if (!isClient || isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Challenge Network Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading network visualization...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Challenge Network Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600">No challenges available to display</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Challenge Network Graph
            <div className="text-sm text-gray-600 font-normal">
              {graphData.nodes.length} challenges, {graphData.links.length} connections
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeId="id"
              nodeLabel="label"
              nodeColor="color"
              nodeVal="value"
              linkSource="source"
              linkTarget="target"
              linkWidth="width"
              linkColor={() => 'rgba(100, 100, 100, 0.2)'}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              onNodeDrag={handleUserInteraction}
              onBackgroundClick={handleUserInteraction}
              nodeCanvasObject={nodeCanvasObject}
              linkCanvasObject={linkCanvasObject}
              width={600}
              height={500}
              backgroundColor="#fafafa"
              enableNodeDrag={true}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              cooldownTicks={100}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
            />
            
            {/* Hover tooltip */}
            {hoveredNode && (
              <div 
                className="absolute pointer-events-none bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10"
                style={{
                  left: (hoveredNode.x || 0) + 10,
                  top: (hoveredNode.y || 0) - 10,
                  transform: 'translate(0, -100%)'
                }}
              >
                <div className="text-sm font-semibold">{hoveredNode.label}</div>
                <div className="text-xs text-gray-600 capitalize">
                  Sector: {hoveredNode.sector.replace('_', ' ')}
                </div>
                <div className="text-xs text-gray-600">
                  Funding: £{(challenges.find(c => c.id === hoveredNode.id)?.funding.amount_max || 0).toLocaleString()}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="text-sm font-semibold mb-2">Sectors</div>
              <div className="space-y-1">
                {(['rail', 'energy', 'local_gov', 'transport', 'built_env', 'aviation'] as Sector[]).map(sector => (
                  <div key={sector} className="flex items-center text-xs">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: getSectorColor(sector) }}
                    />
                    <span className="capitalize">{sector.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls hint */}
            <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Click nodes to select challenges</div>
                <div>• Drag to pan, scroll to zoom</div>
                <div>• Drag nodes to reposition</div>
                <label className="flex items-center space-x-1 mt-2">
                  <input
                    type="checkbox"
                    checked={isOrbiting}
                    onChange={(e) => setIsOrbiting(e.target.checked)}
                    className="w-3 h-3"
                  />
                  <span>Camera orbit</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default NetworkGraph;