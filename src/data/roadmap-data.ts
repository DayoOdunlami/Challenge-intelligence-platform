/**
 * NAVIGATE Roadmap Data
 * 
 * Extracted from HIA (Hydrogen in Aviation) Report - March 2024
 * Source: https://hydrogeninaviation.co.uk/wp-content/uploads/2024/03/Launching-Hydrogen-Powered-Aviation-Report.pdf
 */

export interface RoadmapItem {
  id: string;
  content: string;
  start: Date;
  end?: Date;
  group: 'technology' | 'infrastructure' | 'policy' | 'skills';
  type: 'point' | 'range' | 'background';
  className?: string;
  title?: string;
  description?: string;
  relatedEntities?: string[]; // IDs of related stakeholders/technologies
  source?: string;
  url?: string;
}

export interface RoadmapGroup {
  id: string;
  content: string;
  className?: string;
  order?: number;
}

/**
 * HIA Decarbonisation Roadmap
 * Timeline showing milestones across Technology, Infrastructure, Policy, and Skills tracks
 */
export const hiaRoadmap: RoadmapItem[] = [
  // ============================================================================
  // SHORT-TERM (2024-2026)
  // ============================================================================
  
  // Policy Track
  {
    id: 'caa-funding-2025',
    content: 'CAA Funding & Capacity',
    start: new Date('2025-01-01'),
    group: 'policy',
    type: 'point',
    title: 'CAA Appropriately Resourced',
    description: 'CAA should be appropriately resourced to develop required standards, procedures, and regulations for hydrogen-powered aviation',
    relatedEntities: ['org-caa-001'],
    source: 'HIA Report 2024',
    className: 'policy-milestone'
  },
  {
    id: 'airport-masterplans-2024',
    content: 'Airport Masterplans Updated',
    start: new Date('2024-01-01'),
    group: 'policy',
    type: 'point',
    title: 'Updated Airport Masterplan Guidance',
    description: 'Government should update guidance on airport masterplans to consider future hydrogen infrastructure needs',
    relatedEntities: ['org-dft-001'],
    source: 'HIA Report 2024',
    className: 'policy-milestone'
  },
  {
    id: 'hydrogen-academy-2025',
    content: 'National Hydrogen Academy',
    start: new Date('2025-01-01'),
    group: 'skills',
    type: 'point',
    title: 'National Hydrogen Academy Operational',
    description: 'Government should establish a National Hydrogen Academy, to be operational by 2025',
    relatedEntities: ['org-dft-001', 'org-beis-001'],
    source: 'HIA Report 2024',
    className: 'skills-milestone'
  },
  
  // Infrastructure Track
  {
    id: 'liquid-hydrogen-supply-2024',
    content: 'Liquid Hydrogen Supply',
    start: new Date('2024-01-01'),
    group: 'infrastructure',
    type: 'range',
    end: new Date('2026-12-31'),
    title: 'Liquid Hydrogen Supply for R&D',
    description: 'Government should ensure sufficient domestic supply of liquid hydrogen to support R&D and testing in the UK',
    relatedEntities: ['org-beis-001'],
    source: 'HIA Report 2024',
    className: 'infrastructure-range'
  },
  {
    id: 'hydrogen-demand-estimates-2024',
    content: 'Aviation Hydrogen Demand Estimates',
    start: new Date('2024-01-01'),
    group: 'infrastructure',
    type: 'point',
    title: 'Demand Estimates Completed',
    description: 'Aviation hydrogen demand estimates should form part of national calculations for future hydrogen demand',
    relatedEntities: ['org-dft-001', 'org-beis-001'],
    source: 'HIA Report 2024',
    className: 'infrastructure-milestone'
  },
  
  // Technology Track
  {
    id: 'r-d-funding-reforms-2024',
    content: 'R&D Funding Reforms',
    start: new Date('2024-01-01'),
    group: 'technology',
    type: 'point',
    title: 'UK R&D Funding Rules Amended',
    description: 'Amend UK R&D funding rules to allow public investment in aerospace technologies beyond TRL6',
    relatedEntities: ['org-ati-001', 'org-dft-001'],
    source: 'HIA Report 2024',
    className: 'technology-milestone'
  },
  
  // ============================================================================
  // MEDIUM-TERM (2027-2030)
  // ============================================================================
  
  // Infrastructure Track
  {
    id: 'test-hubs-2027',
    content: 'Two Medium-Scale Test Hubs',
    start: new Date('2027-01-01'),
    group: 'infrastructure',
    type: 'point',
    title: 'Liquid Hydrogen Test Hubs',
    description: 'Support development of two medium-scale liquid hydrogen Test Hubs and mature the UK\'s test capability network',
    relatedEntities: ['org-rolls-royce-001', 'org-airbus-001', 'org-zeroavia-001'],
    source: 'HIA Report 2024',
    className: 'infrastructure-milestone'
  },
  {
    id: 'pioneer-airports-2027',
    content: 'Hydrogen Pioneer Airports Network',
    start: new Date('2027-01-01'),
    group: 'infrastructure',
    type: 'range',
    end: new Date('2030-12-31'),
    title: 'Pioneer Airports Network',
    description: 'Create network of hydrogen pioneer airports to serve as testing ground for accelerating hydrogen-powered aviation',
    relatedEntities: ['org-bristol-airport-001', 'org-heathrow-001'],
    source: 'HIA Report 2024',
    className: 'infrastructure-range'
  },
  
  // Technology Track
  {
    id: 'zeroe-launch-2030',
    content: 'ZEROe Programme Launch',
    start: new Date('2030-01-01'),
    group: 'technology',
    type: 'point',
    title: 'Airbus ZEROe Programme Launch',
    description: 'By the end of this decade, Airbus will have launched its commercial hydrogen-powered aircraft programme',
    relatedEntities: ['org-airbus-001'],
    source: 'HIA Report 2024',
    className: 'technology-milestone'
  },
  {
    id: 'regional-zero-emissions-2030',
    content: 'Regional Zero-Emissions Aircraft',
    start: new Date('2030-01-01'),
    group: 'technology',
    type: 'point',
    title: 'Zero-Emissions Regional Aircraft',
    description: 'ZeroAvia pledges to enable regional aircraft flying with zero-emissions this decade',
    relatedEntities: ['org-zeroavia-001'],
    source: 'HIA Report 2024',
    className: 'technology-milestone'
  },
  
  // Policy Track
  {
    id: 'industrial-strategy-2025',
    content: 'Industrial Strategy Plan',
    start: new Date('2025-12-31'),
    group: 'policy',
    type: 'point',
    title: 'Industrial Strategy for Aviation',
    description: 'Industrial strategy for aviation needs agreed objectives and plan by end of 2025',
    relatedEntities: ['org-dft-001', 'org-beis-001'],
    source: 'HIA Report 2024',
    className: 'policy-milestone'
  },
  
  // ============================================================================
  // LONG-TERM (2031-2050)
  // ============================================================================
  
  // Technology Track
  {
    id: 'zeroe-commercial-2035',
    content: 'ZEROe Commercial Service',
    start: new Date('2035-01-01'),
    group: 'technology',
    type: 'point',
    title: 'Airbus ZEROe Aircraft Entering Service',
    description: 'Airbus has the ambition to deliver first ZEROe aircraft by 2035, powered by hydrogen',
    relatedEntities: ['org-airbus-001'],
    source: 'HIA Report 2024',
    className: 'technology-milestone'
  },
  {
    id: 'narrowbody-zero-2030s',
    content: 'Narrowbody Zero-Emissions',
    start: new Date('2030-01-01'),
    group: 'technology',
    type: 'range',
    end: new Date('2039-12-31'),
    title: 'Narrowbody Zero-Emissions Aircraft',
    description: 'ZeroAvia scaling technologies to support true zero flight in narrowbody aircraft in the 2030s',
    relatedEntities: ['org-zeroavia-001'],
    source: 'HIA Report 2024',
    className: 'technology-range'
  },
  
  // Infrastructure Track
  {
    id: 'commercial-flights-2035',
    content: 'Commercial Hydrogen Flights',
    start: new Date('2035-01-01'),
    group: 'infrastructure',
    type: 'point',
    title: 'Commercial Hydrogen Flights Operational',
    description: 'Bristol Airport pledges to actively support development of Airport hydrogen infrastructure with aim of enabling commercial flights by 2035',
    relatedEntities: ['org-bristol-airport-001', 'org-easyjet-001'],
    source: 'HIA Report 2024',
    className: 'infrastructure-milestone'
  },
  {
    id: 'saf-certification-2030',
    content: '100% SAF Certification',
    start: new Date('2030-01-01'),
    group: 'technology',
    type: 'point',
    title: '100% SAF Certification',
    description: 'Airbus aims to certify all civil aircraft to be able to run on 100% SAF by 2030',
    relatedEntities: ['org-airbus-001'],
    source: 'HIA Report 2024',
    className: 'technology-milestone'
  },
  
  // Background periods
  {
    id: 'short-term-bg',
    content: 'Short-term Period',
    start: new Date('2024-01-01'),
    end: new Date('2026-12-31'),
    group: 'policy',
    type: 'background',
    className: 'period-background'
  },
  {
    id: 'medium-term-bg',
    content: 'Medium-term Period',
    start: new Date('2027-01-01'),
    end: new Date('2030-12-31'),
    group: 'policy',
    type: 'background',
    className: 'period-background'
  },
  {
    id: 'long-term-bg',
    content: 'Long-term Period',
    start: new Date('2031-01-01'),
    end: new Date('2050-12-31'),
    group: 'policy',
    type: 'background',
    className: 'period-background'
  }
];

/**
 * Roadmap Groups (Tracks)
 */
export const roadmapGroups: RoadmapGroup[] = [
  {
    id: 'technology',
    content: 'Technology',
    className: 'technology-track',
    order: 1
  },
  {
    id: 'infrastructure',
    content: 'Infrastructure',
    className: 'infrastructure-track',
    order: 2
  },
  {
    id: 'policy',
    content: 'Policy',
    className: 'policy-track',
    order: 3
  },
  {
    id: 'skills',
    content: 'Skills',
    className: 'skills-track',
    order: 4
  }
];

/**
 * Convert roadmap items to vis-timeline format
 */
export function convertToTimelineFormat(items: RoadmapItem[], groups: RoadmapGroup[]) {
  const timelineItems = items.map(item => ({
    id: item.id,
    content: item.content,
    start: item.start,
    end: item.end || undefined,
    group: item.group,
    type: item.type,
    className: item.className,
    title: item.title,
    description: item.description,
    relatedEntities: item.relatedEntities,
    source: item.source
  }));

  const timelineGroups = groups.map(group => ({
    id: group.id,
    content: group.content,
    className: group.className,
    order: group.order
  }));

  return { items: timelineItems, groups: timelineGroups };
}

