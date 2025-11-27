/**
 * Adapter: Technology → BaseEntity
 * 
 * Converts Technology entities (Navigate) to universal BaseEntity format
 * with validation to catch mapping errors early.
 */

import type { Technology } from '@/lib/navigate-types';
import type { BaseEntity } from '@/lib/base-entity';
import { validateBaseEntity } from '@/lib/base-entity-validation';

/**
 * Convert Technology to BaseEntity
 */
export function technologyToBaseEntity(technology: Technology): BaseEntity {
  const entity: BaseEntity = {
    _version: '1.0',
    id: technology.id,
    name: technology.name,
    description: technology.description,
    entityType: 'technology',
    domain: 'navigate',
    metadata: {
      sector: 'aviation', // Technologies in Navigate are aviation-focused
      tags: technology.tags,
      category: technology.category,
      trl: {
        current: technology.trl_current,
        target: technology.trl_projected_2030,
      },
      status: technology.deployment_ready ? 'active' : 'planned',
      funding: technology.total_funding
        ? {
            amount: technology.total_funding,
            currency: 'GBP',
            type: technology.funding_by_type
              ? (technology.funding_by_type.public > 0 ? 'grant' : 'investment')
              : undefined,
          }
        : undefined,
      location: technology.regional_availability && technology.regional_availability.length > 0
        ? {
            region: technology.regional_availability[0],
          }
        : undefined,
      custom: {
        // Store technology-specific fields
        category: technology.category,
        trl_color: technology.trl_color,
        trl_projected_2030: technology.trl_projected_2030,
        trl_projected_2050: technology.trl_projected_2050,
        maturity_risk: technology.maturity_risk,
        deployment_ready: technology.deployment_ready,
        funding_by_type: technology.funding_by_type,
        stakeholder_count: technology.stakeholder_count,
        project_count: technology.project_count,
        regional_availability: technology.regional_availability,
      },
    },
    visualizationHints: {
      color: getTechnologyColor(technology.trl_color),
      size: calculateTechnologySize(technology),
      priority: getTechnologyPriority(technology),
    },
    _original: technology,
  };

  // Validate before returning
  const validation = validateBaseEntity(entity);
  if (!validation.success) {
    console.error(`Invalid entity from technology ${technology.id}:`, validation.error);
    throw new Error(`Technology adapter validation failed: ${validation.error.message}`);
  }

  return validation.data;
}

/**
 * Convert array of Technologies to BaseEntities
 */
export function technologiesToBaseEntities(technologies: Technology[]): BaseEntity[] {
  return technologies.map(technology => technologyToBaseEntity(technology));
}

/**
 * Helper: Get color for technology based on TRL color
 */
function getTechnologyColor(trlColor: string): string {
  const colorMap: Record<string, string> = {
    red: '#ef4444',
    amber: '#f59e0b',
    green: '#10b981',
  };
  return colorMap[trlColor] || '#6b7280';
}

/**
 * Helper: Calculate size based on funding and stakeholder count
 */
function calculateTechnologySize(technology: Technology): number {
  const funding = technology.total_funding ?? 0;
  const stakeholders = technology.stakeholder_count ?? 0;
  
  // Combine factors: funding (log scale) + stakeholder count
  const fundingScore = funding > 0 ? Math.log10(funding) * 5 : 20;
  const stakeholderScore = stakeholders * 3;
  const combined = fundingScore + stakeholderScore;
  
  // Normalize to 20-60 range
  return Math.min(60, Math.max(20, combined));
}

/**
 * Helper: Get priority based on TRL and deployment readiness
 */
function getTechnologyPriority(technology: Technology): number {
  const trl = technology.trl_current;
  const deploymentReady = technology.deployment_ready;
  
  // Higher TRL = higher priority
  // Deployment ready = boost
  const basePriority = Math.floor(trl / 3); // 1-3
  return basePriority + (deploymentReady ? 1 : 0);
}

