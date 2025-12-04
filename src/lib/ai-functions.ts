/**
 * AI Function Definitions
 * 
 * Defines what actions the AI can perform on the UI.
 * These functions are exposed to the AI via OpenAI function calling.
 * 
 * NOTE: AVAILABLE_VISUALIZATIONS and AVAILABLE_CONTROLS are now auto-generated
 * from the visualization registry. See implementation below.
 */

// Server-safe fallback visualizations (no registry import needed on server)
const SERVER_SAFE_VISUALIZATIONS: VisualizationInfo[] = [
  { id: 'network', name: 'Network Graph', description: 'Interactive network visualization', category: 'network' },
  { id: 'sankey', name: 'Sankey Chart', description: 'Flow analysis chart', category: 'flow' },
  { id: 'radar', name: 'Radar Chart', description: 'Multi-dimensional comparison', category: 'comparison' },
  { id: 'bar', name: 'Bar Chart', description: 'Bar chart analysis', category: 'comparison' },
  { id: 'circle', name: 'Circle Packing', description: 'Hierarchical circle packing', category: 'hierarchy' },
  { id: 'bump', name: 'Bump Chart', description: 'TRL progression over time', category: 'timeline' },
  { id: 'treemap', name: 'Treemap', description: 'Hierarchical treemap', category: 'hierarchy' },
  { id: 'heatmap', name: 'Heatmap', description: 'Heatmap analysis', category: 'matrix' },
  { id: 'chord', name: 'Chord Diagram', description: 'Relationship diagram', category: 'network' },
  { id: 'stream', name: 'Stream Graph', description: 'Temporal stream graph', category: 'timeline' },
  { id: 'swarm', name: 'Swarm Plot', description: 'Distribution swarm plot', category: 'distribution' },
];

// Note: Registry cannot be imported on server-side due to React components
// Use SERVER_SAFE_VISUALIZATIONS for server, registry loads only on client

// import type { ControlDefinition } from '@/lib/visualisations/types'; // For future use when auto-generating controls

export interface AIFunctionCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface VisualizationInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface ControlInfo {
  id: string;
  label: string;
  type: 'single-select' | 'multi-select' | 'toggle' | 'range';
  options?: string[];
  description?: string;
  appliesTo: string[];
}

/**
 * Legacy ID mapping for backward compatibility
 * Maps old simple IDs (used in pages) to registry IDs
 */
const LEGACY_ID_MAP: Record<string, string> = {
  'network': 'network-graph-navigate', // Navigate-specific network graph
  'network3d': 'network-graph-navigate-3d',
  'unifiednetwork': 'unified-network-graph',
  'sankey': 'sankey-chart-navigate',
  'radar': 'radar-chart-navigate',
  'bar': 'bar-chart-navigate',
  'circle': 'circle-packing-navigate',
  'bump': 'bump-chart-navigate',
  'timeline': 'timeline-navigate',
  'treemap': 'treemap-navigate',
  'heatmap': 'heatmap-navigate',
  'chord': 'chord-diagram-navigate',
  'stream': 'stream-graph-navigate',
  'swarm': 'swarm-plot-navigate',
  // Note: sunburst may need to be mapped when registry entry exists
};

/**
 * Map registry control type to AI function control type
 * TODO: Use this when auto-generating controls from registry
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapControlTypeToAIType(controlType: string): 'single-select' | 'multi-select' | 'toggle' | 'range' {
  switch (controlType) {
    case 'select':
    case 'segmented':
      return 'single-select';
    case 'multiselect':
      return 'multi-select';
    case 'toggle':
      return 'toggle';
    case 'range':
    case 'slider':
      return 'range';
    default:
      return 'single-select';
  }
}

/**
 * Available visualizations the AI can switch to
 * AUTO-GENERATED from visualization registry
 * Lazy-loaded to avoid server-side import errors (registry has React components)
 */
let _cachedVisualizations: VisualizationInfo[] | null = null;

function loadVisualizationsFromRegistry(): VisualizationInfo[] {
  // On server-side, always use static fallback (registry can't be loaded)
  if (typeof window === 'undefined') {
    return SERVER_SAFE_VISUALIZATIONS;
  }
  
  // Client-side: try to load from registry using dynamic import
  // For now, use static list - registry loading can be added later if needed
  // The registry has React components which makes server-side loading impossible
  return SERVER_SAFE_VISUALIZATIONS;
}

