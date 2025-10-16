'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { SunburstChart } from '@/components/visualizations/SunburstChart';
import { ChallengeFilters } from '@/components/filters/ChallengeFilters';
import ProfileFilterButton from '@/components/ui/ProfileFilterButton';
import QuickNavSidebar from '@/components/ui/QuickNavSidebar';
import ColorSchemeSelector from '@/components/ui/ColorSchemeSelector';
import challenges from '@/data/challenges';
import { FilterState, Challenge } from '@/lib/types';

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

export default function TestSunburstPage() {
  const [filters, setFilters] = useState<FilterState>({
    sectors: [],
    problemTypes: [],
    budgetRange: [0, 50000000],
    urgentOnly: false,
    keywords: ''
  });

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const filteredChallenges = applyFilters(challenges, filters);
  const filterStats = getFilterStats(challenges, filters);

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <QuickNavSidebar />
      <ColorSchemeSelector />
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Sunburst Chart Test
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
            <Link 
              href="/test-chord" 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Chord Diagram
            </Link>
            <span className="px-4 py-2 bg-purple-600 text-white rounded-lg">
              Sunburst Chart
            </span>
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
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Sunburst Chart */}
              <SunburstChart
                challenges={filteredChallenges}
                onChallengeSelect={handleChallengeSelect}
                className="w-full"
              />
              
              {/* Selected Challenge Details */}
              {selectedChallenge && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Selected Challenge</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{selectedChallenge.title}</h3>
                      <p className="text-gray-600 mb-4">{selectedChallenge.description}</p>
                      <div className="space-y-2">
                        <div><strong>Sector:</strong> {selectedChallenge.sector.primary.replace('_', ' ')}</div>
                        <div><strong>Problem Type:</strong> {selectedChallenge.problem_type.primary}</div>
                        <div><strong>Funding:</strong> £{(selectedChallenge.funding.amount_max || 0).toLocaleString()}</div>
                        <div><strong>Urgency:</strong> {selectedChallenge.timeline.urgency}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedChallenge.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Enhanced Stats */}
              <div className="bg-white rounded-lg shadow p-6">
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
        </div>
      </div>
    </div>
  );
}