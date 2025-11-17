# NAVIGATE UI Architecture & Improvements

## 🎯 Core Principle: Separation of Concerns

**Controls Panel** → User inputs, filters, view selection  
**Insights Panel** → Contextual information, stats, related entities  
**Visualization Window** → Pure visual representation, interactions (hover, click, zoom)

---

## 📋 Reorganized Improvements by Location

### 🎛️ CONTROLS PANEL Enhancements

#### Treemap Controls
1. **View Selector** ✅ (Already in Controls)
   - By Stakeholder Type
   - By Tech Category
   - By Funding Type
   - By Project Status

2. **Value Range Filter** ⭐ NEW
   - Min/Max funding slider
   - "Show only > £1M" toggle
   - Percentage-based filtering (top 10%, 25%, 50%)

3. **Sorting Options** ⭐ NEW
   - Dropdown: By value | By name | By children count
   - Ascending/Descending toggle

4. **Zoom Navigation** ⭐ NEW (when drill-down implemented)
   - Breadcrumb path
   - "Reset Zoom" button
   - "Back" button

5. **Comparison Mode Toggle** ⭐ NEW
   - Enable/disable side-by-side comparison
   - Select second view for comparison

#### Bump Chart Controls
1. **View Selector** ✅ (Currently in component - MOVE TO CONTROLS)
   - All Technologies
   - By Category
   - Top Advancing

2. **Category Filters** ✅ (Currently in component - MOVE TO CONTROLS)
   - Multi-select checkboxes for categories
   - "Select All" / "Clear All" buttons

3. **Time Range Selector** ⭐ NEW
   - Start year slider (2019-2024)
   - End year slider (2019-2024)
   - Presets: "Last 3 years", "Last 5 years", "All"

4. **Technology Multi-Select** ⭐ NEW
   - Searchable checkbox list
   - "Select All" / "Clear All"
   - Filter by name

5. **Projection Toggle** ⭐ NEW
   - "Show Projection to 2030" checkbox
   - Scenario selector: Optimistic | Realistic | Pessimistic

6. **Funding Overlay Toggle** ⭐ NEW
   - "Show Funding Amounts" checkbox
   - "Color by Funding" checkbox

---

### 💡 INSIGHTS PANEL Enhancements

#### Entity Selection Insights (When entity clicked)
1. **Basic Stats Card**
   - Name, type, category
   - Key metrics (funding, TRL, etc.)
   - Quick actions

2. **Related Entities Card**
   - "Connected to X entities"
   - List of top connections
   - Click to navigate

3. **Contextual Insights Card**
   - "This entity represents Y% of total"
   - "Fastest advancing in category"
   - "Key milestones achieved"

4. **Cross-Visualization Links**
   - "View in Network Graph" button
   - "View in Sankey" button
   - "Compare in Radar" button

#### Visualization-Specific Insights

**Treemap:**
- Total funding displayed
- Number of entities shown
- Largest/smallest rectangles
- Distribution summary

**Bump Chart:**
- Fastest advancing technologies
- Technologies at milestones (TRL 4, 7, 9)
- Average advancement rate
- Stagnant technologies warning

---

### 🖼️ VISUALIZATION WINDOW Enhancements

#### 1. **Responsive Sizing** ⭐⭐⭐ HIGH PRIORITY
**Current:** Fixed heights (600px, 700px)
**Problem:** Too small on large screens, cramped on small screens

**Solution:**
```typescript
// Use viewport-relative sizing
const getVisualizationHeight = () => {
  if (isFullscreen) {
    return 'calc(100vh - 120px)'; // Full screen minus header
  }
  
  // Responsive based on viewport
  const viewportHeight = window.innerHeight;
  if (viewportHeight < 768) {
    return '400px'; // Mobile
  } else if (viewportHeight < 1024) {
    return '500px'; // Tablet
  } else {
    return 'min(70vh, 800px)'; // Desktop - 70% of viewport or max 800px
  }
};
```

**Implementation:**
- Use `useEffect` to listen to window resize
- Update height dynamically
- Smooth transitions

**Effort:** 2-3 hours

---

#### 2. **Zoom & Pan Controls** ⭐⭐⭐ HIGH PRIORITY
**Current:** Only Network Graph has zoom/pan
**Problem:** Other visualizations feel static, can't explore details

**Solution A: Native Nivo Zoom (if supported)**
- Some Nivo components support zoom natively
- Check documentation for each component

