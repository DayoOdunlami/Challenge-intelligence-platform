'use client';

import React, { useMemo } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Challenge, Sector } from '@/lib/types';

interface SankeyChartProps {
  challenges: Challenge[];
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

// Local getSectorColor function
function getSectorColor(sector: Sector): string {
  const colors: Record<Sector, string> = {
    rail: '#3b82f6',      // blue
    energy: '#22c55e',    // green
    local_gov: '#a855f7', // purple
    transport: '#f59e0b', // orange
    built_env: '#ef4444', // red
    aviation: '#06b6d4'   // cyan
  };
  return colors[sector] || '#6b7280';
}

// Get urgency color
function getUrgencyColor(urgency: string): string {
  const colors: Record<string, string> = {
    critical: '#dc2626',    // bright red
    high: '#ea580c',       // bright orange
    medium: '#ca8a04',     // bright yellow/gold
    low: '#16a34a'         // bright green
  };
  return colors[urgency] || '#6b7280';
}

// Get problem type color (distinct from sectors and urgency)
function getProblemTypeColor(index: number, total: number): string {
  // Use a gradient from purple to teal for problem types
  const hue = 200 + (index / total) * 80; // 200-280 degrees (purple to teal)
  return `hsl(${hue}, 60%, 55%)`;
}

// Transform challenges to Sankey format (Sector → Problem Type → Urgency)
function transformToSankeyData(challenges: Challenge[]) {
  const nodes: Array<{ id: string; color: string }> = [];
  const links: Array<{ source: string; target: string; value: number }> = [];
  
  // Get unique values for each level
  const sectors = [...new Set(challenges.map(c => c.sector.primary))];
  const problemTypes = [...new Set(challenges.map(c => c.problem_type.primary))];
  const urgencyLevels = [...new Set(challenges.map(c => c.timeline.urgency))];
  
  // Create nodes for each level
  sectors.forEach(sector => {
    nodes.push({
      id: `sector_${sector}`,
      color: getSectorColor(sector as Sector)
    });
  });
  
  problemTypes.forEach((problemType, index) => {
    nodes.push({
      id: `problem_${problemType}`,
      color: getProblemTypeColor(index, problemTypes.length)
    });
  });
  
  urgencyLevels.forEach(urgency => {
    nodes.push({
      id: `urgency_${urgency}`,
      color: getUrgencyColor(urgency)
    });
  });
  
  // Create links: Sector → Problem Type
  const sectorToProblem = new Map<string, number>();
  challenges.forEach(challenge => {
    const key = `sector_${challenge.sector.primary}→problem_${challenge.problem_type.primary}`;
    sectorToProblem.set(key, (sectorToProblem.get(key) || 0) + 1);
  });
  
  sectorToProblem.forEach((count, key) => {
    const [source, target] = key.split('→');
    links.push({ source, target, value: count });
  });
  
  // Create links: Problem Type → Urgency
  const problemToUrgency = new Map<string, number>();
  challenges.forEach(challenge => {
    const key = `problem_${challenge.problem_type.primary}→urgency_${challenge.timeline.urgency}`;
    problemToUrgency.set(key, (problemToUrgency.get(key) || 0) + 1);
  });
  
  problemToUrgency.forEach((count, key) => {
    const [source, target] = key.split('→');
    links.push({ source, target, value: count });
  });
  
  return { nodes, links };
}

export function SankeyChart({ 
  challenges, 
  onNodeClick,
  className = '' 
}: SankeyChartProps) {
  
  const sankeyData = useMemo(() => {
    if (challenges.length === 0) return { nodes: [], links: [] };
    return transformToSankeyData(challenges);
  }, [challenges]);
  
  if (challenges.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Challenge Flow Analysis</CardTitle>
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
  
  const handleNodeClick = (data: unknown) => {
    const node = data as { id?: string };
    if (onNodeClick && node.id) {
      onNodeClick(node.id);
    }
  };
  
  // Format node labels
  const formatNodeLabel = (nodeId: string) => {
    if (nodeId.startsWith('sector_')) {
      return nodeId.replace('sector_', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    } else if (nodeId.startsWith('problem_')) {
      return nodeId.replace('problem_', '');
    } else if (nodeId.startsWith('urgency_')) {
      return nodeId.replace('urgency_', '').replace(/\b\w/g, l => l.toUpperCase());
    }
    return nodeId;
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Challenge Flow Analysis
          <div className="text-sm text-gray-600 font-normal">
            Sector → Problem Type → Urgency Level
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative" style={{ height: `${Math.max(500, sankeyData.nodes.length * 25 + 200)}px` }}>
          <ResponsiveSankey
            data={sankeyData}
            margin={{ top: 40, right: 180, bottom: 40, left: 120 }}
            align="justify"
            colors={{ datum: 'data.color' }}
            nodeOpacity={0.9}
            nodeHoverOthersOpacity={0.2}
            nodeThickness={Math.max(15, Math.min(30, 400 / sankeyData.nodes.length))}
            nodeSpacing={Math.max(8, Math.min(20, 300 / sankeyData.nodes.length))}
            nodeBorderWidth={1}
            nodeBorderColor={{
              from: 'color',
              modifiers: [['darker', 0.3]]
            }}
            linkOpacity={0.6}
            linkHoverOpacity={0.8}
            linkHoverOthersOpacity={0.1}
            linkContract={2}
            enableLinkGradient={true}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={12}
            labelTextColor="#374151"
            animate={true}
            motionConfig="gentle"
            onClick={handleNodeClick}
            nodeTooltip={({ node }) => (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
                <div className="font-semibold mb-2 text-gray-900">
                  {formatNodeLabel(node.id)}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>{node.value}</strong> challenges flow through this node</div>
                  {node.id.startsWith('sector_') && (
                    <div className="text-xs text-blue-600">💡 Click to filter by this sector</div>
                  )}
                  {node.id.startsWith('problem_') && (
                    <div className="text-xs text-purple-600">💡 Click to filter by this problem type</div>
                  )}
                  {node.id.startsWith('urgency_') && (
                    <div className="text-xs text-red-600">
                      ⚠️ Urgency level: {formatNodeLabel(node.id)}
                    </div>
                  )}
                </div>
              </div>
            )}
            linkTooltip={({ link }) => (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-sm">
                <div className="font-semibold mb-2 text-gray-900">
                  {formatNodeLabel(link.source.id)} → {formatNodeLabel(link.target.id)}
                </div>
                <div className="text-sm text-gray-600">
                  <div><strong>{link.value}</strong> challenges follow this path</div>
                  <div className="text-xs mt-1 text-gray-500">
                    {((link.value / challenges.length) * 100).toFixed(1)}% of total challenges
                  </div>
                </div>
              </div>
            )}
          />
          
          {/* Enhanced Legend */}
          <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-xs">
            <div className="text-sm font-semibold mb-3 text-gray-900">Challenge Flow Legend</div>
            
            {/* Flow Structure */}
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-700 mb-2">Flow Structure:</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span><strong>Sectors</strong> (Left)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                  <span><strong>Problem Types</strong> (Middle)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  <span><strong>Urgency</strong> (Right)</span>
                </div>
              </div>
            </div>
            
            {/* Urgency Colors */}
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">Urgency Levels:</div>
              <div className="space-y-1">
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#dc2626' }}></div>
                  <span>Critical</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#ea580c' }}></div>
                  <span>High</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#ca8a04' }}></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#16a34a' }}></div>
                  <span>Low</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Instructions */}
          <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="text-xs font-medium text-gray-700 mb-2">How to Use:</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>🖱️ <strong>Hover</strong> nodes/links for detailed info</div>
              <div>👆 <strong>Click</strong> nodes to apply filters</div>
              <div>📊 <strong>Flow width</strong> = challenge count</div>
              <div>🎨 <strong>Colors</strong> distinguish categories</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SankeyChart;