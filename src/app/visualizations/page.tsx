"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, Network, Zap, Sun, GitBranch, Download, Settings, MessageCircle, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreativeHero } from "@/components/ui/CreativeHero"

// Import existing visualization components
import { SankeyChart } from "@/components/visualizations/SankeyChart"
import { HeatmapChart } from "@/components/visualizations/HeatmapChart"
import { NetworkGraph } from "@/components/visualizations/NetworkGraph"
import { SunburstChart } from "@/components/visualizations/SunburstChart"
import { ChordDiagram } from "@/components/visualizations/ChordDiagram"

// Import existing control panels
import { HeatmapInsightsPanel } from "@/components/ui/HeatmapInsightsPanel"
import { ChordInsightsPanel } from "@/components/ui/ChordInsightsPanel"
import { NetworkControlsPanel } from "@/components/ui/NetworkControlsPanel"
import { ClusterInsightsPanel } from "@/components/ui/ClusterInsightsPanel"

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

export default function VisualizationsPage() {
  const [activeViz, setActiveViz] = useState<VisualizationType>('network')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInsights, setShowInsights] = useState(true)
  const [showControls, setShowControls] = useState(true)

  const activeVisualization = visualizations.find(v => v.id === activeViz)

  const renderVisualization = () => {
    switch (activeViz) {
      case 'sankey':
        return <SankeyChart />
      case 'heatmap':
        return <HeatmapChart />
      case 'network':
        return <NetworkGraph />
      case 'sunburst':
        return <SunburstChart />
      case 'chord':
        return <ChordDiagram />
      default:
        return <NetworkGraph />
    }
  }

  const renderInsightsPanel = () => {
    switch (activeViz) {
      case 'heatmap':
        return <HeatmapInsightsPanel />
      case 'chord':
        return <ChordInsightsPanel />
      case 'network':
        return <ClusterInsightsPanel />
      default:
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Insights</h3>
            <p className="text-gray-600">
              Insights panel for {activeVisualization?.name} coming soon...
            </p>
          </div>
        )
    }
  }

  const renderControlsPanel = () => {
    switch (activeViz) {
      case 'network':
        return <NetworkControlsPanel />
      default:
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#CCE2DC]/50">
            <h3 className="text-lg font-semibold text-[#006E51] mb-4">Controls</h3>
            <p className="text-gray-600">
              Controls for {activeVisualization?.name} coming soon...
            </p>
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

      {/* Header */}
      <header className="relative z-10 border-b border-[#CCE2DC]/30 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#006E51]">Challenge Intelligence</h1>
              <p className="text-sm text-gray-600">Interactive Data Visualizations</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Future: AI Chat Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-[#006E51]"
                disabled
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                AI Assistant
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">Soon</span>
              </Button>
              
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
            : showControls && showInsights 
              ? 'grid-cols-1 lg:grid-cols-4' 
              : showControls || showInsights 
                ? 'grid-cols-1 lg:grid-cols-3' 
                : 'grid-cols-1'
        }`}>
          
          {/* Controls Panel */}
          {showControls && !isFullscreen && (
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
                </div>
                
                {!isFullscreen && (
                  <div className="flex gap-2">
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
          {showInsights && !isFullscreen && (
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
        {(!showControls || !showInsights) && !isFullscreen && (
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