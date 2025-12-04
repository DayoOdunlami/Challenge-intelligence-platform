'use client';

import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';

// Import your focus areas data
import focusAreasData from '@/data/cpc_domain/focus_areas.json';

interface FocusArea {
  id: string;
  name: string;
  mode: string;
  strategic_themes: string[];
  stage: string;
  description: string;
  key_technologies: string[];
  market_barriers: string[];
  cpc_services: string[];
}

const MODES = ['Aviation', 'Maritime', 'Rail', 'Highways'];

const THEMES = [
  'Autonomy',
  'People Experience', 
  'Hubs and Clusters',
  'Decarbonisation',
  'Planning and Operation',
  'Industry'
];

const STAGE_COLORS = {
  'Validation': '#FFE082',      // Amber
  'Development': '#81C784',     // Green
  'Commercialisation': '#64B5F6' // Blue
};

export function FocusAreaMatrix() {
  const [selectedCell, setSelectedCell] = useState<{mode: string, theme: string} | null>(null);
  const [hoveredFocusArea, setHoveredFocusArea] = useState<FocusArea | null>(null);
  const focusAreas: FocusArea[] = focusAreasData.entities;

  // Build matrix data for ECharts
  const { heatmapData, maxCount } = useMemo(() => {
    const data: number[][] = [];
    let max = 0;

    MODES.forEach((mode, modeIdx) => {
      THEMES.forEach((theme, themeIdx) => {
        const count = focusAreas.filter(fa => 
          fa.mode === mode && fa.strategic_themes.includes(theme)
        ).length;
        data.push([themeIdx, modeIdx, count]);
        if (count > max) max = count;
      });
    });

    return { heatmapData: data, maxCount: max };
  }, [focusAreas]);

  // Get focus areas for selected cell
  const selectedFocusAreas = useMemo(() => {
    if (!selectedCell) return [];

    return focusAreas.filter(fa =>
      fa.mode === selectedCell.mode && 
      fa.strategic_themes.includes(selectedCell.theme)
    );
  }, [selectedCell, focusAreas]);

  const option = {
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const mode = MODES[params.value[1]];
        const theme = THEMES[params.value[0]];
        const count = params.value[2];
        const areas = focusAreas
          .filter(fa => fa.mode === mode && fa.strategic_themes.includes(theme))
          .map(fa => fa.name);
        
        if (count === 0) return `${mode} × ${theme}<br/>No focus areas`;

        return `<strong>${mode} × ${theme}</strong><br/>
                ${count} focus area${count > 1 ? 's' : ''}:<br/>
                ${areas.map(a => `• ${a}`).join('<br/>')}`;
      }
    },
    grid: {
      top: '10%',
      left: '15%',
      right: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: THEMES,
      splitArea: { show: true },
      axisLabel: {
        rotate: 45,
        fontSize: 11,
        color: '#333'
      }
    },
    yAxis: {
      type: 'category',
      data: MODES,
      splitArea: { show: true },
      axisLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1a5c4c'
      }
    },
    visualMap: {
      min: 0,
      max: maxCount || 3,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#f5f5f5', '#b2dfdb', '#4db6ac', '#00897b', '#1a5c4c']
      }
    },
    series: [{
      name: 'Focus Areas',
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: true,
        formatter: (params: any) => params.value[2] || '',
        fontSize: 14,
        fontWeight: 'bold'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const handleClick = (params: any) => {
    if (params.value) {
      const mode = MODES[params.value[1]];
      const theme = THEMES[params.value[0]];
      setSelectedCell({ mode, theme });
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        CPC Transport Focus Areas Matrix
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Click on a cell to see focus area details. Color intensity shows concentration.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main heatmap */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <ReactECharts 
            option={option} 
            style={{ height: '400px' }}
            onEvents={{ click: handleClick }}
          />
        </div>

        {/* Detail panel */}
        <div className="bg-white rounded-lg shadow p-4">
          {selectedCell ? (
            <div>
              <h3 className="font-bold text-lg text-teal-700 mb-2">
                {selectedCell.mode} × {selectedCell.theme}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {selectedFocusAreas.length} focus area{selectedFocusAreas.length !== 1 ? 's' : ''}
              </p>
              
              <div className="space-y-3">
                {selectedFocusAreas.map(fa => (
                  <div 
                    key={fa.id}
                    className="p-3 bg-gray-50 rounded-lg border-l-4 hover:bg-gray-100 cursor-pointer"
                    style={{ borderColor: STAGE_COLORS[fa.stage as keyof typeof STAGE_COLORS] || '#ccc' }}
                    onMouseEnter={() => setHoveredFocusArea(fa)}
                    onMouseLeave={() => setHoveredFocusArea(null)}
                  >
                    <div className="font-medium text-sm">{fa.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Stage: <span className="font-medium">{fa.stage}</span>
                    </div>
                    {hoveredFocusArea?.id === fa.id && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p className="mb-1">{fa.description.slice(0, 150)}...</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {fa.key_technologies.slice(0, 3).map(tech => (
                            <span key={tech} className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              Click a cell to see focus areas
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <span className="font-medium text-gray-600">Stage:</span>
        {Object.entries(STAGE_COLORS).map(([stage, color]) => (
          <div key={stage} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
            <span>{stage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FocusAreaMatrix;

