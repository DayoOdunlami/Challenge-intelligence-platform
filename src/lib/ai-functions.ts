/**
 * AI Function Definitions
 * 
 * Defines what actions the AI can perform on the UI.
 * These functions are exposed to the AI via OpenAI function calling.
 */

export interface AIFunctionCall {
  name: string;
  arguments: Record<string, any>;
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
 * Available visualizations the AI can switch to
 */
export const AVAILABLE_VISUALIZATIONS: VisualizationInfo[] = [
  { id: 'network', name: 'Network Graph', description: 'Connections and relationships', category: 'network' },
  { id: 'sankey', name: 'Flow Analysis', description: 'Challenge progression and resource flows', category: 'funding' },
  { id: 'radar', name: 'Tech Maturity Radar', description: 'Compare technology readiness across dimensions', category: 'technology' },
  { id: 'bar', name: 'Bar Chart Analysis', description: 'Funding, projects, and technology breakdowns', category: 'dashboard' },
  { id: 'circle', name: 'Circle Packing', description: 'Hierarchical stakeholder and technology relationships', category: 'network' },
  { id: 'bump', name: 'TRL Progression', description: 'Technology readiness level advancement over time', category: 'technology' },
  { id: 'timeline', name: 'Decarbonisation Roadmap', description: 'Hydrogen aviation milestones and timeline', category: 'technology' },
  { id: 'treemap', name: 'Funding Breakdown', description: 'Hierarchical funding distribution and budgets', category: 'funding' },
  { id: 'heatmap', name: 'Intensity Map', description: 'Challenge density and hotspots', category: 'dashboard' },
  { id: 'chord', name: 'Relationship Matrix', description: 'Cross-sector dependencies', category: 'network' },
  { id: 'stream', name: 'Funding Trends', description: 'Funding flows over time', category: 'funding' },
  { id: 'parallel', name: 'Parallel Coordinates', description: 'Multi-dimensional technology comparison', category: 'technology' },
  { id: 'swarm', name: 'Technology Distribution', description: 'TRL and category distribution', category: 'technology' },
  { id: 'sunburst', name: 'Hierarchical View', description: 'Multi-level challenge breakdown', category: 'dashboard' },
];

/**
 * Available controls the AI can interact with
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
 */
export const AI_FUNCTION_DEFINITIONS = [
  {
    name: 'switch_visualization',
    description: 'Switch to a different visualization. Use this when the user asks to "show", "switch to", "display", or "view" a specific chart type.',
    parameters: {
      type: 'object',
      properties: {
        visualization: {
          type: 'string',
          enum: AVAILABLE_VISUALIZATIONS.map(v => v.id),
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

/**
 * Format available visualizations and controls for AI context
 */
export function formatAICapabilities(): string {
  const vizList = AVAILABLE_VISUALIZATIONS.map(v => 
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

