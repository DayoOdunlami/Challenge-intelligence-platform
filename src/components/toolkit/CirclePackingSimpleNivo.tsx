'use client';

import { useMemo, useState } from 'react';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import { circlePackingData, CirclePackingNode } from '@/data/toolkit/circlePackingData';

type NivoNode = {
  id: string;
  name: string;
  value: number;
  color?: string;
  data: CirclePackingNode;
  children?: NivoNode[];
};

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

const toNivoNode = (node: CirclePackingNode): NivoNode => {
  const id = node.id || node.name;
  const children = node.children?.map((child) => toNivoNode(child));
  const value =
    node.size ??
    (children && children.length > 0 ? children.reduce((sum, child) => sum + child.value, 0) : 1);

  let color = node.color;
  if (!color && node.type) {
    color = TYPE_COLORS[node.type] || TYPE_COLORS.default;
  }

  return {
    id,
    name: node.name,
    value,
    color,
    data: node,
    children,
  };
};

type CirclePackingSimpleNivoProps = {
  selectedId: string | null;
  selectedNode: CirclePackingNode | null;
  highlightedIds: Set<string> | null;
  relatedEntities: CirclePackingNode[];
  onSelectNodeAction: (id: string | null) => void;
};

export function CirclePackingSimpleNivo({
  selectedId,
  selectedNode,
  highlightedIds,
  relatedEntities,
  onSelectNodeAction,
}: CirclePackingSimpleNivoProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [displayNode, setDisplayNode] = useState<NivoNode | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<NivoNode[]>([]);

  const nivoData = useMemo(() => toNivoNode(circlePackingData), []);

  const currentData = displayNode || nivoData;
  const highlightActive = Boolean(highlightedIds && highlightedIds.size > 0);

  const getColor = (node: CirclePackingNode) => {
    if (node.color) return node.color;
    if (node.type && TYPE_COLORS[node.type]) return TYPE_COLORS[node.type];
    return TYPE_COLORS.default;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-h-[500px] bg-white rounded-xl shadow border border-slate-200">
          <ResponsiveCirclePacking
            data={currentData}
            id="id"
            value="value"
            colors={(node) => {
              const nivoNode = node?.data as NivoNode | undefined;
              if (!nivoNode) return TYPE_COLORS.default;
              const base = getColor(nivoNode.data);
              if (highlightActive && !highlightedIds?.has(nivoNode.id)) {
                return '#e2e8f0';
              }
              return base;
            }}
            colorBy="color"
            padding={6}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            enableLabels={false}
            borderWidth={2}
            borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
            onClick={(node) => {
              const nivoNode = node?.data as NivoNode | undefined;
              if (!nivoNode) return;
              if (nivoNode.children && nivoNode.children.length > 0) {
                setDisplayNode(nivoNode);
                setBreadcrumb((prev) => [...prev, nivoNode]);
              } else if (nivoNode.data && nivoNode.id) {
                onSelectNodeAction(nivoNode.id);
              }
            }}
            onMouseEnter={(node) => {
              const nivoNode = node?.data as NivoNode | undefined;
              setHoveredId(nivoNode?.id ?? null);
            }}
            onMouseLeave={() => setHoveredId(null)}
            tooltip={({ node }) => {
              const nivoNode = node?.data as NivoNode | undefined;
              if (!nivoNode) return null;
              const data = nivoNode.data;
              return (
                <div className="bg-white p-2 rounded border shadow min-w-[180px]">
                  <div className="text-xs uppercase text-slate-400">{data.type || 'cluster'}</div>
                  <div className="text-sm font-semibold text-slate-900">{data.name}</div>
                  {data.description && <div className="text-xs text-slate-600 mt-1">{data.description}</div>}
                </div>
              );
            }}
            layers={[
              'circles',
              'legends',
              ({ nodes, labelSkipRadius }) => (
                <g>
                  {nodes
                    .filter((node) => node.data && node.data.children && node.radius > labelSkipRadius)
                    .map((node) => (
                      <text
                        key={node.id}
                        x={node.x}
                        y={node.y + node.radius + 12}
                        textAnchor="middle"
                        style={{
                          fill: node.color as string,
                          fontSize: 11,
                          fontWeight: 600,
                          pointerEvents: 'none',
                        }}
                      >
                        {node.data.name}
                      </text>
                    ))}
                </g>
              ),
              ({ nodes }) => {
                if (!hoveredId) return null;
                const hoveredNode = nodes.find((node) => node.id === hoveredId);
                if (!hoveredNode) return null;
                return (
                  <g pointerEvents="none">
                    <circle
                      cx={hoveredNode.x}
                      cy={hoveredNode.y}
                      r={hoveredNode.radius + 6}
                      fill="none"
                      stroke="#fcd34d"
                      strokeWidth={3}
                      strokeDasharray="4 2"
                    />
                  </g>
                );
              },
              ({ nodes }) => {
                if (!selectedId || !highlightedIds) return null;
                const selectedNodeLayer = nodes.find((node) => node.id === selectedId);
                if (!selectedNodeLayer) return null;
                return (
                  <g pointerEvents="none">
                    {nodes
                      .filter((node) => node.id !== selectedId && highlightedIds.has(node.id))
                      .map((node) => (
                        <line
                          key={`link-${selectedId}-${node.id}`}
                          x1={selectedNodeLayer.x}
                          y1={selectedNodeLayer.y}
                          x2={node.x}
                          y2={node.y}
                          stroke="#f97316"
                          strokeWidth={2}
                          strokeDasharray="4 2"
                          opacity={0.8}
                        />
                      ))}
                  </g>
                );
              },
            ]}
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
                      setDisplayNode(next[next.length - 1] || null);
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
                    setDisplayNode(null);
                    onSelectNodeAction(null);
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
                {relatedEntities.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-slate-500">Related Entities</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {relatedEntities.map((entity) => (
                        <button
                          key={entity.id || entity.name}
                          className="px-2 py-0.5 rounded-full bg-emerald-100 text-xs text-emerald-700 hover:bg-emerald-200 transition"
                          onClick={() => onSelectNodeAction(entity.id || null)}
                        >
                          {entity.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-600">
                Click any bubble to view its description, connections, or capabilities. Use zoom gestures (scroll/pinch) to explore
                smaller nodes.
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Interaction Tips</h3>
        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
          <li>Zoom in/out with your mouse wheel or trackpad.</li>
          <li>Click a circle to highlight it and see metadata on the right.</li>
          <li>Colors represent entity types (Government, Industry, Projects, etc.).</li>
          <li>Use the Nivo toolbar (top-left) to reset zoom or center the view.</li>
        </ul>
      </div>
    </div>
  );
}

