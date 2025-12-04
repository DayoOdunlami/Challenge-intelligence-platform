# Embeddings Implementation Guide

**How to create, store, and use embeddings for semantic search**

---

## Where is the Code?

### ✅ JSONVectorStore Location

**File:** `src/lib/ai/vector-store-json.ts`

This file contains:
- ✅ `JSONVectorStore` class (complete)
- ✅ Embedding creation with OpenAI
- ✅ Semantic search functionality
- ✅ Batch embedding method
- ✅ JSON file storage

**Status:** Code is complete, ready to use

---

## How Embeddings Work

### Overview

1. **Create Embedding:** Convert entity text → vector (array of numbers)
2. **Store Embedding:** Save vector with entity ID
3. **Search:** Compare query vector with entity vectors → find similar

### The Embedding Process

```typescript
// 1. Prepare text from entity
const text = `${entity.name} ${entity.description} ${metadata}`;

// 2. Call OpenAI API
const response = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: text,
});

// 3. Get vector (1536 numbers for small model)
const embedding = response.data[0].embedding; // [0.123, -0.456, ...]

// 4. Store it
await store.save(entityId, embedding);
```

---

## What Text Should You Embed?

### Recommended: Rich Context

```typescript
// src/lib/ai/embedding-text-builder.ts
export function buildEmbeddingText(entity: BaseEntity): string {
  const parts: string[] = [];
  
  // 1. Name (most important)
  parts.push(entity.name);
  
  // 2. Description (core content)
  if (entity.description) {
    parts.push(entity.description);
  }
  
  // 3. Domain-specific metadata
  if (entity.domain === 'atlas' && entity.entityType === 'challenge') {
    // Include challenge-specific info
    const challenge = entity.metadata as ChallengeMetadata;
    if (challenge.keywords) {
      parts.push(`Keywords: ${challenge.keywords.join(', ')}`);
    }
    if (challenge.problem_type) {
      parts.push(`Problem type: ${challenge.problem_type.primary}`);
    }
    if (challenge.sector) {
      const sector = typeof challenge.sector === 'string'
        ? challenge.sector
        : `${challenge.sector.primary} (${challenge.sector.secondary.join(', ')})`;
      parts.push(`Sector: ${sector}`);
    }
  }
  
  // 4. Navigate-specific metadata
  if (entity.domain === 'navigate') {
    if (entity.metadata.sector) {
      parts.push(`Sector: ${entity.metadata.sector}`);
    }
    if (entity.metadata.trl) {
      parts.push(`TRL: ${entity.metadata.trl}`);
    }
    if (entity.metadata.custom?.capabilities) {
      parts.push(`Capabilities: ${entity.metadata.custom.capabilities.join(', ')}`);
    }
  }
  
  // 5. Funding info (if relevant)
  if (entity.metadata.funding?.amount) {
    parts.push(`Funding: £${(entity.metadata.funding.amount / 1000000).toFixed(1)}M`);
  }
  
  return parts.filter(Boolean).join('\n\n');
}
```

### Why This Works

**Rich context = Better search**
- Name alone: "Decarbonisation" → might match anything
- With context: "Decarbonisation of aviation through hydrogen fuel cells, TRL 6, £5M funding" → precise matches

**Including metadata:**
- ✅ Sector → finds cross-sector matches
- ✅ TRL → finds similar maturity levels
- ✅ Keywords → captures related concepts
- ✅ Funding → finds similar scale projects

---

## When to Embed

### Option 1: Batch Embedding (Initial Setup)

**Use for:** Initial setup, migrating data, re-embedding everything

```typescript
// scripts/embed-all-entities.ts
import { unifiedEntities } from '@/data/unified';
import { createVectorStore } from '@/lib/ai/vector-store-abstraction';

async function embedAllEntities() {
  console.log('Starting batch embedding...');
  
  const vectorStore = createVectorStore('json');
  
  // Embed all entities
  await vectorStore.embedAll(unifiedEntities);
  
  console.log('✅ Embedding complete!');
  
  // Check stats
  const stats = vectorStore.getStats?.();
  if (stats) {
    console.log(`📊 Stats: ${stats.count} entities, ${stats.size.toFixed(2)}MB`);
  }
}

embedAllEntities().catch(console.error);
```

