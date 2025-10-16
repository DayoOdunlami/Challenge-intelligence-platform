// Core data types for the Challenge Intelligence Platform

export type Sector = 'rail' | 'energy' | 'local_gov' | 'transport' | 'built_env' | 'aviation';

export interface Challenge {
  // Core Identity
  id: string;
  title: string;
  description: string;
  source_url: string;
  
  // Classification
  sector: {
    primary: Sector;
    secondary: Sector[];
    cross_sector_signals: string[];
  };
  
  problem_type: {
    primary: string;
    sub_categories: string[];
    technology_domains: string[];
  };
  
  keywords: string[];
  
  // Procurement Details
  buyer: {
    organization: string;
    org_type: "national_infrastructure" | "local_authority" | "regulator" | "government" | "private";
    contact_info?: string;
  };
  
  timeline: {
    deadline?: Date;
    urgency: "critical" | "moderate" | "flexible";
    expected_duration?: string;
  };
  
  funding: {
    type: "fixed" | "range" | "match_funding" | "outcome_based" | "unknown";
    amount_min?: number;
    amount_max?: number;
    currency: "GBP";
    mechanism: "grant" | "contract" | "SBRI" | "innovation_voucher" | "partnership";
    co_funding_available?: boolean;
  };
  
  maturity: {
    trl_min?: number;
    trl_max?: number;
    deployment_ready?: boolean;
    trial_expected: boolean;
    evidence_required: string[];
    evidence_confidence: "stated" | "inferred" | "default";
  };
  
  geography: {
    scope: "UK-wide" | "regional" | "local" | "international";
    specific_locations?: string[];
  };
  
  // Metadata for transparency
  metadata: {
    scraped_date: Date;
    source_portal: string;
    extraction_confidence: {
      tier1_complete: boolean;
      tier2_complete: number;
      tier3_inferred: boolean;
    };
  };
}

// Filter state for the application
export interface FilterState {
  sectors: Sector[];
  problemTypes: string[];
  budgetRange: [number, number];
  urgentOnly: boolean;
  keywords: string;
}

// Network graph data structures
export interface NetworkNode {
  id: string;
  label: string;
  sector: Sector;
  value: number; // for node sizing
  color: string;
  x?: number;
  y?: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  similarity: number;
  width: number;
}

export interface SimilarityEdge {
  source: string;
  target: string;
  similarity: number;
  shared_keywords: string[];
  matching_method: 'keyword_overlap' | 'semantic_embedding';
}

// Application state
export interface AppState {
  challenges: Challenge[];
  filters: FilterState;
  selectedChallenge: Challenge | null;
  currentView: 'network' | 'chord' | 'sunburst';
  similarityMatrix: SimilarityEdge[];
  isLoading: boolean;
  featureFlags: {
    enableNaturalLanguage: boolean;
  };
}

// Phase 2 types (for future use)
export interface Innovation {
  id: string;
  name: string;
  company_name: string;
  description: string;
  sectors_proven: Sector[];
  sectors_applicable: Sector[];
  problem_types: string[];
  maturity_level: number;
  evidence_url: string[];
}

export interface InnovationChallengeMatch {
  innovation_id: string;
  challenge_id: string;
  match_score: number;
  match_rationale: string;
  created_date: Date;
}

// Phase 3 types (for future use)
export interface EvidenceFlow {
  fromSector: Sector;
  toSector: Sector;
  evidenceType: string;
  transferability: number;
}

export interface Evidence {
  id: string;
  innovation_id: string;
  sector: Sector;
  trial_date: Date;
  trial_results: Record<string, unknown>;
  verification_status: "pending" | "verified" | "rejected";
  cpc_verified: boolean;
}

// Utility types
export type ViewType = 'network' | 'chord' | 'sunburst' | 'heatmap' | 'sankey';

export interface DatasetStats {
  totalChallenges: number;
  bySector: Record<Sector, number>;
  avgFunding: number;
  withEvidenceRequired: number;
  netZeroRelated: number;
}