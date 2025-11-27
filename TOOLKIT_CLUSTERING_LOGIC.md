# Toolkit Clustering Logic - Entity Type Grouping

## Overview

The Toolkit uses a **dynamic centroid force** approach to cluster nodes by entity type. This creates distinct visual clusters while still allowing nodes to move naturally within their groups.

## Key Concepts

### 1. **Initial Positioning (Grid Layout)**
Nodes are initially positioned in a grid within their group's area, arranged in a circle around the center.

### 2. **Group Centroid Force**
A custom D3 force continuously calculates each group's centroid (average position) and pulls nodes toward it.

### 3. **Weakened Inter-Group Links**
Links between different groups are weakened, allowing groups to separate naturally.

### 4. **Collision Detection**
Nodes are prevented from overlapping using collision detection.

---

## Code Implementation

### Step 1: Group Nodes by Entity Type

```typescript
// Determine grouping key
const key = groupingMode === 'entity_type' ? node.group : node.type;

// Group nodes
const groups = new Map<string, typeof nodes>();
nodes.forEach((node) => {
  if (!groups.has(node.key)) groups.set(node.key, []);
  groups.get(node.key)!.push(node);
});
```

### Step 2: Initial Grid Positioning

```typescript
const groupKeys = Array.from(groups.keys());
const radius = 300; // Distance from center

groupKeys.forEach((key, index) => {
  const groupNodes = groups.get(key)!;
  
  // Calculate group center position (arranged in circle)
  const angle = (2 * Math.PI * index) / Math.max(groupKeys.length, 1);
  const centerX_offset = Math.cos(angle) * radius;
  const centerY_offset = Math.sin(angle) * radius;

  // Position nodes in grid within group area
  groupNodes.forEach((node, i) => {
    const cols = Math.max(1, Math.ceil(Math.sqrt(groupNodes.length)));
    const row = Math.floor(i / cols);
    const col = i % cols;
    
    // Grid spacing: 80px between nodes
    node.x = centerX + centerX_offset + (col - cols / 2) * 80;
    node.y = centerY + centerY_offset + (row - cols / 2) * 80;
  });
});
```

### Step 3: Dynamic Group Centroid Force

This is the **core clustering logic** - it runs on every simulation tick:

```typescript
const groupCentroidForce = () => {
  if (groupingMode === 'random') return;
  
  const force = (alpha: number) => {
    // 1. Calculate centroids for each group
    const groups = new Map<string, { nodes: GraphNode[]; cx: number; cy: number }>();
    
    nodes.forEach((node) => {
      const key = groupingMode === 'entity_type' ? node.group : node.type;
      if (!groups.has(key)) {
        groups.set(key, { nodes: [], cx: 0, cy: 0 });
      }
      groups.get(key)!.nodes.push(node);
    });

    // 2. Calculate centroid (average position) for each group
    groups.forEach((group) => {
      if (group.nodes.length === 0) return;
      const cx = d3.mean(group.nodes, (n) => n.x!) ?? 0;
      const cy = d3.mean(group.nodes, (n) => n.y!) ?? 0;
      group.cx = cx;
      group.cy = cy;
    });

    // 3. Pull nodes toward their group centroid
    const groupStrength = 0.2; // Adjust this to control clustering strength
    nodes.forEach((node) => {
      const key = groupingMode === 'entity_type' ? node.group : node.type;
      const group = groups.get(key);
      if (!group || group.nodes.length <= 1) return;
      
      // Calculate distance from node to centroid
      const dx = group.cx - (node.x ?? 0);
      const dy = group.cy - (node.y ?? 0);
      const distance = Math.hypot(dx, dy);
      
      if (distance > 0) {
        // Apply force proportional to distance from centroid
        // Force gets weaker as simulation cools down (alpha decreases)
        const force = distance * groupStrength * alpha;
        node.vx = (node.vx ?? 0) + (dx / distance) * force;
        node.vy = (node.vy ?? 0) + (dy / distance) * force;
      }
    });
  };
  
  return force;
};
```

### Step 4: Apply Force in Simulation Tick

