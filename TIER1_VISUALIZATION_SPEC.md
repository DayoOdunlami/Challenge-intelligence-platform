# Tier 1 Visualization Specifications
## December PoC Priority Visualizations

**Document Purpose:** Comprehensive specification for the 5 highest-impact visualizations to be built for the December PoC demo. All specifications, data requirements, and implementation details in one place.

---

## Priority 1: Funding vs TRL Bubble Scatter Chart ⭐
**Library:** ECharts  
**Impact:** Very High - Hero visualization  
**Timeline:** 0.5-1 day

### Purpose
Answers the core strategic question: **"Which technologies are overfunded for their maturity? Which are ready but starving?"**

### Key Insights Revealed
- **High funding + Low TRL** = High-risk bets (early-stage moonshots)
- **Low funding + High TRL** = Ready but starving (private sector should step in)
- **Sweet spot** = Where public funding should hand off to private investment
- **TRL 6** = "Proven elsewhere" threshold
- **TRL 8** = "Ready for commercial" threshold

### Data Requirements
**Source:** `Technology[]` from `navigate-dummy-data.ts`

**Per Technology:**
- `trl_current` (1-9) → X-axis
- `total_funding` (calculated, in £) → Y-axis (log scale)
- `project_count` or `stakeholder_count` → Bubble size
- `category` → Bubble color
- `name` → Tooltip/click target
- `id` → Entity selection

### Chart Encoding
```
X-axis: TRL (1-9) - Linear scale
Y-axis: Funding amount (£M) - Logarithmic scale (base 10)
Bubble size: Number of projects (normalized 10-100px radius)
Bubble color: Technology category (H2Production, H2Storage, FuelCells, Aircraft, Infrastructure)
```

### Interactive Features

#### 1. Hover Tooltip
```typescript
{
  name: "Liquid Hydrogen Storage",
  category: "H2Storage",
  trl: 6,
  funding: "£45.2M",
  projects: 8,
  stakeholders: 12,
  maturity_risk: "Proven elsewhere / Airport barriers / Scalability issues",
  deployment_ready: true
}
```

#### 2. Click Interaction
- Click bubble → Filter all other NAVIGATE visualizations to this technology
- Trigger `onEntitySelect({ type: 'technology', id: tech.id, data: tech })`
- Highlight related entities in network graph

#### 3. Brush Selection
- Drag to select region → Compare selected technologies
- Show summary stats for selected region
- Export selection to insights panel

