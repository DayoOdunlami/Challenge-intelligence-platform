"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, Network, Zap, Sun, GitBranch, Download, Settings, MessageCircle, Maximize2, TrendingUp, DollarSign, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LayoutSwitcher, LayoutOption } from "@/components/layouts/LayoutSwitcher"
import { LayoutRenderer } from "@/components/layouts/LayoutRenderer"

// Import all visualization components and data (same as visualizations page)
import { SankeyChart } from "@/components/visualizations/SankeyChart"
import { SankeyChartNavigate } from "@/components/visualizations/SankeyChartNavigate"
import { RadarChartNavigate } from "@/components/visualizations/RadarChartNavigate"
import { BarChartNavigate } from "@/components/visualizations/BarChartNavigate"
import { CirclePackingNavigate } from "@/components/visualizations/CirclePackingNavigate"
import { BumpChartNavigate } from "@/components/visualizations/BumpChartNavigate"
import { TreemapNavigate } from "@/components/visualizations/TreemapNavigate"
import { HeatmapChart } from "@/components/visualizations/HeatmapChart"
import { HeatmapNavigate } from "@/components/visualizations/HeatmapNavigate"
import { SunburstChart } from "@/components/visualizations/SunburstChart"
import { ChordDiagram } from "@/components/visualizations/ChordDiagram"
import { ChordDiagramNavigate } from "@/components/visualizations/ChordDiagramNavigate"
import { NetworkGraph } from "@/components/visualizations/NetworkGraph"
import { NetworkGraphNavigate } from "@/components/visualizations/NetworkGraphNavigate"
import { StreamGraphNavigate } from "@/components/visualizations/StreamGraphNavigate"
import { ParallelCoordinatesNavigate } from "@/components/visualizations/ParallelCoordinatesNavigate"
import { SwarmPlotNavigate } from "@/components/visualizations/SwarmPlotNavigate"
import { VisualizationRenderer } from "@/components/visualizations/VisualizationRenderer"
import challenges from "@/data/challenges"
import { stakeholders, technologies, projects, relationships, fundingEvents } from "@/data/navigate-dummy-data"
import { Challenge } from "@/lib/types"
import { AppProvider, useAppContext } from "@/contexts/AppContext"
import { InsightsSummary } from "@/components/ui/InsightsSummary"
import { UnifiedFloatingNav } from "@/components/ui/UnifiedFloatingNav"
import { TopNavigation } from "@/components/ui/TopNavigation"
import { ClusterInfo } from "@/lib/cluster-analysis"
import { CreativeHero } from "@/components/ui/CreativeHero"
import { QuickStatsBar } from "@/components/layouts/QuickStatsBar"
import { AIChatPanel } from "@/components/layouts/AIChatPanel"

type VisualizationType = 'sankey' | 'heatmap' | 'network' | 'sunburst' | 'chord' | 'radar' | 'bar' | 'circle' | 'bump' | 'treemap' | 'stream' | 'parallel' | 'swarm'

type ViewCategory = 'all' | 'network' | 'funding' | 'technology' | 'dashboard'

// Visualization categories mapping
const visualizationCategories: Record<ViewCategory, VisualizationType[]> = {
  all: ['sankey', 'heatmap', 'network', 'sunburst', 'chord', 'radar', 'bar', 'circle', 'bump', 'treemap', 'stream', 'parallel', 'swarm'],
  network: ['network', 'circle'],
  funding: ['sankey', 'treemap', 'stream'],
  technology: ['radar', 'bump', 'parallel', 'swarm'],
  dashboard: ['bar', 'heatmap']
}

