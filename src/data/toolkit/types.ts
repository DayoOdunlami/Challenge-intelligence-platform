export interface ToolkitStakeholder {
  id: string;
  name: string;
  shortName?: string;
  category: 'government' | 'academia' | 'industry' | 'intermediary';
  logo?: string;
  description: string;
  verified: boolean;
  additional?: boolean;
}

export interface WorkingGroup {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  memberIds: string[];
  focus: string[];
  established?: string;
  verified: boolean;
}

export interface ToolkitProject {
  id: string;
  name: string;
  fullName?: string;
  description: string;
  stakeholderIds: string[];
  funderId?: string;
  fundingAmount?: number | null;
  trlLevel: number;
  category: 'infrastructure' | 'research' | 'aircraft' | 'propulsion';
  status: 'active' | 'completed' | 'planned';
  startDate?: string;
  endDate?: string;
  verified: boolean;
  additional?: boolean;
}

export interface Relationship {
  source: string;
  target: string;
  type: 'funds' | 'delivers' | 'leads' | 'member' | 'host' | 'regulates' | 'advises' | 'chair';
  verified: boolean;
}

export interface FundingFlowNode {
  name: string;
  category: 'source' | 'government' | 'intermediary' | 'private' | 'recipient';
}

export interface FundingFlowLink {
  source: string;
  target: string;
  value: number;
}

export interface FundingFlowData {
  nodes: FundingFlowNode[];
  links: FundingFlowLink[];
}

