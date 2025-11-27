# Provenance Integration Guide - Adding P0 Trust Features

This guide shows how to integrate provenance (data quality, trust, audit trail) into your unified data schema so that trust mechanisms are a natural part of the dataset.

---

## Overview

The enhanced schema adds a `provenance` field to every `BaseEntity` and `UniversalRelationship`. This enables:

- ✅ **Automatic data quality tracking** as data grows
- ✅ **Elegant filtering** by confidence, verification, freshness
- ✅ **Complete audit trails** for compliance and debugging
- ✅ **Natural trust indicators** in UI
- ✅ **Scalable quality management** as datasets expand

---

## Architecture

### Enhanced Schema Structure

```typescript
BaseEntity {
  // ... existing fields ...
  provenance: {
    source: { type, name, reference, ingestedAt, ... }
    freshness: { lastUpdatedAt, lastVerifiedAt, ageInDays, isStale }
    quality: { confidence, verificationStatus, verifiedBy, ... }
    audit: { createdAt, changeHistory: [...] }
    flags: [{ type, severity, message, ... }]
  }
}
```

### Key Benefits

1. **Always Present** - Every entity has provenance automatically
2. **Filterable** - Query by confidence, verification, freshness
3. **Auditable** - Complete change history built-in
4. **Extensible** - Add new quality metrics without schema changes

---

## Step 1: Update BaseEntity Interface

Replace your current `BaseEntity` import with the enhanced version:

```typescript
// Before
import type { BaseEntity } from '@/lib/base-entity';

// After
import type { BaseEntity } from '@/lib/base-entity-enhanced';
```

The enhanced version extends the original, so existing code continues to work.

---

## Step 2: Update Adapters to Include Provenance

### Example: Enhanced Stakeholder Adapter

```typescript
import { stakeholderToBaseEntity } from '@/lib/adapters/stakeholder-adapter';
import { createNavigateProvenance } from '@/lib/adapters/provenance-helpers';

export function stakeholderToBaseEntity(stakeholder: Stakeholder): BaseEntity {
  const entity: BaseEntity = {
    _version: '1.0',
    id: stakeholder.id,
    name: stakeholder.name,
    description: stakeholder.description,
    entityType: 'stakeholder',
    domain: 'navigate',
    
    // ... existing metadata ...
    
    // NEW: Add provenance automatically
    provenance: createNavigateProvenance(stakeholder.id),
    
    _original: stakeholder,
  };

  return entity;
}
```

### Example: Enhanced Challenge Adapter

```typescript
import { createAtlasProvenance } from '@/lib/adapters/provenance-helpers';

export function challengeToBaseEntity(challenge: Challenge): BaseEntity {
  const entity: BaseEntity = {
    // ... existing fields ...
    
    // NEW: Add provenance
    provenance: createAtlasProvenance(challenge.id),
  };

  return entity;
}
```

### Example: Enhanced Relationship Adapter

```typescript
import { 
  createExplicitRelationshipProvenance,
  createComputedRelationshipProvenance 
} from '@/lib/adapters/provenance-helpers';

export function relationshipToUniversal(
  rel: Relationship,
  isComputed: boolean = false
): UniversalRelationship {
  const relationship: UniversalRelationship = {
    id: rel.id,
    source: rel.source,
    target: rel.target,
    // ... existing fields ...
    
    // NEW: Add provenance based on relationship type
    provenance: isComputed
      ? createComputedRelationshipProvenance('keyword_similarity', 0.6)
      : createExplicitRelationshipProvenance('Navigate Dataset'),
  };

  return relationship;
}
```

---

## Step 3: Use Provenance for Filtering

### Filter Entities by Quality

```typescript
import { filterByProvenance, type ProvenanceFilter } from '@/lib/base-entity-enhanced';

// Only show high-confidence, verified entities
const highQualityEntities = filterByProvenance(entities, {
  minConfidence: 0.7,
  verifiedOnly: true,
  freshOnly: true, // Exclude stale data (>90 days)
});

// Show all except flagged/unverified
const cleanEntities = filterByProvenance(entities, {
  excludeFlagged: true,
  excludeSourceTypes: ['unknown', 'legacy'],
});

// Quality tier filtering
const tier1Entities = filterByProvenance(entities, {
  qualityTiers: ['high', 'medium'],
});
```

### Add Provenance Filters to UI

