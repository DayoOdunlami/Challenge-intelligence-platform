# NAVIGATE Platform - Horizon Scan Data Expansion Request

## Purpose & Context

**Platform:** NAVIGATE - Interactive Intelligence Platform for UK's Zero-Emission Aviation Ecosystem

**Goal:** Expand the current sample dataset from ~30 stakeholders, ~20 technologies, ~15 projects, and ~45 relationships to a comprehensive dataset with 100+ stakeholders, 50+ technologies, 30+ projects, and 200+ relationships.

**Use Case:** This data will power interactive visualizations (Network Graphs, Sankey Diagrams, Radar Charts, etc.) and will be accessible by an AI knowledge base system for conversational analysis and insights.

**Data Model:** All entities and relationships follow a structured schema designed for:
- Visualization rendering (Network graphs, Sankey flows, etc.)
- AI knowledge base integration
- Relationship mapping and analysis
- Funding flow tracking
- Technology readiness level (TRL) progression

---

## Current Sample Data

### Data Structure Overview

The NAVIGATE platform uses the following entity types:

1. **Stakeholders** (Organizations)
   - Types: Government, Research, Industry, Intermediary
   - Attributes: Name, type, sector, location, funding capacity, total funding provided/received
   - Knowledge base: Strategic position, key responsibilities, funding strategy

2. **Technologies**
   - Categories: H2Production, H2Storage, FuelCells, Aircraft, Infrastructure
   - Attributes: Name, category, TRL (1-9), total funding, maturity risk
   - Knowledge base: Technical details, deployment readiness

3. **Projects**
   - Status: Active, Completed, Planned
   - Attributes: Name, status, participants (stakeholder IDs), technologies (technology IDs), budget
   - Knowledge base: Objectives, milestones, outcomes

4. **Funding Events**
   - Types: Public, Private, Mixed
   - Attributes: Amount, source_id (stakeholder), recipient_id (stakeholder/project), technologies_supported
   - Knowledge base: Program details, impact description

5. **Relationships**
   - Types: funds, researches, collaborates_with, advances, participates_in, owns, supplies
   - Attributes: source, target, type, weight, strength (strong/medium/weak), metadata
   - Knowledge base: Relationship context, dates, descriptions

### Current Sample Data (Excerpt)

**Stakeholders (Sample):**
```typescript
{
  id: 'org-dft-001',
  name: 'Department for Transport',
  type: 'Government',
  sector: 'Transport',
  funding_capacity: 'High',
  location: { city: 'London', region: 'London', country: 'UK' },
  contact: {
    website: 'https://www.gov.uk/dft',
    email: 'public.enquiries@dft.gov.uk'
  },
  description: 'UK government department responsible for transport strategy and policy',
  tags: ['policy', 'funding', 'infrastructure', 'aviation'],
  data_quality: { confidence: 'verified', last_verified: '2024-01-15' },
  capacity_scenarios: { optimistic: 150000000, conservative: 80000000, current: 125000000 },
  knowledge_base: {
    content: `# Strategic Position
The Department for Transport (DfT) is the UK government's lead department for transport policy...
## Key Responsibilities
- Setting UK aviation decarbonization targets (net zero by 2050)
- Managing funding programs through intermediaries (ATI, Innovate UK)
...`,
    sources: [
      { title: 'Jet Zero Strategy', url: 'https://www.gov.uk/jet-zero', date: '2021-07-19', type: 'report' }
    ],
    last_updated: '2024-01-15',
    contributors: ['admin'],
    tags: ['strategic', 'policy', 'funding'],
    confidence: 'verified'
  }
}
```

**Technologies (Sample):**
```typescript
{
  id: 'tech-h2-storage-compressed-001',
  name: 'Compressed Hydrogen Storage',
  category: 'H2Storage',
  trl_current: 7,
  trl_color: 'green',
  maturity_risk: 'Proven in automotive, adapting for aviation',
  deployment_ready: true,
  total_funding: 15000000,
  description: 'High-pressure compressed hydrogen storage systems for aircraft',
  tags: ['storage', 'compressed', 'TRL-7'],
  data_quality: { confidence: 'verified', last_verified: '2024-01-15' }
}
```

