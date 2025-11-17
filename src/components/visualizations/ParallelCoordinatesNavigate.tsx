/**
 * ParallelCoordinatesNavigate
 * 
 * NAVIGATE version of Parallel Coordinates for multi-dimensional technology comparison
 * Shows technologies across multiple dimensions (TRL, Funding, Market Readiness, etc.)
 */

'use client';

import React, { useMemo } from 'react';
import { ResponsiveParallelCoordinates } from '@nivo/parallel-coordinates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Technology, TechnologyCategory } from '@/lib/navigate-types';

interface ParallelCoordinatesNavigateProps {
  technologies: Technology[];
  selectedTechIds?: string[];
  dimensions?: string[];
  onTechnologySelect?: (techId: string) => void;
  className?: string;
}

// Get color for technology category
function getTechCategoryColor(category: TechnologyCategory): string {
  const colors: Record<TechnologyCategory, string> = {
    'H2Production': '#006E51',      // CPC Primary Teal
    'H2Storage': '#50C878',        // CPC Success Green
    'FuelCells': '#F5A623',        // CPC Warning Amber
    'Aircraft': '#4A90E2',        // CPC Info Blue
    'Infrastructure': '#8b5cf6'    // Purple
  };
  return colors[category] || '#6b7280';
}

// Normalize values to 0-100 scale for parallel coordinates
function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 50; // Default to middle if no range
  return ((value - min) / (max - min)) * 100;
}

// Transform technologies to parallel coordinates format
function transformToParallelData(
  technologies: Technology[],
  selectedTechIds?: string[]
) {
  let filteredTechs = technologies;
  
  if (selectedTechIds && selectedTechIds.length > 0) {
    filteredTechs = technologies.filter(t => selectedTechIds.includes(t.id));
  }
  
  if (filteredTechs.length === 0) {
    return { data: [], dimensions: [] };
  }
  
  // Calculate min/max for normalization
  const trlValues = filteredTechs.map(t => t.trl_current || 0);
  const fundingValues = filteredTechs.map(t => (t.total_funding || 0) / 1000000); // Convert to millions
  const marketReadinessValues = filteredTechs.map(t => {
    // Estimate market readiness from TRL (1-9 scale)
    const trl = t.trl_current || 0;
    return trl >= 7 ? 90 : trl >= 5 ? 60 : trl >= 3 ? 30 : 10;
  });
  const regulatoryValues = filteredTechs.map(t => {
    // Estimate regulatory status (0-100 scale)
    const trl = t.trl_current || 0;
    return trl >= 7 ? 80 : trl >= 5 ? 50 : trl >= 3 ? 30 : 10;
  });
  const maturity2030Values = filteredTechs.map(t => (t.trl_projected_2030 || t.trl_current || 0) * 10);
  
  const minMax = {
    trl: { min: Math.min(...trlValues), max: Math.max(...trlValues) },
    funding: { min: Math.min(...fundingValues), max: Math.max(...fundingValues) },
    marketReadiness: { min: Math.min(...marketReadinessValues), max: Math.max(...marketReadinessValues) },
    regulatory: { min: Math.min(...regulatoryValues), max: Math.max(...regulatoryValues) },
    maturity2030: { min: Math.min(...maturity2030Values), max: Math.max(...maturity2030Values) }
  };
  
  // Transform to parallel coordinates format
  const data = filteredTechs.map(tech => {
    const trl = tech.trl_current || 0;
    const funding = (tech.total_funding || 0) / 1000000;
    const marketReadiness = trl >= 7 ? 90 : trl >= 5 ? 60 : trl >= 3 ? 30 : 10;
    const regulatory = trl >= 7 ? 80 : trl >= 5 ? 50 : trl >= 3 ? 30 : 10;
    const maturity2030 = (tech.trl_projected_2030 || trl) * 10;
    
    return {
      id: tech.id,
      name: tech.name,
      category: tech.category,
      'TRL Level': normalizeValue(trl, minMax.trl.min, minMax.trl.max),
      'Funding (£M)': normalizeValue(funding, minMax.funding.min, minMax.funding.max),
      'Market Readiness': normalizeValue(marketReadiness, minMax.marketReadiness.min, minMax.marketReadiness.max),
      'Regulatory Status': normalizeValue(regulatory, minMax.regulatory.min, minMax.regulatory.max),
      '2030 Maturity': normalizeValue(maturity2030, minMax.maturity2030.min, minMax.maturity2030.max)
    };
  });
  
  const dimensions = [
    { id: 'TRL Level', type: 'linear', min: 0, max: 100 },
    { id: 'Funding (£M)', type: 'linear', min: 0, max: 100 },
    { id: 'Market Readiness', type: 'linear', min: 0, max: 100 },
    { id: 'Regulatory Status', type: 'linear', min: 0, max: 100 },
    { id: '2030 Maturity', type: 'linear', min: 0, max: 100 }
  ];
  
  return { data, dimensions };
}

export function ParallelCoordinatesNavigate({
  technologies,
  selectedTechIds,
  dimensions: externalDimensions,
  onTechnologySelect,
  className = ''
}: ParallelCoordinatesNavigateProps) {
  const parallelData = useMemo(() => {
    return transformToParallelData(technologies, selectedTechIds);
  }, [technologies, selectedTechIds]);
  
  if (parallelData.data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Multi-Dimensional Technology Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            <p>No technologies available for comparison.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Filter dimensions if specified
  const dimensions = externalDimensions && externalDimensions.length > 0
    ? parallelData.dimensions.filter(d => externalDimensions.includes(d.id))
    : parallelData.dimensions;
  
  if (dimensions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Multi-Dimensional Technology Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            <p>Please select at least one dimension to display.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Multi-Dimensional Technology Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <ResponsiveParallelCoordinates
            data={parallelData.data}
            variables={dimensions}
            margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
            colors={(d: any) => {
              // Nivo passes the data point directly
              const category = d?.category;
              return category ? getTechCategoryColor(category as TechnologyCategory) : '#6b7280';
            }}
            strokeWidth={2}
            lineOpacity={0.6}
            axesPlan="foreground"
            axesTicksPosition="after"
            animate={true}
            motionConfig="gentle"
            legends={[
              {
                anchor: 'right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 60,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 12,
                symbolShape: 'circle'
              }
            ]}
            tooltip={({ variable, value, data }: any) => {
              if (!data) return null;
              const dataId = data.id || data.data?.id;
              if (!dataId) return null;
              const tech = technologies.find(t => t.id === dataId);
              return (
                <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
                  <div className="font-semibold text-sm">{tech?.name || data.name || dataId || 'Unknown'}</div>
                  <div className="text-xs text-gray-600">
                    {variable}: {typeof value === 'number' ? value.toFixed(1) : value}
                  </div>
                </div>
              );
            }}
            onClick={(data: any) => {
              if (onTechnologySelect && data?.id) {
                onTechnologySelect(data.id);
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

