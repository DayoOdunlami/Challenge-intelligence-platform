# Embeddings Quick Start

**Get embeddings working in 5 minutes**

---

## ✅ Where is the Code?

**JSONVectorStore:** `src/lib/ai/vector-store-json.ts` ✅ Complete

**What's Ready:**
- ✅ Vector store implementation
- ✅ Embedding creation
- ✅ Semantic search
- ✅ Batch embedding method

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
npm install openai
```

---

### Step 2: Set Environment Variable

```bash
# .env.local
OPENAI_API_KEY=sk-your-key-here
```

---

### Step 3: Run Embedding Script

```bash
npx tsx scripts/embed-all-entities.ts
```

**That's it!** Embeddings will be saved to `data/embeddings/embeddings.json`

---

## 📊 What Gets Embedded?

**Enhanced text includes:**
- Entity name
- Description
- Keywords (for challenges)
- Sector information
- TRL (for technologies)
- Capabilities (for stakeholders)
- Funding information

**Result:** Rich context → Better search results

---

## 🧪 Test It

```typescript
import { createVectorStore } from '@/lib/ai/vector-store-abstraction';

const vectorStore = createVectorStore('json');

// Search
const results = await vectorStore.search('decarbonisation aviation', {
  topK: 5,
});

console.log(results.map(r => r.entity.name));
```

---

## 💰 Cost

**Initial embedding:**
- ~$0.001 for 127 entities
- Practically free ✅

**Ongoing:**
- ~$0.0001 per 10 new entities/month

---

## 📁 File Locations

- **Code:** `src/lib/ai/vector-store-json.ts`
- **Text builder:** `src/lib/ai/embedding-text-builder.ts`
- **Script:** `scripts/embed-all-entities.ts`
- **Storage:** `data/embeddings/embeddings.json` (auto-created)

---

**Run the script and you're done!**

