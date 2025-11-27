/**
 * Build network graph from BaseEntity[] and UniversalRelationship[]
 * 
 * This is the universal network builder that works with any entity type
 * (Challenges, Stakeholders, Technologies, Projects, etc.)
 */

import type { BaseEntity, UniversalRelationship } from '@/lib/base-entity';

export type NetworkNode = {
  id: string;
  name: string;
  type: string;
  group: 'stakeholder' | 'project' | 'working_group' | 'challenge' | 'technology';
  symbolSize: number;
  symbol: 'circle' | 'rect' | 'diamond';
  itemStyle: { color: string };
  fullData: BaseEntity;
};

export type NetworkLink = {
  source: string;
  target: string;
  relation: string;
  value: number;
  lineStyle: {
    color: string;
    width: number;
    type?: 'solid' | 'dashed' | 'dotted';
    opacity?: number;
  };
};

const TYPE_COLORS: Record<string, string> = {
  government: '#006E51',
  intermediary: '#2d8f6f',
  academia: '#7b2cbf',
  industry: '#e76f51',
  project: '#f4a261',
  working_group: '#264653',
  challenge: '#8b5cf6',
  technology: '#10b981',
  stakeholder: '#4A90E2',
};

const GROUP_BY_ENTITY_TYPE = (entityType: string): NetworkNode['group'] => {
  if (entityType === 'project') return 'project';
  if (entityType === 'working_group') return 'working_group';
  if (entityType === 'challenge') return 'challenge';
  if (entityType === 'technology') return 'technology';
  return 'stakeholder';
};

const SYMBOL_BY_GROUP: Record<NetworkNode['group'], 'circle' | 'rect' | 'diamond'> = {
  stakeholder: 'circle',
  project: 'rect',
  working_group: 'diamond',
  challenge: 'circle',
  technology: 'circle',
};

const RELATIONSHIP_STYLES: Record<string, { color: string; width: number; type?: 'solid' | 'dashed' | 'dotted'; opacity: number }> = {
  funds: { color: '#10b981', width: 2, type: 'solid', opacity: 0.8 },
  collaborates_with: { color: '#4A90E2', width: 1.8, type: 'solid', opacity: 0.7 },
  researches: { color: '#6366f1', width: 2, type: 'dotted', opacity: 0.6 },
  advances: { color: '#f97316', width: 2.2, type: 'solid', opacity: 0.8 },
  participates_in: { color: '#0ea5e9', width: 1.8, type: 'dashed', opacity: 0.7 },
  similar_to: { color: '#94a3b8', width: 1.5, type: 'solid', opacity: 0.5 },
  provides: { color: '#8b5cf6', width: 2, type: 'dashed', opacity: 0.7 },
  addresses: { color: '#f43f5e', width: 2, type: 'solid', opacity: 0.7 },
};

/**
 * Build network from BaseEntity[] and UniversalRelationship[]
 */
export function buildNetworkFromBaseEntities(
  entities: BaseEntity[],
  relationships: UniversalRelationship[] = []
): {
  nodes: NetworkNode[];
  links: NetworkLink[];
  categories: Array<{ key: string; label: string }>;
} {
  // Build nodes
  const nodes: NetworkNode[] = entities.map((entity) => {
    const group = GROUP_BY_ENTITY_TYPE(entity.entityType);
    const meta = (entity.metadata || {}) as { [key: string]: any };

    const color =
      entity.visualizationHints?.color ||
      TYPE_COLORS[entity.entityType] ||
      (meta.category ? TYPE_COLORS[meta.category] : undefined) ||
      '#6b7280';

    const baseAmount = meta.funding?.amount as number | undefined;
    const size =
      entity.visualizationHints?.size ||
      (baseAmount
        ? Math.max(24, Math.min(55, Math.log10(baseAmount) * 5))
        : 35);

    return {
      id: entity.id,
      name: entity.name,
      type: entity.entityType,
      group,
      symbolSize: size,
      symbol: SYMBOL_BY_GROUP[group],
      itemStyle: { color },
      fullData: entity,
    };
  });

  // Build links from relationships
  const linkMap = new Map<string, NetworkLink>();
  
  relationships.forEach((rel) => {
    const key = [rel.source, rel.target].sort().join('|');
    const existing = linkMap.get(key);
    
    // Use strongest relationship if duplicate
    if (!existing || rel.strength > existing.value) {
      const style = RELATIONSHIP_STYLES[rel.type] || {
        color: '#94a3b8',
        width: 1.5,
        type: 'solid' as const,
        opacity: 0.6,
      };
      
      linkMap.set(key, {
        source: rel.source,
        target: rel.target,
        relation: rel.type,
        value: rel.strength,
        lineStyle: {
          ...style,
          opacity: style.opacity * rel.strength, // Scale opacity by strength
          width: style.width * (0.5 + rel.strength * 0.5), // Scale width by strength
        },
      });
    }
  });

  // Also check entity.relationships for embedded relationships
  entities.forEach((entity) => {
    entity.relationships?.forEach((rel) => {
      const key = [entity.id, rel.targetId].sort().join('|');
      if (!linkMap.has(key)) {
        const style = RELATIONSHIP_STYLES[rel.type] || {
          color: '#94a3b8',
          width: 1.5,
          type: 'solid' as const,
          opacity: 0.6,
        };
        
        linkMap.set(key, {
          source: entity.id,
          target: rel.targetId,
          relation: rel.type,
          value: rel.strength || 0.5,
          lineStyle: {
            ...style,
            opacity: style.opacity * (rel.strength || 0.5),
            width: style.width * (0.5 + (rel.strength || 0.5) * 0.5),
          },
        });
      }
    });
  });

  const links = Array.from(linkMap.values());

  // Build categories from entity types
  const categorySet = new Set(entities.map((e) => e.entityType));
  const categories = Array.from(categorySet).map((type) => ({
    key: type,
    label: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '),
  }));

  return { nodes, links, categories };
}

