# Implementation Plan: Registry Auto-Generation + Function Execution
**What You're Getting and How It Relates to the Audit**

---

## 🎯 What We're Building

### Phase 1: Auto-Generate AI Functions (2-3 hours)
**What You Get:**
- ✅ Registry becomes single source of truth
- ✅ AI automatically knows about all 60+ visualizations in registry
- ✅ AI automatically knows about all controls
- ✅ Add new visualization → AI knows about it immediately (no manual updates)
- ✅ Everything stays in sync automatically

**What Changes:**
- `src/lib/ai-functions.ts` - Reads from registry instead of hardcoded arrays
- AI function definitions auto-generate from registry metadata

**Impact:**
- Eliminates 2 manual steps when adding visualizations
- Registry controls automatically become AI-accessible
- Type-safe and automatic

---

### Phase 2: Wire Up Function Execution (2-3 days)
**What You Get:**
- ✅ AI can actually switch visualizations ("Show me the radar chart" → switches to radar)
- ✅ AI can actually change controls ("Set TRL range to 4-7" → filter updates)
- ✅ AI can actually filter data ("Show only hydrogen technologies" → filters apply)
- ✅ AI can actually highlight entities ("Highlight ZeroAvia" → entity highlights)
- ✅ Bidirectional communication - AI sees current state, AI can change state

**What Changes:**
- `src/app/navigate/page.tsx` - Add function execution handler
- `src/app/visualizations/page.tsx` - Add function execution handler
- Connect AI function calls to actual state setters
- Map control IDs to state update functions

