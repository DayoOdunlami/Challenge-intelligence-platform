# React Flow Features Guide for NAVIGATE

## Overview
This document outlines useful React Flow features and interactions that enhance the NAVIGATE platform's stakeholder network visualization.

---

## ✅ Implemented Features (Enhanced Version)

### 1. **Node Selection & Multi-Select**
- **Click** a node to select it
- **Ctrl/Cmd + Click** to multi-select multiple nodes
- **Ctrl/Cmd + A** to select all nodes
- Selected nodes show toolbar with quick actions
- Visual feedback: red border, scale up, shadow

### 2. **Search & Filter**
- **Search Bar**: Type to filter nodes by name or category
- **Category Filter**: Dropdown to show only specific categories (Government, Academia, Industry, Intermediary)
- Real-time filtering with opacity changes
- Clear search button

### 3. **Node Toolbar**
- Appears when a node is selected
- Quick actions: "View" and "Connections"
- Positioned above selected node
- Can be extended with more actions

### 4. **Keyboard Shortcuts**
- `Delete` or `Backspace` - Delete selected nodes/edges
- `Ctrl/Cmd + A` - Select all nodes
- `Ctrl/Cmd + F` - Fit view (zoom to show all)
- `Ctrl/Cmd + Click` - Multi-select

### 5. **Export/Import Layout**
- **Export**: Download current layout as JSON
- **Import**: Load a previously saved layout
- Useful for sharing configurations or restoring saved states

### 6. **Statistics Panel**
- Shows total stakeholders count
- Breakdown by category with color coding
- Connection count
- Toggle to show/hide

### 7. **Enhanced MiniMap**
- Interactive minimap in bottom-right
- Click to navigate
- Pan and zoom support
- Color-coded nodes by category

### 8. **Edge Labels**
- Relationship type labels on edges
- Custom edge styling
- Animated arrows

### 9. **Connection Count Display**
- Shows number of connections per node
- Helps identify highly connected stakeholders

### 10. **Context Menu** (Ready for Implementation)
- Right-click on nodes for context menu
- Currently logs to console, can be extended with actions

---

## 🚀 Additional Features to Consider

### 1. **Auto-Layout Algorithms**
```typescript
// Install: npm install @dagrejs/dagre
import dagre from '@dagrejs/dagre';

const getLayoutedElements = (nodes, edges) => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 });
  // ... layout logic
};
```

**Use Cases:**
- **Hierarchical Layout**: Government → Intermediaries → Industry
- **Circular Layout**: Group by category in circles
- **Force-Directed**: Similar to D3 force simulation
- **Grid Layout**: Organized grid arrangement

**When to Use:**
- Initial layout for new data
- "Auto-arrange" button
- Different layout presets

---

### 2. **Node Grouping / Parent Nodes**
```typescript
// Group nodes by category
const groupNodes = (nodes) => {
  return nodes.map(node => ({
    ...node,
    parentNode: `group-${node.data.category}`,
  }));
};
```

**Use Cases:**
- Collapsible groups by category
- Visual hierarchy
- "Expand All / Collapse All" functionality

**Benefits:**
- Cleaner view for large networks
- Better organization
- Easier navigation

---

### 3. **Custom Edge Types**
```typescript
const edgeTypes = {
  funding: FundingEdge,    // Thick, animated
  partnership: PartnershipEdge,  // Dashed
  research: ResearchEdge,   // Dotted
};
```

**Use Cases:**
- Different styles for different relationship types
- Color coding by relationship strength
- Animated flows for funding direction

---

### 4. **Node Resizing**
```typescript
<ReactFlow
  nodesResizable={true}
  nodeResizeControlStyle={{ background: '#006E51' }}
/>
```

**Use Cases:**
- Larger nodes for important stakeholders
- Size by funding amount or influence
- User-adjustable node sizes

---

### 5. **Panel Component**
```typescript
<Panel position="top-left">
  <Card>
    <CardHeader>Selected Node Info</CardHeader>
    <CardContent>
      {/* Node details */}
    </CardContent>
  </Card>
</Panel>
```

**Use Cases:**
- Info panel for selected node
- Search results panel
- Filter controls overlay
- Legend/key

---

### 6. **Viewport Sync** (Multiple Views)
```typescript
// Sync two ReactFlow instances
const syncViewports = (flow1, flow2) => {
  // Pan/zoom one, update the other
};
```

**Use Cases:**
- Side-by-side comparison
- Different views of same data
- Before/after scenarios

---

### 7. **Background Patterns**
```typescript
<Background
  variant={BackgroundVariant.Dots}
  gap={20}
  size={1}
  color="#e5e7eb"
/>
```

**Options:**
- Dots (current)
- Lines
- Cross
- Custom SVG patterns

---

### 8. **Edge Toolbar**
```typescript
<EdgeToolbar>
  <Button>Edit</Button>
  <Button>Delete</Button>
</EdgeToolbar>
```

