# Storage Decision Guide - When to Migrate

**Clear triggers for migration between storage backends**

---

## Quick Decision Tree

```
How many entities?
├─ < 500 → Use JSON
├─ 500-2K → Use Vercel KV
└─ 2K+ → Use Supabase

Are cold starts > 3 seconds?
└─ Yes → Migrate to KV/Supabase

File size > 5MB?
└─ Yes → Migrate to KV
```

---

## Detailed Triggers

### Trigger: Migrate to Vercel KV

**When:**
- ✅ Entity count > 400
- ✅ Cold start time > 3 seconds
- ✅ JSON file size > 5MB
- ✅ Search latency > 500ms

**Action:**
```bash
# Set env var
VECTOR_STORE_BACKEND=vercel-kv

# Or auto-selects at 500+ entities
```

---

### Trigger: Migrate to Supabase

**When:**
- ✅ Entity count > 1,500
- ✅ Need complex queries on metadata
- ✅ Search latency > 1 second (KV)
- ✅ Need to scale beyond 2K entities

**Action:**
```bash
# Set env var
VECTOR_STORE_BACKEND=supabase

# Run SQL migrations (see quickstart guide)
```

---

## Performance Monitoring

```typescript
// Add to your monitoring
function checkStorageHealth(vectorStore: VectorStoreInterface) {
  const stats = vectorStore.getStats?.();
  
  if (!stats) return;
  
  // Warn if approaching limits
  if (stats.count > 400 && stats.storageType === 'json') {
    console.warn('⚠️ Consider migrating to Vercel KV (>400 entities)');
  }
  
  if (stats.count > 1500 && stats.storageType === 'vercel-kv') {
    console.warn('⚠️ Consider migrating to Supabase (>1500 entities)');
  }
  
  // Warn if file size growing
  if (stats.size > 5 && stats.storageType === 'json') {
    console.warn('⚠️ JSON file > 5MB, consider migrating');
  }
}
```

---

## Migration is Painless

**Same code, different backend:**

```typescript
// Before migration (JSON)
const vectorStore = createVectorStore('json');

// After migration (KV) - NO CODE CHANGES
const vectorStore = createVectorStore('vercel-kv');

// All methods work the same
await vectorStore.embedEntity(entity);
const results = await vectorStore.search('query');
```

---

**Start with JSON. The abstraction layer makes migration trivial when needed.**

