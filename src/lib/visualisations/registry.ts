import { 
  Network, GitBranch, BarChart3, Layers, Zap, Clock, TrendingUp, Grid3X3,
  Activity, PieChart, Users, Target, Workflow, CircleDot, Boxes, Gauge,
  LayoutGrid, TreeDeciduous, Sun, ArrowRightLeft, Sparkles, Globe, Orbit,
  Box, Radar, BarChart2, Flame, GitMerge, CircleDashed, Hexagon, Waves,
  Waypoints, Share2, Cpu, Atom, Microscope
} from 'lucide-react';
import type { VisualizationConfig, Domain, ControlDefinition } from './types';

// =============================================================================
// SHARED CONTROL DEFINITIONS
// =============================================================================

export const trlRangeControl: ControlDefinition = {
  id: 'trlRange',
  type: 'range',
  label: 'TRL Range',
  description: 'Filter by Technology Readiness Level',
  group: 'filters',
  domains: ['navigate'],
  min: 1,
  max: 9,
  step: 1,
  defaultValue: [1, 9],
  aiHint: 'TRL 1-3 is early research, 4-6 is development/validation, 7-9 is deployment ready.',
};

export const domainSelectorControl: ControlDefinition = {
  id: 'activeDomain',
  type: 'segmented',
  label: 'Domain',
  description: 'Filter data by domain',
  group: 'data',
  options: [
    { value: 'all', label: 'All Domains' },
    { value: 'atlas', label: 'Atlas' },
    { value: 'navigate', label: 'Navigate' },
    { value: 'cpc', label: 'CPC' },
  ],
  defaultValue: 'all',
  aiHint: 'Switch between domains to see domain-specific data.',
};

// =============================================================================
// HELPER: Create minimal config for quick entries
// =============================================================================

function createVizConfig(
  id: string,
  name: string,
  description: string,
  opts: {
    domains: Domain[];
    category: VisualizationConfig['category'];
    status: VisualizationConfig['status'];
    icon: VisualizationConfig['icon'];
    tags?: string[];
    componentPath?: string; // For dynamic import reference
    demoOption?: any;
  }
): VisualizationConfig {
  return {
    id,
    name,
    description,
    domains: opts.domains,
    category: opts.category,
    status: opts.status,
    icon: opts.icon,
    tags: opts.tags || [],
    controls: [],
    defaultState: {},
    demoOption: opts.demoOption,
    Component: null as any, // Lazy loaded
  };
}

// =============================================================================
// NETWORK GRAPH VERSIONS - Each as individual card
// =============================================================================

const networkGraphConfigs: VisualizationConfig[] = [
  createVizConfig('network-graph-base', 'Network Graph (Base)', 'Original force-directed network graph', {
    domains: ['atlas'],
    category: 'Network',
    status: 'ready',
    icon: Network,
    tags: ['network', 'graph', 'force-directed', 'atlas', 'base'],
  }),
  
  createVizConfig('network-graph-demo', 'Network Graph Demo', 'Demo version with sample data', {
    domains: ['atlas'],
    category: 'Network',
    status: 'development',
    icon: Network,
    tags: ['network', 'demo', 'sample'],
  }),
  
  createVizConfig('network-graph-demo-v5', 'Network Graph V5', 'Version 5 with enhanced clustering', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Network',
    status: 'ready',
    icon: Orbit,
    tags: ['network', 'v5', 'clustering', 'unified'],
  }),
  
  createVizConfig('network-graph-demo-v6', 'Network Graph V6', 'Version 6 with floating panels UI', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Network',
    status: 'ready',
    icon: Sparkles,
    tags: ['network', 'v6', 'panels', 'unified', 'ai-chat'],
  }),
  
  createVizConfig('network-graph-v7', 'Network Graph V7', 'Latest version with advanced features', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Network',
    status: 'development',
    icon: Atom,
    tags: ['network', 'v7', 'latest', 'experimental'],
  }),

  createVizConfig('network-graph-v8', 'Network Graph V8', 'V6 layout with V7 controls and AI insights', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Network',
    status: 'development',
    icon: Sparkles,
    tags: ['network', 'v8', 'ai', 'insights', 'unified'],
  }),
  
  createVizConfig('network-graph-demo-nested', 'Network Graph (Nested)', 'Nested clustering visualization', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Network',
    status: 'ready',
    icon: Hexagon,
    tags: ['network', 'nested', 'hierarchy', 'clustering'],
  }),
  
  createVizConfig('network-graph-demo-clustered', 'Network Graph (Clustered)', 'Force-clustered layout', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Network',
    status: 'ready',
    icon: CircleDashed,
    tags: ['network', 'clustered', 'grouped'],
  }),
];

