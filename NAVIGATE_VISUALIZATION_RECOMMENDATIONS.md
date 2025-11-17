# NAVIGATE Visualization Recommendations

## Overview
This document provides recommendations for visualizing roadmap data, timelines, and complex policy/technology information in the NAVIGATE platform.

## Roadmap & Timeline Visualizations

### Current Options Analysis

#### 1. **Nivo Charts (Current Stack)**
**Pros:**
- Already integrated in the codebase
- Well-documented and maintained
- Good for standard chart types
- Responsive and interactive

**Cons:**
- Limited roadmap/timeline specific components
- Would require custom development for complex roadmaps
- Less suitable for multi-layered policy timelines

**Best For:**
- Standard data visualizations (bar, line, area charts)
- Technology progression over time (Bump Chart - already implemented)
- Funding trends (Stream Graph - already implemented)

#### 2. **Custom Infographics**
**Pros:**
- Complete design control
- Can show complex relationships
- Brand-consistent styling
- Can combine multiple visualization types

**Cons:**
- Requires design resources
- Less interactive
- Harder to update with data changes
- Not responsive by default

**Best For:**
- Static policy roadmaps
- High-level strategic overviews
- Print/export materials
- Executive summaries

#### 3. **Timeline Libraries**
**Recommended Libraries:**

##### A. **React Timeline (vis-timeline)**
```typescript
import { Timeline } from 'vis-timeline';
```
**Pros:**
- Purpose-built for timelines
- Interactive zoom/pan
- Multiple item types
- Grouping capabilities
- Good for policy milestones

**Best For:**
- Policy timeline visualization
- Technology development milestones
- Project roadmaps with phases

##### B. **React-Chrono**
```typescript
import { Chrono } from 'react-chrono';
```
**Pros:
- Simple API
- Multiple layout modes (vertical, horizontal)
- Card-based timeline items
- Good for narrative timelines

**Best For:**
- Story-based technology development
- Policy evolution narratives
- Simple milestone tracking

##### C. **Gantt Charts (dhtmlx-gantt or similar)**
**Pros:**
- Standard project management visualization
- Shows dependencies
- Duration and overlap visualization

**Best For:**
- Project timelines with dependencies
- Technology development phases
- Infrastructure rollout plans

#### 4. **D3.js Custom Visualizations**
**Pros:**
- Maximum flexibility
- Can create any visualization
- Full control over interactions

**Cons:**
- Significant development time
- Steeper learning curve
- More maintenance burden

**Best For:**
- Unique visualization requirements
- Complex multi-dimensional data
- Custom interaction patterns

## Recommendations by Use Case

### 1. **Decarbonisation Roadmap (HIA Report)**
**Recommended:** React Timeline (vis-timeline) or Custom D3.js

**Why:**
- Shows multiple parallel tracks (Technology, Infrastructure, Policy, Skills)
- Interactive zoom to see detail
- Can link to related entities
- Shows dependencies between milestones

**Implementation:**
```typescript
// Timeline showing:
// - Short-term (2024-2026)
// - Medium-term (2027-2030)
// - Long-term (2031-2050)
// With tracks for: Technology, Infrastructure, Policy, Skills
```

### 2. **Technology Development Timeline**
**Recommended:** Enhanced Bump Chart (Nivo) + Timeline overlay

**Why:**
- Already have Bump Chart for TRL progression
- Can add timeline markers for key milestones
- Shows both progression and specific events

**Alternative:** React-Chrono for narrative view

### 3. **Policy Framework Diagram**
**Recommended:** Custom SVG/React Flow diagram

**Why:**
- Shows relationships between policies
- Can show government department connections
- Interactive exploration of policy areas

**Libraries:**
- React Flow (for node-based diagrams)
- Mermaid (for declarative diagrams)
- Custom SVG with React

### 4. **Infrastructure Roadmap**
**Recommended:** Gantt Chart or Timeline

**Why:**
- Shows project phases and dependencies
- Can show parallel development tracks
- Clear visualization of critical path

### 5. **Stakeholder Ecosystem Map**
**Recommended:** Enhanced Network Graph (already implemented)

**Why:**
- Already have Network Graph
- Can add timeline filtering
- Shows relationships and evolution

### 6. **Market Size & Growth Projections**
**Recommended:** Nivo Line/Area Chart + Projections

**Why:**
- Standard time series visualization
- Nivo handles this well
- Can overlay targets/goals

## Hybrid Approach Recommendation

### Primary Strategy: **Nivo + Timeline Library**

1. **Keep Nivo for:**
   - Standard charts (bar, line, area, stream)
   - Data-driven visualizations
   - Interactive filtering

2. **Add Timeline Library for:**
   - Policy roadmaps
   - Technology milestones
   - Project timelines
   - Multi-track roadmaps

