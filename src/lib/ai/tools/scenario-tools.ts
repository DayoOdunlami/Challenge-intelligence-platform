/**
 * Scenario Modeling Tools
 * 
 * Tools for AI agent to perform "what-if" analysis and scenario modeling.
 * These tools enable the AI to reason about platform data, not just retrieve it.
 */

import type { BaseEntity } from '@/lib/base-entity-enhanced';
import type { Domain, EntityType } from '@/lib/base-entity-enhanced';
import { unifiedEntities, unifiedRelationships } from '@/data/unified';

export interface AITool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (params: any) => Promise<any>;
}

/**
 * Tool 1: Filter Entities
 */
export const filterEntitiesTool: AITool = {
  name: 'filter_entities',
  description: 'Filter entities by criteria (domain, TRL, sector, funding, entity type). Use for "show only", "filter by", or "what if we only consider" queries.',
  parameters: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        enum: ['atlas', 'navigate', 'cpc-internal', 'reference', 'cross-domain'],
        description: 'Filter by domain',
      },
      entityType: {
        type: 'string',
        enum: ['challenge', 'stakeholder', 'technology', 'project', 'funding_event'],
        description: 'Filter by entity type',
      },
      trlRange: {
        type: 'array',
        items: { type: 'number' },
        minItems: 2,
        maxItems: 2,
        description: 'TRL range [min, max] (1-9)',
      },
      sector: {
        type: 'string',
        description: 'Filter by sector',
      },
      minFunding: {
        type: 'number',
        description: 'Minimum funding amount',
      },
      maxFunding: {
        type: 'number',
        description: 'Maximum funding amount',
      },
    },
  },
  execute: async (params: {
    domain?: Domain;
    entityType?: EntityType;
    trlRange?: [number, number];
    sector?: string;
    minFunding?: number;
    maxFunding?: number;
  }) => {
    let filtered = [...unifiedEntities];
    
    if (params.domain) {
      filtered = filtered.filter(e => e.domain === params.domain);
    }
    if (params.entityType) {
      filtered = filtered.filter(e => e.entityType === params.entityType);
    }
    if (params.trlRange) {
      filtered = filtered.filter(e => {
        const trl = e.metadata.trl;
        if (typeof trl === 'number') {
          return trl >= params.trlRange![0] && trl <= params.trlRange![1];
        }
        if (typeof trl === 'object' && trl.min !== undefined) {
          return trl.min >= params.trlRange![0] && trl.max <= params.trlRange![1];
        }
        return false;
      });
    }
    if (params.sector) {
      filtered = filtered.filter(e => {
        const sector = e.metadata.sector;
        if (typeof sector === 'string') return sector === params.sector;
        if (Array.isArray(sector)) return sector.includes(params.sector!);
        return false;
      });
    }
    if (params.minFunding !== undefined) {
      filtered = filtered.filter(e => {
        const funding = e.metadata.funding?.amount || 0;
        return funding >= params.minFunding!;
      });
    }
    if (params.maxFunding !== undefined) {
      filtered = filtered.filter(e => {
        const funding = e.metadata.funding?.amount || 0;
        return funding <= params.maxFunding!;
      });
    }
    
    const totalFunding = filtered.reduce((sum, e) => {
      return sum + (e.metadata.funding?.amount || 0);
    }, 0);
    
    return {
      count: filtered.length,
      entities: filtered.slice(0, 50).map(e => ({
        id: e.id,
        name: e.name,
        entityType: e.entityType,
        domain: e.domain,
      })),
      totalFunding,
      averageFunding: filtered.length > 0 ? totalFunding / filtered.length : 0,
      summary: `Found ${filtered.length} entities matching criteria. Total funding: £${(totalFunding / 1000000).toFixed(1)}M`,
    };
  },
};

/**
 * Tool 2: Calculate Funding Gap
 */
