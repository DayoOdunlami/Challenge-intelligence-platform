'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
// @ts-ignore - GraphChart may not be in types but exists in runtime
import { GraphChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { stakeholdersData } from '@/data/toolkit/stakeholders';
import { relationshipsData } from '@/data/toolkit/relationships';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

echarts.use([
  TooltipComponent,
  LegendComponent,
  GraphChart,
  CanvasRenderer,
]);

export function EChartsGraphView() {
  const stakeholders = stakeholdersData;
  const relationships = relationshipsData;

  const { nodes, links, categories } = useMemo(() => {
    const nodeMap = new Map(stakeholders.map(s => [s.id, s]));
    const categoryMap = new Map<string, number>();
    
    const nodes = stakeholders.map((stakeholder, index) => {
      const categoryIndex = categoryMap.get(stakeholder.category) ?? categoryMap.size;
      if (!categoryMap.has(stakeholder.category)) {
        categoryMap.set(stakeholder.category, categoryIndex);
      }
      
      return {
        id: stakeholder.id,
        name: stakeholder.shortName || stakeholder.name,
        category: categoryIndex,
        symbolSize: 30,
        value: stakeholder.name,
        itemStyle: {
          color: getCategoryColor(stakeholder.category),
        },
      };
    });

    const links = relationships
      .filter(rel => nodeMap.has(rel.source) && nodeMap.has(rel.target))
      .map(rel => ({
        source: rel.source,
        target: rel.target,
        value: rel.type,
        lineStyle: {
          color: '#999',
          width: 1,
          curveness: 0.3,
        },
      }));

    const categories = Array.from(categoryMap.keys()).map((name, index) => ({
      name,
    }));

    return { nodes, links, categories };
  }, []);

  const option = useMemo(() => ({
    tooltip: {
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const stakeholder = stakeholders.find(s => s.id === params.data.id);
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${stakeholder?.name || params.data.name}</div>
              <div style="font-size: 12px; color: #6B7280;">${stakeholder?.description || ''}</div>
            </div>
          `;
        }
        return `${params.data.source} → ${params.data.target}`;
      },
    },
    legend: {
      data: categories.map(c => c.name),
      orient: 'vertical',
      left: 'left',
      top: 'middle',
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
        links,
      },
    ],
  }), [nodes, links, categories]);

  return (
    <div className="w-full" style={{ height: '700px' }}>
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
    industry: '#F5A623',        // CPC Warning Amber
    intermediary: '#4A90E2',    // CPC Info Blue
  };
  return colors[category] || '#6b7280';
}