const visualizations = [
  {
    id: 'sankey' as VisualizationType,
    name: 'Flow Analysis',
    description: 'Challenge progression and resource flows',
    icon: GitBranch,
    color: '#006E51',
    category: 'funding' as ViewCategory
  },
  {
    id: 'radar' as VisualizationType,
    name: 'Tech Maturity Radar',
    description: 'Compare technology readiness across dimensions',
    icon: Zap,
    color: '#8b5cf6',
    category: 'technology' as ViewCategory
  },
  {
    id: 'bar' as VisualizationType,
    name: 'Bar Chart Analysis',
    description: 'Funding, projects, and technology breakdowns',
    icon: BarChart3,
    color: '#4A90E2',
    category: 'dashboard' as ViewCategory
  },
  {
    id: 'circle' as VisualizationType,
    name: 'Circle Packing',
    description: 'Hierarchical stakeholder and technology relationships',
    icon: Sun,
    color: '#50C878',
    category: 'network' as ViewCategory
  },
  {
    id: 'bump' as VisualizationType,
    name: 'TRL Progression',
    description: 'Technology readiness level advancement over time',
    icon: BarChart3,
    color: '#EC4899',
    category: 'technology' as ViewCategory
  },
  {
    id: 'treemap' as VisualizationType,
    name: 'Funding Breakdown',
    description: 'Hierarchical funding distribution and budgets',
    icon: BarChart3,
    color: '#F5A623',
    category: 'funding' as ViewCategory
  },
  {
    id: 'heatmap' as VisualizationType,
    name: 'Intensity Map',
    description: 'Challenge density and hotspots',
    icon: BarChart3,
    color: '#4A90E2',
    category: 'dashboard' as ViewCategory
  },
  {
    id: 'network' as VisualizationType,
    name: 'Network Graph',
    description: 'Connections and relationships',
    icon: Network,
    color: '#50C878',
    category: 'network' as ViewCategory
  },
  {
    id: 'sunburst' as VisualizationType,
    name: 'Hierarchical View',
    description: 'Multi-level challenge breakdown',
    icon: Sun,
    color: '#F5A623',
    category: 'dashboard' as ViewCategory
  },
  {
    id: 'chord' as VisualizationType,
    name: 'Relationship Matrix',
    description: 'Cross-sector dependencies',
    icon: Zap,
    color: '#8b5cf6',
    category: 'network' as ViewCategory
  },
  {
    id: 'stream' as VisualizationType,
    name: 'Funding Trends',
    description: 'Funding flows over time',
    icon: BarChart3,
    color: '#10B981',
    category: 'funding' as ViewCategory
  },
  {
    id: 'parallel' as VisualizationType,
    name: 'Parallel Coordinates',
    description: 'Multi-dimensional technology comparison',
    icon: Zap,
    color: '#6366F1',
    category: 'technology' as ViewCategory
  },
  {
    id: 'swarm' as VisualizationType,
    name: 'Technology Distribution',
    description: 'TRL and category distribution',
    icon: BarChart3,
    color: '#F59E0B',
    category: 'technology' as ViewCategory
  }
]

// Category navigation items
const categoryNavItems = [
  {
    id: 'all' as ViewCategory,
    name: 'All Visualizations',
    description: 'View all 13 visualizations',
    icon: BarChart3,
    color: '#006E51',
    count: 13
  },
  {
    id: 'network' as ViewCategory,
    name: 'Network Analysis',
    description: 'Network Graph, Circle Packing, Relationship Matrix',
    icon: Network,
    color: '#50C878',
    count: 3
  },
  {
    id: 'funding' as ViewCategory,
    name: 'Funding Intelligence',
    description: 'Flow Analysis, Funding Breakdown, Funding Trends',
    icon: DollarSign,
    color: '#F5A623',
    count: 3
  },
  {
    id: 'technology' as ViewCategory,
    name: 'Technology Maturity',
    description: 'Radar, TRL Progression, Parallel Coordinates, Distribution',
    icon: Cpu,
    color: '#8b5cf6',
    count: 4
  },
  {
    id: 'dashboard' as ViewCategory,
    name: 'Dashboard & Metrics',
    description: 'Bar Charts, Heatmaps, Hierarchical Views',
    icon: TrendingUp,
    color: '#4A90E2',
    count: 3
  }
]

