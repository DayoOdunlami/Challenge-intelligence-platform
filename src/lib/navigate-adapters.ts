/**
 * NAVIGATE Data Adapters
 * 
 * Converts NAVIGATE entities (Stakeholder, Technology, Project, Relationship)
 * into visualization formats compatible with existing Challenge-based visualizations
 */

import { Stakeholder, Technology, Project, Relationship, FundingEvent, StakeholderType, TechnologyCategory } from './navigate-types';
import { NetworkNode, NetworkLink, Sector } from './types';

// ============================================================================
// Sector Mapping (NAVIGATE → Challenge sectors)
// ============================================================================

function mapStakeholderTypeToSector(type: StakeholderType): Sector {
  const mapping: Record<StakeholderType, Sector> = {
    'Government': 'local_gov',
    'Research': 'energy',
    'Industry': 'transport',
    'Intermediary': 'aviation'
  };
  return mapping[type] || 'aviation';
}

function mapTechCategoryToSector(category: TechnologyCategory): Sector {
  const mapping: Record<TechnologyCategory, Sector> = {
    'H2Production': 'energy',
    'H2Storage': 'energy',
    'FuelCells': 'transport',
    'Aircraft': 'aviation',
    'Infrastructure': 'built_env'
  };
  return mapping[category] || 'aviation';
}

// ============================================================================
// Color Mapping (NAVIGATE → Visualization colors)
// ============================================================================

function getStakeholderColor(type: StakeholderType): string {
  const colors: Record<StakeholderType, string> = {
    'Government': '#006E51',      // CPC Primary Teal
    'Research': '#50C878',        // CPC Success Green
    'Industry': '#F5A623',        // CPC Warning Amber
    'Intermediary': '#4A90E2'     // CPC Info Blue
  };
  return colors[type] || '#6b7280';
}

function getTechColor(category: TechnologyCategory): string {
  const colors: Record<TechnologyCategory, string> = {
    'H2Production': '#006E51',    // CPC Primary Teal
    'H2Storage': '#50C878',       // CPC Success Green
    'FuelCells': '#4A90E2',       // CPC Info Blue
    'Aircraft': '#F5A623',        // CPC Warning Amber
    'Infrastructure': '#CCE2DC'   // CPC Mint Green
  };
  return colors[category] || '#6b7280';
}

// ============================================================================
// Node Size Calculation
// ============================================================================

function calculateNodeSize(entity: Stakeholder | Technology | Project): number {
  if ('total_funding_provided' in entity) {
    // Stakeholder
    const funding = (entity.total_funding_provided || 0) + (entity.total_funding_received || 0);
    return Math.max(3, Math.min(15, funding / 1000000 + 3));
  } else if ('total_funding' in entity) {
    // Technology
    return Math.max(2, Math.min(12, (entity.total_funding || 0) / 5000000 + 2));
  } else {
    // Project
    return Math.max(2, Math.min(10, (entity.total_funding_allocated || 0) / 10000000 + 2));
  }
}

// ============================================================================
// NetworkGraph Adapter
// ============================================================================

/**
 * Convert NAVIGATE entities to NetworkGraph format
 * Uses REAL relationships instead of calculated similarity!
 */
export function toNetworkGraphFromNavigate(
  stakeholders: Stakeholder[],
  technologies: Technology[],
  projects: Project[],
  relationships: Relationship[]
): { nodes: NetworkNode[], links: NetworkLink[] } {
  
  // Create nodes from all entity types
  const stakeholderNodes: NetworkNode[] = stakeholders.map(s => ({
    id: s.id,
    label: s.name,
    sector: mapStakeholderTypeToSector(s.type),
    value: calculateNodeSize(s),
    color: getStakeholderColor(s.type)
  }));

  const technologyNodes: NetworkNode[] = technologies.map(t => ({
    id: t.id,
    label: t.name,
    sector: mapTechCategoryToSector(t.category),
    value: calculateNodeSize(t),
    color: getTechColor(t.category)
  }));

  const projectNodes: NetworkNode[] = projects.map(p => ({
    id: p.id,
    label: p.name,
    sector: 'aviation', // Projects are aviation-focused
    value: calculateNodeSize(p),
    color: '#EC4899' // Project color (pink)
  }));

  const nodes = [...stakeholderNodes, ...technologyNodes, ...projectNodes];
  
  // Create a set of valid node IDs for filtering
  const validNodeIds = new Set(nodes.map(n => n.id));

  // Create links from REAL relationships (not calculated similarity!)
  // Only include links where both source and target exist as nodes
  const links: NetworkLink[] = relationships
    .filter(r => validNodeIds.has(r.source) && validNodeIds.has(r.target))
    .map(r => {
      // Map relationship strength to similarity (0-1)
      const strengthMap: Record<string, number> = {
        'strong': 0.8,
        'medium': 0.6,
        'weak': 0.4
      };
      
      const similarity = strengthMap[r.strength] || (r.weight || 0.5);
      
      return {
        source: r.source,
        target: r.target,
        similarity,
        width: Math.max(1, similarity * 4) // Make links more visible (1-3.2px)
      };
    });

  return { nodes, links };
}

