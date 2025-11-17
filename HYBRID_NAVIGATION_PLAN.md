# Hybrid Navigation Implementation Plan

## 🎯 Goal
Create a single `/navigate` page that dynamically shows:
- **All visualizations** by default
- **Filtered views** based on URL parameters (network, funding, technology)

## 📋 Implementation Strategy

### Approach: URL Search Parameters
Use Next.js `useSearchParams` to filter visualizations dynamically.

**URL Structure:**
- `/navigate` → Shows all 13 visualizations
- `/navigate?view=network` → Shows only Network Graph + Circle Packing
- `/navigate?view=funding` → Shows only Sankey + Treemap + Stream Graph
- `/navigate?view=technology` → Shows only Radar + Bump + Parallel + Swarm
- `/navigate?view=dashboard` → Shows Bar Chart + metrics overview

### Visualization Categories

```typescript
const visualizationCategories = {
  network: ['network', 'circle'],
  funding: ['sankey', 'treemap', 'stream'],
  technology: ['radar', 'bump', 'parallel', 'swarm'],
  dashboard: ['bar'],
  all: [] // Empty = show all
}
```

### Benefits
- ✅ Single page component (less duplication)
- ✅ URL-based filtering (shareable links)
- ✅ Dynamic updates (no page reload needed)
- ✅ Can add breadcrumbs/navigation easily
- ✅ Works with browser back/forward

---

## 🚀 Implementation Steps

1. **Create `/navigate/page.tsx`**
   - Copy structure from `/visualizations/page.tsx`
   - Add URL parameter reading
   - Add category filtering logic
   - Add navigation cards/buttons

2. **Add Category Filtering**
   - Filter `visualizations` array based on `view` param
   - Update visualization selector to show only filtered options
   - Auto-select first visualization if only one category

3. **Add Navigation UI**
   - Category selector buttons (Network, Funding, Technology, All)
   - Breadcrumb navigation
   - Quick stats overview

4. **Update Links**
   - Update home page to link to `/navigate`
   - Add navigation cards that link to filtered views

---

## 💡 Alternative: Route Segments (Optional)

Could also use route segments:
- `/navigate/network` → Network view
- `/navigate/funding` → Funding view
- `/navigate/technology` → Technology view

**Pros:** Cleaner URLs, better SEO
**Cons:** Requires more route setup

**Recommendation:** Start with search params (simpler), can migrate to route segments later if needed.

