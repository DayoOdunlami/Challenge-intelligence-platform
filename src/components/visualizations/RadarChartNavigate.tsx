/**
 * RadarChartNavigate
 * 
 * NAVIGATE version of Radar Chart showing technology maturity profiles
 * Compares multiple technologies across dimensions: TRL, Funding, Market Readiness, Regulatory Status
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ResponsiveRadar } from '@nivo/radar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Technology } from '@/lib/navigate-types';

interface RadarChartNavigateProps {
  technologies: Technology[];
  selectedTechIds?: string[];
  onTechIdsChange?: (ids: string[]) => void;
  selectedDimensions?: string[];
  onDimensionsChange?: (dimensions: string[]) => void;
  onTechnologySelect?: (techId: string) => void;
  className?: string;
}

interface RadarDataPoint {
  technology: string;
  [key: string]: string | number;
}

export function RadarChartNavigate({ 
  technologies,
  selectedTechIds: externalSelectedTechIds,
  onTechIdsChange,
  selectedDimensions: externalSelectedDimensions,
  onDimensionsChange,
  onTechnologySelect,
  className = '' 
}: RadarChartNavigateProps) {
  const [internalSelectedTechIds, setInternalSelectedTechIds] = useState<string[]>([]);
  const selectedTechIds = externalSelectedTechIds ?? internalSelectedTechIds;
  const setSelectedTechIds = onTechIdsChange ?? setInternalSelectedTechIds;
  
  const [internalSelectedDimensions, setInternalSelectedDimensions] = useState<string[]>([
    'TRL Level',
    'Funding',
    'Market Readiness',
    'Regulatory Status',
    '2030 Maturity'
  ]);
  const selectedDimensions = externalSelectedDimensions ?? internalSelectedDimensions;
  const setSelectedDimensions = onDimensionsChange ?? setInternalSelectedDimensions;

  // Transform technologies to radar format
  const radarData = useMemo(() => {
    if (technologies.length === 0) return [];

    // Calculate dimensions for each technology
    return technologies.map(tech => {
      // Normalize TRL (0-9) to 0-10 scale
      const trlScore = (tech.trl_current || 0) * (10 / 9);
      
      // Normalize funding (0-100M) to 0-10 scale
      const fundingScore = Math.min(10, ((tech.total_funding || 0) / 10000000) * 10);
      
      // Market readiness (0-10) - based on deployment_ready and trl
      const marketReadiness = tech.deployment_ready 
        ? Math.min(10, (tech.trl_current || 0) + 2)
        : (tech.trl_current || 0) * 0.8;
      
      // Regulatory status (0-10) - simplified, based on TRL and deployment readiness
      // Higher TRL + deployment ready = better regulatory position
      const regulatoryStatus = tech.deployment_ready 
        ? Math.min(10, (tech.trl_current || 0) + 1)
        : Math.max(2, (tech.trl_current || 0) * 0.6);
      
      // Technology maturity (0-10) - based on projected TRL 2030
      const maturityScore = tech.trl_projected_2030 
        ? Math.min(10, (tech.trl_projected_2030 / 9) * 10)
        : (tech.trl_current || 0) * (10 / 9);

      return {
        technology: tech.name,
        techId: tech.id,
        'TRL Level': Math.round(trlScore * 10) / 10,
        'Funding': Math.round(fundingScore * 10) / 10,
        'Market Readiness': Math.round(marketReadiness * 10) / 10,
        'Regulatory Status': Math.round(regulatoryStatus * 10) / 10,
        '2030 Maturity': Math.round(maturityScore * 10) / 10,
      };
    });
  }, [technologies]);

  // Get keys (dimensions) for the radar - filtered by selected dimensions
  const keys = useMemo(() => {
    if (radarData.length === 0) return [];
    const allKeys = Object.keys(radarData[0]).filter(key => key !== 'technology' && key !== 'techId');
    // Filter to only show selected dimensions
    return allKeys.filter(key => selectedDimensions.includes(key));
  }, [radarData, selectedDimensions]);

  // Filter data based on selection
  const filteredData = useMemo(() => {
    if (selectedTechIds.length === 0) {
      // Show top 5 by funding if nothing selected
      return radarData
        .sort((a, b) => (b['Funding'] as number) - (a['Funding'] as number))
        .slice(0, 5);
    }
    return radarData.filter(d => selectedTechIds.includes(d.techId as string));
  }, [radarData, selectedTechIds]);

  // handleTechToggle removed - now handled in Controls Panel

  if (technologies.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>NAVIGATE Technology Maturity Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600">No technology data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Color palette for technologies
  const getTechColor = (index: number) => {
    const colors = [
      '#006E51', // CPC Primary Teal
      '#4A90E2', // CPC Info Blue
      '#F5A623', // CPC Warning Amber
      '#EC4899', // Pink
      '#8B5CF6', // Purple
      '#50C878', // Green
      '#CCE2DC', // CPC Mint
      '#2E2D2B', // CPC Charcoal
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>NAVIGATE Technology Maturity Radar</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Compare technologies across 5 dimensions (0-10 scale)
        </p>
      </CardHeader>
      <CardContent>
        {selectedTechIds.length === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              Select technologies in the Controls Panel to compare
            </p>
          </div>
        )}
        
        {keys.length === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              Select at least one dimension in the Controls Panel to display
            </p>
          </div>
        )}

        {/* Radar Chart */}
        {keys.length > 0 && filteredData.length > 0 ? (
          <div className="w-full h-[600px]">
            <ResponsiveRadar
              data={filteredData}
              keys={keys}
              indexBy="technology"
              valueFormat=".1f"
              margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
              borderColor={{ from: 'color' }}
              gridLabelOffset={36}
              dotSize={8}
              dotColor={{ theme: 'background' }}
              dotBorderWidth={2}
              colors={(d) => getTechColor(d.index)}
              fillOpacity={0.25}
              blendMode="multiply"
              motionConfig="wobbly"
              onClick={(point) => {
                if (onTechnologySelect && point.index) {
                  const techData = filteredData.find(d => d.technology === point.index);
                  if (techData && techData.techId) {
                    onTechnologySelect(techData.techId as string);
                  }
                }
              }}
              legends={[
                {
                  anchor: 'top-left',
                  direction: 'column',
                  translateX: -50,
                  translateY: -40,
                  itemWidth: 80,
                  itemHeight: 20,
                  itemTextColor: '#999',
                  symbolSize: 12,
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#000'
                      }
                    }
                  ]
                }
              ]}
              tooltip={({ index, formattedValue, id }) => (
                <div className="bg-white p-2 border rounded shadow-lg">
                  <div className="font-semibold">{index}</div>
                  <div className="text-sm">
                    <span className="font-medium">{id}:</span> {formattedValue}/10
                  </div>
                </div>
              )}
            />
          </div>
        ) : (
          <div className="w-full h-[600px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>No data to display</p>
              <p className="text-xs mt-2">
                {selectedTechIds.length === 0 && 'Select technologies to compare'}
                {selectedTechIds.length > 0 && keys.length === 0 && 'Select dimensions to display'}
              </p>
            </div>
          </div>
        )}

        {/* Dimension Explanation */}
        <div className="mt-6 p-4 bg-[#CCE2DC]/20 rounded-lg">
          <h4 className="text-sm font-medium text-[#006E51] mb-2">Dimensions Explained</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-gray-600">
            <div>
              <div className="font-medium">TRL Level</div>
              <div>Current Technology Readiness Level (0-9)</div>
            </div>
            <div>
              <div className="font-medium">Funding</div>
              <div>Total funding received (normalized)</div>
            </div>
            <div>
              <div className="font-medium">Market Readiness</div>
              <div>Deployment readiness & maturity</div>
            </div>
            <div>
              <div className="font-medium">Regulatory Status</div>
              <div>Approval & certification progress</div>
            </div>
            <div>
              <div className="font-medium">2030 Maturity</div>
              <div>Projected TRL by 2030</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