// =============================================================================
// UNIFIED NETWORK GRAPHS
// =============================================================================

const unifiedNetworkConfigs: VisualizationConfig[] = [
  createVizConfig('unified-network-graph', 'Unified Network Graph', 'Cross-domain unified network visualization', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Network',
    status: 'ready',
    icon: Globe,
    tags: ['unified', 'network', 'cross-domain', '2d'],
  }),
  
  createVizConfig('unified-network-graph-nested', 'Unified Network (Nested)', 'Nested hierarchy unified network', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Network',
    status: 'ready',
    icon: Layers,
    tags: ['unified', 'nested', 'hierarchy'],
  }),
  
  createVizConfig('unified-network-graph-clustered', 'Unified Network (Clustered)', 'Clustered unified network', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Network',
    status: 'ready',
    icon: Share2,
    tags: ['unified', 'clustered', 'grouped'],
  }),
  
  createVizConfig('unified-network-graph-d3', 'Unified Network (D3)', 'D3.js implementation of unified network', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Network',
    status: 'development',
    icon: Microscope,
    tags: ['unified', 'd3', 'experimental'],
  }),
];

// =============================================================================
// D3 NETWORK VARIANTS
// =============================================================================

const d3NetworkConfigs: VisualizationConfig[] = [
  createVizConfig('network-graph-d3', 'Network Graph (D3)', 'D3.js force-directed implementation', {
    domains: ['atlas', 'navigate'],
    category: 'Network',
    status: 'development',
    icon: Cpu,
    tags: ['d3', 'network', 'force-directed'],
  }),
  
  createVizConfig('d3-network-graph-unified', 'D3 Network (Unified)', 'Unified D3 network graph', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Network',
    status: 'development',
    icon: Waypoints,
    tags: ['d3', 'unified', 'network'],
  }),
  
  createVizConfig('d3-network-graph-universal', 'D3 Network (Universal)', 'Universal D3 network implementation', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Network',
    status: 'development',
    icon: Globe,
    tags: ['d3', 'universal', 'network'],
  }),
  
  createVizConfig('d3-network-graph-toolkit', 'D3 Network (Toolkit)', 'Toolkit-specific D3 network', {
    domains: ['navigate'],
    category: 'Network',
    status: 'development',
    icon: Box,
    tags: ['d3', 'toolkit', 'navigate'],
  }),
  
  createVizConfig('network-graph-echarts', 'Network Graph (ECharts)', 'ECharts implementation', {
    domains: ['atlas', 'navigate'],
    category: 'Network',
    status: 'development',
    icon: BarChart2,
    tags: ['echarts', 'network', 'chart-library'],
  }),
];

// =============================================================================
// NAVIGATE TOOLKIT VISUALS
// =============================================================================

