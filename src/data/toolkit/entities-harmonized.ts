/**
 * Harmonized Entity Data Structure
 * Shared between Stakeholder Dynamics and Innovation Tracker
 * All entities have consistent IDs, colors, and metadata
 */

export interface HarmonizedEntity {
  id: string;
  displayName: string;
  type: EntityType;
  category: EntityCategory;
  color: string; // Hex color matching Stakeholder Dynamics palette
  parent?: string; // For hierarchical relationships
  metadata: {
    sector?: string;
    description?: string;
    website?: string;
    contact?: {
      email?: string;
      person?: string;
    };
  };
  metrics?: {
    totalFundingReceived?: number; // £
    totalFundingProvided?: number; // £
    fundingCapacity?: 'High' | 'Medium' | 'Low';
    influenceScore?: number;
    relationshipCount?: number;
    jobsSupported?: number;
    projectsCount?: number;
  };
  knowledgeBase?: {
    keyProgrammes?: string[];
    recentAnnouncements?: Array<{
      title: string;
      date: string;
      url: string;
      amount?: number;
    }>;
    evidence?: Array<{
      source: string;
      url: string;
      date: string;
      type: 'press_release' | 'gov_publication' | 'statistics' | 'policy';
    }>;
  };
}

export type EntityType = 
  | 'source'
  | 'government_dept'
  | 'intermediary'
  | 'private_company'
  | 'recipient'
  | 'final_outcome';

export type EntityCategory = 
  | 'Public Source'
  | 'Private Source'
  | 'Government Department'
  | 'Research & Innovation'
  | 'Regulatory Body'
  | 'Private Industry'
  | 'Research Institute'
  | 'Programme'
  | 'Outcome';

// Color scheme matching Stakeholder Dynamics
const COLORS = {
  GOVERNMENT: '#006E51',      // CPC Primary Teal
  RESEARCH: '#50C878',        // CPC Success Green
  INDUSTRY: '#F5A623',        // CPC Warning Amber
  INTERMEDIARY: '#4A90E2',    // CPC Info Blue
  PRIVATE: '#EF4444',         // Red for private funding
  PUBLIC: '#6b7280',          // Grey for public funding
  OUTCOME: '#9333EA',         // Purple for outcomes
};

/**
 * Harmonized entities database
 * All entities referenced in Innovation Tracker and Stakeholder Dynamics
 */
