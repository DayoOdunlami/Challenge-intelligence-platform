# Network Graph 3D Component

## Overview

The `NetworkGraphNavigate3D` component is a 3D version of the existing `NetworkGraphNavigate` component, built using `react-force-graph-3d` and Three.js. It provides all the same features and controls as the 2D version, but with an immersive 3D visualization experience.

## Features

### ✅ All 2D Features Preserved

- **Relationship Filtering**: Filter by relationship types (funds, collaborates_with, researches, advances, participates_in)
- **Node Spacing Control**: Adjustable spacing multiplier (0.5x to 4.0x)
- **Hide Isolated Nodes**: Option to hide nodes with no connections
- **Node Interactions**: Click to select, hover for tooltips
- **Custom Node Rendering**: Color-coded by entity type with size based on value
- **Custom Link Rendering**: Color-coded by relationship type with opacity based on connection strength
- **Animated Particles**: Directional particles on active links (using built-in `linkDirectionalParticles`)
- **Node Highlighting**: Selected and hovered nodes are highlighted with borders
- **Dimming Effect**: Non-connected nodes are dimmed when a node is clicked

### 🆕 3D-Specific Features

- **3D Navigation**: 
  - Left-click + drag: Rotate camera
  - Right-click + drag: Pan camera
  - Scroll: Zoom in/out
  - Click node: Focus camera on node
- **Trackball Controls**: Smooth 3D rotation and navigation
- **3D Node Rendering**: Spherical nodes with Three.js materials
- **3D Link Rendering**: Cylindrical links connecting nodes in 3D space
- **HTML Labels**: Node labels appear as HTML overlays (shown on hover/select)

## Installation

The required packages are already installed:
- `react-force-graph-3d`
- `three`
- `@types/three`

## Usage

```tsx
import { NetworkGraphNavigate3D } from '@/components/visualizations/NetworkGraphNavigate3D';

function MyComponent() {
  return (
    <NetworkGraphNavigate3D
      stakeholders={stakeholders}
      technologies={technologies}
      projects={projects}
      relationships={relationships}
      selectedEntityId={selectedId}
      onEntitySelect={handleSelect}
      nodeSpacing={1.0}
      showSpacingControl={true}
    />
  );
}
```

## Props

All props are identical to `NetworkGraphNavigate`:

```typescript
interface NetworkGraphNavigate3DProps {
  stakeholders: Stakeholder[];
  technologies: Technology[];
  projects: Project[];
  relationships: Relationship[];
  selectedEntityId?: string | null;
  onEntitySelect?: (entityId: string) => void;
  className?: string;
  showControls?: boolean;
  relationshipFilters?: RelationshipFilterState;
  onRelationshipFiltersChange?: (filters: RelationshipFilterState) => void;
  hideIsolatedNodes?: boolean;
  onHideIsolatedNodesChange?: (value: boolean) => void;
  nodeSpacing?: number;
  onNodeSpacingChange?: (value: number) => void;
  showSpacingControl?: boolean;
  onShowSpacingControlChange?: (value: boolean) => void;
}
```

## Differences from 2D Version

1. **Rendering**: Uses Three.js objects instead of canvas 2D rendering
2. **Camera Controls**: 3D trackball controls instead of 2D pan/zoom
3. **Labels**: HTML overlays instead of canvas text (better performance)
4. **Particles**: Uses built-in `linkDirectionalParticles` instead of custom canvas animation
5. **Performance**: Better performance for large graphs due to WebGL acceleration

## Controls

The component includes the same control panel as the 2D version:
- Relationship type checkboxes
- Hide isolated nodes toggle
- Spacing control slider with presets
- Node/link count display

## 3D Navigation Help

A help panel is displayed in the bottom-right corner showing:
- Left-click + drag: Rotate
- Right-click + drag: Pan
- Scroll: Zoom
- Click node: Focus

## Technical Details

### Node Rendering
- Uses `THREE.SphereGeometry` with `THREE.MeshStandardMaterial`
- Size based on node `value` property
- Color from node `color` property
- Emissive glow for selected/hovered nodes
- Outline border for selected/hovered nodes

### Link Rendering
- Uses `THREE.CylinderGeometry` oriented between nodes
- Color based on relationship type
- Opacity based on connection state (active/faint)
- Width based on link similarity/strength

### Force Simulation
- Uses `d3-force-3d` (included with `react-force-graph-3d`)
- Link distance: `480 + (1 - strength) * 800` pixels × spacing multiplier
- Charge force: `-800 × spacing` (repulsion)
- Alpha decay: `0.012` (slower for better spreading)
- Velocity decay: `0.25` (smoother movement)

## Performance Considerations

- **Large Graphs**: The 3D version performs better than 2D for graphs with >1000 nodes due to WebGL acceleration
- **Mobile Devices**: May have reduced performance on mobile devices - consider using 2D version for mobile
- **Browser Support**: Requires WebGL support (all modern browsers)

## Migration from 2D

To switch from 2D to 3D, simply replace:

```tsx
// Before
import { NetworkGraphNavigate } from '@/components/visualizations/NetworkGraphNavigate';

// After
import { NetworkGraphNavigate3D } from '@/components/visualizations/NetworkGraphNavigate3D';
```

All props and functionality remain the same!

## Future Enhancements

Potential improvements:
- [ ] VR support (using `react-force-graph-vr`)
- [ ] AR support (using `react-force-graph-ar`)
- [ ] Custom node geometries (icons, images)
- [ ] Link curvature for better visibility
- [ ] Cluster highlighting in 3D space
- [ ] Animation presets (orbit, fly-through)

