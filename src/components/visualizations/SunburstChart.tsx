'use client';

import React, { useMemo } from 'react';
import { ResponsiveSunburst } from '@nivo/sunburst';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Challenge, Sector } from '@/lib/types';

interface SunburstChartProps {
  challenges: Challenge[];
  onChallengeSelect?: (challenge: Challenge) => void;
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

// Transform challenges to sunburst format
function transformToSunburstData(challenges: Challenge[]) {
  const root = {
    name: 'All Challenges',
    children: [] as Array<{
      name: string;
      color: string;
      children: Array<{
        name: string;
        color: string;
        children: Array<{
          name: string;
          value: number;
          color: string;
          challengeId: string;
          fullTitle: string;
          funding: number;
        }>;
      }>;
    }>
  };
  
  // Group by sector -> problem type -> individual challenges
  const grouped = challenges.reduce((acc, ch) => {
    if (!acc[ch.sector.primary]) {
      acc[ch.sector.primary] = {};
    }
    if (!acc[ch.sector.primary][ch.problem_type.primary]) {
      acc[ch.sector.primary][ch.problem_type.primary] = [];
    }
    acc[ch.sector.primary][ch.problem_type.primary].push(ch);
    return acc;
  }, {} as Record<string, Record<string, Challenge[]>>);
  
  // Build hierarchy
  for (const [sector, problems] of Object.entries(grouped)) {
    const sectorNode = {
      name: sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: getSectorColor(sector as Sector),
      children: [] as Array<{
        name: string;
        color: string;
        children: Array<{
          name: string;
          value: number;
          color: string;
          challengeId: string;
          fullTitle: string;
          funding: number;
        }>;
      }>
    };
    
    for (const [problemType, chs] of Object.entries(problems)) {
      const problemNode = {
        name: `${problemType}_${sector}`, // Make unique by combining with sector
        color: getSectorColor(sector as Sector),
        children: chs.map((ch, index) => {
          const shortTitle = ch.title.length > 30 ? ch.title.substring(0, 30) + '...' : ch.title;
          return {
            name: `${shortTitle}_${ch.id}`, // Make unique with ID
            value: Math.max(100000, ch.funding.amount_max || 100000), // Minimum size for visibility
            color: getSectorColor(sector as Sector),
            challengeId: ch.id,
            fullTitle: ch.title,
            funding: ch.funding.amount_max || 0
          };
        })
      };
      sectorNode.children.push(problemNode);
    }
    
    root.children.push(sectorNode);
  }
  
  return root;
}

export function SunburstChart({ 
  challenges, 
  onChallengeSelect,
  className = '' 
}: SunburstChartProps) {
  
  const sunburstData = useMemo(() => {
    if (challenges.length === 0) return { name: 'No Data', children: [] };
    return transformToSunburstData(challenges);
  }, [challenges]);
  
  if (challenges.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Challenge Hierarchy</CardTitle>
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
  
  const handleClick = (node: unknown) => {
    const nodeData = node as { data?: { challengeId?: string } };
    if (nodeData.data?.challengeId && onChallengeSelect) {
      const challenge = challenges.find(c => c.id === nodeData.data?.challengeId);
      if (challenge) {
        onChallengeSelect(challenge);
      }
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Challenge Hierarchy
          <div className="text-sm text-gray-600 font-normal">
            Sector → Problem Type → Individual Challenges
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative" style={{ height: `${Math.max(450, sunburstData.children?.length * 60 + 250 || 450)}px` }}>
          <ResponsiveSunburst
            data={sunburstData}
            margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
            id="name"
            value="value"
            cornerRadius={2}
            borderWidth={1}
            borderColor={{ theme: 'background' }}
            colors={{ datum: 'data.color' }}
            childColor={{
              from: 'color',
              modifiers: [['brighter', 0.1]]
            }}
            enableArcLabels={true}
            arcLabel="name"
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{
              from: 'color',
              modifiers: [['darker', 2]]
            }}
            isInteractive={true}
            animate={true}
            motionConfig="wobbly"
            onClick={handleClick}
            tooltip={(props: unknown) => {
              const { id, value, color, data } = props as {
                id: string | number;
                value?: number;
                color: string;
                data?: {
                  fullTitle?: string;
                  funding?: number;
                  challengeId?: string;
                  children?: unknown[];
                };
              };
              
              return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                  <div className="flex items-center mb-2">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: color }}
                    />
                    <div className="font-semibold">
                      {data?.fullTitle || String(id)}
                    </div>
                  </div>
                  {data?.funding && (
                    <div className="text-sm text-gray-600">
                      Funding: £{data.funding.toLocaleString()}
                    </div>
                  )}
                  {value && !data?.challengeId && (
                    <div className="text-sm text-gray-600">
                      Contains {data?.children?.length || 0} items
                    </div>
                  )}
                </div>
              );
            }}
          />
          
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
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Inner ring: Sectors</div>
              <div>• Middle ring: Problem Types</div>
              <div>• Outer ring: Individual Challenges</div>
              <div>• Click challenges to select them</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SunburstChart;