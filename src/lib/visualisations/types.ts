/**
 * Sparkworks Visualization Type System
 * 
 * This module defines the declarative schema for visualizations,
 * enabling both UI rendering and AI control through a shared contract.
 */

// =============================================================================
// DOMAIN TYPES
// =============================================================================

export type Domain = 'atlas' | 'navigate' | 'cpc';

// =============================================================================
// CONTROL TYPES
// =============================================================================

export type ControlType = 
  | 'slider'        // Single numeric value
  | 'range'         // Numeric range [min, max]
  | 'select'        // Single selection from options
  | 'multiselect'   // Multiple selections
  | 'segmented'     // Toggle between options (like tabs)
  | 'toggle'        // Boolean on/off
  | 'colorpicker'   // Color selection
  | 'search';       // Search/filter input

export interface ControlOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface ControlDefinition {
  /** Unique identifier for this control */
  id: string;
  
  /** Control type determines UI component */
  type: ControlType;
  
  /** Human-readable label */
  label: string;
  
  /** Longer description (shown in tooltip) */
  description?: string;
  
  /** Group for organizing controls in UI */
  group: 'data' | 'layout' | 'display' | 'filters' | 'advanced';
  
  /** Which domains this control applies to (if omitted, applies to all) */
  domains?: Domain[];
  
  /** Options for select/multiselect/segmented controls */
  options?: ControlOption[];
  
  /** For slider/range controls */
  min?: number;
  max?: number;
  step?: number;
  
  /** Default value */
  defaultValue: any;
  
  /** AI-friendly hint explaining what this control does and when to use it */
  aiHint: string;
  
  /** Whether this control is shown by default or hidden in advanced */
  advanced?: boolean;
}

// Control state is a simple key-value map
export type ControlState = Record<string, any>;

// =============================================================================
// VISUALIZATION CONFIG
// =============================================================================

export type VisualizationStatus = 'ready' | 'development' | 'placeholder';

export type VisualizationCategory = 
  | 'Network'
  | 'Flow'
  | 'Hierarchy'
  | 'Distribution'
  | 'Comparison'
  | 'Timeline'
  | 'Matrix'
  | 'Experimental';

export interface VisualizationConfig {
  /** Unique identifier (used in URLs) */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Short description */
  description: string;
  
  /** Longer description for AI context */
  aiDescription?: string;
  
  /** Which domains this visualization supports */
  domains: Domain[];
  
  /** Visual category for grouping */
  category: VisualizationCategory;
  
  /** Development status */
  status: VisualizationStatus;
  
  /** Icon component (lucide-react) */
  icon?: React.ComponentType<{ className?: string }>;
  
  /** Thumbnail image URL */
  thumbnail?: string;
  
  /** Tags for search */
  tags?: string[];
  
  /** Control definitions */
  controls: ControlDefinition[];
  
  /** Default control state */
  defaultState: ControlState;
  
  /** Component to render */
  Component: React.ComponentType<VisualizationComponentProps>;
  
  /** ECharts demo option for live preview on card */
  demoOption?: any; // EChartsOption type from echarts
  
  /** Data requirements (for validation/AI context) */
  dataRequirements?: {
    entities?: ('challenge' | 'stakeholder' | 'technology' | 'project' | 'capability' | 'initiative')[];
    relationships?: boolean;
    fundingEvents?: boolean;
    minEntities?: number;
  };
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface VisualizationComponentProps {
  /** Current domain filter */
  domain: Domain | 'all';
  
  /** Current control state */
  controlState: ControlState;
  
  /** Handler for control changes */
  onControlChange: (controlId: string, value: any) => void;
  
  /** Handler for entity selection */
  onEntitySelect?: (entity: any) => void;
  
  /** Currently selected entity */
  selectedEntity?: any;
  
  /** Container className */
  className?: string;
  
  /** Whether in fullscreen mode */
  isFullscreen?: boolean;
}

// =============================================================================
// AI CONTEXT
// =============================================================================

export interface AIVisualizationContext {
  /** Current visualization info */
  visualization: {
    id: string;
    name: string;
    description: string;
    aiDescription?: string;
  };
  
  /** Available controls with current values */
  controls: {
    schema: ControlDefinition[];
    state: ControlState;
  };
  
  /** Data summary */
  data: {
    domain: Domain | 'all';
    entityCounts: Record<string, number>;
    availableFilters: string[];
  };
  
  /** Selection state */
  selection: {
    entity?: any;
    highlightedIds?: string[];
  };
}

