# Provenance Best Practices - Practical Usage Guide

**How to effectively use, manage, and display provenance in your platform**

---

## Table of Contents

1. [Usage Patterns](#usage-patterns)
2. [Management Strategies](#management-strategies)
3. [UI/UX Best Practices](#uiux-best-practices)
4. [What to Avoid](#what-to-avoid)
5. [Automation Opportunities](#automation-opportunities)
6. [Progressive Enhancement](#progressive-enhancement)

---

## Usage Patterns

### 1. **Default to High Quality (Progressive Disclosure)**

**Pattern:** Show only verified, high-confidence data by default, but allow users to "Show all data" if needed.

```typescript
// ✅ GOOD: Filter by default, but make it easy to change
function useDefaultEntities(entities: BaseEntity[]) {
  const [showAllData, setShowAllData] = useState(false);
  
  const filtered = useMemo(() => {
    if (showAllData) return entities;
    
    // Default: Only show high-quality data
    return filterByProvenance(entities, {
      minConfidence: 0.7,
      verifiedOnly: false, // Allow auto-verified
      freshOnly: true,
      excludeSeverity: ['error'], // Hide error-flagged data
    });
  }, [entities, showAllData]);
  
  return { filtered, showAllData, setShowAllData };
}

// UI
<div>
  <button onClick={() => setShowAllData(!showAllData)}>
    {showAllData ? 'Show High Quality Only' : 'Show All Data (including unverified)'}
  </button>
  <Badge>{filtered.length} of {entities.length} entities</Badge>
</div>
```

**Why:** Users trust your platform more when you show quality data by default, but power users need access to everything.

---

### 2. **Tiered Quality Display**

**Pattern:** Display entities differently based on quality tier without hiding them.

```typescript
// ✅ GOOD: Visual distinction, not exclusion
function EntityNode({ entity }: { entity: BaseEntity }) {
  const metrics = computeProvenanceMetrics(entity.provenance);
  
  return (
    <div className={`entity-node quality-${metrics.qualityTier}`}>
      <h3>{entity.name}</h3>
      
      {/* Subtle quality indicators */}
      {metrics.qualityTier === 'high' && (
        <span className="badge-verified" title="High quality, verified data">✓</span>
      )}
      {metrics.isStale && (
        <span className="badge-stale" title="Data >90 days old">🕐</span>
      )}
      {entity.provenance.quality.confidence < 0.5 && (
        <span className="badge-low-confidence" title="Low confidence data">⚠</span>
      )}
    </div>
  );
}

// CSS - Subtle visual differences
.quality-high { opacity: 1; border-left: 3px solid #10B981; }
.quality-medium { opacity: 0.95; border-left: 3px solid #F59E0B; }
.quality-low { opacity: 0.85; border-left: 3px solid #EF4444; }
```

**Why:** Users can see all data but understand quality at a glance without cluttering the UI.

---

### 3. **Smart Filtering with Overrides**

**Pattern:** Apply quality filters by default, but allow granular overrides.

```typescript
// ✅ GOOD: Intelligent defaults + user control
interface FilterState {
  // Quality filters (smart defaults)
  quality: {
    minConfidence: number; // Default: 0.7
    includeUnverified: boolean; // Default: false
    includeStale: boolean; // Default: false
    excludeFlagged: boolean; // Default: true
  };
  
  // Domain filters
  domains: Domain[];
  entityTypes: EntityType[];
}

function useSmartFilters(entities: BaseEntity[], userPreferences?: UserPreferences) {
  const [filters, setFilters] = useState<FilterState>(() => ({
    quality: {
      minConfidence: userPreferences?.defaultMinConfidence ?? 0.7,
      includeUnverified: false,
      includeStale: false,
      excludeFlagged: true,
    },
    domains: [],
    entityTypes: [],
  }));
  
  const filtered = useMemo(() => {
    let result = entities;
    
    // Apply quality filters
    const provenanceFilter: ProvenanceFilter = {
      minConfidence: filters.quality.minConfidence,
      verifiedOnly: !filters.quality.includeUnverified,
      freshOnly: !filters.quality.includeStale,
      excludeFlagged: filters.quality.excludeFlagged,
    };
    result = filterByProvenance(result, provenanceFilter);
    
    // Apply other filters...
    
    return result;
  }, [entities, filters]);
  
  return { filtered, filters, setFilters };
}
```

**Why:** Balances intelligent defaults with user control.

---

## Management Strategies

### 1. **Layered Quality Management**

**Pattern:** Different quality thresholds for different use cases.

```typescript
// ✅ GOOD: Context-aware quality requirements
const QUALITY_PRESETS = {
  // For public-facing dashboards
  public: {
    minConfidence: 0.8,
    verifiedOnly: true,
    freshOnly: true,
    excludeFlagged: true,
  },
  
  // For internal analysis
  internal: {
    minConfidence: 0.6,
    verifiedOnly: false,
    freshOnly: false,
    excludeFlagged: true,
  },
  
  // For research/exploration
  research: {
    minConfidence: 0.4,
    verifiedOnly: false,
    freshOnly: false,
    excludeFlagged: false, // Show everything, just flag issues
  },
};

function useQualityPreset(preset: keyof typeof QUALITY_PRESETS) {
  return QUALITY_PRESETS[preset];
}
```

**Why:** Different stakeholders need different quality levels.

---

### 2. **Batch Quality Operations**

**Pattern:** Bulk operations for managing quality at scale.

```typescript
// ✅ GOOD: Efficient bulk operations
class ProvenanceManager {
  /**
   * Mark multiple entities as verified
   */
  async bulkVerify(
    entityIds: string[],
    verifiedBy: string,
    options?: { confidence?: number; reason?: string }
  ) {
    const updates = entityIds.map(id => ({
      id,
      update: (entity: BaseEntity) => ({
        ...entity,
        provenance: markAsVerified(
          entity.provenance,
          verifiedBy,
          options?.confidence
        ),
      }),
    }));
    
    await batchUpdateEntities(updates);
  }
  
  /**
   * Refresh stale entities from source
   */
  async refreshStaleEntities(maxAgeInDays: number = 90) {
    const stale = entities.filter(entity => {
      const metrics = computeProvenanceMetrics(entity.provenance);
      return metrics.ageInDays > maxAgeInDays;
    });
    
    const refreshed = stale.map(entity => ({
      ...entity,
      provenance: refreshProvenance(entity.provenance, 'auto-refresh-job'),
    }));
    
    await saveEntities(refreshed);
  }
  
  /**
   * Flag entities with missing required fields
   */
  async flagIncompleteEntities() {
    const incomplete = entities.filter(entity => {
      const requiredFields = ['name', 'description', 'metadata.sector'];
      return requiredFields.some(field => !getNestedValue(entity, field));
    });
    
    const flagged = incomplete.map(entity => ({
      ...entity,
      provenance: addQualityFlag(entity.provenance, {
        type: 'missing_field',
        severity: 'warning',
        message: 'Missing required fields',
      }),
    }));
    
    await saveEntities(flagged);
  }
}
```

**Why:** Manage quality at scale efficiently.

---

### 3. **Quality Monitoring Dashboard**

**Pattern:** Monitor data quality metrics over time.

```typescript
// ✅ GOOD: Quality metrics dashboard
function QualityDashboard({ entities }: { entities: BaseEntity[] }) {
  const metrics = useMemo(() => {
    const total = entities.length;
    const verified = entities.filter(e => 
      e.provenance.quality.verificationStatus === 'verified'
    ).length;
    const stale = entities.filter(e => {
      const m = computeProvenanceMetrics(e.provenance);
      return m.isStale;
    }).length;
    const flagged = entities.filter(e => 
      e.provenance.flags && e.provenance.flags.length > 0
    ).length;
    
    const avgConfidence = entities.reduce((sum, e) => 
      sum + e.provenance.quality.confidence, 0
    ) / total;
    
    return {
      total,
      verified,
      verifiedPercentage: (verified / total) * 100,
      stale,
      stalePercentage: (stale / total) * 100,
      flagged,
      flaggedPercentage: (flagged / total) * 100,
      avgConfidence,
    };
  }, [entities]);
  
  return (
    <div className="quality-dashboard">
      <h2>Data Quality Metrics</h2>
      
      <div className="metrics-grid">
        <MetricCard
          label="Verified Entities"
          value={`${metrics.verified} / ${metrics.total}`}
          percentage={metrics.verifiedPercentage}
          status={metrics.verifiedPercentage > 80 ? 'good' : 'warning'}
        />
        
        <MetricCard
          label="Stale Data"
          value={`${metrics.stale} / ${metrics.total}`}
          percentage={metrics.stalePercentage}
          status={metrics.stalePercentage < 10 ? 'good' : 'warning'}
        />
        
        <MetricCard
          label="Average Confidence"
          value={metrics.avgConfidence.toFixed(2)}
          status={metrics.avgConfidence > 0.7 ? 'good' : 'warning'}
        />
      </div>
      
      {/* Quality trends over time */}
      <QualityTrendsChart entities={entities} />
    </div>
  );
}
```

**Why:** Visibility into data quality helps prioritize improvement efforts.

---

## UI/UX Best Practices

### 1. **Progressive Disclosure of Provenance**

**Pattern:** Show essential info by default, details on demand.

```typescript
// ✅ GOOD: Progressive disclosure
function EntityCard({ entity }: { entity: BaseEntity }) {
  const metrics = computeProvenanceMetrics(entity.provenance);
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3>{entity.name}</h3>
          
          {/* Minimal quality indicator */}
          <div className="quality-badges">
            {metrics.isTrustworthy && (
              <Tooltip content="Verified, high-confidence data">
                <Badge variant="success">✓</Badge>
              </Tooltip>
            )}
            {metrics.isStale && (
              <Tooltip content="Data >90 days old">
                <Badge variant="warning">🕐</Badge>
              </Tooltip>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p>{entity.description}</p>
        
        {/* Expandable provenance details */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger className="text-sm text-gray-500">
            {showDetails ? 'Hide' : 'Show'} data quality info
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <ProvenanceDetails entity={entity} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function ProvenanceDetails({ entity }: { entity: BaseEntity }) {
  const { provenance } = entity;
  const metrics = computeProvenanceMetrics(provenance);
  
  return (
    <div className="provenance-details text-sm space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Confidence:</strong> {Math.round(provenance.quality.confidence * 100)}%
        </div>
        <div>
          <strong>Source:</strong> {provenance.source.name}
        </div>
        <div>
          <strong>Last Updated:</strong> {formatDate(provenance.freshness.lastUpdatedAt)}
        </div>
        <div>
          <strong>Age:</strong> {metrics.ageInDays} days
        </div>
      </div>
      
      {provenance.quality.verifiedBy && (
        <div>
          <strong>Verified by:</strong> {provenance.quality.verifiedBy} on{' '}
          {formatDate(provenance.quality.verifiedAt!)}
        </div>
      )}
      
      {provenance.flags && provenance.flags.length > 0 && (
        <div className="flags">
          <strong>Flags:</strong>
          <ul>
            {provenance.flags.map((flag, idx) => (
              <li key={idx} className={`flag-${flag.severity}`}>
                {flag.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

**Why:** Avoids UI clutter while providing full transparency when needed.

---

### 2. **Contextual Quality Indicators**

**Pattern:** Show quality info only when relevant.

```typescript
// ✅ GOOD: Context-aware indicators
function NetworkGraphNode({ node }: { node: BaseEntity }) {
  const metrics = computeProvenanceMetrics(node.provenance);
  
  // Only show indicators when hovering or when quality is low
  const [hovered, setHovered] = useState(false);
  const showIndicators = hovered || metrics.qualityTier === 'low' || metrics.isStale;
  
  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`node quality-${metrics.qualityTier}`}
    >
      <circle
        r={node.size}
        fill={getNodeColor(node)}
        opacity={metrics.isTrustworthy ? 1 : 0.7}
      />
      
      {/* Only show quality indicator when relevant */}
      {showIndicators && (
        <g className="quality-indicator">
          {!metrics.isTrustworthy && (
            <circle r={3} fill="red" />
          )}
          {metrics.isStale && (
            <circle r={3} fill="orange" />
          )}
        </g>
      )}
      
      {/* Tooltip on hover */}
      {hovered && (
        <Tooltip>
          <ProvenanceTooltip entity={node} />
        </Tooltip>
      )}
    </g>
  );
}
```

**Why:** Quality info doesn't distract from main content but is available when needed.

---

### 3. **Quality Filter UI**

**Pattern:** Make quality filtering discoverable and easy.

```typescript
// ✅ GOOD: Intuitive quality filter UI
function QualityFilterPanel({
  filters,
  onChange,
}: {
  filters: ProvenanceFilter;
  onChange: (filters: ProvenanceFilter) => void;
}) {
  return (
    <div className="quality-filter-panel">
      <h3>Data Quality</h3>
      
      {/* Quick presets */}
      <div className="presets">
        <button
          onClick={() => onChange({ verifiedOnly: true, minConfidence: 0.8 })}
          className={filters.verifiedOnly && filters.minConfidence === 0.8 ? 'active' : ''}
        >
          High Quality Only
        </button>
        <button
          onClick={() => onChange({ minConfidence: 0.6 })}
          className={filters.minConfidence === 0.6 && !filters.verifiedOnly ? 'active' : ''}
        >
          Medium+
        </button>
        <button
          onClick={() => onChange({})}
          className={!filters.minConfidence && !filters.verifiedOnly ? 'active' : ''}
        >
          Show All
        </button>
      </div>
      
      {/* Granular controls */}
      <div className="granular-controls">
        <label>
          <input
            type="checkbox"
            checked={filters.verifiedOnly || false}
            onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })}
          />
          Only verified data
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
          <Slider
            value={[filters.minConfidence || 0]}
            onValueChange={([value]) => onChange({ ...filters, minConfidence: value })}
            min={0}
            max={1}
            step={0.1}
          />
          {filters.minConfidence ? `${Math.round((filters.minConfidence || 0) * 100)}%` : 'Any'}
        </label>
      </div>
    </div>
  );
}
```

**Why:** Makes quality filtering discoverable without overwhelming users.

---

## What to Avoid

### 1. ❌ **Overloading UI with Provenance**

```typescript
// ❌ BAD: Too much provenance info everywhere
function EntityCard({ entity }: { entity: BaseEntity }) {
  const { provenance } = entity;
  
  return (
    <div>
      <h3>{entity.name}</h3>
      
      {/* Too much info by default */}
      <div>
        <p>Source: {provenance.source.name}</p>
        <p>Confidence: {provenance.quality.confidence}</p>
        <p>Verification: {provenance.quality.verificationStatus}</p>
        <p>Last Updated: {provenance.freshness.lastUpdatedAt}</p>
        <p>Age: {computeAge(provenance.freshness.lastUpdatedAt)}</p>
        <p>Created: {provenance.audit.createdAt}</p>
        <p>Created By: {provenance.audit.createdBy}</p>
        {/* ... more fields ... */}
      </div>
    </div>
  );
}

// ✅ GOOD: Progressive disclosure
// (See example above)
```

**Why:** Clutters UI, distracts from main content.

---

### 2. ❌ **Blocking Users from Low-Quality Data**

```typescript
// ❌ BAD: Hard-blocking low quality data
function getEntities() {
  return filterByProvenance(allEntities, {
    minConfidence: 0.8,
    verifiedOnly: true,
  }); // Users can't see anything else
}

// ✅ GOOD: Default to high quality, allow override
function getEntities(includeAll: boolean = false) {
  if (includeAll) return allEntities;
  
  return filterByProvenance(allEntities, {
    minConfidence: 0.8,
    verifiedOnly: true,
  }); // Users can toggle to see all
}
```

**Why:** Power users and researchers need access to all data, even if low quality.

---

### 3. ❌ **Ignoring Provenance in Visualizations**

```typescript
// ❌ BAD: No visual indication of quality in graph
function NetworkGraph({ entities }: { entities: BaseEntity[] }) {
  return (
    <ForceGraph2D
      nodes={entities}
      nodeColor="blue" // All nodes look the same
    />
  );
}

// ✅ GOOD: Visual encoding of quality
function NetworkGraph({ entities }: { entities: BaseEntity[] }) {
  const nodeColor = (node: BaseEntity) => {
    const metrics = computeProvenanceMetrics(node.provenance);
    if (metrics.isTrustworthy) return '#10B981'; // Green
    if (metrics.qualityTier === 'medium') return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };
  
  const nodeOpacity = (node: BaseEntity) => {
    const metrics = computeProvenanceMetrics(node.provenance);
    return metrics.isStale ? 0.5 : 1.0;
  };
  
  return (
    <ForceGraph2D
      nodes={entities}
      nodeColor={nodeColor}
      nodeOpacity={nodeOpacity}
    />
  );
}
```

**Why:** Users can't assess data quality if it's not visually encoded.

---

### 4. ❌ **Computed Fields Not Updated**

```typescript
// ❌ BAD: Stale computed fields
const entity = {
  provenance: {
    freshness: {
      lastUpdatedAt: '2024-01-01',
      ageInDays: 50, // Computed once, never updated
      isStale: false, // Computed once, never updated
    },
  },
};

// ✅ GOOD: Compute on-demand or update automatically
function computeProvenanceMetrics(provenance: Provenance) {
  const lastUpdated = new Date(provenance.freshness.lastUpdatedAt);
  const now = new Date();
  const ageInDays = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  const isStale = ageInDays > 90;
  
  return { ageInDays, isStale, /* ... */ };
}
```

**Why:** Stale computed fields give incorrect information.

---

## Automation Opportunities

### 1. **Automatic Confidence Adjustment**

```typescript
// ✅ GOOD: Auto-adjust confidence based on time
function autoAdjustConfidence(entity: BaseEntity): BaseEntity {
  const metrics = computeProvenanceMetrics(entity.provenance);
  
  // Reduce confidence if data is stale
  if (metrics.isStale) {
    const stalePenalty = Math.min(0.2, metrics.ageInDays / 365 * 0.1);
    const newConfidence = Math.max(0.1, entity.provenance.quality.confidence - stalePenalty);
    
    return {
      ...entity,
      provenance: {
        ...entity.provenance,
        quality: {
          ...entity.provenance.quality,
          confidence: newConfidence,
        },
      },
    };
  }
  
  return entity;
}

// Run periodically (e.g., daily cron job)
async function dailyConfidenceAdjustment() {
  const entities = await loadAllEntities();
  const adjusted = entities.map(autoAdjustConfidence);
  await saveEntities(adjusted);
}
```

**Why:** Confidence should reflect data freshness automatically.

---

### 2. **Automatic Staleness Flagging**

```typescript
// ✅ GOOD: Auto-flag stale data
async function flagStaleEntities(maxAgeDays: number = 90) {
  const entities = await loadAllEntities();
  const stale = entities.filter(entity => {
    const metrics = computeProvenanceMetrics(entity.provenance);
    return metrics.ageInDays > maxAgeDays && !metrics.isStale;
  });
  
  const flagged = stale.map(entity => ({
    ...entity,
    provenance: addQualityFlag(entity.provenance, {
      type: 'outdated',
      severity: 'warning',
      message: `Data is ${computeProvenanceMetrics(entity.provenance).ageInDays} days old`,
      flaggedBy: 'auto-staleness-checker',
    }),
  }));
  
  await saveEntities(flagged);
}

// Run weekly
scheduleJob('0 0 * * 0', flagStaleEntities); // Every Sunday
```

**Why:** Proactively identifies data that needs refreshing.

---

### 3. **Automatic Source Refresh**

```typescript
// ✅ GOOD: Auto-refresh from source
async function autoRefreshFromSource(entity: BaseEntity) {
  const metrics = computeProvenanceMetrics(entity.provenance);
  
  // Only refresh if stale and source supports it
  if (!metrics.isStale || provenance.source.type !== 'api_import') {
    return entity;
  }
  
  try {
    // Fetch fresh data from source
    const freshData = await fetchFromSource(provenance.source.reference);
    
    // Merge with existing entity
    const refreshed = {
      ...entity,
      ...freshData,
      provenance: refreshProvenance(entity.provenance, 'auto-refresh'),
    };
    
    return refreshed;
  } catch (error) {
    // Flag refresh failure
    return {
      ...entity,
      provenance: addQualityFlag(entity.provenance, {
        type: 'custom',
        severity: 'warning',
        message: 'Auto-refresh failed',
        flaggedBy: 'auto-refresh-job',
      }),
    };
  }
}

// Run daily for API sources
scheduleJob('0 2 * * *', async () => {
  const entities = await loadEntitiesWithSource('api_import');
  const refreshed = await Promise.all(entities.map(autoRefreshFromSource));
  await saveEntities(refreshed);
});
```

**Why:** Keeps data fresh automatically where possible.

---

### 4. **Automatic Verification Suggestion**

```typescript
// ✅ GOOD: Suggest entities that need verification
function suggestVerificationCandidates(entities: BaseEntity[]) {
  return entities
    .filter(entity => {
      const metrics = computeProvenanceMetrics(entity.provenance);
      return (
        entity.provenance.quality.verificationStatus === 'unverified' &&
        entity.provenance.quality.confidence > 0.6 && // Promising candidates
        !metrics.isStale &&
        entity.metadata.funding?.amount && // Important entities
        entity.metadata.funding.amount > 1000000 // High-value
      );
    })
    .sort((a, b) => 
      b.provenance.quality.confidence - a.provenance.quality.confidence
    );
}

// Show in admin dashboard
function VerificationQueue() {
  const candidates = suggestVerificationCandidates(allEntities);
  
  return (
    <div>
      <h3>Verification Queue ({candidates.length})</h3>
      {candidates.slice(0, 10).map(entity => (
        <EntityCard
          key={entity.id}
          entity={entity}
          actions={[
            <VerifyButton entity={entity} />,
            <DismissButton entity={entity} />,
          ]}
        />
      ))}
    </div>
  );
}
```

**Why:** Helps prioritize verification efforts.

---

## Progressive Enhancement

### Phase 1: Basic Provenance (Week 1)

1. ✅ Add provenance to adapters
2. ✅ Store provenance in entities
3. ✅ Basic filtering by confidence
4. ✅ Simple quality badges in UI

### Phase 2: Quality UI (Week 2-3)

5. ✅ Quality filter panel
6. ✅ Quality indicators in visualizations
7. ✅ Provenance details in entity cards
8. ✅ Quality dashboard

### Phase 3: Automation (Week 4+)

9. ✅ Auto-staleness detection
10. ✅ Auto-confidence adjustment
11. ✅ Verification queue
12. ✅ Quality metrics tracking

---

## Summary: Do's and Don'ts

### ✅ DO

- **Default to high quality** but allow override
- **Progressive disclosure** - show essential info, details on demand
- **Visual encoding** of quality in graphs
- **Automate** confidence adjustment, staleness detection
- **Monitor** quality metrics over time
- **Batch operations** for quality management
- **Context-aware** quality requirements

### ❌ DON'T

- **Overload UI** with provenance info
- **Block access** to low-quality data
- **Ignore provenance** in visualizations
- **Use stale computed fields**
- **Require manual quality management** for everything
- **Show all provenance details** by default
- **Forget to update** confidence over time

---

**Start with Phase 1, iterate based on user feedback, and gradually add automation as patterns emerge.**

