# CPC Platform: Unified Data Schema v1.0

> **Purpose**: Canonical data schema for the CPC platform, unifying Atlas (challenge intelligence), Navigate (ecosystem mapping), and CPC Internal (capabilities & strategy) into a single graph-based model.
>
> **For AI/Assistants**: Treat these interfaces as the source of truth when generating types, adapters, data loaders, or visualization code. All data must conform to `BaseEntity` + `UniversalRelationship`.

---

## Table of Contents

1. [Design Principles](#1-design-principles)  
2. [Core Interfaces](#2-core-interfaces)  
3. [Entity Types Reference](#3-entity-types-reference)  
4. [Relationship Types Reference](#4-relationship-types-reference)  
5. [Domain Definitions](#5-domain-definitions)  
6. [Controlled Vocabularies](#6-controlled-vocabularies)  
7. [File-Based Storage Structure](#7-file-based-storage-structure)  
8. [Visualization Contract](#8-visualization-contract)  
9. [Adapter Patterns](#9-adapter-patterns)  
10. [Migration Path to Supabase](#10-migration-path-to-supabase)  
11. [Appendices](#appendix-a-id-conventions)

---

## 1. Design Principles

### 1.1 Schema Goals

- **Unified** – All sources normalize to `BaseEntity` + `UniversalRelationship`.  
- **Domain-agnostic visuals** – Visualizations consume the universal contract, not domain-specific types.  
- **Extensible** – New domains (Rail, Maritime, etc.) require only adapters.  
- **MVP-ready** – Works with JSON files now, migrates cleanly to Supabase later.  
- **AI-friendly** – Entities carry enough context (`knowledgeBase`, tags, provenance) for LLM reasoning.

### 1.2 Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Themes & Modes | Enum for MVP | Keep simple; promote to entities when richer metadata is needed. |
| Capabilities | Model as entities | Enables CPC internal strategy queries. |
| Relationships | Stored explicitly | Atlas similarity edges are persisted, not recomputed on render. |
| Hierarchies | `parent` field | Flat storage with parent references; build trees at query time. |

---

## 2. Core Interfaces

### 2.1 `BaseEntity`

```ts
interface BaseEntity {
  // Identity
  id: string;                 // {domain}-{type}-{uuid}
  name: string;
  entityType: EntityType;
  domain: Domain;

  // Descriptive
  description?: string;
  knowledgeBase?: KnowledgeBase;

  // Classification
  sector?: Sector;
  modes?: TransportMode[];
  strategicThemes?: StrategicTheme[];
  tags?: string[];
  parent?: string;

  // Maturity & Stage
  trl?: number | TRLRange;
  stage?: InitiativeStage;
  deploymentReady?: boolean;

  // Funding & Budget
  funding?: FundingInfo;

  // CPC Internal
  cpcOwnership?: CPCOwnership;
  capabilityType?: 'supply' | 'demand' | 'both';

  // Geography
  geography?: GeographyInfo;

  // Provenance & Quality
  dataQuality?: DataQuality;
  createdAt?: string;
  updatedAt?: string;

  // Extensibility
  metadata?: Record<string, unknown>;
}
```

### 2.2 `UniversalRelationship`

```ts
interface UniversalRelationship {
  // Identity
  id: string;                  // rel-{uuid}
  sourceId: string;
  targetId: string;
  type: RelationshipType;

  // Attributes
  weight?: number;
  label?: string;
  directed?: boolean;

  // Context
  amount?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;

  // Provenance
  provenance?: 'computed' | 'manual' | 'scraped' | 'strategic-doc' | 'crm';
  confidence?: 'verified' | 'inferred' | 'draft';
  domains?: Domain[];

  metadata?: Record<string, unknown>;
}
```

### 2.3 Supporting Types

```ts
interface KnowledgeBase {
  content: string;
  sources?: string[];
  lastUpdated?: string;
  summary?: string;
}

interface FundingInfo {
  amountMin?: number;
  amountMax?: number;
  amount?: number;
  currency?: string;
  type?: 'core' | 'competition' | 'contract' | 'grant' | 'mixed';
  isCoreFunded?: boolean;
}

interface CPCOwnership {
  businessUnit?: string;
  leadTeam?: string;
  isCoreCapability?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface GeographyInfo {
  scope?: 'local' | 'regional' | 'national' | 'UK-wide' | 'international';
  regions?: string[];
  city?: string;
  country?: string;
}

interface DataQuality {
  confidence: 'verified' | 'likely' | 'uncertain' | 'draft';
  lastVerified?: string;
  source?: string;
  notes?: string;
}

interface TRLRange {
  min: number;
  max: number;
}
```

---

## 3. Entity Types Reference

```ts
type EntityType =
  // Atlas
  | 'challenge'

  // Navigate
  | 'stakeholder'
  | 'technology'
  | 'project'
  | 'funding-event'

  // CPC Internal
  | 'capability'
  | 'initiative'
  | 'output'

  // Reference
  | 'authority'
  | 'priority'
  | 'programme'

  // Extensible
  | string;
```

| Type | Domain | Description | Example |
|------|--------|-------------|---------|
| `challenge` | atlas | External problem/procurement | Digital Railway Signalling |
| `stakeholder` | navigate | Organisation | Department for Transport |
| `technology` | navigate | Technology solution | Hydrogen Fuel Cells |
| `project` | navigate | Initiative/programme | Future Flight Challenge |
| `funding-event` | navigate | Investment transaction | DfT £50M Grant |
| `capability` | cpc-internal | CPC capability (supply/demand) | De-risking |
| `initiative` | cpc-internal | CPC-led initiative | Connected Airport Living Lab |
| `output` | cpc-internal | Deliverable | Rail Innovation Zone Report |
| `authority` | reference | Regional/national authority | Greater Manchester CA |
| `priority` | reference | National/industrial priority | Clean Energy Industries |
| `programme` | reference | External programme | Drive 35 |

---

## 4. Relationship Types Reference

```ts
type RelationshipType =
  // Challenges
  | 'addresses'
  | 'similar_to'

  // Stakeholders/Ecosystem
  | 'collaborates_with'
  | 'funds'
  | 'owns'
  | 'member_of'

  // Strategic Alignment
  | 'delivers'
  | 'aligns_with'
  | 'operates_in'
  | 'contributes_to'

  // Capabilities
  | 'requires_capability'
  | 'provides_capability'
  | 'enables'

  // Hierarchical
  | 'parent_of'
  | 'part_of'

  // Temporal
  | 'preceded_by'
  | 'leads_to'

  // Extensible
  | string;
```

| Relationship | Source Types | Target Types | Directed | Example |
|--------------|--------------|--------------|----------|---------|
| `addresses` | project, technology, initiative | challenge | Yes | CPC initiative addresses an Atlas challenge |
| `similar_to` | challenge | challenge | No | Challenge A ↔ Challenge B |
| `collaborates_with` | stakeholder | stakeholder | No | Rolls-Royce ↔ University of Cambridge |
| `funds` | stakeholder, authority | project, stakeholder, initiative | Yes | DfT funds Future Flight |
| `requires_capability` | initiative, project | capability | Yes | Living Lab requires Stakeholder Engagement |
| `aligns_with` | initiative, challenge | priority | Yes | Initiative aligns with Clean Energy |

---

## 5. Domain Definitions

```ts
type Domain =
  | 'atlas'
  | 'navigate'
  | 'cpc-internal'
  | 'reference'
  | 'cross-domain';
```

| Domain | Purpose | Data Source | Update Frequency |
|--------|---------|-------------|------------------|
| `atlas` | External challenges, procurements | Scrapers, portal APIs | Weekly |
| `navigate` | Ecosystem actors & funding flows | Research, CRM, press | Monthly |
| `cpc-internal` | CPC capabilities, initiatives | Internal docs, CRM | Quarterly |
| `reference` | Authorities, priorities, programmes | Government publications | Rare |

---

## 6. Controlled Vocabularies

### 6.1 `Sector`

```ts
type Sector =
  | 'transport'
  | 'aviation'
  | 'rail'
  | 'maritime'
  | 'highways'
  | 'built-environment'
  | 'energy'
  | 'digital'
  | 'defence'
  | 'cross-sector';
```

### 6.2 `TransportMode`

```ts
type TransportMode =
  | 'rail'
  | 'aviation'
  | 'maritime'
  | 'highways'
  | 'integrated-transport'
  | 'active-travel'
  | 'cross-modal';
```

### 6.3 `StrategicTheme`

```ts
type StrategicTheme =
  | 'autonomy'
  | 'people-experience'
  | 'hubs-and-clusters'
  | 'decarbonisation'
  | 'planning-and-operation'
  | 'industry'
  | 'data-and-digital';
```

### 6.4 `CPCImpactPriority`

```ts
type CPCImpactPriority =
  | 'data-digital-decision-making'
  | 'transport-emissions'
  | 'public-transport-safety';
```

### 6.5 `IndustrialStrategyPriority`

```ts
type IndustrialStrategyPriority =
  | 'cross-cutting-place-growth'
  | 'cross-cutting-transport-infrastructure'
  | 'advanced-manufacturing'
  | 'clean-energy-industries'
  | 'creative-industries'
  | 'defence'
  | 'digital-and-technologies'
  | 'financial-services'
  | 'life-sciences'
  | 'professional-business-services'
  | 'foundational-industries';
```

### 6.6 `InitiativeStage`

```ts
type InitiativeStage =
  | 'validation'
  | 'development'
  | 'commercialisation'
  | 'operational';
```

### 6.7 Capabilities

Supply-side capability codes (e.g., `stakeholder-engagement`, `de-risking`, `consortium-building`) and demand-side capability codes (`future-visioning`, `challenge-definition`, `testbeds-living-labs`, etc.) follow the taxonomy from CPC capability slides.

---

## 7. File-Based Storage Structure

```
src/data/
├── entities/
│   ├── atlas/challenges.json
│   ├── navigate/{stakeholders,technologies,projects,funding-events}.json
│   ├── cpc-internal/{capabilities,initiatives}.json
│   └── reference/{authorities,priorities}.json
├── relationships/
│   ├── atlas-similarities.json
│   ├── navigate-relationships.json
│   ├── cpc-alignments.json
│   └── cross-domain.json
├── unified/
│   ├── all-entities.json
│   └── all-relationships.json
└── knowledge-base/
    ├── navigate/*.md
    └── cpc-internal/*.md
```

### Build-Time Unification

```ts
// scripts/unify-data.ts
import { challengesToBaseEntities } from './adapters/atlas';
import { navigateToBaseEntities } from './adapters/navigate';
import { cpcToBaseEntities } from './adapters/cpc-internal';

async function unifyData() {
  const challenges = await loadJson('entities/atlas/challenges.json');
  const stakeholders = await loadJson('entities/navigate/stakeholders.json');
  const capabilities = await loadJson('entities/cpc-internal/capabilities.json');
  // ...

  const allEntities = [
    ...challengesToBaseEntities(challenges),
    ...navigateToBaseEntities({ stakeholders, technologies, projects }),
    ...cpcToBaseEntities({ capabilities, initiatives }),
  ];

  const allRelationships = [
    ...loadJson('relationships/atlas-similarities.json'),
    ...loadJson('relationships/navigate-relationships.json'),
    ...loadJson('relationships/cpc-alignments.json'),
  ];

  await writeJson('unified/all-entities.json', allEntities);
  await writeJson('unified/all-relationships.json', allRelationships);
}
```

---

## 8. Visualization Contract

All visual builders consume:

```ts
interface VisualizationData {
  entities: BaseEntity[];
  relationships: UniversalRelationship[];
}

interface VisualizationFilters {
  domains?: Domain[];
  entityTypes?: EntityType[];
  modes?: TransportMode[];
  themes?: StrategicTheme[];
  sectors?: Sector[];
  stages?: InitiativeStage[];
  trlRange?: { min: number; max: number };
  relationshipTypes?: RelationshipType[];
  search?: string;
  dateRange?: { start: string; end: string };
}
```

### Builder Configs

- **Network Graph**
  ```ts
  interface NetworkGraphConfig {
    data: VisualizationData;
    filters?: VisualizationFilters;
    nodeColorBy?: 'domain' | 'entityType' | 'mode' | 'theme' | 'stage';
    nodeSizeBy?: 'connections' | 'funding' | 'trl' | 'fixed';
    edgeColorBy?: 'type' | 'weight' | 'domain';
    layout?: '2d-force' | '3d-force' | 'hierarchical' | 'radial';
  }
  ```

- **Sankey**
  ```ts
  interface SankeyConfig {
    data: VisualizationData;
    filters?: VisualizationFilters;
    flowPath: ('domain' | 'entityType' | 'mode' | 'theme' | 'sector' | 'stage')[];
    valueBy?: 'count' | 'funding';
  }
  ```

- **Heatmap / Circle Packing / Sunburst / Tree** – similar config patterns using the same data contract.

### Example

```ts
const sankeyConfig: SankeyConfig = {
  data: {
    entities: allEntities.filter(e => e.domain === 'cpc-internal'),
    relationships: allRelationships.filter(r =>
      ['delivers', 'aligns_with', 'operates_in'].includes(r.type)
    ),
  },
  flowPath: ['cpcImpactPriority', 'strategicTheme', 'mode', 'industrialPriority'],
  valueBy: 'count',
};
```

---

## 9. Adapter Patterns

### 9.1 Atlas

```ts
export function challengesToBaseEntities(challenges: Challenge[]): BaseEntity[] {
  return challenges.map(c => ({
    id: `atlas-challenge-${c.id}`,
    name: c.title,
    description: c.description,
    entityType: 'challenge',
    domain: 'atlas',
    sector: c.sector?.primary,
    modes: c.sector?.secondary?.filter(isTransportMode) || [],
    tags: c.keywords,
    trl: c.maturity?.trl_min && c.maturity?.trl_max
      ? { min: c.maturity.trl_min, max: c.maturity.trl_max }
      : undefined,
    deploymentReady: c.maturity?.deployment_ready,
    funding: c.funding && {
      amountMin: c.funding.amount_min,
      amountMax: c.funding.amount_max,
      type: c.funding.mechanism as FundingType,
    },
    geography: c.geography && {
      scope: c.geography.scope as GeographyInfo['scope'],
      regions: c.geography.specific_locations,
    },
    dataQuality: {
      confidence: 'likely',
      source: c.metadata?.source_portal,
      lastVerified: c.metadata?.scraped_date?.toISOString(),
    },
    createdAt: c.metadata?.scraped_date?.toISOString(),
    updatedAt: c.metadata?.scraped_date?.toISOString(),
    metadata: {
      buyer: c.buyer,
      timeline: c.timeline,
      originalId: c.id,
    },
  }));
}
```

### 9.2 Navigate

```ts
export function navigateToBaseEntities(data: NavigateDataset): BaseEntity[] {
  const stakeholders = data.stakeholders.map(s => ({
    id: `navigate-stakeholder-${s.id}`,
    name: s.name,
    description: s.description,
    entityType: 'stakeholder',
    domain: 'navigate',
    sector: s.sector,
    tags: s.tags,
    funding: s.funding_capacity ? { type: 'mixed' } : undefined,
    geography: s.location && {
      city: s.location.city,
      regions: s.location.region ? [s.location.region] : undefined,
      country: s.location.country,
    },
    dataQuality: s.data_quality,
    knowledgeBase: s.knowledge_base,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    metadata: { stakeholderType: s.type },
  }));

  // Technologies & projects similar...
  return [...stakeholders, ...technologies, ...projects];
}
```

```ts
export function navigateRelationshipsToUniversal(relationships: Relationship[]): UniversalRelationship[] {
  return relationships.map(r => ({
    id: `rel-navigate-${r.id}`,
    sourceId: `navigate-${r.source_type}-${r.source_id}`,
    targetId: `navigate-${r.target_type}-${r.target_id}`,
    type: mapNavigateRelationType(r.type),
    weight: r.strength,
    label: r.label,
    amount: r.metadata?.amount,
    currency: r.metadata?.currency,
    startDate: r.metadata?.start_date,
    endDate: r.metadata?.end_date,
    provenance: 'manual',
    confidence: r.verified ? 'verified' : 'inferred',
    domains: ['navigate'],
    metadata: r.metadata,
  }));
}
```

### 9.3 CPC Internal

```ts
export function cpcToBaseEntities(data: { capabilities: CPCCapability[]; initiatives: CPCInitiative[]; }): BaseEntity[] {
  const capabilities = data.capabilities.map(c => ({
    id: `cpc-capability-${c.id}`,
    name: c.name,
    description: c.description,
    entityType: 'capability',
    domain: 'cpc-internal',
    capabilityType: c.type,
    parent: c.parent ? `cpc-capability-${c.parent}` : undefined,
    tags: [c.category, ...(c.enabledOutcomes || [])],
    cpcOwnership: { isCoreCapability: true },
  }));

  const initiatives = data.initiatives.map(i => ({
    id: `cpc-initiative-${i.id}`,
    name: i.name,
    description: i.description,
    entityType: 'initiative',
    domain: 'cpc-internal',
    modes: [i.mode],
    strategicThemes: i.themes,
    stage: i.stage,
    cpcOwnership: { businessUnit: i.businessUnit },
    metadata: {
      requiredCapabilities: i.requiredCapabilities,
      alignedPriorities: i.alignedPriorities,
    },
  }));

  return [...capabilities, ...initiatives];
}
```

```ts
export function cpcAlignmentsToRelationships(initiatives: CPCInitiative[]): UniversalRelationship[] {
  const relationships: UniversalRelationship[] = [];

  initiatives.forEach(i => {
    i.requiredCapabilities.forEach(capId => {
      relationships.push({
        id: `rel-cpc-cap-${i.id}-${capId}`,
        sourceId: `cpc-initiative-${i.id}`,
        targetId: `cpc-capability-${capId}`,
        type: 'requires_capability',
        provenance: 'strategic-doc',
        confidence: 'verified',
        domains: ['cpc-internal'],
      });
    });

    i.alignedPriorities.forEach(pId => {
      relationships.push({
        id: `rel-cpc-align-${i.id}-${pId}`,
        sourceId: `cpc-initiative-${i.id}`,
        targetId: `reference-priority-${pId}`,
        type: 'aligns_with',
        provenance: 'strategic-doc',
        confidence: 'verified',
        domains: ['cpc-internal', 'reference'],
      });
    });
  });

  return relationships;
}
```

---

## 10. Migration Path to Supabase

### 10.1 Database Schema

```sql
CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  domain TEXT NOT NULL,
  sector TEXT,
  modes TEXT[],
  strategic_themes TEXT[],
  tags TEXT[],
  parent TEXT REFERENCES entities(id),
  trl_min INTEGER,
  trl_max INTEGER,
  stage TEXT,
  deployment_ready BOOLEAN,
  funding JSONB,
  cpc_ownership JSONB,
  capability_type TEXT,
  geography JSONB,
  data_quality JSONB,
  knowledge_base JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE relationships (
  id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES entities(id),
  target_id TEXT REFERENCES entities(id),
  type TEXT NOT NULL,
  weight FLOAT,
  label TEXT,
  directed BOOLEAN DEFAULT TRUE,
  amount NUMERIC,
  currency TEXT,
  start_date DATE,
  end_date DATE,
  provenance TEXT,
  confidence TEXT,
  domains TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Add indexes for domain/type, array columns, and full-text search on names/descriptions.

### 10.2 Migration Script

File-based → Supabase loader (see `scripts/migrate-to-supabase.ts` example) handles batching and JSONB fields.

### 10.3 Data Service Abstraction

Expose a `DataService` interface with file-based and Supabase implementations so the UI/visualizations can switch sources without refactors.

---

## Appendix A: ID Conventions

| Domain | Entity Type | ID Format | Example |
|--------|-------------|-----------|---------|
| atlas | challenge | `atlas-challenge-{slug}` | `atlas-challenge-rail-001` |
| navigate | stakeholder | `navigate-stakeholder-{slug}` | `navigate-stakeholder-dft-001` |
| navigate | technology | `navigate-technology-{slug}` | `navigate-technology-h2-fuel-cell` |
| navigate | project | `navigate-project-{slug}` | `navigate-project-zehst` |
| cpc-internal | capability | `cpc-capability-{slug}` | `cpc-capability-de-risking` |
| cpc-internal | initiative | `cpc-initiative-{slug}` | `cpc-initiative-rail-innovation-zone` |
| reference | authority | `reference-authority-{slug}` | `reference-authority-greater-manchester` |
| reference | priority | `reference-priority-{slug}` | `reference-priority-clean-energy` |
| relationships | any | `rel-{domain}-{type}-{index}` | `rel-atlas-sim-042` |

---

## Appendix B: Domain Interactions

| Domain A | Domain B | Relationship | Example |
|----------|----------|--------------|---------|
| atlas | atlas | `similar_to` | Challenge ↔ Challenge |
| navigate | atlas | `addresses` | Project → Challenge |
| navigate | navigate | `collaborates_with`, `funds` | Stakeholder collaborations |
| cpc-internal | cpc-internal | `requires_capability` | Initiative → Capability |
| cpc-internal | reference | `aligns_with` | Initiative → Industrial Strategy Priority |
| navigate | cpc-internal | `provides_capability` | CPC capability supports Navigate project |

---

## Appendix C: New Domain Checklist

1. Define domain-specific types (`types/{domain}.ts`).  
2. Implement adapter (`adapters/{domain}.ts`).  
3. Extend `Domain`, `EntityType`, `RelationshipType` if needed.  
4. Add raw JSON files under `data/entities/{domain}` and `data/relationships`.  
5. Update `scripts/unify-data.ts`.  
6. Add controlled vocabulary entries if required.  
7. Run visual smoke tests with the new domain filter.

---

*Last updated: 2024-01-XX*  
*Version: 1.0*

