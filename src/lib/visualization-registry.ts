import {
  BarChart3,
  Network,
  Zap,
  Sun,
  GitBranch,
} from "lucide-react"

export type VisualizationType =
  | "sankey"
  | "heatmap"
  | "network"
  | "network3d"
  | "unifiednetwork"
  | "sunburst"
  | "chord"
  | "radar"
  | "bar"
  | "circle"
  | "bump"
  | "treemap"
  | "stream"
  | "parallel"
  | "swarm"
  | "focusareamatrix"
  | "stagepipeline"
  | "stakeholdernetwork"
  | "portfoliotreemap"
  | "stakeholdersunburst"
  | "treemapsunburstransition"

export type VizCategory =
  | "network"
  | "hierarchy"
  | "flow"
  | "matrix"
  | "comparison"
  | "experimental"

export type VizStatus = "ready" | "experimental" | "archived"

// High-level domain tags for filtering. We can refine these over time.
export type VizDomain =
  | "atlas"
  | "navigate"
  | "cpc"
  | "all"
  | "tbd"

export interface VisualizationDefinition {
  id: VisualizationType
  name: string
  description: string
  icon: typeof BarChart3
  color: string
  category: VizCategory
  status: VizStatus
  domains: VizDomain[]
  // Optional future fields: version, preview config id, etc.
}

export const VISUALIZATIONS: VisualizationDefinition[] = [
  {
    id: "sankey",
    name: "Flow Analysis",
    description: "Challenge progression and resource flows",
    icon: GitBranch,
    color: "#006E51",
    category: "flow",
    status: "ready",
    domains: ["all"],
  },
  {
    id: "radar",
    name: "Tech Maturity Radar",
    description: "Compare technology readiness across dimensions",
    icon: Zap,
    color: "#8b5cf6",
    category: "comparison",
    status: "ready",
    domains: ["navigate"],
  },
  {
    id: "bar",
    name: "Bar Chart Analysis",
    description: "Funding, projects, and technology breakdowns",
    icon: BarChart3,
    color: "#4A90E2",
    category: "matrix",
    status: "ready",
    domains: ["all"],
  },
  {
    id: "circle",
    name: "Circle Packing",
    description: "Hierarchical stakeholder and technology relationships",
    icon: Sun,
    color: "#50C878",
    category: "hierarchy",
    status: "ready",
    domains: ["all"],
  },
  {
    id: "bump",
    name: "TRL Progression",
    description: "Technology readiness level advancement over time",
    icon: BarChart3,
    color: "#EC4899",
    category: "comparison",
    status: "ready",
    domains: ["navigate"],
  },
  {
    id: "treemap",
    name: "Funding Breakdown",
    description: "Hierarchical funding distribution and budgets",
    icon: BarChart3,
    color: "#F5A623",
    category: "hierarchy",
    status: "ready",
    domains: ["all"],
  },
  {
    id: "heatmap",
    name: "Intensity Map",
    description: "Challenge density and hotspots",
    icon: BarChart3,
    color: "#4A90E2",
    category: "matrix",
    status: "ready",
    domains: ["all"],
  },
  {
    id: "network",
    name: "Network Graph",
    description: "Connections and relationships",
    icon: Network,
    color: "#50C878",
    category: "network",
    status: "ready",
    domains: ["atlas"],
  },
  {
    id: "network3d",
    name: "Network Graph 3D",
    description: "3D interactive network visualization",
    icon: Network,
    color: "#006E51",
    category: "network",
    status: "ready",
    domains: ["atlas"],
  },
  {
    id: "unifiednetwork",
    name: "Unified Network (2D)",
    description: "Cross-domain network from unified schema",
    icon: Network,
    color: "#10B981",
    category: "network",
    status: "ready",
    domains: ["all"],
  },
  {
    id: "sunburst",
    name: "Hierarchical View",
    description: "Multi-level challenge breakdown",
    icon: Sun,
    color: "#F5A623",
    category: "hierarchy",
    status: "ready",
    domains: ["atlas"],
  },
  {
    id: "chord",
    name: "Relationship Matrix",
    description: "Cross-sector dependencies",
    icon: Zap,
    color: "#8b5cf6",
    category: "network",
    status: "ready",
    domains: ["atlas"],
  },
  {
    id: "stream",
    name: "Funding Trends",
    description: "Funding flows over time",
    icon: BarChart3,
    color: "#10B981",
    category: "flow",
    status: "ready",
    domains: ["all"],
  },
  {
    id: "swarm",
    name: "Technology Distribution",
    description: "TRL and category distribution",
    icon: BarChart3,
    color: "#F59E0B",
    category: "comparison",
    status: "ready",
    domains: ["navigate"],
  },
  {
    id: "focusareamatrix",
    name: "Focus Area Matrix (Test)",
    description: "CPC focus areas by mode and strategic theme",
    icon: BarChart3,
    color: "#006E51",
    category: "matrix",
    status: "experimental",
    domains: ["cpc"],
  },
  {
    id: "stagepipeline",
    name: "Stage Pipeline (Test)",
    description: "Kanban view of focus areas through maturity stages",
    icon: GitBranch,
    color: "#4CAF50",
    category: "flow",
    status: "experimental",
    domains: ["cpc"],
  },
  {
    id: "stakeholdernetwork",
    name: "Stakeholder Network (Test)",
    description: "Network graph of stakeholders and focus areas",
    icon: Network,
    color: "#9C27B0",
    category: "network",
    status: "experimental",
    domains: ["cpc"],
  },
  {
    id: "portfoliotreemap",
    name: "Portfolio Treemap (Test)",
    description: "Hierarchical portfolio view by mode, stage, or theme",
    icon: BarChart3,
    color: "#009688",
    category: "hierarchy",
    status: "experimental",
    domains: ["cpc"],
  },
  {
    id: "stakeholdersunburst",
    name: "Stakeholder Sunburst (Test)",
    description: "Radial taxonomy view of stakeholder ecosystem",
    icon: Sun,
    color: "#3F51B5",
    category: "hierarchy",
    status: "experimental",
    domains: ["cpc"],
  },
  {
    id: "treemapsunburstransition",
    name: "Treemap/Sunburst Transition (Test)",
    description: "Animated transition between treemap and sunburst views",
    icon: GitBranch,
    color: "#E91E63",
    category: "experimental",
    status: "experimental",
    domains: ["cpc"],
  },
]