export const harmonizedEntities: Record<string, HarmonizedEntity> = {
  // Sources
  'public': {
    id: 'public',
    displayName: 'Public',
    type: 'source',
    category: 'Public Source',
    color: COLORS.PUBLIC,
    metadata: {
      description: 'Public funding sources for zero emission aviation',
      sector: 'Public Finance',
    },
    metrics: {
      totalFundingProvided: 17400000000, // £17.4bn (ONS 2023)
      fundingCapacity: 'High',
    },
    knowledgeBase: {
      evidence: [
        {
          source: 'ONS - UK Government R&D Expenditure 2023',
          url: 'https://www.ons.gov.uk/economy/governmentpublicsectorandtaxes/researchanddevelopmentexpenditure/bulletins/ukgovernmentexpenditureonscienceengineeringandtechnology/latest',
          date: '2025-04-09',
          type: 'statistics',
        },
      ],
    },
  },
  'private': {
    id: 'private',
    displayName: 'Private',
    type: 'source',
    category: 'Private Source',
    color: COLORS.PRIVATE,
    metadata: {
      description: 'Private sector investment in zero emission aviation',
      sector: 'Private Finance',
    },
    metrics: {
      totalFundingProvided: 49900000000, // £49.9bn business sector (2022)
      fundingCapacity: 'High',
    },
  },

  // Government Departments
  'dft': {
    id: 'dft',
    displayName: 'DfT',
    type: 'government_dept',
    category: 'Government Department',
    color: COLORS.GOVERNMENT,
    parent: 'public',
    metadata: {
      description: 'Department for Transport',
      sector: 'Transport',
      website: 'https://www.gov.uk/government/organisations/department-for-transport',
    },
    knowledgeBase: {
      keyProgrammes: ['Future Flight Programme', 'Advanced Fuels Fund', 'Zero Emission Flight Delivery Group'],
      recentAnnouncements: [
        {
          title: 'Over £4 million government backing for next-gen aviation technology projects',
          date: '2025-09-29',
          url: 'https://www.gov.uk/government/news/over-4-million-government-backing-for-next-gen-aviation-technology-projects',
          amount: 4400000,
        },
        {
          title: '£63 million lift-off for clean aviation fuels',
          date: '2025-07-22',
          url: 'https://www.gov.uk/government/news/63-million-lift-off-for-clean-aviation-fuels',
          amount: 63000000,
        },
      ],
    },
  },
  'dbt': {
    id: 'dbt',
    displayName: 'DBT',
    type: 'government_dept',
    category: 'Government Department',
    color: COLORS.GOVERNMENT,
    parent: 'public',
    metadata: {
      description: 'Department for Business and Trade',
      sector: 'Business',
      website: 'https://www.gov.uk/government/organisations/department-for-business-and-trade',
    },
    knowledgeBase: {
      keyProgrammes: ['ATI Programme', 'Aerospace Technology Institute'],
      recentAnnouncements: [
        {
          title: '£250m for green aerospace projects ahead of Industrial Strategy',
          date: '2025-06-17',
          url: 'https://www.gov.uk/government/news/250m-for-green-aerospace-projects-ahead-of-industrial-strategy',
          amount: 250000000,
        },
      ],
    },
  },
  'dsit': {
    id: 'dsit',
    displayName: 'DSIT',
    type: 'government_dept',
    category: 'Government Department',
    color: COLORS.GOVERNMENT,
    parent: 'public',
    metadata: {
      description: 'Department for Science, Innovation and Technology',
      sector: 'Science & Innovation',
      website: 'https://www.gov.uk/government/organisations/department-for-science-innovation-and-technology',
    },
    metrics: {
      totalFundingProvided: 6300000000, // UKRI allocation (36.2% of £17.4bn)
    },
    knowledgeBase: {
      keyProgrammes: ['UKRI', 'Innovate UK'],
    },
  },
  'desnez': {
    id: 'desnez',
    displayName: 'DESNZ',
    type: 'government_dept',
    category: 'Government Department',
    color: COLORS.GOVERNMENT,
    parent: 'public',
    metadata: {
      description: 'Department for Energy Security and Net Zero',
      sector: 'Energy',
      website: 'https://www.gov.uk/government/organisations/department-for-energy-security-and-net-zero',
    },
    knowledgeBase: {
      keyProgrammes: ['Advanced Fuels Fund', 'Hydrogen Strategy'],
    },
  },
  'dwp': {
    id: 'dwp',
    displayName: 'DWP',
    type: 'government_dept',
    category: 'Government Department',
    color: COLORS.GOVERNMENT,
    parent: 'public',
    metadata: {
      description: 'Department for Work and Pensions',
      sector: 'Employment',
    },
  },
  'dbeis': {
    id: 'dbeis',
    displayName: 'DBEIS',
    type: 'government_dept',
    category: 'Government Department',
    color: COLORS.GOVERNMENT,
    parent: 'public',
    metadata: {
      description: 'Department for Business, Energy & Industrial Strategy (legacy)',
      sector: 'Business',
    },
  },
  'hse': {
    id: 'hse',
    displayName: 'HSE',
    type: 'government_dept',
    category: 'Regulatory Body',
    color: COLORS.GOVERNMENT,
    metadata: {
      description: 'Health and Safety Executive',
      sector: 'Regulation',
    },
  },

  // Intermediaries
  'ukri': {
    id: 'ukri',
    displayName: 'UKRI',
    type: 'intermediary',
    category: 'Research & Innovation',
    color: COLORS.INTERMEDIARY,
    metadata: {
      description: 'UK Research and Innovation',
      sector: 'Research & Innovation',
      website: 'https://www.ukri.org/',
    },
    metrics: {
      totalFundingReceived: 6300000000, // £6.3bn (2023)
      totalFundingProvided: 6300000000,
      fundingCapacity: 'High',
      influenceScore: 95,
    },
    knowledgeBase: {
      keyProgrammes: ['Innovate UK', 'Research Councils', 'Future Flight Challenge'],
      evidence: [
        {
          source: 'ONS - UK Government R&D Expenditure 2023',
          url: 'https://www.ons.gov.uk/economy/governmentpublicsectorandtaxes/researchanddevelopmentexpenditure/bulletins/ukgovernmentexpenditureonscienceengineeringandtechnology/latest',
          date: '2025-04-09',
          type: 'statistics',
        },
      ],
    },
  },
  'iuk': {
    id: 'iuk',
    displayName: 'Innovate UK',
    type: 'intermediary',
    category: 'Research & Innovation',
    color: COLORS.INTERMEDIARY,
    parent: 'ukri',
    metadata: {
      description: 'Innovate UK - part of UKRI',
      sector: 'Innovation',
      website: 'https://www.ukri.org/councils/innovate-uk/',
    },
    knowledgeBase: {
      keyProgrammes: ['Future Flight Programme', 'ATI Programme Delivery'],
      recentAnnouncements: [
        {
          title: 'Future Flight Programme - Regional Demonstrators',
          date: '2025-09-29',
          url: 'https://www.ukri.org/what-we-do/what-we-have-funded/innovate-uk/',
          amount: 4400000,
        },
      ],
    },
  },
  'caa': {
    id: 'caa',
    displayName: 'CAA',
    type: 'intermediary',
    category: 'Regulatory Body',
    color: COLORS.INTERMEDIARY,
    metadata: {
      description: 'Civil Aviation Authority',
      sector: 'Regulation',
      website: 'https://www.caa.co.uk/',
    },
  },

  // Private Companies
  'airbus': {
    id: 'airbus',
    displayName: 'Airbus',
    type: 'private_company',
    category: 'Private Industry',
    color: COLORS.PRIVATE,
    parent: 'private',
    metadata: {
      description: 'Airbus UK - Aerospace manufacturer',
      sector: 'Aerospace',
      website: 'https://www.airbus.com/',
    },
    metrics: {
      totalFundingReceived: 35000000, // ZEDC Phase 2
      jobsSupported: 100000, // UK aerospace sector (ADS 2024)
      influenceScore: 90,
    },
    knowledgeBase: {
      keyProgrammes: ['ZeroE Development Centre (ZEDC)', 'ATI Programme'],
      recentAnnouncements: [
        {
          title: 'ZEROe Development Centre Capital and Infrastructure Phase 2',
          date: '2025-06-17',
          url: 'https://www.gov.uk/government/news/250m-for-green-aerospace-projects-ahead-of-industrial-strategy',
          amount: 35000000,
        },
      ],
    },
  },

  // Recipients
  'ati': {
    id: 'ati',
    displayName: 'ATI',
    type: 'recipient',
    category: 'Research Institute',
    color: COLORS.RESEARCH,
    metadata: {
      description: 'Aerospace Technology Institute',
      sector: 'Aerospace R&D',
      website: 'https://www.ati.org.uk/',
    },
    metrics: {
      totalFundingReceived: 975000000, // 2025-2030 allocation
      totalFundingProvided: 250000000, // Latest round (June 2025)
      fundingCapacity: 'High',
      projectsCount: 302, // SMEs supported since 2013
      influenceScore: 88,
    },
    knowledgeBase: {
      keyProgrammes: ['ATI Programme', 'Destination Zero', 'Hydrogen Capability Network'],
      recentAnnouncements: [
        {
          title: '£250m for green aerospace projects ahead of Industrial Strategy',
          date: '2025-06-17',
          url: 'https://www.gov.uk/government/news/250m-for-green-aerospace-projects-ahead-of-industrial-strategy',
          amount: 250000000,
        },
      ],
      evidence: [
        {
          source: 'GOV.UK - ATI Programme Funding',
          url: 'https://www.gov.uk/government/news/250m-for-green-aerospace-projects-ahead-of-industrial-strategy',
          date: '2025-06-17',
          type: 'press_release',
        },
      ],
    },
  },
  'cpc': {
    id: 'cpc',
    displayName: 'CPC',
    type: 'recipient',
    category: 'Research Institute',
    color: COLORS.RESEARCH,
    metadata: {
      description: 'Connected Places Catapult',
      sector: 'Transport Innovation',
      website: 'https://cp.catapult.org.uk/',
    },
  },
  'esc': {
    id: 'esc',
    displayName: 'ESC',
    type: 'recipient',
    category: 'Programme',
    color: COLORS.INTERMEDIARY,
    metadata: {
      description: 'Early Stage Company Support Programme',
      sector: 'Innovation',
    },
  },
  'trig': {
    id: 'trig',
    displayName: 'TRIG',
    type: 'recipient',
    category: 'Programme',
    color: COLORS.OUTCOME,
    metadata: {
      description: 'Transport Research and Innovation Grants',
      sector: 'Transport Research',
    },
  },
  'milestone': {
    id: 'milestone',
    displayName: 'Milestone',
    type: 'final_outcome',
    category: 'Outcome',
    color: COLORS.OUTCOME,
    metadata: {
      description: 'Project Milestones and Outcomes',
      sector: 'Innovation Outcomes',
    },
  },
};

/**
 * Get entity by ID
 */
export function getEntity(id: string): HarmonizedEntity | undefined {
  return harmonizedEntities[id];
}

/**
 * Get all entities of a specific type
 */
export function getEntitiesByType(type: EntityType): HarmonizedEntity[] {
  return Object.values(harmonizedEntities).filter(e => e.type === type);
}

/**
 * Get entities by category
 */
export function getEntitiesByCategory(category: EntityCategory): HarmonizedEntity[] {
  return Object.values(harmonizedEntities).filter(e => e.category === category);
}

