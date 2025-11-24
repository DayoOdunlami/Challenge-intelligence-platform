'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { hierarchy, HierarchyNode, pack } from 'd3-hierarchy';
import { circlePackingData, CirclePackingNode } from '@/data/toolkit/circlePackingData';
import { StakeholderInsightPanel } from './StakeholderInsightPanel';

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
  const hasOwnId = Boolean(node.id);
  const localId = hasOwnId ? (node.id as string) : `${sanitize(node.name)}-${index}`;
  const id = hasOwnId ? localId : parentId ? `${parentId}.${localId}` : localId;
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

type CirclePackingSimpleEChartsProps = {
  selectedId: string | null;
  selectedNode: CirclePackingNode | null;
  highlightedIds: Set<string> | null;
  relatedEntities: CirclePackingNode[];
  onSelectNodeAction: (id: string | null) => void;
};

export function CirclePackingSimpleECharts({
  selectedId,
  selectedNode,
  highlightedIds,
  relatedEntities,
  onSelectNodeAction,
}: CirclePackingSimpleEChartsProps) {
  const [displayTree, setDisplayTree] = useState<SimpleNode | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<SimpleNode[]>([]);
  const [selectionsAtLevel, setSelectionsAtLevel] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomCenter, setZoomCenter] = useState<{ x: number; y: number } | null>(null);

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

            // Apply zoom transform
            const centerX = zoomCenter?.x ?? api.getWidth() / 2;
            const centerY = zoomCenter?.y ?? api.getHeight() / 2;
            const zoomedX = centerX + (node.x - centerX) * zoomLevel;
            const zoomedY = centerY + (node.y - centerY) * zoomLevel;
            const zoomedR = node.r * zoomLevel;

            // Only dim when something is actually selected (not just when highlightedIds exists)
            const dimNode = Boolean(selectedId && highlightedIds && highlightedIds.size > 0 && !highlightedIds.has(node.data.id));
            const isSelected = node.data.id === selectedId;
            const isRelated = Boolean(selectedId && highlightedIds && highlightedIds.has(node.data.id) && !isSelected);
            const focus = new Uint32Array(
              node.descendants().map((desc) => rows.findIndex((r) => r.id === desc.data.id))
            );

            const children: Record<string, unknown>[] = [];

            if (selectedId && node.data.id === selectedId && relatedEntities.length > 0 && context.nodes) {
              relatedEntities.forEach((entity) => {
                if (!entity.id) return;
                const target = context.nodes?.[entity.id];
                if (!target) return;
                const targetZoomedX = centerX + (target.x - centerX) * zoomLevel;
                const targetZoomedY = centerY + (target.y - centerY) * zoomLevel;
                children.push({
                  type: 'line',
                  shape: {
                    x1: zoomedX,
                    y1: zoomedY,
                    x2: targetZoomedX,
                    y2: targetZoomedY,
                  },
                  style: {
                    stroke: '#f97316',
                    lineWidth: 2,
                    opacity: 0.7,
                  },
                  z2: 60,
                });
              });
            }

            children.push({
              type: 'circle',
              focus,
              shape: {
                cx: zoomedX,
                cy: zoomedY,
                r: zoomedR,
              },
              transition: ['shape'],
              z2: (api.value('depth') as number) * 2,
              style: {
                fill: node.data.color || '#1f2937',
                stroke: isSelected ? '#f97316' : isRelated ? '#fbbf24' : '#fff',
                lineWidth: isSelected ? 4 : isRelated ? 3 : 1,
                shadowBlur: isSelected ? 20 : isRelated ? 15 : 10,
                shadowColor: isSelected ? 'rgba(249, 115, 22, 0.5)' : isRelated ? 'rgba(251, 191, 36, 0.4)' : 'rgba(15,23,42,0.3)',
                opacity: dimNode ? 0.25 : 1,
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
            });

            // Text positioning: parent nodes (clusters) get callout labels outside, leaf nodes get text inside
            const isParent = node.children && node.children.length > 0;
            const minRadiusForText = 5;
            const fontSize = Math.max(Math.min(node.r / 3, 14), 8);
            const showText = node.r >= minRadiusForText && node.data.name;
            
            if (showText) {
              if (isParent) {
                // Parent nodes: position text outside circle as callout (above the circle)
                const labelY = zoomedY - zoomedR - 8; // Position above circle
                children.push({
                  type: 'text',
                  z2: 1000,
                  style: {
                    text: node.data.name,
                    fontFamily: 'Arial, sans-serif',
                    fontSize: Math.max(fontSize * 0.9 * zoomLevel, 10),
                    fontWeight: 'bold',
                    fill: dimNode ? 'rgba(0,0,0,0.3)' : '#1f2937',
                    x: zoomedX,
                    y: labelY,
                    textAlign: 'center',
                    textVerticalAlign: 'bottom',
                    textBackgroundColor: dimNode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
                    textBorderRadius: 4,
                    textPadding: [4, 6],
                    textShadowBlur: 2,
                    textShadowColor: 'rgba(255, 255, 255, 0.8)',
                  },
                });
              } else {
                // Leaf nodes: text inside circle
                children.push({
                  type: 'text',
                  z2: 1000,
                  style: {
                    text: node.data.name,
                    fontFamily: 'Arial, sans-serif',
                    width: zoomedR * 2.5,
                    overflow: 'truncate',
                    fontSize: fontSize * zoomLevel,
                    fontWeight: isSelected ? 'bold' : isRelated ? '600' : 'normal',
                    fill: dimNode ? 'rgba(255,255,255,0.5)' : '#ffffff',
                    x: zoomedX,
                    y: zoomedY,
                    textAlign: 'center',
                    textVerticalAlign: 'middle',
                    textShadowBlur: 5,
                    textShadowColor: 'rgba(0, 0, 0, 0.9)',
                    textShadowOffsetX: 1,
                    textShadowOffsetY: 1,
                  },
                  emphasis: {
                    style: {
                      fontSize: Math.max(fontSize * 1.2, 11),
                      fontWeight: 'bold',
                    },
                  },
                });
              }
            }

            return {
              type: 'group',
              children,
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
  }, [currentTree, rows, maxDepth, meta, highlightedIds, selectedId, relatedEntities, zoomLevel, zoomCenter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div 
          className="flex-1 min-h-[500px] bg-white rounded-xl shadow border border-slate-200 relative"
          onClick={(e) => {
            // If clicking directly on the container (not the chart), go back a level
            if (e.target === e.currentTarget && breadcrumb.length > 0) {
              setBreadcrumb((prev) => {
                const next = [...prev];
                next.pop();
                const target = next[next.length - 1];
                setDisplayTree(target || null);
                setSelectionsAtLevel([]);
                onSelectNodeAction(null);
                return next;
              });
            }
          }}
          onWheel={(e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));
            if (newZoom !== zoomLevel) {
              // Set zoom center to mouse position relative to container
              const rect = e.currentTarget.getBoundingClientRect();
              setZoomCenter({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
              setZoomLevel(newZoom);
            }
          }}
        >
          <ReactECharts
            option={option}
            style={{ height: '500px', width: '100%' }}
            onEvents={{
              click: (params: ClickEvent) => {
                const dataId = params.data?.id;
                if (!dataId) {
                  // Click outside any circle: go back a level
                  if (breadcrumb.length > 0) {
                    setBreadcrumb((prev) => {
                      const next = [...prev];
                      next.pop();
                      const target = next[next.length - 1];
                      setDisplayTree(target || null);
                      setSelectionsAtLevel([]);
                      onSelectNodeAction(null);
                      return next;
                    });
                  }
                  return;
                }
                const nodeMeta = meta[dataId];
                const simpleNode = findSimpleNode(currentTree, dataId);
                if (simpleNode?.children && simpleNode.children.length > 0) {
                  // Drill down: add to breadcrumb path only if not already there
                  setDisplayTree(simpleNode);
                  setBreadcrumb((prev) => {
                    // Check if this node is already the last item in breadcrumb
                    const lastItem = prev[prev.length - 1];
                    if (lastItem && lastItem.id === simpleNode.id) {
                      return prev; // Don't duplicate
                    }
                    return [...prev, simpleNode];
                  });
                  setSelectionsAtLevel([]);
                  setZoomLevel(1); // Reset zoom on drill down
                  setZoomCenter(null);
                  onSelectNodeAction(null);
                } else if (nodeMeta) {
                  // Selection at current level: add to selections list
                  const nodeName = nodeMeta.name || simpleNode?.name || dataId;
                  setSelectionsAtLevel((prev) => {
                    if (!prev.includes(nodeName)) {
                      return [...prev, nodeName];
                    }
                    return prev;
                  });
                  onSelectNodeAction(nodeMeta.id ?? null);
                }
              },
            }}
            notMerge
            lazyUpdate
          />
        </div>
        <div className="w-full md:w-80 flex flex-col gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs uppercase text-slate-500">Drill Path</div>
                <div className="text-sm font-medium text-slate-900">
                  {breadcrumb.length === 0 
                    ? 'Root' 
                    : breadcrumb
                        .filter((b, idx, arr) => idx === 0 || b.id !== arr[idx - 1].id) // Remove consecutive duplicates
                        .map((b) => b.name)
                        .join(' / ')}
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
                        setSelectionsAtLevel([]);
                        setZoomLevel(1);
                        setZoomCenter(null);
                        return next;
                      });
                      onSelectNodeAction(null);
                    }}
                  >
                    Back
                  </button>
                )}
                {(breadcrumb.length > 0 || selectionsAtLevel.length > 0) && (
                  <button
                    className="text-xs px-3 py-1 border rounded-lg text-slate-600 hover:bg-slate-100"
                    onClick={() => {
                      setBreadcrumb([]);
                      setDisplayTree(null);
                      setSelectionsAtLevel([]);
                      setZoomLevel(1);
                      setZoomCenter(null);
                      onSelectNodeAction(null);
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            {selectionsAtLevel.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="text-xs uppercase text-slate-500 mb-1">Selections at this level</div>
                <div className="flex flex-wrap gap-1">
                  {selectionsAtLevel.map((name, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-700">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <StakeholderInsightPanel
              selectedNode={selectedNode}
              relatedEntities={relatedEntities}
              onSelectNodeAction={onSelectNodeAction}
              emptyState="Click any circle to view details. This is ECharts circle packing using the full stakeholder dataset."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

