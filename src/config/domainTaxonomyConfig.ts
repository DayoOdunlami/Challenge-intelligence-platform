import type { BaseEntity } from '@/lib/base-entity';

export type SupportedDomain = 'navigate' | 'atlas' | 'cpc-internal';

export type TaxonomyKey =
  | 'entityType'
  | 'stakeholderCategory'
  | 'sector'
  | 'businessUnit'
  | 'trl'
  | 'challengeType'
  | 'focusArea';

export interface TaxonomyConfig {
  key: TaxonomyKey;
  label: string;
  values: string[];
  palette: Record<string, string>;
  getNodeValue: (node: BaseEntity) => string | undefined;
  isDefault?: boolean;
}

export interface DomainConfig {
  domain: SupportedDomain;
  label: string;
  color: string;
  defaultTaxonomy: TaxonomyKey;
  taxonomies: TaxonomyConfig[];
}

const fallback = (value?: string) => (value ? String(value).trim() : undefined);

/**
 * Normalize sector values from data (snake_case) to display names
 */
function normalizeSector(rawValue?: string): string | undefined {
  if (!rawValue) return undefined;
  const normalized = rawValue.trim().toLowerCase();
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
  return sectorMap[normalized] || rawValue;
}

export const DOMAIN_CONFIGS: Record<SupportedDomain, DomainConfig> = {
  navigate: {
    domain: 'navigate',
    label: 'Navigate',
    color: '#3B82F6',
    defaultTaxonomy: 'stakeholderCategory',
    taxonomies: [
      {
        key: 'stakeholderCategory',
        label: 'Stakeholder Category',
        isDefault: true,
        values: ['Government', 'Intermediary', 'Academia', 'Industry', 'Project', 'Working Group'],
        palette: {
          Government: '#1E40AF',
          Intermediary: '#3B82F6',
          Academia: '#06B6D4',
          Industry: '#10B981',
          Project: '#6366F1',
          'Working Group': '#8B5CF6',
        },
        getNodeValue: (node) => {
          if (node.entityType === 'project') return 'Project';
          if (node.entityType === 'stakeholder') {
            const category =
              fallback(node.metadata?.category as string) ||
              fallback((node.metadata?.custom as { type?: string })?.type);
            if (category) {
              return category === 'Research' ? 'Academia' : category;
            }
          }
          if (node.name?.toLowerCase().includes('working group')) return 'Working Group';
          return fallback(node.entityType);
        },
      },
      {
        key: 'trl',
        label: 'TRL Bucket',
        values: ['TRL 1-3 (Research)', 'TRL 4-6 (Development)', 'TRL 7-9 (Deployment)'],
        palette: {
          'TRL 1-3 (Research)': '#FEF3C7',
          'TRL 4-6 (Development)': '#FCD34D',
          'TRL 7-9 (Deployment)': '#F59E0B',
        },
        getNodeValue: (node) => {
          const trl =
            typeof node.metadata?.trl === 'number'
              ? node.metadata?.trl
              : typeof node.metadata?.trl === 'object'
              ? (node.metadata?.trl as { current?: number })?.current
              : (node.metadata?.technologyReadinessLevel as number | undefined);
          if (typeof trl !== 'number') return undefined;
          if (trl <= 3) return 'TRL 1-3 (Research)';
          if (trl <= 6) return 'TRL 4-6 (Development)';
          return 'TRL 7-9 (Deployment)';
        },
      },
      {
        key: 'entityType',
        label: 'Entity Type',
        values: ['Stakeholder', 'Technology', 'Project', 'Working Group'],
        palette: {
          Stakeholder: '#3B82F6',
          Technology: '#10B981',
          Project: '#F59E0B',
          'Working Group': '#8B5CF6',
        },
        getNodeValue: (node) => {
          if (node.name?.toLowerCase().includes('working group')) return 'Working Group';
          return fallback(node.entityType);
        },
      },
    ],
  },
  atlas: {
    domain: 'atlas',
    label: 'Atlas',
    color: '#F59E0B',
    defaultTaxonomy: 'sector',
    taxonomies: [
      {
        key: 'sector',
        label: 'Sector',
        isDefault: true,
        values: ['Rail', 'Energy', 'Local Gov', 'Transport', 'Built Env', 'Aviation'],
        palette: {
          Rail: '#DC2626',
          Energy: '#F59E0B',
          'Local Gov': '#84CC16',
          Transport: '#06B6D4',
          'Built Env': '#8B5CF6',
          Aviation: '#EC4899',
        },
        getNodeValue: (node) => {
          const sector = node.metadata?.sector;
          const rawValue = Array.isArray(sector) ? sector[0] : (sector as string) || (node.metadata?.primarySector as string);
          return normalizeSector(rawValue);
        },
      },
      {
        key: 'challengeType',
        label: 'Challenge Type',
        values: ['Decarbonisation', 'Accessibility', 'Safety', 'Efficiency', 'Resilience'],
        palette: {
          Decarbonisation: '#10B981',
          Accessibility: '#3B82F6',
          Safety: '#EF4444',
          Efficiency: '#F59E0B',
          Resilience: '#8B5CF6',
        },
        getNodeValue: (node) =>
          fallback((node.metadata?.challengeType as string) || (node.metadata?.primaryChallenge as string)),
      },
      {
        key: 'entityType',
        label: 'Entity Type',
        values: ['Challenge', 'Solution', 'Stakeholder', 'Trend'],
        palette: {
          Challenge: '#EF4444',
          Solution: '#10B981',
          Stakeholder: '#3B82F6',
          Trend: '#8B5CF6',
        },
        getNodeValue: (node) => fallback(node.entityType),
      },
    ],
  },
  'cpc-internal': {
    domain: 'cpc-internal',
    label: 'CPC',
    color: '#8B5CF6',
    defaultTaxonomy: 'businessUnit',
    taxonomies: [
      {
        key: 'businessUnit',
        label: 'Business Unit',
        isDefault: true,
        values: ['Rail', 'Integrated Transport', 'Aviation', 'Energy', 'Digital', 'Strategy'],
        palette: {
          Rail: '#7C3AED',
          'Integrated Transport': '#A855F7',
          Aviation: '#C084FC',
          Energy: '#E879F9',
          Digital: '#F0ABFC',
          Strategy: '#6366F1',
        },
        getNodeValue: (node) => {
          const bu = (node.metadata?.custom as { businessUnit?: string; department?: string })?.businessUnit || 
            (node.metadata?.custom as { businessUnit?: string; department?: string })?.department;
          if (!bu) return undefined;
          // Normalize "Transport" to "Integrated Transport" for consistency
          const normalized = bu.trim();
          if (normalized === 'Transport' || normalized === 'transport') {
            return 'Integrated Transport';
          }
          return fallback(normalized);
        },
      },
      {
        key: 'focusArea',
        label: 'Focus Area',
        values: ['Net Zero', 'Future Mobility', 'Digital Twin', 'Data & AI', 'Policy'],
        palette: {
          'Net Zero': '#10B981',
          'Future Mobility': '#3B82F6',
          'Digital Twin': '#8B5CF6',
          'Data & AI': '#EC4899',
          Policy: '#F59E0B',
        },
        getNodeValue: (node) => fallback(node.metadata?.focusArea as string),
      },
      {
        key: 'entityType',
        label: 'Entity Type',
        values: ['Capability', 'Initiative', 'Team', 'Asset'],
        palette: {
          Capability: '#8B5CF6',
          Initiative: '#A855F7',
          Team: '#C084FC',
          Asset: '#E879F9',
        },
        getNodeValue: (node) => fallback(node.entityType),
      },
    ],
  },
};

export const DOMAIN_PALETTE: Record<SupportedDomain, string> = {
  navigate: DOMAIN_CONFIGS.navigate.color,
  atlas: DOMAIN_CONFIGS.atlas.color,
  'cpc-internal': DOMAIN_CONFIGS['cpc-internal'].color,
};

