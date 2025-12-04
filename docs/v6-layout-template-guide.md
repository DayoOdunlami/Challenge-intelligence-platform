# NetworkGraphDemoV6 Layout & Panel System - Template Guide

## Overview

NetworkGraphDemoV6 implements a **floating panel architecture** with three dockable intelligence panels (Controls, Insights, AI) that can be independently toggled, reordered, resized, and collapsed. This document describes the architecture so you can replicate it for other visualization pages.

---

## Page Structure

### 1. Header Section (Fixed Top Bar)

```613:670:src/components/visualizations/NetworkGraphDemoV6.tsx
<div className="relative min-h-screen bg-slate-100">
  <header className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
    <div>
      <p className="text-xs uppercase tracking-wider text-gray-500">Unified Graph V6</p>
      <h1 className="text-xl font-semibold text-gray-900">Floating Intelligence Panels</h1>
    </div>
    <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
      {/* Dataset selector, View mode toggle, Focus mode button */}
    </div>
  </header>
```

**Key Features:**
- Fixed header with backdrop blur
- Title/description on left
- Quick controls on right (dataset selector, view mode, focus mode)
- Responsive flex layout

---

### 2. Main Visualization Canvas (Full-Screen Container)

```672:691:src/components/visualizations/NetworkGraphDemoV6.tsx
<div className="relative min-h-[calc(100vh-72px)] bg-slate-50">
  <div className="relative h-full w-full">
    <UnifiedNetworkGraph
      entities={filteredEntities}
      relationships={filteredRelationships as UniversalRelationship[]}
      mode={viewMode}
      colorBy={colorBy}
      clusterMode={clusterMode}
      primaryClusterBy={primaryClusterBy}
      secondaryClusterBy={secondaryClusterBy}
      showHulls={effectiveShowHulls}
      clusterTightness={clusterTightness}
      clusterSpacing={clusterSpacing}
      velocityDecay={velocityDecay}
      maxVelocity={maxVelocity}
      maxDistance={maxDistance}
      onNodeSelect={setSelectedEntity}
      fitToCanvas
      clickToFocus
    />
```

**Key Features:**
- Full viewport height minus header (72px)
- Visualization component fills entire container
- Uses absolute positioning for overlay panels
- Visualization receives all control state as props

---

### 3. Panel Launcher Buttons (Top-Right Corner)

```693:717:src/components/visualizations/NetworkGraphDemoV6.tsx
<div className="absolute right-6 top-4 z-30 flex items-center gap-2">
  {(Object.keys(PANEL_META) as PanelKey[]).map((panel) => {
    const meta = PANEL_META[panel];
    const Icon = meta.icon;
    const active = dockedPanels[panel] && !collapsedPanels[panel];
    const showBadge = panelBadges[panel];
    return (
      <button
        key={panel}
        onClick={() => handleLauncherClick(panel)}
        className={clsx(
          'relative flex h-12 w-12 items-center justify-center rounded-full border shadow-xl transition-all',
          active ? 'bg-white text-gray-900 border-white' : 'bg-white/70 text-gray-500 hover:bg-white'
        )}
        style={{ color: active ? meta.accent : undefined }}
        title={meta.label}
      >
        {showBadge && !active && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 shadow-md" />
        )}
        <Icon className="h-5 w-5" />
      </button>
    );
  })}
</div>
```

**Key Features:**
- Circular icon buttons for each panel type
- Badge indicator when panel has updates but is closed
- Active state shows accent color
- Click toggles panel visibility

**Panel Metadata:**
```96:103:src/components/visualizations/NetworkGraphDemoV6.tsx
const PANEL_META: Record<
  PanelKey,
  { label: string; icon: typeof SlidersHorizontal; accent: string }
> = {
  controls: { label: 'Controls', icon: SlidersHorizontal, accent: '#006E51' },
  insights: { label: 'Insights', icon: Sparkles, accent: '#0f8b8d' },
  ai: { label: 'AI Copilot', icon: Bot, accent: '#7c3aed' },
};
```

---

### 4. Floating Panel Stack (Right Side)

