/**
 * SwarmPlotNavigate
 * 
 * NAVIGATE version of Swarm Plot showing TRL distribution
 * Shows distribution of technologies by TRL level and category
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ResponsiveSwarmPlot } from '@nivo/swarmplot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Technology, TechnologyCategory } from '@/lib/navigate-types';

interface SwarmPlotNavigateProps {
  technologies: Technology[];
  view?: 'by_trl' | 'by_category';
  onViewChange?: (view: 'by_trl' | 'by_category') => void;
  onNodeClick?: (techId: string) => void;
  className?: string;
}

type SwarmView = 'by_trl' | 'by_category';

// Get color for TRL level
function getTRLColor(trl: number): string {
  if (trl >= 7) return '#50C878'; // Green (mature)
  if (trl >= 4) return '#F5A623'; // Amber (developing)
  return '#EF4444'; // Red (early)
}

// Get color for technology category
function getCategoryColor(category: TechnologyCategory): string {
  const colors: Record<TechnologyCategory, string> = {
    'H2Production': '#006E51',      // CPC Primary Teal
    'H2Storage': '#50C878',        // CPC Success Green
    'FuelCells': '#F5A623',        // CPC Warning Amber
    'Aircraft': '#4A90E2',        // CPC Info Blue
    'Infrastructure': '#8b5cf6'    // Purple
  };
  return colors[category] || '#6b7280';
}

// Transform technologies to swarm plot data by TRL
function transformByTRL(technologies: Technology[]) {
  const trlGroups: Record<number, Technology[]> = {};
  
  technologies.forEach(tech => {
    const trl = tech.trl_current || 0;
    if (!trlGroups[trl]) {
      trlGroups[trl] = [];
    }
    trlGroups[trl].push(tech);
  });
  
  const data = Object.entries(trlGroups).map(([trl, techs]) => ({
    id: `TRL ${trl}`,
    group: `TRL ${trl}`,
    value: parseInt(trl),
    nodes: techs.map(tech => ({
      id: tech.id,
      name: tech.name,
      category: tech.category,
      trl: tech.trl_current || 0,
      funding: tech.total_funding || 0
    }))
  }));
  
  return data.sort((a, b) => a.value - b.value);
}

// Transform technologies to swarm plot data by category
function transformByCategory(technologies: Technology[]) {
  const categoryGroups: Record<TechnologyCategory, Technology[]> = {
    'H2Production': [],
    'H2Storage': [],
    'FuelCells': [],
    'Aircraft': [],
    'Infrastructure': []
  };
  
  technologies.forEach(tech => {
    if (categoryGroups[tech.category]) {
      categoryGroups[tech.category].push(tech);
    }
  });
  
  const data = Object.entries(categoryGroups)
    .filter(([_, techs]) => techs.length > 0)
    .map(([category, techs]) => ({
      id: category,
      group: category,
      value: techs.length,
      nodes: techs.map(tech => ({
        id: tech.id,
        name: tech.name,
        category: tech.category as TechnologyCategory,
        trl: tech.trl_current || 0,
        funding: tech.total_funding || 0
      }))
    }));
  
  return data;
}

export function SwarmPlotNavigate({
  technologies,
  view: externalView,
  onViewChange,
  onNodeClick,
  className = ''
}: SwarmPlotNavigateProps) {
  const [internalView, setInternalView] = useState<SwarmView>('by_trl');
  
  const view = externalView ?? internalView;
  const setView = onViewChange ?? setInternalView;
  
  // Transform data based on view
  const swarmData = useMemo(() => {
    if (view === 'by_trl') {
      return transformByTRL(technologies);
    } else {
      return transformByCategory(technologies);
    }
  }, [view, technologies]);
  
  if (swarmData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Technology Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            <p>No technology data available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Technology Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveSwarmPlot
            data={swarmData}
            groups={swarmData.map(d => d.group)}
            identity="id"
            value="value"
            valueFormat=".0f"
            size={10}
            spacing={6}
            layout="horizontal"
            gap={1}
            axisTop={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: view === 'by_trl' ? 'TRL Level' : 'Category',
              legendPosition: 'middle',
              legendOffset: -40
            }}
            axisRight={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Count',
              legendPosition: 'middle',
              legendOffset: 50
            }}
            axisBottom={null}
            axisLeft={null}
            colors={(node: any) => {
              if (!node || !node.data) return '#6b7280';
              if (view === 'by_trl') {
                return getTRLColor(node.data.trl || 0);
              } else {
                return getCategoryColor(node.data.category || 'H2Production');
              }
            }}
            borderColor={{
              from: 'color',
              modifiers: [['darker', 0.6]]
            }}
            margin={{ top: 60, right: 80, bottom: 40, left: 40 }}
            animate={true}
            motionConfig="gentle"
            tooltip={({ node }: any) => {
              if (!node || !node.id) return null;
              const tech = technologies.find(t => t.id === node.id);
              const nodeData = node.data || {};
              return (
                <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
                  <div className="font-semibold text-sm">{tech?.name || node.id || 'Unknown'}</div>
                  <div className="text-xs text-gray-600">
                    {view === 'by_trl' 
                      ? `TRL ${nodeData.trl || 'N/A'}` 
                      : `Category: ${nodeData.category || 'N/A'}`}
                  </div>
                  {tech?.total_funding && (
                    <div className="text-xs text-gray-600">
                      Funding: £{(tech.total_funding / 1000000).toFixed(1)}M
                    </div>
                  )}
                </div>
              );
            }}
            onClick={(node: any) => {
              if (onNodeClick && node?.id) {
                onNodeClick(node.id);
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