export function getAvailableVisualizations(): VisualizationInfo[] {
  if (_cachedVisualizations === null) {
    _cachedVisualizations = loadVisualizationsFromRegistry();
  }
  return _cachedVisualizations;
}

// Server-safe constant: use static list on server, dynamic on client
export const AVAILABLE_VISUALIZATIONS: VisualizationInfo[] = typeof window === 'undefined' 
  ? SERVER_SAFE_VISUALIZATIONS 
  : getAvailableVisualizations();

/**
 * Available controls the AI can interact with
 * 
 * TODO: Auto-generate from visualization registry when registry controls are populated.
 * Currently uses manual list for backward compatibility.
 * Registry controls are defined in ControlDefinition[] but not yet fully populated.
 */
export const AVAILABLE_CONTROLS: ControlInfo[] = [
  // Global controls
  { id: 'trl_range', label: 'TRL Range Filter', type: 'range', appliesTo: ['all'] },
  { id: 'data_source', label: 'Data Source Toggle', type: 'toggle', appliesTo: ['all'] },
  
  // Visualization-specific controls
  { id: 'circle.setView', label: 'Circle Packing View', type: 'single-select', options: ['by_stakeholder_type', 'by_technology_category', 'by_funding'], appliesTo: ['circle'] },
  { id: 'bar.setView', label: 'Bar Chart View', type: 'single-select', options: ['funding_by_stakeholder', 'funding_by_tech', 'projects_by_status', 'tech_by_trl'], appliesTo: ['bar'] },
  { id: 'bar.setSort', label: 'Bar Chart Sort', type: 'single-select', options: ['asc', 'desc'], appliesTo: ['bar'] },
  { id: 'bar.setValueMode', label: 'Bar Chart Value Mode', type: 'single-select', options: ['absolute', 'percentage'], appliesTo: ['bar'] },
  { id: 'treemap.setView', label: 'Treemap View', type: 'single-select', options: ['by_stakeholder_type', 'by_tech_category', 'by_funding_type', 'by_project'], appliesTo: ['treemap'] },
  { id: 'chord.setView', label: 'Chord Diagram View', type: 'single-select', options: ['by_stakeholder_type', 'by_tech_category', 'by_funding_flow'], appliesTo: ['chord'] },
  { id: 'stream.setView', label: 'Stream Graph View', type: 'single-select', options: ['by_stakeholder_type', 'by_tech_category', 'by_funding_type'], appliesTo: ['stream'] },
  { id: 'swarm.setView', label: 'Swarm Plot View', type: 'single-select', options: ['by_trl', 'by_category'], appliesTo: ['swarm'] },
  { id: 'radar.toggleTechnology', label: 'Select Technologies for Radar', type: 'multi-select', appliesTo: ['radar'] },
  { id: 'radar.toggleDimension', label: 'Select Radar Dimensions', type: 'multi-select', appliesTo: ['radar'] },
  { id: 'bump.setMode', label: 'TRL Progression Mode', type: 'single-select', options: ['all_technologies', 'by_category', 'top_advancing'], appliesTo: ['bump'] },
  { id: 'bump.toggleCategory', label: 'TRL Category Filter', type: 'multi-select', description: 'Use with the "by_category" mode. Provide categories to include.', appliesTo: ['bump'] },
  { id: 'timeline.toggleTrack', label: 'Toggle Timeline Track', type: 'multi-select', options: ['technology', 'infrastructure', 'policy', 'skills'], appliesTo: ['timeline'] },
  { id: 'heatmap.setMatrix', label: 'Heatmap Matrix', type: 'single-select', options: ['trl_vs_category', 'tech_vs_stakeholder', 'funding_vs_status'], appliesTo: ['heatmap'] },
  { id: 'heatmap.setScale', label: 'Heatmap Scale', type: 'single-select', options: ['absolute', 'normalized'], appliesTo: ['heatmap'] },
  { id: 'parallel.setDimensions', label: 'Parallel Coordinates Dimensions', type: 'multi-select', options: ['TRL Level', 'Funding (£M)', 'Market Readiness', 'Regulatory Status', '2030 Maturity'], appliesTo: ['parallel'] },
  { id: 'network.setSimilarity', label: 'Network Similarity Threshold', type: 'range', description: 'Value between 0 and 1 to control link density.', appliesTo: ['network'] },
  { id: 'network.toggleCluster', label: 'Show Cluster Highlights', type: 'toggle', appliesTo: ['network'] },
  { id: 'network.toggleOrbit', label: 'Toggle Orbit Animation', type: 'toggle', appliesTo: ['network'] },
];

