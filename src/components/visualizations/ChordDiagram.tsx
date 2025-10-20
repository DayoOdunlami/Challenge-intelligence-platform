'use client';

import React, { useMemo } from 'react';
import { ResponsiveChord } from '@nivo/chord';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Challenge, Sector } from '@/lib/types';
// Import getSectorColor locally to avoid build issues
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

interface ChordDiagramProps {
  challenges: Challenge[];
  onSectorSelect?: (sector: Sector) => void;
  className?: string;
}

// Transform challenges to chord diagram format
function transformToChordData(challenges: Challenge[]) {
  // Count shared problem types between sectors
  const sectorProblems: Record<string, Set<string>> = {};
  const sectorNames: string[] = [];
  
  // Collect all sectors and their problem types
  challenges.forEach(ch => {
    const sector = ch.sector.primary;
    if (!sectorProblems[sector]) {
      sectorProblems[sector] = new Set();
      sectorNames.push(sector);
    }
    sectorProblems[sector].add(ch.problem_type.primary);
  });
  
  // Sort sectors for consistent ordering
  sectorNames.sort();
  
  // Build matrix for chord diagram
  const matrix: number[][] = [];
  
  for (let i = 0; i < sectorNames.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < sectorNames.length; j++) {
      if (i === j) {
        // Self-connection: number of unique problem types in this sector
        matrix[i][j] = sectorProblems[sectorNames[i]].size;
      } else {
        // Cross-connection: shared problem types between sectors
        const sector1Problems = sectorProblems[sectorNames[i]];
        const sector2Problems = sectorProblems[sectorNames[j]];
        const shared = [...sector1Problems].filter(p => sector2Problems.has(p));
        matrix[i][j] = shared.length;
      }
    }
  }
  
  return {
    matrix,
    keys: sectorNames
  };
}

export function ChordDiagram({ 
  challenges, 
  onSectorSelect: _onSectorSelect,
  className = '' 
}: ChordDiagramProps) {
  
  const chordData = useMemo(() => {
    if (challenges.length === 0) return { matrix: [], keys: [] };
    return transformToChordData(challenges);
  }, [challenges]);
  
  const sectorColors = useMemo(() => {
    return chordData.keys.map(sector => getSectorColor(sector as Sector));
  }, [chordData.keys]);
  
  if (challenges.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Sector Overlap Analysis</CardTitle>
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
  
  // Event handlers
  const handleArcClick = (arc: unknown) => {
    if (_onSectorSelect) {
      const sector = chordData.keys[(arc as any).index] as Sector;
      _onSectorSelect(sector);
    }
  };
  
  const handleRibbonClick = (ribbon: unknown) => {
    console.log('Ribbon clicked:', ribbon);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Sector Overlap Analysis
          <div className="text-sm text-gray-600 font-normal">
            Shared problem types between sectors
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative" style={{ height: `${Math.max(400, chordData.keys.length * 50 + 200)}px` }}>
          <ResponsiveChord
            data={chordData.matrix}
            keys={chordData.keys}
            margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
            valueFormat=".0f"
            padAngle={0.02}
            innerRadiusRatio={0.96}
            innerRadiusOffset={0.02}
            arcOpacity={1}
            arcBorderWidth={1}
            arcBorderColor={{
              from: 'color',
              modifiers: [['darker', 0.4]]
            }}
            ribbonOpacity={0.5}
            ribbonBorderWidth={1}
            ribbonBorderColor={{
              from: 'color',
              modifiers: [['darker', 0.4]]
            }}
            enableLabel={true}
            label="id"
            labelOffset={12}
            labelRotation={-90}
            labelTextColor={{
              from: 'color',
              modifiers: [['darker', 1]]
            }}
            colors={sectorColors}
            isInteractive={true}
            onArcClick={handleArcClick}
            onRibbonClick={handleRibbonClick}
            animate={true}
            motionConfig="wobbly"
          />
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="text-sm font-semibold mb-2">Sectors</div>
            <div className="space-y-1">
              {chordData.keys.map((sector, index) => (
                <div key={sector} className="flex items-center text-xs">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: sectorColors[index] }}
                  />
                  <span className="capitalize">{sector.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Hover over arcs to see sector details</div>
              <div>• Hover over ribbons to see shared problem types</div>
              <div>• Click arcs to filter by sector</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChordDiagram;