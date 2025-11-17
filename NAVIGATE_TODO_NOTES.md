# NAVIGATE Platform - TODO & Notes

## 📝 Design & UX Improvements Needed

### Tooltips & Insights Panel
**Status:** Needs design thought
**Priority:** Medium

**Current State:**
- Basic tooltips exist on some visualizations
- Insights panel shows basic stats but could be more contextual

**Considerations:**
- How should tooltips explain relationship types in NetworkGraph?
- What insights should appear when hovering/selecting entities?
- Should insights be contextual based on selected visualization?
- How to make insights actionable (not just informational)?
- Should insights integrate with AI chat for deeper exploration?

**Questions to Answer:**
1. What information is most valuable at a glance vs. on-demand?
2. Should insights be static or dynamic based on user interaction?
3. How to balance information density with clarity?
4. Should insights panel be collapsible/expandable sections?
5. How to make insights panel work harmoniously with visualizations?

**Potential Approaches:**
- Contextual insights that change based on selected entity/visualization
- Progressive disclosure - basic info always visible, details on hover/click
- AI-powered insights that explain patterns and anomalies
- Actionable insights with "Learn more" or "Explore related" links
- Visual indicators in insights panel (icons, charts, mini-visualizations)

---

## ✅ Completed Features

### Phase 1: NetworkGraph & Sankey
- ✅ NetworkGraph with color-coded links by relationship type
- ✅ Arrow heads showing direction
- ✅ Legend explaining link colors
- ✅ SankeyChart showing funding flows
- ✅ Toggle between Challenge/NAVIGATE data

### Phase 2: Radar Chart
- ✅ RadarChartNavigate component
- ✅ Compare up to 8 technologies
- ✅ 5 dimensions: TRL, Funding, Market Readiness, Regulatory, 2030 Maturity
- ✅ Interactive technology selection
- ✅ Color-coded by technology
- ✅ Tooltips with exact values
- ✅ Dimension explanations

---

## 🚧 Next Steps

1. **Build more NAVIGATE visualizations:**
   - ✅ Circle Packing (hierarchical stakeholder relationships)
   - ✅ Bump Chart (TRL progression over time)
   - ✅ Bar Chart (funding by sector/category)
   - Treemap (hierarchical funding breakdown)
   - Chord Diagram (NAVIGATE version - sector relationships)
   - Heatmap (NAVIGATE version - technology maturity matrix)
2. **Enhance Insights Panel** - After design decisions
3. **Add Tooltips** - After design decisions
4. **AI Integration** - Phase 2

## 📝 Improvement Notes

### Circle Packing Labels
**Status:** Needs improvement
**Priority:** Medium
**Issues:**
- Labels not rendering ideally
- Need better positioning algorithm
- Callout lines could be more refined
**Future Work:**
- Investigate Nivo's label rendering API more thoroughly
- Consider using custom SVG overlay for better control
- Improve label collision detection
- Better angle calculation for callout positioning

### Circle Packing Scroll Features
**Status:** Needs investigation
**Priority:** Low
**Future Work:**
- Investigate zoom/pan capabilities
- Scroll to zoom functionality
- Pan with mouse drag
- Better navigation controls

### Radar Chart Improvements
**Status:** Needs design thought
**Priority:** Low

**Considerations:**
- How to make visual clearer (better color contrast, labels)
- Interactive features (zoom, filter by dimension, export)
- Better dimension explanations
- Comparison mode (side-by-side)