const navigateToolkitConfigs: VisualizationConfig[] = [
  createVizConfig('network-graph-navigate', 'Network Graph (Navigate)', 'Navigate-specific network graph', {
    domains: ['navigate'],
    category: 'Network',
    status: 'ready',
    icon: Network,
    tags: ['navigate', 'network', 'toolkit'],
  }),
  
  createVizConfig('network-graph-navigate-3d', 'Network Graph 3D (Navigate)', '3D network visualization', {
    domains: ['navigate'],
    category: 'Network',
    status: 'ready',
    icon: Box,
    tags: ['navigate', '3d', 'network', 'immersive'],
  }),
  
  createVizConfig('sankey-chart-navigate', 'Sankey Flow (Navigate)', 'Funding flow Sankey diagram', {
    domains: ['navigate'],
    category: 'Flow',
    status: 'ready',
    icon: GitBranch,
    tags: ['sankey', 'funding', 'flow', 'navigate'],
    demoOption: {
      animation: true,
      series: [{
        type: 'sankey',
        layout: 'none',
        nodeWidth: 12,
        nodeGap: 8,
        data: [
          { name: 'Gov', itemStyle: { color: '#006E51' } },
          { name: 'Tech', itemStyle: { color: '#4A90E2' } },
        ],
        links: [{ source: 'Gov', target: 'Tech', value: 30 }],
        lineStyle: { color: 'gradient', opacity: 0.4 },
        label: { show: false },
      }],
    },
  }),
  
  createVizConfig('heatmap-navigate', 'Heatmap (Navigate)', 'Navigate-specific heatmap', {
    domains: ['navigate'],
    category: 'Matrix',
    status: 'ready',
    icon: Grid3X3,
    tags: ['heatmap', 'matrix', 'navigate'],
    demoOption: {
      animation: true,
      grid: { top: 0, right: 0, bottom: 0, left: 0 },
      xAxis: { type: 'category', data: ['A', 'B', 'C'], show: false },
      yAxis: { type: 'category', data: ['1', '2'], show: false },
      visualMap: { show: false, min: 0, max: 10, inRange: { color: ['#CCE2DC', '#006E51'] } },
      series: [{ type: 'heatmap', data: [[0,0,5],[1,0,8],[2,0,3],[0,1,7],[1,1,4],[2,1,9]], label: { show: false } }],
    },
  }),
  
  createVizConfig('radar-chart-navigate', 'Radar Chart (Navigate)', 'Multi-dimensional comparison radar', {
    domains: ['navigate'],
    category: 'Comparison',
    status: 'ready',
    icon: Radar,
    tags: ['radar', 'comparison', 'navigate', 'maturity'],
    demoOption: {
      animation: true,
      radar: { indicator: [{name:'',max:10},{name:'',max:10},{name:'',max:10},{name:'',max:10},{name:'',max:10}], radius: '60%' },
      series: [{ type: 'radar', data: [{ value: [8,6,7,5,9], areaStyle: { color: 'rgba(0,110,81,0.3)' } }] }],
    },
  }),
  
  createVizConfig('bar-chart-navigate', 'Bar Chart (Navigate)', 'Category comparison bar chart', {
    domains: ['navigate'],
    category: 'Comparison',
    status: 'ready',
    icon: BarChart3,
    tags: ['bar', 'comparison', 'navigate'],
    demoOption: {
      animation: true,
      grid: { top: 10, right: 10, bottom: 10, left: 10 },
      xAxis: { type: 'category', data: ['A','B','C','D'], show: false },
      yAxis: { type: 'value', show: false },
      series: [{ type: 'bar', data: [45,32,28,18], barWidth: '50%', itemStyle: { color: '#006E51' } }],
    },
  }),
  
  createVizConfig('treemap-navigate', 'Treemap (Navigate)', 'Hierarchical treemap visualization', {
    domains: ['navigate'],
    category: 'Hierarchy',
    status: 'ready',
    icon: Boxes,
    tags: ['treemap', 'hierarchy', 'navigate'],
    demoOption: {
      animation: true,
      series: [{ type: 'treemap', roam: false, nodeClick: false, breadcrumb: { show: false }, data: [
        { name: 'A', value: 40, itemStyle: { color: '#006E51' } },
        { name: 'B', value: 30, itemStyle: { color: '#4A90E2' } },
        { name: 'C', value: 20, itemStyle: { color: '#50C878' } },
      ], label: { show: false } }],
    },
  }),
  
  createVizConfig('circle-packing-navigate', 'Circle Packing (Navigate)', 'Nested circle packing hierarchy', {
    domains: ['navigate'],
    category: 'Hierarchy',
    status: 'ready',
    icon: CircleDot,
    tags: ['circle-packing', 'hierarchy', 'navigate'],
  }),
  
  createVizConfig('chord-diagram-navigate', 'Chord Diagram (Navigate)', 'Relationship chord diagram', {
    domains: ['navigate'],
    category: 'Network',
    status: 'ready',
    icon: Orbit,
    tags: ['chord', 'relationships', 'navigate'],
  }),
  
  createVizConfig('stream-graph-navigate', 'Stream Graph (Navigate)', 'Temporal stream visualization', {
    domains: ['navigate'],
    category: 'Timeline',
    status: 'ready',
    icon: Waves,
    tags: ['stream', 'timeline', 'navigate', 'temporal'],
    demoOption: {
      animation: true,
      grid: { top: 5, right: 5, bottom: 5, left: 5 },
      xAxis: { type: 'category', data: ['2020','2021','2022','2023'], show: false, boundaryGap: false },
      yAxis: { type: 'value', show: false },
      series: [
        { type: 'line', stack: 'T', areaStyle: { color: '#006E51', opacity: 0.8 }, data: [10,15,20,25], smooth: true, symbol: 'none' },
        { type: 'line', stack: 'T', areaStyle: { color: '#4A90E2', opacity: 0.8 }, data: [8,12,18,22], smooth: true, symbol: 'none' },
      ],
    },
  }),
  
  createVizConfig('bump-chart-navigate', 'Bump Chart (Navigate)', 'Ranking changes over time', {
    domains: ['navigate'],
    category: 'Timeline',
    status: 'ready',
    icon: TrendingUp,
    tags: ['bump', 'ranking', 'timeline', 'navigate'],
  }),
  
  createVizConfig('swarm-plot-navigate', 'Swarm Plot (Navigate)', 'Beeswarm distribution plot', {
    domains: ['navigate'],
    category: 'Distribution',
    status: 'ready',
    icon: CircleDot,
    tags: ['swarm', 'beeswarm', 'distribution', 'navigate'],
    demoOption: {
      animation: true,
      grid: { top: 10, right: 10, bottom: 10, left: 10 },
      xAxis: { type: 'value', min: 0, max: 10, show: false },
      yAxis: { type: 'value', min: -2, max: 2, show: false },
      series: [{ type: 'scatter', symbolSize: 8, data: [[1,0.2],[2,-0.3],[3,0.1],[4,0.4],[5,-0.2],[6,0.3],[7,0.1],[8,-0.3],[9,0.2]], itemStyle: { color: '#006E51', opacity: 0.7 } }],
    },
  }),
  
  createVizConfig('timeline-navigate', 'Timeline (Navigate)', 'Event timeline visualization', {
    domains: ['navigate'],
    category: 'Timeline',
    status: 'ready',
    icon: Clock,
    tags: ['timeline', 'events', 'navigate'],
  }),
  
  createVizConfig('bubble-scatter-navigate', 'Bubble Scatter (Navigate)', 'Bubble scatter plot', {
    domains: ['navigate'],
    category: 'Comparison',
    status: 'ready',
    icon: CircleDot,
    tags: ['bubble', 'scatter', 'navigate'],
  }),
];

