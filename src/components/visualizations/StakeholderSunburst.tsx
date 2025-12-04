'use client';

import React, { useMemo, useState, useEffect, ReactNode } from 'react';
import ReactECharts from 'echarts-for-react';
import stakeholdersData from '@/data/cpc_domain/stakeholders.json';
import focusAreasData from '@/data/cpc_domain/focus_areas.json';
import { unifiedEntities, unifiedRelationships, getEntity, getRelationshipsForEntity } from '@/data/unified';
import type { BaseEntity } from '@/lib/base-entity';

const TYPE_COLORS: Record<string, string> = {
  'Government Agency': '#1976D2',
  'Government department': '#1565C0',
  'Regulator': '#C62828',
  'Network owner and manager': '#2E7D32',
  'Transport Authority': '#7B1FA2',
  'Local & Regional': '#6A1B9A',
  'Industry': '#F57C00',
  'Research & Innovation': '#00838F',
  'Innovation Organisations': '#00796B',
  'Professional Institutions': '#5D4037',
  'Other': '#757575'
};

const MODE_COLORS: Record<string, string> = {
  'Aviation': '#E91E63',
  'Maritime': '#3F51B5',
  'Rail': '#009688',
  'Highways': '#FF5722',
  'Integrated Transport': '#9C27B0'
};

type ViewType = 'by_type' | 'by_mode' | 'by_theme';

type StakeholderSunburstProps = {
  showEmbeddedControls?: boolean;
  showEmbeddedInsights?: boolean;
  onControlsRender?: ((renderControls: (() => ReactNode) | null) => void) | null;
  onInsightsRender?: ((renderInsights: (() => ReactNode) | null) => void) | null;
};

interface SegmentInsights {
  type: 'stakeholder' | 'parent';
  name: string;
  stakeholder?: any;
  parentStats?: {
    totalCount: number;
    breakdown: Array<{ label: string; count: number; percentage: number }>;
    raciDistribution?: Array<{ role: string; count: number }>;
    focusAreas?: Array<{ area: string; count: number }>;
  };
  relationships?: Array<{
    target: BaseEntity;
    relationship: any;
    type: string;
  }>;
}

