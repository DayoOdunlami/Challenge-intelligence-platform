/**
 * Vercel KV Vector Store Implementation
 * 
 * For 500-2K entities. Simple, stays in Vercel ecosystem.
 * 
 * Setup:
 * 1. Install: npm install @vercel/kv
 * 2. Set env vars: KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN
 * 3. Use: createVectorStore('vercel-kv')
 */

import type { BaseEntity } from '@/lib/base-entity-enhanced';
import { VectorStoreInterface, SearchOptions } from './vector-store-abstraction';
import OpenAI from 'openai';
import { kv } from '@vercel/kv';

// Note: Install with: npm install @vercel/kv

interface EmbeddingRecord {
  entityId: string;
  embedding: number[];
  embeddingLarge?: number[];
  text: string;
  metadata: {
    domain: string;
    entityType: string;
    sector?: string | string[];
  };
  createdAt: string;
  updatedAt: string;
}

export class VercelKVVectorStore implements VectorStoreInterface {
  private openai: OpenAI;
  private cache: Map<string, number[]>;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
    
    this.cache = new Map();
  }
  
  /**
   * Create embedding
   */
  private async createEmbedding(
    text: string,
    model: 'small' | 'large' = 'small'
  ): Promise<number[]> {
    const modelName = model === 'large'
      ? 'text-embedding-3-large'
      : 'text-embedding-3-small';
    
    // Check cache
    const cacheKey = `embedding:${modelName}:${text}`;
    const cached = await kv.get<number[]>(cacheKey);
    if (cached) return cached;
    
    const response = await this.openai.embeddings.create({
      model: modelName,
      input: text,
    });
    
    const embedding = response.data[0].embedding;
    
    // Cache it (24 hour TTL)
    await kv.set(cacheKey, embedding, { ex: 86400 });
    
    return embedding;
  }
  
  /**
   * Compute cosine similarity
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  /**
   * Embed entity
   */
  async embedEntity(entity: BaseEntity): Promise<void> {
    const text = `${entity.name} ${entity.description} ${entity.metadata.sector || ''}`.trim();
    
    const embedding = await this.createEmbedding(text, 'small');
    const embeddingLarge = await this.createEmbedding(text, 'large');
    
    const record: EmbeddingRecord = {
      entityId: entity.id,
      embedding,
      embeddingLarge,
      text,
      metadata: {
        domain: entity.domain,
        entityType: entity.entityType,
        sector: entity.metadata.sector,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store in KV
    await kv.set(`embedding:${entity.id}`, record);
    
    // Also index for search (store entity ID with metadata for filtering)
    await kv.zadd(`embeddings:index`, {
      score: 0, // Not used for similarity, just for listing
      member: entity.id,
    });
  }
  
  /**
   * Semantic search
   */
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<Array<{ entity: BaseEntity; similarity: number }>> {
    const {
      domain,
      entityType,
      topK = 20,
      usePrecision = false,
      threshold = 0.7,
    } = options;
    
    const queryEmbedding = await this.createEmbedding(query, usePrecision ? 'large' : 'small');
    
    // Get all entity IDs
    const entityIds = await kv.zrange<string[]>(`embeddings:index`, 0, -1);
    
    // Load embeddings and compute similarity
    const results: Array<{ entityId: string; similarity: number }> = [];
    
    for (const entityId of entityIds) {
      const record = await kv.get<EmbeddingRecord>(`embedding:${entityId}`);
      if (!record) continue;
      
      // Filter
      if (domain && record.metadata.domain !== domain) continue;
      if (entityType && record.metadata.entityType !== entityType) continue;
      
      // Compute similarity
      const embeddingToUse = usePrecision && record.embeddingLarge
        ? record.embeddingLarge
        : record.embedding;
      
      const similarity = this.cosineSimilarity(queryEmbedding, embeddingToUse);
      
      if (similarity >= threshold) {
        results.push({ entityId, similarity });
      }
    }
    
    // Sort and take topK
    results.sort((a, b) => b.similarity - a.similarity);
    const topResults = results.slice(0, topK);
    
    // Load entities
    const entities = await this.loadEntities(topResults.map(r => r.entityId));
    
    return topResults.map(result => ({
      entity: entities.find(e => e.id === result.entityId)!,
      similarity: result.similarity,
    })).filter(r => r.entity);
  }
  
  /**
   * Delete embedding
   */
  async deleteEmbedding(entityId: string): Promise<void> {
    await kv.del(`embedding:${entityId}`);
    await kv.zrem(`embeddings:index`, entityId);
  }
  
  /**
   * Batch embed
   */
  async embedAll(entities: BaseEntity[]): Promise<void> {
    console.log(`Embedding ${entities.length} entities to Vercel KV...`);
    
    for (let i = 0; i < entities.length; i += 10) {
      const batch = entities.slice(i, i + 10);
      await Promise.all(batch.map(e => this.embedEntity(e)));
      console.log(`Progress: ${i + batch.length}/${entities.length}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Embedding complete!');
  }
  
  private async loadEntities(entityIds: string[]): Promise<BaseEntity[]> {
    const { unifiedEntities } = await import('@/data/unified');
    return unifiedEntities.filter(e => entityIds.includes(e.id));
  }
}

