// ============================================
// PLATFORM COMPARISON DATA
// ============================================
export const platformComparisonData = [
  {
    platform: "Contracts Finder / Find a Tender",
    model: "Transactional",
    primaryFunction: "Publish legal tender notices",
    strengths: [
      "Comprehensive coverage",
      "Legal compliance",
      "High buyer adoption"
    ],
    limitations: [
      "Keyword search only - can't discover similar challenges",
      "No cross-sector view",
      "No similarity or pattern detection",
      "Document-heavy, not intelligence-focused"
    ],
    whatItDoesnt: "Reveal that the same problem exists in multiple sectors"
  },
  {
    platform: "Innovate UK Portal / KTN",
    model: "Transactional",
    primaryFunction: "Connect grant recipients to opportunities",
    strengths: [
      "Strong SME network",
      "Grant integration",
      "Sector expertise"
    ],
    limitations: [
      "Grant-focused, not procurement-wide",
      "Single-sector view within each network",
      "No challenge clustering",
      "Limited cross-sector intelligence"
    ],
    whatItDoesnt: "Show an energy solution could serve rail and transport"
  },
  {
    platform: "SBRI Healthcare / Sector Portals",
    model: "Transactional",
    primaryFunction: "Sector-specific innovation challenges",
    strengths: [
      "Deep sector knowledge",
      "Structured evaluation",
      "Proven track record"
    ],
    limitations: [
      "Deliberately siloed by design",
      "Each sector operates independently",
      "No pattern analysis across sectors",
      "Evidence doesn't transfer between portals"
    ],
    whatItDoesnt: "Enable collaboration between sectors solving the same problem"
  },
  {
    platform: "Innovation Exchange (Our Approach)",
    model: "Diagnostic + Intelligence",
    primaryFunction: "Reveal cross-sector patterns and enable evidence transfer",
    strengths: [
      "Cross-sector challenge mapping",
      "Pattern detection and clustering",
      "Visual intelligence layer",
      "Evidence reuse infrastructure (Phase 3)"
    ],
    limitations: [
      "Doesn't replace legal procurement portals",
      "Requires buyer trust in cross-sector evidence",
      "Network effects needed for full value"
    ],
    whatItDoes: "Make the invisible visible - show which sectors share challenges and which innovations can serve multiple buyers"
  }
];

