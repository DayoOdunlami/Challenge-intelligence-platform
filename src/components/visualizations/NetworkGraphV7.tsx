'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import { unifiedEntities, unifiedRelationships } from '@/data/unified';
import type { BaseEntity, UniversalRelationship } from '@/lib/base-entity';
import {
  DOMAIN_CONFIGS,
  type SupportedDomain,
  type TaxonomyKey,
} from '@/config/domainTaxonomyConfig';
import {
  computeTaxonomyCounts,
  type DomainTaxonomies,
} from '@/lib/computeTaxonomyCounts';
import {
  NetworkControlsV7,
  type DomainFilterMap,
} from '@/components/controls/NetworkControlsV7';
import {
  UnifiedNetworkGraph,
  type ColorBy,
  type ClusterMode,
  type PrimaryClusterBy,
  type SecondaryClusterBy,
} from '@/components/visualizations/UnifiedNetworkGraphNested';

const SUPPORTED_DOMAINS: SupportedDomain[] = ['navigate', 'atlas', 'cpc-internal'];
const SUPPORTED_DOMAIN_SET = new Set<SupportedDomain>(SUPPORTED_DOMAINS);

function createInitialFilterState(): DomainFilterMap {
  return SUPPORTED_DOMAINS.reduce<DomainFilterMap>((acc, domain) => {
    const domainConfig = DOMAIN_CONFIGS[domain];
    const defaultTaxonomy =
      domainConfig.taxonomies.find((taxonomy) => taxonomy.key === domainConfig.defaultTaxonomy) ??
      domainConfig.taxonomies[0];
    acc[domain] = {
      taxonomyKey: defaultTaxonomy?.key ?? domainConfig.defaultTaxonomy,
      selectedValues: [],
      applyCluster: true,
      showHulls: true,
    };
    return acc;
  }, {} as DomainFilterMap);
}

