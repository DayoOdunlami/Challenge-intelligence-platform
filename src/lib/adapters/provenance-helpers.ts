/**
 * Provenance Helpers for Adapters
 * 
 * These utilities help adapters automatically add provenance information
 * when converting domain-specific entities to BaseEntity.
 */

import type { DataSourceType } from '../base-entity-enhanced';
import { createDefaultProvenance, type Provenance } from '../base-entity-enhanced';

/**
 * Create provenance for entities imported from Navigate dataset
 */
export function createNavigateProvenance(entityId: string): Provenance {
  return createDefaultProvenance({
    type: 'excel_import', // Or 'manual_entry' if from seed data
    name: 'Navigate Dataset (navigate-dummy-data.ts)',
    reference: 'Navigate1.0/src/data/navigate-dummy-data.ts',
    ingestedBy: 'navigate-adapter',
  });
}

/**
 * Create provenance for entities imported from Atlas (Challenges)
 */
export function createAtlasProvenance(challengeId: string): Provenance {
  return createDefaultProvenance({
    type: 'scraped', // Challenges are scraped from portals
    name: 'Atlas Challenge Dataset',
    reference: 'Navigate1.0/src/data/challenges.ts',
    ingestedBy: 'atlas-adapter',
  });
}

/**
 * Create provenance for computed relationships (similarity-based)
 */
export function createComputedRelationshipProvenance(
  algorithm: string,
  confidence: number
): Provenance['provenance'] {
  const now = new Date().toISOString();
  
  return {
    derivation: 'computed',
    confidence,
    verificationStatus: 'auto_verified', // Auto-verified by algorithm
    createdAt: now,
    computation: {
      algorithm,
      parameters: {
        threshold: 0.2, // Example: similarity threshold
      },
      explanation: `Relationship computed using ${algorithm} algorithm`,
    },
  };
}

/**
 * Create provenance for explicit relationships (from Navigate)
 */
export function createExplicitRelationshipProvenance(
  sourceName: string
): Provenance['provenance'] {
  const now = new Date().toISOString();
  
  return {
    derivation: 'explicit',
    confidence: 0.9, // Explicit relationships are high confidence
    verificationStatus: 'verified', // Explicit = verified
    createdAt: now,
    source: {
      type: 'excel_import',
      name: sourceName,
      ingestedAt: now,
    },
  };
}

/**
 * Helper: Merge provenance from multiple sources (for merged entities)
 */
export function mergeProvenance(
  provenances: Provenance[],
  mergedBy: string
): Provenance {
  if (provenances.length === 0) {
    throw new Error('Cannot merge empty provenance array');
  }
  
  if (provenances.length === 1) {
    return provenances[0];
  }
  
  const now = new Date().toISOString();
  const confidences = provenances.map(p => p.quality.confidence);
  const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  
  // Use highest confidence source as primary
  const primarySource = provenances.reduce((prev, curr) =>
    curr.quality.confidence > prev.quality.confidence ? curr : prev
  );
  
  // Merge all audit histories
  const allChanges = provenances.flatMap(p => p.audit.changeHistory || []);
  const mergedChanges = [
    {
      timestamp: now,
      changedBy: mergedBy,
      changeType: 'update' as const,
      reason: `Merged ${provenances.length} sources`,
    },
    ...allChanges.slice(0, 9), // Keep last 10
  ];
  
  // Merge flags
  const allFlags = provenances.flatMap(p => p.flags || []);
  
  return {
    source: {
      type: 'merged',
      name: `Merged from ${provenances.length} sources`,
      reference: provenances.map(p => p.source.reference).filter(Boolean).join(', '),
      ingestedBy: mergedBy,
      ingestedAt: primarySource.source.ingestedAt,
    },
    freshness: {
      lastUpdatedAt: now,
      lastVerifiedAt: provenances
        .map(p => p.freshness.lastVerifiedAt)
        .filter(Boolean)
        .sort()
        .reverse()[0], // Most recent verification
      ageInDays: 0, // Will be computed
      isStale: false,
    },
    quality: {
      confidence: Math.min(0.95, avgConfidence + 0.1), // Merged = slightly more confidence
      verificationStatus: primarySource.quality.verificationStatus,
      verifiedBy: primarySource.quality.verifiedBy,
      verifiedAt: primarySource.quality.verifiedAt,
    },
    audit: {
      createdAt: primarySource.audit.createdAt,
      createdBy: primarySource.audit.createdBy,
      changeHistory: mergedChanges,
    },
    flags: allFlags,
  };
}

/**
 * Helper: Update provenance when entity is refreshed from source
 */
export function refreshProvenance(
  provenance: Provenance,
  refreshedBy: string
): Provenance {
  const now = new Date().toISOString();
  
  return {
    ...provenance,
    freshness: {
      ...provenance.freshness,
      lastUpdatedAt: now,
      lastVerifiedAt: now, // Refresh counts as verification
      ageInDays: 0,
      isStale: false,
    },
    quality: {
      ...provenance.quality,
      // Refresh increases confidence slightly
      confidence: Math.min(0.95, provenance.quality.confidence + 0.05),
    },
    audit: {
      ...provenance.audit,
      changeHistory: [
        {
          timestamp: now,
          changedBy: refreshedBy,
          changeType: 'update',
          reason: 'Data refreshed from source',
        },
        ...(provenance.audit.changeHistory || []).slice(0, 9),
      ],
    },
  };
}

