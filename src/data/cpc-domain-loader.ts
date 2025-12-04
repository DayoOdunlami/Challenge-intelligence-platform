/**
 * CPC Domain Data Loader
 * 
 * Loads CPC domain entities (focus areas, milestones, stages) from JSON files
 * and transforms them to BaseEntity format for inclusion in unified data layer.
 * 
 * Note: This uses synchronous file reads which work at build time in Next.js.
 * For client-side usage, the data should be pre-loaded or imported as static JSON.
 */

import type { BaseEntity } from '@/lib/base-entity-enhanced';
import { createDefaultProvenance } from '@/lib/base-entity-enhanced';

// Types for raw JSON data
interface FocusAreaRaw {
  id: string;
  name: string;
  mode: string;
  strategic_themes: string[];
  stage: string;
  description: string;
  key_technologies: string[];
  stakeholder_types: string[];
  market_barriers: string[];
  cpc_services: string[];
  related_projects: string[];
  embedding_text: string;
}

interface MilestoneRaw {
  id: string;
  activity: string;
  mode: string;
  impact_priority: string;
  rationale: string;
  customer_status: string;
  business_growth_score: number | null;
  is_alignment: string | null;
  assessment: string;
  stage: string;
  year: string;
  focus_area_ids: string[];
  embedding_text: string;
}

interface StageRaw {
  id: string;
  name: string;
  stage_number: number;
  purpose: string;
  description: string;
  typical_outputs: string[];
  validation_questions?: string[];
  development_activities?: string[];
  commercialisation_activities?: string[];
  logic_model_alignment: string[];
  cpc_strategy_link: string;
  decision_gate: string;
  embedding_text: string;
}

/**
 * Transform focus area to BaseEntity
 */
function transformFocusArea(fa: FocusAreaRaw): BaseEntity {
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
      ingestedBy: 'cpc-domain-loader.ts',
    }),
  };
}

/**
 * Transform milestone to BaseEntity
 */
function transformMilestone(ms: MilestoneRaw): BaseEntity {
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
      ingestedBy: 'cpc-domain-loader.ts',
    }),
  };
}

/**
 * Transform stage to BaseEntity
 */
function transformStage(stage: StageRaw): BaseEntity {
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
      ingestedBy: 'cpc-domain-loader.ts',
    }),
  };
}

/**
 * Load CPC domain entities from JSON files
 * 
 * Note: This runs at build time, so it needs to be synchronous or
 * the data needs to be pre-loaded. For now, we'll make it async and
 * call it during module initialization.
 */
export async function loadCPCDomainEntities(): Promise<{
  entities: BaseEntity[];
  relationships: Array<{ source: string; target: string; type: string; strength: number }>;
}> {
  try {
    const dataDir = join(process.cwd(), 'data', 'cpc_domain');
    
    // Load JSON files
    const focusAreasJson = await readFile(join(dataDir, 'focus_areas.json'), 'utf-8');
    const milestonesJson = await readFile(join(dataDir, 'milestones.json'), 'utf-8');
    const stagesJson = await readFile(join(dataDir, 'stage_framework.json'), 'utf-8');
    
    const focusAreasData = JSON.parse(focusAreasJson) as { entities: FocusAreaRaw[] };
    const milestonesData = JSON.parse(milestonesJson) as { milestones: MilestoneRaw[] };
    const stagesData = JSON.parse(stagesJson) as { stages: StageRaw[] };
    
    // Transform to BaseEntity
    const focusAreas = focusAreasData.entities.map(transformFocusArea);
    const milestones = milestonesData.milestones.map(transformMilestone);
    const stages = stagesData.stages.map(transformStage);
    
    const entities = [...focusAreas, ...milestones, ...stages];
    
    // Create relationships
    const relationships: Array<{ source: string; target: string; type: string; strength: number }> = [];
    
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
    
    // Focus Area → Stage relationships (based on stage field)
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
    
    return { entities, relationships };
  } catch (error: any) {
    // If files don't exist or can't be read, return empty arrays
    // This allows the app to work even if CPC domain data isn't loaded
    console.warn('Could not load CPC domain entities:', error.message);
    return { entities: [], relationships: [] };
  }
}

/**
 * Synchronous version that loads data at module initialization
 * In Next.js, we import JSON files directly - they get bundled at build time
 */
let cachedData: {
  entities: BaseEntity[];
  relationships: Array<{ source: string; target: string; type: string; strength: number }>;
} | null = null;

export function loadCPCDomainEntitiesSync(): {
  entities: BaseEntity[];
  relationships: Array<{ source: string; target: string; type: string; strength: number }>;
} {
  if (cachedData) {
    return cachedData;
  }

  try {
    // In Next.js, we can import JSON files directly
    // These will be bundled at build time and work in both server and client
    // Try relative path from src/data/
    let focusAreasData: { entities: FocusAreaRaw[] };
    let milestonesData: { milestones: MilestoneRaw[] };
    let stagesData: { stages: StageRaw[] };
    
    if (typeof window === 'undefined') {
      // Server-side: use Node.js fs
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      const dataDir = path.join(process.cwd(), 'data', 'cpc_domain');
      
      focusAreasData = JSON.parse(fs.readFileSync(path.join(dataDir, 'focus_areas.json'), 'utf-8'));
      milestonesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'milestones.json'), 'utf-8'));
      stagesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'stage_framework.json'), 'utf-8'));
    } else {
      // Client-side: JSON files should be in public/ or imported statically
      // For now, return empty - we'll need to fetch or import differently
      console.warn('CPC domain loader: Client-side loading not yet implemented. Data will be empty.');
      cachedData = { entities: [], relationships: [] };
      return cachedData;
    }
    
    // Transform to BaseEntity
    const focusAreas = focusAreasData.entities.map(transformFocusArea);
    const milestones = milestonesData.milestones.map(transformMilestone);
    const stages = stagesData.stages.map(transformStage);
    
    const entities = [...focusAreas, ...milestones, ...stages];
    
    // Create relationships
    const relationships: Array<{ source: string; target: string; type: string; strength: number }> = [];
    
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
    
    // Focus Area → Stage relationships (based on stage field)
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
    
    cachedData = { entities, relationships };
    return cachedData;
  } catch (error: any) {
    // If files don't exist or can't be read, return empty arrays
    console.warn('Could not load CPC domain entities:', error.message);
    cachedData = { entities: [], relationships: [] };
    return cachedData;
  }
}