**Projects (Sample):**
```typescript
{
  id: 'proj-zeroavia-h2-flight-001',
  name: 'ZeroAvia 19-Seat Hydrogen Flight Testing',
  status: 'Active',
  start_date: '2023-06-15',
  end_date: '2025-06-14',
  participants: ['org-zeroavia-001', 'org-ati-001', 'org-cranfield-001'],
  lead_organization: 'org-zeroavia-001',
  technologies: ['tech-aircraft-regional-h2-001', 'tech-fuel-cell-pem-001'],
  total_budget: 15000000,
  funding_events: ['fund-002']
}
```

**Funding Events (Sample):**
```typescript
{
  id: 'fund-001',
  amount: 50000000,
  currency: 'GBP',
  funding_type: 'Public',
  source_id: 'org-dft-001',
  recipient_id: 'org-ati-001',
  recipient_type: 'stakeholder',
  program: 'ATI Programme - Round 3',
  program_type: 'grant',
  date: '2023-01-15',
  status: 'Active',
  impact_description: 'Core funding for ATI Programme supporting zero-emission aviation',
  technologies_supported: ['tech-aircraft-regional-h2-001', 'tech-fuel-cell-pem-001'],
  data_quality: { confidence: 'verified', last_verified: '2024-01-15' }
}
```

**Relationships (Sample):**
```typescript
{
  id: 'rel-dft-ati-001',
  source: 'org-dft-001',
  target: 'org-ati-001',
  type: 'funds',
  weight: 50000000,
  strength: 'strong',
  metadata: {
    amount: 50000000,
    program: 'ATI Programme',
    description: 'Annual funding allocation'
  },
  bidirectional: false
}
```

---

## Instructions for Perplexity AI

### Task Overview

Please validate, expand, and enhance the current NAVIGATE dataset with real-world data from the UK's zero-emission aviation ecosystem. Focus on:

1. **Validation:** Verify existing entities are accurate and complete
2. **Expansion:** Add new stakeholders, technologies, projects, and relationships
3. **Enhancement:** Add knowledge base content, sources, and metadata
4. **Relationships:** Map connections between entities (funding, collaboration, research, etc.)
5. **References:** Provide sources for all data points (reports, websites, news articles)

### Data Collection Priorities

#### 1. Stakeholders (Target: 100+ entities)

**Government Organizations:**
- Department for Transport (DfT)
- UK Research and Innovation (UKRI)
- Department for Business, Energy & Industrial Strategy (BEIS)
- Civil Aviation Authority (CAA)
- Department for Energy Security and Net Zero
- Scottish Government (if relevant)
- Local authorities with aviation interests

**Research Institutions:**
- Universities: Cranfield, Bristol, Manchester, Imperial, Cambridge, etc.
- Research centers: ATI, Aerospace Technology Institute
- National labs: NPL, RAL, etc.

**Industry Organizations:**
- Aircraft manufacturers: Airbus, Boeing, Rolls-Royce, etc.
- Startups: ZeroAvia, Universal Hydrogen, H2FLY, etc.
- Infrastructure: ITM Power, Nel Hydrogen, etc.
- Airlines: British Airways, easyJet, etc.
- Airports: Heathrow, Gatwick, etc.

**Intermediaries:**
- ATI (Aerospace Technology Institute)
- Innovate UK
- Connected Places Catapult
- Future Flight Challenge
- Jet Zero Council

**For Each Stakeholder, Collect:**
- Name, type, sector
- Location (city, region, country)
- Website, contact email
- Funding capacity (High/Medium/Low) - estimate from public data
- Key technologies they work on
- Key projects they participate in
- Strategic position (for knowledge base)
- Sources: Official websites, annual reports, news articles

#### 2. Technologies (Target: 50+ entities)

**Categories to Cover:**

**H2Production:**
- Electrolysis (PEM, alkaline, solid oxide)
- Steam methane reforming with CCS
- Biomass gasification
- Solar/wind-powered electrolysis

**H2Storage:**
- Compressed hydrogen (350-700 bar)
- Liquid hydrogen (cryogenic)
- Solid-state storage (metal hydrides)
- Chemical storage (ammonia, LOHC)

**FuelCells:**
- PEM fuel cells
- SOFC (solid oxide fuel cells)
- Hybrid systems

**Aircraft:**
- Regional aircraft (19-100 seats)
- Narrow-body aircraft
- Wide-body aircraft
- Unmanned systems
- Retrofit solutions

**Infrastructure:**
- Hydrogen production facilities
- Storage and distribution
- Refueling infrastructure
- Airport integration

