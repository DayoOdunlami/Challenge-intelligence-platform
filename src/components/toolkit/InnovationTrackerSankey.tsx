'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TitleComponent,
} from 'echarts/components';
import { SankeyChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { fundingFlowsData } from '@/data/toolkit/fundingFlows';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

echarts.use([
  TooltipComponent,
  TitleComponent,
  SankeyChart,
  CanvasRenderer,
]);

export function InnovationTrackerSankey() {
  const fundingData = fundingFlowsData;

  const option = useMemo(() => ({
    title: {
      text: 'Zero emission aviation funding distribution FY24',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
      },
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          const value = params.data.value;
          const formattedValue = value >= 1 ? `$${value}M` : `$${(value * 1000).toFixed(0)}K`;
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${params.data.source} → ${params.data.target}</div>
              <div style="font-size: 14px; color: #006E51;">${formattedValue}</div>
            </div>
          `;
        }
        const node = fundingData.nodes.find((n: any) => n.name === params.name);
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; font-size: 14px;">${params.name}</div>
            ${node ? `<div style="font-size: 12px; color: #6B7280; margin-top: 4px;">${node.category}</div>` : ''}
          </div>
        `;
      },
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency',
        },
        nodeAlign: 'left',
        data: fundingData.nodes.map(node => {
          // Special handling: Airbus and ESC should be red (from image)
          const isHighlighted = node.name === 'Airbus' || node.name === 'ESC';
          return {
            name: node.name,
            itemStyle: {
              color: isHighlighted ? '#EF4444' : getNodeColor(node.category),
              borderColor: '#fff',
              borderWidth: 1,
            },
            label: {
              fontSize: 12,
              fontWeight: node.category === 'source' ? 'bold' : 'normal',
              color: isHighlighted ? '#EF4444' : undefined,
            },
          };
        }),
        links: fundingData.links.map(link => {
          // Highlight links involving Airbus or ESC
          const isHighlighted = link.source === 'Airbus' || link.target === 'Airbus' ||
                                link.source === 'ESC' || link.target === 'ESC';
          return {
            source: link.source,
            target: link.target,
            value: link.value,
            lineStyle: {
              color: isHighlighted ? '#EF4444' : undefined,
              opacity: isHighlighted ? 0.8 : 0.6,
            },
          };
        }),
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
        },
        label: {
          fontSize: 12,
        },
        levels: [
          { 
            depth: 0, 
            itemStyle: { color: '#6b7280' },  // Public/Private - grey
            label: { fontSize: 14, fontWeight: 'bold' }
          },
          { 
            depth: 1, 
            itemStyle: { color: '#6b7280' },  // Gov departments - grey
            label: { fontSize: 12 }
          },
          { 
            depth: 2, 
            itemStyle: { color: '#6b7280' },  // UKRI/IUK - grey
            label: { fontSize: 12 }
          },
          { 
            depth: 3, 
            itemStyle: { color: '#6b7280' },  // Recipients - grey (red for highlights)
            label: { fontSize: 12 }
          },
        ],
      },
    ],
  }), []);

  return (
    <div className="w-full" style={{ height: '600px' }}>
      <ReactECharts
        echarts={echarts}
        option={option}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

function getNodeColor(category: string): string {
  // Match image: mostly grey, with red highlights for specific entities (Airbus, ESC)
  const colors: Record<string, string> = {
    source: '#6b7280',      // Grey
    government: '#6b7280',  // Grey
    intermediary: '#6b7280', // Grey
    private: '#6b7280',     // Grey (Airbus will be red via special handling)
    recipient: '#6b7280',   // Grey (ESC will be red via special handling)
  };
  return colors[category] || '#6b7280';
}

