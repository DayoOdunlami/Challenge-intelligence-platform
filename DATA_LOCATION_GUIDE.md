# Data Location Guide - Where to Update Entity Data

**Where the actual entity data lives and how it flows to embeddings**

---

## Data Flow

```
Source Data Files
    ↓
Adapters (Convert to BaseEntity)
    ↓
Unified Index (Combines everything)
    ↓
Embeddings Script (Embeds unifiedEntities)
```

---

## Source Data Files (Where to Update)

### 1. **Challenges Data**

**File:** `src/data/challenges.ts`

**Contains:**
- 50+ UK infrastructure challenges
- Challenge objects with title, description, keywords, sector, etc.

**Example:**
```typescript
const challenges: Challenge[] = [
  {
    id: 'rail-001',
    title: 'Digital Railway Signalling Modernisation',
    description: 'Seeking innovative digital signalling solutions...',
    keywords: ['digital signalling', 'ETCS', 'railway safety'],
    sector: { primary: 'rail', secondary: ['transport'] },
    // ... more fields
  },
  // ... more challenges
];
```

**To update challenges:** Edit `src/data/challenges.ts`

---

### 2. **Navigate Dummy Data**

**File:** `src/data/navigate-dummy-data.ts`

**Contains:**
- **Stakeholders** (30+ entities)
- **Technologies** (15+ entities)
- **Projects** (10+ entities)
- **Relationships** (connections between entities)

**Example:**
```typescript
const stakeholders: Stakeholder[] = [
  {
    id: 'org-dft-001',
    name: 'Department for Transport',
    type: 'Government',
    sector: 'Transport',
    description: 'UK government department responsible for transport...',
    // ... more fields
  },
  // ... more stakeholders
];

const technologies: Technology[] = [
  {
    id: 'tech-hydrogen-fuel-cell-001',
    name: 'Hydrogen Fuel Cell Propulsion',
    // ... more fields
  },
  // ... more technologies
];
```

**To update Navigate data:** Edit `src/data/navigate-dummy-data.ts`

---

### 3. **CPC Internal Seed Data**

**File:** `src/data/cpc-internal-seed.ts`

**Contains:**
- CPC-specific entities and relationships
- Internal reference data

**To update CPC data:** Edit `src/data/cpc-internal-seed.ts`

---

## How Data Flows to Embeddings

### Step 1: Source Data

**Files:**
- `src/data/challenges.ts` → Challenges array
- `src/data/navigate-dummy-data.ts` → Stakeholders, Technologies, Projects arrays
- `src/data/cpc-internal-seed.ts` → CPC entities

---

### Step 2: Unified Index (Combines Everything)

**File:** `src/data/unified/index.ts`

**What it does:**
1. Imports source data
2. Converts to `BaseEntity[]` using adapters
3. Combines everything into `unifiedEntities`

```typescript
// Line 13-15: Imports
import challenges from '@/data/challenges';
import { navigateDummyData } from '@/data/navigate-dummy-data';
import { cpcSeedEntities } from '@/data/cpc-internal-seed';

// Line 31: Converts challenges to BaseEntity
const atlasEntities: BaseEntity[] = challengesToBaseEntities(challenges);

// Line 95-103: Converts Navigate data to BaseEntity
const navigateStakeholderEntities = stakeholdersToBaseEntities(navigateDummyData.stakeholders);
const navigateTechnologyEntities = technologiesToBaseEntities(navigateDummyData.technologies);
const navigateProjectEntities = projectsToBaseEntities(navigateDummyData.projects);

const navigateEntities: BaseEntity[] = [
  ...navigateStakeholderEntities,
  ...navigateTechnologyEntities,
  ...navigateProjectEntities,
];

// Line 126-130: Exports unified array
export const unifiedEntities: BaseEntity[] = [
  ...atlasEntities,
  ...navigateEntities,
  ...cpcSeedEntities,
];
```

**This is what gets embedded!**

---

### Step 3: Embeddings Script

**File:** `scripts/embed-all-entities.ts`

**What it does:**
1. Imports `unifiedEntities` from unified index
2. Embeds all entities
3. Saves to `data/embeddings/embeddings.json`

