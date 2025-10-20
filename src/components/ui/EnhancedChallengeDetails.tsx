'use client';

import React from 'react';
import { Challenge, NetworkLink } from '@/lib/types';
import { ClusterInfo, findSimilarChallenges, analyzeNetworkPosition } from '@/lib/cluster-analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './badge';

interface EnhancedChallengeDetailsProps {
  challenge: Challenge | null;
  allChallenges: Challenge[];
  links: NetworkLink[];
  clusters: ClusterInfo[];
  onChallengeSelect?: (challenge: Challenge) => void;
  className?: string;
}

export function EnhancedChallengeDetails({
  challenge,
  allChallenges,
  links,
  clusters,
  onChallengeSelect,
  className = ''
}: EnhancedChallengeDetailsProps) {
  if (!challenge) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Challenge Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">Click on a node in the network graph to see detailed challenge analysis.</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium mb-2 text-blue-900">Network Overview</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• {allChallenges.length} total challenges</p>
                <p>• {clusters.length} detected clusters</p>
                <p>• {links.length} connections identified</p>
                <p>• Cross-sector collaboration opportunities</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium mb-2 text-green-900">How to Use</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>• Click nodes to see relationship context</p>
                <p>• Explore similar challenges and clusters</p>
                <p>• Identify collaboration opportunities</p>
                <p>• Understand network positioning</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find similar challenges
  const similarChallenges = findSimilarChallenges(challenge, allChallenges, links, 4);
  
  // Analyze network position
  const networkPosition = analyzeNetworkPosition(challenge, links);
  
  // Find cluster membership
  const memberCluster = clusters.find(cluster => 
    cluster.challenges.some(c => c.id === challenge.id)
  );
  
  // Find cross-sector opportunities
  const crossSectorOpportunities = similarChallenges.filter(sc => 
    sc.challenge.sector.primary !== challenge.sector.primary
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Challenge Intelligence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Challenge Info */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">{challenge.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
          
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Sector:</span>
              <Badge variant="outline" className="capitalize">
                {challenge.sector.primary.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Urgency:</span>
              <Badge 
                variant={challenge.timeline.urgency === 'critical' ? 'destructive' : 'secondary'}
                className="capitalize"
              >
                {challenge.timeline.urgency}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Funding:</span>
              <span className="text-green-600 font-medium">
                £{challenge.funding.amount_min?.toLocaleString()} - £{challenge.funding.amount_max?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Network Position Analysis */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium mb-2 text-blue-900">Network Position</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Position Type:</span>
              <Badge variant="outline" className="capitalize">
                {networkPosition.position.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Connections:</span>
              <span className="font-medium">{networkPosition.connectionCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Avg Similarity:</span>
              <span className="font-medium">{(networkPosition.averageSimilarity * 100).toFixed(0)}%</span>
            </div>
            <p className="text-xs text-blue-800 mt-2">{networkPosition.description}</p>
          </div>
        </div>

        {/* Cluster Membership */}
        {memberCluster && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-purple-900">Cluster Membership</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Cluster:</span>
                <Badge variant="outline">{memberCluster.name}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Size:</span>
                <span className="font-medium">{memberCluster.size} challenges</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Total Funding:</span>
                <span className="font-medium text-green-600">
                  £{(memberCluster.totalFunding / 1000000).toFixed(1)}M
                </span>
              </div>
              <p className="text-xs text-purple-800 mt-2">{memberCluster.description}</p>
              
              {memberCluster.keyThemes.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-medium text-purple-900">Key Themes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {memberCluster.keyThemes.slice(0, 3).map((theme, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Similar Challenges */}
        {similarChallenges.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-gray-900">Similar Challenges</h4>
            <div className="space-y-2">
              {similarChallenges.map(({ challenge: similarChallenge, similarity }) => (
                <div 
                  key={similarChallenge.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onChallengeSelect?.(similarChallenge)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {similarChallenge.title}
                      </h5>
                      <p className="text-xs text-gray-600 mt-1">
                        {similarChallenge.sector.primary.replace('_', ' ')} • {similarChallenge.buyer.organization}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {(similarity * 100).toFixed(0)}% match
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Sector Opportunities */}
        {crossSectorOpportunities.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-green-900">Cross-Sector Opportunities</h4>
            <p className="text-xs text-green-800 mb-3">
              Similar challenges from different sectors suggest collaboration potential
            </p>
            <div className="space-y-2">
              {crossSectorOpportunities.slice(0, 2).map(({ challenge: crossChallenge, similarity }) => (
                <div 
                  key={crossChallenge.id}
                  className="bg-white border border-green-300 rounded p-2 cursor-pointer hover:bg-green-25 transition-colors"
                  onClick={() => onChallengeSelect?.(crossChallenge)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-900 truncate">
                        {crossChallenge.title}
                      </p>
                      <p className="text-xs text-green-700">
                        {crossChallenge.sector.primary.replace('_', ' ')} sector
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">
                      {(similarity * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Sector Signals */}
        {challenge.sector.cross_sector_signals.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-gray-900">Cross-Sector Signals</h4>
            <div className="flex flex-wrap gap-1">
              {challenge.sector.cross_sector_signals.map((signal, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {signal}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Keywords */}
        <div>
          <h4 className="font-medium mb-2 text-gray-900">Keywords</h4>
          <div className="flex flex-wrap gap-1">
            {challenge.keywords.slice(0, 8).map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        {/* Organization Info */}
        <div className="border-t pt-4">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">Organization:</span>
              <span>{challenge.buyer.organization}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Deadline:</span>
              <span>{challenge.timeline.deadline?.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EnhancedChallengeDetails;