3. **Custom Components for:**
   - Policy framework diagrams
   - Ecosystem maps
   - Strategic overviews

### Recommended Library: **vis-timeline (React Timeline)**

**Why:**
- Most flexible for roadmap needs
- Good documentation
- Active maintenance
- Handles complex timelines well

**Installation:**
```bash
npm install vis-timeline vis-data
```

**Basic Usage:**
```typescript
import { Timeline } from 'vis-timeline';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

// Timeline with multiple tracks
const items = [
  { id: 1, content: 'ZEROe Launch', start: '2030-01-01', group: 'technology' },
  { id: 2, content: 'First Commercial Flight', start: '2035-01-01', group: 'operations' },
  // ...
];

const groups = [
  { id: 'technology', content: 'Technology' },
  { id: 'infrastructure', content: 'Infrastructure' },
  { id: 'policy', content: 'Policy' },
  { id: 'skills', content: 'Skills' },
];
```

## Implementation Plan

### Phase 1: Timeline Component (Week 1-2)
1. Install vis-timeline
2. Create `TimelineNavigate.tsx` component
3. Integrate with NAVIGATE data
4. Add to visualization selector

### Phase 2: Roadmap Data Extraction (Week 2)
1. Extract roadmap data from HIA report
2. Structure as timeline items
3. Link to stakeholders/technologies
4. Add to knowledge base

### Phase 3: Enhanced Visualizations (Week 3-4)
1. Add timeline markers to existing charts
2. Create policy framework diagram
3. Enhance network graph with timeline filtering

### Phase 4: Integration (Week 4)
1. Add timeline to insights panel
2. Link timeline events to entities
3. Cross-visualization interactions

## Data Structure for Roadmaps

```typescript
interface RoadmapItem {
  id: string;
  content: string;
  start: Date;
  end?: Date;
  group: 'technology' | 'infrastructure' | 'policy' | 'skills';
  type: 'point' | 'range' | 'background';
  className?: string;
  title?: string;
  description?: string;
  relatedEntities?: string[]; // IDs of related stakeholders/technologies
  source?: string;
  url?: string;
}

interface RoadmapGroup {
  id: string;
  content: string;
  className?: string;
  order?: number;
}
```

## Example: HIA Decarbonisation Roadmap

```typescript
const hiaRoadmap: RoadmapItem[] = [
  // Short-term (2024-2026)
  {
    id: 'caa-funding-2025',
    content: 'CAA Funding & Capacity',
    start: new Date('2025-01-01'),
    group: 'policy',
    relatedEntities: ['caa', 'government'],
    source: 'HIA Report 2024'
  },
  {
    id: 'test-hubs-2027',
    content: 'Two Medium-Scale Test Hubs',
    start: new Date('2027-01-01'),
    group: 'infrastructure',
    relatedEntities: ['rolls-royce', 'airbus'],
    source: 'HIA Report 2024'
  },
  // ... more items
];
```

## Visual Design Considerations

### Color Coding
- **Technology:** Blue (#006E51 variants)
- **Infrastructure:** Green
- **Policy:** Orange/Amber
- **Skills:** Purple

### Interaction
- Click timeline item → Show related entities
- Hover → Show description and source
- Zoom → See detail at different time scales
- Filter → By group, entity, or time period

### Responsive Design
- Mobile: Vertical timeline
- Tablet: Horizontal with scroll
- Desktop: Full interactive timeline

## Alternative: Static Infographics

If interactive timelines prove too complex, consider:

1. **Pre-rendered SVG Infographics**
   - Designed in Figma/Illustrator
   - Exported as SVG
   - Embedded in React
   - Can still be interactive with React overlays

2. **PDF Export**
   - Generate roadmap as PDF
   - Include in knowledge base
   - Link from insights panel

3. **Image Assets**
   - High-quality infographics
   - Stored in public folder
   - Referenced in knowledge base

## Recommendation Summary

**Primary:** Use **vis-timeline (React Timeline)** for roadmap visualizations
- Flexible and powerful
- Good for complex multi-track timelines
- Integrates well with React

**Secondary:** Keep **Nivo** for standard data visualizations
- Already integrated
- Good for time series data
- Maintains consistency

**Tertiary:** **Custom SVG/React Flow** for policy diagrams
- Maximum control
- Brand consistency
- Can be interactive

**Avoid:** Pure static infographics (unless for export/print)
- Less interactive
- Harder to maintain
- Doesn't leverage data

## Next Steps

1. ✅ Review recommendations
2. ⏳ Install vis-timeline library
3. ⏳ Create TimelineNavigate component
4. ⏳ Extract roadmap data from HIA report
5. ⏳ Integrate with visualization selector
6. ⏳ Add cross-visualization linking