```typescript
const simulation = d3
  .forceSimulation<GraphNode>(nodes)
  .force('link', d3.forceLink<GraphNode, GraphLink>(links)
    .id((d) => d.id)
    .distance(edgeLength)
    .strength((d) => {
      // Weaken inter-group links
      const sourceNode = typeof d.source === 'object' ? d.source : nodes.find((n) => n.id === sourceId);
      const targetNode = typeof d.target === 'object' ? d.target : nodes.find((n) => n.id === targetId);
      
      if (groupingMode === 'entity_type' && sourceNode && targetNode) {
        // Same group: strong link (0.8)
        // Different groups: weak link (0.15)
        return sourceNode.group === targetNode.group ? 0.8 : 0.15;
      }
      return 0.5;
    })
  )
  .force('charge', d3.forceManyBody().strength(-forceRepulsion))
  .force('center', d3.forceCenter(centerX, centerY))
  .force('collision', d3.forceCollide().radius((d) => (d.symbolSize || 20) + 5));

// Apply group centroid force in tick handler
const applyGroupCentroidForce = groupCentroidForce();

simulation.on('tick', () => {
  // Apply group centroid force on each tick
  if (applyGroupCentroidForce) {
    applyGroupCentroidForce(simulation.alpha());
  }
  
  // Update node/link positions
  node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
  link.attr('x1', (d) => (typeof d.source === 'object' ? d.source.x! : 0))
      .attr('y1', (d) => (typeof d.source === 'object' ? d.source.y! : 0))
      .attr('x2', (d) => (typeof d.target === 'object' ? d.target.x! : 0))
      .attr('y2', (d) => (typeof d.target === 'object' ? d.target.y! : 0));
});
```

---

## Key Parameters

| Parameter | Value | Effect |
|-----------|-------|--------|
| `radius` | 300 | Distance of group centers from graph center |
| `groupStrength` | 0.2 | How strongly nodes are pulled to centroid (0-1) |
| Grid spacing | 80px | Distance between nodes in initial grid |
| Inter-group link strength | 0.15 | Weakens links between different groups |
| Intra-group link strength | 0.8 | Strengthens links within same group |

---

## How It Works

1. **Initial Layout**: Nodes are positioned in a grid within their group's circular area
2. **Centroid Calculation**: On each tick, calculate the average position (centroid) of all nodes in each group
3. **Force Application**: Pull each node toward its group's centroid with strength proportional to:
   - Distance from centroid (further = stronger pull)
   - Simulation alpha (weaker as simulation cools down)
   - `groupStrength` constant (0.2 = moderate clustering)
4. **Link Weakening**: Links between different groups are weakened (0.15 vs 0.8), allowing groups to separate
5. **Collision**: Nodes can't overlap, maintaining spacing within clusters

---

## Adapting for Unified Schema

To adapt this for unified `BaseEntity[]` data:

```typescript
// Instead of node.group or node.type, use:
const key = entity.entityType; // 'challenge', 'stakeholder', 'technology', etc.

// Or for domain clustering:
const key = entity.domain; // 'atlas', 'navigate', 'cpc-internal'

// Or for custom grouping:
const key = entity.metadata?.category || entity.entityType;
```

---

## Full Code Reference

**File**: `src/components/toolkit/D3NetworkGraphView.tsx`

**Key Sections**:
- Lines 230-269: Initial grid positioning
- Lines 278-325: Group centroid force implementation
- Lines 327-361: Force simulation setup
- Lines 349-356: Link strength weakening for inter-group links
- Lines 513-517: Force application in tick handler

---

## Visual Result

- **Distinct clusters**: Each entity type forms a visible cluster/island
- **Natural movement**: Nodes can still move within their cluster
- **Clear separation**: Groups don't overlap due to weakened inter-group links
- **Stable layout**: Clusters maintain their positions while allowing local adjustments

---

## Tips for Adaptation

1. **Adjust `groupStrength`**: 
   - Higher (0.3-0.5) = tighter clusters, less movement
   - Lower (0.1-0.15) = looser clusters, more movement

2. **Adjust `radius`**:
   - Larger = more separation between groups
   - Smaller = groups closer together

3. **Link strength ratio**:
   - Current: 0.8 (same group) vs 0.15 (different groups) = 5.3x difference
   - Increase ratio for more separation
   - Decrease ratio for more mixing

4. **Grid spacing**:
   - 80px works well for nodes of size 20-35
   - Adjust based on your node sizes

