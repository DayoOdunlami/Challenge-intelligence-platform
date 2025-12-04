'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { unifiedEntities, unifiedRelationships } from '@/data/unified';
import type { BaseEntity, UniversalRelationship } from '@/lib/base-entity';
import type { ProvenanceFilter } from '@/lib/base-entity-enhanced';
import {
  UnifiedNetworkGraph,
  ClusterMode,
  PrimaryClusterBy,
  SecondaryClusterBy,
  ColorBy,
} from './UnifiedNetworkGraphNested';
import { AIChatPanel } from '@/components/layouts/AIChatPanel';
import { ProvenanceControls } from '@/components/provenance/ProvenanceControls';
import {
  Bot,
  Sparkles,
  SlidersHorizontal,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Target,
  Globe,
  X,
} from 'lucide-react';
import clsx from 'clsx';

type DatasetKey = 'all' | 'navigate' | 'atlas' | 'cpc' | 'custom';
type CoreDomain = 'atlas' | 'navigate' | 'cpc-internal';
type PanelKey = 'controls' | 'insights' | 'ai';

const DATASET_OPTIONS: Record<
  Exclude<DatasetKey, 'custom'>,
  { label: string; description: string; domains: CoreDomain[] }
> = {
  all: {
    label: 'All Domains',
    description: 'Atlas + Navigate + CPC internal data',
    domains: ['atlas', 'navigate', 'cpc-internal'],
  },
  navigate: {
    label: 'Navigate (Aviation)',
    description: 'Stakeholders, technologies, projects & funding flows',
    domains: ['navigate'],
  },
  atlas: {
    label: 'Atlas (Challenges)',
    description: 'Challenge intelligence dataset',
    domains: ['atlas'],
  },
  cpc: {
    label: 'CPC Internal',
    description: 'Capabilities & initiatives',
    domains: ['cpc-internal'],
  },
};

const CORE_DOMAIN_LABELS: Record<CoreDomain, string> = {
  atlas: 'Atlas',
  navigate: 'Navigate',
  'cpc-internal': 'CPC',
};

const NAVIGATE_GROUP_OPTIONS = [
  'Government',
  'Intermediary',
  'Academia',
  'Industry',
  'Project',
  'Working Group',
];

const STAKEHOLDER_CATEGORY_COLORS: Record<string, string> = {
  Government: '#0EA5E9',
  Intermediary: '#8B5CF6',
  Academia: '#6366F1',
  Industry: '#F97316',
  Project: '#10B981',
  'Working Group': '#EC4899',
};

const ATLAS_SECTOR_OPTIONS = [
  { label: 'Rail', value: 'rail' },
  { label: 'Energy', value: 'energy' },
  { label: 'Local Gov', value: 'local gov' },
  { label: 'Transport', value: 'transport' },
  { label: 'Built Env', value: 'built env' },
  { label: 'Aviation', value: 'aviation' },
];

const normalizeKey = (value?: string) =>
  (value || '').toLowerCase().replace(/[^a-z]/g, '');

const PANEL_META: Record<
  PanelKey,
  { label: string; icon: typeof SlidersHorizontal; accent: string }
> = {
  controls: { label: 'Controls', icon: SlidersHorizontal, accent: '#006E51' },
  insights: { label: 'Insights', icon: Sparkles, accent: '#0f8b8d' },
  ai: { label: 'AI Copilot', icon: Bot, accent: '#7c3aed' },
};

const DEFAULT_PROVENANCE_FILTERS: ProvenanceFilter = {};
type ProvenanceMeta = {
  quality?: { confidence?: number; verificationStatus?: string };
  freshness?: { lastUpdatedAt?: string };
  flags?: unknown[];
};

