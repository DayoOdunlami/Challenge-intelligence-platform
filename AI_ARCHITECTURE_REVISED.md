# AI Architecture - Revised & Streamlined

**Critical review integrated - Foundation-first approach**

---

## Executive Summary

**Original plan:** 6 specialized agents, complex orchestration  
**Revised plan:** 3 consolidated agents + RAG foundation + critical missing pieces

**Key Changes:**
- ✅ Added RAG (vector store) as foundation
- ✅ Consolidated 6 agents → 3 agents
- ✅ Added entity resolution
- ✅ Added feedback loops
- ✅ Added cost controls
- ✅ Prioritized cross-domain insights (unique differentiator)

---

## Critical Missing Pieces (Now Included)

### 1. **RAG (Retrieval Augmented Generation) - CRITICAL**

**Status:** ❌ **Missing** → ✅ **Now Priority #1**

**Why Essential:**
- Powers ALL searches across platform
- Enables semantic search (not just keyword)
- Foundation for all agents
- Transforms user experience

**Implementation:**

```typescript
// src/lib/ai/vector-store.ts
import { createClient } from '@supabase/supabase-js';

export class VectorStore {
  private supabase;
  private embeddingModel = 'text-embedding-3-small'; // OpenAI
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }
  
  /**
   * Embed and store entity
   */
  async embedEntity(entity: BaseEntity): Promise<void> {
    // Check cache first
    const cached = await this.getCachedEmbedding(entity.id);
    if (cached) return;
    
    // Create embedding
    const embedding = await this.createEmbedding(entity);
    
    // Store in pgvector
    await this.supabase
      .from('entity_embeddings')
      .insert({
        entity_id: entity.id,
        embedding: embedding,
        text: this.entityToText(entity),
        metadata: {
          domain: entity.domain,
          entityType: entity.entityType,
          sector: entity.metadata.sector,
        },
      });
  }
  
  /**
   * Semantic search
   */
  async search(query: string, options?: {
    domain?: Domain;
    entityType?: EntityType;
    topK?: number;
  }): Promise<BaseEntity[]> {
    const queryEmbedding = await this.createEmbedding(query);
    
    // Vector similarity search
    const { data } = await this.supabase.rpc('match_entities', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: options?.topK || 20,
      filter: {
        domain: options?.domain,
        entity_type: options?.entityType,
      },
    });
    
    // Return BaseEntities
    return data.map(d => this.embeddingToEntity(d));
  }
  
  /**
   * Batch embed all entities (one-time setup)
   */
  async embedAll(entities: BaseEntity[]): Promise<void> {
    // Process in batches of 100
    for (let i = 0; i < entities.length; i += 100) {
      const batch = entities.slice(i, i + 100);
      await Promise.all(batch.map(e => this.embedEntity(e)));
    }
  }
}
```

