"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, Network, Zap, Sun, GitBranch, Download, Settings, MessageCircle, Maximize2, Menu, X, ChevronDown, Home, Target, Users, FileText, User, TestTube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreativeHero } from "@/components/ui/CreativeHero"
import Link from "next/link"

// Import existing visualization components and data
import { SankeyChart } from "@/components/visualizations/SankeyChart"
import { HeatmapChart } from "@/components/visualizations/HeatmapChart"
import { SunburstChart } from "@/components/visualizations/SunburstChart"
import { ChordDiagram } from "@/components/visualizations/ChordDiagram"
import { NetworkGraph } from "@/components/visualizations/NetworkGraph"
import challenges from "@/data/challenges"
import { Challenge } from "@/lib/types"
import { AppProvider, useAppContext } from "@/contexts/AppContext"
import { InsightsSummary } from "@/components/ui/InsightsSummary"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { UnifiedFloatingNav } from "@/components/ui/UnifiedFloatingNav"

// Import cluster analysis types
import { ClusterInfo } from "@/lib/cluster-analysis"

// Note: Using custom panels instead of importing existing ones to avoid prop dependencies

type VisualizationType = 'sankey' | 'heatmap' | 'network' | 'sunburst' | 'chord'

const visualizations = [
  {
    id: 'sankey' as VisualizationType,
    name: 'Flow Analysis',
    description: 'Challenge progression and resource flows',
    icon: GitBranch,
    color: '#006E51'
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInsights, setShowInsights] = useState(true) // Show by default
  const [showControls, setShowControls] = useState(true) // Show by default
  const [focusMode, setFocusMode] = useState(false) // Focus mode off by default
  
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

  const renderVisualization = () => {
    // Dynamic height based on visualization type
    const getVisualizationHeight = () => {
      switch (activeViz) {
        case 'sankey':
          return 'min-h-[800px]' // Sankey needs more vertical space
        case 'heatmap':
          return 'min-h-[600px]' // Heatmap is more compact
        case 'sunburst':
          return 'h-[600px]' // Sunburst is circular, fixed aspect
        case 'chord':
          return 'h-[600px]' // Chord is also circular
        default:
          return 'h-[600px]'
      }
    }

    const containerClass = `w-full ${getVisualizationHeight()} overflow-auto`

    switch (activeViz) {
      case 'sankey':
        return (
          <div className={containerClass}>
            <SankeyChart 
              challenges={filteredChallenges}
              onNodeClick={handleNodeClick}
              className="w-full min-h-full"
            />
          </div>
        )
      case 'heatmap':
        return (
          <div className={containerClass}>
            <HeatmapChart 
              challenges={filteredChallenges}
              onCellClick={handleCellClick}
              className="w-full min-h-full"
            />
          </div>
        )
      case 'network':
        return (
          <div className={containerClass}>
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
            <ChordDiagram 
              challenges={filteredChallenges}
              onSectorSelect={(sector) => {
                setSelectedSector(sector)
                setSelectedElement({ type: 'sector', value: sector })
              }}
              className="w-full h-full"
            />
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
        
        {/* Default insights for other visualizations */}
        {!selectedChallenge && !['heatmap', 'chord', 'network'].includes(activeViz) && (
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
    switch (activeViz) {
      case 'network':
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Network Controls</h3>
            
            <div className="space-y-6">
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
                    />
                    <span className="text-sm text-gray-700">Camera orbit</span>
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
            <div className="space-y-4">
              <div className="p-4 bg-[#CCE2DC]/20 rounded-lg">
                <h4 className="font-medium text-[#006E51] mb-2">Interactive Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click cells to explore sector-problem combinations</li>
                  <li>• Darker colors indicate higher challenge density</li>
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
      {/* Background Pattern */}
      <CreativeHero className="fixed inset-0 z-0" />
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
          {/* Breadcrumbs */}
          <Breadcrumbs 
            items={[
              { label: "Innovation Atlas", href: "/" },
              { label: "Data Visualizations", current: true }
            ]}
            className="mb-4"
          />
          
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