export function NetworkGraphDemoV6() {
  const [dataset, setDataset] = useState<DatasetKey>('all');
  const [activeDomains, setActiveDomains] = useState<CoreDomain[]>(DATASET_OPTIONS.all.domains);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [colorBy, setColorBy] = useState<ColorBy>('domain');
  const [primaryClusterBy, setPrimaryClusterBy] = useState<PrimaryClusterBy>('domain');
  const [secondaryClusterSelection, setSecondaryClusterSelection] = useState<SecondaryClusterBy | 'none'>(
    'entityType'
  );
  const [clusterTightness, setClusterTightness] = useState(0.5);
  const [clusterSpacing, setClusterSpacing] = useState(0.8);
  const [velocityDecay, setVelocityDecay] = useState(0.7);
  const [maxVelocity, setMaxVelocity] = useState(18);
  const [maxDistance, setMaxDistance] = useState(1000);
  const [showDomainHulls, setShowDomainHulls] = useState(true);
  const [atlasSimilarityThreshold, setAtlasSimilarityThreshold] = useState(0.25);
  const [trlRange, setTrlRange] = useState<[number, number]>([1, 9]);
  const [activeNavigateGroups, setActiveNavigateGroups] = useState<string[]>(NAVIGATE_GROUP_OPTIONS);
  const [activeAtlasSectors, setActiveAtlasSectors] = useState<string[]>(ATLAS_SECTOR_OPTIONS.map((s) => s.value));
  const [activeTechnologyCategories, setActiveTechnologyCategories] = useState<string[]>([
    'H2Production',
    'H2Storage',
    'FuelCells',
    'Aircraft',
    'Infrastructure',
  ]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [dockedPanels, setDockedPanels] = useState<Record<PanelKey, boolean>>({
    controls: true,
    insights: true,
    ai: true,
  });
  const [panelOrder, setPanelOrder] = useState<PanelKey[]>(['controls', 'insights', 'ai']);
  const [collapsedPanels, setCollapsedPanels] = useState<Record<PanelKey, boolean>>({
    controls: false,
    insights: false,
    ai: false,
  });
  const [panelWidth, setPanelWidth] = useState(340);
  const [focusMode, setFocusMode] = useState(false);
  const resizeMeta = useRef({
    active: false,
    startX: 0,
    startWidth: 340,
  });
  const [provenanceFilters, setProvenanceFilters] = useState<ProvenanceFilter>(DEFAULT_PROVENANCE_FILTERS);
  const [selectedEntity, setSelectedEntity] = useState<BaseEntity | null>(null);

  const applyDomainDefaults = useCallback((domains: CoreDomain[]) => {
    if (domains.length > 1) {
      setPrimaryClusterBy('domain');
      setSecondaryClusterSelection('entityType');
      setColorBy('domain');
      setShowDomainHulls(true);
    } else if (domains.length === 1) {
      setPrimaryClusterBy('entityType');
      setShowDomainHulls(false);
      if (domains[0] === 'navigate') {
        setColorBy('stakeholderCategory');
        setSecondaryClusterSelection('stakeholderCategory');
      } else if (domains[0] === 'atlas') {
        setColorBy('sector');
        setSecondaryClusterSelection('sector');
      } else {
        setColorBy('entityType');
        setSecondaryClusterSelection('entityType');
      }
    } else {
      setSecondaryClusterSelection('none');
    }
  }, []);

  const handlePresetSelect = useCallback(
    (key: Exclude<DatasetKey, 'custom'>) => {
      const domains = DATASET_OPTIONS[key].domains;
      setDataset(key);
      setActiveDomains(domains);
      applyDomainDefaults(domains);
    },
    [applyDomainDefaults]
  );

  const handleDomainToggle = useCallback(
    (domain: CoreDomain) => {
      setActiveDomains((prev) => {
        const exists = prev.includes(domain);
        if (exists && prev.length === 1) {
          return prev;
        }
        const next = exists ? prev.filter((d) => d !== domain) : [...prev, domain];
        setDataset('custom');
        applyDomainDefaults(next);
        return next;
      });
    },
    [applyDomainDefaults]
  );

  const multiDomain = activeDomains.length > 1;
  const activeDomainSet = useMemo(() => new Set(activeDomains), [activeDomains]);
  const includesAtlas = activeDomainSet.has('atlas');
  const includesNavigate = activeDomainSet.has('navigate');
  const singleActiveDomain = !multiDomain ? activeDomains[0] : null;
  const secondaryClusterBy: SecondaryClusterBy | undefined =
    secondaryClusterSelection === 'none' ? undefined : secondaryClusterSelection;
  const clusterMode: ClusterMode = secondaryClusterSelection === 'none' ? 'single' : 'nested';
  const showPods = secondaryClusterSelection !== 'none';
  const effectiveShowHulls = (multiDomain && showDomainHulls) || showPods;

  const normalizedNavigateSet = useMemo(
    () => new Set(activeNavigateGroups.map((label) => normalizeKey(label))),
    [activeNavigateGroups]
  );

  const activeAtlasSectorSet = useMemo(
    () => new Set(activeAtlasSectors.map((label) => normalizeKey(label))),
    [activeAtlasSectors]
  );

  const datasetLabel =
    dataset !== 'custom'
      ? DATASET_OPTIONS[dataset].label
      : activeDomains.map((d) => CORE_DOMAIN_LABELS[d]).join(' + ');

  const hasDomainMixChange =
    dataset === 'custom' || activeDomains.length !== DATASET_OPTIONS.all.domains.length;
  const hasNavigateFilter =
    includesNavigate && activeNavigateGroups.length !== NAVIGATE_GROUP_OPTIONS.length;
  const hasAtlasSectorFilter =
    includesAtlas && activeAtlasSectors.length !== ATLAS_SECTOR_OPTIONS.length;
  const hasTrlFilter = includesNavigate && (trlRange[0] !== 1 || trlRange[1] !== 9);
  const hasProvenanceFilter = Object.keys(provenanceFilters).length > 0;
  const defaultColor = multiDomain
    ? 'domain'
    : singleActiveDomain === 'navigate'
    ? 'stakeholderCategory'
    : 'entityType';
  const defaultSecondaryPods = multiDomain
    ? 'entityType'
    : singleActiveDomain === 'navigate'
    ? 'stakeholderCategory'
    : singleActiveDomain === 'atlas'
    ? 'sector'
    : 'entityType';
  const controlsBadge =
    hasDomainMixChange ||
    hasNavigateFilter ||
    hasAtlasSectorFilter ||
    hasTrlFilter ||
    hasProvenanceFilter ||
    atlasSimilarityThreshold !== 0.25 ||
    clusterSpacing !== 0.8 ||
    clusterTightness !== 0.5 ||
    velocityDecay !== 0.7 ||
    maxVelocity !== 18 ||
    maxDistance !== 1000 ||
    (multiDomain && !showDomainHulls) ||
    secondaryClusterSelection !== defaultSecondaryPods ||
    colorBy !== defaultColor ||
    primaryClusterBy !== (multiDomain ? 'domain' : 'entityType');
  const insightsBadge = Boolean(selectedEntity) && !dockedPanels.insights;
  const aiBadge = Boolean(selectedEntity) && !dockedPanels.ai;
  const panelBadges: Record<PanelKey, boolean> = {
    controls: controlsBadge,
    insights: insightsBadge,
    ai: aiBadge,
  };
  const openPanels = panelOrder.filter((panel) => dockedPanels[panel] && !collapsedPanels[panel]);
  const hasOpenPanels = openPanels.length > 0;

  const getNavigateCategory = (entity: BaseEntity) => {
    // For stakeholders, use their category/type
    if (entity.entityType === 'stakeholder') {
      const category = (entity.metadata?.category as string) ||
        (entity.metadata?.custom as { type?: string })?.type ||
        'Industry';
      // Map Navigate 'Research' to 'Academia'
      return normalizeKey(category === 'Research' ? 'Academia' : category);
    }
    // For projects, use 'Project'
    if (entity.entityType === 'project') {
      return normalizeKey('Project');
    }
    // For working groups (check by name)
    if (entity.name?.toLowerCase().includes('working group') || 
        entity.name?.toLowerCase().includes('taskforce') ||
        entity.name?.toLowerCase().includes('task force')) {
      return normalizeKey('Working Group');
    }
    // For technologies and others, return entityType as fallback
    return normalizeKey(entity.entityType);
  };

  const toggleNavigateGroup = useCallback(
    (group: string) => {
      setActiveNavigateGroups((prev) =>
        prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
      );
    },
    []
  );

  const toggleAtlasSector = useCallback(
    (sector: string) => {
      setActiveAtlasSectors((prev) =>
        prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
      );
    },
    []
  );

  const toggleTechnologyCategory = useCallback(
    (category: string) => {
      setActiveTechnologyCategories((prev) =>
        prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
      );
    },
    []
  );

  const passesNavigateFilters = useCallback(
    (entity: BaseEntity) => {
      if (entity.domain !== 'navigate') return true;

      if (entity.entityType === 'technology') {
        const trlValue =
          (typeof entity.metadata?.trl === 'number' && entity.metadata?.trl) ||
          (entity.metadata?.trl as { current?: number })?.current;
        if (
          typeof trlValue === 'number' &&
          (trlValue < trlRange[0] || trlValue > trlRange[1])
        ) {
          return false;
        }
        // Filter by technology category
        const category = (entity.metadata?.custom as { category?: string })?.category;
        if (
          category &&
          activeTechnologyCategories.length > 0 &&
          activeTechnologyCategories.length < 5 &&
          !activeTechnologyCategories.includes(category)
        ) {
          return false;
        }
      }

      // Filter by stakeholder category for stakeholders, projects, and working groups
      if (
        (entity.entityType === 'stakeholder' || entity.entityType === 'project' || 
         entity.name?.toLowerCase().includes('working group') ||
         entity.name?.toLowerCase().includes('taskforce')) &&
        activeNavigateGroups.length > 0 &&
        activeNavigateGroups.length !== NAVIGATE_GROUP_OPTIONS.length
      ) {
        const category = getNavigateCategory(entity);
        if (!normalizedNavigateSet.has(category)) {
          return false;
        }
      }

      return true;
    },
    [trlRange, activeNavigateGroups, normalizedNavigateSet, activeTechnologyCategories]
  );

  const passesAtlasFilters = useCallback(
    (entity: BaseEntity) => {
      if (entity.domain !== 'atlas') return true;
      if (
        activeAtlasSectors.length === 0 ||
        activeAtlasSectors.length === ATLAS_SECTOR_OPTIONS.length
      ) {
        return true;
      }
      const sectorValue =
        (entity.metadata?.sector as string) ||
        (Array.isArray(entity.metadata?.sector) ? (entity.metadata?.sector as string[])[0] : undefined);
      return activeAtlasSectorSet.has(normalizeKey(sectorValue));
    },
    [activeAtlasSectors, activeAtlasSectorSet]
  );

  const passesProvenanceFilters = useCallback(
    (entity: BaseEntity) => {
      const hasFilters = Object.keys(provenanceFilters).length > 0;
      if (!hasFilters) return true;
      const provenance = (entity as BaseEntity & { provenance?: ProvenanceMeta }).provenance;
      if (!provenance) return true;

      if (
        provenanceFilters.minConfidence !== undefined &&
        provenance.quality?.confidence !== undefined &&
        provenance.quality.confidence < provenanceFilters.minConfidence
      ) {
        return false;
      }

      if (
        provenanceFilters.verifiedOnly &&
        provenance.quality?.verificationStatus !== 'verified'
      ) {
        return false;
      }

      if (
        provenanceFilters.freshOnly &&
        provenance.freshness?.lastUpdatedAt &&
        Date.now() - new Date(provenance.freshness.lastUpdatedAt).getTime() > 90 * 24 * 60 * 60 * 1000
      ) {
        return false;
      }

      if (
        provenanceFilters.excludeFlagged &&
        Array.isArray(provenance.flags) &&
        provenance.flags.length > 0
      ) {
        return false;
      }

      return true;
    },
    [provenanceFilters]
  );

  const filteredEntities = useMemo(() => {
    return unifiedEntities.filter((entity) => {
      if (
        entity.domain !== 'reference' &&
        entity.domain !== 'cross-domain' &&
        !activeDomainSet.has(entity.domain as CoreDomain)
      ) {
        return false;
      }
      if (!passesNavigateFilters(entity)) return false;
      if (!passesAtlasFilters(entity)) return false;
      if (!passesProvenanceFilters(entity)) return false;
      return true;
    });
  }, [activeDomainSet, passesNavigateFilters, passesAtlasFilters, passesProvenanceFilters]);

  const filteredEntityIds = useMemo(() => new Set(filteredEntities.map((e) => e.id)), [filteredEntities]);

  useEffect(() => {
    if (selectedEntity && !filteredEntityIds.has(selectedEntity.id)) {
      setSelectedEntity(null);
    }
  }, [filteredEntityIds, selectedEntity]);

  const filteredRelationships = useMemo(() => {
    return unifiedRelationships
      .filter(
        (rel) =>
          filteredEntityIds.has(rel.source) &&
          filteredEntityIds.has(rel.target)
      )
      .filter((rel) => {
        if (rel.type === 'similar_to' && includesAtlas) {
          const confidence =
            rel.metadata?.confidence ?? rel.metadata?.originalStrength ?? rel.strength;
          return confidence >= atlasSimilarityThreshold;
        }
        return true;
      });
  }, [filteredEntityIds, atlasSimilarityThreshold, includesAtlas]);

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

  const togglePanel = (panel: PanelKey) => {
    setDockedPanels((prev) => {
      const next = !prev[panel];
      if (next) {
        setCollapsedPanels((collapsed) => ({ ...collapsed, [panel]: false }));
      }
      return { ...prev, [panel]: next };
    });
  };

  const toggleCollapse = (panel: PanelKey) => {
    setCollapsedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  const handleLauncherClick = (panel: PanelKey) => {
    if (dockedPanels[panel] && collapsedPanels[panel]) {
      setCollapsedPanels((prev) => ({ ...prev, [panel]: false }));
      return;
    }
    togglePanel(panel);
  };

  const movePanel = (panel: PanelKey, direction: 'left' | 'right') => {
    setPanelOrder((prev) => {
      const currentIndex = prev.indexOf(panel);
      if (currentIndex === -1) return prev;
      const targetIndex =
        direction === 'left' ? Math.max(0, currentIndex - 1) : Math.min(prev.length - 1, currentIndex + 1);
      if (targetIndex === currentIndex) return prev;
      const next = [...prev];
      const [removed] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, removed);
      return next;
    });
  };

  const handleResizing = useCallback(
    (event: MouseEvent) => {
      if (!resizeMeta.current.active) return;
      const delta = resizeMeta.current.startX - event.clientX;
      const nextWidth = Math.min(420, Math.max(260, resizeMeta.current.startWidth + delta));
      setPanelWidth(nextWidth);
    },
    []
  );

  const handleResizeEnd = useCallback(() => {
    resizeMeta.current.active = false;
    window.removeEventListener('mousemove', handleResizing);
    window.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizing]);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      resizeMeta.current = {
        active: true,
        startX: event.clientX,
        startWidth: panelWidth,
      };
      window.addEventListener('mousemove', handleResizing);
      window.addEventListener('mouseup', handleResizeEnd);
    },
    [handleResizeEnd, handleResizing, panelWidth]
  );

  useEffect(
    () => () => {
      window.removeEventListener('mousemove', handleResizing);
      window.removeEventListener('mouseup', handleResizeEnd);
    },
    [handleResizing, handleResizeEnd]
  );

  const computePanelWidth = useCallback(
    (panel: PanelKey) => {
      const offsets: Record<PanelKey, number> = {
        controls: 60,
        insights: -10,
        ai: 30,
      };
      const target = panelWidth + (offsets[panel] || 0);
      return Math.max(280, Math.min(520, target));
    },
    [panelWidth]
  );

  return (
    <div className="relative min-h-screen bg-slate-100">
      <header className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">Unified Graph V6</p>
          <h1 className="text-xl font-semibold text-gray-900">Floating Intelligence Panels</h1>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-500">Dataset:</span>
          <select
            value={dataset}
            onChange={(e) => {
              const next = e.target.value as DatasetKey;
              if (next === 'custom') {
                setDataset('custom');
                return;
              }
              handlePresetSelect(next);
            }}
            className="rounded-full border border-gray-200 px-3 py-1 text-sm"
          >
            {(Object.entries(DATASET_OPTIONS) as Array<[Exclude<DatasetKey, 'custom'>, { label: string }]>).map(
              ([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              )
            )}
            <option value="custom">Custom mix</option>
          </select>

          <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1">
            <span className="text-gray-500">View:</span>
            {(['2d', '3d'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={clsx(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  viewMode === mode ? 'bg-[#006E51] text-white' : 'text-gray-600'
                )}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setFocusMode((prev) => !prev)}
            className={clsx(
              'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
              focusMode ? 'border-[#006E51] bg-[#006E51]/10 text-[#006E51]' : 'border-gray-200 text-gray-600'
            )}
          >
            {focusMode ? 'Exit Focus' : 'Focus Mode'}
          </button>
        </div>
      </header>

      <div className="relative min-h-[calc(100vh-72px)] bg-slate-50">
        <div className="relative h-full w-full">
          <UnifiedNetworkGraph
            entities={filteredEntities}
            relationships={filteredRelationships as UniversalRelationship[]}
            mode={viewMode}
            colorBy={colorBy}
            clusterMode={clusterMode}
            primaryClusterBy={primaryClusterBy}
            secondaryClusterBy={secondaryClusterBy}
            showHulls={effectiveShowHulls}
            clusterTightness={clusterTightness}
            clusterSpacing={clusterSpacing}
            velocityDecay={velocityDecay}
            maxVelocity={maxVelocity}
            maxDistance={maxDistance}
            onNodeSelect={setSelectedEntity}
            fitToCanvas
            clickToFocus
          />

          <div className="absolute right-6 top-4 z-30 flex items-center gap-2">
            {(Object.keys(PANEL_META) as PanelKey[]).map((panel) => {
              const meta = PANEL_META[panel];
              const Icon = meta.icon;
              const active = dockedPanels[panel] && !collapsedPanels[panel];
              const showBadge = panelBadges[panel];
              return (
                <button
                  key={panel}
                  onClick={() => handleLauncherClick(panel)}
                  className={clsx(
                    'relative flex h-12 w-12 items-center justify-center rounded-full border shadow-xl transition-all',
                    active ? 'bg-white text-gray-900 border-white' : 'bg-white/70 text-gray-500 hover:bg-white'
                  )}
                  style={{ color: active ? meta.accent : undefined }}
                  title={meta.label}
                >
                  {showBadge && !active && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 shadow-md" />
                  )}
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>

          {hasOpenPanels && (
            <div
              className={clsx(
                'pointer-events-none absolute right-6 top-20 bottom-6 z-20 flex gap-4 transition-opacity duration-200',
                focusMode ? 'opacity-0' : 'opacity-100'
              )}
            >
              <div className={clsx('relative flex items-center pr-2', focusMode ? 'pointer-events-none' : 'pointer-events-auto')}>
                <div
                  className="h-20 w-1 rounded-full bg-white/80 shadow-md ring-1 ring-black/5 cursor-ew-resize"
                  onMouseDown={handleResizeStart}
                  title="Drag to resize panels"
                />
              </div>
              <div className={clsx('flex items-start gap-4', focusMode ? 'pointer-events-none' : 'pointer-events-auto')}>
                {openPanels.map((panel) => {
                  const meta = PANEL_META[panel];
                  const index = openPanels.indexOf(panel);
                  return (
                    <SidebarPanel
                      key={panel}
                      title={meta.label}
                      accent={meta.accent}
                      width={computePanelWidth(panel)}
                      collapsed={collapsedPanels[panel]}
                      onCollapse={() => toggleCollapse(panel)}
                      onClose={() => togglePanel(panel)}
                      onMoveLeft={() => movePanel(panel, 'left')}
                      onMoveRight={() => movePanel(panel, 'right')}
                      canMoveLeft={index > 0}
                      canMoveRight={index < openPanels.length - 1}
                      icon={meta.icon}
                    >
                      {panel === 'controls' && (
                        <ControlsPanel
                          dataset={dataset}
                          datasetLabel={datasetLabel}
                          onPresetSelect={handlePresetSelect}
                          activeDomains={activeDomains}
                          onToggleDomain={handleDomainToggle}
                          multiDomain={multiDomain}
                          singleDomain={singleActiveDomain}
                          showDomainHulls={showDomainHulls}
                          setShowDomainHulls={setShowDomainHulls}
                          primaryClusterBy={primaryClusterBy}
                          setPrimaryClusterBy={setPrimaryClusterBy}
                          secondaryClusterSelection={secondaryClusterSelection}
                          setSecondaryClusterSelection={setSecondaryClusterSelection}
                          colorBy={colorBy}
                          setColorBy={setColorBy}
                          clusterTightness={clusterTightness}
                          setClusterTightness={setClusterTightness}
                          clusterSpacing={clusterSpacing}
                          setClusterSpacing={setClusterSpacing}
                          velocityDecay={velocityDecay}
                          setVelocityDecay={setVelocityDecay}
                          maxVelocity={maxVelocity}
                          setMaxVelocity={setMaxVelocity}
                          maxDistance={maxDistance}
                          setMaxDistance={setMaxDistance}
                          atlasSimilarityThreshold={atlasSimilarityThreshold}
                          setAtlasSimilarityThreshold={setAtlasSimilarityThreshold}
                          trlRange={trlRange}
                          setTrlRange={setTrlRange}
                          showNavigateFilters={includesNavigate}
                          activeNavigateGroups={activeNavigateGroups}
                          toggleNavigateGroup={toggleNavigateGroup}
                          activeTechnologyCategories={activeTechnologyCategories}
                          toggleTechnologyCategory={toggleTechnologyCategory}
                          showAtlasFilters={includesAtlas}
                          activeAtlasSectors={activeAtlasSectors}
                          toggleAtlasSector={toggleAtlasSector}
                          allowStakeholderPods={includesNavigate}
                          provenanceFilters={provenanceFilters}
                          setProvenanceFilters={setProvenanceFilters}
                          advancedOpen={advancedOpen}
                          setAdvancedOpen={setAdvancedOpen}
                        />
                      )}
                      {panel === 'insights' && (
                        <InsightsPanel
                          entity={selectedEntity}
                          related={relatedEntities}
                          stats={quickStats}
                          datasetLabel={datasetLabel}
                        />
                      )}
                      {panel === 'ai' && (
                        <div className="h-full">
                          <AIChatPanel
                            context={{
                              activeViz: 'Unified Network Graph V6',
                              useNavigateData: dataset === 'navigate',
                              selectedEntities: selectedEntity ? [selectedEntity] : [],
                            }}
                          />
                        </div>
                      )}
                    </SidebarPanel>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SidebarPanelProps {
  title: string;
  accent: string;
  width: number;
  collapsed: boolean;
  onCollapse: () => void;
  onClose: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  icon: typeof SlidersHorizontal;
  children: React.ReactNode;
}

function SidebarPanel({
  title,
  accent,
  width,
  collapsed,
  onCollapse,
  onClose,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  icon: Icon,
  children,
}: SidebarPanelProps) {
  if (collapsed) {
    return null;
  }

  return (
    <div
      className="pointer-events-auto flex h-[80vh] max-h-[80vh] flex-col rounded-3xl border border-white/30 bg-white/90 shadow-2xl backdrop-blur-xl"
      style={{ width }}
    >
      <div
        className="flex items-center justify-between border-b border-white/40 px-4 py-3 text-sm font-semibold"
        style={{ color: accent }}
        onDoubleClick={onCollapse}
        title="Double-click to collapse"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <button
            onClick={onMoveLeft}
            disabled={!canMoveLeft}
            className={clsx(
              'rounded-full p-1 transition-colors',
              canMoveLeft ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'
            )}
            title="Move left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onMoveRight}
            disabled={!canMoveRight}
            className={clsx(
              'rounded-full p-1 transition-colors',
              canMoveRight ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'
            )}
            title="Move right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={onCollapse}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600"
            title="Collapse panel"
          >
            <ChevronLeft className="h-4 w-4 rotate-90" />
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600"
            title="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}

interface ControlsPanelProps {
  dataset: DatasetKey;
  datasetLabel: string;
  onPresetSelect: (key: Exclude<DatasetKey, 'custom'>) => void;
  activeDomains: CoreDomain[];
  onToggleDomain: (domain: CoreDomain) => void;
  multiDomain: boolean;
  singleDomain: CoreDomain | null;
  showDomainHulls: boolean;
  setShowDomainHulls: (value: boolean) => void;
  primaryClusterBy: PrimaryClusterBy;
  setPrimaryClusterBy: (value: PrimaryClusterBy) => void;
  secondaryClusterSelection: SecondaryClusterBy | 'none';
  setSecondaryClusterSelection: (value: SecondaryClusterBy | 'none') => void;
  colorBy: ColorBy;
  setColorBy: (value: ColorBy) => void;
  clusterTightness: number;
  setClusterTightness: (value: number) => void;
  clusterSpacing: number;
  setClusterSpacing: (value: number) => void;
  velocityDecay: number;
  setVelocityDecay: (value: number) => void;
  maxVelocity: number;
  setMaxVelocity: (value: number) => void;
  maxDistance: number;
  setMaxDistance: (value: number) => void;
  atlasSimilarityThreshold: number;
  setAtlasSimilarityThreshold: (value: number) => void;
  trlRange: [number, number];
  setTrlRange: (value: [number, number]) => void;
  showNavigateFilters: boolean;
  activeNavigateGroups: string[];
  toggleNavigateGroup: (group: string) => void;
  activeTechnologyCategories: string[];
  toggleTechnologyCategory: (category: string) => void;
  showAtlasFilters: boolean;
  activeAtlasSectors: string[];
  toggleAtlasSector: (sector: string) => void;
  allowStakeholderPods: boolean;
  provenanceFilters: ProvenanceFilter;
  setProvenanceFilters: (filters: ProvenanceFilter) => void;
  advancedOpen: boolean;
  setAdvancedOpen: (open: boolean) => void;
}

function ControlsPanel(props: ControlsPanelProps) {
  const {
    dataset,
    datasetLabel,
    onPresetSelect,
    activeDomains,
    onToggleDomain,
    multiDomain,
    singleDomain,
    showDomainHulls,
    setShowDomainHulls,
    primaryClusterBy,
    setPrimaryClusterBy,
    secondaryClusterSelection,
    setSecondaryClusterSelection,
    colorBy,
    setColorBy,
    clusterTightness,
    setClusterTightness,
    clusterSpacing,
    setClusterSpacing,
    velocityDecay,
    setVelocityDecay,
    maxVelocity,
    setMaxVelocity,
    maxDistance,
    setMaxDistance,
    atlasSimilarityThreshold,
    setAtlasSimilarityThreshold,
    trlRange,
    setTrlRange,
    showNavigateFilters,
    activeNavigateGroups,
    toggleNavigateGroup,
    activeTechnologyCategories,
    toggleTechnologyCategory,
    showAtlasFilters,
    activeAtlasSectors,
    toggleAtlasSector,
    allowStakeholderPods,
    provenanceFilters,
    setProvenanceFilters,
    advancedOpen,
    setAdvancedOpen,
  } = props;

  const secondaryDefaultForDomain = (domain: CoreDomain): SecondaryClusterBy =>
    domain === 'navigate' ? 'stakeholderCategory' : domain === 'atlas' ? 'sector' : 'entityType';

  return (
    <div className="space-y-5 text-sm text-gray-700">
      <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Dataset Presets</p>
            <p className="text-base font-semibold text-gray-900">{datasetLabel || 'Custom mix'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DATASET_OPTIONS) as Array<Exclude<DatasetKey, 'custom'>>).map((key) => (
            <button
              key={key}
              onClick={() => onPresetSelect(key)}
              className={clsx(
                'rounded-full border px-3 py-1 text-xs',
                dataset === key ? 'border-[#006E51] text-[#006E51] bg-white' : 'text-gray-500'
              )}
            >
              {DATASET_OPTIONS[key].label.split(' ')[0]}
            </button>
          ))}
        </div>
        <div className="pt-3">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Active Domains</p>
          <div className="flex flex-wrap gap-2">
            {(DATASET_OPTIONS.all.domains as CoreDomain[]).map((domain) => {
              const active = activeDomains.includes(domain);
              return (
                <button
                  key={domain}
                  onClick={() => onToggleDomain(domain)}
                  className={clsx(
                    'rounded-full border px-3 py-1 text-xs',
                    active
                      ? 'border-emerald-500 bg-white text-emerald-700'
                      : 'border-gray-200 text-gray-500'
                  )}
                >
                  {CORE_DOMAIN_LABELS[domain]}
                </button>
              );
            })}
          </div>
          {multiDomain && (
            <label className="mt-3 flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={showDomainHulls}
                onChange={(e) => setShowDomainHulls(e.target.checked)}
              />
              Show domain hulls (primary clusters)
            </label>
          )}
          {!multiDomain && singleDomain && (
            <label className="mt-3 flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={secondaryClusterSelection !== 'none'}
                onChange={(e) =>
                  setSecondaryClusterSelection(
                    e.target.checked
                      ? secondaryDefaultForDomain(singleDomain)
                      : 'none'
                  )
                }
              />
              Show group pods for {CORE_DOMAIN_LABELS[singleDomain]}
            </label>
          )}
        </div>
      </section>

      {singleDomain !== 'navigate' && (
      <section className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
          <span>Graph Layout</span>
          <span className="text-gray-400">Visuals</span>
        </div>
        <div className="grid gap-3 text-xs">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Primary grouping</p>
            <select
              value={primaryClusterBy}
              onChange={(e) => setPrimaryClusterBy(e.target.value as PrimaryClusterBy)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-[#006E51] focus:ring-[#006E51]/20"
            >
              <option value="domain">Domain</option>
              <option value="entityType">Entity type</option>
              <option value="mode">Transport mode</option>
              {allowStakeholderPods && <option value="stakeholderCategory">Stakeholder category</option>}
            </select>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Group pods</p>
            <select
              value={secondaryClusterSelection}
              onChange={(e) => setSecondaryClusterSelection(e.target.value as SecondaryClusterBy | 'none')}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-[#006E51] focus:ring-[#006E51]/20"
            >
              <option value="none">Pods off</option>
              <option value="entityType">Entity type</option>
              <option value="sector">Sector</option>
              <option value="mode">Transport mode</option>
              <option value="theme">Strategic theme</option>
              {allowStakeholderPods && <option value="stakeholderCategory">Stakeholder category</option>}
            </select>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Color palette</p>
            <select
              value={colorBy}
              onChange={(e) => setColorBy(e.target.value as ColorBy)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-[#006E51] focus:ring-[#006E51]/20"
            >
              <option value="domain">Domain islands</option>
              <option value="entityType">Entity type</option>
              {showNavigateFilters && <option value="stakeholderCategory">Stakeholder category</option>}
              {showAtlasFilters && <option value="sector">Sector</option>}
              <option value="secondaryCluster">Pods / groups</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          <SliderControl
            label="Cluster Tightness"
            value={clusterTightness}
            min={0.1}
            max={1}
            step={0.05}
            onChange={setClusterTightness}
          />
          <SliderControl
            label="Cluster Spacing"
            value={clusterSpacing}
            min={0.3}
            max={1.5}
            step={0.05}
            onChange={setClusterSpacing}
          />
        </div>
        <div className="pt-2">
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600"
          >
            Advanced simulation controls
            <ChevronDown
              className={clsx(
                'h-4 w-4 transition-transform',
                advancedOpen ? 'rotate-180 text-[#006E51]' : 'text-gray-400'
              )}
            />
          </button>
          {advancedOpen && (
            <div className="mt-3 space-y-3 rounded-xl bg-gray-50/70 p-3">
              <SliderControl
                label="Velocity Decay"
                value={velocityDecay}
                min={0.2}
                max={0.9}
                step={0.05}
                onChange={setVelocityDecay}
              />
              <SliderControl
                label="Max Velocity"
                value={maxVelocity}
                min={5}
                max={40}
                step={1}
                onChange={setMaxVelocity}
              />
              <SliderControl
                label="Max Distance"
                value={maxDistance}
                min={200}
                max={1200}
                step={50}
                onChange={setMaxDistance}
              />
            </div>
          )}
        </div>
      </section>
      )}

      {showNavigateFilters && (
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-emerald-700">
            <Target className="h-4 w-4" />
            Navigate Filters
          </div>
          <SliderControl
            label={`TRL Range (${trlRange[0]}-${trlRange[1]})`}
            value={trlRange[0]}
            min={1}
            max={9}
            step={1}
            onChange={(val) => setTrlRange([val, trlRange[1]])}
          />
          <SliderControl
            label=""
            value={trlRange[1]}
            min={trlRange[0]}
            max={9}
            step={1}
            onChange={(val) => setTrlRange([trlRange[0], val])}
          />
          <div>
            <p className="text-xs font-semibold text-emerald-800 mb-2">Entity Type</p>
            <div className="flex flex-wrap gap-2">
              {NAVIGATE_GROUP_OPTIONS.map((group) => {
                const active = activeNavigateGroups.includes(group);
                const color = STAKEHOLDER_CATEGORY_COLORS[group] || '#6B7280';
                return (
                  <button
                    key={group}
                    onClick={() => toggleNavigateGroup(group)}
                    className={clsx(
                      'rounded-full border px-3 py-1.5 text-xs font-medium flex items-center gap-2 transition-all',
                      active
                        ? 'bg-white border-2 shadow-sm'
                        : 'bg-white/50 border border-gray-200 opacity-60'
                    )}
                    style={{
                      borderColor: active ? color : undefined,
                      color: active ? '#1F2937' : '#6B7280',
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span>{group}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {allowStakeholderPods && (
            <label className="flex items-center gap-2 text-xs text-emerald-800">
              <input
                type="checkbox"
                checked={secondaryClusterSelection === 'stakeholderCategory'}
                onChange={(e) => setSecondaryClusterSelection(e.target.checked ? 'stakeholderCategory' : 'none')}
              />
              Show stakeholder pods
            </label>
          )}
          <div>
            <p className="text-xs font-semibold text-emerald-800 mb-2">Technology Categories</p>
            <div className="flex flex-wrap gap-2">
              {['H2Production', 'H2Storage', 'FuelCells', 'Aircraft', 'Infrastructure'].map((category) => {
                const active = activeTechnologyCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => toggleTechnologyCategory(category)}
                    className={clsx(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                      active
                        ? 'bg-white border-2 border-emerald-500 shadow-sm text-emerald-700'
                        : 'bg-white/50 border border-gray-200 opacity-60 text-gray-600'
                    )}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {showAtlasFilters && (
        <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-blue-700">
            <Globe className="h-4 w-4" />
            Atlas Controls
          </div>
          <SliderControl
            label={`Similarity Threshold (${Math.round(atlasSimilarityThreshold * 100)}%)`}
            value={atlasSimilarityThreshold}
            min={0.1}
            max={0.8}
            step={0.05}
            onChange={setAtlasSimilarityThreshold}
          />
          <div>
            <p className="text-xs font-semibold text-blue-900 mb-2">Sectors</p>
            <div className="flex flex-wrap gap-2">
              {ATLAS_SECTOR_OPTIONS.map((sector) => {
                const active = activeAtlasSectors.includes(sector.value);
                return (
                  <button
                    key={sector.value}
                    onClick={() => toggleAtlasSector(sector.value)}
                    className={clsx(
                      'rounded-full border px-2 py-0.5 text-xs',
                      active
                        ? 'border-blue-500 text-blue-700 bg-white'
                        : 'border-blue-100 text-blue-500'
                    )}
                  >
                    {sector.label}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-blue-900">
            <input
              type="checkbox"
              checked={secondaryClusterSelection === 'sector'}
              onChange={(e) => setSecondaryClusterSelection(e.target.checked ? 'sector' : 'none')}
            />
            Show sector pods
          </label>
        </section>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500 mb-2">
          <Filter className="h-4 w-4" />
          Provenance & Data Quality
        </div>
        <ProvenanceControls
          filters={provenanceFilters}
          onChange={setProvenanceFilters}
          defaultOpen={false}
        />
      </section>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{label}</span>
          <span className="tabular-nums">{value.toFixed(step < 1 ? 2 : 0)}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#006E51]"
      />
    </div>
  );
}

interface InsightsPanelProps {
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
  datasetLabel: string;
}

function InsightsPanel({ entity, related, stats, datasetLabel }: InsightsPanelProps) {
  if (!entity) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-700">Explore</p>
          <h3 className="text-lg font-semibold text-emerald-900">{datasetLabel}</h3>
          <p className="text-sm text-emerald-900/80">
            Click on any node to view detailed insights, provenance, and relationships.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Quick Stats</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex justify-between">
              <span>Stakeholders</span>
              <span className="font-semibold">{stats.stakeholders}</span>
            </li>
            <li className="flex justify-between">
              <span>Technologies</span>
              <span className="font-semibold">{stats.technologies}</span>
            </li>
            <li className="flex justify-between">
              <span>Projects</span>
              <span className="font-semibold">{stats.projects}</span>
            </li>
            <li className="flex justify-between">
              <span>Total Funding</span>
              <span className="font-semibold">£{(stats.funding / 1_000_000).toFixed(0)}M</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  const metadata = entity.metadata || {};
  const tags = metadata.tags as string[] | undefined;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">{entity.domain}</p>
            <h3 className="text-lg font-semibold text-gray-900">{entity.name}</h3>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize text-gray-600">
            {entity.entityType}
          </span>
        </div>
        {entity.description && (
          <p className="text-sm leading-relaxed text-gray-700">{entity.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
          {metadata.sector && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Sector</p>
              <p className="font-medium capitalize">{metadata.sector as string}</p>
            </div>
          )}
          {metadata.category && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Category</p>
              <p className="font-medium capitalize">{metadata.category as string}</p>
            </div>
          )}
          {metadata.trl && typeof metadata.trl === 'object' && (
            <div>
              <p className="text-xs text-gray-500 uppercase">TRL</p>
              <p className="font-medium">
                {(metadata.trl as { min?: number; max?: number; current?: number }).current ??
                  (metadata.trl as { min?: number }).min ??
                  (metadata.trl as { max?: number }).max}
              </p>
            </div>
          )}
          {metadata.funding && typeof metadata.funding === 'object' && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Funding</p>
              <p className="font-medium">
                £
                {(
                  ((metadata.funding as { amount?: number }).amount ?? 0) / 1_000_000
                ).toFixed(1)}
                M
              </p>
            </div>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div>
            <p className="text-xs uppercase text-gray-500">Tags</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-gray-500">Connections</p>
          <span className="text-xs text-gray-400">{related.length} linked nodes</span>
        </div>
        {related.length === 0 ? (
          <p className="text-sm text-gray-500">No linked entities available.</p>
        ) : (
          <div className="mt-2 grid grid-cols-1 gap-2">
            {related.slice(0, 15).map((rel) => (
              <div
                key={rel.id}
                className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">{rel.name}</p>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">
                    {rel.entityType}
                  </p>
                </div>
                <span className="text-[11px] text-gray-500">{rel.domain}</span>
              </div>
            ))}
            {related.length > 15 && (
              <p className="text-xs text-gray-500">
                and {related.length - 15} more connections…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NetworkGraphDemoV6;