```typescript
// In your filter component
interface FilterState {
  // ... existing filters ...
  provenance?: ProvenanceFilter;
}

// Example filter UI
<div className="provenance-filters">
  <label>
    <input 
      type="checkbox" 
      checked={filters.provenance?.verifiedOnly}
      onChange={(e) => setFilters({
        ...filters,
        provenance: { ...filters.provenance, verifiedOnly: e.target.checked }
      })}
    />
    Only verified data
  </label>
  
  <label>
    <input 
      type="checkbox" 
      checked={filters.provenance?.freshOnly}
      onChange={(e) => setFilters({
        ...filters,
        provenance: { ...filters.provenance, freshOnly: e.target.checked }
      })}
    />
    Exclude stale data (>90 days)
  </label>
  
  <select 
    value={filters.provenance?.minConfidence || 0}
    onChange={(e) => setFilters({
      ...filters,
      provenance: { ...filters.provenance, minConfidence: parseFloat(e.target.value) }
    })}
  >
    <option value={0}>Any confidence</option>
    <option value={0.7}>High (0.7+)</option>
    <option value={0.9}>Very High (0.9+)</option>
  </select>
</div>
```

---

## Step 4: Display Trust Indicators in UI

### Entity Card with Provenance Badge

```typescript
function EntityCard({ entity }: { entity: BaseEntity }) {
  const { provenance } = entity;
  const metrics = computeProvenanceMetrics(provenance);
  
  return (
    <div className="entity-card">
      <h3>{entity.name}</h3>
      
      {/* Trust indicator badge */}
      <div className="provenance-badge">
        {metrics.isTrustworthy && (
          <span className="badge verified">✓ Verified</span>
        )}
        {provenance.quality.confidence < 0.7 && (
          <span className="badge warning">⚠ Low Confidence</span>
        )}
        {metrics.isStale && (
          <span className="badge stale">🕐 Stale Data</span>
        )}
      </div>
      
      {/* Provenance details (expandable) */}
      <details>
        <summary>Data Quality Info</summary>
        <div className="provenance-details">
          <p>Confidence: {Math.round(provenance.quality.confidence * 100)}%</p>
          <p>Source: {provenance.source.name}</p>
          <p>Last Updated: {formatDate(provenance.freshness.lastUpdatedAt)}</p>
          <p>Age: {metrics.ageInDays} days</p>
        </div>
      </details>
    </div>
  );
}
```

### Network Graph with Confidence Indicators

```typescript
function UnifiedNetworkGraph({ entities, relationships }) {
  // Color nodes by confidence
  const nodeColor = (node: BaseEntity) => {
    const confidence = node.provenance.quality.confidence;
    if (confidence >= 0.8) return '#10B981'; // Green
    if (confidence >= 0.6) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };
  
  // Opacity based on staleness
  const nodeOpacity = (node: BaseEntity) => {
    const metrics = computeProvenanceMetrics(node.provenance);
    return metrics.isStale ? 0.5 : 1.0;
  };
  
  return (
    <ForceGraph2D
      nodeColor={nodeColor}
      nodeOpacity={nodeOpacity}
      // ... other props
    />
  );
}
```

---

## Step 5: Enable Auditing

### Track Changes Automatically

```typescript
import { addAuditEntry } from '@/lib/base-entity-enhanced';

// When entity is updated
function updateEntity(entity: BaseEntity, updates: Partial<BaseEntity>) {
  const updatedEntity = {
    ...entity,
    ...updates,
    provenance: addAuditEntry(entity.provenance, {
      changedBy: currentUserId,
      changeType: 'update',
      field: Object.keys(updates)[0],
      oldValue: entity[updates.field],
      newValue: updates[updates.field],
      reason: 'User edited entity',
    }),
  };
  
  return updatedEntity;
}
```

### Display Audit Trail

```typescript
function AuditTrail({ entity }: { entity: BaseEntity }) {
  const { audit } = entity.provenance;
  
  return (
    <div className="audit-trail">
      <h4>Change History</h4>
      <ul>
        {audit.changeHistory?.map((entry, idx) => (
          <li key={idx}>
            <strong>{entry.changeType}</strong> by {entry.changedBy}
            <br />
            <small>{formatDate(entry.timestamp)}</small>
            {entry.reason && <p>{entry.reason}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Step 6: Quality Management

### Mark Entities as Verified

```typescript
import { markAsVerified } from '@/lib/base-entity-enhanced';

// Expert verifies an entity
function verifyEntity(entity: BaseEntity, verifiedBy: string) {
  const updatedEntity = {
    ...entity,
    provenance: markAsVerified(entity.provenance, verifiedBy, 0.95),
  };
  
  // Save to database
  await saveEntity(updatedEntity);
}
```

### Flag Data Quality Issues

```typescript
import { addQualityFlag } from '@/lib/base-entity-enhanced';

// Flag an entity with issues
function flagEntity(
  entity: BaseEntity,
  issue: { message: string; severity: 'warning' | 'error' }
) {
  const updatedEntity = {
    ...entity,
    provenance: addQualityFlag(entity.provenance, {
      type: 'custom',
      severity: issue.severity,
      message: issue.message,
      flaggedBy: currentUserId,
    }),
  };
  
  return updatedEntity;
}
```

### Bulk Quality Refresh

```typescript
import { refreshProvenance } from '@/lib/adapters/provenance-helpers';

