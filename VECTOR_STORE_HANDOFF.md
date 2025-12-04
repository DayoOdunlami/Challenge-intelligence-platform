# Vector Store Implementation - Fixed Version

## Files to Replace/Add

### 1. Replace Vector Store ✅

**File:** `src/lib/ai/vector-store-json.ts`

**Replace with:** Fixed version (already done)

**Key fixes:**
- ✅ Race condition fixed (`await this.initialized` before operations)
- ✅ Save queue prevents concurrent writes
- ✅ Lower default threshold (0.5 instead of 0.7)
- ✅ Hybrid search (60% semantic + 40% keyword)
- ✅ Find Similar method
- ✅ Keyword extraction for fallback search
- ✅ Better text builder (includes knowledge_base, cross_sector_signals)

---

### 2. Add Search API ✅

**File:** `src/app/api/ai/search/route.ts`

**Endpoints:**
```
POST /api/ai/search
{
  "query": "hydrogen aviation",
  "mode": "hybrid",     // 'semantic' | 'keyword' | 'hybrid'
  "topK": 10,
  "domain": "atlas",    // optional
  "threshold": 0.5      // optional
}

GET /api/ai/search?q=hydrogen+aviation&topK=5
```

---

### 3. Add Find Similar API ✅

**File:** `src/app/api/ai/similar/route.ts`

**Endpoint:**
```
POST /api/ai/similar
{
  "entityId": "rail-001",
  "topK": 5,
  "domain": "atlas"     // optional - filter to same domain
}
```

---

### 4. Replace Embedding Script ✅

**File:** `scripts/embed-all-entities.ts`

**Usage:**
```bash
# Embed all new entities
npx tsx scripts/embed-all-entities.ts

# Force re-embed everything
npx tsx scripts/embed-all-entities.ts --force

# Only embed specific domain
npx tsx scripts/embed-all-entities.ts --domain=atlas

# Dry run (show what would happen)
npx tsx scripts/embed-all-entities.ts --dry-run
```

---

## API Response Format

### Search Response
```json
{
  "results": [
    {
      "entity": {
        "id": "rail-001",
        "name": "Digital Railway Signalling",
        "description": "...",
        "entityType": "challenge",
        "domain": "atlas"
      },
      "similarity": 0.82,
      "similarityPercent": 82,
      "matchType": "hybrid"
    }
  ],
  "meta": {
    "query": "digital signalling",
    "mode": "hybrid",
    "count": 5
  }
}
```

### Find Similar Response
```json
{
  "results": [...],
  "query": {
    "entityId": "rail-001",
    "entityName": "Digital Railway Signalling"
  },
  "meta": {
    "count": 5
  }
}
```

---

## Frontend Integration

### Search Component
```tsx
async function handleSearch(query: string) {
  const res = await fetch('/api/ai/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topK: 10 }),
  });
  const data = await res.json();
  setResults(data.results);
}
```

### Find Similar Button
```tsx
async function handleFindSimilar(entityId: string) {
  const res = await fetch('/api/ai/similar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entityId, topK: 5 }),
  });
  const data = await res.json();
  setSimilarEntities(data.results);
}
```

---

## Testing

### Manual Test
```bash
# 1. Embed entities
npx tsx scripts/embed-all-entities.ts

# 2. Start dev server
npm run dev

# 3. Test search
curl -X POST http://localhost:3000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query": "hydrogen aviation", "topK": 5}'

# 4. Test find similar
curl -X POST http://localhost:3000/api/ai/similar \
  -H "Content-Type: application/json" \
  -d '{"entityId": "rail-001", "topK": 5}'
```

---

## Key Improvements Over Original

| Issue | Original | Fixed |
|-------|----------|-------|
| Race condition | `loadEmbeddings()` not awaited | `await this.initialized` before ops |
| Threshold | 0.7 (too strict) | 0.5 (better recall) |
| Search type | Semantic only | Hybrid (60% semantic + 40% keyword) |
| Find Similar | Missing | Added `findSimilar()` method |
| Text builder | Basic | Rich (knowledge_base, cross_sector_signals) |
| Save reliability | Fire and forget | Queued saves with error handling |
| Keywords | Not extracted | Extracted for fallback search |

---

## Checklist

- [x] Replace `src/lib/ai/vector-store-json.ts`
- [x] Create `src/app/api/ai/search/route.ts`
- [x] Create `src/app/api/ai/similar/route.ts`
- [x] Replace `scripts/embed-all-entities.ts`
- [ ] Run `npx tsx scripts/embed-all-entities.ts`
- [ ] Test endpoints
- [ ] Add "Find Similar" button to entity cards

---

**Next Step:** Run the embedding script to create embeddings for all entities!

