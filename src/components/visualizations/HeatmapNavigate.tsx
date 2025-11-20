/**
 * HeatmapNavigate
 * 
 * NAVIGATE version of Heatmap showing technology maturity matrix
 * Options: TRL vs Category, Technology vs Stakeholder, Funding vs Status
 */

'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stakeholder, Technology, TechnologyCategory, StakeholderType } from '@/lib/navigate-types';

interface HeatmapNavigateProps {
  stakeholders: Stakeholder[];
  technologies: Technology[];
  view?: 'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status';
  onViewChange?: (view: 'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status') => void;
  onCellClick?: (row: string, col: string, value: number) => void;
  className?: string;
  colorMode?: 'absolute' | 'normalized';
}

type HeatmapView = 'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status';

// Get color intensity based on value and max value
function getHeatmapColor(value: number, maxValue: number): string {
  if (value === 0) return '#f8f9fa'; // Light gray for zero
  
  const intensity = value / maxValue;
  
  // Green gradient (CPC theme) from light to dark
  if (intensity <= 0.2) return '#CCE2DC'; // CPC Mint (very light)
  if (intensity <= 0.4) return '#80C5B0'; // Light teal
  if (intensity <= 0.6) return '#4A9B8A'; // Medium teal
  if (intensity <= 0.8) return '#006E51'; // CPC Primary Teal
  return '#004A38'; // Dark teal
}

// Transform for TRL vs Category
function transformTRLvsCategory(technologies: Technology[]) {
  const trlLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const categories: TechnologyCategory[] = ['H2Production', 'H2Storage', 'FuelCells', 'Aircraft', 'Infrastructure'];
  
  const matrix: Array<{
    trl: number;
    category: TechnologyCategory;
    count: number;
    avgFunding: number;
    normalized?: number;
  }> = [];
  
  let maxCount = 0;
  const rowTotals = new Map<number, number>();
  
  trlLevels.forEach(trl => {
    categories.forEach(category => {
      const matching = technologies.filter(t => 
        (t.trl_current || 0) === trl && t.category === category
      );
      const count = matching.length;
      const avgFunding = matching.length > 0
        ? matching.reduce((sum, t) => sum + (t.total_funding || 0), 0) / matching.length
        : 0;
      
      maxCount = Math.max(maxCount, count);
      rowTotals.set(trl, (rowTotals.get(trl) || 0) + count);
      
      matrix.push({ trl, category, count, avgFunding });
    });
  });
  
  const normalizedMatrix = matrix.map(entry => {
    const rowTotal = rowTotals.get(entry.trl) || 0;
    return {
      ...entry,
      normalized: rowTotal > 0 ? entry.count / rowTotal : 0
    };
  });
  
  return { matrix: normalizedMatrix, rows: trlLevels.map(t => `TRL ${t}`), cols: categories, maxCount, maxNormalized: 1 };
}

// Transform for Technology vs Stakeholder
function transformTechVsStakeholder(technologies: Technology[], stakeholders: Stakeholder[]) {
  // Get top technologies by funding
  const topTechs = [...technologies]
    .sort((a, b) => (b.total_funding || 0) - (a.total_funding || 0))
    .slice(0, 10)
    .map(t => ({ id: t.id, name: t.name }));
  
  // Get top stakeholders by funding
  const topStakeholders = [...stakeholders]
    .sort((a, b) => 
      ((b.total_funding_provided || 0) + (b.total_funding_received || 0)) - 
      ((a.total_funding_provided || 0) + (a.total_funding_received || 0))
    )
    .slice(0, 10)
    .map(s => ({ id: s.id, name: s.name }));
  
  const matrix: Array<{
    techId: string;
    techName: string;
    stakeholderId: string;
    stakeholderName: string;
    connectionStrength: number;
    normalized?: number;
  }> = [];
  
  let maxStrength = 0;
  const rowTotals = new Map<string, number>();
  
  // For now, create a simple connection matrix
  // In a real implementation, this would use relationships data
  topTechs.forEach(tech => {
    topStakeholders.forEach(stakeholder => {
      // Placeholder: connection strength based on funding overlap
      const techFunding = technologies.find(t => t.id === tech.id)?.total_funding || 0;
      const stakeholderFunding = stakeholders.find(s => s.id === stakeholder.id)?.total_funding_provided || 0;
      const connectionStrength = techFunding > 0 && stakeholderFunding > 0 ? Math.min(10, Math.round((techFunding + stakeholderFunding) / 1000000)) : 0;
      
      maxStrength = Math.max(maxStrength, connectionStrength);
      rowTotals.set(tech.id, (rowTotals.get(tech.id) || 0) + connectionStrength);
      
      matrix.push({
        techId: tech.id,
        techName: tech.name,
        stakeholderId: stakeholder.id,
        stakeholderName: stakeholder.name,
        connectionStrength
      });
    });
  });
  
  const normalizedMatrix = matrix.map(entry => {
    const total = rowTotals.get(entry.techId) || 0;
    return {
      ...entry,
      normalized: total > 0 ? entry.connectionStrength / total : 0
    };
  });
  
  return {
    matrix: normalizedMatrix,
    rows: topTechs.map(t => t.name),
    cols: topStakeholders.map(s => s.name),
    maxStrength,
    maxNormalized: 1
  };
}