**Impact:**
- Makes AI actually functional (currently it detects calls but doesn't execute them)
- Enables true AI-driven UI control
- Critical for generative UI capabilities

---

### Phase 3: Make Pages Read from Registry (1 day)
**What You Get:**
- ✅ Visualization list in pages auto-updates from registry
- ✅ No need to manually update page arrays
- ✅ Consistent visualization list across all pages
- ✅ Status filtering (only show 'ready' visualizations)
- ✅ Domain filtering (show only relevant visualizations per domain)

**What Changes:**
- `src/app/visualizations/page.tsx` - Use registry instead of hardcoded array
- `src/app/navigate/page.tsx` - Use registry instead of hardcoded array
- Dynamic visualization list generation

**Impact:**
- Eliminates 1 more manual step
- Ensures consistency across pages
- Makes registry truly the single source of truth

---

## 📊 How This Relates to the Audit

### From the Audit: Current Status

**Readiness: 75%**
- ✅ Registry exists (88% ready)
- ⚠️ AI Integration (55% ready) - Functions defined but not wired
- ⚠️ Function Execution (30% ready) - Critical gap

### What This Implementation Fixes

| Audit Finding | This Implementation Fixes |
|---------------|---------------------------|
| **Function Execution Wiring Missing** | ✅ Phase 2 - Wires up execution handlers |
| **AI Functions Need Manual Updates** | ✅ Phase 1 - Auto-generates from registry |
| **Registry Not Integrated** | ✅ Phase 1 + 3 - Registry becomes source of truth |
| **Control State Not Synchronized** | ✅ Phase 2 - Connects AI calls to state |
| **Pages Use Hardcoded Arrays** | ✅ Phase 3 - Pages read from registry |

### Audit Recommendations Being Implemented

**From Audit Section 8: Recommendations**

1. ✅ **Wire AI Function Calls** (Immediate Action - Week 1)
   - **Our Phase 2** - Exactly this!

2. ✅ **Standardize Control Props** (Short Term)
   - Partially addressed - Registry provides standard interface
   - Full standardization would be separate work

3. ✅ **Create Control ID Mapper** (Immediate Action - Week 1)
   - **Our Phase 2** - Function execution handler includes mapping

4. ✅ **Add Missing Controls to Registry**
   - Not directly - but Phase 1 makes registry controls auto-available to AI

5. ✅ **Implement Bidirectional Sync** (Short Term)
   - **Our Phase 2** - Function execution enables this

**Estimated Effort from Audit: 23-34 days total**
**Our Implementation: 5-7 days for critical parts**

---

## 🎁 What You Get - Detailed Breakdown

### After Phase 1 (Auto-Generate AI Functions)

**Before:**
```typescript
// Manual - you have to type this:
export const AVAILABLE_VISUALIZATIONS = [
  { id: 'network', name: 'Network Graph', ... },
  { id: 'sankey', name: 'Flow Analysis', ... },
  // ... manually list each one
];
```

**After:**
```typescript
// Automatic - reads from registry:
export const AVAILABLE_VISUALIZATIONS = 
  getAllVisualizations()
    .filter(viz => viz.status === 'ready')
    .map(viz => ({
      id: viz.id,
      name: viz.name,
      description: viz.description,
      category: viz.category.toLowerCase(),
    }));
```

**What This Means:**
- ✅ Add visualization to registry → AI knows about it immediately
- ✅ 60+ visualizations in registry → AI can switch to any of them
- ✅ Controls in registry → AI can use them automatically
- ✅ No manual updates to AI functions file

**User Experience:**
- AI can say: "Switch to network-graph-v7" and it knows about it
- AI can say: "Use the radar chart" and it's available
- All registry visualizations automatically available to AI

---

### After Phase 2 (Wire Up Function Execution)

**Before:**
```
User: "Show me the radar chart"
AI: [Detects function call: switch_visualization('radar')]
UI: [Nothing happens - function not executed]
```

**After:**
```
User: "Show me the radar chart"
AI: [Detects function call: switch_visualization('radar')]
UI: [Actually switches to radar chart! ✅]
```

**What This Means:**
- ✅ AI can actually control the UI
- ✅ AI can switch visualizations
- ✅ AI can change controls (filters, views, etc.)
- ✅ AI can filter data
- ✅ AI can highlight entities
- ✅ True AI-driven generative UI

**User Experience:**
- User: "Show me TRL 6-7 technologies" → Visualization switches, filters apply
- User: "Highlight ZeroAvia" → Entity gets highlighted
- User: "Switch to funding breakdown view" → Treemap appears

**Technical Implementation:**
```typescript
// Function execution handler in page component
const handleAIFunctionCall = (functionName: string, args: any) => {
  switch (functionName) {
    case 'switch_visualization':
      setActiveViz(args.visualization);  // Actually switches!
      router.push(`?viz=${args.visualization}`);
      break;
    case 'set_control':
      // Map control ID to state setter
      if (args.controlId === 'radar.toggleTechnology') {
        setSelectedTechIds(args.value);  // Actually updates!
      }
      // ... map all controls
      break;
    case 'filter_data':
      // Apply filters
      setTrlRange(args.trlRange);
      // ... apply all filters
      break;
    case 'highlight_entities':
      // Highlight entities
      setHighlightedEntities(args.entityIds);
      break;
  }
};

// Wire to AIChatPanel
<AIChatPanel 
  onFunctionCall={handleAIFunctionCall}
  context={{
    activeViz: activeViz,
    controls: currentControlState,
    selectedEntities: selectedEntities,
  }}
/>
```

---

### After Phase 3 (Pages Read from Registry)

**Before:**
```typescript
// Manual array in page:
const visualizations = [
  { id: 'sankey', name: 'Flow Analysis', ... },
  { id: 'radar', name: 'Tech Maturity Radar', ... },
  // ... manually list each one
];
```

**After:**
```typescript
// Automatic from registry:
import { getAllVisualizations } from '@/lib/visualisations/registry';

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

**What This Means:**
- ✅ Add visualization to registry → Appears in UI automatically
- ✅ Status filtering (only 'ready' visualizations shown)
- ✅ Domain filtering (show navigate visualizations on navigate page)
- ✅ Consistent list across all pages
- ✅ No manual page updates

**User Experience:**
- All 60+ registry visualizations available in UI (if status='ready')
- New visualizations appear automatically when added to registry
- No need to update multiple page files

---

## 🔗 How These Options Relate to Each Other

### Dependency Chain

```
Phase 1 (Auto-Generate AI Functions)
  └─> Makes registry the source of truth
  └─> Enables Phase 2 to use registry info

Phase 2 (Wire Up Execution)
  └─> Makes AI actually functional
  └─> Works with Phase 1's auto-generated functions
  └─> Can work independently, but better with Phase 1

Phase 3 (Pages Read from Registry)
  └─> Completes the "registry as single source" pattern
  └─> Works independently
  └─> Nice to have, not blocking
```

### Independent vs. Dependent

**Can Do Independently:**
- Phase 2 can work with hardcoded AI functions (but Phase 1 makes it better)
- Phase 3 can be done anytime (nice to have)

**Should Do Together:**
- Phase 1 + Phase 2 = Complete AI integration
- Phase 1 + Phase 3 = Complete registry integration
- All 3 = Fully automated, registry-driven system

---

## 🤔 Other Things to Consider

### 1. Control State Mapping Complexity

**Issue:** Control IDs in registry might not match state setter names

**Example:**
- Registry control ID: `radar.toggleTechnology`
- State setter: `setSelectedTechIds`
- Need mapping layer

**Solution:** Create a control mapper in Phase 2:
```typescript
const CONTROL_MAP = {
  'radar.toggleTechnology': setSelectedTechIds,
  'bar.setView': setBarChartView,
  // ... map all controls
};
```

**Is this part of our implementation?** ✅ Yes, included in Phase 2

---

### 2. Bidirectional State Sync

**Issue:** AI needs to see current state to make good decisions

**Example:**
- AI should know: "User is currently viewing radar chart with 3 technologies selected"
- AI should know: "TRL filter is set to 4-7"

**Solution:** Send context to AI in Phase 2:
```typescript
<AIChatPanel 
  context={{
    activeViz: activeViz,
    controls: {
      selectedTechIds,
      trlRange,
      barChartView,
      // ... all current control values
    },
    selectedEntities: selectedEntities,
  }}
/>
```

**Is this part of our implementation?** ✅ Yes, included in Phase 2

---

### 3. Error Handling

**Issue:** What if AI tries to switch to non-existent visualization?

**Example:**
- AI calls: `switch_visualization('nonexistent-viz')`
- Should gracefully handle error

**Solution:** Add validation in Phase 2:
```typescript
case 'switch_visualization':
  const viz = getVisualization(args.visualization);
  if (!viz) {
    console.error('Visualization not found:', args.visualization);
    return;
  }
  setActiveViz(args.visualization);
  break;
```

**Is this part of our implementation?** ✅ Yes, included in Phase 2

---

### 4. Control Validation

**Issue:** What if AI tries invalid control values?

**Example:**
- AI calls: `set_control('radar.toggleTechnology', ['tech-1', 'tech-2', ...])`
- But max is 8 technologies

**Solution:** Add validation in Phase 2:
```typescript
case 'set_control':
  if (args.controlId === 'radar.toggleTechnology') {
    const maxTechs = 8;
    const techIds = Array.isArray(args.value) 
      ? args.value.slice(0, maxTechs)  // Limit to max
      : [args.value];
    setSelectedTechIds(techIds);
  }
  break;
```

**Is this part of our implementation?** ✅ Yes, included in Phase 2

---

### 5. Component Prop Standardization

**Issue:** Not all visualizations accept external control props

**Example:**
- RadarChartNavigate: ✅ Accepts `selectedTechIds` prop
- SomeOtherViz: ❌ Only uses internal state

**Solution:** This is separate work - would need to update each component

**Is this part of our implementation?** ❌ No - this is Phase 4 work (component migration)

**Should you do it?** Eventually yes, but not blocking for AI integration

---

### 6. Zustand Store Integration

**Issue:** Docs mention Zustand but it's not implemented

**Current:** Using React Context + component state

**Question:** Should we add Zustand?

**Answer:** 
- ❌ Not needed for current implementation
- ✅ Can add later if state gets complex
- ✅ Our implementation works with current Context/state
- ⚠️ Would be separate work (not part of these phases)

**Recommendation:** Skip for now, add later if needed

---

### 7. Legacy Component Cleanup

**Issue:** Multiple versions of same visualization (V1-V7, Demo versions)

**Question:** Should we clean up?

**Answer:**
- ⚠️ Nice to have, not blocking
- ✅ Registry already organizes them (different IDs)
- ⚠️ Would be separate cleanup work
- ✅ Can filter by status in registry

**Recommendation:** Leave for later cleanup phase

---

## 📋 What's Included vs. What's Separate

### Included in Our Implementation:

✅ **Phase 1:**
- Auto-generate `AVAILABLE_VISUALIZATIONS` from registry
- Auto-generate `AVAILABLE_CONTROLS` from registry
- Registry becomes single source of truth for AI

✅ **Phase 2:**
- Function execution handler
- Control ID to state setter mapping
- Context passing to AI (bidirectional sync)
- Error handling and validation
- Wire to AIChatPanel

✅ **Phase 3:**
- Pages read from registry
- Dynamic visualization lists
- Status/domain filtering

### NOT Included (Separate Work):

❌ **Component Prop Standardization:**
- Would need to update each visualization component
- Make them all accept external control props
- Estimated: 7-10 days
- **Separate phase** - not blocking

❌ **Zustand Store Implementation:**
- Would need to create stores
- Migrate from Context to Zustand
- Estimated: 3-5 days
- **Separate decision** - not needed now

❌ **Legacy Component Cleanup:**
- Archive old versions
- Remove duplicate components
- Estimated: 2-3 days
- **Separate cleanup** - not blocking

❌ **Full Component Migration:**
- Migrate all components to use `VisualizationComponentProps`
- Connect all controls to registry
- Estimated: 7-10 days
- **Separate phase** - can do incrementally

---

## 🎯 Complete Implementation Scope

### What You're Getting (5-7 days total):

**Phase 1: Auto-Generate AI Functions (2-3 hours)**
- ✅ Registry → AI Functions automatic
- ✅ All 60+ visualizations available to AI
- ✅ All controls available to AI
- ✅ No manual AI function updates

**Phase 2: Wire Up Function Execution (2-3 days)**
- ✅ AI can actually switch visualizations
- ✅ AI can actually change controls
- ✅ AI can actually filter data
- ✅ AI can actually highlight entities
- ✅ Bidirectional state sync
- ✅ Error handling and validation
- ✅ Control mapping layer

**Phase 3: Pages Read from Registry (1 day)**
- ✅ Pages auto-update from registry
- ✅ Dynamic visualization lists
- ✅ Status filtering
- ✅ Domain filtering

**Total Result:**
- ✅ Registry is single source of truth
- ✅ AI fully functional
- ✅ Everything auto-updates
- ✅ Ready for generative UI

### What's NOT Included (Future Work):

**Component Standardization (7-10 days)**
- Make all components accept external props
- Standardize prop interfaces
- **When:** After core AI works

**Zustand Implementation (3-5 days)**
- Add Zustand stores
- Migrate from Context
- **When:** If state gets too complex

**Legacy Cleanup (2-3 days)**
- Archive old versions
- Remove duplicates
- **When:** After everything works

---

## 🚀 Implementation Order

### Recommended Sequence:

1. **Phase 1: Auto-Generate AI Functions** (2-3 hours)
   - Quick win, big impact
   - Makes registry the source of truth
   - Foundation for everything else

2. **Phase 2: Wire Up Function Execution** (2-3 days)
   - Makes AI actually work
   - Critical for generative UI
   - Depends on Phase 1 (uses registry info)

3. **Phase 3: Pages Read from Registry** (1 day)
   - Completes automation
   - Nice to have
   - Independent, can be done anytime

**Total Time: 5-7 days**

---

## 💡 Smarter Implementation Approach

### Option A: Full Implementation (Recommended)

**Do all 3 phases in sequence:**
- Phase 1 → Phase 2 → Phase 3
- Complete automation
- Registry fully integrated
- Best long-term solution

**Time:** 5-7 days  
**Result:** Fully automated, AI-functional system

### Option B: Minimal Viable (Fastest)

**Do Phase 1 + Phase 2 only:**
- Skip Phase 3 (pages can stay manual for now)
- AI fully functional
- Registry integrated with AI

**Time:** 3-4 days  
**Result:** AI works, pages still manual (acceptable)

### Option C: Incremental

**Phase 1 now, others later:**
- Get quick win first
- Test that it works
- Add phases incrementally

**Time:** 2-3 hours for Phase 1  
**Result:** Registry integrated with AI, execution can come later

---

## 🎁 Final Summary: What You're Getting

### Immediate Benefits:

1. **Add Visualization → AI Knows Automatically**
   - No manual AI function updates
   - No manual control updates
   - Everything stays in sync

2. **AI Can Actually Control UI**
   - "Show radar chart" → Actually switches
   - "Filter by TRL 4-7" → Actually filters
   - "Highlight ZeroAvia" → Actually highlights

3. **Single Source of Truth**
   - Registry is the boss
   - Everything reads from it
   - No duplicate lists

### Long-Term Benefits:

1. **Easy to Add Visualizations**
   - One place to add (registry)
   - Everything else auto-updates

2. **Type-Safe and Automatic**
   - No manual errors
   - Always in sync
   - Less maintenance

3. **Ready for Generative UI**
   - AI can control everything
   - Bidirectional communication
   - Foundation for advanced features

---

## ✅ Ready to Proceed?

**I'll implement:**
1. ✅ Phase 1: Auto-generate AI functions from registry
2. ✅ Phase 2: Wire up function execution (make AI work)
3. ✅ Phase 3: Make pages read from registry

**You'll get:**
- ✅ Fully functional AI control
- ✅ Registry as single source of truth
- ✅ Automatic updates
- ✅ Ready for generative UI

**Let's start!** 🚀

