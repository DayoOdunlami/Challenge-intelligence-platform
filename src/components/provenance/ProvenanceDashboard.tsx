/**
 * Provenance Dashboard
 * 
 * Central dashboard for managing data quality, auditing, and provenance.
 * Includes quality metrics, verification queue, bulk operations, and AI audit tools.
 */

'use client';

import { useState, useMemo } from 'react';
import type { BaseEntity } from '@/lib/base-entity-enhanced';
import { 
  computeProvenanceMetrics, 
  filterByProvenance,
  type ProvenanceFilter 
} from '@/lib/base-entity-enhanced';
import {
  isBaselineData,
  needsReview,
  filterByClassification,
  type BaselineClassification,
} from '@/lib/provenance/baseline-tagging';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Filter,
  Bot,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface ProvenanceDashboardProps {
  entities: BaseEntity[];
  onBulkAction?: (action: string, entityIds: string[]) => void;
  onVerifyEntity?: (entityId: string) => void;
  onFlagEntity?: (entityId: string, reason: string) => void;
  aiAuditAvailable?: boolean;
  onRequestAIAudit?: (entityIds: string[]) => Promise<void>;
}

export function ProvenanceDashboard({
  entities,
  onBulkAction,
  onVerifyEntity,
  onFlagEntity,
  aiAuditAvailable = false,
  onRequestAIAudit,
}: ProvenanceDashboardProps) {
  const [selectedEntities, setSelectedEntities] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<ProvenanceFilter>({});

  // Compute quality metrics
  const metrics = useMemo(() => {
    const total = entities.length;
    const baselineCount = entities.filter(isBaselineData).length;
    const needsReviewCount = entities.filter(needsReview).length;
    const verifiedCount = entities.filter(
      e => e.provenance.quality.verificationStatus === 'verified'
    ).length;
    
    const staleCount = entities.filter(e => {
      const m = computeProvenanceMetrics(e.provenance);
      return m.isStale;
    }).length;
    
    const flaggedCount = entities.filter(
      e => e.provenance.flags && e.provenance.flags.length > 0
    ).length;

    const avgConfidence = entities.reduce(
      (sum, e) => sum + e.provenance.quality.confidence,
      0
    ) / total;

    const byClassification: Record<BaselineClassification, number> = {
      dummy: 0,
      baseline: 0,
      test: 0,
      placeholder: 0,
      real: 0,
      needs_review: 0,
    };

    entities.forEach(e => {
      const classification = e.metadata.custom?.baselineClassification as BaselineClassification | undefined;
      const key = classification || 'needs_review';
      byClassification[key] = (byClassification[key] || 0) + 1;
    });

    return {
      total,
      baselineCount,
      needsReviewCount,
      verifiedCount,
      verifiedPercentage: (verifiedCount / total) * 100,
      staleCount,
      stalePercentage: (staleCount / total) * 100,
      flaggedCount,
      flaggedPercentage: (flaggedCount / total) * 100,
      avgConfidence,
      byClassification,
    };
  }, [entities]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    let filtered = entities;
    
    if (Object.keys(activeFilter).length > 0) {
      filtered = filterByProvenance(filtered, activeFilter);
    }
    
    return filtered;
  }, [entities, activeFilter]);

  // Verification queue (high priority candidates)
  const verificationQueue = useMemo(() => {
    return entities
      .filter(e => {
        const m = computeProvenanceMetrics(e.provenance);
        return (
          e.provenance.quality.verificationStatus !== 'verified' &&
          e.provenance.quality.confidence > 0.6 &&
          !m.isStale &&
          needsReview(e) // Prioritize needs_review
        );
      })
      .sort((a, b) => b.provenance.quality.confidence - a.provenance.quality.confidence)
      .slice(0, 20);
  }, [entities]);

  const handleSelectAll = () => {
    if (selectedEntities.size === filteredEntities.length) {
      setSelectedEntities(new Set());
    } else {
      setSelectedEntities(new Set(filteredEntities.map(e => e.id)));
    }
  };

  const handleBulkVerify = () => {
    if (onBulkAction && selectedEntities.size > 0) {
      onBulkAction('verify', Array.from(selectedEntities));
      setSelectedEntities(new Set());
    }
  };

  const handleBulkAIAudit = async () => {
    if (onRequestAIAudit && selectedEntities.size > 0) {
      await onRequestAIAudit(Array.from(selectedEntities));
    }
  };

  return (
    <div className="provenance-dashboard space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Quality Dashboard</h1>
          <p className="text-sm text-gray-500">
            Manage data quality, verification, and provenance
          </p>
        </div>
        {selectedEntities.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBulkVerify}
            >
              Verify Selected ({selectedEntities.size})
            </Button>
            {aiAuditAvailable && (
              <Button
                onClick={handleBulkAIAudit}
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Audit Selected
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Quality Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Database className="h-5 w-5" />}
          label="Total Entities"
          value={metrics.total}
          trend={null}
        />
        <MetricCard
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          label="Verified"
          value={`${metrics.verifiedCount} (${Math.round(metrics.verifiedPercentage)}%)`}
          trend={metrics.verifiedPercentage > 80 ? 'good' : 'warning'}
        />
        <MetricCard
          icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
          label="Needs Review"
          value={metrics.needsReviewCount}
          trend={metrics.needsReviewCount > metrics.total * 0.3 ? 'warning' : 'good'}
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          label="Avg Confidence"
          value={`${Math.round(metrics.avgConfidence * 100)}%`}
          trend={metrics.avgConfidence > 0.7 ? 'good' : 'warning'}
        />
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Verification Queue</TabsTrigger>
          <TabsTrigger value="classification">Classification</TabsTrigger>
          <TabsTrigger value="flags">Quality Flags</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data Classification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.byClassification).map(([key, count]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                      <Badge variant={key === 'real' ? 'default' : 'secondary'}>
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quality Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Stale Data (&gt;90 days)</span>
                    <Badge variant={metrics.staleCount > 0 ? 'destructive' : 'default'}>
                      {metrics.staleCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Flagged Entities</span>
                    <Badge variant={metrics.flaggedCount > 0 ? 'destructive' : 'default'}>
                      {metrics.flaggedCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Baseline/Test Data</span>
                    <Badge variant="secondary">
                      {metrics.baselineCount}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Verification Queue Tab */}
        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Verification Queue ({verificationQueue.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {verificationQueue.length === 0 ? (
                  <p className="text-sm text-gray-500">No entities need verification</p>
                ) : (
                  verificationQueue.map(entity => (
                    <EntityRow
                      key={entity.id}
                      entity={entity}
                      selected={selectedEntities.has(entity.id)}
                      onSelect={(selected) => {
                        const newSet = new Set(selectedEntities);
                        if (selected) {
                          newSet.add(entity.id);
                        } else {
                          newSet.delete(entity.id);
                        }
                        setSelectedEntities(newSet);
                      }}
                      onVerify={() => onVerifyEntity?.(entity.id)}
                      onAIAudit={() => onRequestAIAudit?.([entity.id])}
                      aiAuditAvailable={aiAuditAvailable}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classification Tab */}
        <TabsContent value="classification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Classification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage how data is classified (dummy, baseline, real, needs_review)
              </p>
              <div className="space-y-2">
                {Object.entries(metrics.byClassification).map(([classification, count]) => (
                  <div key={classification} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <span className="font-medium capitalize">
                        {classification.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-gray-500">
                        {count} entities
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Filter to show entities of this classification
                        // Could implement filter here
                      }}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flags Tab */}
        <TabsContent value="flags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quality Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Entities with quality issues or flags
              </p>
              <div className="space-y-2">
                {entities
                  .filter(e => e.provenance.flags && e.provenance.flags.length > 0)
                  .slice(0, 20)
                  .map(entity => (
                    <div key={entity.id} className="p-3 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{entity.name}</h4>
                          <div className="space-y-1 mt-2">
                            {entity.provenance.flags?.map((flag, idx) => (
                              <Badge
                                key={idx}
                                variant={
                                  flag.severity === 'error'
                                    ? 'destructive'
                                    : flag.severity === 'warning'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {flag.message}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {onFlagEntity && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onFlagEntity(entity.id, 'Resolved')}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Filters Tab */}
        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quality Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Filter entities by quality metrics for bulk operations
              </p>
              {/* Filter controls could go here */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveFilter({ verifiedOnly: true })}
                >
                  Show Only Verified
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveFilter({ minConfidence: 0.7 })}
                >
                  Show High Confidence (70%+)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveFilter({})}
                >
                  Show All
                </Button>
              </div>
              {Object.keys(activeFilter).length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {filteredEntities.length} of {entities.length} entities
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: 'good' | 'warning' | null;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div
            className={
              trend === 'good'
                ? 'text-green-600'
                : trend === 'warning'
                ? 'text-yellow-600'
                : 'text-gray-400'
            }
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EntityRow({
  entity,
  selected,
  onSelect,
  onVerify,
  onAIAudit,
  aiAuditAvailable,
}: {
  entity: BaseEntity;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onVerify?: () => void;
  onAIAudit?: () => void;
  aiAuditAvailable: boolean;
}) {
  const metrics = computeProvenanceMetrics(entity.provenance);
  const classification = entity.metadata.custom?.baselineClassification as BaselineClassification | undefined;

  return (
    <div className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onSelect(e.target.checked)}
        className="rounded"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{entity.name}</h4>
          {classification && (
            <Badge variant="secondary" className="text-xs">
              {classification}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {Math.round(entity.provenance.quality.confidence * 100)}% confidence
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mt-1">{entity.entityType}</p>
      </div>
      <div className="flex gap-2">
        {onVerify && (
          <Button variant="outline" size="sm" onClick={onVerify}>
            Verify
          </Button>
        )}
        {onAIAudit && aiAuditAvailable && (
          <Button variant="outline" size="sm" onClick={onAIAudit}>
            <Bot className="h-3 w-3 mr-1" />
            AI Audit
          </Button>
        )}
      </div>
    </div>
  );
}