// Transform for Funding vs Status (by stakeholder type)
function transformFundingVsStatus(stakeholders: Stakeholder[]) {
  const types: StakeholderType[] = ['Government', 'Research', 'Industry', 'Intermediary'];
  const statusLevels = ['High', 'Medium', 'Low'];
  
  const matrix: Array<{
    type: StakeholderType;
    status: string;
    count: number;
    totalFunding: number;
    normalized?: number;
  }> = [];
  
  let maxCount = 0;
  const rowTotals = new Map<StakeholderType, number>();
  
  types.forEach(type => {
    statusLevels.forEach(status => {
      const matching = stakeholders.filter(s => {
        const funding = (s.total_funding_provided || 0) + (s.total_funding_received || 0);
        let capacityStatus = 'Low';
        if (funding > 50000000) capacityStatus = 'High';
        else if (funding > 10000000) capacityStatus = 'Medium';
        
        return s.type === type && capacityStatus === status;
      });
      
      const count = matching.length;
      const totalFunding = matching.reduce((sum, s) => 
        sum + (s.total_funding_provided || 0) + (s.total_funding_received || 0), 0
      );
      
      maxCount = Math.max(maxCount, count);
      rowTotals.set(type, (rowTotals.get(type) || 0) + count);
      
      matrix.push({ type, status, count, totalFunding });
    });
  });
  
  const normalizedMatrix = matrix.map(entry => {
    const total = rowTotals.get(entry.type) || 0;
    return {
      ...entry,
      normalized: total > 0 ? entry.count / total : 0
    };
  });
  
  return { matrix: normalizedMatrix, rows: types, cols: statusLevels, maxCount, maxNormalized: 1 };
}

