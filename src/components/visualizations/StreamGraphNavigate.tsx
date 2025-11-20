/**
 * StreamGraphNavigate
 * 
 * NAVIGATE version of Stream Graph showing funding trends over time
 * Shows cumulative funding flows by category (stakeholder type, technology category, funding type)
 * Enhanced with scenario modeling (Baseline vs Accelerated) and target annotations
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ResponsiveStream } from '@nivo/stream';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FundingEvent, TechnologyCategory, StakeholderType, FundingType } from '@/lib/navigate-types';

type Scenario = 'baseline' | 'accelerated';

interface ScenarioState {
  government_funding_multiplier: number; // 0-200% (default 100)
  private_funding_multiplier: number; // 0-200% (default 100)
}

interface StreamGraphNavigateProps {
  fundingEvents: FundingEvent[];
  stakeholders: Array<{ id: string; type: StakeholderType }>;
  technologies: Array<{ id: string; category: TechnologyCategory }>;
  view?: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type';
  onViewChange?: (view: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type') => void;
  scenario?: Scenario;
  onScenarioChange?: (scenario: Scenario) => void;
  scenarioState?: ScenarioState;
  onScenarioStateChange?: (state: ScenarioState) => void;
  showTargets?: boolean;
  onStreamClick?: (id: string, data: any) => void;
  className?: string;
}

type StreamView = 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type';

// Get color for stream
function getStreamColor(id: string, view: StreamView): string {
  const colors: Record<string, string> = {
    // Stakeholder types
    'Government': '#006E51',      // CPC Primary Teal
    'Research': '#50C878',        // CPC Success Green
    'Industry': '#F5A623',        // CPC Warning Amber
    'Intermediary': '#4A90E2',    // CPC Info Blue
    
    // Technology categories
    'H2Production': '#006E51',
    'H2Storage': '#50C878',
    'FuelCells': '#F5A623',
    'Aircraft': '#4A90E2',
    'Infrastructure': '#8b5cf6',
    
    // Funding types
    'Public': '#006E51',
    'Private': '#F5A623',
    'Mixed': '#50C878'
  };
  
  return colors[id] || '#6b7280';
}

// Apply scenario multipliers to funding events
function applyScenario(
  events: FundingEvent[],
  scenario: Scenario,
  scenarioState: ScenarioState
): FundingEvent[] {
  if (scenario === 'baseline') {
    return events; // No changes for baseline
  }
  
  // Accelerated scenario: apply multipliers
  return events.map(event => {
    let multiplier = 1;
    
    if (event.funding_type === 'Public') {
      multiplier = scenarioState.government_funding_multiplier / 100;
    } else if (event.funding_type === 'Private') {
      multiplier = scenarioState.private_funding_multiplier / 100;
    } else {
      // Mixed: average of both
      multiplier = (scenarioState.government_funding_multiplier + scenarioState.private_funding_multiplier) / 200;
    }
    
    return {
      ...event,
      amount: event.amount * multiplier
    };
  });
}

// Transform funding events to stream data by stakeholder type
function transformByStakeholderType(
  fundingEvents: FundingEvent[],
  stakeholders: Array<{ id: string; type: StakeholderType }>,
  scenario: Scenario = 'baseline',
  scenarioState: ScenarioState = { government_funding_multiplier: 100, private_funding_multiplier: 100 }
) {
  const adjustedEvents = applyScenario(fundingEvents, scenario, scenarioState);
  const stakeholderMap = new Map(stakeholders.map(s => [s.id, s.type]));
  
  // Get years from funding events
  const years = Array.from(new Set(
    adjustedEvents.map(e => new Date(e.date).getFullYear())
  )).sort();
  
  const types: StakeholderType[] = ['Government', 'Research', 'Industry', 'Intermediary'];
  
  // Aggregate funding by type and year
  const data: Array<Record<string, number | string>> = [];
  
  years.forEach(year => {
    const yearData: Record<string, number | string> = { year: year.toString() };
    
    types.forEach(type => {
      const amount = adjustedEvents
        .filter(e => {
          const year = new Date(e.date).getFullYear();
          const funderType = stakeholderMap.get(e.source_id);
          return year === parseInt(yearData.year as string) && funderType === type;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      
      yearData[type] = amount / 1000000; // Convert to millions
    });
    
    data.push(yearData);
  });
  
  return { data, keys: types, years };
}

// Transform funding events to stream data by technology category
function transformByTechCategory(
  fundingEvents: FundingEvent[],
  technologies: Array<{ id: string; category: TechnologyCategory }>,
  scenario: Scenario = 'baseline',
  scenarioState: ScenarioState = { government_funding_multiplier: 100, private_funding_multiplier: 100 }
) {
  const adjustedEvents = applyScenario(fundingEvents, scenario, scenarioState);
  const techMap = new Map(technologies.map(t => [t.id, t.category]));
  
  const years = Array.from(new Set(
    adjustedEvents.map(e => new Date(e.date).getFullYear())
  )).sort();
  
  const categories: TechnologyCategory[] = ['H2Production', 'H2Storage', 'FuelCells', 'Aircraft', 'Infrastructure'];
  
  const data: Array<Record<string, number | string>> = [];
  
  years.forEach(year => {
    const yearData: Record<string, number | string> = { year: year.toString() };
    
    categories.forEach(category => {
      const amount = adjustedEvents
        .filter(e => {
          const eventYear = new Date(e.date).getFullYear();
          const supportedTechs = e.technologies_supported || [];
          return eventYear === parseInt(yearData.year as string) &&
                 supportedTechs.some(techId => techMap.get(techId) === category);
        })
        .reduce((sum, e) => sum + e.amount, 0);
      
      yearData[category] = amount / 1000000; // Convert to millions
    });
    
    data.push(yearData);
  });
  
  return { data, keys: categories, years };
}

// Transform funding events to stream data by funding type
function transformByFundingType(
  fundingEvents: FundingEvent[],
  scenario: Scenario = 'baseline',
  scenarioState: ScenarioState = { government_funding_multiplier: 100, private_funding_multiplier: 100 }
) {
  const adjustedEvents = applyScenario(fundingEvents, scenario, scenarioState);
  const years = Array.from(new Set(
    adjustedEvents.map(e => new Date(e.date).getFullYear())
  )).sort();
  
  const types: FundingType[] = ['Public', 'Private', 'Mixed'];
  
  const data: Array<Record<string, number | string>> = [];
  
  years.forEach(year => {
    const yearData: Record<string, number | string> = { year: year.toString() };
    
    types.forEach(type => {
      const amount = adjustedEvents
        .filter(e => {
          const eventYear = new Date(e.date).getFullYear();
          return eventYear === parseInt(yearData.year as string) && e.funding_type === type;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      
      yearData[type] = amount / 1000000; // Convert to millions
    });
    
    data.push(yearData);
  });
  
  return { data, keys: types, years };
}

export function StreamGraphNavigate({
  fundingEvents,
  stakeholders,
  technologies,
  view: externalView,
  onViewChange,
  scenario: externalScenario,
  onScenarioChange,
  scenarioState: externalScenarioState,
  onScenarioStateChange,
  showTargets = true,
  onStreamClick,
  className = ''
}: StreamGraphNavigateProps) {
  const [internalView, setInternalView] = useState<StreamView>('by_stakeholder_type');
  const [internalScenario, setInternalScenario] = useState<Scenario>('baseline');
  const [internalScenarioState, setInternalScenarioState] = useState<ScenarioState>({
    government_funding_multiplier: 100,
    private_funding_multiplier: 200 // Default accelerated: double private funding
  });
  
  const view = externalView ?? internalView;
  const setView = onViewChange ?? setInternalView;
  const scenario = externalScenario ?? internalScenario;
  const setScenario = onScenarioChange ?? setInternalScenario;
  const scenarioState = externalScenarioState ?? internalScenarioState;
  const setScenarioState = onScenarioStateChange ?? setInternalScenarioState;
  
  // Transform data based on view and scenario
  const streamData = useMemo(() => {
    if (view === 'by_stakeholder_type') {
      return transformByStakeholderType(fundingEvents, stakeholders, scenario, scenarioState);
    } else if (view === 'by_tech_category') {
      return transformByTechCategory(fundingEvents, technologies, scenario, scenarioState);
    } else {
      return transformByFundingType(fundingEvents, scenario, scenarioState);
    }
  }, [view, scenario, scenarioState, fundingEvents, stakeholders, technologies]);
  
  // Calculate baseline data for comparison in tooltip
  const baselineData = useMemo(() => {
    if (scenario === 'baseline') return null;
    if (view === 'by_stakeholder_type') {
      return transformByStakeholderType(fundingEvents, stakeholders, 'baseline', { government_funding_multiplier: 100, private_funding_multiplier: 100 });
    } else if (view === 'by_tech_category') {
      return transformByTechCategory(fundingEvents, technologies, 'baseline', { government_funding_multiplier: 100, private_funding_multiplier: 100 });
    } else {
      return transformByFundingType(fundingEvents, 'baseline', { government_funding_multiplier: 100, private_funding_multiplier: 100 });
    }
  }, [view, fundingEvents, stakeholders, technologies, scenario]);
  
  if (streamData.data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Funding Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            <p>No funding data available for the selected view.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Get year range for target lines
  const minYear = streamData.years.length > 0 ? Math.min(...streamData.years) : 2020;
  const maxYear = streamData.years.length > 0 ? Math.max(...streamData.years) : 2030;
  const yearRange = maxYear - minYear;
  const chartWidth = 800; // Approximate chart width (will be responsive)
  
  // Calculate positions for target lines (2030 and 2050)
  const target2030Position = showTargets && 2030 >= minYear && 2030 <= maxYear
    ? ((2030 - minYear) / yearRange) * 100
    : null;
  const target2050Position = showTargets && 2050 >= minYear && 2050 <= maxYear
    ? ((2050 - minYear) / yearRange) * 100
    : null;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Funding Trends Over Time</CardTitle>
          <div className="flex items-center gap-4">
            {/* Scenario Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Scenario:</span>
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setScenario('baseline')}
                  className={`px-3 py-1 text-sm rounded transition-all ${
                    scenario === 'baseline'
                      ? 'bg-[#006E51] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Baseline
                </button>
                <button
                  type="button"
                  onClick={() => setScenario('accelerated')}
                  className={`px-3 py-1 text-sm rounded transition-all ${
                    scenario === 'accelerated'
                      ? 'bg-[#006E51] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Accelerated
                </button>
              </div>
            </div>
          </div>
        </div>
        {scenario === 'accelerated' && (
          <div className="mt-2 text-xs text-gray-600">
            <span>Gov: {scenarioState.government_funding_multiplier}%</span>
            <span className="mx-2">•</span>
            <span>Private: {scenarioState.private_funding_multiplier}%</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full relative">
          {/* Target Lines Overlay */}
          {showTargets && (
            <div className="absolute inset-0 pointer-events-none" style={{ marginLeft: '60px', marginRight: '110px', marginTop: '50px', marginBottom: '50px' }}>
              {target2030Position !== null && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 border-l-2 border-dashed border-red-500"
                  style={{ left: `${target2030Position}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs font-semibold text-red-600 bg-white px-1">2030 Target</span>
                  </div>
                </div>
              )}
              {target2050Position !== null && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 border-l-2 border-dashed border-red-500"
                  style={{ left: `${target2050Position}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs font-semibold text-red-600 bg-white px-1">2050 Target</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <ResponsiveStream
            data={streamData.data}
            keys={streamData.keys}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Year',
              legendOffset: 36
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Funding (£M)',
              legendOffset: -50
            }}
            offsetType="silhouette"
            colors={(d) => getStreamColor(d.id, view)}
            fillOpacity={0.85}
            borderColor={{ theme: 'background' }}
            borderWidth={2}
            enableGridX={true}
            enableGridY={true}
            curve="natural"
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'column',
                translateX: 100,
                itemWidth: 80,
                itemHeight: 20,
                itemTextColor: '#999',
                symbolSize: 12,
                symbolShape: 'circle'
              }
            ]}
            tooltip={({ id, value, data }) => {
              // Find baseline value for comparison
              let baselineValue: number | null = null;
              if (baselineData && scenario === 'accelerated') {
                const year = data.year;
                const baselineYearData = baselineData.data.find((d: any) => d.year === year);
                if (baselineYearData && baselineYearData[id]) {
                  baselineValue = baselineYearData[id] as number;
                }
              }
              
              return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg min-w-[180px]">
                  <div className="font-semibold text-sm mb-1">{id}</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{scenario === 'accelerated' ? 'Accelerated:' : 'Baseline:'}</span>
                      <span className="font-medium">£{value.toFixed(1)}M</span>
                    </div>
                    {baselineValue !== null && (
                      <div className="flex justify-between pt-1 border-t border-gray-100">
                        <span className="text-gray-500">Baseline:</span>
                        <span className="text-gray-600">£{baselineValue.toFixed(1)}M</span>
                      </div>
                    )}
                    {baselineValue !== null && (
                      <div className="text-xs text-[#006E51] font-medium pt-1">
                        +£{(value - baselineValue).toFixed(1)}M vs baseline
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
            onClick={(data) => {
              if (onStreamClick) {
                onStreamClick(data.id, data);
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

