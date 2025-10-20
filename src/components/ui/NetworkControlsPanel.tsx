'use client';

import React, { useState } from 'react';
import { ClusterInfo } from '@/lib/cluster-analysis';
import { Badge } from './badge';

interface NetworkControlsPanelProps {
  similarityThreshold: number;
  onSimilarityChange: (threshold: number) => void;
  showClusters: boolean;
  onShowClustersChange: (show: boolean) => void;
  isOrbiting: boolean;
  onOrbitingChange: (orbiting: boolean) => void;
  clusters: ClusterInfo[];
  selectedCluster: ClusterInfo | null;
  onClusterSelect: (cluster: ClusterInfo | null) => void;
  onUserInteraction: (action: 'node_click' | 'cluster_select' | 'filter_change' | 'similarity_adjust' | string, data: Record<string, unknown>) => void;
}

export function NetworkControlsPanel({
  similarityThreshold,
  onSimilarityChange,
  showClusters,
  onShowClustersChange,
  isOrbiting,
  onOrbitingChange,
  clusters,
  selectedCluster,
  onClusterSelect,
  onUserInteraction
}: NetworkControlsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Toggle Button - positioned to avoid nav overlap */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed top-20 z-50 bg-white border border-gray-300 rounded-r-lg shadow-lg p-2 transition-all duration-300 hover:bg-gray-50 ${
          isExpanded ? 'left-80' : 'left-0'
        }`}
        title={isExpanded ? 'Hide Controls' : 'Show Controls'}
      >
        <svg 
          className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Sliding Controls Panel - starts below nav */}
      <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white border-r border-gray-200 shadow-xl z-40 transition-transform duration-300 ${
        isExpanded ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Network Controls</h2>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Basic Controls */}
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-3">View Options</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isOrbiting}
                    onChange={(e) => {
                      onOrbitingChange(e.target.checked);
                      onUserInteraction('orbit_toggle', { enabled: e.target.checked });
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Camera orbit</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showClusters}
                    onChange={(e) => {
                      onShowClustersChange(e.target.checked);
                      onUserInteraction('cluster_highlight_toggle', { enabled: e.target.checked });
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Highlight clusters</span>
                </label>
              </div>
            </div>

            {/* Similarity Threshold */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Connection Sensitivity</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Similarity Threshold</span>
                  <Badge variant="outline" className="text-xs">
                    {(similarityThreshold * 100).toFixed(0)}%
                  </Badge>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={similarityThreshold}
                  onChange={(e) => {
                    const newThreshold = parseFloat(e.target.value);
                    onSimilarityChange(newThreshold);
                    onUserInteraction('similarity_adjust', { 
                      oldThreshold: similarityThreshold, 
                      newThreshold 
                    });
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(similarityThreshold - 0.1) / 0.7 * 100}%, #e5e7eb ${(similarityThreshold - 0.1) / 0.7 * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Less connected</span>
                  <span>More connected</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Higher values show only the strongest connections
                </p>
              </div>
            </div>

            {/* Cluster Selection */}
            {clusters.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800 mb-3">
                  Detected Clusters ({clusters.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      onClusterSelect(null);
                      onShowClustersChange(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCluster
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    Show All Challenges
                  </button>
                  
                  {clusters.map((cluster) => (
                    <button
                      key={cluster.id}
                      onClick={() => {
                        const newSelection = selectedCluster?.id === cluster.id ? null : cluster;
                        onClusterSelect(newSelection);
                        onShowClustersChange(true);
                        onUserInteraction('cluster_select', { 
                          clusterId: cluster.id, 
                          clusterName: cluster.name 
                        });
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border ${
                        selectedCluster?.id === cluster.id
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{cluster.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {cluster.size}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        £{(cluster.totalFunding / 1000000).toFixed(1)}M • {cluster.dominantSector.replace('_', ' ')}
                      </div>
                      {cluster.keyThemes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cluster.keyThemes.slice(0, 2).map((theme, index) => (
                            <span 
                              key={index}
                              className="inline-block px-1 py-0.5 bg-gray-200 text-gray-700 text-xs rounded"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h3 className="font-medium text-blue-900 mb-2">How to Use</h3>
              <div className="text-xs text-blue-800 space-y-1">
                <div>• Click nodes to select challenges</div>
                <div>• Drag to pan, scroll to zoom</div>
                <div>• Drag nodes to reposition</div>
                <div>• Adjust similarity to filter connections</div>
                <div>• Select clusters to highlight groups</div>
              </div>
            </div>

            {/* Network Stats */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h3 className="font-medium text-gray-800 mb-2">Network Stats</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Clusters detected: {clusters.length}</div>
                <div>Avg cluster size: {clusters.length > 0 ? Math.round(clusters.reduce((sum, c) => sum + c.size, 0) / clusters.length) : 0}</div>
                <div>Total funding: £{(clusters.reduce((sum, c) => sum + c.totalFunding, 0) / 1000000).toFixed(1)}M</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop - only covers content area, not entire screen */}
      {isExpanded && (
        <div 
          className="fixed top-16 left-80 right-0 bottom-0 bg-black bg-opacity-10 z-30 pointer-events-none"
        />
      )}
    </>
  );
}

export default NetworkControlsPanel;