```719:822:src/components/visualizations/NetworkGraphDemoV6.tsx
{hasOpenPanels && (
  <div
    className={clsx(
      'pointer-events-none absolute right-6 top-20 bottom-6 z-20 flex gap-4 transition-opacity duration-200',
      focusMode ? 'opacity-0' : 'opacity-100'
    )}
  >
    <div className={clsx('relative flex items-center pr-2', focusMode ? 'pointer-events-none' : 'pointer-events-auto')}>
      <div
        className="h-20 w-1 rounded-full bg-white/80 shadow-md ring-1 ring-black/5 cursor-ew-resize"
        onMouseDown={handleResizeStart}
        title="Drag to resize panels"
      />
    </div>
    <div className={clsx('flex items-start gap-4', focusMode ? 'pointer-events-none' : 'pointer-events-auto')}>
      {openPanels.map((panel) => {
        const meta = PANEL_META[panel];
        const index = openPanels.indexOf(panel);
        return (
          <SidebarPanel
            key={panel}
            title={meta.label}
            accent={meta.accent}
            width={computePanelWidth(panel)}
            collapsed={collapsedPanels[panel]}
            onCollapse={() => toggleCollapse(panel)}
            onClose={() => togglePanel(panel)}
            onMoveLeft={() => movePanel(panel, 'left')}
            onMoveRight={() => movePanel(panel, 'right')}
            canMoveLeft={index > 0}
            canMoveRight={index < openPanels.length - 1}
            icon={meta.icon}
          >
            {panel === 'controls' && (
              <ControlsPanel {...controlProps} />
            )}
            {panel === 'insights' && (
              <InsightsPanel
                entity={selectedEntity}
                related={relatedEntities}
                stats={quickStats}
                datasetLabel={datasetLabel}
              />
            )}
            {panel === 'ai' && (
              <div className="h-full">
                <AIChatPanel
                  context={{
                    activeViz: 'Unified Network Graph V6',
                    useNavigateData: dataset === 'navigate',
                    selectedEntities: selectedEntity ? [selectedEntity] : [],
                  }}
                />
              </div>
            )}
          </SidebarPanel>
        );
      })}
    </div>
  </div>
)}
```

**Key Features:**
- Only renders when `hasOpenPanels` is true
- Resizable via drag handle on left edge
- Panels can be reordered (move left/right)
- Focus mode hides panels (opacity-0)
- Each panel conditionally renders its content based on panel type

---

## State Management Architecture

### Panel State

```139:156:src/components/visualizations/NetworkGraphDemoV6.tsx
const [dockedPanels, setDockedPanels] = useState<Record<PanelKey, boolean>>({
  controls: true,
  insights: true,
  ai: true,
});
const [panelOrder, setPanelOrder] = useState<PanelKey[]>(['controls', 'insights', 'ai']);
const [collapsedPanels, setCollapsedPanels] = useState<Record<PanelKey, boolean>>({
  controls: false,
  insights: false,
  ai: false,
});
const [panelWidth, setPanelWidth] = useState(340);
const [focusMode, setFocusMode] = useState(false);
```

**State Variables:**
- `dockedPanels`: Boolean map of which panels are open
- `panelOrder`: Array controlling left-to-right order
- `collapsedPanels`: Boolean map for collapsed state (hidden but docked)
- `panelWidth`: Shared width for all panels (resizable)
- `focusMode`: Hides panels for distraction-free viewing

### Panel Operations

```526:560:src/components/visualizations/NetworkGraphDemoV6.tsx
const togglePanel = (panel: PanelKey) => {
  setDockedPanels((prev) => {
    const next = !prev[panel];
    if (next) {
      setCollapsedPanels((collapsed) => ({ ...collapsed, [panel]: false }));
    }
    return { ...prev, [panel]: next };
  });
};

const toggleCollapse = (panel: PanelKey) => {
  setCollapsedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
};

const handleLauncherClick = (panel: PanelKey) => {
  if (dockedPanels[panel] && collapsedPanels[panel]) {
    setCollapsedPanels((prev) => ({ ...prev, [panel]: false }));
    return;
  }
  togglePanel(panel);
};

const movePanel = (panel: PanelKey, direction: 'left' | 'right') => {
  setPanelOrder((prev) => {
    const currentIndex = prev.indexOf(panel);
    if (currentIndex === -1) return prev;
    const targetIndex =
      direction === 'left' ? Math.max(0, currentIndex - 1) : Math.min(prev.length - 1, currentIndex + 1);
    if (targetIndex === currentIndex) return prev;
    const next = [...prev];
    const [removed] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, removed);
    return next;
  });
};
```