```typescript
import { unifiedEntities } from '@/data/unified';
import { createVectorStore } from '@/lib/ai/vector-store-abstraction';

const vectorStore = createVectorStore('json');
await vectorStore.embedAll(unifiedEntities); // ← Uses unifiedEntities
```

---

## Where to Update Data

### ✅ To Add/Edit Challenges

**File:** `src/data/challenges.ts`

```typescript
const challenges: Challenge[] = [
  // Add new challenge here
  {
    id: 'rail-002',
    title: 'New Challenge',
    description: '...',
    // ...
  },
];
```

**Then:** Run embeddings script (if new entity)

---

### ✅ To Add/Edit Stakeholders

**File:** `src/data/navigate-dummy-data.ts`

```typescript
const stakeholders: Stakeholder[] = [
  // Add new stakeholder here
  {
    id: 'org-new-001',
    name: 'New Organization',
    type: 'Industry',
    // ...
  },
];
```

**Then:** Run embeddings script (if new entity)

---

### ✅ To Add/Edit Technologies

**File:** `src/data/navigate-dummy-data.ts`

```typescript
const technologies: Technology[] = [
  // Add new technology here
  {
    id: 'tech-new-001',
    name: 'New Technology',
    // ...
  },
];
```

**Then:** Run embeddings script (if new entity)

---

## Automatic Embedding (On Data Update)

### Option 1: Manual Re-embed

**After updating source data:**

```bash
npx tsx scripts/embed-all-entities.ts
```

---

### Option 2: Incremental Embedding (Future)

**When entity is created/updated through UI:**

```typescript
import { onEntityCreated } from '@/lib/ai/entity-hooks';

// After creating entity
await onEntityCreated(newEntity);
```

**Currently:** Manual re-embed after editing source files

---

## File Structure Summary

```
src/data/
├── challenges.ts              ← Edit challenges here
├── navigate-dummy-data.ts     ← Edit stakeholders/technologies/projects here
├── cpc-internal-seed.ts       ← Edit CPC data here
└── unified/
    └── index.ts               ← Combines everything (don't edit directly)
        └── exports unifiedEntities

scripts/
└── embed-all-entities.ts      ← Embeds unifiedEntities

src/lib/
├── adapters/                  ← Converts source data → BaseEntity
└── ai/
    └── vector-store-json.ts   ← Creates embeddings from BaseEntity

data/
└── embeddings/
    └── embeddings.json        ← Final embeddings (auto-generated)
```

---

## Quick Reference

| What to Update | File | Then Run |
|----------------|------|----------|
| Challenges | `src/data/challenges.ts` | `embed-all-entities.ts` |
| Stakeholders | `src/data/navigate-dummy-data.ts` | `embed-all-entities.ts` |
| Technologies | `src/data/navigate-dummy-data.ts` | `embed-all-entities.ts` |
| Projects | `src/data/navigate-dummy-data.ts` | `embed-all-entities.ts` |
| CPC Data | `src/data/cpc-internal-seed.ts` | `embed-all-entities.ts` |

---

## Example: Adding a New Stakeholder

### Step 1: Edit Source File

**File:** `src/data/navigate-dummy-data.ts`

```typescript
const stakeholders: Stakeholder[] = [
  // ... existing stakeholders ...
  
  // Add new one
  {
    id: 'org-example-001',
    name: 'Example Organization',
    type: 'Industry',
    sector: 'Aviation',
    description: 'A new organization working on zero-emission aviation',
    tags: ['hydrogen', 'TRL-6'],
    // ... rest of fields
  },
];
```

---

### Step 2: Re-run Embeddings

```bash
npx tsx scripts/embed-all-entities.ts
```

**Result:** New stakeholder is embedded and searchable

---

## Summary

**Source data location:**
- ✅ Challenges: `src/data/challenges.ts`
- ✅ Navigate data: `src/data/navigate-dummy-data.ts`
- ✅ CPC data: `src/data/cpc-internal-seed.ts`

**After updating:**
- ✅ Run `scripts/embed-all-entities.ts` to re-embed

**Data flow:**
1. Source files → 
2. Unified index (combines) → 
3. Embeddings script (embeds) → 
4. JSON file (stored)

**Edit source files, not the unified index or embeddings directly!**

