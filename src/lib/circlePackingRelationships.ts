import { CirclePackingNode, circlePackingData } from '@/data/toolkit/circlePackingData';

export type CirclePackingNodeMap = Record<string, CirclePackingNode>;
export type CirclePackingAdjacency = Record<string, Set<string>>;

const flattenNodes = (node: CirclePackingNode, map: CirclePackingNodeMap) => {
  if (node.id) {
    map[node.id] = node;
  }
  node.children?.forEach((child) => flattenNodes(child, map));
};

const addLink = (
  sourceId: string | undefined,
  targetId: string | undefined,
  map: CirclePackingNodeMap,
  adjacency: CirclePackingAdjacency
) => {
  if (!sourceId || !targetId) return;
  if (!map[sourceId] || !map[targetId]) return;
  if (!adjacency[sourceId]) adjacency[sourceId] = new Set();
  if (!adjacency[targetId]) adjacency[targetId] = new Set();
  adjacency[sourceId].add(targetId);
  adjacency[targetId].add(sourceId);
};

const linkArray = (
  sourceId: string | undefined,
  targets: string[] | undefined,
  map: CirclePackingNodeMap,
  adjacency: CirclePackingAdjacency
) => {
  if (!sourceId || !targets) return;
  targets.forEach((target) => addLink(sourceId, target, map, adjacency));
};

export const buildCirclePackingMaps = () => {
  const nodeMap: CirclePackingNodeMap = {};
  flattenNodes(circlePackingData, nodeMap);

  const adjacency: CirclePackingAdjacency = {};

  Object.entries(nodeMap).forEach(([id, node]) => {
    linkArray(id, node.connections, nodeMap, adjacency);
    linkArray(id, node.projects, nodeMap, adjacency);
    linkArray(id, node.members, nodeMap, adjacency);
    linkArray(id, node.partners, nodeMap, adjacency);
    linkArray(id, (node as CirclePackingNode & { funders?: string[] }).funders, nodeMap, adjacency);

    if (node.lead) {
      addLink(id, node.lead, nodeMap, adjacency);
    }
  });

  return { nodeMap, adjacency };
};

export const getHighlightedIds = (
  selectedId: string | null,
  adjacency: CirclePackingAdjacency
): Set<string> | null => {
  if (!selectedId) return null;
  const related = adjacency[selectedId];
  const ids = new Set<string>([selectedId]);
  related?.forEach((id) => ids.add(id));
  return ids;
};