### Resize Logic

```562:611:src/components/visualizations/NetworkGraphDemoV6.tsx
const handleResizing = useCallback(
  (event: MouseEvent) => {
    if (!resizeMeta.current.active) return;
    const delta = resizeMeta.current.startX - event.clientX;
    const nextWidth = Math.min(420, Math.max(260, resizeMeta.current.startWidth + delta));
    setPanelWidth(nextWidth);
  },
  []
);

const handleResizeEnd = useCallback(() => {
  resizeMeta.current.active = false;
  window.removeEventListener('mousemove', handleResizing);
  window.removeEventListener('mouseup', handleResizeEnd);
}, [handleResizing]);

const handleResizeStart = useCallback(
  (event: React.MouseEvent) => {
    event.preventDefault();
    resizeMeta.current = {
      active: true,
      startX: event.clientX,
      startWidth: panelWidth,
    };
    window.addEventListener('mousemove', handleResizing);
    window.addEventListener('mouseup', handleResizeEnd);
  },
  [handleResizeEnd, handleResizing, panelWidth]
);

const computePanelWidth = useCallback(
  (panel: PanelKey) => {
    const offsets: Record<PanelKey, number> = {
      controls: 60,
      insights: -10,
      ai: 30,
    };
    const target = panelWidth + (offsets[panel] || 0);
    return Math.max(280, Math.min(520, target));
  },
  [panelWidth]
);
```

**Resize Features:**
- Drag handle triggers resize on mouse down
- Calculates width delta from mouse movement
- Clamps between 260px and 420px
- Each panel can have a width offset (controls wider, insights narrower)
- Cleans up event listeners on unmount

---

## SidebarPanel Component

### Component Interface

```829:842:src/components/visualizations/NetworkGraphDemoV6.tsx
interface SidebarPanelProps {
  title: string;
  accent: string;
  width: number;
  collapsed: boolean;
  onCollapse: () => void;
  onClose: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  icon: typeof SlidersHorizontal;
  children: React.ReactNode;
}
```

### Component Implementation

```844:919:src/components/visualizations/NetworkGraphDemoV6.tsx
function SidebarPanel({
  title,
  accent,
  width,
  collapsed,
  onCollapse,
  onClose,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  icon: Icon,
  children,
}: SidebarPanelProps) {
  if (collapsed) {
    return null;
  }

  return (
    <div
      className="pointer-events-auto flex h-[80vh] max-h-[80vh] flex-col rounded-3xl border border-white/30 bg-white/90 shadow-2xl backdrop-blur-xl"
      style={{ width }}
    >
      <div
        className="flex items-center justify-between border-b border-white/40 px-4 py-3 text-sm font-semibold"
        style={{ color: accent }}
        onDoubleClick={onCollapse}
        title="Double-click to collapse"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <button
            onClick={onMoveLeft}
            disabled={!canMoveLeft}
            className={clsx(
              'rounded-full p-1 transition-colors',
              canMoveLeft ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'
            )}
            title="Move left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onMoveRight}
            disabled={!canMoveRight}
            className={clsx(
              'rounded-full p-1 transition-colors',
              canMoveRight ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'
            )}
            title="Move right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={onCollapse}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600"
            title="Collapse panel"
          >
            <ChevronLeft className="h-4 w-4 rotate-90" />
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600"
            title="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
```

