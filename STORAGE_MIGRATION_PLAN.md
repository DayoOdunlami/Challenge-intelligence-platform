# Storage Migration Plan - JSON → Vercel KV → Supabase

**Progressive scaling without code changes**

---

## Storage Backend Selection

The platform automatically selects the appropriate storage backend based on entity count, or you can override with env var.

### Automatic Selection

```typescript
// Auto-selects based on entity count
const vectorStore = createVectorStore(undefined, entityCount);

// < 500 entities → JSON
// 500-2K entities → Vercel KV
// 2K+ entities → Supabase
```

### Manual Override

```typescript
// Override with env var
VECTOR_STORE_BACKEND=supabase

// Or in code
const vectorStore = createVectorStore('supabase');
```

---

## Storage Options

### 1. JSON Storage (Now → 500 entities)

**Pros:**
- ✅ No external dependencies
- ✅ Simple, works immediately
- ✅ Good for PoC/MVP
- ✅ Fast for small datasets

**Cons:**
- ❌ Slower cold starts at 500+ entities
- ❌ File size grows with entities
- ❌ No advanced queries

**When to Use:**
- < 500 entities
- PoC/MVP stage
- Want simplest setup

**File Location:**
```
data/embeddings/embeddings.json
```

**Size Estimates:**
- 100 entities: ~600KB
- 500 entities: ~3MB
- 1,000 entities: ~6MB (slow cold starts)

---

### 2. Vercel KV (500 → 2K entities)

**Pros:**
- ✅ Stays in Vercel ecosystem
- ✅ Simple migration from JSON
- ✅ Good performance up to 2K entities
- ✅ Free tier covers this scale

**Cons:**
- ❌ Still limited at 2K+ entities
- ❌ No SQL queries
- ❌ Sequential search (can be slow at scale)

**When to Use:**
- 500-2K entities
- Want to stay simple
- Deployed on Vercel

**Setup:**
```bash
npm install @vercel/kv

# Add to .env.local
KV_URL=your_kv_url
KV_REST_API_URL=your_rest_url
KV_REST_API_TOKEN=your_token
```

**Cost:**
- Free tier: 256MB storage, 10K requests/day
- Paid: $20/month (5GB, unlimited requests)

---

### 3. Supabase pgvector (2K+ entities)

**Pros:**
- ✅ Scales to millions of entities
- ✅ Fast vector similarity search
- ✅ SQL queries on metadata
- ✅ Advanced filtering
- ✅ Free tier available

**Cons:**
- ⚠️ Requires database setup
- ⚠️ More complex than JSON/KV
- ⚠️ External dependency

**When to Use:**
- 2K+ entities
- Need advanced queries
- Want best performance at scale

**Setup:**
See `AI_IMPLEMENTATION_QUICKSTART.md` for SQL migrations.

**Cost:**
- Free tier: 500MB database, sufficient for <10K entities
- Paid: $25/month (8GB, more compute)

---

## Migration Path

### Step 1: Start with JSON (Now)

```typescript
// Automatic - uses JSON for <500 entities
const vectorStore = createVectorStore();

// Or explicitly
const vectorStore = createVectorStore('json');
```

**Status:** ✅ **Ready to use now**

---

### Step 2: Monitor Performance

**Migration Triggers:**

| Metric | Threshold | Action |
|--------|-----------|--------|
| Entity count | > 400 | Plan migration |
| Cold start time | > 3 seconds | Consider migration |
| File size | > 5MB | Migrate to KV |
| Search latency | > 1 second | Migrate to Supabase |

**Monitoring:**
```typescript
// Check stats
const stats = vectorStore.getStats();
console.log(`Entities: ${stats.count}, Size: ${stats.size}MB`);

// Monitor in production
if (stats.count > 400) {
  console.warn('Consider migrating to Vercel KV');
}
```

---

### Step 3: Migrate to Vercel KV (500+ entities)

**Migration Script:**

```typescript
// scripts/migrate-to-vercel-kv.ts
import { createVectorStore } from '@/lib/ai/vector-store-abstraction';
import { unifiedEntities } from '@/data/unified';

async function migrate() {
  // Old store (JSON)
  const oldStore = createVectorStore('json');
  
  // New store (KV)
  const newStore = createVectorStore('vercel-kv');
  
  console.log('Migrating embeddings...');
  
  // Re-embed all entities (or copy if you've stored the embeddings)
  await newStore.embedAll(unifiedEntities);
  
  console.log('Migration complete!');
  
  // Verify
  const testResults = await newStore.search('test query');
  console.log(`Test search returned ${testResults.length} results`);
}

migrate();
```

