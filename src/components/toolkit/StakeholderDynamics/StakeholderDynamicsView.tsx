'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfographicView } from './InfographicView';
import { EChartsGraphView } from './EChartsGraphView';
import { Map, Network } from 'lucide-react';

export function StakeholderDynamicsView() {
  const [activeView, setActiveView] = useState<'infographic' | 'echarts'>('infographic');

  return (
    <div className="w-full">
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'infographic' | 'echarts')}>
        <TabsList className="mb-4">
          <TabsTrigger value="infographic" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Ecosystem Map
          </TabsTrigger>
          <TabsTrigger value="echarts" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Network Graph
          </TabsTrigger>
        </TabsList>

        <TabsContent value="infographic" className="mt-4">
          <InfographicView />
        </TabsContent>

        <TabsContent value="echarts" className="mt-4">
          <EChartsGraphView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

