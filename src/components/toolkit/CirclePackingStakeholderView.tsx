'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import 'echarts';
import { circlePackingData, CirclePackingNode } from '@/data/toolkit/circlePackingData';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const TYPE_COLORS: Record<string, string> = {
  government: '#1a5f7a',
  intermediary: '#2d8f6f',
  academia: '#7b2cbf',
  project: '#f4a261',
  industry: '#e76f51',
  working_group: '#264653',
  default: '#4b5563',
};

function withDefaults(node: CirclePackingNode): any {
  const nodeType = node.type ?? '';
  const baseColor =
    node.color ||
    TYPE_COLORS[nodeType] ||
    (nodeType.includes('academia') ? TYPE_COLORS.academia : TYPE_COLORS.default);

  const formatted: any = {
    ...node,
    value: node.size ?? Math.max(node.children?.length ?? 1, 1),
    itemStyle: {
      color: baseColor,
      borderWidth: 2,
      borderColor: '#ffffff',
    },
    label: {
      show: true,
    },
  };

  if (node.children && node.children.length > 0) {
    formatted.children = node.children.map((child) => withDefaults(child));
  }

  return formatted;
}

function flattenNodes(node: CirclePackingNode, map: Record<string, CirclePackingNode>) {
  if (node.id) {
    map[node.id] = node;
  }
  node.children?.forEach((child) => flattenNodes(child, map));
}

const INFO_FIELDS: { label: string; key: keyof CirclePackingNode }[] = [
  { label: 'Description', key: 'description' },
  { label: 'Funding Role', key: 'funding_role' },
  { label: 'Funding Amount', key: 'funding_amount' },
  { label: 'Funding Received', key: 'funding_received' },
  { label: 'Status', key: 'status' },
  { label: 'TRL', key: 'trl' },
  { label: 'Lead', key: 'lead' },
  { label: 'Target Date', key: 'target_date' },
  { label: 'Output', key: 'output' },
];

export function CirclePackingStakeholderView() {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const echartsData = useMemo(() => withDefaults(circlePackingData), []);

  const nodeLookup = useMemo(() => {
    const map: Record<string, CirclePackingNode> = {};
    circlePackingData.children?.forEach((child) => flattenNodes(child, map));
    return map;
  }, []);

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const rawData =
            (params && params.data) ||
            (params && params.node && params.node.data) ||
            params?.treePathInfo?.[params.treePathInfo?.length - 1]?.data;

          if (!rawData || typeof rawData !== 'object') {
            return `<div class="p-1.5"><div class="font-semibold">${params?.name ?? 'Unknown node'}</div></div>`;
          }

          const data = rawData as CirclePackingNode;
          const desc = data.description ? `<div class="text-xs text-gray-500">${data.description}</div>` : '';
          const type = data.type ? `<div class="text-[11px] uppercase tracking-wide text-gray-400">${data.type}</div>` : '';
          return `<div class="p-1.5">
            <div class="font-semibold">${params?.name ?? data.name}</div>
            ${type}
            ${desc}
          </div>`;
        },
        extraCssText: 'min-width:200px',
      },
      series: [
        {
          type: 'circlePacking',
          data: [echartsData],
          layout: 'equal',
          draggable: false,
          animationDurationUpdate: 500,
          animationEasing: 'quadraticOut',
          roam: false,
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: {
            formatter: '{b}',
            fontSize: 12,
            overflow: 'truncate',
          },
          levels: [
            {},
            {
              itemStyle: {
                borderColor: '#ffffff',
                borderWidth: 3,
                shadowBlur: 12,
                shadowColor: 'rgba(0,0,0,0.15)',
              },
              label: { fontSize: 13 },
            },
            {
              itemStyle: {
                borderColor: '#ffffff',
                borderWidth: 2,
                shadowBlur: 8,
                shadowColor: 'rgba(0,0,0,0.08)',
              },
              label: { fontSize: 12 },
            },
            {
              itemStyle: {
                borderColor: '#ffffff',
                borderWidth: 2,
              },
              label: { fontSize: 11 },
            },
          ],
        },
      ],
    }),
    [echartsData]
  );

  const handleNodeClick = (params: any) => {
    const data =
      (params && params.data) ||
      (params && params.node && params.node.data) ||
      params?.treePathInfo?.[params.treePathInfo?.length - 1]?.data;
    if (data) {
      setSelectedNode(data as CirclePackingNode);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-h-[500px] bg-white rounded-xl shadow border border-slate-200">
          <ReactECharts
            option={option}
            style={{ height: 520 }}
            onEvents={{ click: handleNodeClick }}
            notMerge
            lazyUpdate
          />
        </div>
        <div className="w-full md:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4">
          {selectedNode ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">{selectedNode.type || 'entity'}</div>
                <div className="text-lg font-semibold text-slate-900">{selectedNode.name}</div>
              </div>
              {INFO_FIELDS.map(({ label, key }) => {
                const value = selectedNode[key];
                if (!value) return null;
                return (
                  <div key={key as string}>
                    <div className="text-xs font-medium text-slate-500">{label}</div>
                    <div className="text-sm text-slate-900">{value}</div>
                  </div>
                );
              })}
              {selectedNode.capabilities && (
                <div>
                  <div className="text-xs font-medium text-slate-500">Capabilities</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.capabilities.map((cap: string) => (
                      <span key={cap} className="px-2 py-0.5 rounded-full bg-slate-200 text-xs text-slate-700">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedNode.connections && selectedNode.connections.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-500">Connections</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.connections.map((connection: string) => {
                      const related = nodeLookup[connection];
                      const label = related?.name || connection;
                      const handleClick = () => {
                        if (related) {
                          setSelectedNode(withDefaults(related));
                        }
                      };
                      return (
                        <span
                          key={connection}
                          className={`px-2 py-0.5 rounded-full text-xs cursor-pointer ${
                            related
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          }`}
                          onClick={handleClick}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {selectedNode.projects && selectedNode.projects.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-500">Projects</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.projects.map((project: string) => (
                      <span key={project} className="px-2 py-0.5 rounded-full bg-amber-100 text-xs text-amber-700">
                        {project.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-600">
              Click any circle to view its description, connections, and related projects. Use the breadcrumb trail in the
              chart header to navigate between clusters.
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Interaction Tips</h3>
        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
          <li>Click a top-level circle (Government, Industry, etc.) to zoom into its stakeholders.</li>
          <li>Select an individual entity to drill further into its ecosystem and view metadata on the right.</li>
          <li>Breadcrumbs above the chart let you step back up the hierarchy.</li>
          <li>Use the connection chips to jump between related organisations.</li>
        </ul>
      </div>
    </div>
  );
}

