import { FundingFlowData } from './types';

export const fundingFlowsData: FundingFlowData = {
  nodes: [
    { name: "Public", category: "source" },
    { name: "Private", category: "source" },
    { name: "DfT", category: "government" },
    { name: "DBT", category: "government" },
    { name: "DSIT", category: "government" },
    { name: "DBEIS", category: "government" },
    { name: "DESNZ", category: "government" },
    { name: "DWP", category: "government" },
    { name: "UKRI", category: "intermediary" },
    { name: "IUK", category: "intermediary" },
    { name: "CAA", category: "intermediary" },
    { name: "HSE", category: "intermediary" },
    { name: "Airbus", category: "private" },
    { name: "ATI", category: "recipient" },
    { name: "ESC", category: "recipient" },
    { name: "CPC", category: "recipient" },
    { name: "TRIG", category: "recipient" },
    { name: "Milestone", category: "recipient" }
  ],
  links: [
    // Level 0 → Level 1: Public → Government Departments (Total: $255M)
    { source: "Public", target: "DfT", value: 35 },
    { source: "Public", target: "DBT", value: 30 },
    { source: "Public", target: "DSIT", value: 60 },
    { source: "Public", target: "DBEIS", value: 70 },
    { source: "Public", target: "DESNZ", value: 60 },
    { source: "Public", target: "DWP", value: 30 },
    // Level 0 → Level 1: Private → Entities (Total: $55M shown, but only $25M visible)
    { source: "Private", target: "HSE", value: 10 },
    { source: "Private", target: "Airbus", value: 15 },
    // Level 1 → Level 2: Government Departments → Intermediaries
    { source: "DSIT", target: "UKRI", value: 60 },
    { source: "DBEIS", target: "UKRI", value: 70 },
    { source: "DESNZ", target: "UKRI", value: 60 },
    { source: "DfT", target: "IUK", value: 35 },
    { source: "DBT", target: "IUK", value: 30 },
    { source: "DWP", target: "CAA", value: 30 },
    { source: "HSE", target: "CAA", value: 6 },
    // Level 2 → Level 2: UKRI → IUK (consolidation)
    { source: "UKRI", target: "IUK", value: 190 }, // Sum of DSIT+DBEIS+DESNZ
    // Level 2 → Level 3: Intermediaries → Recipients
    { source: "IUK", target: "ATI", value: 35 },
    { source: "IUK", target: "ESC", value: 20 },
    { source: "IUK", target: "CPC", value: 65 },
    // Level 3 → Level 4: CPC → Final Recipients
    { source: "CPC", target: "TRIG", value: 5 },
    { source: "CPC", target: "Milestone", value: 10 }
  ]
};

