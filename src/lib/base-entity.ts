/**
 * BaseEntity - Universal interface for all entity types
 * 
 * This is the foundation of the hybrid schema approach, allowing
 * the same visualizations to work with different domain-specific entities
 * (Challenges, Stakeholders, Technologies, Projects, etc.)
 */

export type EntityType = 
  | 'challenge' 
  | 'stakeholder' 
  | 'technology' 
  | 'project' 
  | 'funding_event'
  | 'capability' // CPC internal
  | 'initiative' // CPC internal
  | 'innovation' // Future
  | 'rail_challenge' // Future
  | 'rail_stakeholder'; // Future

/**
 * Domain - high level data source / ownership
 * Used for filtering and scoping visuals (Atlas vs Navigate vs CPC internal)
 */
export type Domain = 'atlas' | 'navigate' | 'cpc-internal' | 'reference' | 'cross-domain';

/**
 * TRL (Technology Readiness Level) representation
 * Supports both simple number and range-based TRL
 */
export type TRLValue = 
  | number 
  | { 
      current: number; 
      target?: number; 
      min?: number; 
      max?: number;
    };

/**
 * BaseEntity - Universal interface for all entities
 * Uses metadata pattern for extensibility
 */
export interface BaseEntity {
  /** Schema version for future migrations */
  _version: '1.0';
  
  /** Core identity */
  id: string;
  name: string;
  description: string;
  entityType: EntityType;
  /** Which domain this entity belongs to (atlas, navigate, cpc-internal, etc.) */
  domain: Domain;
  
  /** Structured metadata (easier to extend) */
  metadata: {
    /** Classification */
    sector?: string | string[];
    tags?: string[];
    category?: string;
    
    /** Maturity/Status */
    trl?: TRLValue;
    status?: 'active' | 'completed' | 'planned' | string;
    
    /** Financial */
    funding?: {
      amount?: number;
      currency?: string;
      source?: string;
      type?: 'grant' | 'investment' | 'loan' | 'contract' | 'SBRI' | string;
    };
    
    /** Temporal */
    dates?: {
      start?: Date | string;
      end?: Date | string;
      milestones?: Array<{ date: Date | string; label: string }>;
    };
    
    /** Spatial (for future geographic visualizations) */
    location?: {
      country?: string;
      region?: string;
      coordinates?: { lat: number; lng: number };
    };
    
    /** Extensibility - domain-specific data that doesn't fit above */
    custom?: Record<string, unknown>;
  };
  
  /** Relationships (unified model) */
  relationships?: Array<{
    targetId: string;
    type: string; // 'funds', 'collaborates_with', 'researches', 'addresses'
    strength?: number; // 0-1 normalized
    metadata?: Record<string, unknown>;
  }>;
  
  /** Visualization hints (optional, for adapter to suggest rendering) */
  visualizationHints?: {
    color?: string;
    size?: number;
    icon?: string;
    priority?: number;
  };
  
  /** Reference to original domain object (for advanced use cases) */
  _original?: unknown;
}

/**
 * UniversalRelationship - Unified relationship model
 * Supports both explicit and computed relationships
 */
export interface UniversalRelationship {
  id: string;
  source: string; // Entity ID
  target: string; // Entity ID
  sourceType: EntityType; // For type safety
  targetType: EntityType;
  
  type: string; // 'funds', 'similar_to', 'collaborates_with', 'addresses', 'provides'
  
  /** Normalized strength (0-1) - consistent across all relationship types */
  strength: number;
  
  /** How was this relationship derived? */
  derivation: 'explicit' | 'computed' | 'inferred';
  
  /** Original data for debugging/display */
  metadata?: {
    originalStrength?: number; // e.g., keyword overlap count
    confidence?: number; // for ML-derived relationships
    bidirectional?: boolean;
    amount?: number; // for funding relationships
    program?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    [key: string]: unknown;
  };
  
  /** Timestamps */
  created_at?: string;
  updated_at?: string;
}

/**
 * Entity filter for queries
 */
export interface EntityFilter {
  entityTypes?: EntityType[];
  sectors?: string[];
  tags?: string[];
  trlRange?: { min: number; max: number };
  status?: string[];
  searchQuery?: string;
}

/**
 * Entity graph structure for network visualizations
 */
export interface EntityGraph {
  nodes: BaseEntity[];
  edges: UniversalRelationship[];
}