**Solution B: Custom Zoom Wrapper**
```typescript
// Create a zoomable wrapper component
const ZoomableVisualization = ({ children, minZoom = 0.5, maxZoom = 3 }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  return (
    <div className="relative overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button onClick={() => setZoom(z => Math.min(z + 0.1, maxZoom))}>
          +
        </button>
        <button onClick={() => setZoom(z => Math.max(z - 0.1, minZoom))}>
          -
        </button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
          Reset
        </button>
      </div>
      
      {/* Pannable Container */}
      <div
        className="cursor-move"
        onMouseDown={(e) => setIsDragging(true)}
        onMouseMove={(e) => {
          if (isDragging) {
            setPan({ x: pan.x + e.movementX, y: pan.y + e.movementY });
          }
        }}
        onMouseUp={() => setIsDragging(false)}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        {children}
      </div>
    </div>
  );
};
```

**Solution C: SVG/Canvas Zoom**
- For Nivo components that render to SVG/Canvas
- Use `transform: scale()` on container
- Handle mouse wheel for zoom
- Handle drag for pan

**Effort:** 4-6 hours

---

#### 3. **Fullscreen Mode Improvements** ⭐⭐ MEDIUM PRIORITY
**Current:** Basic fullscreen toggle
**Enhancement:** Enhanced fullscreen experience

**Features:**
- Hide controls/insights panels in fullscreen (optional)
- Maximize visualization area
- Exit fullscreen with ESC key
- Remember zoom/pan state when entering/exiting

**Implementation:**
```typescript
const [isFullscreen, setIsFullscreen] = useState(false);

useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [isFullscreen]);
```

**Effort:** 1-2 hours

---

#### 4. **Adaptive Layout** ⭐⭐ MEDIUM PRIORITY
**Current:** Fixed three-panel layout
**Enhancement:** Adaptive based on screen size

**Desktop (>1024px):**
- Three panels: Controls | Visualization | Insights
- Controls and Insights collapsible

**Tablet (768-1024px):**
- Two panels: Controls+Insights (tabs) | Visualization
- Or: Controls | Visualization+Insights (stacked)

**Mobile (<768px):**
- Single panel with tabs: Controls | Visualization | Insights
- Or: Visualization full-width, Controls/Insights as modals

**Implementation:**
```typescript
const useResponsiveLayout = () => {
  const [layout, setLayout] = useState<'three-panel' | 'two-panel' | 'single-panel'>('three-panel');
  
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setLayout('single-panel');
      } else if (width < 1024) {
        setLayout('two-panel');
      } else {
        setLayout('three-panel');
      }
    };
    
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);
  
  return layout;
};
```

**Effort:** 4-5 hours

---

#### 5. **Visualization-Specific Interactions**

**Treemap:**
- Click rectangle → Zoom into that node (drill-down)
- Hover → Highlight rectangle and show tooltip
- Right-click → Context menu (View Details, Explore Network, etc.)

**Bump Chart:**
- Click line → Select/deselect technology
- Hover line → Highlight and show stats
- Click point → Show TRL details for that year
- Drag to select time range → Filter other visualizations

**Both:**
- Mouse wheel → Zoom in/out
- Click + drag → Pan (if zoomed)
- Double-click → Reset zoom

**Effort:** 3-4 hours per visualization

---

## 🏗️ Implementation Strategy

### Phase 1: Move Controls to Controls Panel (1-2 days)
1. ✅ Move Bump Chart view selector to Controls Panel
2. ✅ Move Bump Chart category filters to Controls Panel
3. ✅ Move Treemap view selector to Controls Panel (already done)
4. ✅ Remove controls from visualization components

### Phase 2: Enhance Visual Windows (2-3 days)
1. ✅ Implement responsive sizing
2. ✅ Add zoom/pan wrapper for non-interactive visualizations
3. ✅ Improve fullscreen mode
4. ✅ Test on different screen sizes

### Phase 3: Insights Panel Integration (2-3 days)
1. ✅ Create entity selection state management
2. ✅ Build Insights Panel components
3. ✅ Connect click events to Insights Panel
4. ✅ Add cross-visualization links

### Phase 4: Advanced Interactions (3-4 days)
1. ✅ Implement drill-down for Treemap
2. ✅ Add multi-select for Bump Chart
3. ✅ Cross-visualization highlighting
4. ✅ Filter presets

---

## 📐 Recommended Layout Structure

### Desktop (Default)
```
┌─────────────────────────────────────────────────────────┐
│                    Header / Navigation                  │
├──────────────┬──────────────────────┬──────────────────┤
│              │                      │                  │
│   Controls   │   Visualization      │    Insights     │
│   Panel      │   Window             │    Panel        │
│              │   (Responsive)       │                  │
│              │                      │                  │
│   [Collapse] │   [Fullscreen]      │   [Collapse]    │
└──────────────┴──────────────────────┴──────────────────┘
```

### Tablet
```
┌─────────────────────────────────────────┐
│            Header / Navigation          │
├──────────────┬──────────────────────────┤
│              │                          │
│   Controls   │   Visualization          │
│   (Tabs)     │   Window                 │
│              │                          │
│   Insights   │   [Fullscreen]          │
│   (Tabs)     │                          │
└──────────────┴──────────────────────────┘
```

