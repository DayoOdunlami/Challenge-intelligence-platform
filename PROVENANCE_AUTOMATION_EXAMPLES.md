# Provenance Automation Examples

**Practical automation scripts and patterns for managing provenance**

---

## 1. Daily Confidence Adjustment

Automatically reduce confidence for stale data.

```typescript
// scripts/automation/adjust-confidence.ts
import { loadAllEntities, saveEntities } from '@/lib/data-service';
import { computeProvenanceMetrics } from '@/lib/base-entity-enhanced';

async function adjustConfidenceForStaleData() {
  console.log('Starting confidence adjustment...');
  
  const entities = await loadAllEntities();
  let adjustedCount = 0;
  
  const adjusted = entities.map(entity => {
    const metrics = computeProvenanceMetrics(entity.provenance);
    
    // Only adjust if stale
    if (!metrics.isStale) return entity;
    
    // Calculate penalty (more stale = bigger penalty)
    const staleDays = metrics.ageInDays;
    const penalty = Math.min(0.3, staleDays / 365 * 0.2); // Max 0.3 penalty
    const newConfidence = Math.max(0.1, entity.provenance.quality.confidence - penalty);
    
    // Only update if changed significantly
    if (Math.abs(newConfidence - entity.provenance.quality.confidence) > 0.05) {
      adjustedCount++;
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
  });
  
  await saveEntities(adjusted);
  console.log(`Adjusted confidence for ${adjustedCount} stale entities`);
}

// Run daily at 2 AM
// cron: 0 2 * * *
```

---

## 2. Auto-Flag Stale Entities

Flag entities that are older than threshold.

```typescript
// scripts/automation/flag-stale.ts
import { loadAllEntities, saveEntities } from '@/lib/data-service';
import { computeProvenanceMetrics, addQualityFlag } from '@/lib/base-entity-enhanced';

async function flagStaleEntities(maxAgeDays: number = 90) {
  console.log(`Flagging entities older than ${maxAgeDays} days...`);
  
  const entities = await loadAllEntities();
  let flaggedCount = 0;
  
  const flagged = entities.map(entity => {
    const metrics = computeProvenanceMetrics(entity.provenance);
    
    // Skip if already stale or already flagged
    if (!metrics.isStale) return entity;
    if (entity.provenance.flags?.some(f => f.type === 'outdated')) {
      return entity;
    }
    
    flaggedCount++;
    return {
      ...entity,
      provenance: addQualityFlag(entity.provenance, {
        type: 'outdated',
        severity: metrics.ageInDays > 180 ? 'error' : 'warning',
        message: `Data is ${metrics.ageInDays} days old and may be outdated`,
        flaggedBy: 'auto-staleness-checker',
      }),
    };
  });
  
  await saveEntities(flagged);
  console.log(`Flagged ${flaggedCount} stale entities`);
}

// Run weekly on Sunday at 3 AM
// cron: 0 3 * * 0
```

---

## 3. Auto-Refresh from Source

Refresh entities from external sources.

