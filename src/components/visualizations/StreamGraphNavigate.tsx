/**
 * StreamGraphNavigate
 * 
 * NAVIGATE version of Stream Graph showing funding trends over time
 * Shows cumulative funding flows by category (stakeholder type, technology category, funding type)
 */

'use client';

import React, { useMemo } from 'react';
import { ResponsiveStream } from '@nivo/stream';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FundingEvent, TechnologyCategory, StakeholderType, FundingType } from '@/lib/navigate-types';

interface StreamGraphNavigateProps {
  fundingEvents: FundingEvent[];
  stakeholders: Array<{ id: string; type: StakeholderType }>;
  technologies: Array<{ id: string; category: TechnologyCategory }>;
  view?: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type';
  onViewChange?: (view: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type') => void;
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

// Transform funding events to stream data by stakeholder type
function transformByStakeholderType(
  fundingEvents: FundingEvent[],
  stakeholders: Array<{ id: string; type: StakeholderType }>
) {
  const stakeholderMap = new Map(stakeholders.map(s => [s.id, s.type]));
  
  // Get years from funding events
  const years = Array.from(new Set(
    fundingEvents.map(e => new Date(e.date).getFullYear())
  )).sort();
  
  const types: StakeholderType[] = ['Government', 'Research', 'Industry', 'Intermediary'];
  
  // Aggregate funding by type and year
  const data: Array<Record<string, number | string>> = [];
  
  years.forEach(year => {
    const yearData: Record<string, number | string> = { year: year.toString() };
    
    types.forEach(type => {
      const amount = fundingEvents
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
  technologies: Array<{ id: string; category: TechnologyCategory }>
) {
  const techMap = new Map(technologies.map(t => [t.id, t.category]));
  
  const years = Array.from(new Set(
    fundingEvents.map(e => new Date(e.date).getFullYear())
  )).sort();
  
  const categories: TechnologyCategory[] = ['H2Production', 'H2Storage', 'FuelCells', 'Aircraft', 'Infrastructure'];
  
  const data: Array<Record<string, number | string>> = [];
  
  years.forEach(year => {
    const yearData: Record<string, number | string> = { year: year.toString() };
    
    categories.forEach(category => {
      const amount = fundingEvents
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
function transformByFundingType(fundingEvents: FundingEvent[]) {
  const years = Array.from(new Set(
    fundingEvents.map(e => new Date(e.date).getFullYear())
  )).sort();
  
  const types: FundingType[] = ['Public', 'Private', 'Mixed'];
  
  const data: Array<Record<string, number | string>> = [];
  
  years.forEach(year => {
    const yearData: Record<string, number | string> = { year: year.toString() };
    
    types.forEach(type => {
      const amount = fundingEvents
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
  onStreamClick,
  className = ''
}: StreamGraphNavigateProps) {
  const [internalView, setInternalView] = React.useState<StreamView>('by_stakeholder_type');
  
  const view = externalView ?? internalView;
  const setView = onViewChange ?? setInternalView;
  
  // Transform data based on view
  const streamData = useMemo(() => {
    if (view === 'by_stakeholder_type') {
      return transformByStakeholderType(fundingEvents, stakeholders);
    } else if (view === 'by_tech_category') {
      return transformByTechCategory(fundingEvents, technologies);
    } else {
      return transformByFundingType(fundingEvents);
    }
  }, [view, fundingEvents, stakeholders, technologies]);
  
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
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Funding Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
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
            tooltip={({ id, value }) => (
              <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
                <div className="font-semibold text-sm">{id}</div>
                <div className="text-xs text-gray-600">£{value.toFixed(1)}M</div>
              </div>
            )}
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

