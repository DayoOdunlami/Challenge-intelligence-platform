# NAVIGATE Improvements - Working with Existing UI

## ✅ Current UI Structure (Reuse This!)

**Existing Features:**
- ✅ Controls Panel (toggleable)
- ✅ Insights Panel (toggleable)
- ✅ Fullscreen toggle
- ✅ Three-panel layout: Controls | Visualization | Insights

**Goal:** Enhance existing structure, don't rebuild it.

---

## 🎯 Improvement Strategy

### 1. **Move Controls from Components → Controls Panel**

#### Bump Chart Controls (Currently in Component)
**Current Location:** `BumpChartNavigate.tsx` CardHeader
**Move To:** `visualizations/page.tsx` → `renderControlsPanel()` → `case 'bump'`

**Controls to Move:**
- View selector buttons (All Technologies, By Category, Top Advancing)
- Category filter buttons (H2Production, H2Storage, etc.)
- Description text

**Implementation:**
```typescript
// In BumpChartNavigate.tsx - REMOVE these from CardHeader:
- View selector buttons
- Category filter section
- Description text

// Keep only:
- CardTitle
- Empty CardHeader (or remove if not needed)

// In visualizations/page.tsx - ADD to renderControlsPanel():
case 'bump':
  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
      <h3 className="text-lg font-semibold text-[#006E51] mb-4">TRL Progression Controls</h3>
      
      {/* Data Source Toggle - Already exists ✅ */}
      
      {/* View Selector - MOVE HERE */}
      <div className="mt-4">
        <h4 className="font-medium text-[#006E51] mb-3">View</h4>
        <div className="flex gap-2">
          <button onClick={() => setBumpView('all_technologies')}>All Technologies</button>
          <button onClick={() => setBumpView('by_category')}>By Category</button>
          <button onClick={() => setBumpView('top_advancing')}>Top Advancing</button>
        </div>
      </div>
      
      {/* Category Filters - MOVE HERE (only show when view === 'by_category') */}
      {bumpView === 'by_category' && (
        <div className="mt-4">
          <h4 className="font-medium text-[#006E51] mb-3">Filter by Technology Category</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={selectedCategories.includes(category) ? 'selected' : ''}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* How to Use - Already exists ✅ */}
    </div>
  );
```

#### Treemap Controls (Already in Component)
**Current Location:** `TreemapNavigate.tsx` CardHeader
**Move To:** `visualizations/page.tsx` → `renderControlsPanel()` → `case 'treemap'`

**Controls to Move:**
- View selector buttons (By Stakeholder Type, By Tech Category, etc.)

**Implementation:**
```typescript
// In TreemapNavigate.tsx - REMOVE view selector from CardHeader
// Keep only CardTitle and description

// In visualizations/page.tsx - ADD to renderControlsPanel():
case 'treemap':
  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
      <h3 className="text-lg font-semibold text-[#006E51] mb-4">Treemap Controls</h3>
      
      {/* Data Source Toggle - Already exists ✅ */}
      
      {/* View Selector - MOVE HERE */}
      <div className="mt-4">
        <h4 className="font-medium text-[#006E51] mb-3">Hierarchy View</h4>
        <div className="space-y-2">
          <button onClick={() => setTreemapView('by_stakeholder_type')}>
            By Stakeholder Type
          </button>
          <button onClick={() => setTreemapView('by_tech_category')}>
            By Tech Category
          </button>
          <button onClick={() => setTreemapView('by_funding_type')}>
            By Funding Type
          </button>
          <button onClick={() => setTreemapView('by_project')}>
            By Project Status
          </button>
        </div>
      </div>
      
      {/* How to Use - Already exists ✅ */}
    </div>
  );
```

---

### 2. **Enhance Existing Insights Panel**

#### Current Insights Panel Structure
**Location:** `visualizations/page.tsx` → `renderInsightsPanel()`
**Current Content:**
- Dataset Overview (stats)
- Visualization-specific insights (static)

#### Enhancements to Add

**A. Entity Selection Insights (When entity clicked)**
```typescript
// Add state for selected entity
const [selectedEntity, setSelectedEntity] = useState<{
  type: 'stakeholder' | 'technology' | 'project' | 'funding';
  id: string;
  data: any;
} | null>(null);

// In renderInsightsPanel(), add:
{selectedEntity && (
  <div className="p-4 bg-white/80 rounded-lg border border-[#CCE2DC]/50 mb-4">
    <h4 className="font-semibold text-[#006E51] mb-2">
      {selectedEntity.data.name}
    </h4>
    <div className="text-sm space-y-1">
      <div>Type: {selectedEntity.type}</div>
      <div>Funding: {formatValue(selectedEntity.data.total_funding || 0)}</div>
      {/* More details based on type */}
    </div>
    <div className="mt-3 flex gap-2">
      <button onClick={() => {/* View in Network Graph */}}>
        View in Network
      </button>
      <button onClick={() => {/* View in Sankey */}}>
        View in Sankey
      </button>
    </div>
  </div>
)}
```

