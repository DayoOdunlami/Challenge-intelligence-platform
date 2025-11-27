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

interface UnifiedInsightsPanelProps {
  selectedEntity: {
    type: 'stakeholder' | 'technology' | 'project' | 'funding';
    id: string;
    data: any;
  } | null;
  relatedEntities?: CirclePackingNode[];
  onEntitySelect?: (entity: { type: 'stakeholder' | 'technology' | 'project' | 'funding'; id: string; data: any } | null) => void;
  onClearSelection?: () => void;
  emptyState?: string;
  showQuickStats?: boolean;
  quickStats?: {
    totalFunding: number;
    totalStakeholders: number;
    totalTechnologies: number;
    totalProjects: number;
  };
}

export function UnifiedInsightsPanel({
  selectedEntity,
  relatedEntities = [],
  onEntitySelect,
  onClearSelection,
  emptyState = 'Click on visualization elements to see detailed insights here.',
  showQuickStats = true,
  quickStats,
}: UnifiedInsightsPanelProps) {
  // Check if this is a Toolkit entity (has CirclePackingNode structure)
  const isToolkitEntity = selectedEntity?.data && (
    'connections' in selectedEntity.data ||
    'projects' in selectedEntity.data ||
    'members' in selectedEntity.data ||
    selectedEntity.data.entityType
  );

  // If Toolkit entity, use the detailed format
  if (isToolkitEntity && selectedEntity) {
    const node = selectedEntity.data as CirclePackingNode;
    const safeRelatedEntities = Array.isArray(relatedEntities) ? relatedEntities : [];
    const groupedRelated = safeRelatedEntities.reduce((acc, entity) => {
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
      <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
        <h3 className="text-lg font-semibold text-[#006E51] mb-4">Insights</h3>
        <div className="space-y-4">
          <div className="p-4 bg-[#CCE2DC]/20 rounded-lg space-y-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                {node.type?.toUpperCase() || selectedEntity.type.toUpperCase()}
              </div>
              <div className="text-lg font-semibold text-slate-900">{node.name}</div>
            </div>

            {INFO_FIELDS.map(({ label, key }) => {
              const value = node[key];
              if (value === null || value === undefined) return null;
              if (Array.isArray(value) || typeof value === 'object') return null;
              return (
                <div key={key as string}>
                  <div className="text-xs font-medium text-slate-500">{label}</div>
                  <div className="text-sm text-slate-900">{String(value)}</div>
                </div>
              );
            })}

            {node.capabilities && node.capabilities.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-500">Capabilities</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {node.capabilities.map((cap) => (
                    <span key={cap} className="px-2 py-0.5 rounded-full bg-slate-200 text-xs text-slate-700">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {node.connections && node.connections.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-500">Connections</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {node.connections.map((connection) => (
                    <span key={connection} className="px-2 py-0.5 rounded-full bg-slate-200 text-xs text-slate-700">
                      {connection.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {safeRelatedEntities.length > 0 && (
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
                              onClick={() => {
                                if (onEntitySelect && entity.id) {
                                  onEntitySelect({
                                    type: 'stakeholder',
                                    id: entity.id,
                                    data: { ...entity, entityType: entity.type },
                                  });
                                }
                              }}
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

            {(onClearSelection || onEntitySelect) && (
              <button
                onClick={() => {
                  onClearSelection?.();
                  onEntitySelect?.(null);
                }}
                className="text-xs text-[#006E51] hover:underline"
              >
                Clear selection
              </button>
            )}
          </div>

          {showQuickStats && quickStats && (
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-medium text-[#006E51] mb-3">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Funding</span>
                  <span className="font-medium">£{(quickStats.totalFunding / 1000000).toFixed(0)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stakeholders</span>
                  <span className="font-medium">{quickStats.totalStakeholders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Technologies</span>
                  <span className="font-medium">{quickStats.totalTechnologies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Projects</span>
                  <span className="font-medium">{quickStats.totalProjects}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Generic format for non-Toolkit entities
  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
      <h3 className="text-lg font-semibold text-[#006E51] mb-4">Insights</h3>
      <div className="space-y-4">
        {selectedEntity ? (
          <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
            <h4 className="font-medium text-[#006E51] mb-2 capitalize">
              {selectedEntity.type} Details
            </h4>
            <h5 className="font-semibold mb-1">{selectedEntity.data.name}</h5>
            {selectedEntity.data.description && (
              <p className="text-sm text-gray-600 mb-2">{selectedEntity.data.description}</p>
            )}
            {(onClearSelection || onEntitySelect) && (
              <button
                onClick={() => {
                  onClearSelection?.();
                  onEntitySelect?.(null);
                }}
                className="text-xs text-[#006E51] hover:underline"
              >
                Clear selection
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
            <h4 className="font-medium text-[#006E51] mb-2">Overview</h4>
            <p className="text-sm text-gray-600">{emptyState}</p>
          </div>
        )}

        {showQuickStats && quickStats && (
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-[#006E51] mb-3">Quick Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Funding</span>
                <span className="font-medium">£{(quickStats.totalFunding / 1000000).toFixed(0)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stakeholders</span>
                <span className="font-medium">{quickStats.totalStakeholders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Technologies</span>
                <span className="font-medium">{quickStats.totalTechnologies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Projects</span>
                <span className="font-medium">{quickStats.totalProjects}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

