# AI Architecture - Final Implementation Plan

**All critical gaps addressed + refinements integrated**

---

## Status: ✅ **Ready to Build**

All critical pieces are in place. This document includes the final refinements and is ready for implementation.

---

## Final Refinements Integrated

### 1. **Smart Embedding Model Selection** ✅

**Different models for different use cases:**

```typescript
// src/lib/ai/vector-store.ts
export class VectorStore {
  // Use large model for high-precision tasks (entity resolution)
  private precisionModel = 'text-embedding-3-large'; // 3072 dims, better accuracy
  
  // Use small model for high-volume tasks (general search)
  private volumeModel = 'text-embedding-3-small'; // 1536 dims, cheaper
  
  /**
   * Get embedding with appropriate model
   */
  async getEmbedding(
    text: string,
    useCase: 'precision' | 'volume' = 'volume'
  ): Promise<number[]> {
    const model = useCase === 'precision' 
      ? this.precisionModel 
      : this.volumeModel;
    
    // Check cache first
    const cacheKey = `${model}:${hashText(text)}`;
    const cached = await this.embeddingCache.get(cacheKey);
    if (cached) return cached;
    
    // Create embedding with appropriate model
    const embedding = await this.createEmbedding(text, model);
    
    // Cache it
    await this.embeddingCache.set(cacheKey, embedding);
    
    return embedding;
  }
  
  /**
   * Entity resolution (high precision)
   */
  async findSimilarEntities(
    entity: BaseEntity,
    threshold: number = 0.85
  ): Promise<Array<{ entity: BaseEntity; similarity: number }>> {
    // Use large model for precision
    const queryEmbedding = await this.getEmbedding(
      `${entity.name} ${entity.description}`,
      'precision'
    );
    
    // Search with high-precision embedding
    return this.searchWithEmbedding(queryEmbedding, {
      excludeId: entity.id,
      threshold,
      usePrecisionModel: true,
    });
  }
  
  /**
   * General semantic search (high volume)
   */
  async search(
    query: string,
    options?: SearchOptions
  ): Promise<BaseEntity[]> {
    // Use small model for volume
    const queryEmbedding = await this.getEmbedding(query, 'volume');
    
    return this.searchWithEmbedding(queryEmbedding, options);
  }
}
```

**Cost Impact:**
- Precision tasks: ~10% of queries (entity resolution) → use large model
- Volume tasks: ~90% of queries (general search) → use small model
- Overall: Minimal cost increase, better accuracy where needed

---

### 2. **Similarity Threshold Calibration** ✅

**Calibrate thresholds based on real data:**

```typescript
// src/lib/ai/calibration.ts
export class ThresholdCalibrator {
  /**
   * Calibrate similarity thresholds using known examples
   */
  async calibrateSimilarityThresholds(
    calibrationData: {
      knownDuplicates: Array<[BaseEntity, BaseEntity]>; // Pairs that ARE the same
      knownDistinct: Array<[BaseEntity, BaseEntity]>;   // Pairs that ARE different
    }
  ): Promise<{
    flagThreshold: number;    // Flag for review
    mergeThreshold: number;   // Auto-merge
    precision: number;        // % of correct decisions
    recall: number;          // % of duplicates found
  }> {
    // Test different thresholds
    const thresholds = [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.98];
    
    let bestConfig = {
      flagThreshold: 0.85,
      mergeThreshold: 0.95,
      precision: 0,
      recall: 0,
    };
    
    for (const flagThreshold of thresholds) {
      for (const mergeThreshold of thresholds.filter(t => t > flagThreshold)) {
        // Test on known duplicates
        const duplicateResults = await Promise.all(
          calibrationData.knownDuplicates.map(async ([e1, e2]) => {
            const similarity = await this.computeSimilarity(e1, e2);
            if (similarity >= mergeThreshold) return 'merge';
            if (similarity >= flagThreshold) return 'flag';
            return 'distinct';
          })
        );
        
        // Test on known distinct
        const distinctResults = await Promise.all(
          calibrationData.knownDistinct.map(async ([e1, e2]) => {
            const similarity = await this.computeSimilarity(e1, e2);
            if (similarity >= mergeThreshold) return 'merge'; // False positive
            if (similarity >= flagThreshold) return 'flag';   // False positive
            return 'distinct'; // Correct
          })
        );
        
        // Calculate precision and recall
        const truePositives = duplicateResults.filter(r => r === 'merge' || r === 'flag').length;
        const falsePositives = distinctResults.filter(r => r === 'merge' || r === 'flag').length;
        const falseNegatives = duplicateResults.filter(r => r === 'distinct').length;
        
        const precision = truePositives / (truePositives + falsePositives);
        const recall = truePositives / (truePositives + falseNegatives);
        
        // Find best F1 score
        const f1 = 2 * (precision * recall) / (precision + recall);
        const currentF1 = 2 * (bestConfig.precision * bestConfig.recall) / 
                         (bestConfig.precision + bestConfig.recall);
        
        if (f1 > currentF1) {
          bestConfig = {
            flagThreshold,
            mergeThreshold,
            precision,
            recall,
          };
        }
      }
    }
    
    return bestConfig;
  }
  
  /**
   * Run calibration on existing data
   */
  async runCalibration(entities: BaseEntity[]): Promise<void> {
    // Identify known duplicates (same name, different IDs)
    const knownDuplicates: Array<[BaseEntity, BaseEntity]> = [];
    const knownDistinct: Array<[BaseEntity, BaseEntity]> = [];
    
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const e1 = entities[i];
        const e2 = entities[j];
        
        // Heuristic: Same name likely = duplicate
        if (e1.name.toLowerCase() === e2.name.toLowerCase()) {
          knownDuplicates.push([e1, e2]);
        } else {
          // Sample some distinct pairs
          if (Math.random() < 0.01) { // 1% sample
            knownDistinct.push([e1, e2]);
          }
        }
      }
    }
    
    // Run calibration
    const calibrated = await this.calibrateSimilarityThresholds({
      knownDuplicates,
      knownDistinct,
    });
    
    // Update thresholds
    await this.updateThresholds(calibrated);
    
    console.log('Calibrated thresholds:', calibrated);
  }
}

// Usage (Week 2)
const calibrator = new ThresholdCalibrator();
await calibrator.runCalibration(allEntities);
```

