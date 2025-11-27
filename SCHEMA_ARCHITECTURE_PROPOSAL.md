# Schema Architecture Proposal: Universal vs Domain-Specific

## Current State Analysis

### Challenge Schema (`lib/types.ts`)
- **Entities**: Challenges only
- **Relationships**: Implicit (similarity-based via keywords)
- **Key Fields**: sector, problem_type, TRL, funding, buyer, keywords
- **No explicit graph structure**

### Navigate Schema (`lib/navigate-types.ts`)
- **Entities**: Stakeholder, Technology, Project, FundingEvent
- **Relationships**: Explicit graph (`Relationship` with source/target/type/weight)
- **Key Fields**: TRL, funding, knowledge_base, tags
- **Rich relationship metadata**

## The Core Question

**Should we have:**
1. **Universal Schema** - One schema for all pages (Navigate, Rail, Innovation, etc.)
2. **Domain-Specific Schemas** - Separate schemas per page type
3. **Hybrid Approach** - Core interface + domain extensions

## Recommendation: Hybrid Approach

### Why Hybrid?

✅ **Pros:**
- Same visuals work everywhere (universal base)
- Type safety per domain (domain extensions)
- Cross-domain relationships possible (IUK → funds Technology, IUK → provides Challenge)
- Future pages can add new entity types without breaking existing code
- AI can reason across domains (enriched knowledge base)

❌ **Cons:**
- More initial setup
- Need adapter layer for legacy data

---

## Proposed Architecture

### 1. Core Entity Interface (Universal Base)

```typescript
// All entities implement this base
export interface BaseEntity {
  // Core Identity (required)
  id: string;
  name: string; // or title for challenges
  description: string;
  entityType: EntityType; // 'challenge' | 'stakeholder' | 'technology' | 'project' | ...
  
  // Classification (optional but common)
  sector?: Sector | string;
  tags?: string[];
  trl?: number | { min: number; max: number };
  
  // Financial (optional)
  funding?: {
    amount?: number | { min: number; max: number };
    type?: string;
    currency?: string;
  };
  
  // Knowledge Base (for AI enrichment)
  knowledge_base?: KnowledgeBase;
  
  // Metadata
  data_quality?: DataQuality;
  created_at?: string;
  updated_at?: string;
  
  // Domain-specific data (flexible)
  domainData?: Record<string, any>;
}

export type EntityType = 
  | 'challenge' 
  | 'stakeholder' 
  | 'technology' 
  | 'project' 
  | 'funding_event'
  | 'innovation' // Future
  | 'rail_challenge' // Future
  | 'rail_stakeholder'; // Future
```

### 2. Domain-Specific Extensions

```typescript
// Challenge extends BaseEntity
export interface Challenge extends BaseEntity {
  entityType: 'challenge';
  title: string; // maps to name
  problem_type: { primary: string; sub_categories: string[] };
  buyer: { organization: string; org_type: string };
  timeline: { deadline?: Date; urgency: string };
  domainData: {
    source_url: string;
    keywords: string[];
    maturity: { trl_min?: number; trl_max?: number };
    // ... other challenge-specific fields
  };
}

// Stakeholder extends BaseEntity
export interface Stakeholder extends BaseEntity {
  entityType: 'stakeholder';
  type: StakeholderType; // Government, Research, Industry, Intermediary
  domainData: {
    location: { city?: string; region: string; country: string };
    contact: { email?: string; website?: string };
    funding_capacity: 'High' | 'Medium' | 'Low';
    // ... other stakeholder-specific fields
  };
}

// Technology extends BaseEntity
export interface Technology extends BaseEntity {
  entityType: 'technology';
  category: TechnologyCategory;
  domainData: {
    trl_current: number;
    trl_projected_2030?: number;
    deployment_ready: boolean;
    // ... other technology-specific fields
  };
}
```

### 3. Unified Relationship Model (Cross-Domain)

```typescript
// Relationships can connect ANY entity types
export interface UniversalRelationship {
  id: string;
  source: string; // Entity ID (any type)
  target: string; // Entity ID (any type)
  sourceType: EntityType; // For type safety
  targetType: EntityType;
  
  type: RelationshipType; // 'funds' | 'provides' | 'researches' | 'collaborates_with' | ...
  
  // Strength
  weight: number;
  strength: 'strong' | 'medium' | 'weak';
  
  // Context
  metadata: {
    start_date?: string;
    end_date?: string;
    amount?: number;
    description?: string;
    program?: string;
    // ... flexible metadata
  };
  
  bidirectional: boolean;
  created_at: string;
  updated_at: string;
}

// Extended relationship types for cross-domain
export type RelationshipType = 
  | 'funds' // Stakeholder → Technology/Project
  | 'researches' // Stakeholder → Technology
  | 'collaborates_with' // Stakeholder ↔ Stakeholder
  | 'advances' // Technology → Technology
  | 'participates_in' // Stakeholder → Project
  | 'provides' // Stakeholder → Challenge (NEW: IUK provides challenges)
  | 'addresses' // Challenge → Technology (NEW: Challenge needs technology)
  | 'matches' // Innovation → Challenge (NEW: Innovation matches challenge)
  | 'owns' | 'supplies';
```

