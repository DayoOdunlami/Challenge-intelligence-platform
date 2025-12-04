/**
 * JSON Vector Store Implementation (Fixed)
 * 
 * Fixes applied:
 * 1. Race condition in constructor - await initialized
 * 2. Proper save tracking - no silent failures
 * 3. Lower threshold (0.5 default)
 * 4. Find Similar method
 * 5. Hybrid search (semantic + keyword)
 * 6. Better error handling
 */

import type { BaseEntity } from '@/lib/base-entity-enhanced';
import OpenAI from 'openai';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

// ============================================================================
// Types
// ============================================================================

interface EmbeddingRecord {
  entityId: string;
  embedding: number[];
  embeddingLarge?: number[];
  text: string;
  keywords: string[]; // For keyword search fallback
  metadata: {
    domain: string;
    entityType: string;
    sector?: string | string[];
    name: string; // Store name for keyword matching
  };
  createdAt: string;
  updatedAt: string;
}

export interface SearchOptions {
  domain?: string;
  entityType?: string;
  topK?: number;
  threshold?: number;
  usePrecision?: boolean;
  excludeIds?: string[]; // Exclude specific entities (for "find similar")
}

export interface SearchResult {
  entity: BaseEntity;
  similarity: number;
  matchType: 'semantic' | 'keyword' | 'hybrid';
}

export interface VectorStoreStats {
  count: number;
  size: number;
  storageType: string;
  lastUpdated: string | null;
}

// ============================================================================
// Enhanced Text Builder
// ============================================================================

