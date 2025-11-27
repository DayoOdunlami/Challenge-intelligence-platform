'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TopNavigation } from '@/components/ui/TopNavigation';
import { UnifiedFloatingNav } from '@/components/ui/UnifiedFloatingNav';
import { Wrench } from 'lucide-react';
import { InnovationTrackerSankey } from '@/components/toolkit/InnovationTrackerSankey';
import { EnhancedInnovationTracker } from '@/components/toolkit/InnovationTracker';
import { StakeholderDynamicsView } from '@/components/toolkit/StakeholderDynamicsView';

export default function ToolkitPage() {
  const [activeTool, setActiveTool] = useState<'stakeholder' | 'innovation'>('stakeholder');
  const [trackerVersion, setTrackerVersion] = useState<'enhanced' | 'classic'>('enhanced');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CCE2DC]/20 via-white to-[#CCE2DC]/10">
      <TopNavigation />
      <UnifiedFloatingNav currentPage="toolkit" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="h-8 w-8 text-[#006E51]" />
            <h1 className="text-3xl font-bold text-[#006E51]">NAVIGATE Toolkit</h1>
          </div>
          <p className="text-gray-600">
            Interactive tools for exploring stakeholder dynamics and innovation flows in the UK zero-emission aviation ecosystem
          </p>
        </div>

        <Tabs defaultValue="stakeholder" className="w-full" onValueChange={(value) => setActiveTool(value as 'stakeholder' | 'innovation')}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="stakeholder">Stakeholder Dynamics</TabsTrigger>
            <TabsTrigger value="innovation">Innovation Tracker</TabsTrigger>
          </TabsList>

          <TabsContent value="stakeholder" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Stakeholder Dynamics</CardTitle>
                <CardDescription>
                  Explore the ecosystem of government, academia, industry, and intermediary organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StakeholderDynamicsView />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="innovation" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Innovation Tracker</CardTitle>
                    <CardDescription>
                      Track funding flows from public and private sources through intermediaries to innovation recipients
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Version:</span>
                    <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                      <button
                        onClick={() => setTrackerVersion('enhanced')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                          trackerVersion === 'enhanced'
                            ? 'bg-[#006E51] text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        Enhanced
                      </button>
                      <button
                        onClick={() => setTrackerVersion('classic')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                          trackerVersion === 'classic'
                            ? 'bg-[#006E51] text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        Classic
                      </button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {trackerVersion === 'enhanced' ? (
                  <EnhancedInnovationTracker />
                ) : (
                  <InnovationTrackerSankey />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
