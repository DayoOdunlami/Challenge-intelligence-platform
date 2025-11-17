# NAVIGATE Entity Mapping Guide

## How Entities Connect

### Entity Types

```
┌─────────────────┐
│  Stakeholder    │  (Organizations: Government, Research, Industry, Intermediary)
│  - id: org-*    │
│  - type         │
│  - sector       │
└─────────────────┘
         │
         ├─── funds ────┐
         ├─── researches│
         ├─── collaborates_with
         └─── participates_in
         
┌─────────────────┐
│   Technology    │  (Tech solutions: H2Production, H2Storage, FuelCells, etc.)
│  - id: tech-*   │
│  - category     │
│  - trl_current  │
└─────────────────┘
         │
         ├─── advanced_by ───┐
         ├─── researched_by   │
         └─── funded_for      │
         
┌─────────────────┐
│    Project      │  (Active initiatives)
│  - id: proj-*   │
│  - status       │
│  - participants │
│  - technologies │
└─────────────────┘
         │
         ├─── has participants (stakeholders)
         └─── uses technologies
         
┌─────────────────┐
│ Funding Event   │  (Money flows)
│  - id: fund-*   │
│  - source_id    │
│  - recipient_id │
└─────────────────┘
```

### Connection Patterns

#### 1. Direct Relationships (via `Relationship` array)

```typescript
{
  id: 'rel-dft-ati-001',
  source: 'org-dft-001',        // Stakeholder ID
  target: 'org-ati-001',         // Stakeholder ID
  type: 'funds',                 // Relationship type
  weight: 50000000,              // Amount or strength
  strength: 'strong',
  metadata: {
    amount: 50000000,
    program: 'ATI Programme',
    description: 'Annual funding allocation'
  }
}
```

**Relationship Types:**
- `funds` - Stakeholder → Stakeholder/Project/Technology
- `researches` - Stakeholder → Technology
- `collaborates_with` - Stakeholder ↔ Stakeholder (bidirectional)
- `advances` - Stakeholder → Technology
- `participates_in` - Stakeholder → Project
- `owns` - Stakeholder → Technology/Project
- `supplies` - Stakeholder → Technology

#### 2. Funding Flow (via `FundingEvent` array)

```typescript
{
  id: 'fund-001',
  source_id: 'org-dft-001',           // Funder (Stakeholder)
  recipient_id: 'org-ati-001',        // Recipient (Stakeholder or Project)
  recipient_type: 'stakeholder',
  amount: 50000000,
  funding_type: 'Public',
  program: 'ATI Programme - Round 3',
  technologies_supported: ['tech-h2-storage-001']  // Optional: linked technologies
}
```

**Flow Pattern:**
```
Government (DfT)
    ↓ funds
Intermediary (ATI)
    ↓ funds
Industry (ZeroAvia)
    ↓ advances
Technology (H2 Aircraft)
```

#### 3. Project Connections (via `Project` array)

```typescript
{
  id: 'proj-zeroavia-h2-flight-001',
  participants: ['org-zeroavia-001', 'org-ati-001', 'org-cranfield-001'],  // Stakeholder IDs
  technologies: ['tech-aircraft-regional-h2-001', 'tech-fuel-cell-pem-001'],  // Technology IDs
  funding_events: ['fund-002']  // Funding Event IDs
}
```

**Creates Implicit Relationships:**
- All participants are connected to each other (via project)
- All participants are connected to all technologies (via project)
- Project is connected to funding events

### Data Transformation Examples

#### For Network Graph:

```typescript
// Step 1: Create nodes from all entities
const nodes = [
  ...stakeholders.map(s => ({
    id: s.id,
    label: s.name,
    type: 'stakeholder',
    entity_type: s.type,
    value: (s.total_funding_provided || 0) + (s.total_funding_received || 0),
    color: getStakeholderColor(s.type)
  })),
  ...technologies.map(t => ({
    id: t.id,
    label: t.name,
    type: 'technology',
    entity_type: t.category,
    value: t.total_funding || 0,
    color: getTechColor(t.category)
  })),
  ...projects.map(p => ({
    id: p.id,
    label: p.name,
    type: 'project',
    value: p.total_budget || 0,
    color: getProjectColor(p.status)
  }))
];

// Step 2: Create links from relationships
const links = relationships.map(r => ({
  id: r.id,
  source: r.source,
  target: r.target,
  type: r.type,
  weight: r.weight,
  value: r.weight
}));
```

#### For Sankey Diagram:

