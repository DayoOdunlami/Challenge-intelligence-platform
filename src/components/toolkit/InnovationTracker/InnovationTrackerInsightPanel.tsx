'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, Users, FileText } from 'lucide-react';
import { HarmonizedEntity, getEntity } from '@/data/toolkit/entities-harmonized';
import { FundingFlowLink } from '@/data/toolkit/fundingFlows-enhanced';

interface InsightPanelProps {
  selectedNodeId: string | null;
  selectedLink: FundingFlowLink | null;
  entity?: HarmonizedEntity;
  onClose: () => void;
}

export function InnovationTrackerInsightPanel({
  selectedNodeId,
  selectedLink,
  entity,
  onClose,
}: InsightPanelProps) {
  if (!selectedNodeId && !selectedLink) return null;

  const isNodeSelected = !!selectedNodeId && !selectedLink;

  return (
    <Card className="w-full lg:w-96 h-full lg:max-h-[800px] overflow-y-auto">
      <CardHeader className="sticky top-0 bg-white z-10 border-b">
        <CardTitle className="flex items-center justify-between">
          <span>Insights</span>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isNodeSelected && entity && <NodeInsights entity={entity} />}
        {selectedLink && <LinkInsights link={selectedLink} />}
      </CardContent>
    </Card>
  );
}

function NodeInsights({ entity }: { entity: HarmonizedEntity }) {
  return (
    <div className="space-y-4">
      {/* Entity Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: entity.color }}
          />
          <h3 className="text-lg font-semibold">{entity.displayName}</h3>
          <Badge variant="outline">{entity.category}</Badge>
        </div>
        {entity.metadata.description && (
          <p className="text-sm text-gray-600">{entity.metadata.description}</p>
        )}
      </div>

      {/* Metrics */}
      {entity.metrics && (
        <div className="grid grid-cols-2 gap-3">
          {entity.metrics.totalFundingReceived && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Funding Received</div>
              <div className="text-lg font-semibold">
                £{(entity.metrics.totalFundingReceived / 1000000).toFixed(1)}M
              </div>
            </div>
          )}
          {entity.metrics.totalFundingProvided && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Funding Provided</div>
              <div className="text-lg font-semibold">
                £{(entity.metrics.totalFundingProvided / 1000000).toFixed(1)}M
              </div>
            </div>
          )}
          {entity.metrics.jobsSupported && (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500 mb-1">Jobs Supported</div>
                <div className="text-lg font-semibold">
                  {entity.metrics.jobsSupported.toLocaleString()}
                </div>
              </div>
            </div>
          )}
          {entity.metrics.projectsCount && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Projects</div>
              <div className="text-lg font-semibold">
                {entity.metrics.projectsCount}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Key Programmes */}
      {entity.knowledgeBase?.keyProgrammes && (
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Key Programmes
          </h4>
          <div className="flex flex-wrap gap-2">
            {entity.knowledgeBase.keyProgrammes.map((programme, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {programme}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recent Announcements */}
      {entity.knowledgeBase?.recentAnnouncements && entity.knowledgeBase.recentAnnouncements.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Recent Announcements</h4>
          <div className="space-y-2">
            {entity.knowledgeBase.recentAnnouncements.map((announcement, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <div className="text-sm font-medium mb-1">{announcement.title}</div>
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(announcement.date).toLocaleDateString()}
                  {announcement.amount && (
                    <span className="ml-2 font-semibold text-gray-700">
                      £{(announcement.amount / 1000000).toFixed(1)}M
                    </span>
                  )}
                </div>
                <a
                  href={announcement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Sources */}
      {entity.knowledgeBase?.evidence && entity.knowledgeBase.evidence.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Evidence Sources</h4>
          <div className="space-y-2">
            {entity.knowledgeBase.evidence.map((evidence, idx) => (
              <div key={idx} className="p-2 border rounded text-xs">
                <div className="font-medium">{evidence.source}</div>
                <div className="text-gray-500 text-xs mt-1">
                  {evidence.type} • {new Date(evidence.date).toLocaleDateString()}
                </div>
                <a
                  href={evidence.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mt-1"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Website Link */}
      {entity.metadata.website && (
        <div>
          <a
            href={entity.metadata.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            Visit website <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}

function LinkInsights({ link }: { link: FundingFlowLink }) {
  const totalValue = link.value;
  const formattedValue = totalValue >= 1 ? `£${totalValue.toFixed(1)}M` : `£${(totalValue * 1000).toFixed(0)}K`;

  return (
    <div className="space-y-4">
      {/* Link Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {link.source} → {link.target}
        </h3>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          <span className="text-2xl font-bold text-[#006E51]">{formattedValue}</span>
        </div>
        {link.programme && (
          <Badge variant="outline" className="mt-2">
            {link.programme}
          </Badge>
        )}
      </div>

      {/* Programme Details */}
      {link.programme && (
        <div>
          <div className="text-sm text-gray-600 mb-2">
            <strong>Programme:</strong> {link.programme}
          </div>
          {link.programmeType && (
            <div className="text-sm text-gray-600">
              <strong>Type:</strong> {link.programmeType}
            </div>
          )}
          {link.year && (
            <div className="text-sm text-gray-600">
              <strong>Year:</strong> {link.year}
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      {link.metadata && (
        <div className="grid grid-cols-2 gap-3">
          {link.metadata.matchFunding && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Industry Match</div>
              <div className="text-lg font-semibold">
                £{link.metadata.matchFunding.toFixed(1)}M
              </div>
            </div>
          )}
          {link.metadata.jobsSupported && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Jobs Supported</div>
              <div className="text-lg font-semibold">
                {link.metadata.jobsSupported.toLocaleString()}
              </div>
            </div>
          )}
          {link.metadata.projectsCount && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Projects</div>
              <div className="text-lg font-semibold">
                {link.metadata.projectsCount}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Evidence Sources */}
      {link.evidence && link.evidence.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Evidence Sources</h4>
          <div className="space-y-2">
            {link.evidence.map((evidence, idx) => (
              <div key={idx} className="p-2 border rounded text-xs">
                <div className="font-medium">{evidence.source}</div>
                <div className="text-gray-500 text-xs mt-1">
                  {new Date(evidence.date).toLocaleDateString()}
                  {evidence.amount && (
                    <span className="ml-2 font-semibold">
                      £{(evidence.amount / 1000000).toFixed(1)}M
                    </span>
                  )}
                </div>
                {evidence.notes && (
                  <div className="text-gray-600 mt-1 italic">{evidence.notes}</div>
                )}
                <a
                  href={evidence.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mt-1"
                >
                  View source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

