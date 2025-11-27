/**
 * Enhanced Stakeholder Adapter - Example with Provenance
 * 
 * This shows how to update the existing stakeholder adapter to include
 * provenance information automatically.
 */

import type { Stakeholder } from '@/lib/navigate-types';
import type { BaseEntity } from '@/lib/base-entity-enhanced'; // Use enhanced version
import { validateBaseEntity } from '@/lib/base-entity-validation';
import { createNavigateProvenance } from './provenance-helpers';

/**
 * Convert Stakeholder to BaseEntity with Provenance
 * 
 * This is the enhanced version that automatically includes provenance.
 */
export function stakeholderToBaseEntity(stakeholder: Stakeholder): BaseEntity {
  // Create entity as before, but now BaseEntity requires provenance
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
      category: stakeholder.type,
      status: 'active',
      funding: stakeholder.total_funding_provided
        ? {
            amount: stakeholder.total_funding_provided,
            currency: 'GBP',
            type: 'grant',
          }
        : undefined,
      location: stakeholder.location
        ? {
            country: stakeholder.location.country,
            region: stakeholder.location.region,
          }
        : undefined,
      custom: {
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
    
    // NEW: Add provenance automatically
    // This gives us data quality, source tracking, and audit trail
    provenance: createNavigateProvenance(stakeholder.id),
    
    _original: stakeholder,
  };

  // If stakeholder has existing data_quality info, enhance provenance
  if (stakeholder.data_quality) {
    // Map existing data_quality to provenance
    if (stakeholder.data_quality.confidence === 'verified') {
      entity.provenance.quality.verificationStatus = 'verified';
      entity.provenance.quality.confidence = 0.9; // Verified = high confidence
      entity.provenance.quality.verifiedBy = stakeholder.data_quality.verified_by;
      entity.provenance.freshness.lastVerifiedAt = stakeholder.data_quality.last_verified;
    }
  }

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

// Helper functions remain the same...
function getStakeholderColor(type: string): string {
  const colorMap: Record<string, string> = {
    Government: '#006E51',
    Research: '#7b2cbf',
    Industry: '#e76f51',
    Intermediary: '#2d8f6f',
  };
  return colorMap[type] || '#6b7280';
}

function calculateStakeholderSize(stakeholder: Stakeholder): number {
  const funding = stakeholder.total_funding_provided ?? 0;
  const relationships = stakeholder.relationship_count ?? 0;
  const fundingScore = funding > 0 ? Math.log10(funding) * 5 : 20;
  const relationshipScore = relationships * 2;
  const combined = fundingScore + relationshipScore;
  return Math.min(60, Math.max(20, combined));
}

function getStakeholderPriority(stakeholder: Stakeholder): number {
  const capacityMap: Record<string, number> = {
    High: 3,
    Medium: 2,
    Low: 1,
  };
  const basePriority = capacityMap[stakeholder.funding_capacity] || 1;
  const influence = stakeholder.influence_score ?? 0;
  return basePriority + (influence > 0.7 ? 1 : 0);
}

/**
 * Example: Enhanced adapter that uses existing data_quality fields
 * 
 * If your Stakeholder type already has data_quality, you can map it:
 */
export function stakeholderToBaseEntityWithExistingQuality(
  stakeholder: Stakeholder
): BaseEntity {
  const baseEntity = stakeholderToBaseEntity(stakeholder);
  
  // Enhance provenance from existing data_quality field
  if (stakeholder.data_quality) {
    // Map confidence levels
    const confidenceMap: Record<string, number> = {
      verified: 0.9,
      estimated: 0.7,
      placeholder: 0.4,
    };
    
    baseEntity.provenance.quality.confidence = 
      confidenceMap[stakeholder.data_quality.confidence] || 0.5;
    
    baseEntity.provenance.quality.verificationStatus = 
      stakeholder.data_quality.confidence === 'verified' 
        ? 'verified' 
        : 'unverified';
    
    if (stakeholder.data_quality.verified_by) {
      baseEntity.provenance.quality.verifiedBy = stakeholder.data_quality.verified_by;
    }
    
    if (stakeholder.data_quality.last_verified) {
      baseEntity.provenance.freshness.lastVerifiedAt = stakeholder.data_quality.last_verified;
    }
    
    if (stakeholder.data_quality.notes) {
      // Add as flag if there are concerns
      baseEntity.provenance.flags = baseEntity.provenance.flags || [];
      baseEntity.provenance.flags.push({
        type: 'custom',
        severity: 'info',
        message: stakeholder.data_quality.notes,
        flaggedAt: stakeholder.data_quality.last_verified || new Date().toISOString(),
        flaggedBy: stakeholder.data_quality.verified_by || 'system',
      });
    }
  }
  
  return baseEntity;
}

