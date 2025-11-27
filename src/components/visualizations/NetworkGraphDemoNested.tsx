'use client';

import { useState, useMemo } from 'react';
import {
  UnifiedNetworkGraph,
  ClusterMode,
  PrimaryClusterBy,
  SecondaryClusterBy,
  ColorBy,
} from './UnifiedNetworkGraphNested';

// Import your unified data
import { unifiedEntities, unifiedRelationships } from '@/data/unified';

// Preset configurations
const PRESETS = {
  freeform: {
    label: 'Free Layout',
    clusterMode: 'none' as ClusterMode,
    primaryClusterBy: 'domain' as PrimaryClusterBy,
    secondaryClusterBy: 'entityType' as SecondaryClusterBy,
    colorBy: 'entityType' as ColorBy,
  },
  byDomain: {
    label: 'By Domain',
    clusterMode: 'single' as ClusterMode,
    primaryClusterBy: 'domain' as PrimaryClusterBy,
    secondaryClusterBy: 'entityType' as SecondaryClusterBy,
    colorBy: 'entityType' as ColorBy,
  },
  byEntityType: {
    label: 'By Entity Type',
    clusterMode: 'single' as ClusterMode,
    primaryClusterBy: 'entityType' as PrimaryClusterBy,
    secondaryClusterBy: 'domain' as SecondaryClusterBy,
    colorBy: 'primaryCluster' as ColorBy,
  },
  nested: {
    label: 'Domain → Entity Type',
    clusterMode: 'nested' as ClusterMode,
    primaryClusterBy: 'domain' as PrimaryClusterBy,
    secondaryClusterBy: 'entityType' as SecondaryClusterBy,
    colorBy: 'secondaryCluster' as ColorBy,
  },
  nestedByMode: {
    label: 'Domain → Transport Mode',
    clusterMode: 'nested' as ClusterMode,
    primaryClusterBy: 'domain' as PrimaryClusterBy,
    secondaryClusterBy: 'mode' as SecondaryClusterBy,
    colorBy: 'secondaryCluster' as ColorBy,
  },
};

type PresetKey = keyof typeof PRESETS;

