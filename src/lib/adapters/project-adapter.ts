/**
 * Adapter: Project → BaseEntity
 * 
 * Converts Project entities (Navigate) to universal BaseEntity format
 * with validation to catch mapping errors early.
 */

import type { Project } from '@/lib/navigate-types';
import type { BaseEntity } from '@/lib/base-entity';
import { validateBaseEntity } from '@/lib/base-entity-validation';

/**
 * Convert Project to BaseEntity
 */
export function projectToBaseEntity(project: Project): BaseEntity {
  const entity: BaseEntity = {
    _version: '1.0',
    id: project.id,
    name: project.name,
    description: project.description,
    entityType: 'project',
    domain: 'navigate',
    metadata: {
      sector: 'aviation', // Projects in Navigate are aviation-focused
      tags: project.tags,
      status: project.status.toLowerCase() as 'active' | 'completed' | 'planned',
      funding: project.total_budget
        ? {
            amount: project.total_budget,
            currency: 'GBP',
            type: 'grant', // Default, could be enhanced
          }
        : undefined,
      dates: {
        start: project.start_date,
        end: project.end_date,
        milestones: project.objectives.map((obj, idx) => ({
          date: project.start_date, // Could be enhanced with actual milestone dates
          label: obj,
        })),
      },
      custom: {
        // Store project-specific fields
        status: project.status,
        participants: project.participants,
        lead_organization: project.lead_organization,
        technologies: project.technologies,
        primary_technology: project.primary_technology,
        funding_events: project.funding_events,
        objectives: project.objectives,
        outcomes: project.outcomes,
        duration_months: project.duration_months,
      },
    },
    visualizationHints: {
      color: getProjectColor(project.status),
      size: calculateProjectSize(project),
      priority: getProjectPriority(project),
    },
    _original: project,
  };

  // Validate before returning
  const validation = validateBaseEntity(entity);
  if (!validation.success) {
    console.error(`Invalid entity from project ${project.id}:`, validation.error);
    throw new Error(`Project adapter validation failed: ${validation.error.message}`);
  }

  return validation.data;
}

/**
 * Convert array of Projects to BaseEntities
 */
export function projectsToBaseEntities(projects: Project[]): BaseEntity[] {
  return projects.map(project => projectToBaseEntity(project));
}

/**
 * Helper: Get color for project based on status
 */
function getProjectColor(status: string): string {
  const colorMap: Record<string, string> = {
    Active: '#10b981',
    Completed: '#6b7280',
    Planned: '#f59e0b',
  };
  return colorMap[status] || '#6b7280';
}

/**
 * Helper: Calculate size based on budget and participant count
 */
function calculateProjectSize(project: Project): number {
  const budget = project.total_budget ?? 0;
  const participants = project.participants?.length ?? 0;
  
  // Combine factors: budget (log scale) + participant count
  const budgetScore = budget > 0 ? Math.log10(budget) * 5 : 20;
  const participantScore = participants * 2;
  const combined = budgetScore + participantScore;
  
  // Normalize to 20-60 range
  return Math.min(60, Math.max(20, combined));
}

/**
 * Helper: Get priority based on status and outcomes
 */
function getProjectPriority(project: Project): number {
  const statusMap: Record<string, number> = {
    Active: 3,
    Planned: 2,
    Completed: 1,
  };
  const basePriority = statusMap[project.status] || 1;
  
  // Boost if has significant outcomes
  const hasOutcomes = project.outcomes && (
    project.outcomes.trl_advancement ||
    project.outcomes.publications ||
    project.outcomes.patents
  );
  
  return basePriority + (hasOutcomes ? 1 : 0);
}