// ============================================
// RISK ANALYSIS DATA
// ============================================
export const riskAnalysisData = [
  {
    id: 1,
    risk: "Buyer Non-Adoption",
    description: "Procurement officers won't engage with the platform",
    impact: "Critical",
    probability: "High",
    redTeamQuote: "Buyers are risk-averse and time-poor; they rarely adopt new tools unless mandated or tied to KPIs.",
    ourMitigation: [
      "Secure 3-5 anchor buyers BEFORE full launch (Network Rail, progressive local authorities)",
      "Frame as 'innovation talent pipeline' not 'another procurement portal'",
      "Offer white-glove service for early adopters - we curate matches manually",
      "Make it their tool for collaboration, not compliance"
    ],
    phase1Test: "If we can't secure 5 anchor buyer commitments with MOUs, we don't proceed to Phase 2",
    mitigationEvidence: "CPC already has established relationships with Network Rail, National Highways, and 10+ local authorities through existing programs"
  },
  {
    id: 2,
    risk: "Platform Fatigue",
    description: "Dismissed as 'just another innovation portal'",
    impact: "High",
    probability: "Medium",
    redTeamQuote: "We've seen so many innovation portals - flashy, then forgotten.",
    ourMitigation: [
      "Lead with visual intelligence, not listings - show patterns in <10 seconds",
      "Differentiate through diagnostic capability vs. transactional",
      "Make it exploratory (curiosity-driven), not administrative",
      "Prove value with small, concrete insights before asking for commitment"
    ],
    phase1Test: "10 stakeholders view the visualization. If <5 say 'I didn't know these sectors had the same problem,' the thesis is invalid",
    mitigationEvidence: "Manual analysis of 100+ challenges already shows 60% cluster into cross-sector patterns"
  },
  {
    id: 3,
    risk: "Data Quality Issues",
    description: "Procurement data is too messy for meaningful similarity detection",
    impact: "Medium-High",
    probability: "High",
    redTeamQuote: "Procurement data is unstructured, inconsistent, and full of legal boilerplate.",
    ourMitigation: [
      "Start with manual curation (100+ challenges hand-tagged)",
      "Build layered AI: keyword overlap → semantic embeddings → metadata enrichment",
      "Develop shared taxonomy for 'problem types' with domain experts",
      "Progressive complexity - prove value at each layer before adding next"
    ],
    phase1Test: "Similarity algorithm achieves >70% agreement with expert human judgment on sample of 50 challenge pairs",
    mitigationEvidence: "We've already curated 100+ challenges and developed initial taxonomy of 8 cross-sector problem types"
  },
  {
    id: 4,
    risk: "Evidence Transfer Rejection",
    description: "Buyers won't accept cross-sector validation",
    impact: "High",
    probability: "Medium",
    redTeamQuote: "Many sectors have strict compliance. Cross-acceptance is culturally resisted.",
    ourMitigation: [
      "Don't lead with evidence - it's Phase 3, not Phase 1",
      "Co-create standards with regulatory bodies (Ofgem, ORR, DfT)",
      "Start with low-risk domains (software, analytics) before physical systems",
      "Frame as risk reduction, not replacement of validation"
    ],
    phase1Test: "Phase 1 doesn't depend on evidence acceptance - we're proving patterns exist first",
    mitigationEvidence: "Phased approach allows us to validate demand for pattern intelligence before building evidence infrastructure"
  },
  {
    id: 5,
    risk: "Economic Sustainability",
    description: "Can't generate revenue to become self-sustaining",
    impact: "Medium",
    probability: "Medium",
    redTeamQuote: "SMEs have tight margins; buyers often can't pay subscriptions due to procurement rules.",
    ourMitigation: [
      "Front-load institutional partnerships (DfT, UKRI) as anchor funders",
      "Phase 1-2 focus on proving value, not extracting revenue",
      "Revenue from analytics and certification (Innovation Passport) more credible than subscriptions",
      "CPC's role as neutral convener enables government support models"
    ],
    phase1Test: "Secure £150-200k Phase 1 funding from institutional partners or innovation funds",
    mitigationEvidence: "CPC's existing relationships and mission alignment position this as strategic investment in UK innovation infrastructure"
  }
];

// ============================================
// CPC ADVANTAGES DATA
// ============================================
export const cpcAdvantagesData = [
  {
    advantage: "Neutral Convener",
    description: "Trusted by both SMEs and buyers",
    evidence: "No commercial agenda, mission-aligned with UK innovation",
    alternative: "Private company → conflict of interest. Government department → bureaucratic, single-sector"
  },
  {
    advantage: "Cross-Sector Credibility",
    description: "Work across rail, energy, local government, transport, built environment",
    evidence: "Only organization with deep relationships in all infrastructure sectors",
    alternative: "Sector-specific bodies → siloed. Consultancies → episodic engagement"
  },
  {
    advantage: "Technical Expertise",
    description: "Can develop credible evidence standards and AI/data capabilities",
    evidence: "Data & Digital Products team with AI/ML, data standards, and platform experience",
    alternative: "Tech providers → no domain credibility. Industry bodies → no technical capability"
  },
  {
    advantage: "Government Relationships",
    description: "Can influence procurement policy and secure institutional backing",
    evidence: "Direct relationships with DfT, UKRI, Ofgem, ORR, and progressive local authorities",
    alternative: "Startups → no policy access. Academia → no commercialization mandate"
  },
  {
    advantage: "Mission Alignment",
    description: "Exists to accelerate innovation adoption - this IS the mission",
    evidence: "People, Planet, Prosperity goals directly served by faster innovation diffusion",
    alternative: "Commercial platforms → profit-first. Government portals → compliance-first"
  }
];

