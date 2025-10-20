'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { ChordDiagram } from '@/components/visualizations/ChordDiagram';
import { ChallengeFilters } from '@/components/filters/ChallengeFilters';
import ProfileFilterButton from '@/components/ui/ProfileFilterButton';
import QuickNavSidebar from '@/components/ui/QuickNavSidebar';
import ColorSchemeSelector from '@/components/ui/ColorSchemeSelector';
import VisualizationControlsPanel from '@/components/ui/VisualizationControlsPanel';
// import { ChordInsightsPanel } from '@/components/ui/ChordInsightsPanel';
import EnhancedChallengeDetails from '@/components/ui/EnhancedChallengeDetails';
import challenges from '@/data/challenges';
import { Challenge, FilterState, Sector } from '@/lib/types';

// Enhanced filter application logic
function applyFilters(challenges: Challenge[], filters: FilterState): Challenge[] {
  // Early return if no filters applied
  const hasFilters = 
    filters.sectors.length > 0 || 
    filters.problemTypes.length > 0 || 
    filters.budgetRange[0] > 0 || 
    filters.budgetRange[1] < 50000000 ||
    filters.urgentOnly ||
    filters.keywords.trim() !== '';
    
  if (!hasFilters) {
    return challenges;
  }
  
  // Pre-process keywords for performance
  const searchTerms = filters.keywords.trim() ? 
    filters.keywords.toLowerCase().split(/\s+/).filter(term => term.length > 0) : [];
  
  return challenges.filter(challenge => {
    // Sector filter (most selective first for performance)
    if (filters.sectors.length > 0) {
      if (!filters.sectors.includes(challenge.sector.primary)) {
        return false;
      }
    }
    
    // Problem type filter
    if (filters.problemTypes.length > 0) {
      if (!filters.problemTypes.includes(challenge.problem_type.primary)) {
        return false;
      }
    }
    
    // Budget range filter
    if (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 50000000) {
      const challengeBudget = challenge.funding.amount_max || 0;
      if (challengeBudget < filters.budgetRange[0] || challengeBudget > filters.budgetRange[1]) {
        return false;
      }
    }
    
    // Urgency filter
    if (filters.urgentOnly) {
      if (challenge.timeline.urgency !== 'critical') {
        return false;
      }
    }
    
    // Keywords filter (most expensive, so do it last)
    if (searchTerms.length > 0) {
      const challengeText = [
        challenge.title.toLowerCase(),
        challenge.description.toLowerCase(),
        ...challenge.keywords.map(k => k.toLowerCase())
      ].join(' ');
      
      // All search terms must be found (AND logic)
      const allTermsFound = searchTerms.every(term => challengeText.includes(term));
      if (!allTermsFound) {
        return false;
      }
    }
    
    return true;
  });
}

// Get filter statistics for UI feedback
function getFilterStats(challenges: Challenge[], filters: FilterState) {
  const filtered = applyFilters(challenges, filters);
  
  return {
    total: challenges.length,
    filtered: filtered.length,
    sectors: new Set(filtered.map(c => c.sector.primary)).size,
    problemTypes: new Set(filtered.map(c => c.problem_type.primary)).size,
    totalFunding: filtered.reduce((sum, c) => sum + (c.funding.amount_max || 0), 0),
    urgentCount: filtered.filter(c => c.timeline.urgency === 'critical').length
  };
}

