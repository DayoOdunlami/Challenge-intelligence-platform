# Schema Architecture Decision: Universal vs Domain-Specific

## Problem Statement

We're building a platform with multiple "pages" (Atlas/Challenges, Navigate/Aviation, future Rail, Innovation) that need to share visualization components. Currently:

- **Atlas/Challenges**: Has its own data schema (`Challenge`) and visualizations
- **Navigate/Aviation**: Has its own data schema (`Stakeholder`, `Technology`, `Project`) and visualizations
- **Future pages** (Rail, Innovation): Will need their own schemas and visuals

**The Question:** Should we:
1. **Universal Schema** - One schema for all pages (same visuals everywhere)
2. **Domain-Specific Schemas** - Separate schemas per page (different visuals per page)
3. **Hybrid Approach** - Core interface + domain extensions (same visuals, different data adapters)

## Current State

### Atlas/Challenges
- Schema: `Challenge` with fields like `sector`, `problem_type`, `TRL`, `keywords`, `buyer`
- Visualizations: Network graph based on keyword similarity
- Relationships: Implicit (computed from keyword overlap)

### Navigate/Aviation
- Schema: `Stakeholder`, `Technology`, `Project`, `FundingEvent`
- Visualizations: Network graph with explicit relationships (`funds`, `collaborates_with`, `researches`)
- Relationships: Explicit graph structure with metadata

### The Challenge
- Both need network graphs, but currently use different components
- Both have TRL, sectors, funding - but different field names
- Future pages will need same visuals but different data structures
- Cross-domain connections are valuable (e.g., IUK funds aviation tech AND provides challenges)

## Proposed Solution: Hybrid Approach

### Core Concept
Create a **BaseEntity interface** that all domain entities extend, then use **adapter functions** to convert domain-specific data to the universal format.

### Architecture

```typescript
// 1. Universal Base Interface
interface BaseEntity {
  id: string;
  name: string;
  description: string;
  entityType: 'challenge' | 'stakeholder' | 'technology' | 'project' | ...
  sector?: string;
  tags?: string[];
  trl?: number | { min: number; max: number };
  funding?: { amount?: number };
  // ... common fields all entities share
}

// 2. Domain-Specific Extensions (keep existing types)
interface Challenge extends BaseEntity {
  entityType: 'challenge';
  title: string; // maps to BaseEntity.name
  problem_type: { primary: string; ... };
  // ... challenge-specific fields
}

interface Stakeholder extends BaseEntity {
  entityType: 'stakeholder';
  type: 'Government' | 'Research' | 'Industry';
  // ... stakeholder-specific fields
}

// 3. Adapter Functions
function challengesToBaseEntities(challenges: Challenge[]): BaseEntity[]
function stakeholdersToBaseEntities(stakeholders: Stakeholder[]): BaseEntity[]

// 4. Universal Visualizations
function ToolkitD3NetworkGraph({
  entities: BaseEntity[], // Works with any entity type!
  relationships?: UniversalRelationship[],
  controls?: VisualizationControls
})
```

### How It Works

**Navigate Page (No Visual Changes):**
```
Stakeholders/Technologies → [Adapter] → BaseEntity[] → Toolkit D3 Network Graph
Result: Same graph rendering, just adapter layer added
```

**Atlas Page (Same Component, Different Controls):**
```
Challenges → [Adapter] → BaseEntity[] → Toolkit D3 Network Graph (same component!)
Controls: TRL slider, sector grouping, similarity threshold
Result: Same graph quality as Navigate, but with challenge-specific controls
```

**Future Rail Page:**
```
RailChallenges → [Adapter] → BaseEntity[] → Toolkit D3 Network Graph
Result: Works immediately, no new visualization code needed
```

## Benefits

### 1. Code Reuse
- ✅ Same visualization components work across all pages
- ✅ No need to rewrite network graphs, Sankey charts, etc. for each domain
- ✅ Future pages just need adapter functions

### 2. Consistency
- ✅ Same graph rendering quality everywhere
- ✅ Consistent user experience across pages
- ✅ Shared controls (TRL slider, node spacing) work universally

### 3. Flexibility
- ✅ Domain-specific controls still possible (relationship filters for Navigate, similarity threshold for Atlas)
- ✅ Keep existing type safety (Challenge, Stakeholder types still exist)
- ✅ No breaking changes to existing code

### 4. Cross-Domain Connections
- ✅ Unified relationship model allows connections between any entity types
- ✅ Example: IUK can `fund` a Technology AND `provide` a Challenge
- ✅ Enables richer AI knowledge base (cross-domain reasoning)

## Implementation Approach

### Phase 1: Foundation (No Breaking Changes)
1. Create `BaseEntity` interface with common fields
2. Create adapter functions (Challenge → BaseEntity, Stakeholder → BaseEntity)
3. Keep existing domain types for type safety

### Phase 2: Update Visualizations
1. Update Toolkit D3 Network Graph to accept `BaseEntity[]`
2. Test with Navigate (verify no visual changes)
3. Test with Atlas (verify same graph works with challenges)

### Phase 3: Domain-Specific Controls
1. Create control panel system that accepts domain-specific controls
2. Navigate: Relationship filters, TRL range
3. Atlas: Similarity threshold, sector grouping, problem type grouping

### Phase 4: Cross-Domain (Future)
1. Unified relationship model
2. Entity registry for cross-domain queries
3. Enhanced AI context with cross-domain knowledge

## Trade-offs

### Pros
- ✅ Maximum code reuse
- ✅ Consistent visual quality
- ✅ Future-proof (new pages easy to add)
- ✅ Enables cross-domain connections
- ✅ No breaking changes to existing code

### Cons
- ⚠️ Initial setup overhead (create BaseEntity + adapters)
- ⚠️ Adapter layer adds slight complexity
- ⚠️ Need to maintain adapter functions as schemas evolve

## Alternative Approaches Considered

### Option 1: Universal Schema Only
- **Problem**: Lose type safety, too generic, hard to maintain domain-specific fields

### Option 2: Domain-Specific Only
- **Problem**: Duplicate visualization code, inconsistent quality, harder to maintain

### Option 3: Hybrid (Recommended)
- **Best of both**: Type safety + code reuse + flexibility

## Questions for Review

1. Does the hybrid approach make sense for our use case?
2. Are there concerns about the adapter layer complexity?
3. Should we prioritize cross-domain connections now or later?
4. Are there other entity types we should consider in BaseEntity?
5. How should we handle domain-specific fields that don't map to BaseEntity?

## Recommendation

**Proceed with Hybrid Approach** because:
- Balances code reuse with type safety
- No breaking changes to existing code
- Enables future cross-domain features
- Consistent visual quality across all pages
- Easy to add new pages (just create adapter)

---

**Next Steps if Approved:**
1. Create BaseEntity interface
2. Build adapter functions for Challenge and Stakeholder
3. Update Toolkit D3 Network Graph to accept BaseEntity[]
4. Test with both Navigate and Atlas pages

