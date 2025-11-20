'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { hierarchy, HierarchyNode, pack } from 'd3-hierarchy';
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

type SimpleNode = {
  id: string;
  name: string;
  value: number;
  color: string;
  children?: SimpleNode[];
};

type SeriesRow = { id: string; value: number; depth: number; name: string; index: number };
type MetaMap = Record<string, CirclePackingNode>;

const sanitize = (name?: string) => (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'node');

type TooltipParams = {
  data?: {
    id: string;
    value: number;
    name: string;
  };
};

type RenderParams = {
  context: { nodes?: NodeLookup };
};

type RenderAPI = {
  getWidth: () => number;
  getHeight: () => number;
  value: (dimension: string) => string | number;
};

function normalizeNode(node: CirclePackingNode, parentId?: string, index = 0, meta: MetaMap = {}) {
  const localId = node.id || `${sanitize(node.name)}-${index}`;
  const id = parentId ? `${parentId}.${localId}` : localId;
  const childrenData = node.children?.map((child, childIndex) => normalizeNode(child, id, childIndex, meta));
  const value =
    node.size ??
    (childrenData && childrenData.length > 0 ? childrenData.reduce((sum, child) => sum + child.value, 0) : 1);
  const color = node.color || (node.type ? TYPE_COLORS[node.type] || TYPE_COLORS.default : TYPE_COLORS.default);
  const simpleNode: SimpleNode = { id, name: node.name, value, color, children: childrenData };
  meta[id] = node;
  return simpleNode;
}

function prepareSeries(data: CirclePackingNode) {
  const meta: MetaMap = {};
  const simpleTree = normalizeNode(data, undefined, 0, meta);
  const rows: SeriesRow[] = [];
  let maxDepth = 0;
  let counter = 0;

  const traverse = (node: SimpleNode, depth: number) => {
    rows.push({ id: node.id, value: node.value, depth, name: node.name, index: counter });
    counter += 1;
    maxDepth = Math.max(maxDepth, depth);
    node.children?.forEach((child) => traverse(child, depth + 1));
  };

  traverse(simpleTree, 0);
  return { tree: simpleTree, rows, maxDepth, meta };
}

interface NodeLookup {
  [id: string]: HierarchyNode<SimpleNode> & { x: number; y: number; r: number };
}

const findSimpleNode = (root: SimpleNode | null, targetId: string): SimpleNode | null => {
  if (!root) return null;
  if (root.id === targetId) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findSimpleNode(child, targetId);
      if (found) return found;
    }
  }
  return null;
};