```typescript
// scripts/automation/refresh-from-source.ts
import { loadAllEntities, saveEntities } from '@/lib/data-service';
import { computeProvenanceMetrics, refreshProvenance, addQualityFlag } from '@/lib/base-entity-enhanced';

interface SourceRefresher {
  canRefresh(sourceType: string): boolean;
  refresh(entity: BaseEntity): Promise<Partial<BaseEntity>>;
}

class APISourceRefresher implements SourceRefresher {
  canRefresh(sourceType: string): boolean {
    return sourceType === 'api_import';
  }
  
  async refresh(entity: BaseEntity): Promise<Partial<BaseEntity>> {
    const url = entity.provenance.source.reference;
    if (!url) throw new Error('No API URL');
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    return {
      // Map API response to entity fields
      name: data.name || entity.name,
      description: data.description || entity.description,
      metadata: {
        ...entity.metadata,
        ...data.metadata,
      },
    };
  }
}

async function refreshStaleFromSource(maxAgeDays: number = 90) {
  console.log(`Refreshing entities from source (older than ${maxAgeDays} days)...`);
  
  const entities = await loadAllEntities();
  const refresher = new APISourceRefresher();
  
  let refreshedCount = 0;
  let failedCount = 0;
  
  const refreshed = await Promise.all(
    entities.map(async entity => {
      const metrics = computeProvenanceMetrics(entity.provenance);
      
      // Skip if not stale or can't refresh
      if (!metrics.isStale) return entity;
      if (!refresher.canRefresh(entity.provenance.source.type)) return entity;
      
      try {
        const updates = await refresher.refresh(entity);
        refreshedCount++;
        
        return {
          ...entity,
          ...updates,
          provenance: refreshProvenance(entity.provenance, 'auto-refresh-job'),
        };
      } catch (error) {
        console.error(`Failed to refresh ${entity.id}:`, error);
        failedCount++;
        
        // Flag refresh failure
        return {
          ...entity,
          provenance: addQualityFlag(entity.provenance, {
            type: 'custom',
            severity: 'warning',
            message: `Auto-refresh failed: ${error.message}`,
            flaggedBy: 'auto-refresh-job',
          }),
        };
      }
    })
  );
  
  await saveEntities(refreshed);
  console.log(`Refreshed ${refreshedCount} entities, ${failedCount} failed`);
}

// Run daily at 4 AM
// cron: 0 4 * * *
```

---

## 4. Verification Queue Generator

Generate list of entities needing verification.

```typescript
// scripts/automation/verification-queue.ts
import { loadAllEntities } from '@/lib/data-service';
import { computeProvenanceMetrics } from '@/lib/base-entity-enhanced';

interface VerificationCandidate {
  entity: BaseEntity;
  priority: number;
  reasons: string[];
}

function generateVerificationQueue(
  entities: BaseEntity[],
  options: {
    minConfidence?: number;
    maxAge?: number;
    includeHighValue?: boolean;
  } = {}
): VerificationCandidate[] {
  const {
    minConfidence = 0.6,
    maxAge = 90,
    includeHighValue = true,
  } = options;
  
  const candidates: VerificationCandidate[] = [];
  
  for (const entity of entities) {
    const metrics = computeProvenanceMetrics(entity.provenance);
    const { provenance } = entity;
    
    // Skip if already verified or too old
    if (provenance.quality.verificationStatus === 'verified') continue;
    if (metrics.ageInDays > maxAge) continue;
    if (provenance.quality.confidence < minConfidence) continue;
    
    const reasons: string[] = [];
    let priority = 0;
    
    // High confidence but unverified = high priority
    if (provenance.quality.confidence > 0.8) {
      priority += 10;
      reasons.push('High confidence but unverified');
    }
    
    // High-value entities (funding, key stakeholders)
    if (includeHighValue) {
      const funding = entity.metadata.funding?.amount || 0;
      if (funding > 1000000) {
        priority += 5;
        reasons.push('High funding amount');
      }
      
      if (entity.entityType === 'stakeholder' && 
          entity.metadata.custom?.funding_capacity === 'High') {
        priority += 5;
        reasons.push('High-capacity stakeholder');
      }
    }
    
    // Recent data = higher priority
    if (metrics.ageInDays < 30) {
      priority += 3;
      reasons.push('Recent data');
    }
    
    if (priority > 0) {
      candidates.push({ entity, priority, reasons });
    }
  }
  
  // Sort by priority
  return candidates.sort((a, b) => b.priority - a.priority);
}

// Generate and save queue
async function updateVerificationQueue() {
  const entities = await loadAllEntities();
  const queue = generateVerificationQueue(entities);
  
  // Save to database or file for admin dashboard
  await saveVerificationQueue(queue);
  
  console.log(`Generated verification queue with ${queue.length} candidates`);
  return queue;
}

// Run weekly on Monday at 9 AM
// cron: 0 9 * * 1
```

---

## 5. Quality Metrics Report

Generate quality metrics report.