**B. Visualization-Specific Dynamic Insights**

**For Bump Chart:**
```typescript
{activeViz === 'bump' && (
  <div className="space-y-4">
    {/* Fastest Advancing */}
    <div className="p-4 bg-green-50 rounded-lg">
      <h4 className="font-medium text-green-700 mb-2">Fastest Advancing</h4>
      <div className="text-sm text-gray-600">
        {getFastestAdvancingTechs().map(tech => (
          <div key={tech.id}>{tech.name}: +{tech.advancement} TRL levels</div>
        ))}
      </div>
    </div>
    
    {/* At Milestones */}
    <div className="p-4 bg-blue-50 rounded-lg">
      <h4 className="font-medium text-blue-700 mb-2">Recent Milestones</h4>
      <div className="text-sm text-gray-600">
        {getRecentMilestones().map(m => (
          <div key={m.id}>{m.name} reached TRL {m.trl}</div>
        ))}
      </div>
    </div>
  </div>
)}
```

**For Treemap:**
```typescript
{activeViz === 'treemap' && (
  <div className="space-y-4">
    {/* Distribution Summary */}
    <div className="p-4 bg-purple-50 rounded-lg">
      <h4 className="font-medium text-purple-700 mb-2">Distribution</h4>
      <div className="text-sm text-gray-600">
        <div>Total: {formatValue(totalFunding)}</div>
        <div>Largest: {largestEntity.name} ({largestEntity.percentage}%)</div>
        <div>Entities: {entityCount}</div>
      </div>
    </div>
  </div>
)}
```

---

### 3. **Enhance Visualization Windows (Keep Existing Structure)**

#### A. Responsive Sizing (Enhance Current Heights)

**Current:** Fixed heights in `getVisualizationHeight()`
**Enhance:** Make responsive to viewport

```typescript
// Update getVisualizationHeight() in visualizations/page.tsx
const getVisualizationHeight = (vizType: VisualizationType): string => {
  // Use viewport-relative sizing
  const baseHeight = isFullscreen 
    ? 'calc(100vh - 80px)'  // Fullscreen: almost full viewport
    : 'min(70vh, 800px)';   // Normal: 70% of viewport, max 800px
  
  // Adjust per visualization type
  switch (vizType) {
    case 'treemap':
      return isFullscreen ? baseHeight : 'min(65vh, 700px)';
    case 'bump':
      return isFullscreen ? baseHeight : 'min(60vh, 650px)';
    case 'circle':
      return isFullscreen ? baseHeight : 'min(70vh, 750px)';
    case 'network':
      return isFullscreen ? baseHeight : 'min(75vh, 800px)';
    default:
      return isFullscreen ? baseHeight : 'min(65vh, 700px)';
  }
};
```

#### B. Add Zoom/Pan to Visualizations (Optional Enhancement)

**For non-interactive visualizations (Treemap, Bump Chart, Circle Packing):**

Create a reusable wrapper:
```typescript
// components/ui/ZoomableContainer.tsx
'use client';

import { useState, useRef } from 'react';

export function ZoomableContainer({ children }: { children: React.ReactNode }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Zoom Controls */}
      {zoom !== 1 && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white/90 rounded-lg p-2 shadow-lg">
          <button
            onClick={() => setZoom(z => Math.min(3, z + 0.1))}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            +
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            −
          </button>
          <button
            onClick={resetView}
            className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      )}

      {/* Zoom Indicator */}
      {zoom !== 1 && (
        <div className="absolute bottom-4 right-4 z-10 bg-white/90 rounded px-2 py-1 text-xs">
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Pannable Content */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

**Usage:**
```typescript
// Wrap visualization in ZoomableContainer
<ZoomableContainer>
  <TreemapNavigate {...props} />