export default function TestChordPage() {
  const [filters, setFilters] = useState<FilterState>({
    sectors: [],
    problemTypes: [],
    budgetRange: [0, 50000000],
    urgentOnly: false,
    keywords: ''
  });
  
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const filteredChallenges = applyFilters(challenges, filters);
  const filterStats = getFilterStats(challenges, filters);

  const handleSectorSelect = (sector: Sector) => {
    setSelectedSector(selectedSector === sector ? null : sector);
    
    // Also toggle sector in filters
    const newSectors = filters.sectors.includes(sector)
      ? filters.sectors.filter(s => s !== sector)
      : [...filters.sectors, sector];
    
    setFilters({
      ...filters,
      sectors: newSectors
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <QuickNavSidebar />
      <ColorSchemeSelector />
      
      {/* Chord-specific Controls Panel */}
      <VisualizationControlsPanel title="Chord Controls">
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h3 className="font-medium text-yellow-900 mb-2">Coming Soon</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <div>• Sector filtering controls</div>
              <div>• Connection strength threshold</div>
              <div>• Problem type grouping</div>
              <div>• Animation speed controls</div>
            </div>
          </div>
        </div>
      </VisualizationControlsPanel>
      
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Chord Diagram Test
            </h1>
            <Suspense fallback={<div>Loading...</div>}>
              <ProfileFilterButton />
            </Suspense>
          </div>
          <div className="flex space-x-4">
            <Link 
              href="/test-network" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Network Graph
            </Link>
            <span className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Chord Diagram
            </span>
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
              totalChallenges={challenges.length}
              filteredCount={filteredChallenges.length}
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <ChordDiagram
              challenges={filteredChallenges}
              onSectorSelect={handleSectorSelect}
              className="w-full"
            />
          </div>
          
          {/* Enhanced Insights Panel */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Enhanced Chord Insights */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">Chord Insights</h3>
                
                {/* What Connections Mean */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">Understanding Connections</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>• <strong>Chord thickness</strong> = Shared problem types</div>
                    <div>• <strong>Arc size</strong> = Total challenges in sector</div>
                    <div>• <strong>Colors</strong> = Different infrastructure sectors</div>
                  </div>
                </div>

                {/* Sector Analysis */}
                {selectedSector ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-orange-900 mb-3">
                      {selectedSector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Analysis
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-orange-800">Challenges:</span>
                          <div className="text-lg font-bold text-orange-600">
                            {filteredChallenges.filter(c => c.sector.primary === selectedSector).length}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-orange-800">Funding:</span>
                          <div className="text-lg font-bold text-green-600">
                            £{Math.round(filteredChallenges
                              .filter(c => c.sector.primary === selectedSector)
                              .reduce((sum, c) => sum + (c.funding.amount_max || 0), 0) / 1000000)}M
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-orange-800 text-sm">Problem Types:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.from(new Set(filteredChallenges
                            .filter(c => c.sector.primary === selectedSector)
                            .map(c => c.problem_type.primary)
                          )).slice(0, 3).map((problemType, index) => (
                            <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                              {problemType}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-orange-800 text-sm">Cross-Sector Signals:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.from(new Set(filteredChallenges
                            .filter(c => c.sector.primary === selectedSector)
                            .flatMap(c => c.sector.cross_sector_signals)
                          )).slice(0, 3).map((signal, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {signal}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Select a Sector</h4>
                    <p className="text-sm text-gray-600">Click on any sector in the chord diagram to see detailed analysis and collaboration opportunities.</p>
                  </div>
                )}

                {/* Network Overview */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3">Network Overview</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-green-800">Total Sectors:</span>
                      <div className="text-lg font-bold text-green-600">
                        {new Set(filteredChallenges.map(c => c.sector.primary)).size}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Problem Types:</span>
                      <div className="text-lg font-bold text-green-600">
                        {new Set(filteredChallenges.map(c => c.problem_type.primary)).size}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="font-medium text-green-800 text-sm">Collaboration Opportunities:</span>
                    <div className="text-sm text-green-700 mt-1 space-y-1">
                      <div>• <strong>AI/ML:</strong> {filteredChallenges.filter(c => 
                        c.keywords.some(k => k.toLowerCase().includes('ai') || k.toLowerCase().includes('machine learning'))
                      ).length} challenges across sectors</div>
                      <div>• <strong>Data Analytics:</strong> {filteredChallenges.filter(c => 
                        c.keywords.some(k => k.toLowerCase().includes('data') || k.toLowerCase().includes('analytics'))
                      ).length} challenges with data focus</div>
                      <div>• <strong>Net Zero:</strong> {filteredChallenges.filter(c => 
                        c.keywords.some(k => k.toLowerCase().includes('sustainability') || k.toLowerCase().includes('carbon'))
                      ).length} sustainability-focused challenges</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedChallenge && (
                <EnhancedChallengeDetails
                  challenge={selectedChallenge}
                  allChallenges={filteredChallenges}
                  links={[]}
                  clusters={[]}
                  onChallengeSelect={setSelectedChallenge}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Filter Results Summary */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Filter Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filterStats.filtered}
              </div>
              <div className="text-sm text-gray-600">
                of {filterStats.total} Challenges
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filterStats.sectors}
              </div>
              <div className="text-sm text-gray-600">Active Sectors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filterStats.problemTypes}
              </div>
              <div className="text-sm text-gray-600">Problem Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                £{Math.round(filterStats.totalFunding / 1000000)}M
              </div>
              <div className="text-sm text-gray-600">Total Funding</div>
            </div>
          </div>
          {filterStats.urgentCount > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                <strong>{filterStats.urgentCount}</strong> critical urgency challenges in current selection
              </div>
            </div>
          )}
          {filterStats.filtered === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                No challenges match the current filters. Try adjusting your criteria.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}