# NAVIGATE Strategic Decisions & Next Steps

## 1. Additional Visualizations to Consider

### Venn Diagrams (From Spec)

**Status:** ⚠️ **Consider Alternatives First**

**Why Venn Diagrams Were in Spec:**
- Show set intersections: Government ∩ Research ∩ Industry
- Useful for identifying entities that span multiple categories
- Good for stakeholder overlap analysis

**Challenges:**
- Nivo doesn't have native Venn diagram support
- Would need `venn.js` or custom D3 implementation
- Limited to 3-4 sets before becoming cluttered
- Less interactive than other options

**Better Alternatives (Already Implemented):**
1. ✅ **Circle Packing** - Shows hierarchical relationships better
2. ✅ **Chord Diagram** - Shows connections between categories
3. ✅ **Heatmap** - Matrix view of relationships

**Recommendation:**
- **Skip Venn for now** - Circle Packing and Chord Diagram serve similar purposes
- **Consider later** if specific use case emerges (e.g., "Show stakeholders that are both Government AND Research")

### Other Nivo Visualizations Worth Considering

**High Value:**
1. **Stream Graph** (`@nivo/stream`)
   - Use: Funding trends over time by category
   - Shows: How funding flows change year-over-year
   - Better than: Stacked area chart for temporal patterns

2. **Swarm Plot** (`@nivo/swarmplot`)
   - Use: Technology distribution by TRL
   - Shows: Clustering of technologies at different readiness levels
   - Better than: Bar chart for showing distributions

3. **Parallel Coordinates** (`@nivo/parallel-coordinates`)
   - Use: Multi-dimensional technology comparison
   - Shows: TRL, Funding, Market Readiness, Regulatory Status simultaneously
   - Alternative to: Radar chart (better for 5+ dimensions)

**Medium Value:**
4. **Waffle Chart** (`@nivo/waffle`)
   - Use: Quick overview of entity counts by type
   - Shows: "Out of 100 stakeholders, 30 are Government, 25 are Research..."
   - Good for: Dashboard summary cards

5. **Funnel Chart** (Custom or Recharts)
   - Use: Funding funnel from sources → intermediaries → recipients
   - Shows: Where funding gets filtered/lost
   - Alternative to: Sankey (more linear)

**Low Priority:**
6. **Voronoi Diagram** - Too complex for current use case
7. **Marimekko Chart** - Similar to Treemap, less intuitive

### Recommendation Priority:
1. **Stream Graph** - Add for temporal funding analysis
2. **Parallel Coordinates** - Consider as alternative to Radar
3. **Swarm Plot** - Nice-to-have for TRL distribution
4. **Venn Diagram** - Skip unless specific need emerges

---

## 2. Separate NAVIGATE Visualization Page

### Current State
- Single page handles both Challenge Data and NAVIGATE Data
- Toggle between data sources
- Some visualizations only work with NAVIGATE data

### Proposal: Dedicated NAVIGATE Page

**Benefits:**
1. ✅ **Cleaner UI** - No need for data source toggle
2. ✅ **Bespoke Controls** - Controls specific to NAVIGATE entities
3. ✅ **Better Insights** - Insights tailored to stakeholders/technologies/projects
4. ✅ **More Space** - Can optimize layout for NAVIGATE visualizations
5. ✅ **Better Navigation** - Clear separation of concerns

**Structure:**
```
/navigate
  ├── /visualizations (NEW - NAVIGATE only)
  │   ├── Network Graph
  │   ├── Funding Flow (Sankey)
  │   ├── Technology Radar
  │   ├── TRL Progression (Bump)
  │   ├── Funding Breakdown (Treemap)
  │   ├── Relationship Matrix (Chord)
  │   ├── Maturity Matrix (Heatmap)
  │   └── Circle Packing
  │
  ├── /explore (Future - Entity explorer)
  ├── /admin (Future - Data management)
  └── /insights (Future - AI-powered insights)
```

**Implementation:**
- Create `/navigate/visualizations/page.tsx`
- Remove Challenge Data toggle
- Optimize controls for NAVIGATE entities
- Add NAVIGATE-specific navigation
- Keep original `/visualizations` for Challenge Data

**Recommendation:** ✅ **Yes, create dedicated page**

---

## 3. Making UI More NAVIGATE-Specific

### Current Issues
- Generic controls that work for both Challenge and NAVIGATE data
- Insights panel tries to handle both data types
- Some visualizations feel cramped

### Proposed Enhancements

#### A. Entity-Focused Navigation
Instead of generic "visualizations", organize by entity type:

```
NAVIGATE Platform
├── Stakeholders
│   ├── Network View
│   ├── Funding Analysis
│   └── Relationship Matrix
├── Technologies
│   ├── TRL Progression
│   ├── Maturity Radar
│   └── Category Breakdown
├── Projects
│   ├── Timeline View
│   └── Status Dashboard
└── Funding
    ├── Flow Analysis (Sankey)
    └── Distribution (Treemap)
```

#### B. Bespoke Controls Panel