export function StakeholderSunburst({
  showEmbeddedControls = true,
  showEmbeddedInsights = true,
  onControlsRender = null,
  onInsightsRender = null,
}: StakeholderSunburstProps = {} as StakeholderSunburstProps) {
  const [viewType, setViewType] = useState<ViewType>('by_type');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [segmentInsights, setSegmentInsights] = useState<SegmentInsights | null>(null);

  const stakeholders = stakeholdersData.stakeholders || [];
  const focusAreas = focusAreasData.entities;

  // Helper to collect all stakeholders under a node
  const collectStakeholders = (node: any): any[] => {
    if (node.data) {
      return [node.data];
    }
    if (node.children) {
      return node.children.flatMap((child: any) => collectStakeholders(child));
    }
    return [];
  };

  // Generate insights for selected segment
  const generateInsights = useMemo(() => {
    if (!selectedNode) return null;

    const insights: SegmentInsights = {
      type: selectedNode.data ? 'stakeholder' : 'parent',
      name: selectedNode.name,
    };

    if (selectedNode.data) {
      // Individual stakeholder selected
      insights.stakeholder = selectedNode.data;
      
      // Try to find this stakeholder in unified data by name matching
      const unifiedStakeholder = unifiedEntities.find(
        (e) => e.entityType === 'stakeholder' && 
               (e.name === selectedNode.data.name || 
                e.id === selectedNode.data.id)
      );

      if (unifiedStakeholder) {
        const relationships = getRelationshipsForEntity(unifiedStakeholder.id);
        insights.relationships = relationships
          .slice(0, 10) // Limit to 10 most relevant
          .map(rel => {
            const targetId = rel.source === unifiedStakeholder.id ? rel.target : rel.source;
            const target = getEntity(targetId);
            return {
              target: target!,
              relationship: rel,
              type: rel.type,
            };
          })
          .filter(item => item.target !== null);
      }
    } else {
      // Parent segment selected - show statistics
      const allStakeholders = collectStakeholders(selectedNode);
      
      const breakdown: Array<{ label: string; count: number; percentage: number }> = [];
      const totalCount = allStakeholders.length;
      
      if (viewType === 'by_type') {
        // Show mode breakdown
        const modeCounts: Record<string, number> = {};
        allStakeholders.forEach((s: any) => {
          const mode = s.mode || 'Unknown';
          modeCounts[mode] = (modeCounts[mode] || 0) + 1;
        });
        Object.entries(modeCounts).forEach(([mode, count]) => {
          breakdown.push({
            label: mode,
            count,
            percentage: Math.round((count / totalCount) * 100),
          });
        });
      } else if (viewType === 'by_mode') {
        // Show type breakdown
        const typeCounts: Record<string, number> = {};
        allStakeholders.forEach((s: any) => {
          const type = s.type || 'Other';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        Object.entries(typeCounts).forEach(([type, count]) => {
          breakdown.push({
            label: type,
            count,
            percentage: Math.round((count / totalCount) * 100),
          });
        });
      } else if (viewType === 'by_theme') {
        // Show mode and type breakdowns
        const modeCounts: Record<string, number> = {};
        const typeCounts: Record<string, number> = {};
        allStakeholders.forEach((s: any) => {
          const mode = s.mode || 'Unknown';
          const type = s.type || 'Other';
          modeCounts[mode] = (modeCounts[mode] || 0) + 1;
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        Object.entries(modeCounts).forEach(([mode, count]) => {
          breakdown.push({
            label: mode,
            count,
            percentage: Math.round((count / totalCount) * 100),
          });
        });
      }

      // RACI distribution
      const raciCounts: Record<string, number> = {};
      allStakeholders.forEach((s: any) => {
        if (s.raci) {
          raciCounts[s.raci] = (raciCounts[s.raci] || 0) + 1;
        }
      });

      // Focus areas
      const focusAreaCounts: Record<string, number> = {};
      allStakeholders.forEach((s: any) => {
        if (s.focus_area) {
          focusAreaCounts[s.focus_area] = (focusAreaCounts[s.focus_area] || 0) + 1;
        }
      });

      insights.parentStats = {
        totalCount,
        breakdown: breakdown.sort((a, b) => b.count - a.count),
        raciDistribution: Object.entries(raciCounts).map(([role, count]) => ({
          role,
          count,
        })),
        focusAreas: Object.entries(focusAreaCounts)
          .slice(0, 5)
          .map(([area, count]) => ({
            area,
            count,
          })),
      };
    }

    return insights;
  }, [selectedNode, viewType]);

  useEffect(() => {
    setSegmentInsights(generateInsights);
  }, [generateInsights]);

  const sunburstData = useMemo(() => {
    if (viewType === 'by_type') {
      // Type → Mode → Stakeholders
      const byType: Record<string, any[]> = {};
      
      stakeholders.forEach(s => {
        const type = s.type || 'Other';
        if (!byType[type]) byType[type] = [];
        byType[type].push(s);
      });

      return Object.entries(byType).map(([type, shs]) => {
        // Group by mode within type
        const byMode: Record<string, any[]> = {};
        shs.forEach(s => {
          const mode = s.mode?.trim() || 'Unknown';
          if (!byMode[mode]) byMode[mode] = [];
          byMode[mode].push(s);
        });

        return {
          name: type,
          value: shs.length,
          itemStyle: { color: TYPE_COLORS[type] || '#999' },
          children: Object.entries(byMode).map(([mode, modeShs]) => ({
            name: mode,
            value: modeShs.length,
            itemStyle: { color: MODE_COLORS[mode] || '#ccc' },
            children: modeShs.map(s => ({
              name: s.name,
              value: 1,
              data: s
            }))
          }))
        };
      });
    }

    if (viewType === 'by_mode') {
      // Mode → Type → Stakeholders
      const byMode: Record<string, any[]> = {};
      
      stakeholders.forEach(s => {
        const mode = s.mode?.trim() || 'Unknown';
        if (!byMode[mode]) byMode[mode] = [];
        byMode[mode].push(s);
      });

      return Object.entries(byMode).map(([mode, shs]) => {
        // Group by type within mode
        const byType: Record<string, any[]> = {};
        shs.forEach(s => {
          const type = s.type || 'Other';
          if (!byType[type]) byType[type] = [];
          byType[type].push(s);
        });

        return {
          name: mode,
          value: shs.length,
          itemStyle: { color: MODE_COLORS[mode] || '#999' },
          children: Object.entries(byType).map(([type, typeShs]) => ({
            name: type,
            value: typeShs.length,
            itemStyle: { color: TYPE_COLORS[type] || '#ccc' },
            children: typeShs.map(s => ({
              name: s.name,
              value: 1,
              data: s
            }))
          }))
        };
      });
    }

    // by_theme - Strategic Theme → Mode → Stakeholders
    const themes = ['Autonomy', 'People Experience', 'Hubs and Clusters',
                    'Decarbonisation', 'Planning and Operation', 'Industry'];
    const themeColors = ['#E91E63', '#9C27B0', '#3F51B5', '#009688', '#FF9800', '#795548'];

    return themes.map((theme, i) => {
      const themeShs = stakeholders.filter(s => s.strategic_theme === theme);
      
      // Group by mode
      const byMode: Record<string, any[]> = {};
      themeShs.forEach(s => {
        const mode = s.mode?.trim() || 'Unknown';
        if (!byMode[mode]) byMode[mode] = [];
        byMode[mode].push(s);
      });

      return {
        name: theme,
        value: themeShs.length || 1,
        itemStyle: { color: themeColors[i] },
        children: Object.entries(byMode).map(([mode, modeShs]) => ({
          name: mode,
          value: modeShs.length,
          itemStyle: { color: MODE_COLORS[mode] || '#ccc' },
          children: modeShs.map(s => ({
            name: s.name,
            value: 1,
            data: s
          }))
        }))
      };
    });
  }, [viewType, stakeholders]);

  const option = useMemo(() => ({
    tooltip: {
      formatter: (params: any) => {
        const d = params.data?.data;
        if (d) {
          return `<strong>${d.name}</strong><br/>
                  Type: ${d.type}<br/>
                  Mode: ${d.mode}<br/>
                  ${d.raci ? `RACI: ${d.raci}<br/>` : ''}
                  ${d.strategic_theme ? `Theme: ${d.strategic_theme}<br/>` : ''}
                  ${d.focus_area ? `Focus Area: ${d.focus_area}` : ''}`;
        }
        const count = params.value;
        const name = params.name;
        return `<strong>${name}</strong><br/>Count: ${count} stakeholder${count !== 1 ? 's' : ''}`;
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ccc',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 12
      }
    },
    series: [{
      type: 'sunburst',
      data: sunburstData,
      radius: [0, '90%'],
      sort: undefined,
      emphasis: {
        focus: 'ancestor',
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        rotate: 'radial', // Better text placement - follows the curve
        minAngle: 5, // Only show labels for segments wider than 5 degrees
      },
      levels: [
        {},
        {
          r0: '10%',
          r: '35%',
          itemStyle: { 
            borderWidth: 2,
            borderColor: '#fff'
          },
          label: { 
            rotate: 'radial',
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        {
          r0: '35%',
          r: '65%',
          itemStyle: { 
            borderWidth: 1.5,
            borderColor: '#fff'
          },
          label: { 
            rotate: 'radial',
            fontSize: 11
          }
        },
        {
          r0: '65%',
          r: '90%',
          label: { 
            rotate: 'radial',
            position: 'outside',
            fontSize: 9,
            minAngle: 8, // Larger segments only for outer ring
            formatter: (params: any) => {
              // Truncate long names
              const name = params.name;
              return name.length > 20 ? name.substring(0, 17) + '...' : name;
            }
          },
          itemStyle: { 
            borderWidth: 1,
            borderColor: '#fff'
          }
        }
      ]
    }]
  }), [sunburstData]);

  const handleClick = (params: any) => {
    setSelectedNode(params.data);
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
                onClick={() => setViewType('by_type')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewType === 'by_type' 
                    ? 'bg-[#006E51] text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                By Type
              </button>
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
          <div className="pt-3 border-t border-slate-200">
            <div className="text-xs uppercase text-slate-500 mb-2">Legend</div>
            <div className="space-y-2">
              <div>
                <div className="text-xs font-medium text-slate-700 mb-1">Stakeholder Types</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Object.entries(TYPE_COLORS).slice(0, 5).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded" style={{ backgroundColor: color }}></div>
                      <span className="text-slate-600">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-700 mb-1">Transport Modes</div>
                <div className="space-y-1">
                  {Object.entries(MODE_COLORS).map(([mode, color]) => (
                    <div key={mode} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded" style={{ backgroundColor: color }}></div>
                      <span className="text-slate-600">{mode}</span>
                    </div>
                  ))}
                </div>
              </div>
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
        if (!segmentInsights) {
          return (
            <div className="space-y-3">
              <div className="text-sm text-gray-500">
                Click on any segment in the sunburst to view stakeholder details or statistics.
              </div>
              <div className="pt-3 border-t border-slate-200">
                <div className="text-xs uppercase text-slate-500 mb-2">Stakeholder Types</div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {Object.entries(TYPE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded" style={{ backgroundColor: color }}></div>
                      <span className="text-slate-600">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // Individual stakeholder selected
        if (segmentInsights.type === 'stakeholder' && segmentInsights.stakeholder) {
          const sh = segmentInsights.stakeholder;
          return (
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div>
                <div className="text-xs uppercase text-slate-500 mb-1">Selected Stakeholder</div>
                <div className="text-base font-semibold text-slate-900">{segmentInsights.name}</div>
              </div>
              
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div>
                  <div className="text-xs font-medium text-slate-500">Type</div>
                  <div className="text-sm text-slate-700">{sh.type || 'N/A'}</div>
                </div>
                {sh.mode && (
                  <div>
                    <div className="text-xs font-medium text-slate-500">Mode</div>
                    <div className="text-sm text-slate-700">{sh.mode}</div>
                  </div>
                )}
                {sh.raci && (
                  <div>
                    <div className="text-xs font-medium text-slate-500">RACI Role</div>
                    <div className="text-sm text-slate-700">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {sh.raci}
                      </span>
                    </div>
                  </div>
                )}
                {sh.strategic_theme && (
                  <div>
                    <div className="text-xs font-medium text-slate-500">Strategic Theme</div>
                    <div className="text-sm text-slate-700">{sh.strategic_theme}</div>
                  </div>
                )}
                {sh.focus_area && (
                  <div>
                    <div className="text-xs font-medium text-slate-500">Focus Area</div>
                    <div className="text-sm text-slate-700">{sh.focus_area}</div>
                  </div>
                )}
              </div>

              {/* Relationships from unified data */}
              {segmentInsights.relationships && segmentInsights.relationships.length > 0 && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs uppercase text-slate-500 mb-2">Connected Entities</div>
                  <div className="space-y-2">
                    {segmentInsights.relationships.slice(0, 5).map((rel, idx) => (
                      <div key={idx} className="text-xs p-2 bg-slate-50 rounded">
                        <div className="font-medium text-slate-700">{rel.target.name}</div>
                        <div className="text-slate-500 capitalize">{rel.type.replace(/_/g, ' ')}</div>
                      </div>
                    ))}
                    {segmentInsights.relationships.length > 5 && (
                      <div className="text-xs text-slate-500 italic">
                        +{segmentInsights.relationships.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        }

        // Parent segment selected - show statistics
        if (segmentInsights.type === 'parent' && segmentInsights.parentStats) {
          const stats = segmentInsights.parentStats;
          return (
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div>
                <div className="text-xs uppercase text-slate-500 mb-1">Segment Overview</div>
                <div className="text-base font-semibold text-slate-900">{segmentInsights.name}</div>
                <div className="text-2xl font-bold text-[#006E51] mt-1">{stats.totalCount}</div>
                <div className="text-xs text-slate-500">stakeholders</div>
              </div>

              {/* Breakdown by category */}
              {stats.breakdown && stats.breakdown.length > 0 && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs uppercase text-slate-500 mb-2">
                    {viewType === 'by_type' ? 'By Mode' : viewType === 'by_mode' ? 'By Type' : 'Distribution'}
                  </div>
                  <div className="space-y-2">
                    {stats.breakdown.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-slate-700">{item.label}</span>
                          <span className="text-xs text-slate-600">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-[#006E51] h-1.5 rounded-full transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RACI Distribution */}
              {stats.raciDistribution && stats.raciDistribution.length > 0 && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs uppercase text-slate-500 mb-2">RACI Distribution</div>
                  <div className="space-y-1">
                    {stats.raciDistribution.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">{item.role}</span>
                        <span className="font-medium text-slate-700">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Focus Areas */}
              {stats.focusAreas && stats.focusAreas.length > 0 && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs uppercase text-slate-500 mb-2">Top Focus Areas</div>
                  <div className="space-y-1">
                    {stats.focusAreas.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs">
                        <span className="text-slate-600 flex-1">{item.area}</span>
                        <span className="font-medium text-slate-700 ml-2">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }

        return null;
      });
      return () => {
        onInsightsRender(null);
      };
    }
  }, [onInsightsRender, segmentInsights, viewType]);

  const usingExternalControls = Boolean(onControlsRender);
  const usingExternalInsights = Boolean(onInsightsRender);

  return (
    <div className={usingExternalControls || usingExternalInsights ? "w-full h-full" : "w-full"}>
      {!usingExternalControls && (
        <>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Library Stakeholder Sunburst (Test)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Radial view of stakeholder ecosystem. Click segments to explore details and statistics.
          </p>

          {/* View selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewType('by_type')}
              className={`px-4 py-2 rounded text-sm ${viewType === 'by_type' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}
            >
              By Type
            </button>
            <button
              onClick={() => setViewType('by_mode')}
              className={`px-4 py-2 rounded text-sm ${viewType === 'by_mode' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}
            >
              By Mode
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

      <div className={usingExternalControls || usingExternalInsights ? "w-full h-full" : "grid grid-cols-1 lg:grid-cols-3 gap-4"}>
        <div className={usingExternalControls || usingExternalInsights ? "w-full h-full" : "lg:col-span-2 bg-white rounded-lg shadow p-4"}>
          <ReactECharts 
            option={option} 
            style={{ height: usingExternalControls || usingExternalInsights ? '100%' : '500px', width: '100%' }}
            onEvents={{ click: handleClick }}
          />
        </div>

        {/* Detail & Legend - only show if using embedded insights */}
        {showEmbeddedInsights && (
          <div className="bg-white rounded-lg shadow p-4">
            {segmentInsights?.type === 'stakeholder' && segmentInsights.stakeholder ? (
              <div>
                <h3 className="font-bold text-lg mb-2">{segmentInsights.name}</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">Type:</span> {segmentInsights.stakeholder.type}</div>
                  <div><span className="text-gray-500">Mode:</span> {segmentInsights.stakeholder.mode}</div>
                  {segmentInsights.stakeholder.raci && (
                    <div><span className="text-gray-500">RACI:</span> {segmentInsights.stakeholder.raci}</div>
                  )}
                  {segmentInsights.stakeholder.focus_area && (
                    <div><span className="text-gray-500">Focus:</span> {segmentInsights.stakeholder.focus_area}</div>
                  )}
                </div>
              </div>
            ) : segmentInsights?.type === 'parent' && segmentInsights.parentStats ? (
              <div>
                <h3 className="font-bold text-lg mb-2">{segmentInsights.name}</h3>
                <div className="text-2xl font-bold text-[#006E51] mb-2">
                  {segmentInsights.parentStats.totalCount}
                </div>
                <div className="text-sm text-gray-600 mb-3">stakeholders</div>
                {segmentInsights.parentStats.breakdown && segmentInsights.parentStats.breakdown.length > 0 && (
                  <div className="space-y-2">
                    {segmentInsights.parentStats.breakdown.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between">
                          <span>{item.label}</span>
                          <span>{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="font-bold mb-3">Stakeholder Types</h3>
                <div className="space-y-1">
                  {Object.entries(TYPE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                      <span>{type}</span>
                    </div>
                  ))}
                </div>
                <h3 className="font-bold mt-4 mb-3">Transport Modes</h3>
                <div className="space-y-1">
                  {Object.entries(MODE_COLORS).map(([mode, color]) => (
                    <div key={mode} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                      <span>{mode}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StakeholderSunburst;