### 4. Entity Registry (For Cross-Domain Queries)

```typescript
// Central registry of all entities across domains
export interface EntityRegistry {
  challenges: Map<string, Challenge>;
  stakeholders: Map<string, Stakeholder>;
  technologies: Map<string, Technology>;
  projects: Map<string, Project>;
  // Future: innovations, rail_challenges, etc.
  
  // Unified access
  getEntity(id: string, type?: EntityType): BaseEntity | null;
  getEntitiesByType(type: EntityType): BaseEntity[];
  getRelatedEntities(entityId: string, type?: EntityType): BaseEntity[];
}

// Example: Find all entities related to IUK
const iukId = 'org-innovate-uk';
const iukRelationships = relationships.filter(
  r => r.source === iukId || r.target === iukId
);
// Could return: Technologies (funds), Challenges (provides), Stakeholders (collaborates_with)
```

---

## Implementation Strategy

### Phase 1: Core Interface + Adapters (Current)
1. Create `BaseEntity` interface
2. Create adapters to convert existing schemas:
   - `challengeToBaseEntity(challenge: Challenge): BaseEntity`
   - `stakeholderToBaseEntity(stakeholder: Stakeholder): BaseEntity`
3. Update visualizations to accept `BaseEntity[]` instead of specific types
4. Keep existing domain types for type safety

### Phase 2: Unified Relationships (Next)
1. Extend `Relationship` to support cross-domain
2. Add new relationship types: `provides`, `addresses`, `matches`
3. Create relationship builder that can connect any entity types
4. Update network visualizations to show cross-domain links

### Phase 3: Entity Registry (Future)
1. Create centralized `EntityRegistry`
2. Build cross-domain query functions
3. Enhance AI context with cross-domain knowledge
4. Add cross-domain insights panels

---

## Example: Cross-Domain Connection

```typescript
// IUK funds aviation technology AND provides challenges
const relationships: UniversalRelationship[] = [
  {
    id: 'rel-iuk-h2gear-funds',
    source: 'org-innovate-uk',
    target: 'tech-h2gear',
    sourceType: 'stakeholder',
    targetType: 'technology',
    type: 'funds',
    weight: 5000000,
    // ...
  },
  {
    id: 'rel-iuk-rail-challenge-provides',
    source: 'org-innovate-uk',
    target: 'challenge-rail-001',
    sourceType: 'stakeholder',
    targetType: 'challenge',
    type: 'provides', // NEW relationship type
    weight: 1,
    metadata: {
      description: 'IUK Innovation Portal challenge',
      program: 'Future Flight Challenge'
    }
  }
];

// Network visualization can now show:
// IUK → [funds] → H2GEAR Technology
// IUK → [provides] → Rail Challenge
// Both in the same graph!
```

---

## Benefits for Your Use Case

### 1. Same Visuals, Different Data
```typescript
// Toolkit D3 Network Graph works with:
- Challenges (grouped by sector/problem_type/TRL)
- Stakeholders (grouped by type)
- Technologies (grouped by category)
- Mixed entities (cross-domain graph)
```

### 2. Cross-Domain Insights
```typescript
// When selecting IUK:
- Funds: [Technologies, Projects]
- Provides: [Challenges]
- Collaborates with: [Stakeholders]
- All in one insights panel!
```

### 3. Future Pages (Rail, Innovation)
```typescript
// Just add new entity types:
export interface RailChallenge extends BaseEntity {
  entityType: 'rail_challenge';
  // Rail-specific fields
}

// Existing visuals work immediately!
// Just need adapter: railChallengeToBaseEntity()
```

### 4. AI Knowledge Base Enrichment
```typescript
// AI can reason:
"IUK funds H2GEAR technology and provides rail challenges.
Rail challenges might benefit from H2GEAR technology.
Suggest connection: challenge-rail-001 addresses tech-h2gear"
```

---

## Migration Path

### Step 1: Create Base Interface (No Breaking Changes)
- Add `BaseEntity` interface
- Create adapters (keep existing types)
- Visualizations accept both old and new formats

### Step 2: Update Visualizations Gradually
- Start with Toolkit D3 Network Graph
- Accept `BaseEntity[]` + adapter function
- Other visuals follow

### Step 3: Add Cross-Domain Relationships
- Extend relationship types
- Update relationship builder
- Test with IUK example

### Step 4: Build Entity Registry
- Centralized entity storage
- Cross-domain queries
- Enhanced AI context

---

## Decision Points

**Q: Should we use universal schema or domain-specific?**
**A: Hybrid** - Core interface + domain extensions

**Q: How to handle shared connections?**
**A: Unified relationship model** - Relationships can connect any entity types

**Q: What about future pages (Rail, Innovation)?**
**A: Just add new entity types** - Existing visuals work immediately

**Q: How to enrich AI knowledge base?**
**A: Entity registry** - Cross-domain queries provide richer context

---

## Next Steps

1. **Review this proposal** - Does this align with your vision?
2. **Create BaseEntity interface** - Start with core fields
3. **Build adapters** - Convert Challenge/Navigate to BaseEntity
4. **Update Toolkit D3 Network Graph** - Accept BaseEntity + adapter
5. **Add cross-domain relationships** - Test with IUK example

