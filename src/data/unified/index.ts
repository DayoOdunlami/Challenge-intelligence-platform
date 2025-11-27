/**
 * Unified data layer
 *
 * Builds a single set of BaseEntity[] and UniversalRelationship[]
 * from the existing Atlas (challenges) and Navigate (aviation)
 * datasets using the shared adapters.
 *
 * NOTE:
 * - This currently includes Atlas + Navigate only.
 * - CPC internal seed data can be merged here later.
 */

import challenges from '@/data/challenges';
import { navigateDummyData } from '@/data/navigate-dummy-data';
import { cpcSeedEntities, cpcSeedRelationships } from '@/data/cpc-internal-seed';

import type { BaseEntity, EntityType, UniversalRelationship, Domain } from '@/lib/base-entity';
import {
  challengesToBaseEntities,
  stakeholdersToBaseEntities,
  technologiesToBaseEntities,
  projectsToBaseEntities,
  relationshipsToUniversal,
} from '@/lib/adapters';
import type { Challenge } from '@/lib/types';

// ----------------------------------------------------------------------------
// Atlas (Challenge Intelligence) → BaseEntity / Relationships
// ----------------------------------------------------------------------------

const atlasEntities: BaseEntity[] = challengesToBaseEntities(challenges);

// Reuse the same similarity logic as the Challenge NetworkGraph so
// Atlas behaves identically in standalone and unified views.
function calculateChallengeSimilarity(a: Challenge, b: Challenge): number {
  const keywords1 = new Set<string>(a.keywords);
  const keywords2 = new Set<string>(b.keywords);
  const intersection = new Set<string>([...keywords1].filter((k) => keywords2.has(k)));
  const union = new Set<string>([...keywords1, ...keywords2]);
  const keywordScore = union.size > 0 ? intersection.size / union.size : 0;

  const problemScore = a.problem_type.primary === b.problem_type.primary ? 0.3 : 0;
  const crossSectorMatch = a.sector.secondary.some(
    (s) => s === b.sector.primary || b.sector.secondary.includes(s)
  )
    ? 0.2
    : 0;

  return Math.min(1, keywordScore + problemScore + crossSectorMatch);
}

function buildAtlasSimilarityRelationships(
  atlasChallenges: Challenge[],
  threshold: number = 0.2
): UniversalRelationship[] {
  const rels: UniversalRelationship[] = [];

  for (let i = 0; i < atlasChallenges.length; i++) {
    for (let j = i + 1; j < atlasChallenges.length; j++) {
      const c1 = atlasChallenges[i];
      const c2 = atlasChallenges[j];
      const similarity = calculateChallengeSimilarity(c1, c2);

      if (similarity > threshold) {
        rels.push({
          id: `sim-${c1.id}-${c2.id}`,
          source: c1.id,
          target: c2.id,
          sourceType: 'challenge',
          targetType: 'challenge',
          type: 'similar_to',
          strength: similarity,
          derivation: 'computed',
          metadata: {
            confidence: similarity,
          },
        });
      }
    }
  }

  return rels;
}

const atlasRelationships: UniversalRelationship[] = buildAtlasSimilarityRelationships(
  challenges as Challenge[],
  0.2
);

// ----------------------------------------------------------------------------
// Navigate (Ecosystem Mapping) → BaseEntity / Relationships
// ----------------------------------------------------------------------------

// Convert stakeholders, technologies, projects to BaseEntity[]
const navigateStakeholderEntities = stakeholdersToBaseEntities(navigateDummyData.stakeholders);
const navigateTechnologyEntities = technologiesToBaseEntities(navigateDummyData.technologies);
const navigateProjectEntities = projectsToBaseEntities(navigateDummyData.projects);

const navigateEntities: BaseEntity[] = [
  ...navigateStakeholderEntities,
  ...navigateTechnologyEntities,
  ...navigateProjectEntities,
];

// Helper to look up entity type for Navigate relationships
const navigateEntityTypeIndex: Map<string, EntityType> = new Map();

navigateStakeholderEntities.forEach(e => navigateEntityTypeIndex.set(e.id, 'stakeholder'));
navigateTechnologyEntities.forEach(e => navigateEntityTypeIndex.set(e.id, 'technology'));
navigateProjectEntities.forEach(e => navigateEntityTypeIndex.set(e.id, 'project'));

const getNavigateEntityType = (id: string): EntityType | null => {
  return navigateEntityTypeIndex.get(id) ?? null;
};

// Convert Navigate relationships to universal relationships
const navigateRelationships: UniversalRelationship[] = relationshipsToUniversal(
  navigateDummyData.relationships,
  getNavigateEntityType
);

// ----------------------------------------------------------------------------
// Unified exports
// ----------------------------------------------------------------------------

export const unifiedEntities: BaseEntity[] = [
  ...atlasEntities,
  ...navigateEntities,
  ...cpcSeedEntities,
];

export const unifiedRelationships: UniversalRelationship[] = [
  ...atlasRelationships,
  ...navigateRelationships,
  ...cpcSeedRelationships,
];

// ----------------------------------------------------------------------------
// Indexes & helper functions
// ----------------------------------------------------------------------------

export const entityIndex: Map<string, BaseEntity> = new Map(
  unifiedEntities.map((e) => [e.id, e])
);

export const getEntity = (id: string): BaseEntity | null =>
  entityIndex.get(id) ?? null;

export const getEntitiesByDomain = (domain: Domain): BaseEntity[] =>
  unifiedEntities.filter((e) => e.domain === domain);

export const getEntitiesByType = (type: EntityType): BaseEntity[] =>
  unifiedEntities.filter((e) => e.entityType === type);

export const getRelationshipsForEntity = (entityId: string): UniversalRelationship[] =>
  unifiedRelationships.filter((r) => r.source === entityId || r.target === entityId);



