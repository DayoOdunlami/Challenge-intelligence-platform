'use client';

import React, { useMemo, useState, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';

// Import data
import stakeholdersData from '@/data/cpc_domain/stakeholders.json';
import focusAreasData from '@/data/cpc_domain/focus_areas.json';

interface Stakeholder {
  id: string;
  name: string;
  type: string;
  mode: string;
  raci: string | null;
  strategic_theme: string | null;
  focus_area: string | null;
}

interface FocusArea {
  id: string;
  name: string;
  mode: string;
  strategic_themes: string[];
}

const MODE_COLORS: Record<string, string> = {
  'Aviation': '#E91E63',
  'Maritime': '#3F51B5',
  'Rail': '#009688',
  'Highways': '#FF5722',
  'Integrated Transport': '#9C27B0'
};

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

const RACI_SIZES: Record<string, number> = {
  'Responsible': 35,
  'Accountable': 40,
  'Consult': 25,
  'Inform': 20
};

type LayoutType = 'force' | 'circular' | 'byMode' | 'byType';

export function StakeholderNetwork() {
  const [layout, setLayout] = useState<LayoutType>('force');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFocusAreas, setShowFocusAreas] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const stakeholders: Stakeholder[] = stakeholdersData.stakeholders;
  const focusAreas: FocusArea[] = focusAreasData.entities;

  // Build graph data
  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    const categories: any[] = [];

    // Filter stakeholders
    const filtered = stakeholders.filter(s => 
      (filterMode === 'all' || s.mode === filterMode) &&
      (filterType === 'all' || s.type === filterType)
    );

    // Create category for each stakeholder type
    const types = [...new Set(filtered.map(s => s.type))];
    types.forEach((type) => {
      categories.push({ name: type });
    });

    // Add stakeholder nodes
    filtered.forEach(s => {
      const categoryIndex = types.indexOf(s.type);

      nodes.push({
        id: s.id,
        name: s.name,
        category: categoryIndex,
        symbolSize: RACI_SIZES[s.raci || 'Consult'] || 25,
        itemStyle: {
          color: TYPE_COLORS[s.type] || '#999',
          borderColor: MODE_COLORS[s.mode] || '#666',
          borderWidth: 3
        },
        data: s
      });
    });

    // Add focus area nodes if enabled
    if (showFocusAreas) {
      const relevantFocusAreas = focusAreas.filter(fa =>
        filterMode === 'all' || fa.mode === filterMode
      );

      relevantFocusAreas.forEach(fa => {
        nodes.push({
          id: fa.id,
          name: fa.name,
          category: types.length, // New category
          symbol: 'diamond',
          symbolSize: 30,
          itemStyle: {
            color: MODE_COLORS[fa.mode] || '#1a5c4c',
            opacity: 0.8
          },
          label: {
            show: true,
            fontSize: 9
          },
          data: { ...fa, entityType: 'focus_area' }
        });
      });

      categories.push({ name: 'Focus Areas' });

      // Create links between stakeholders and focus areas
      filtered.forEach(s => {
        if (s.focus_area) {
          // Find matching focus area - try multiple matching strategies
          const matchingFA = relevantFocusAreas.find(fa => {
            const faNameLower = fa.name.toLowerCase();
            const focusAreaLower = s.focus_area!.toLowerCase();
            
            // Try to match by extracting key words from focus area string
            const faKeyWords = faNameLower.split(/\s+/);
            const focusAreaKeyWords = focusAreaLower.split(/\s+/);
            
            // Check if any key words match
            return faKeyWords.some(word => 
              focusAreaKeyWords.some(faWord => 
                word.length > 3 && faWord.length > 3 && 
                (word.includes(faWord) || faWord.includes(word))
              )
            ) || faNameLower.includes(focusAreaLower) || 
               focusAreaLower.includes(faNameLower);
          });

          if (matchingFA) {
            links.push({
              source: s.id,
              target: matchingFA.id,
              lineStyle: {
                color: MODE_COLORS[s.mode] || '#999',
                opacity: 0.4,
                curveness: 0.2
              }
            });
          }
        }
      });

      // Link stakeholders by same strategic theme
      filtered.forEach((s1, i) => {
        filtered.slice(i + 1).forEach(s2 => {
          if (s1.strategic_theme && s1.strategic_theme === s2.strategic_theme) {
            links.push({
              source: s1.id,
              target: s2.id,
              lineStyle: {
                color: '#ddd',
                opacity: 0.2,
                type: 'dashed'
              }
            });
          }
        });
      });
    }

    return { nodes, links, categories };
  }, [stakeholders, focusAreas, filterMode, filterType, showFocusAreas]);

  // Layout-specific options
  const getLayoutConfig = useCallback(() => {
    switch (layout) {
      case 'circular':
        return {
          layout: 'circular',
          circular: {
            rotateLabel: true
          }
        };
      case 'byMode':
        return {
          layout: 'none',
        };
      case 'byType':
        return {
          layout: 'none',
        };
      default: // force
        return {
          layout: 'force',
          force: {
            repulsion: 300,
            gravity: 0.1,
            edgeLength: [50, 200],
            layoutAnimation: true
          }
        };
    }
  }, [layout]);

  const option = useMemo(() => ({
    tooltip: {
      formatter: (params: any) => {
        const d = params.data?.data;
        if (!d) return params.name;
        
        if (d.entityType === 'focus_area') {
          return `<strong>${d.name}</strong><br/>
                  Mode: ${d.mode}<br/>
                  Themes: ${d.strategic_themes?.join(', ')}`;
        }
        
        return `<strong>${d.name}</strong><br/>
                Type: ${d.type}<br/>
                Mode: ${d.mode}<br/>
                ${d.raci ? `RACI: ${d.raci}<br/>` : ''}
                ${d.strategic_theme ? `Theme: ${d.strategic_theme}<br/>` : ''}
                ${d.focus_area ? `Focus Area: ${d.focus_area}` : ''}`;
      }
    },
    legend: {
      data: graphData.categories.map(c => c.name),
      orient: 'vertical',
      right: 10,
      top: 20,
      textStyle: { fontSize: 10 }
    },
    series: [{
      type: 'graph',
      ...getLayoutConfig(),
      roam: true,
      draggable: true,
      data: graphData.nodes,
      links: graphData.links,
      categories: graphData.categories,
      label: {
        show: true,
        position: 'right',
        fontSize: 10,
        formatter: (params: any) => {
          const name = params.name;
          return name.length > 20 ? name.slice(0, 18) + '...' : name;
        }
      },
      lineStyle: {
        curveness: 0.3
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { width: 3 }
      }
    }]
  }), [graphData, getLayoutConfig]);

  const handleNodeClick = (params: any) => {
    if (params.data) {
      setSelectedNode(params.data);
    }
  };

  const modes = ['all', 'Aviation', 'Maritime', 'Rail', 'Highways', 'Integrated Transport'];
  const types = ['all', ...stakeholdersData.type_taxonomy];

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Stakeholder Network
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Interactive network showing stakeholders connected to CPC focus areas
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Layout:</span>
          <select 
            value={layout} 
            onChange={e => setLayout(e.target.value as LayoutType)}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="force">Force-directed</option>
            <option value="circular">Circular</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Mode:</span>
          <select 
            value={filterMode}
            onChange={e => setFilterMode(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            {modes.map(m => (
              <option key={m} value={m}>{m === 'all' ? 'All Modes' : m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Type:</span>
          <select 
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            {types.map(t => (
              <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input 
            type="checkbox" 
            checked={showFocusAreas}
            onChange={e => setShowFocusAreas(e.target.checked)}
            className="rounded"
          />
          Show Focus Areas
        </label>
      </div>

      {/* Main visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-4">
          <ReactECharts 
            option={option} 
            style={{ height: '500px' }}
            onEvents={{ click: handleNodeClick }}
          />
        </div>

        {/* Detail panel */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-700 mb-3">
            {selectedNode ? 'Selected Node' : 'Node Details'}
          </h3>
          
          {selectedNode ? (
            <div className="space-y-3">
              <div>
                <div className="font-medium text-lg">{selectedNode.name}</div>
                <div 
                  className="inline-block px-2 py-0.5 rounded text-xs text-white mt-1"
                  style={{ backgroundColor: MODE_COLORS[selectedNode.data?.mode] || '#666' }}
                >
                  {selectedNode.data?.mode}
                </div>
              </div>

              {selectedNode.data?.entityType !== 'focus_area' && (
                <>
                  <div>
                    <div className="text-xs text-gray-500">Type</div>
                    <div className="text-sm">{selectedNode.data?.type}</div>
                  </div>
                  
                  {selectedNode.data?.raci && (
                    <div>
                      <div className="text-xs text-gray-500">RACI Role</div>
                      <div className="text-sm font-medium">{selectedNode.data?.raci}</div>
                    </div>
                  )}

                  {selectedNode.data?.strategic_theme && (
                    <div>
                      <div className="text-xs text-gray-500">Strategic Theme</div>
                      <div className="text-sm">{selectedNode.data?.strategic_theme}</div>
                    </div>
                  )}

                  {selectedNode.data?.focus_area && (
                    <div>
                      <div className="text-xs text-gray-500">Focus Area</div>
                      <div className="text-sm">{selectedNode.data?.focus_area}</div>
                    </div>
                  )}
                </>
              )}

              {selectedNode.data?.entityType === 'focus_area' && (
                <>
                  <div>
                    <div className="text-xs text-gray-500">Strategic Themes</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNode.data?.strategic_themes?.map((t: string) => (
                        <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              Click a node to see details
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t">
            <div className="text-xs font-medium text-gray-500 mb-2">Node Size = RACI Role</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-400"></div>
                <span>Accountable (largest)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-400"></div>
                <span>Responsible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                <span>Consult</span>
              </div>
            </div>

            <div className="text-xs font-medium text-gray-500 mb-2 mt-4">Border = Mode</div>
            <div className="space-y-1 text-xs">
              {Object.entries(MODE_COLORS).slice(0, 4).map(([mode, color]) => (
                <div key={mode} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2" style={{ borderColor: color }}></div>
                  <span>{mode}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        {Object.entries(MODE_COLORS).map(([mode, color]) => {
          const count = stakeholders.filter(s => s.mode === mode).length;
          return (
            <div key={mode} className="bg-white rounded p-3 shadow-sm border-l-4" style={{ borderColor: color }}>
              <div className="text-xl font-bold" style={{ color }}>{count}</div>
              <div className="text-xs text-gray-600">{mode}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StakeholderNetwork;

