# Visualization Registration Guide
**How to Add New Visualizations and Make It Automatic**

---

## Current State: Manual Registration Required ❌

**Short Answer:** Currently, **everything is manual**. When you add a new visualization, you need to update **3 places**:

1. ✅ **Registry** (`src/lib/visualisations/registry.ts`)
2. ✅ **AI Functions** (`src/lib/ai-functions.ts`)
3. ⚠️ **Page Components** (if using hardcoded arrays)

---

## What Needs to Be Updated (Current Manual Process)

### 1. Registry (`src/lib/visualisations/registry.ts`)

**Location:** Add to appropriate config array (e.g., `navigateToolkitConfigs`, `atlasConfigs`, etc.)

**Example:**
```typescript
// In navigateToolkitConfigs array
createVizConfig('my-new-viz', 'My New Visualization', 'Description here', {
  domains: ['navigate'],
  category: 'Comparison',
  status: 'ready',
  icon: BarChart3,
  tags: ['new', 'experimental'],
  // Optional: controls, demoOption, etc.
}),
```

**What Gets Updated:**
- One of the config arrays (networkGraphConfigs, navigateToolkitConfigs, etc.)
- Automatically included in `allConfigs` → `visualizationRegistry` Map

**Registry Helper Functions:**
- `getVisualization(id)` - Get single viz
- `getVisualizationsForDomain(domain)` - Get all for domain
- `getAllVisualizations()` - Get all
- `getVisualizationsByCategory()` - Grouped by category

---

### 2. AI Functions (`src/lib/ai-functions.ts`)

**Location:** `AVAILABLE_VISUALIZATIONS` array

**Example:**
```typescript
export const AVAILABLE_VISUALIZATIONS: VisualizationInfo[] = [
  // ... existing visualizations
  { 
    id: 'my-new-viz', 
    name: 'My New Visualization', 
    description: 'Description here', 
    category: 'comparison' 
  },
];
```

**Why This Matters:**
- Used in `switch_visualization` function enum
- Used in `formatAICapabilities()` for AI context
- AI needs to know what visualizations exist

**Also Update Controls (if your viz has controls):**
```typescript
export const AVAILABLE_CONTROLS: ControlInfo[] = [
  // ... existing controls
  { 
    id: 'my-new-viz.setView', 
    label: 'My Viz View', 
    type: 'single-select', 
    options: ['view1', 'view2'], 
    appliesTo: ['my-new-viz'] 
  },
];
```

---

### 3. Page Components (If Using Hardcoded Arrays)

**Location:** `src/app/visualizations/page.tsx` or `src/app/navigate/page.tsx`

**If pages use hardcoded arrays:**
```typescript
// In visualizations/page.tsx
const visualizations = [
  // ... existing
  {
    id: 'my-new-viz' as VisualizationType,
    name: 'My New Visualization',
    description: 'Description here',
    icon: BarChart3,
    color: '#006E51'
  }
];

// Also update VisualizationType union
type VisualizationType = 'sankey' | 'heatmap' | ... | 'my-new-viz'
```

**Note:** This is redundant if pages use the registry (which they should).

---

## Current Registration Flow

```
1. Create Component
   └─> src/components/visualizations/MyNewViz.tsx

2. Add to Registry (MANUAL)
   └─> src/lib/visualisations/registry.ts
       └─> createVizConfig('my-new-viz', ...)

3. Add to AI Functions (MANUAL)
   └─> src/lib/ai-functions.ts
       └─> AVAILABLE_VISUALIZATIONS.push(...)

4. Add Controls to AI (MANUAL - if needed)
   └─> src/lib/ai-functions.ts
       └─> AVAILABLE_CONTROLS.push(...)

5. Update Page (MANUAL - if not using registry)
   └─> src/app/visualizations/page.tsx
       └─> Add to visualizations array
```

**Total Manual Steps: 3-4 places to update**

---

## How to Make It Automatic ✅

The registry system is **designed** to support automatic generation, but it's not connected yet. Here's how to make it automatic:

### Option 1: Generate AI Functions from Registry (Recommended)

**Create a helper function that generates AI function definitions from the registry:**

```typescript
// src/lib/ai-functions.ts

import { getAllVisualizations } from '@/lib/visualisations/registry';

/**
 * Auto-generate AVAILABLE_VISUALIZATIONS from registry
 */
export const AVAILABLE_VISUALIZATIONS: VisualizationInfo[] = 
  getAllVisualizations()
    .filter(viz => viz.status === 'ready') // Only ready visualizations
    .map(viz => ({
      id: viz.id,
      name: viz.name,
      description: viz.description,
      category: viz.category.toLowerCase(),
    }));

/**
 * Auto-generate AVAILABLE_CONTROLS from registry
 */
export const AVAILABLE_CONTROLS: ControlInfo[] = 
  getAllVisualizations()
    .flatMap(viz => 
      viz.controls.map(control => ({
        id: `${viz.id}.${control.id}`,
        label: control.label,
        type: mapControlType(control.type),
        options: control.options?.map(opt => opt.value),
        description: control.description,
        appliesTo: [viz.id],
      }))
    );

function mapControlType(type: ControlType): 'single-select' | 'multi-select' | 'toggle' | 'range' {
  // Map registry control types to AI function types
  switch (type) {
    case 'select': return 'single-select';
    case 'multiselect': return 'multi-select';
    case 'toggle': return 'toggle';
    case 'range': return 'range';
    default: return 'single-select';
  }
}
```