// Refresh all entities from source
async function refreshAllEntities(entities: BaseEntity[]) {
  const refreshed = entities.map(entity => ({
    ...entity,
    provenance: refreshProvenance(entity.provenance, 'refresh-job'),
  }));
  
  await saveEntities(refreshed);
}
```

---

## Step 7: Migration Strategy

### Option A: Gradual Migration (Recommended)

1. **Update adapters** to include provenance for new entities
2. **Existing entities** get default provenance when first accessed
3. **Migration script** adds provenance to existing data

```typescript
// Migration script
async function migrateExistingEntities() {
  const entities = await loadAllEntities();
  
  const migrated = entities.map(entity => {
    // If entity already has provenance, skip
    if (entity.provenance) return entity;
    
    // Add default provenance based on domain
    return {
      ...entity,
      provenance: entity.domain === 'navigate'
        ? createNavigateProvenance(entity.id)
        : createAtlasProvenance(entity.id),
    };
  });
  
  await saveEntities(migrated);
}
```

### Option B: Backfill on Load

```typescript
// In unified data loader
export function loadUnifiedEntities(): BaseEntity[] {
  const entities = [
    ...atlasEntities,
    ...navigateEntities,
  ];
  
  // Add provenance if missing
  return entities.map(entity => ({
    ...entity,
    provenance: entity.provenance || createDefaultProvenance({
      type: 'unknown',
      name: 'Legacy Data',
      ingestedBy: 'migration',
    }),
  }));
}
```

---

## Step 8: Filter Integration Example

### Enhanced Entity Filter Component

```typescript
import { filterByProvenance, type ProvenanceFilter } from '@/lib/base-entity-enhanced';

export function useFilteredEntities(
  entities: BaseEntity[],
  filters: EnhancedEntityFilter
) {
  return useMemo(() => {
    let filtered = entities;
    
    // Apply standard filters first
    if (filters.entityTypes) {
      filtered = filtered.filter(e => filters.entityTypes!.includes(e.entityType));
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query)
      );
    }
    
    // Apply provenance filters
    if (filters.provenance) {
      filtered = filterByProvenance(filtered, filters.provenance);
    }
    
    return filtered;
  }, [entities, filters]);
}
```

### UI Filter Controls

```typescript
export function ProvenanceFilterPanel({
  filters,
  onChange,
}: {
  filters: ProvenanceFilter;
  onChange: (filters: ProvenanceFilter) => void;
}) {
  return (
    <div className="provenance-filters-panel">
      <h3>Data Quality Filters</h3>
      
      <label>
        <input
          type="checkbox"
          checked={filters.verifiedOnly || false}
          onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })}
        />
        Only verified entities
      </label>
      
      <label>
        <input
          type="checkbox"
          checked={filters.freshOnly || false}
          onChange={(e) => onChange({ ...filters, freshOnly: e.target.checked })}
        />
        Exclude stale data (>90 days)
      </label>
      
      <label>
        Minimum confidence:
        <select
          value={filters.minConfidence || 0}
          onChange={(e) => onChange({ ...filters, minConfidence: parseFloat(e.target.value) })}
        >
          <option value={0}>Any</option>
          <option value={0.5}>Fair (0.5+)</option>
          <option value={0.7}>Good (0.7+)</option>
          <option value={0.9}>Excellent (0.9+)</option>
        </select>
      </label>
      
      <label>
        <input
          type="checkbox"
          checked={filters.excludeFlagged || false}
          onChange={(e) => onChange({ ...filters, excludeFlagged: e.target.checked })}
        />
        Hide flagged entities
      </label>
    </div>
  );
}
```

---

## Benefits Summary

### 1. **Automatic Quality Tracking**
- Every entity has provenance from day 1
- No manual quality management needed
- Quality metrics computed automatically

### 2. **Elegant Filtering**
```typescript
// Simple, readable filters
filterByProvenance(entities, {
  verifiedOnly: true,
  minConfidence: 0.7,
  freshOnly: true,
});
```

### 3. **Complete Audit Trail**
- Every change tracked automatically
- Compliance-ready audit logs
- Debugging made easy

### 4. **Scalable as Data Grows**
- Provenance scales with dataset
- Quality management stays organized
- Filtering remains performant

### 5. **UI Integration**
- Trust badges in entity cards
- Confidence indicators in graphs
- Quality filters in UI

---

## Next Steps

1. ✅ Update `BaseEntity` import to enhanced version
2. ✅ Update adapters to include provenance
3. ✅ Add provenance filters to UI
4. ✅ Display trust indicators in components
5. ✅ Test with existing data

**Once integrated, provenance becomes a natural part of your dataset, enabling elegant filtering, auditing, and quality management as your data grows.**

