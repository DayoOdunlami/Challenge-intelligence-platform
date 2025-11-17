/**
 * Shared Visualization Renderer
 * 
 * Renders visualizations based on type - can be used by both /visualizations and /navigate pages
 */

'use client';

import React from 'react';
import { SankeyChart } from './SankeyChart';
import { SankeyChartNavigate } from './SankeyChartNavigate';
import { RadarChartNavigate } from './RadarChartNavigate';
import { BarChartNavigate } from './BarChartNavigate';
import { CirclePackingNavigate } from './CirclePackingNavigate';
import { BumpChartNavigate } from './BumpChartNavigate';
import { TreemapNavigate } from './TreemapNavigate';
import { HeatmapChart } from './HeatmapChart';
import { HeatmapNavigate } from './HeatmapNavigate';
import { SunburstChart } from './SunburstChart';
import { ChordDiagram } from './ChordDiagram';
import { ChordDiagramNavigate } from './ChordDiagramNavigate';
import { NetworkGraph } from './NetworkGraph';
import { NetworkGraphNavigate } from './NetworkGraphNavigate';
import { StreamGraphNavigate } from './StreamGraphNavigate';
import { ParallelCoordinatesNavigate } from './ParallelCoordinatesNavigate';
import { SwarmPlotNavigate } from './SwarmPlotNavigate';
import { BarChart3, Zap, Sun, Network } from 'lucide-react';
import { Challenge, Stakeholder, Technology, Project, Relationship, FundingEvent } from '@/lib/navigate-types';
import { ClusterInfo } from '@/lib/cluster-analysis';

type VisualizationType = 'sankey' | 'heatmap' | 'network' | 'sunburst' | 'chord' | 'radar' | 'bar' | 'circle' | 'bump' | 'treemap' | 'stream' | 'parallel' | 'swarm';

interface VisualizationRendererProps {
  activeViz: VisualizationType;
  useNavigateData: boolean;
  isFullscreen: boolean;
  
  // Challenge data
  filteredChallenges?: any[];
  selectedChallenge?: any;
  onChallengeSelect?: (challenge: any) => void;
  onClustersDetected?: (clusters: ClusterInfo[]) => void;
  
  // NAVIGATE data
  stakeholders?: Stakeholder[];
  technologies?: Technology[];
  projects?: Project[];
  fundingEvents?: FundingEvent[];
  relationships?: Relationship[];
  
