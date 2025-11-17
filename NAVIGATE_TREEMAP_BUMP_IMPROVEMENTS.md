# Treemap & Bump Chart Improvement Options

## 🗺️ Treemap Improvements

### 1. **Drill-Down Navigation** ⭐⭐⭐ HIGH PRIORITY
**Current:** Static view, can only switch between top-level views
**Enhancement:** Click-to-zoom into specific rectangles
**Benefits:**
- Explore deeper hierarchy levels
- Focus on specific funding categories
- Breadcrumb navigation (like Circle Packing)

**Implementation:**
```typescript
const [zoomedNode, setZoomedNode] = useState<any>(null);
const [zoomPath, setZoomPath] = useState<string[]>([]);

// On rectangle click
onClick={(node) => {
  if (node.children && node.children.length > 0) {
    setZoomedNode(node);
    setZoomPath([...zoomPath, node.data.name]);
  }
}}
```

**Effort:** 2-3 hours

---

### 2. **Enhanced Tooltips** ⭐⭐ MEDIUM PRIORITY
**Current:** Basic value display
**Enhancement:** Rich contextual information
**Features:**
- Percentage of total funding
- Number of sub-items
- Funding trend (if historical data available)
- Related entities count
- Quick actions (e.g., "View in Network Graph")

**Example:**
```
Department for Transport
─────────────────────────
Funding: £68M (23% of total)
Sub-organizations: 5
Projects: 12
[View Details] [Explore Network]
```

**Effort:** 1-2 hours

---

### 3. **Value Range Filtering** ⭐⭐ MEDIUM PRIORITY
**Current:** All data shown
**Enhancement:** Slider to filter by funding amount
**Features:**
- Min/Max funding slider
- "Show only > £1M" toggle
- Percentage-based filtering (top 10%, 25%, 50%)

**Effort:** 2 hours

---

### 4. **Sorting Options** ⭐ MEDIUM PRIORITY
**Current:** Default Nivo sorting
**Enhancement:** User-selectable sorting
**Options:**
- By value (largest first)
- By name (alphabetical)
- By number of children
- By growth rate (if historical data)

**Effort:** 1 hour

---

### 5. **Cross-Visualization Highlighting** ⭐⭐⭐ HIGH PRIORITY
**Current:** Isolated visualization
**Enhancement:** Highlight related entities in other visualizations
**Features:**
- Click treemap rectangle → highlight in Network Graph
- Click treemap rectangle → filter Sankey flows
- Click treemap rectangle → show in Radar Chart

**Effort:** 3-4 hours (requires state management)

---

### 6. **Comparison Mode** ⭐⭐ MEDIUM PRIORITY
**Current:** Single view at a time
**Enhancement:** Side-by-side comparison
**Features:**
- Split view: "By Stakeholder Type" vs "By Tech Category"
- Synchronized highlighting
- Difference visualization

**Effort:** 3-4 hours

---

### 7. **Animated Transitions** ⭐ LOW PRIORITY
**Current:** Basic animation
**Enhancement:** Smooth transitions between views
**Features:**
- Morphing rectangles when switching views
- Animated value changes
- Transition indicators

**Effort:** 2-3 hours

---

### 8. **Export & Share** ⭐ MEDIUM PRIORITY
**Current:** No export
**Enhancement:** Export functionality
**Features:**
- Export as PNG/SVG
- Export data as CSV
- Shareable link with current view state

**Effort:** 1-2 hours

---

### 9. **Search & Filter** ⭐⭐ MEDIUM PRIORITY
**Current:** No search
**Enhancement:** Search for specific entities
**Features:**
- Search box to find organizations/technologies
- Auto-highlight matching rectangles
- Filter by name pattern

**Effort:** 2 hours

---

### 10. **Parent Label Improvements** ⭐ LOW PRIORITY
**Current:** Basic parent labels
**Enhancement:** Better positioning and styling
**Features:**
- Larger, more readable parent labels
- Background boxes for contrast
- Collapsible parent sections

**Effort:** 1-2 hours

---

## 📈 TRL (Bump Chart) Improvements

### 1. **Interactive Line Highlighting** ⭐⭐⭐ HIGH PRIORITY
**Current:** Basic hover tooltip
**Enhancement:** Rich hover interactions
**Features:**
- Hover line → highlight entire path
- Hover line → dim other lines
- Hover line → show detailed stats panel
- Click line → pin/select for comparison

