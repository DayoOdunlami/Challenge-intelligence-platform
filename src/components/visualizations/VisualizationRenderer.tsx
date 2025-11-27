/**
 * Shared Visualization Renderer
 * 
 * Renders visualizations based on type - can be used by both /visualizations and /navigate pages
 */

'use client';

import React, { useMemo } from 'react';
import { SankeyChart } from './SankeyChart';
import { SankeyChartNavigate } from './SankeyChartNavigate';
import { RadarChartNavigate } from './RadarChartNavigate';
import { BarChartNavigate } from './BarChartNavigate';
import { CirclePackingNavigate } from './CirclePackingNavigate';
import { BumpChartNavigate } from './BumpChartNavigate';
import { TreemapSunburstExplorer } from './TreemapSunburstExplorer';
import { HeatmapChart } from './HeatmapChart';
import { HeatmapNavigate } from './HeatmapNavigate';
import { SunburstChart } from './SunburstChart';
import { ChordDiagram } from './ChordDiagram';
import { ChordDiagramNavigate } from './ChordDiagramNavigate';
import { NetworkGraph } from './NetworkGraph';
import { NetworkGraphNavigate } from './NetworkGraphNavigate';
import { NetworkGraphNavigate3D } from './NetworkGraphNavigate3D';
import { StreamGraphNavigate } from './StreamGraphNavigate';
import { ParallelCoordinatesNavigate } from './ParallelCoordinatesNavigate';
import { SwarmPlotNavigate } from './SwarmPlotNavigate';
import { TimelineNavigate } from './TimelineNavigate';
import { BubbleScatterNavigate } from './BubbleScatterNavigate';
import { BarChart3, Zap, Sun, Network } from 'lucide-react';
import { D3NetworkGraphToolkit } from './D3NetworkGraphToolkit';
import { Challenge, Stakeholder, Technology, Project, Relationship, FundingEvent, TechnologyCategory } from '@/lib/navigate-types';
import { ClusterInfo } from '@/lib/cluster-analysis';
import { TreemapViewMode } from '@/types/visualization-controls';

