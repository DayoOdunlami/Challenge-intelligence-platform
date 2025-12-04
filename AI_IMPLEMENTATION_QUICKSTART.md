# AI Implementation Quick Start Guide

**Start building in 30 minutes**

---

## Prerequisites

- Node.js 18+
- Supabase account (free tier works) OR Pinecone account
- OpenAI API key
- Existing Navigate codebase

---

## Step 1: Set Up Vector Store (30 minutes)

### Option A: Supabase (Recommended - Free)

```bash
# 1. Create Supabase project
# Go to https://supabase.com, create new project

# 2. Enable pgvector extension
# In Supabase SQL Editor, run:
```

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE entity_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id TEXT UNIQUE NOT NULL,
  embedding vector(1536), -- text-embedding-3-small
  embedding_large vector(3072), -- text-embedding-3-large (for precision)
  text TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast search
CREATE INDEX ON entity_embeddings 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Similarity search function
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
```

```bash
# 3. Install Supabase client
npm install @supabase/supabase-js
```

### Option B: Pinecone

```bash
npm install @pinecone-database/pinecone
```

---

## Step 2: Install Dependencies (5 minutes)

```bash
npm install openai @supabase/supabase-js
npm install --save-dev @types/node
```

---

## Step 3: Create Vector Store Service (1 hour)

```typescript
// src/lib/ai/vector-store.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export class VectorStore {
  private supabase;
  private openai;
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
   * Create embedding (with model selection)
   */
  async createEmbedding(
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
    const text = `${entity.name} ${entity.description} ${entity.metadata.sector || ''}`;
    
    // Create both embeddings
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
      });
  }
  
  /**
   * Semantic search
   */
  async search(
    query: string,
    options: {
      domain?: Domain;
      entityType?: EntityType;
      topK?: number;
      usePrecision?: boolean;
    } = {}
  ): Promise<Array<{ entity: BaseEntity; similarity: number }>> {
    const embedding = await this.createEmbedding(
      query,
      options.usePrecision ? 'large' : 'small'
    );
    
    const { data } = await this.supabase.rpc('match_entities', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: options.topK || 20,
      filter: {
        domain: options.domain,
        entity_type: options.entityType,
      },
    });
    
    // Load entities and return with similarity
    const entities = await Promise.all(
      data.map(async (d) => {
        const entity = await this.loadEntity(d.entity_id);
        return {
          entity,
          similarity: d.similarity,
        };
      })
    );
    
    return entities;
  }
  
  /**
   * Batch embed all entities (initial setup)
   */
  async embedAll(entities: BaseEntity[]): Promise<void> {
    console.log(`Embedding ${entities.length} entities...`);
    
    for (let i = 0; i < entities.length; i += 10) {
      const batch = entities.slice(i, i + 10);
      await Promise.all(batch.map(e => this.embedEntity(e)));
      console.log(`Progress: ${i + batch.length}/${entities.length}`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Embedding complete!');
  }
}
```

---

## Step 4: Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
```

---

## Step 5: Initial Embedding (Run Once)

```typescript
// scripts/embed-all-entities.ts
import { unifiedEntities } from '@/data/unified';
import { VectorStore } from '@/lib/ai/vector-store';

async function embedAll() {
  const vectorStore = new VectorStore();
  await vectorStore.embedAll(unifiedEntities);
}

embedAll();
```

```bash
npx tsx scripts/embed-all-entities.ts
```

---

## Step 6: Test Semantic Search (5 minutes)

```typescript
// Test script
import { VectorStore } from '@/lib/ai/vector-store';

const vectorStore = new VectorStore();

// Test search
const results = await vectorStore.search('decarbonisation challenges', {
  domain: 'atlas',
  topK: 10,
});

console.log('Results:', results.map(r => ({
  name: r.entity.name,
  similarity: r.similarity,
})));
```

---

## Next Steps

1. ✅ Vector store set up
2. ✅ Entities embedded
3. ✅ Semantic search working

**Now you can:**
- Build entity resolution
- Implement conversational chat with RAG
- Add semantic similarity

---

**You're ready to build! Start with vector store, everything else follows.**