**Run:**
```bash
npx tsx scripts/embed-all-entities.ts
```

**Time:** ~1-2 minutes per 100 entities (with rate limiting)

---

### Option 2: Incremental Embedding (On Create/Update)

**Use for:** New entities, updated entities

```typescript
// src/lib/ai/entity-hooks.ts
import { createVectorStore } from './vector-store-abstraction';
import type { BaseEntity } from '@/lib/base-entity-enhanced';

const vectorStore = createVectorStore('json');

/**
 * Hook: Embed entity on create
 */
export async function onEntityCreated(entity: BaseEntity): Promise<void> {
  try {
    await vectorStore.embedEntity(entity);
    console.log(`✅ Embedded entity: ${entity.name}`);
  } catch (error) {
    console.error(`❌ Failed to embed entity ${entity.id}:`, error);
  }
}

/**
 * Hook: Re-embed entity on significant update
 */
export async function onEntityUpdated(
  oldEntity: BaseEntity,
  newEntity: BaseEntity
): Promise<void> {
  // Only re-embed if significant changes
  const hasSignificantChanges =
    oldEntity.name !== newEntity.name ||
    oldEntity.description !== newEntity.description ||
    JSON.stringify(oldEntity.metadata) !== JSON.stringify(newEntity.metadata);
  
  if (hasSignificantChanges) {
    await vectorStore.embedEntity(newEntity);
    console.log(`✅ Re-embedded entity: ${newEntity.name}`);
  }
}

/**
 * Hook: Delete embedding on entity delete
 */
export async function onEntityDeleted(entityId: string): Promise<void> {
  await vectorStore.deleteEmbedding(entityId);
  console.log(`✅ Deleted embedding: ${entityId}`);
}
```

**Integration:**

```typescript
// In your entity creation endpoint
import { onEntityCreated } from '@/lib/ai/entity-hooks';

export async function POST(request: Request) {
  const entity = await createEntity(request);
  
  // Embed it
  await onEntityCreated(entity);
  
  return Response.json(entity);
}
```

---

## Improving Embedding Text

### Current Implementation (Basic)

```typescript
// In vector-store-json.ts (line 123)
const text = `${entity.name} ${entity.description} ${entity.metadata.sector || ''}`.trim();
```

**Issue:** Too simple, misses important context

---

### Enhanced Implementation

Update `vector-store-json.ts`:

```typescript
// src/lib/ai/vector-store-json.ts
import { buildEmbeddingText } from './embedding-text-builder';

export class JSONVectorStore implements VectorStoreInterface {
  // ... existing code ...
  
  async embedEntity(entity: BaseEntity): Promise<void> {
    // Use enhanced text builder
    const text = buildEmbeddingText(entity);
    
    // Create both embeddings
    const embedding = await this.createEmbedding(text, 'small');
    const embeddingLarge = await this.createEmbedding(text, 'large');
    
    // ... rest of implementation
  }
}
```

---

## Embedding Best Practices

### 1. Text Length

**Optimal:** 50-500 words
- Too short: Not enough context
- Too long: May hit token limits (8K tokens max for embedding models)

**Current entities:** Usually 50-200 words → ✅ Good

---

### 2. What to Include

**✅ Include:**
- Entity name (most important)
- Description (core content)
- Keywords/tags
- Sector/domain
- Key metadata (TRL, funding if relevant)

**❌ Skip:**
- Internal IDs
- Timestamps
- Technical system fields
- Verbose metadata

---

### 3. Model Selection

**Small Model (`text-embedding-3-small`):**
- ✅ Cheaper: $0.00002 per 1K tokens
- ✅ Faster
- ✅ Good for: General search, volume queries
- ✅ 1536 dimensions

**Large Model (`text-embedding-3-large`):**
- ✅ More accurate
- ⚠️ More expensive: ~3x cost
- ✅ Good for: Entity resolution, precision tasks
- ✅ 3072 dimensions