// ============================================
// PHASE 1 METRICS DATA
// ============================================
export const phase1MetricsData = {
  primary: {
    metric: "Pattern Recognition Validation",
    target: "10 stakeholders view the visualization. ≥5 say 'I didn't know these sectors had the same problem.'",
    why: "Proves the core thesis: cross-sector patterns exist and have value",
    measurement: "Structured interviews with buyers and SMEs after demo",
    passThreshold: "50% validation rate",
    excellenceThreshold: "70% validation rate"
  },
  secondary: [
    {
      metric: "Data Coverage",
      target: "100+ challenges mapped across 5+ sectors",
      current: "✓ Already achieved in prototype",
      why: "Demonstrates sufficient data exists to prove patterns"
    },
    {
      metric: "Pattern Detection",
      target: "Identify 5+ concrete cross-sector challenge clusters",
      current: "Predictive maintenance, structural monitoring, net-zero retrofits identified",
      why: "Proves algorithm can surface meaningful similarities"
    },
    {
      metric: "Anchor Buyer Commitment",
      target: "3-5 infrastructure buyers commit to Phase 2 participation (MOUs)",
      current: "In discussion with Network Rail, 2 local authorities",
      why: "De-risks Phase 2 by ensuring buyer demand exists"
    },
    {
      metric: "Technical Feasibility",
      target: "Similarity algorithm achieves >70% agreement with expert judgment",
      current: "Not yet tested - Phase 1 deliverable",
      why: "Validates technical approach before scaling"
    }
  ],
  failureThreshold: {
    trigger: "If <3 of the secondary metrics are met, OR primary metric <40% validation",
    action: "Stop after Phase 1, conduct post-mortem, reassess approach",
    why: "Clear exit criteria prevent investing in unviable concept"
  }
};

export const phase1ResourcesData = {
  timeline: "3 months (Weeks 1-12)",
  totalInvestment: "£150-200k",
  breakdown: {
    cpcInternal: {
      personDays: 100,
      cost: "£80-100k (internal allocation)",
      roles: [
        { role: "Product Owner / Project Lead", days: 40, activities: "Stakeholder management, vision, prioritization" },
        { role: "Buyer Relationship Management", days: 30, activities: "Anchor buyer recruitment, MOUs, feedback loops" },
        { role: "SME Engagement", days: 20, activities: "User research, testing, onboarding" },
        { role: "Technical Oversight", days: 10, activities: "Architecture review, quality assurance" }
      ]
    },
    external: {
      personDays: 80,
      cost: "£70-100k",
      components: [
        { component: "Platform Development", days: 60, cost: "£60-80k", deliverable: "Web app with visualization, filters, search" },
        { component: "UX/UI Design", days: 20, cost: "£10-20k", deliverable: "Design system, wireframes, user testing" }
      ]
    },
    nonStaff: {
      cost: "£5-10k",
      items: [
        { item: "Cloud Infrastructure", cost: "£5k", details: "Supabase, hosting, CDN" },
        { item: "Procurement API Access", cost: "£2k", details: "If needed for automated scraping" },
        { item: "User Testing Incentives", cost: "£2k", details: "Stakeholder interview compensation" }
      ]
    }
  }
};