type VisualizationType =
  | 'sankey'
  | 'heatmap'
  | 'network'
  | 'network3d'
  | 'network-toolkit'
  | 'sunburst'
  | 'chord'
  | 'radar'
  | 'bar'
  | 'circle'
  | 'bump'
  | 'treemap'
  | 'stream'
  | 'parallel'
  | 'swarm'
  | 'timeline'
  | 'bubble-scatter';

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
  bumpView?: 'all_technologies' | 'by_category' | 'top_advancing';
  setBumpView?: (view: 'all_technologies' | 'by_category' | 'top_advancing') => void;
  selectedCategories?: TechnologyCategory[];
  treemapView?: TreemapViewMode;
  setTreemapView?: (view: TreemapViewMode) => void;
  chordView?: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow';
  setChordView?: (view: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow') => void;
  heatmapView?: 'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status';
  setHeatmapView?: (view: 'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status') => void;
  streamView?: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type';
  setStreamView?: (view: 'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type') => void;
  streamScenario?: 'baseline' | 'accelerated';
  setStreamScenario?: (scenario: 'baseline' | 'accelerated') => void;
  streamScenarioState?: { government_funding_multiplier: number; private_funding_multiplier: number };
  setStreamScenarioState?: (state: { government_funding_multiplier: number; private_funding_multiplier: number }) => void;
  parallelDimensions?: string[];
  setParallelDimensions?: (dims: string[]) => void;
  swarmView?: 'by_trl' | 'by_category';
  setSwarmView?: (view: 'by_trl' | 'by_category') => void;
  timelineGroups?: string[];
  barSortOrder?: 'asc' | 'desc';
  barValueMode?: 'absolute' | 'percentage';
  heatmapColorMode?: 'absolute' | 'normalized';
  
  // Network-specific
  similarityThreshold?: number;
  setSimilarityThreshold?: (val: number) => void;
  showClusters?: boolean;
  setShowClusters?: (val: boolean) => void;
  isOrbiting?: boolean;
  setIsOrbiting?: (val: boolean) => void;
  selectedCluster?: ClusterInfo | null;
  setSelectedCluster?: (cluster: ClusterInfo | null) => void;
  
  // Highlighting
  highlightedEntityIds?: string[];
  
  // Callbacks
  onNodeClick?: (nodeId: string) => void;
  onCellClick?: (sector: any, problemType: string) => void;
  onEntitySelect?: (entity: { type: 'stakeholder' | 'technology' | 'project' | 'funding'; id: string; data: any }) => void;
  onTechnologySelect?: (techId: string) => void;
  onExternalControlsChange?: (controls: React.ReactNode | null) => void;
  inlineInsightsLocked?: boolean;
  defaultInlineInsights?: boolean;
  inlineInsightsLocked?: boolean;
  defaultInlineInsights?: boolean;

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
  bumpView = 'all_technologies',
  setBumpView,
  selectedCategories = [] as TechnologyCategory[],
  treemapView = 'treemap',
  setTreemapView,
  chordView = 'by_stakeholder_type',
  setChordView,
  heatmapView = 'trl_vs_category',
  setHeatmapView,
  streamView = 'by_stakeholder_type',
  setStreamView,
  streamScenario,
  setStreamScenario,
  streamScenarioState,
  setStreamScenarioState,
  parallelDimensions = [],
  setParallelDimensions,
  swarmView = 'by_trl',
  setSwarmView,
  timelineGroups = ['technology', 'infrastructure', 'policy', 'skills'],
  barSortOrder = 'desc',
  barValueMode = 'absolute',
  heatmapColorMode = 'absolute',
  similarityThreshold = 0.2,
  setSimilarityThreshold,
  showClusters = false,
  setShowClusters,
  isOrbiting = false,
  setIsOrbiting,
  selectedCluster,
  setSelectedCluster,
  highlightedEntityIds = [],
  onNodeClick,
  onCellClick,
  onEntitySelect,
  onTechnologySelect,
  onExternalControlsChange,
  inlineInsightsLocked,
  defaultInlineInsights = true,
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
      case 'network3d':
      case 'network-toolkit':
        return 'min-h-[75vh] max-h-[800px]'
      case 'stream':
        return 'min-h-[70vh] max-h-[750px]'
      case 'parallel':
        return 'min-h-[70vh] max-h-[800px]'
      case 'swarm':
        return 'min-h-[70vh] max-h-[750px]'
      case 'timeline':
        return 'min-h-[70vh] max-h-[800px]'
      case 'bubble-scatter':
        return 'min-h-[80vh] max-h-[900px]' // Increased for better visibility
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
              sortOrder={barSortOrder}
              valueMode={barValueMode}
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
              view={bumpView}
              onViewChange={setBumpView}
              selectedCategories={selectedCategories as TechnologyCategory[]}
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
            <TreemapSunburstExplorer
              fundingEvents={fundingEvents}
              stakeholders={stakeholders}
              technologies={technologies}
              mode={treemapView}
              onModeChange={(view) => setTreemapView?.(view)}
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
              colorMode={heatmapColorMode}
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
    case 'network-toolkit':
      return (
        <div className={containerClass}>
          <D3NetworkGraphToolkit
            onExternalControlsChange={onExternalControlsChange}
            onEntitySelect={onEntitySelect}
            inlineInsightsLocked={inlineInsightsLocked}
            defaultInlineInsights={defaultInlineInsights}
          />
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
              scenario={streamScenario}
              onScenarioChange={setStreamScenario}
              scenarioState={streamScenarioState}
              onScenarioStateChange={setStreamScenarioState}
              showTargets={true}
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
    case 'timeline':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <TimelineNavigate
              onItemClick={(item) => {
                // Handle timeline item click - could link to related entities
                if (item.relatedEntities && item.relatedEntities.length > 0 && onEntitySelect) {
                  // Find first related entity and select it
                  const firstEntityId = item.relatedEntities[0];
                  const stakeholder = stakeholders.find(s => s.id === firstEntityId);
                  const technology = technologies.find(t => t.id === firstEntityId);
                  
                  if (stakeholder) {
                    onEntitySelect({ type: 'stakeholder', id: stakeholder.id, data: stakeholder });
                  } else if (technology) {
                    onEntitySelect({ type: 'technology', id: technology.id, data: technology });
                  }
                }
              }}
              height={isFullscreen ? 800 : 600}
              visibleGroups={timelineGroups}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
              <div className="text-center p-8">
                <p className="text-gray-600">Timeline visualization is only available with NAVIGATE data</p>
              </div>
            </div>
          )}
        </div>
      )
      case 'bubble-scatter':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <BubbleScatterNavigate
              technologies={technologies}
              onTechnologySelect={(tech) => {
                if (onEntitySelect) {
                  onEntitySelect({ type: 'technology', id: tech.id, data: tech });
                }
                if (onTechnologySelect) {
                  onTechnologySelect(tech.id);
                }
              }}
              highlightedTechIds={highlightedEntityIds.filter(id => 
                technologies.some(t => t.id === id)
              )}
              className="w-full min-h-full"
              height="100%" // Use 100% to fill container, container handles sizing
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
              <div className="text-center p-8">
                <p className="text-gray-600">Bubble Scatter is only available with NAVIGATE data</p>
              </div>
            </div>
          )}
        </div>
      )
    case 'network3d':
      return (
        <div className={containerClass}>
          {useNavigateData ? (
            <NetworkGraphNavigate3D 
              stakeholders={stakeholders}
              technologies={technologies}
              projects={projects}
              relationships={relationships}
              selectedEntityId={onEntitySelect ? (onEntitySelect as any).selectedEntityId : undefined}
              onEntitySelect={(entityId) => {
                // Try to find entity in stakeholders, technologies, or projects
                const stakeholder = stakeholders?.find(s => s.id === entityId);
                const technology = technologies?.find(t => t.id === entityId);
                const project = projects?.find(p => p.id === entityId);
                
                if (onEntitySelect) {
                  if (stakeholder) {
                    onEntitySelect({ type: 'stakeholder', id: stakeholder.id, data: stakeholder });
                  } else if (technology) {
                    onEntitySelect({ type: 'technology', id: technology.id, data: technology });
                  } else if (project) {
                    onEntitySelect({ type: 'project', id: project.id, data: project });
                  }
                }
              }}
              className="w-full min-h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#006E51] rounded-full flex items-center justify-center">
                  <Network className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#006E51] mb-2">Network Graph 3D</h3>
                <p className="text-gray-600 mb-4">Available for NAVIGATE data only</p>
                <p className="text-sm text-gray-500">Switch to NAVIGATE Data in Controls to view the 3D network visualization</p>
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

