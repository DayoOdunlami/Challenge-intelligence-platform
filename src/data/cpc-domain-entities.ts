/**
 * CPC Domain Entities
 * 
 * This file is generated from the JSON files in data/cpc_domain/
 * It exports the entities in BaseEntity format for use in client components.
 * 
 * To regenerate: Run the ingestion script which will update this file.
 */

import type { BaseEntity } from '@/lib/base-entity-enhanced';
import { createDefaultProvenance } from '@/lib/base-entity-enhanced';

// Import JSON data - Next.js will bundle these at build time
// eslint-disable-next-line @typescript-eslint/no-require-imports
const focusAreasData = require('../../data/cpc_domain/focus_areas.json') as { entities: any[] };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const milestonesData = require('../../data/cpc_domain/milestones.json') as { milestones: any[] };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const stagesData = require('../../data/cpc_domain/stage_framework.json') as { stages: any[] };

function transformFocusArea(fa: any): BaseEntity {
  return {
    _version: '1.0',
    id: fa.id,
    name: fa.name,
    description: fa.description,
    entityType: 'focus_area',
    domain: 'cpc-internal',
    metadata: {
      sector: fa.mode,
      tags: [...fa.strategic_themes, fa.stage, fa.mode.toLowerCase()],
      custom: {
        mode: fa.mode,
        strategic_themes: fa.strategic_themes,
        stage: fa.stage,
        key_technologies: fa.key_technologies,
        stakeholder_types: fa.stakeholder_types,
        market_barriers: fa.market_barriers,
        cpc_services: fa.cpc_services,
        related_projects: fa.related_projects,
        embedding_text: fa.embedding_text,
      },
    },
    provenance: createDefaultProvenance({
      type: 'expert_curated',
      name: 'CPC Transport Strategy 25/26',
      reference: 'Focus Area Descriptions - Transport Strategy 2526',
      ingestedBy: 'cpc-domain-entities.ts',
    }),
  };
}

function transformMilestone(ms: any): BaseEntity {
  return {
    _version: '1.0',
    id: ms.id,
    name: ms.activity,
    description: ms.rationale,
    entityType: 'milestone',
    domain: 'cpc-internal',
    metadata: {
      sector: ms.mode,
      tags: [ms.mode.toLowerCase(), ms.stage, ms.year, ms.assessment],
      status: ms.assessment.toLowerCase(),
      custom: {
        mode: ms.mode,
        impact_priority: ms.impact_priority,
        customer_status: ms.customer_status,
        business_growth_score: ms.business_growth_score,
        is_alignment: ms.is_alignment,
        assessment: ms.assessment,
        stage: ms.stage,
        year: ms.year,
        focus_area_ids: ms.focus_area_ids,
        embedding_text: ms.embedding_text,
      },
    },
    provenance: createDefaultProvenance({
      type: 'expert_curated',
      name: 'IUK Transport Milestones',
      reference: 'IUK transport milestones.pdf, Milestone long list 26_27.xlsx',
      ingestedBy: 'cpc-domain-entities.ts',
    }),
  };
}

function transformStage(stage: any): BaseEntity {
  return {
    _version: '1.0',
    id: stage.id,
    name: stage.name,
    description: stage.description,
    entityType: 'stage',
    domain: 'cpc-internal',
    metadata: {
      tags: ['framework', 'maturity', `stage-${stage.stage_number}`],
      custom: {
        stage_number: stage.stage_number,
        purpose: stage.purpose,
        typical_outputs: stage.typical_outputs,
        validation_questions: stage.validation_questions,
        development_activities: stage.development_activities,
        commercialisation_activities: stage.commercialisation_activities,
        logic_model_alignment: stage.logic_model_alignment,
        cpc_strategy_link: stage.cpc_strategy_link,
        decision_gate: stage.decision_gate,
        embedding_text: stage.embedding_text,
      },
    },
    provenance: createDefaultProvenance({
      type: 'expert_curated',
      name: 'CPC Stage Framework',
      reference: 'Focus Area Stages_copy.docx',
      ingestedBy: 'cpc-domain-entities.ts',
    }),
  };
}

// Transform all entities
export const cpcDomainEntities: BaseEntity[] = [
  ...focusAreasData.entities.map(transformFocusArea),
  ...milestonesData.milestones.map(transformMilestone),
  ...stagesData.stages.map(transformStage),
];

// Create relationships
export const cpcDomainRelationships: Array<{ source: string; target: string; type: string; strength: number }> = (() => {
  const relationships: Array<{ source: string; target: string; type: string; strength: number }> = [];
  const milestones = milestonesData.milestones.map(transformMilestone);
  const focusAreas = focusAreasData.entities.map(transformFocusArea);
  const stages = stagesData.stages.map(transformStage);
  
  // Milestone → Focus Area relationships
  milestones.forEach(milestone => {
    const metadata = milestone.metadata.custom as any;
    if (metadata.focus_area_ids && Array.isArray(metadata.focus_area_ids)) {
      metadata.focus_area_ids.forEach((faId: string) => {
        relationships.push({
          source: milestone.id,
          target: faId,
          type: 'addresses',
          strength: 0.9,
        });
      });
    }
  });
  
  // Focus Area → Stage relationships
  focusAreas.forEach(fa => {
    const metadata = fa.metadata.custom as any;
    if (metadata.stage) {
      const stageId = stages.find(s => 
        s.name.toLowerCase() === metadata.stage.toLowerCase()
      )?.id;
      if (stageId) {
        relationships.push({
          source: fa.id,
          target: stageId,
          type: 'at_stage',
          strength: 1.0,
        });
      }
    }
  });
  
  return relationships;
})();

