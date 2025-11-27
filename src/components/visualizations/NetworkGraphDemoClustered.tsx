'use client';

import { useState } from 'react';
import { UnifiedNetworkGraph, ClusterBy, ColorBy } from './UnifiedNetworkGraphClustered';

// Import your unified data
import { unifiedEntities, unifiedRelationships } from '@/data/unified';

export function NetworkGraphDemoClustered() {
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [colorBy, setColorBy] = useState<ColorBy>('entityType');
  const [clusterBy, setClusterBy] = useState<ClusterBy>('entityType');
  const [showClusterHulls, setShowClusterHulls] = useState(true);
  const [clusterStrength, setClusterStrength] = useState(0.3);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white border-b shadow-sm">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setMode('2d')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                mode === '2d'
                  ? 'bg-[#006E51] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setMode('3d')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                mode === '3d'
                  ? 'bg-[#006E51] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              3D
            </button>
          </div>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Cluster By */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Cluster:</span>
          <select
            value={clusterBy}
            onChange={(e) => setClusterBy(e.target.value as ClusterBy)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006E51]/20 focus:border-[#006E51]"
          >
            <option value="none">None (Free Layout)</option>
            <option value="domain">By Domain</option>
            <option value="entityType">By Entity Type</option>
            <option value="mode">By Transport Mode</option>
            <option value="theme">By Strategic Theme</option>
          </select>
        </div>

        {/* Color By */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Color:</span>
          <select
            value={colorBy}
            onChange={(e) => setColorBy(e.target.value as ColorBy)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006E51]/20 focus:border-[#006E51]"
          >
            <option value="domain">By Domain</option>
            <option value="entityType">By Entity Type</option>
            <option value="mode">By Transport Mode</option>
            <option value="theme">By Strategic Theme</option>
            <option value="cluster">By Cluster</option>
          </select>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Cluster Hulls Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showClusterHulls}
            onChange={(e) => setShowClusterHulls(e.target.checked)}
            className="w-4 h-4 text-[#006E51] border-gray-300 rounded focus:ring-[#006E51]/20"
          />
          <span className="text-sm text-gray-700">Show Cluster Hulls</span>
        </label>

        <div className="w-px h-6 bg-gray-300" />

        {/* Cluster Strength Slider */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Strength:</span>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.05"
            value={clusterStrength}
            onChange={(e) => setClusterStrength(parseFloat(e.target.value))}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006E51]"
          />
          <span className="text-xs text-gray-500 w-8">{clusterStrength.toFixed(2)}</span>
        </div>

        {/* Selected Entity */}
        {selectedEntity && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <div className="text-sm bg-gray-50 rounded-lg px-3 py-1.5">
              <span className="text-gray-500">Selected:</span>{' '}
              <span className="font-medium text-gray-900">{selectedEntity.name}</span>
              <span className="text-gray-400 ml-1">({selectedEntity.entityType})</span>
            </div>
          </>
        )}
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        <UnifiedNetworkGraph
          entities={unifiedEntities}
          relationships={unifiedRelationships}
          mode={mode}
          colorBy={colorBy}
          clusterBy={clusterBy}
          showClusterHulls={showClusterHulls}
          clusterStrength={clusterStrength}
          onNodeSelect={setSelectedEntity}
          fitToCanvas
          clickToFocus
        />
      </div>

      {/* Instructions */}
      <div className="bg-white border-t px-4 py-2 text-xs text-gray-500 flex items-center gap-6">
        <span>
          <strong>Hover</strong> to highlight connections
        </span>
        <span>
          <strong>Click</strong> to focus on node
        </span>
        <span>
          <strong>Scroll</strong> to zoom
        </span>
        <span>
          <strong>Drag</strong> to pan
        </span>
        {mode === '3d' && <span><strong>Right-drag</strong> to rotate</span>}
      </div>
    </div>
  );
}

export default NetworkGraphDemoClustered;