// Inner component that uses search params
function NavigateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { 
    filteredChallenges, 
    selectedChallenge, 
    setSelectedChallenge
  } = useAppContext()
  
  // Get view category from URL, default to 'all'
  const viewCategory = (searchParams.get('view') as ViewCategory) || 'all'
  
  // Filter visualizations based on category
  const filteredVisualizations = viewCategory === 'all'
    ? visualizations
    : visualizations.filter(viz => {
        const categoryVizs = visualizationCategories[viewCategory] || []
        return categoryVizs.includes(viz.id)
      })
  
  // Auto-select first visualization if category has only one
  const defaultViz = filteredVisualizations.length > 0 
    ? filteredVisualizations[0].id 
    : 'network'
  
  const [activeViz, setActiveViz] = useState<VisualizationType>(defaultViz)
  const [useNavigateData, setUseNavigateData] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInsights, setShowInsights] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [controlsPinned, setControlsPinned] = useState(false)
  const [controlsHovered, setControlsHovered] = useState(false)
  const [controlsCollapseTimeout, setControlsCollapseTimeout] = useState<NodeJS.Timeout | null>(null)
  const [focusMode, setFocusMode] = useState(false)
  const [currentLayout, setCurrentLayout] = useState<LayoutOption>('option2')
  const [categoriesCollapsed, setCategoriesCollapsed] = useState(true) // Start minimized
  
  // All the same state variables as visualizations page...
  const [circlePackingView, setCirclePackingView] = useState<'by_stakeholder_type' | 'by_technology_category' | 'by_funding'>('by_stakeholder_type')
  const [bumpView, setBumpView] = useState<'all_technologies' | 'by_category' | 'top_advancing'>('all_technologies')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [treemapView, setTreemapView] = useState<'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type' | 'by_project'>('by_stakeholder_type')
  const [barChartView, setBarChartView] = useState<'funding_by_stakeholder' | 'funding_by_tech' | 'projects_by_status' | 'tech_by_trl'>('funding_by_stakeholder')
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([])
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([
    'TRL Level',
    'Funding',
    'Market Readiness',
    'Regulatory Status',
    '2030 Maturity'
  ])
  const [chordView, setChordView] = useState<'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow'>('by_stakeholder_type')
  const [heatmapView, setHeatmapView] = useState<'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status'>('trl_vs_category')
  const [streamView, setStreamView] = useState<'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type'>('by_stakeholder_type')
  const [parallelDimensions, setParallelDimensions] = useState<string[]>([
    'TRL Level',
    'Funding (£M)',
    'Market Readiness',
    'Regulatory Status',
    '2030 Maturity'
  ])
  const [swarmView, setSwarmView] = useState<'by_trl' | 'by_category'>('by_trl')
  const [trlRange, setTrlRange] = useState<[number, number]>([1, 9])
  const [detectedClusters, setDetectedClusters] = useState<ClusterInfo[]>([])
  const [selectedCluster, setSelectedCluster] = useState<ClusterInfo | null>(null)
  const [similarityThreshold, setSimilarityThreshold] = useState(0.2)
  const [showClusters, setShowClusters] = useState(false)
  const [isOrbiting, setIsOrbiting] = useState(false)
  const [selectedElement, setSelectedElement] = useState<any>(null)
  const [selectedSector, setSelectedSector] = useState<any>(null)
  const [selectedProblemType, setSelectedProblemType] = useState<string | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'stakeholder' | 'technology' | 'project' | 'funding';
    id: string;
    data: any;
  } | null>(null)
  
  // Update activeViz when category changes
  useEffect(() => {
    if (filteredVisualizations.length > 0) {
      const firstViz = filteredVisualizations[0].id
      if (!filteredVisualizations.find(v => v.id === activeViz)) {
        setActiveViz(firstViz)
      }
    }
  }, [viewCategory, filteredVisualizations])
  
  // Auto-enable NAVIGATE data for NAVIGATE-only visualizations
  useEffect(() => {
    const navigateOnlyVisualizations: VisualizationType[] = ['stream', 'parallel', 'swarm', 'radar', 'bar', 'circle', 'bump', 'treemap', 'heatmap', 'chord'];
    if (navigateOnlyVisualizations.includes(activeViz) && !useNavigateData) {
      setUseNavigateData(true);
    }
  }, [activeViz, useNavigateData]);
  
  // Filter technologies by TRL range
  const filteredTechnologies = technologies.filter(tech => {
    const trl = tech.trl_current || 0;
    return trl >= trlRange[0] && trl <= trlRange[1];
  });
  
  // Handle category change
  const handleCategoryChange = (category: ViewCategory) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === 'all') {
      params.delete('view')
    } else {
      params.set('view', category)
    }
    router.push(`/navigate?${params.toString()}`)
  }
  
  // Handle challenge selection
  const handleChallengeSelect = (challenge: any) => {
    setSelectedChallenge(challenge)
    setSelectedEntity(null) // Clear entity selection when challenge is selected
  }
  
  // Handle cluster detection
  const handleClustersDetected = (clusters: ClusterInfo[]) => {
    setDetectedClusters(clusters)
  }
  
  // Handle node clicks
  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId)
    // Could implement entity selection logic here
  }
  
  // Calculate key metrics for overview
  const totalFunding = fundingEvents.reduce((sum, e) => sum + e.amount, 0)
  const totalStakeholders = stakeholders.length
  const totalTechnologies = filteredTechnologies.length
  const totalProjects = projects.length
  
  // Get active visualization details
  const activeVisualization = visualizations.find(v => v.id === activeViz)
  
  // Render visualization (same logic as visualizations page - will copy the full renderVisualization function)
  // For now, I'll create a simplified version and we can expand it
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CCE2DC]/20 via-white to-[#CCE2DC]/10">
      <TopNavigation />
      <UnifiedFloatingNav currentPage="navigate" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#006E51] mb-2">NAVIGATE Platform</h1>
              <p className="text-gray-600">Interactive intelligence for zero-emission aviation ecosystem</p>
            </div>
            <div className="flex gap-2">
              <LayoutSwitcher 
                currentLayout={currentLayout}
                onLayoutChange={setCurrentLayout}
              />
              <Button
                variant="outline"
                onClick={() => setShowControls(!showControls)}
                className="border-[#006E51] text-[#006E51]"
              >
                <Settings className="h-4 w-4 mr-2" />
                {showControls ? 'Hide' : 'Show'} Controls
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowInsights(!showInsights)}
                className="border-[#006E51] text-[#006E51]"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {showInsights ? 'Hide' : 'Show'} Insights
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="border-[#006E51] text-[#006E51]"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
            </div>
          </div>
          
          {/* Category Navigation Cards - Minimized by default, expand on hover */}
          <div 
            className="mb-6 transition-all duration-300"
            onMouseEnter={() => setCategoriesCollapsed(false)}
            onMouseLeave={() => setCategoriesCollapsed(true)}
          >
            {categoriesCollapsed ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-[#CCE2DC] h-12">
                {categoryNavItems.map((category) => {
                  const Icon = category.icon
                  const isActive = viewCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`p-2 rounded transition-all ${
                        isActive
                          ? 'bg-[#006E51] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={category.name}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  )
                })}
                <div className="ml-auto text-xs text-gray-500">Hover to expand categories</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {categoryNavItems.map((category) => {
                  const Icon = category.icon
                  const isActive = viewCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isActive
                          ? 'border-[#006E51] bg-[#006E51]/10 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-[#006E51]/50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`h-6 w-6 ${isActive ? 'text-[#006E51]' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          isActive ? 'bg-[#006E51] text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category.count}
                        </span>
                      </div>
                      <h3 className={`font-semibold mb-1 ${isActive ? 'text-[#006E51]' : 'text-gray-800'}`}>
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-600">{category.description}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          
        </div>
        
        {/* Visualization Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filteredVisualizations.map((viz) => {
              const Icon = viz.icon
              const isActive = activeViz === viz.id
              return (
                <button
                  key={viz.id}
                  onClick={() => setActiveViz(viz.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#006E51] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                  title={viz.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{viz.name}</span>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Main Content Area - Using Layout Renderer */}
        <LayoutRenderer
          layout={currentLayout}
          controlsPanel={
            <>
              {/* Hover trigger line/icon when collapsed */}
              {!controlsPinned && !controlsHovered && (
                <div 
                  className="fixed left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-[#006E51]/30 hover:bg-[#006E51]/60 hover:w-2 transition-all duration-300 cursor-pointer rounded-r-full z-50"
                  onMouseEnter={() => {
                    setControlsHovered(true)
                    if (controlsCollapseTimeout) {
                      clearTimeout(controlsCollapseTimeout)
                      setControlsCollapseTimeout(null)
                    }
                  }}
                />
              )}
              
              {/* Controls panel */}
              <div 
                className={`fixed left-0 top-[120px] bottom-0 w-80 bg-white/95 backdrop-blur-sm border-r border-[#CCE2DC] shadow-xl transition-transform duration-300 z-40 ${
                  controlsPinned || controlsHovered
                    ? 'translate-x-0' 
                    : '-translate-x-full'
                }`}
                onMouseEnter={() => {
                  setControlsHovered(true)
                  if (controlsCollapseTimeout) {
                    clearTimeout(controlsCollapseTimeout)
                    setControlsCollapseTimeout(null)
                  }
                }}
                onMouseLeave={() => {
                  if (!controlsPinned) {
                    const timeout = setTimeout(() => {
                      setControlsHovered(false)
                    }, 500) // 500ms delay before collapsing
                    setControlsCollapseTimeout(timeout)
                  }
                }}
              >
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#006E51]">Controls</h3>
                    <button
                      onClick={() => {
                        setControlsPinned(!controlsPinned)
                        if (controlsPinned) {
                          setControlsHovered(false)
                        }
                      }}
                      className={`p-1.5 rounded transition-colors ${
                        controlsPinned 
                          ? 'bg-[#006E51] text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={controlsPinned ? 'Unpin controls' : 'Pin controls'}
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
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
                    
                    {/* TRL Filter */}
                    {useNavigateData && (
                      <div className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20">
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
                          <p className="text-xs text-gray-600 mt-2">
                            Showing {filteredTechnologies.length} of {technologies.length} technologies
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                      <h4 className="font-medium text-[#006E51] mb-2">Current View</h4>
                      <p className="text-sm text-gray-600">
                        {activeVisualization?.name || 'Select a visualization'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Category: {viewCategory} | {filteredVisualizations.length} available
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          }
          visualization={
            <div className={`w-full h-full transition-all duration-300 ${
              controlsPinned || controlsHovered ? 'ml-80' : 'ml-0'
            }`}>
              <VisualizationRenderer
              activeViz={activeViz}
              useNavigateData={useNavigateData}
              isFullscreen={isFullscreen}
              filteredChallenges={filteredChallenges}
              selectedChallenge={selectedChallenge}
              onChallengeSelect={handleChallengeSelect}
              onClustersDetected={handleClustersDetected}
              stakeholders={stakeholders}
              technologies={filteredTechnologies}
              projects={projects}
              fundingEvents={fundingEvents}
              relationships={relationships}
              selectedTechIds={selectedTechIds}
              setSelectedTechIds={setSelectedTechIds}
              selectedDimensions={selectedDimensions}
              setSelectedDimensions={setSelectedDimensions}
              barChartView={barChartView}
              setBarChartView={setBarChartView}
              circlePackingView={circlePackingView}
              setCirclePackingView={setCirclePackingView}
              treemapView={treemapView}
              setTreemapView={setTreemapView}
              chordView={chordView}
              setChordView={setChordView}
              heatmapView={heatmapView}
              setHeatmapView={setHeatmapView}
              streamView={streamView}
              setStreamView={setStreamView}
              parallelDimensions={parallelDimensions}
              setParallelDimensions={setParallelDimensions}
              swarmView={swarmView}
              setSwarmView={setSwarmView}
              similarityThreshold={similarityThreshold}
              setSimilarityThreshold={setSimilarityThreshold}
              showClusters={showClusters}
              setShowClusters={setShowClusters}
              isOrbiting={isOrbiting}
              setIsOrbiting={setIsOrbiting}
              selectedCluster={selectedCluster}
              setSelectedCluster={setSelectedCluster}
              onNodeClick={handleNodeClick}
              onEntitySelect={(entity) => {
                setSelectedEntity(entity);
              }}
              onTechnologySelect={(techId) => {
                const tech = filteredTechnologies.find(t => t.id === techId);
                if (tech) {
                  setSelectedEntity({ type: 'technology', id: tech.id, data: tech });
                }
              }}
            />
            </div>
          }
          insightsPanel={
            showInsights ? (
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
                <h3 className="text-lg font-semibold text-[#006E51] mb-4">Insights</h3>
                <div className="space-y-4">
                    {selectedEntity ? (
                      <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                        <h4 className="font-medium text-[#006E51] mb-2 capitalize">
                          {selectedEntity.type} Details
                        </h4>
                        <h5 className="font-semibold mb-1">{selectedEntity.data.name}</h5>
                        {selectedEntity.data.description && (
                          <p className="text-sm text-gray-600 mb-2">{selectedEntity.data.description}</p>
                        )}
                        <button
                          onClick={() => setSelectedEntity(null)}
                          className="text-xs text-[#006E51] hover:underline"
                        >
                          Clear selection
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                        <h4 className="font-medium text-[#006E51] mb-2">Overview</h4>
                        <p className="text-sm text-gray-600">
                          Click on visualization elements to see detailed insights here.
                        </p>
                      </div>
                    )}
                    
                    {/* Quick Stats */}
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="font-medium text-[#006E51] mb-3">Quick Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Funding</span>
                          <span className="font-medium">£{(totalFunding / 1000000).toFixed(0)}M</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stakeholders</span>
                          <span className="font-medium">{totalStakeholders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Technologies</span>
                          <span className="font-medium">{totalTechnologies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Projects</span>
                          <span className="font-medium">{totalProjects}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            ) : (
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
                <p className="text-sm text-gray-600">Insights panel hidden</p>
              </div>
            )
          }
          aiChatPanel={<AIChatPanel />}
          quickStats={null}
        />
      </div>
    </div>
  )
}

// Main page component with Suspense for search params
export default function NavigatePage() {
  return (
    <AppProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006E51] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading NAVIGATE Platform...</p>
          </div>
        </div>
      }>
        <NavigateContent />
      </Suspense>
    </AppProvider>
  )
}

