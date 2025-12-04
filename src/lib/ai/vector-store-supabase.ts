/**
 * Supabase pgvector Vector Store Implementation
 * 
 * For 2K+ entities. Advanced, scalable, supports complex queries.
 * 
 * Setup:
 * 1. Install: npm install @supabase/supabase-js
 * 2. Set env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY
 * 3. Run SQL migrations (see AI_IMPLEMENTATION_QUICKSTART.md)
 * 4. Use: createVectorStore('supabase')
 */

import type { BaseEntity } from '@/lib/base-entity-enhanced';
import { VectorStoreInterface, SearchOptions } from './vector-store-abstraction';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Note: Install with: npm install @supabase/supabase-js

export class SupabaseVectorStore implements VectorStoreInterface {
  private supabase;
  private openai: OpenAI;
  private cache: Map<string, number[]>;
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY! // Use service key for backend
    );
    
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
    const cacheKey = `${modelName}:${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const response = await this.openai.embeddings.create({
      model: modelName,
      input: text,
    });
    
    const embedding = response.data[0].embedding;
    
    // Cache it
    this.cache.set(cacheKey, embedding);
    
    return embedding;
  }
  
  /**
   * Embed entity
   */
  async embedEntity(entity: BaseEntity): Promise<void> {
    const text = `${entity.name} ${entity.description} ${entity.metadata.sector || ''}`.trim();
    
    const embedding = await this.createEmbedding(text, 'small');
    const embeddingLarge = await this.createEmbedding(text, 'large');
    
    await this.supabase
      .from('entity_embeddings')
      .upsert({
        entity_id: entity.id,
        embedding,
        embedding_large: embeddingLarge,
        text,
        metadata: {
          domain: entity.domain,
          entityType: entity.entityType,
          sector: entity.metadata.sector,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'entity_id',
      });
  }
  
  /**
   * Semantic search using pgvector
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
    
    // Create query embedding
    const queryEmbedding = await this.createEmbedding(query, usePrecision ? 'large' : 'small');
    
    // Use pgvector similarity search
    const column = usePrecision ? 'embedding_large' : 'embedding';
    
    const { data, error } = await this.supabase.rpc('match_entities', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: topK,
      filter: {
        domain: domain || null,
        entity_type: entityType || null,
      },
      embedding_column: column,
    });
    
    if (error) {
      console.error('Search error:', error);
      return [];
    }
    
    // Load entities
    const entityIds = data.map((d: any) => d.entity_id);
    const entities = await this.loadEntities(entityIds);
    
    return data.map((d: any) => ({
      entity: entities.find(e => e.id === d.entity_id)!,
      similarity: d.similarity,
    })).filter(r => r.entity);
  }
  
  /**
   * Delete embedding
   */
  async deleteEmbedding(entityId: string): Promise<void> {
    await this.supabase
      .from('entity_embeddings')
      .delete()
      .eq('entity_id', entityId);
  }
  
  /**
   * Batch embed
   */
  async embedAll(entities: BaseEntity[]): Promise<void> {
    console.log(`Embedding ${entities.length} entities to Supabase...`);
    
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