// ============================================================================
// SankeyChart Adapter
// ============================================================================

/**
 * Convert NAVIGATE entities to Sankey format
 * Flow: Stakeholder Type → Technology Category → Funding Type
 * Value: Funding amount (not count!)
 */
export function toSankeyFromNavigate(
  stakeholders: Stakeholder[],
  technologies: Technology[],
  fundingEvents: FundingEvent[],
  relationships: Relationship[] = []
): { nodes: Array<{ id: string; color: string }>, links: Array<{ source: string; target: string; value: number }> } {
  
  const nodes: Array<{ id: string; color: string }> = [];
  const links: Array<{ source: string; target: string; value: number }> = [];

  // Level 1: Stakeholder Types
  const stakeholderTypes = [...new Set(stakeholders.map(s => s.type))];
  stakeholderTypes.forEach(type => {
    nodes.push({
      id: `stakeholder_${type}`,
      color: getStakeholderColor(type)
    });
  });

  // Level 2: Technology Categories
  const techCategories = [...new Set(technologies.map(t => t.category))];
  techCategories.forEach((category, index) => {
    nodes.push({
      id: `tech_${category}`,
      color: getTechColor(category)
    });
  });

  // Level 3: Funding Types
  const fundingTypes = [...new Set(fundingEvents.map(f => f.funding_type))];
  fundingTypes.forEach(type => {
    nodes.push({
      id: `funding_${type}`,
      color: type === 'Public' ? '#006E51' : type === 'Private' ? '#F5A623' : '#4A90E2'
    });
  });

  // Create links: Stakeholder Type → Technology Category
  // Based on which stakeholders fund/research which technologies
  const stakeholderToTech = new Map<string, number>();
  
  // Method 1: Use funding events with technologies_supported
  fundingEvents.forEach(event => {
    const sourceStakeholder = stakeholders.find(s => s.id === event.source_id);
    
    if (event.technologies_supported && event.technologies_supported.length > 0) {
      event.technologies_supported.forEach(techId => {
        const tech = technologies.find(t => t.id === techId);
        if (sourceStakeholder && tech) {
          const key = `stakeholder_${sourceStakeholder.type}→tech_${tech.category}`;
          stakeholderToTech.set(key, (stakeholderToTech.get(key) || 0) + event.amount);
        }
      });
    }
  });
  
  // Method 2: Use relationships for research/advance/funds connections
  relationships.forEach(rel => {
    if (rel.type === 'researches' || rel.type === 'advances' || rel.type === 'funds') {
      const sourceStakeholder = stakeholders.find(s => s.id === rel.source);
      const tech = technologies.find(t => t.id === rel.target);
      if (sourceStakeholder && tech) {
        const key = `stakeholder_${sourceStakeholder.type}→tech_${tech.category}`;
        // Use metadata amount if available, otherwise estimate from weight
        const amount = rel.metadata?.amount || (rel.weight > 1 ? rel.weight : rel.weight * 1000000);
        stakeholderToTech.set(key, (stakeholderToTech.get(key) || 0) + amount);
      }
    }
  });

  stakeholderToTech.forEach((amount, key) => {
    const [source, target] = key.split('→');
    links.push({ source, target, value: amount });
  });

  // Create links: Technology Category → Funding Type
  // Based on funding events
  const techToFunding = new Map<string, number>();
  
  fundingEvents.forEach(event => {
    // Check if funding supports technologies
    if (event.technologies_supported && event.technologies_supported.length > 0) {
      event.technologies_supported.forEach(techId => {
        const tech = technologies.find(t => t.id === techId);
        if (tech) {
          const key = `tech_${tech.category}→funding_${event.funding_type}`;
          techToFunding.set(key, (techToFunding.get(key) || 0) + event.amount);
        }
      });
    }
  });

  techToFunding.forEach((amount, key) => {
    const [source, target] = key.split('→');
    links.push({ source, target, value: amount });
  });

  return { nodes, links };
}

// ============================================================================
// Helper: Get all NAVIGATE entities
// ============================================================================

export interface NavigateDataset {
  stakeholders: Stakeholder[];
  technologies: Technology[];
  projects: Project[];
  relationships: Relationship[];
  fundingEvents: FundingEvent[];
}

