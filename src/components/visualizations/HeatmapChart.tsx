'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Challenge, Sector } from '@/lib/types';
import HeatmapControls, { SortOption } from '@/components/ui/HeatmapControls';

interface HeatmapChartProps {
  challenges: Challenge[];
  onCellClick?: (sector: Sector, problemType: string) => void;
  className?: string;
}

// Removed getSectorColor as it's not used in the simplified version

// Get color intensity based on value and max value
function getHeatmapColor(value: number, maxValue: number): string {
  if (value === 0) return '#f8f9fa'; // Light gray for zero
  
  const intensity = value / maxValue;
  
  // Blue gradient from light to dark
  if (intensity <= 0.2) return '#e3f2fd'; // Very light blue
  if (intensity <= 0.4) return '#bbdefb'; // Light blue
  if (intensity <= 0.6) return '#64b5f6'; // Medium blue
  if (intensity <= 0.8) return '#2196f3'; // Blue
  return '#1565c0'; // Dark blue
}

// Transform challenges to heatmap format with sorting capabilities
function transformToHeatmapData(challenges: Challenge[], sortBy: SortOption = 'alphabetical') {
  // Get all unique sectors and problem types
  const allSectors = [...new Set(challenges.map(c => c.sector.primary))];
  const allProblemTypes = [...new Set(challenges.map(c => c.problem_type.primary))];
  
  // Create matrix with counts, funding, and cross-sector info
  const matrix: Array<{
    sector: string;
    problemType: string;
    count: number;
    funding: number;
    displaySector: string;
    crossSectorCount: number;
  }> = [];
  
  let maxCount = 0;
  
  // Calculate cross-sector counts for each problem type
  const crossSectorCounts = new Map<string, number>();
  allProblemTypes.forEach(problemType => {
    const sectorsForProblem = new Set(
      challenges
        .filter(c => c.problem_type.primary === problemType)
        .map(c => c.sector.primary)
    );
    crossSectorCounts.set(problemType, sectorsForProblem.size);
  });
  
  allSectors.forEach(sector => {
    allProblemTypes.forEach(problemType => {
      const matchingChallenges = challenges.filter(c => 
        c.sector.primary === sector && c.problem_type.primary === problemType
      );
      
      const count = matchingChallenges.length;
      const funding = matchingChallenges.reduce((sum, c) => sum + (c.funding.amount_max || 0), 0);
      
      maxCount = Math.max(maxCount, count);
      
      matrix.push({
        sector,
        problemType,
        count,
        funding,
        displaySector: sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        crossSectorCount: crossSectorCounts.get(problemType) || 0
      });
    });
  });
  
  // Sort sectors based on sortBy option
  const sectorTotals = new Map<string, { count: number; funding: number; crossSector: number }>();
  allSectors.forEach(sector => {
    const sectorChallenges = challenges.filter(c => c.sector.primary === sector);
    const uniqueProblemTypes = new Set(sectorChallenges.map(c => c.problem_type.primary));
    
    sectorTotals.set(sector, {
      count: sectorChallenges.length,
      funding: sectorChallenges.reduce((sum, c) => sum + (c.funding.amount_max || 0), 0),
      crossSector: uniqueProblemTypes.size
    });
  });
  
  let sectors: string[];
  switch (sortBy) {
    case 'count':
      sectors = [...allSectors].sort((a, b) => (sectorTotals.get(b)?.count || 0) - (sectorTotals.get(a)?.count || 0));
      break;
    case 'funding':
      sectors = [...allSectors].sort((a, b) => (sectorTotals.get(b)?.funding || 0) - (sectorTotals.get(a)?.funding || 0));
      break;
    case 'cross-sector':
      sectors = [...allSectors].sort((a, b) => (sectorTotals.get(b)?.crossSector || 0) - (sectorTotals.get(a)?.crossSector || 0));
      break;
    case 'alphabetical':
    default:
      sectors = [...allSectors].sort();
      break;
  }
  
  // Sort problem types based on sortBy option
  const problemTypeTotals = new Map<string, { count: number; funding: number; crossSector: number }>();
  allProblemTypes.forEach(problemType => {
    const problemChallenges = challenges.filter(c => c.problem_type.primary === problemType);
    
    problemTypeTotals.set(problemType, {
      count: problemChallenges.length,
      funding: problemChallenges.reduce((sum, c) => sum + (c.funding.amount_max || 0), 0),
      crossSector: crossSectorCounts.get(problemType) || 0
    });
  });
  
  let problemTypes: string[];
  switch (sortBy) {
    case 'count':
      problemTypes = [...allProblemTypes].sort((a, b) => (problemTypeTotals.get(b)?.count || 0) - (problemTypeTotals.get(a)?.count || 0));
      break;
    case 'funding':
      problemTypes = [...allProblemTypes].sort((a, b) => (problemTypeTotals.get(b)?.funding || 0) - (problemTypeTotals.get(a)?.funding || 0));
      break;
    case 'cross-sector':
      problemTypes = [...allProblemTypes].sort((a, b) => (problemTypeTotals.get(b)?.crossSector || 0) - (problemTypeTotals.get(a)?.crossSector || 0));
      break;
    case 'alphabetical':
    default:
      problemTypes = [...allProblemTypes].sort();
      break;
  }
  
  return { matrix, sectors, problemTypes, maxCount };
}