**For Each Technology, Collect:**
- Name, category
- Current TRL (1-9) - from public sources or estimate
- Description
- Key stakeholders working on it
- Funding received (if public)
- Maturity risk assessment
- Deployment readiness
- Sources: Technical papers, company websites, research reports

#### 3. Projects (Target: 30+ entities)

**Project Types:**
- Flight testing programs
- Research initiatives
- Infrastructure development
- Certification programs
- Demonstration projects

**For Each Project, Collect:**
- Name, status (Active/Completed/Planned)
- Start/end dates
- Participants (stakeholder names/IDs)
- Technologies used (technology names/IDs)
- Budget (if public)
- Objectives and milestones
- Outcomes (if completed)
- Sources: Project websites, press releases, reports

#### 4. Funding Events (Target: 50+ entities)

**Funding Sources:**
- ATI Programme rounds
- Future Flight Challenge
- UKRI grants
- Innovate UK programs
- Private investment rounds
- EU funding (if relevant)

**For Each Funding Event, Collect:**
- Amount (in GBP)
- Source (funder stakeholder)
- Recipient (stakeholder or project)
- Funding type (Public/Private/Mixed)
- Program name
- Date
- Status (Active/Completed/Planned)
- Technologies supported
- TRL impact (before/after, if applicable)
- Sources: Funding announcements, press releases, annual reports

#### 5. Relationships (Target: 200+ connections)

**Relationship Types:**
- `funds`: Stakeholder → Stakeholder/Project/Technology
- `researches`: Stakeholder → Technology
- `collaborates_with`: Stakeholder ↔ Stakeholder (bidirectional)
- `advances`: Stakeholder → Technology
- `participates_in`: Stakeholder → Project
- `owns`: Stakeholder → Technology/Project
- `supplies`: Stakeholder → Technology

**For Each Relationship, Collect:**
- Source entity ID
- Target entity ID
- Type
- Weight (amount or strength 0-1)
- Strength (strong/medium/weak)
- Metadata:
  - Amount (if funding)
  - Program (if funding)
  - Description
  - Start/end dates
- Sources: Partnership announcements, contracts, public records

---

## Data Format Requirements

### Entity IDs
- Stakeholders: `org-{name-slug}-{number}` (e.g., `org-dft-001`)
- Technologies: `tech-{name-slug}-{number}` (e.g., `tech-h2-storage-001`)
- Projects: `proj-{name-slug}-{number}` (e.g., `proj-zeroavia-flight-001`)
- Funding Events: `fund-{number}` (e.g., `fund-001`)
- Relationships: `rel-{source-slug}-{target-slug}-{number}` (e.g., `rel-dft-ati-001`)

