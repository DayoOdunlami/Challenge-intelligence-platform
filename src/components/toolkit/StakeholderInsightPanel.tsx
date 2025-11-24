'use client';

import { CirclePackingNode } from '@/data/toolkit/circlePackingData';

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

type Props = {
  selectedNode: CirclePackingNode | null;
  relatedEntities: CirclePackingNode[];
  onSelectNodeAction: (id: string | null) => void;
  emptyState?: string;
};

export function StakeholderInsightPanel({
  selectedNode,
  relatedEntities,
  onSelectNodeAction,
  emptyState = 'Select an entity to view its description, connections, and related organisations.',
}: Props) {
  if (!selectedNode) {
    return (
      <div className="text-sm text-slate-600">
        {emptyState}
      </div>
    );
  }

  const groupedRelated = relatedEntities.reduce((acc, entity) => {
    const type = entity.type || 'other';
    let category: 'stakeholders' | 'projects' | 'working_groups' | 'other';

    if (type === 'project') {
      category = 'projects';
    } else if (type === 'working_group') {
      category = 'working_groups';
    } else if (['stakeholder', 'government', 'intermediary', 'industry', 'academia'].includes(type)) {
      category = 'stakeholders';
    } else {
      category = 'other';
    }

    if (!acc[category]) acc[category] = [];
    acc[category].push(entity);
    return acc;
  }, {} as Record<string, CirclePackingNode[]>);

  const categories = [
    { key: 'stakeholders', label: 'Stakeholders' },
    { key: 'projects', label: 'Projects' },
    { key: 'working_groups', label: 'Working Groups' },
    { key: 'other', label: 'Other' },
  ];

  return (
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
          <div className="text-xs font-medium text-slate-500 mb-2">Related Entities</div>
          <div className="space-y-3">
            {categories
              .filter((cat) => groupedRelated[cat.key] && groupedRelated[cat.key].length > 0)
              .map((category) => (
                <div key={category.key}>
                  <div className="text-xs font-semibold text-slate-600 mb-1.5">
                    {category.label}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {groupedRelated[category.key].map((entity) => (
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
              ))}
          </div>
        </div>
      )}
    </div>
  );
}


