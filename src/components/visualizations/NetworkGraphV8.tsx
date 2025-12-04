'use client';

import { useMemo, useState, useCallback, useEffect, ReactNode } from 'react';
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
import { AIChatPanel } from '@/components/layouts/AIChatPanel';
import { FloatingPanelSystem } from '@/components/panels';

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

interface NetworkGraphV8Props {
  // External control/insights props (for visual library integration)
  showEmbeddedControls?: boolean;
  showEmbeddedInsights?: boolean;
  onControlsRender?: (renderControls: () => React.ReactNode) => void;
  onInsightsRender?: (renderInsights: () => React.ReactNode) => void;
  onEntitySelect?: (entity: BaseEntity | null) => void;
  className?: string;
}

export function NetworkGraphV8({
  showEmbeddedControls = true,
  showEmbeddedInsights = true,
  onControlsRender,
  onInsightsRender,
  onEntitySelect,
  className,
}: NetworkGraphV8Props = {}) {
  const [activeDomains, setActiveDomains] = useState<SupportedDomain[]>(['navigate']);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [showDomainHulls, setShowDomainHulls] = useState(false);
  const [colorByDomain, setColorByDomain] = useState(false);
  const [clusterTightness, setClusterTightness] = useState(0.6);
  const [clusterSpacing, setClusterSpacing] = useState(0.8);
  // Advanced simulation parameters (V8 defaults)
  const [velocityDecay, setVelocityDecay] = useState(0.9);
  const [maxVelocity, setMaxVelocity] = useState(10);
  const [maxDistance, setMaxDistance] = useState(1200);
  const [domainFilters, setDomainFilters] = useState<DomainFilterMap>(() => createInitialFilterState());
  const [selectedEntity, setSelectedEntity] = useState<BaseEntity | null>(null);

  // Handle entity selection and notify parent
  const handleEntitySelect = useCallback((entity: BaseEntity | null) => {
    setSelectedEntity(entity);
    onEntitySelect?.(entity);
  }, [onEntitySelect]);

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
        const activeValues =
          domainState.selectedValues.length > 0 ? domainState.selectedValues : availableValues;
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

  const filteredEntityIds = useMemo(
    () => new Set(filteredEntities.map((entity) => entity.id)),
    [filteredEntities]
  );

  const filteredRelationships = useMemo(() => {
    return unifiedRelationships.filter(
      (relationship) =>
        filteredEntityIds.has(relationship.source) && filteredEntityIds.has(relationship.target)
    );
  }, [filteredEntityIds]);

  useEffect(() => {
    if (selectedEntity && !filteredEntityIds.has(selectedEntity.id)) {
      setSelectedEntity(null);
    }
  }, [filteredEntityIds, selectedEntity]);

  // Secondary clustering selection
  const secondaryClusterBy: SecondaryClusterBy | undefined = useMemo(() => {
    const hasAnyClustering = activeDomains.some((domain) => {
      const filterState = domainFilters[domain];
      return (filterState?.applyCluster || filterState?.showHulls) ?? false;
    });

    if (!hasAnyClustering) return undefined;

    if (singleDomain) {
      const filterState = domainFilters[singleDomain];
      if (!filterState.applyCluster && !filterState.showHulls) return undefined;

      const domainConfig = DOMAIN_CONFIGS[singleDomain];
      const activeTaxonomy = domainConfig.taxonomies.find(
        (t) => t.key === filterState.taxonomyKey
      );
      if (!activeTaxonomy) return undefined;

      const taxonomyToCluster: Record<TaxonomyKey, SecondaryClusterBy | undefined> = {
        stakeholderCategory: 'stakeholderCategory',
        sector: 'sector',
        entityType: 'entityType',
        businessUnit: 'entityType',
        trl: undefined,
        challengeType: undefined,
        focusArea: undefined,
      };

      return taxonomyToCluster[activeTaxonomy.key];
    }

    const navigateClustering =
      (domainFilters['navigate']?.applyCluster || domainFilters['navigate']?.showHulls) &&
      domainFilters['navigate']?.taxonomyKey === 'stakeholderCategory';
    const atlasClustering =
      (domainFilters['atlas']?.applyCluster || domainFilters['atlas']?.showHulls) &&
      domainFilters['atlas']?.taxonomyKey === 'sector';

    if (navigateClustering) return 'stakeholderCategory';
    if (atlasClustering) return 'sector';
    return 'entityType';
  }, [activeDomains, singleDomain, domainFilters]);

  const hasAnyClustering = activeDomains.some((domain) => {
    const filterState = domainFilters[domain];
    return (filterState?.applyCluster || filterState?.showHulls) ?? false;
  });
  const clusterMode: ClusterMode = hasAnyClustering ? 'nested' : 'single';

  const shouldShowDomainHulls = multiDomain && showDomainHulls;
  const primaryClusterBy: PrimaryClusterBy = shouldShowDomainHulls ? 'domain' : 'entityType';

  const colorBy: ColorBy = useMemo(() => {
    if (multiDomain) {
      return colorByDomain ? 'domain' : 'entityType';
    }
    if (!singleDomain) {
      return 'entityType';
    }
    const filterState = domainFilters[singleDomain];
    const domainConfig = DOMAIN_CONFIGS[singleDomain];
    const activeTaxonomy = domainConfig.taxonomies.find(
      (t) => t.key === filterState.taxonomyKey
    );

    if (activeTaxonomy?.key === 'entityType') {
      return 'entityType';
    }

    if (
      filterState.taxonomyKey === 'stakeholderCategory' &&
      (filterState.applyCluster || filterState.showHulls)
    ) {
      return 'stakeholderCategory';
    }

    if ((filterState.applyCluster || filterState.showHulls) && secondaryClusterBy) {
      return 'secondaryCluster';
    }

    return 'entityType';
  }, [multiDomain, singleDomain, domainFilters, secondaryClusterBy, colorByDomain]);

  const layoutLabel = multiDomain
    ? 'Domain clusters'
    : singleDomain
    ? `${DOMAIN_CONFIGS[singleDomain].label} pods`
    : 'Domain clusters';

  const taxonomySummary = singleDomain
    ? DOMAIN_CONFIGS[singleDomain].taxonomies.find(
        (taxonomy) => taxonomy.key === domainFilters[singleDomain].taxonomyKey
      )?.label
    : undefined;

  const domainPodConfig = useMemo(() => {
    const config: Partial<
      Record<
        'navigate' | 'atlas' | 'cpc-internal',
        { taxonomyKey: 'stakeholderCategory' | 'sector' | 'entityType' | 'businessUnit'; showPods: boolean }
      >
    > = {};

    activeDomains.forEach((domain) => {
      const filterState = domainFilters[domain];
      if (!filterState) return;

      const domainConfig = DOMAIN_CONFIGS[domain];
      const activeTaxonomy = domainConfig.taxonomies.find(
        (t) => t.key === filterState.taxonomyKey
      );
      if (!activeTaxonomy) return;

      const taxonomyKeyMap: Record<
        TaxonomyKey,
        'stakeholderCategory' | 'sector' | 'entityType' | 'businessUnit' | undefined
      > = {
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
        config[domain] = {
          taxonomyKey: mappedKey,
          showPods: filterState.showHulls,
        };
      }
    });

    return config;
  }, [activeDomains, domainFilters]);

  // Insights-style data (from V6)
  const adjacencyMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    filteredRelationships.forEach((rel) => {
      if (!map.has(rel.source)) map.set(rel.source, new Set());
      if (!map.has(rel.target)) map.set(rel.target, new Set());
      map.get(rel.source)?.add(rel.target);
      map.get(rel.target)?.add(rel.source);
    });
    return map;
  }, [filteredRelationships]);

  const relatedEntities = useMemo(() => {
    if (!selectedEntity) return [];
    const neighbors = adjacencyMap.get(selectedEntity.id);
    if (!neighbors) return [];
    return filteredEntities.filter((entity) => neighbors.has(entity.id));
  }, [selectedEntity, adjacencyMap, filteredEntities]);

  const quickStats = useMemo(() => {
    const totals = filteredEntities.reduce(
      (acc, entity) => {
        const fundingAmount =
          entity.metadata?.funding && typeof entity.metadata?.funding === 'object'
            ? (entity.metadata?.funding as { amount?: number }).amount
            : undefined;

        if (entity.domain === 'navigate') acc.navigate += 1;
        if (entity.domain === 'atlas') acc.atlas += 1;
        if (entity.domain === 'cpc-internal') acc.cpc += 1;
        if (entity.entityType === 'stakeholder') acc.stakeholders += 1;
        if (entity.entityType === 'technology') acc.technologies += 1;
        if (entity.entityType === 'project') acc.projects += 1;
        if (fundingAmount) acc.funding += fundingAmount;
        return acc;
      },
      {
        navigate: 0,
        atlas: 0,
        cpc: 0,
        stakeholders: 0,
        technologies: 0,
        projects: 0,
        funding: 0,
      }
    );
    return totals;
  }, [filteredEntities]);

  // Expose controls rendering function to parent
  useEffect(() => {
    if (onControlsRender) {
      onControlsRender(() => (
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
      ));
    }
  }, [
    onControlsRender,
    activeDomains,
    showDomainHulls,
    colorByDomain,
    multiDomain,
    clusterTightness,
    clusterSpacing,
    velocityDecay,
    maxVelocity,
    maxDistance,
    domainFilters,
    taxonomyData,
    handleToggleDomain,
    handleTaxonomyChange,
    handleValueToggle,
    handleApplyClusterToggle,
    handleShowHullsToggle,
  ]);

  // Expose insights rendering function to parent
  useEffect(() => {
    if (onInsightsRender) {
      onInsightsRender(() => (
        <InsightsPanelV8
          entity={selectedEntity}
          related={relatedEntities}
          stats={quickStats}
        />
      ));
    }
  }, [onInsightsRender, selectedEntity, relatedEntities, quickStats]);

  // Render controls content
  const renderControlsContent = () => {
    if (!showEmbeddedControls) return null;
    return (
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
    );
  };

  // Render insights content
  const renderInsightsContent = () => {
    if (!showEmbeddedInsights) return null;
    return (
      <InsightsPanelV8
        entity={selectedEntity}
        related={relatedEntities}
        stats={quickStats}
      />
    );
  };

  return (
    <div className={clsx('flex flex-col bg-slate-50', className, !showEmbeddedControls && !showEmbeddedInsights ? 'min-h-0 flex-1' : 'min-h-screen')}>
      {showEmbeddedControls && showEmbeddedInsights && (
        <header className="border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Network Graph V8</p>
            <h1 className="text-xl font-semibold text-gray-900">
              Floating panels with V7 controls
            </h1>
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
      )}

      <main className={clsx('relative bg-slate-50', showEmbeddedControls && showEmbeddedInsights ? 'min-h-[calc(100vh-72px)]' : 'min-h-0 flex-1')}>
        <div className="relative h-full w-full min-h-0 flex-1">
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
            onNodeSelect={handleEntitySelect}
            fitToCanvas
            clickToFocus
          />

          {selectedEntity && (
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-gray-100 bg-white/90 p-4 text-sm shadow-lg">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {selectedEntity.domain}
              </p>
              <p className="text-base font-semibold text-gray-900">{selectedEntity.name}</p>
              <p className="text-xs text-gray-500">{selectedEntity.entityType}</p>
            </div>
          )}

          {/* Floating panel system: Controls, Insights, AI (only when embedded UI is enabled) */}
          {showEmbeddedControls && showEmbeddedInsights && (
            <FloatingPanelSystem
              panels={[
                {
                  key: 'controls',
                  content: (
                    <div className="p-4">
                      {renderControlsContent()}
                    </div>
                  ),
                },
                {
                  key: 'insights',
                  content: (
                    <div className="p-4">
                      {renderInsightsContent()}
                    </div>
                  ),
                },
                {
                  key: 'ai',
                  content: (
                    <div className="flex h-full flex-col">
                      <div className="flex-1 overflow-y-auto p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          AI Copilot
                        </p>
                        <div className="h-64">
                          <AIChatPanel
                            context={{
                              activeViz: 'Network Graph V8',
                              useNavigateData: activeDomains.includes('navigate'),
                              selectedEntities: selectedEntity ? [selectedEntity] : [],
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
              initialOpenPanels={['controls', 'insights', 'ai']}
              initialPanelOrder={['controls', 'insights', 'ai']}
              initialWidth={340}
              position="right"
              topOffset={96}
              bottomOffset={32}
              showFocusModeButton={true}
            />
          )}
        </div>
      </main>
    </div>
  );
}

interface InsightsPanelV8Props {
  entity: BaseEntity | null;
  related: BaseEntity[];
  stats: {
    stakeholders: number;
    technologies: number;
    projects: number;
    funding: number;
    navigate: number;
    atlas: number;
    cpc: number;
  };
}

function InsightsPanelV8({ entity, related, stats }: InsightsPanelV8Props) {
  if (!entity) {
    return (
      <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Insights</p>
        <p className="text-sm text-gray-700">
          Click any node in the network to see detailed stats and related entities.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="rounded-2xl bg-gray-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Stakeholders</p>
            <p className="text-sm font-semibold text-gray-900">{stats.stakeholders}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Technologies</p>
            <p className="text-sm font-semibold text-gray-900">{stats.technologies}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Projects</p>
            <p className="text-sm font-semibold text-gray-900">{stats.projects}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Total Funding</p>
            <p className="text-sm font-semibold text-gray-900">
              £{(stats.funding / 1_000_000).toFixed(0)}M
            </p>
          </div>
        </div>
      </section>
    );
  }

  const metadata = entity.metadata || {};
  const tags = metadata.tags as string[] | undefined;

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{entity.domain}</p>
          <h3 className="text-sm font-semibold text-gray-900">{entity.name}</h3>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize text-gray-600">
          {entity.entityType}
        </span>
      </div>

      {entity.description && (
        <p className="text-xs leading-relaxed text-gray-700 line-clamp-4">
          {entity.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
        {metadata.sector && (
          <div>
            <p className="text-[11px] text-gray-500 uppercase">Sector</p>
            <p className="font-medium capitalize">{metadata.sector as string}</p>
          </div>
        )}
        {metadata.category && (
          <div>
            <p className="text-[11px] text-gray-500 uppercase">Category</p>
            <p className="font-medium capitalize">{metadata.category as string}</p>
          </div>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div>
          <p className="text-[11px] uppercase text-gray-500">Tags</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Connections</p>
          <span className="text-[11px] text-gray-400">{related.length} linked nodes</span>
        </div>
        {related.length === 0 ? (
          <p className="mt-1 text-xs text-gray-500">No linked entities available.</p>
        ) : (
          <div className="mt-2 grid grid-cols-1 gap-2">
            {related.slice(0, 8).map((rel) => (
              <div
                key={rel.id}
                className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs text-gray-700 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">{rel.name}</p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">
                    {rel.entityType}
                  </p>
                </div>
                <span className="text-[10px] text-gray-500">{rel.domain}</span>
              </div>
            ))}
            {related.length > 8 && (
              <p className="text-[11px] text-gray-500">
                and {related.length - 8} more connections…
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default NetworkGraphV8;