export const phase1DeliverablesData = [
  {
    deliverable: "Challenge Repository",
    description: "50 curated challenges from UK procurement sources",
    status: "complete",
    evidence: "PoC prototype - Contracts Finder, Innovate UK, SBRI data sources",
    type: "individual"
  },
  {
    deliverable: "Interactive Network Visualization",
    description: "Force-directed graph showing challenge relationships",
    status: "complete",
    evidence: "Prototype validation - users can explore clusters and connections",
    type: "individual"
  },
  {
    deliverable: "Similarity Engine V1",
    description: "Keyword-based algorithm identifying related challenges",
    status: "complete",
    evidence: "Basic prototype - powers network graph connections",
    type: "individual"
  },
  {
    deliverable: "Smart Filters",
    description: "Filter by sector, problem type, budget, deadline",
    status: "complete",
    evidence: "Functional prototype in current build",
    type: "individual"
  },
  {
    deliverable: "Validation Interviews",
    description: "10 stakeholder interviews testing pattern recognition hypothesis",
    status: "in-progress",
    evidence: "Scheduled for post-hackathon validation phase",
    type: "individual"
  },
  {
    deliverable: "Anchor Buyer MOUs",
    description: "3-5 committed buyers for Phase 2",
    status: "in-progress",
    evidence: "Network Rail + 2 local authorities in early discussions",
    type: "individual"
  },
  {
    deliverable: "Technical Architecture Document",
    description: "Detailed design for scalability and Phase 2 expansion",
    status: "complete",
    evidence: "Prototype architecture documented for scaling validation",
    type: "individual"
  }
];

// Phase 2 and 3 data for summary cards
export const phaseData = {
  phase2: {
    title: "Phase 2: Scale & Network Effects",
    status: "Planned",
    timeline: "Months 7-18",
    description: "Scale to 500+ challenges, advanced AI similarity, buyer marketplace features",
    type: "summary"
  },
  phase3: {
    title: "Phase 3: Evidence Infrastructure",
    status: "Future",
    timeline: "Months 19-36",
    description: "Innovation Passport system, cross-sector evidence validation, full marketplace",
    type: "summary"
  }
};

// ============================================
// REVIEWER FEEDBACK MAPPING
// ============================================
export const reviewerFeedbackData = [
  {
    feedback: "Resources look light relative to the scale of the challenge",
    ourResponse: "We've intentionally scoped Phase 1 to intelligence layer only (not full marketplace). £150-200k for 100 person-days is realistic for curated data + visualization.",
    evidence: "See 'Phase 1 Success Criteria' section with detailed resource breakdown and clear deliverables",
    sectionId: "phase-1-feasibility"
  },
  {
    feedback: "More information needed on what prototype is intended to deliver",
    ourResponse: "Phase 1 delivers: Challenge repository (100+), interactive network visualization, similarity engine V1, smart filters, and validation of cross-sector pattern hypothesis",
    evidence: "See 'Phase 1 Success Criteria' section with complete deliverables checklist (4 already complete)",
    sectionId: "phase-1-feasibility"
  },
  {
    feedback: "Would be good to see a prior stage to evaluate current services and understand failures",
    ourResponse: "Added comprehensive analysis comparing existing platforms (Contracts Finder, Innovate UK, SBRI) showing they're transactional, not diagnostic",
    evidence: "See 'Why Current Services Fail' section with side-by-side comparison and specific failure modes",
    sectionId: "platform-comparison"
  },
  {
    feedback: "Complex usability and data challenge",
    ourResponse: "We've stress-tested this approach and identified every major risk (buyer adoption, platform fatigue, data quality, evidence acceptance, sustainability) with specific mitigation strategies",
    evidence: "See 'We've Stress-Tested This Approach' section with 5 risks, red team analysis, and Phase 1 validation criteria",
    sectionId: "risk-mitigation"
  },
  {
    feedback: "Development should involve industry/SMEs, with CPC in supporting capacity",
    ourResponse: "Agreed. Our approach: External development partner for platform build (~60 days), CPC provides product ownership, stakeholder relationships, and domain expertise (100 days). CPC as convener, not builder.",
    evidence: "See 'Why CPC Is Uniquely Positioned' section explaining neutral convener role and 'Phase 1 Resources' showing external/internal split",
    sectionId: "why-cpc"
  }
];