export function CirclePackingSimpleECharts() {
  const [selectedNode, setSelectedNode] = useState<CirclePackingNode | null>(null);
  const [displayTree, setDisplayTree] = useState<SimpleNode | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<SimpleNode[]>([]);

  const { tree, rows, maxDepth, meta } = useMemo(() => prepareSeries(circlePackingData), []);

  const currentTree = displayTree || tree;
  type ClickEvent = { data?: { id: string } };

  const option = useMemo(() => {
    if (!currentTree) return {};

    const root = hierarchy(currentTree)
      .sum((d) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    return {
      dataset: {
        dimensions: ['id', 'value', 'depth', 'name', 'index'],
        source: rows,
      },
      tooltip: {
        formatter: (params: TooltipParams) => {
          const data = params?.data;
          if (!data) return '';
          const nodeMeta = meta[data.id];
          return `<div style="padding:4px;">
            <div style="font-weight:600;">${data.name}</div>
            ${
              nodeMeta?.type
                ? `<div style="font-size:11px;text-transform:uppercase;color:#94a3b8;">${nodeMeta.type}</div>`
                : ''
            }
            <div style="font-size:12px;color:#475569;">Value: ${data.value}</div>
          </div>`;
        },
      },
      visualMap: [
        {
          show: false,
          min: 0,
          max: maxDepth,
          dimension: 'depth',
          inRange: { color: ['#0f172a', '#22d3ee'] },
        },
      ],
      hoverLayerThreshold: Infinity,
      series: [
        {
          type: 'custom',
          coordinateSystem: 'none',
          renderItem: (params: RenderParams, api: RenderAPI) => {
            const context = params.context;
            if (!context.nodes) {
              const layoutRoot = root.copy();
              pack<SimpleNode>()
                .size([api.getWidth() - 4, api.getHeight() - 4])
                .padding(4)(layoutRoot as HierarchyNode<SimpleNode>);

              context.nodes = {};
              layoutRoot.descendants().forEach((node) => {
                if (node.data.id) {
                  context.nodes![node.data.id] =
                    node as HierarchyNode<SimpleNode> & { x: number; y: number; r: number };
                }
              });
            }

            const nodePath = String(api.value('id'));
            const node = context.nodes?.[nodePath];
            if (!node) return;

            const isLeaf = !node.children || node.children.length === 0;
            const focus = new Uint32Array(
              node.descendants().map((desc) => rows.findIndex((r) => r.id === desc.data.id))
            );

            return {
              type: 'circle',
              focus,
              shape: {
                cx: node.x,
                cy: node.y,
                r: node.r,
              },
              transition: ['shape'],
              z2: (api.value('depth') as number) * 2,
              textContent: {
                type: 'text',
                style: {
                  text: isLeaf ? node.data.name : '',
                  fontFamily: 'Arial',
                  width: node.r * 1.3,
                  overflow: 'truncate',
                  fontSize: node.r / 3,
                  fill: '#fff',
                },
                emphasis: {
                  style: {
                    fontSize: Math.max(node.r / 3, 12),
                  },
                },
              },
              textConfig: { position: 'inside' },
              style: {
                fill: node.data.color || '#1f2937',
                stroke: '#fff',
                shadowBlur: 10,
                shadowColor: 'rgba(15,23,42,0.3)',
              },
              emphasis: {
                focus: 'self',
                blurScope: 'series',
                style: {
                  shadowBlur: 25,
                  shadowColor: 'rgba(0,0,0,0.35)',
                  opacity: 1,
                },
              },
              blur: {
                style: {
                  opacity: 0.2,
                },
              },
            };
          },
          encode: {
            tooltip: 'value',
            itemName: 'name',
            value: 'value',
            depth: 'depth',
          },
        },
      ],
    };
  }, [currentTree, rows, maxDepth, meta]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-h-[500px] bg-white rounded-xl shadow border border-slate-200">
          <ReactECharts
            option={option}
            style={{ height: '500px', width: '100%' }}
            onEvents={{
              click: (params: ClickEvent) => {
                const dataId = params.data?.id;
                if (!dataId) return;
                const nodeMeta = meta[dataId];
                const simpleNode = findSimpleNode(currentTree, dataId);
                if (simpleNode?.children && simpleNode.children.length > 0) {
                  setDisplayTree(simpleNode);
                  setBreadcrumb((prev) => [...prev, simpleNode]);
                } else if (nodeMeta) {
                  setSelectedNode(nodeMeta);
                }
              },
            }}
            notMerge
            lazyUpdate
          />
        </div>
        <div className="w-full md:w-80 flex flex-col gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase text-slate-500">Drill Path</div>
              <div className="text-sm font-medium text-slate-900">
                {breadcrumb.length === 0 ? 'Root' : breadcrumb.map((b) => b.name).join(' / ')}
              </div>
            </div>
            <div className="flex gap-2">
              {breadcrumb.length > 0 && (
                <button
                  className="text-xs px-3 py-1 border rounded-lg text-slate-600 hover:bg-slate-100"
                  onClick={() => {
                    setBreadcrumb((prev) => {
                      const next = [...prev];
                      next.pop();
                      const target = next[next.length - 1];
                      setDisplayTree(target || null);
                      return next;
                    });
                  }}
                >
                  Back
                </button>
              )}
              {breadcrumb.length > 0 && (
                <button
                  className="text-xs px-3 py-1 border rounded-lg text-slate-600 hover:bg-slate-100"
                  onClick={() => {
                    setBreadcrumb([]);
                    setDisplayTree(null);
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            {selectedNode ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{selectedNode.type || 'entity'}</div>
                  <div className="text-lg font-semibold text-slate-900">{selectedNode.name}</div>
                </div>
                {INFO_FIELDS.map(({ label, key }) => {
                  const value = selectedNode[key];
                  if (value === null || value === undefined) return null;
                  if (Array.isArray(value) || typeof value === 'object') return null;
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
                      {selectedNode.capabilities.map((cap) => (
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
                      {selectedNode.connections.map((connection) => (
                        <span key={connection} className="px-2 py-0.5 rounded-full bg-slate-200 text-xs text-slate-700">
                          {connection.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-600">
                Click any circle to view details. This is ECharts circle packing using the full stakeholder dataset.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