export function buildEmbeddingText(entity: BaseEntity): string {
  const parts: string[] = [];
  
  // 1. Name (most important)
  parts.push(entity.name);
  
  // 2. Description
  if (entity.description) {
    parts.push(entity.description);
  }
  
  // 3. Knowledge base content (rich text for Navigate entities)
  const metadata = entity.metadata as any;
  if (metadata?.knowledge_base?.content) {
    // Take first 500 chars of knowledge base to avoid token limits
    const kbContent = metadata.knowledge_base.content.substring(0, 500);
    parts.push(kbContent);
  }
  
  // 4. Atlas Challenge metadata
  if (entity.domain === 'atlas' && entity.entityType === 'challenge') {
    if (metadata.keywords && Array.isArray(metadata.keywords)) {
      parts.push(`Keywords: ${metadata.keywords.join(', ')}`);
    }
    
    if (metadata.problem_type) {
      const problemType = typeof metadata.problem_type === 'string'
        ? metadata.problem_type
        : metadata.problem_type.primary;
      if (problemType) {
        parts.push(`Problem type: ${problemType}`);
      }
      // Sub-categories
      if (metadata.problem_type?.sub_categories?.length) {
        parts.push(`Sub-categories: ${metadata.problem_type.sub_categories.join(', ')}`);
      }
      // Technology domains
      if (metadata.problem_type?.technology_domains?.length) {
        parts.push(`Technology domains: ${metadata.problem_type.technology_domains.join(', ')}`);
      }
    }
    
    // Cross-sector signals (important for matching!)
    if (metadata.sector?.cross_sector_signals?.length) {
      parts.push(`Cross-sector signals: ${metadata.sector.cross_sector_signals.join(', ')}`);
    }
    
    // Sector
    if (metadata.sector) {
      let sectorText = '';
      if (typeof metadata.sector === 'string') {
        sectorText = metadata.sector;
      } else if (metadata.sector.primary) {
        sectorText = metadata.sector.primary;
        if (metadata.sector.secondary?.length) {
          sectorText += ` (${metadata.sector.secondary.join(', ')})`;
        }
      }
      if (sectorText) {
        parts.push(`Sector: ${sectorText}`);
      }
    }
    
    // Buyer/organization
    if (metadata.buyer?.organization) {
      parts.push(`Organization: ${metadata.buyer.organization}`);
    }
  }
  
  // 5. Navigate metadata
  if (entity.domain === 'navigate') {
    // Sector
    if (metadata.sector) {
      const sector = typeof metadata.sector === 'string'
        ? metadata.sector
        : Array.isArray(metadata.sector)
          ? metadata.sector.join(', ')
          : '';
      if (sector) {
        parts.push(`Sector: ${sector}`);
      }
    }
    
    // TRL
    if (metadata.trl !== undefined) {
      const trl = typeof metadata.trl === 'number'
        ? metadata.trl
        : typeof metadata.trl === 'object' && metadata.trl.min !== undefined
          ? `${metadata.trl.min}-${metadata.trl.max}`
          : metadata.trl;
      parts.push(`TRL: ${trl}`);
    }
    
    // Regional availability (for technologies)
    if (metadata.regional_availability?.length) {
      parts.push(`Regional availability: ${metadata.regional_availability.join(', ')}`);
    }
    
    // Tags
    if (metadata.tags?.length) {
      parts.push(`Tags: ${metadata.tags.join(', ')}`);
    }
    
    // Custom metadata
    if (metadata.custom) {
      const custom = metadata.custom as Record<string, any>;
      
      if (custom.capabilities?.length) {
        parts.push(`Capabilities: ${custom.capabilities.join(', ')}`);
      }
      if (custom.expertise?.length) {
        parts.push(`Expertise: ${custom.expertise.join(', ')}`);
      }
      if (custom.technology_type) {
        parts.push(`Technology type: ${custom.technology_type}`);
      }
      if (custom.modes?.length) {
        parts.push(`Transport modes: ${custom.modes.join(', ')}`);
      }
      if (custom.strategicThemes?.length) {
        parts.push(`Strategic themes: ${custom.strategicThemes.join(', ')}`);
      }
    }
  }
  
  // 6. CPC Internal metadata
  if (entity.domain === 'cpc-internal') {
    // Focus Area specific metadata
    if (entity.entityType === 'focus_area') {
      if (metadata.custom?.mode) {
        parts.push(`Transport mode: ${metadata.custom.mode}`);
      }
      if (metadata.custom?.strategic_themes?.length) {
        parts.push(`Strategic themes: ${metadata.custom.strategic_themes.join(', ')}`);
      }
      if (metadata.custom?.stage) {
        parts.push(`Stage: ${metadata.custom.stage}`);
      }
      if (metadata.custom?.key_technologies?.length) {
        parts.push(`Key technologies: ${metadata.custom.key_technologies.join(', ')}`);
      }
      if (metadata.custom?.market_barriers?.length) {
        parts.push(`Market barriers: ${metadata.custom.market_barriers.join(', ')}`);
      }
      if (metadata.custom?.stakeholder_types?.length) {
        parts.push(`Stakeholder types: ${metadata.custom.stakeholder_types.join(', ')}`);
      }
      if (metadata.custom?.cpc_services?.length) {
        parts.push(`CPC services: ${metadata.custom.cpc_services.join(', ')}`);
      }
      // Use the pre-optimized embedding_text if available
      if (metadata.custom?.embedding_text) {
        parts.push(metadata.custom.embedding_text);
      }
    }
    
    // Milestone specific metadata
    if (entity.entityType === 'milestone') {
      if (metadata.custom?.mode) {
        parts.push(`Transport mode: ${metadata.custom.mode}`);
      }
      if (metadata.custom?.stage) {
        parts.push(`Stage: ${metadata.custom.stage}`);
      }
      if (metadata.custom?.year) {
        parts.push(`Year: ${metadata.custom.year}`);
      }
      if (metadata.custom?.customer_status) {
        parts.push(`Customer: ${metadata.custom.customer_status}`);
      }
      if (metadata.custom?.assessment) {
        parts.push(`Assessment: ${metadata.custom.assessment}`);
      }
      if (metadata.custom?.business_growth_score !== null && metadata.custom?.business_growth_score !== undefined) {
        parts.push(`Business growth score: ${metadata.custom.business_growth_score}`);
      }
      if (metadata.custom?.is_alignment) {
        parts.push(`IS alignment: ${metadata.custom.is_alignment}`);
      }
      if (metadata.custom?.focus_area_ids?.length) {
        parts.push(`Related focus areas: ${metadata.custom.focus_area_ids.length}`);
      }
      // Use the pre-optimized embedding_text if available
      if (metadata.custom?.embedding_text) {
        parts.push(metadata.custom.embedding_text);
      }
    }
    
    // Stage specific metadata
    if (entity.entityType === 'stage') {
      if (metadata.custom?.stage_number) {
        parts.push(`Stage number: ${metadata.custom.stage_number}`);
      }
      if (metadata.custom?.purpose) {
        parts.push(`Purpose: ${metadata.custom.purpose}`);
      }
      if (metadata.custom?.typical_outputs?.length) {
        parts.push(`Typical outputs: ${metadata.custom.typical_outputs.join(', ')}`);
      }
      if (metadata.custom?.decision_gate) {
        parts.push(`Decision gate: ${metadata.custom.decision_gate}`);
      }
      if (metadata.custom?.cpc_strategy_link) {
        parts.push(`CPC strategy: ${metadata.custom.cpc_strategy_link}`);
      }
      // Use the pre-optimized embedding_text if available
      if (metadata.custom?.embedding_text) {
        parts.push(metadata.custom.embedding_text);
      }
    }
    
    // Legacy capability/initiative metadata
    if (metadata.custom?.capabilityType) {
      parts.push(`Capability type: ${metadata.custom.capabilityType}`);
    }
    if (metadata.custom?.businessUnit) {
      parts.push(`Business unit: ${metadata.custom.businessUnit}`);
    }
  }
  
  // 7. Funding (if significant)
  if (metadata.funding?.amount && metadata.funding.amount > 0) {
    const amount = metadata.funding.amount;
    const amountText = amount >= 1000000
      ? `£${(amount / 1000000).toFixed(1)}M`
      : `£${(amount / 1000).toFixed(0)}K`;
    parts.push(`Funding: ${amountText}`);
  }
  
  // 8. Entity type
  parts.push(`Type: ${entity.entityType}`);
  
  // Combine and truncate
  const text = parts.filter(Boolean).join('\n\n');
  return text.length > 8000 ? text.substring(0, 8000) : text;
}