// =============================================================================
// ATLAS VISUALS
// =============================================================================

const atlasConfigs: VisualizationConfig[] = [
  createVizConfig('sankey-chart-atlas', 'Sankey Chart (Atlas)', 'Challenge flow Sankey diagram', {
    domains: ['atlas'],
    category: 'Flow',
    status: 'ready',
    icon: GitBranch,
    tags: ['sankey', 'flow', 'atlas', 'challenges'],
    demoOption: {
      animation: true,
      series: [{
        type: 'sankey',
        layout: 'none',
        nodeWidth: 12,
        nodeGap: 8,
        data: [
          { name: 'Rail', itemStyle: { color: '#3b82f6' } },
          { name: 'Energy', itemStyle: { color: '#22c55e' } },
          { name: 'Critical', itemStyle: { color: '#ef4444' } },
        ],
        links: [
          { source: 'Rail', target: 'Critical', value: 20 },
          { source: 'Energy', target: 'Critical', value: 15 },
        ],
        lineStyle: { color: 'gradient', opacity: 0.4 },
        label: { show: false },
      }],
    },
  }),
  
  createVizConfig('heatmap-chart-atlas', 'Heatmap Chart (Atlas)', 'Challenge intensity heatmap', {
    domains: ['atlas'],
    category: 'Matrix',
    status: 'ready',
    icon: Grid3X3,
    tags: ['heatmap', 'intensity', 'atlas', 'challenges'],
    demoOption: {
      animation: true,
      grid: { top: 0, right: 0, bottom: 0, left: 0 },
      xAxis: { type: 'category', data: ['Rail','Energy','Transport'], show: false },
      yAxis: { type: 'category', data: ['Tech','Ops','Policy'], show: false },
      visualMap: { show: false, min: 0, max: 10, inRange: { color: ['#CCE2DC', '#006E51'] } },
      series: [{ type: 'heatmap', data: [[0,0,8],[1,0,5],[2,0,7],[0,1,3],[1,1,9],[2,1,4],[0,2,6],[1,2,2],[2,2,8]], label: { show: false } }],
    },
  }),
  
  createVizConfig('sunburst-chart-atlas', 'Sunburst Chart (Atlas)', 'Hierarchical sunburst visualization', {
    domains: ['atlas'],
    category: 'Hierarchy',
    status: 'ready',
    icon: Sun,
    tags: ['sunburst', 'hierarchy', 'atlas'],
    demoOption: {
      animation: true,
      series: [{
        type: 'sunburst',
        radius: ['15%', '90%'],
        data: [
          { name: 'Rail', value: 30, itemStyle: { color: '#3b82f6' }, children: [
            { name: 'A', value: 15, itemStyle: { color: '#60a5fa' } },
            { name: 'B', value: 15, itemStyle: { color: '#93c5fd' } },
          ]},
          { name: 'Energy', value: 25, itemStyle: { color: '#22c55e' } },
        ],
        label: { show: false },
      }],
    },
  }),
  
  createVizConfig('chord-diagram-atlas', 'Chord Diagram (Atlas)', 'Challenge relationship chords', {
    domains: ['atlas'],
    category: 'Network',
    status: 'ready',
    icon: Orbit,
    tags: ['chord', 'relationships', 'atlas'],
  }),
];

