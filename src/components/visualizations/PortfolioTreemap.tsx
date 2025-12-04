'use client';

import React, { useMemo, useState, useEffect, ReactNode } from 'react';
import ReactECharts from 'echarts-for-react';
import focusAreasData from '@/data/cpc_domain/focus_areas.json';
import milestonesData from '@/data/cpc_domain/milestones.json';

// Try to import projects, but handle if it doesn't exist
let projectsData: { projects: any[] } = { projects: [] };
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  projectsData = require('@/data/cpc_domain/projects.json');
} catch {
  // Projects file doesn't exist yet, use empty array
  projectsData = { projects: [] };
}

interface FocusArea {
  id: string;
  name: string;
  mode: string;
  stage: string;
  strategic_themes: string[];
}

interface Project {
  id: string;
  name: string;
  mode: string | null;
  focus_area: string | null;
  strategic_themes: string | null;
  budget: number | null;
}

const MODE_COLORS: Record<string, string> = {
  'Aviation': '#E91E63',
  'Maritime': '#3F51B5',
  'Rail': '#009688',
  'Highways': '#FF5722',
  'HIT': '#9C27B0',
  'Integrated Transport': '#9C27B0'
};

type ViewType = 'by_mode' | 'by_stage' | 'by_theme';

type PortfolioTreemapProps = {
  showEmbeddedControls?: boolean;
  showEmbeddedInsights?: boolean;
  onControlsRender?: ((renderControls: (() => ReactNode) | null) => void) | null;
  onInsightsRender?: ((renderInsights: (() => ReactNode) | null) => void) | null;
};

