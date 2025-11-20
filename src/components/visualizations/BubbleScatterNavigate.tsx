/**
 * BubbleScatterNavigate
 * 
 * Hero visualization: Funding vs TRL Bubble Scatter Chart
 * Answers: "Which technologies are overfunded for their maturity? Which are ready but starving?"
 * 
 * X-axis: TRL (1-9)
 * Y-axis: Funding amount (£M) - Logarithmic scale
 * Bubble size: Number of projects
 * Bubble color: Technology category
 */

'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TitleComponent,
  GridComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
  LegendComponent,
} from 'echarts/components';
import { ScatterChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { Technology, TechnologyCategory } from '@/lib/navigate-types';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

echarts.use([
  TooltipComponent,
  TitleComponent,
  GridComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
  LegendComponent,
  ScatterChart,
  CanvasRenderer,
]);

// CPC brand colors by technology category
const CATEGORY_COLORS: Record<TechnologyCategory, string> = {
  H2Production: '#006E51',      // CPC Primary Teal
  H2Storage: '#50C878',          // CPC Success Green
  FuelCells: '#F5A623',          // CPC Warning Amber
  Aircraft: '#4A90E2',          // CPC Info Blue
  Infrastructure: '#8b5cf6',    // Purple
};

interface BubbleScatterNavigateProps {
  technologies: Technology[];
  onTechnologySelect?: (tech: Technology) => void;
  highlightedTechIds?: string[];
  className?: string;
  height?: number | string; // Can be number (px) or string (e.g., '100%', '80vh')
}

// Format funding amount for display
function formatFunding(amount: number): string {
  if (amount >= 1000000000) {
    return `£${(amount / 1000000000).toFixed(1)}B`;
  }
  return `£${(amount / 1000000).toFixed(1)}M`;
}

// Calculate bubble size based on project count (normalized to 10-100px radius)
function calculateBubbleSize(projectCount: number, maxProjects: number): number {
  if (maxProjects === 0) return 20;
  const normalized = (projectCount / maxProjects) * 90 + 10; // 10-100 range
  return Math.max(10, Math.min(100, normalized));
}

export function BubbleScatterNavigate({
  technologies,
  onTechnologySelect,
  highlightedTechIds = [],
  className = '',
  height = '100%', // Default to 100% to fill container
}: BubbleScatterNavigateProps) {
  // Filter out technologies without funding or TRL
  const validTechnologies = useMemo(() => {
    return technologies.filter(
      tech => tech.trl_current >= 1 && tech.trl_current <= 9 && tech.total_funding && tech.total_funding > 0
    );
  }, [technologies]);

  // Calculate max values for normalization
  const { maxFunding, maxProjects } = useMemo(() => {
    if (validTechnologies.length === 0) {
      return { maxFunding: 1, maxProjects: 1 };
    }
    const maxFunding = Math.max(...validTechnologies.map(t => t.total_funding || 0));
    const maxProjects = Math.max(...validTechnologies.map(t => t.project_count || 0));
    return { maxFunding, maxProjects };
  }, [validTechnologies]);

  // Transform data for ECharts scatter
  const scatterData = useMemo(() => {
    const dataByCategory: Record<TechnologyCategory, Array<{
      value: [number, number, number]; // [TRL, Funding (log), Size]
      name: string;
      id: string;
      category: TechnologyCategory;
      funding: number;
      projects: number;
      stakeholders: number;
      maturity_risk: string;
      deployment_ready: boolean;
    }>> = {
      H2Production: [],
      H2Storage: [],
      FuelCells: [],
      Aircraft: [],
      Infrastructure: [],
    };

    validTechnologies.forEach(tech => {
      const funding = tech.total_funding || 0;
      const logFunding = Math.log10(funding); // Logarithmic scale for Y-axis
      const size = calculateBubbleSize(tech.project_count || 0, maxProjects);
      
      dataByCategory[tech.category].push({
        value: [tech.trl_current, logFunding, size],
        name: tech.name,
        id: tech.id,
        category: tech.category,
        funding,
        projects: tech.project_count || 0,
        stakeholders: tech.stakeholder_count || 0,
        maturity_risk: tech.maturity_risk,
        deployment_ready: tech.deployment_ready,
      });
    });

    return dataByCategory;
  }, [validTechnologies, maxProjects]);

  // Build series for each category
  const series = useMemo(() => {
    const categories: TechnologyCategory[] = ['H2Production', 'H2Storage', 'FuelCells', 'Aircraft', 'Infrastructure'];
    
    return categories.map(category => ({
      name: category,
      type: 'scatter' as const,
      data: scatterData[category],
      symbolSize: (data: any) => data[2], // Use third value as size
      itemStyle: {
        color: CATEGORY_COLORS[category],
        opacity: (params: any) => {
          const techId = params.data?.id;
          if (highlightedTechIds.length === 0) return 0.7;
          return highlightedTechIds.includes(techId) ? 1.0 : 0.3;
        },
      },
      emphasis: {
        itemStyle: {
          opacity: 1.0,
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    }));
  }, [scatterData, highlightedTechIds]);

  // ECharts option
  const option = useMemo(() => {
    const minFunding = Math.min(...validTechnologies.map(t => Math.log10(t.total_funding || 1)));
    const maxFundingLog = Math.max(...validTechnologies.map(t => Math.log10(t.total_funding || 1)));

    return {
      title: {
        text: 'Funding vs Technology Readiness Level',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1F2937',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          if (!data) return '';
          
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${data.name}</div>
              <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">${data.category}</div>
              <div style="font-size: 12px; margin-bottom: 2px;"><strong>TRL:</strong> ${data.value[0]}</div>
              <div style="font-size: 12px; margin-bottom: 2px;"><strong>Funding:</strong> ${formatFunding(data.funding)}</div>
              <div style="font-size: 12px; margin-bottom: 2px;"><strong>Projects:</strong> ${data.projects}</div>
              <div style="font-size: 12px; margin-bottom: 2px;"><strong>Stakeholders:</strong> ${data.stakeholders}</div>
              <div style="font-size: 11px; color: #6B7280; margin-top: 6px; padding-top: 6px; border-top: 1px solid #E5E7EB;">
                <div><strong>Maturity Risk:</strong> ${data.maturity_risk}</div>
                <div style="margin-top: 2px;"><strong>Deployment Ready:</strong> ${data.deployment_ready ? 'Yes' : 'No'}</div>
              </div>
            </div>
          `;
        },
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: {
          color: '#1F2937',
        },
      },
      grid: {
        left: '12%',
        right: '8%',
        bottom: '12%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: 'Technology Readiness Level (TRL)',
        nameLocation: 'middle',
        nameGap: 30,
        min: 0.5,
        max: 9.5,
        interval: 1,
        axisLabel: {
          formatter: (value: number) => `TRL ${value}`,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#E5E7EB',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Funding Amount (Log Scale)',
        nameLocation: 'middle',
        nameGap: 60,
        min: minFunding - 0.5,
        max: maxFundingLog + 0.5,
        axisLabel: {
          formatter: (value: number) => {
            const amount = Math.pow(10, value);
            return formatFunding(amount);
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#E5E7EB',
          },
        },
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          show: true,
          yAxisIndex: [0],
          left: '93%',
          start: 0,
          end: 100,
        },
        {
          type: 'inside',
          xAxisIndex: [0],
        },
        {
          type: 'inside',
          yAxisIndex: [0],
        },
      ],
      markLine: {
        silent: true,
        data: [
          {
            xAxis: 6,
            name: 'TRL 6: Proven Elsewhere',
            lineStyle: {
              color: '#0EA5E9',
              type: 'dashed',
              width: 2,
            },
            label: {
              position: 'insideEndTop',
              formatter: 'TRL 6: Proven Elsewhere',
              color: '#0EA5E9',
              fontSize: 12,
            },
          },
          {
            xAxis: 8,
            name: 'TRL 8: Commercial Ready',
            lineStyle: {
              color: '#50C878',
              type: 'dashed',
              width: 2,
            },
            label: {
              position: 'insideEndTop',
              formatter: 'TRL 8: Commercial Ready',
              color: '#50C878',
              fontSize: 12,
            },
          },
        ],
      },
      legend: {
        data: ['H2Production', 'H2Storage', 'FuelCells', 'Aircraft', 'Infrastructure'],
        bottom: 10,
        itemGap: 20,
        textStyle: {
          fontSize: 12,
        },
      },
      series,
    };
  }, [series, validTechnologies, maxFunding]);

  if (validTechnologies.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl ${className}`}>
        <div className="text-center p-8">
          <p className="text-gray-600">No technology data available with funding and TRL information</p>
        </div>
      </div>
    );
  }

  // Convert height to CSS value
  const heightValue = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={`rounded-xl border border-slate-200 bg-white h-full flex flex-col ${className}`}>
      <div className="flex-1" style={{ height: heightValue, minHeight: '600px' }}>
        <ReactECharts
          echarts={echarts}
          option={option}
          style={{ height: '100%', width: '100%' }}
          onEvents={{
            click: (params: any) => {
              if (onTechnologySelect && params.data) {
                const tech = validTechnologies.find(t => t.id === params.data.id);
                if (tech) {
                  onTechnologySelect(tech);
                }
              }
            },
          }}
        />
      </div>
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-600">
          <strong>Insight:</strong> Technologies in the top-right (high TRL, high funding) are ready for private investment.
          Technologies in the bottom-left (low TRL, low funding) may need more public support.
        </div>
      </div>
    </div>
  );
}

