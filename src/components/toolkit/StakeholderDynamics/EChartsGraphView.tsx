'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { GraphChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import stakeholdersData from '@/data/toolkit/stakeholders.json';
import relationshipsData from '@/data/toolkit/relationships.json';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

echarts.use([
  TooltipComponent,
  LegendComponent,
  GraphChart,
  CanvasRenderer,
]);

export function EChartsGraphView() {
  const { nodes, links, categories } = useMemo(() => {
    const stakeholderMap = new Map(stakeholdersData.map(s => [s.id, s]));
    
    const nodes = stakeholdersData.map(stakeholder => ({
      id: stakeholder.id,
      name: stakeholder.shortName || stakeholder.name,
      category: stakeholder.category,
      symbolSize: 30,
      value: stakeholder.name,
      itemStyle: {
        color: getCategoryColor(stakeholder.category),
      },
    }));

    const links = relationshipsData
      .filter(rel => stakeholderMap.has(rel.source) && stakeholderMap.has(rel.target))
      .map(rel => ({
        source: rel.source,
        target: rel.target,
        value: rel.type,
        lineStyle: {
          color: '#999',
          width: 2,
          curveness: 0.3,
        },
      }));

    const categories = [
      { name: 'Government' },
      { name: 'Academia' },
      { name: 'Industry' },
      { name: 'Intermediary' },
    ];

    return { nodes, links, categories };
  }, []);

  const option = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const stakeholder = stakeholdersData.find(s => s.id === params.data.id);
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${params.data.name}</div>
                <div style="font-size: 12px; color: #6B7280;">${stakeholder?.description || ''}</div>
                <div style="font-size: 11px; color: #9CA3AF; margin-top: 4px;">Category: ${params.data.category}</div>
              </div>
            `;
          }
          return `${params.data.source} → ${params.data.target}`;
        },
      },
      legend: {
        data: categories.map(c => c.name),
        top: 20,
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          label: {
            show: true,
            position: 'right',
            fontSize: 12,
          },
          force: {
            repulsion: 100,
            edgeLength: [50, 200],
            gravity: 0.1,
          },
          emphasis: {
            focus: 'adjacency',
            blurScope: 'global',
            lineStyle: {
              width: 3,
            },
          },
          categories,
          data: nodes,
          links: links,
        },
      ],
    };
  }, [nodes, links, categories]);

  return (
    <div className="w-full h-[700px]">
      <ReactECharts
        echarts={echarts}
        option={option}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    government: '#006E51',      // CPC Primary Teal
    academia: '#50C878',        // CPC Success Green
    industry: '#4A90E2',        // CPC Info Blue
    intermediary: '#F5A623',    // CPC Warning Amber
  };
  return colors[category] || '#6b7280';
}