export const calculateFundingGapTool: AITool = {
  name: 'calculate_funding_gap',
  description: 'Calculate funding gap for a sector or challenge set. Can apply multipliers for "what-if" scenarios (e.g., "what if funding doubled?").',
  parameters: {
    type: 'object',
    properties: {
      sector: {
        type: 'string',
        description: 'Sector to analyze',
      },
      challengeIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific challenge IDs to analyze',
      },
      fundingMultiplier: {
        type: 'number',
        description: 'Apply multiplier to available funding (e.g., 2.0 = double funding, 0.5 = halve funding)',
      },
    },
  },
  execute: async (params: {
    sector?: string;
    challengeIds?: string[];
    fundingMultiplier?: number;
  }) => {
    // Find challenges
    let challenges = unifiedEntities.filter(e => e.entityType === 'challenge');
    
    if (params.sector) {
      challenges = challenges.filter(c => {
        const sector = c.metadata.sector;
        return typeof sector === 'string' 
          ? sector === params.sector
          : Array.isArray(sector) && sector.includes(params.sector!);
      });
    }
    if (params.challengeIds) {
      challenges = challenges.filter(c => params.challengeIds!.includes(c.id));
    }
    
    // Calculate total funding needed
    const totalNeeded = challenges.reduce((sum, c) => {
      const funding = c.metadata.funding;
      if (funding?.amount) return sum + funding.amount;
      if (funding?.amountMin && funding.amountMax) {
        return sum + (funding.amountMin + funding.amountMax) / 2;
      }
      return sum;
    }, 0);
    
    // Find available funding from stakeholders
    let stakeholders = unifiedEntities.filter(e => e.entityType === 'stakeholder');
    
    if (params.sector) {
      stakeholders = stakeholders.filter(s => {
        const sector = s.metadata.sector;
        return typeof sector === 'string'
          ? sector === params.sector
          : Array.isArray(sector) && sector.includes(params.sector!);
      });
    }
    
    const availableFunding = stakeholders.reduce((sum, s) => {
      const funding = (s.metadata.custom as any)?.total_funding_provided || 0;
      return sum + funding;
    }, 0);
    
    // Apply multiplier if scenario
    const multiplier = params.fundingMultiplier || 1.0;
    const adjustedAvailable = availableFunding * multiplier;
    const gap = totalNeeded - adjustedAvailable;
    
    return {
      sector: params.sector || 'all',
      challenges: challenges.length,
      totalNeeded,
      availableFunding: availableFunding,
      adjustedAvailable,
      multiplier,
      gap,
      isGap: gap > 0,
      message: gap > 0
        ? `Funding gap of £${(gap / 1000000).toFixed(1)}M. ${challenges.length} challenges need £${(totalNeeded / 1000000).toFixed(1)}M but only £${(adjustedAvailable / 1000000).toFixed(1)}M is available.`
        : `Funding surplus of £${(Math.abs(gap) / 1000000).toFixed(1)}M.`,
    };
  },
};

/**
 * Tool 3: Find Similar Challenges
 */
export const findSimilarChallengesTool: AITool = {
  name: 'find_similar_challenges',
  description: 'Find challenges similar to given challenge. Can search across domains to find solutions from other sectors.',
  parameters: {
    type: 'object',
    properties: {
      challengeId: {
        type: 'string',
        description: 'Challenge ID to find similar challenges for',
      },
      crossDomain: {
        type: 'boolean',
        description: 'Search across domains (e.g., find rail solutions for aviation challenge)',
        default: false,
      },
      topK: {
        type: 'number',
        description: 'Number of similar challenges to return',
        default: 5,
      },
    },
    required: ['challengeId'],
  },
  execute: async (params: {
    challengeId: string;
    crossDomain?: boolean;
    topK?: number;
  }) => {
    const challenge = unifiedEntities.find(e => 
      e.id === params.challengeId && e.entityType === 'challenge'
    );
    
    if (!challenge) {
      throw new Error(`Challenge ${params.challengeId} not found`);
    }
    
    // Find similar challenges
    let candidates = unifiedEntities.filter(e => 
      e.entityType === 'challenge' && e.id !== params.challengeId
    );
    
    // Filter domain if not cross-domain
    if (!params.crossDomain) {
      candidates = candidates.filter(e => e.domain === challenge.domain);
    }
    
    // Compute similarity (simplified - use vector store in production)
    const similarities = candidates.map(c => {
      const similarity = computeSimpleSimilarity(challenge, c);
      return { challenge: c, similarity };
    });
    
    // Sort and take topK
    similarities.sort((a, b) => b.similarity - a.similarity);
    const top = similarities.slice(0, params.topK || 5);
    
    return {
      sourceChallenge: {
        id: challenge.id,
        name: challenge.name,
        domain: challenge.domain,
      },
      similarChallenges: top.map(t => ({
        id: t.challenge.id,
        name: t.challenge.name,
        domain: t.challenge.domain,
        similarity: Math.round(t.similarity * 100),
      })),
      crossDomain: params.crossDomain || false,
      message: `Found ${top.length} similar challenge${top.length !== 1 ? 's' : ''}${params.crossDomain ? ' across domains' : ''}`,
    };
  },
};

/**
 * Tool 4: Find Dependencies
 */
