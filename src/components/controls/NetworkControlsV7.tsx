'use client';

import clsx from 'clsx';
import { DOMAIN_CONFIGS, type SupportedDomain, type TaxonomyKey } from '@/config/domainTaxonomyConfig';
import type { DomainTaxonomies } from '@/lib/computeTaxonomyCounts';
import { getVisibleTaxonomies } from '@/lib/computeTaxonomyCounts';

export interface DomainFilterState {
  taxonomyKey: TaxonomyKey;
  selectedValues: string[];
  applyCluster: boolean; // Controls force simulation (clustering behavior)
  showHulls: boolean; // Controls hull drawing AND enables clustering (does both)
}

export type DomainFilterMap = Record<SupportedDomain, DomainFilterState>;

interface NetworkControlsV7Props {
  activeDomains: SupportedDomain[];
  onToggleDomain: (domain: SupportedDomain) => void;
  showDomainHulls: boolean;
  onShowDomainHullsChange: (value: boolean) => void;
  colorByDomain: boolean;
  onColorByDomainChange: (value: boolean) => void;
  multiDomain: boolean;
  clusterTightness: number;
  onClusterTightnessChange: (value: number) => void;
  clusterSpacing: number;
  onClusterSpacingChange: (value: number) => void;
  // Advanced simulation controls
  velocityDecay: number;
  onVelocityDecayChange: (value: number) => void;
  maxVelocity: number;
  onMaxVelocityChange: (value: number) => void;
  maxDistance: number;
  onMaxDistanceChange: (value: number) => void;
  domainFilters: DomainFilterMap;
  taxonomyData: Partial<Record<SupportedDomain, DomainTaxonomies>>;
  onTaxonomyChange: (domain: SupportedDomain, taxonomyKey: TaxonomyKey) => void;
  onValueToggle: (domain: SupportedDomain, value: string, availableValues: string[]) => void;
  onApplyClusterToggle: (domain: SupportedDomain, value: boolean) => void;
  onShowHullsToggle: (domain: SupportedDomain, value: boolean) => void;
}

const DOMAIN_ORDER: SupportedDomain[] = ['navigate', 'atlas', 'cpc-internal'];

