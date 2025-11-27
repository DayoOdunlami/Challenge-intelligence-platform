# Nested Clustering & 3D Cluster Hulls - Implementation Suggestions

## 1. Reduce Cluster Distance

**Current**: `radius = 300` (line 306)  
**Suggested**: `radius = 180` to `220`

This will bring clusters closer together while maintaining separation.

---

## 2. Nested Clustering Architecture

### Concept: Two-Level Clustering

**Level 1 (Primary)**: Domain clusters (Atlas, Navigate, CPC-Internal)  
**Level 2 (Secondary)**: Within each domain, cluster by entity type, sector, mode, etc.

### Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Domain: Atlas                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Challenges   │  │  Sectors:    │  │  Problem     │   │
│  │ (Entity Type)│  │  Rail        │  │  Types       │   │
│  │              │  │  Aviation    │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Domain: Navigate                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Stakeholders │  │ Technologies  │  │ Projects     │   │
│  │ (Entity Type)│  │ (Entity Type) │  │ (Entity Type)│   │
│  │              │  │              │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                Domain: CPC-Internal                      │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ Capabilities │  │ Initiatives  │                     │
│  │ (Entity Type)│  │ (Entity Type) │                     │
│  │              │  │              │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Approach

### Option A: Hierarchical Cluster Structure (Recommended)

**Data Model**:
```typescript
interface NestedClusterInfo {
  // Primary cluster (domain)
  primary: {
    id: string;
    label: string;
    color: string;
    nodeIds: string[];
    centroid: { x: number; y: number; z: number };
  };
  
  // Secondary clusters within primary
  secondary: Array<{
    id: string;
    label: string;
    color: string;
    nodeIds: string[];
    centroid: { x: number; y: number; z: number };
  }>;
}
```

**Positioning Strategy**:
1. **Primary clusters** (domains) arranged in a circle with reduced radius (180-220px)
2. **Secondary clusters** within each primary cluster arranged in a smaller circle (radius: 80-120px)
3. Nodes positioned in grid within their secondary cluster

**Force Strategy**:
- **Primary force**: Pulls nodes toward their domain cluster center (weaker: 0.15-0.2)
- **Secondary force**: Pulls nodes toward their secondary cluster center (stronger: 0.3-0.4)
- **Link weakening**: 
  - Same domain + same secondary: 0.8
  - Same domain + different secondary: 0.4
  - Different domains: 0.1

### Option B: Two Separate Cluster Controls

**UI Controls**:
```typescript
interface ClusteringControls {
  primaryClusterBy: 'domain' | 'none';
  secondaryClusterBy: 'entityType' | 'sector' | 'mode' | 'theme' | 'none';
  showPrimaryHulls: boolean;
  showSecondaryHulls: boolean;
  primaryClusterStrength: number;  // 0.1-0.3
  secondaryClusterStrength: number; // 0.2-0.5
}
```

**Implementation**:
- When both are active, apply nested positioning
- Primary clusters get larger hulls
- Secondary clusters get smaller hulls nested inside

---

## 4. Suggested Code Structure

### Step 1: Update Types

```typescript
export type PrimaryClusterBy = 'domain' | 'none';
export type SecondaryClusterBy = 'entityType' | 'sector' | 'mode' | 'theme' | 'none';

interface GraphNode {
  // ... existing fields
  primaryCluster: string;  // e.g., 'atlas', 'navigate', 'cpc-internal'
  secondaryCluster: string; // e.g., 'challenge', 'stakeholder', 'rail'
  primaryClusterIndex: number;
  secondaryClusterIndex: number;
}

interface NestedClusterInfo {
  primary: ClusterInfo;
  secondary: ClusterInfo[];
}
```

### Step 2: Nested Cluster Computation

