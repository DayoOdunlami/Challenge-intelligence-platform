import type { BaseEntity, UniversalRelationship } from '@/lib/base-entity';

/**
 * Lightweight CPC internal seed data so the unified graph
 * can render a distinct `cpc-internal` cluster.
 *
 * This is intentionally small and hand-crafted. In a later
 * step we will replace/extend this with data parsed from:
 * - `public/CPC data/Project List.csv`
 * - `public/CPC data/From Vanessa.csv`
 * - `public/CPC data/Inudstrial Strategy.csv`
 */

export const cpcSeedEntities: BaseEntity[] = [
  // Supply-side capabilities
  {
    _version: '1.0',
    id: 'cpc-capability-consortium-building',
    name: 'Consortium Building',
    description: 'CPC capability to assemble cross-sector consortia for bids, projects and living labs.',
    entityType: 'capability',
    domain: 'cpc-internal',
    metadata: {
      tags: ['supply-side', 'partnerships'],
      custom: {
        capabilityType: 'supply',
        isCoreCapability: true,
        businessUnit: 'Transport',
        priority: 'high',
      },
    },
  },
  {
    _version: '1.0',
    id: 'cpc-capability-de-risking',
    name: 'De-risking',
    description: 'CPC capability to de-risk innovation through prototyping, testing and validation.',
    entityType: 'capability',
    domain: 'cpc-internal',
    metadata: {
      tags: ['supply-side', 'prototyping'],
      custom: {
        capabilityType: 'supply',
        isCoreCapability: true,
        businessUnit: 'Transport',
        priority: 'high',
      },
    },
  },
  {
    _version: '1.0',
    id: 'cpc-capability-technology-roadmapping',
    name: 'Technology Roadmapping',
    description: 'CPC capability to develop technology roadmaps and strategic planning.',
    entityType: 'capability',
    domain: 'cpc-internal',
    metadata: {
      tags: ['supply-side', 'strategy'],
      custom: {
        capabilityType: 'supply',
        isCoreCapability: true,
        businessUnit: 'Transport',
        priority: 'medium',
      },
    },
  },
  // Demand-side capabilities
  {
    _version: '1.0',
    id: 'cpc-capability-stakeholder-engagement',
    name: 'Stakeholder Engagement',
    description: 'CPC capability to convene and engage stakeholders across government, industry and academia.',
    entityType: 'capability',
    domain: 'cpc-internal',
    metadata: {
      tags: ['demand-side', 'engagement'],
      custom: {
        capabilityType: 'demand',
        isCoreCapability: true,
        businessUnit: 'Transport',
        priority: 'high',
      },
    },
  },
  {
    _version: '1.0',
    id: 'cpc-capability-use-case-development',
    name: 'Use Case Development',
    description: 'CPC capability to identify and develop use cases for innovation adoption.',
    entityType: 'capability',
    domain: 'cpc-internal',
    metadata: {
      tags: ['demand-side', 'use-cases'],
      custom: {
        capabilityType: 'demand',
        isCoreCapability: true,
        businessUnit: 'Transport',
        priority: 'medium',
      },
    },
  },
  // Both supply and demand
  {
    _version: '1.0',
    id: 'cpc-capability-testbeds-living-labs',
    name: 'Testbeds & Living Labs',
    description: 'CPC capability to design and operate testbeds and living labs for innovation validation.',
    entityType: 'capability',
    domain: 'cpc-internal',
    metadata: {
      tags: ['testbeds', 'living-labs'],
      custom: {
        capabilityType: 'both',
        isCoreCapability: true,
        businessUnit: 'Transport',
        priority: 'high',
      },
    },
  },
  // Initiatives
  {
    _version: '1.0',
    id: 'cpc-initiative-connected-airport-living-lab',
    name: 'Connected Airport Living Lab',
    description: 'CPC-led initiative exploring integrated airport operations, passenger experience and decarbonisation.',
    entityType: 'initiative',
    domain: 'cpc-internal',
    metadata: {
      tags: ['living-lab', 'airport'],
      sector: 'aviation',
      custom: {
        modes: ['aviation'],
        strategicThemes: ['people-experience', 'decarbonisation', 'data-and-digital'],
        stage: 'development',
        businessUnit: 'Transport',
      },
    },
  },
  {
    _version: '1.0',
    id: 'cpc-initiative-rail-innovation-zone',
    name: 'Rail Innovation Zone',
    description: 'CPC-led initiative to create a rail innovation zone for testing and validation of new rail technologies.',
    entityType: 'initiative',
    domain: 'cpc-internal',
    metadata: {
      tags: ['rail', 'innovation-zone'],
      sector: 'rail',
      custom: {
        modes: ['rail'],
        strategicThemes: ['decarbonisation', 'planning-and-operation'],
        stage: 'validation',
        businessUnit: 'Transport',
      },
    },
  },
];

export const cpcSeedRelationships: UniversalRelationship[] = [
  // Connected Airport Living Lab relationships
  {
    id: 'rel-cpc-airport-stakeholder-engagement',
    source: 'cpc-initiative-connected-airport-living-lab',
    target: 'cpc-capability-stakeholder-engagement',
    sourceType: 'initiative',
    targetType: 'capability',
    type: 'requires_capability',
    strength: 1,
    derivation: 'explicit',
    metadata: {
      confidence: 0.9,
    },
  },
  {
    id: 'rel-cpc-airport-consortium-building',
    source: 'cpc-initiative-connected-airport-living-lab',
    target: 'cpc-capability-consortium-building',
    sourceType: 'initiative',
    targetType: 'capability',
    type: 'requires_capability',
    strength: 0.9,
    derivation: 'explicit',
    metadata: {
      confidence: 0.9,
    },
  },
  {
    id: 'rel-cpc-airport-testbeds',
    source: 'cpc-initiative-connected-airport-living-lab',
    target: 'cpc-capability-testbeds-living-labs',
    sourceType: 'initiative',
    targetType: 'capability',
    type: 'requires_capability',
    strength: 1,
    derivation: 'explicit',
    metadata: {
      confidence: 0.9,
    },
  },
  // Rail Innovation Zone relationships
  {
    id: 'rel-cpc-rail-de-risking',
    source: 'cpc-initiative-rail-innovation-zone',
    target: 'cpc-capability-de-risking',
    sourceType: 'initiative',
    targetType: 'capability',
    type: 'requires_capability',
    strength: 0.9,
    derivation: 'explicit',
    metadata: {
      confidence: 0.9,
    },
  },
  {
    id: 'rel-cpc-rail-roadmapping',
    source: 'cpc-initiative-rail-innovation-zone',
    target: 'cpc-capability-technology-roadmapping',
    sourceType: 'initiative',
    targetType: 'capability',
    type: 'requires_capability',
    strength: 0.8,
    derivation: 'explicit',
    metadata: {
      confidence: 0.9,
    },
  },
  {
    id: 'rel-cpc-rail-use-case',
    source: 'cpc-initiative-rail-innovation-zone',
    target: 'cpc-capability-use-case-development',
    sourceType: 'initiative',
    targetType: 'capability',
    type: 'requires_capability',
    strength: 0.7,
    derivation: 'explicit',
    metadata: {
      confidence: 0.9,
    },
  },
];
