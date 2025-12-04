'use client';

import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import * as d3 from 'd3';
import * as THREE from 'three';
import type { BaseEntity, Domain, UniversalRelationship } from '@/lib/base-entity';

// Dynamically import to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const DOMAIN_COLORS: Record<Domain, string> = {
  atlas: '#3B82F6',
  navigate: '#10B981',
  'cpc-internal': '#006E51',
  reference: '#6B7280',
  'cross-domain': '#F97316',
};

const ENTITY_TYPE_COLORS: Record<string, string> = {
  challenge: '#F59E0B',
  stakeholder: '#3B82F6',
  technology: '#8B5CF6',
  project: '#10B981',
  capability: '#EC4899',
  initiative: '#006E51',
  authority: '#6B7280',
  priority: '#EF4444',
  // CPC entity types
  focus_area: '#8B5CF6',
  milestone: '#A855F7',
  stage: '#C084FC',
  team: '#E879F9',
  asset: '#F0ABFC',
  // Normalized/capitalized versions
  FocusArea: '#8B5CF6',
  Milestone: '#A855F7',
  Stage: '#C084FC',
  Team: '#E879F9',
  Asset: '#F0ABFC',
  'focus area': '#8B5CF6',
  'Focus Area': '#8B5CF6',
};

const MODE_COLORS: Record<string, string> = {
  rail: '#DC2626',
  aviation: '#2563EB',
  maritime: '#0891B2',
  highways: '#CA8A04',
  'integrated-transport': '#7C3AED',
  'cross-modal': '#6B7280',
};

const THEME_COLORS: Record<string, string> = {
  autonomy: '#8B5CF6',
  'people-experience': '#EC4899',
  'hubs-and-clusters': '#F59E0B',
  decarbonisation: '#10B981',
  'planning-and-operation': '#3B82F6',
  industry: '#6B7280',
  'data-and-digital': '#06B6D4',
};

const STAKEHOLDER_CATEGORY_COLORS: Record<string, string> = {
  Government: '#0EA5E9',
  Intermediary: '#8B5CF6',
  Academia: '#6366F1',
  Industry: '#F97316',
  Project: '#10B981',
  'Working Group': '#EC4899',
};

const SECTOR_COLORS: Record<string, string> = {
  rail: '#3b82f6',           // blue
  energy: '#22c55e',         // green
  'local gov': '#a855f7',     // purple
  transport: '#f59e0b',      // orange
  'built env': '#ef4444',     // red
  aviation: '#06b6d4',       // cyan
  // Normalized keys (with underscores)
  'local_gov': '#a855f7',
  'built_env': '#ef4444',
};

const BUSINESS_UNIT_COLORS: Record<string, string> = {
  Rail: '#7C3AED',
  'Integrated Transport': '#A855F7',
  Aviation: '#C084FC',
  Energy: '#E879F9',
  Digital: '#F0ABFC',
  Strategy: '#6366F1',
  // Normalized versions
  rail: '#7C3AED',
  'integrated transport': '#A855F7',
  'integrated-transport': '#A855F7',
  aviation: '#C084FC',
  energy: '#E879F9',
  digital: '#F0ABFC',
  strategy: '#6366F1',
  Transport: '#A855F7', // Fallback for Transport
  transport: '#A855F7',
};

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type ClusterMode = 'none' | 'single' | 'nested';
export type PrimaryClusterBy = 'domain' | 'entityType' | 'mode' | 'stakeholderCategory';
export type SecondaryClusterBy = 'entityType' | 'mode' | 'theme' | 'sector' | 'stakeholderCategory';
export type ColorBy = 'domain' | 'entityType' | 'mode' | 'theme' | 'primaryCluster' | 'secondaryCluster' | 'stakeholderCategory' | 'sector' | 'businessUnit';

interface GraphNode {
  id: string;
  name: string;
  domain: Domain;
  entityType: string;
  modes?: string[];
  themes?: string[];
  sector?: string;
  val: number;
  color: string;
  entity: BaseEntity;
  // Nested clustering
  primaryCluster: string;
  secondaryCluster: string;
  primaryClusterIndex: number;
  secondaryClusterIndex: number;
  // Force simulation
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  // Neighbor lookup
  neighbors: GraphNode[];
  links: GraphLink[];
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  weight?: number;
}

interface ClusterInfo {
  id: string;
  label: string;
  color: string;
  nodeIds: string[];
  cx: number;
  cy: number;
  cz: number;
}

interface NestedClusterInfo {
  primary: ClusterInfo;
  secondary: ClusterInfo[];
}

export interface DomainPodConfig {
  taxonomyKey: 'stakeholderCategory' | 'sector' | 'entityType' | 'businessUnit';
  showPods: boolean;
}

export interface UnifiedNetworkGraphProps {
  entities: BaseEntity[];
  relationships: UniversalRelationship[];
  mode?: '2d' | '3d';
  colorBy?: ColorBy;
  // Clustering
  clusterMode?: ClusterMode;
  primaryClusterBy?: PrimaryClusterBy;
  secondaryClusterBy?: SecondaryClusterBy;
  domainPodConfig?: Partial<Record<'navigate' | 'atlas' | 'cpc-internal', DomainPodConfig>>;
  showHulls?: boolean; // Deprecated: use showDomainHulls and domainPodConfig instead
  showDomainHulls?: boolean; // Separate flag for domain hulls (primary clusters) - independent of pod hulls
  clusterTightness?: number; // 0.1 to 1.0
  clusterSpacing?: number; // 0.3 to 1.5, default 0.8
  // Simulation parameters
  reheatAlpha?: number; // 0.1 to 1.0, default 0.3 (gentler restart)
  velocityDecay?: number; // 0.1 to 0.8, default 0.4 (faster slowdown)
  maxVelocity?: number; // 5 to 50, default 15 (velocity cap)
  maxDistance?: number; // 200 to 1000, default 400 (boundary constraint)
  // Interaction
  className?: string;
  fitToCanvas?: boolean;
  clickToFocus?: boolean;
  showLabelsOnHover?: boolean;
  onNodeSelect?: (entity: BaseEntity | null) => void;
}

