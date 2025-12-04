# Provenance Implementation - Quick Start Guide

## Step 1: Tag Existing Data as Baseline (5 minutes)

```typescript
// In your unified data loader: src/data/unified/index.ts
import { batchTagExistingData } from '@/lib/provenance/baseline-tagging';

// Tag all existing entities as dummy/baseline
export const unifiedEntities: BaseEntity[] = batchTagExistingData([
  ...atlasEntities,
  ...navigateEntities,
  ...cpcSeedEntities,
], 'dummy'); // or 'baseline', 'test'

// Now all entities have baselineClassification in metadata
```

---

## Step 2: Update Adapters for Auto-Classification (10 minutes)

```typescript
// Update your adapters to auto-classify new data
import { autoClassifyNewData } from '@/lib/provenance/baseline-tagging';

export function stakeholderToBaseEntity(stakeholder: Stakeholder): BaseEntity {
  const entity: BaseEntity = {
    // ... existing fields ...
    provenance: createNavigateProvenance(stakeholder.id),
  };
  
  // Auto-classify
  return autoClassifyNewData(entity, {
    sourceType: 'excel_import',
    sourceName: 'Navigate Dataset',
  });
}
```

---

## Step 3: Add Provenance Controls to Visualizations (15 minutes)

```typescript
// In any visualization component
import { ProvenanceControls } from '@/components/provenance/ProvenanceControls';
import { filterByProvenance } from '@/lib/base-entity-enhanced';

export function MyVisualization({ entities }: { entities: BaseEntity[] }) {
  const [provenanceFilters, setProvenanceFilters] = useState<ProvenanceFilter>({});
  
  // Filter entities by provenance (default: show all)
  const filteredEntities = useMemo(() => {
    if (Object.keys(provenanceFilters).length === 0) {
      return entities; // Show all by default
    }
    return filterByProvenance(entities, provenanceFilters);
  }, [entities, provenanceFilters]);
  
  return (
    <div>
      {/* Add provenance controls */}
      <ProvenanceControls
        filters={provenanceFilters}
        onChange={setProvenanceFilters}
        defaultOpen={false} // Collapsed by default
      />
      
      {/* Your visualization */}
      <MyChart entities={filteredEntities} />
    </div>
  );
}
```

---

## Step 4: Create Provenance Dashboard Route (10 minutes)

```typescript
// src/app/provenance/page.tsx
'use client';

import { ProvenanceDashboard } from '@/components/provenance/ProvenanceDashboard';
import { unifiedEntities } from '@/data/unified';

export default function ProvenancePage() {
  const handleBulkVerify = async (action: string, entityIds: string[]) => {
    // Implement bulk verification
    console.log(`${action} entities:`, entityIds);
  };
  
  const handleAIAudit = async (entityIds: string[]) => {
    // Call verification AI agent
    console.log('AI audit requested for:', entityIds);
  };
  
  return (
    <div className="container mx-auto p-6">
      <ProvenanceDashboard
        entities={unifiedEntities}
        onBulkAction={handleBulkVerify}
        onVerifyEntity={(id) => handleBulkVerify('verify', [id])}
        aiAuditAvailable={true}
        onRequestAIAudit={handleAIAudit}
      />
    </div>
  );
}
```

---

## Step 5: Default Filter Behavior (Already Done)

**Default: Show All Data**
- By default, `provenanceFilters` is empty `{}`
- Empty filters = show all entities
- Users can then filter for validated data using controls

```typescript
// Default behavior
const filteredEntities = Object.keys(filters).length === 0
  ? entities // Show all
  : filterByProvenance(entities, filters); // Filtered
```

---

## Step 6: AI Agent Setup (Future)

```typescript
// src/lib/ai/verification-agent.ts
import { VerificationAgent } from './verification-agent';

export const verificationAgent = new VerificationAgent({
  llmProvider: 'claude',
  knowledgeBase: unifiedEntities,
});

// In dashboard
const handleAIAudit = async (entityIds: string[]) => {
  const entities = unifiedEntities.filter(e => entityIds.includes(e.id));
  const results = await verificationAgent.verifyBatch(entities);
  
  // Update entities with verification results
  // ...
};
```

---

## File Structure Created

```
src/
├── lib/
│   ├── provenance/
│   │   └── baseline-tagging.ts      ✅ Created
│   └── base-entity-enhanced.ts      ✅ Created earlier
├── components/
│   └── provenance/
│       ├── ProvenanceControls.tsx   ✅ Created
│       ├── ProvenanceDashboard.tsx  ✅ Created
│       └── ProvenanceEntityCard.tsx ✅ Created earlier
└── app/
    └── provenance/
        └── page.tsx                  ⚠️ You need to create this
```

---

## Quick Checklist

- [ ] Tag existing data as baseline
- [ ] Update adapters for auto-classification
- [ ] Add ProvenanceControls to visualizations
- [ ] Create provenance dashboard page
- [ ] Test default behavior (show all)
- [ ] Test filtering (show validated only)
- [ ] Set up AI verification agent (future)

---

## Testing

1. **Check baseline tagging:**
   ```typescript
   console.log(unifiedEntities[0].metadata.custom?.baselineClassification);
   // Should be 'dummy' or 'baseline'
   ```

2. **Test filtering:**
   - Open visualization
   - Expand Provenance Controls
   - Check "Only verified data"
   - Should filter to verified entities (likely 0 for baseline data)

3. **Test dashboard:**
   - Navigate to `/provenance`
   - Should show quality metrics
   - Should show verification queue

---

## Next Steps

1. **Week 1:** Tag existing data, add controls
2. **Week 2:** Create dashboard, test workflows
3. **Week 3:** Set up AI verification agent
4. **Week 4:** Integrate with research agent

**You're all set to start!** 🚀