**When to Run:**
- Week 2: Initial calibration on existing data
- Monthly: Recalibrate as data grows
- After feedback: When precision/recall drops

---

### 3. **Incremental Embedding Updates** ✅

**Handle create/update/delete:**

```typescript
// src/lib/ai/vector-store.ts
export class VectorStore {
  /**
   * Embed entity on create/update (automatic)
   */
  async onEntityCreated(entity: BaseEntity): Promise<void> {
    await this.embedEntity(entity);
  }
  
  async onEntityUpdated(
    oldEntity: BaseEntity,
    newEntity: BaseEntity
  ): Promise<void> {
    // Re-embed if significant changes
    const hasSignificantChanges = 
      oldEntity.name !== newEntity.name ||
      oldEntity.description !== newEntity.description ||
      JSON.stringify(oldEntity.metadata) !== JSON.stringify(newEntity.metadata);
    
    if (hasSignificantChanges) {
      await this.embedEntity(newEntity);
      // Delete old embedding if entity ID changed
      if (oldEntity.id !== newEntity.id) {
        await this.deleteEmbedding(oldEntity.id);
      }
    }
  }
  
  async onEntityDeleted(entityId: string): Promise<void> {
    await this.deleteEmbedding(entityId);
  }
  
  /**
   * Delete embedding
   */
  async deleteEmbedding(entityId: string): Promise<void> {
    await this.supabase
      .from('entity_embeddings')
      .delete()
      .eq('entity_id', entityId);
    
    // Clear cache
    await this.embeddingCache.delete(entityId);
  }
  
  /**
   * Refresh stale embeddings (nightly job)
   */
  async refreshStaleEmbeddings(maxAgeDays: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
    
    // Find stale embeddings
    const { data: stale } = await this.supabase
      .from('entity_embeddings')
      .select('entity_id, updated_at')
      .lt('updated_at', cutoffDate.toISOString());
    
    if (!stale || stale.length === 0) return;
    
    // Re-embed stale entities
    const entities = await this.loadEntities(stale.map(s => s.entity_id));
    
    for (const entity of entities) {
      await this.embedEntity(entity);
    }
    
    console.log(`Refreshed ${entities.length} stale embeddings`);
  }
}

// Integration hooks
export function setupEntityHooks(vectorStore: VectorStore) {
  // On entity create
  eventBus.on('entity:created', (entity: BaseEntity) => {
    vectorStore.onEntityCreated(entity);
  });
  
  // On entity update
  eventBus.on('entity:updated', ({ old, new: newEntity }) => {
    vectorStore.onEntityUpdated(old, newEntity);
  });
  
  // On entity delete
  eventBus.on('entity:deleted', (entityId: string) => {
    vectorStore.onEntityDeleted(entityId);
  });
}

// Nightly refresh job
scheduleJob('0 2 * * *', async () => {
  await vectorStore.refreshStaleEmbeddings(30);
});
```

**Automation:**
- ✅ Auto-embed on create
- ✅ Re-embed on significant update
- ✅ Delete on entity deletion
- ✅ Nightly refresh for stale embeddings

---

