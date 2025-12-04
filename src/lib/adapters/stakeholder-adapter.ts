/**
 * Adapter: Stakeholder → BaseEntity
 * 
 * Converts Stakeholder entities (Navigate) to universal BaseEntity format
 * with validation to catch mapping errors early.
 */

import type { Stakeholder } from '@/lib/navigate-types';
import type { BaseEntity } from '@/lib/base-entity';
import { validateBaseEntity } from '@/lib/base-entity-validation';

/**
 * Convert Stakeholder to BaseEntity
 */
export function stakeholderToBaseEntity(stakeholder: Stakeholder): BaseEntity {
  const entity: BaseEntity = {
    _version: '1.0',
    id: stakeholder.id,
    name: stakeholder.name,
    description: stakeholder.description,
    entityType: 'stakeholder',
    domain: 'navigate',
    metadata: {
      sector: stakeholder.sector,
      tags: stakeholder.tags,
      category: stakeholder.type === 'Research' ? 'Academia' : stakeholder.type, // Map 'Research' to 'Academia' for consistency
      status: 'active', // Stakeholders are typically active
      funding: stakeholder.total_funding_provided
        ? {
            amount: stakeholder.total_funding_provided,
            currency: 'GBP',
            type: 'grant', // Default, could be enhanced
          }
        : undefined,
      location: stakeholder.location
        ? {
            country: stakeholder.location.country,
            region: stakeholder.location.region,
          }
        : undefined,
      custom: {
        // Store stakeholder-specific fields
        type: stakeholder.type,
        funding_capacity: stakeholder.funding_capacity,
        total_funding_received: stakeholder.total_funding_received,
        relationship_count: stakeholder.relationship_count,
        influence_score: stakeholder.influence_score,
        contact: stakeholder.contact,
        capacity_scenarios: stakeholder.capacity_scenarios,
      },
    },
    visualizationHints: {
      color: getStakeholderColor(stakeholder.type),
      size: calculateStakeholderSize(stakeholder),
      priority: getStakeholderPriority(stakeholder),
    },
    _original: stakeholder,
  };

  // Validate before returning
  const validation = validateBaseEntity(entity);
  if (!validation.success) {
    console.error(`Invalid entity from stakeholder ${stakeholder.id}:`, validation.error);
    throw new Error(`Stakeholder adapter validation failed: ${validation.error.message}`);
  }

  return validation.data;
}

/**
 * Convert array of Stakeholders to BaseEntities
 */
export function stakeholdersToBaseEntities(stakeholders: Stakeholder[]): BaseEntity[] {
  return stakeholders.map(stakeholder => stakeholderToBaseEntity(stakeholder));
}

/**
 * Helper: Get color for stakeholder based on type
 */
function getStakeholderColor(type: string): string {
  const colorMap: Record<string, string> = {
    Government: '#006E51',
    Research: '#7b2cbf',
    Industry: '#e76f51',
    Intermediary: '#2d8f6f',
    'Working Group': '#ec4899',
  };
  return colorMap[type] || '#6b7280';
}

/**
 * Helper: Calculate size based on funding capacity and relationships
 */
function calculateStakeholderSize(stakeholder: Stakeholder): number {
  const funding = stakeholder.total_funding_provided ?? 0;
  const relationships = stakeholder.relationship_count ?? 0;
  
  // Combine factors: funding (log scale) + relationships
  const fundingScore = funding > 0 ? Math.log10(funding) * 5 : 20;
  const relationshipScore = relationships * 2;
  const combined = fundingScore + relationshipScore;
  
  // Normalize to 20-60 range
  return Math.min(60, Math.max(20, combined));
}

/**
 * Helper: Get priority based on funding capacity and influence
 */
function getStakeholderPriority(stakeholder: Stakeholder): number {
  const capacityMap: Record<string, number> = {
    High: 3,
    Medium: 2,
    Low: 1,
  };
  const basePriority = capacityMap[stakeholder.funding_capacity] || 1;
  const influence = stakeholder.influence_score ?? 0;
  
  // Boost priority if high influence
  return basePriority + (influence > 0.7 ? 1 : 0);
}