export function NetworkGraphV7() {
  const [activeDomains, setActiveDomains] = useState<SupportedDomain[]>(['navigate']);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [showDomainHulls, setShowDomainHulls] = useState(false);
  const [colorByDomain, setColorByDomain] = useState(false);
  const [clusterTightness, setClusterTightness] = useState(0.6);
  const [clusterSpacing, setClusterSpacing] = useState(0.8);
  // Advanced simulation parameters (V7 defaults)
  const [velocityDecay, setVelocityDecay] = useState(0.7);
  const [maxVelocity, setMaxVelocity] = useState(18);
  const [maxDistance, setMaxDistance] = useState(1000);
  const [domainFilters, setDomainFilters] = useState<DomainFilterMap>(() => createInitialFilterState());
  const [selectedEntity, setSelectedEntity] = useState<BaseEntity | null>(null);

  const taxonomyData = useMemo(() => {
    const result: Partial<Record<SupportedDomain, DomainTaxonomies>> = {};
    SUPPORTED_DOMAINS.forEach((domain) => {
      const nodes = unifiedEntities.filter((entity) => entity.domain === domain);
      result[domain] = computeTaxonomyCounts(nodes, domain);
    });
    return result;
  }, []);

  const activeDomainSet = useMemo(() => new Set<SupportedDomain>(activeDomains), [activeDomains]);
  const multiDomain = activeDomains.length > 1;
  const singleDomain = !multiDomain ? activeDomains[0] : null;

  const handleToggleDomain = useCallback((domain: SupportedDomain) => {
    setActiveDomains((prev) => {
      const exists = prev.includes(domain);
      if (exists) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((item) => item !== domain);
      }
      return [...prev, domain];
    });
  }, []);

  const handleTaxonomyChange = useCallback((domain: SupportedDomain, taxonomyKey: TaxonomyKey) => {
    setDomainFilters((prev) => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        taxonomyKey,
        selectedValues: [],
      },
    }));
  }, []);

  const handleValueToggle = useCallback(
    (domain: SupportedDomain, value: string, availableValues: string[]) => {
      setDomainFilters((prev) => {
        const domainState = prev[domain];
        const activeValues = domainState.selectedValues.length > 0 ? domainState.selectedValues : availableValues;
        const isActive = activeValues.includes(value);
        const nextValues = isActive
          ? activeValues.filter((val) => val !== value)
          : [...activeValues, value];
        const normalized = nextValues.length === availableValues.length ? [] : nextValues;
        return {
          ...prev,
          [domain]: {
            ...domainState,
            selectedValues: normalized,
          },
        };
      });
    },
    []
  );

  const handleApplyClusterToggle = useCallback((domain: SupportedDomain, value: boolean) => {
    setDomainFilters((prev) => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        applyCluster: value,
      },
    }));
  }, []);

  const handleShowHullsToggle = useCallback((domain: SupportedDomain, value: boolean) => {
    setDomainFilters((prev) => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        showHulls: value,
        // If enabling showHulls, also enable clustering (it does both)
        applyCluster: value ? true : prev[domain].applyCluster,
      },
    }));
  }, []);

  const filteredEntities = useMemo(() => {
    return unifiedEntities.filter((entity) => {
      if (!SUPPORTED_DOMAIN_SET.has(entity.domain as SupportedDomain)) return false;
      const domain = entity.domain as SupportedDomain;
      if (!activeDomainSet.has(domain)) return false;
      const filterState = domainFilters[domain];
      const domainConfig = DOMAIN_CONFIGS[domain];
      const taxonomy = domainConfig.taxonomies.find((t) => t.key === filterState.taxonomyKey);
      if (!taxonomy) return true;
      if (filterState.selectedValues.length === 0) return true;
      const nodeValue = taxonomy.getNodeValue(entity);
      if (!nodeValue) return false;
      return filterState.selectedValues.includes(nodeValue);
    });
  }, [activeDomainSet, domainFilters]);

  const filteredEntityIds = useMemo(() => new Set(filteredEntities.map((entity) => entity.id)), [filteredEntities]);

  const filteredRelationships = useMemo(() => {
    return unifiedRelationships.filter(
      (relationship) => filteredEntityIds.has(relationship.source) && filteredEntityIds.has(relationship.target)
    );
  }, [filteredEntityIds]);

  useEffect(() => {
    if (selectedEntity && !filteredEntityIds.has(selectedEntity.id)) {
      setSelectedEntity(null);
    }
  }, [filteredEntityIds, selectedEntity]);

  // Determine secondary clustering - support per-domain clustering toggles
  // Use applyCluster OR showHulls (showHulls implies clustering)
  const secondaryClusterBy: SecondaryClusterBy | undefined = useMemo(() => {
    // Check if ANY active domain has clustering enabled (applyCluster OR showHulls)
    const hasAnyClustering = activeDomains.some((domain) => {
      const filterState = domainFilters[domain];
      return (filterState?.applyCluster || filterState?.showHulls) ?? false;
    });
    
    if (!hasAnyClustering) return undefined;
    
    // For single domain, return the specific taxonomy
    if (singleDomain) {
      const filterState = domainFilters[singleDomain];
      if (!filterState.applyCluster && !filterState.showHulls) return undefined;
      
      const domainConfig = DOMAIN_CONFIGS[singleDomain];
      const activeTaxonomy = domainConfig.taxonomies.find((t) => t.key === filterState.taxonomyKey);
      if (!activeTaxonomy) return undefined;
      
      // Map taxonomy keys to SecondaryClusterBy values
      const taxonomyToCluster: Record<TaxonomyKey, SecondaryClusterBy | undefined> = {
        stakeholderCategory: 'stakeholderCategory',
        sector: 'sector',
        entityType: 'entityType',
        businessUnit: 'entityType', // CPC business units map to entityType for now
        trl: undefined,
        challengeType: undefined,
        focusArea: undefined,
      };
      
      return taxonomyToCluster[activeTaxonomy.key];
    }
    
    // Multi-domain: check which domains have clustering enabled
    const navigateClustering = (domainFilters['navigate']?.applyCluster || domainFilters['navigate']?.showHulls) && domainFilters['navigate']?.taxonomyKey === 'stakeholderCategory';
    const atlasClustering = (domainFilters['atlas']?.applyCluster || domainFilters['atlas']?.showHulls) && domainFilters['atlas']?.taxonomyKey === 'sector';
    
    if (navigateClustering) return 'stakeholderCategory';
    if (atlasClustering) return 'sector';
    return 'entityType'; // Fallback
  }, [activeDomains, singleDomain, domainFilters]);

  // Determine cluster mode: nested if ANY domain has clustering enabled
  const hasAnyClustering = activeDomains.some((domain) => {
    const filterState = domainFilters[domain];
    return (filterState?.applyCluster || filterState?.showHulls) ?? false;
  });
  const clusterMode: ClusterMode = hasAnyClustering ? 'nested' : 'single';
  
  // Primary clustering: ONLY when domain hulls explicitly enabled (multi-domain mode)
  // This controls domain-level clustering force AND hull visibility
  const shouldShowDomainHulls = multiDomain && showDomainHulls;
  const primaryClusterBy: PrimaryClusterBy = shouldShowDomainHulls ? 'domain' : 'entityType';
  
  // Note: showHulls is removed - hull visibility is now controlled separately:
  // - Domain hulls: controlled by showDomainHulls (passed separately)
  // - Pod hulls: controlled per-domain by domainPodConfig[domain].showPods

  // Determine colorBy based on active taxonomy and clustering mode
  const colorBy: ColorBy = useMemo(() => {
    // Multi-domain: default to entityType, allow toggle to domain
    if (multiDomain) {
      return colorByDomain ? 'domain' : 'entityType';
    }
    if (!singleDomain) {
      return 'entityType';
    }
    const filterState = domainFilters[singleDomain];
    const domainConfig = DOMAIN_CONFIGS[singleDomain];
    const activeTaxonomy = domainConfig.taxonomies.find((t) => t.key === filterState.taxonomyKey);
    
    // If entityType taxonomy is selected, always color by entity type (regardless of pods)
    if (activeTaxonomy?.key === 'entityType') {
      return 'entityType';
    }
    
    // If stakeholderCategory is active and clustering is enabled, use that
    if (filterState.taxonomyKey === 'stakeholderCategory' && (filterState.applyCluster || filterState.showHulls)) {
      return 'stakeholderCategory';
    }
    
    // If clustering is enabled and we have a secondary cluster, color by pods
    if ((filterState.applyCluster || filterState.showHulls) && secondaryClusterBy) {
      return 'secondaryCluster';
    }
    
    // Default to entity type coloring
    return 'entityType';
  }, [multiDomain, singleDomain, domainFilters, secondaryClusterBy, colorByDomain]);

  const layoutLabel = multiDomain
    ? 'Domain clusters'
    : singleDomain
    ? `${DOMAIN_CONFIGS[singleDomain].label} pods`
    : 'Domain clusters';

  const taxonomySummary = singleDomain
    ? DOMAIN_CONFIGS[singleDomain].taxonomies.find((taxonomy) => taxonomy.key === domainFilters[singleDomain].taxonomyKey)
        ?.label
    : undefined;

  // Build domain pod configuration for per-domain clustering and hull toggles
  const domainPodConfig = useMemo(() => {
    const config: Partial<Record<'navigate' | 'atlas' | 'cpc-internal', { taxonomyKey: 'stakeholderCategory' | 'sector' | 'entityType' | 'businessUnit'; showPods: boolean }>> = {};
    
    activeDomains.forEach((domain) => {
      const filterState = domainFilters[domain];
      if (!filterState) return;
      
      const domainConfig = DOMAIN_CONFIGS[domain];
      const activeTaxonomy = domainConfig.taxonomies.find((t) => t.key === filterState.taxonomyKey);
      if (!activeTaxonomy) return;
      
      // Map taxonomy keys to the expected type
      const taxonomyKeyMap: Record<TaxonomyKey, 'stakeholderCategory' | 'sector' | 'entityType' | 'businessUnit' | undefined> = {
        stakeholderCategory: 'stakeholderCategory',
        sector: 'sector',
        entityType: 'entityType',
        businessUnit: 'businessUnit',
        trl: undefined,
        challengeType: undefined,
        focusArea: undefined,
      };
      
      const mappedKey = taxonomyKeyMap[activeTaxonomy.key];
      if (mappedKey) {
        // showPods in domainPodConfig controls hull visibility (use showHulls)
        // Force simulation is controlled separately by applyCluster
        config[domain] = {
          taxonomyKey: mappedKey,
          showPods: filterState.showHulls, // Hull visibility
        };
      }
    });
    
    return config;
  }, [activeDomains, domainFilters]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-gray-100 bg-white/70 px-6 py-4 backdrop-blur-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Network Graph V7</p>
            <h1 className="text-xl font-semibold text-gray-900">Domain-aware clustering</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600">
              {layoutLabel}
              {taxonomySummary ? ` • ${taxonomySummary}` : ''}
            </div>
            <div className="flex rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600">
              {(['2d', '3d'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={clsx(
                    'rounded-full px-3 py-1 transition-colors',
                    viewMode === mode ? 'bg-emerald-500 text-white' : 'text-gray-600'
                  )}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        <div className="relative flex-1 overflow-hidden rounded-3xl bg-white shadow-lg">
          <UnifiedNetworkGraph
            entities={filteredEntities}
            relationships={filteredRelationships as UniversalRelationship[]}
            mode={viewMode}
            colorBy={colorBy}
            clusterMode={clusterMode}
            primaryClusterBy={primaryClusterBy}
            secondaryClusterBy={secondaryClusterBy}
            domainPodConfig={domainPodConfig}
            showDomainHulls={shouldShowDomainHulls}
            clusterTightness={clusterTightness}
            clusterSpacing={clusterSpacing}
            velocityDecay={velocityDecay}
            maxVelocity={maxVelocity}
            maxDistance={maxDistance}
            onNodeSelect={setSelectedEntity}
            fitToCanvas
            clickToFocus
          />

          {selectedEntity && (
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-gray-100 bg-white/90 p-4 text-sm shadow-lg">
              <p className="text-xs uppercase tracking-wide text-gray-500">{selectedEntity.domain}</p>
              <p className="text-base font-semibold text-gray-900">{selectedEntity.name}</p>
              <p className="text-xs text-gray-500">{selectedEntity.entityType}</p>
            </div>
          )}
        </div>

        <aside className="w-full max-w-md flex-shrink-0">
          <NetworkControlsV7
            activeDomains={activeDomains}
            onToggleDomain={handleToggleDomain}
            showDomainHulls={showDomainHulls}
            onShowDomainHullsChange={setShowDomainHulls}
            colorByDomain={colorByDomain}
            onColorByDomainChange={setColorByDomain}
            multiDomain={multiDomain}
            clusterTightness={clusterTightness}
            onClusterTightnessChange={setClusterTightness}
            clusterSpacing={clusterSpacing}
            onClusterSpacingChange={setClusterSpacing}
            velocityDecay={velocityDecay}
            onVelocityDecayChange={setVelocityDecay}
            maxVelocity={maxVelocity}
            onMaxVelocityChange={setMaxVelocity}
            maxDistance={maxDistance}
            onMaxDistanceChange={setMaxDistance}
            domainFilters={domainFilters}
            taxonomyData={taxonomyData}
            onTaxonomyChange={handleTaxonomyChange}
            onValueToggle={handleValueToggle}
            onApplyClusterToggle={handleApplyClusterToggle}
            onShowHullsToggle={handleShowHullsToggle}
          />
        </aside>
      </main>
    </div>
  );
}

export default NetworkGraphV7;

