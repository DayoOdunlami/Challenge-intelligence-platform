// Cluster Analysis Utilities for Network Intelligence
import { Challenge, NetworkLink } from './types';

export interface ClusterInfo {
  id: string;
  name: string;
  description: string;
  challenges: Challenge[];
  totalFunding: number;
  averageUrgency: number;
  dominantSector: string;
  crossSectorSignals: string[];
  size: number;
  centralityScore: number;
  keyThemes: string[];
}

export interface NetworkAnalysis {
  clusters: ClusterInfo[];
  totalClusters: number;
  averageClusterSize: number;
  networkDensity: number;
  mostCentralChallenges: Challenge[];
}

// Simple community detection using modularity-based clustering
export function detectClusters(
  challenges: Challenge[], 
  links: NetworkLink[], 
  minClusterSize: number = 3
): ClusterInfo[] {
  // Build adjacency list
  const adjacencyList = new Map<string, Set<string>>();
  
  challenges.forEach(challenge => {
    adjacencyList.set(challenge.id, new Set());
  });
  
  links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source;
    const targetId = typeof link.target === 'string' ? link.target : link.target;
    
    adjacencyList.get(sourceId)?.add(targetId);
    adjacencyList.get(targetId)?.add(sourceId);
  });
  
  // Simple clustering: group highly connected components
  const visited = new Set<string>();
  const clusters: Challenge[][] = [];
  
  challenges.forEach(challenge => {
    if (visited.has(challenge.id)) return;
    
    const cluster: Challenge[] = [];
    const queue = [challenge.id];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      const currentChallenge = challenges.find(c => c.id === currentId);
      if (currentChallenge) {
        cluster.push(currentChallenge);
      }
      
      // Add strongly connected neighbors (similarity > 0.4)
      const neighbors = adjacencyList.get(currentId) || new Set();
      neighbors.forEach(neighborId => {
        if (!visited.has(neighborId)) {
          const link = links.find(l => 
            (l.source === currentId && l.target === neighborId) ||
            (l.source === neighborId && l.target === currentId)
          );
          
          if (link && link.similarity > 0.4) {
            queue.push(neighborId);
          }
        }
      });
    }
    
    if (cluster.length >= minClusterSize) {
      clusters.push(cluster);
    }
  });
  
  // Convert to ClusterInfo objects
  return clusters.map((cluster, index) => {
    const totalFunding = cluster.reduce((sum, c) => sum + (c.funding.amount_max || 0), 0);
    const urgencyScores = cluster.map(c => getUrgencyScore(c.timeline.urgency));
    const averageUrgency = urgencyScores.reduce((sum, score) => sum + score, 0) / urgencyScores.length;
    
    // Find dominant sector
    const sectorCounts = new Map<string, number>();
    cluster.forEach(c => {
      sectorCounts.set(c.sector.primary, (sectorCounts.get(c.sector.primary) || 0) + 1);
    });
    const dominantSector = Array.from(sectorCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
    
    // Extract cross-sector signals
    const crossSectorSignals = Array.from(new Set(
      cluster.flatMap(c => c.sector.cross_sector_signals)
    ));
    
    // Extract key themes from keywords
    const keywordCounts = new Map<string, number>();
    cluster.forEach(c => {
      c.keywords.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });
    });
    
    const keyThemes = Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);
    
    return {
      id: `cluster_${index}`,
      name: generateClusterName(cluster, keyThemes),
      description: generateClusterDescription(cluster, dominantSector, keyThemes),
      challenges: cluster,
      totalFunding,
      averageUrgency,
      dominantSector,
      crossSectorSignals,
      size: cluster.length,
      centralityScore: calculateClusterCentrality(cluster, links),
      keyThemes
    };
  });
}

// Generate meaningful cluster names based on themes
function generateClusterName(cluster: Challenge[], keyThemes: string[]): string {
  if (keyThemes.length === 0) return `Cluster (${cluster.length} challenges)`;
  
  // Use top 2 themes to create name
  const primaryTheme = keyThemes[0];
  // const secondaryTheme = keyThemes[1]; // Reserved for future use
  
  if (primaryTheme.includes('AI') || primaryTheme.includes('artificial')) {
    return 'AI & Intelligence Systems';
  }
  if (primaryTheme.includes('sensor') || primaryTheme.includes('monitoring')) {
    return 'Sensing & Monitoring';
  }
  if (primaryTheme.includes('maintenance') || primaryTheme.includes('predictive')) {
    return 'Predictive Maintenance';
  }
  if (primaryTheme.includes('energy') || primaryTheme.includes('efficiency')) {
    return 'Energy Efficiency';
  }
  if (primaryTheme.includes('data') || primaryTheme.includes('analytics')) {
    return 'Data Analytics';
  }
  
  // Fallback: use primary theme
  return `${primaryTheme.charAt(0).toUpperCase() + primaryTheme.slice(1)} Cluster`;
}