export function NetworkControlsV7({
  activeDomains,
  onToggleDomain,
  showDomainHulls,
  onShowDomainHullsChange,
  colorByDomain,
  onColorByDomainChange,
  multiDomain,
  clusterTightness,
  onClusterTightnessChange,
  clusterSpacing,
  onClusterSpacingChange,
  velocityDecay,
  onVelocityDecayChange,
  maxVelocity,
  onMaxVelocityChange,
  maxDistance,
  onMaxDistanceChange,
  domainFilters,
  taxonomyData,
  onTaxonomyChange,
  onValueToggle,
  onApplyClusterToggle,
  onShowHullsToggle,
}: NetworkControlsV7Props) {

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Domains</p>
        <div className="grid grid-cols-3 gap-2">
          {DOMAIN_ORDER.map((domain) => {
            const config = DOMAIN_CONFIGS[domain];
            const active = activeDomains.includes(domain);
            return (
              <button
                key={domain}
                onClick={() => onToggleDomain(domain)}
                className={clsx(
                  'rounded-2xl px-3 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
                  active
                    ? 'text-white shadow-md ring-offset-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                )}
                style={active ? { backgroundColor: config.color } : undefined}
                aria-pressed={active}
              >
                {config.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-400">Select one or more domains to include in the graph.</p>
      </section>

      {multiDomain && (
        <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Graph layout</p>
          </div>
          <label className="mt-3 flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 px-3 py-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showDomainHulls}
              onChange={(e) => onShowDomainHullsChange(e.target.checked)}
            />
            Show domain clusters
          </label>

          <div className="mt-3">
            <p className="text-xs font-medium text-gray-600 mb-2">Colour By</p>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="colorBy"
                  checked={!colorByDomain}
                  onChange={() => onColorByDomainChange(false)}
                />
                <span>Entity Type</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="colorBy"
                  checked={colorByDomain}
                  onChange={() => onColorByDomainChange(true)}
                />
                <span>Domain</span>
              </label>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <SliderControl
              label="Cluster tightness"
              value={clusterTightness}
              min={0.1}
              max={1}
              step={0.05}
              onChange={onClusterTightnessChange}
            />
            <SliderControl
              label="Cluster spacing"
              value={clusterSpacing}
              min={0.3}
              max={1.5}
              step={0.05}
              onChange={onClusterSpacingChange}
            />
            <div className="pt-1 space-y-2 border-t border-gray-100 mt-2">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Advanced (physics)</p>
              <SliderControl
                label="Velocity decay"
                value={velocityDecay}
                min={0.3}
                max={0.99}
                step={0.01}
                onChange={onVelocityDecayChange}
              />
              <SliderControl
                label="Max velocity"
                value={maxVelocity}
                min={5}
                max={40}
                step={1}
                onChange={onMaxVelocityChange}
              />
              <SliderControl
                label="Max distance"
                value={maxDistance}
                min={400}
                max={2000}
                step={50}
                onChange={onMaxDistanceChange}
              />
            </div>
          </div>
        </section>
      )}

      {DOMAIN_ORDER.filter((domain) => activeDomains.includes(domain)).map((domain) => (
        <DomainPanel
          key={domain}
          domain={domain}
          filterState={domainFilters[domain]}
          taxonomyData={taxonomyData[domain]}
          onTaxonomyChange={onTaxonomyChange}
          onValueToggle={onValueToggle}
          onApplyClusterToggle={onApplyClusterToggle}
          onShowHullsToggle={onShowHullsToggle}
        />
      ))}
    </div>
  );
}

interface DomainPanelProps {
  domain: SupportedDomain;
  filterState: DomainFilterState;
  taxonomyData?: DomainTaxonomies;
  onTaxonomyChange: (domain: SupportedDomain, taxonomyKey: TaxonomyKey) => void;
  onValueToggle: (domain: SupportedDomain, value: string, availableValues: string[]) => void;
  onApplyClusterToggle: (domain: SupportedDomain, value: boolean) => void;
  onShowHullsToggle: (domain: SupportedDomain, value: boolean) => void;
}

function DomainPanel({
  domain,
  filterState,
  taxonomyData,
  onTaxonomyChange,
  onValueToggle,
  onApplyClusterToggle,
  onShowHullsToggle,
}: DomainPanelProps) {
  if (!taxonomyData) return null;

  const config = DOMAIN_CONFIGS[domain];
  const visibleTaxonomies = getVisibleTaxonomies(taxonomyData);
  const currentTaxonomy =
    visibleTaxonomies.find((taxonomy) => taxonomy.key === filterState.taxonomyKey) ?? visibleTaxonomies[0];

  const availableValues = currentTaxonomy?.values ?? [];
  const anySelection = filterState.selectedValues.length > 0;

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{config.label}</p>
          <p className="text-sm text-gray-600">Domain taxonomy & pods</p>
        </div>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
      </div>

      <div className="mt-3">
        <label className="text-xs uppercase tracking-wide text-gray-500">Group by</label>
        <select
          value={currentTaxonomy?.key}
          onChange={(e) => onTaxonomyChange(domain, e.target.value as TaxonomyKey)}
          className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none"
        >
          {visibleTaxonomies.map((taxonomy) => (
            <option key={taxonomy.key} value={taxonomy.key}>
              {taxonomy.label} ({taxonomy.totalCount})
            </option>
          ))}
        </select>
      </div>

  <div className="mt-4 flex flex-wrap gap-2">
        {availableValues.map((value) => {
          const isActive = anySelection ? filterState.selectedValues.includes(value.value) : value.count > 0;
          const disabled = value.count === 0;
          return (
            <button
              key={value.value}
              onClick={() => !disabled && onValueToggle(domain, value.value, availableValues.map((v) => v.value))}
              disabled={disabled}
              className={clsx(
                'group flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-semibold transition-all',
                disabled && 'cursor-not-allowed border-dashed border-gray-200 bg-gray-50 text-gray-400',
                !disabled && isActive && 'border-transparent text-white shadow-sm',
                !disabled && !isActive && 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
              style={isActive && !disabled ? { backgroundColor: value.color || config.color } : undefined}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: disabled ? '#D1D5DB' : isActive ? '#FFFFFF' : value.color || config.color }}
              />
              <span>{value.value}</span>
              <span
                className={clsx(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                  disabled && 'bg-gray-200 text-gray-500',
                  !disabled && isActive && 'bg-white/20 text-white',
                  !disabled && !isActive && 'bg-gray-100 text-gray-500'
                )}
              >
                {value.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        <label className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 px-3 py-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={filterState.applyCluster}
            onChange={(e) => onApplyClusterToggle(domain, e.target.checked)}
            disabled={filterState.showHulls} // Disable if showHulls is on (it implies clustering)
          />
          <span className={filterState.showHulls ? 'text-gray-400' : ''}>
            Cluster entities
          </span>
        </label>
        <label className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 px-3 py-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={filterState.showHulls}
            onChange={(e) => {
              const checked = e.target.checked;
              onShowHullsToggle(domain, checked);
              // If enabling showHulls, also enable clustering (it does both)
              if (checked && !filterState.applyCluster) {
                onApplyClusterToggle(domain, true);
              }
            }}
          />
          Show {currentTaxonomy?.label.toLowerCase()} hulls
        </label>
      </div>
    </section>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function SliderControl({ label, value, min, max, step, onChange }: SliderControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span className="font-semibold text-gray-700">{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-2 w-full accent-emerald-600"
      />
    </div>
  );
}