/**
 * Extract keywords for fallback search
 */
export function extractKeywords(entity: BaseEntity): string[] {
  const keywords: Set<string> = new Set();
  const metadata = entity.metadata as any;
  
  // Name words
  entity.name.toLowerCase().split(/\s+/).forEach(w => {
    if (w.length > 2) keywords.add(w);
  });
  
  // Explicit keywords
  if (metadata.keywords?.length) {
    metadata.keywords.forEach((k: string) => keywords.add(k.toLowerCase()));
  }
  
  // Tags
  if (metadata.tags?.length) {
    metadata.tags.forEach((t: string) => keywords.add(t.toLowerCase()));
  }
  
  // Sector
  if (typeof metadata.sector === 'string') {
    keywords.add(metadata.sector.toLowerCase());
  } else if (metadata.sector?.primary) {
    keywords.add(metadata.sector.primary.toLowerCase());
  }
  
  // Cross-sector signals
  if (metadata.sector?.cross_sector_signals?.length) {
    metadata.sector.cross_sector_signals.forEach((s: string) => 
      keywords.add(s.toLowerCase())
    );
  }
  
  return Array.from(keywords);
}

// ============================================================================
// JSON Vector Store
// ============================================================================

export class JSONVectorStore {
  private openai: OpenAI;
  private embeddingCache: Map<string, number[]>;
  private storagePath: string;
  private embeddings: Map<string, EmbeddingRecord>;
  private entitiesCache: Map<string, BaseEntity>;
  
  // Fix #1: Track initialization
  private initialized: Promise<void>;
  private lastSave: Promise<void> = Promise.resolve();
  private saveQueue: Promise<void> = Promise.resolve();
  
  constructor(options?: { storagePath?: string }) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
    
    this.embeddingCache = new Map();
    this.embeddings = new Map();
    this.entitiesCache = new Map();
    this.storagePath = options?.storagePath || join(process.cwd(), 'data', 'embeddings');
    