**Database Setup (Supabase pgvector):**

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Entity embeddings table
CREATE TABLE entity_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id TEXT UNIQUE NOT NULL,
  embedding vector(1536), -- OpenAI ada-002/3-small dimension
  text TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_entities(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  entity_id text,
  similarity float,
  text text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.entity_id,
    1 - (e.embedding <=> query_embedding) as similarity,
    e.text,
    e.metadata
  FROM entity_embeddings e
  WHERE 
    (filter->>'domain' IS NULL OR e.metadata->>'domain' = filter->>'domain')
    AND (filter->>'entity_type' IS NULL OR e.metadata->>'entity_type' = filter->>'entity_type')
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Index for fast similarity search
CREATE INDEX ON entity_embeddings 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

**Impact:**
- ✅ All searches become semantic
- ✅ Powers all agents
- ✅ Enables "find similar" features
- ✅ Foundation for everything else

**Effort:** 2-3 days

---

### 2. **Entity Resolution - CRITICAL**

**Status:** ❌ **Missing** → ✅ **Now Priority #2**

**Why Essential:**
- Prevents duplicate entities
- Prevents graph fragmentation
- Essential for scaling data ingestion

**Implementation:**

```typescript
// src/lib/ai/entity-resolution.ts
export class EntityResolver {
  private vectorStore: VectorStore;
  
  /**
   * Find similar entities (potential duplicates)
   */
  async findSimilarEntities(
    entity: BaseEntity,
    threshold: number = 0.85
  ): Promise<Array<{ entity: BaseEntity; similarity: number }>> {
    // Use vector search to find similar
    const candidates = await this.vectorStore.search(
      `${entity.name} ${entity.description}`,
      {
        domain: entity.domain,
        entityType: entity.entityType,
        topK: 10,
      }
    );
    
    // Filter by similarity threshold
    return candidates
      .filter(c => c.id !== entity.id)
      .map(c => ({
        entity: c,
        similarity: this.computeSimilarity(entity, c),
      }))
      .filter(m => m.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
  }
  
  /**
   * Resolve entity on create (check for duplicates)
   */
  async resolveOnCreate(newEntity: BaseEntity): Promise<{
    action: 'create' | 'merge' | 'flag';
    entity: BaseEntity;
    matches?: BaseEntity[];
  }> {
    const matches = await this.findSimilarEntities(newEntity, 0.85);
    
    if (matches.length === 0) {
      return { action: 'create', entity: newEntity };
    }
    
    // High confidence match (>0.95) - auto-merge
    if (matches[0].similarity > 0.95) {
      return {
        action: 'merge',
        entity: this.mergeEntities(newEntity, matches[0].entity),
        matches: matches.map(m => m.entity),
      };
    }
    
    // Medium confidence (0.85-0.95) - flag for review
    return {
      action: 'flag',
      entity: {
        ...newEntity,
        provenance: addQualityFlag(newEntity.provenance, {
          type: 'duplicate',
          severity: 'warning',
          message: `Possible duplicate: ${matches[0].entity.name}`,
          flaggedBy: 'entity-resolver',
        }),
      },
      matches: matches.map(m => m.entity),
    };
  }
  
  /**
   * Merge two entities
   */
  private mergeEntities(
    newEntity: BaseEntity,
    existingEntity: BaseEntity
  ): BaseEntity {
    // Merge metadata, keep highest confidence
    return {
      ...existingEntity,
      name: existingEntity.name, // Keep existing
      description: newEntity.description || existingEntity.description,
      metadata: {
        ...existingEntity.metadata,
        ...newEntity.metadata,
        // Merge custom fields
        custom: {
          ...existingEntity.metadata.custom,
          ...newEntity.metadata.custom,
          mergedFrom: [newEntity.id],
          mergedAt: new Date().toISOString(),
        },
      },
      provenance: mergeProvenance(
        existingEntity.provenance,
        newEntity.provenance,
        'entity-resolver'
      ),
    };
  }
}
```

**Integration:**
- Called automatically on entity create/import
- Flags potential duplicates
- Auto-merges high-confidence matches

**Effort:** 2 days

---

### 3. **Feedback Loops - ESSENTIAL**

**Status:** ❌ **Missing** → ✅ **Now Included**

**Why Essential:**
- System learns from user corrections
- Improves over time
- Enables fine-tuning

**Implementation:**

```typescript
// src/lib/ai/feedback.ts
export interface AIFeedback {
  id: string;
  entityId?: string;
  relationshipId?: string;
  predictionType: 'similarity' | 'classification' | 'extraction' | 'resolution';
  predicted: any;
  corrected: any;
  userId: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export class FeedbackCollector {
  /**
   * Record user correction
   */
  async recordFeedback(feedback: AIFeedback): Promise<void> {
    await db.feedback.insert(feedback);
    
    // Trigger model update if threshold reached
    await this.checkAndUpdate();
  }
  
  /**
   * Get feedback statistics for tuning
   */
  async getFeedbackStats(
    predictionType: string
  ): Promise<{
    total: number;
    corrections: number;
    accuracy: number;
    commonIssues: string[];
  }> {
    // Analyze feedback to identify patterns
    // Use for threshold adjustment, prompt refinement
  }
  
  /**
   * Adjust thresholds based on feedback
   */
  async adjustThresholds(): Promise<void> {
    // Analyze feedback patterns
    // Adjust similarity thresholds, confidence thresholds
    // Refine prompts
  }
}
```

**Usage:**
- When user corrects similarity → record feedback
- When user verifies/rejects → record feedback
- When user marks duplicate → record feedback
- System learns and improves

**Effort:** 1 day

---

### 4. **Cost Controls - CRITICAL**

**Status:** ❌ **Missing** → ✅ **Now Included**

**Why Essential:**
- LLM calls are expensive
- Embeddings can be cached
- Need rate limiting and monitoring

**Implementation:**

```typescript
// src/lib/ai/cost-controls.ts
export class CostManager {
  private embeddingCache: Map<string, number[]>;
  private rateLimiter: RateLimiter;
  private costTracker: CostTracker;
  
  /**
   * Get embedding with caching
   */
  async getEmbedding(text: string, entityId?: string): Promise<number[]> {
    // Check cache first (embeddings don't change)
    if (entityId) {
      const cached = await this.embeddingCache.get(entityId);
      if (cached) return cached;
    }
    
    // Check general cache
    const textHash = hashText(text);
    const cached = await this.embeddingCache.get(textHash);
    if (cached) return cached;
    
    // Rate limit
    await this.rateLimiter.wait();
    
    // Create embedding
    const embedding = await this.createEmbedding(text);
    
    // Cache it
    if (entityId) {
      await this.embeddingCache.set(entityId, embedding);
    }
    await this.embeddingCache.set(textHash, embedding);
    
    // Track cost
    this.costTracker.record({
      operation: 'embedding',
      model: 'text-embedding-3-small',
      cost: 0.00002, // per 1K tokens
    });
    
    return embedding;
  }
  
  /**
   * LLM call with cost optimization
   */
  async llmCall(
    prompt: string,
    options: {
      complexity: 'simple' | 'medium' | 'complex';
      useCache?: boolean;
    }
  ): Promise<string> {
    // Choose model based on complexity
    const model = options.complexity === 'simple'
      ? 'gpt-3.5-turbo'  // Cheaper
      : 'gpt-4o';        // More capable
    
    // Check cache if enabled
    if (options.useCache) {
      const cached = await this.getCachedResponse(prompt);
      if (cached) return cached;
    }
    
    // Rate limit
    await this.rateLimiter.wait();
    
    // Call LLM
    const response = await this.callLLM(prompt, model);
    
    // Cache if enabled
    if (options.useCache) {
      await this.cacheResponse(prompt, response);
    }
    
    // Track cost
    this.costTracker.record({
      operation: 'llm',
      model,
      tokens: estimateTokens(prompt + response),
      cost: calculateCost(model, tokens),
    });
    
    return response;
  }
  
  /**
   * Daily cost limits
   */
  async checkDailyLimit(): Promise<boolean> {
    const today = this.costTracker.getTodayCost();
    const limit = process.env.DAILY_COST_LIMIT || 100; // $100/day
    
    if (today >= limit) {
      // Fallback to cached responses or cheaper models
      return false;
    }
    
    return true;
  }
}
```

**Cost Optimization Strategies:**
- ✅ Cache embeddings (they don't change)
- ✅ Cache LLM responses for similar queries
- ✅ Use cheaper models for simple tasks
- ✅ Rate limiting
- ✅ Daily cost limits
- ✅ Monitoring and alerts

**Effort:** 1-2 days

---

## Revised Agent Architecture

### **From 6 Agents → 3 Consolidated Agents**

#### Agent 1: **Data Quality Agent**
**Consolidates:** Challenge Scraping + Similarity + Verification

```typescript
// src/lib/ai/agents/data-quality-agent.ts
export class DataQualityAgent {
  private vectorStore: VectorStore;
  private entityResolver: EntityResolver;
  
  /**
   * Scrape and process challenges
   */
  async scrapeChallenges(portal: string): Promise<BaseEntity[]> {
    // Scrape → Extract → Classify → Resolve duplicates
    const raw = await this.scraper.scrape(portal);
    const extracted = await this.extract(raw);
    const classified = extracted.map(e => this.classifyToSchema(e));
    
    // Resolve duplicates
    const resolved = await Promise.all(
      classified.map(c => this.entityResolver.resolveOnCreate(c))
    );
    
    return resolved.map(r => r.entity);
  }
  
  /**
   * Compute semantic similarity
   */
  async computeSimilarity(
    ch1: BaseEntity,
    ch2: BaseEntity
  ): Promise<number> {
    // Hybrid: 60% semantic + 40% keyword/metadata
    const semantic = await this.vectorStore.computeSimilarity(ch1, ch2);
    const keyword = this.computeKeywordSimilarity(ch1, ch2);
    const metadata = this.computeMetadataSimilarity(ch1, ch2);
    
    return semantic * 0.6 + keyword * 0.2 + metadata * 0.2;
  }
  
  /**
   * Verify entity quality
   */
  async verify(entity: BaseEntity): Promise<VerificationResult> {
    // Cross-reference, validate, assess
    const kbMatches = await this.vectorStore.search(entity.name);
    const fieldValidation = this.validateFields(entity);
    const duplicates = await this.entityResolver.findSimilarEntities(entity);
    
    const aiAssessment = await this.assessWithLLM({
      entity,
      context: { kbMatches, fieldValidation, duplicates },
    });
    
    return aiAssessment;
  }
}
```

#### Agent 2: **Discovery Agent**
**Consolidates:** Research + Solution Analyzer

```typescript
// src/lib/ai/agents/discovery-agent.ts
export class DiscoveryAgent {
  private vectorStore: VectorStore;
  
  /**
   * Horizon scan for solutions/SMEs
   */
  async horizonScan(challenge: BaseEntity): Promise<{
    smes: BaseEntity[];
    solutions: SolutionCandidate[];
    analysis: SolutionAnalysis;
  }> {
    // Find solutions
    const solutions = await this.findSolutions(challenge);
    
    // Assess and categorize
    const assessed = await this.assessReadiness(solutions);
    const analysis = await this.categorizeByPotential(assessed);
    
    return { smes: [], solutions: assessed, analysis };
  }
  
  /**
   * Categorize solutions by potential
   */
  async categorizeByPotential(
    solutions: BaseEntity[]
  ): Promise<SolutionAnalysis> {
    // Blue sky, low-hanging fruit, high-risk high-reward, cross-sector proven
    return {
      blueSky: solutions.filter(s => this.isBlueSky(s)),
      lowHangingFruit: solutions.filter(s => this.isLowHangingFruit(s)),
      highRiskHighReward: solutions.filter(s => this.isHighRiskHighReward(s)),
      crossSectorProven: solutions.filter(s => this.isCrossSectorProven(s)),
    };
  }
  
  /**
   * Cross-domain pattern matching (BLUE OCEAN)
   */
  async findCrossDomainPatterns(
    challenge: BaseEntity
  ): Promise<CrossDomainMatch[]> {
    // Find similar challenges in OTHER domains
    const similar = await this.vectorStore.search(
      challenge.description,
      {
        // Exclude current domain
        excludeDomain: challenge.domain,
        topK: 10,
      }
    );
    
    // Find solutions to those challenges
    const solutions = await Promise.all(
      similar.map(async s => {
        const solutions = await this.findSolutionsForChallenge(s);
        return {
          sourceChallenge: s,
          solutions,
          similarity: await this.vectorStore.computeSimilarity(challenge, s),
        };
      })
    );
    
    return solutions;
  }
}
```

#### Agent 3: **Intelligence Agent**
**Consolidates:** Report Generation + Chat

```typescript
// src/lib/ai/agents/intelligence-agent.ts
export class IntelligenceAgent {
  private vectorStore: VectorStore;
  private ragContext: RAGContext;
  
  /**
   * Conversational chat with RAG
   */
  async chat(
    query: string,
    context: {
      currentView: string;
      selectedEntities: BaseEntity[];
      conversationHistory: Message[];
    }
  ): Promise<ChatResponse> {
    // 1. RAG: Find relevant entities
    const relevantEntities = await this.vectorStore.search(query, {
      topK: 20,
    });
    
    // 2. Build context
    const ragContext = await this.ragContext.build({
      query,
      relevantEntities,
      currentView: context.currentView,
      selectedEntities: context.selectedEntities,
    });
    
    // 3. Generate response with function calling
    const response = await this.llm.chat({
      messages: [
        ...context.conversationHistory,
        { role: 'user', content: query },
      ],
      context: ragContext,
      functions: AI_FUNCTION_DEFINITIONS,
    });
    
    return response;
  }
  
  /**
   * Generate comprehensive report
   */
  async generateReport(
    entities: BaseEntity[],
    visualizations: string[],
    topic: string
  ): Promise<Report> {
    // Use RAG for context
    const context = await this.ragContext.buildForReport({
      entities,
      visualizations,
      topic,
    });
    
    // Generate report
    return this.llm.generateReport(context);
  }
  
  /**
   * Generate insights
   */
  async generateInsights(
    entities: BaseEntity[]
  ): Promise<Insight[]> {
    // Analyze using RAG context
    const analysis = await this.analyzeWithRAG(entities);
    
    // Generate insights
    return this.llm.generateInsights(analysis);
  }
}
```

---

## Blue Ocean Opportunities (Unique Differentiators)

### 1. **Cross-Domain Pattern Matching**

**Implementation:**

```typescript
// In Discovery Agent
async findCrossDomainSolutions(challenge: BaseEntity): Promise<MatchResult> {
  // Find similar challenges in OTHER domains
  const similarChallenges = await this.vectorStore.search(
    challenge.description,
    { excludeDomain: challenge.domain, topK: 5 }
  );
  
  // Find solutions to those challenges
  const solutions = [];
  for (const similarChallenge of similarChallenges) {
    const sols = await this.findSolutions(similarChallenge);
    solutions.push({
      sourceChallenge: similarChallenge,
      solutions: sols,
      similarity: await this.computeSimilarity(challenge, similarChallenge),
    });
  }
  
  return {
    message: `This challenge is ${Math.round(solutions[0].similarity * 100)}% similar to a SOLVED ${solutions[0].sourceChallenge.domain} challenge.`,
    recommendedSolutions: solutions[0].solutions,
  };
}
```

**Example:**
```
"This rail challenge is 87% similar to a SOLVED aviation challenge.
The aviation solution was hydrogen fuel cells.
Consider adapting this solution."
```

### 2. **Funding Gap Intelligence**

**Implementation:**

```typescript
async analyzeFundingGaps(sector: string): Promise<FundingGap> {
  // Find all challenges in sector
  const challenges = await this.vectorStore.search(
    `challenges in ${sector}`,
    { entityType: 'challenge' }
  );
  
  // Calculate total funding
  const totalFunding = challenges.reduce(
    (sum, c) => sum + (c.metadata.funding?.amount || 0),
    0
  );
  
  // Find similar complexity sectors
  const similarSectors = await this.findSimilarComplexitySectors(sector);
  const avgFunding = similarSectors.reduce(
    (sum, s) => sum + s.avgFunding,
    0
  ) / similarSectors.length;
  
  const gap = avgFunding - totalFunding;
  
  return {
    sector,
    currentFunding: totalFunding,
    averageFunding: avgFunding,
    gap,
    recommendation: gap > 0
      ? `Underfunded by £${gap.toFixed(1)}M compared to similar sectors`
      : `Well-funded sector`,
  };
}
```

### 3. **Stakeholder-Challenge Matchmaking**

**Implementation:**

```typescript
async matchStakeholdersToChallenge(
  challenge: BaseEntity
): Promise<MatchResult[]> {
  // Find relevant stakeholders using RAG
  const stakeholders = await this.vectorStore.search(
    challenge.description,
    { entityType: 'stakeholder', topK: 20 }
  );
  
  // Score each match
  const matches = await Promise.all(
    stakeholders.map(async stakeholder => {
      // Check capability match
      const capabilityMatch = await this.assessCapability(
        stakeholder,
        challenge
      );
      
      // Check TRL readiness
      const trlReadiness = this.assessTRLReadiness(stakeholder, challenge);
      
      // Check funding status
      const fundingStatus = await this.checkFundingStatus(stakeholder);
      
      // Check cross-sector experience
      const crossSectorExperience = await this.checkCrossSector(
        stakeholder,
        challenge.sector
      );
      
      return {
        stakeholder,
        capabilityMatch: capabilityMatch.score,
        trlReadiness,
        fundingStatus,
        crossSectorExperience,
        overallScore: (
          capabilityMatch.score * 0.4 +
          trlReadiness * 0.3 +
          fundingStatus * 0.2 +
          crossSectorExperience * 0.1
        ),
      };
    })
  );
  
  return matches
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 5);
}
```

---

## Revised 6-Week Implementation Plan

### **Weeks 1-2: Foundation (CRITICAL)**

**Goal:** Set up RAG, entity resolution, cost controls

- [ ] **Day 1-2:** Set up vector store (Supabase pgvector or Pinecone)
- [ ] **Day 3:** Embed all existing entities (batch job)
- [ ] **Day 4:** Implement semantic search API
- [ ] **Day 5:** Add entity resolution on ingest
- [ ] **Day 6:** Set up cost controls and caching
- [ ] **Day 7:** Add feedback collection system
- [ ] **Day 8-10:** Test and refine

**Deliverables:**
- ✅ Vector store operational
- ✅ All entities embedded
- ✅ Semantic search working
- ✅ Duplicate detection active
- ✅ Cost monitoring in place

---

### **Weeks 3-4: Core Intelligence**

**Goal:** Semantic similarity, verification, conversational chat

- [ ] **Day 11-12:** Implement semantic similarity (hybrid approach)
- [ ] **Day 13-14:** Basic verification agent
- [ ] **Day 15-16:** Conversational chat with RAG context
- [ ] **Day 17-18:** Cross-domain pattern matching
- [ ] **Day 19-20:** Testing and refinement

**Deliverables:**
- ✅ Semantic similarity working (60/20/20 hybrid)
- ✅ Verification agent operational
- ✅ Chat interface with RAG
- ✅ Cross-domain insights working

---

### **Weeks 5-6: Discovery & Enhancement**

**Goal:** Research agent, matchmaking, insights

- [ ] **Day 21-23:** Research agent (web search + extraction)
- [ ] **Day 24-25:** Stakeholder-challenge matchmaking
- [ ] **Day 26-27:** Funding gap intelligence
- [ ] **Day 28-30:** AI-generated insights on dashboards

**Deliverables:**
- ✅ Research agent operational
- ✅ Matchmaking features working
- ✅ Funding gap analysis
- ✅ AI insights integrated

---

## Low Hanging Fruit (Quick Wins)

| Feature | Effort | Impact | When |
|---------|--------|--------|------|
| Embed existing entities | 1 day | Enables semantic search | Week 1 |
| "Find similar" button | 1 day | Immediate user value | Week 2 |
| AI-generated summaries (cached) | 2 days | Better UX | Week 3 |
| Confidence badges | 1 day | Builds trust | Week 2 |
| "Why similar?" explanation | 2 days | Transparency | Week 3 |

---

## Revised Priority Matrix

### **Tier 1: Foundation (Weeks 1-2)**
1. ✅ **Vector store + RAG** (2-3 days)
2. ✅ **Entity resolution** (2 days)
3. ✅ **Cost controls** (1-2 days)
4. ✅ **Feedback loops** (1 day)

### **Tier 2: Core Value (Weeks 3-4)**
5. ✅ **Semantic similarity** (2-3 days)
6. ✅ **Verification agent** (3-4 days)
7. ✅ **Conversational chat + RAG** (3-4 days)
8. ✅ **Cross-domain insights** (3-4 days)

### **Tier 3: Enhancement (Weeks 5-6)**
9. ✅ **Research agent** (1 week)
10. ✅ **Stakeholder matchmaking** (3-4 days)
11. ✅ **Funding gap intelligence** (2-3 days)

### **Tier 4: Defer**
- ⏸️ Voice interface
- ⏸️ Complex orchestration
- ⏸️ Separate report generation (merged into Intelligence Agent)

---

## Final Architecture

```
┌─────────────────────────────────────────────────────────┐
│              AI Foundation Layer                         │
│  ✅ Vector Store (pgvector/Pinecone)                    │
│  ✅ Embeddings (cached)                                 │
│  ✅ Entity Resolution                                   │
│  ✅ Cost Controls                                       │
│  ✅ Feedback Loops                                      │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│              3 Consolidated Agents                       │
│  1. Data Quality Agent                                  │
│     - Scraping + Similarity + Verification              │
│  2. Discovery Agent                                     │
│     - Research + Solution Analysis                      │
│  3. Intelligence Agent                                  │
│     - Chat + Report Generation                          │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│         Blue Ocean Features (Unique)                     │
│  ✅ Cross-domain pattern matching                       │
│  ✅ Funding gap intelligence                            │
│  ✅ Stakeholder-challenge matchmaking                   │
└─────────────────────────────────────────────────────────┘
```

---

## Cost Estimate

### Monthly Costs (Estimated)

**Embeddings:**
- Initial: ~$50 (one-time, all existing entities)
- Ongoing: ~$10/month (new entities)

**LLM Calls:**
- Simple queries: ~$100/month (gpt-3.5-turbo)
- Complex analysis: ~$200/month (gpt-4o)
- Total: ~$300/month

**Vector Store:**
- Supabase pgvector: Free tier sufficient
- Pinecone: ~$70/month (if needed)

**Total:** ~$380/month

**Cost Controls:**
- Daily limit: $10/day
- Caching reduces costs by ~50%
- Cheaper models for simple tasks

---

## Success Metrics

### Week 2 (Foundation Complete)
- ✅ Semantic search accuracy: >80%
- ✅ Duplicate detection: >90% precision
- ✅ Cost per query: <$0.01

### Week 4 (Core Intelligence)
- ✅ Similarity accuracy: >85%
- ✅ Verification confidence: >80%
- ✅ Chat response quality: >4/5 user rating

### Week 6 (Discovery)
- ✅ Cross-domain matches found: >10/week
- ✅ Matchmaking accuracy: >80%
- ✅ User engagement: +50% vs baseline

---

## Conclusion

**Revised Approach:**
- ✅ Foundation-first (RAG, entity resolution)
- ✅ 3 consolidated agents (not 6)
- ✅ Cost controls from day 1
- ✅ Feedback loops for learning
- ✅ Blue ocean opportunities prioritized

**This is:**
- ✅ **Simpler** - 3 agents instead of 6
- ✅ **More valuable** - RAG powers everything
- ✅ **More sustainable** - Cost controls prevent runaway costs
- ✅ **More unique** - Cross-domain insights are your differentiator

**Start with foundation (RAG + entity resolution). Everything else builds on this.**

