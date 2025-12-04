# Provenance Quick Reference

**Common patterns and code snippets for using provenance**

---

## Quick Filters

```typescript
import { filterByProvenance, computeProvenanceMetrics } from '@/lib/base-entity-enhanced';

// Only verified, high-confidence data
const highQuality = filterByProvenance(entities, {
  minConfidence: 0.7,
  verifiedOnly: true,
  freshOnly: true,
});

// Exclude problematic data
const clean = filterByProvenance(entities, {
  excludeFlagged: true,
  excludeSeverity: ['error'],
  minConfidence: 0.5,
});

// Research mode (show everything)
const allData = filterByProvenance(entities, {
  // No filters = show all
});
```

---

## Quality Checks

```typescript
// Check if entity is trustworthy
const metrics = computeProvenanceMetrics(entity.provenance);
if (metrics.isTrustworthy) {
  // High confidence + verified + fresh
}

// Check quality tier
if (metrics.qualityTier === 'high') {
  // confidence >= 0.8
}

// Check if stale
if (metrics.isStale) {
  // age > 90 days
}
```

---

## UI Badges

```typescript
// Trustworthy badge
{metrics.isTrustworthy && <Badge>✓ Verified</Badge>}

// Stale warning
{metrics.isStale && <Badge variant="warning">🕐 Stale</Badge>}

// Low confidence
{entity.provenance.quality.confidence < 0.5 && (
  <Badge variant="error">⚠ Low Confidence</Badge>
)}

// Verified
{entity.provenance.quality.verificationStatus === 'verified' && (
  <Badge>✓ Verified</Badge>
)}
```

---

## Visual Encoding

```typescript
// Color by confidence
const nodeColor = (entity: BaseEntity) => {
  const confidence = entity.provenance.quality.confidence;
  if (confidence >= 0.8) return '#10B981'; // Green
  if (confidence >= 0.6) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
};

// Opacity by staleness
const nodeOpacity = (entity: BaseEntity) => {
  const metrics = computeProvenanceMetrics(entity.provenance);
  return metrics.isStale ? 0.5 : 1.0;
};
```

---

## Update Operations

```typescript
import { 
  markAsVerified, 
  addQualityFlag, 
  addAuditEntry,
  refreshProvenance 
} from '@/lib/base-entity-enhanced';

// Mark as verified
entity.provenance = markAsVerified(entity.provenance, userId, 0.95);

// Add flag
entity.provenance = addQualityFlag(entity.provenance, {
  type: 'missing_field',
  severity: 'warning',
  message: 'Missing required field',
  flaggedBy: userId,
});

// Track change
entity.provenance = addAuditEntry(entity.provenance, {
  changedBy: userId,
  changeType: 'update',
  field: 'description',
  reason: 'User edited',
});

// Refresh
entity.provenance = refreshProvenance(entity.provenance, 'refresh-job');
```

---

## Common Patterns

```typescript
// Default filter (high quality)
const defaultFilter: ProvenanceFilter = {
  minConfidence: 0.7,
  verifiedOnly: false, // Allow auto-verified
  freshOnly: true,
  excludeSeverity: ['error'],
};

// Research filter (everything)
const researchFilter: ProvenanceFilter = {
  // Empty = show all
};

// Public dashboard (strict)
const publicFilter: ProvenanceFilter = {
  minConfidence: 0.8,
  verifiedOnly: true,
  freshOnly: true,
  excludeFlagged: true,
};
```

---

## Quality Presets

```typescript
const QUALITY_PRESETS = {
  strict: {
    minConfidence: 0.8,
    verifiedOnly: true,
    freshOnly: true,
    excludeFlagged: true,
  },
  balanced: {
    minConfidence: 0.7,
    verifiedOnly: false,
    freshOnly: true,
    excludeSeverity: ['error'],
  },
  permissive: {
    minConfidence: 0.5,
    excludeSeverity: ['error'],
  },
  all: {}, // No filters
};
```