/**
 * OpenAI function definitions for function calling
 * Uses lazy-loaded visualizations to avoid server-side errors
 */
export function getAIFunctionDefinitions() {
  const vizIds = typeof window !== 'undefined' 
    ? getAvailableVisualizations().map(v => v.id)
    : Object.keys(LEGACY_ID_MAP); // Fallback to legacy IDs on server
  
  return [
    {
      name: 'switch_visualization',
      description: 'Switch to a different visualization. Use this when the user asks to "show", "switch to", "display", or "view" a specific chart type.',
      parameters: {
        type: 'object',
        properties: {
          visualization: {
            type: 'string',
            enum: vizIds.length > 0 ? vizIds : ['network', 'sankey', 'radar', 'bar', 'circle'], // Fallback list
            description: 'The visualization to switch to',
          },
        },
        required: ['visualization'],
      },
    },
  {
    name: 'set_control',
    description: 'Change a control setting for the current visualization. Use this to adjust filters, views, or other visualization-specific settings.',
    parameters: {
      type: 'object',
      properties: {
        controlId: {
          type: 'string',
          enum: AVAILABLE_CONTROLS.map(c => c.id),
          description: 'The control to change',
        },
        value: {
          description:
            'Value to apply. Use strings/numbers/booleans for simple controls, objects for structured settings (e.g. {"track":"technology","enabled":true}), or arrays for multi-select.',
          anyOf: [
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' },
            { type: 'object' },
            {
              type: 'array',
              items: {
                anyOf: [
                  { type: 'string' },
                  { type: 'number' },
                  { type: 'boolean' },
                  { type: 'object' },
                ],
              },
            },
          ],
        },
      },
      required: ['controlId', 'value'],
    },
  },
  {
    name: 'filter_data',
    description: 'Filter the data shown in visualizations. Use this when the user asks to "show only", "filter by", or "find" specific entities or criteria.',
    parameters: {
      type: 'object',
      properties: {
        trlRange: {
          type: 'array',
          items: { type: 'number' },
          description: 'TRL range [min, max] (1-9)',
        },
        categories: {
          type: 'array',
          items: { type: 'string' },
          description: 'Technology categories to include',
        },
        stakeholderTypes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Stakeholder types to include',
        },
        fundingMin: {
          type: 'number',
          description: 'Minimum funding amount',
        },
        fundingMax: {
          type: 'number',
          description: 'Maximum funding amount',
        },
      },
    },
  },
  {
    name: 'highlight_entities',
    description: 'Highlight specific entities in the visualization. Use this when the user asks to "highlight", "show", or "focus on" specific stakeholders, technologies, or projects.',
    parameters: {
      type: 'object',
      properties: {
        entityIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'IDs of entities to highlight',
        },
        entityNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names of entities to highlight (will be resolved to IDs)',
        },
      },
    },
  },
  ];
}

/**
 * Format available visualizations and controls for AI context
 */
export function formatAICapabilities(): string {
  // Use server-safe visualizations or get from cache
  const vizs = typeof window === 'undefined' 
    ? SERVER_SAFE_VISUALIZATIONS 
    : getAvailableVisualizations();
  
  const vizList = vizs.map(v => 
    `- **${v.name}** (${v.id}): ${v.description}`
  ).join('\n');
  
  const controlsList = AVAILABLE_CONTROLS
    .filter(c => c.appliesTo.includes('all') || c.appliesTo.length > 0)
    .map(c => 
      `- **${c.label}** (${c.id}): ${c.type}${c.options ? ` - Options: ${c.options.join(', ')}` : ''}`
    ).join('\n');
  
  return `## Available Visualizations
${vizList}

## Available Controls
${controlsList}

## How to Use Functions
- Use \`switch_visualization\` when user wants to see a different chart
- Use \`set_control\` to adjust visualization settings
- Use \`filter_data\` to filter what's shown
- Use \`highlight_entities\` to focus on specific entities`;
}

