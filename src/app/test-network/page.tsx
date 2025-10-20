'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NetworkGraph } from '@/components/visualizations/NetworkGraph';
import { ChallengeFilters } from '@/components/filters/ChallengeFilters';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import ProfileFilterButton from '@/components/ui/ProfileFilterButton';
import QuickNavSidebar from '@/components/ui/QuickNavSidebar';
import ColorSchemeSelector from '@/components/ui/ColorSchemeSelector';
import CPCFooter from '@/components/ui/CPCFooter';
import EnhancedChallengeDetails from '@/components/ui/EnhancedChallengeDetails';
import ClusterInsightsPanel from '@/components/ui/ClusterInsightsPanel';
import { Suspense } from 'react';
import challenges from '@/data/challenges';
import { ClusterInfo } from '@/lib/cluster-analysis';

function TestNetworkContent() {
  const { 
    filteredChallenges, 
    filters, 
    selectedChallenge, 
    setFilters, 
    setSelectedChallenge,
    challenges: allChallenges
  } = useAppContext();
  
  const [detectedClusters, setDetectedClusters] = useState<ClusterInfo[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<ClusterInfo | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'clusters'>('network');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <QuickNavSidebar />
      <ColorSchemeSelector />
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Network Graph Test
            </h1>
            <Suspense fallback={<div>Loading...</div>}>
              <ProfileFilterButton />
            </Suspense>
          </div>
          <div className="flex space-x-4">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Network Graph
            </span>
            <Link 
              href="/test-chord" 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Chord Diagram
            </Link>
            <Link 
              href="/test-sunburst" 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Sunburst Chart
            </Link>
            <Link 
              href="/test-heatmap" 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Heatmap
            </Link>
            <Link 
              href="/test-sankey" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sankey Diagram
            </Link>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('network')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'network'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Network Analysis
              </button>
              <button
                onClick={() => setViewMode('clusters')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'clusters'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cluster Insights ({detectedClusters.length})
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ChallengeFilters
              filters={filters}
              onFiltersChange={setFilters}
              totalChallenges={allChallenges.length}
              filteredCount={filteredChallenges.length}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {viewMode === 'network' ? (
              <NetworkGraph
                challenges={filteredChallenges}
                selectedChallenge={selectedChallenge}
                onChallengeSelect={setSelectedChallenge}
                onClustersDetected={setDetectedClusters}
              />
            ) : (
              <ClusterInsightsPanel
                clusters={detectedClusters}
                selectedCluster={selectedCluster}
                onClusterSelect={setSelectedCluster}
                onChallengeSelect={setSelectedChallenge}
              />
            )}
          </div>

          {/* Enhanced Details Panel */}
          <div className="lg:col-span-1">
            <EnhancedChallengeDetails
              challenge={selectedChallenge}
              allChallenges={filteredChallenges}
              links={[]} // Will be populated by NetworkGraph
              clusters={detectedClusters}
              onChallengeSelect={setSelectedChallenge}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestNetworkPage() {
  return (
    <AppProvider initialChallenges={challenges}>
      <TestNetworkContent />
      <CPCFooter />
    </AppProvider>
  );
}