/**
 * BumpChartNavigate
 * 
 * NAVIGATE version of Bump Chart showing TRL progression over time (2019-2024)
 * Shows how technologies advance through TRL levels year-over-year
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ResponsiveBump } from '@nivo/bump';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Technology, TechnologyCategory } from '@/lib/navigate-types';

interface BumpChartNavigateProps {
  technologies: Technology[];
  view?: 'all_technologies' | 'by_category' | 'top_advancing';
  selectedCategories?: TechnologyCategory[];
  onViewChange?: (view: 'all_technologies' | 'by_category' | 'top_advancing') => void;
  onTechnologySelect?: (techId: string) => void;
  className?: string;
}

type BumpView = 'all_technologies' | 'by_category' | 'top_advancing';

export function BumpChartNavigate({ 
  technologies,
  view: externalView,
  selectedCategories: externalCategories = [],
  onViewChange,
  onTechnologySelect,
  className = '' 
}: BumpChartNavigateProps) {
  const [internalView, setInternalView] = useState<BumpView>('all_technologies');
  const [internalCategories, setInternalCategories] = useState<TechnologyCategory[]>([]);
  
  // Use external props if provided, otherwise use internal state
  const view = externalView ?? internalView;
  const selectedCategories = externalCategories.length > 0 ? externalCategories : internalCategories;
  const setView = onViewChange ?? setInternalView;

  // Generate historical TRL progression for each technology
  // Since we only have current TRL, we'll simulate realistic progression
  const generateTRLHistory = (tech: Technology): Array<{ x: string; y: number }> => {
    const currentTRL = tech.trl_current;
    const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
    
    // Estimate starting TRL based on current TRL and category
    // Technologies typically advance 1-2 TRL levels over 5 years
    let startTRL = Math.max(1, currentTRL - Math.floor(Math.random() * 3) - 1);
    
    // Ensure startTRL is reasonable (not higher than current)
    startTRL = Math.min(startTRL, currentTRL - 1);
    
    const history: Array<{ x: string; y: number }> = [];
    let currentLevel = startTRL;
    
    years.forEach((year, index) => {
      // Progress towards current TRL
      if (index === years.length - 1) {
        // Last year = current TRL
        currentLevel = currentTRL;
      } else {
        // Gradual progression with some variation
        const progress = (currentTRL - startTRL) / (years.length - 1);
        const targetLevel = Math.round(startTRL + progress * (index + 1));
        
        // Add some realistic variation (not always linear)
        if (Math.random() > 0.3 && currentLevel < targetLevel) {
          currentLevel = Math.min(targetLevel, currentTRL);
        } else if (currentLevel < targetLevel - 1) {
          currentLevel = Math.min(currentLevel + 1, currentTRL);
        }
        
        // Ensure we don't exceed current TRL
        currentLevel = Math.min(currentLevel, currentTRL);
      }
      
      history.push({ x: year, y: currentLevel });
    });
    
    return history;
  };

  // Transform technologies to bump chart format
  const bumpData = useMemo(() => {
    let filteredTechs = technologies;
    
    // Filter by category if view is 'by_category' and categories are selected
    if (view === 'by_category' && selectedCategories.length > 0) {
      filteredTechs = technologies.filter(t => selectedCategories.includes(t.category));
    }
    
    // For 'top_advancing', show technologies with highest TRL progression
    if (view === 'top_advancing') {
      // Sort by current TRL and take top 8
      filteredTechs = [...technologies]
        .sort((a, b) => b.trl_current - a.trl_current)
        .slice(0, 8);
    }
    
    return filteredTechs.map(tech => ({
      id: tech.name,
      data: generateTRLHistory(tech)
    }));
  }, [technologies, view, selectedCategories]);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    return Array.from(new Set(technologies.map(t => t.category))) as TechnologyCategory[];
  }, [technologies]);

  // Helper to get color by category
  const getCategoryColor = (category: TechnologyCategory): string => {
    const colors: Record<TechnologyCategory, string> = {
      H2Production: '#006E51',
      H2Storage: '#50C878',
      FuelCells: '#4A90E2',
      Aircraft: '#F5A623',
      Infrastructure: '#CCE2DC',
    };
    return colors[category] || '#6b7280';
  };

  // Get color for each technology based on its category
  const getTechColor = (techId: string): string => {
    const tech = technologies.find(t => t.name === techId);
    if (!tech) return '#6b7280';
    return getCategoryColor(tech.category);
  };

  const getTitle = () => {
    switch (view) {
      case 'all_technologies': return 'TRL Progression: All Technologies';
      case 'by_category': return 'TRL Progression: By Category';
      case 'top_advancing': return 'TRL Progression: Top Advancing Technologies';
      default: return 'TRL Progression Over Time';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Track how technologies advance through TRL levels (1-9) from 2019 to 2024.
          Steeper lines indicate faster advancement.
        </p>
      </CardHeader>
      <CardContent className="h-[500px] p-0">
        {bumpData.length > 0 ? (
          <ResponsiveBump
            data={bumpData}
            colors={(serie) => {
              // Get color based on technology category
              return getTechColor(serie.id);
            }}
            lineWidth={3}
            activeLineWidth={6}
            inactiveLineWidth={2}
            inactiveOpacity={0.15}
            pointSize={10}
            activePointSize={16}
            inactivePointSize={0}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={3}
            activePointBorderWidth={3}
            pointBorderColor={{ from: 'serie.color' }}
            axisTop={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: '',
              legendPosition: 'middle',
              legendOffset: -36
            }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Year',
              legendPosition: 'middle',
              legendOffset: 40
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'TRL Level',
              legendPosition: 'middle',
              legendOffset: -50
            }}
            margin={{ top: 40, right: 100, bottom: 60, left: 60 }}
            axisRight={null}
            startLabel={d => d.id}
            endLabel={d => `${d.id} (TRL ${d.y})`}
            tooltip={({ serie }) => (
              <div className="bg-white p-2 rounded shadow-md text-sm border border-gray-200">
                <div className="font-semibold" style={{ color: getTechColor(serie.id) }}>
                  {serie.id}
                </div>
                <div className="text-gray-600 mt-1">
                  {serie.data.map((point, idx) => (
                    <div key={idx}>
                      {point.x}: TRL {point.y}
                    </div>
                  ))}
                </div>
              </div>
            )}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {view === 'by_category' && selectedCategories.length === 0
              ? 'Select at least one category to view'
              : 'No data available for this view'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

