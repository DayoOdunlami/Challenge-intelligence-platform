'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TitleComponent,
  VisualMapComponent,
  DatasetComponent,
} from 'echarts/components';
import { TreemapChart, SunburstChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { FundingEvent, Stakeholder, Technology } from '@/lib/navigate-types';
import { TreemapViewMode } from '@/types/visualization-controls';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

echarts.use([
  TooltipComponent,
  TitleComponent,
  VisualMapComponent,
  DatasetComponent,
  TreemapChart,
  SunburstChart,
  CanvasRenderer,
]);

type HierarchyNode = {
  name: string;
  value?: number;
  children?: HierarchyNode[];
  itemStyle?: { color?: string };
  data?: {
    funding: number;
    shareParent: number;
    shareTotal: number;
    path: string[];
  };
};

interface TreemapSunburstExplorerProps {
  fundingEvents?: FundingEvent[];
  stakeholders?: Stakeholder[];
  technologies?: Technology[];
  mode?: TreemapViewMode;
  onModeChange?: (mode: TreemapViewMode) => void;
  className?: string;
  height?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  H2Production: '#0f766e',
  H2Storage: '#14b8a6',
  FuelCells: '#f97316',
  Aircraft: '#2563eb',
  Infrastructure: '#9333ea',
  'Cross-Cutting': '#94a3b8',
};

const formatMillions = (value: number) =>
  `£${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;

export function TreemapSunburstExplorer({
  fundingEvents = [],
  stakeholders = [],
  technologies = [],
  mode = 'treemap',
  onModeChange,
  className = '',
  height = 600,
}: TreemapSunburstExplorerProps) {
  const [internalMode, setInternalMode] = useState<TreemapViewMode>(mode);
  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  const resolvedMode = onModeChange ? mode : internalMode;
  const handleModeChange = (next: TreemapViewMode) => {
    if (onModeChange) {
      onModeChange(next);
    } else {
      setInternalMode(next);
    }
  };

  const { root, total } = useMemo(() => {
    const stakeholderMap = new Map<string, Stakeholder>();
    stakeholders.forEach((s) => stakeholderMap.set(s.id, s));

    const technologyMap = new Map<string, Technology>();
    technologies.forEach((t) => technologyMap.set(t.id, t));

    const rootNode: HierarchyNode = { name: 'Funding Sources', children: [] };

    const ensureChild = (parent: HierarchyNode, name: string): HierarchyNode => {
      if (!parent.children) parent.children = [];
      let child = parent.children.find((c) => c.name === name);
      if (!child) {
        child = { name, children: [] };
        parent.children.push(child);
      }
      return child;
    };

    const addLeafValue = (node: HierarchyNode, amount: number, path: string[], colorKey?: string) => {
      node.value = (node.value || 0) + amount;
      node.data = {
        funding: (node.data?.funding || 0) + amount,
        shareParent: 0,
        shareTotal: 0,
        path,
      };
      if (colorKey) {
        node.itemStyle = { color: CATEGORY_COLORS[colorKey] || CATEGORY_COLORS['Cross-Cutting'] };
      }
    };

    fundingEvents.forEach((event) => {
      const amount = (event.amount || 0) / 1_000_000;
      if (!amount || amount <= 0) return;

      const sourceType = event.funding_type ? event.funding_type : 'Other';
      const sourceNode = ensureChild(rootNode, sourceType);
      const departmentName = stakeholderMap.get(event.source_id)?.name || 'Other Departments';
      const departmentNode = ensureChild(sourceNode, departmentName);
      const programName = event.program || 'General Programmes';
      const programNode = ensureChild(departmentNode, programName);

      let categories =
        event.technologies_supported
          ?.map((techId) => technologyMap.get(techId)?.category)
          .filter(Boolean) || [];

      if (!categories.length) {
        categories = ['Cross-Cutting'];
      }

      const perCategory = amount / categories.length;
      categories.forEach((category) => {
        const categoryLabel = category as string;
        const leaf = ensureChild(programNode, categoryLabel);
        addLeafValue(
          leaf,
          perCategory,
          [sourceType, departmentName, programName, categoryLabel],
          categoryLabel,
        );
      });
    });

    const computeTotals = (node: HierarchyNode): number => {
      if (!node.children || node.children.length === 0) {
        return node.value || 0;
      }
      const sum = node.children.reduce((acc, child) => acc + computeTotals(child), 0);
      node.value = sum;
      return sum;
    };

    const annotateShares = (node: HierarchyNode, totalValue: number, parentValue?: number) => {
      const currentValue = node.value || 0;
      if (!node.data) {
        node.data = {
          funding: currentValue,
          shareParent: parentValue ? (currentValue / parentValue) * 100 : 100,
          shareTotal: totalValue ? (currentValue / totalValue) * 100 : 100,
          path: [],
        };
      } else {
        node.data.shareParent = parentValue ? (currentValue / (parentValue || currentValue)) * 100 : 100;
        node.data.shareTotal = totalValue ? (currentValue / totalValue) * 100 : 100;
      }
      node.children?.forEach((child) => annotateShares(child, totalValue, currentValue));
    };

    const total = computeTotals(rootNode);
    annotateShares(rootNode, total || 1);

    return { root: rootNode, total };
  }, [fundingEvents, stakeholders, technologies]);

  const tooltipFormatter = (params: any) => {
    const meta = params.data?.data;
    if (!meta) {
      return `<div><strong>${params.name}</strong></div>`;
    }
    return `
      <div>
        <strong>${params.name}</strong><br/>
        Funding: ${formatMillions(meta.funding || 0)}<br/>
        Share of parent: ${meta.shareParent?.toFixed(1)}%<br/>
        Share of total: ${meta.shareTotal?.toFixed(1)}%
      </div>
    `;
  };

  const baseOption = {
    tooltip: {
      trigger: 'item',
      formatter: tooltipFormatter,
    },
    animationDuration: 500,
  };

  const treemapOption = {
    ...baseOption,
    series: [
      {
        type: 'treemap',
        data: root.children,
        roam: true,
        breadcrumb: {
          show: true,
          top: 10,
          left: 10,
        },
        nodeClick: 'zoomToNode',
        upperLabel: {
          show: true,
          height: 28,
          color: '#0f172a',
        },
        label: {
          formatter: '{b}',
        },
        universalTransition: true,
        levels: [
          { itemStyle: { borderColor: '#fff', gapWidth: 4 } },
          { itemStyle: { borderColor: '#f8fafc', gapWidth: 2 } },
          { colorSaturation: [0.35, 0.7] },
        ],
      },
    ],
  };

  const sunburstOption = {
    ...baseOption,
    series: [
      {
        type: 'sunburst',
        data: root.children,
        radius: ['12%', '90%'],
        sort: undefined,
        emphasis: { focus: 'ancestor' },
        universalTransition: true,
        label: {
          rotate: 'radial',
        },
        levels: [
          {},
          { r0: '0%', r: '25%', itemStyle: { borderWidth: 2 } },
          { r0: '25%', r: '55%' },
          { r0: '55%', r: '80%' },
          { r0: '80%', r: '100%', label: { rotate: 0, align: 'right' } },
        ],
      },
    ],
  };

  const option = resolvedMode === 'treemap' ? treemapOption : sunburstOption;

  return (
    <div className={`h-full w-full bg-white/90 rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">Funding hierarchy</p>
          <p className="text-lg font-semibold text-slate-900">{formatMillions(total)} total</p>
        </div>
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm">
          {(['treemap', 'sunburst'] as TreemapViewMode[]).map((view) => (
            <button
              key={view}
              onClick={() => handleModeChange(view)}
              className={`px-3 py-1 rounded-full transition ${
                resolvedMode === view ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              {view === 'treemap' ? 'Treemap' : 'Sunburst'}
            </button>
          ))}
        </div>
      </div>
      <ReactECharts
        echarts={echarts}
        option={option}
        style={{ height }}
        opts={{ renderer: 'canvas' }}
        notMerge
        lazyUpdate
      />
    </div>
  );
}