export function PortfolioTreemap({
  showEmbeddedControls = true,
  showEmbeddedInsights = true,
  onControlsRender = null,
  onInsightsRender = null,
}: PortfolioTreemapProps = {}) {
  const [viewType, setViewType] = useState<ViewType>('by_mode');
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const focusAreas: FocusArea[] = focusAreasData.entities;
  const projects: Project[] = projectsData.projects || [];
  const milestones = milestonesData.milestones;

  const treemapData = useMemo(() => {
    if (viewType === 'by_mode') {
      // Mode → Focus Area → Projects
      const modes = ['Aviation', 'Maritime', 'Rail', 'Highways'];
      
      return modes.map(mode => {
        const modeFocusAreas = focusAreas.filter(fa => fa.mode === mode);
        const modeProjects = projects.filter(p => p.mode === mode);
        const modeMilestones = milestones.filter(m => m.mode === mode);
        
        return {
          name: mode,
          value: modeFocusAreas.length + modeProjects.length,
          itemStyle: { color: MODE_COLORS[mode] },
          children: modeFocusAreas.map(fa => {
            // Find projects matching this focus area
            const faProjects = modeProjects.filter(p => 
              p.focus_area?.toLowerCase().includes(fa.name.toLowerCase().split(' ')[0]) ||
              fa.name.toLowerCase().includes(p.focus_area?.toLowerCase().split(' ')[0] || 'xxx')
            );
            
            return {
              name: fa.name,
              value: Math.max(1, faProjects.length),
              itemStyle: { 
                color: MODE_COLORS[mode],
                opacity: fa.stage === 'Validation' ? 0.5 : fa.stage === 'Development' ? 0.75 : 1
              },
              data: { ...fa, projectCount: faProjects.length, entityType: 'focus_area' },
              children: faProjects.length > 0 ? faProjects.map(p => ({
                name: p.name,
                value: 1,
                data: { ...p, entityType: 'project' }
              })) : undefined
            };
          })
        };
      });
    }

    if (viewType === 'by_stage') {
      // Stage → Mode → Focus Areas
      const stages = ['Validation', 'Development', 'Commercialisation'];
      const stageColors = {
        'Validation': '#FFE082',
        'Development': '#81C784',
        'Commercialisation': '#64B5F6'
      };
      return stages.map(stage => {
        const stageFocusAreas = focusAreas.filter(fa => fa.stage === stage);
        
        // Group by mode
        const byMode: Record<string, FocusArea[]> = {};
        stageFocusAreas.forEach(fa => {
          if (!byMode[fa.mode]) byMode[fa.mode] = [];
          byMode[fa.mode].push(fa);
        });
        return {
          name: stage,
          value: stageFocusAreas.length,
          itemStyle: { color: stageColors[stage as keyof typeof stageColors] },
          children: Object.entries(byMode).map(([mode, fas]) => ({
            name: mode,
            value: fas.length,
            itemStyle: { color: MODE_COLORS[mode], opacity: 0.8 },
            children: fas.map(fa => ({
              name: fa.name,
              value: 1,
              data: { ...fa, entityType: 'focus_area' }
            }))
          }))
        };
      });
    }

    // by_theme
    const themes = ['Autonomy', 'People Experience', 'Hubs and Clusters', 
                    'Decarbonisation', 'Planning and Operation', 'Industry'];
    const themeColors = ['#E91E63', '#9C27B0', '#3F51B5', '#009688', '#FF9800', '#795548'];
    return themes.map((theme, i) => {
      const themeFocusAreas = focusAreas.filter(fa => 
        fa.strategic_themes.includes(theme)
      );
      // Group by mode
      const byMode: Record<string, FocusArea[]> = {};
      themeFocusAreas.forEach(fa => {
        if (!byMode[fa.mode]) byMode[fa.mode] = [];
        byMode[fa.mode].push(fa);
      });
      return {
        name: theme,
        value: themeFocusAreas.length,
        itemStyle: { color: themeColors[i] },
        children: Object.entries(byMode).map(([mode, fas]) => ({
          name: mode,
          value: fas.length,
          children: fas.map(fa => ({
            name: fa.name,
            value: 1,
            data: { ...fa, entityType: 'focus_area' }
          }))
        }))
      };
    });
  }, [viewType, focusAreas, projects, milestones]);

  const option = {
    tooltip: {
      formatter: (params: any) => {
        const d = params.data?.data;
        if (d?.entityType === 'focus_area') {
          return `<strong>${d.name}</strong><br/>
                  Mode: ${d.mode}<br/>
                  Stage: ${d.stage}<br/>
                  ${d.projectCount ? `Projects: ${d.projectCount}` : ''}`;
        }
        if (d?.entityType === 'project') {
          return `<strong>Project: ${d.name}</strong><br/>
                  ${d.budget ? `Budget: £${d.budget.toLocaleString()}` : ''}`;
        }
        return `<strong>${params.name}</strong><br/>Items: ${params.value}`;
      }
    },
    series: [{
      type: 'treemap',
      data: treemapData,
      width: '100%',
      height: '100%',
      roam: 'move',
      nodeClick: 'zoomToNode',
      breadcrumb: {
        show: true,
        top: 5
      },
      label: {
        show: true,
        formatter: '{b}',
        fontSize: 11
      },
      upperLabel: {
        show: true,
        height: 30,
        color: '#fff'
      },
      levels: [
        {
          itemStyle: {
            borderWidth: 3,
            borderColor: '#333',
            gapWidth: 3
          },
          upperLabel: { show: true }
        },
        {
          itemStyle: {
            borderWidth: 2,
            borderColor: '#666',
            gapWidth: 2
          },
          upperLabel: { show: true }
        },
        {
          itemStyle: {
            borderWidth: 1,
            borderColor: '#999',
            gapWidth: 1
          }
        }
      ]
    }]
  };

  const handleClick = (params: any) => {
    if (params.data?.data) {
      setSelectedNode(params.data);
    }
  };

  // Provide controls renderer to parent if requested
  useEffect(() => {
    if (onControlsRender) {
      onControlsRender(() => (
        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase text-slate-500 mb-2">View Type</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewType('by_mode')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewType === 'by_mode' 
                    ? 'bg-[#006E51] text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                By Mode
              </button>
              <button
                onClick={() => setViewType('by_stage')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewType === 'by_stage' 
                    ? 'bg-[#006E51] text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                By Stage
              </button>
              <button
                onClick={() => setViewType('by_theme')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewType === 'by_theme' 
                    ? 'bg-[#006E51] text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                By Theme
              </button>
            </div>
          </div>
        </div>
      ));
      return () => {
        onControlsRender(null);
      };
    }
  }, [onControlsRender, viewType]);

  // Provide insights renderer to parent if requested
  useEffect(() => {
    if (onInsightsRender) {
      onInsightsRender(() => {
        if (!selectedNode?.data) {
          return (
            <div className="text-sm text-gray-500">
              Click on any node in the treemap to view its details.
            </div>
          );
        }
        return (
          <div className="space-y-3">
            <div>
              <div className="text-xs uppercase text-slate-500 mb-1">Selected Node</div>
              <div className="text-base font-semibold text-slate-900">{selectedNode.name}</div>
            </div>
            {selectedNode.data.entityType === 'focus_area' && (
              <>
                <div>
                  <div className="text-xs font-medium text-slate-500">Mode</div>
                  <div className="text-sm text-slate-700">{selectedNode.data.mode}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Stage</div>
                  <div className="text-sm text-slate-700">{selectedNode.data.stage}</div>
                </div>
                {selectedNode.data.projectCount !== undefined && (
                  <div>
                    <div className="text-xs font-medium text-slate-500">Projects</div>
                    <div className="text-sm text-slate-700">{selectedNode.data.projectCount}</div>
                  </div>
                )}
                {selectedNode.data.strategic_themes && selectedNode.data.strategic_themes.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-slate-500">Strategic Themes</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNode.data.strategic_themes.map((theme: string, idx: number) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-700">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {selectedNode.data.entityType === 'project' && (
              <>
                {selectedNode.data.mode && (
                  <div>
                    <div className="text-xs font-medium text-slate-500">Mode</div>
                    <div className="text-sm text-slate-700">{selectedNode.data.mode}</div>
                  </div>
                )}
                {selectedNode.data.budget && (
                  <div>
                    <div className="text-xs font-medium text-slate-500">Budget</div>
                    <div className="text-sm text-slate-700">£{selectedNode.data.budget.toLocaleString()}</div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      });
      return () => {
        onInsightsRender(null);
      };
    }
  }, [onInsightsRender, selectedNode]);

  const usingExternalControls = Boolean(onControlsRender);
  const usingExternalInsights = Boolean(onInsightsRender);

  return (
    <div className={usingExternalControls || usingExternalInsights ? "w-full h-full" : "w-full"}>
      {!usingExternalControls && (
        <>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Portfolio Treemap</h2>
          <p className="text-sm text-gray-600 mb-4">
            Hierarchical view of CPC transport portfolio. Click to zoom, breadcrumb to navigate back.
          </p>

          {/* View selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewType('by_mode')}
              className={`px-4 py-2 rounded text-sm ${viewType === 'by_mode' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}
            >
              By Mode
            </button>
            <button
              onClick={() => setViewType('by_stage')}
              className={`px-4 py-2 rounded text-sm ${viewType === 'by_stage' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}
            >
              By Stage
            </button>
            <button
              onClick={() => setViewType('by_theme')}
              className={`px-4 py-2 rounded text-sm ${viewType === 'by_theme' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}
            >
              By Theme
            </button>
          </div>
        </>
      )}

      <div className={usingExternalControls || usingExternalInsights ? "w-full h-full" : "bg-white rounded-lg shadow p-4"}>
        <ReactECharts 
          option={option} 
          style={{ height: usingExternalControls || usingExternalInsights ? '100%' : '500px', width: '100%' }}
          onEvents={{ click: handleClick }}
        />
      </div>

      {/* Detail panel - only show if using embedded insights */}
      {showEmbeddedInsights && selectedNode?.data && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h3 className="font-bold">{selectedNode.name}</h3>
          <pre className="text-xs mt-2 bg-gray-50 p-2 rounded overflow-auto">
            {JSON.stringify(selectedNode.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default PortfolioTreemap;