**Implementation:**
```typescript
const [hoveredTech, setHoveredTech] = useState<string | null>(null);
const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

// Enhanced tooltip with stats
tooltip={({ serie }) => (
  <div className="bg-white p-3 rounded shadow-lg border">
    <div className="font-semibold">{serie.id}</div>
    <div className="text-sm mt-2">
      <div>Start: TRL {serie.data[0].y} ({serie.data[0].x})</div>
      <div>Current: TRL {serie.data[serie.data.length - 1].y} ({serie.data[serie.data.length - 1].x})</div>
      <div>Progress: +{serie.data[serie.data.length - 1].y - serie.data[0].y} levels</div>
      <div>Avg advancement: {calculateAvgAdvancement(serie.data)} levels/year</div>
    </div>
  </div>
)}
```

**Effort:** 2-3 hours

---

### 2. **Multi-Technology Selection** ⭐⭐⭐ HIGH PRIORITY
**Current:** View all or filter by category
**Enhancement:** Select specific technologies to compare
**Features:**
- Checkbox list of all technologies
- "Select All" / "Clear All"
- Selected technologies highlighted, others dimmed
- Side-by-side comparison panel

**Effort:** 3-4 hours

---

### 3. **Time Range Selection** ⭐⭐ MEDIUM PRIORITY
**Current:** Fixed 2019-2024
**Enhancement:** Adjustable time range
**Features:**
- Date range slider
- "Last 3 years" / "Last 5 years" presets
- Custom start/end year selection

**Effort:** 2 hours

---

### 4. **TRL Milestone Markers** ⭐⭐ MEDIUM PRIORITY
**Current:** No milestone indicators
**Enhancement:** Visual markers for key TRL transitions
**Features:**
- Highlight TRL 4 (proof of concept)
- Highlight TRL 7 (system prototype)
- Highlight TRL 9 (system complete)
- Show which technologies reached milestones

**Effort:** 2-3 hours

---

### 5. **Projection/Forecasting** ⭐⭐ MEDIUM PRIORITY
**Current:** Historical data only
**Enhancement:** Project future TRL progression
**Features:**
- "Project to 2030" toggle
- Extrapolate based on current advancement rate
- Show projected milestones
- Different projection scenarios (optimistic, realistic, pessimistic)

**Effort:** 4-5 hours

---

### 6. **Acceleration Indicators** ⭐⭐ MEDIUM PRIORITY
**Current:** Visual slope only
**Enhancement:** Quantify and highlight acceleration
**Features:**
- "Fastest Advancing" badge
- Color-code by advancement speed
- "Stagnant" warning indicators
- Acceleration trend arrows

**Effort:** 2-3 hours

---

### 7. **Category Comparison Mode** ⭐⭐ MEDIUM PRIORITY
**Current:** Filter by category
**Enhancement:** Compare categories side-by-side
**Features:**
- Split view: "H2 Production" vs "Fuel Cells"
- Average TRL per category
- Category advancement rates
- Category milestone achievements

**Effort:** 3-4 hours

---

### 8. **Funding Overlay** ⭐⭐⭐ HIGH PRIORITY
**Current:** TRL only
**Enhancement:** Show funding correlation
**Features:**
- Toggle to show funding amounts at each point
- Color intensity = funding level
- "High funding, low TRL" anomaly detection
- Funding vs TRL correlation analysis

**Effort:** 4-5 hours

---

### 9. **Export & Annotations** ⭐ MEDIUM PRIORITY
**Current:** No export
**Enhancement:** Export with annotations
**Features:**
- Export as PNG/SVG
- Add custom annotations/markers
- Export data as CSV
- Shareable link with selected technologies

**Effort:** 1-2 hours

---

### 10. **Animation Controls** ⭐ LOW PRIORITY
**Current:** Static or basic animation
**Enhancement:** Playback controls
**Features:**
- "Play" button to animate progression over time
- Speed control (1x, 2x, 5x)
- Pause at specific years
- Step forward/backward

**Effort:** 3-4 hours

---

## 🎯 Effective Interactions & Dynamic Behavior

### Cross-Visualization Interactions

#### 1. **Unified Selection State** ⭐⭐⭐ HIGH PRIORITY
**Concept:** Select entity in one visualization → highlight in all
**Implementation:**
- Global Zustand store for selected entities
- All visualizations subscribe to selection
- Auto-sync highlighting

**Example:**
```typescript
// Global store
const useSelectionStore = create((set) => ({
  selectedEntityId: null,
  setSelectedEntityId: (id) => set({ selectedEntityId: id })
}));

// In each visualization
const selectedId = useSelectionStore(state => state.selectedEntityId);
// Highlight matching entities
```

