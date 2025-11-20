'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReactFlowNetworkView } from './ReactFlowNetworkView';
import { ReactFlowNetworkViewEnhanced } from './ReactFlowNetworkViewEnhanced';
import { EChartsGraphView } from './EChartsGraphView';
import { InfographicView } from './InfographicView';
import { CirclePackingSimpleNivo } from './CirclePackingSimpleNivo';
import { CirclePackingSimpleECharts } from './CirclePackingSimpleECharts';
import { buildCirclePackingMaps, getHighlightedIds } from '@/lib/circlePackingRelationships';

export function StakeholderDynamicsView() {
  const [view, setView] = useState<
    'reactflow' | 'reactflow-enhanced' | 'infographic' | 'echarts' | 'circle-packing-nivo' | 'circle-packing-echarts'
  >(
    'reactflow-enhanced'
  );
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
      <Tabs
        value={view}
        onValueChange={(v) =>
          setView(v as 'reactflow' | 'reactflow-enhanced' | 'infographic' | 'echarts' | 'circle-packing-nivo' | 'circle-packing-echarts')
        }
      >
        <TabsList className="mb-4">
          <TabsTrigger value="reactflow-enhanced">React Flow (Enhanced)</TabsTrigger>
          <TabsTrigger value="reactflow">React Flow (Basic)</TabsTrigger>
          <TabsTrigger value="infographic">Ecosystem Map</TabsTrigger>
          <TabsTrigger value="echarts">ECharts Graph</TabsTrigger>
          <TabsTrigger value="circle-packing-nivo">Circle Packing (Nivo - Simple)</TabsTrigger>
          <TabsTrigger value="circle-packing-echarts">Circle Packing (ECharts - Simple)</TabsTrigger>
        </TabsList>

        <TabsContent value="reactflow-enhanced" className="mt-0">
          <ReactFlowNetworkViewEnhanced />
        </TabsContent>

        <TabsContent value="reactflow" className="mt-0">
          <ReactFlowNetworkView />
        </TabsContent>

        <TabsContent value="infographic" className="mt-0">
          <InfographicView />
        </TabsContent>

        <TabsContent value="echarts" className="mt-0">
          <EChartsGraphView />
        </TabsContent>

        <TabsContent value="circle-packing-nivo" className="mt-0">
          <CirclePackingSimpleNivo
            selectedId={selectedEntityId}
            selectedNode={selectedNode}
            highlightedIds={highlightedIds}
            relatedEntities={relatedEntities}
            onSelectNodeAction={setSelectedEntityId}
          />
        </TabsContent>

        <TabsContent value="circle-packing-echarts" className="mt-0">
          <CirclePackingSimpleECharts
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