**Current:** Generic controls for all visualizations
**Proposed:** Entity-specific controls

**Example - Technology Controls:**
```typescript
// Technology-specific filters
- TRL Range Slider (1-9)
- Category Multi-select
- Funding Range
- Regional Availability
- Deployment Ready Toggle
- Maturity Risk Filter
```

**Example - Stakeholder Controls:**
```typescript
// Stakeholder-specific filters
- Type Multi-select (Government, Research, Industry, Intermediary)
- Funding Capacity (High, Medium, Low)
- Region Filter
- Sector Filter
- Relationship Count Range
```

#### C. Enhanced Insights Panel

**Current:** Generic insights
**Proposed:** Context-aware insights

**For Technology Selection:**
- Related stakeholders working on this tech
- Funding timeline
- TRL progression history
- Similar technologies
- Projects using this tech

**For Stakeholder Selection:**
- Technologies they're advancing
- Funding provided/received breakdown
- Collaboration network
- Regional presence
- Knowledge base summary

#### D. Space Optimization

**Current Layout:**
```
[Controls Panel] [Visualization] [Insights Panel]
    250px            Flexible          300px
```

**Proposed Layout:**
```
[Collapsible Controls] [Visualization] [Collapsible Insights]
     200px (min)         Flexible         250px (min)
```

**Features:**
- Panels collapse to icons when not needed
- Fullscreen mode hides panels
- Keyboard shortcuts (C = Controls, I = Insights)
- Remember panel state per visualization

#### E. NAVIGATE-Specific Features

1. **Quick Filters**
   - "Show only TRL 7+ technologies"
   - "Show only High-capacity funders"
   - "Show active projects only"

2. **Comparison Mode**
   - Select 2-3 entities to compare side-by-side
   - Works across visualizations

3. **Entity Cards**
   - Hover/click shows detailed entity card
   - Quick actions: "View in Network", "View Funding", etc.

4. **Knowledge Base Integration**
   - Click entity → Show knowledge base content
   - AI-generated summaries
   - Source links

**Recommendation:** ✅ **Implement gradually**
- Phase 1: Dedicated NAVIGATE page
- Phase 2: Entity-specific controls
- Phase 3: Enhanced insights
- Phase 4: Advanced features

---

## 4. Sample Data Strategy

### Current Data Mapping

**Entity Structure:**
```
Stakeholder
  ├── id: "org-dft-001"
  ├── type: StakeholderType (Government, Research, Industry, Intermediary)
  ├── sector: string (Transport, Energy, Aerospace)
  ├── funding_capacity: High | Medium | Low
  ├── total_funding_received: number (calculated)
  ├── total_funding_provided: number (calculated)
  └── relationships: Relationship[] (via relationships array)

Technology
  ├── id: "tech-h2-storage-001"
  ├── category: TechnologyCategory (H2Production, H2Storage, FuelCells, Aircraft, Infrastructure)
  ├── trl_current: number (1-9)
  ├── total_funding: number (calculated)
  └── relationships: Relationship[] (via relationships array)

Project
  ├── id: "proj-zeroavia-h2-001"
  ├── status: Active | Completed | Planned
  ├── participants: string[] (stakeholder IDs)
  ├── technologies: string[] (technology IDs)
  └── funding: FundingEvent[] (via fundingEvents array)

Relationship
  ├── source: string (entity ID)
  ├── target: string (entity ID)
  ├── type: RelationshipType (funds, researches, collaborates_with, advances, participates_in)
  ├── weight: number (strength/amount)
  └── metadata: { amount, program, description, dates }
```

**Connection Logic:**
- Relationships connect entities via `source` and `target` IDs
- Funding Events link stakeholders to projects/technologies
- Projects link stakeholders and technologies
- All connections are bidirectional where appropriate

### Data Expansion Options

#### Option A: Admin Interface (Recommended for Production)

**Pros:**
- ✅ Full CRUD operations
- ✅ Data validation
- ✅ Relationship builder UI
- ✅ Bulk import/export
- ✅ User management
- ✅ Audit trail

**Cons:**
- ⚠️ Significant development time (2-3 weeks)
- ⚠️ Requires authentication
- ⚠️ Needs database backend

**Features:**
```
/admin
  ├── /entities
  │   ├── Stakeholders (CRUD)
  │   ├── Technologies (CRUD)
  │   ├── Projects (CRUD)
  │   └── Funding Events (CRUD)
  ├── /relationships
  │   └── Relationship Builder (visual)
  ├── /import-export
  │   ├── Excel Import
  │   ├── Excel Export
  │   └── JSON Export
  └── /settings
      └── Data validation rules
```

**Recommendation:** ✅ **Build after MVP validation**

#### Option B: Excel Upload/Download (Quick Win)

**Pros:**
- ✅ Fast to implement (2-3 days)
- ✅ Familiar to users
- ✅ Good for bulk updates
- ✅ No authentication needed initially

**Cons:**
- ⚠️ Limited validation
- ⚠️ Manual relationship mapping
- ⚠️ No real-time updates