### Timestamps
- Use ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`
- `created_at`: When entity was first created in system
- `updated_at`: When entity was last updated
- `last_verified`: When data was last verified from source

### Data Quality
- `confidence`: 'verified' (from official source), 'estimated' (reasonable estimate), 'placeholder' (temporary)
- `last_verified`: Date of last verification
- `verified_by`: Who verified (optional)
- `notes`: Any notes about data quality

### Knowledge Base
For each entity, include:
- `content`: Markdown-formatted strategic/technical information
- `sources`: Array of references with title, URL, date, type
- `last_updated`: When knowledge base was last updated
- `contributors`: Array of contributor IDs
- `tags`: Array of relevant tags
- `confidence`: 'verified', 'unverified', 'speculative'

---

## Specific Data Points to Collect

### Priority Stakeholders (Must Include)

1. **Government:**
   - Department for Transport (DfT)
   - UK Research and Innovation (UKRI)
   - Civil Aviation Authority (CAA)
   - Department for Energy Security and Net Zero

2. **Research:**
   - Cranfield University
   - University of Bristol
   - University of Manchester
   - Imperial College London
   - Aerospace Technology Institute (ATI)

3. **Industry:**
   - ZeroAvia
   - Universal Hydrogen
   - Rolls-Royce
   - Airbus
   - British Airways
   - ITM Power
   - Nel Hydrogen

4. **Intermediaries:**
   - ATI
   - Innovate UK
   - Connected Places Catapult

### Priority Technologies (Must Include)

1. **H2Production:**
   - PEM Electrolysis
   - Alkaline Electrolysis
   - Solar-Powered Electrolysis

2. **H2Storage:**
   - Compressed Hydrogen (350-700 bar)
   - Liquid Hydrogen Storage
   - Solid-State Storage

3. **FuelCells:**
   - PEM Fuel Cells for Aviation
   - SOFC Systems

4. **Aircraft:**
   - Regional Hydrogen Aircraft (19-100 seats)
   - Retrofit Solutions
   - Unmanned Systems

5. **Infrastructure:**
   - Airport Hydrogen Infrastructure
   - Production Facilities
   - Distribution Networks

### Priority Projects (Must Include)

1. ZeroAvia flight testing programs
2. ATI Programme projects
3. Future Flight Challenge initiatives
4. Rolls-Royce hydrogen engine development
5. Airport infrastructure projects

### Priority Relationships (Must Include)

1. DfT → ATI (funding)
2. ATI → ZeroAvia (funding)
3. ZeroAvia → Technologies (advances)
4. Universities → Technologies (researches)
5. Industry ↔ Research (collaborates_with)

---

## Output Format

Please provide data in the following format:

### For Each Entity Type

**Stakeholders:**
```typescript
{
  id: string,
  name: string,
  type: 'Government' | 'Research' | 'Industry' | 'Intermediary',
  sector: string,
  funding_capacity: 'High' | 'Medium' | 'Low',
  location: { city?: string, region: string, country: string },
  contact: { website?: string, email?: string, contact_person?: string },
  description: string,
  tags: string[],
  data_quality: { confidence: 'verified' | 'estimated' | 'placeholder', last_verified: string },
  capacity_scenarios?: { optimistic: number, conservative: number, current: number },
  knowledge_base?: {
    content: string, // Markdown
    sources: Array<{ title: string, url: string, date: string, type: 'report' | 'news' | 'interview' | 'internal_doc' }>,
    last_updated: string,
    contributors: string[],
    tags: string[],
    confidence: 'verified' | 'unverified' | 'speculative'
  },
  created_at: string,
  updated_at: string
}
```

**Technologies:**
```typescript
{
  id: string,
  name: string,
  category: 'H2Production' | 'H2Storage' | 'FuelCells' | 'Aircraft' | 'Infrastructure',
  trl_current: number, // 1-9
  trl_color: 'red' | 'amber' | 'green', // Computed: 1-3=red, 4-6=amber, 7-9=green
  trl_projected_2030?: number,
  trl_projected_2050?: number,
  maturity_risk: string,
  deployment_ready: boolean,
  total_funding?: number, // Calculated from funding events
  funding_by_type?: { public: number, private: number, mixed: number },
  stakeholder_count?: number, // Calculated
  project_count?: number, // Calculated
  description: string,
  tags: string[],
  regional_availability?: string[],
  knowledge_base?: { /* same as stakeholder */ },
  data_quality: { /* same as stakeholder */ },
  created_at: string,
  updated_at: string
}
```

**Projects:**
```typescript
{
  id: string,
  name: string,
  status: 'Active' | 'Completed' | 'Planned',
  start_date: string,
  end_date?: string,
  duration_months?: number,
  participants: string[], // Stakeholder IDs
  lead_organization: string, // Stakeholder ID
  technologies: string[], // Technology IDs
  primary_technology?: string, // Technology ID
  total_budget: number,
  funding_events: string[], // Funding Event IDs
  description: string,
  objectives: string[],
  milestones?: Array<{ date: string, description: string }>,
  outcomes?: string[],
  knowledge_base?: { /* same as stakeholder */ },
  data_quality: { /* same as stakeholder */ },
  created_at: string,
  updated_at: string
}
```

**Funding Events:**
```typescript
{
  id: string,
  amount: number, // £
  currency: 'GBP',
  funding_type: 'Public' | 'Private' | 'Mixed',
  source_id: string, // Stakeholder ID
  recipient_id: string, // Stakeholder or Project ID
  recipient_type: 'stakeholder' | 'project',
  program: string,
  program_type?: 'grant' | 'contract' | 'SBRI' | 'innovation_voucher' | 'partnership',
  date: string,
  start_date?: string,
  end_date?: string,
  status: 'Active' | 'Completed' | 'Planned',
  impact_description: string,
  technologies_supported?: string[], // Technology IDs
  trl_impact?: { before: number, after: number },
  data_quality: { /* same as stakeholder */ },
  created_at: string,
  updated_at: string
}
```

**Relationships:**
```typescript
{
  id: string,
  source: string, // Entity ID
  target: string, // Entity ID
  type: 'funds' | 'researches' | 'collaborates_with' | 'advances' | 'participates_in' | 'owns' | 'supplies',
  weight: number, // 0-1 or amount in £
  strength: 'strong' | 'medium' | 'weak',
  metadata: {
    start_date?: string,
    end_date?: string,
    amount?: number,
    description?: string,
    program?: string,
    project_id?: string
  },
  bidirectional: boolean,
  created_at: string,
  updated_at: string
}
```

---

## Quality Assurance

### Validation Checklist

For each entity, verify:
- [ ] ID follows naming convention
- [ ] All required fields are present
- [ ] Data types are correct
- [ ] Dates are in ISO format
- [ ] Amounts are in GBP
- [ ] References/sources are provided
- [ ] Knowledge base content is relevant and accurate
- [ ] Relationships reference valid entity IDs
- [ ] No duplicate IDs

### Data Quality Standards

- **Verified:** Data from official sources (websites, reports, press releases)
- **Estimated:** Reasonable estimates based on public information
- **Placeholder:** Temporary data to be replaced

### Source Requirements

For each data point, provide:
- Source title
- Source URL (if available)
- Source date
- Source type (report, news, interview, internal_doc)

---

## Additional Considerations

### Relationship Mapping

When creating relationships, consider:
1. **Direct connections:** Explicit partnerships, funding, collaborations
2. **Indirect connections:** Through projects, shared technologies
3. **Temporal relationships:** Active vs. historical
4. **Strength:** Based on amount, duration, importance

### Knowledge Base Content

For each entity's knowledge base, include:
- Strategic position or technical overview
- Key responsibilities or capabilities
- Funding strategy or market position
- Key milestones or achievements
- Future plans or projections
- Relevant context for AI understanding

### AI Accessibility

All data should be structured for AI consumption:
- Clear entity types and relationships
- Rich metadata for context
- Knowledge base content in markdown
- Sources for verification
- Tags for categorization

---

## Expected Output

Please provide:

1. **Validated existing data** - Review current sample data and suggest corrections
2. **Expanded dataset** - New entities to reach targets (100+ stakeholders, 50+ technologies, etc.)
3. **Enhanced knowledge bases** - Rich content for each entity
4. **Comprehensive relationships** - 200+ connections mapped
5. **Source references** - URLs, reports, articles for all data points
6. **Suggestions** - Additional entities, relationships, or data points to consider

### Format

Provide data as:
- TypeScript/JavaScript objects (as shown above)
- Or structured JSON
- Or markdown tables (if easier)

Include a summary document with:
- Total entities added
- Data quality breakdown
- Source references list
- Recommendations for further expansion

---

## Questions to Consider

1. Are there key stakeholders missing from the current dataset?
2. What technologies are most critical for UK zero-emission aviation?
3. What are the major funding programs and their recipients?
4. What are the key collaborative relationships in the ecosystem?
5. What projects are most significant for the sector?
6. Are there international connections that should be included?
7. What infrastructure developments are underway?
8. What are the regulatory bodies and their roles?

---

## Success Criteria

The expanded dataset should:
- ✅ Include 100+ stakeholders across all types
- ✅ Include 50+ technologies across all categories
- ✅ Include 30+ projects (active, completed, planned)
- ✅ Include 50+ funding events
- ✅ Include 200+ relationships
- ✅ Have knowledge base content for major entities
- ✅ Include source references for all data
- ✅ Be structured for AI knowledge base integration
- ✅ Support rich visualizations and analysis

---

**Thank you for your assistance in expanding the NAVIGATE dataset!**

## ⚠️ IMPORTANT: Data Format Required

**Please provide COMPLETE STRUCTURED DATA OBJECTS, not just recommendations!**

I need:
- ✅ **Full TypeScript/JSON objects** with ALL required fields
- ✅ **Complete entity definitions** ready to import into codebase
- ✅ **All relationships** with proper IDs and metadata
- ✅ **Knowledge base content** in markdown format
- ✅ **Source references** for all data points

**NOT just:**
- ❌ Lists of entity names
- ❌ Recommendations without data
- ❌ High-level summaries

If you provide recommendations first, please follow up with the **actual structured data objects** in the format shown in the examples above.

See `PERPLEXITY_DATA_EXTRACTION.md` for a follow-up request template if you need to provide structured data in a second response.