// ─────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(107, 114, 128, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getClusterValue(
  entity: BaseEntity,
  clusterBy: PrimaryClusterBy | SecondaryClusterBy,
  domainPodConfig?: Partial<Record<'navigate' | 'atlas' | 'cpc-internal', DomainPodConfig>>
): string {
  // For secondary clustering with domain pod config, use domain-specific logic
  if (domainPodConfig && (clusterBy === 'stakeholderCategory' || clusterBy === 'sector' || clusterBy === 'entityType')) {
    const domain = entity.domain as 'navigate' | 'atlas' | 'cpc-internal';
    const podConfig = domainPodConfig[domain];
    
    // If pods are disabled for this domain, return domain name so all nodes group together
    if (!podConfig?.showPods) {
      return domain; // All nodes in this domain will have the same secondary cluster
    }
    
    if (podConfig.showPods) {
      // Use domain-specific taxonomy
      switch (podConfig.taxonomyKey) {
        case 'stakeholderCategory':
          // For stakeholders, use their category/type
          if (entity.entityType === 'stakeholder') {
            const category = (entity.metadata?.category as string) ||
              (entity.metadata?.custom as { type?: string })?.type ||
              'Industry';
            return category === 'Research' ? 'Academia' : category;
          }
          if (entity.entityType === 'project') return 'Project';
          if (entity.name?.toLowerCase().includes('working group') || 
              entity.name?.toLowerCase().includes('taskforce') ||
              entity.name?.toLowerCase().includes('task force')) {
            return 'Working Group';
          }
          return entity.entityType; // Fallback
          
        case 'sector':
          const sector = (entity.metadata?.sector as string) || 
            (Array.isArray(entity.metadata?.sector) ? entity.metadata.sector[0] : undefined);
          // Normalize sector values
          if (sector) {
            const normalized = sector.trim().toLowerCase();
            const sectorMap: Record<string, string> = {
              rail: 'Rail',
              energy: 'Energy',
              'local_gov': 'Local Gov',
              'local gov': 'Local Gov',
              transport: 'Transport',
              'built_env': 'Built Env',
              'built env': 'Built Env',
              aviation: 'Aviation',
            };
            return sectorMap[normalized] || sector;
          }
          return 'other';
          
        case 'entityType':
          return entity.entityType;
          
        case 'businessUnit':
          return (entity.metadata?.custom as { businessUnit?: string; department?: string })?.businessUnit || 
            (entity.metadata?.custom as { businessUnit?: string; department?: string })?.department || 
            entity.entityType;
      }
    }
  }
  
  // Default behavior (original logic)
  switch (clusterBy) {
    case 'domain':
      return entity.domain;
    case 'entityType':
      return entity.entityType;
    case 'mode':
      return (entity.metadata?.custom as { modes?: string[] })?.modes?.[0] || 'other';
    case 'theme':
      return (entity.metadata?.custom as { strategicThemes?: string[] })?.strategicThemes?.[0] || 'other';
    case 'sector':
      const sector = (entity.metadata?.sector as string) || (Array.isArray(entity.metadata?.sector) ? entity.metadata.sector[0] : 'other') || 'other';
      // Normalize sector
      if (sector && sector !== 'other') {
        const normalized = sector.trim().toLowerCase();
        const sectorMap: Record<string, string> = {
          rail: 'Rail',
          energy: 'Energy',
          'local_gov': 'Local Gov',
          'local gov': 'Local Gov',
          transport: 'Transport',
          'built_env': 'Built Env',
          'built env': 'Built Env',
          aviation: 'Aviation',
        };
        return sectorMap[normalized] || sector;
      }
      return sector;
    case 'stakeholderCategory':
      // For stakeholders, use their category/type
      if (entity.entityType === 'stakeholder') {
        const category = (entity.metadata?.category as string) ||
          (entity.metadata?.custom as { type?: string })?.type ||
          'Industry';
        // Map Navigate 'Research' to 'Academia'
        return category === 'Research' ? 'Academia' : category;
      }
      // For projects, use 'Project'
      if (entity.entityType === 'project') {
        return 'Project';
      }
      // For working groups (check by name since they might be stakeholders)
      if (entity.name?.toLowerCase().includes('working group') || 
          entity.name?.toLowerCase().includes('taskforce') ||
          entity.name?.toLowerCase().includes('task force')) {
        return 'Working Group';
      }
      // For technologies and others, return entityType as fallback (won't match stakeholder colors)
      return entity.entityType;
    default:
      return 'all';
  }
}

function getClusterColor(value: string, clusterBy: PrimaryClusterBy | SecondaryClusterBy): string {
  switch (clusterBy) {
    case 'domain':
      return DOMAIN_COLORS[value as Domain] || '#6B7280';
    case 'entityType':
      return ENTITY_TYPE_COLORS[value] || '#6B7280';
    case 'mode':
      return MODE_COLORS[value] || '#6B7280';
    case 'theme':
      return THEME_COLORS[value] || '#6B7280';
    case 'sector':
      return SECTOR_COLORS[value.toLowerCase()] || SECTOR_COLORS[value] || '#6B7280';
    case 'stakeholderCategory':
      return STAKEHOLDER_CATEGORY_COLORS[value] || ENTITY_TYPE_COLORS[value] || '#6B7280';
    default:
      return '#6B7280';
  }
}

function getNodeColor(
  entity: BaseEntity,
  colorBy: ColorBy,
  primaryCluster?: string,
  secondaryCluster?: string,
  primaryClusterBy?: PrimaryClusterBy,
  secondaryClusterBy?: SecondaryClusterBy
): string {
  switch (colorBy) {
    case 'domain':
      return DOMAIN_COLORS[entity.domain] || '#6B7280';
    case 'entityType':
      // Handle case-insensitive lookup and capitalize first letter for matching
      const entityTypeKey = entity.entityType?.toLowerCase();
      const capitalized = entity.entityType ? entity.entityType.charAt(0).toUpperCase() + entity.entityType.slice(1).toLowerCase() : '';
      return ENTITY_TYPE_COLORS[entity.entityType] || ENTITY_TYPE_COLORS[entityTypeKey] || ENTITY_TYPE_COLORS[capitalized] || '#6B7280';
    case 'stakeholderCategory':
      let category: string;
      // For stakeholders, use their type/category
      if (entity.entityType === 'stakeholder') {
        category = (entity.metadata?.category as string) ||
          (entity.metadata?.custom as { type?: string })?.type ||
          'Industry'; // Default fallback
        // Map Navigate types to stakeholder categories
        if (category === 'Research') category = 'Academia';
      } else if (entity.entityType === 'project') {
        // Projects use "Project" category
        category = 'Project';
      } else if (entity.name?.toLowerCase().includes('working group') || 
                 entity.name?.toLowerCase().includes('taskforce') ||
                 entity.name?.toLowerCase().includes('task force')) {
        // Working groups use "Working Group" category
        category = 'Working Group';
      } else if (entity.entityType === 'technology') {
        // Technologies should not be colored by stakeholder category
        // Return a neutral gray color
        return '#9CA3AF'; // gray-400
      } else {
        // Fallback for other entity types - don't color by stakeholder category
        return ENTITY_TYPE_COLORS[entity.entityType] || '#6B7280';
      }
      return STAKEHOLDER_CATEGORY_COLORS[category] || ENTITY_TYPE_COLORS[entity.entityType] || '#6B7280';
    case 'mode':
      return MODE_COLORS[(entity.metadata?.custom as { modes?: string[] })?.modes?.[0] || ''] || '#6B7280';
    case 'theme':
      return THEME_COLORS[(entity.metadata?.custom as { strategicThemes?: string[] })?.strategicThemes?.[0] || ''] || '#6B7280';
    case 'sector':
      const sectorValue = (entity.metadata?.sector as string) || 
        (Array.isArray(entity.metadata?.sector) ? entity.metadata.sector[0] : undefined);
      if (sectorValue) {
        const normalizedSector = sectorValue.toLowerCase().replace(/\s+/g, '_');
        return SECTOR_COLORS[normalizedSector] || SECTOR_COLORS[sectorValue.toLowerCase()] || SECTOR_COLORS[sectorValue] || '#6B7280';
      }
      return '#6B7280';
    case 'primaryCluster':
      return primaryCluster && primaryClusterBy ? getClusterColor(primaryCluster, primaryClusterBy) : '#6B7280';
    case 'secondaryCluster':
      return secondaryCluster && secondaryClusterBy ? getClusterColor(secondaryCluster, secondaryClusterBy) : '#6B7280';
    default:
      return '#6B7280';
  }
}

