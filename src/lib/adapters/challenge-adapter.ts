/**
 * Adapter: Challenge → BaseEntity
 * 
 * Converts Challenge entities (Atlas) to universal BaseEntity format
 * with validation to catch mapping errors early.
 */

import type { Challenge } from '@/lib/types';
import type { BaseEntity } from '@/lib/base-entity';
import { validateBaseEntity } from '@/lib/base-entity-validation';

/**
 * Convert Challenge to BaseEntity
 */
export function challengeToBaseEntity(challenge: Challenge): BaseEntity {
  const entity: BaseEntity = {
    _version: '1.0',
    id: challenge.id,
    name: challenge.title, // Challenge uses 'title', BaseEntity uses 'name'
    description: challenge.description,
    entityType: 'challenge',
    domain: 'atlas',
    metadata: {
      sector: challenge.sector.primary,
      tags: challenge.keywords,
      category: challenge.problem_type.primary,
      trl: challenge.maturity.trl_min !== undefined
        ? {
            current: challenge.maturity.trl_max ?? challenge.maturity.trl_min,
            min: challenge.maturity.trl_min,
            max: challenge.maturity.trl_max ?? challenge.maturity.trl_min,
          }
        : undefined,
      status: challenge.timeline.urgency, // Map urgency to status
      funding: challenge.funding.amount_min !== undefined
        ? {
            amount: challenge.funding.amount_max ?? challenge.funding.amount_min,
            currency: challenge.funding.currency,
            type: challenge.funding.mechanism,
          }
        : undefined,
      dates: challenge.timeline.deadline
        ? {
            end: challenge.timeline.deadline,
          }
        : undefined,
      location: challenge.geography.scope
        ? {
            country: challenge.geography.scope === 'UK-wide' ? 'UK' : undefined,
            region: challenge.geography.specific_locations?.[0],
          }
        : undefined,
      custom: {
        // Store challenge-specific fields that don't map to BaseEntity
        problem_type: challenge.problem_type,
        buyer: challenge.buyer,
        source_url: challenge.source_url,
        cross_sector_signals: challenge.sector.cross_sector_signals,
        technology_domains: challenge.problem_type.technology_domains,
        evidence_required: challenge.maturity.evidence_required,
        deployment_ready: challenge.maturity.deployment_ready,
        trial_expected: challenge.maturity.trial_expected,
      },
    },
    visualizationHints: {
      color: getChallengeColor(challenge.sector.primary),
      size: calculateChallengeSize(challenge),
      priority: getChallengePriority(challenge.timeline.urgency),
    },
    _original: challenge,
  };

  // Validate before returning
  const validation = validateBaseEntity(entity);
  if (!validation.success) {
    console.error(`Invalid entity from challenge ${challenge.id}:`, validation.error);
    throw new Error(`Challenge adapter validation failed: ${validation.error.message}`);
  }

  return validation.data;
}

/**
 * Convert array of Challenges to BaseEntities
 */
export function challengesToBaseEntities(challenges: Challenge[]): BaseEntity[] {
  return challenges.map(challenge => challengeToBaseEntity(challenge));
}

/**
 * Helper: Get color for challenge based on sector
 */
function getChallengeColor(sector: string): string {
  const colorMap: Record<string, string> = {
    rail: '#006E51',
    energy: '#4A90E2',
    local_gov: '#8b5cf6',
    transport: '#50C878',
    built_env: '#F5A623',
    aviation: '#e76f51',
  };
  return colorMap[sector] || '#6b7280';
}

/**
 * Helper: Calculate size based on funding amount
 */
function calculateChallengeSize(challenge: Challenge): number {
  const amount = challenge.funding.amount_max ?? challenge.funding.amount_min ?? 0;
  // Normalize to 20-60 range
  if (amount === 0) return 30;
  const normalized = Math.min(60, Math.max(20, Math.log10(amount) * 10));
  return normalized;
}

/**
 * Helper: Get priority based on urgency
 */
function getChallengePriority(urgency: string): number {
  const priorityMap: Record<string, number> = {
    critical: 3,
    moderate: 2,
    flexible: 1,
  };
  return priorityMap[urgency] || 1;
}