```typescript
function computeNestedClusters(
  nodes: GraphNode[],
  primaryBy: PrimaryClusterBy,
  secondaryBy: SecondaryClusterBy
): Map<string, NestedClusterInfo> {
  const nested = new Map<string, NestedClusterInfo>();
  
  // Group by primary cluster
  const primaryGroups = new Map<string, GraphNode[]>();
  nodes.forEach(node => {
    const primary = node.primaryCluster;
    if (!primaryGroups.has(primary)) {
      primaryGroups.set(primary, []);
    }
    primaryGroups.get(primary)!.push(node);
  });
  
  // For each primary cluster, compute secondary clusters
  primaryGroups.forEach((primaryNodes, primaryKey) => {
    const secondaryMap = new Map<string, GraphNode[]>();
    primaryNodes.forEach(node => {
      const secondary = node.secondaryCluster;
      if (!secondaryMap.has(secondary)) {
        secondaryMap.set(secondary, []);
      }
      secondaryMap.get(secondary)!.push(node);
    });
    
    const secondaryClusters: ClusterInfo[] = Array.from(secondaryMap.entries()).map(
      ([key, nodeIds]) => ({
        id: `secondary-${primaryKey}-${key}`,
        label: key,
        color: getClusterColor(key, secondaryBy),
        nodeIds: nodeIds.map(n => n.id),
        cx: 0, cy: 0, cz: 0,
      })
    );
    
    nested.set(primaryKey, {
      primary: {
        id: `primary-${primaryKey}`,
        label: primaryKey,
        color: getClusterColor(primaryKey, primaryBy),
        nodeIds: primaryNodes.map(n => n.id),
        cx: 0, cy: 0, cz: 0,
      },
      secondary: secondaryClusters,
    });
  });
  
  return nested;
}
```

### Step 3: Nested Initial Positioning

```typescript
function applyNestedClusterPositions(
  nodes: GraphNode[],
  nestedClusters: Map<string, NestedClusterInfo>,
  is3D: boolean = false
) {
  if (nestedClusters.size <= 1) return;
  
  // Primary clusters in outer circle
  const primaryRadius = 200; // Reduced from 300
  const primaryClusters = Array.from(nestedClusters.values());
  
  primaryClusters.forEach((nested, primaryIndex) => {
    const angle = (2 * Math.PI * primaryIndex) / primaryClusters.length;
    const primaryCenterX = Math.cos(angle) * primaryRadius;
    const primaryCenterY = Math.sin(angle) * primaryRadius;
    const primaryCenterZ = is3D ? (Math.random() - 0.5) * 100 : 0;
    
    // Secondary clusters within primary (smaller circle)
    const secondaryRadius = 100;
    const secondaryClusters = nested.secondary;
    
    secondaryClusters.forEach((secondary, secondaryIndex) => {
      const secondaryAngle = (2 * Math.PI * secondaryIndex) / Math.max(secondaryClusters.length, 1);
      const secondaryCenterX = primaryCenterX + Math.cos(secondaryAngle) * secondaryRadius;
      const secondaryCenterY = primaryCenterY + Math.sin(secondaryAngle) * secondaryRadius;
      const secondaryCenterZ = primaryCenterZ + (is3D ? (Math.random() - 0.5) * 30 : 0);
      
      // Position nodes in grid within secondary cluster
      const clusterNodes = nodes.filter(n => secondary.nodeIds.includes(n.id));
      const cols = Math.max(1, Math.ceil(Math.sqrt(clusterNodes.length)));
      const spacing = 50; // Tighter spacing for nested clusters
      
      clusterNodes.forEach((node, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        node.x = secondaryCenterX + (col - cols / 2) * spacing;
        node.y = secondaryCenterY + (row - cols / 2) * spacing;
        if (is3D) {
          node.z = secondaryCenterZ + (Math.random() - 0.5) * 30;
        }
      });
    });
  });
}
```

### Step 4: Dual Cluster Forces