  // State props
  selectedTechIds?: string[];
  setSelectedTechIds?: (ids: string[]) => void;
  selectedDimensions?: string[];
  setSelectedDimensions?: (dims: string[]) => void;
  barChartView?: 'funding_by_stakeholder' | 'funding_by_tech' | 'projects_by_status' | 'tech_by_trl';
  setBarChartView?: (view: 'funding_by_stakeholder' | 'funding_by_tech' | 'projects_by_status' | 'tech_by_trl') => void;
  circlePackingView?: 'by_stakeholder_type' | 'by_technology_category' | 'by_funding';
  setCirclePackingView?: (view: 'by_stakeholder_type' | 'by_technology_category' | 'by_funding') => void;
  treemapView?: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type' | 'by_project';
  setTreemapView?: (view: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type' | 'by_project') => void;
  chordView?: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow';
  setChordView?: (view: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow') => void;
  heatmapView?: 'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status';
  setHeatmapView?: (view: 'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status') => void;
  streamView?: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type';
  setStreamView?: (view: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type') => void;
  parallelDimensions?: string[];
  setParallelDimensions?: (dims: string[]) => void;
  swarmView?: 'by_trl' | 'by_category';
  setSwarmView?: (view: 'by_trl' | 'by_category') => void;
  
  // Network-specific
  similarityThreshold?: number;
  setSimilarityThreshold?: (val: number) => void;
  showClusters?: boolean;
  setShowClusters?: (val: boolean) => void;
  isOrbiting?: boolean;
  setIsOrbiting?: (val: boolean) => void;
  selectedCluster?: ClusterInfo | null;
  setSelectedCluster?: (cluster: ClusterInfo | null) => void;
  
  // Callbacks
  onNodeClick?: (nodeId: string) => void;
  onCellClick?: (sector: any, problemType: string) => void;
  onEntitySelect?: (entity: { type: 'stakeholder' | 'technology' | 'project' | 'funding'; id: string; data: any }) => void;
  onTechnologySelect?: (techId: string) => void;
  
  className?: string;
}

export function VisualizationRenderer({
  activeViz,
  useNavigateData,
  isFullscreen,
  filteredChallenges = [],
  selectedChallenge,
  onChallengeSelect,
  onClustersDetected,
  stakeholders = [],
  technologies = [],
  projects = [],
  fundingEvents = [],
  relationships = [],
  selectedTechIds = [],
  setSelectedTechIds,
  selectedDimensions = [],
  setSelectedDimensions,
  barChartView = 'funding_by_stakeholder',
  setBarChartView,
  circlePackingView = 'by_stakeholder_type',
  setCirclePackingView,
  treemapView = 'by_stakeholder_type',
  setTreemapView,
  chordView = 'by_stakeholder_type',
  setChordView,
  heatmapView = 'trl_vs_category',
  setHeatmapView,
  streamView = 'by_stakeholder_type',
  setStreamView,
  parallelDimensions = [],
  setParallelDimensions,
  swarmView = 'by_trl',
  setSwarmView,
  similarityThreshold = 0.2,
  setSimilarityThreshold,
  showClusters = false,
  setShowClusters,
  isOrbiting = false,
  setIsOrbiting,
  selectedCluster,
  setSelectedCluster,
  onNodeClick,
  onCellClick,
  onEntitySelect,
  onTechnologySelect,
  className = ''
}: VisualizationRendererProps) {
  
  // Dynamic height calculation
  const getVisualizationHeight = () => {
    if (isFullscreen) {
      return 'h-[calc(100vh-80px)]'
    }
    
    switch (activeViz) {
      case 'sankey':
        return 'min-h-[75vh] max-h-[900px]'
      case 'radar':
        return 'min-h-[70vh] max-h-[800px]'
      case 'bar':
        return 'min-h-[65vh] max-h-[700px]'
      case 'circle':
        return 'min-h-[70vh] max-h-[750px]'
      case 'bump':
        return 'min-h-[70vh] max-h-[750px]'
      case 'treemap':
        return 'min-h-[70vh] max-h-[750px]'
      case 'heatmap':
        return 'min-h-[65vh] max-h-[700px]'
      case 'sunburst':
        return 'min-h-[70vh] max-h-[750px]'
      case 'chord':
        return 'min-h-[70vh] max-h-[750px]'
      case 'network':
        return 'min-h-[75vh] max-h-[800px]'
      case 'stream':
        return 'min-h-[70vh] max-h-[750px]'
      case 'parallel':
        return 'min-h-[70vh] max-h-[800px]'
      case 'swarm':
        return 'min-h-[70vh] max-h-[750px]'
      default:
        return 'min-h-[65vh] max-h-[700px]'
    }
  }

  const containerClass = `w-full ${getVisualizationHeight()} overflow-auto ${className}`

  switch (activeViz) {
    case 'sankey':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <SankeyChartNavigate 
              stakeholders={stakeholders}
              technologies={technologies}
              fundingEvents={fundingEvents}
              relationships={relationships}
              onNodeClick={onNodeClick}
              className="w-full min-h-full"
            />
          ) : (
            <SankeyChart 
              challenges={filteredChallenges}
              onNodeClick={onNodeClick}
              className="w-full min-h-full"
            />
          )}
        </div>
      )
    case 'radar':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <RadarChartNavigate 
              technologies={technologies}
              selectedTechIds={selectedTechIds}
              onTechIdsChange={setSelectedTechIds}
              selectedDimensions={selectedDimensions}
              onDimensionsChange={setSelectedDimensions}
              onTechnologySelect={onTechnologySelect}
              className="w-full min-h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
              <div className="text-center p-8">
                <Zap className="h-8 w-8 text-[#006E51] mx-auto mb-4" />
                <p className="text-gray-600">Radar Chart is only available with NAVIGATE data</p>
              </div>
            </div>
          )}
        </div>
      )
    case 'bar':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <BarChartNavigate 
              stakeholders={stakeholders}
              technologies={technologies}
              projects={projects}
              fundingEvents={fundingEvents}
              view={barChartView}
              onViewChange={setBarChartView}
              className="w-full min-h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
              <div className="text-center p-8">
                <BarChart3 className="h-8 w-8 text-[#006E51] mx-auto mb-4" />
                <p className="text-gray-600">Bar Chart is only available with NAVIGATE data</p>
              </div>
            </div>
          )}
        </div>
      )
    case 'circle':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <CirclePackingNavigate 
              stakeholders={stakeholders}
              technologies={technologies}
              projects={projects}
              fundingEvents={fundingEvents}
              relationships={relationships}
              view={circlePackingView}
              onViewChange={setCirclePackingView}
              onNodeClick={(nodeId, nodeData) => {
                if (onEntitySelect && nodeData) {
                  onEntitySelect({ type: nodeData.type, id: nodeId, data: nodeData });
                }
              }}
              className="w-full min-h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
              <div className="text-center p-8">
                <Sun className="h-8 w-8 text-[#006E51] mx-auto mb-4" />
                <p className="text-gray-600">Circle Packing is only available with NAVIGATE data</p>
              </div>
            </div>
          )}
        </div>
      )
    case 'bump':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <BumpChartNavigate 
              technologies={technologies}
              onTechnologySelect={onTechnologySelect}
              className="w-full min-h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
              <div className="text-center p-8">
                <BarChart3 className="h-8 w-8 text-[#006E51] mx-auto mb-4" />
                <p className="text-gray-600">TRL Progression is only available with NAVIGATE data</p>
              </div>
            </div>
          )}
        </div>
      )
    case 'treemap':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <TreemapNavigate 
              stakeholders={stakeholders}
              technologies={technologies}
              projects={projects}
              fundingEvents={fundingEvents}
              view={treemapView}
              onViewChange={setTreemapView}
              onNodeClick={(nodeId, nodeData) => {
                if (onEntitySelect && nodeData) {
                  onEntitySelect({ type: nodeData.type, id: nodeId, data: nodeData });
                }
              }}
              className="w-full min-h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
              <div className="text-center p-8">
                <BarChart3 className="h-8 w-8 text-[#006E51] mx-auto mb-4" />
                <p className="text-gray-600">Funding Breakdown is only available with NAVIGATE data</p>
              </div>
            </div>
          )}
        </div>
      )
    case 'heatmap':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <HeatmapNavigate 
              stakeholders={stakeholders}
              technologies={technologies}
              view={heatmapView}
              onViewChange={setHeatmapView}
              onCellClick={(row, col, value) => {
                if (onCellClick) {
                  onCellClick(row, col);
                }
              }}
              className="w-full min-h-full"
            />
          ) : (
            <HeatmapChart 
              challenges={filteredChallenges}
              onCellClick={onCellClick}
              className="w-full min-h-full"
            />
          )}
        </div>
      )
    case 'network':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <NetworkGraphNavigate 
              stakeholders={stakeholders}
              technologies={technologies}
              projects={projects}
              relationships={relationships}
              selectedEntityId={selectedChallenge?.id || null}
              onEntitySelect={(id) => {
                if (onChallengeSelect) {
                  const challenge = filteredChallenges.find(c => c.id === id);
                  if (challenge) onChallengeSelect(challenge);
                }
              }}
              className="w-full min-h-full"
            />
          ) : (
            <NetworkGraph 
              challenges={filteredChallenges}
              selectedChallenge={selectedChallenge}
              onChallengeSelect={onChallengeSelect}
              onClustersDetected={onClustersDetected}
              showControls={false}
              similarityThreshold={similarityThreshold}
              showClusters={showClusters}
              isOrbiting={isOrbiting}
              selectedCluster={selectedCluster}
              className="w-full min-h-full"
            />
          )}
        </div>
      )
    case 'sunburst':
      return (
        <div className={containerClass}>
          <SunburstChart 
            challenges={filteredChallenges}
            onChallengeSelect={onChallengeSelect}
            className="w-full h-full"
          />
        </div>
      )
    case 'chord':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <ChordDiagramNavigate 
              stakeholders={stakeholders}
              technologies={technologies}
              relationships={relationships}
              view={chordView}
              onViewChange={setChordView}
              onEntitySelect={(entityId, entityType) => {
                if (onEntitySelect) {
                  if (entityType === 'stakeholder') {
                    const stakeholder = stakeholders.find(s => s.id === entityId);
                    if (stakeholder) {
                      onEntitySelect({ type: 'stakeholder', id: stakeholder.id, data: stakeholder });
                    }
                  } else {
                    const tech = technologies.find(t => t.id === entityId);
                    if (tech) {
                      onEntitySelect({ type: 'technology', id: tech.id, data: tech });
                    }
                  }
                }
              }}
              className="w-full min-h-full"
            />
          ) : (
            <ChordDiagram 
              challenges={filteredChallenges}
              onSectorSelect={(sector) => {
                if (onCellClick) {
                  onCellClick(sector, '');
                }
              }}
              className="w-full h-full"
            />
          )}
        </div>
      )
    case 'stream':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <StreamGraphNavigate
              fundingEvents={fundingEvents}
              stakeholders={stakeholders}
              technologies={technologies}
              view={streamView}
              onViewChange={setStreamView}
              onStreamClick={(id, data) => {
                console.log('Stream clicked:', id, data);
              }}
              className="w-full min-h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
              <div className="text-center p-8">
                <p className="text-gray-600">Stream Graph is only available with NAVIGATE data</p>
              </div>
            </div>
          )}
        </div>
      )
    case 'parallel':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <ParallelCoordinatesNavigate
              technologies={technologies}
              selectedTechIds={selectedTechIds}
              dimensions={parallelDimensions}
              onTechnologySelect={onTechnologySelect}
              className="w-full min-h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
              <div className="text-center p-8">
                <p className="text-gray-600">Parallel Coordinates is only available with NAVIGATE data</p>
              </div>
            </div>
          )}
        </div>
      )
    case 'swarm':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <SwarmPlotNavigate
              technologies={technologies}
              view={swarmView}
              onViewChange={setSwarmView}
              onNodeClick={onTechnologySelect}
              className="w-full min-h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
              <div className="text-center p-8">
                <p className="text-gray-600">Swarm Plot is only available with NAVIGATE data</p>
              </div>
            </div>
          )}
        </div>
      )
    default:
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#006E51] rounded-full flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#006E51] mb-2">Select Visualization</h3>
            <p className="text-gray-600">Choose a visualization type from the options above</p>
          </div>
        </div>
      )
  }
}