**Effort:** 4-5 hours

---

#### 2. **Contextual Insights Panel** ⭐⭐⭐ HIGH PRIORITY
**Concept:** Dynamic insights based on selected entity/view
**Features:**
- Show relevant stats when entity selected
- "Related entities" list
- "Key insights" auto-generated
- Quick actions (e.g., "View in Network Graph")

**Effort:** 5-6 hours

---

#### 3. **Filter Presets** ⭐⭐ MEDIUM PRIORITY
**Concept:** Save and load filter combinations
**Features:**
- "Save current filters" button
- Named presets (e.g., "High Funding Technologies")
- Quick apply presets
- Share preset links

**Effort:** 3-4 hours

---

#### 4. **Brush & Link** ⭐⭐ MEDIUM PRIORITY
**Concept:** Select range in one chart → filter others
**Features:**
- Select time range in Bump Chart → filter Treemap
- Select funding range in Treemap → filter Bump Chart
- Multi-chart synchronization

**Effort:** 4-5 hours

---

#### 5. **Smart Tooltips** ⭐⭐ MEDIUM PRIORITY
**Concept:** Context-aware tooltips with actions
**Features:**
- Show related entities in tooltip
- "Explore" buttons in tooltips
- Quick stats without leaving view
- Progressive disclosure

**Effort:** 2-3 hours

---

### Dynamic Behaviors

#### 1. **Real-Time Updates** ⭐ LOW PRIORITY
**Concept:** Auto-refresh when data changes
**Features:**
- WebSocket connection for live updates
- Smooth transitions on data change
- "Data updated" notifications

**Effort:** 6-8 hours

---

#### 2. **Responsive Aggregation** ⭐ MEDIUM PRIORITY
**Concept:** Auto-group small items when zoomed out
**Features:**
- "Others" group for small rectangles
- Expand on zoom
- Threshold-based grouping

**Effort:** 3-4 hours

---

#### 3. **Smart Defaults** ⭐ MEDIUM PRIORITY
**Concept:** Remember user preferences
**Features:**
- Save last used view
- Remember filter selections
- Restore on page load
- Per-user preferences

**Effort:** 2-3 hours

---

## 📊 Recommended Implementation Order

### Phase 1: High-Impact Quick Wins (1-2 days)
1. ✅ Treemap: Enhanced Tooltips
2. ✅ Bump Chart: Interactive Line Highlighting
3. ✅ Bump Chart: Multi-Technology Selection
4. ✅ Both: Export functionality

### Phase 2: Core Interactions (2-3 days)
5. ✅ Treemap: Drill-Down Navigation
6. ✅ Cross-Visualization Highlighting
7. ✅ Contextual Insights Panel
8. ✅ Filter Presets

### Phase 3: Advanced Features (3-4 days)
9. ✅ Bump Chart: Funding Overlay
10. ✅ Bump Chart: Projection/Forecasting
11. ✅ Treemap: Comparison Mode
12. ✅ Brush & Link interactions

---

## 🎨 Design Considerations

### Treemap
- **Aspect Ratio:** Aim for 1:1 rectangles (Nivo handles this)
- **Color:** Use meaningful colors (stakeholder type, category)
- **Labels:** Show only when space allows
- **Hierarchy:** Clear parent-child relationships

### Bump Chart
- **Line Width:** Thicker for selected/hovered
- **Colors:** Consistent with other visualizations
- **Labels:** Show at start/end, hide when crowded
- **Spacing:** Enough space for labels

---

## 💡 Quick Implementation Tips

### Treemap Drill-Down
```typescript
// Add to TreemapNavigate
const [zoomedNode, setZoomedNode] = useState<any>(null);

const getDisplayData = () => {
  if (zoomedNode) {
    return zoomedNode; // Show zoomed node as root
  }
  return getData(); // Show full hierarchy
};

// Add onClick handler
onClick={(node) => {
  if (node.children && node.children.length > 0) {
    setZoomedNode(node);
  }
}}
```

### Bump Chart Multi-Select
```typescript
// Add to BumpChartNavigate
const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

// Filter data
const filteredData = useMemo(() => {
  if (selectedTechs.length === 0) return bumpData;
  return bumpData.filter(serie => selectedTechs.includes(serie.id));
}, [bumpData, selectedTechs]);

// Add checkbox list in controls
```

---

## 📝 Notes

- **Performance:** Consider virtualization for large datasets
- **Accessibility:** Ensure keyboard navigation works
- **Mobile:** Some features may need mobile-specific implementations
- **Testing:** Test with real data volumes

