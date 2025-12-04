'use client';

import { useState, useMemo, useCallback, Suspense, useRef, ReactNode, useEffect } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import {
  SlidersHorizontal,
  Sparkles,
  Bot,
  Grid3X3,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Search,
  BarChart3,
  GitBranch,
  Zap,
  Sun,
  Network,
  Clock,
  TrendingUp,
  Layers,
  Activity,
  Users,
  X,
  PanelLeft,
  LayoutGrid,
  Pin,
  PinOff,
  Move,
} from 'lucide-react';
import { TopNavigation } from '@/components/ui/TopNavigation';
import { UnifiedFloatingNav } from '@/components/ui/UnifiedFloatingNav';
import { DraggablePanel, UnifiedIntelligencePanel } from '@/components/panels';
import { CompactInsightCard } from '@/components/panels/CompactInsightCard';
import type { Message as AIMessage } from '@/components/layouts/AIChatPanel';
import { VisualizationControlSections, VisualizationControlContext } from '@/components/controls/VisualizationControlSections';
import { StakeholderInsightPanel } from '@/components/toolkit/StakeholderInsightPanel';
import { stakeholders, technologies, projects, relationships, fundingEvents } from '@/data/navigate-dummy-data';
import { Technology, TechnologyCategory } from '@/lib/navigate-types';
import { TimelineTrack, BarSortOrder, BarValueMode, HeatmapColorMode, TreemapViewMode } from '@/types/visualization-controls';
import { buildCirclePackingMaps, getHighlightedIds } from '@/lib/circlePackingRelationships';
import { CirclePackingNode } from '@/data/toolkit/circlePackingData';

// =============================================================================
// TYPES
// =============================================================================

type ViewMode = 'gallery' | 'workspace';
type LayoutMode = 'floating' | 'sidebar' | 'compact';
type StatusFilter = 'all' | 'ready' | 'development' | 'placeholder';
type CategoryFilter = string | 'all';
type VisualizationType = 'sankey' | 'heatmap' | 'network' | 'sunburst' | 'chord' | 'radar' | 'bar' | 'circle' | 'bump' | 'treemap' | 'stream' | 'parallel' | 'swarm' | 'timeline';

interface VisualizationEntry {
  id: string;
  vizType?: VisualizationType;
  name: string;
  description: string;
  category: string;
  status: 'ready' | 'development' | 'placeholder';
  icon: any;
  tags?: string[];
  component?: React.ComponentType<any>;
  defaultState?: Record<string, any>;
  // Toolkit visuals that support external control/insights
  isToolkitVisual?: boolean;
  toolkitType?: 'stakeholder-d3' | 'stakeholder-circle' | 'innovation-tracker' | 'innovation-sankey';
  previewType?: string;
  domains?: ('navigate' | 'cpc' | 'atlas')[];
}

// =============================================================================
// MINI PREVIEW SVG COMPONENTS
// =============================================================================

function NetworkPreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="30" r="8" fill="#006E51" opacity="0.8" />
      <circle cx="25" cy="60" r="6" fill="#2d8f6f" opacity="0.7" />
      <circle cx="75" cy="55" r="7" fill="#7b2cbf" opacity="0.7" />
      <circle cx="40" cy="80" r="5" fill="#f4a261" opacity="0.7" />
      <circle cx="65" cy="78" r="6" fill="#e76f51" opacity="0.7" />
      <line x1="50" y1="30" x2="25" y2="60" stroke="#006E51" strokeWidth="1" opacity="0.4" />
      <line x1="50" y1="30" x2="75" y2="55" stroke="#006E51" strokeWidth="1" opacity="0.4" />
      <line x1="25" y1="60" x2="40" y2="80" stroke="#2d8f6f" strokeWidth="1" opacity="0.4" />
      <line x1="75" y1="55" x2="65" y2="78" stroke="#7b2cbf" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function SankeyPreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M10,20 C40,20 40,15 70,15 L70,25 C40,25 40,30 10,30 Z" fill="#006E51" opacity="0.7" />
      <path d="M10,40 C40,40 40,35 70,35 L70,45 C40,45 40,50 10,50 Z" fill="#2d8f6f" opacity="0.7" />
      <path d="M10,60 C40,60 40,55 70,55 L70,65 C40,65 40,70 10,70 Z" fill="#f4a261" opacity="0.7" />
      <path d="M70,15 C85,15 85,25 90,25 L90,35 C85,35 85,25 70,25 Z" fill="#006E51" opacity="0.5" />
      <path d="M70,35 C85,35 85,50 90,50 L90,60 C85,60 85,45 70,45 Z" fill="#2d8f6f" opacity="0.5" />
    </svg>
  );
}

function TreemapPreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="5" y="5" width="45" height="55" fill="#006E51" opacity="0.8" rx="2" />
      <rect x="55" y="5" width="40" height="30" fill="#2d8f6f" opacity="0.7" rx="2" />
      <rect x="55" y="40" width="40" height="20" fill="#7b2cbf" opacity="0.7" rx="2" />
      <rect x="5" y="65" width="30" height="30" fill="#f4a261" opacity="0.7" rx="2" />
      <rect x="40" y="65" width="55" height="30" fill="#e76f51" opacity="0.7" rx="2" />
    </svg>
  );
}

function RadarPreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="50,15 85,35 75,75 25,75 15,35" fill="none" stroke="#ccc" strokeWidth="0.5" />
      <polygon points="50,20 80,38 65,70 35,70 20,38" fill="#006E51" opacity="0.3" stroke="#006E51" strokeWidth="1.5" />
    </svg>
  );
}

function BarPreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="10" y="50" width="12" height="40" fill="#006E51" opacity="0.8" rx="1" />
      <rect x="28" y="30" width="12" height="60" fill="#2d8f6f" opacity="0.8" rx="1" />
      <rect x="46" y="20" width="12" height="70" fill="#7b2cbf" opacity="0.8" rx="1" />
      <rect x="64" y="40" width="12" height="50" fill="#f4a261" opacity="0.8" rx="1" />
      <rect x="82" y="55" width="12" height="35" fill="#e76f51" opacity="0.8" rx="1" />
    </svg>
  );
}

function ChordPreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="35" fill="none" stroke="#e5e5e5" strokeWidth="8" />
      <path d="M25,30 Q50,60 75,30" fill="#006E51" opacity="0.3" />
      <path d="M80,45 Q50,70 80,75" fill="#2d8f6f" opacity="0.3" />
    </svg>
  );
}

function HeatmapPreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {[0, 1, 2, 3, 4].map(row => 
        [0, 1, 2, 3, 4].map(col => (
          <rect key={`${row}-${col}`} x={10 + col * 16} y={10 + row * 16} width="14" height="14" fill="#006E51" opacity={0.2 + ((row + col) % 5) * 0.15} rx="1" />
        ))
      )}
    </svg>
  );
}

function StreamPreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M0,50 Q25,40 50,45 T100,40 L100,50 Q75,55 50,50 T0,55 Z" fill="#006E51" opacity="0.7" />
      <path d="M0,55 Q25,50 50,50 T100,50 L100,60 Q75,65 50,60 T0,65 Z" fill="#2d8f6f" opacity="0.7" />
      <path d="M0,65 Q25,60 50,60 T100,60 L100,75 Q75,80 50,75 T0,80 Z" fill="#7b2cbf" opacity="0.6" />
    </svg>
  );
}

function BumpPreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M10,20 L30,35 L50,25 L70,40 L90,30" fill="none" stroke="#006E51" strokeWidth="2" />
      <path d="M10,40 L30,25 L50,45 L70,30 L90,50" fill="none" stroke="#2d8f6f" strokeWidth="2" />
      <path d="M10,60 L30,55 L50,65 L70,55 L90,70" fill="none" stroke="#7b2cbf" strokeWidth="2" />
    </svg>
  );
}

function SwarmPreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {[20, 40, 60, 80].map((x, i) => (
        <g key={i}>
          {[0, 1, 2, 3, 4].map((j) => (
            <circle key={j} cx={x + (j % 2) * 5 - 2} cy={30 + j * 12} r={3} fill={['#006E51', '#2d8f6f', '#7b2cbf', '#f4a261'][i]} opacity={0.7} />
          ))}
        </g>
      ))}
    </svg>
  );
}

function CirclePreview() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="40" fill="#006E51" opacity="0.15" />
      <circle cx="35" cy="40" r="18" fill="#2d8f6f" opacity="0.4" />
      <circle cx="65" cy="45" r="15" fill="#7b2cbf" opacity="0.4" />
      <circle cx="50" cy="70" r="12" fill="#f4a261" opacity="0.4" />
    </svg>
  );
}

const PREVIEW_COMPONENTS: Record<string, React.FC> = {
  network: NetworkPreview,
  sankey: SankeyPreview,
  treemap: TreemapPreview,
  radar: RadarPreview,
  bar: BarPreview,
  chord: ChordPreview,
  heatmap: HeatmapPreview,
  stream: StreamPreview,
  bump: BumpPreview,
  swarm: SwarmPreview,
  circle: CirclePreview,
};

// =============================================================================
// CONFIGURATION
// =============================================================================

const CATEGORY_CONFIG: Record<string, { icon: typeof Network; color: string }> = {
  'Stakeholder Dynamics': { icon: Users, color: '#006E51' },
  'Innovation Tracker': { icon: TrendingUp, color: '#F5A623' },
  'Unified': { icon: Network, color: '#0f8b8d' },
  'Flow': { icon: GitBranch, color: '#006E51' },
  'Hierarchy': { icon: Layers, color: '#F5A623' },
  'Comparison': { icon: BarChart3, color: '#8b5cf6' },
  'Relationship': { icon: Zap, color: '#4A90E2' },
  'Matrix': { icon: BarChart3, color: '#4A90E2' },
  'Timeline': { icon: Clock, color: '#0EA5E9' },
  'Distribution': { icon: Activity, color: '#EC4899' },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  ready: { color: '#10b981', label: 'Ready' },
  development: { color: '#f59e0b', label: 'In Dev' },
  placeholder: { color: '#9ca3af', label: 'Planned' },
};

// =============================================================================
// LOADING PLACEHOLDER
// =============================================================================

function VizLoadingPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
      <div className="animate-pulse flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-[#006E51]/20" />
        <span className="text-sm text-gray-400">Loading visualization...</span>
      </div>
    </div>
  );
}

// =============================================================================
// GALLERY CARD COMPONENT
// =============================================================================

interface GalleryCardProps {
  viz: VisualizationEntry;
  onClick: () => void;
}