// Generate cluster descriptions
function generateClusterDescription(
  cluster: Challenge[], 
  dominantSector: string, 
  keyThemes: string[]
): string {
  const sectorName = dominantSector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const themeList = keyThemes.slice(0, 3).join(', ');
  
  return `This cluster connects ${cluster.length} challenges focused on ${themeList}. ` +
         `Primarily led by ${sectorName} sector with £${Math.round(cluster.reduce((sum, c) => sum + (c.funding.amount_max || 0), 0) / 1000000)}M total funding.`;
}

// Calculate cluster centrality (how connected it is to other clusters)
function calculateClusterCentrality(cluster: Challenge[], links: NetworkLink[]): number {
  const clusterIds = new Set(cluster.map(c => c.id));
  let externalConnections = 0;
  
  links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source;
    const targetId = typeof link.target === 'string' ? link.target : link.target;
    
    const sourceInCluster = clusterIds.has(sourceId);
    const targetInCluster = clusterIds.has(targetId);
    
    // Count connections to external nodes
    if (sourceInCluster && !targetInCluster) externalConnections++;
    if (!sourceInCluster && targetInCluster) externalConnections++;
  });
  
  return externalConnections / cluster.length; // Normalize by cluster size
}

// Convert urgency to numeric score
function getUrgencyScore(urgency: string): number {
  const scores: Record<string, number> = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1
  };
  return scores[urgency] || 2;
}

// Find similar challenges based on network connections
export function findSimilarChallenges(
  targetChallenge: Challenge,
  allChallenges: Challenge[],
  links: NetworkLink[],
  limit: number = 5
): Array<{ challenge: Challenge; similarity: number }> {
  const similarities: Array<{ challenge: Challenge; similarity: number }> = [];
  
  links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source;
    const targetId = typeof link.target === 'string' ? link.target : link.target;
    
    let relatedChallenge: Challenge | undefined;
    
    if (sourceId === targetChallenge.id) {
      relatedChallenge = allChallenges.find(c => c.id === targetId);
    } else if (targetId === targetChallenge.id) {
      relatedChallenge = allChallenges.find(c => c.id === sourceId);
    }
    
    if (relatedChallenge && link.similarity) {
      similarities.push({
        challenge: relatedChallenge,
        similarity: link.similarity
      });
    }
  });
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

// Analyze network position of a challenge
export function analyzeNetworkPosition(
  challenge: Challenge,
  links: NetworkLink[]
): {
  position: 'central_hub' | 'bridge' | 'specialist' | 'isolated';
  connectionCount: number;
  averageSimilarity: number;
  description: string;
} {
  const connections = links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source;
    const targetId = typeof link.target === 'string' ? link.target : link.target;
    return sourceId === challenge.id || targetId === challenge.id;
  });
  
  const connectionCount = connections.length;
  const averageSimilarity = connectionCount > 0 
    ? connections.reduce((sum, link) => sum + (link.similarity || 0), 0) / connectionCount
    : 0;
  
  let position: 'central_hub' | 'bridge' | 'specialist' | 'isolated';
  let description: string;
  
  if (connectionCount === 0) {
    position = 'isolated';
    description = 'This challenge has unique characteristics with no strong connections to others.';
  } else if (connectionCount >= 8 && averageSimilarity > 0.6) {
    position = 'central_hub';
    description = 'This challenge is highly connected and central to its problem domain.';
  } else if (connectionCount >= 4 && averageSimilarity < 0.5) {
    position = 'bridge';
    description = 'This challenge bridges different problem areas or sectors.';
  } else {
    position = 'specialist';
    description = 'This challenge has focused connections within a specific niche.';
  }
  
  return {
    position,
    connectionCount,
    averageSimilarity,
    description
  };
}

// Log user interactions for future AI training
export function logUserInteraction(
  action: string,
  data: Record<string, unknown>
): void {
  // In a real implementation, this would send to analytics service
  if (typeof window !== 'undefined') {
    const interaction = {
      timestamp: new Date().toISOString(),
      action,
      data,
      sessionId: getSessionId()
    };
    
    // Store locally for now (could be sent to analytics service)
    const interactions = JSON.parse(localStorage.getItem('network_interactions') || '[]');
    interactions.push(interaction);
    
    // Keep only last 100 interactions
    if (interactions.length > 100) {
      interactions.splice(0, interactions.length - 100);
    }
    
    localStorage.setItem('network_interactions', JSON.stringify(interactions));
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('network_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('network_session_id', sessionId);
  }
  return sessionId;
}