**Use Cases:**
- Edit relationship properties
- Delete connections
- Add notes to relationships

---

### 9. **Node Resize Control**
```typescript
<ReactFlow
  nodesResizable={true}
  nodeResizeControlStyle={{ background: '#006E51' }}
/>
```

**Use Cases:**
- User-adjustable node sizes
- Visual importance indication
- Better space utilization

---

### 10. **Custom Controls**
```typescript
<Controls>
  <Button onClick={fitView}>Fit</Button>
  <Button onClick={zoomIn}>Zoom In</Button>
  <Button onClick={zoomOut}>Zoom Out</Button>
  <Button onClick={resetLayout}>Reset</Button>
</Controls>
```

**Use Cases:**
- Custom control buttons
- Layout presets
- Export/import buttons
- Filter toggles

---

### 11. **Snap to Grid**
```typescript
<ReactFlow
  snapToGrid={true}
  snapGrid={[20, 20]}
/>
```

**Use Cases:**
- Aligned layouts
- Professional appearance
- Easier manual arrangement

---

### 12. **Connection Line Styles**
```typescript
const edgeTypes = {
  smoothstep: SmoothStepEdge,  // Current
  step: StepEdge,               // Right angles
  bezier: BezierEdge,           // Curved
  straight: StraightEdge,       // Direct line
};
```

**Use Cases:**
- Different visual styles
- Better for different relationship types
- Aesthetic preferences

---

### 13. **Node Drag Constraints**
```typescript
<ReactFlow
  nodesDraggable={true}
  nodeExtent={[[0, 0], [1000, 1000]]}  // Limit drag area
/>
```

**Use Cases:**
- Keep nodes within bounds
- Prevent nodes from going off-screen
- Maintain layout structure

---

### 14. **Edge Updatable**
```typescript
<ReactFlow
  edgesUpdatable={true}
  onEdgeUpdate={(oldEdge, newConnection) => {
    // Update edge source/target
  }}
/>
```

**Use Cases:**
- Reconnect relationships
- Move connections between nodes
- Dynamic relationship updates

---

### 15. **Pro Features** (Paid Tier)
- **Collaboration**: Real-time multi-user editing
- **Comments**: Add comments to nodes/edges
- **Version History**: Track changes over time
- **Advanced Layouts**: More layout algorithms

---

## 🎯 Recommended Next Steps

### High Priority
1. ✅ **Search & Filter** - Implemented
2. ✅ **Keyboard Shortcuts** - Implemented
3. ✅ **Export/Import** - Implemented
4. ⏳ **Auto-Layout** - Add dagre/elkjs for automatic positioning
5. ⏳ **Node Grouping** - Collapsible category groups

### Medium Priority
6. ⏳ **Custom Edge Types** - Different styles for relationship types
7. ⏳ **Info Panel** - Selected node details overlay
8. ⏳ **Context Menu** - Right-click actions (partially implemented)
9. ⏳ **Node Resizing** - Size by importance/funding

### Low Priority
10. ⏳ **Snap to Grid** - Aligned layouts
11. ⏳ **Background Patterns** - Custom patterns
12. ⏳ **Edge Toolbar** - Edit relationships

---

## 📚 Resources

- **React Flow Docs**: https://reactflow.dev/
- **Examples**: https://reactflow.dev/examples
- **API Reference**: https://reactflow.dev/api-reference/react-flow
- **GitHub**: https://github.com/xyflow/xyflow

---

## 💡 Tips

1. **Performance**: For 200+ nodes, consider virtualization or grouping
2. **Mobile**: React Flow has good touch support, but test on devices
3. **Accessibility**: Add ARIA labels and keyboard navigation
4. **State Management**: Use React Flow's built-in state or Zustand for complex state
5. **Customization**: React Flow is highly customizable - don't be afraid to extend it

---

## 🔧 Implementation Examples

### Auto-Layout with Dagre
```typescript
import dagre from '@dagrejs/dagre';

const getLayoutedElements = (nodes, edges) => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 100, height: 50 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const { x, y } = g.node(node.id);
      return { ...node, position: { x, y } };
    }),
    edges,
  };
};
```

### Node Grouping
```typescript
const groupNodes = (nodes) => {
  const groups = ['government', 'academia', 'industry', 'intermediary'];
  
  const groupNodes = groups.map((group, idx) => ({
    id: `group-${group}`,
    type: 'group',
    position: { x: 0, y: idx * 200 },
    data: { label: group },
    style: { width: 800, height: 150 },
  }));

  const groupedNodes = nodes.map((node) => ({
    ...node,
    parentNode: `group-${node.data.category}`,
    extent: 'parent',
  }));

  return [...groupNodes, ...groupedNodes];
};
```

---

## 🎨 Styling Tips

- Use CSS variables for theming
- Match NAVIGATE color scheme (`#006E51`, `#50C878`, `#F5A623`)
- Consistent spacing and typography
- Responsive design for mobile/tablet

---

This guide will be updated as new features are implemented or discovered.