**Benefits:**
- ✅ Single source of truth (registry)
- ✅ Automatic sync
- ✅ No manual updates needed
- ✅ Type-safe

**Result:** Add to registry → AI functions auto-update

---

### Option 2: Convention-Based Auto-Discovery

**Use file naming conventions and metadata exports:**

```typescript
// src/components/visualizations/MyNewViz.tsx

// Export metadata
export const visualizationMetadata = {
  id: 'my-new-viz',
  name: 'My New Visualization',
  description: 'Description here',
  domains: ['navigate'] as const,
  category: 'Comparison' as const,
  status: 'ready' as const,
  controls: [
    {
      id: 'setView',
      type: 'select' as const,
      label: 'View Mode',
      options: [{ value: 'view1', label: 'View 1' }],
      // ... other control properties
    }
  ],
};

// Component
export function MyNewViz(props: VisualizationComponentProps) {
  // ... component implementation
}
```

**Then scan and register automatically:**

```typescript
// src/lib/visualisations/auto-register.ts

import * as fs from 'fs';
import * as path from 'path';

export function autoRegisterVisualizations() {
  const vizDir = path.join(process.cwd(), 'src/components/visualizations');
  const files = fs.readdirSync(vizDir);
  
  const configs: VisualizationConfig[] = [];
  
  for (const file of files) {
    if (file.endsWith('.tsx')) {
      // Dynamic import and extract metadata
      const module = require(`@/components/visualizations/${file}`);
      if (module.visualizationMetadata) {
        configs.push(createConfigFromMetadata(module.visualizationMetadata));
      }
    }
  }
  
  return configs;
}
```

**Benefits:**
- ✅ Zero manual registration
- ✅ Component is self-describing
- ✅ Automatic discovery

**Drawbacks:**
- ⚠️ Requires build-time or runtime scanning
- ⚠️ More complex setup
- ⚠️ Type safety challenges

---

### Option 3: Hybrid Approach (Best of Both)

**Use registry as source of truth, but make it easier to add:**

```typescript
// src/lib/visualisations/registry.ts

// Helper: Register a visualization with all metadata in one place
export function registerVisualization(
  component: React.ComponentType<VisualizationComponentProps>,
  metadata: {
    id: string;
    name: string;
    description: string;
    domains: Domain[];
    category: VisualizationCategory;
    status: VisualizationStatus;
    icon?: React.ComponentType<{ className?: string }>;
    tags?: string[];
    controls?: ControlDefinition[];
    defaultState?: ControlState;
  }
): VisualizationConfig {
  const config: VisualizationConfig = {
    ...metadata,
    Component: component,
    controls: metadata.controls || [],
    defaultState: metadata.defaultState || {},
  };
  
  // Auto-register
  visualizationRegistry.set(config.id, config);
  
  return config;
}
```

**Usage:**
```typescript
// src/components/visualizations/MyNewViz.tsx
import { registerVisualization } from '@/lib/visualisations/registry';

export function MyNewViz(props: VisualizationComponentProps) {
  // ... component
}

// Auto-register on import
registerVisualization(MyNewViz, {
  id: 'my-new-viz',
  name: 'My New Visualization',
  description: 'Description here',
  domains: ['navigate'],
  category: 'Comparison',
  status: 'ready',
  icon: BarChart3,
  controls: [
    {
      id: 'setView',
      type: 'select',
      label: 'View Mode',
      // ... control definition
    }
  ],
});
```

**Then generate AI functions from registry (Option 1).**

**Benefits:**
- ✅ Single place to register (component file)
- ✅ Auto-generates AI functions
- ✅ Type-safe
- ✅ Easy to use

---

## Recommended Solution

### Step 1: Make AI Functions Auto-Generate from Registry

**File:** `src/lib/ai-functions.ts`

