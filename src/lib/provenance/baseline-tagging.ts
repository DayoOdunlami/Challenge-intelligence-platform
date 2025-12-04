/**
 * Baseline Data Tagging System
 * 
 * Tags all existing dummy/test data and sets up auto-classification
 * for new data during PoC/MVP phase.
 */

import type { BaseEntity, UniversalRelationship } from '@/lib/base-entity-enhanced';
import { createDefaultProvenance, addQualityFlag, markAsVerified } from '@/lib/base-entity-enhanced';
import type { DataSourceType, VerificationStatus } from '@/lib/base-entity-enhanced';

/**
 * Baseline data classification for PoC/MVP stage
 */
export type BaselineClassification = 
  | 'dummy'           // Test/dummy data
  | 'baseline'        // Initial seed data
  | 'test'            // Test data
  | 'placeholder'     // Placeholder data
  | 'real'            // Real production data
  | 'needs_review';   // Needs human review

/**
 * Tag existing entity as baseline/test data
 */
export function tagAsBaselineData(
  entity: BaseEntity,
  classification: BaselineClassification = 'dummy'
): BaseEntity {
  // Add classification to provenance
  const baselineFlag = {
    type: 'custom' as const,
    severity: classification === 'real' ? 'info' : 'warning' as const,
    message: `Classification: ${classification}`,
    flaggedAt: new Date().toISOString(),
    flaggedBy: 'baseline-tagging-system',
  };

  // Update provenance
  let updatedProvenance = {
    ...entity.provenance,
    source: {
      ...entity.provenance.source,
      type: getSourceTypeForClassification(classification),
      name: `${classification} data - ${entity.provenance.source.name}`,
    },
    quality: {
      ...entity.provenance.quality,
      confidence: getDefaultConfidenceForClassification(classification),
      verificationStatus: classification === 'real' ? 'verified' : 'unverified' as VerificationStatus,
    },
  };

  // Add baseline flag
  updatedProvenance = addQualityFlag(updatedProvenance, baselineFlag).provenance;

  // Store classification in custom metadata
  return {
    ...entity,
    provenance: updatedProvenance,
    metadata: {
      ...entity.metadata,
      custom: {
        ...entity.metadata.custom,
        baselineClassification: classification,
        baselineTaggedAt: new Date().toISOString(),
      },
    },
  };
}

/**
 * Auto-classify new data based on source and content
 */
export function autoClassifyNewData(
  entity: BaseEntity,
  sourceInfo?: {
    sourceType: DataSourceType;
    sourceName: string;
    isManualEntry?: boolean;
  }
): BaseEntity {
  const classification = determineClassification(entity, sourceInfo);
  
  return tagAsBaselineData(entity, classification);
}

/**
 * Determine classification for new data
 */
function determineClassification(
  entity: BaseEntity,
  sourceInfo?: {
    sourceType: DataSourceType;
    sourceName: string;
    isManualEntry?: boolean;
  }
): BaselineClassification {
  // Check if already classified
  if (entity.metadata.custom?.baselineClassification) {
    return entity.metadata.custom.baselineClassification as BaselineClassification;
  }

  // Classification rules (can be enhanced with ML/AI later)
  
  // If from dummy/seed data files
  if (
    sourceInfo?.sourceName.includes('dummy') ||
    sourceInfo?.sourceName.includes('seed') ||
    sourceInfo?.sourceName.includes('test')
  ) {
    return 'dummy';
  }

  // If from Excel/CSV import (likely real data)
  if (
    sourceInfo?.sourceType === 'excel_import' ||
    sourceInfo?.sourceType === 'csv_import'
  ) {
    return 'needs_review'; // Auto-classify as needing review
  }

  // If from API/scraping (likely real data)
  if (
    sourceInfo?.sourceType === 'api_import' ||
    sourceInfo?.sourceType === 'scraped'
  ) {
    return 'needs_review';
  }

  // Manual entry (could be either)
  if (sourceInfo?.isManualEntry || sourceInfo?.sourceType === 'manual_entry') {
    return 'needs_review';
  }

  // Expert curated = real
  if (sourceInfo?.sourceType === 'expert_curated') {
    return 'real';
  }

  // Default for unknown = needs review
  return 'needs_review';
}

/**
 * Get source type for classification
 */
function getSourceTypeForClassification(classification: BaselineClassification): DataSourceType {
  switch (classification) {
    case 'dummy':
    case 'test':
    case 'baseline':
    case 'placeholder':
      return 'manual_entry';
    case 'real':
      return 'expert_curated';
    case 'needs_review':
      return 'manual_entry'; // Will be updated after review
    default:
      return 'unknown';
  }
}

/**
 * Get default confidence for classification
 */
function getDefaultConfidenceForClassification(classification: BaselineClassification): number {
  switch (classification) {
    case 'real':
      return 0.9;
    case 'baseline':
      return 0.6;
    case 'needs_review':
      return 0.5;
    case 'test':
      return 0.4;
    case 'dummy':
      return 0.3;
    case 'placeholder':
      return 0.2;
    default:
      return 0.5;
  }
}

/**
 * Batch tag all existing entities as baseline
 */
export function batchTagExistingData(
  entities: BaseEntity[],
  classification: BaselineClassification = 'dummy'
): BaseEntity[] {
  return entities.map(entity => {
    // Skip if already classified
    if (entity.metadata.custom?.baselineClassification) {
      return entity;
    }
    
    return tagAsBaselineData(entity, classification);
  });
}

/**
 * Filter by baseline classification
 */
export function filterByClassification(
  entities: BaseEntity[],
  includeClassifications: BaselineClassification[] = ['real', 'needs_review']
): BaseEntity[] {
  return entities.filter(entity => {
    const classification = entity.metadata.custom?.baselineClassification as BaselineClassification | undefined;
    
    // If no classification, treat as 'needs_review'
    const effectiveClassification = classification || 'needs_review';
    
    return includeClassifications.includes(effectiveClassification);
  });
}

/**
 * Check if entity is baseline/test data
 */
export function isBaselineData(entity: BaseEntity): boolean {
  const classification = entity.metadata.custom?.baselineClassification as BaselineClassification | undefined;
  return ['dummy', 'test', 'baseline', 'placeholder'].includes(classification || '');
}

/**
 * Check if entity needs review
 */
export function needsReview(entity: BaseEntity): boolean {
  const classification = entity.metadata.custom?.baselineClassification as BaselineClassification | undefined;
  return classification === 'needs_review' || !classification;
}