export function NetworkGraphDemoNested() {
  // View mode
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  // Preset selection
  const [preset, setPreset] = useState<PresetKey>('nested');

  // Individual controls (advanced)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clusterMode, setClusterMode] = useState<ClusterMode>(PRESETS.nested.clusterMode);
  const [primaryClusterBy, setPrimaryClusterBy] = useState<PrimaryClusterBy>(PRESETS.nested.primaryClusterBy);
  const [secondaryClusterBy, setSecondaryClusterBy] = useState<SecondaryClusterBy>(PRESETS.nested.secondaryClusterBy);
  const [colorBy, setColorBy] = useState<ColorBy>(PRESETS.nested.colorBy);

  // Visual controls
  const [showHulls, setShowHulls] = useState(true);
  const [clusterTightness, setClusterTightness] = useState(0.5);
  const [clusterSpacing, setClusterSpacing] = useState(0.8);
  
  // Simulation parameters
  const [reheatAlpha, setReheatAlpha] = useState(0.3);
  const [velocityDecay, setVelocityDecay] = useState(0.7);
  const [maxVelocity, setMaxVelocity] = useState(18);
  const [maxDistance, setMaxDistance] = useState(1000);
  const [showSimParams, setShowSimParams] = useState(false);

  // Selection
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  // Apply preset
  const handlePresetChange = (key: PresetKey) => {
    setPreset(key);
    const p = PRESETS[key];
    setClusterMode(p.clusterMode);
    setPrimaryClusterBy(p.primaryClusterBy);
    setSecondaryClusterBy(p.secondaryClusterBy);
    setColorBy(p.colorBy);
  };

  // Current config (from preset or manual)
  const currentConfig = useMemo(() => {
    if (showAdvanced) {
      return { clusterMode, primaryClusterBy, secondaryClusterBy, colorBy };
    }
    return PRESETS[preset];
  }, [showAdvanced, preset, clusterMode, primaryClusterBy, secondaryClusterBy, colorBy]);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Header Controls */}
      <div className="bg-white border-b shadow-sm">
        {/* Main Controls Row */}
        <div className="flex flex-wrap items-center gap-4 px-4 py-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === '2d'
                    ? 'bg-[#006E51] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                2D
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === '3d'
                    ? 'bg-[#006E51] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                3D
              </button>
            </div>
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Clustering:</span>
            <select
              value={preset}
              onChange={(e) => handlePresetChange(e.target.value as PresetKey)}
              disabled={showAdvanced}
              className={`text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006E51]/20 focus:border-[#006E51] ${
                showAdvanced ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {Object.entries(PRESETS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* Show Hulls Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHulls}
              onChange={(e) => setShowHulls(e.target.checked)}
              className="w-4 h-4 text-[#006E51] border-gray-300 rounded focus:ring-[#006E51]/20"
            />
            <span className="text-sm text-gray-700">Show Hulls</span>
          </label>

          <div className="w-px h-6 bg-gray-200" />

          {/* Tightness Slider */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Tightness:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={clusterTightness}
              onChange={(e) => setClusterTightness(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006E51]"
            />
            <span className="text-xs text-gray-500 w-6">{clusterTightness.toFixed(1)}</span>
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* Spacing Slider */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Spacing:</span>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.05"
              value={clusterSpacing}
              onChange={(e) => setClusterSpacing(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006E51]"
            />
            <span className="text-xs text-gray-500 w-6">{clusterSpacing.toFixed(2)}</span>
          </div>

          <div className="flex-1" />

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              showAdvanced
                ? 'border-[#006E51] text-[#006E51] bg-[#006E51]/5'
                : 'border-gray-300 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {showAdvanced ? 'Hide Advanced' : 'Advanced'}
          </button>

          {/* Simulation Params Toggle */}
          <button
            onClick={() => setShowSimParams(!showSimParams)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              showSimParams
                ? 'border-purple-600 text-purple-600 bg-purple-50'
                : 'border-gray-300 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {showSimParams ? 'Hide Sim Params' : 'Sim Params'}
          </button>
        </div>

        {/* Simulation Parameters Row */}
        {showSimParams && (
          <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-purple-50 border-t border-purple-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Reheat Alpha:</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={reheatAlpha}
                onChange={(e) => setReheatAlpha(parseFloat(e.target.value))}
                className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="text-xs text-gray-500 w-8">{reheatAlpha.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Velocity Decay:</span>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={velocityDecay}
                onChange={(e) => setVelocityDecay(parseFloat(e.target.value))}
                className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="text-xs text-gray-500 w-8">{velocityDecay.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Max Velocity:</span>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={maxVelocity}
                onChange={(e) => setMaxVelocity(parseInt(e.target.value))}
                className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="text-xs text-gray-500 w-8">{maxVelocity}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Max Distance:</span>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="text-xs text-gray-500 w-10">{maxDistance}</span>
            </div>
          </div>
        )}

        {/* Advanced Controls Row */}
        {showAdvanced && (
          <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Mode:</span>
              <select
                value={clusterMode}
                onChange={(e) => setClusterMode(e.target.value as ClusterMode)}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
              >
                <option value="none">None</option>
                <option value="single">Single Level</option>
                <option value="nested">Nested</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Primary:</span>
              <select
                value={primaryClusterBy}
                onChange={(e) => setPrimaryClusterBy(e.target.value as PrimaryClusterBy)}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                disabled={clusterMode === 'none'}
              >
                <option value="domain">Domain</option>
                <option value="entityType">Entity Type</option>
                <option value="mode">Transport Mode</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Secondary:</span>
              <select
                value={secondaryClusterBy}
                onChange={(e) => setSecondaryClusterBy(e.target.value as SecondaryClusterBy)}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                disabled={clusterMode !== 'nested'}
              >
                <option value="entityType">Entity Type</option>
                <option value="mode">Transport Mode</option>
                <option value="theme">Strategic Theme</option>
                <option value="sector">Sector</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Color:</span>
              <select
                value={colorBy}
                onChange={(e) => setColorBy(e.target.value as ColorBy)}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
              >
                <option value="domain">Domain</option>
                <option value="entityType">Entity Type</option>
                <option value="mode">Transport Mode</option>
                <option value="theme">Strategic Theme</option>
                <option value="primaryCluster">Primary Cluster</option>
                <option value="secondaryCluster">Secondary Cluster</option>
              </select>
            </div>
          </div>
        )}

        {/* Selection Info */}
        {selectedEntity && (
          <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 border-t border-amber-100">
            <span className="text-xs text-amber-600">Selected:</span>
            <span className="text-sm font-medium text-amber-900">{selectedEntity.name}</span>
            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
              {selectedEntity.entityType}
            </span>
            <span className="text-xs text-amber-500">{selectedEntity.domain}</span>
            <button
              onClick={() => setSelectedEntity(null)}
              className="ml-auto text-xs text-amber-600 hover:text-amber-800"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        <UnifiedNetworkGraph
          entities={unifiedEntities}
          relationships={unifiedRelationships}
          mode={viewMode}
          colorBy={currentConfig.colorBy}
          clusterMode={currentConfig.clusterMode}
          primaryClusterBy={currentConfig.primaryClusterBy}
          secondaryClusterBy={currentConfig.secondaryClusterBy}
          showHulls={showHulls}
          clusterTightness={clusterTightness}
          clusterSpacing={clusterSpacing}
          reheatAlpha={reheatAlpha}
          velocityDecay={velocityDecay}
          maxVelocity={maxVelocity}
          maxDistance={maxDistance}
          onNodeSelect={setSelectedEntity}
          fitToCanvas
          clickToFocus
        />
      </div>

      {/* Footer Instructions */}
      <div className="bg-white border-t px-4 py-2 text-xs text-gray-500 flex items-center gap-6">
        <span>
          <strong className="text-gray-700">Hover</strong> to highlight connections
        </span>
        <span>
          <strong className="text-gray-700">Click</strong> to focus on node
        </span>
        <span>
          <strong className="text-gray-700">Scroll</strong> to zoom
        </span>
        <span>
          <strong className="text-gray-700">Drag</strong> to pan
        </span>
        {viewMode === '3d' && (
          <span>
            <strong className="text-gray-700">Right-drag</strong> to rotate
          </span>
        )}
      </div>
    </div>
  );
}

export default NetworkGraphDemoNested;