```typescript
import { getAllVisualizations } from '@/lib/visualisations/registry';

// Auto-generate from registry
export const AVAILABLE_VISUALIZATIONS: VisualizationInfo[] = 
  getAllVisualizations()
    .filter(viz => viz.status === 'ready')
    .map(viz => ({
      id: viz.id,
      name: viz.name,
      description: viz.description || viz.aiDescription || '',
      category: viz.category.toLowerCase(),
    }));

// Auto-generate controls from registry
export const AVAILABLE_CONTROLS: ControlInfo[] = 
  getAllVisualizations()
    .flatMap(viz => 
      viz.controls.map(control => ({
        id: `${viz.id}.${control.id}`,
        label: control.label,
        type: mapControlTypeToAIType(control.type),
        options: control.options?.map(opt => opt.value),
        description: control.description || control.aiHint,
        appliesTo: [viz.id],
      }))
    );

// Rest of file stays the same...
```

**Result:** Registry becomes single source of truth for AI functions.

---

### Step 2: Use Registry in Pages

**File:** `src/app/visualizations/page.tsx`

```typescript
import { getAllVisualizations, getVisualizationsForDomain } from '@/lib/visualisations/registry';

// Replace hardcoded array with registry
const visualizations = getAllVisualizations()
  .filter(viz => viz.status === 'ready')
  .map(viz => ({
    id: viz.id,
    name: viz.name,
    description: viz.description,
    icon: viz.icon || BarChart3,
    color: getColorForCategory(viz.category),
  }));
```

**Result:** Pages automatically show all registered visualizations.

---

### Step 3: Simplify Registration (Optional)

**Add helper function to registry:**

```typescript
// src/lib/visualisations/registry.ts

export function registerVisualization(
  component: React.ComponentType<VisualizationComponentProps>,
  metadata: Omit<VisualizationConfig, 'Component'>
) {
  const config: VisualizationConfig = {
    ...metadata,
    Component: component,
  };
  
  visualizationRegistry.set(config.id, config);
  return config;
}
```

---

## After Making It Automatic

### New Visualization Workflow

```
1. Create Component
   └─> src/components/visualizations/MyNewViz.tsx

2. Add to Registry (ONE PLACE)
   └─> src/lib/visualisations/registry.ts
       └─> createVizConfig('my-new-viz', ...)

3. DONE! ✅
   ├─> AI functions auto-generated
   ├─> Pages auto-update
   └─> Controls auto-available to AI
```

**Total Manual Steps: 1 place (registry)**

---

## Current vs. Automatic Comparison

| Step | Current (Manual) | After Auto-Generation |
|------|-----------------|----------------------|
| **Registry** | ✅ Manual | ✅ Manual (single source) |
| **AI Functions** | ✅ Manual | ✅ **Auto-generated** |
| **AI Controls** | ✅ Manual | ✅ **Auto-generated** |
| **Page Arrays** | ✅ Manual | ✅ **Auto-generated** |
| **Total Steps** | **3-4 places** | **1 place** |

---

## Implementation Priority

### Phase 1: Auto-Generate AI Functions (HIGH PRIORITY)

**Effort:** 2-3 hours  
**Impact:** Eliminates 2 manual steps

**File to modify:** `src/lib/ai-functions.ts`

```typescript
// Replace hardcoded arrays with registry-based generation
import { getAllVisualizations } from '@/lib/visualisations/registry';

export const AVAILABLE_VISUALIZATIONS = /* auto-generated */;
export const AVAILABLE_CONTROLS = /* auto-generated */;
```

### Phase 2: Use Registry in Pages (MEDIUM PRIORITY)

**Effort:** 3-4 hours  
**Impact:** Eliminates hardcoded arrays in pages

**Files to modify:** 
- `src/app/visualizations/page.tsx`
- `src/app/navigate/page.tsx`

### Phase 3: Simplify Registration (LOW PRIORITY)

**Effort:** 2-3 hours  
**Impact:** Makes registration even easier

**File to modify:** `src/lib/visualisations/registry.ts`

---

## Summary

### Current State: ❌ Manual (3-4 places to update)

1. Registry
2. AI Functions
3. AI Controls
4. Page arrays

### After Auto-Generation: ✅ Automatic (1 place to update)

1. Registry (single source of truth)
2. ✅ AI Functions (auto-generated)
3. ✅ AI Controls (auto-generated)
4. ✅ Page arrays (auto-generated)

### Recommendation

**Implement Phase 1 immediately** - it's a small change with big impact. Just replace the hardcoded arrays in `ai-functions.ts` with registry-based generation. This makes the registry the single source of truth for AI capabilities.

**Estimated Time:** 2-3 hours to implement auto-generation  
**Benefit:** Eliminates 2-3 manual steps forever

---

## Quick Reference

### To Add a New Visualization (Current):

1. ✅ Add to registry (`registry.ts`)
2. ✅ Add to `AVAILABLE_VISUALIZATIONS` (`ai-functions.ts`)
3. ✅ Add controls to `AVAILABLE_CONTROLS` (`ai-functions.ts`)
4. ✅ Add to page arrays (if not using registry)

### To Add a New Visualization (After Auto-Generation):

1. ✅ Add to registry (`registry.ts`)
2. ✅ **Done!** Everything else auto-updates