function getNodeValue(entity: BaseEntity): number {
  const fundingMeta = entity.metadata?.funding as
    | { amount?: number; amountMin?: number; amountMax?: number }
    | undefined;
  // Check funding from metadata
  if (fundingMeta?.amount) {
    const amount = fundingMeta.amount;
    if (amount > 0) {
      return Math.max(2, Math.min(8, Math.log10(amount / 10000)));
    }
  }
  if (fundingMeta?.amountMin) {
    const amount = fundingMeta.amountMin;
    if (amount > 0) {
      return Math.max(2, Math.min(8, Math.log10(amount / 10000)));
    }
  }
  if (fundingMeta?.amountMax) {
    const amount = fundingMeta.amountMax;
    if (amount > 0) {
      return Math.max(2, Math.min(8, Math.log10(amount / 10000)));
    }
  }

  switch (entity.entityType) {
    case 'stakeholder':
      return 5;
    case 'project':
    case 'initiative':
      return 4;
    case 'capability':
      return 3;
    default:
      return 3;
  }
}

function formatLabel(value: string): string {
  return value
    .replace(/-/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// ─────────────────────────────────────────────────────────────
// GRAPH DATA BUILDER
// ─────────────────────────────────────────────────────────────

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  nestedClusters: Map<string, NestedClusterInfo>;
  allPrimaryClusters: ClusterInfo[];
  allSecondaryClusters: ClusterInfo[];
}

function buildGraphData(
  entities: BaseEntity[],
  relationships: UniversalRelationship[],
  colorBy: ColorBy,
  clusterMode: ClusterMode,
  primaryClusterBy: PrimaryClusterBy,
  secondaryClusterBy: SecondaryClusterBy,
  domainPodConfig?: Partial<Record<'navigate' | 'atlas' | 'cpc-internal', DomainPodConfig>>
): GraphData {
  // Build cluster indices
  const primaryValues = new Map<string, number>();
  const secondaryValues = new Map<string, number>();

  entities.forEach((entity) => {
    const primary = getClusterValue(entity, primaryClusterBy, domainPodConfig);
    const secondary = getClusterValue(entity, secondaryClusterBy, domainPodConfig);
    if (!primaryValues.has(primary)) {
      primaryValues.set(primary, primaryValues.size);
    }
    if (!secondaryValues.has(secondary)) {
      secondaryValues.set(secondary, secondaryValues.size);
    }
  });

  // Build nodes
  const nodes: GraphNode[] = entities.map((entity) => {
    const primaryCluster = getClusterValue(entity, primaryClusterBy, domainPodConfig);
    const secondaryCluster = getClusterValue(entity, secondaryClusterBy, domainPodConfig);
    return {
      id: entity.id,
      name: entity.name,
      domain: entity.domain,
      entityType: entity.entityType,
      modes: (entity.metadata?.custom as { modes?: string[] })?.modes,
      themes: (entity.metadata?.custom as { strategicThemes?: string[] })?.strategicThemes,
      sector: (entity.metadata?.sector as string) || (Array.isArray(entity.metadata?.sector) ? entity.metadata.sector[0] : undefined),
      val: getNodeValue(entity),
      color: getNodeColor(entity, colorBy, primaryCluster, secondaryCluster, primaryClusterBy, secondaryClusterBy),
      entity,
      primaryCluster,
      secondaryCluster,
      primaryClusterIndex: primaryValues.get(primaryCluster) || 0,
      secondaryClusterIndex: secondaryValues.get(secondaryCluster) || 0,
      neighbors: [],
      links: [],
    };
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Build links
  const links: GraphLink[] = relationships
    .filter((r) => nodeMap.has(r.source) && nodeMap.has(r.target))
    .map((r) => ({
      source: r.source,
      target: r.target,
      type: r.type,
      weight: (r.metadata?.confidence as number) || 0.5,
    }));

  // Cross-link nodes with neighbors
  links.forEach((link) => {
    const sourceNode = nodeMap.get(link.source as string);
    const targetNode = nodeMap.get(link.target as string);
    if (sourceNode && targetNode) {
      sourceNode.neighbors.push(targetNode);
      targetNode.neighbors.push(sourceNode);
      sourceNode.links.push(link);
      targetNode.links.push(link);
    }
  });

  // Compute nested clusters
  const nestedClusters = new Map<string, NestedClusterInfo>();

  if (clusterMode !== 'none') {
    // Group by primary cluster
    const primaryGroups = new Map<string, GraphNode[]>();
    nodes.forEach((node) => {
      if (!primaryGroups.has(node.primaryCluster)) {
        primaryGroups.set(node.primaryCluster, []);
      }
      primaryGroups.get(node.primaryCluster)!.push(node);
    });

    // Build nested structure
    primaryGroups.forEach((primaryNodes, primaryKey) => {
      // Secondary clusters within this primary
      const secondaryMap = new Map<string, GraphNode[]>();
      primaryNodes.forEach((node) => {
        if (!secondaryMap.has(node.secondaryCluster)) {
          secondaryMap.set(node.secondaryCluster, []);
        }
        secondaryMap.get(node.secondaryCluster)!.push(node);
      });

      const secondaryClusters: ClusterInfo[] = Array.from(secondaryMap.entries()).map(([key, secNodes]) => ({
        id: `secondary-${primaryKey}-${key}`,
        label: formatLabel(key),
        color: getClusterColor(key, secondaryClusterBy),
        nodeIds: secNodes.map((n) => n.id),
        cx: 0,
        cy: 0,
        cz: 0,
      }));

      nestedClusters.set(primaryKey, {
        primary: {
          id: `primary-${primaryKey}`,
          label: formatLabel(primaryKey),
          color: getClusterColor(primaryKey, primaryClusterBy),
          nodeIds: primaryNodes.map((n) => n.id),
          cx: 0,
          cy: 0,
          cz: 0,
        },
        secondary: secondaryClusters,
      });
    });
  }

  // Flatten clusters for easy access
  const allPrimaryClusters = Array.from(nestedClusters.values()).map((n) => n.primary);
  const allSecondaryClusters = Array.from(nestedClusters.values()).flatMap((n) => n.secondary);

  return { nodes, links, nestedClusters, allPrimaryClusters, allSecondaryClusters };
}

// ─────────────────────────────────────────────────────────────
// NESTED CLUSTER POSITIONING
// ─────────────────────────────────────────────────────────────

function applyNestedClusterPositions(
  nodes: GraphNode[],
  nestedClusters: Map<string, NestedClusterInfo>,
  clusterMode: ClusterMode,
  is3D: boolean = false,
  clusterSpacing: number = 0.8
) {
  if (clusterMode === 'none' || nestedClusters.size === 0) return;

  // Base radii (will be scaled by clusterSpacing)
  const basePrimaryRadius = 120;
  const baseSecondaryRadius = 50;
  
  const primaryRadius = basePrimaryRadius * clusterSpacing; // 36 to 180
  const secondaryRadius = clusterMode === 'nested' ? baseSecondaryRadius * clusterSpacing : 0; // 15 to 75
  const gridSpacing = 40; // Tighter spacing
  const jitter = 8;

  const primaryClusters = Array.from(nestedClusters.values());

  primaryClusters.forEach((nested, primaryIndex) => {
    const primaryAngle = (2 * Math.PI * primaryIndex) / primaryClusters.length;
    const primaryCenterX = Math.cos(primaryAngle) * primaryRadius;
    const primaryCenterY = Math.sin(primaryAngle) * primaryRadius;
    const primaryCenterZ = is3D ? (primaryIndex - primaryClusters.length / 2) * 40 : 0;

    if (clusterMode === 'single') {
      // Single-level: position all nodes directly in primary cluster
      const primaryNodes = nodes.filter((n) => nested.primary.nodeIds.includes(n.id));
      const cols = Math.max(1, Math.ceil(Math.sqrt(primaryNodes.length)));

      primaryNodes.forEach((node, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        node.x = primaryCenterX + (col - cols / 2) * gridSpacing + (Math.random() - 0.5) * jitter;
        node.y = primaryCenterY + (row - cols / 2) * gridSpacing + (Math.random() - 0.5) * jitter;
        if (is3D) {
          node.z = primaryCenterZ + (Math.random() - 0.5) * 30;
        }
      });
    } else {
      // Nested: position secondary clusters within primary
      const secondaryClusters = nested.secondary;
      secondaryClusters.forEach((secondary, secondaryIndex) => {
        const secondaryAngle = (2 * Math.PI * secondaryIndex) / Math.max(secondaryClusters.length, 1);
        const secondaryCenterX = primaryCenterX + Math.cos(secondaryAngle) * secondaryRadius;
        const secondaryCenterY = primaryCenterY + Math.sin(secondaryAngle) * secondaryRadius;
        const secondaryCenterZ = primaryCenterZ + (is3D ? (Math.random() - 0.5) * 20 : 0);

        const clusterNodes = nodes.filter((n) => secondary.nodeIds.includes(n.id));
        const cols = Math.max(1, Math.ceil(Math.sqrt(clusterNodes.length)));

        clusterNodes.forEach((node, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          node.x = secondaryCenterX + (col - cols / 2) * gridSpacing + (Math.random() - 0.5) * jitter;
          node.y = secondaryCenterY + (row - cols / 2) * gridSpacing + (Math.random() - 0.5) * jitter;
          if (is3D) {
            node.z = secondaryCenterZ + (Math.random() - 0.5) * 20;
          }
        });
      });
    }
  });
}

// ─────────────────────────────────────────────────────────────
// 2D HULL RENDERING
// ─────────────────────────────────────────────────────────────

function paintNestedHulls2D(
  ctx: CanvasRenderingContext2D,
  nestedClusters: Map<string, NestedClusterInfo>,
  nodes: GraphNode[],
  clusterMode: ClusterMode,
  showSecondary: boolean = true,
  showDomainHulls: boolean = false,
  primaryClusterBy: PrimaryClusterBy = 'domain',
  domainPodConfig?: Partial<Record<'navigate' | 'atlas' | 'cpc-internal', DomainPodConfig>>
) {
  // Allow drawing even if clusterMode is 'none' - domain hulls can be drawn independently
  if (clusterMode === 'none' && !showDomainHulls) return;

  nestedClusters.forEach((nested) => {
    // Draw primary (domain) hull ONLY when domain hulls are explicitly enabled
    // AND primaryClusterBy is 'domain'
    // This is INDEPENDENT of pod settings
    if (showDomainHulls && primaryClusterBy === 'domain') {
    const primaryNodes = nodes.filter((n) => nested.primary.nodeIds.includes(n.id));
    drawHull2D(ctx, primaryNodes, nested.primary.color, true, nested.primary.label);
    }

    // Draw secondary (pod) hulls - per-domain based on domainPodConfig
    // This is INDEPENDENT of showDomainHulls
    if (clusterMode === 'nested' && showSecondary) {
      const primaryKey = nested.primary.id.replace('primary-', '');
      const domain = primaryKey as 'navigate' | 'atlas' | 'cpc-internal';
      const podConfig = domainPodConfig?.[domain];
      
      // Only draw pod hulls if THIS SPECIFIC DOMAIN has pods enabled
      // This check is independent of showDomainHulls
      if (podConfig?.showPods) {
      nested.secondary.forEach((secondary) => {
        const secondaryNodes = nodes.filter((n) => secondary.nodeIds.includes(n.id));
        drawHull2D(ctx, secondaryNodes, secondary.color, false, secondary.label);
      });
      }
    }
  });
}

function drawHull2D(
  ctx: CanvasRenderingContext2D,
  nodes: GraphNode[],
  color: string,
  isPrimary: boolean,
  label: string
) {
  if (nodes.length < 3) return;

  const points: [number, number][] = nodes
    .filter((n) => n.x !== undefined && n.y !== undefined)
    .map((n) => [n.x!, n.y!]);

  if (points.length < 3) return;

  const hull = d3.polygonHull(points);
  if (!hull) return;

  // Expand hull for padding
  const centroid = d3.polygonCentroid(hull);
  const padding = isPrimary ? 40 : 20;
  const expandedHull = hull.map(([x, y]) => {
    const dx = x - centroid[0];
    const dy = y - centroid[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return [x, y] as [number, number];
    return [x + (dx / dist) * padding, y + (dy / dist) * padding] as [number, number];
  });

  // Draw hull
  ctx.beginPath();
  ctx.moveTo(expandedHull[0][0], expandedHull[0][1]);
  expandedHull.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.closePath();

  // Fill
  ctx.fillStyle = hexToRgba(color, isPrimary ? 0.06 : 0.1);
  ctx.fill();

  // Stroke
  ctx.strokeStyle = hexToRgba(color, isPrimary ? 0.4 : 0.5);
  ctx.lineWidth = isPrimary ? 2 : 1.5;
  if (isPrimary) {
    ctx.setLineDash([8, 4]);
  } else {
    ctx.setLineDash([]);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Label (only for primary)
  if (isPrimary) {
    ctx.font = 'bold 13px Inter, system-ui, sans-serif';
    ctx.fillStyle = hexToRgba(color, 0.9);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const topY = Math.min(...expandedHull.map(([, y]) => y));
    ctx.fillText(label, centroid[0], topY - 8);
  }
}

// ─────────────────────────────────────────────────────────────
// 3D HULL CREATION
// ─────────────────────────────────────────────────────────────

function create3DClusterSpheres(
  nestedClusters: Map<string, NestedClusterInfo>,
  nodes: GraphNode[],
  clusterMode: ClusterMode,
  showDomainHulls: boolean,
  primaryClusterBy: PrimaryClusterBy,
  domainPodConfig?: Partial<Record<'navigate' | 'atlas' | 'cpc-internal', DomainPodConfig>>
): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  // Allow creating meshes even if clusterMode is 'none' - domain hulls can be drawn independently
  if (clusterMode === 'none' && !showDomainHulls) return meshes;

  nestedClusters.forEach((nested) => {
    // Primary (domain) cluster sphere - ONLY when domain hulls are explicitly enabled
    // This is INDEPENDENT of pod settings
    if (showDomainHulls && primaryClusterBy === 'domain') {
    const primaryNodes = nodes.filter((n) => nested.primary.nodeIds.includes(n.id));
    const primaryMesh = createClusterSphere(primaryNodes, nested.primary.color, true);
    if (primaryMesh) meshes.push(primaryMesh);
    }

    // Secondary (pod) cluster spheres - per-domain based on domainPodConfig
    // This is INDEPENDENT of showDomainHulls
    if (clusterMode === 'nested') {
      const primaryKey = nested.primary.id.replace('primary-', '');
      const domain = primaryKey as 'navigate' | 'atlas' | 'cpc-internal';
      const podConfig = domainPodConfig?.[domain];
      
      // Only create pod spheres if THIS SPECIFIC DOMAIN has pods enabled
      // This check is independent of showDomainHulls
      if (podConfig?.showPods) {
      nested.secondary.forEach((secondary) => {
        const secondaryNodes = nodes.filter((n) => secondary.nodeIds.includes(n.id));
        const secondaryMesh = createClusterSphere(secondaryNodes, secondary.color, false);
        if (secondaryMesh) meshes.push(secondaryMesh);
      });
      }
    }
  });

  return meshes;
}

function createClusterSphere(nodes: GraphNode[], color: string, isPrimary: boolean): THREE.Mesh | null {
  if (nodes.length < 2) return null;

  // Calculate centroid
  let cx = 0, cy = 0, cz = 0;
  let validCount = 0;
  nodes.forEach((node) => {
    if (node.x !== undefined && node.y !== undefined) {
      cx += node.x;
      cy += node.y;
      cz += node.z || 0;
      validCount++;
    }
  });

  if (validCount === 0) return null;
  cx /= validCount;
  cy /= validCount;
  cz /= validCount;

  // Calculate radius (max distance from centroid + padding)
  let maxDist = 0;
  nodes.forEach((node) => {
    if (node.x !== undefined && node.y !== undefined) {
      const dx = node.x - cx;
      const dy = node.y - cy;
      const dz = (node.z || 0) - cz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      maxDist = Math.max(maxDist, dist);
    }
  });

  const padding = isPrimary ? 50 : 25;
  const radius = maxDist + padding;

  // Create sphere
  const geometry = new THREE.SphereGeometry(radius, 24, 24);
  const threeColor = new THREE.Color(color);
  const material = new THREE.MeshBasicMaterial({
    color: threeColor,
    transparent: true,
    opacity: isPrimary ? 0.08 : 0.12,
    side: THREE.BackSide, // Render inside surface so nodes appear inside
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(cx, cy, cz);
  mesh.userData = { isPrimary };
  return mesh;
}

function update3DClusterSpheres(
  meshes: THREE.Mesh[],
  nestedClusters: Map<string, NestedClusterInfo>,
  nodes: GraphNode[],
  clusterMode: ClusterMode
) {
  let meshIndex = 0;
  if (clusterMode === 'none') return;

  nestedClusters.forEach((nested) => {
    // Update primary
    if (meshIndex < meshes.length) {
      const primaryNodes = nodes.filter((n) => nested.primary.nodeIds.includes(n.id));
      updateSpherePosition(meshes[meshIndex], primaryNodes, true);
      meshIndex++;
    }

    // Update secondary (only in nested mode)
    if (clusterMode === 'nested') {
      nested.secondary.forEach((secondary) => {
        if (meshIndex < meshes.length) {
          const secondaryNodes = nodes.filter((n) => secondary.nodeIds.includes(n.id));
          updateSpherePosition(meshes[meshIndex], secondaryNodes, false);
          meshIndex++;
        }
      });
    }
  });
}

function updateSpherePosition(mesh: THREE.Mesh, nodes: GraphNode[], isPrimary: boolean) {
  if (nodes.length < 2) return;

  let cx = 0, cy = 0, cz = 0;
  let validCount = 0;
  let maxDist = 0;

  nodes.forEach((node) => {
    if (node.x !== undefined && node.y !== undefined) {
      cx += node.x;
      cy += node.y;
      cz += node.z || 0;
      validCount++;
    }
  });

  if (validCount === 0) return;
  cx /= validCount;
  cy /= validCount;
  cz /= validCount;

  nodes.forEach((node) => {
    if (node.x !== undefined && node.y !== undefined) {
      const dx = node.x - cx;
      const dy = node.y - cy;
      const dz = (node.z || 0) - cz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      maxDist = Math.max(maxDist, dist);
    }
  });

  const padding = isPrimary ? 50 : 25;
  const radius = maxDist + padding;

  mesh.position.set(cx, cy, cz);
  const baseRadius = (mesh.geometry as THREE.SphereGeometry).parameters.radius;
  mesh.scale.setScalar(radius / baseRadius);
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function UnifiedNetworkGraph({
  entities,
  relationships,
  mode = '2d',
  colorBy = 'entityType',
  clusterMode = 'none',
  primaryClusterBy = 'domain',
  secondaryClusterBy = 'entityType',
  domainPodConfig,
  showDomainHulls = false,
  clusterTightness = 0.5,
  clusterSpacing = 0.8,
  velocityDecay = 0.7,
  maxVelocity = 18,
  maxDistance = 1000,
  className = '',
  fitToCanvas = true,
  clickToFocus = true,
  onNodeSelect,
}: UnifiedNetworkGraphProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hullMeshesRef = useRef<THREE.Mesh[]>([]);
  const frameCountRef = useRef(0);

  // Highlight state
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<GraphNode>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<GraphLink>>(new Set());

  // Compute cluster strengths from tightness
  const primaryStrength = clusterTightness * 0.4; // 0.04 to 0.4
  const secondaryStrength = clusterTightness * 0.6; // 0.06 to 0.6

  // Build graph data
  const graphData = useMemo(
    () => buildGraphData(entities, relationships, colorBy, clusterMode, primaryClusterBy, secondaryClusterBy, domainPodConfig),
    [entities, relationships, colorBy, clusterMode, primaryClusterBy, secondaryClusterBy, domainPodConfig]
  );

  // Apply initial cluster positions
  useEffect(() => {
    if (clusterMode !== 'none' && graphData.nestedClusters.size > 0) {
      applyNestedClusterPositions(graphData.nodes, graphData.nestedClusters, clusterMode, mode === '3d', clusterSpacing);
    }
  }, [graphData, clusterMode, mode, clusterSpacing]);

  // ─────────────────────────────────────────────────────────────
  // NESTED CLUSTER FORCE
  // ─────────────────────────────────────────────────────────────

  const nestedClusterForce = useCallback(() => {
    if (clusterMode === 'none') return null;

    const nodes = graphData.nodes;

    return (alpha: number) => {
      // Calculate primary centroids
      const primaryCentroids = new Map<string, { cx: number; cy: number; cz: number; count: number }>();

      nodes.forEach((node) => {
        if (!primaryCentroids.has(node.primaryCluster)) {
          primaryCentroids.set(node.primaryCluster, { cx: 0, cy: 0, cz: 0, count: 0 });
        }
        const c = primaryCentroids.get(node.primaryCluster)!;
        c.cx += node.x || 0;
        c.cy += node.y || 0;
        c.cz += node.z || 0;
        c.count += 1;
      });

      primaryCentroids.forEach((c) => {
        if (c.count > 0) {
          c.cx /= c.count;
          c.cy /= c.count;
          c.cz /= c.count;
        }
      });

      // Calculate secondary centroids (only in nested mode)
      const secondaryCentroids = new Map<string, { cx: number; cy: number; cz: number; count: number }>();

      if (clusterMode === 'nested') {
        nodes.forEach((node) => {
          const key = `${node.primaryCluster}|${node.secondaryCluster}`;
          if (!secondaryCentroids.has(key)) {
            secondaryCentroids.set(key, { cx: 0, cy: 0, cz: 0, count: 0 });
          }
          const c = secondaryCentroids.get(key)!;
          c.cx += node.x || 0;
          c.cy += node.y || 0;
          c.cz += node.z || 0;
          c.count += 1;
        });

        secondaryCentroids.forEach((c) => {
          if (c.count > 0) {
            c.cx /= c.count;
            c.cy /= c.count;
            c.cz /= c.count;
          }
        });
      }

      // Apply forces
      nodes.forEach((node) => {
        // Primary force (weaker)
        const primaryC = primaryCentroids.get(node.primaryCluster);
        if (primaryC && primaryC.count > 1) {
          const dx1 = primaryC.cx - (node.x || 0);
          const dy1 = primaryC.cy - (node.y || 0);
          const dz1 = primaryC.cz - (node.z || 0);
          const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1 + dz1 * dz1);
          if (dist1 > 0) {
            const str = dist1 * primaryStrength * alpha;
            node.vx = (node.vx || 0) + (dx1 / dist1) * str;
            node.vy = (node.vy || 0) + (dy1 / dist1) * str;
            if (mode === '3d') {
              node.vz = (node.vz || 0) + (dz1 / dist1) * str;
            }
          }
        }

        // Secondary force (stronger, only in nested mode)
        if (clusterMode === 'nested') {
          const key = `${node.primaryCluster}|${node.secondaryCluster}`;
          const secondaryC = secondaryCentroids.get(key);
          if (secondaryC && secondaryC.count > 1) {
            const dx2 = secondaryC.cx - (node.x || 0);
            const dy2 = secondaryC.cy - (node.y || 0);
            const dz2 = secondaryC.cz - (node.z || 0);
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2);
            if (dist2 > 0) {
              const str = dist2 * secondaryStrength * alpha;
              node.vx = (node.vx || 0) + (dx2 / dist2) * str;
              node.vy = (node.vy || 0) + (dy2 / dist2) * str;
              if (mode === '3d') {
                node.vz = (node.vz || 0) + (dz2 / dist2) * str;
              }
            }
          }
        }

        // Velocity clamping (prevent explosion)
        node.vx = Math.max(-maxVelocity, Math.min(maxVelocity, node.vx || 0));
        node.vy = Math.max(-maxVelocity, Math.min(maxVelocity, node.vy || 0));
        if (mode === '3d') {
          node.vz = Math.max(-maxVelocity, Math.min(maxVelocity, node.vz || 0));
        }

        // Boundary constraint (keep nodes within maxDistance from center)
        const dist = Math.sqrt((node.x || 0) ** 2 + (node.y || 0) ** 2);
        if (dist > maxDistance) {
          const scale = (maxDistance / dist) * 0.95;
          node.x = (node.x || 0) * scale;
          node.y = (node.y || 0) * scale;
          // Also reduce velocity when hitting boundary
          node.vx = (node.vx || 0) * 0.8;
          node.vy = (node.vy || 0) * 0.8;
        }
      });
    };
  }, [graphData.nodes, clusterMode, primaryStrength, secondaryStrength, mode, maxVelocity, maxDistance]);

  // ─────────────────────────────────────────────────────────────
  // CONFIGURE FORCES
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!graphRef.current) return;

    const fg = graphRef.current;

    // Link strength based on cluster membership
    fg.d3Force('link')?.strength((link: GraphLink) => {
      if (clusterMode === 'none') return 0.3;

      const sourceNode =
        typeof link.source === 'object'
          ? link.source
          : graphData.nodes.find((n) => n.id === link.source);
      const targetNode =
        typeof link.target === 'object'
          ? link.target
          : graphData.nodes.find((n) => n.id === link.target);

      if (!sourceNode || !targetNode) return 0.3;

      // Same primary + same secondary: strongest
      if (
        sourceNode.primaryCluster === targetNode.primaryCluster &&
        sourceNode.secondaryCluster === targetNode.secondaryCluster
      ) {
        return 0.9;
      }

      // Same primary, different secondary: medium
      if (sourceNode.primaryCluster === targetNode.primaryCluster) {
        return 0.3;
      }

      // Different primary: weakest
      return 0.05;
    });

    // Charge force
    fg.d3Force('charge')?.strength(-120);

    // Add nested cluster force
    const clusterF = nestedClusterForce();
    if (clusterF) {
      fg.d3Force('cluster', clusterF);
    } else {
      fg.d3Force('cluster', null);
    }

    // Reheat simulation
    // Note: Explosion prevention is handled by:
    // - Velocity clamping (maxVelocity)
    // - Boundary constraint (maxDistance)
    // - Higher velocity decay (velocityDecay prop)
    // The reheatAlpha parameter is available for future use if we can access simulation directly
    fg.d3ReheatSimulation();
  }, [clusterMode, nestedClusterForce, graphData.nodes]);

  // ─────────────────────────────────────────────────────────────
  // 3D HULL MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  // Setup/update 3D hulls when dependencies change
  useEffect(() => {
    // Check if any hulls should be shown (domain hulls OR any pod hulls)
    const hasAnyPodHulls = domainPodConfig ? Object.values(domainPodConfig).some((config) => config?.showPods ?? false) : false;
    const shouldShowAnyHulls = showDomainHulls || hasAnyPodHulls;
    
    // Clean up if switching away from 3D or no hulls should be shown
    if (mode !== '3d' || !shouldShowAnyHulls) {
      // Only try to clean up if we have meshes and we're in 3D mode
      if (mode === '3d' && graphRef.current && typeof graphRef.current.scene === 'function') {
        try {
          const scene = graphRef.current.scene();
          if (scene) {
            hullMeshesRef.current.forEach((mesh) => scene.remove(mesh));
            hullMeshesRef.current = [];
          }
        } catch {
          // If scene() fails, just clear the refs
          hullMeshesRef.current = [];
        }
      } else {
        // Not in 3D mode, just clear the refs
        hullMeshesRef.current = [];
      }
      return;
    }

    // Only proceed if we have a valid 3D graph ref
    if (!graphRef.current || typeof graphRef.current.scene !== 'function') {
      return;
    }

    let meshes: THREE.Mesh[] = [];
    
    try {
      const scene = graphRef.current.scene();
      if (!scene) {
        // Return cleanup even if scene is null
        return () => {
          hullMeshesRef.current = [];
        };
      }

      // Remove existing hulls
      hullMeshesRef.current.forEach((mesh) => scene.remove(mesh));

      // Create new hulls - pass independent flags
      meshes = create3DClusterSpheres(
        graphData.nestedClusters,
        graphData.nodes,
        clusterMode,
        showDomainHulls,
        primaryClusterBy,
        domainPodConfig
      );
      meshes.forEach((mesh) => scene.add(mesh));

      hullMeshesRef.current = meshes;
      frameCountRef.current = 0;
    } catch (error) {
      // If scene access fails, just clear refs
      console.warn('Failed to setup 3D hulls:', error);
      hullMeshesRef.current = [];
    }

    // Cleanup function - always returned
    return () => {
      const currentGraphRef = graphRef.current;
      if (currentGraphRef && typeof currentGraphRef.scene === 'function') {
        try {
          const scene = currentGraphRef.scene();
          if (scene) {
            hullMeshesRef.current.forEach((mesh) => scene.remove(mesh));
          }
        } catch {
          // Ignore cleanup errors
        }
      }
      hullMeshesRef.current = [];
    };
  }, [mode, showDomainHulls, clusterMode, primaryClusterBy, domainPodConfig, graphData.nestedClusters, graphData.nodes]);

  // Handle engine ticks to update hull positions
  const handleEngineTick = useCallback(() => {
    // Check if any hulls should be shown (domain hulls OR any pod hulls)
    const hasAnyPodHulls = domainPodConfig ? Object.values(domainPodConfig).some((config) => config?.showPods ?? false) : false;
    const shouldShowAnyHulls = showDomainHulls || hasAnyPodHulls;
    
    if (mode !== '3d' || !shouldShowAnyHulls || hullMeshesRef.current.length === 0) {
      return;
    }

    frameCountRef.current++;
    // Update hulls every 8 frames for performance
    if (frameCountRef.current % 8 === 0) {
      update3DClusterSpheres(hullMeshesRef.current, graphData.nestedClusters, graphData.nodes, clusterMode);
    }
  }, [mode, showDomainHulls, domainPodConfig, clusterMode, graphData.nestedClusters, graphData.nodes]);

  // ─────────────────────────────────────────────────────────────
  // EVENT HANDLERS
  // ─────────────────────────────────────────────────────────────

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    const newHighlightNodes = new Set<GraphNode>();
    const newHighlightLinks = new Set<GraphLink>();

    if (node) {
      newHighlightNodes.add(node);
      node.neighbors.forEach((neighbor) => newHighlightNodes.add(neighbor));
      node.links.forEach((link) => newHighlightLinks.add(link));
    }

    setHoverNode(node);
    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode | null) => {
      onNodeSelect?.(node?.entity ?? null);

      if (clickToFocus && node && graphRef.current) {
        if (mode === '2d') {
          graphRef.current.centerAt(node.x || 0, node.y || 0, 1000);
          graphRef.current.zoom(3, 1000);
        } else {
          const distance = 120;
          graphRef.current.cameraPosition(
            { x: (node.x || 0) + distance, y: node.y || 0, z: (node.z || 0) + distance },
            node,
            1000
          );
        }
      }
    },
    [clickToFocus, mode, onNodeSelect]
  );

  const handleBackgroundClick = useCallback(() => {
    setHoverNode(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // Fit to canvas
  useEffect(() => {
    if (!fitToCanvas || !graphRef.current || graphData.nodes.length === 0) return;

    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit(400, 50);
    }, 1000);

    return () => clearTimeout(timer);
  }, [fitToCanvas, graphData.nodes.length]);

  // ─────────────────────────────────────────────────────────────
  // SHARED PROPS
  // ─────────────────────────────────────────────────────────────

  const sharedProps = {
    ref: graphRef,
    graphData: graphData,
    nodeId: 'id',
    nodeLabel: 'name',
    nodeVal: 'val',
    nodeColor: (nodeObj: unknown) => {
      const node = nodeObj as GraphNode;
      if (!hoverNode) return node.color;
      return highlightNodes.has(node) ? node.color : hexToRgba(node.color, 0.12);
    },
    linkColor: (linkObj: unknown) => {
      const link = linkObj as GraphLink;
      if (!hoverNode) return 'rgba(156, 163, 175, 0.25)';
      return highlightLinks.has(link) ? '#F59E0B' : 'rgba(156, 163, 175, 0.03)';
    },
    linkWidth: (linkObj: unknown) => (highlightLinks.has(linkObj as GraphLink) ? 2.5 : 0.8),
    linkDirectionalParticles: (linkObj: unknown) => (highlightLinks.has(linkObj as GraphLink) ? 4 : 0),
    linkDirectionalParticleWidth: 3,
    linkDirectionalParticleColor: () => '#F59E0B',
    onNodeHover: (node: GraphNode | null) => handleNodeHover(node),
    onNodeClick: (node: GraphNode | null) => handleNodeClick(node),
    onBackgroundClick: handleBackgroundClick,
    cooldownTicks: 300,
    d3AlphaDecay: 0.015,
    d3VelocityDecay: velocityDecay, // Use parameter (default 0.4 for faster slowdown)
  };

  // ─────────────────────────────────────────────────────────────
  // 2D RENDER
  // ─────────────────────────────────────────────────────────────

  const render2D = () => (
    <ForceGraph2D
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(sharedProps as any)}
      nodeCanvasObjectMode={() => 'after'}
      nodeCanvasObject={(nodeObj: unknown, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const graphNode = nodeObj as GraphNode;
        if (graphNode.x === undefined || graphNode.y === undefined) return;

        const size = Math.sqrt(graphNode.val) * 4 + 2;

        // Highlight ring (only for highlighted nodes)
        if (highlightNodes.has(graphNode)) {
          ctx.beginPath();
          ctx.arc(graphNode.x, graphNode.y, size + 3, 0, 2 * Math.PI);
          ctx.fillStyle = graphNode === hoverNode ? '#F59E0B' : hexToRgba('#F59E0B', 0.4);
          ctx.fill();
        }

        // Permanent label under node — always visible, scales with zoom
        const label = graphNode.name;
        const baseFontSize = 10;
        const fontSize = Math.min(baseFontSize, Math.max(3, baseFontSize / globalScale));

        // Only show label when zoomed in enough (globalScale > 0.5)
        // And fade in as you zoom closer
        const labelOpacity = Math.min(1, Math.max(0, (globalScale - 0.4) * 1.5));

        if (labelOpacity > 0.1) {
          ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = `rgba(75, 85, 99, ${labelOpacity * 0.8})`; // gray-600 with opacity

          // Truncate long names
          const maxLength = 16;
          const displayText = label.length > maxLength ? `${label.slice(0, maxLength)}…` : label;

          ctx.fillText(displayText, graphNode.x, graphNode.y + size + 2);
        }
      }}
      onRenderFramePost={(ctx: CanvasRenderingContext2D) => {
        // Draw hulls if either domain hulls or any pod hulls should be shown
        // This is checked inside paintNestedHulls2D per-domain
        if (clusterMode !== 'none' || showDomainHulls) {
          paintNestedHulls2D(
            ctx,
            graphData.nestedClusters,
            graphData.nodes,
            clusterMode,
            clusterMode === 'nested',
            showDomainHulls,
            primaryClusterBy,
            domainPodConfig
          );
        }
      }}
      enableZoomInteraction={true}
      enablePanInteraction={true}
    />
  );

  // ─────────────────────────────────────────────────────────────
  // 3D RENDER
  // ─────────────────────────────────────────────────────────────

  const render3D = () => (
    <ForceGraph3D
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(sharedProps as any)}
      nodeOpacity={0.9}
      linkOpacity={0.4}
      enableNavigationControls={true}
      backgroundColor="#f8fafc"
      onEngineTick={handleEngineTick}
    />
  );

  // ─────────────────────────────────────────────────────────────
  // LEGEND
  // ─────────────────────────────────────────────────────────────

  const legendItems = useMemo<Array<{ label: string; color: string; count?: number }>>(() => {
    // Show primary clusters as legend when clustering
    if (clusterMode !== 'none') {
      return graphData.allPrimaryClusters.map((c) => ({
        label: c.label,
        color: c.color,
        count: c.nodeIds.length,
      }));
    }

    // Otherwise show by colorBy
    switch (colorBy) {
      case 'domain':
        return Object.entries(DOMAIN_COLORS).map(([k, v]) => ({
          label: formatLabel(k),
          color: v,
        }));
      case 'entityType':
        return Object.entries(ENTITY_TYPE_COLORS).map(([k, v]) => ({
          label: formatLabel(k),
          color: v,
        }));
      case 'stakeholderCategory':
        return Object.entries(STAKEHOLDER_CATEGORY_COLORS).map(([k, v]) => ({
          label: k,
          color: v,
        }));
      case 'mode':
        return Object.entries(MODE_COLORS).map(([k, v]) => ({
          label: formatLabel(k),
          color: v,
        }));
      case 'theme':
        return Object.entries(THEME_COLORS).map(([k, v]) => ({
          label: formatLabel(k),
          color: v,
        }));
      case 'sector':
        return Object.entries(SECTOR_COLORS)
          .filter(([k]) => !k.includes('_')) // Only show primary keys, not normalized duplicates
          .map(([k, v]) => ({
            label: formatLabel(k),
            color: v,
          }));
      default:
        return [];
    }
  }, [colorBy, clusterMode, graphData.allPrimaryClusters]);

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-slate-50 ${className}`}>
      {mode === '2d' ? render2D() : render3D()}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-3 text-xs max-h-72 overflow-y-auto">
        <div className="font-semibold text-gray-700 mb-2">
          {clusterMode !== 'none' ? `Clusters: ${formatLabel(primaryClusterBy)}` : formatLabel(colorBy)}
        </div>
      <div className="space-y-1.5">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-gray-600 truncate">{item.label}</span>
            {item.count !== undefined ? (
              <span className="text-gray-400 text-[10px]">({item.count})</span>
            ) : null}
          </div>
        ))}
      </div>
      </div>

      {/* Info + cluster badges (stacked top-left) */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm px-3 py-1.5 text-xs font-medium text-gray-600">
          {mode.toUpperCase()} • {graphData.nodes.length} nodes • {graphData.links.length} links
          {clusterMode !== 'none' && (
            <span className="text-[#006E51]"> • {graphData.allPrimaryClusters.length} clusters</span>
          )}
        </div>
        {clusterMode !== 'none' && (
          <div className="bg-white/90