'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CirclePackingSimpleECharts } from './CirclePackingSimpleECharts';
import { D3NetworkGraphView } from './D3NetworkGraphView';
import { buildCirclePackingMaps, getHighlightedIds } from '@/lib/circlePackingRelationships';

export function StakeholderDynamicsView() {
  const [view, setView] = useState<'circle' | 'network-d3'>('network-d3');
  const { nodeMap, adjacency } = useMemo(() => buildCirclePackingMaps(), []);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const highlightedIds = useMemo(() => getHighlightedIds(selectedEntityId, adjacency), [selectedEntityId, adjacency]);
  const selectedNode = selectedEntityId ? nodeMap[selectedEntityId] : null;
  const relatedEntities = useMemo(() => {
    if (!selectedEntityId) return [];
    const relatedIds = adjacency[selectedEntityId];
    if (!relatedIds) return [];
    return Array.from(relatedIds)
      .map((id) => nodeMap[id])
      .filter((node): node is NonNullable<typeof node> => Boolean(node));
  }, [selectedEntityId, adjacency, nodeMap]);

  return (
    <div className="w-full">
      <Tabs value={view} onValueChange={(v) => setView(v as 'circle' | 'network-d3')}>
        <TabsList className="mb-4 flex flex-wrap gap-2">
          <TabsTrigger value="circle">Stakeholder Circle</TabsTrigger>
          <TabsTrigger value="network-d3">Stakeholder Network (D3)</TabsTrigger>
        </TabsList>

        <TabsContent value="circle" className="mt-0">
          <CirclePackingSimpleECharts
            selectedId={selectedEntityId}
            selectedNode={selectedNode}
            highlightedIds={highlightedIds}
            relatedEntities={relatedEntities}
            onSelectNodeAction={setSelectedEntityId}
          />
        </TabsContent>

        <TabsContent value="network-d3" className="mt-0">
          <D3NetworkGraphView
            selectedId={selectedEntityId}
            selectedNode={selectedNode}
            highlightedIds={highlightedIds}
            relatedEntities={relatedEntities}
            onSelectNodeAction={setSelectedEntityId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