**Implementation:**
- Use `xlsx` library (already in stack)
- Template Excel files with validation
- Import wizard with preview
- Export current data to Excel

**Recommendation:** ✅ **Implement first** (quick win)

#### Option C: Mini Horizon Scan (Data Collection)

**Pros:**
- ✅ Real-world data
- ✅ Better for demos
- ✅ Validates data model
- ✅ Identifies gaps

**Cons:**
- ⚠️ Time-consuming
- ⚠️ Requires domain expertise
- ⚠️ May need manual cleanup

**Approach:**
1. **Identify Key Entities:**
   - Top 20 stakeholders (Government, Research, Industry)
   - Top 30 technologies (by TRL and funding)
   - Top 15 projects (active and completed)
   - 50+ relationships (funding, collaboration, research)

2. **Data Sources:**
   - ATI Programme website
   - UKRI funding database
   - Company websites
   - Research publications
   - News articles

3. **Data Points Per Entity:**
   - **Stakeholder:** Name, type, sector, location, funding capacity, website
   - **Technology:** Name, category, TRL, description, funding, stakeholders
   - **Project:** Name, status, participants, technologies, funding, dates
   - **Relationship:** Type, source, target, weight, metadata

4. **Tools:**
   - Perplexity AI for research
   - Manual verification
   - Excel for organization
   - Import script

**Recommendation:** ✅ **Do this now** (before admin interface)

### Recommended Approach: Hybrid

**Phase 1: Horizon Scan (Now)**
- Use Perplexity/manual research
- Expand to 100+ entities
- 100+ relationships
- Export to Excel template
- Import via Excel upload

**Phase 2: Excel Upload/Download (Next Week)**
- Build import/export functionality
- Create Excel templates
- Add validation
- Preview before import

**Phase 3: Admin Interface (After MVP)**
- Full CRUD interface
- Relationship builder
- User management
- Database backend

---

## 5. Entity Mapping Documentation

### How Entities Connect

**1. Stakeholder ↔ Stakeholder**
- Via `Relationship` with type: `collaborates_with`, `funds`
- Example: `org-dft-001` funds `org-ati-001`

**2. Stakeholder ↔ Technology**
- Via `Relationship` with type: `researches`, `advances`, `funds`
- Example: `org-rolls-royce-001` advances `tech-aircraft-regional-h2-001`

**3. Stakeholder ↔ Project**
- Via `Relationship` with type: `participates_in`, `funds`
- Via `Project.participants` array
- Example: `org-zeroavia-001` participates in `proj-zeroavia-h2-flight-001`

**4. Technology ↔ Technology**
- Via `Relationship` with type: `advances` (if one tech enables another)
- Via shared stakeholders/projects

**5. Funding Flow**
- `FundingEvent.source_id` → `FundingEvent.recipient_id`
- Links stakeholders to projects/technologies
- Used in Sankey diagram

**6. Project Connections**
- `Project.participants` → Stakeholder IDs
- `Project.technologies` → Technology IDs
- Creates implicit relationships

### Data Transformation for Visualizations

**Network Graph:**
```typescript
// All entities become nodes
nodes = [
  ...stakeholders.map(s => ({ id: s.id, type: 'stakeholder', ... })),
  ...technologies.map(t => ({ id: t.id, type: 'technology', ... })),
  ...projects.map(p => ({ id: p.id, type: 'project', ... }))
]

// All relationships become links
links = relationships.map(r => ({
  source: r.source,
  target: r.target,
  type: r.type,
  weight: r.weight
}))
```

**Sankey Diagram:**
```typescript
// Funding flow: Source → Intermediary → Recipient → Technology
// Derived from FundingEvents and Relationships
```

**Circle Packing:**
```typescript
// Hierarchical: Root → Type → Entity
// Example: Root → Stakeholder Type → Individual Stakeholders
```

---

## 6. Action Plan

### Immediate (This Week)
1. ✅ Complete Chord Diagram and Heatmap
2. ✅ Test all NAVIGATE visualizations
3. 🔄 Create dedicated `/navigate/visualizations` page
4. 🔄 Implement Excel export (current data)

### Short Term (Next 2 Weeks)
1. Excel import functionality
2. Mini horizon scan (expand to 100+ entities)
3. Entity-specific controls
4. Enhanced insights panel

### Medium Term (Next Month)
1. Admin interface (basic CRUD)
2. Relationship builder
3. Additional visualizations (Stream Graph, Parallel Coordinates)
4. Comparison mode

### Long Term (Future)
1. Full admin interface
2. Database backend
3. User authentication
4. AI-powered insights
5. Real-time updates

---

## 7. Questions for You

1. **Venn Diagrams:** Skip for now, or do you have a specific use case?
2. **Separate Page:** Proceed with `/navigate/visualizations`?
3. **Data Expansion:** Should I do the horizon scan, or will you?
4. **Excel Import:** Priority level? (Quick win vs. Admin interface)
5. **Additional Visualizations:** Which ones interest you most?

Let me know your preferences and I'll prioritize accordingly!

