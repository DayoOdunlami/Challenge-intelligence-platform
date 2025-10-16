import { Challenge, Sector, SimilarityEdge, NetworkNode, NetworkLink, Innovation, EvidenceFlow, FilterState } from './types';

// Sector color mapping for consistent visualization
export function getSectorColor(sector: Sector): string {
  const colors: Record<Sector, string> = {
    rail: '#3b82f6',      // blue
    energy: '#22c55e',    // green
    local_gov: '#a855f7', // purple
    transport: '#f59e0b', // orange
    built_env: '#ef4444', // red
    aviation: '#06b6d4'   // cyan
  };
  return colors[sector] || '#6b7280';
}

// Calculate similarity between two challenges using Jaccard similarity + bonuses
export function calculateSimilarity(ch1: Challenge, ch2: Challenge): number {
  // Keyword overlap (Jaccard similarity)
  const keywords1 = new Set(ch1.keywords);
  const keywords2 = new Set(ch2.keywords);
  
  const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
  const union = new Set([...keywords1, ...keywords2]);
  
  const keywordScore = union.size > 0 ? intersection.size / union.size : 0;
  
  // Problem type match bonus
  const problemScore = ch1.problem_type.primary === ch2.problem_type.primary ? 0.3 : 0;
  
  // Cross-sector signals bonus
  const crossSectorMatch = ch1.sector.secondary.some(s => 
    s === ch2.sector.primary || ch2.sector.secondary.includes(s)
  ) ? 0.2 : 0;
  
  return Math.min(1, keywordScore + problemScore + crossSectorMatch);
}

// Build similarity matrix for all challenges
export function buildSimilarityMatrix(challenges: Challenge[], threshold: number = 0.2): SimilarityEdge[] {
  const edges: SimilarityEdge[] = [];
  
  for (let i = 0; i < challenges.length; i++) {
    for (let j = i + 1; j < challenges.length; j++) {
      const similarity = calculateSimilarity(challenges[i], challenges[j]);
      
      // Only create edge if similarity > threshold
      if (similarity > threshold) {
        const keywords1 = new Set(challenges[i].keywords);
        const keywords2 = new Set(challenges[j].keywords);
        const shared_keywords = [...keywords1].filter(x => keywords2.has(x));
        
        edges.push({
          source: challenges[i].id,
          target: challenges[j].id,
          similarity,
          shared_keywords,
          matching_method: 'keyword_overlap'
        });
      }
    }
  }
  
  return edges;
}

// Transform challenges to network graph format for react-force-graph-2d
export function toNetworkGraphData(challenges: Challenge[]): { nodes: NetworkNode[], links: NetworkLink[] } {
  const nodes: NetworkNode[] = challenges.map(ch => ({
    id: ch.id,
    label: ch.title,
    sector: ch.sector.primary,
    value: Math.max(2, Math.min(12, (ch.funding.amount_max || 100000) / 100000)), // node size 2-12
    color: getSectorColor(ch.sector.primary)
  }));
  
  const similarityEdges = buildSimilarityMatrix(challenges);
  const links: NetworkLink[] = similarityEdges.map(edge => ({
    source: edge.source,
    target: edge.target,
    similarity: edge.similarity,
    width: edge.similarity * 3 // edge thickness
  }));
  
  return { nodes, links };
}

// Transform for Chord diagram (sector overlap)
export function toChordData(challenges: Challenge[]) {
  // Count shared problem types between sectors
  const sectorProblems: Record<string, Set<string>> = {};
  
  challenges.forEach(ch => {
    if (!sectorProblems[ch.sector.primary]) {
      sectorProblems[ch.sector.primary] = new Set();
    }
    sectorProblems[ch.sector.primary].add(ch.problem_type.primary);
  });
  
  // Build matrix for chord diagram
  const sectors = Object.keys(sectorProblems);
  const data = [];
  
  for (const from of sectors) {
    for (const to of sectors) {
      if (from !== to) {
        const shared = [...sectorProblems[from]].filter(p => 
          sectorProblems[to].has(p)
        );
        
        if (shared.length > 0) {
          data.push({
            source: from,
            target: to,
            value: shared.length
          });
        }
      }
    }
  }
  
  return data;
}