### 4. **"Explain This" Feature** ✅

**Low effort, high value addition:**

```typescript
// src/lib/ai/agents/intelligence-agent.ts
export class IntelligenceAgent {
  /**
   * Explain insight in plain English
   */
  async explainInsight(
    insight: Insight,
    audience: 'executive' | 'analyst' | 'general' = 'general'
  ): Promise<string> {
    const prompt = `Explain this insight in plain English for ${audience}:

${insight.title}: ${insight.description}

Include:
- Why this matters (2-3 sentences)
- What action to take (1-2 actionable recommendations)
- Confidence level (brief note on how certain we are)

Keep it concise (3-4 paragraphs max).`;

    return this.llm.generate({
      prompt,
      complexity: 'simple', // Use cheaper gpt-3.5-turbo
      useCache: true, // Cache explanations
    });
  }
  
  /**
   * Explain similarity relationship
   */
  async explainSimilarity(
    entity1: BaseEntity,
    entity2: BaseEntity,
    similarity: number
  ): Promise<string> {
    const prompt = `Explain why these are ${Math.round(similarity * 100)}% similar:

Entity 1: ${entity1.name}
${entity1.description}

Entity 2: ${entity2.name}
${entity2.description}

Provide a brief explanation (2-3 sentences) of the relationship.`;

    return this.llm.generate({
      prompt,
      complexity: 'simple',
      useCache: true,
    });
  }
  
  /**
   * Explain recommendation
   */
  async explainRecommendation(
    recommendation: Recommendation
  ): Promise<string> {
    const prompt = `Explain this recommendation:

${recommendation.title}
${recommendation.description}

Why this is recommended and what the expected impact is.`;

    return this.llm.generate({
      prompt,
      complexity: 'simple',
      useCache: true,
    });
  }
}
```

**UI Integration:**