```typescript
// scripts/automation/quality-report.ts
import { loadAllEntities } from '@/lib/data-service';
import { computeProvenanceMetrics } from '@/lib/base-entity-enhanced';

interface QualityMetrics {
  total: number;
  byConfidence: {
    high: number; // >= 0.8
    medium: number; // 0.6-0.8
    low: number; // 0.4-0.6
    veryLow: number; // < 0.4
  };
  byVerification: {
    verified: number;
    unverified: number;
    flagged: number;
  };
  byFreshness: {
    fresh: number; // < 30 days
    recent: number; // 30-90 days
    stale: number; // > 90 days
  };
  bySource: Record<string, number>;
  averageConfidence: number;
  flaggedEntities: number;
  trends: {
    weekOverWeek: number; // Change in avg confidence
  };
}

async function generateQualityReport(): Promise<QualityMetrics> {
  const entities = await loadAllEntities();
  
  const metrics: QualityMetrics = {
    total: entities.length,
    byConfidence: { high: 0, medium: 0, low: 0, veryLow: 0 },
    byVerification: { verified: 0, unverified: 0, flagged: 0 },
    byFreshness: { fresh: 0, recent: 0, stale: 0 },
    bySource: {},
    averageConfidence: 0,
    flaggedEntities: 0,
    trends: { weekOverWeek: 0 },
  };
  
  let totalConfidence = 0;
  
  for (const entity of entities) {
    const computed = computeProvenanceMetrics(entity.provenance);
    const { provenance } = entity;
    
    // Confidence breakdown
    if (provenance.quality.confidence >= 0.8) metrics.byConfidence.high++;
    else if (provenance.quality.confidence >= 0.6) metrics.byConfidence.medium++;
    else if (provenance.quality.confidence >= 0.4) metrics.byConfidence.low++;
    else metrics.byConfidence.veryLow++;
    
    // Verification breakdown
    if (provenance.quality.verificationStatus === 'verified') {
      metrics.byVerification.verified++;
    } else if (provenance.quality.verificationStatus === 'flagged') {
      metrics.byVerification.flagged++;
    } else {
      metrics.byVerification.unverified++;
    }
    
    // Freshness breakdown
    if (computed.ageInDays < 30) metrics.byFreshness.fresh++;
    else if (computed.ageInDays < 90) metrics.byFreshness.recent++;
    else metrics.byFreshness.stale++;
    
    // Source breakdown
    const sourceType = provenance.source.type;
    metrics.bySource[sourceType] = (metrics.bySource[sourceType] || 0) + 1;
    
    // Flags
    if (provenance.flags && provenance.flags.length > 0) {
      metrics.flaggedEntities++;
    }
    
    totalConfidence += provenance.quality.confidence;
  }
  
  metrics.averageConfidence = totalConfidence / entities.length;
  
  // Calculate trends (compare with previous week)
  const previousWeekMetrics = await loadPreviousWeekMetrics();
  if (previousWeekMetrics) {
    metrics.trends.weekOverWeek = 
      metrics.averageConfidence - previousWeekMetrics.averageConfidence;
  }
  
  // Save report
  await saveQualityReport(metrics);
  
  // Send email alert if quality degraded
  if (metrics.averageConfidence < 0.7 || metrics.trends.weekOverWeek < -0.05) {
    await sendQualityAlert(metrics);
  }
  
  return metrics;
}

// Run weekly on Friday at 5 PM
// cron: 0 17 * * 5
```

---

## 6. Missing Field Detection

Flag entities with missing required fields.