// Transform for Sunburst diagram (hierarchical view)
export function toSunburstData(challenges: Challenge[]) {
  const root = {
    name: 'All Challenges',
    children: [] as Array<{ name: string; children: Array<{ name: string; children: Array<{ name: string; value: number }> }> }>
  };
  
  // Group by sector -> problem type -> individual challenges
  const grouped = challenges.reduce((acc, ch) => {
    if (!acc[ch.sector.primary]) {
      acc[ch.sector.primary] = {};
    }
    if (!acc[ch.sector.primary][ch.problem_type.primary]) {
      acc[ch.sector.primary][ch.problem_type.primary] = [];
    }
    acc[ch.sector.primary][ch.problem_type.primary].push(ch);
    return acc;
  }, {} as Record<string, Record<string, Challenge[]>>);
  
  // Build hierarchy
  for (const [sector, problems] of Object.entries(grouped)) {
    const sectorNode = {
      name: sector,
      children: [] as Array<{ name: string; children: Array<{ name: string; value: number }> }>
    };
    
    for (const [problemType, chs] of Object.entries(problems)) {
      const problemNode = {
        name: problemType,
        children: chs.map(ch => ({
          name: ch.title,
          value: ch.funding.amount_max || 100000
        }))
      };
      sectorNode.children.push(problemNode);
    }
    
    root.children.push(sectorNode);
  }
  
  return root;
}

// Transform for Heatmap (SME-Challenge matching - Phase 2)
export function toHeatmapData(innovations: Innovation[], challenges: Challenge[]) {
  const data = [];
  
  for (const innovation of innovations) {
    for (const challenge of challenges) {
      const matchScore = calculateInnovationMatch(innovation, challenge);
      if (matchScore > 0.1) { // Only show meaningful matches
        data.push({
          innovation: innovation.name,
          challenge: challenge.title,
          matchScore: Math.round(matchScore * 100),
          sectors: innovation.sectors_proven.join(', '),
          problemTypes: challenge.problem_type.primary
        });
      }
    }
  }
  
  return data;
}

// Calculate innovation-challenge match score (Phase 2)
export function calculateInnovationMatch(innovation: Innovation, challenge: Challenge): number {
  // Sector match
  const sectorMatch = innovation.sectors_proven.includes(challenge.sector.primary) ? 0.4 : 
                     innovation.sectors_applicable.includes(challenge.sector.primary) ? 0.2 : 0;
  
  // Problem type match
  const problemMatch = innovation.problem_types.includes(challenge.problem_type.primary) ? 0.3 : 0;
  
  // Keyword overlap
  const innovationKeywords = new Set(innovation.description.toLowerCase().split(' '));
  const challengeKeywords = new Set(challenge.keywords.map(k => k.toLowerCase()));
  const intersection = new Set([...innovationKeywords].filter(x => challengeKeywords.has(x)));
  const keywordScore = intersection.size > 0 ? Math.min(0.3, intersection.size * 0.1) : 0;
  
  return sectorMatch + problemMatch + keywordScore;
}

// Define types for Sankey diagram data
interface SankeyNode {
  id: string;
  nodeColor: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Transform for Sankey diagram (Evidence transfer - Phase 3)
export function toSankeyData(evidenceFlows: EvidenceFlow[]): SankeyData {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];
  
  // Create nodes for sectors and evidence types
  const sectors = [...new Set(evidenceFlows.flatMap(f => [f.fromSector, f.toSector]))];
  const evidenceTypes = [...new Set(evidenceFlows.map(f => f.evidenceType))];
  
  sectors.forEach(sector => {
    nodes.push({ 
      id: sector, 
      nodeColor: getSectorColor(sector as Sector) 
    });
  });
  
  evidenceTypes.forEach(evidence => {
    nodes.push({ 
      id: evidence, 
      nodeColor: '#94a3b8' 
    });
  });
  
  // Create links showing evidence flow
  evidenceFlows.forEach(flow => {
    links.push({
      source: flow.fromSector,
      target: flow.evidenceType,
      value: flow.transferability
    });
    links.push({
      source: flow.evidenceType,
      target: flow.toSector,
      value: flow.transferability
    });
  });
  
  return { nodes, links };
}

// Apply filters to challenge dataset with performance optimizations
export function applyFilters(challenges: Challenge[], filters: FilterState): Challenge[] {
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
export function getFilterStats(challenges: Challenge[], filters: FilterState) {
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

// Get top similar challenges for a given challenge
export function getSimilarChallenges(
  targetChallenge: Challenge, 
  allChallenges: Challenge[], 
  limit: number = 5
): Challenge[] {
  const similarities = allChallenges
    .filter(ch => ch.id !== targetChallenge.id)
    .map(ch => ({
      challenge: ch,
      similarity: calculateSimilarity(targetChallenge, ch)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
  
  return similarities.map(s => s.challenge);
}