**Code Changes Required:** None (same API)

**Testing:**
```typescript
// Test both stores
const jsonStore = createVectorStore('json');
const kvStore = createVectorStore('vercel-kv');

// Compare results
const jsonResults = await jsonStore.search('test');
const kvResults = await kvStore.search('test');

// Should be identical
console.log('Results match:', 
  JSON.stringify(jsonResults) === JSON.stringify(kvResults)
);
```

---

### Step 4: Migrate to Supabase (2K+ entities)

**Migration Script:**

```typescript
// scripts/migrate-to-supabase.ts
import { createVectorStore } from '@/lib/ai/vector-store-abstraction';
import { unifiedEntities } from '@/data/unified';

async function migrate() {
  // Old store (KV or JSON)
  const oldStore = createVectorStore('vercel-kv'); // or 'json'
  
  // New store (Supabase)
  const newStore = createVectorStore('supabase');
  
  console.log('Migrating to Supabase...');
  
  // Re-embed all entities
  await newStore.embedAll(unifiedEntities);
  
  console.log('Migration complete!');
  
  // Switch in code
  // Update: VECTOR_STORE_BACKEND=supabase in .env
}
```

**Code Changes Required:** None (same API)

---

## Migration Checklist

### Before Migration

- [ ] Backup existing data
- [ ] Test new storage backend locally
- [ ] Verify entity count triggers migration
- [ ] Document migration procedure

### During Migration

- [ ] Run migration script
- [ ] Verify data integrity
- [ ] Test search functionality
- [ ] Monitor performance

### After Migration

- [ ] Update env vars
- [ ] Remove old storage if needed
- [ ] Monitor for issues
- [ ] Update documentation

---

## Code Abstraction

**All storage backends use the same interface:**

```typescript
interface VectorStoreInterface {
  embedEntity(entity: BaseEntity): Promise<void>;
  search(query: string, options?: SearchOptions): Promise<Results>;
  deleteEmbedding(entityId: string): Promise<void>;
  embedAll(entities: BaseEntity[]): Promise<void>;
}
```

**Your code never changes:**

```typescript
// Works with ANY storage backend
const vectorStore = createVectorStore();

// Same code, different backend
await vectorStore.embedEntity(entity);
const results = await vectorStore.search('query');
```

---

## Performance Comparison

| Backend | < 500 | 500-1K | 1K-2K | 2K+ |
|---------|-------|--------|-------|-----|
| JSON | ✅ Fast | ⚠️ Slower | ❌ Slow | ❌ Too slow |
| Vercel KV | ✅ Fast | ✅ Fast | ⚠️ OK | ❌ Limited |
| Supabase | ✅ Fast | ✅ Fast | ✅ Fast | ✅ Fast |

---

## Cost Comparison

| Backend | Setup | Monthly Cost | Scale |
|---------|-------|--------------|-------|
| JSON | Free | $0 | < 500 |
| Vercel KV | Free | $0 (free tier) | < 2K |
| Supabase | Free | $0 (free tier) | < 10K |

**All options have free tiers that work for MVP/PoC stage.**

---

## Recommendation

### Phase 1: Now (100-500 entities)
✅ **Use JSON**
- Simplest setup
- No dependencies
- Good performance

### Phase 2: Growth (500-2K entities)
✅ **Migrate to Vercel KV**
- Still simple
- Better performance
- Free tier sufficient

### Phase 3: Scale (2K+ entities)
✅ **Migrate to Supabase**
- Best performance
- Advanced queries
- Scales to millions

---

## Implementation Status

- ✅ JSON storage - **Ready now**
- ✅ Vercel KV storage - **Ready (install @vercel/kv)**
- ✅ Supabase storage - **Ready (setup pgvector)**
- ✅ Abstraction layer - **Complete**
- ✅ Auto-selection - **Complete**
- ✅ Migration scripts - **Ready**

---

**Start with JSON. Migrate when needed. Code stays the same.**

