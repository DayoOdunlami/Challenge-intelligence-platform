"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, Network, Zap, Sun, GitBranch, Download, Settings, MessageCircle, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"



// Import existing visualization components and data
import { SankeyChart } from "@/components/visualizations/SankeyChart"
import { SankeyChartNavigate } from "@/components/visualizations/SankeyChartNavigate"
import { RadarChartNavigate } from "@/components/visualizations/RadarChartNavigate"
import { BarChartNavigate } from "@/components/visualizations/BarChartNavigate"
import { CirclePackingNavigate } from "@/components/visualizations/CirclePackingNavigate"
import { BumpChartNavigate } from "@/components/visualizations/BumpChartNavigate"
import { TreemapSunburstExplorer } from "@/components/visualizations/TreemapSunburstExplorer"
import { HeatmapChart } from "@/components/visualizations/HeatmapChart"
import { HeatmapNavigate } from "@/components/visualizations/HeatmapNavigate"
import { SunburstChart } from "@/components/visualizations/SunburstChart"
import { ChordDiagram } from "@/components/visualizations/ChordDiagram"
import { ChordDiagramNavigate } from "@/components/visualizations/ChordDiagramNavigate"
import { NetworkGraph } from "@/components/visualizations/NetworkGraph"
import { NetworkGraphNavigate } from "@/components/visualizations/NetworkGraphNavigate"
import { NetworkGraphNavigate3D } from "@/components/visualizations/NetworkGraphNavigate3D"
import { UnifiedNetworkGraph } from "@/components/visualizations/UnifiedNetworkGraph"
import { StreamGraphNavigate } from "@/components/visualizations/StreamGraphNavigate"
import { ParallelCoordinatesNavigate } from "@/components/visualizations/ParallelCoordinatesNavigate"
import { SwarmPlotNavigate } from "@/components/visualizations/SwarmPlotNavigate"
import challenges from "@/data/challenges"
import { stakeholders, technologies, projects, relationships, fundingEvents } from "@/data/navigate-dummy-data"
import { unifiedEntities, unifiedRelationships } from "@/data/unified"
import { Challenge } from "@/lib/types"
import { AppProvider, useAppContext } from "@/contexts/AppContext"
import { InsightsSummary } from "@/components/ui/InsightsSummary"
import { UnifiedFloatingNav } from "@/components/ui/UnifiedFloatingNav"
import { TopNavigation } from "@/components/ui/TopNavigation"
import { TreemapViewMode } from "@/types/visualization-controls"

// Import cluster analysis types
import { ClusterInfo } from "@/lib/cluster-analysis"
import { CreativeHero } from "@/components/ui/CreativeHero"

// Note: Using custom panels instead of importing existing ones to avoid prop dependencies

type VisualizationType = 'sankey' | 'heatmap' | 'network' | 'network3d' | 'unifiednetwork' | 'sunburst' | 'chord' | 'radar' | 'bar' | 'circle' | 'bump' | 'treemap' | 'stream' | 'parallel' | 'swarm'

const visualizations = [
  {
    id: 'sankey' as VisualizationType,
    name: 'Flow Analysis',
    description: 'Challenge progression and resource flows',
    icon: GitBranch,
    color: '#006E51'
  },
  {
    id: 'radar' as VisualizationType,
    name: 'Tech Maturity Radar',
    description: 'Compare technology readiness across dimensions',
    icon: Zap,
    color: '#8b5cf6'
  },
  {
    id: 'bar' as VisualizationType,
    name: 'Bar Chart Analysis',
    description: 'Funding, projects, and technology breakdowns',
    icon: BarChart3,
    color: '#4A90E2'
  },
  {
    id: 'circle' as VisualizationType,
    name: 'Circle Packing',
    description: 'Hierarchical stakeholder and technology relationships',
    icon: Sun,
    color: '#50C878'
  },
  {
    id: 'bump' as VisualizationType,
    name: 'TRL Progression',
    description: 'Technology readiness level advancement over time',
    icon: BarChart3,
    color: '#EC4899'
  },
  {
    id: 'treemap' as VisualizationType,
    name: 'Funding Breakdown',
    description: 'Hierarchical funding distribution and budgets',
    icon: BarChart3,
    color: '#F5A623'
  },
  {
    id: 'heatmap' as VisualizationType,
    name: 'Intensity Map',
    description: 'Challenge density and hotspots',
    icon: BarChart3,
    color: '#4A90E2'
  },
  {
    id: 'network' as VisualizationType,
    name: 'Network Graph',
    description: 'Connections and relationships',
    icon: Network,
    color: '#50C878'
  },
  {
    id: 'network3d' as VisualizationType,
    name: 'Network Graph 3D',
    description: '3D interactive network visualization',
    icon: Network,
    color: '#006E51'
  },
  {
    id: 'unifiednetwork' as VisualizationType,
    name: 'Unified Network (2D)',
    description: 'Cross-domain network from unified schema',
    icon: Network,
    color: '#10B981'
  },
  {
    id: 'sunburst' as VisualizationType,
    name: 'Hierarchical View',
    description: 'Multi-level challenge breakdown',
    icon: Sun,
    color: '#F5A623'
  },
  {
    id: 'chord' as VisualizationType,
    name: 'Relationship Matrix',
    description: 'Cross-sector dependencies',
    icon: Zap,
    color: '#8b5cf6'
  },
  {
    id: 'stream' as VisualizationType,
    name: 'Funding Trends',
    description: 'Funding flows over time',
    icon: BarChart3,
    color: '#10B981'
  },
  {
    id: 'parallel' as VisualizationType,
    name: 'Parallel Coordinates',
    description: 'Multi-dimensional technology comparison',
    icon: Zap,
    color: '#6366F1'
  },
  {
    id: 'swarm' as VisualizationType,
    name: 'Technology Distribution',
    description: 'TRL and category distribution',
    icon: BarChart3,
    color: '#F59E0B'
  }
]




