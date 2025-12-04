/**
 * Vector Store Usage Examples
 * 
 * Shows how to use the abstraction layer - same code works with any backend
 */

import { createVectorStore } from './vector-store-abstraction';
import type { BaseEntity } from '@/lib/base-entity-enhanced';
import { unifiedEntities } from '@/data/unified';

/**
 * Example 1: Auto-select storage backend
 */
export async function exampleAutoSelect() {
  // Automatically selects based on entity count
  const entityCount = unifiedEntities.length;
  const vectorStore = createVectorStore(undefined, entityCount);
  
  // < 500 entities → JSON
  // 500-2K entities → Vercel KV
  // 2K+ entities → Supabase
  
  // Same API regardless of backend
  await vectorStore.embedAll(unifiedEntities);
}

/**
 * Example 2: Explicitly use JSON (for PoC/MVP)
 */
export async function exampleUseJSON() {
  const vectorStore = createVectorStore('json');
  
  // Embed entity
  const entity = unifiedEntities[0];
  await vectorStore.embedEntity(entity);
  
  // Search
  const results = await vectorStore.search('decarbonisation challenges', {
    domain: 'atlas',
    topK: 10,
  });
  
  console.log(`Found ${results.length} results`);
}

/**
 * Example 3: Use Vercel KV (when scaling)
 */
export async function exampleUseVercelKV() {
  // Set env var: VECTOR_STORE_BACKEND=vercel-kv
  // Or explicitly:
  const vectorStore = createVectorStore('vercel-kv');
  
  // Same API - no code changes needed
  await vectorStore.embedAll(unifiedEntities);
}

/**
 * Example 4: Use Supabase (at scale)
 */
export async function exampleUseSupabase() {
  // Set env var: VECTOR_STORE_BACKEND=supabase
  // Or explicitly:
  const vectorStore = createVectorStore('supabase');
  
  // Same API - no code changes needed
  const results = await vectorStore.search('hydrogen aviation', {
    entityType: 'technology',
    usePrecision: true, // Use large model for better accuracy
  });
}

/**
 * Example 5: Check storage stats (JSON only for now)
 */
export async function exampleCheckStats() {
  const vectorStore = createVectorStore('json');
  
  // Get stats (if available)
  const stats = vectorStore.getStats?.();
  
  if (stats) {
    console.log(`Storage: ${stats.storageType}`);
    console.log(`Entities: ${stats.count}`);
    console.log(`Size: ${stats.size.toFixed(2)}MB`);
    
    // Warn if approaching limits
    if (stats.count > 400 && stats.storageType === 'json') {
      console.warn('⚠️ Consider migrating to Vercel KV (>400 entities)');
    }
  }
}

/**
 * Example 6: Migration path
 */
export async function exampleMigration() {
  // Start with JSON
  const jsonStore = createVectorStore('json');
  await jsonStore.embedAll(unifiedEntities);
  
  // Later, migrate to KV (no code changes)
  if (unifiedEntities.length > 500) {
    const kvStore = createVectorStore('vercel-kv');
    await kvStore.embedAll(unifiedEntities);
    
    // Switch in code or env var
    // VECTOR_STORE_BACKEND=vercel-kv
  }
}

