'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReactFlowNetworkView } from './ReactFlowNetworkView';
import { ReactFlowNetworkViewEnhanced } from './ReactFlowNetworkViewEnhanced';
import { EChartsGraphView } from './EChartsGraphView';
import { InfographicView } from './InfographicView';
import { CirclePackingSimpleNivo } from './CirclePackingSimpleNivo';
import { CirclePackingSimpleECharts } from './CirclePackingSimpleECharts';

export function StakeholderDynamicsView() {
  const [view, setView] = useState<
    'reactflow' | 'reactflow-enhanced' | 'infographic' | 'echarts' | 'circle-packing-nivo' | 'circle-packing-echarts'
  >(
    'reactflow-enhanced'
  );

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
          <CirclePackingSimpleNivo />
        </TabsContent>

        <TabsContent value="circle-packing-echarts" className="mt-0">
          <CirclePackingSimpleECharts />
        </TabsContent>
      </Tabs>
    </div>
  );
}