**Recommendation:**
- Store both (as code does)
- Use small for general search
- Use large for duplicate detection, entity resolution

---

### 4. Caching

**Already implemented in code:**
```typescript
// Cache embeddings to avoid re-computing
const cacheKey = `${modelName}:${text}`;
if (this.cache.has(cacheKey)) {
  return this.cache.get(cacheKey)!;
}
```

**Why it matters:**
- Same text = same embedding
- Caching saves API calls
- Especially useful for batch operations

---

### 5. Rate Limiting

**Already implemented:**
```typescript
// Rate limiting in embedAll
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
```

**OpenAI Limits:**
- Free tier: 3 requests/minute
- Paid tier: 500 requests/minute
- Current code: 1 req/second = 60/min → ✅ Safe

---

## Running Initial Embedding

### Step 1: Set Environment Variable

```bash
# .env.local
OPENAI_API_KEY=sk-...
```

---

### Step 2: Create Embedding Script

```typescript
// scripts/embed-all-entities.ts
import { unifiedEntities } from '@/data/unified';
import { createVectorStore } from '@/lib/ai/vector-store-abstraction';

async function main() {
  console.log(`📦 Embedding ${unifiedEntities.length} entities...`);
  
  const vectorStore = createVectorStore('json');
  
  // Embed all
  await vectorStore.embedAll(unifiedEntities);
  
  // Stats
  const stats = vectorStore.getStats?.();
  if (stats) {
    console.log('\n✅ Complete!');
    console.log(`📊 Entities: ${stats.count}`);
    console.log(`💾 Size: ${stats.size.toFixed(2)}MB`);
    console.log(`📁 Location: data/embeddings/embeddings.json`);
  }
}

main().catch(console.error);
```

---

### Step 3: Run Script

```bash
# Install dependencies first
npm install openai

# Run embedding
npx tsx scripts/embed-all-entities.ts
```

**Output:**
```
📦 Embedding 127 entities...
Progress: 10/127
Progress: 20/127
...
✅ Complete!
📊 Entities: 127
💾 Size: 0.65MB
📁 Location: data/embeddings/embeddings.json
```

---

## Testing Embeddings

### Test Semantic Search

```typescript
// scripts/test-embeddings.ts
import { createVectorStore } from '@/lib/ai/vector-store-abstraction';

async function test() {
  const vectorStore = createVectorStore('json');
  
  // Test search
  const results = await vectorStore.search('decarbonisation aviation', {
    topK: 5,
    domain: 'atlas',
  });
  
  console.log('Search results:');
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.entity.name} (similarity: ${(r.similarity * 100).toFixed(1)}%)`);
  });
}

test();
```

---

## Cost Estimate

### Embedding Cost

**Small Model:**
- Cost: $0.00002 per 1K tokens
- Average entity: ~100 tokens
- 127 entities: ~12,700 tokens
- Cost: $0.00025 (~$0.0003)

**Large Model:**
- Cost: ~$0.00006 per 1K tokens
- 127 entities: ~$0.0008

**Total Initial:** ~$0.001 (practically free)

**Ongoing (new entities):**
- 10 new entities/month: ~$0.0001/month

**Very low cost** ✅

---

## Troubleshooting

### Issue: Embeddings file not found

**Solution:**
```typescript
// The code creates the directory automatically
// But if it fails, create manually:
mkdir -p data/embeddings
```

---

### Issue: OpenAI API error

**Check:**
1. ✅ API key set in `.env.local`
2. ✅ API key has credits
3. ✅ Rate limiting (don't exceed 60/min)

---

### Issue: Search returns no results

**Check:**
1. ✅ Embeddings file exists and has data
2. ✅ Threshold not too high (try 0.6 instead of 0.7)
3. ✅ Query is clear and specific

---

## Next Steps

### ✅ Immediate

1. Create `embedding-text-builder.ts` (enhanced text)
2. Update `vector-store-json.ts` to use it
3. Create embedding script
4. Run initial embedding

### ✅ After Embedding

1. Test semantic search
2. Add "Find Similar" button to entity cards
3. Integrate with chat/RAG

---

**The code is ready. Just create the embedding script and run it!**