// Inner component that uses AppContext
function VisualizationsContent() {
  // Get data from AppContext (like individual pages do)
  const { 
    filteredChallenges, 
    selectedChallenge, 
    setSelectedChallenge
  } = useAppContext()
  const [activeViz, setActiveViz] = useState<VisualizationType>('network')
  const [useNavigateData, setUseNavigateData] = useState(false) // Toggle between Challenge and NAVIGATE data
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInsights, setShowInsights] = useState(true) // Show by default
  const [showControls, setShowControls] = useState(true) // Show by default
  const [focusMode, setFocusMode] = useState(false) // Focus mode off by default
  const [circlePackingView, setCirclePackingView] = useState<'by_stakeholder_type' | 'by_technology_category' | 'by_funding'>('by_stakeholder_type')
  
  // NAVIGATE visualization control states
  const [bumpView, setBumpView] = useState<'all_technologies' | 'by_category' | 'top_advancing'>('all_technologies')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [treemapView, setTreemapView] = useState<TreemapViewMode>('treemap')
  const [barChartView, setBarChartView] = useState<'funding_by_stakeholder' | 'funding_by_tech' | 'projects_by_status' | 'tech_by_trl'>('funding_by_stakeholder')
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([])
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([
    'TRL Level',
    'Funding',
    'Market Readiness',
    'Regulatory Status',
    '2030 Maturity'
  ])
  
  // Chord Diagram and Heatmap control states
  const [chordView, setChordView] = useState<'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow'>('by_stakeholder_type')
  const [heatmapView, setHeatmapView] = useState<'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status'>('trl_vs_category')
  
  // Stream Graph, Parallel Coordinates, and Swarm Plot control states
  const [streamView, setStreamView] = useState<'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type'>('by_stakeholder_type')
  const [parallelDimensions, setParallelDimensions] = useState<string[]>([
    'TRL Level',
    'Funding (£M)',
    'Market Readiness',
    'Regulatory Status',
    '2030 Maturity'
  ])
  const [swarmView, setSwarmView] = useState<'by_trl' | 'by_category'>('by_trl')
  
  // TRL Filter state
  const [trlRange, setTrlRange] = useState<[number, number]>([1, 9])
  
  // Network-specific state (like individual network page)
  const [detectedClusters, setDetectedClusters] = useState<ClusterInfo[]>([])
  const [selectedCluster, setSelectedCluster] = useState<ClusterInfo | null>(null)
  const [similarityThreshold, setSimilarityThreshold] = useState(0.2)
  const [showClusters, setShowClusters] = useState(false)
  const [isOrbiting, setIsOrbiting] = useState(false)
  
  // Interactive state for insights (like individual pages)
  const [selectedElement, setSelectedElement] = useState<any>(null)
  const [selectedSector, setSelectedSector] = useState<any>(null)
  const [selectedProblemType, setSelectedProblemType] = useState<string | null>(null)
  
  // NAVIGATE entity selection state
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'stakeholder' | 'technology' | 'project' | 'funding';
    id: string;
    data: any;
  } | null>(null)
  
  // Handle element selection for insights (like individual pages do)
  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId)
    
    // Handle different node types like individual pages
    if (nodeId.startsWith('challenge_')) {
      const challengeId = nodeId.replace('challenge_', '')
      const challenge = filteredChallenges.find(c => c.id === challengeId)
      setSelectedChallenge(challenge || null)
    } else if (nodeId.startsWith('sector_')) {
      const sector = nodeId.replace('sector_', '')
      setSelectedElement({ type: 'sector', value: sector })
    } else if (nodeId.startsWith('problem_')) {
      const problemType = nodeId.replace('problem_', '')
      setSelectedElement({ type: 'problemType', value: problemType })
    }
  }

  // Handle challenge selection from NetworkGraph (like individual pages)
  const handleChallengeSelect = (challenge: Challenge | null) => {
    setSelectedChallenge(challenge)
  }

  // Auto-enable NAVIGATE data for NAVIGATE-only visualizations
  useEffect(() => {
    const navigateOnlyVisualizations: VisualizationType[] = ['stream', 'parallel', 'swarm', 'radar', 'bar', 'circle', 'bump', 'treemap', 'heatmap', 'chord', 'network3d'];
    if (navigateOnlyVisualizations.includes(activeViz) && !useNavigateData) {
      setUseNavigateData(true);
    }
  }, [activeViz, useNavigateData]);

  // Toggle focus mode
  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    if (!focusMode) {
      // Entering focus mode - hide panels
      setShowControls(false);
      setShowInsights(false);
    } else {
      // Exiting focus mode - show panels
      setShowControls(true);
      setShowInsights(true);
    }
  };

  // Handle cluster detection from NetworkGraph
  const handleClustersDetected = (clusters: ClusterInfo[]) => {
    setDetectedClusters(clusters)
  }

  // Handle heatmap cell clicks (like individual heatmap page)
  const handleCellClick = (sector: any, problemType: string) => {
    setSelectedSector(sector)
    setSelectedProblemType(problemType)
    console.log('Heatmap cell clicked:', sector, problemType)
  }

  const activeVisualization = visualizations.find(v => v.id === activeViz)

  // Filter technologies by TRL range
  const filteredTechnologies = technologies.filter(tech => {
    const trl = tech.trl_current || 0;
    return trl >= trlRange[0] && trl <= trlRange[1];
  });

  const renderVisualization = () => {
    // Dynamic height based on visualization type - Responsive to viewport
    const getVisualizationHeight = () => {
      // Base height calculation - responsive to viewport
      if (isFullscreen) {
        return 'h-[calc(100vh-80px)]' // Fullscreen: almost full viewport minus header
      }
      
      // Use viewport height percentage with max pixels
      switch (activeViz) {
        case 'sankey':
          return 'min-h-[75vh] max-h-[900px]' // 75% viewport, max 900px
        case 'radar':
          return 'min-h-[70vh] max-h-[800px]' // 70% viewport, max 800px
        case 'bar':
          return 'min-h-[65vh] max-h-[700px]' // 65% viewport, max 700px
        case 'circle':
          return 'min-h-[70vh] max-h-[750px]' // 70% viewport, max 750px (circular needs space)
        case 'bump':
          return 'min-h-[70vh] max-h-[750px]' // 70% viewport, max 750px
        case 'treemap':
          return 'min-h-[70vh] max-h-[750px]' // 70% viewport, max 750px
        case 'heatmap':
          return 'min-h-[65vh] max-h-[700px]' // 65% viewport, max 700px
        case 'sunburst':
          return 'min-h-[70vh] max-h-[750px]' // 70% viewport, max 750px (circular)
        case 'chord':
          return 'min-h-[70vh] max-h-[750px]' // 70% viewport, max 750px (circular)
        case 'network':
          return 'min-h-[75vh] max-h-[800px]' // Network graph
        case 'network3d':
          return 'min-h-[75vh] max-h-[800px]' // Network graph 3D
        default:
          return 'min-h-[65vh] max-h-[700px]' // Default: 65% viewport, max 700px
      }
    }

    const containerClass = `w-full ${getVisualizationHeight()} overflow-auto`

    switch (activeViz) {
      case 'sankey':
        return (
          <div className={containerClass}>
            {useNavigateData ? (
              <SankeyChartNavigate 
                stakeholders={stakeholders}
                technologies={filteredTechnologies}
                fundingEvents={fundingEvents}
                relationships={relationships}
                onNodeClick={handleNodeClick}
                className="w-full min-h-full"
              />
            ) : (
              <SankeyChart 
                challenges={filteredChallenges}
                onNodeClick={handleNodeClick}
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
                technologies={filteredTechnologies}
                selectedTechIds={selectedTechIds}
                onTechIdsChange={setSelectedTechIds}
                selectedDimensions={selectedDimensions}
                onDimensionsChange={setSelectedDimensions}
                onTechnologySelect={(techId) => {
                  const tech = filteredTechnologies.find(t => t.id === techId);
                  if (tech) {
                    setSelectedEntity({ type: 'technology', id: techId, data: tech });
                  }
                }}
                className="w-full min-h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#006E51] rounded-full flex items-center justify-center">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#006E51] mb-2">Radar Chart</h3>
                  <p className="text-gray-600 mb-4">Available for NAVIGATE data only</p>
                  <p className="text-sm text-gray-500">Switch to NAVIGATE Data in Controls to view technology maturity comparisons</p>
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
                technologies={filteredTechnologies}
                projects={projects}
                fundingEvents={fundingEvents}
                view={barChartView}
                onViewChange={setBarChartView}
                className="w-full min-h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#006E51] rounded-full flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#006E51] mb-2">Bar Chart</h3>
                  <p className="text-gray-600 mb-4">Available for NAVIGATE data only</p>
                  <p className="text-sm text-gray-500">Switch to NAVIGATE Data in Controls to view breakdowns</p>
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
                technologies={filteredTechnologies}
                projects={projects}
                fundingEvents={fundingEvents}
                relationships={relationships}
                view={circlePackingView}
                onViewChange={setCirclePackingView}
                className="w-full min-h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#006E51] rounded-full flex items-center justify-center">
                    <Sun className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#006E51] mb-2">Circle Packing</h3>
                  <p className="text-gray-600 mb-4">Available for NAVIGATE data only</p>
                  <p className="text-sm text-gray-500">Switch to NAVIGATE Data in Controls to view hierarchies</p>
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
                technologies={filteredTechnologies}
                className="w-full min-h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#006E51] rounded-full flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#006E51] mb-2">TRL Progression</h3>
                  <p className="text-gray-600 mb-4">Available for NAVIGATE data only</p>
                  <p className="text-sm text-gray-500">Switch to NAVIGATE Data in Controls to view TRL progression over time</p>
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
                technologies={filteredTechnologies}
                mode={treemapView}
                onModeChange={setTreemapView}
                className="w-full min-h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#CCE2DC]/10 to-[#006E51]/5 rounded-xl">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#006E51] rounded-full flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#006E51] mb-2">Funding Breakdown</h3>
                  <p className="text-gray-600 mb-4">Available for NAVIGATE data only</p>
                  <p className="text-sm text-gray-500">Switch to NAVIGATE Data in Controls to view hierarchical funding distribution</p>
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
                technologies={filteredTechnologies}
                view={heatmapView}
                onViewChange={setHeatmapView}
                onCellClick={(row, col, value) => {
                  // Handle cell clicks for entity selection
                  if (heatmapView === 'trl_vs_category') {
                    // Find technologies matching this TRL and category
                    const trl = parseInt(row.replace('TRL ', ''));
                    const matchingTechs = filteredTechnologies.filter(t => 
                      (t.trl_current || 0) === trl && t.category === col
                    );
                    if (matchingTechs.length > 0 && matchingTechs.length === 1) {
                      setSelectedEntity({ type: 'technology', id: matchingTechs[0].id, data: matchingTechs[0] });
                    }
                  } else if (heatmapView === 'tech_vs_stakeholder') {
                    // Find matching tech or stakeholder
                    const tech = filteredTechnologies.find(t => t.name === row);
                    const stakeholder = stakeholders.find(s => s.name === col);
                    if (tech) {
                      setSelectedEntity({ type: 'technology', id: tech.id, data: tech });
                    } else if (stakeholder) {
                      setSelectedEntity({ type: 'stakeholder', id: stakeholder.id, data: stakeholder });
                    }
                  }
                }}
                className="w-full min-h-full"
              />
            ) : (
              <HeatmapChart 
                challenges={filteredChallenges}
                onCellClick={handleCellClick}
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
                technologies={filteredTechnologies}
                projects={projects}
                relationships={relationships}
                selectedEntityId={selectedChallenge?.id || null}
                onEntitySelect={(id) => {
                  const challenge = filteredChallenges.find(c => c.id === id);
                  if (challenge) handleChallengeSelect(challenge);
                }}
                className="w-full min-h-full"
              />
            ) : (
              <NetworkGraph 
                challenges={filteredChallenges}
                selectedChallenge={selectedChallenge}
                onChallengeSelect={handleChallengeSelect}
                onClustersDetected={handleClustersDetected}
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
      case 'network3d':
        return (
          <div className={containerClass}>
            {useNavigateData ? (
              <NetworkGraphNavigate3D 
                stakeholders={stakeholders}
                technologies={filteredTechnologies}
                projects={projects}
                relationships={relationships}
                selectedEntityId={selectedEntity?.id || null}
                onEntitySelect={(id) => {
                  // Try to find entity in stakeholders, technologies, or projects
                  const stakeholder = stakeholders.find(s => s.id === id);
                  const technology = filteredTechnologies.find(t => t.id === id);
                  const project = projects.find(p => p.id === id);
                  
                  if (stakeholder) {
                    setSelectedEntity({ type: 'stakeholder', id: stakeholder.id, data: stakeholder });
                  } else if (technology) {
                    setSelectedEntity({ type: 'technology', id: technology.id, data: technology });
                  } else if (project) {
                    setSelectedEntity({ type: 'project', id: project.id, data: project });
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
      case 'sunburst':
        return (
          <div className={containerClass}>
            <SunburstChart 
              challenges={filteredChallenges}
              onChallengeSelect={handleChallengeSelect}
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
                technologies={filteredTechnologies}
                relationships={relationships}
                view={chordView}
                onViewChange={setChordView}
                onEntitySelect={(entityId, entityType) => {
                  if (entityType === 'stakeholder') {
                    const stakeholder = stakeholders.find(s => s.id === entityId);
                    if (stakeholder) {
                      setSelectedEntity({ type: 'stakeholder', id: stakeholder.id, data: stakeholder });
                    }
                  } else {
                    const tech = filteredTechnologies.find(t => t.id === entityId);
                    if (tech) {
                      setSelectedEntity({ type: 'technology', id: tech.id, data: tech });
                    }
                  }
                }}
                className="w-full min-h-full"
              />
            ) : (
              <ChordDiagram 
                challenges={filteredChallenges}
                onSectorSelect={(sector) => {
                  setSelectedSector(sector)
                  setSelectedElement({ type: 'sector', value: sector })
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
                technologies={filteredTechnologies}
                view={streamView}
                onViewChange={setStreamView}
                onStreamClick={(id, data) => {
                  // Could set selected entity based on stream data
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
                technologies={filteredTechnologies}
                selectedTechIds={selectedTechIds}
                dimensions={parallelDimensions}
                onTechnologySelect={(techId) => {
                  const tech = filteredTechnologies.find(t => t.id === techId);
                  if (tech) {
                    setSelectedEntity({ type: 'technology', id: tech.id, data: tech });
                  }
                }}
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
                technologies={filteredTechnologies}
                view={swarmView}
                onViewChange={setSwarmView}
                onNodeClick={(techId) => {
                  const tech = filteredTechnologies.find(t => t.id === techId);
                  if (tech) {
                    setSelectedEntity({ type: 'technology', id: tech.id, data: tech });
                  }
                }}
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

  // Format value helper
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `£${(value / 1000).toFixed(1)}K`;
    }
    return `£${value.toFixed(0)}`;
  };

  // Get fastest advancing technologies (for Bump Chart insights)
  const getFastestAdvancingTechs = () => {
    if (!useNavigateData || activeViz !== 'bump') return [];
    
    return filteredTechnologies
      .map(tech => {
        const currentTRL = tech.trl_current || 0;
        const createdAt = new Date(tech.created_at);
        const yearsSinceCreation = (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365);
        const advancement = yearsSinceCreation > 0 ? currentTRL / yearsSinceCreation : 0;
        return { ...tech, advancement };
      })
      .sort((a, b) => b.advancement - a.advancement)
      .slice(0, 5);
  };

  // Get recent milestones (for Bump Chart insights)
  const getRecentMilestones = () => {
    if (!useNavigateData || activeViz !== 'bump') return [];
    
    return filteredTechnologies
      .filter(tech => tech.trl_current && tech.trl_current >= 7)
      .map(tech => ({
        id: tech.id,
        name: tech.name,
        trl: tech.trl_current
      }))
      .slice(0, 5);
  };

  // Get treemap distribution summary
  const getTreemapDistribution = () => {
    if (!useNavigateData || activeViz !== 'treemap') return null;
    
    const totals = fundingEvents.reduce(
      (acc, event) => {
        const amount = event.amount || 0;
        acc.total += amount;
        const key = event.funding_type || 'Other';
        acc.bySource.set(key, (acc.bySource.get(key) || 0) + amount);
        return acc;
      },
      { total: 0, bySource: new Map<string, number>() },
    );
    
    const [topSource, topValue] = [...totals.bySource.entries()].sort((a, b) => b[1] - a[1])[0] || ['', 0];
    
    return {
      totalFunding: totals.total,
      sourceCount: totals.bySource.size,
      topSource: topSource
        ? {
            name: topSource,
            value: topValue,
            percentage: totals.total ? (topValue / totals.total) * 100 : 0,
          }
        : null,
    };
  };

  const renderInsightsPanel = () => {
    return (
      <div className="space-y-4">
        {/* Key Insights Summary - Always show first */}
        <InsightsSummary 
          challenges={filteredChallenges}
          activeVisualization={activeViz}
          selectedElement={selectedElement}
          selectedChallenge={selectedChallenge}
        />
        
        {/* NAVIGATE Entity Selection Details */}
        {useNavigateData && selectedEntity && (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#006E51] capitalize">
                {selectedEntity.type} Details
              </h3>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-[#006E51] mb-2 text-lg">
                  {selectedEntity.data.name}
                </h4>
                {selectedEntity.data.description && (
                  <p className="text-sm text-gray-600 mb-3">{selectedEntity.data.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedEntity.type === 'stakeholder' && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <div className="text-[#006E51] capitalize">{selectedEntity.data.type}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Sector:</span>
                      <div className="text-[#006E51]">{selectedEntity.data.sector}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Funding Received:</span>
                      <div className="text-[#006E51]">
                        {formatValue(selectedEntity.data.total_funding_received || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Funding Provided:</span>
                      <div className="text-[#006E51]">
                        {formatValue(selectedEntity.data.total_funding_provided || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <div className="text-[#006E51]">
                        {selectedEntity.data.location?.region || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Relationships:</span>
                      <div className="text-[#006E51]">
                        {selectedEntity.data.relationship_count || 0}
                      </div>
                    </div>
                  </>
                )}
                
                {selectedEntity.type === 'technology' && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <div className="text-[#006E51]">{selectedEntity.data.category}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Current TRL:</span>
                      <div className="text-[#006E51]">TRL {selectedEntity.data.trl_current || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Target TRL:</span>
                      <div className="text-[#006E51]">TRL {selectedEntity.data.trl_target || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Funding:</span>
                      <div className="text-[#006E51]">
                        {formatValue(selectedEntity.data.total_funding || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Deployment Ready:</span>
                      <div className={`${selectedEntity.data.deployment_ready ? 'text-green-600' : 'text-gray-600'}`}>
                        {selectedEntity.data.deployment_ready ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Regulatory Status:</span>
                      <div className="text-[#006E51] capitalize">
                        {selectedEntity.data.regulatory_status || 'N/A'}
                      </div>
                    </div>
                  </>
                )}
                
                {selectedEntity.type === 'project' && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <div className="text-[#006E51] capitalize">{selectedEntity.data.status}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Budget:</span>
                      <div className="text-[#006E51]">
                        {formatValue(selectedEntity.data.budget || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Start Date:</span>
                      <div className="text-[#006E51]">
                        {selectedEntity.data.start_date ? new Date(selectedEntity.data.start_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">End Date:</span>
                      <div className="text-[#006E51]">
                        {selectedEntity.data.end_date ? new Date(selectedEntity.data.end_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </>
                )}
                
                {selectedEntity.type === 'funding' && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <div className="text-[#006E51] capitalize">{selectedEntity.data.type}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Amount:</span>
                      <div className="text-[#006E51]">
                        {formatValue(selectedEntity.data.amount || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>
                      <div className="text-[#006E51]">
                        {selectedEntity.data.date ? new Date(selectedEntity.data.date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Cross-visualization links */}
              <div className="pt-3 border-t border-[#CCE2DC]/50">
                <h5 className="font-medium text-gray-700 mb-2 text-sm">View in Other Visualizations:</h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setActiveViz('network');
                      setSelectedEntity(selectedEntity); // Keep selection
                    }}
                    className="px-3 py-1.5 bg-[#006E51]/10 hover:bg-[#006E51]/20 text-[#006E51] text-xs rounded-lg transition-colors"
                  >
                    Network Graph
                  </button>
                  <button
                    onClick={() => {
                      setActiveViz('sankey');
                      setSelectedEntity(selectedEntity);
                    }}
                    className="px-3 py-1.5 bg-[#006E51]/10 hover:bg-[#006E51]/20 text-[#006E51] text-xs rounded-lg transition-colors"
                  >
                    Funding Flow
                  </button>
                  {selectedEntity.type === 'technology' && (
                    <button
                      onClick={() => {
                        setActiveViz('radar');
                        setSelectedTechIds([selectedEntity.id]);
                      }}
                      className="px-3 py-1.5 bg-[#006E51]/10 hover:bg-[#006E51]/20 text-[#006E51] text-xs rounded-lg transition-colors"
                    >
                      Technology Radar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Rich Insights using existing panels */}
        {selectedChallenge && (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#006E51]">Challenge Details</h3>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-[#006E51] mb-2">{selectedChallenge.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{selectedChallenge.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Sector:</span>
                  <div className="text-[#006E51] capitalize">{selectedChallenge.sector.primary}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Urgency:</span>
                  <div className={`capitalize ${
                    selectedChallenge.timeline.urgency === 'critical' ? 'text-red-600' :
                    selectedChallenge.timeline.urgency === 'moderate' ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {selectedChallenge.timeline.urgency}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Budget:</span>
                  <div className="text-[#006E51]">
                    £{selectedChallenge.funding.amount_max ? (selectedChallenge.funding.amount_max / 1000000).toFixed(1) : '0'}M
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <div className="text-[#006E51]">
                    {selectedChallenge.timeline.expected_duration || 'TBD'}
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Keywords</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedChallenge.keywords.slice(0, 8).map((keyword, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#006E51]/10 text-[#006E51] text-xs rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Rich Visualization-specific insights */}
        {activeViz === 'network' && (
          <div className="space-y-4">
            {/* Network Analysis Panel */}
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
              <h3 className="text-lg font-semibold text-[#006E51] mb-4">Network Analysis</h3>
              
              {detectedClusters.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-3">
                    {detectedClusters.length} clusters detected with {filteredChallenges.length} challenges
                  </div>
                  
                  {detectedClusters.slice(0, 4).map((cluster, idx) => (
                    <div 
                      key={cluster.id || idx}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCluster?.id === cluster.id 
                          ? 'bg-[#006E51]/10 border border-[#006E51]/20' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedCluster(cluster)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-[#006E51]">
                            Cluster {idx + 1}
                          </div>
                          <div className="text-sm text-gray-600">
                            {cluster.challenges?.length || 0} challenges
                          </div>
                          {cluster.dominantSector && (
                            <div className="text-xs text-gray-500 mt-1">
                              Primary: {cluster.dominantSector}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          Click to explore
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  Analyzing network structure... Clusters will appear here when detected.
                </div>
              )}
            </div>

            {/* Selected Cluster Details */}
            {selectedCluster && (
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">
                  Cluster Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Challenges:</span>
                    <span className="ml-2 text-blue-600">{selectedCluster.challenges?.length || 0}</span>
                  </div>
                  {selectedCluster.dominantSector && (
                    <div>
                      <span className="font-medium text-blue-700">Dominant Sector:</span>
                      <span className="ml-2 text-blue-600 capitalize">{selectedCluster.dominantSector}</span>
                    </div>
                  )}
                  {selectedCluster.centralityScore && (
                    <div>
                      <span className="font-medium text-blue-700">Centrality Score:</span>
                      <span className="ml-2 text-blue-600">{selectedCluster.centralityScore.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setSelectedCluster(null)}
                  className="mt-3 text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        )}

        {/* Heatmap Cell Selection Insights */}
        {activeViz === 'heatmap' && (selectedSector || selectedProblemType) && (
          <div className="p-6 bg-orange-50 rounded-xl border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-3">
              Heatmap Cell Analysis
            </h4>
            <div className="space-y-3">
              {selectedSector && selectedProblemType && (
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium text-orange-700 mb-2">
                    {selectedSector} × {selectedProblemType}
                  </h5>
                  <div className="text-sm text-gray-600">
                    {filteredChallenges.filter(c => 
                      c.sector.primary === selectedSector && 
                      c.problem_type.primary === selectedProblemType
                    ).length} challenges in this intersection
                  </div>
                </div>
              )}
              
              {selectedSector && (
                <div className="text-sm">
                  <span className="font-medium text-orange-700">Sector Total:</span>
                  <span className="ml-2 text-orange-600">
                    {filteredChallenges.filter(c => c.sector.primary === selectedSector).length} challenges
                  </span>
                </div>
              )}
              
              {selectedProblemType && (
                <div className="text-sm">
                  <span className="font-medium text-orange-700">Problem Type Total:</span>
                  <span className="ml-2 text-orange-600">
                    {filteredChallenges.filter(c => c.problem_type.primary === selectedProblemType).length} challenges
                  </span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                setSelectedSector(null)
                setSelectedProblemType(null)
              }}
              className="mt-3 text-xs text-orange-600 hover:text-orange-800"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Element Selection Insights */}
        {selectedElement && !selectedChallenge && (
          <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-3">
              {selectedElement.type === 'sector' ? 'Sector' : 'Problem Type'} Analysis
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-purple-700">Selected:</span>
                <span className="ml-2 text-purple-600 capitalize">{selectedElement.value}</span>
              </div>
              <div>
                <span className="font-medium text-purple-700">Related Challenges:</span>
                <span className="ml-2 text-purple-600">
                  {filteredChallenges.filter(c => 
                    selectedElement.type === 'sector' 
                      ? c.sector.primary === selectedElement.value
                      : c.problem_type.primary === selectedElement.value
                  ).length}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedElement(null)}
              className="mt-3 text-xs text-purple-600 hover:text-purple-800"
            >
              Clear selection
            </button>
          </div>
        )}
        
        {/* NAVIGATE Dynamic Insights */}
        {useNavigateData && !selectedEntity && (
          <>
            {/* Bump Chart Insights */}
            {activeViz === 'bump' && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-700 mb-2">Fastest Advancing Technologies</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {getFastestAdvancingTechs().length > 0 ? (
                      getFastestAdvancingTechs().map(tech => (
                        <div key={tech.id} className="flex justify-between">
                          <span>{tech.name}</span>
                          <span className="font-medium text-green-700">
                            +{tech.advancement.toFixed(1)} TRL/year
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No data available</p>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-700 mb-2">Recent Milestones</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {getRecentMilestones().length > 0 ? (
                      getRecentMilestones().map(m => (
                        <div key={m.id} className="flex justify-between">
                          <span>{m.name}</span>
                          <span className="font-medium text-blue-700">TRL {m.trl}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No milestones available</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Treemap Insights */}
            {activeViz === 'treemap' && (() => {
              const distribution = getTreemapDistribution();
              if (!distribution) return null;
              
              return (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-700 mb-2">Distribution Summary</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Total Funding:</span>
                      <span className="font-medium text-purple-700">{formatValue(distribution.totalFunding)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Funding Sources:</span>
                      <span className="font-medium text-purple-700">{distribution.sourceCount}</span>
                    </div>
                    {distribution.topSource && (
                      <div className="pt-2 border-t border-purple-200">
                        <div className="text-xs text-gray-500 mb-1">Top Source:</div>
                        <div className="flex justify-between">
                          <span className="capitalize">{distribution.topSource.name}</span>
                          <span className="font-medium text-purple-700">
                            {formatValue(distribution.topSource.value)} ({distribution.topSource.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            
            {/* Bar Chart Insights */}
            {activeViz === 'bar' && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-700 mb-2">Chart Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {barChartView === 'funding_by_stakeholder' && (
                    <div>
                      <div className="font-medium mb-1">Top Stakeholder Types:</div>
                      {Object.entries(
                        stakeholders.reduce((acc, s) => {
                          const type = s.type;
                          const value = (s.total_funding_provided || 0) + (s.total_funding_received || 0);
                          acc[type] = (acc[type] || 0) + value;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([type, value]) => (
                          <div key={type} className="flex justify-between">
                            <span className="capitalize">{type}</span>
                            <span className="font-medium text-orange-700">{formatValue(value)}</span>
                          </div>
                        ))}
                    </div>
                  )}
                  {barChartView === 'funding_by_tech' && (
                    <div>
                      <div className="font-medium mb-1">Top Technology Categories:</div>
                      {Object.entries(
                        technologies.reduce((acc, t) => {
                          const category = t.category;
                          const value = t.total_funding || 0;
                          acc[category] = (acc[category] || 0) + value;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([category, value]) => (
                          <div key={category} className="flex justify-between">
                            <span>{category}</span>
                            <span className="font-medium text-orange-700">{formatValue(value)}</span>
                          </div>
                        ))}
                    </div>
                  )}
                  {barChartView === 'projects_by_status' && (
                    <div>
                      <div className="font-medium mb-1">Projects by Status:</div>
                      {Object.entries(
                        projects.reduce((acc, p) => {
                          const status = p.status;
                          acc[status] = (acc[status] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                        .map(([status, count]) => (
                          <div key={status} className="flex justify-between">
                            <span className="capitalize">{status}</span>
                            <span className="font-medium text-orange-700">{count} projects</span>
                          </div>
                        ))}
                    </div>
                  )}
                  {barChartView === 'tech_by_trl' && (
                    <div>
                      <div className="font-medium mb-1">TRL Distribution:</div>
                      {Object.entries(
                        technologies.reduce((acc, t) => {
                          const trl = t.trl_current || 0;
                          acc[trl] = (acc[trl] || 0) + 1;
                          return acc;
                        }, {} as Record<number, number>)
                      )
                        .sort((a, b) => Number(b[0]) - Number(a[0]))
                        .map(([trl, count]) => (
                          <div key={trl} className="flex justify-between">
                            <span>TRL {trl}</span>
                            <span className="font-medium text-orange-700">{count} technologies</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Radar Chart Insights */}
            {activeViz === 'radar' && selectedTechIds.length > 0 && (
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-medium text-indigo-700 mb-2">Comparison Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    Comparing <span className="font-medium text-indigo-700">{selectedTechIds.length}</span> technologies
                  </div>
                  <div className="pt-2 border-t border-indigo-200">
                    <div className="text-xs text-gray-500 mb-1">Selected Technologies:</div>
                    {selectedTechIds.map(id => {
                      const tech = technologies.find(t => t.id === id);
                      return tech ? (
                        <div key={id} className="text-xs">{tech.name}</div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            )}
            
            {/* Chord Diagram Insights */}
            {activeViz === 'chord' && useNavigateData && (
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <h4 className="font-medium text-teal-700 mb-2">Relationship Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    View: <span className="font-medium text-teal-700 capitalize">{chordView.replace(/_/g, ' ')}</span>
                  </div>
                  {chordView === 'by_stakeholder_type' && (
                    <div className="pt-2 border-t border-teal-200">
                      <div className="text-xs text-gray-500 mb-1">Stakeholder Types:</div>
                      {['Government', 'Research', 'Industry', 'Intermediary'].map(type => {
                        const count = stakeholders.filter(s => s.type === type).length;
                        return (
                          <div key={type} className="text-xs flex justify-between">
                            <span>{type}</span>
                            <span className="font-medium text-teal-700">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {chordView === 'by_tech_category' && (
                    <div className="pt-2 border-t border-teal-200">
                      <div className="text-xs text-gray-500 mb-1">Technology Categories:</div>
                      {['H2Production', 'H2Storage', 'FuelCells', 'Aircraft', 'Infrastructure'].map(cat => {
                        const count = technologies.filter(t => t.category === cat).length;
                        return (
                          <div key={cat} className="text-xs flex justify-between">
                            <span>{cat}</span>
                            <span className="font-medium text-teal-700">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Heatmap Insights */}
            {activeViz === 'heatmap' && useNavigateData && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-700 mb-2">Matrix Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    View: <span className="font-medium text-blue-700 capitalize">{heatmapView.replace(/_/g, ' ')}</span>
                  </div>
                  {heatmapView === 'trl_vs_category' && (
                    <div className="pt-2 border-t border-blue-200">
                      <div className="text-xs text-gray-500 mb-1">TRL Distribution:</div>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(trl => {
                        const count = technologies.filter(t => (t.trl_current || 0) === trl).length;
                        if (count === 0) return null;
                        return (
                          <div key={trl} className="text-xs flex justify-between">
                            <span>TRL {trl}</span>
                            <span className="font-medium text-blue-700">{count} technologies</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Default insights for other visualizations */}
        {!selectedChallenge && !selectedEntity && !['heatmap', 'chord', 'network'].includes(activeViz) && !useNavigateData && (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">
              {activeVisualization?.name} Insights
            </h3>
            
            {activeViz === 'sankey' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                  <h4 className="font-medium text-[#006E51] mb-2">Flow Analysis</h4>
                  <p className="text-sm text-gray-600">
                    {filteredChallenges.length} challenges flowing through {new Set(filteredChallenges.map(c => c.sector.primary)).size} sectors
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Interactive Flow</h4>
                  <p className="text-sm text-gray-600">
                    Click on nodes to filter and explore specific pathways through the system
                  </p>
                </div>
              </div>
            )}
            
            {activeViz === 'sunburst' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                  <h4 className="font-medium text-[#006E51] mb-2">Hierarchical Breakdown</h4>
                  <p className="text-sm text-gray-600">
                    Nested view showing sector → problem type → urgency relationships
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-700 mb-2">Drill Down</h4>
                  <p className="text-sm text-gray-600">
                    Click segments to zoom into specific categories and subcategories
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Dataset Overview */}
        <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/30">
          <h4 className="font-medium text-[#006E51] mb-3">Dataset Overview</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-2xl font-bold text-[#006E51]">{filteredChallenges.length}</div>
              <div className="text-gray-600">Challenges</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(filteredChallenges.map(c => c.sector.primary)).size}
              </div>
              <div className="text-gray-600">Sectors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                £{Math.round(filteredChallenges.reduce((sum, c) => sum + (c.funding.amount_max || 0), 0) / 1000000)}M
              </div>
              <div className="text-gray-600">Total Funding</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {filteredChallenges.filter(c => c.timeline.urgency === 'critical').length}
              </div>
              <div className="text-gray-600">Critical</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderControlsPanel = () => {
    // Global TRL Filter (shown for all NAVIGATE visualizations)
    const trlFilterSection = useNavigateData ? (
      <div className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20 mb-6">
        <h4 className="font-medium text-[#006E51] mb-3">TRL Range Filter</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">TRL Range</span>
            <span className="px-2 py-1 bg-[#006E51]/10 text-[#006E51] text-xs rounded font-medium">
              {trlRange[0]} - {trlRange[1]}
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Min TRL: {trlRange[0]}</label>
              <input
                type="range"
                min="1"
                max="9"
                step="1"
                value={trlRange[0]}
                onChange={(e) => {
                  const min = parseInt(e.target.value);
                  if (min <= trlRange[1]) {
                    setTrlRange([min, trlRange[1]]);
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006E51]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Max TRL: {trlRange[1]}</label>
              <input
                type="range"
                min="1"
                max="9"
                step="1"
                value={trlRange[1]}
                onChange={(e) => {
                  const max = parseInt(e.target.value);
                  if (max >= trlRange[0]) {
                    setTrlRange([trlRange[0], max]);
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006E51]"
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>TRL 1 (Concept)</span>
            <span>TRL 9 (System Complete)</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Showing {filteredTechnologies.length} of {technologies.length} technologies
          </p>
        </div>
      </div>
    ) : null;

    switch (activeViz) {
      case 'network':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Network Controls</h3>
            
            <div className="space-y-6">
              {/* Data Source Toggle */}
              <div className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20">
                <h4 className="font-medium text-[#006E51] mb-3">Data Source</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseNavigateData(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    Challenge Data
                  </button>
                  <button
                    onClick={() => setUseNavigateData(true)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    NAVIGATE Data
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {useNavigateData 
                    ? 'Showing Stakeholders, Technologies, Projects with real relationships'
                    : 'Showing Challenges with calculated similarity'}
                </p>
              </div>

              {/* View Options */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">View Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isOrbiting}
                      onChange={(e) => setIsOrbiting(e.target.checked)}
                      className="w-4 h-4 text-[#006E51] rounded focus:ring-[#006E51]"
                      disabled={useNavigateData}
                    />
                    <span className={`text-sm ${useNavigateData ? 'text-gray-400' : 'text-gray-700'}`}>
                      Camera orbit {useNavigateData && '(Challenge only)'}
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showClusters}
                      onChange={(e) => setShowClusters(e.target.checked)}
                      className="w-4 h-4 text-[#006E51] rounded focus:ring-[#006E51]"
                    />
                    <span className="text-sm text-gray-700">Highlight clusters</span>
                  </label>
                </div>
              </div>

              {/* Similarity Threshold */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">Connection Sensitivity</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Similarity Threshold</span>
                    <span className="px-2 py-1 bg-[#006E51]/10 text-[#006E51] text-xs rounded">
                      {(similarityThreshold * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={similarityThreshold}
                    onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Less connected</span>
                    <span>More connected</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Higher values show only the strongest connections
                  </p>
                </div>
              </div>

              {/* Cluster Selection */}
              {detectedClusters.length > 0 && (
                <div>
                  <h4 className="font-medium text-[#006E51] mb-3">
                    Detected Clusters ({detectedClusters.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedCluster(null)
                        setShowClusters(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !selectedCluster
                          ? 'bg-[#006E51]/10 text-[#006E51] border border-[#006E51]/20'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      Show All Challenges
                    </button>
                    
                    {detectedClusters.map((cluster, idx) => (
                      <button
                        key={cluster.id || idx}
                        onClick={() => {
                          const newSelection = selectedCluster?.id === cluster.id ? null : cluster
                          setSelectedCluster(newSelection)
                          setShowClusters(true)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border ${
                          selectedCluster?.id === cluster.id
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">Cluster {idx + 1}</span>
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                            {cluster.challenges?.length || cluster.size || 0}
                          </span>
                        </div>
                        {cluster.dominantSector && (
                          <div className="text-xs text-gray-600 capitalize">
                            {cluster.dominantSector.replace('_', ' ')}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-[#CCE2DC]/20 rounded-lg p-3">
                <h4 className="font-medium text-[#006E51] mb-2">How to Use</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Click nodes to select challenges</div>
                  <div>• Drag to pan, scroll to zoom</div>
                  <div>• Drag nodes to reposition</div>
                  <div>• Adjust similarity to filter connections</div>
                  <div>• Select clusters to highlight groups</div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'heatmap':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Heatmap Controls</h3>
            <div className="space-y-6">
              {/* Data Source Toggle */}
              <div className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20">
                <h4 className="font-medium text-[#006E51] mb-3">Data Source</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseNavigateData(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    Challenge Data
                  </button>
                  <button
                    onClick={() => setUseNavigateData(true)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    NAVIGATE Data
                  </button>
                </div>
              </div>
              
              {trlFilterSection}
              
              {/* NAVIGATE View Selector */}
              {useNavigateData && (
                <div>
                  <h4 className="font-medium text-[#006E51] mb-3">View</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setHeatmapView('trl_vs_category')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        heatmapView === 'trl_vs_category'
                          ? 'bg-[#006E51] text-white shadow-md'
                          : 'bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-200'
                      }`}
                    >
                      TRL vs Category
                    </button>
                    <button
                      onClick={() => setHeatmapView('tech_vs_stakeholder')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        heatmapView === 'tech_vs_stakeholder'
                          ? 'bg-[#006E51] text-white shadow-md'
                          : 'bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-200'
                      }`}
                    >
                      Technology vs Stakeholder
                    </button>
                    <button
                      onClick={() => setHeatmapView('funding_vs_status')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        heatmapView === 'funding_vs_status'
                          ? 'bg-[#006E51] text-white shadow-md'
                          : 'bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-200'
                      }`}
                    >
                      Funding vs Status
                    </button>
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">Interactive Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click cells to explore {useNavigateData ? 'entity relationships' : 'sector-problem combinations'}</li>
                  <li>• Darker colors indicate higher {useNavigateData ? 'connection strength' : 'challenge density'}</li>
                  <li>• Selected cells show detailed insights</li>
                </ul>
              </div>
              
              {(selectedSector || selectedProblemType) && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Current Selection</h4>
                  {selectedSector && (
                    <div className="text-sm text-blue-600">
                      Sector: <span className="font-medium capitalize">{selectedSector}</span>
                    </div>
                  )}
                  {selectedProblemType && (
                    <div className="text-sm text-blue-600">
                      Problem Type: <span className="font-medium">{selectedProblemType}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedSector(null)
                      setSelectedProblemType(null)
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      case 'chord':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Chord Diagram Controls</h3>
            <div className="space-y-6">
              {/* Data Source Toggle */}
              <div className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20">
                <h4 className="font-medium text-[#006E51] mb-3">Data Source</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseNavigateData(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    Challenge Data
                  </button>
                  <button
                    onClick={() => setUseNavigateData(true)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    NAVIGATE Data
                  </button>
                </div>
              </div>
              
              {trlFilterSection}
              
              {/* NAVIGATE View Selector */}
              {useNavigateData && (
                <div>
                  <h4 className="font-medium text-[#006E51] mb-3">View</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setChordView('by_stakeholder_type')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        chordView === 'by_stakeholder_type'
                          ? 'bg-[#006E51] text-white shadow-md'
                          : 'bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-200'
                      }`}
                    >
                      By Stakeholder Type
                    </button>
                    <button
                      onClick={() => setChordView('by_tech_category')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        chordView === 'by_tech_category'
                          ? 'bg-[#006E51] text-white shadow-md'
                          : 'bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-200'
                      }`}
                    >
                      By Technology Category
                    </button>
                    <button
                      onClick={() => setChordView('by_funding_flow')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        chordView === 'by_funding_flow'
                          ? 'bg-[#006E51] text-white shadow-md'
                          : 'bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-200'
                      }`}
                    >
                      By Funding Flow
                    </button>
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">How to Use</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Hover over arcs to see {useNavigateData ? 'entity type' : 'sector'} details</li>
                  <li>• Hover over ribbons to see connection strength</li>
                  <li>• Thicker ribbons = stronger connections</li>
                  <li>• Click arcs to explore relationships</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'radar':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Radar Chart Controls</h3>
            <div className="space-y-6">
              {/* Data Source Toggle */}
              <div className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20">
                <h4 className="font-medium text-[#006E51] mb-3">Data Source</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseNavigateData(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                    disabled={true}
                  >
                    Challenge Data
                  </button>
                  <button
                    onClick={() => setUseNavigateData(true)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    NAVIGATE Data
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Radar chart compares technology maturity across 5 dimensions
                </p>
              </div>
              
              {trlFilterSection}
              
              {/* Technology Selector - MOVED FROM COMPONENT */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">
                  Select Technologies to Compare ({selectedTechIds.length}/8)
                </h4>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {filteredTechnologies.slice(0, 15).map((tech, idx) => {
                    const isSelected = selectedTechIds.includes(tech.id);
                    const getTechColor = (index: number) => {
                      const colors = ['#006E51', '#4A90E2', '#F5A623', '#EC4899', '#8B5CF6', '#50C878', '#CCE2DC', '#2E2D2B'];
                      return colors[index % colors.length];
                    };
                    return (
                      <button
                        key={tech.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTechIds(selectedTechIds.filter(id => id !== tech.id));
                          } else if (selectedTechIds.length < 8) {
                            setSelectedTechIds([...selectedTechIds, tech.id]);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded transition-all ${
                          isSelected
                            ? 'text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        style={isSelected ? {
                          backgroundColor: getTechColor(selectedTechIds.indexOf(tech.id))
                        } : {}}
                        disabled={!isSelected && selectedTechIds.length >= 8}
                      >
                        {tech.name.length > 20 ? tech.name.substring(0, 20) + '...' : tech.name}
                      </button>
                    );
                  })}
                </div>
                {selectedTechIds.length > 0 && (
                  <button
                    onClick={() => setSelectedTechIds([])}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear All
                  </button>
                )}
                {selectedTechIds.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Select at least one technology to compare
                  </p>
                )}
              </div>
              
              {/* Dimension Selector */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">
                  Select Dimensions to Display
                </h4>
                <div className="space-y-2">
                  {['TRL Level', 'Funding', 'Market Readiness', 'Regulatory Status', '2030 Maturity'].map(dimension => {
                    const isSelected = selectedDimensions.includes(dimension);
                    const getDimensionColor = (dim: string) => {
                      const colors: Record<string, string> = {
                        'TRL Level': '#006E51',
                        'Funding': '#F5A623',
                        'Market Readiness': '#4A90E2',
                        'Regulatory Status': '#EC4899',
                        '2030 Maturity': '#8B5CF6'
                      };
                      return colors[dim] || '#666';
                    };
                    return (
                      <label
                        key={dimension}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              // Don't allow unchecking if it's the last one
                              if (selectedDimensions.length > 1) {
                                setSelectedDimensions(selectedDimensions.filter(d => d !== dimension));
                              }
                            } else {
                              setSelectedDimensions([...selectedDimensions, dimension]);
                            }
                          }}
                          disabled={isSelected && selectedDimensions.length === 1}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: getDimensionColor(dimension) }}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: getDimensionColor(dimension) }}
                          />
                          <span className="text-sm text-gray-700">{dimension}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select at least one dimension to display
                </p>
              </div>
              
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">How to Use</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click technology buttons to select/deselect</li>
                  <li>• Compare up to 8 technologies at once</li>
                  <li>• Toggle dimensions on/off to focus on specific metrics</li>
                  <li>• Hover over points for exact values</li>
                  <li>• Click on radar points to see technology details</li>
                  <li>• Larger area = more mature technology</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'circle':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Circle Packing Controls</h3>
            <div className="space-y-6">
              {/* Data Source Toggle */}
              <div className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20">
                <h4 className="font-medium text-[#006E51] mb-3">Data Source</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseNavigateData(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                    disabled={true}
                  >
                    Challenge Data
                  </button>
                  <button
                    onClick={() => setUseNavigateData(true)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    NAVIGATE Data
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Circle packing shows hierarchical stakeholder and technology relationships
                </p>
              </div>
              
              {trlFilterSection}
              
              {/* View Selector */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">Hierarchy View</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setCirclePackingView('by_stakeholder_type')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      circlePackingView === 'by_stakeholder_type'
                        ? 'bg-[#006E51] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    By Stakeholder Type
                  </button>
                  <button
                    onClick={() => setCirclePackingView('by_technology_category')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      circlePackingView === 'by_technology_category'
                        ? 'bg-[#006E51] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    By Tech Category
                  </button>
                  <button
                    onClick={() => setCirclePackingView('by_funding')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      circlePackingView === 'by_funding'
                        ? 'bg-[#006E51] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    By Funding Type
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">How to Use</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Circle size = Value (funding amount)</li>
                  <li>• Nested circles = Hierarchy (parent contains children)</li>
                  <li>• Click to zoom into a level</li>
                  <li>• Hover for details</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'bump':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">TRL Progression Controls</h3>
            <div className="space-y-6">
              {/* Data Source Toggle */}
              <div className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20">
                <h4 className="font-medium text-[#006E51] mb-3">Data Source</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseNavigateData(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                    disabled={true}
                  >
                    Challenge Data
                  </button>
                  <button
                    onClick={() => setUseNavigateData(true)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    NAVIGATE Data
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Bump chart shows TRL progression over time (2019-2024)
                </p>
              </div>
              
              {trlFilterSection}
              
              {/* View Selector - MOVED FROM COMPONENT */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">View</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBumpView('all_technologies')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      bumpView === 'all_technologies'
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    All Technologies
                  </button>
                  <button
                    onClick={() => setBumpView('by_category')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      bumpView === 'by_category'
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    By Category
                  </button>
                  <button
                    onClick={() => setBumpView('top_advancing')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      bumpView === 'top_advancing'
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    Top Advancing
                  </button>
                </div>
              </div>
              
              {/* Category Filters - MOVED FROM COMPONENT (only show when view === 'by_category') */}
              {bumpView === 'by_category' && (
                <div>
                  <h4 className="font-medium text-[#006E51] mb-3">Filter by Technology Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {['H2Production', 'H2Storage', 'FuelCells', 'Aircraft', 'Infrastructure'].map(category => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategories(prev =>
                            prev.includes(category)
                              ? prev.filter(c => c !== category)
                              : [...prev, category]
                          );
                        }}
                        className={`text-xs px-3 py-1.5 rounded transition-all ${
                          selectedCategories.includes(category)
                            ? 'bg-[#006E51] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  {selectedCategories.length === 0 && (
                    <p className="text-xs text-gray-500 italic mt-2">
                      Select categories to filter (or leave empty to show all)
                    </p>
                  )}
                </div>
              )}
              
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">How to Use</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Switch between views: All, By Category, Top Advancing</li>
                  <li>• Filter by technology category in "By Category" view</li>
                  <li>• Steeper lines indicate faster TRL advancement</li>
                  <li>• Hover over lines for detailed TRL history</li>
                  <li>• Colors represent technology categories</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'treemap':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Treemap Controls</h3>
            <div className="space-y-6">
              {/* Data Source Toggle */}
              <div className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20">
                <h4 className="font-medium text-[#006E51] mb-3">Data Source</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseNavigateData(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                    disabled={true}
                  >
                    Challenge Data
                  </button>
                  <button
                    onClick={() => setUseNavigateData(true)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    NAVIGATE Data
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Treemap shows hierarchical funding breakdown and budgets
                </p>
              </div>
              
              {trlFilterSection}
              
              {/* View Selector */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">View Mode</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(['treemap', 'sunburst'] as TreemapViewMode[]).map((modeOption) => (
                    <button
                      key={modeOption}
                      onClick={() => setTreemapView(modeOption)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        treemapView === modeOption
                          ? 'bg-[#006E51] text-white shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {modeOption === 'treemap' ? 'Treemap' : 'Sunburst'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">How to Use</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Toggle between Treemap and Sunburst layouts</li>
                  <li>• Size encodes funding amount (millions)</li>
                  <li>• Click nodes to drill into departments or programmes</li>
                  <li>• Use the breadcrumb to navigate back up the hierarchy</li>
                  <li>• Colors follow technology categories and hydrogen themes</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'bar':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Bar Chart Controls</h3>
            <div className="space-y-6">
              {/* Data Source Toggle */}
              <div className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20">
                <h4 className="font-medium text-[#006E51] mb-3">Data Source</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseNavigateData(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                    disabled={true}
                  >
                    Challenge Data
                  </button>
                  <button
                    onClick={() => setUseNavigateData(true)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    NAVIGATE Data
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Bar chart shows funding, projects, and technology breakdowns
                </p>
              </div>
              
              {trlFilterSection}
              
              {/* View Selector - MOVED FROM COMPONENT */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">Chart View</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setBarChartView('funding_by_stakeholder')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      barChartView === 'funding_by_stakeholder'
                        ? 'bg-[#006E51] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Funding by Stakeholder Type
                  </button>
                  <button
                    onClick={() => setBarChartView('funding_by_tech')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      barChartView === 'funding_by_tech'
                        ? 'bg-[#006E51] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Funding by Tech Category
                  </button>
                  <button
                    onClick={() => setBarChartView('projects_by_status')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      barChartView === 'projects_by_status'
                        ? 'bg-[#006E51] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Projects by Status
                  </button>
                  <button
                    onClick={() => setBarChartView('tech_by_trl')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      barChartView === 'tech_by_trl'
                        ? 'bg-[#006E51] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Technologies by TRL Level
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">How to Use</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Switch between different breakdown views</li>
                  <li>• Hover over bars for detailed values</li>
                  <li>• Colors represent different categories</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'radar':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Radar Chart Controls</h3>
            <div className="space-y-6">
              {/* Data Source Toggle */}
              <div className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20">
                <h4 className="font-medium text-[#006E51] mb-3">Data Source</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseNavigateData(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                    disabled={true}
                  >
                    Challenge Data
                  </button>
                  <button
                    onClick={() => setUseNavigateData(true)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      useNavigateData
                        ? 'bg-[#006E51] text-white shadow-md'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    NAVIGATE Data
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Radar chart compares technologies across 5 dimensions
                </p>
              </div>
              
              {/* Technology Selector - MOVED FROM COMPONENT */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">
                  Select Technologies to Compare ({selectedTechIds.length}/8)
                </h4>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {filteredTechnologies.slice(0, 15).map((tech, idx) => {
                    const isSelected = selectedTechIds.includes(tech.id);
                    const getTechColor = (index: number) => {
                      const colors = ['#006E51', '#4A90E2', '#F5A623', '#EC4899', '#8B5CF6', '#50C878', '#CCE2DC', '#2E2D2B'];
                      return colors[index % colors.length];
                    };
                    return (
                      <button
                        key={tech.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTechIds(selectedTechIds.filter(id => id !== tech.id));
                          } else if (selectedTechIds.length < 8) {
                            setSelectedTechIds([...selectedTechIds, tech.id]);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded transition-all ${
                          isSelected
                            ? 'text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        style={isSelected ? {
                          backgroundColor: getTechColor(selectedTechIds.indexOf(tech.id))
                        } : {}}
                        disabled={!isSelected && selectedTechIds.length >= 8}
                      >
                        {tech.name.length > 20 ? tech.name.substring(0, 20) + '...' : tech.name}
                      </button>
                    );
                  })}
                </div>
                {selectedTechIds.length > 0 && (
                  <button
                    onClick={() => setSelectedTechIds([])}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear All
                  </button>
                )}
                {selectedTechIds.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Select at least one technology to compare
                  </p>
                )}
              </div>
              
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">How to Use</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Select up to 8 technologies to compare</li>
                  <li>• Each dimension shows 0-10 scale</li>
                  <li>• Hover for exact values</li>
                  <li>• Larger area = better overall maturity</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'stream':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Stream Graph Controls</h3>
            <div className="space-y-6">
              {trlFilterSection}
              
              {/* View Selector */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">View By</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setStreamView('by_stakeholder_type')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      streamView === 'by_stakeholder_type'
                        ? 'bg-[#006E51] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    By Stakeholder Type
                  </button>
                  <button
                    onClick={() => setStreamView('by_tech_category')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      streamView === 'by_tech_category'
                        ? 'bg-[#006E51] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    By Technology Category
                  </button>
                  <button
                    onClick={() => setStreamView('by_funding_type')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      streamView === 'by_funding_type'
                        ? 'bg-[#006E51] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    By Funding Type
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">How to Use</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Shows funding trends over time</li>
                  <li>• Stacked areas show cumulative funding</li>
                  <li>• Switch views to see different breakdowns</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'parallel':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Parallel Coordinates Controls</h3>
            <div className="space-y-6">
              {trlFilterSection}
              
              {/* Dimension Selector */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">Dimensions</h4>
                <div className="space-y-2">
                  {['TRL Level', 'Funding (£M)', 'Market Readiness', 'Regulatory Status', '2030 Maturity'].map(dim => {
                    const isSelected = parallelDimensions.includes(dim);
                    return (
                      <label key={dim} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setParallelDimensions([...parallelDimensions, dim]);
                            } else if (parallelDimensions.length > 1) {
                              setParallelDimensions(parallelDimensions.filter(d => d !== dim));
                            }
                          }}
                          disabled={!isSelected && parallelDimensions.length === 1}
                          className="w-4 h-4 text-[#006E51] rounded focus:ring-[#006E51]"
                        />
                        <span className="text-sm text-gray-700">{dim}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  At least one dimension must be selected
                </p>
              </div>
              
              {/* Technology Selector */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">
                  Filter Technologies (Optional)
                </h4>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {filteredTechnologies.slice(0, 10).map((tech) => {
                    const isSelected = selectedTechIds.includes(tech.id);
                    return (
                      <button
                        key={tech.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTechIds(selectedTechIds.filter(id => id !== tech.id));
                          } else {
                            setSelectedTechIds([...selectedTechIds, tech.id]);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded transition-all ${
                          isSelected
                            ? 'bg-[#006E51] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tech.name.length > 20 ? tech.name.substring(0, 20) + '...' : tech.name}
                      </button>
                    );
                  })}
                </div>
                {selectedTechIds.length > 0 && (
                  <button
                    onClick={() => setSelectedTechIds([])}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">How to Use</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Each line represents a technology</li>
                  <li>• Compare across multiple dimensions</li>
                  <li>• Click lines to select technologies</li>
                  <li>• Filter to focus on specific techs</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'swarm':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Swarm Plot Controls</h3>
            <div className="space-y-6">
              {trlFilterSection}
              
              {/* View Selector */}
              <div>
                <h4 className="font-medium text-[#006E51] mb-3">View By</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSwarmView('by_trl')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      swarmView === 'by_trl'
                        ? 'bg-[#006E51] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    By TRL Level
                  </button>
                  <button
                    onClick={() => setSwarmView('by_category')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      swarmView === 'by_category'
                        ? 'bg-[#006E51] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    By Technology Category
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">How to Use</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Shows distribution of technologies</li>
                  <li>• Each dot represents a technology</li>
                  <li>• Click dots to see details</li>
                  <li>• Colors indicate category or TRL</li>
                </ul>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Controls</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">Visualization Controls</h4>
                <p className="text-sm text-gray-600">
                  Interactive controls for {activeVisualization?.name} coming soon
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-2">Current Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click elements to explore data</li>
                  <li>• Fullscreen mode available</li>
                  <li>• Responsive design</li>
                  <li>• Export capabilities (coming soon)</li>
                </ul>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CCE2DC]/20 via-white to-[#CCE2DC]/10 text-[#2E2D2B]">
      <TopNavigation />
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(0 110 81) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
      </div>

      {/* Unified Navigation */}
      <UnifiedFloatingNav 
        currentPage="visualizations"
        visualizations={visualizations.map(viz => ({
          id: viz.id,
          name: viz.name,
          icon: viz.icon,
          current: activeViz === viz.id,
          onClick: () => setActiveViz(viz.id as VisualizationType)
        }))}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-[#CCE2DC]/30 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#006E51]">Data Visualizations</h1>
              <p className="text-sm text-gray-600">Explore challenge patterns and cross-sector opportunities</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* AI Chat Toggle - Coming Soon */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-blue-500 transition-colors"
                onClick={() => {
                  // Show coming soon modal or tooltip
                  alert('AI Assistant coming in Phase 2! Ask questions about patterns, get personalized insights, and explore data with natural language queries.');
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                AI Assistant
                <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded font-medium">Phase 2</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleFocusMode}
                className={`${focusMode ? 'text-[#006E51] bg-[#006E51]/10' : 'text-gray-600'} hover:text-[#006E51]`}
              >
                <Zap className="h-4 w-4 mr-2" />
                {focusMode ? 'Exit Focus' : 'Focus Mode'}
              </Button>
              
              {/* Controls Toggle - only show when not in focus mode */}
              {!focusMode && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowControls(!showControls)}
                  className={`${showControls ? 'text-[#006E51] bg-[#006E51]/10' : 'text-gray-600'} hover:text-[#006E51]`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Controls
                </Button>
              )}
              
              {/* Insights Toggle - only show when not in focus mode */}
              {!focusMode && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowInsights(!showInsights)}
                  className={`${showInsights ? 'text-[#006E51] bg-[#006E51]/10' : 'text-gray-600'} hover:text-[#006E51]`}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Insights
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-gray-600 hover:text-[#006E51]"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-600 hover:text-[#006E51]"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Visualization Selector */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {visualizations.map((viz) => {
                const Icon = viz.icon
                const isActive = activeViz === viz.id
                
                return (
                  <motion.button
                    key={viz.id}
                    onClick={() => setActiveViz(viz.id)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#006E51] text-white shadow-lg' 
                        : 'bg-white/60 hover:bg-white/80 text-gray-700 hover:text-[#006E51]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{viz.name}</div>
                      <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {viz.description}
                      </div>
                    </div>
                    
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-[#CCE2DC]"
                        layoutId="activeVizBorder"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`relative z-10 ${isFullscreen ? 'fixed inset-0 top-0 bg-white' : 'container mx-auto px-6 py-8'}`}>


        <div className={`grid gap-6 ${
          isFullscreen 
            ? 'grid-cols-1 h-screen' 
            : focusMode
              ? 'grid-cols-1'
            : showControls && showInsights 
              ? 'grid-cols-1 lg:grid-cols-4' 
              : showControls || showInsights 
                ? 'grid-cols-1 lg:grid-cols-3' 
                : 'grid-cols-1'
        }`}>
          
          {/* Controls Panel */}
          {showControls && !isFullscreen && !focusMode && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#006E51]">Controls</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowControls(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              {renderControlsPanel()}
            </motion.div>
          )}

          {/* Main Visualization Area */}
          <div className={`${
            isFullscreen 
              ? 'col-span-1' 
              : focusMode
                ? 'col-span-1'
              : showControls && showInsights 
                ? 'lg:col-span-2' 
                : showControls || showInsights 
                  ? 'lg:col-span-2' 
                  : 'lg:col-span-4'
          }`}>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[#CCE2DC]/50 p-6 min-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#006E51]">
                    {activeVisualization?.name}
                  </h2>
                  <p className="text-gray-600">{activeVisualization?.description}</p>
                  {(selectedChallenge || selectedElement || selectedCluster || selectedSector || selectedProblemType) && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {selectedChallenge && (
                        <div className="px-3 py-1 bg-[#006E51]/10 text-[#006E51] text-sm rounded-full">
                          Challenge: {selectedChallenge.title.slice(0, 30)}...
                        </div>
                      )}
                      {selectedElement && (
                        <div className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                          {selectedElement.type}: {selectedElement.value}
                        </div>
                      )}
                      {selectedCluster && (
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          Cluster: {selectedCluster.challenges?.length || 0} challenges
                        </div>
                      )}
                      {(selectedSector || selectedProblemType) && (
                        <div className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                          Heatmap: {selectedSector && selectedProblemType ? `${selectedSector} × ${selectedProblemType}` : selectedSector || selectedProblemType}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 self-center">
                        → See insights panel
                      </div>
                    </div>
                  )}
                </div>
                
                {!isFullscreen && (
                  <div className="flex gap-2">
                    {/* Visualization Controls */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedElement(null)
                        setSelectedChallenge(null)
                      }}
                      className="text-gray-600 hover:text-[#006E51]"
                      disabled={!selectedElement}
                    >
                      Clear Selection
                    </Button>
                    
                    {!showControls && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowControls(true)}
                        className="text-gray-600 hover:text-[#006E51]"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Visualization Container */}
              <div className="relative h-[500px] lg:h-[600px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeViz}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    {renderVisualization()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Insights Panel */}
          {showInsights && !isFullscreen && !focusMode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#006E51]">Insights</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInsights(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              </div>
              {renderInsightsPanel()}
            </motion.div>
          )}
        </div>

        {/* Floating Panel Toggles (when panels are hidden) */}
        {(!showControls || !showInsights) && !isFullscreen && !focusMode && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-20">
            {!showControls && (
              <Button
                onClick={() => setShowControls(true)}
                className="bg-[#006E51] hover:bg-[#005A42] text-white shadow-lg"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Controls
              </Button>
            )}
            {!showInsights && (
              <Button
                onClick={() => setShowInsights(true)}
                className="bg-[#006E51] hover:bg-[#005A42] text-white shadow-lg"
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Insights
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// Main component wrapped with AppProvider
export default function VisualizationsPage() {
  return (
    <AppProvider initialChallenges={challenges}>
      <VisualizationsContent />
    </AppProvider>
  )
}