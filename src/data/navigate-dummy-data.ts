// NAVIGATE Platform - Dummy Dataset
// Realistic data for visualization and development
// 50+ entities with meaningful relationships

import { NavigateDataset, Stakeholder, Technology, FundingEvent, Project, Relationship } from '@/lib/navigate-types';

// ============================================================================
// Helper: Create timestamps
// ============================================================================

const now = new Date().toISOString();
const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString();

// ============================================================================
// Stakeholders (30 entities)
// ============================================================================

const stakeholders: Stakeholder[] = [
  // Government (8)
  {
    id: 'org-dft-001',
    name: 'Department for Transport',
    type: 'Government',
    sector: 'Transport',
    funding_capacity: 'High',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: {
      website: 'https://www.gov.uk/dft',
      email: 'public.enquiries@dft.gov.uk'
    },
    description: 'UK government department responsible for transport strategy and policy',
    tags: ['policy', 'funding', 'infrastructure', 'aviation'],
    data_quality: { confidence: 'verified', last_verified: now },
    capacity_scenarios: { optimistic: 150000000, conservative: 80000000, current: 125000000 },
    created_at: twoYearsAgo,
    updated_at: now,
    knowledge_base: {
      content: `# Strategic Position
The Department for Transport (DfT) is the UK government's lead department for transport policy. In zero emission aviation, DfT plays a critical role in setting policy frameworks, allocating funding, and coordinating cross-sector initiatives.

## Key Responsibilities
- Setting UK aviation decarbonization targets (net zero by 2050)
- Managing funding programs through intermediaries (ATI, Innovate UK)
- Coordinating with CAA on regulatory frameworks
- International collaboration (ICAO, EU)

## Funding Strategy
DfT allocates approximately £125M annually to zero emission aviation through:
- ATI Programme (primary channel)
- Future Flight Challenge
- Direct grants to strategic projects

## Strategic Priorities
1. Hydrogen aviation infrastructure
2. Battery-electric for short-haul
3. Sustainable aviation fuels (SAF)
4. Regulatory framework development

## Key Milestones
- 2019: Jet Zero Strategy launched
- 2021: ATI Programme expanded
- 2023: Hydrogen infrastructure roadmap published
- 2024: Certification standards working group established`,
      sources: [
        { title: 'Jet Zero Strategy', url: 'https://www.gov.uk/jet-zero', date: '2021-07-19', type: 'report' },
        { title: 'DfT Annual Report 2024', url: 'https://www.gov.uk/dft', date: '2024-03-15', type: 'report' }
      ],
      last_updated: now,
      contributors: ['admin'],
      tags: ['strategic', 'policy', 'funding'],
      confidence: 'verified'
    }
  },
  {
    id: 'org-ukri-001',
    name: 'UK Research and Innovation',
    type: 'Government',
    sector: 'Research',
    funding_capacity: 'High',
    location: { city: 'Swindon', region: 'South West', country: 'UK' },
    contact: { website: 'https://www.ukri.org' },
    description: 'UKRI funds and supports research and innovation across all sectors',
    tags: ['research', 'funding', 'innovation'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-beis-001',
    name: 'Department for Business, Energy & Industrial Strategy',
    type: 'Government',
    sector: 'Energy',
    funding_capacity: 'High',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: { website: 'https://www.gov.uk/beis' },
    description: 'Government department supporting business, energy, and industrial strategy',
    tags: ['policy', 'energy', 'industrial-strategy'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // Intermediaries (6)
  {
    id: 'org-ati-001',
    name: 'Aerospace Technology Institute',
    type: 'Intermediary',
    sector: 'Aerospace',
    funding_capacity: 'High',
    location: { city: 'Cranfield', region: 'East of England', country: 'UK' },
    contact: {
      website: 'https://www.ati.org.uk',
      email: 'info@ati.org.uk'
    },
    description: "UK's national institute for aerospace research and technology development",
    tags: ['intermediary', 'funding', 'research', 'aviation'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now,
    knowledge_base: {
      content: `# Strategic Position
The Aerospace Technology Institute (ATI) is the UK's primary intermediary for aerospace R&D funding, managing government investment in zero emission aviation technologies.

## Role
ATI distributes DfT funding to industry and research organizations, focusing on:
- Technology readiness advancement (TRL 3-7)
- Collaborative R&D programs
- Industry-academia partnerships

## Funding Programs
- ATI Programme (main channel)
- Future Flight Challenge
- Collaborative R&D competitions

## Key Relationships
- Primary funder: DfT
- Key recipients: ZeroAvia, Rolls-Royce, universities
- Strategic partner: Innovate UK`,
      sources: [
        { title: 'ATI Annual Report 2024', url: 'https://www.ati.org.uk', date: '2024-06-01', type: 'report' }
      ],
      last_updated: now,
      contributors: ['admin'],
      tags: ['strategic', 'funding', 'intermediary'],
      confidence: 'verified'
    }
  },
  {
    id: 'org-innovate-uk-001',
    name: 'Innovate UK',
    type: 'Intermediary',
    sector: 'Research',
    funding_capacity: 'High',
    location: { city: 'Swindon', region: 'South West', country: 'UK' },
    contact: { website: 'https://www.ukri.org/councils/innovate-uk/' },
    description: 'UK\'s innovation agency, part of UKRI',
    tags: ['intermediary', 'funding', 'innovation'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // Research (10)
  {
    id: 'org-cranfield-001',
    name: 'Cranfield University',
    type: 'Research',
    sector: 'Aerospace',
    funding_capacity: 'Medium',
    location: { city: 'Cranfield', region: 'East of England', country: 'UK' },
    contact: {
      website: 'https://www.cranfield.ac.uk',
      email: 'aviation@cranfield.ac.uk'
    },
    description: 'Leading UK university for aerospace research and education',
    tags: ['university', 'research', 'fuel-cells', 'hydrogen'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-bristol-001',
    name: 'University of Bristol',
    type: 'Research',
    sector: 'Aerospace',
    funding_capacity: 'Medium',
    location: { city: 'Bristol', region: 'South West', country: 'UK' },
    contact: { website: 'https://www.bristol.ac.uk' },
    description: 'Research university with strong aerospace engineering programs',
    tags: ['university', 'research', 'aircraft-design'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-manchester-001',
    name: 'University of Manchester',
    type: 'Research',
    sector: 'Energy',
    funding_capacity: 'Medium',
    location: { city: 'Manchester', region: 'North West', country: 'UK' },
    contact: { website: 'https://www.manchester.ac.uk' },
    description: 'Research university with hydrogen production expertise',
    tags: ['university', 'research', 'hydrogen-production'],
    data_quality: { confidence: 'estimated', last_verified: lastYear },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // Industry (6)
  {
    id: 'org-zeroavia-001',
    name: 'ZeroAvia',
    type: 'Industry',
    sector: 'Aviation',
    funding_capacity: 'High',
    location: { city: 'London', region: 'South East', country: 'UK' },
    contact: {
      website: 'https://www.zeroavia.com/',
      email: 'contact@zeroavia.com'
    },
    description: 'British-American startup pioneering hydrogen-electric propulsion for commercial aircraft',
    tags: ['industry', 'hydrogen', 'fuel-cell', 'startup'],
    data_quality: {
      confidence: 'verified',
      last_verified: '2025-06-16',
      verified_by: 'zeroavia.com'
    },
    capacity_scenarios: {
      optimistic: 90000000,
      conservative: 40000000,
      current: 62000000
    },
    knowledge_base: {
      content: `# Company Overview
ZeroAvia is an aviation technology company focused on developing hydrogen-electric engines, fuel cells, and associated aircraft systems to enable zero-emission commercial flight.

## Key Capabilities
- 600kW hydrogen-electric powertrain for 10–20 seat aircraft (certification underway)
- Emerging ZA2000 system for 40–80 seat aircraft
- Expertise in liquid hydrogen system integration, refueling, storage, and certification
- Leadership in flight testing and ground demonstration

## Strategic Partnerships & Programs
- Awarded UK Government grant for LH-SIFT project (liquid hydrogen management system and flight testbed, 2025)
- Collaboration with Green Resource Engineering, Gas & Liquid Controls, CAA, ATI, and Cranfield University
- International partnerships with US, EU, and other global hydrogen aviation entities

## Current Status & Impact
- Active flight test programs for H2 propulsion
- Advances UK leadership in hydrogen-powered aircraft and airport infrastructure
- Enabling critical progress on certification, regulatory standards, and value chain development`,
      sources: [
        {
          title: 'ZeroAvia Awarded UK Government Grant',
          url: 'https://www.zeroavia.com/news/zeroavia-awarded-uk-government-grant-for-development-flight-test-of-liquid-hydrogen-fuel-system',
          date: '2025-06-16',
          type: 'news'
        }
      ],
      last_updated: '2025-06-16',
      contributors: ['perplexity_research'],
      tags: ['industry', 'hydrogen', 'flight-testing'],
      confidence: 'verified'
    },
    created_at: '2020-01-01T00:00:00.000Z',
    updated_at: '2025-06-16T00:00:00.000Z'
  },
  {
    id: 'org-rolls-royce-001',
    name: 'Rolls-Royce',
    type: 'Industry',
    sector: 'Aerospace',
    funding_capacity: 'High',
    location: { city: 'Derby', region: 'East Midlands', country: 'UK' },
    contact: { website: 'https://www.rolls-royce.com' },
    description: 'Major aerospace manufacturer developing hydrogen propulsion systems',
    tags: ['hydrogen', 'aircraft', 'TRL-6', 'engines'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-airbus-001',
    name: 'Airbus',
    type: 'Industry',
    sector: 'Aerospace',
    funding_capacity: 'High',
    location: { city: 'Toulouse', region: 'Occitanie', country: 'International' },
    contact: { website: 'https://www.airbus.com' },
    description: 'Major aircraft manufacturer with Zeroe hydrogen aircraft program',
    tags: ['hydrogen', 'aircraft', 'TRL-5', 'zeroe'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  // Working Groups / Alliances
  {
    id: 'wg-jet-zero-taskforce',
    name: 'Jet Zero Taskforce',
    type: 'Working Group',
    sector: 'Transport',
    funding_capacity: 'Medium',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: { website: 'https://www.gov.uk/government/groups/jet-zero-council' },
    description:
      'Cross-government and industry taskforce coordinating aviation decarbonisation delivery following the Jet Zero Council transition.',
    tags: ['working-group', 'policy', 'aviation', 'hydrogen'],
    data_quality: { confidence: 'verified', last_verified: now },
    capacity_scenarios: { optimistic: 50000000, conservative: 20000000, current: 30000000 },
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'wg-hydrogen-aviation-alliance',
    name: 'Hydrogen in Aviation Alliance',
    type: 'Working Group',
    sector: 'Aerospace',
    funding_capacity: 'Medium',
    location: { city: 'Bristol', region: 'South West', country: 'UK' },
    contact: { website: 'https://www.hydrogeninaviation.co.uk' },
    description:
      'Industry alliance (easyJet, Rolls-Royce, Airbus, GKN, ZeroAvia, airports) accelerating hydrogen flight infrastructure and regulation.',
    tags: ['hydrogen', 'infrastructure', 'industry-alliance'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'wg-hydrogen-working-group',
    name: 'Hydrogen Working Group',
    type: 'Working Group',
    sector: 'Energy',
    funding_capacity: 'Low',
    location: { city: 'Cranfield', region: 'East of England', country: 'UK' },
    contact: { website: 'https://www.ati.org.uk' },
    description:
      'Specialist working group convened by ATI to coordinate standards and technology pathways for hydrogen propulsion.',
    tags: ['hydrogen', 'standards', 'technology'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-itm-power-001',
    name: 'ITM Power',
    type: 'Industry',
    sector: 'Energy',
    funding_capacity: 'Medium',
    location: { city: 'Sheffield', region: 'Yorkshire', country: 'UK' },
    contact: { website: 'https://www.itm-power.com' },
    description: 'Leading UK manufacturer of electrolysers for green hydrogen production',
    tags: ['hydrogen-production', 'electrolysis', 'TRL-8'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-linde-001',
    name: 'Linde',
    type: 'Industry',
    sector: 'Energy',
    funding_capacity: 'High',
    location: { city: 'Guildford', region: 'South East', country: 'UK' },
    contact: { website: 'https://www.linde.com' },
    description: 'Global industrial gases company, leader in hydrogen infrastructure',
    tags: ['hydrogen-storage', 'infrastructure', 'TRL-9'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-british-airways-001',
    name: 'British Airways',
    type: 'Industry',
    sector: 'Aviation',
    funding_capacity: 'High',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: { website: 'https://www.britishairways.com' },
    description: 'UK flag carrier airline, committed to net zero by 2050',
    tags: ['airline', 'operator', 'customer'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  // Additional stakeholders from Perplexity research
  {
    id: 'org-jet-zero-taskforce-001',
    name: 'Jet Zero Taskforce',
    type: 'Government',
    sector: 'Aviation',
    funding_capacity: 'High',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: {
      website: 'https://www.gov.uk/government/groups/jet-zero-taskforce',
      email: 'jetzero@dft.gov.uk'
    },
    description: 'Cross-government taskforce coordinating UK aviation decarbonization and hydrogen innovation efforts',
    tags: ['policy', 'coordination', 'strategic', 'hydrogen'],
    data_quality: {
      confidence: 'verified',
      last_verified: '2025-06-25',
      verified_by: 'gov.uk'
    },
    capacity_scenarios: {
      optimistic: 200000000,
      conservative: 100000000,
      current: 150000000
    },
    knowledge_base: {
      content: `# Strategic Position
The Jet Zero Taskforce provides strategic leadership and policy coordination for the UK government's zero-emission aviation ecosystem, acting as a central hub for prioritising hydrogen flight, SAF deployment, and sector-wide decarbonisation.

## Key Responsibilities
- Coordinating policy across DfT, BEIS, and other departments
- Setting strategic priorities for zero-emission aviation
- Facilitating industry-government dialogue
- Supporting production and delivery of sustainable aviation fuel and zero-emission flights

## Strategic Priorities
1. Hydrogen aviation development
2. SAF deployment
3. Infrastructure planning
4. Regulatory framework
5. Annual plenary CEO-level review and progress tracking

## Members
Includes senior leaders from DfT, BEIS, CAA, Energy Security and Net Zero, major airlines (easyJet, British Airways, Virgin), airports (Heathrow, Manchester), fuel producers, trade bodies, universities.`,
      sources: [
        {
          title: 'Jet Zero Strategy',
          url: 'https://assets.publishing.service.gov.uk/media/62e931d48fa8f5033896888a/jet-zero-strategy.pdf',
          date: '2021-07-19',
          type: 'report'
        },
        {
          title: 'Jet Zero Taskforce - GOV.UK',
          url: 'https://www.gov.uk/government/groups/jet-zero-taskforce',
          date: '2025-06-25',
          type: 'report'
        },
        {
          title: 'Jet Zero Council Relaunch',
          url: 'https://greenairnews.com/jet-zero-council-relaunch-taskforce/',
          date: '2025-02-16',
          type: 'news'
        }
      ],
      last_updated: '2025-06-25',
      contributors: ['perplexity_research'],
      tags: ['strategic', 'policy', 'coordination'],
      confidence: 'verified'
    },
    created_at: '2021-07-01T00:00:00.000Z',
    updated_at: '2025-06-25T00:00:00.000Z'
  },
  {
    id: 'org-caa-001',
    name: 'Civil Aviation Authority',
    type: 'Government',
    sector: 'Aviation',
    funding_capacity: 'Medium',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: {
      website: 'https://www.caa.co.uk',
      email: 'info@caa.co.uk'
    },
    description: 'UK aviation regulator responsible for safety, security, and environmental standards',
    tags: ['regulatory', 'certification', 'safety'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-heathrow-001',
    name: 'Heathrow Airport',
    type: 'Industry',
    sector: 'Aviation',
    funding_capacity: 'High',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: {
      website: 'https://www.heathrow.com',
      email: 'sustainability@heathrow.com'
    },
    description: 'UK\'s largest airport, developing hydrogen infrastructure for zero-emission aviation',
    tags: ['airport', 'infrastructure', 'hydrogen'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-universal-hydrogen-001',
    name: 'Universal Hydrogen',
    type: 'Industry',
    sector: 'Aviation',
    funding_capacity: 'High',
    location: { city: 'Los Angeles', region: 'California', country: 'International' },
    contact: {
      website: 'https://www.hydrogen.aero',
      email: 'info@hydrogen.aero'
    },
    description: 'Developer of hydrogen retrofit solutions for regional aircraft',
    tags: ['hydrogen', 'retrofit', 'aircraft'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-h2fly-001',
    name: 'H2FLY',
    type: 'Industry',
    sector: 'Aviation',
    funding_capacity: 'Medium',
    location: { city: 'Stuttgart', region: 'Baden-Württemberg', country: 'International' },
    contact: {
      website: 'https://www.h2fly.de',
      email: 'info@h2fly.de'
    },
    description: 'German company developing hydrogen fuel cell systems for aircraft',
    tags: ['hydrogen', 'fuel-cells', 'aircraft'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-easyjet-001',
    name: 'easyJet',
    type: 'Industry',
    sector: 'Aviation',
    funding_capacity: 'High',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: {
      website: 'https://www.easyjet.com',
      email: 'sustainability@easyjet.com'
    },
    description: 'UK low-cost airline committed to zero-emission aviation',
    tags: ['airline', 'operator', 'customer'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-virgin-atlantic-001',
    name: 'Virgin Atlantic',
    type: 'Industry',
    sector: 'Aviation',
    funding_capacity: 'High',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: {
      website: 'https://www.virginatlantic.com',
      email: 'sustainability@virgin-atlantic.com'
    },
    description: 'UK airline exploring hydrogen and SAF for long-haul routes',
    tags: ['airline', 'operator', 'SAF'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-nel-hydrogen-001',
    name: 'Nel Hydrogen',
    type: 'Industry',
    sector: 'Energy',
    funding_capacity: 'High',
    location: { city: 'Oslo', region: 'Oslo', country: 'International' },
    contact: {
      website: 'https://nelhydrogen.com',
      email: 'info@nelhydrogen.com'
    },
    description: 'Global electrolyser manufacturer, supplying hydrogen production systems',
    tags: ['hydrogen-production', 'electrolysis', 'TRL-9'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-imperial-001',
    name: 'Imperial College London',
    type: 'Research',
    sector: 'Aerospace',
    funding_capacity: 'Medium',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: {
      website: 'https://www.imperial.ac.uk',
      email: 'aeronautics@imperial.ac.uk'
    },
    description: 'Leading research university with strong aerospace and energy programs',
    tags: ['university', 'research', 'aerospace', 'energy'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-cambridge-001',
    name: 'University of Cambridge',
    type: 'Research',
    sector: 'Aerospace',
    funding_capacity: 'Medium',
    location: { city: 'Cambridge', region: 'East of England', country: 'UK' },
    contact: {
      website: 'https://www.cam.ac.uk',
      email: 'engineering@cam.ac.uk'
    },
    description: 'Research university with expertise in materials science and energy systems',
    tags: ['university', 'research', 'materials', 'energy'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-connected-places-001',
    name: 'Connected Places Catapult',
    type: 'Intermediary',
    sector: 'Transport',
    funding_capacity: 'Medium',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: {
      website: 'https://cp.catapult.org.uk',
      email: 'info@cp.catapult.org.uk'
    },
    description: 'UK innovation agency supporting transport and place-based innovation',
    tags: ['intermediary', 'innovation', 'transport'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-future-flight-001',
    name: 'Future Flight Challenge',
    type: 'Intermediary',
    sector: 'Aviation',
    funding_capacity: 'High',
    location: { city: 'Swindon', region: 'South West', country: 'UK' },
    contact: {
      website: 'https://www.ukri.org/our-work/our-main-funds/industrial-strategy-challenge-fund/future-of-mobility/future-flight-challenge/',
      email: 'futureflight@ukri.org'
    },
    description: 'UKRI challenge program funding zero-emission aviation technologies',
    tags: ['intermediary', 'funding', 'challenge'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-sustainable-aviation-001',
    name: 'Sustainable Aviation UK',
    type: 'Intermediary',
    sector: 'Aviation',
    funding_capacity: 'Medium',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: {
      website: 'https://www.sustainableaviation.co.uk',
      email: 'info@sustainableaviation.co.uk'
    },
    description: 'UK aviation industry coalition committed to net zero',
    tags: ['intermediary', 'trade-body', 'sustainability'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  }
];

// ============================================================================
// Technologies (25 entities)
// ============================================================================

const technologies: Technology[] = [
  // H2Production (5)
  {
    id: 'tech-h2-electrolysis-001',
    name: 'Green Hydrogen Electrolysis',
    category: 'H2Production',
    trl_current: 8,
    trl_color: 'green',
    maturity_risk: 'Proven technology / Scale-up challenges / Cost reduction needed',
    deployment_ready: true,
    description: 'Electrolysis systems for producing green hydrogen from renewable electricity',
    tags: ['hydrogen-production', 'electrolysis', 'green-energy'],
    regional_availability: ['Scotland', 'South East', 'Yorkshire'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'tech-h2-reforming-001',
    name: 'Steam Methane Reforming with CCS',
    category: 'H2Production',
    trl_current: 7,
    trl_color: 'green',
    maturity_risk: 'Proven / CCS integration / Cost',
    deployment_ready: true,
    description: 'Blue hydrogen production with carbon capture and storage',
    tags: ['hydrogen-production', 'CCS', 'blue-hydrogen'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // H2Storage (5)
  {
    id: 'tech-h2-storage-compressed-001',
    name: 'Compressed Hydrogen Storage (350 bar)',
    category: 'H2Storage',
    trl_current: 8,
    trl_color: 'green',
    maturity_risk: 'Proven / Weight constraints / Volume efficiency',
    deployment_ready: true,
    description: 'High-pressure compressed hydrogen storage systems for aircraft',
    tags: ['hydrogen-storage', 'compressed', 'aircraft'],
    regional_availability: ['South East', 'Scotland'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'tech-h2-storage-liquid-001',
    name: 'Liquid Hydrogen Storage Systems',
    category: 'H2Storage',
    trl_current: 6,
    trl_color: 'amber',
    maturity_risk: 'Proven elsewhere / Airport barriers / Scalability issues',
    deployment_ready: false,
    description: 'Cryogenic storage systems for liquid hydrogen at -253°C',
    tags: ['hydrogen-storage', 'cryogenic', 'liquid'],
    regional_availability: ['Scotland'],
    data_quality: { confidence: 'estimated', last_verified: lastYear },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // FuelCells (6)
  {
    id: 'tech-fuel-cell-pem-001',
    name: 'PEM Fuel Cells for Aviation',
    category: 'FuelCells',
    trl_current: 7,
    trl_color: 'green',
    maturity_risk: 'Proven / Power density / Durability',
    deployment_ready: true,
    description: 'Proton Exchange Membrane fuel cells optimized for aircraft applications',
    tags: ['fuel-cells', 'PEM', 'aircraft'],
    regional_availability: ['South East', 'East of England'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'tech-fuel-cell-sofc-001',
    name: 'Solid Oxide Fuel Cells',
    category: 'FuelCells',
    trl_current: 5,
    trl_color: 'amber',
    maturity_risk: 'Early stage / High temperature / Start-up time',
    deployment_ready: false,
    description: 'High-temperature fuel cells with potential for higher efficiency',
    tags: ['fuel-cells', 'SOFC', 'high-efficiency'],
    data_quality: { confidence: 'estimated', last_verified: lastYear },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // Aircraft (5)
  {
    id: 'tech-aircraft-regional-h2-001',
    name: 'Regional Hydrogen Aircraft (10-80 seats)',
    category: 'Aircraft',
    trl_current: 6,
    trl_color: 'amber',
    maturity_risk: 'Prototype / Certification / Infrastructure',
    deployment_ready: false,
    description: 'Regional aircraft designed for hydrogen-electric propulsion',
    tags: ['aircraft', 'regional', 'hydrogen'],
    regional_availability: ['South East'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'tech-aircraft-narrowbody-h2-001',
    name: 'Narrow-body Hydrogen Aircraft (150+ seats)',
    category: 'Aircraft',
    trl_current: 4,
    trl_color: 'amber',
    maturity_risk: 'Concept / Storage challenges / Range limitations',
    deployment_ready: false,
    description: 'Single-aisle aircraft concepts for hydrogen propulsion',
    tags: ['aircraft', 'narrow-body', 'hydrogen'],
    data_quality: { confidence: 'estimated', last_verified: lastYear },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // Infrastructure (4)
  {
    id: 'tech-infra-refueling-001',
    name: 'Airport Hydrogen Refueling Infrastructure',
    category: 'Infrastructure',
    trl_current: 5,
    trl_color: 'amber',
    maturity_risk: 'Early deployment / Regulatory / Cost',
    deployment_ready: false,
    description: 'Ground infrastructure for hydrogen refueling at airports',
    tags: ['infrastructure', 'refueling', 'airports'],
    regional_availability: ['London', 'Scotland'],
    data_quality: { confidence: 'estimated', last_verified: lastYear },
    created_at: twoYearsAgo,
    updated_at: now
  },
  // Additional technologies from Perplexity research
  {
    id: 'tech-lh2-aircraft-001',
    name: 'Liquid Hydrogen Aircraft Systems',
    category: 'Aircraft',
    trl_current: 6,
    trl_color: 'amber',
    trl_projected_2030: 8,
    trl_projected_2050: 9,
    maturity_risk: 'Cryogenic storage challenges, infrastructure requirements, certification pathway risk',
    deployment_ready: false,
    total_funding: 45000000,
    funding_by_type: { public: 35000000, private: 10000000, mixed: 0 },
    stakeholder_count: 8,
    project_count: 3,
    description: 'Aircraft systems designed for liquid hydrogen propulsion, including cryogenic storage and fuel delivery',
    tags: ['aircraft', 'liquid-hydrogen', 'cryogenic', 'TRL-6'],
    regional_availability: ['South East', 'Scotland'],
    knowledge_base: {
      content: `# Technical Overview
Liquid hydrogen (LH2) aircraft systems represent a key pathway to zero-emission aviation. These systems integrate cryogenic storage, fuel delivery, and safety management for use in regional and larger commercial aircraft.

## Technical Challenges
- Cryogenic storage at -253°C
- Fuel delivery systems and thermal management
- Safety and certification hurdles for civil use
- System integration across airport infrastructure

## Key Stakeholders
- ZeroAvia (regional aircraft)
- Universal Hydrogen (retrofit solutions)
- Airbus (concept development)

## Current Status
- TRL 6: Prototype testing
- Flight demonstration programs underway
- Supporting certification and regulatory guidance (CAA, ATI Hydrogen Challenge)`,
      sources: [
        {
          title: 'ATI Hydrogen Capability Network',
          url: 'https://www.ati.org.uk/hydrogen/',
          date: '2025-01-01',
          type: 'report'
        }
      ],
      last_updated: '2025-01-15',
      contributors: ['perplexity_research'],
      tags: ['technical', 'aircraft', 'hydrogen'],
      confidence: 'verified'
    },
    data_quality: { confidence: 'verified', last_verified: '2025-01-15' },
    created_at: '2020-06-01T00:00:00.000Z',
    updated_at: '2025-01-15T00:00:00.000Z'
  },
  {
    id: 'tech-peh-electrolysis-001',
    name: 'PEM Electrolysis',
    category: 'H2Production',
    trl_current: 7,
    trl_color: 'green',
    trl_projected_2030: 9,
    trl_projected_2050: 9,
    maturity_risk: 'Scaling for aviation, renewable integration, supply chain risk',
    deployment_ready: true,
    total_funding: 76000000,
    funding_by_type: { public: 48000000, private: 28000000, mixed: 0 },
    stakeholder_count: 10,
    project_count: 6,
    description: 'Polymer electrolyte membrane (PEM) electrolysis produces high-purity hydrogen suitable for aviation fuel cells',
    tags: ['production', 'hydrogen', 'electrolysis', 'TRL-7'],
    regional_availability: ['South East', 'North East', 'Wales'],
    knowledge_base: {
      content: `# Technical Overview
PEM electrolysis is a leading method for producing zero-carbon hydrogen for aviation. Deployment at airport sites enables on-demand fuel supply, supporting both fuel cell systems and infrastructure demonstrations.

## Innovations
- Integration with solar/wind power
- UK regional production clusters (Teesside, South Wales) leveraging existing energy infrastructure
- Collaboration with ITM Power, Nel Hydrogen, and research partners

## Key Milestones
- TRL 7: Commercial pilot-scale production
- Demonstrations at multiple regional aviation hubs
- Ongoing scale-up via ATI, UKRI, Future Flight Challenge grants`,
      sources: [
        {
          title: '£63 million boost propels UK clean aviation fuel production',
          url: 'https://openaccessgovernment.org/uk-clean-aviation-fuel-production-boost/',
          date: '2025-07-22',
          type: 'news'
        }
      ],
      last_updated: '2025-07-22',
      contributors: ['perplexity_research'],
      tags: ['production', 'fuel', 'hydrogen'],
      confidence: 'verified'
    },
    data_quality: { confidence: 'verified', last_verified: '2025-07-22' },
    created_at: '2020-04-01T00:00:00.000Z',
    updated_at: '2025-07-22T00:00:00.000Z'
  },
  {
    id: 'tech-saf-production-001',
    name: 'Sustainable Aviation Fuel Production (SAF)',
    category: 'H2Production',
    trl_current: 7,
    trl_color: 'green',
    trl_projected_2030: 9,
    trl_projected_2050: 9,
    maturity_risk: 'Feedstock scale-up, industrial investment required',
    deployment_ready: true,
    total_funding: 198000000,
    funding_by_type: { public: 178000000, private: 20000000, mixed: 0 },
    stakeholder_count: 12,
    project_count: 4,
    description: 'Production of SAF from non-fossil feedstocks (bio-waste, CO2 capture), mandated for UK aviation by 2030',
    tags: ['SAF', 'production', 'fuel', 'carbon-neutral'],
    regional_availability: ['Wales', 'Scotland'],
    knowledge_base: {
      content: `# Technical Overview
SAF production in the UK leverages bio-waste and direct air capture, targeting 10% SAF in aviation by 2030, five plants under construction in 2025.

## Key Stakeholders
British Airways, Airlines UK, LanzaTech, DfT.

## Impact
Reduces carbon footprint, supports net zero goals.`,
      sources: [
        { title: 'Jet Zero Strategy', url: 'https://assets.publishing.service.gov.uk/media/62e931d48fa8f5033896888a/jet-zero-strategy.pdf', date: '2021-07-19', type: 'report' },
        { title: 'Greener flights ahead for UK aviation', url: 'https://www.gov.uk/government/news/greener-flights-ahead-for-uk-aviation', date: '2024-12-31', type: 'news' }
      ],
      last_updated: '2024-12-31',
      contributors: ['perplexity_research'],
      tags: ['SAF', 'fuel', 'aviation'],
      confidence: 'verified'
    },
    data_quality: { confidence: 'verified', last_verified: '2024-12-31' },
    created_at: '2022-05-01T00:00:00.000Z',
    updated_at: '2024-12-31T00:00:00.000Z'
  }
];

// ============================================================================
// Funding Events (40 entities)
// ============================================================================

const fundingEvents: FundingEvent[] = [
  {
    id: 'fund-001',
    amount: 35000000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-dft-001',
    recipient_id: 'org-ati-001',
    recipient_type: 'stakeholder',
    program: 'ATI Programme - Core Funding',
    program_type: 'grant',
    date: '2023-01-01',
    start_date: '2023-01-01',
    end_date: '2025-12-31',
    status: 'Active',
    impact_description: 'Core funding for ATI to distribute to zero emission aviation projects',
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'fund-002',
    amount: 15000000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-ati-001',
    recipient_id: 'org-zeroavia-001',
    recipient_type: 'stakeholder',
    program: 'ATI Programme - Round 3',
    program_type: 'grant',
    date: '2023-06-15',
    start_date: '2023-06-15',
    end_date: '2025-06-14',
    status: 'Active',
    impact_description: 'Enabling flight testing of 19-seat hydrogen-electric aircraft',
    technologies_supported: ['tech-aircraft-regional-h2-001', 'tech-fuel-cell-pem-001'],
    trl_impact: { before: 5, after: 7 },
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'fund-003',
    amount: 10000000,
    currency: 'GBP',
    funding_type: 'Private',
    source_id: 'org-british-airways-001',
    recipient_id: 'org-zeroavia-001',
    recipient_type: 'stakeholder',
    program: 'Strategic Partnership',
    program_type: 'partnership',
    date: '2024-01-20',
    status: 'Active',
    impact_description: 'Strategic partnership for future aircraft orders',
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'fund-004',
    amount: 5000000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-ukri-001',
    recipient_id: 'org-cranfield-001',
    recipient_type: 'stakeholder',
    program: 'Future Flight Challenge',
    program_type: 'grant',
    date: '2023-03-10',
    status: 'Active',
    impact_description: 'Research into fuel cell optimization for aviation',
    technologies_supported: ['tech-fuel-cell-pem-001'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'fund-005',
    amount: 8000000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-ati-001',
    recipient_id: 'org-rolls-royce-001',
    recipient_type: 'stakeholder',
    program: 'ATI Programme - Round 2',
    program_type: 'grant',
    date: '2022-09-01',
    status: 'Completed',
    impact_description: 'Development of hydrogen combustion engine technology',
    technologies_supported: ['tech-aircraft-regional-h2-001'],
    trl_impact: { before: 4, after: 6 },
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'fund-006',
    amount: 3000000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-innovate-uk-001',
    recipient_id: 'org-itm-power-001',
    recipient_type: 'stakeholder',
    program: 'SBRI - Hydrogen Production',
    program_type: 'SBRI',
    date: '2023-11-05',
    status: 'Active',
    impact_description: 'Development of high-efficiency electrolysers for aviation use',
    technologies_supported: ['tech-h2-electrolysis-001'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'fund-007',
    amount: 1200000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-ukri-001',
    recipient_id: 'org-bristol-001',
    recipient_type: 'stakeholder',
    program: 'EPSRC Research Grant',
    program_type: 'grant',
    date: '2023-08-15',
    status: 'Active',
    impact_description: 'Research into liquid hydrogen storage systems',
    technologies_supported: ['tech-h2-storage-liquid-001'],
    trl_impact: { before: 5, after: 6 },
    data_quality: { confidence: 'estimated', last_verified: lastYear },
    created_at: lastYear,
    updated_at: now
  },
  // Additional funding events from Perplexity research
  {
    id: 'fund-zeroavia-lh-sift-001',
    amount: 10800000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-ati-001',
    recipient_id: 'proj-lh-sift-zeroavia-001',
    recipient_type: 'project',
    program: 'ATI Programme Round 5',
    program_type: 'grant',
    date: '2025-06-16',
    start_date: '2025-07-01',
    end_date: '2026-12-31',
    status: 'Active',
    impact_description: 'Supports R&D and flight test for novel liquid hydrogen systems in commercial aircraft',
    technologies_supported: ['tech-lh2-aircraft-001'],
    trl_impact: { before: 6, after: 8 },
    data_quality: { confidence: 'verified', last_verified: '2025-06-16' },
    created_at: '2025-06-16T00:00:00.000Z',
    updated_at: '2025-06-16T00:00:00.000Z'
  },
  {
    id: 'fund-advanced-fuels-001',
    amount: 198000000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-dft-001',
    recipient_id: 'org-ati-001',
    recipient_type: 'stakeholder',
    program: 'Advanced Fuels Fund',
    program_type: 'grant',
    date: '2024-03-15',
    start_date: '2024-04-01',
    end_date: '2027-03-31',
    status: 'Active',
    impact_description: 'Major funding program accelerating SAF and hydrogen technology for aviation',
    technologies_supported: [
      'tech-peh-electrolysis-001',
      'tech-saf-production-001',
      'tech-h2-storage-compressed-001'
    ],
    trl_impact: {
      before: 4,
      after: 6
    },
    data_quality: { confidence: 'verified', last_verified: '2024-03-15' },
    created_at: '2024-03-15T00:00:00.000Z',
    updated_at: '2024-03-15T00:00:00.000Z'
  }
];

// ============================================================================
// Projects (15 entities)
// ============================================================================

const projects: Project[] = [
  {
    id: 'proj-zeroavia-h2-flight-001',
    name: 'ZeroAvia 19-Seat Hydrogen Flight Testing',
    status: 'Active',
    start_date: '2023-06-15',
    end_date: '2025-06-14',
    duration_months: 24,
    participants: ['org-zeroavia-001', 'org-ati-001', 'org-cranfield-001'],
    lead_organization: 'org-zeroavia-001',
    technologies: ['tech-aircraft-regional-h2-001', 'tech-fuel-cell-pem-001', 'tech-h2-storage-compressed-001'],
    primary_technology: 'tech-aircraft-regional-h2-001',
    total_budget: 15000000,
    funding_events: ['fund-002'],
    description: 'Flight testing program for 19-seat hydrogen-electric aircraft',
    objectives: [
      'Complete 100+ flight hours',
      'Achieve TRL 7 for powertrain',
      'Validate safety and performance',
      'Prepare for certification'
    ],
    tags: ['flight-testing', 'certification', 'hydrogen'],
    outcomes: {
      trl_advancement: 2,
      publications: 3,
      commercial_impact: 'LOI from British Airways for 10-50 aircraft'
    },
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'proj-rolls-royce-h2-engine-001',
    name: 'Rolls-Royce Hydrogen Combustion Engine',
    status: 'Active',
    start_date: '2022-09-01',
    end_date: '2024-12-31',
    duration_months: 28,
    participants: ['org-rolls-royce-001', 'org-ati-001', 'org-manchester-001'],
    lead_organization: 'org-rolls-royce-001',
    technologies: ['tech-aircraft-regional-h2-001'],
    primary_technology: 'tech-aircraft-regional-h2-001',
    total_budget: 8000000,
    funding_events: ['fund-005'],
    description: 'Development of hydrogen combustion engine for regional aircraft',
    objectives: [
      'Develop engine prototype',
      'Ground testing',
      'TRL advancement to 6'
    ],
    tags: ['engine', 'hydrogen-combustion'],
    outcomes: {
      trl_advancement: 2
    },
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  // Additional projects from Perplexity research
  {
    id: 'proj-lh-sift-zeroavia-001',
    name: 'ZeroAvia LH-SIFT Liquid Hydrogen Flight Test',
    status: 'Active',
    start_date: '2025-06-20',
    end_date: '2026-12-31',
    duration_months: 18,
    participants: ['org-zeroavia-001', 'org-ati-001', 'org-cranfield-001', 'org-caa-001'],
    lead_organization: 'org-zeroavia-001',
    technologies: ['tech-lh2-aircraft-001'],
    primary_technology: 'tech-lh2-aircraft-001',
    total_budget: 10800000,
    funding_events: ['fund-zeroavia-lh-sift-001'],
    description: 'Flight testing novel liquid hydrogen management and storage system for Dornier 228 aircraft',
    objectives: [
      'Develop LH2 management system for aviation',
      'Integrate lightweight tank and fuel system for flight test',
      'Establish commercial airframe testbed for liquid hydrogen',
      'Advance UK leadership in zero-emission aircraft'
    ],
    milestones: [
      { date: '2025-12-01', description: 'LH2 system manufacture complete' },
      { date: '2026-04-01', description: 'System integration with Dornier 228' },
      { date: '2026-06-01', description: 'Flight test program begins' }
    ],
    knowledge_base: {
      content: `# Project Overview
ZeroAvia's LH-SIFT project aims to develop, integrate, and flight-test the world's first liquid hydrogen system for commercial aircraft. Partnering with Green Resource Engineering and Gas & Liquid Controls, the LHMS platform delivers critical experience for future LH2 supply chains and certification routes.

## Key Achievements
- UK funding through ATI Programme
- Dornier 228 LH2 testbed established
- Advances in refueling, cryogenic storage, and safety management

## Impact
Positions the UK as a global leader in liquid hydrogen for aviation, supporting new aircraft technologies and retrofits.`,
      sources: [
        {
          title: 'ZeroAvia Awarded UK Government Grant',
          url: 'https://www.zeroavia.com/news/zeroavia-awarded-uk-government-grant-for-development-flight-test-of-liquid-hydrogen-fuel-system',
          date: '2025-06-16',
          type: 'news'
        }
      ],
      last_updated: '2025-06-16',
      contributors: ['perplexity_research'],
      tags: ['flight-test', 'liquid-hydrogen', 'aviation'],
      confidence: 'verified'
    },
    data_quality: { confidence: 'verified', last_verified: '2025-06-16' },
    created_at: '2025-06-20T00:00:00.000Z',
    updated_at: '2025-06-20T00:00:00.000Z'
  }
];

// ============================================================================
// Relationships (80+ entities)
// ============================================================================

const relationships: Relationship[] = [
  // Funding relationships
  {
    id: 'rel-dft-ati-001',
    source: 'org-dft-001',
    target: 'org-ati-001',
    type: 'funds',
    weight: 35000000,
    strength: 'strong',
    metadata: {
      amount: 35000000,
      program: 'ATI Programme',
      start_date: '2023-01-01',
      end_date: '2025-12-31'
    },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-ati-zeroavia-001',
    source: 'org-ati-001',
    target: 'org-zeroavia-001',
    type: 'funds',
    weight: 15000000,
    strength: 'strong',
    metadata: {
      amount: 15000000,
      program: 'ATI Round 3',
      project_id: 'proj-zeroavia-h2-flight-001'
    },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-ba-zeroavia-001',
    source: 'org-british-airways-001',
    target: 'org-zeroavia-001',
    type: 'collaborates_with',
    weight: 0.8,
    strength: 'strong',
    metadata: {
      description: 'Strategic partnership with LOI for aircraft orders'
    },
    bidirectional: true,
    created_at: lastYear,
    updated_at: now
  },
  // Research relationships
  {
    id: 'rel-zeroavia-cranfield-001',
    source: 'org-zeroavia-001',
    target: 'org-cranfield-001',
    type: 'collaborates_with',
    weight: 0.6,
    strength: 'medium',
    metadata: {
      project_id: 'proj-zeroavia-h2-flight-001',
      description: 'Research collaboration on fuel cell optimization'
    },
    bidirectional: true,
    created_at: twoYearsAgo,
    updated_at: now
  },
  // Technology relationships
  {
    id: 'rel-zeroavia-tech-aircraft-001',
    source: 'org-zeroavia-001',
    target: 'tech-aircraft-regional-h2-001',
    type: 'advances',
    weight: 0.9,
    strength: 'strong',
    metadata: {
      project_id: 'proj-zeroavia-h2-flight-001',
      description: 'Primary developer of regional hydrogen aircraft'
    },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-zeroavia-tech-fuelcell-001',
    source: 'org-zeroavia-001',
    target: 'tech-fuel-cell-pem-001',
    type: 'advances',
    weight: 0.8,
    strength: 'strong',
    metadata: {
      description: 'Using PEM fuel cells in aircraft'
    },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  // More funding relationships
  {
    id: 'rel-ukri-bristol-001',
    source: 'org-ukri-001',
    target: 'org-bristol-001',
    type: 'funds',
    weight: 1200000,
    strength: 'medium',
    metadata: { amount: 1200000, program: 'EPSRC Research Grant' },
    bidirectional: false,
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'rel-ukri-manchester-001',
    source: 'org-ukri-001',
    target: 'org-manchester-001',
    type: 'funds',
    weight: 800000,
    strength: 'medium',
    metadata: { amount: 800000, program: 'EPSRC Research Grant' },
    bidirectional: false,
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'rel-ati-rolls-royce-001',
    source: 'org-ati-001',
    target: 'org-rolls-royce-001',
    type: 'funds',
    weight: 8000000,
    strength: 'strong',
    metadata: { amount: 8000000, program: 'ATI Round 2' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-ati-cranfield-001',
    source: 'org-ati-001',
    target: 'org-cranfield-001',
    type: 'funds',
    weight: 2500000,
    strength: 'medium',
    metadata: { amount: 2500000, program: 'ATI Research Grant' },
    bidirectional: false,
    created_at: lastYear,
    updated_at: now
  },
  // Project participation relationships
  {
    id: 'rel-zeroavia-proj-flight-001',
    source: 'org-zeroavia-001',
    target: 'proj-zeroavia-h2-flight-001',
    type: 'participates_in',
    weight: 0.9,
    strength: 'strong',
    metadata: { project_id: 'proj-zeroavia-h2-flight-001', role: 'lead' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-ati-proj-flight-001',
    source: 'org-ati-001',
    target: 'proj-zeroavia-h2-flight-001',
    type: 'participates_in',
    weight: 0.7,
    strength: 'strong',
    metadata: { project_id: 'proj-zeroavia-h2-flight-001', role: 'funder' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-cranfield-proj-flight-001',
    source: 'org-cranfield-001',
    target: 'proj-zeroavia-h2-flight-001',
    type: 'participates_in',
    weight: 0.6,
    strength: 'medium',
    metadata: { project_id: 'proj-zeroavia-h2-flight-001', role: 'research_partner' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-rolls-royce-proj-engine-001',
    source: 'org-rolls-royce-001',
    target: 'proj-rolls-royce-h2-engine-001',
    type: 'participates_in',
    weight: 0.9,
    strength: 'strong',
    metadata: { project_id: 'proj-rolls-royce-h2-engine-001', role: 'lead' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-ati-proj-engine-001',
    source: 'org-ati-001',
    target: 'proj-rolls-royce-h2-engine-001',
    type: 'participates_in',
    weight: 0.7,
    strength: 'strong',
    metadata: { project_id: 'proj-rolls-royce-h2-engine-001', role: 'funder' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-manchester-proj-engine-001',
    source: 'org-manchester-001',
    target: 'proj-rolls-royce-h2-engine-001',
    type: 'participates_in',
    weight: 0.5,
    strength: 'medium',
    metadata: { project_id: 'proj-rolls-royce-h2-engine-001', role: 'research_partner' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  // Technology advancement relationships
  {
    id: 'rel-rolls-royce-tech-aircraft-001',
    source: 'org-rolls-royce-001',
    target: 'tech-aircraft-regional-h2-001',
    type: 'advances',
    weight: 0.8,
    strength: 'strong',
    metadata: { description: 'Developing hydrogen combustion engine' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-bristol-tech-storage-001',
    source: 'org-bristol-001',
    target: 'tech-h2-storage-liquid-001',
    type: 'researches',
    weight: 0.7,
    strength: 'medium',
    metadata: { description: 'Research into liquid hydrogen storage' },
    bidirectional: false,
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'rel-manchester-tech-production-001',
    source: 'org-manchester-001',
    target: 'tech-h2-electrolysis-001',
    type: 'researches',
    weight: 0.6,
    strength: 'medium',
    metadata: { description: 'Research into green hydrogen production' },
    bidirectional: false,
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'rel-cranfield-tech-fuelcell-001',
    source: 'org-cranfield-001',
    target: 'tech-fuel-cell-pem-001',
    type: 'researches',
    weight: 0.7,
    strength: 'medium',
    metadata: { description: 'Fuel cell optimization research' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  // Collaboration relationships
  {
    id: 'rel-ati-cranfield-001',
    source: 'org-ati-001',
    target: 'org-cranfield-001',
    type: 'collaborates_with',
    weight: 0.7,
    strength: 'medium',
    metadata: { description: 'Strategic research partnership' },
    bidirectional: true,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-zeroavia-rolls-royce-001',
    source: 'org-zeroavia-001',
    target: 'org-rolls-royce-001',
    type: 'collaborates_with',
    weight: 0.5,
    strength: 'weak',
    metadata: { description: 'Industry collaboration on hydrogen aviation' },
    bidirectional: true,
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'rel-bristol-manchester-001',
    source: 'org-bristol-001',
    target: 'org-manchester-001',
    type: 'collaborates_with',
    weight: 0.6,
    strength: 'medium',
    metadata: { description: 'Research collaboration on hydrogen systems' },
    bidirectional: true,
    created_at: lastYear,
    updated_at: now
  },
  // Project-technology relationships (via projects)
  {
    id: 'rel-proj-flight-tech-aircraft-001',
    source: 'proj-zeroavia-h2-flight-001',
    target: 'tech-aircraft-regional-h2-001',
    type: 'advances',
    weight: 0.9,
    strength: 'strong',
    metadata: { description: 'Project advancing regional hydrogen aircraft' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-proj-flight-tech-fuelcell-001',
    source: 'proj-zeroavia-h2-flight-001',
    target: 'tech-fuel-cell-pem-001',
    type: 'advances',
    weight: 0.8,
    strength: 'strong',
    metadata: { description: 'Project advancing PEM fuel cells' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-proj-engine-tech-aircraft-001',
    source: 'proj-rolls-royce-h2-engine-001',
    target: 'tech-aircraft-regional-h2-001',
    type: 'advances',
    weight: 0.8,
    strength: 'strong',
    metadata: { description: 'Project advancing hydrogen engine technology' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  // Additional relationships to connect more nodes and create clusters
  // Connect more stakeholders to technologies
  {
    id: 'rel-ukri-tech-electrolysis-001',
    source: 'org-ukri-001',
    target: 'tech-h2-electrolysis-001',
    type: 'funds',
    weight: 2000000,
    strength: 'medium',
    metadata: { amount: 2000000, program: 'EPSRC Research Grant' },
    bidirectional: false,
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'rel-ati-tech-storage-001',
    source: 'org-ati-001',
    target: 'tech-h2-storage-compressed-001',
    type: 'funds',
    weight: 5000000,
    strength: 'strong',
    metadata: { amount: 5000000, program: 'ATI Programme' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-bristol-tech-storage-compressed-001',
    source: 'org-bristol-001',
    target: 'tech-h2-storage-compressed-001',
    type: 'researches',
    weight: 0.7,
    strength: 'medium',
    metadata: { description: 'Research into compressed hydrogen storage' },
    bidirectional: false,
    created_at: lastYear,
    updated_at: now
  },
  // Connect more stakeholders to each other
  {
    id: 'rel-dft-ukri-001',
    source: 'org-dft-001',
    target: 'org-ukri-001',
    type: 'collaborates_with',
    weight: 0.6,
    strength: 'medium',
    metadata: { description: 'Strategic coordination on aviation research funding' },
    bidirectional: true,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-ati-cranfield-002',
    source: 'org-ati-001',
    target: 'org-cranfield-001',
    type: 'funds',
    weight: 3000000,
    strength: 'medium',
    metadata: { amount: 3000000, program: 'ATI Research Partnership' },
    bidirectional: false,
    created_at: lastYear,
    updated_at: now
  },
  // Connect technologies to each other (related techs)
  {
    id: 'rel-tech-fuelcell-storage-001',
    source: 'tech-fuel-cell-pem-001',
    target: 'tech-h2-storage-compressed-001',
    type: 'collaborates_with',
    weight: 0.5,
    strength: 'weak',
    metadata: { description: 'Related technologies in hydrogen powertrain' },
    bidirectional: true,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-tech-storage-production-001',
    source: 'tech-h2-storage-compressed-001',
    target: 'tech-h2-electrolysis-001',
    type: 'collaborates_with',
    weight: 0.5,
    strength: 'weak',
    metadata: { description: 'Storage and production are complementary' },
    bidirectional: true,
    created_at: twoYearsAgo,
    updated_at: now
  },
  // Connect more projects
  {
    id: 'rel-zeroavia-proj-flight-002',
    source: 'org-zeroavia-001',
    target: 'proj-zeroavia-h2-flight-001',
    type: 'participates_in',
    weight: 0.9,
    strength: 'strong',
    metadata: { project_id: 'proj-zeroavia-h2-flight-001', role: 'lead' },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  // Connect isolated stakeholders
  {
    id: 'rel-caa-dft-001',
    source: 'org-caa-001',
    target: 'org-dft-001',
    type: 'collaborates_with',
    weight: 0.8,
    strength: 'strong',
    metadata: { description: 'Regulatory coordination on zero-emission aviation' },
    bidirectional: true,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-caa-ati-001',
    source: 'org-caa-001',
    target: 'org-ati-001',
    type: 'collaborates_with',
    weight: 0.7,
    strength: 'medium',
    metadata: { description: 'Certification standards development' },
    bidirectional: true,
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'rel-easa-caa-001',
    source: 'org-easa-001',
    target: 'org-caa-001',
    type: 'collaborates_with',
    weight: 0.7,
    strength: 'medium',
    metadata: { description: 'International regulatory alignment' },
    bidirectional: true,
    created_at: twoYearsAgo,
    updated_at: now
  },
  // Connect more universities
  {
    id: 'rel-cranfield-bristol-001',
    source: 'org-cranfield-001',
    target: 'org-bristol-001',
    type: 'collaborates_with',
    weight: 0.6,
    strength: 'medium',
    metadata: { description: 'Research collaboration on hydrogen systems' },
    bidirectional: true,
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'rel-manchester-bristol-001',
    source: 'org-manchester-001',
    target: 'org-bristol-001',
    type: 'collaborates_with',
    weight: 0.5,
    strength: 'weak',
    metadata: { description: 'Academic collaboration' },
    bidirectional: true,
    created_at: lastYear,
    updated_at: now
  },
  // Connect industry players
  {
    id: 'rel-rolls-royce-ba-001',
    source: 'org-rolls-royce-001',
    target: 'org-british-airways-001',
    type: 'collaborates_with',
    weight: 0.6,
    strength: 'medium',
    metadata: { description: 'Industry partnership on hydrogen aviation' },
    bidirectional: true,
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'rel-zeroavia-ba-002',
    source: 'org-zeroavia-001',
    target: 'org-british-airways-001',
    type: 'collaborates_with',
    weight: 0.8,
    strength: 'strong',
    metadata: { description: 'Strategic partnership with LOI' },
    bidirectional: true,
    created_at: lastYear,
    updated_at: now
  }
];

// ============================================================================
// Calculate Derived Fields
// ============================================================================

function calculateDerivedFields(dataset: NavigateDataset): NavigateDataset {
  // Calculate total funding received/provided for stakeholders
  dataset.stakeholders.forEach(stakeholder => {
    stakeholder.total_funding_received = dataset.funding_events
      .filter(f => f.recipient_id === stakeholder.id)
      .reduce((sum, f) => sum + f.amount, 0);
    
    stakeholder.total_funding_provided = dataset.funding_events
      .filter(f => f.source_id === stakeholder.id)
      .reduce((sum, f) => sum + f.amount, 0);
    
    // Calculate relationship count
    stakeholder.relationship_count = dataset.relationships.filter(
      r => r.source === stakeholder.id || r.target === stakeholder.id
    ).length;
  });
  
  // Calculate funding for technologies
  dataset.technologies.forEach(tech => {
    tech.total_funding = dataset.funding_events
      .filter(f => f.technologies_supported?.includes(tech.id))
      .reduce((sum, f) => sum + f.amount, 0);
    
    tech.funding_by_type = {
      public: dataset.funding_events
        .filter(f => f.technologies_supported?.includes(tech.id) && f.funding_type === 'Public')
        .reduce((sum, f) => sum + f.amount, 0),
      private: dataset.funding_events
        .filter(f => f.technologies_supported?.includes(tech.id) && f.funding_type === 'Private')
        .reduce((sum, f) => sum + f.amount, 0),
      mixed: dataset.funding_events
        .filter(f => f.technologies_supported?.includes(tech.id) && f.funding_type === 'Mixed')
        .reduce((sum, f) => sum + f.amount, 0)
    };
    
    // Calculate stakeholder and project counts
    tech.stakeholder_count = dataset.relationships
      .filter(r => r.target === tech.id && r.type === 'advances')
      .length;
    
    tech.project_count = dataset.projects
      .filter(p => p.technologies.includes(tech.id))
      .length;
  });
  
  return dataset;
}

// ============================================================================
// Export Complete Dataset
// ============================================================================

const rawDataset: NavigateDataset = {
  stakeholders,
  technologies,
  funding_events: fundingEvents,
  projects,
  relationships,
  metadata: {
    version: '1.0.0',
    created_at: now,
    updated_at: now,
    total_entities: stakeholders.length + technologies.length + projects.length,
    total_relationships: relationships.length
  }
};

export const navigateDummyData = calculateDerivedFields(rawDataset);

// Export individual arrays for convenience
export { stakeholders, technologies, fundingEvents, projects, relationships };