export const findDependenciesTool: AITool = {
  name: 'find_dependencies',
  description: 'Find entities that depend on or are connected to a given entity. Shows network dependencies.',
  parameters: {
    type: 'object',
    properties: {
      entityId: {
        type: 'string',
        description: 'Entity ID to find dependencies for',
      },
      relationshipTypes: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by relationship types (funds, collaborates_with, etc.)',
      },
    },
    required: ['entityId'],
  },
  execute: async (params: {
    entityId: string;
    relationshipTypes?: string[];
  }) => {
    const entity = unifiedEntities.find(e => e.id === params.entityId);
    if (!entity) {
      throw new Error(`Entity ${params.entityId} not found`);
    }
    
    // Find relationships
    let relationships = unifiedRelationships.filter(r =>
      r.source === params.entityId || r.target === params.entityId
    );
    
    if (params.relationshipTypes) {
      relationships = relationships.filter(r =>
        params.relationshipTypes!.includes(r.type)
      );
    }
    
    // Get connected entities
    const connectedIds = new Set<string>();
    relationships.forEach(r => {
      if (r.source === params.entityId) connectedIds.add(r.target);
      if (r.target === params.entityId) connectedIds.add(r.source);
    });
    
    const connectedEntities = unifiedEntities.filter(e => connectedIds.has(e.id));
    
    // Group by relationship type
    const byType: Record<string, number> = {};
    relationships.forEach(r => {
      byType[r.type] = (byType[r.type] || 0) + 1;
    });
    
    return {
      entity: {
        id: entity.id,
        name: entity.name,
        entityType: entity.entityType,
      },
      connections: relationships.length,
      connectedEntities: connectedEntities.map(e => ({
        id: e.id,
        name: e.name,
        entityType: e.entityType,
        domain: e.domain,
      })),
      relationshipBreakdown: byType,
      message: `${entity.name} is connected to ${connectedEntities.length} entities through ${relationships.length} relationships.`,
    };
  },
};

/**
 * Tool 5: Simulate Removal
 */
export const simulateRemovalTool: AITool = {
  name: 'simulate_removal',
  description: 'Show network impact if entity is removed. Identifies which entities would become disconnected or isolated.',
  parameters: {
    type: 'object',
    properties: {
      entityId: {
        type: 'string',
        description: 'Entity ID to simulate removal of',
      },
    },
    required: ['entityId'],
  },
  execute: async (params: { entityId: string }) => {
    // First get dependencies
    const dependencies = await findDependenciesTool.execute({
      entityId: params.entityId,
    });
    
    // Find entities that would become isolated
    const isolatedEntities: BaseEntity[] = [];
    
    dependencies.connectedEntities.forEach(entity => {
      // Check if entity has other connections
      const otherConnections = unifiedRelationships.filter(r =>
        (r.source === entity.id || r.target === entity.id) &&
        r.source !== params.entityId &&
        r.target !== params.entityId
      );
      
      // If only connected through removed entity, it becomes isolated
      if (otherConnections.length === 0) {
        const fullEntity = unifiedEntities.find(e => e.id === entity.id);
        if (fullEntity) isolatedEntities.push(fullEntity);
      }
    });
    
    const removedEntity = unifiedEntities.find(e => e.id === params.entityId);
    
    return {
      removedEntity: {
        id: params.entityId,
        name: removedEntity?.name || 'Unknown',
      },
      disconnectedEntities: dependencies.connectedEntities.length,
      isolatedEntities: isolatedEntities.map(e => ({
        id: e.id,
        name: e.name,
        entityType: e.entityType,
      })),
      impact: {
        connectionsLost: dependencies.connections,
        entitiesIsolated: isolatedEntities.length,
        networkFragmentation: unifiedEntities.length > 0
          ? isolatedEntities.length / unifiedEntities.length
          : 0,
      },
      message: `Removing ${removedEntity?.name || 'this entity'} would disconnect ${dependencies.connectedEntities.length} entities, of which ${isolatedEntities.length} would become isolated.`,
    };
  },
};

/**
 * Tool 6: Compare Scenarios
 */
