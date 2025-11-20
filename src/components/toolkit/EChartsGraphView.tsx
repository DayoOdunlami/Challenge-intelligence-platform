'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { GraphChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { stakeholdersData } from '@/data/toolkit/stakeholders';
import { relationshipsData } from '@/data/toolkit/relationships';
import { projectsData } from '@/data/toolkit/projects';
import { workingGroupsData } from '@/data/toolkit/workingGroups';
import type { ToolkitStakeholder, ToolkitProject, WorkingGroup } from '@/data/toolkit/types';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

echarts.use([
  TooltipComponent,
  LegendComponent,
  GraphChart,
  CanvasRenderer,
]);

const CATEGORY_CONFIG = {
  government: { color: '#006E51', symbol: 'circle' },      // CPC Primary Teal
  academia: { color: '#50C878', symbol: 'circle' },        // CPC Success Green
  industry: { color: '#F5A623', symbol: 'circle' },        // CPC Warning Amber
  intermediary: { color: '#4A90E2', symbol: 'circle' },    // CPC Info Blue
  project: { color: '#e76f51', symbol: 'rect' },
  working_group: { color: '#264653', symbol: 'diamond' },
};

export function EChartsGraphView() {
  const [showProjects, setShowProjects] = useState(true);
  const [showWorkingGroups, setShowWorkingGroups] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [clusterByCategory, setClusterByCategory] = useState(true);
  const [forceRepulsion, setForceRepulsion] = useState(300);
  const [edgeLength, setEdgeLength] = useState(150);
  const [groupByEntityType, setGroupByEntityType] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLinkStrength, setShowLinkStrength] = useState(false);
  const [showClusters, setShowClusters] = useState(false);

  const { nodes, links, categories } = useMemo(() => {
    const categoryList = ['government', 'intermediary', 'academia', 'industry'];
    if (showProjects) categoryList.push('project');
    if (showWorkingGroups) categoryList.push('working_group');

    const categoryIndexMap = new Map(categoryList.map((cat, i) => [cat, i]));

    // Stakeholder nodes
    const stakeholderNodes = stakeholdersData.map(s => ({
      id: s.id,
      name: s.shortName || s.name,
      category: categoryIndexMap.get(s.category) ?? 0,
      symbolSize: 35,
      symbol: CATEGORY_CONFIG[s.category]?.symbol || 'circle',
      itemStyle: {
        color: CATEGORY_CONFIG[s.category]?.color || '#6b7280',
      },
      entityType: 'stakeholder',
      fullData: s,
    }));

    // Project nodes
    const projectNodes = showProjects ? projectsData.map(p => ({
      id: p.id,
      name: p.name,
      category: categoryIndexMap.get('project')!,
      symbolSize: 25,
      symbol: 'rect',
      itemStyle: {
        color: CATEGORY_CONFIG.project.color,
      },
      entityType: 'project',
      fullData: p,
    })) : [];

    // Working group nodes
    const workingGroupNodes = showWorkingGroups ? workingGroupsData.map(wg => ({
      id: wg.id,
      name: wg.name,
      category: categoryIndexMap.get('working_group')!,
      symbolSize: 20,
      symbol: 'diamond',
      itemStyle: {
        color: CATEGORY_CONFIG.working_group.color,
      },
      entityType: 'working_group',
      fullData: wg,
    })) : [];

    let allNodes = [...stakeholderNodes, ...projectNodes, ...workingGroupNodes];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allNodes = allNodes.filter(node => {
        const name = node.name?.toLowerCase() || '';
        const description = (node.fullData as ToolkitStakeholder | ToolkitProject | WorkingGroup)?.description?.toLowerCase() || '';
        return name.includes(query) || description.includes(query);
      });
    }
    
    // Filter by category
    if (selectedCategory) {
      allNodes = allNodes.filter(node => {
        if (node.entityType === 'stakeholder') {
          return (node.fullData as ToolkitStakeholder).category === selectedCategory;
        }
        return node.entityType === selectedCategory;
      });
    }
    
    const nodeIdSet = new Set(allNodes.map(n => n.id));
    
    // Group by entity type - position stakeholders, projects, and working groups in separate areas
    if (groupByEntityType) {
      // Count nodes by type to calculate spacing
      const stakeholderCount = allNodes.filter(n => n.entityType === 'stakeholder').length;
      const projectCount = allNodes.filter(n => n.entityType === 'project').length;
      const workingGroupCount = allNodes.filter(n => n.entityType === 'working_group').length;
      
      // Calculate grid positions for each entity type
      const entityTypePositions: Record<string, { baseX: number; baseY: number; spacing: number }> = {
        stakeholder: { baseX: -300, baseY: 0, spacing: 80 },      // Left side
        project: { baseX: 0, baseY: 200, spacing: 60 },            // Bottom center
        working_group: { baseX: 300, baseY: 0, spacing: 70 },       // Right side
      };
      
      // Track positions for each entity type
      const typeCounters: Record<string, number> = {
        stakeholder: 0,
        project: 0,
        working_group: 0,
      };
      
      allNodes = allNodes.map(node => {
        const entityType = node.entityType || 'stakeholder';
        const pos = entityTypePositions[entityType] || entityTypePositions.stakeholder;
        const index = typeCounters[entityType]++;
        
        // Arrange in a grid pattern
        const cols = Math.ceil(Math.sqrt(
          entityType === 'stakeholder' ? stakeholderCount :
          entityType === 'project' ? projectCount : workingGroupCount
        ));
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        const x = pos.baseX + (col - cols / 2) * pos.spacing;
        const y = pos.baseY + (row - 2) * pos.spacing;
        
        return {
          ...node,
          x,
          y,
          fixed: false, // Allow force layout to still work but with initial positioning
        };
      });
    }

    // Build links with weights for clustering control
    const links: Array<{
      source: string;
      target: string;
      value?: number; // Link weight for force layout
      lineStyle: {
        color: string;
        width: number;
        curveness?: number;
        type?: 'solid' | 'dashed' | 'dotted';
        opacity?: number;
      };
    }> = [];

    // Stakeholder-to-stakeholder relationships
    relationshipsData.forEach(rel => {
      if (nodeIdSet.has(rel.source) && nodeIdSet.has(rel.target)) {
        const sourceNode = allNodes.find(n => n.id === rel.source);
        const targetNode = allNodes.find(n => n.id === rel.target);
        
        // Calculate link weight based on relationship type and entity type similarity
        let linkWeight = 1;
        
        // Same entity type = stronger link (keep groups together)
        if (groupByEntityType && sourceNode && targetNode) {
          if (sourceNode.entityType === targetNode.entityType) {
            linkWeight = 2.5; // Much stronger attraction for same entity type
          }
        }
        
        // Also consider stakeholder category similarity if enabled
        if (clusterByCategory && sourceNode && targetNode) {
          if (sourceNode.entityType === 'stakeholder' && targetNode.entityType === 'stakeholder') {
            const sourceCategory = (sourceNode.fullData as ToolkitStakeholder).category;
            const targetCategory = (targetNode.fullData as ToolkitStakeholder).category;
            if (sourceCategory === targetCategory) {
              linkWeight *= 1.3; // Additional boost for same stakeholder category
            }
          }
        }
        
        // Relationship type affects weight
        const typeWeights: Record<string, number> = {
          'funds': 1.5,
          'leads': 1.8,
          'delivers': 1.3,
          'member': 1.2,
          'host': 1.4,
          'regulates': 1.1,
          'advises': 1.0,
          'chair': 1.6,
        };
        linkWeight *= typeWeights[rel.type] || 1.0;

        // Visualize link strength with color and width
        let linkColor = '#94a3b8';
        if (showLinkStrength) {
          // Color based on strength: weak (gray) -> medium (blue) -> strong (orange)
          if (linkWeight >= 2.0) {
            linkColor = '#f59e0b'; // Strong - orange
          } else if (linkWeight >= 1.5) {
            linkColor = '#3b82f6'; // Medium - blue
          } else {
            linkColor = '#94a3b8'; // Weak - gray
          }
        }
        
        links.push({
          source: rel.source,
          target: rel.target,
          value: linkWeight,
          lineStyle: {
            color: linkColor,
            width: showLinkStrength ? Math.min(4, linkWeight * 1.5) : Math.min(3, linkWeight),
            curveness: 0.2,
            opacity: showLinkStrength ? Math.min(1, 0.5 + linkWeight * 0.2) : 0.6,
          },
        });
      }
    });

    // Project-to-stakeholder links (using stakeholderIds array)
    if (showProjects) {
      projectsData.forEach(project => {
        // Link to all stakeholders in the project
        project.stakeholderIds?.forEach((stakeholderId, index) => {
          if (nodeIdSet.has(stakeholderId)) {
            // First stakeholder could be considered the lead (thicker line)
            const isLead = index === 0;
            let linkWeight = isLead ? 2.5 : 1.5;
            
            // When grouping by entity type, make cross-type links weaker to keep groups separate
            if (groupByEntityType) {
              linkWeight *= 0.7; // Weaker cross-type links
            }
            
            let linkColor = CATEGORY_CONFIG.project.color;
            if (showLinkStrength) {
              linkColor = linkWeight >= 2.0 ? '#f59e0b' : '#3b82f6';
            }
            
            links.push({
              source: project.id,
              target: stakeholderId,
              value: linkWeight,
              lineStyle: {
                color: linkColor,
                width: showLinkStrength ? Math.min(4, linkWeight * 1.5) : (isLead ? 2 : 1),
                type: isLead ? 'solid' : 'dashed',
                opacity: showLinkStrength ? Math.min(1, 0.5 + linkWeight * 0.2) : 0.8,
              },
            });
          }
        });
      });
    }

    // Working group-to-stakeholder links (members)
    if (showWorkingGroups) {
      workingGroupsData.forEach(wg => {
        wg.memberIds?.forEach(memberId => {
          if (nodeIdSet.has(memberId)) {
            let linkWeight = 1.3;
            
            // When grouping by entity type, make cross-type links weaker
            if (groupByEntityType) {
              linkWeight *= 0.7; // Weaker cross-type links
            }
            
            let linkColor = CATEGORY_CONFIG.working_group.color;
            if (showLinkStrength) {
              linkColor = '#3b82f6'; // Medium strength
            }
            
            links.push({
              source: wg.id,
              target: memberId,
              value: linkWeight,
              lineStyle: {
                color: linkColor,
                width: showLinkStrength ? Math.min(3, linkWeight * 1.5) : 1,
                type: 'dotted',
                opacity: showLinkStrength ? Math.min(1, 0.5 + linkWeight * 0.2) : 0.6,
              },
            });
          }
        });
      });
    }
    
    // Add invisible "grouping" links between same entity types to keep them together
    if (groupByEntityType) {
      const entityTypeGroups: Record<string, string[]> = {
        stakeholder: [],
        project: [],
        working_group: [],
      };
      
      allNodes.forEach(node => {
        const type = node.entityType || 'stakeholder';
        if (entityTypeGroups[type]) {
          entityTypeGroups[type].push(node.id);
        }
      });
      
      // Create weak attraction links between nodes of the same type
      Object.values(entityTypeGroups).forEach(group => {
        if (group.length > 1) {
          // Connect each node to a few nearby nodes of the same type
          for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < Math.min(i + 3, group.length); j++) {
              // Only add if there isn't already a link
              const existingLink = links.find(l => 
                (l.source === group[i] && l.target === group[j]) ||
                (l.source === group[j] && l.target === group[i])
              );
              
              if (!existingLink) {
                links.push({
                  source: group[i],
                  target: group[j],
                  value: 1.8, // Strong attraction to keep same types together
                  lineStyle: {
                    color: 'transparent', // Invisible grouping link
                    width: 0,
                    opacity: 0,
                  },
                });
              }
            }
          }
        }
      });
    }

    const categories = categoryList.map(name => ({
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));

    return { nodes: allNodes, links, categories };
  }, [showProjects, showWorkingGroups, clusterByCategory, searchQuery, selectedCategory, showLinkStrength, groupByEntityType]);

  // Create node lookup map for quick access
  const nodeLookup = useMemo(() => {
    const map = new Map<string, typeof nodes[0]>();
    nodes.forEach(node => {
      map.set(node.id, node);
    });
    return map;
  }, [nodes]);

  // Find related entities based on links
  const relatedEntities = useMemo(() => {
    if (!selectedNodeId) return [];
    
    const relatedIds = new Set<string>();
    links.forEach(link => {
      if (link.source === selectedNodeId) {
        relatedIds.add(link.target);
      } else if (link.target === selectedNodeId) {
        relatedIds.add(link.source);
      }
    });

    return Array.from(relatedIds)
      .map(id => nodeLookup.get(id))
      .filter((node): node is typeof nodes[0] => node !== undefined);
  }, [selectedNodeId, links, nodeLookup]);

  // Get selected node data
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodeLookup.get(selectedNodeId) || null;
  }, [selectedNodeId, nodeLookup]);

  // Cluster detection using community detection algorithm
  const detectedClusters = useMemo(() => {
    if (!showClusters) return new Map<string, number>();
    
    // Build adjacency list
    const adjacencyList = new Map<string, Set<string>>();
    nodes.forEach(node => {
      adjacencyList.set(node.id, new Set());
    });
    
    links.forEach(link => {
      adjacencyList.get(link.source)?.add(link.target);
      adjacencyList.get(link.target)?.add(link.source);
    });
    
    // Simple community detection: find connected components with strong links
    const visited = new Set<string>();
    const clusters = new Map<string, number>();
    let clusterId = 0;
    
    const dfs = (nodeId: string, currentCluster: number) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      clusters.set(nodeId, currentCluster);
      
      const neighbors = adjacencyList.get(nodeId) || new Set();
      neighbors.forEach(neighborId => {
        // Only follow strong links (weight >= 1.5)
        const link = links.find(l => 
          (l.source === nodeId && l.target === neighborId) ||
          (l.source === neighborId && l.target === nodeId)
        );
        
        if (link && (link.value || 1) >= 1.5 && !visited.has(neighborId)) {
          dfs(neighborId, currentCluster);
        }
      });
    };
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        // Only start clusters from nodes with strong connections
        const neighbors = adjacencyList.get(node.id) || new Set();
        const hasStrongLink = Array.from(neighbors).some(neighborId => {
          const link = links.find(l => 
            (l.source === node.id && l.target === neighborId) ||
            (l.source === neighborId && l.target === node.id)
          );
          return link && (link.value || 1) >= 1.5;
        });
        
        if (hasStrongLink || neighbors.size > 2) {
          dfs(node.id, clusterId++);
        }
      }
    });
    
    return clusters;
  }, [nodes, links, showClusters]);

  const option = useMemo(() => ({
    tooltip: {
      formatter: (params: {
        dataType?: string;
        data?: {
          id?: string;
          name?: string;
          entityType?: string;
          fullData?: {
            name?: string;
            description?: string;
            category?: string;
            fundingAmount?: number | null;
            status?: string;
          };
        };
      }) => {
        if (params.dataType === 'node' && params.data && params.data.fullData) {
          const data = params.data.fullData;
          const type = params.data.entityType;

          if (type === 'stakeholder') {
            return `
              <div style="padding: 8px; max-width: 250px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${data.name || ''}</div>
                <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">${data.category || ''}</div>
                <div style="font-size: 12px; color: #64748b;">${data.description || ''}</div>
              </div>
            `;
          } else if (type === 'project') {
            return `
              <div style="padding: 8px; max-width: 250px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${data.name || ''}</div>
                <div style="font-size: 11px; text-transform: uppercase; color: #e76f51; margin-bottom: 4px;">Project</div>
                <div style="font-size: 12px; color: #64748b;">${data.description || ''}</div>
                ${data.fundingAmount ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Funding: £${data.fundingAmount.toLocaleString()}</div>` : ''}
                ${data.status ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Status: ${data.status}</div>` : ''}
              </div>
            `;
          } else if (type === 'working_group') {
            return `
              <div style="padding: 8px; max-width: 250px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${data.name || ''}</div>
                <div style="font-size: 11px; text-transform: uppercase; color: #264653; margin-bottom: 4px;">Working Group</div>
                <div style="font-size: 12px; color: #64748b;">${data.description || ''}</div>
              </div>
            `;
          }
        }
        return '';
      },
    },
    legend: {
      data: categories.map(c => c.name),
      orient: 'vertical',
      left: 10,
      top: 20,
      textStyle: {
        fontSize: 11,
      },
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        label: {
          show: true,
          position: 'right',
          fontSize: 10,
          color: '#334155',
        },
        force: {
          repulsion: groupByEntityType 
            ? forceRepulsion * 0.7  // Less repulsion when grouping (allows groups to form)
            : forceRepulsion,
          edgeLength: groupByEntityType
            ? [edgeLength * 0.5, edgeLength * 1.2] // Tighter when grouping by entity type
            : (clusterByCategory 
              ? [edgeLength * 0.6, edgeLength * 1.4]
              : [edgeLength * 0.8, edgeLength * 1.2]),
          gravity: groupByEntityType ? 0.03 : (clusterByCategory ? 0.08 : 0.05), // Less gravity when grouping
          friction: 0.6,
          layoutAnimation: true,
        },
        emphasis: {
          focus: 'adjacency',
          blurScope: 'global',
          label: {
            fontSize: 12,
            fontWeight: 'bold',
          },
          lineStyle: {
            width: 3,
          },
        },
        categories,
        // Highlight selected node with border and apply cluster colors
        data: nodes.map(node => {
          const clusterId = detectedClusters.get(node.id);
          const isInCluster = clusterId !== undefined;
          
          // Cluster colors (different shades for different clusters)
          const clusterColors = [
            '#fef3c7', '#dbeafe', '#fce7f3', '#d1fae5', '#e0e7ff', '#fde68a'
          ];
          const clusterColor = isInCluster ? clusterColors[clusterId % clusterColors.length] : undefined;
          
          return {
            ...node,
            itemStyle: {
              ...node.itemStyle,
              borderColor: node.id === selectedNodeId ? '#f59e0b' : (isInCluster ? '#6366f1' : 'transparent'),
              borderWidth: node.id === selectedNodeId ? 3 : (isInCluster ? 2 : 0),
              // Add subtle background for cluster members
              ...(isInCluster && showClusters ? {
                shadowBlur: 10,
                shadowColor: clusterColor,
              } : {}),
            },
          };
        }),
        links,
      },
    ],
  }), [nodes, links, categories, clusterByCategory, forceRepulsion, edgeLength, selectedNodeId, detectedClusters, showClusters, groupByEntityType]);

  const handleNodeClick = (params: { dataType?: string; data?: { id?: string } }) => {
    if (params.dataType === 'node' && params.data?.id) {
      setSelectedNodeId(params.data.id);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 px-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showProjects}
            onChange={(e) => {
              setShowProjects(e.target.checked);
              setSelectedNodeId(null);
            }}
            className="rounded"
          />
          Show Projects
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showWorkingGroups}
            onChange={(e) => {
              setShowWorkingGroups(e.target.checked);
              setSelectedNodeId(null);
            }}
            className="rounded"
          />
          Show Working Groups
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={clusterByCategory}
            onChange={(e) => setClusterByCategory(e.target.checked)}
            className="rounded"
          />
          Cluster by Category
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={groupByEntityType}
            onChange={(e) => setGroupByEntityType(e.target.checked)}
            className="rounded"
          />
          Group by Entity Type
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showLinkStrength}
            onChange={(e) => setShowLinkStrength(e.target.checked)}
            className="rounded"
          />
          Show Link Strength
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showClusters}
            onChange={(e) => setShowClusters(e.target.checked)}
            className="rounded"
          />
          Show Clusters
        </label>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="px-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 whitespace-nowrap">Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities..."
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 whitespace-nowrap">Filter by Category:</label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="government">Government</option>
            <option value="academia">Academia</option>
            <option value="industry">Industry</option>
            <option value="intermediary">Intermediary</option>
            {showProjects && <option value="project">Projects</option>}
            {showWorkingGroups && <option value="working_group">Working Groups</option>}
          </select>
        </div>
      </div>
      
      {/* Force Layout Controls */}
      <div className="px-4 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600">Repulsion:</label>
          <input
            type="range"
            min="100"
            max="800"
            step="50"
            value={forceRepulsion}
            onChange={(e) => setForceRepulsion(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-slate-500 w-12">{forceRepulsion}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600">Edge Length:</label>
          <input
            type="range"
            min="50"
            max="300"
            step="25"
            value={edgeLength}
            onChange={(e) => setEdgeLength(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-slate-500 w-12">{edgeLength}</span>
        </div>
      </div>
      
      {/* Link Strength Legend */}
      {showLinkStrength && (
        <div className="px-4 flex flex-wrap gap-4 items-center text-xs">
          <span className="text-slate-600 font-medium">Link Strength:</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-slate-400"></div>
            <span className="text-slate-500">Weak</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500"></div>
            <span className="text-slate-500">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-orange-500"></div>
            <span className="text-slate-500">Strong</span>
          </div>
        </div>
      )}
      
      {/* Cluster Info */}
      {showClusters && detectedClusters.size > 0 && (
        <div className="px-4 text-xs text-slate-600">
          Detected {new Set(Array.from(detectedClusters.values())).size} clusters with {detectedClusters.size} nodes
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white rounded-xl shadow border border-slate-200" style={{ height: '700px' }}>
          <ReactECharts
            echarts={echarts}
            option={option}
            style={{ height: '100%', width: '100%' }}
            onEvents={{ click: handleNodeClick }}
          />
        </div>
        <div className="w-full md:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4">
          {selectedNode && selectedNode.fullData ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {selectedNode.entityType === 'stakeholder' 
                    ? (selectedNode.fullData as ToolkitStakeholder).category || 'entity'
                    : selectedNode.entityType?.replace('_', ' ') || 'entity'}
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  {selectedNode.fullData.name || selectedNode.name}
                </div>
              </div>

              {/* Description */}
              {selectedNode.fullData.description && (
                <div>
                  <div className="text-xs font-medium text-slate-500">Description</div>
                  <div className="text-sm text-slate-900">{selectedNode.fullData.description}</div>
                </div>
              )}

              {/* Entity-specific fields */}
              {selectedNode.entityType === 'stakeholder' && (
                <>
                  {(selectedNode.fullData as ToolkitStakeholder).category && (
                    <div>
                      <div className="text-xs font-medium text-slate-500">Category</div>
                      <div className="text-sm text-slate-900 capitalize">{(selectedNode.fullData as ToolkitStakeholder).category}</div>
                    </div>
                  )}
                </>
              )}

              {selectedNode.entityType === 'project' && (() => {
                const projectData = selectedNode.fullData as ToolkitProject;
                return (
                  <>
                    {projectData.fundingAmount && (
                      <div>
                        <div className="text-xs font-medium text-slate-500">Funding Amount</div>
                        <div className="text-sm text-slate-900">£{projectData.fundingAmount.toLocaleString()}</div>
                      </div>
                    )}
                    {projectData.status && (
                      <div>
                        <div className="text-xs font-medium text-slate-500">Status</div>
                        <div className="text-sm text-slate-900 capitalize">{projectData.status}</div>
                      </div>
                    )}
                    {projectData.category && (
                      <div>
                        <div className="text-xs font-medium text-slate-500">Category</div>
                        <div className="text-sm text-slate-900 capitalize">{projectData.category}</div>
                      </div>
                    )}
                    {projectData.trlLevel && (
                      <div>
                        <div className="text-xs font-medium text-slate-500">TRL Level</div>
                        <div className="text-sm text-slate-900">{projectData.trlLevel}</div>
                      </div>
                    )}
                  </>
                );
              })()}

              {selectedNode.entityType === 'working_group' && (() => {
                const wgData = selectedNode.fullData as WorkingGroup;
                return (
                  <>
                    {wgData.focus && wgData.focus.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-slate-500">Focus Areas</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {wgData.focus.map((focus: string) => (
                            <span key={focus} className="px-2 py-0.5 rounded-full bg-slate-200 text-xs text-slate-700">
                              {focus}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {wgData.established && (
                      <div>
                        <div className="text-xs font-medium text-slate-500">Established</div>
                        <div className="text-sm text-slate-900">{wgData.established}</div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Related Entities */}
              {relatedEntities.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-500">Related Entities</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {relatedEntities.map((entity) => (
                      <button
                        key={entity.id}
                        className="px-2 py-0.5 rounded-full bg-emerald-100 text-xs text-emerald-700 hover:bg-emerald-200 transition"
                        onClick={() => setSelectedNodeId(entity.id)}
                      >
                        {entity.fullData?.name || entity.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-600">
              Click any node in the graph to view its details, connections, and related entities.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