export function HeatmapChart({ 
  challenges, 
  onCellClick: _onCellClick,
  className = '' 
}: HeatmapChartProps) {
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [containerWidth, setContainerWidth] = useState(1200);
  
  // Track container width for responsive design
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.heatmap-container');
      if (container) {
        setContainerWidth(container.clientWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  const { matrix, sectors, problemTypes, maxCount } = useMemo(() => {
    if (challenges.length === 0) return { matrix: [], sectors: [], problemTypes: [], maxCount: 0 };
    return transformToHeatmapData(challenges, sortBy);
  }, [challenges, sortBy]);
  
  if (challenges.length === 0 || matrix.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Sector vs Problem Type Heatmap</CardTitle>
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
  
  const handleCellClick = (sector: string, problemType: string) => {
    if (_onCellClick) {
      _onCellClick(sector as Sector, problemType);
    }
  };
  
  // Simplified click handler for future implementation
  // const handleCellClick = (cell: { value: number; serieId: string; data: { x: string } }) => {
  //   if (onCellClick && cell.value > 0) {
  //     const sector = cell.serieId.toLowerCase().replace(' ', '_') as Sector;
  //     const problemType = cell.data.x;
  //     onCellClick(sector, problemType);
  //   }
  // };
  
  // Calculate responsive dimensions
  const availableWidth = containerWidth - 200; // Account for margins and labels
  const cellWidth = Math.max(60, Math.min(120, availableWidth / problemTypes.length));
  const cellHeight = 50;
  const labelHeight = 80;
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Sector vs Problem Type Heatmap
          <div className="flex items-center gap-4">
            <HeatmapControls sortBy={sortBy} onSortChange={setSortBy} />
            <div className="text-sm text-gray-600 font-normal">
              Challenge distribution across sectors and problem types
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="heatmap-container relative overflow-x-auto" style={{ height: `${Math.max(400, sectors.length * cellHeight + labelHeight + 120)}px` }}>
          <div className="p-4" style={{ minWidth: `${Math.max(800, problemTypes.length * cellWidth + 200)}px` }}>
            {/* Y-axis labels (Sectors) */}
            <div className="flex">
              <div className="w-40 flex flex-col justify-around" style={{ height: `${sectors.length * cellHeight}px` }}>
                {sectors.map(sector => (
                  <div key={sector} className="text-sm font-medium text-gray-700 text-right pr-3" style={{ height: `${cellHeight}px`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                ))}
              </div>
              
              {/* Heatmap Grid */}
              <div className="flex-1">
                {/* X-axis labels (Problem Types) */}
                <div className="flex mb-2" style={{ height: `${labelHeight}px` }}>
                  {problemTypes.map(problemType => (
                    <div 
                      key={problemType} 
                      className="text-xs font-medium text-gray-700 transform -rotate-45 origin-bottom-left"
                      style={{ 
                        width: `${cellWidth}px`,
                        display: 'flex',
                        alignItems: 'end',
                        justifyContent: 'start',
                        paddingLeft: '8px',
                        height: `${labelHeight}px`
                      }}
                    >
                      <span className="truncate max-w-full">{problemType}</span>
                    </div>
                  ))}
                </div>
                
                {/* Heatmap Cells */}
                <div className="grid gap-1" style={{ 
                  gridTemplateColumns: `repeat(${problemTypes.length}, ${cellWidth}px)`,
                  gridTemplateRows: `repeat(${sectors.length}, ${cellHeight}px)`
                }}>
                  {sectors.map(sector => 
                    problemTypes.map(problemType => {
                      const cell = matrix.find(m => m.sector === sector && m.problemType === problemType);
                      if (!cell) return null;
                      
                      return (
                        <div
                          key={`${cell.sector}-${cell.problemType}`}
                          className="relative border border-gray-200 cursor-pointer hover:border-gray-400 transition-all duration-200 hover:scale-105 hover:z-10"
                          style={{
                            backgroundColor: getHeatmapColor(cell.count, maxCount),
                            width: `${cellWidth}px`,
                            height: `${cellHeight}px`
                          }}
                          onClick={() => handleCellClick(cell.sector, cell.problemType)}
                          title={`${cell.displaySector} × ${cell.problemType}: ${cell.count} challenges, £${cell.funding.toLocaleString()}, Cross-sector: ${cell.crossSectorCount} sectors`}
                        >
                          {cell.count > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-800">
                                {cell.count}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="text-sm font-semibold mb-2">Challenge Count</div>
            <div className="space-y-1">
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#f8f9fa' }}></div>
                <span>0</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#e3f2fd' }}></div>
                <span>1-{Math.ceil(maxCount * 0.2)}</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#bbdefb' }}></div>
                <span>{Math.ceil(maxCount * 0.2) + 1}-{Math.ceil(maxCount * 0.4)}</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#64b5f6' }}></div>
                <span>{Math.ceil(maxCount * 0.4) + 1}-{Math.ceil(maxCount * 0.6)}</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#2196f3' }}></div>
                <span>{Math.ceil(maxCount * 0.6) + 1}-{Math.ceil(maxCount * 0.8)}</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#1565c0' }}></div>
                <span>{Math.ceil(maxCount * 0.8) + 1}+</span>
              </div>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Hover cells for funding details</div>
              <div>• Click cells to filter by sector + problem type</div>
              <div>• Color intensity = challenge count</div>
              <div>• Numbers show exact counts</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default HeatmapChart;