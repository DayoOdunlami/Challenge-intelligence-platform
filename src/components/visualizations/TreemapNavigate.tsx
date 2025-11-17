/**
 * TreemapNavigate
 * 
 * NAVIGATE version of Treemap showing hierarchical funding breakdown
 * Shows "Where did the money go?" - funding distribution across categories
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stakeholder, Technology, Project, FundingEvent, TechnologyCategory } from '@/lib/navigate-types';

interface TreemapNavigateProps {
  stakeholders: Stakeholder[];
  technologies: Technology[];
  projects: Project[];
  fundingEvents: FundingEvent[];
  view?: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type' | 'by_project';
  onViewChange?: (view: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type' | 'by_project') => void;
  onNodeClick?: (nodeId: string, nodeType: 'stakeholder' | 'technology' | 'project' | 'funding', nodeData: any) => void;
  className?: string;
}

type TreemapView = 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type' | 'by_project';

export function TreemapNavigate({ 
  stakeholders,
  technologies,
  projects,
  fundingEvents,
  view: externalView,
  onViewChange,
  onNodeClick,
  className = '' 
}: TreemapNavigateProps) {
  const [internalView, setInternalView] = useState<TreemapView>('by_stakeholder_type');
  const view = externalView ?? internalView;
  const setView = onViewChange ?? setInternalView;

  // Build hierarchy by stakeholder type
  const hierarchyByStakeholderType = useMemo(() => {
    const byType = new Map<string, Stakeholder[]>();
    
    stakeholders.forEach(s => {
      if (!byType.has(s.type)) {
        byType.set(s.type, []);
      }
      byType.get(s.type)!.push(s);
    });

    const children = Array.from(byType.entries()).map(([type, orgs]) => ({
      id: `type-${type}`,
      name: type,
      value: orgs.reduce((sum, o) => sum + (o.total_funding_provided || 0) + (o.total_funding_received || 0), 0),
      children: orgs.map(org => ({
        id: `org-${org.id}`,
        name: org.name,
        value: (org.total_funding_provided || 0) + (org.total_funding_received || 0),
        color: getStakeholderTypeColor(org.type)
      }))
    }));

    return {
      id: 'root-stakeholders',
      name: 'All Stakeholders',
      children
    };
  }, [stakeholders]);

  // Build hierarchy by technology category
  const hierarchyByTechCategory = useMemo(() => {
    const byCategory = new Map<string, Technology[]>();
    
    technologies.forEach(t => {
      if (!byCategory.has(t.category)) {
        byCategory.set(t.category, []);
      }
      byCategory.get(t.category)!.push(t);
    });

    const children = Array.from(byCategory.entries()).map(([category, techs]) => ({
      id: `category-${category}`,
      name: category.replace(/([A-Z])/g, ' $1').trim(),
      value: techs.reduce((sum, t) => sum + (t.total_funding || 0), 0),
      children: techs.map(tech => ({
        id: `tech-${tech.id}`,
        name: tech.name,
        value: tech.total_funding || 100000,
        color: getTechCategoryColor(tech.category)
      }))
    }));

    return {
      id: 'root-technologies',
      name: 'All Technologies',
      children
    };
  }, [technologies]);

  // Build hierarchy by funding type
  const hierarchyByFundingType = useMemo(() => {
    const byType = new Map<string, FundingEvent[]>();
    
    fundingEvents.forEach(f => {
      if (!byType.has(f.funding_type)) {
        byType.set(f.funding_type, []);
      }
      byType.get(f.funding_type)!.push(f);
    });

    const children = Array.from(byType.entries()).map(([type, events]) => ({
      id: `funding-${type}`,
      name: type,
      value: events.reduce((sum, e) => sum + e.amount, 0),
      children: events.slice(0, 20).map(event => {
        const recipient = stakeholders.find(s => s.id === event.recipient_id) ||
                         technologies.find(t => t.id === event.recipient_id);
        return {
          id: `event-${event.id}`,
          name: recipient?.name || event.program,
          value: event.amount,
          color: getFundingTypeColor(event.funding_type)
        };
      })
    }));

    return {
      id: 'root-funding',
      name: 'All Funding',
      children
    };
  }, [fundingEvents, stakeholders, technologies]);

  // Build hierarchy by project
  const hierarchyByProject = useMemo(() => {
    const byStatus = new Map<string, Project[]>();
    
    projects.forEach(p => {
      if (!byStatus.has(p.status)) {
        byStatus.set(p.status, []);
      }
      byStatus.get(p.status)!.push(p);
    });

    const children = Array.from(byStatus.entries()).map(([status, projs]) => ({
      id: `status-${status}`,
      name: status,
      value: projs.reduce((sum, p) => sum + (p.total_budget || 0), 0),
      children: projs.map(project => ({
        id: `project-${project.id}`,
        name: project.name,
        value: project.total_budget || 0,
        color: getProjectStatusColor(project.status)
      }))
    }));

    return {
      id: 'root-projects',
      name: 'All Projects',
      children
    };
  }, [projects]);

  const getData = () => {
    switch (view) {
      case 'by_stakeholder_type':
        return hierarchyByStakeholderType;
      case 'by_tech_category':
        return hierarchyByTechCategory;
      case 'by_funding_type':
        return hierarchyByFundingType;
      case 'by_project':
        return hierarchyByProject;
      default:
        return hierarchyByStakeholderType;
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'by_stakeholder_type':
        return 'Funding by Stakeholder Type';
      case 'by_tech_category':
        return 'Funding by Technology Category';
      case 'by_funding_type':
        return 'Funding by Type (Public/Private/Mixed)';
      case 'by_project':
        return 'Budget by Project Status';
      default:
        return 'NAVIGATE Treemap';
    }
  };

  // Format value for display
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      const millions = value / 1000000;
      return millions % 1 === 0 ? `£${millions.toFixed(0)}M` : `£${millions.toFixed(1)}M`;
    } else if (value >= 1000) {
      const thousands = value / 1000;
      return thousands % 1 === 0 ? `£${thousands.toFixed(0)}K` : `£${thousands.toFixed(1)}K`;
    }
    return `£${value.toFixed(0)}`;
  };

  // Color helpers
  function getStakeholderTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'Government': '#006E51',
      'Research': '#4A90E2',
      'Industry': '#F5A623',
      'Intermediary': '#EC4899'
    };
    return colors[type] || '#6b7280';
  }

  function getTechCategoryColor(category: TechnologyCategory): string {
    const colors: Record<TechnologyCategory, string> = {
      H2Production: '#006E51',
      H2Storage: '#50C878',
      FuelCells: '#4A90E2',
      Aircraft: '#F5A623',
      Infrastructure: '#CCE2DC'
    };
    return colors[category] || '#6b7280';
  }

  function getFundingTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'Public': '#006E51',
      'Private': '#4A90E2',
      'Mixed': '#F5A623'
    };
    return colors[type] || '#6b7280';
  }

  function getProjectStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Active': '#50C878',
      'Completed': '#006E51',
      'Planned': '#F5A623'
    };
    return colors[status] || '#6b7280';
  }

  const data = getData();

  if (!data.children || data.children.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>NAVIGATE Treemap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600">No data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Treemap</CardTitle>
        <p className="text-sm text-gray-500 mt-1">{getTitle()}</p>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px]">
          <ResponsiveTreeMap
            data={data}
            identity="id"
            value="value"
            valueFormat=".2s"
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            onClick={(node) => {
              if (onNodeClick && node.id) {
                const nodeId = node.id as string;
                let nodeType: 'stakeholder' | 'technology' | 'project' | 'funding' = 'stakeholder';
                let nodeData = node.data;
                
                if (nodeId.startsWith('org-')) {
                  nodeType = 'stakeholder';
                  nodeData = stakeholders.find(s => s.id === nodeId) || node.data;
                } else if (nodeId.startsWith('tech-')) {
                  nodeType = 'technology';
                  const techId = nodeId.split('-')[1];
                  nodeData = technologies.find(t => t.id === techId) || node.data;
                } else if (nodeId.startsWith('proj-')) {
                  nodeType = 'project';
                  nodeData = projects.find(p => p.id === nodeId) || node.data;
                } else if (nodeId.startsWith('fund-')) {
                  nodeType = 'funding';
                  nodeData = fundingEvents.find(f => f.id === nodeId) || node.data;
                }
                
                onNodeClick(nodeId, nodeType, nodeData);
              }
            }}
            label={(node) => {
              const name = node.data.name || '';
              return name.length > 15 ? name.substring(0, 15) + '...' : name;
            }}
            labelSkipSize={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.2]] }}
            parentLabelPosition="left"
            parentLabelPadding={4}
            parentLabelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
            borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
            colors={(node: any) => {
              // Use node color if available, otherwise use depth-based color
              if (node.data.color) return node.data.color;
              
              // Default colors by depth
              const depthColors = ['#006E51', '#4A90E2', '#F5A623', '#EC4899', '#8B5CF6'];
              return depthColors[node.depth % depthColors.length] || '#6b7280';
            }}
            animate={true}
            motionConfig="gentle"
            tooltip={({ node }: any) => (
              <div className="bg-white p-3 border rounded shadow-lg">
                <div className="font-semibold text-sm mb-1">{node.data.name}</div>
                <div className="text-xs text-gray-600">
                  Value: {formatValue(node.value)}
                </div>
                {node.depth > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Depth: {node.depth}
                  </div>
                )}
              </div>
            )}
          />
        </div>

        {/* Explanation */}
        <div className="mt-4 p-4 bg-[#CCE2DC]/20 rounded-lg">
          <h4 className="text-sm font-medium text-[#006E51] mb-2">How to Read</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Rectangle size = Value (funding amount or budget)</li>
            <li>• Nested rectangles = Hierarchy (parent contains children)</li>
            <li>• Color = Category/Type</li>
            <li>• Click to zoom into a level</li>
            <li>• Hover for details</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