```typescript
// In InsightCard component
function InsightCard({ insight }: { insight: Insight }) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleExplain = async () => {
    setLoading(true);
    const explanation = await intelligenceAgent.explainInsight(insight);
    setExplanation(explanation);
    setLoading(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{insight.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{insight.description}</p>
        
        <Button onClick={handleExplain} variant="outline" size="sm">
          {loading ? 'Explaining...' : 'Explain This'}
        </Button>
        
        {explanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h4 className="font-semibold mb-2">Explanation</h4>
            <p className="text-sm">{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Value:**
- ✅ Builds trust (users understand AI reasoning)
- ✅ Low cost (simple model, cached)
- ✅ High impact (transparency = adoption)

---

## Final Implementation Checklist

### Week 1: Foundation Setup

- [ ] **Day 1:** Set up Supabase (or Pinecone) vector store
  - [ ] Enable pgvector extension
  - [ ] Create entity_embeddings table
  - [ ] Create similarity search function
  - [ ] Set up indexes

- [ ] **Day 2:** Implement VectorStore class
  - [ ] Embedding creation (large/small models)
  - [ ] Semantic search
  - [ ] Caching layer
  - [ ] Integration hooks (create/update/delete)

- [ ] **Day 3:** Entity resolution system
  - [ ] EntityResolver class
  - [ ] Similarity computation
  - [ ] Merge logic
  - [ ] Auto-flag/auto-merge thresholds

- [ ] **Day 4:** Cost controls
  - [ ] Embedding cache
  - [ ] LLM response cache
  - [ ] Rate limiter
  - [ ] Cost tracker
  - [ ] Daily limits

- [ ] **Day 5:** Feedback system
  - [ ] FeedbackCollector class
  - [ ] Feedback storage
  - [ ] Analysis utilities

### Week 2: Embedding & Calibration

- [ ] **Day 6-7:** Batch embed all existing entities
  - [ ] Initial embedding job
  - [ ] Progress tracking
  - [ ] Error handling

- [ ] **Day 8:** Similarity threshold calibration
  - [ ] Calibration data collection
  - [ ] Threshold testing
  - [ ] Optimal threshold selection
  - [ ] Documentation of chosen thresholds

- [ ] **Day 9-10:** Testing & refinement
  - [ ] Test semantic search accuracy
  - [ ] Test entity resolution precision
  - [ ] Test cost controls
  - [ ] Refine based on results

### Week 3-4: Core Intelligence

- [ ] **Day 11-12:** Semantic similarity (hybrid)
  - [ ] Embedding-based similarity
  - [ ] Hybrid scoring (60/20/20)
  - [ ] Batch computation job
  - [ ] Relationship storage

- [ ] **Day 13-14:** Basic verification agent
  - [ ] KB cross-reference
  - [ ] Field validation
  - [ ] LLM assessment
  - [ ] Flag/verify logic

- [ ] **Day 15-16:** Conversational chat + RAG
  - [ ] RAG context building
  - [ ] Chat interface
  - [ ] Function calling integration
  - [ ] Conversation history

- [ ] **Day 17-18:** "Explain This" feature
  - [ ] Explanation generation
  - [ ] UI integration
  - [ ] Caching

- [ ] **Day 19-20:** Cross-domain pattern matching
  - [ ] Cross-domain search
  - [ ] Solution matching
  - [ ] UI integration

### Week 5-6: Discovery & Enhancement

- [ ] **Day 21-23:** Research agent
  - [ ] Web search integration
  - [ ] Entity extraction
  - [ ] Readiness assessment
  - [ ] Solution categorization

- [ ] **Day 24-25:** Stakeholder-challenge matchmaking
  - [ ] Capability matching
  - [ ] TRL readiness
  - [ ] Scoring algorithm
  - [ ] UI display

- [ ] **Day 26-27:** Funding gap intelligence
  - [ ] Gap calculation
  - [ ] Sector comparison
  - [ ] Report generation

- [ ] **Day 28-30:** Polish & launch prep
  - [ ] Performance optimization
  - [ ] Error handling
  - [ ] Documentation
  - [ ] Beta testing

---

## Final Cost Estimate (Revised)

### Monthly Costs

**Embeddings:**
- Initial batch: ~$50 (one-time)
- Ongoing (with caching): ~$15/month
  - Precision (10% of queries): $10/month
  - Volume (90% of queries): $5/month

**LLM Calls:**
- Simple queries (gpt-3.5-turbo): ~$100/month
- Complex analysis (gpt-4o): ~$200/month
- Explanations (cached, gpt-3.5): ~$20/month
- Total: ~$320/month

**Vector Store:**
- Supabase pgvector: Free tier (up to 500MB)
- Or Pinecone: ~$70/month (if needed)

**Total:** ~$335/month → **Budget $500/month to be safe**

**Cost Controls Save:**
- Embedding caching: ~70% reduction
- LLM caching: ~50% reduction
- Model selection: ~30% reduction
- **Total savings: ~60% vs no controls**

---

## Success Metrics

### Week 2 (Foundation Complete)
- ✅ Semantic search accuracy: >85%
- ✅ Entity resolution precision: >90%
- ✅ Duplicate detection recall: >85%
- ✅ Cost per query: <$0.01
- ✅ Embedding cache hit rate: >70%

### Week 4 (Core Intelligence)
- ✅ Similarity accuracy: >85%
- ✅ Verification confidence: >80%
- ✅ Chat response quality: >4/5 user rating
- ✅ Explanation clarity: >4/5 user rating
- ✅ Cross-domain matches found: >5/week

### Week 6 (Discovery)
- ✅ Research agent accuracy: >80%
- ✅ Matchmaking relevance: >80%
- ✅ User engagement: +50% vs baseline
- ✅ Cost per user session: <$0.10

---

## Final Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Foundation Layer                            │
│  ✅ Vector Store (pgvector/Pinecone)                    │
│     - Precision model (large) for entity resolution     │
│     - Volume model (small) for general search           │
│  ✅ Embedding Cache                                      │
│  ✅ Incremental Updates (create/update/delete hooks)    │
│  ✅ Entity Resolution (calibrated thresholds)           │
│  ✅ Cost Controls (caching, rate limiting, limits)      │
│  ✅ Feedback Loops                                       │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│              3 Consolidated Agents                        │
│  1. Data Quality Agent                                  │
│     - Challenge scraping + taxonomy conversion          │
│     - Semantic similarity (hybrid)                      │
│     - Entity verification                               │
│  2. Discovery Agent                                     │
│     - Horizon scanning (SMEs, solutions)                │
│     - Solution categorization                           │
│     - Cross-domain pattern matching                     │
│  3. Intelligence Agent                                  │
│     - Conversational chat (RAG-powered)                 │
│     - Report generation                                 │
│     - "Explain This" feature                            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│         Blue Ocean Features (Unique)                     │
│  ✅ Cross-domain pattern matching                       │
│  ✅ Funding gap intelligence                            │
│  ✅ Stakeholder-challenge matchmaking                   │
│  ✅ AI explanations (transparency)                      │
└─────────────────────────────────────────────────────────┘
```

---

## Ready to Build ✅

**Status:** All critical pieces addressed, refinements integrated

**Next Steps:**
1. ✅ Review final architecture
2. ✅ Set up vector store (Day 1)
3. ✅ Start implementation (Week 1)

**Confidence Level:** High - architecture is complete, realistic, and achievable

**Budget:** $500/month is safe buffer

**Timeline:** 6 weeks is realistic with proper prioritization

---

**You're ready. Start with the vector store. Everything else builds on this foundation.**