**Key Features:**
- Returns null if collapsed (doesn't render)
- Fixed height (80vh) with scrollable content area
- Header with icon, title, and action buttons
- Double-click header to collapse
- Move left/right buttons (disabled at edges)
- Close button removes panel from dock
- Scrollable content area for long content

---

## Controls Panel

### Purpose
Contains all visualization-specific controls (filters, sliders, toggles, dataset selectors).

### Implementation Pattern

```752:796:src/components/visualizations/NetworkGraphDemoV6.tsx
{panel === 'controls' && (
  <ControlsPanel
    dataset={dataset}
    datasetLabel={datasetLabel}
    onPresetSelect={handlePresetSelect}
    activeDomains={activeDomains}
    onToggleDomain={handleDomainToggle}
    multiDomain={multiDomain}
    singleDomain={singleActiveDomain}
    showDomainHulls={showDomainHulls}
    setShowDomainHulls={setShowDomainHulls}
    primaryClusterBy={primaryClusterBy}
    setPrimaryClusterBy={setPrimaryClusterBy}
    secondaryClusterSelection={secondaryClusterSelection}
    setSecondaryClusterSelection={setSecondaryClusterSelection}
    colorBy={colorBy}
    setColorBy={setColorBy}
    clusterTightness={clusterTightness}
    setClusterTightness={setClusterTightness}
    clusterSpacing={clusterSpacing}
    setClusterSpacing={setClusterSpacing}
    velocityDecay={velocityDecay}
    setVelocityDecay={setVelocityDecay}
    maxVelocity={maxVelocity}
    setMaxVelocity={setMaxVelocity}
    maxDistance={maxDistance}
    setMaxDistance={setMaxDistance}
    atlasSimilarityThreshold={atlasSimilarityThreshold}
    setAtlasSimilarityThreshold={setAtlasSimilarityThreshold}
    trlRange={trlRange}
    setTrlRange={setTrlRange}
    showNavigateFilters={includesNavigate}
    activeNavigateGroups={activeNavigateGroups}
    toggleNavigateGroup={toggleNavigateGroup}
    activeTechnologyCategories={activeTechnologyCategories}
    toggleTechnologyCategory={toggleTechnologyCategory}
    showAtlasFilters={includesAtlas}
    activeAtlasSectors={activeAtlasSectors}
    toggleAtlasSector={toggleAtlasSector}
    allowStakeholderPods={includesNavigate}
    provenanceFilters={provenanceFilters}
    setProvenanceFilters={setProvenanceFilters}
    advancedOpen={advancedOpen}
    setAdvancedOpen={setAdvancedOpen}
  />
)}
```

**Pattern:**
- Receives all control state as props
- Uses controlled components (value + onChange)
- Organized into sections (Dataset Presets, Graph Layout, Filters, Provenance)
- Can have collapsible advanced sections

### Badge System

```256:278:src/components/visualizations/NetworkGraphDemoV6.tsx
const controlsBadge =
  hasDomainMixChange ||
  hasNavigateFilter ||
  hasAtlasSectorFilter ||
  hasTrlFilter ||
  hasProvenanceFilter ||
  atlasSimilarityThreshold !== 0.25 ||
  clusterSpacing !== 0.8 ||
  clusterTightness !== 0.5 ||
  velocityDecay !== 0.7 ||
  maxVelocity !== 18 ||
  maxDistance !== 1000 ||
  (multiDomain && !showDomainHulls) ||
  secondaryClusterSelection !== defaultSecondaryPods ||
  colorBy !== defaultColor ||
  primaryClusterBy !== (multiDomain ? 'domain' : 'entityType');
const insightsBadge = Boolean(selectedEntity) && !dockedPanels.insights;
const aiBadge = Boolean(selectedEntity) && !dockedPanels.ai;
const panelBadges: Record<PanelKey, boolean> = {
  controls: controlsBadge,
  insights: insightsBadge,
  ai: aiBadge,
};
```

**Badge Logic:**
- Shows red dot when panel has updates but is closed
- Controls: Shows when any setting differs from defaults
- Insights: Shows when entity is selected but panel is closed
- AI: Shows when entity is selected but panel is closed

---

## Insights Panel

### Purpose
Displays detailed information about selected entities, related entities, and dataset statistics.

### Implementation

```798:805:src/components/visualizations/NetworkGraphDemoV6.tsx
{panel === 'insights' && (
  <InsightsPanel
    entity={selectedEntity}
    related={relatedEntities}
    stats={quickStats}
    datasetLabel={datasetLabel}
  />
)}
```

### InsightsPanel Component

```1386:1543:src/components/visualizations/NetworkGraphDemoV6.tsx
function InsightsPanel({ entity, related, stats, datasetLabel }: InsightsPanelProps) {
  if (!entity) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-700">Explore</p>
          <h3 className="text-lg font-semibold text-emerald-900">{datasetLabel}</h3>
          <p className="text-sm text-emerald-900/80">
            Click on any node to view detailed insights, provenance, and relationships.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Quick Stats</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex justify-between">
              <span>Stakeholders</span>
              <span className="font-semibold">{stats.stakeholders}</span>
            </li>
            {/* More stats... */}
          </ul>
        </div>
      </div>
    );
  }

  // Entity detail view...
  return (
    <div className="space-y-4">
      {/* Entity header, metadata, tags, connections */}
    </div>
  );
}
```

**Two States:**
1. **Empty State**: Shows dataset overview and quick stats
2. **Entity Selected**: Shows entity details, metadata, tags, and related entities

**Key Features:**
- Conditional rendering based on selection
- Metadata grid (sector, category, TRL, funding)
- Tags display
- Related entities list (limited to 15, shows count if more)
- Scrollable content

---

## AI Chat Panel

### Purpose
Provides AI-powered assistance with visualization context awareness.

### Implementation

```806:816:src/components/visualizations/NetworkGraphDemoV6.tsx
{panel === 'ai' && (
  <div className="h-full">
    <AIChatPanel
      context={{
        activeViz: 'Unified Network Graph V6',
        useNavigateData: dataset === 'navigate',
        selectedEntities: selectedEntity ? [selectedEntity] : [],
      }}
    />
  </div>
)}
```

**Context Object:**
- `activeViz`: Visualization identifier
- `useNavigateData`: Data source flag
- `selectedEntities`: Array of currently selected entities

**Integration:**
- Uses existing `AIChatPanel` component
- Receives context for AI awareness
- Can trigger visualization changes via function calls
- Wrapped in full-height container

---

## Focus Mode

### Purpose
Hides all panels for distraction-free visualization viewing.

### Implementation

```660:668:src/components/visualizations/NetworkGraphDemoV6.tsx
<button
  onClick={() => setFocusMode((prev) => !prev)}
  className={clsx(
    'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
    focusMode ? 'border-[#006E51] bg-[#006E51]/10 text-[#006E51]' : 'border-gray-200 text-gray-600'
  )}
>
  {focusMode ? 'Exit Focus' : 'Focus Mode'}
</button>
```

**Effect:**
```722:724:src/components/visualizations/NetworkGraphDemoV6.tsx
className={clsx(
  'pointer-events-none absolute right-6 top-20 bottom-6 z-20 flex gap-4 transition-opacity duration-200',
  focusMode ? 'opacity-0' : 'opacity-100'
)}
```

**Features:**
- Toggles panel visibility (opacity-0)
- Disables pointer events on panels
- Button shows active state
- Smooth transition animation

---

## Template Checklist for New Visualization Pages

### 1. State Setup
- [ ] Define `PanelKey` type (e.g., `'controls' | 'insights' | 'ai'`)
- [ ] Create `PANEL_META` object with icons and accent colors
- [ ] Initialize panel state (`dockedPanels`, `panelOrder`, `collapsedPanels`, `panelWidth`, `focusMode`)
- [ ] Add visualization-specific control state

### 2. Header Component
- [ ] Fixed header with backdrop blur
- [ ] Title and description
- [ ] Quick controls (dataset, view mode, focus mode)
- [ ] Responsive layout

### 3. Visualization Container
- [ ] Full-screen container (`min-h-[calc(100vh-72px)]`)
- [ ] Visualization component with all control props
- [ ] Selection handler (`onNodeSelect` or equivalent)

### 4. Panel Launchers
- [ ] Circular icon buttons in top-right
- [ ] Badge indicators for updates
- [ ] Active state styling
- [ ] Click handlers

### 5. Panel Stack
- [ ] Conditional rendering (`hasOpenPanels`)
- [ ] Resize handle
- [ ] Panel ordering logic
- [ ] Focus mode opacity control

### 6. SidebarPanel Component
- [ ] Reusable panel wrapper
- [ ] Header with actions (move, collapse, close)
- [ ] Scrollable content area
- [ ] Width computation with offsets

### 7. Controls Panel
- [ ] All visualization controls as props
- [ ] Organized into sections
- [ ] Badge logic for non-default values
- [ ] Collapsible advanced sections

### 8. Insights Panel
- [ ] Empty state (overview + stats)
- [ ] Selected entity detail view
- [ ] Related entities list
- [ ] Metadata display

### 9. AI Chat Panel
- [ ] Context object with visualization info
- [ ] Selected entities array
- [ ] Full-height container

### 10. Focus Mode
- [ ] Toggle button in header
- [ ] Panel opacity control
- [ ] Pointer events disable

---

## Key Design Patterns

### 1. **Controlled Components**
All controls use React controlled component pattern: `value` + `onChange` props.

### 2. **Badge System**
Panels show badges when they have updates but are closed, encouraging user interaction.

### 3. **Progressive Disclosure**
Advanced controls are hidden by default, revealed via collapsible sections.

### 4. **State-Driven Rendering**
Panels conditionally render based on state, not CSS visibility (better performance).

### 5. **Resizable Panels**
Shared width with per-panel offsets allows fine-tuned sizing.

### 6. **Focus Mode**
Distraction-free viewing without losing panel state.

### 7. **Panel Ordering**
Users can reorder panels to match their workflow.

---

## Example: Adapting for a Bar Chart Visualization

```typescript
// 1. Define panel types
type PanelKey = 'controls' | 'insights' | 'ai';

// 2. Panel metadata
const PANEL_META: Record<PanelKey, { label: string; icon: typeof SlidersHorizontal; accent: string }> = {
  controls: { label: 'Controls', icon: SlidersHorizontal, accent: '#006E51' },
  insights: { label: 'Insights', icon: Sparkles, accent: '#0f8b8d' },
  ai: { label: 'AI Copilot', icon: Bot, accent: '#7c3aed' },
};

// 3. State management
const [dockedPanels, setDockedPanels] = useState<Record<PanelKey, boolean>>({
  controls: true,
  insights: true,
  ai: true,
});
const [panelOrder, setPanelOrder] = useState<PanelKey[]>(['controls', 'insights', 'ai']);
const [collapsedPanels, setCollapsedPanels] = useState<Record<PanelKey, boolean>>({
  controls: false,
  insights: false,
  ai: false,
});
const [panelWidth, setPanelWidth] = useState(340);
const [focusMode, setFocusMode] = useState(false);

// 4. Bar chart specific state
const [barSortOrder, setBarSortOrder] = useState<'asc' | 'desc'>('desc');
const [barValueMode, setBarValueMode] = useState<'absolute' | 'percentage'>('absolute');
const [selectedBar, setSelectedBar] = useState<string | null>(null);

// 5. Render structure
return (
  <div className="relative min-h-screen bg-slate-100">
    <header>...</header>
    <div className="relative min-h-[calc(100vh-72px)]">
      <BarChartNavigate
        sortOrder={barSortOrder}
        valueMode={barValueMode}
        onBarSelect={setSelectedBar}
      />
      {/* Panel launchers */}
      {/* Panel stack */}
    </div>
  </div>
);
```

---

## Benefits of This Architecture

1. **Consistent UX**: All visualization pages share the same panel system
2. **Flexible**: Panels can be customized per visualization
3. **Scalable**: Easy to add new panel types
4. **User-Friendly**: Resizable, reorderable, collapsible panels
5. **Performance**: Conditional rendering, not CSS hiding
6. **Accessible**: Clear focus states, keyboard navigation support
7. **Maintainable**: Reusable `SidebarPanel` component

---

## Next Steps

1. Extract `SidebarPanel` into a shared component library
2. Create a `usePanelSystem` hook for state management
3. Build a `PanelLauncher` component for the icon buttons
4. Standardize control panel interfaces
5. Create visualization-specific control components
6. Document AI context contracts for each visualization type