```typescript
const nestedClusterForce = useCallback(() => {
  if (primaryClusterBy === 'none') return null;
  
  const nodes = graphData.nodes;
  const nested = graphData.nestedClusters;
  
  return (alpha: number) => {
    // Calculate primary cluster centroids
    const primaryCentroids = new Map<string, { cx: number; cy: number; cz: number; count: number }>();
    
    nodes.forEach(node => {
      const primary = node.primaryCluster;
      if (!primaryCentroids.has(primary)) {
        primaryCentroids.set(primary, { cx: 0, cy: 0, cz: 0, count: 0 });
      }
      const centroid = primaryCentroids.get(primary)!;
      centroid.cx += node.x || 0;
      centroid.cy += node.y || 0;
      centroid.cz += node.z || 0;
      centroid.count += 1;
    });
    
    primaryCentroids.forEach((centroid, key) => {
      if (centroid.count > 0) {
        centroid.cx /= centroid.count;
        centroid.cy /= centroid.count;
        centroid.cz /= centroid.count;
      }
    });
    
    // Calculate secondary cluster centroids within each primary
    const secondaryCentroids = new Map<string, { cx: number; cy: number; cz: number; count: number }>();
    
    nodes.forEach(node => {
      const key = `${node.primaryCluster}-${node.secondaryCluster}`;
      if (!secondaryCentroids.has(key)) {
        secondaryCentroids.set(key, { cx: 0, cy: 0, cz: 0, count: 0 });
      }
      const centroid = secondaryCentroids.get(key)!;
      centroid.cx += node.x || 0;
      centroid.cy += node.y || 0;
      centroid.cz += node.z || 0;
      centroid.count += 1;
    });
    
    secondaryCentroids.forEach(centroid => {
      if (centroid.count > 0) {
        centroid.cx /= centroid.count;
        centroid.cy /= centroid.count;
        centroid.cz /= centroid.count;
      }
    });
    
    // Apply forces: primary (weaker) + secondary (stronger)
    nodes.forEach(node => {
      const primaryCentroid = primaryCentroids.get(node.primaryCluster);
      const secondaryKey = `${node.primaryCluster}-${node.secondaryCluster}`;
      const secondaryCentroid = secondaryCentroids.get(secondaryKey);
      
      // Primary force (weaker, keeps domain together)
      if (primaryCentroid && primaryCentroid.count > 1) {
        const dx1 = primaryCentroid.cx - (node.x || 0);
        const dy1 = primaryCentroid.cy - (node.y || 0);
        const dz1 = primaryCentroid.cz - (node.z || 0);
        const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1 + dz1 * dz1);
        
        if (dist1 > 0) {
          const strength1 = dist1 * primaryClusterStrength * alpha;
          node.vx = (node.vx || 0) + (dx1 / dist1) * strength1;
          node.vy = (node.vy || 0) + (dy1 / dist1) * strength1;
          if (mode === '3d') {
            node.vz = (node.vz || 0) + (dz1 / dist1) * strength1;
          }
        }
      }
      
      // Secondary force (stronger, tightens secondary clusters)
      if (secondaryCentroid && secondaryCentroid.count > 1) {
        const dx2 = secondaryCentroid.cx - (node.x || 0);
        const dy2 = secondaryCentroid.cy - (node.y || 0);
        const dz2 = secondaryCentroid.cz - (node.z || 0);
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2);
        
        if (dist2 > 0) {
          const strength2 = dist2 * secondaryClusterStrength * alpha;
          node.vx = (node.vx || 0) + (dx2 / dist2) * strength2;
          node.vy = (node.vy || 0) + (dy2 / dist2) * strength2;
          if (mode === '3d') {
            node.vz = (node.vz || 0) + (dz2 / dist2) * strength2;
          }
        }
      }
    });
  };
}, [graphData.nodes, primaryClusterBy, secondaryClusterBy, primaryClusterStrength, secondaryClusterStrength, mode]);
```

### Step 5: Link Strength with Nested Logic

```typescript
fg.d3Force('link')?.strength((link: GraphLink) => {
  const sourceNode = typeof link.source === 'object' ? link.source : 
    graphData.nodes.find(n => n.id === link.source);
  const targetNode = typeof link.target === 'object' ? link.target :
    graphData.nodes.find(n => n.id === link.target);
  
  if (!sourceNode || !targetNode) return 0.3;
  
  // Same primary + same secondary: strongest
  if (sourceNode.primaryCluster === targetNode.primaryCluster &&
      sourceNode.secondaryCluster === targetNode.secondaryCluster) {
    return 0.8;
  }
  
  // Same primary + different secondary: medium
  if (sourceNode.primaryCluster === targetNode.primaryCluster) {
    return 0.4;
  }
  
  // Different primary: weakest
  return 0.1;
});
```

---

## 5. 3D Cluster Hulls (Transparent Pods)

### Approach: THREE.js ConvexGeometry

```typescript
import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';

function create3DClusterHulls(
  clusters: ClusterInfo[],
  nodes: GraphNode[]
): THREE.Mesh[] {
  const hulls: THREE.Mesh[] = [];
  
  clusters.forEach(cluster => {
    const clusterNodes = nodes.filter(n => cluster.nodeIds.includes(n.id));
    if (clusterNodes.length < 4) return; // Need 4+ points for 3D hull
    
    // Get 3D positions
    const points = clusterNodes
      .filter(n => n.x !== undefined && n.y !== undefined && n.z !== undefined)
      .map(n => new THREE.Vector3(n.x!, n.y!, n.z!));
    
    if (points.length < 4) return;
    
    // Create convex hull geometry
    const geometry = new ConvexGeometry(points);
    
    // Create transparent material
    const material = new THREE.MeshBasicMaterial({
      color: cluster.color,
      transparent: true,
      opacity: 0.15, // Very transparent
      side: THREE.DoubleSide,
      depthWrite: false, // Allow overlapping transparency
    });
    
    const hull = new THREE.Mesh(geometry, material);
    hulls.push(hull);
  });
  
  return hulls;
}
```

