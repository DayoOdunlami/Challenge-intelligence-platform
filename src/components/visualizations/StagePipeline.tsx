'use client';

import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';

// Import data
import focusAreasData from '@/data/cpc_domain/focus_areas.json';
import milestonesData from '@/data/cpc_domain/milestones.json';
import stageFramework from '@/data/cpc_domain/stage_framework.json';

interface FocusArea {
  id: string;
  name: string;
  mode: string;
  stage: string;
  strategic_themes: string[];
  description: string;
}

interface Milestone {
  id: string;
  activity: string;
  mode: string;
  stage: string;
  assessment: string;
  year: string;
  customer_status: string;
}

const STAGES = ['Validation', 'Development', 'Commercialisation'];

const STAGE_CONFIG = {
  'Validation': {
    color: '#FFF3E0',
    borderColor: '#FF9800',
    icon: '🔍',
    description: 'Building the evidence case'
  },
  'Development': {
    color: '#E8F5E9',
    borderColor: '#4CAF50', 
    icon: '🛠️',
    description: 'Creating tangible assets'
  },
  'Commercialisation': {
    color: '#E3F2FD',
    borderColor: '#2196F3',
    icon: '💰',
    description: 'Generating revenue & impact'
  }
};

const MODE_COLORS: Record<string, string> = {
  'Aviation': '#E91E63',
  'Maritime': '#3F51B5',
  'Rail': '#009688',
  'Highways': '#FF5722',
  'Integrated Transport': '#9C27B0'
};

const ASSESSMENT_BADGES: Record<string, { color: string, bg: string }> = {
  'Increase': { color: '#2E7D32', bg: '#C8E6C9' },
  'Continue': { color: '#1565C0', bg: '#BBDEFB' },
  'Re-assess': { color: '#E65100', bg: '#FFE0B2' }
};