</ZoomableContainer>
```

---

## 📋 Implementation Checklist

### Phase 1: Move Controls (2-3 hours)
- [ ] Remove view selector from `BumpChartNavigate.tsx` CardHeader
- [ ] Remove category filters from `BumpChartNavigate.tsx` CardHeader
- [ ] Add view selector to Controls Panel (`case 'bump'`)
- [ ] Add category filters to Controls Panel (`case 'bump'`)
- [ ] Remove view selector from `TreemapNavigate.tsx` CardHeader
- [ ] Add view selector to Controls Panel (`case 'treemap'`)
- [ ] Test: Controls should work from Controls Panel

### Phase 2: Enhance Insights Panel (3-4 hours)
- [ ] Add `selectedEntity` state to visualizations/page.tsx
- [ ] Create entity selection handler
- [ ] Add entity details card to Insights Panel
- [ ] Add Bump Chart dynamic insights (fastest advancing, milestones)
- [ ] Add Treemap dynamic insights (distribution summary)
- [ ] Add cross-visualization links
- [ ] Test: Click entity → Insights Panel updates

### Phase 3: Responsive Sizing (1-2 hours)
- [ ] Update `getVisualizationHeight()` to use viewport-relative sizing
- [ ] Test on different screen sizes
- [ ] Test fullscreen mode

### Phase 4: Zoom/Pan (Optional, 3-4 hours)
- [ ] Create `ZoomableContainer` component
- [ ] Wrap Treemap in ZoomableContainer
- [ ] Wrap Bump Chart in ZoomableContainer
- [ ] Wrap Circle Packing in ZoomableContainer
- [ ] Test zoom/pan interactions

---

## 🎯 Quick Start: Move Bump Chart Controls

**Step 1: Add state to visualizations/page.tsx**
```typescript
// Add near other state declarations
const [bumpView, setBumpView] = useState<'all_technologies' | 'by_category' | 'top_advancing'>('all_technologies');
const [selectedCategories, setSelectedCategories] = useState<TechnologyCategory[]>([]);
```

**Step 2: Update Controls Panel**
```typescript
case 'bump':
  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
      <h3 className="text-lg font-semibold text-[#006E51] mb-4">TRL Progression Controls</h3>
      
      {/* Existing Data Source Toggle */}
      
      {/* NEW: View Selector */}
      <div className="mt-4">
        <h4 className="font-medium text-[#006E51] mb-3">View</h4>
        <div className="flex gap-2">
          <button
            onClick={() => setBumpView('all_technologies')}
            className={`px-4 py-2 rounded-lg text-sm ${
              bumpView === 'all_technologies' ? 'bg-[#006E51] text-white' : 'bg-gray-100'
            }`}
          >
            All Technologies
          </button>
          {/* ... other buttons */}
        </div>
      </div>
      
      {/* NEW: Category Filters (conditional) */}
      {bumpView === 'by_category' && (
        <div className="mt-4">
          <h4 className="font-medium text-[#006E51] mb-3">Filter by Technology Category</h4>
          {/* ... category buttons */}
        </div>
      )}
      
      {/* Existing How to Use */}
    </div>
  );
```

**Step 3: Pass props to BumpChartNavigate**
```typescript
<BumpChartNavigate
  technologies={technologies}
  view={bumpView}  // NEW
  selectedCategories={selectedCategories}  // NEW
  onViewChange={setBumpView}  // NEW (if needed)
  className="w-full min-h-full"
/>
```

**Step 4: Update BumpChartNavigate to accept props**
```typescript
interface BumpChartNavigateProps {
  technologies: Technology[];
  view?: 'all_technologies' | 'by_category' | 'top_advancing';  // NEW
  selectedCategories?: TechnologyCategory[];  // NEW
  onViewChange?: (view: ...) => void;  // NEW
  className?: string;
}

export function BumpChartNavigate({ 
  technologies,
  view: externalView,  // NEW
  selectedCategories: externalCategories,  // NEW
  onViewChange,  // NEW
  className = '' 
}: BumpChartNavigateProps) {
  // Use external props if provided, otherwise use internal state
  const [internalView, setInternalView] = useState(...);
  const view = externalView ?? internalView;
  
  // Remove view selector buttons from CardHeader
  // Remove category filters from CardHeader
  // Keep only CardTitle
}
```

---

## ✅ Benefits of This Approach

1. **Reuses Existing UI** - No major restructuring
2. **Consistent UX** - All controls in same place
3. **Clean Components** - Visualizations focus on rendering
4. **Easy to Extend** - Add more controls to existing panels
5. **Maintains Toggle System** - Controls/Insights panels still toggleable

---

## 🚀 Next Steps

1. **Start with Phase 1** - Move Bump Chart controls (quick win)
2. **Then Phase 2** - Enhance Insights Panel
3. **Then Phase 3** - Responsive sizing
4. **Optional Phase 4** - Zoom/Pan if needed