### Integration in ForceGraph3D

```typescript
const render3D = () => {
  const [hullMeshes, setHullMeshes] = useState<THREE.Mesh[]>([]);
  
  useEffect(() => {
    if (showClusterHulls && clusterBy !== 'none' && mode === '3d') {
      const meshes = create3DClusterHulls(graphData.clusters, graphData.nodes);
      setHullMeshes(meshes);
      
      // Add to scene (requires access to Three.js scene)
      // This might need custom implementation or use onEngineReady callback
    }
  }, [showClusterHulls, clusterBy, graphData.clusters, graphData.nodes, mode]);
  
  return (
    <ForceGraph3D
      {...sharedProps}
      nodeOpacity={0.9}
      linkOpacity={0.5}
      enableNavigationControls={true}
      backgroundColor="#f8fafc"
      // Note: 3D hulls need to be added via custom Three.js scene manipulation
      // This may require using onEngineReady or a custom wrapper
    />
  );
};
```

### Alternative: Custom Three.js Scene Wrapper

Since `react-force-graph-3d` doesn't directly support adding custom meshes, you may need:

1. **Use `onEngineReady` callback** to get access to the Three.js scene
2. **Add hull meshes to the scene** manually
3. **Update hull positions** on each simulation tick

```typescript
<ForceGraph3D
  {...sharedProps}
  onEngineReady={(engine) => {
    const scene = engine.scene();
    
    // Create and add hull meshes
    if (showClusterHulls && clusterBy !== 'none') {
      const meshes = create3DClusterHulls(graphData.clusters, graphData.nodes);
      meshes.forEach(mesh => scene.add(mesh));
      
      // Update hulls on tick
      engine.on('tick', () => {
        // Recalculate hull geometry from current node positions
        update3DHullPositions(meshes, graphData.clusters, graphData.nodes);
      });
    }
  }}
/>
```

---

## 6. Recommended Implementation Order

1. ✅ **Reduce cluster distance** (quick fix: change `radius = 300` to `radius = 200`)
2. ✅ **Add nested cluster data structure** (update `GraphNode` and `buildGraphData`)
3. ✅ **Implement nested positioning** (update `applyInitialClusterPositions`)
4. ✅ **Add dual cluster forces** (primary + secondary)
5. ✅ **Update link strength logic** (nested comparison)
6. ✅ **Add 3D hull rendering** (using Three.js ConvexGeometry)

---

## 7. UI Controls Suggestion

```typescript
interface ClusteringControls {
  // Primary clustering
  primaryClusterBy: 'domain' | 'none';
  primaryClusterStrength: number; // 0.1-0.3 (weaker)
  
  // Secondary clustering
  secondaryClusterBy: 'entityType' | 'sector' | 'mode' | 'theme' | 'none';
  secondaryClusterStrength: number; // 0.2-0.5 (stronger)
  
  // Visual
  showPrimaryHulls: boolean;
  showSecondaryHulls: boolean;
  primaryHullOpacity: number; // 0.05-0.2
  secondaryHullOpacity: number; // 0.1-0.3
}
```

---

## 8. Performance Considerations

- **3D hulls**: Recalculate on simulation tick (may impact performance with many clusters)
- **Optimization**: Only update hulls when node positions change significantly
- **LOD (Level of Detail)**: Use simpler hulls when zoomed out, detailed when zoomed in

---

## Summary

**Quick Wins**:
1. Reduce `radius` from 300 to 200 (line 306)
2. Add nested cluster structure to `GraphNode`
3. Implement dual forces (primary + secondary)

**Medium Effort**:
4. Update positioning for nested clusters
5. Add UI controls for primary/secondary clustering

**Advanced**:
6. 3D cluster hulls using Three.js ConvexGeometry
7. Performance optimization for hull updates

Would you like me to implement any of these? I'd suggest starting with #1 (reduce distance) and #2-3 (nested structure + dual forces).