```typescript
// scripts/automation/flag-missing-fields.ts
import { loadAllEntities, saveEntities } from '@/lib/data-service';
import { addQualityFlag } from '@/lib/base-entity-enhanced';

interface FieldRequirement {
  path: string;
  required: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

const FIELD_REQUIREMENTS: Record<string, FieldRequirement[]> = {
  stakeholder: [
    { path: 'name', required: true, severity: 'error', message: 'Missing name' },
    { path: 'description', required: true, severity: 'warning', message: 'Missing description' },
    { path: 'metadata.sector', required: true, severity: 'warning', message: 'Missing sector' },
    { path: 'metadata.location.country', required: false, severity: 'info', message: 'Missing country' },
  ],
  technology: [
    { path: 'name', required: true, severity: 'error', message: 'Missing name' },
    { path: 'metadata.trl', required: true, severity: 'error', message: 'Missing TRL' },
    { path: 'description', required: true, severity: 'warning', message: 'Missing description' },
  ],
  project: [
    { path: 'name', required: true, severity: 'error', message: 'Missing name' },
    { path: 'metadata.dates.start', required: false, severity: 'info', message: 'Missing start date' },
  ],
};

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

async function flagMissingFields() {
  console.log('Checking for missing required fields...');
  
  const entities = await loadAllEntities();
  let flaggedCount = 0;
  
  const flagged = entities.map(entity => {
    const requirements = FIELD_REQUIREMENTS[entity.entityType] || [];
    const missingFields: FieldRequirement[] = [];
    
    for (const req of requirements) {
      const value = getNestedValue(entity, req.path);
      if (!value && req.required) {
        missingFields.push(req);
      }
    }
    
    // Skip if no missing fields or already flagged
    if (missingFields.length === 0) return entity;
    if (entity.provenance.flags?.some(f => f.type === 'missing_field')) {
      return entity;
    }
    
    flaggedCount++;
    
    let updatedEntity = entity;
    for (const field of missingFields) {
      updatedEntity = {
        ...updatedEntity,
        provenance: addQualityFlag(updatedEntity.provenance, {
          type: 'missing_field',
          severity: field.severity,
          message: field.message,
          field: field.path,
          flaggedBy: 'auto-field-checker',
        }),
      };
    }
    
    return updatedEntity;
  });
  
  await saveEntities(flagged);
  console.log(`Flagged ${flaggedCount} entities with missing fields`);
}

// Run daily at 1 AM
// cron: 0 1 * * *
```

---

## 7. Setup Cron Jobs

Example setup for running automation scripts.

```typescript
// scripts/automation/setup-cron.ts
import cron from 'node-cron';

// Daily confidence adjustment (2 AM)
cron.schedule('0 2 * * *', async () => {
  console.log('Running daily confidence adjustment...');
  await adjustConfidenceForStaleData();
});

// Daily refresh from source (4 AM)
cron.schedule('0 4 * * *', async () => {
  console.log('Running daily refresh from source...');
  await refreshStaleFromSource();
});

// Weekly staleness flagging (Sunday 3 AM)
cron.schedule('0 3 * * 0', async () => {
  console.log('Running weekly staleness flagging...');
  await flagStaleEntities();
});

// Weekly verification queue (Monday 9 AM)
cron.schedule('0 9 * * 1', async () => {
  console.log('Generating verification queue...');
  await updateVerificationQueue();
});

// Weekly quality report (Friday 5 PM)
cron.schedule('0 17 * * 5', async () => {
  console.log('Generating quality report...');
  await generateQualityReport();
});

// Daily missing field check (1 AM)
cron.schedule('0 1 * * *', async () => {
  console.log('Checking for missing fields...');
  await flagMissingFields();
});

console.log('Automation cron jobs started');
```

---

## Summary

### Automation Schedule

| Script | Frequency | Time | Purpose |
|--------|-----------|------|---------|
| Missing Field Check | Daily | 1 AM | Flag incomplete entities |
| Confidence Adjustment | Daily | 2 AM | Reduce confidence for stale data |
| Staleness Flagging | Weekly | Sunday 3 AM | Flag old data |
| Source Refresh | Daily | 4 AM | Refresh from APIs |
| Verification Queue | Weekly | Monday 9 AM | Generate verification candidates |
| Quality Report | Weekly | Friday 5 PM | Generate metrics report |

### Start Simple

1. **Week 1:** Implement missing field detection
2. **Week 2:** Add staleness flagging
3. **Week 3:** Add confidence adjustment
4. **Week 4:** Add source refresh (if you have API sources)
5. **Week 5+:** Add verification queue and quality reports

**Automate gradually, test each script, and monitor results before adding more automation.**

