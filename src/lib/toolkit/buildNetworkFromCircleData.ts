'use client';

import { circlePackingData, CirclePackingNode } from '@/data/toolkit/circlePackingData';

const TYPE_COLORS: Record<string, string> = {
  government: '#006E51',
  intermediary: '#2d8f6f',
  academia: '#7b2cbf',
  industry: '#e76f51',
  project: '#f4a261',
  working_group: '#264653',
};

type RawLink = {
  source: string;
  target: string;
  relation: RelationType;
};

type RelationType = 'connection' | 'project' | 'member' | 'funder' | 'partner' | 'lead';

export type NetworkNode = {
  id: string;
  name: string;
  type: string;
  group: 'stakeholder' | 'project' | 'working_group';
  symbolSize: number;
  symbol: 'circle' | 'rect' | 'diamond';
  itemStyle: { color: string };
  fullData: CirclePackingNode;
};

export type NetworkLink = {
  source: string;
  target: string;
  relation: RelationType;
  value: number;
  lineStyle: {
    color: string;
    width: number;
    type?: 'solid' | 'dashed' | 'dotted';
    opacity?: number;
  };
};

const RELATION_STYLES: Record<RelationType, { color: string; width: number; type?: 'solid' | 'dashed' | 'dotted'; weight: number }> = {
  connection: { color: '#94a3b8', width: 1.5, type: 'solid', weight: 1.2 },
  project: { color: '#f97316', width: 2.4, type: 'dashed', weight: 2.2 },
  member: { color: '#6366f1', width: 2, type: 'dotted', weight: 1.9 },
  funder: { color: '#10b981', width: 2, type: 'solid', weight: 1.7 },
  partner: { color: '#0ea5e9', width: 1.8, type: 'solid', weight: 1.6 },
  lead: { color: '#f43f5e', width: 2.2, type: 'solid', weight: 2.0 },
};

const GROUP_BY_TYPE = (type?: string): 'stakeholder' | 'project' | 'working_group' => {
  if (type === 'project') return 'project';
  if (type === 'working_group') return 'working_group';
  return 'stakeholder';
};

const SYMBOL_BY_GROUP: Record<'stakeholder' | 'project' | 'working_group', 'circle' | 'rect' | 'diamond'> = {
  stakeholder: 'circle',
  project: 'rect',
  working_group: 'diamond',
};

const toTitle = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const flattenNodes = (node: CirclePackingNode, map: Map<string, CirclePackingNode>) => {
  if (node.id) {
    map.set(node.id, node);
  }
  node.children?.forEach((child) => flattenNodes(child, map));
};

const addRawLink = (links: RawLink[], source: string | undefined, targets: string[] | undefined, relation: RelationType) => {
  if (!source || !targets) return;
  targets.forEach((target) => {
    if (!target) return;
    links.push({ source, target, relation });
  });
};

export const buildNetworkFromCircleData = () => {
  const nodeMap = new Map<string, CirclePackingNode>();
  flattenNodes(circlePackingData, nodeMap);

  const nodes: NetworkNode[] = Array.from(nodeMap.values()).map((node) => {
    const type = node.type || 'stakeholder';
    const group = GROUP_BY_TYPE(type);
    const color = node.color || TYPE_COLORS[type] || '#6b7280';
    const symbolSize = Math.max(24, Math.min(55, node.size ?? 35));

    return {
      id: node.id as string,
      name: node.name,
      type,
      group,
      symbolSize,
      symbol: SYMBOL_BY_GROUP[group],
      itemStyle: { color },
      fullData: node,
    };
  });

  const rawLinks: RawLink[] = [];
  nodeMap.forEach((node) => {
    if (!node.id) return;
    addRawLink(rawLinks, node.id, node.connections, 'connection');
    addRawLink(rawLinks, node.id, node.projects, 'project');
    addRawLink(rawLinks, node.id, node.members, 'member');
    addRawLink(rawLinks, node.id, node.funders, 'funder');
    addRawLink(rawLinks, node.id, node.partners, 'partner');
    if (node.lead) {
      addRawLink(rawLinks, node.id, [node.lead], 'lead');
    }
  });

  // Deduplicate links while preserving strongest relation
  const deduped = new Map<string, RawLink>();
  rawLinks.forEach((link) => {
    const sorted = [link.source, link.target].sort().join('|');
    const existing = deduped.get(sorted);
    if (!existing) {
      deduped.set(sorted, link);
      return;
    }
    const existingWeight = RELATION_STYLES[existing.relation].weight;
    const newWeight = RELATION_STYLES[link.relation].weight;
    if (newWeight > existingWeight) {
      deduped.set(sorted, link);
    }
  });

  const links: NetworkLink[] = Array.from(deduped.values())
    .filter((link) => nodeMap.has(link.source) && nodeMap.has(link.target))
    .map((link) => {
      const style = RELATION_STYLES[link.relation];
      return {
        ...link,
        value: style.weight,
        lineStyle: {
          color: style.color,
          width: style.width,
          type: style.type,
          opacity: 0.75,
        },
      };
    });

  const categorySet = new Set(nodes.map((node) => node.type));
  const categories = Array.from(categorySet).map((name) => ({
    key: name,
    label: toTitle(name),
  }));

  return { nodes, links, categories };
};