function GalleryCard({ viz, onClick }: GalleryCardProps) {
  const PreviewComponent = viz.previewType ? PREVIEW_COMPONENTS[viz.previewType] : null;
  const statusConfig = STATUS_CONFIG[viz.status];
  const categoryConfig = CATEGORY_CONFIG[viz.category] || { icon: Network, color: '#006E51' };
  const Icon = categoryConfig.icon;

  // Determine badge type
  const getBadgeInfo = () => {
    if (viz.isToolkitVisual) {
      return { label: 'Toolkit', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    }
    if (viz.id === 'portfolio-treemap' || viz.id === 'stakeholder-sunburst') {
      return { label: 'CPC', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
    if (viz.category === 'Unified' || viz.id === 'network-graph-v8') {
      return { label: 'Unified', color: 'bg-teal-100 text-teal-700 border-teal-200' };
    }
    if (viz.domains?.includes('navigate')) {
      return { label: 'Navigate', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }
    return null;
  };

  const badgeInfo = getBadgeInfo();

  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:border-gray-300 hover:shadow-md text-left"
      aria-label={`View ${viz.name}`}
    >
      {/* Preview Area - 4:3 aspect ratio */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-slate-50 to-white">
        {PreviewComponent ? (
          <PreviewComponent />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-xl bg-[#CCE2DC]/50 flex items-center justify-center">
              {Icon && <Icon className="h-8 w-8 text-[#006E51]/40" />}
            </div>
          </div>
        )}

        {/* Status indicator - subtle dot in corner */}
        <div className="absolute top-2 left-2">
          <div className={clsx('w-2 h-2 rounded-full', statusConfig.color === '#10b981' ? 'bg-emerald-500' : statusConfig.color === '#f59e0b' ? 'bg-amber-500' : 'bg-gray-400')} />
        </div>

        {/* Badge - Top right */}
        {badgeInfo && (
          <div className={clsx('absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-semibold border', badgeInfo.color)}>
            {badgeInfo.label}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#006E51]/0 group-hover:bg-[#006E51]/5 transition-colors duration-200" />
      </div>

      {/* Card Footer - Minimal text */}
      <div className="px-3 py-2">
        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#006E51] transition-colors">
          {viz.name}
        </h3>
        {/* Optional: tiny category indicator */}
        <div 
          className="mt-1 h-0.5 w-8 rounded-full opacity-60"
          style={{ backgroundColor: categoryConfig.color }}
        />
      </div>
    </button>
  );
}

// =============================================================================
// DYNAMIC IMPORTS
// =============================================================================

// Standard Navigate visualizations
const SankeyChartNavigate = dynamic(() => import('@/components/visualizations/SankeyChartNavigate').then(mod => ({ default: mod.SankeyChartNavigate })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const RadarChartNavigate = dynamic(() => import('@/components/visualizations/RadarChartNavigate').then(mod => ({ default: mod.RadarChartNavigate })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const TreemapSunburstExplorer = dynamic(() => import('@/components/visualizations/TreemapSunburstExplorer').then(mod => ({ default: mod.TreemapSunburstExplorer })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const HeatmapNavigate = dynamic(() => import('@/components/visualizations/HeatmapNavigate').then(mod => ({ default: mod.HeatmapNavigate })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const BarChartNavigate = dynamic(() => import('@/components/visualizations/BarChartNavigate').then(mod => ({ default: mod.BarChartNavigate })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const CirclePackingNavigate = dynamic(() => import('@/components/visualizations/CirclePackingNavigate').then(mod => ({ default: mod.CirclePackingNavigate })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const ChordDiagramNavigate = dynamic(() => import('@/components/visualizations/ChordDiagramNavigate').then(mod => ({ default: mod.ChordDiagramNavigate })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const BumpChartNavigate = dynamic(() => import('@/components/visualizations/BumpChartNavigate').then(mod => ({ default: mod.BumpChartNavigate })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const StreamGraphNavigate = dynamic(() => import('@/components/visualizations/StreamGraphNavigate').then(mod => ({ default: mod.StreamGraphNavigate })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const SwarmPlotNavigate = dynamic(() => import('@/components/visualizations/SwarmPlotNavigate').then(mod => ({ default: mod.SwarmPlotNavigate })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });

// Toolkit Visualizations
const D3NetworkGraphView = dynamic(() => import('@/components/toolkit/D3NetworkGraphView').then(mod => ({ default: mod.D3NetworkGraphView })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const CirclePackingSimpleECharts = dynamic(() => import('@/components/toolkit/CirclePackingSimpleECharts').then(mod => ({ default: mod.CirclePackingSimpleECharts })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const EnhancedInnovationTracker = dynamic(() => import('@/components/toolkit/InnovationTracker').then(mod => ({ default: mod.EnhancedInnovationTracker })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const InnovationTrackerSankey = dynamic(() => import('@/components/toolkit/InnovationTrackerSankey').then(mod => ({ default: mod.InnovationTrackerSankey })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });

// CPC Domain Visualizations
const PortfolioTreemap = dynamic(() => import('@/components/visualizations/PortfolioTreemap').then(mod => ({ default: mod.PortfolioTreemap })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });
const StakeholderSunburst = dynamic(() => import('@/components/visualizations/StakeholderSunburst').then(mod => ({ default: mod.StakeholderSunburst })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });

// Network Graph V8
const NetworkGraphV8 = dynamic(() => import('@/components/visualizations/NetworkGraphV8').then(mod => ({ default: mod.NetworkGraphV8 })), { ssr: false, loading: () => <VizLoadingPlaceholder /> });

// =============================================================================
// VISUALIZATION REGISTRY
// =============================================================================

const VISUALIZATIONS: VisualizationEntry[] = [
  // Stakeholder Dynamics - Toolkit with externalized controls/insights
  {
    id: 'stakeholder-network-d3',
    name: 'Stakeholder Network (D3)',
    description: 'Force-directed network with advanced grouping & pods',
    category: 'Stakeholder Dynamics',
    status: 'ready',
    icon: Network,
    tags: ['stakeholder', 'network', 'd3'],
    component: D3NetworkGraphView,
    isToolkitVisual: true,
    toolkitType: 'stakeholder-d3',
    previewType: 'network',
  },
  {
    id: 'stakeholder-circle',
    name: 'Stakeholder Circle',
    description: 'Hierarchical circle packing showing ecosystem',
    category: 'Stakeholder Dynamics',
    status: 'ready',
    icon: Users,
    tags: ['stakeholder', 'circle-packing'],
    component: CirclePackingSimpleECharts,
    isToolkitVisual: true,
    toolkitType: 'stakeholder-circle',
    previewType: 'circle',
  },
  {
    id: 'network-graph-v8',
    name: 'Network Graph V8',
    description: 'Unified network graph with advanced clustering and multi-domain support',
    category: 'Unified',
    status: 'ready',
    icon: Network,
    tags: ['network', 'graph', 'multi-domain', 'clustering', 'unified'],
    component: NetworkGraphV8,
    isToolkitVisual: false,
    previewType: 'network',
  },
  // Innovation Tracker - Toolkit (embedded UI for now)
  {
    id: 'innovation-tracker-enhanced',
    name: 'Innovation Tracker',
    description: 'Comprehensive funding flow tracker with multiple views',
    category: 'Innovation Tracker',
    status: 'ready',
    icon: TrendingUp,
    tags: ['funding', 'sankey', 'innovation'],
    component: EnhancedInnovationTracker,
    isToolkitVisual: true,
    toolkitType: 'innovation-tracker',
    previewType: 'sankey',
  },
  {
    id: 'innovation-tracker-classic',
    name: 'Funding Flows (Classic)',
    description: 'Classic Sankey diagram showing funding flows',
    category: 'Innovation Tracker',
    status: 'ready',
    icon: GitBranch,
    tags: ['funding', 'sankey'],
    component: InnovationTrackerSankey,
    isToolkitVisual: true,
    toolkitType: 'innovation-sankey',
    previewType: 'sankey',
  },
  // Standard Navigate visualizations
  {
    id: 'sankey-navigate', name: 'Flow Analysis', description: 'Funding flows and resource allocation',
    category: 'Flow', status: 'ready', icon: GitBranch, tags: ['funding', 'flow', 'sankey'],
    component: SankeyChartNavigate, vizType: 'sankey', previewType: 'sankey',
    domains: ['navigate'],
  },
  {
    id: 'stream-navigate', name: 'Funding Trends', description: 'Cumulative funding flows over time',
    category: 'Flow', status: 'ready', icon: Activity, tags: ['funding', 'trends', 'stream'],
    component: StreamGraphNavigate, vizType: 'stream', previewType: 'stream',
    domains: ['navigate'],
  },
  {
    id: 'treemap-explorer', name: 'Funding Breakdown', description: 'Hierarchical treemap/sunburst view',
    category: 'Hierarchy', status: 'ready', icon: Layers, tags: ['treemap', 'sunburst'],
    component: TreemapSunburstExplorer, vizType: 'treemap', previewType: 'treemap',
    domains: ['navigate'],
  },
  {
    id: 'circle-packing-navigate', name: 'Circle Packing', description: 'Hierarchical entity relationships',
    category: 'Hierarchy', status: 'ready', icon: Sun, tags: ['circle-packing'],
    component: CirclePackingNavigate, vizType: 'circle', previewType: 'circle',
    domains: ['navigate'],
  },
  {
    id: 'radar-navigate', name: 'Tech Maturity Radar', description: 'Compare technology readiness',
    category: 'Comparison', status: 'ready', icon: Zap, tags: ['radar', 'trl'],
    component: RadarChartNavigate, vizType: 'radar', previewType: 'radar',
    domains: ['navigate'],
  },
  {
    id: 'bar-navigate', name: 'Bar Chart Analysis', description: 'Funding, projects, and technology breakdowns',
    category: 'Comparison', status: 'ready', icon: BarChart3, tags: ['bar', 'chart'],
    component: BarChartNavigate, vizType: 'bar', previewType: 'bar',
    domains: ['navigate'],
  },
  {
    id: 'chord-navigate', name: 'Relationship Matrix', description: 'Cross-sector dependencies',
    category: 'Relationship', status: 'ready', icon: Zap, tags: ['chord'],
    component: ChordDiagramNavigate, vizType: 'chord', previewType: 'chord',
    domains: ['navigate'],
  },
  {
    id: 'heatmap-navigate', name: 'Intensity Map', description: 'TRL vs category heatmap',
    category: 'Matrix', status: 'ready', icon: BarChart3, tags: ['heatmap'],
    component: HeatmapNavigate, vizType: 'heatmap', previewType: 'heatmap',
    domains: ['navigate'],
  },
  {
    id: 'bump-navigate', name: 'TRL Progression', description: 'Technology readiness over time',
    category: 'Timeline', status: 'ready', icon: TrendingUp, tags: ['bump', 'trl'],
    component: BumpChartNavigate, vizType: 'bump', previewType: 'bump',
    domains: ['navigate'],
  },
  {
    id: 'swarm-navigate', name: 'Tech Distribution', description: 'TRL and category distribution',
    category: 'Distribution', status: 'ready', icon: Activity, tags: ['swarm'],
    component: SwarmPlotNavigate, vizType: 'swarm', previewType: 'swarm',
    domains: ['navigate'],
  },
  // CPC Domain Visualizations
  {
    id: 'portfolio-treemap', name: 'Portfolio Treemap', description: 'Hierarchical portfolio view by mode, stage, or theme',
    category: 'Hierarchy', status: 'ready', icon: Layers, tags: ['treemap', 'portfolio', 'cpc'],
    component: PortfolioTreemap, vizType: 'treemap', previewType: 'treemap',
    domains: ['cpc'],
  },
  {
    id: 'stakeholder-sunburst', name: 'Stakeholder Sunburst (Test)', description: 'Radial taxonomy view of stakeholder ecosystem',
    category: 'Stakeholder Dynamics', status: 'ready', icon: Users, tags: ['sunburst', 'stakeholder', 'cpc'],
    component: StakeholderSunburst, vizType: 'sunburst', previewType: 'circle',
    domains: ['cpc'],
  },
];

// =============================================================================
// SIDEBAR COMPONENT
// =============================================================================

interface SidebarProps {
  categories: { name: string; count: number }[];
  selectedCategory: CategoryFilter;
  onCategorySelect: (cat: CategoryFilter) => void;
  statusFilter: StatusFilter;
  onStatusFilter: (status: StatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
}

function Sidebar({ categories, selectedCategory, onCategorySelect, statusFilter, onStatusFilter, searchQuery, onSearchChange, totalCount, filteredCount }: SidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006E51]/20 focus:border-[#006E51]" />
        </div>
        <p className="text-xs text-gray-400 mt-2">{filteredCount} of {totalCount}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Category</h3>
        <div className="space-y-1">
          <button onClick={() => onCategorySelect('all')} className={clsx('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', selectedCategory === 'all' ? 'bg-[#006E51] text-white' : 'text-gray-600 hover:bg-gray-100')}>
            All Visualizations
          </button>
          {categories.map(({ name, count }) => {
            const config = CATEGORY_CONFIG[name] || { icon: BarChart3, color: '#64748b' };
            const Icon = config.icon;
            return (
              <button key={name} onClick={() => onCategorySelect(name)} className={clsx('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2', selectedCategory === name ? 'bg-[#006E51] text-white' : 'text-gray-600 hover:bg-gray-100')}>
                <Icon className="h-3.5 w-3.5" style={{ color: selectedCategory === name ? 'white' : config.color }} />
                <span className="flex-1 truncate">{name}</span>
                <span className="text-xs opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 mt-6">Status</h3>
        <div className="space-y-1">
          {(['all', 'ready', 'development'] as StatusFilter[]).map((status) => {
            const config = status === 'all' ? null : STATUS_CONFIG[status];
            return (
              <button key={status} onClick={() => onStatusFilter(status)} className={clsx('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2', statusFilter === status ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50')}>
                {config && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />}
                <span className="capitalize">{status === 'all' ? 'All' : config?.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

// =============================================================================
// LAYOUT SWITCHER
// =============================================================================

function LayoutSwitcher({ layout, onLayoutChange }: { layout: LayoutMode; onLayoutChange: (layout: LayoutMode) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      <button onClick={() => onLayoutChange('floating')} className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors', layout === 'floating' ? 'bg-[#006E51] text-white' : 'text-gray-600 hover:bg-gray-200')} title="Floating Panels">
        <Move className="h-3.5 w-3.5" /><span className="hidden sm:inline">Floating</span>
      </button>
      <button onClick={() => onLayoutChange('sidebar')} className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors', layout === 'sidebar' ? 'bg-[#006E51] text-white' : 'text-gray-600 hover:bg-gray-200')} title="Sidebar Layout">
        <PanelLeft className="h-3.5 w-3.5" /><span className="hidden sm:inline">Sidebar</span>
      </button>
      <button onClick={() => onLayoutChange('compact')} className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors', layout === 'compact' ? 'bg-[#006E51] text-white' : 'text-gray-600 hover:bg-gray-200')} title="Compact Layout">
        <LayoutGrid className="h-3.5 w-3.5" /><span className="hidden sm:inline">Compact</span>
      </button>
    </div>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function VisualLibraryPage() {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('sidebar');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeVizId, setActiveVizId] = useState<string | null>(null);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Panel state
  const [controlsPanelOpen, setControlsPanelOpen] = useState(true);
  const [controlsPanelPinned, setControlsPanelPinned] = useState(true); // Start pinned so controls are visible
  const [controlsHovered, setControlsHovered] = useState(false);
  const [intelligencePanelOpen, setIntelligencePanelOpen] = useState(true);

  // Container ref (used by draggable panels)
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  // ==========================================================================
  // TOOLKIT STATE (for stakeholder visuals)
  // ==========================================================================
  const { nodeMap, adjacency } = useMemo(() => buildCirclePackingMaps(), []);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const highlightedIds = useMemo(() => getHighlightedIds(selectedEntityId, adjacency), [selectedEntityId, adjacency]);
  const selectedNode = selectedEntityId ? nodeMap[selectedEntityId] : null;
  const relatedEntities = useMemo(() => {
    if (!selectedEntityId) return [];
    const relatedIds = adjacency[selectedEntityId];
    if (!relatedIds) return [];
    return Array.from(relatedIds).map((id) => nodeMap[id]).filter((node): node is CirclePackingNode => Boolean(node));
  }, [selectedEntityId, adjacency, nodeMap]);

  // Network Graph V8 entity selection (separate from toolkit stakeholder selection)
  const [networkGraphV8SelectedEntity, setNetworkGraphV8SelectedEntity] = useState<any>(null);
  
  // Determine active visualization early (needed for intelligenceSelectedEntity computation)
  const activeVizForIntelligence = useMemo(() => activeVizId ? VISUALIZATIONS.find(v => v.id === activeVizId) || null : null, [activeVizId]);
  const isUnifiedVisualForIntelligence = activeVizForIntelligence?.id === 'network-graph-v8';

  // Map toolkit stakeholder selection into a unified intelligence "selected entity"
  const intelligenceSelectedEntity = useMemo(() => {
    // If Network Graph V8 (Unified) has a selected entity, use that
    if (isUnifiedVisualForIntelligence && networkGraphV8SelectedEntity) {
      return {
        type: networkGraphV8SelectedEntity.entityType || 'entity',
        id: networkGraphV8SelectedEntity.id,
        name: networkGraphV8SelectedEntity.name,
        data: networkGraphV8SelectedEntity.metadata || {},
      };
    }
    // Otherwise use toolkit stakeholder selection
    if (!selectedEntityId) return null;
    const name = (selectedNode as any)?.name ?? selectedEntityId;
    return {
      type: 'stakeholder',
      id: selectedEntityId,
      name,
      data: selectedNode,
    };
  }, [selectedEntityId, selectedNode, isUnifiedVisualForIntelligence, networkGraphV8SelectedEntity]);

  // Toolkit controls renderer (set by toolkit components)
  // Use wrapper object to avoid React interpreting function as state updater
  const [toolkitControlsRenderer, setToolkitControlsRenderer] = useState<{ render: (() => ReactNode) } | null>(null);
  const [toolkitInsightsRenderer, setToolkitInsightsRenderer] = useState<{ render: (() => ReactNode) } | null>(null);
  
  // Wrappers to properly store the render functions
  const handleToolkitControlsRender = useCallback((renderer: (() => ReactNode) | null) => {
    setToolkitControlsRenderer(renderer ? { render: renderer } : null);
  }, []);
  
  const handleToolkitInsightsRender = useCallback((renderer: (() => ReactNode) | null) => {
    setToolkitInsightsRenderer(renderer ? { render: renderer } : null);
  }, []);

  // ==========================================================================
  // NAVIGATE CONTROL CONTEXT STATE
  // ==========================================================================
  const [timelineTracks, setTimelineTracks] = useState<Record<TimelineTrack, boolean>>({ technology: true, infrastructure: true, policy: true, skills: true });
  const toggleTimelineTrack = useCallback((track: TimelineTrack) => setTimelineTracks(prev => ({ ...prev, [track]: !prev[track] })), []);
  const [barSortOrder, setBarSortOrder] = useState<BarSortOrder>('desc');
  const [barValueMode, setBarValueMode] = useState<BarValueMode>('absolute');
  const [barChartView, setBarChartView] = useState<'funding_by_stakeholder' | 'funding_by_tech' | 'projects_by_status' | 'tech_by_trl'>('funding_by_stakeholder');
  const [circlePackingView, setCirclePackingView] = useState<'by_stakeholder_type' | 'by_technology_category' | 'by_funding'>('by_stakeholder_type');
  const [bumpView, setBumpView] = useState<'all_technologies' | 'by_category' | 'top_advancing'>('all_technologies');
  const [selectedCategories, setSelectedCategories] = useState<TechnologyCategory[]>([]);
  const [treemapView, setTreemapView] = useState<TreemapViewMode>('treemap');
  const [chordView, setChordView] = useState<'by_stakeholder_type' | 'by_tech_category' | 'by_funding_flow'>('by_stakeholder_type');
  const [heatmapView, setHeatmapView] = useState<'trl_vs_category' | 'tech_vs_stakeholder' | 'funding_vs_status'>('trl_vs_category');
  const [heatmapColorMode, setHeatmapColorMode] = useState<HeatmapColorMode>('absolute');
  const [streamView, setStreamView] = useState<'by_stakeholder_type' | 'by_tech_category' | 'by_funding_type'>('by_stakeholder_type');
  const [parallelDimensions, setParallelDimensions] = useState<string[]>(['TRL Level', 'Funding (£M)', 'Market Readiness']);
  const [swarmView, setSwarmView] = useState<'by_trl' | 'by_category'>('by_trl');
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(['TRL Level', 'Funding (£M)', 'Market Readiness', 'Regulatory Status']);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.3);
  const [showClusters, setShowClusters] = useState(false);
  const [isOrbiting, setIsOrbiting] = useState(false);

  const filteredTechnologies = useMemo(() => technologies as Technology[], []);
  const technologyCategories = useMemo(() => [...new Set(technologies.map(t => t.category))], []);

  const controlContext: VisualizationControlContext = {
    useNavigateData: true, timelineTracks, toggleTimelineTrack, barSortOrder, setBarSortOrder, barValueMode, setBarValueMode,
    barChartView, setBarChartView, circlePackingView, setCirclePackingView, bumpView, setBumpView, selectedCategories, setSelectedCategories,
    treemapView, setTreemapView, chordView, setChordView, heatmapView, setHeatmapView, heatmapColorMode, setHeatmapColorMode,
    streamView, setStreamView, parallelDimensions, setParallelDimensions, swarmView, setSwarmView, selectedTechIds, setSelectedTechIds,
    selectedDimensions, setSelectedDimensions, filteredTechnologies, technologyCategories, similarityThreshold, setSimilarityThreshold,
    showClusters, setShowClusters, isOrbiting, setIsOrbiting,
  };

  // ==========================================================================
  // AI CHAT STATE (PERSIST ACROSS LAYOUTS)
  // ==========================================================================
  const [chatMessages, setChatMessages] = useState<AIMessage[] | undefined>(undefined);
  const previousEntityRef = useRef<string | null>(null);

  // Default height for floating Insights panel (~80% of viewport, capped)
  const defaultInsightsPanelHeight =
    typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.8, 700) : 560;

  // Check if user has started chatting (has sent at least one user message)
  const hasUserStartedChatting = useMemo(() => {
    if (!chatMessages) return false;
    return chatMessages.some(msg => msg.role === 'user');
  }, [chatMessages]);

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================
  const filteredVisualizations = useMemo(() => {
    return VISUALIZATIONS.filter((viz) => {
      if (categoryFilter !== 'all' && viz.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && viz.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!viz.name.toLowerCase().includes(query) && !viz.description.toLowerCase().includes(query) && !viz.tags?.some(tag => tag.toLowerCase().includes(query))) return false;
      }
      return true;
    });
  }, [categoryFilter, statusFilter, searchQuery]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    VISUALIZATIONS.forEach((viz) => { counts[viz.category] = (counts[viz.category] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, []);

  const activeViz = useMemo(() => activeVizId ? VISUALIZATIONS.find(v => v.id === activeVizId) || null : null, [activeVizId]);
  
  // Determine visual type
  const isToolkitStakeholder = activeViz?.toolkitType === 'stakeholder-d3' || activeViz?.toolkitType === 'stakeholder-circle';
  const isInnovationTracker = activeViz?.toolkitType === 'innovation-tracker' || activeViz?.toolkitType === 'innovation-sankey';
  const isCPCVisual = activeViz?.id === 'portfolio-treemap' || activeViz?.id === 'stakeholder-sunburst';
  const isUnifiedVisual = activeViz?.id === 'network-graph-v8';
  const hasRegistryControls = activeViz?.vizType && !activeViz.isToolkitVisual && !isCPCVisual && !isUnifiedVisual;

  // ==========================================================================
  // FUNCTION TO RENDER INSIGHTS AS COMPACT COMPONENT FOR CHAT
  // ==========================================================================
  const renderInsightForChat = useCallback(() => {
    if (!intelligenceSelectedEntity) return null;

    const entity = intelligenceSelectedEntity;
    const related = isToolkitStakeholder && relatedEntities.length
      ? relatedEntities.map((node) => ({
          id: (node as any).id ?? (node as any).name,
          name: (node as any).name ?? (node as any).id,
          type: 'stakeholder',
        }))
      : [];

    const data: any = entity.data || {};
    
    return (
      <CompactInsightCard 
        title={`${entity.type}: ${entity.name}`}
        defaultExpanded={false}
      >
        {/* Entity header */}
        <div className="rounded-xl bg-gradient-to-br from-[#006E51]/10 to-[#006E51]/5 p-3">
          <p className="text-xs uppercase tracking-wider text-[#006E51]/70">
            {entity.type}
          </p>
          <h3 className="text-sm font-semibold text-[#006E51] mt-0.5">
            {entity.name}
          </h3>
          {data?.description && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
              {data.description}
            </p>
          )}
        </div>

        {/* Entity metadata (compact grid) */}
        {Object.keys(data).length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(data?.entityType || data?.type || entity.type) && (
              <div className="rounded-lg bg-gray-50 p-2">
                <div className="text-gray-500">Type</div>
                <div className="font-medium text-gray-900 truncate">
                  {data?.entityType || data?.type || entity.type}
                </div>
              </div>
            )}
            {(data?.category || data?.stakeholderCategory) && (
              <div className="rounded-lg bg-gray-50 p-2">
                <div className="text-gray-500">Category</div>
                <div className="font-medium text-gray-900 truncate">
                  {data?.category || data?.stakeholderCategory}
                </div>
              </div>
            )}
            {(data?.sector || (data?.sectors && Array.isArray(data.sectors) && data.sectors[0])) && (
              <div className="rounded-lg bg-gray-50 p-2">
                <div className="text-gray-500">Sector</div>
                <div className="font-medium text-gray-900 truncate">
                  {data?.sector || (Array.isArray(data?.sectors) ? data.sectors[0] : data?.sectors)}
                </div>
              </div>
            )}
            {(data?.trl || data?.trl_current) && (
              <div className="rounded-lg bg-gray-50 p-2">
                <div className="text-gray-500">TRL</div>
                <div className="font-medium text-gray-900">
                  {data?.trl || data?.trl_current}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Related entities (if any) */}
        {related.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Connections ({related.length})
            </p>
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 max-h-[150px] overflow-y-auto space-y-1">
              {related.slice(0, 5).map((rel) => (
                <div
                  key={rel.id}
                  className="flex items-center gap-2 p-1.5 text-xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#006E51]" />
                  <span className="text-gray-900 truncate flex-1">{rel.name}</span>
                </div>
              ))}
              {related.length > 5 && (
                <p className="text-xs text-gray-400 py-1 text-center">
                  +{related.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}
      </CompactInsightCard>
    );
  }, [intelligenceSelectedEntity, isToolkitStakeholder, relatedEntities]);

  // ==========================================================================
  // INJECT INSIGHTS INTO CHAT WHEN ENTITY SELECTION CHANGES
  // ==========================================================================
  // Only inject after user has started chatting (has sent at least one message)
  useEffect(() => {
    if (!hasUserStartedChatting) return;
    
    const currentEntityId = intelligenceSelectedEntity?.id || null;
    
    // Only inject if entity changed (not initial selection) and we have a valid entity
    if (currentEntityId && currentEntityId !== previousEntityRef.current) {
      const insightComponent = renderInsightForChat();
      
      if (insightComponent) {
        const insightMessage: AIMessage = {
          id: `insight-${Date.now()}`,
          role: 'insight',
          content: insightComponent,
          timestamp: new Date(),
          isComponent: true,
        };
        
        // Always update, creating array if needed
        setChatMessages(prev => {
          const current = prev || [];
          // Check if this insight already exists (prevent duplicates)
          if (current.some(m => m.id === insightMessage.id)) {
            return current;
          }
          return [...current, insightMessage];
        });
      }
    }
    
    previousEntityRef.current = currentEntityId;
  }, [intelligenceSelectedEntity?.id, hasUserStartedChatting, renderInsightForChat]);

  // ==========================================================================
  // DYNAMIC INSIGHTS → CHAT MESSAGES
  // ==========================================================================
  // Note: Context is passed silently to AI via UnifiedIntelligencePanel's aiContext prop.
  // We don't spam chat with "Context updated" messages - the AI knows what's selected
  // in the background without cluttering the conversation.

  // Handlers
  const handleCardClick = useCallback((vizId: string) => {
    setActiveVizId(vizId);
    setViewMode('workspace');
    setSelectedEntityId(null);
    handleToolkitControlsRender(null);
    handleToolkitInsightsRender(null);
  }, [handleToolkitControlsRender, handleToolkitInsightsRender]);

  const handleBackToGallery = useCallback(() => {
    setViewMode('gallery');
    setIsFullscreen(false);
    setSelectedEntityId(null);
    handleToolkitControlsRender(null);
    handleToolkitInsightsRender(null);
  }, [handleToolkitControlsRender, handleToolkitInsightsRender]);

  // ==========================================================================
  // GALLERY VIEW
  // ==========================================================================
  if (viewMode === 'gallery') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <TopNavigation />
        <UnifiedFloatingNav currentPage="visualisations" />
        <div className="flex-1 flex">
          <Sidebar categories={categories} selectedCategory={categoryFilter} onCategorySelect={setCategoryFilter} statusFilter={statusFilter} onStatusFilter={setStatusFilter} searchQuery={searchQuery} onSearchChange={setSearchQuery} totalCount={VISUALIZATIONS.length} filteredCount={filteredVisualizations.length} />
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredVisualizations.map((viz) => <GalleryCard key={viz.id} viz={viz} onClick={() => handleCardClick(viz.id)} />)}
              </div>
              {filteredVisualizations.length === 0 && <div className="text-center py-12 text-gray-500">No visualizations match your filters.</div>}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // WORKSPACE VIEW - Render visualization
  // ==========================================================================
  const showEmbeddedUI = layoutMode === 'compact' && isInnovationTracker; // Innovation tracker keeps embedded UI in compact mode only

  const renderVisualization = () => {
    if (!activeViz?.component) return <VizLoadingPlaceholder />;
    const VizComponent = activeViz.component;

    // For stakeholder toolkit visuals - pass all required props
    if (isToolkitStakeholder) {
      return (
        <Suspense fallback={<VizLoadingPlaceholder />}>
          <VizComponent
            selectedId={selectedEntityId}
            selectedNode={selectedNode}
            highlightedIds={highlightedIds}
            relatedEntities={relatedEntities}
            onSelectNodeAction={setSelectedEntityId}
            showEmbeddedControls={false}
            showEmbeddedInsights={false}
            onControlsRender={handleToolkitControlsRender}
          />
        </Suspense>
      );
    }

    // For Innovation Tracker - externalize controls and insights
    if (isInnovationTracker) {
      return (
        <Suspense fallback={<VizLoadingPlaceholder />}>
          <VizComponent
            showEmbeddedControls={false}
            showEmbeddedInsights={false}
            onControlsRender={handleToolkitControlsRender}
            onInsightsRender={handleToolkitInsightsRender}
          />
        </Suspense>
      );
    }

    // For CPC Domain visualizations - externalize controls and insights
    if (isCPCVisual) {
      return (
        <Suspense fallback={<VizLoadingPlaceholder />}>
          <VizComponent
            showEmbeddedControls={false}
            showEmbeddedInsights={false}
            onControlsRender={handleToolkitControlsRender}
            onInsightsRender={handleToolkitInsightsRender}
          />
        </Suspense>
      );
    }

    // For Network Graph V8 (Unified) - externalize controls and insights
    if (isUnifiedVisual) {
      return (
        <Suspense fallback={<VizLoadingPlaceholder />}>
          <VizComponent
            showEmbeddedControls={false}
            showEmbeddedInsights={false}
            onControlsRender={handleToolkitControlsRender}
            onInsightsRender={handleToolkitInsightsRender}
            onEntitySelect={(entity: any) => {
              // Store Network Graph V8 selected entity
              setNetworkGraphV8SelectedEntity(entity);
            }}
            className="w-full h-full min-h-0 flex-1"
          />
        </Suspense>
      );
    }

    // For standard Navigate visualizations - pass control state as props
    const vizProps: Record<string, any> = {
      stakeholders, technologies, projects, relationships, fundingEvents,
      className: "w-full h-full",
    };

    if (activeViz.vizType === 'bar') { vizProps.view = barChartView; vizProps.sortOrder = barSortOrder; vizProps.valueMode = barValueMode; }
    else if (activeViz.vizType === 'treemap') { vizProps.viewMode = treemapView; }
    else if (activeViz.vizType === 'circle') { vizProps.view = circlePackingView; }
    else if (activeViz.vizType === 'bump') { vizProps.view = bumpView; vizProps.selectedCategories = selectedCategories; }
    else if (activeViz.vizType === 'chord') { vizProps.view = chordView; }
    else if (activeViz.vizType === 'heatmap') { vizProps.view = heatmapView; vizProps.colorMode = heatmapColorMode; }
    else if (activeViz.vizType === 'stream') { vizProps.view = streamView; }
    else if (activeViz.vizType === 'swarm') { vizProps.view = swarmView; }
    else if (activeViz.vizType === 'radar') { vizProps.selectedTechIds = selectedTechIds; vizProps.selectedDimensions = selectedDimensions; }
    else if (activeViz.vizType === 'parallel') { vizProps.dimensions = parallelDimensions; }

    return (
      <Suspense fallback={<VizLoadingPlaceholder />}>
        <VizComponent {...vizProps} />
      </Suspense>
    );
  };

  // Controls content
  const renderControlsContent = () => {
    // Toolkit visuals (stakeholder, innovation tracker, CPC) or Unified visuals - use their controls renderer
    if ((isToolkitStakeholder || isInnovationTracker || isCPCVisual || isUnifiedVisual) && toolkitControlsRenderer?.render) {
      return <div className="toolkit-controls p-4">{toolkitControlsRenderer.render()}</div>;
    }

    // Standard Navigate visuals - use registry
    if (hasRegistryControls) {
      return <div className="p-4"><VisualizationControlSections activeViz={activeViz!.vizType!} context={controlContext} /></div>;
    }

    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        <SlidersHorizontal className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No controls available</p>
      </div>
    );
  };

  // Insights content (upper part of Intelligence panel)
  const renderInsightsBody = () => {
    // Toolkit stakeholder visuals - use StakeholderInsightPanel
    if (isToolkitStakeholder) {
      return (
        <div className="p-4">
          <StakeholderInsightPanel
            selectedNode={selectedNode}
            relatedEntities={relatedEntities}
            onSelectNodeAction={setSelectedEntityId}
            emptyState="Click any node in the graph to view its details, connections, and related entities."
          />
        </div>
      );
    }

    // Innovation Tracker - use their insights renderer
    if (isInnovationTracker && toolkitInsightsRenderer?.render) {
      return <div className="p-4">{toolkitInsightsRenderer.render()}</div>;
    }

    // CPC Domain visuals - use their insights renderer
    if (isCPCVisual && toolkitInsightsRenderer?.render) {
      return <div className="p-4">{toolkitInsightsRenderer.render()}</div>;
    }

    // Unified visuals (Network Graph V8) - use their insights renderer
    if (isUnifiedVisual && toolkitInsightsRenderer?.render) {
      return <div className="p-4">{toolkitInsightsRenderer.render()}</div>;
    }

    // Standard - generic insights
    return (
      <div className="p-4">
        <div className="rounded-xl bg-gradient-to-br from-[#0f8b8d]/10 to-[#0f8b8d]/5 p-4">
          <p className="text-xs uppercase tracking-wider text-[#0f8b8d]/70">Explore</p>
          <h3 className="text-base font-semibold text-[#0f8b8d]">NAVIGATE Data</h3>
          <p className="text-xs text-[#0f8b8d]/80 mt-1">Interact with the visualization to see insights.</p>
        </div>
      </div>
    );
  };

  const renderInsightsContent = () => {
    // In gallery mode there is no active visualization; just show insights shell
    if (!activeViz) {
      return (
        <UnifiedIntelligencePanel
          datasetLabel="Visual Library"
          visualizationType="library"
          useNavigateData={false}
          customInsightsContent={renderInsightsBody()}
          className="h-full"
        />
      );
    }

    // Map toolkit stakeholder selection into UnifiedIntelligencePanel types
    const selectedEntityForPanel = intelligenceSelectedEntity ?? undefined;
    const relatedForPanel =
      isToolkitStakeholder && relatedEntities.length
        ? relatedEntities.map((node) => ({
            id: (node as any).id ?? (node as any).name,
            name: (node as any).name ?? (node as any).id,
            type: 'stakeholder',
          }))
        : [];

    return (
      <UnifiedIntelligencePanel
        selectedEntity={selectedEntityForPanel}
        relatedEntities={relatedForPanel}
        datasetLabel={activeViz.name}
        visualizationType={activeViz.vizType ?? activeViz.id}
        useNavigateData={true}
        customInsightsContent={renderInsightsBody()}
        className="h-full"
        chatMessages={chatMessages}
        onChatMessagesChange={setChatMessages}
      />
    );
  };

  return (
    <div className={clsx('h-screen bg-slate-50 flex flex-col', isFullscreen && 'fixed inset-0 z-50')}>
      {!isFullscreen && <TopNavigation />}
      {!isFullscreen && <UnifiedFloatingNav currentPage="visualisations" />}

      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={handleBackToGallery} className="flex items-center gap-1 text-gray-500 hover:text-[#006E51] transition-colors">
            <ChevronLeft className="h-4 w-4" /><span className="text-sm font-medium">Library</span>
          </button>
          {activeViz && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">{activeViz.name}</span>
              {activeViz.isToolkitVisual && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Toolkit</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <LayoutSwitcher layout={layoutMode} onLayoutChange={setLayoutMode} />
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button onClick={handleBackToGallery} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Back to Gallery">
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ====================================================================== */}
      {/* FLOATING LAYOUT */}
      {/* ====================================================================== */}
      {layoutMode === 'floating' && (
        <div ref={workspaceRef} className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0">{renderVisualization()}</div>
          <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
            <button onClick={() => setControlsPanelOpen(!controlsPanelOpen)} className={clsx('flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all', controlsPanelOpen ? 'bg-white text-[#006E51] border-white' : 'bg-white/70 text-gray-500 hover:bg-white border-white/50')} title="Controls"><SlidersHorizontal className="h-5 w-5" /></button>
            <button onClick={() => setIntelligencePanelOpen(!intelligencePanelOpen)} className={clsx('flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all', intelligencePanelOpen ? 'bg-white text-[#0f8b8d] border-white' : 'bg-white/70 text-gray-500 hover:bg-white border-white/50')} title="Insights"><Sparkles className="h-5 w-5" /></button>
          </div>
          {controlsPanelOpen && (
            <DraggablePanel id="controls" title="Controls" icon={SlidersHorizontal} accent="#006E51" initialPosition={{ x: 20, y: 70 }} initialSize={{ width: 340, height: 500 }} minWidth={300} maxWidth={500} minHeight={200} maxHeight={700} onClose={() => setControlsPanelOpen(false)} onCollapse={() => setControlsPanelOpen(false)}>
              {renderControlsContent()}
            </DraggablePanel>
          )}
          {intelligencePanelOpen && (
            <DraggablePanel
              id="insights"
              title="Insights"
              icon={Sparkles}
              accent="#0f8b8d"
              initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 380 : 400, y: 70 }}
              initialSize={{ width: 340, height: defaultInsightsPanelHeight }}
              minWidth={300}
              maxWidth={500}
              minHeight={300}
              maxHeight={700}
              onClose={() => setIntelligencePanelOpen(false)}
              onCollapse={() => setIntelligencePanelOpen(false)}
            >
              {renderInsightsContent()}
            </DraggablePanel>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* SIDEBAR LAYOUT */}
      {/* ====================================================================== */}
      {layoutMode === 'sidebar' && (
        <div className="flex-1 flex relative overflow-hidden">
          {!controlsPanelPinned && !controlsHovered && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-[#006E51]/30 hover:bg-[#006E51]/60 hover:w-2 transition-all cursor-pointer rounded-r-full z-40" onMouseEnter={() => setControlsHovered(true)} />
          )}
          <div className={clsx('absolute left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 z-30 flex flex-col', (controlsPanelPinned || controlsHovered) ? 'translate-x-0' : '-translate-x-full')} onMouseEnter={() => setControlsHovered(true)} onMouseLeave={() => !controlsPanelPinned && setControlsHovered(false)}>
            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-[#006E51]/5 flex-shrink-0">
              <div className="flex items-center gap-2 text-[#006E51]"><SlidersHorizontal className="h-4 w-4" /><span className="text-sm font-semibold">Controls</span></div>
              <button onClick={() => setControlsPanelPinned(!controlsPanelPinned)} className={clsx('p-1.5 rounded transition-colors', controlsPanelPinned ? 'bg-[#006E51] text-white' : 'text-gray-400 hover:bg-gray-100')} title={controlsPanelPinned ? 'Unpin' : 'Pin'}>
                {controlsPanelPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderControlsContent()}</div>
          </div>
          <div className={clsx('flex-1 min-h-0 transition-all duration-300 overflow-hidden', controlsPanelPinned ? 'ml-80' : 'ml-0')}>
            {renderVisualization()}
          </div>
          <aside className="w-80 border-l border-gray-200 bg-white flex-shrink-0 flex flex-col">
            <div className="flex-1 min-h-0">
              {renderInsightsContent()}
            </div>
          </aside>
        </div>
      )}

      {/* ====================================================================== */}
      {/* COMPACT LAYOUT */}
      {/* ====================================================================== */}
      {layoutMode === 'compact' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 relative overflow-hidden">
            {renderVisualization()}
            <div className="absolute right-4 top-4 bottom-4 w-72 z-20">
              <div className="h-full rounded-xl bg-white/95 backdrop-blur-lg shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                {renderInsightsContent()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
