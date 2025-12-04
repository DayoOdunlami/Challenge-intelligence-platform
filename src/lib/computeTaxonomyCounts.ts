import { DOMAIN_CONFIGS, type SupportedDomain, type TaxonomyConfig } from '@/config/domainTaxonomyConfig';
import type { BaseEntity } from '@/lib/base-entity';

export interface TaxonomyValueCount {
  value: string;
  count: number;
  color: string;
}

export interface TaxonomyWithCounts {
  key: TaxonomyConfig['key'];
  label: string;
  isDefault: boolean;
  isAvailable: boolean;
  totalCount: number;
  values: TaxonomyValueCount[];
}

export interface DomainTaxonomies {
  domain: SupportedDomain;
  taxonomies: TaxonomyWithCounts[];
}

const DEFAULT_COLOR = '#9CA3AF';

export function computeTaxonomyCounts(nodes: BaseEntity[], domain: SupportedDomain): DomainTaxonomies {
  const domainConfig = DOMAIN_CONFIGS[domain];
  const domainNodes = nodes.filter((node) => node.domain === domain);

  const taxonomies: TaxonomyWithCounts[] = domainConfig.taxonomies.map((taxonomy) => {
    const counts = new Map<string, number>();

    domainNodes.forEach((node) => {
      const value = taxonomy.getNodeValue(node);
      if (!value) return;
      counts.set(value, (counts.get(value) || 0) + 1);
    });

    const values: TaxonomyValueCount[] = taxonomy.values.map((value) => ({
      value,
      count: counts.get(value) || 0,
      color: taxonomy.palette[value] || DEFAULT_COLOR,
    }));

    counts.forEach((count, value) => {
      if (!taxonomy.values.includes(value)) {
        values.push({ value, count, color: DEFAULT_COLOR });
      }
    });

    const totalCount = values.reduce((sum, entry) => sum + entry.count, 0);

    return {
      key: taxonomy.key,
      label: taxonomy.label,
      isDefault: Boolean(taxonomy.isDefault),
      isAvailable: totalCount > 0,
      totalCount,
      values: values.sort((a, b) => b.count - a.count),
    };
  });

  return { domain, taxonomies };
}

export function getVisibleTaxonomies(domainTaxonomies: DomainTaxonomies): TaxonomyWithCounts[] {
  return domainTaxonomies.taxonomies.filter((taxonomy) => taxonomy.isDefault || taxonomy.isAvailable);
}

