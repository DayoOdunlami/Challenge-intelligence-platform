'use client';

import React from 'react';
import Link from 'next/link';
import { NetworkGraph } from '@/components/visualizations/NetworkGraph';
import { ChallengeFilters } from '@/components/filters/ChallengeFilters';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import ProfileFilterButton from '@/components/ui/ProfileFilterButton';
import QuickNavSidebar from '@/components/ui/QuickNavSidebar';
import ColorSchemeSelector from '@/components/ui/ColorSchemeSelector';
import CPCFooter from '@/components/ui/CPCFooter';
import { Suspense } from 'react';
import challenges from '@/data/challenges';

function TestNetworkContent() {
  const { 
    filteredChallenges, 
    filters, 
    selectedChallenge, 
    setFilters, 
    setSelectedChallenge,
    challenges: allChallenges
  } = useAppContext();

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

          {/* Network Graph */}
          <div className="lg:col-span-2">
            <NetworkGraph
              challenges={filteredChallenges}
              selectedChallenge={selectedChallenge}
              onChallengeSelect={setSelectedChallenge}
            />
          </div>

          {/* Challenge Details Panel */}
          <div className="lg:col-span-1">
            {selectedChallenge ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Challenge Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedChallenge.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedChallenge.description}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Sector:</span>
                      <p className="capitalize">{selectedChallenge.sector.primary.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="font-medium">Urgency:</span>
                      <p className="capitalize">{selectedChallenge.timeline.urgency}</p>
                    </div>
                    <div>
                      <span className="font-medium">Problem Type:</span>
                      <p>{selectedChallenge.problem_type.primary}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Funding Range:</span>
                    <p className="text-sm">
                      £{selectedChallenge.funding.amount_min?.toLocaleString()} - 
                      £{selectedChallenge.funding.amount_max?.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium">Organization:</span>
                    <p className="text-sm">{selectedChallenge.buyer.organization}</p>
                  </div>

                  <div>
                    <span className="font-medium">Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedChallenge.keywords.slice(0, 5).map((keyword, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedChallenge.sector.cross_sector_signals.length > 0 && (
                    <div>
                      <span className="font-medium">Cross-Sector Signals:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedChallenge.sector.cross_sector_signals.map((signal, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                          >
                            {signal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="font-medium">Deadline:</span>
                    <p className="text-sm">
                      {selectedChallenge.timeline.deadline?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Challenge Details</h2>
                <p className="text-gray-600">Click on a node in the network graph to see challenge details.</p>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Dataset Overview</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• {allChallenges.length} total challenges</p>
                    <p>• {filteredChallenges.length} currently visible</p>
                    <p>• 6 infrastructure sectors</p>
                    <p>• Cross-sector connections shown as links</p>
                    <p>• Node size represents funding amount</p>
                    <p>• Colors represent different sectors</p>
                  </div>
                </div>
              </div>
            )}
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