```typescript
// Step 1: Group by entity type and funding flow
const nodes = [
  { id: 'Government', type: 'source' },
  { id: 'Research', type: 'source' },
  { id: 'Industry', type: 'source' },
  { id: 'ATI', type: 'intermediary' },
  { id: 'Innovate UK', type: 'intermediary' },
  { id: 'H2Production', type: 'tech_category' },
  { id: 'H2Storage', type: 'tech_category' },
  // ... etc
];

// Step 2: Create links from funding events
const links = fundingEvents.map(f => {
  const source = stakeholders.find(s => s.id === f.source_id);
  const recipient = f.recipient_type === 'stakeholder' 
    ? stakeholders.find(s => s.id === f.recipient_id)
    : projects.find(p => p.id === f.recipient_id);
  
  return {
    source: source?.type || 'Unknown',
    target: getIntermediaryOrCategory(recipient, f),
    value: f.amount
  };
});
```

#### For Circle Packing:

```typescript
// Hierarchical structure
const hierarchy = {
  name: 'NAVIGATE Ecosystem',
  children: [
    {
      name: 'Stakeholders',
      children: [
        {
          name: 'Government',
          children: stakeholders
            .filter(s => s.type === 'Government')
            .map(s => ({
              name: s.name,
              value: (s.total_funding_provided || 0) + (s.total_funding_received || 0)
            }))
        },
        // ... other types
      ]
    },
    // ... technologies, projects
  ]
};
```

### Current Data Counts

**From `navigate-dummy-data.ts`:**
- **Stakeholders:** ~30 entities
- **Technologies:** ~20 entities
- **Projects:** ~15 entities
- **Funding Events:** ~10 entities
- **Relationships:** ~45 connections

**For Better Visualizations, We Need:**
- **Stakeholders:** 100+ (more variety, better clusters)
- **Technologies:** 50+ (better TRL distribution)
- **Projects:** 30+ (more active projects)
- **Funding Events:** 50+ (richer funding flows)
- **Relationships:** 200+ (more interconnected network)

### Data Expansion Strategy

#### Option 1: Manual Horizon Scan (Recommended First)

**Sources:**
1. **ATI Programme Website**
   - List all funded projects
   - Extract stakeholders, technologies, funding amounts
   - Map relationships

2. **UKRI Gateway**
   - Search "hydrogen aviation", "zero emission aircraft"
   - Extract research projects
   - Map stakeholders and technologies

3. **Company Websites**
   - ZeroAvia, Rolls-Royce, Airbus, etc.
   - Extract technologies, projects, partnerships
   - Map relationships

4. **Research Publications**
   - Academic papers on hydrogen aviation
   - Extract research institutions
   - Map technology advancements

**Data Points to Collect:**

**Per Stakeholder:**
- Name, type, sector
- Location (region)
- Website, contact
- Funding capacity (estimate from public data)
- Key technologies they work on
- Key projects they participate in

**Per Technology:**
- Name, category
- Current TRL (from public sources or estimate)
- Description
- Key stakeholders working on it
- Funding received (from public sources)

**Per Project:**
- Name, status
- Start/end dates
- Participants (stakeholder names)
- Technologies used
- Funding amount (if public)

**Per Relationship:**
- Source entity
- Target entity
- Type (funds, collaborates_with, etc.)
- Weight/amount
- Metadata (dates, program, description)

#### Option 2: Excel Template

**Create Excel file with sheets:**
1. **Stakeholders** - Columns: id, name, type, sector, location, funding_capacity, website, description
2. **Technologies** - Columns: id, name, category, trl_current, description, total_funding
3. **Projects** - Columns: id, name, status, start_date, end_date, participants (comma-separated), technologies (comma-separated)
4. **Funding Events** - Columns: id, source_id, recipient_id, recipient_type, amount, funding_type, program, date
5. **Relationships** - Columns: id, source, target, type, weight, strength, metadata (JSON)

**Import Process:**
1. User fills Excel template
2. Upload via admin interface
3. Validate data
4. Transform to JSON
5. Update visualizations

#### Option 3: Admin Interface (Future)

**Features:**
- Add/edit/delete entities
- Visual relationship builder
- Bulk import from Excel
- Data validation
- Export to JSON/Excel
- User permissions

---

## Next Steps

1. **Decide on data expansion approach:**
   - [ ] Manual horizon scan (I can help with Perplexity)
   - [ ] Excel template first
   - [ ] Admin interface first

2. **If horizon scan:**
   - [ ] I'll create a research plan
   - [ ] Use Perplexity to gather data
   - [ ] You verify and clean
   - [ ] Import to system

3. **If Excel template:**
   - [ ] I'll create template with validation
   - [ ] You fill with data
   - [ ] I'll build import functionality
   - [ ] Test import

4. **If admin interface:**
   - [ ] I'll design UI mockup
   - [ ] Build basic CRUD
   - [ ] Add relationship builder
   - [ ] Test with sample data

**What would you prefer?**