export const compareScenariosTool: AITool = {
  name: 'compare_scenarios',
  description: 'Compare two filtered views side-by-side (scenario A vs scenario B). Shows differences in entities, funding, and metrics.',
  parameters: {
    type: 'object',
    properties: {
      scenarioA: {
        type: 'object',
        description: 'Filter criteria for scenario A',
        properties: {
          domain: { type: 'string' },
          entityType: { type: 'string' },
          trlRange: { type: 'array', items: { type: 'number' } },
          sector: { type: 'string' },
        },
      },
      scenarioB: {
        type: 'object',
        description: 'Filter criteria for scenario B',
        properties: {
          domain: { type: 'string' },
          entityType: { type: 'string' },
          trlRange: { type: 'array', items: { type: 'number' } },
          sector: { type: 'string' },
        },
      },
    },
    required: ['scenarioA', 'scenarioB'],
  },
  execute: async (params: {
    scenarioA: any;
    scenarioB: any;
  }) => {
    const resultA = await filterEntitiesTool.execute(params.scenarioA);
    const resultB = await filterEntitiesTool.execute(params.scenarioB);
    
    // Find differences
    const entityIdsA = new Set(resultA.entities.map((e: any) => e.id));
    const entityIdsB = new Set(resultB.entities.map((e: any) => e.id));
    
    const onlyInA = resultA.entities.filter((e: any) => !entityIdsB.has(e.id));
    const onlyInB = resultB.entities.filter((e: any) => !entityIdsA.has(e.id));
    const inBoth = resultA.entities.filter((e: any) => entityIdsB.has(e.id));
    
    return {
      scenarioA: {
        count: resultA.count,
        funding: resultA.totalFunding,
        entities: resultA.entities.slice(0, 10),
      },
      scenarioB: {
        count: resultB.count,
        funding: resultB.totalFunding,
        entities: resultB.entities.slice(0, 10),
      },
      differences: {
        onlyInA: onlyInA.length,
        onlyInB: onlyInB.length,
        inBoth: inBoth.length,
        fundingDifference: resultB.totalFunding - resultA.totalFunding,
        countDifference: resultB.count - resultA.count,
      },
      summary: `Scenario A has ${resultA.count} entities (£${(resultA.totalFunding / 1000000).toFixed(1)}M). Scenario B has ${resultB.count} entities (£${(resultB.totalFunding / 1000000).toFixed(1)}M). ${inBoth.length} entities appear in both scenarios.`,
    };
  },
};

/**
 * Tool 7: Get Network Statistics
 */
export const getNetworkStatisticsTool: AITool = {
  name: 'get_network_statistics',
  description: 'Get statistics about current network view (entity counts, funding totals, relationship counts, etc.).',
  parameters: {
    type: 'object',
    properties: {
      entityIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Entity IDs to analyze (if empty, analyzes all)',
      },
    },
  },
  execute: async (params: { entityIds?: string[] }) => {
    const entities = params.entityIds
      ? unifiedEntities.filter(e => params.entityIds!.includes(e.id))
      : unifiedEntities;
    
    // Count by type
    const byType: Record<string, number> = {};
    entities.forEach(e => {
      byType[e.entityType] = (byType[e.entityType] || 0) + 1;
    });
    
    // Count by domain
    const byDomain: Record<string, number> = {};
    entities.forEach(e => {
      byDomain[e.domain] = (byDomain[e.domain] || 0) + 1;
    });
    
    // Calculate funding
    const totalFunding = entities.reduce((sum, e) => {
      return sum + (e.metadata.funding?.amount || 0);
    }, 0);
    
    // Count relationships
    const entityIds = new Set(entities.map(e => e.id));
    const relationships = unifiedRelationships.filter(r =>
      entityIds.has(r.source) && entityIds.has(r.target)
    );
    
    return {
      totalEntities: entities.length,
      byType,
      byDomain,
      totalFunding,
      averageFunding: entities.length > 0 ? totalFunding / entities.length : 0,
      relationships: relationships.length,
      averageConnections: entities.length > 0 ? relationships.length / entities.length : 0,
      summary: `Network contains ${entities.length} entities across ${Object.keys(byDomain).length} domains, with ${relationships.length} relationships and £${(totalFunding / 1000000).toFixed(1)}M in total funding.`,
    };
  },
};

/**
 * All scenario tools
 */
export const scenarioTools: AITool[] = [
  filterEntitiesTool,
  calculateFundingGapTool,
  findSimilarChallengesTool,
  findDependenciesTool,
  simulateRemovalTool,
  compareScenariosTool,
  getNetworkStatisticsTool,
];

/**
 * Helper: Compute simple similarity (temporary, replace with vector store)
 */
function computeSimpleSimilarity(a: BaseEntity, b: BaseEntity): number {
  // Temporary simple similarity - replace with vector store in production
  let score = 0;
  
  // Name similarity
  if (a.name.toLowerCase() === b.name.toLowerCase()) score += 0.5;
  
  // Description keyword overlap
  const wordsA = new Set(a.description.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.description.toLowerCase().split(/\s+/));
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  score += (intersection.size / union.size) * 0.5;
  
  return Math.min(1, score);
}