export function HeatmapNavigate({ 
  stakeholders,
  technologies,
  view: externalView,
  onViewChange,
  onCellClick,
  className = '',
  colorMode = 'absolute'
}: HeatmapNavigateProps) {
  const [internalView, setInternalView] = useState<HeatmapView>('trl_vs_category');
  const view = externalView ?? internalView;
  const setView = onViewChange ?? setInternalView;
  
  const heatmapData = useMemo(() => {
    if (view === 'trl_vs_category') {
      return transformTRLvsCategory(technologies);
    } else if (view === 'tech_vs_stakeholder') {
      return transformTechVsStakeholder(technologies, stakeholders);
    } else {
      return transformFundingVsStatus(stakeholders);
    }
  }, [stakeholders, technologies, view]);
  
  const getTitle = () => {
    switch (view) {
      case 'trl_vs_category':
        return 'Technology Readiness Level by Category';
      case 'tech_vs_stakeholder':
        return 'Technology-Stakeholder Connections';
      case 'funding_vs_status':
        return 'Funding Capacity by Stakeholder Type';
      default:
        return 'NAVIGATE Maturity Matrix';
    }
  };
  
  const getCellValue = (row: string, col: string, mode: 'absolute' | 'normalized' = 'absolute'): number => {
    if (view === 'trl_vs_category') {
      const trl = parseInt(row.replace('TRL ', ''));
      const match = (heatmapData.matrix as any[]).find((m) => m.trl === trl && m.category === col);
      return mode === 'normalized' ? match?.normalized ?? 0 : match?.count ?? 0;
    } else if (view === 'tech_vs_stakeholder') {
      const match = (heatmapData.matrix as any[]).find((m) => m.techName === row && m.stakeholderName === col);
      return mode === 'normalized' ? match?.normalized ?? 0 : match?.connectionStrength ?? 0;
    } else {
      const match = (heatmapData.matrix as any[]).find((m) => m.type === row && m.status === col);
      return mode === 'normalized' ? match?.normalized ?? 0 : match?.count ?? 0;
    }
  };
  
  if ((technologies.length === 0 && stakeholders.length === 0) || heatmapData.matrix.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>NAVIGATE Maturity Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600">No data available to display</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const maxAbsoluteValue = view === 'tech_vs_stakeholder'
    ? (heatmapData as any).maxStrength
    : (heatmapData as any).maxCount;
  const maxNormalizedValue = (heatmapData as any).maxNormalized ?? 1;
  const effectiveMaxValue = colorMode === 'normalized' ? (maxNormalizedValue || 1) : (maxAbsoluteValue || 1);
  
  const handleCellClick = (row: string, col: string) => {
    if (onCellClick) {
      const value = getCellValue(row, col);
      onCellClick(row, col, value);
    }
  };
  
  // Calculate responsive cell size
  const cellWidth = Math.max(80, Math.min(150, 1200 / heatmapData.cols.length));
  const cellHeight = Math.max(40, Math.min(80, 600 / heatmapData.rows.length));
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>NAVIGATE Maturity Matrix</CardTitle>
        <p className="text-sm text-gray-500 mt-1">{getTitle()}</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Column Headers */}
            <div className="flex">
              <div className="w-32 flex-shrink-0"></div> {/* Row header space */}
              {heatmapData.cols.map(col => (
                <div
                  key={col}
                  className="flex-shrink-0 text-xs font-medium text-gray-700 p-2 border-b border-gray-200"
                  style={{ width: `${cellWidth}px`, minHeight: '60px' }}
                >
                  <div className="transform -rotate-45 origin-top-left whitespace-nowrap">
                    {col.length > 15 ? col.substring(0, 15) + '...' : col}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Rows */}
            {heatmapData.rows.map(row => (
              <div key={row} className="flex">
                {/* Row Header */}
                <div className="w-32 flex-shrink-0 text-xs font-medium text-gray-700 p-2 border-r border-gray-200 flex items-center">
                  {row.length > 20 ? row.substring(0, 20) + '...' : row}
                </div>
                
                {/* Cells */}
                {heatmapData.cols.map(col => {
                  const displayValue = colorMode === 'normalized'
                    ? getCellValue(row, col, 'normalized')
                    : getCellValue(row, col, 'absolute');
                  const absoluteValue = getCellValue(row, col, 'absolute');
                  const color = getHeatmapColor(displayValue, effectiveMaxValue);
                  const formattedValue =
                    colorMode === 'normalized'
                      ? `${Math.round(displayValue * 100)}%`
                      : absoluteValue;
                  
                  return (
                    <div
                      key={`${row}-${col}`}
                      onClick={() => handleCellClick(row, col)}
                      className="flex-shrink-0 border border-gray-200 cursor-pointer hover:border-[#006E51] hover:border-2 transition-all relative group"
                      style={{ 
                        width: `${cellWidth}px`, 
                        height: `${cellHeight}px`,
                        backgroundColor: color
                      }}
                      title={`${row} × ${col}: ${formattedValue}`}
                    >
                      {displayValue > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800">
                          {formattedValue}
                        </div>
                      )}
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                          {row} × {col}: {formattedValue}
                          {colorMode === 'normalized' && (
                            <span className="ml-1 text-gray-300">({absoluteValue})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-600">Intensity:</div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f8f9fa' }}></div>
              <span className="text-xs">0</span>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#CCE2DC' }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#80C5B0' }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4A9B8A' }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#006E51' }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#004A38' }}></div>
              <span className="text-xs">
                Max ({colorMode === 'normalized' ? '100%' : Math.round(effectiveMaxValue)})
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Click cells to see details
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

