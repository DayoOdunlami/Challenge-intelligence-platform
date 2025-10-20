'use client';

import React from 'react';
import { Challenge, Sector } from '@/lib/types';
import { Badge } from './badge';

interface HeatmapInsightsPanelProps {
  challenges: Challenge[];
  selectedSector?: Sector | null;
  selectedProblemType?: string | null;
  onSectorSelect?: (sector: Sector) => void;
  onProblemTypeSelect?: (problemType: string) => void;
  className?: string;
}

interface SectorAnalysis {
  sector: Sector;
  totalChallenges: number;
  totalFunding: number;
  problemTypes: string[];
  topProblemType: string;
  mostOverlapWith: { sector: Sector; count: number } | null;
  leastOverlapWith: { sector: Sector; count: number } | null;
  coreThemes: string[];
  divergentAreas: string[];
  avgFunding: number;
  urgencyDistribution: Record<string, number>;
}

interface ProblemTypeAnalysis {
  problemType: string;
  totalChallenges: number;
  totalFunding: number;
  sectors: Sector[];
  dominantSector: { sector: Sector; count: number };
  crossSectorPotential: number;
  coreThemes: string[];
  avgFunding: number;
  urgencyProfile: string;
}

// Analyze sector patterns and overlaps
function analyzeSectorPatterns(challenges: Challenge[]): SectorAnalysis[] {
  const sectors = [...new Set(challenges.map(c => c.sector.primary))];
  
  return sectors.map(sector => {
    const sectorChallenges = challenges.filter(c => c.sector.primary === sector);
    const problemTypes = [...new Set(sectorChallenges.map(c => c.problem_type.primary))];
    
    // Find problem type counts for this sector
    const problemTypeCounts = problemTypes.map(pt => ({
      problemType: pt,
      count: sectorChallenges.filter(c => c.problem_type.primary === pt).length
    }));
    
    const topProblemType = problemTypeCounts.sort((a, b) => b.count - a.count)[0]?.problemType || '';
    
    // Calculate overlaps with other sectors
    const overlaps = sectors
      .filter(s => s !== sector)
      .map(otherSector => {
        const otherSectorProblems = new Set(
          challenges.filter(c => c.sector.primary === otherSector).map(c => c.problem_type.primary)
        );
        const thisSectorProblems = new Set(problemTypes);
        const overlap = [...thisSectorProblems].filter(pt => otherSectorProblems.has(pt)).length;
        return { sector: otherSector, count: overlap };
      })
      .filter(o => o.count > 0);
    
    const mostOverlapWith = overlaps.sort((a, b) => b.count - a.count)[0] || null;
    const leastOverlapWith = overlaps.sort((a, b) => a.count - b.count)[0] || null;
    
    // Extract core themes from keywords
    const allKeywords = sectorChallenges.flatMap(c => c.keywords);
    const keywordCounts = allKeywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const coreThemes = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([keyword]) => keyword);
    
    // Find divergent areas (problem types with few challenges)
    const divergentAreas = problemTypeCounts
      .filter(pt => pt.count <= 2)
      .map(pt => pt.problemType)
      .slice(0, 2);
    
    const totalFunding = sectorChallenges.reduce((sum, c) => sum + (c.funding.amount_max || 0), 0);
    const avgFunding = totalFunding / sectorChallenges.length;
    
    // Urgency distribution
    const urgencyDistribution = sectorChallenges.reduce((acc, c) => {
      acc[c.timeline.urgency] = (acc[c.timeline.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      sector,
      totalChallenges: sectorChallenges.length,
      totalFunding,
      problemTypes,
      topProblemType,
      mostOverlapWith,
      leastOverlapWith,
      coreThemes,
      divergentAreas,
      avgFunding,
      urgencyDistribution
    };
  });
}

// Analyze problem type patterns across sectors
function analyzeProblemTypePatterns(challenges: Challenge[]): ProblemTypeAnalysis[] {
  const problemTypes = [...new Set(challenges.map(c => c.problem_type.primary))];
  
  return problemTypes.map(problemType => {
    const problemChallenges = challenges.filter(c => c.problem_type.primary === problemType);
    const sectors = [...new Set(problemChallenges.map(c => c.sector.primary))];
    
    // Find dominant sector
    const sectorCounts = sectors.map(sector => ({
      sector,
      count: problemChallenges.filter(c => c.sector.primary === sector).length
    }));
    
    const dominantSector = sectorCounts.sort((a, b) => b.count - a.count)[0];
    const crossSectorPotential = sectors.length; // More sectors = more collaboration potential
    
    // Extract core themes
    const allKeywords = problemChallenges.flatMap(c => c.keywords);
    const keywordCounts = allKeywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const coreThemes = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([keyword]) => keyword);
    
    const totalFunding = problemChallenges.reduce((sum, c) => sum + (c.funding.amount_max || 0), 0);
    const avgFunding = totalFunding / problemChallenges.length;
    
    // Urgency profile
    const urgencyCounts = problemChallenges.reduce((acc, c) => {
      acc[c.timeline.urgency] = (acc[c.timeline.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const urgencyProfile = Object.entries(urgencyCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'medium';
    
    return {
      problemType,
      totalChallenges: problemChallenges.length,
      totalFunding,
      sectors,
      dominantSector,
      crossSectorPotential,
      coreThemes,
      avgFunding,
      urgencyProfile
    };
  });
}

export function HeatmapInsightsPanel({
  challenges,
  selectedSector,
  selectedProblemType,
  onSectorSelect,
  onProblemTypeSelect,
  className = ''
}: HeatmapInsightsPanelProps) {
  const sectorAnalyses = React.useMemo(() => analyzeSectorPatterns(challenges), [challenges]);
  const problemTypeAnalyses = React.useMemo(() => analyzeProblemTypePatterns(challenges), [challenges]);
  
  const selectedSectorAnalysis = selectedSector ? 
    sectorAnalyses.find(s => s.sector === selectedSector) : null;
  
  const selectedProblemAnalysis = selectedProblemType ? 
    problemTypeAnalyses.find(p => p.problemType === selectedProblemType) : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* How to Use Heatmap */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3">Understanding the Heatmap</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <div>• <strong>Cell intensity</strong> = Number of challenges in that intersection</div>
          <div>• <strong>Row (Y-axis)</strong> = Infrastructure sectors</div>
          <div>• <strong>Column (X-axis)</strong> = Problem types</div>
          <div>• <strong>Click cells</strong> to see detailed analysis</div>
        </div>
      </div>

      {/* Selected Sector Analysis */}
      {selectedSectorAnalysis && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-medium text-orange-900 mb-3">
            {selectedSectorAnalysis.sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Sector Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-orange-800">Total Challenges:</span>
                <div className="text-xl font-bold text-orange-600">
                  {selectedSectorAnalysis.totalChallenges}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-orange-800">Total Funding:</span>
                <div className="text-xl font-bold text-green-600">
                  £{Math.round(selectedSectorAnalysis.totalFunding / 1000000)}M
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-orange-800">Top Problem Type:</span>
              <div className="mt-1">
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  {selectedSectorAnalysis.topProblemType}
                </Badge>
              </div>
            </div>
            
            {selectedSectorAnalysis.mostOverlapWith && (
              <div>
                <span className="text-sm font-medium text-orange-800">Most Overlap With:</span>
                <div className="text-sm text-orange-700 mt-1">
                  <strong>{selectedSectorAnalysis.mostOverlapWith.sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> 
                  ({selectedSectorAnalysis.mostOverlapWith.count} shared problem types)
                </div>
              </div>
            )}
            
            {selectedSectorAnalysis.leastOverlapWith && (
              <div>
                <span className="text-sm font-medium text-orange-800">Least Overlap With:</span>
                <div className="text-sm text-orange-700 mt-1">
                  <strong>{selectedSectorAnalysis.leastOverlapWith.sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> 
                  ({selectedSectorAnalysis.leastOverlapWith.count} shared problem types)
                </div>
              </div>
            )}
            
            <div>
              <span className="text-sm font-medium text-orange-800">Core Themes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedSectorAnalysis.coreThemes.map((theme, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
            
            {selectedSectorAnalysis.divergentAreas.length > 0 && (
              <div>
                <span className="text-sm font-medium text-orange-800">Divergent Areas:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSectorAnalysis.divergentAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs text-gray-600">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Problem Type Analysis */}
      {selectedProblemAnalysis && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-medium text-purple-900 mb-3">
            {selectedProblemAnalysis.problemType} Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-purple-800">Total Challenges:</span>
                <div className="text-xl font-bold text-purple-600">
                  {selectedProblemAnalysis.totalChallenges}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">Cross-Sector Reach:</span>
                <div className="text-xl font-bold text-blue-600">
                  {selectedProblemAnalysis.crossSectorPotential} sectors
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-purple-800">Dominant Sector:</span>
              <div className="text-sm text-purple-700 mt-1">
                <strong>{selectedProblemAnalysis.dominantSector.sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> 
                ({selectedProblemAnalysis.dominantSector.count} challenges)
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-purple-800">Average Funding:</span>
              <div className="text-lg font-bold text-green-600">
                £{Math.round(selectedProblemAnalysis.avgFunding / 1000)}K
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-purple-800">Urgency Profile:</span>
              <Badge 
                variant={selectedProblemAnalysis.urgencyProfile === 'critical' ? 'destructive' : 'secondary'}
                className="ml-2 capitalize"
              >
                {selectedProblemAnalysis.urgencyProfile}
              </Badge>
            </div>
            
            <div>
              <span className="text-sm font-medium text-purple-800">Core Themes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedProblemAnalysis.coreThemes.map((theme, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Insights */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-3">Strategic Insights</h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-green-800">Highest Synergy Potential:</span>
            <div className="text-sm text-green-700 mt-1">
              {sectorAnalyses
                .sort((a, b) => (b.mostOverlapWith?.count || 0) - (a.mostOverlapWith?.count || 0))
                .slice(0, 1)
                .map(s => `${s.sector.replace('_', ' ')} ↔ ${s.mostOverlapWith?.sector.replace('_', ' ')} (${s.mostOverlapWith?.count} shared areas)`)}
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-green-800">Most Cross-Sector Problem:</span>
            <div className="text-sm text-green-700 mt-1">
              {problemTypeAnalyses
                .sort((a, b) => b.crossSectorPotential - a.crossSectorPotential)
                .slice(0, 1)
                .map(p => `${p.problemType} (spans ${p.crossSectorPotential} sectors)`)}
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-green-800">Highest Funding Concentration:</span>
            <div className="text-sm text-green-700 mt-1">
              {sectorAnalyses
                .sort((a, b) => b.avgFunding - a.avgFunding)
                .slice(0, 1)
                .map(s => `${s.sector.replace('_', ' ')} (£${Math.round(s.avgFunding / 1000)}K avg per challenge)`)}
            </div>
          </div>
        </div>
      </div>

      {/* Selection Prompt */}
      {!selectedSector && !selectedProblemType && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-700 mb-2">Get Detailed Analysis</h3>
          <p className="text-sm text-gray-600">
            Click on any cell in the heatmap to see detailed analysis of that sector-problem intersection, 
            or use the sorting controls to explore patterns.
          </p>
        </div>
      )}
    </div>
  );
}

export default HeatmapInsightsPanel;