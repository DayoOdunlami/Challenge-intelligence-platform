'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Challenge, Sector } from '@/lib/types';

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

// Transform challenges to heatmap format (Sector vs Problem Type intensity)
function transformToHeatmapData(challenges: Challenge[]) {
  // Get all unique sectors and problem types
  const sectors = [...new Set(challenges.map(c => c.sector.primary))].sort();
  const problemTypes = [...new Set(challenges.map(c => c.problem_type.primary))].sort();
  
  // Create matrix with counts and funding
  const matrix: Array<{
    sector: string;
    problemType: string;
    count: number;
    funding: number;
    displaySector: string;
  }> = [];
  
  let maxCount = 0;
  
  sectors.forEach(sector => {
    problemTypes.forEach(problemType => {
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
        displaySector: sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      });
    });
  });
  
  return { matrix, sectors, problemTypes, maxCount };
}

export function HeatmapChart({ 
  challenges, 
  onCellClick: _onCellClick,
  className = '' 
}: HeatmapChartProps) {
  
  const { matrix, sectors, problemTypes, maxCount } = useMemo(() => {
    if (challenges.length === 0) return { matrix: [], sectors: [], problemTypes: [], maxCount: 0 };
    return transformToHeatmapData(challenges);
  }, [challenges]);
  
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
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Sector vs Problem Type Heatmap
          <div className="text-sm text-gray-600 font-normal">
            Challenge distribution across sectors and problem types
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative" style={{ height: `${Math.max(400, sectors.length * 60 + 120)}px` }}>
          <div className="p-4">
            {/* Y-axis labels (Sectors) */}
            <div className="flex">
              <div className="w-32 flex flex-col justify-around" style={{ height: `${sectors.length * 60}px` }}>
                {sectors.map(sector => (
                  <div key={sector} className="text-sm font-medium text-gray-700 text-right pr-3">
                    {sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                ))}
              </div>
              
              {/* Heatmap Grid */}
              <div className="flex-1">
                {/* X-axis labels (Problem Types) */}
                <div className="flex mb-2" style={{ height: '60px' }}>
                  {problemTypes.map(problemType => (
                    <div 
                      key={problemType} 
                      className="flex-1 text-xs font-medium text-gray-700 transform -rotate-45 origin-bottom-left"
                      style={{ 
                        minWidth: `${Math.max(120, 800 / problemTypes.length)}px`,
                        display: 'flex',
                        alignItems: 'end',
                        justifyContent: 'start',
                        paddingLeft: '8px'
                      }}
                    >
                      {problemType}
                    </div>
                  ))}
                </div>
                
                {/* Heatmap Cells */}
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${problemTypes.length}, 1fr)` }}>
                  {matrix.map(cell => (
                    <div
                      key={`${cell.sector}-${cell.problemType}`}
                      className="relative border border-gray-200 cursor-pointer hover:border-gray-400 transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: getHeatmapColor(cell.count, maxCount),
                        height: '50px',
                        minWidth: `${Math.max(80, 800 / problemTypes.length)}px`
                      }}
                      onClick={() => handleCellClick(cell.sector, cell.problemType)}
                      title={`${cell.displaySector} × ${cell.problemType}: ${cell.count} challenges, £${cell.funding.toLocaleString()}`}
                    >
                      {cell.count > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-800">
                            {cell.count}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
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