### Mobile
```
┌─────────────────────────┐
│   Header / Navigation   │
├─────────────────────────┤
│                         │
│   Visualization         │
│   Window                │
│   (Full Width)          │
│                         │
│   [Fullscreen]          │
├─────────────────────────┤
│   [Controls] [Insights] │
│   (Modal/Tabs)          │
└─────────────────────────┘
```

---

## 🎨 Visual Window Sizing Recommendations

### Current Issues
- Fixed heights don't adapt to content
- Too small on large monitors
- Cramped on small screens
- No zoom capability (except Network Graph)

### Recommended Heights

**Treemap:**
- Desktop: `min(70vh, 800px)` - Responsive to viewport
- Tablet: `60vh` - More vertical space
- Mobile: `50vh` - Compact but usable
- Fullscreen: `calc(100vh - 80px)` - Maximum space

**Bump Chart:**
- Desktop: `min(65vh, 700px)` - Good for line visibility
- Tablet: `55vh`
- Mobile: `45vh`
- Fullscreen: `calc(100vh - 80px)`

**Circle Packing:**
- Desktop: `min(75vh, 800px)` - Circular needs space
- Tablet: `65vh`
- Mobile: `55vh`
- Fullscreen: `calc(100vh - 80px)`

**Network Graph:**
- Already has zoom/pan ✅
- Keep current responsive behavior
- Enhance fullscreen mode

---

## 🔧 Quick Implementation: Responsive Sizing

```typescript
// Add to visualizations/page.tsx
const useResponsiveHeight = (baseHeight: number) => {
  const [height, setHeight] = useState(baseHeight);
  
  useEffect(() => {
    const updateHeight = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      if (isFullscreen) {
        setHeight(viewportHeight - 80); // Full screen minus header
      } else if (viewportWidth < 768) {
        setHeight(Math.max(400, viewportHeight * 0.5)); // Mobile: 50% of viewport
      } else if (viewportWidth < 1024) {
        setHeight(Math.max(500, viewportHeight * 0.6)); // Tablet: 60% of viewport
      } else {
        setHeight(Math.min(800, viewportHeight * 0.7)); // Desktop: 70% of viewport, max 800px
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isFullscreen]);
  
  return height;
};

// Usage in component
const treemapHeight = useResponsiveHeight(600);
```

---

## 💡 Alternative: Full UI Redesign (Future)

If current approach feels limiting, consider:

### Option A: Dashboard-Style Layout
- Large central visualization area
- Floating control panels (draggable)
- Collapsible sidebars
- Tab-based navigation

### Option B: Split-Screen Comparison
- Left: Visualization A
- Right: Visualization B
- Shared controls at top
- Shared insights at bottom

### Option C: Workspace Mode
- Multiple visualizations in grid
- Independent zoom/pan per visualization
- Shared selection state
- Drag-and-drop layout

**Recommendation:** Implement Phase 1-3 first, then evaluate if full redesign needed.

---

## 📝 Migration Checklist

### Move Controls from Components to Controls Panel
- [ ] Bump Chart: View selector (All/By Category/Top Advancing)
- [ ] Bump Chart: Category filter buttons
- [ ] Treemap: View selector (already done ✅)
- [ ] Remove all Button/control elements from visualization components
- [ ] Pass control state as props to visualization components

### Enhance Visual Windows
- [ ] Implement responsive height calculation
- [ ] Add zoom/pan wrapper for Treemap
- [ ] Add zoom/pan wrapper for Bump Chart
- [ ] Add zoom/pan wrapper for Circle Packing
- [ ] Improve fullscreen mode
- [ ] Test on mobile/tablet/desktop

### Enhance Insights Panel
- [ ] Create entity selection state
- [ ] Build entity details card
- [ ] Build related entities card
- [ ] Build contextual insights card
- [ ] Add cross-visualization links
- [ ] Connect click events

---

## 🎯 Priority Order

1. **Move Controls** (Quick win, improves consistency)
2. **Responsive Sizing** (Immediate UX improvement)
3. **Zoom/Pan for Visualizations** (Major usability boost)
4. **Insights Panel Integration** (Enables richer interactions)
5. **Advanced Features** (Drill-down, multi-select, etc.)

---

## 📊 Expected Impact

### Before
- Controls scattered in visualizations
- Fixed, small visualization windows
- No zoom/pan (except Network Graph)
- Limited insights on selection

### After
- Consistent Controls Panel
- Responsive, adaptive visualization windows
- Zoom/pan for all visualizations
- Rich Insights Panel with entity details
- Better mobile/tablet experience

---

## 🚀 Next Steps

1. **Review this document** - Confirm approach
2. **Start with Phase 1** - Move controls (quick win)
3. **Implement responsive sizing** - Immediate improvement
4. **Add zoom/pan** - Major usability boost
5. **Iterate based on feedback**