#### 4. Reference Lines & Annotations
- **Vertical line at TRL 6:** "Proven elsewhere" threshold
  - Style: Dashed, teal (#0EA5E9), 2px
  - Label: "TRL 6: Proven Elsewhere"
- **Vertical line at TRL 8:** "Ready for commercial" threshold
  - Style: Dashed, green (#50C878), 2px
  - Label: "TRL 8: Commercial Ready"
- **Annotation box:** "Sweet spot for private takeover" (TRL 7-9, moderate funding)
  - Position: Top-right quadrant
  - Background: Semi-transparent (#CCE2DC with 0.2 opacity)

### Visual Design
- **Color Scheme:** CPC brand colors by category
  - H2Production: `#006E51` (CPC Primary Teal)
  - H2Storage: `#50C878` (CPC Success Green)
  - FuelCells: `#F5A623` (CPC Warning Amber)
  - Aircraft: `#4A90E2` (CPC Info Blue)
  - Infrastructure: `#8b5cf6` (Purple)
- **Bubble opacity:** 0.7 (default), 1.0 (hover), 0.3 (others on hover)
- **Grid:** Light gray (#E5E7EB), major ticks only
- **Axes:** Bold labels, units clearly marked

### Implementation Notes
- Use ECharts `scatter` chart type with `symbolSize` function
- Implement custom tooltip formatter
- Add `dataZoom` for pan/zoom (optional but recommended)
- Wire to global filter state for cross-visualization filtering

### Component Interface
```typescript
interface BubbleScatterNavigateProps {
  technologies: Technology[];
  onTechnologySelect?: (tech: Technology) => void;
  highlightedTechIds?: string[];
  className?: string;
}
```

---

## Priority 2: Stacked Area / Stream Scenarios
**Library:** Nivo Stream (enhance existing)  
**Impact:** High - Scenario modeling  
**Timeline:** 0.5-1 day

### Purpose
Shows funding ramp-up trajectory with scenario toggles (Baseline vs Accelerated). Answers: **"Are we on track? What happens if we double private investment?"**

### Current State
- ✅ `StreamGraphNavigate.tsx` exists
- ✅ Supports views: `by_stakeholder_type`, `by_tech_category`, `by_funding_type`
- ❌ Missing: Scenario toggle (Baseline vs Accelerated)
- ❌ Missing: 2030/2050 target annotations

### Enhancements Required

#### 1. Scenario Toggle Control
```typescript
type Scenario = 'baseline' | 'accelerated';

interface ScenarioState {
  government_funding_multiplier: number; // 0-200% (default 100)
  private_funding_multiplier: number; // 0-200% (default 100)
  trl_advancement: number; // -2 to +2 (default 0)
}
```

**UI Control:**
- Radio buttons or toggle: "Baseline" | "Accelerated"
- Sliders for fine-tuning multipliers (optional, for advanced users)

#### 2. Data Transformation
Apply scenario multipliers to funding events:
```typescript
function applyScenario(
  events: FundingEvent[],
  scenario: ScenarioState
): FundingEvent[] {
  return events.map(event => ({
    ...event,
    amount: event.amount * (
      event.funding_type === 'Public' 
        ? scenario.government_funding_multiplier / 100
        : event.funding_type === 'Private'
        ? scenario.private_funding_multiplier / 100
        : 1 // Mixed uses average
    )
  }));
}
```

#### 3. Target Annotations
- **2030 Target Line:** Vertical line at 2030
  - Label: "2030 Net-Zero Milestone"
  - Style: Red dashed line (#EF4444)
- **2050 Target Line:** Vertical line at 2050
  - Label: "2050 Net-Zero Target"
  - Style: Red dashed line (#EF4444)
- **Gap Indicator:** Show difference between current trajectory and target

#### 4. Enhanced Tooltip
Show scenario-adjusted values:
```typescript
{
  year: 2028,
  baseline: "£120M",
  accelerated: "£180M",
  gap_to_target: "+£45M needed"
}
```

### Component Updates
- Add `scenario` prop to `StreamGraphNavigate`
- Add `onScenarioChange` callback
- Add target line overlays (use ECharts markLine or custom SVG)

---

## Priority 3: Simplified Gantt Timeline
**Library:** ECharts (enhance existing vis-timeline)  
**Impact:** High for storytelling  
**Timeline:** 0.5-1 day

### Purpose
Multi-track Gantt showing: **"What needs to happen by when across technology, infrastructure, policy, and skills?"**

### Current State
- ✅ `TimelineNavigate.tsx` exists using `vis-timeline`
- ✅ Supports 4 tracks: Technology, Infrastructure, Policy, Skills
- ✅ Data in `roadmap-data.ts` (`hiaRoadmap`)
- ❌ Could be enhanced with ECharts for better styling/animations

### Enhancement Options

#### Option A: Keep vis-timeline, Enhance Styling
- Add milestone markers for key dates (2025, 2030, 2050)
- Improve color coding by track
- Add click-to-filter functionality

#### Option B: Migrate to ECharts Gantt
- Use ECharts `custom` chart type
- Better control over styling
- Smoother animations
- More consistent with other ECharts visualizations

### Recommended: Option A (Faster)
Keep `vis-timeline`, add:
1. **Milestone Markers:**
   - 2025: "First Commercial H2 Flight"
   - 2030: "10% SAF Target"
   - 2035: "Net-Zero Milestone"
   - 2050: "Full Net-Zero Target"
2. **Track Colors:**
   - Technology: `#006E51` (Teal)
   - Infrastructure: `#50C878` (Green)
   - Policy: `#F5A623` (Amber)
   - Skills: `#4A90E2` (Blue)
3. **Click Handler:**
   - Click milestone → Filter visualizations to related entities
   - Show related stakeholders/technologies in insights panel

### Component Updates
- Add `milestoneMarkers` prop
- Enhance `onItemClick` to support entity filtering
- Add visual distinction for critical milestones

---

## Priority 4: Enhanced Sankey (Multi-Level)
**Library:** Nivo Sankey (enhance existing)  
**Impact:** Medium-High  
**Timeline:** 0.5 day

### Purpose
Add depth to existing Sankey: **Government → Programs → Beneficiaries → Outcomes**

### Current State
- ✅ `SankeyChartNavigate.tsx` exists
- ✅ Flow: Stakeholder Type → Technology Category → Funding Type
- ❌ Missing: Program level detail
- ❌ Missing: Beneficiary names (shows types, not specific orgs)

### Enhancements Required

#### 1. Add Program Level
Current: `Stakeholder Type → Technology Category → Funding Type`  
Enhanced: `Stakeholder Type → Program → Technology Category → Funding Type`

**Data Source:** `FundingEvent.program` field

#### 2. Improve Tooltips
Show full path and amounts:
```typescript
{
  path: "Government → ATI Programme → H2Storage → Public",
  amount: "£45.2M",
  events: 8,
  dateRange: "2022-2024"
}
```

#### 3. Add Beneficiary Names (Optional)
For top 5 beneficiaries by funding, show actual names instead of types:
- "ZeroAvia" instead of "Industry"
- "Cranfield University" instead of "Research"

### Implementation
- Update `toSankeyFromNavigate` adapter in `navigate-adapters.ts`
- Add program aggregation logic
- Enhance tooltip formatter

---

## Priority 5: Simple KPI Cards
**Library:** Tremor / Magic UI / Custom  
**Impact:** Quick win for dashboard feel  
**Timeline:** 0.25 day

### Purpose
Quick stats dashboard showing key metrics at a glance.

### KPIs to Display

#### 1. Total Funding Committed
- Value: Sum of all `FundingEvent.amount`
- Format: "£X.XB" or "£XXXM"
- Trend: YoY change (if data available)
- Color: `#006E51` (Teal)

#### 2. Technologies at TRL ≥7
- Value: Count of `Technology` where `trl_current >= 7`
- Format: "X technologies"
- Percentage: "% of total"
- Color: `#50C878` (Green)

#### 3. Active Projects
- Value: Count of `Project` where `status === 'Active'`
- Format: "X projects"
- Color: `#4A90E2` (Blue)

#### 4. Projects Launching by 2030
- Value: Count of `Project` where `start_date <= '2030-12-31'`
- Format: "X by 2030"
- Color: `#F5A623` (Amber)

### Component Design
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  color?: string;
  icon?: React.ReactNode;
}
```

### Placement
- Top bar of `/navigate` page (above visualizations)
- Or in insights panel sidebar
- Responsive: 4 columns on desktop, 2x2 on tablet, stacked on mobile

---

## Implementation Order

| Day | Task | Component | Status |
|-----|------|-----------|--------|
| 0.5 | Bubble Scatter | `BubbleScatterNavigate.tsx` | 🔴 Not Started |
| 0.5 | Stream Scenarios | `StreamGraphNavigate.tsx` | 🟡 Enhance Existing |
| 0.5 | Gantt Enhancements | `TimelineNavigate.tsx` | 🟡 Enhance Existing |
| 0.5 | Sankey Multi-Level | `SankeyChartNavigate.tsx` | 🟡 Enhance Existing |
| 0.25 | KPI Cards | `KPICards.tsx` | 🔴 Not Started |

**Total: ~2.25 days**

---

## Integration Points

### 1. Cross-Visualization Filtering
All new visualizations must:
- Accept `highlightedEntityIds?: string[]` prop
- Accept `filteredTechnologies?: Technology[]` prop
- Call `onEntitySelect` when clicked
- Respond to global TRL filter

### 2. Controls Panel
Add controls to `visualization-control-registry.tsx`:
- Bubble Scatter: Toggle reference lines, bubble size metric (projects vs stakeholders)
- Stream: Scenario toggle, target line visibility
- Gantt: Track visibility, milestone markers
- Sankey: Depth level (3 vs 4 levels), show beneficiary names

### 3. AI Integration
Update `ai-functions.ts`:
- `switch_visualization`: Add `'bubble-scatter'` to enum
- `set_control`: Add bubble scatter controls
- `filter_data`: Support scenario state

---

## Data Validation

### Required Data Checks
Before rendering, verify:
- ✅ `technologies.length > 0`
- ✅ All technologies have `trl_current` (1-9)
- ✅ All technologies have `total_funding` (calculated)
- ✅ Funding events have valid `date` and `amount`
- ✅ Roadmap items have valid `start` dates

### Fallback States
- Empty state: "No data available for selected filters"
- Loading state: Skeleton loader
- Error state: "Unable to load visualization data"

---

## Testing Checklist

- [ ] Bubble scatter renders with all technologies
- [ ] Click bubble filters other visualizations
- [ ] Reference lines appear at TRL 6 and 8
- [ ] Stream graph toggles between baseline/accelerated
- [ ] Target lines appear at 2030/2050
- [ ] Gantt shows all 4 tracks
- [ ] Milestone markers are clickable
- [ ] Sankey shows program level
- [ ] KPI cards update with filters
- [ ] All visualizations respond to TRL filter
- [ ] AI can switch to bubble scatter
- [ ] AI can set scenario controls

---

## Next Steps After PoC

### Deferred to Phase 2
- Geospatial Choropleth Map
- Bullet/Gauge KPI Indicators
- Enhanced Chord Diagram (alternative to network)
- Waterfall Chart (if data available)

### Polish Opportunities
- Add animations/transitions
- Export to PNG/PDF
- Shareable URLs with filter state
- Comparison mode (side-by-side scenarios)

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Owner:** NAVIGATE Platform Team

