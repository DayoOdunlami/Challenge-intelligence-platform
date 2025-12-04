/**
 * Embedding Text Builder
 * 
 * Builds rich, contextual text for entity embeddings.
 * More context = better semantic search results.
 * 
 * Note: The main implementation is in vector-store-json.ts.
 * This file is kept for backwards compatibility but will be deprecated.
 */

import type { BaseEntity } from '@/lib/base-entity-enhanced';

/**
 * @deprecated Use buildEmbeddingText from vector-store-json.ts instead
 * This function is kept for backwards compatibility
 */
export function buildEmbeddingText(entity: BaseEntity): string {
  const parts: string[] = [];
  
  // 1. Name (most important - always include)
  parts.push(entity.name);
  
  // 2. Description (core content)
  if (entity.description) {
    parts.push(entity.description);
  }
  
  // 3. Domain-specific metadata
  if (entity.domain === 'atlas' && entity.entityType === 'challenge') {
    // Atlas Challenge specific metadata
    const metadata = entity.metadata as any;
    
    if (metadata.keywords && Array.isArray(metadata.keywords)) {
      parts.push(`Keywords: ${metadata.keywords.join(', ')}`);
    }
    
    if (metadata.problem_type) {
      const problemType = typeof metadata.problem_type === 'string'
        ? metadata.problem_type
        : metadata.problem_type.primary;
      parts.push(`Problem type: ${problemType}`);
    }
    
    if (metadata.sector) {
      let sectorText = '';
      if (typeof metadata.sector === 'string') {
        sectorText = metadata.sector;
      } else if (metadata.sector.primary) {
        sectorText = metadata.sector.primary;
        if (metadata.sector.secondary && metadata.sector.secondary.length > 0) {
          sectorText += ` (${metadata.sector.secondary.join(', ')})`;
        }
      }
      if (sectorText) {
        parts.push(`Sector: ${sectorText}`);
      }
    }
  }
  
  // 4. Navigate-specific metadata
  if (entity.domain === 'navigate') {
    if (entity.metadata.sector) {
      const sector = typeof entity.metadata.sector === 'string'
        ? entity.metadata.sector
        : Array.isArray(entity.metadata.sector)
          ? entity.metadata.sector.join(', ')
          : '';
      if (sector) {
        parts.push(`Sector: ${sector}`);
      }
    }
    
    if (entity.metadata.trl) {
      const trl = typeof entity.metadata.trl === 'number'
        ? entity.metadata.trl
        : typeof entity.metadata.trl === 'object' && entity.metadata.trl.min !== undefined
          ? `${entity.metadata.trl.min}-${entity.metadata.trl.max}`
          : entity.metadata.trl;
      parts.push(`TRL: ${trl}`);
    }
    
    // Custom metadata (stakeholders, technologies)
    if (entity.metadata.custom) {
      const custom = entity.metadata.custom as Record<string, any>;
      
      if (custom.capabilities && Array.isArray(custom.capabilities)) {
        parts.push(`Capabilities: ${custom.capabilities.join(', ')}`);
      }
      
      if (custom.expertise && Array.isArray(custom.expertise)) {
        parts.push(`Expertise: ${custom.expertise.join(', ')}`);
      }
      
      if (custom.technology_type) {
        parts.push(`Technology type: ${custom.technology_type}`);
      }
    }
  }
  
  // 5. Funding info (if relevant and significant)
  if (entity.metadata.funding) {
    const funding = entity.metadata.funding;
    if (funding.amount && funding.amount > 0) {
      const amountText = funding.amount >= 1000000
        ? `£${(funding.amount / 1000000).toFixed(1)}M`
        : `£${(funding.amount / 1000).toFixed(0)}K`;
      parts.push(`Funding: ${amountText}`);
    }
  }
  
  // 6. Entity type (helps with filtering)
  parts.push(`Type: ${entity.entityType}`);
  
  // Combine all parts
  const text = parts.filter(Boolean).join('\n\n');
  
  // Truncate if too long (embedding models have token limits)
  // text-embedding-3-small has 8K token limit
  // ~1 token = 4 characters, so ~32K characters max
  // Most entities will be <1000 characters, so safe
  if (text.length > 8000) {
    return text.substring(0, 8000);
  }
  
  return text;
}

/**
 * Build lightweight embedding text (for quick operations)
 * Uses only name and description
 */
export function buildLightweightEmbeddingText(entity: BaseEntity): string {
  const parts: string[] = [entity.name];
  
  if (entity.description) {
    parts.push(entity.description);
  }
  
  return parts.join('\n\n');
}