    // Fix #1: Properly track initialization
    this.initialized = this.loadEmbeddings();
  }
  
  /**
   * Ensure store is ready before operations
   */
  async ensureReady(): Promise<void> {
    await this.initialized;
  }
  
  /**
   * Load embeddings from JSON file
   */
  private async loadEmbeddings(): Promise<void> {
    try {
      const filePath = join(this.storagePath, 'embeddings.json');
      const data = await readFile(filePath, 'utf-8');
      const records: EmbeddingRecord[] = JSON.parse(data);
      
      records.forEach(record => {
        this.embeddings.set(record.entityId, record);
      });
      
      console.log(`✅ Loaded ${this.embeddings.size} embeddings from JSON`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('📦 No existing embeddings file, starting fresh');
      } else {
        console.error('⚠️ Error loading embeddings:', error.message);
      }
    }
  }
  
  /**
   * Save embeddings to JSON file (queued to prevent race conditions)
   */
  private async saveEmbeddings(): Promise<void> {
    // Queue saves to prevent concurrent writes
    this.saveQueue = this.saveQueue.then(async () => {
      try {
        await mkdir(this.storagePath, { recursive: true });
        
        const filePath = join(this.storagePath, 'embeddings.json');
        const records = Array.from(this.embeddings.values());
        
        await writeFile(filePath, JSON.stringify(records, null, 2));
        console.log(`💾 Saved ${records.length} embeddings`);
      } catch (error: any) {
        console.error('❌ Error saving embeddings:', error.message);
        throw error; // Re-throw so caller knows it failed
      }
    });
    
    return this.saveQueue;
  }
  
  /**
   * Create embedding via OpenAI
   */
  private async createEmbedding(
    text: string,
    model: 'small' | 'large' = 'small'
  ): Promise<number[]> {
    const modelName = model === 'large'
      ? 'text-embedding-3-large'
      : 'text-embedding-3-small';
    
    // Check cache
    const cacheKey = `${modelName}:${text.substring(0, 100)}`;
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }
    
    const response = await this.openai.embeddings.create({
      model: modelName,
      input: text,
    });
    
    const embedding = response.data[0].embedding;
    this.embeddingCache.set(cacheKey, embedding);
    
    return embedding;
  }
  
  /**
   * Compute cosine similarity
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }
    
    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
  
  /**
   * Embed a single entity
   */
  async embedEntity(entity: BaseEntity): Promise<void> {
    await this.ensureReady();
    
    const text = buildEmbeddingText(entity);
    const keywords = extractKeywords(entity);
    
    // Create both embeddings
    const [embedding, embeddingLarge] = await Promise.all([
      this.createEmbedding(text, 'small'),
      this.createEmbedding(text, 'large'),
    ]);
    
    const metadata = entity.metadata as any;
    
    const record: EmbeddingRecord = {
      entityId: entity.id,
      embedding,
      embeddingLarge,
      text,
      keywords,
      metadata: {
        domain: entity.domain,
        entityType: entity.entityType,
        sector: metadata.sector,
        name: entity.name,
      },
      createdAt: this.embeddings.get(entity.id)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.embeddings.set(entity.id, record);
    this.entitiesCache.set(entity.id, entity);
    
    // Save (queued, won't block)
    await this.saveEmbeddings();
  }
  
  /**
   * Semantic search
   */
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    await this.ensureReady();
    
    const {
      domain,
      entityType,
      topK = 20,
      threshold = 0.5, // Fix #3: Lower default threshold
      usePrecision = false,
      excludeIds = [],
    } = options;
    
    // Create query embedding
    const queryEmbedding = await this.createEmbedding(
      query,
      usePrecision ? 'large' : 'small'
    );
    
    const results: Array<{ entityId: string; similarity: number }> = [];
    
    for (const [entityId, record] of this.embeddings.entries()) {
      // Skip excluded
      if (excludeIds.includes(entityId)) continue;
      
      // Filter by domain/type
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
    
    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);
    const topResults = results.slice(0, topK);
    
    // Load entities
    const entities = await this.loadEntities(topResults.map(r => r.entityId));
    
    return topResults
      .map(result => {
        const entity = entities.find(e => e.id === result.entityId);
        if (!entity) return null;
        return {
          entity,
          similarity: result.similarity,
          matchType: 'semantic' as const,
        };
      })
      .filter((r): r is SearchResult => r !== null);
  }
  
  /**
   * Keyword search fallback
   */
  async keywordSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    await this.ensureReady();
    
    const {
      domain,
      entityType,
      topK = 20,
      excludeIds = [],
    } = options;
    
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const results: Array<{ entityId: string; score: number }> = [];
    
    for (const [entityId, record] of this.embeddings.entries()) {
      if (excludeIds.includes(entityId)) continue;
      if (domain && record.metadata.domain !== domain) continue;
      if (entityType && record.metadata.entityType !== entityType) continue;
      
      // Count keyword matches
      let matches = 0;
      const recordKeywords = record.keywords.map(k => k.toLowerCase());
      const nameWords = record.metadata.name.toLowerCase().split(/\s+/);
      
      for (const term of queryTerms) {
        // Exact keyword match
        if (recordKeywords.some(k => k.includes(term))) {
          matches += 2;
        }
        // Name match (higher weight)
        if (nameWords.some(w => w.includes(term))) {
          matches += 3;
        }
        // Text content match
        if (record.text.toLowerCase().includes(term)) {
          matches += 1;
        }
      }
      
      if (matches > 0) {
        // Normalize score to 0-1 range
        const score = Math.min(matches / (queryTerms.length * 6), 1);
        results.push({ entityId, score });
      }
    }
    
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, topK);
    
    const entities = await this.loadEntities(topResults.map(r => r.entityId));
    
    return topResults
      .map(result => {
        const entity = entities.find(e => e.id === result.entityId);
        if (!entity) return null;
        return {
          entity,
          similarity: result.score,
          matchType: 'keyword' as const,
        };
      })
      .filter((r): r is SearchResult => r !== null);
  }
  
  /**
   * Hybrid search: 60% semantic + 40% keyword
   */
  async hybridSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    await this.ensureReady();
    
    const { topK = 20, ...restOptions } = options;
    
    // Run both searches in parallel
    const [semanticResults, keywordResults] = await Promise.all([
      this.search(query, { ...restOptions, topK: topK * 2 }),
      this.keywordSearch(query, { ...restOptions, topK: topK * 2 }),
    ]);
    
    // Merge with weights
    const scoreMap = new Map<string, { score: number; entity: BaseEntity }>();
    
    // Semantic: 60% weight
    for (const result of semanticResults) {
      const existing = scoreMap.get(result.entity.id);
      const semanticScore = result.similarity * 0.6;
      
      if (existing) {
        existing.score += semanticScore;
      } else {
        scoreMap.set(result.entity.id, {
          score: semanticScore,
          entity: result.entity,
        });
      }
    }
    
    // Keyword: 40% weight
    for (const result of keywordResults) {
      const existing = scoreMap.get(result.entity.id);
      const keywordScore = result.similarity * 0.4;
      
      if (existing) {
        existing.score += keywordScore;
      } else {
        scoreMap.set(result.entity.id, {
          score: keywordScore,
          entity: result.entity,
        });
      }
    }
    
    // Sort and return
    const merged = Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(({ score, entity }) => ({
        entity,
        similarity: score,
        matchType: 'hybrid' as const,
      }));
    
    return merged;
  }
  
  /**
   * Find Similar: Given an entity ID, find similar entities
   */
  async findSimilar(
    entityId: string,
    options: Omit<SearchOptions, 'excludeIds'> = {}
  ): Promise<SearchResult[]> {
    await this.ensureReady();
    
    const record = this.embeddings.get(entityId);
    if (!record) {
      throw new Error(`Entity ${entityId} not found in embeddings`);
    }
    
    // Search using the entity's embedded text
    return this.search(record.text, {
      ...options,
      excludeIds: [entityId], // Exclude self from results
    });
  }
  
  /**
   * Delete embedding
   */
  async deleteEmbedding(entityId: string): Promise<void> {
    await this.ensureReady();
    
    this.embeddings.delete(entityId);
    this.entitiesCache.delete(entityId);
    await this.saveEmbeddings();
  }
  
  /**
   * Batch embed all entities
   */
  async embedAll(
    entities: BaseEntity[],
    options?: { onProgress?: (current: number, total: number) => void }
  ): Promise<void> {
    await this.ensureReady();
    
    console.log(`📦 Embedding ${entities.length} entities...`);
    
    const batchSize = 5; // Smaller batches for rate limiting
    
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      
      // Process batch
      await Promise.all(batch.map(async (entity) => {
        try {
          const text = buildEmbeddingText(entity);
          const keywords = extractKeywords(entity);
          
          // Create both embeddings
          const [embedding, embeddingLarge] = await Promise.all([
            this.createEmbedding(text, 'small'),
            this.createEmbedding(text, 'large'),
          ]);
          
          const metadata = entity.metadata as any;
          
          const record: EmbeddingRecord = {
            entityId: entity.id,
            embedding,
            embeddingLarge,
            text,
            keywords,
            metadata: {
              domain: entity.domain,
              entityType: entity.entityType,
              sector: metadata.sector,
              name: entity.name,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          this.embeddings.set(entity.id, record);
          this.entitiesCache.set(entity.id, entity);
        } catch (error: any) {
          console.error(`❌ Failed to embed ${entity.id}:`, error.message);
        }
      }));
      
      // Progress callback
      const progress = Math.min(i + batchSize, entities.length);
      options?.onProgress?.(progress, entities.length);
      console.log(`Progress: ${progress}/${entities.length}`);
      
      // Rate limiting: 1 second between batches
      if (i + batchSize < entities.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Periodic save every 50 entities
      if (progress % 50 === 0) {
        await this.saveEmbeddings();
      }
    }
    
    // Final save
    await this.saveEmbeddings();
    console.log('✅ Embedding complete!');
  }
  
  /**
   * Load entities by ID
   */
  private async loadEntities(entityIds: string[]): Promise<BaseEntity[]> {
    // Check cache first
    const cached: BaseEntity[] = [];
    const uncachedIds: string[] = [];
    
    for (const id of entityIds) {
      if (this.entitiesCache.has(id)) {
        cached.push(this.entitiesCache.get(id)!);
      } else {
        uncachedIds.push(id);
      }
    }
    
    if (uncachedIds.length === 0) {
      return cached;
    }
    
    // Load from unified entities
    try {
      const { unifiedEntities } = await import('@/data/unified');
      const loaded = unifiedEntities.filter(e => uncachedIds.includes(e.id));
      
      // Cache them
      loaded.forEach(e => this.entitiesCache.set(e.id, e));
      
      return [...cached, ...loaded];
    } catch (error) {
      console.error('Error loading entities:', error);
      return cached;
    }
  }
  
  /**
   * Get storage stats
   */
  getStats(): VectorStoreStats {
    const records = Array.from(this.embeddings.values());
    const size = JSON.stringify(records).length / 1024 / 1024; // MB
    
    const lastUpdated = records.length > 0
      ? records.reduce((latest, r) => 
          r.updatedAt > latest ? r.updatedAt : latest, 
          records[0].updatedAt
        )
      : null;
    
    return {
      count: this.embeddings.size,
      size,
      storageType: 'json',
      lastUpdated,
    };
  }
  
  /**
   * Check if entity has embedding
   */
  hasEmbedding(entityId: string): boolean {
    return this.embeddings.has(entityId);
  }
  
  /**
   * Get embedding record (for debugging)
   */
  getEmbeddingRecord(entityId: string): EmbeddingRecord | undefined {
    return this.embeddings.get(entityId);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let vectorStoreInstance: JSONVectorStore | null = null;

export function getVectorStore(): JSONVectorStore {
  if (!vectorStoreInstance) {
    vectorStoreInstance = new JSONVectorStore();
  }
  return vectorStoreInstance;
}

export default JSONVectorStore;
