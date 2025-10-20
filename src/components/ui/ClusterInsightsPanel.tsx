'use client';

import React, { useState } from 'react';
import { ClusterInfo } from '@/lib/cluster-analysis';
import { Challenge } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './badge';

interface ClusterInsightsPanelProps {
  clusters: ClusterInfo[];
  selectedCluster?: ClusterInfo | null;
  onClusterSelect?: (cluster: ClusterInfo) => void;
  onChallengeSelect?: (challenge: Challenge) => void;
  className?: string;
}

export function ClusterInsightsPanel({
  clusters,
  selectedCluster,
  onClusterSelect,
  onChallengeSelect,
  className = ''
}: ClusterInsightsPanelProps) {
  const [sortBy, setSortBy] = useState<'size' | 'funding' | 'centrality'>('size');

  // Sort clusters based on selected criteria
  const sortedClusters = [...clusters].sort((a, b) => {
    switch (sortBy) {
      case 'funding':
        return b.totalFunding - a.totalFunding;
      case 'centrality':
        return b.centralityScore - a.centralityScore;
      case 'size':
      default:
        return b.size - a.size;
    }
  });

  const totalChallenges = clusters.reduce((sum, cluster) => sum + cluster.size, 0);
  const totalFunding = clusters.reduce((sum, cluster) => sum + cluster.totalFunding, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Cluster Insights
          <div className="text-sm text-gray-600 font-normal">
            {clusters.length} clusters detected
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overview Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium mb-3 text-blue-900">Network Overview</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{totalChallenges}</div>
              <div className="text-blue-800">Clustered Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                £{(totalFunding / 1000000).toFixed(1)}M
              </div>
              <div className="text-blue-800">Total Funding</div>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort by:</span>
          <div className="flex gap-1">
            {[
              { key: 'size', label: 'Size' },
              { key: 'funding', label: 'Funding' },
              { key: 'centrality', label: 'Centrality' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key as 'size' | 'funding' | 'centrality')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  sortBy === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cluster List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedClusters.map((cluster) => (
            <div
              key={cluster.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedCluster?.id === cluster.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onClusterSelect?.(cluster)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{cluster.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {cluster.size} challenges
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{cluster.description}</p>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-medium">Funding:</span>
                  <div className="text-green-600 font-medium">
                    £{(cluster.totalFunding / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div>
                  <span className="font-medium">Sector:</span>
                  <div className="capitalize">
                    {cluster.dominantSector.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {cluster.keyThemes.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {cluster.keyThemes.slice(0, 4).map((theme, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {cluster.crossSectorSignals.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-medium text-orange-700">Cross-sector:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cluster.crossSectorSignals.slice(0, 2).map((signal, index) => (
                      <Badge key={index} variant="outline" className="text-xs text-orange-600">
                        {signal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Cluster Details */}
        {selectedCluster && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3 text-gray-900">
              {selectedCluster.name} - Challenge List
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedCluster.challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="border border-gray-200 rounded p-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onChallengeSelect?.(challenge)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {challenge.title}
                      </h5>
                      <p className="text-xs text-gray-600">
                        {challenge.buyer.organization} • £{challenge.funding.amount_max?.toLocaleString()}
                      </p>
                    </div>
                    <Badge 
                      variant={challenge.timeline.urgency === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs ml-2"
                    >
                      {challenge.timeline.urgency}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {clusters.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No clusters detected with current settings.</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting similarity thresholds or adding more challenges.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ClusterInsightsPanel;