export function StagePipeline() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [viewType, setViewType] = useState<'focus_areas' | 'milestones'>('focus_areas');

  const focusAreas: FocusArea[] = focusAreasData.entities;
  const milestones: Milestone[] = milestonesData.milestones;
  const stages = stageFramework.stages;

  // Group data by stage
  const stageData = useMemo(() => {
    return STAGES.map(stageName => {
      const stageFocusAreas = focusAreas.filter(fa => 
        fa.stage === stageName && 
        (filterMode === 'all' || fa.mode === filterMode)
      );

      const stageMilestones = milestones.filter(ms => 
        ms.stage === stageName &&
        (filterMode === 'all' || ms.mode === filterMode)
      );

      const stageInfo = stages.find((s: any) => s.name === stageName);

      return {
        name: stageName,
        focusAreas: stageFocusAreas,
        milestones: stageMilestones,
        info: stageInfo,
        config: STAGE_CONFIG[stageName as keyof typeof STAGE_CONFIG]
      };
    });
  }, [focusAreas, milestones, stages, filterMode]);

  // Sankey data for flow visualization
  const sankeyOption = useMemo(() => {
    const nodes = [
      ...STAGES.map(s => ({ name: s })),
      ...['Aviation', 'Maritime', 'Rail', 'Highways'].map(m => ({ name: m }))
    ];

    const links: { source: string, target: string, value: number }[] = [];
    
    ['Aviation', 'Maritime', 'Rail', 'Highways'].forEach(mode => {
      STAGES.forEach(stage => {
        const count = focusAreas.filter(fa => fa.mode === mode && fa.stage === stage).length;
        if (count > 0) {
          links.push({ source: mode, target: stage, value: count });
        }
      });
    });

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} focus areas'
      },
      series: [{
        type: 'sankey',
        layout: 'none',
        emphasis: { focus: 'adjacency' },
        data: nodes,
        links: links,
        lineStyle: {
          color: 'gradient',
          curveness: 0.5
        },
        itemStyle: {
          color: (params: any) => {
            if (MODE_COLORS[params.name]) return MODE_COLORS[params.name];
            const stageConfig = STAGE_CONFIG[params.name as keyof typeof STAGE_CONFIG];
            return stageConfig?.borderColor || '#999';
          }
        },
        label: {
          position: 'right',
          fontSize: 12
        }
      }]
    };
  }, [focusAreas]);

  const modes = ['all', 'Aviation', 'Maritime', 'Rail', 'Highways'];

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        CPC Stage Pipeline
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Track focus areas and milestones through maturity stages
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Filter by mode:</span>
          <select 
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-sm"
          >
            {modes.map(m => (
              <option key={m} value={m}>{m === 'all' ? 'All Modes' : m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">View:</span>
          <div className="flex rounded-md overflow-hidden border">
            <button
              className={`px-3 py-1.5 text-sm ${viewType === 'focus_areas' ? 'bg-teal-600 text-white' : 'bg-white'}`}
              onClick={() => setViewType('focus_areas')}
            >
              Focus Areas
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${viewType === 'milestones' ? 'bg-teal-600 text-white' : 'bg-white'}`}
              onClick={() => setViewType('milestones')}
            >
              Milestones
            </button>
          </div>
        </div>
      </div>

      {/* Sankey Flow Diagram */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-medium text-gray-700 mb-2">Mode → Stage Flow</h3>
        <ReactECharts option={sankeyOption} style={{ height: '200px' }} />
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stageData.map(stage => (
          <div 
            key={stage.name}
            className="rounded-lg border-2 overflow-hidden"
            style={{ 
              backgroundColor: stage.config.color,
              borderColor: stage.config.borderColor
            }}
          >
            {/* Stage Header */}
            <div 
              className="p-4 cursor-pointer"
              style={{ backgroundColor: stage.config.borderColor }}
              onClick={() => setSelectedStage(selectedStage === stage.name ? null : stage.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{stage.config.icon}</span>
                  <div>
                    <h3 className="font-bold text-white">{stage.name}</h3>
                    <p className="text-xs text-white/80">{stage.config.description}</p>
                  </div>
                </div>
                <div className="text-right text-white">
                  <div className="text-2xl font-bold">
                    {viewType === 'focus_areas' ? stage.focusAreas.length : stage.milestones.length}
                  </div>
                  <div className="text-xs">{viewType === 'focus_areas' ? 'Focus Areas' : 'Milestones'}</div>
                </div>
              </div>
            </div>

            {/* Stage Content */}
            <div className="p-3 max-h-96 overflow-y-auto">
              {viewType === 'focus_areas' ? (
                <div className="space-y-2">
                  {stage.focusAreas.map(fa => (
                    <div 
                      key={fa.id}
                      className="p-3 bg-white rounded-lg shadow-sm border-l-4"
                      style={{ borderColor: MODE_COLORS[fa.mode] || '#999' }}
                    >
                      <div className="font-medium text-sm text-gray-800">{fa.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: MODE_COLORS[fa.mode] + '20', color: MODE_COLORS[fa.mode] }}
                        >
                          {fa.mode}
                        </span>
                      </div>
                    </div>
                  ))}
                  {stage.focusAreas.length === 0 && (
                    <div className="text-sm text-gray-400 text-center py-4">
                      No focus areas in this stage
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {stage.milestones.map(ms => (
                    <div 
                      key={ms.id}
                      className="p-3 bg-white rounded-lg shadow-sm border-l-4"
                      style={{ borderColor: MODE_COLORS[ms.mode] || '#999' }}
                    >
                      <div className="font-medium text-sm text-gray-800">{ms.activity}</div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span 
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: MODE_COLORS[ms.mode] + '20', color: MODE_COLORS[ms.mode] }}
                        >
                          {ms.mode}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {ms.year}
                        </span>
                        {ms.assessment && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded font-medium"
                            style={{ 
                              backgroundColor: ASSESSMENT_BADGES[ms.assessment]?.bg,
                              color: ASSESSMENT_BADGES[ms.assessment]?.color
                            }}
                          >
                            {ms.assessment}
                          </span>
                        )}
                      </div>
                      {ms.customer_status && (
                        <div className="text-xs text-gray-500 mt-1">
                          Customer: {ms.customer_status}
                        </div>
                      )}
                    </div>
                  ))}
                  {stage.milestones.length === 0 && (
                    <div className="text-sm text-gray-400 text-center py-4">
                      No milestones in this stage
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stage Info (expandable) */}
            {selectedStage === stage.name && stage.info && (
              <div className="p-4 bg-white/50 border-t">
                <h4 className="font-medium text-sm mb-2">Stage Purpose</h4>
                <p className="text-xs text-gray-600 mb-3">{stage.info.purpose}</p>
                
                <h4 className="font-medium text-sm mb-2">Typical Outputs</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {stage.info.typical_outputs?.slice(0, 3).map((output: string, i: number) => (
                    <li key={i}>• {output}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(MODE_COLORS).slice(0, 4).map(([mode, color]) => {
          const count = focusAreas.filter(fa => fa.mode === mode).length;
          return (
            <div key={mode} className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderColor: color }}>
              <div className="text-2xl font-bold" style={{ color }}>{count}</div>
              <div className="text-sm text-gray-600">{mode}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StagePipeline;