// =============================================================================
// CPC VISUALS
// =============================================================================

const cpcConfigs: VisualizationConfig[] = [
  createVizConfig('stage-pipeline', 'Stage Pipeline', 'CPC initiative stage gates', {
    domains: ['cpc'],
    category: 'Flow',
    status: 'ready',
    icon: Workflow,
    tags: ['pipeline', 'stages', 'cpc', 'initiatives'],
    demoOption: {
      animation: true,
      grid: { top: 10, right: 10, bottom: 10, left: 10 },
      xAxis: { type: 'category', data: ['S1','S2','S3','S4'], show: false },
      yAxis: { type: 'value', show: false },
      series: [{ type: 'bar', data: [12,8,5,3], barWidth: '60%', itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#F5A623' },{ offset: 1, color: '#006E51' }] } } }],
    },
  }),
  
  createVizConfig('portfolio-treemap', 'Portfolio Treemap', 'CPC portfolio hierarchy', {
    domains: ['cpc'],
    category: 'Hierarchy',
    status: 'ready',
    icon: Boxes,
    tags: ['treemap', 'portfolio', 'cpc', 'themes'],
    demoOption: {
      animation: true,
      series: [{ type: 'treemap', roam: false, nodeClick: false, breadcrumb: { show: false }, data: [
        { name: 'Theme A', value: 35, itemStyle: { color: '#F5A623' } },
        { name: 'Theme B', value: 28, itemStyle: { color: '#E67E22' } },
        { name: 'Theme C', value: 22, itemStyle: { color: '#D35400' } },
      ], label: { show: false } }],
    },
  }),
  
  createVizConfig('stakeholder-sunburst', 'Stakeholder Sunburst', 'CPC stakeholder hierarchy', {
    domains: ['cpc'],
    category: 'Hierarchy',
    status: 'ready',
    icon: Sun,
    tags: ['sunburst', 'stakeholders', 'cpc', 'influence'],
    demoOption: {
      animation: true,
      series: [{
        type: 'sunburst',
        radius: ['15%', '90%'],
        data: [
          { name: 'Gov', value: 30, itemStyle: { color: '#F5A623' }, children: [
            { name: 'A', value: 15, itemStyle: { color: '#F7B84B' } },
            { name: 'B', value: 15, itemStyle: { color: '#F9CA73' } },
          ]},
          { name: 'Ind', value: 25, itemStyle: { color: '#E67E22' } },
        ],
        label: { show: false },
      }],
    },
  }),
  
  createVizConfig('stakeholder-network-cpc', 'Stakeholder Network (CPC)', 'CPC stakeholder relationships', {
    domains: ['cpc'],
    category: 'Network',
    status: 'ready',
    icon: Users,
    tags: ['network', 'stakeholders', 'cpc', 'relationships'],
  }),
  
  createVizConfig('focus-area-matrix', 'Focus Area Matrix', 'Strategic priority matrix', {
    domains: ['cpc'],
    category: 'Matrix',
    status: 'ready',
    icon: Target,
    tags: ['matrix', 'strategic', 'cpc', 'priorities'],
    demoOption: {
      animation: true,
      grid: { top: 10, right: 10, bottom: 10, left: 10 },
      xAxis: { type: 'value', min: 0, max: 10, show: false },
      yAxis: { type: 'value', min: 0, max: 10, show: false },
      series: [{ type: 'scatter', symbolSize: 20, data: [
        { value: [2,8], itemStyle: { color: '#006E51' } },
        { value: [8,7], itemStyle: { color: '#4A90E2' } },
        { value: [3,3], itemStyle: { color: '#F5A623' } },
        { value: [7,2], itemStyle: { color: '#E74C3C' } },
      ] }],
    },
  }),
];

// =============================================================================
// CROSS-DOMAIN / EXPERIMENTAL VISUALS
// =============================================================================

const crossDomainConfigs: VisualizationConfig[] = [
  createVizConfig('treemap-sunburst-transition', 'Treemap ↔ Sunburst', 'Animated treemap/sunburst morph', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Hierarchy',
    status: 'ready',
    icon: ArrowRightLeft,
    tags: ['treemap', 'sunburst', 'transition', 'animation'],
    demoOption: {
      animation: true,
      series: [{ type: 'sunburst', radius: ['20%','85%'], data: [
        { name: 'A', value: 40, itemStyle: { color: '#006E51' } },
        { name: 'B', value: 30, itemStyle: { color: '#4A90E2' } },
        { name: 'C', value: 20, itemStyle: { color: '#50C878' } },
      ], label: { show: false } }],
    },
  }),
  
  createVizConfig('treemap-sunburst-explorer', 'Treemap/Sunburst Explorer', 'Interactive hierarchy explorer', {
    domains: ['atlas', 'navigate'],
    category: 'Hierarchy',
    status: 'ready',
    icon: TreeDeciduous,
    tags: ['treemap', 'sunburst', 'explorer', 'drill-down'],
  }),
  
  createVizConfig('pie-donut-chart', 'Pie / Donut Chart', 'Proportional segments visualization', {
    domains: ['atlas', 'navigate', 'cpc'],
    category: 'Distribution',
    status: 'ready',
    icon: PieChart,
    tags: ['pie', 'donut', 'proportions'],
    demoOption: {
      animation: true,
      series: [{ type: 'pie', radius: ['40%','70%'], data: [
        { value: 35, name: 'A', itemStyle: { color: '#006E51' } },
        { value: 28, name: 'B', itemStyle: { color: '#4A90E2' } },
        { value: 22, name: 'C', itemStyle: { color: '#50C878' } },
        { value: 15, name: 'D', itemStyle: { color: '#F5A623' } },
      ], label: { show: false } }],
    },
  }),
  
  createVizConfig('gauge-chart', 'Gauge Chart', 'KPI gauge visualization', {
    domains: ['cpc', 'navigate'],
    category: 'Comparison',
    status: 'ready',
    icon: Gauge,
    tags: ['gauge', 'kpi', 'metrics'],
    demoOption: {
      animation: true,
      series: [{
        type: 'gauge',
        radius: '90%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        axisLine: { lineStyle: { width: 15, color: [[0.3,'#E74C3C'],[0.7,'#F5A623'],[1,'#006E51']] } },
        pointer: { show: true, length: '60%', width: 4 },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { show: false },
        data: [{ value: 72 }],
      }],
    },
  }),
  
  createVizConfig('trend-line-chart', 'Trend Line Chart', 'Time series trend visualization', {
    domains: ['navigate', 'cpc'],
    category: 'Timeline',
    status: 'ready',
    icon: TrendingUp,
    tags: ['line', 'trend', 'time-series'],
    demoOption: {
      animation: true,
      grid: { top: 10, right: 10, bottom: 10, left: 10 },
      xAxis: { type: 'category', data: ['Q1','Q2','Q3','Q4'], show: false, boundaryGap: false },
      yAxis: { type: 'value', show: false },
      series: [{ type: 'line', data: [20,35,45,60], smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#006E51', width: 3 }, itemStyle: { color: '#006E51' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,110,81,0.3)' },{ offset: 1, color: 'rgba(0,110,81,0.05)' }] } } }],
    },
  }),
];

// =============================================================================
// REGISTRY - Combine all configs
// =============================================================================

const allConfigs: VisualizationConfig[] = [
  ...networkGraphConfigs,
  ...unifiedNetworkConfigs,
  ...d3NetworkConfigs,
  ...navigateToolkitConfigs,
  ...atlasConfigs,
  ...cpcConfigs,
  ...crossDomainConfigs,
];

export const visualizationRegistry = new Map<string, VisualizationConfig>(
  allConfigs.map(config => [config.id, config])
);

// =============================================================================
// HELPERS
// =============================================================================

export function getVisualization(id: string): VisualizationConfig | undefined {
  return visualizationRegistry.get(id);
}

export function getVisualizationsForDomain(domain: Domain): VisualizationConfig[] {
  return Array.from(visualizationRegistry.values()).filter(
    (viz) => viz.domains.includes(domain)
  );
}

export function getControlsForDomain(
  controls: ControlDefinition[],
  domain: Domain | 'all'
): ControlDefinition[] {
  if (domain === 'all') return controls;
  return controls.filter((c) => !c.domains || c.domains.includes(domain));
}

export function getAllVisualizations(): VisualizationConfig[] {
  return Array.from(visualizationRegistry.values());
}

export function getVisualizationsByCategory(): Record<string, VisualizationConfig[]> {
  const grouped: Record<string, VisualizationConfig[]> = {};
  for (const viz of visualizationRegistry.values()) {
    const cat = viz.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(viz);
  }
  return grouped;
}

export type { VisualizationConfig, Domain, ControlDefinition, ControlState } from './types';
