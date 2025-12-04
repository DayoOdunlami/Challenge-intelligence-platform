# AI Implementation Brief - Focused Build Plan

**Core features to build: Vector Store, Chat+RAG, Cross-domain, Scenario Modeling, Reports**

---

## Implementation Timeline

### Days 1-2: Vector Store + Embeddings

**Priority:** Foundation for everything

**Tasks:**
- [ ] Implement JSONVectorStore
- [ ] Embed all existing entities on build
- [ ] Semantic search API
- [ ] "Find Similar" endpoint

**Deliverables:**
- ✅ Vector store operational
- ✅ All entities embedded
- ✅ Semantic search working

---

### Day 3: Semantic Search / Find Similar

**Priority:** Quick user value

**Tasks:**
- [ ] "Find Similar" button on entity cards
- [ ] Similarity search endpoint
- [ ] Results display component
- [ ] "Why similar?" explanation

**Deliverables:**
- ✅ "Find Similar" feature live
- ✅ Users can discover related entities

---

### Days 4-6: Chat + RAG + Tool Use

**Priority:** Core AI interface

**Tasks:**
- [ ] RAG context building (pull relevant entities)
- [ ] Include visualization state in context
- [ ] Tool-augmented chat (ReAct pattern)
- [ ] Function calling integration
- [ ] Conversation history
- [ ] Expert-guided reasoning templates

**Deliverables:**
- ✅ Chat interface with RAG
- ✅ Tools for data manipulation
- ✅ Expert-guided responses

---

### Days 7-8: Cross-Domain Pattern Matching

**Priority:** Unique differentiator

**Tasks:**
- [ ] Cross-domain similarity search
- [ ] "Solved in other sectors" feature
- [ ] Solution adaptation suggestions
- [ ] UI integration

**Deliverables:**
- ✅ Cross-domain insights working
- ✅ Users see solutions from other sectors

---

### Days 9-10: Report Generator

**Priority:** Actionability

**Tasks:**
- [ ] Template system
- [ ] AI narrative generation
- [ ] Markdown → PDF/DOCX export
- [ ] Entity selection UI

**Deliverables:**
- ✅ Report generation functional
- ✅ Users can export insights

---

## Tool-Augmented Chat Architecture

### ReAct Pattern (Reasoning + Acting)

**Key Innovation:** Chat has tools to query/manipulate platform data, not just RAG.

```typescript
// src/lib/ai/agents/intelligence-agent.ts
export class IntelligenceAgent {
  private vectorStore: VectorStoreInterface;
  private tools: AITool[];
  
  constructor() {
    this.tools = this.initializeTools();
  }
  
  /**
   * Initialize platform tools
   */
  private initializeTools(): AITool[] {
    return [
      {
        name: 'filter_entities',
        description: 'Filter entities by criteria (domain, TRL, sector, funding, etc.)',
        parameters: {
          type: 'object',
          properties: {
            domain: { type: 'string' },
            entityType: { type: 'string' },
            trlRange: { type: 'array', items: { type: 'number' } },
            sector: { type: 'string' },
            minFunding: { type: 'number' },
          },
        },
        execute: async (params) => {
          return this.filterEntities(params);
        },
      },
      {
        name: 'calculate_funding_gap',
        description: 'Calculate funding gap for a sector or challenge set. Can apply multipliers for "what-if" scenarios.',
        parameters: {
          type: 'object',
          properties: {
            sector: { type: 'string' },
            challengeIds: { type: 'array', items: { type: 'string' } },
            fundingMultiplier: { type: 'number', description: 'Apply multiplier (e.g., 2.0 = double funding)' },
          },
        },
        execute: async (params) => {
          return this.calculateFundingGap(params);
        },
      },
      {
        name: 'find_similar_challenges',
        description: 'Find challenges similar to given challenge, optionally in other domains',
        parameters: {
          type: 'object',
          properties: {
            challengeId: { type: 'string' },
            crossDomain: { type: 'boolean', description: 'Search across domains' },
            topK: { type: 'number' },
          },
        },
        execute: async (params) => {
          return this.findSimilarChallenges(params);
        },
      },
      {
        name: 'find_dependencies',
        description: 'Find entities that depend on or are connected to a given entity',
        parameters: {
          type: 'object',
          properties: {
            entityId: { type: 'string' },
            relationshipTypes: { type: 'array', items: { type: 'string' } },
          },
        },
        execute: async (params) => {
          return this.findDependencies(params);
        },
      },
      {
        name: 'simulate_removal',
        description: 'Show network impact if entity is removed (what entities become disconnected)',
        parameters: {
          type: 'object',
          properties: {
            entityId: { type: 'string' },
          },
        },
        execute: async (params) => {
          return this.simulateRemoval(params);
        },
      },
      {
        name: 'compare_scenarios',
        description: 'Compare two filtered views side-by-side (scenario A vs scenario B)',
        parameters: {
          type: 'object',
          properties: {
            scenarioA: { type: 'object', description: 'Filter criteria for scenario A' },
            scenarioB: { type: 'object', description: 'Filter criteria for scenario B' },
          },
        },
        execute: async (params) => {
          return this.compareScenarios(params);
        },
      },
      {
        name: 'get_network_statistics',
        description: 'Get statistics about current network view (entity counts, funding totals, etc.)',
        parameters: {
          type: 'object',
          properties: {
            entityIds: { type: 'array', items: { type: 'string' } },
          },
        },
        execute: async (params) => {
          return this.getNetworkStatistics(params);
        },
      },
    ];
  }
  
  /**
   * Chat with tool-augmented reasoning (ReAct)
   */
  async chat(
    query: string,
    context: {
      currentView?: string;
      selectedEntities?: BaseEntity[];
      activeFilters?: Record<string, any>;
      conversationHistory?: Message[];
    }
  ): Promise<ChatResponse> {
    // 1. RAG: Find relevant entities
    const relevantEntities = await this.vectorStore.search(query, {
      topK: 20,
    });
    
    // 2. Build RAG context
    const ragContext = await this.buildRAGContext({
      query,
      relevantEntities: relevantEntities.map(r => r.entity),
      currentView: context.currentView,
      selectedEntities: context.selectedEntities || [],
      activeFilters: context.activeFilters,
    });
    
    // 3. Determine if tools are needed
    const needsTools = this.shouldUseTools(query);
    
    // 4. Generate response with tool calling if needed
    const response = await this.llm.chatWithTools({
      messages: [
        ...this.buildSystemPrompt(ragContext),
        ...(context.conversationHistory || []),
        { role: 'user', content: query },
      ],
      tools: needsTools ? this.tools.map(t => this.toolToFunction(t)) : undefined,
      toolChoice: needsTools ? 'auto' : undefined,
    });
    
    // 5. Execute tool calls if any
    let toolResults: any[] = [];
    if (response.toolCalls && response.toolCalls.length > 0) {
      toolResults = await Promise.all(
        response.toolCalls.map(async (call) => {
          const tool = this.tools.find(t => t.name === call.name);
          if (!tool) return null;
          
          return {
            tool: call.name,
            result: await tool.execute(call.arguments),
          };
        })
      );
      
      // 6. Continue conversation with tool results
      const finalResponse = await this.llm.chatWithTools({
        messages: [
          ...response.messages,
          {
            role: 'tool',
            content: JSON.stringify(toolResults),
          },
        ],
        tools: this.tools.map(t => this.toolToFunction(t)),
      });
      
      return {
        message: finalResponse.content,
        toolCalls: response.toolCalls,
        toolResults,
        entities: this.extractEntitiesFromResponse(finalResponse),
      };
    }
    
    return {
      message: response.content,
      entities: this.extractEntitiesFromResponse(response),
    };
  }
  
  /**
   * Build RAG context from current state
   */
  private async buildRAGContext(context: {
    query: string;
    relevantEntities: BaseEntity[];
    currentView?: string;
    selectedEntities: BaseEntity[];
    activeFilters?: Record<string, any>;
  }): Promise<RAGContext> {
    return {
      // Retrieved entities
      relevantEntities: context.relevantEntities.slice(0, 10).map(e => ({
        id: e.id,
        name: e.name,
        description: e.description,
        domain: e.domain,
        entityType: e.entityType,
        metadata: {
          sector: e.metadata.sector,
          trl: e.metadata.trl,
          funding: e.metadata.funding,
        },
      })),
      
      // Current visualization state
      currentView: context.currentView,
      selectedEntities: context.selectedEntities.map(e => ({
        id: e.id,
        name: e.name,
        entityType: e.entityType,
      })),
      activeFilters: context.activeFilters,
      
      // Knowledge base snippets (if available)
      knowledgeBase: await this.getRelevantKBSnippets(context.relevantEntities),
    };
  }
  
  /**
   * Determine if query needs tools
   */
  private shouldUseTools(query: string): boolean {
    const toolKeywords = [
      'what if', 'simulate', 'calculate', 'compare', 'filter',
      'show only', 'what happens', 'impact', 'remove', 'dependency',
      'funding gap', 'scenario',
    ];
    
    return toolKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }
}
```

---

## Scenario Modeling Tools Implementation

### Tool 1: Filter Entities

```typescript
// In IntelligenceAgent
private async filterEntities(params: {
  domain?: Domain;
  entityType?: EntityType;
  trlRange?: [number, number];
  sector?: string;
  minFunding?: number;
}): Promise<FilterResult> {
  let entities = unifiedEntities;
  
  // Apply filters
  if (params.domain) {
    entities = entities.filter(e => e.domain === params.domain);
  }
  if (params.entityType) {
    entities = entities.filter(e => e.entityType === params.entityType);
  }
  if (params.trlRange) {
    entities = entities.filter(e => {
      const trl = e.metadata.trl;
      if (typeof trl === 'number') {
        return trl >= params.trlRange![0] && trl <= params.trlRange![1];
      }
      // Handle TRL ranges
      return false; // Simplified
    });
  }
  if (params.sector) {
    entities = entities.filter(e => 
      e.metadata.sector === params.sector || 
      (Array.isArray(e.metadata.sector) && e.metadata.sector.includes(params.sector))
    );
  }
  if (params.minFunding) {
    entities = entities.filter(e => 
      (e.metadata.funding?.amount || 0) >= params.minFunding!
    );
  }
  
  return {
    count: entities.length,
    entities: entities.slice(0, 50), // Limit for response
    summary: this.generateFilterSummary(entities, params),
  };
}
```

---

### Tool 2: Calculate Funding Gap

```typescript
private async calculateFundingGap(params: {
  sector?: string;
  challengeIds?: string[];
  fundingMultiplier?: number;
}): Promise<FundingGapResult> {
  // Find relevant challenges
  let challenges = unifiedEntities.filter(e => e.entityType === 'challenge');
  
  if (params.sector) {
    challenges = challenges.filter(c => 
      c.metadata.sector === params.sector
    );
  }
  if (params.challengeIds) {
    challenges = challenges.filter(c => 
      params.challengeIds!.includes(c.id)
    );
  }
  
  // Calculate total funding needed
  const totalNeeded = challenges.reduce((sum, c) => {
    const funding = c.metadata.funding;
    if (funding?.amount) return sum + funding.amount;
    if (funding?.amountMin && funding.amountMax) {
      return sum + (funding.amountMin + funding.amountMax) / 2;
    }
    return sum;
  }, 0);
  
  // Find available funding (from stakeholders)
  const stakeholders = unifiedEntities.filter(e => 
    e.entityType === 'stakeholder' && 
    (params.sector ? e.metadata.sector === params.sector : true)
  );
  
  const availableFunding = stakeholders.reduce((sum, s) => {
    const funding = s.metadata.custom?.total_funding_provided || 0;
    return sum + funding;
  }, 0);
  
  // Apply multiplier if scenario
  const adjustedAvailable = params.fundingMultiplier
    ? availableFunding * params.fundingMultiplier
    : availableFunding;
  
  const gap = totalNeeded - adjustedAvailable;
  
  return {
    sector: params.sector || 'all',
    totalNeeded,
    available: adjustedAvailable,
    gap,
    multiplier: params.fundingMultiplier || 1.0,
    challenges: challenges.length,
    message: gap > 0
      ? `Funding gap of £${(gap / 1000000).toFixed(1)}M. ${challenges.length} challenges need funding.`
      : `Funding surplus of £${(Math.abs(gap) / 1000000).toFixed(1)}M.`,
  };
}
```

---

### Tool 3: Find Dependencies

```typescript
private async findDependencies(params: {
  entityId: string;
  relationshipTypes?: string[];
}): Promise<DependencyResult> {
  const entity = unifiedEntities.find(e => e.id === params.entityId);
  if (!entity) {
    throw new Error(`Entity ${params.entityId} not found`);
  }
  
  // Find all relationships
  const relationships = unifiedRelationships.filter(r => 
    r.source === params.entityId || r.target === params.entityId
  );
  
  // Filter by type if specified
  const filtered = params.relationshipTypes
    ? relationships.filter(r => params.relationshipTypes!.includes(r.type))
    : relationships;
  
  // Get connected entities
  const connectedIds = new Set<string>();
  filtered.forEach(r => {
    if (r.source === params.entityId) connectedIds.add(r.target);
    if (r.target === params.entityId) connectedIds.add(r.source);
  });
  
  const connectedEntities = unifiedEntities.filter(e => 
    connectedIds.has(e.id)
  );
  
  return {
    entity: {
      id: entity.id,
      name: entity.name,
    },
    connections: filtered.length,
    connectedEntities: connectedEntities.map(e => ({
      id: e.id,
      name: e.name,
      entityType: e.entityType,
    })),
    relationshipBreakdown: this.groupByType(filtered),
  };
}
```

---

### Tool 4: Simulate Removal

```typescript
private async simulateRemoval(params: {
  entityId: string;
}): Promise<RemovalImpactResult> {
  // Find all connections
  const dependencies = await this.findDependencies({
    entityId: params.entityId,
  });
  
  // Find entities that would become isolated
  const connectedIds = new Set(dependencies.connectedEntities.map(e => e.id));
  
  // Check which connected entities have other connections
  const isolatedEntities: BaseEntity[] = [];
  
  dependencies.connectedEntities.forEach(entity => {
    const otherConnections = unifiedRelationships.filter(r =>
      (r.source === entity.id || r.target === entity.id) &&
      r.source !== params.entityId &&
      r.target !== params.entityId
    );
    
    // If this entity only connects through the removed entity
    if (otherConnections.length === 0) {
      const fullEntity = unifiedEntities.find(e => e.id === entity.id);
      if (fullEntity) isolatedEntities.push(fullEntity);
    }
  });
  
  return {
    removedEntity: {
      id: params.entityId,
      name: unifiedEntities.find(e => e.id === params.entityId)?.name || '',
    },
    disconnectedEntities: dependencies.connectedEntities.length,
    isolatedEntities: isolatedEntities.map(e => ({
      id: e.id,
      name: e.name,
      entityType: e.entityType,
    })),
    impact: {
      connectionsLost: dependencies.connections,
      entitiesIsolated: isolatedEntities.length,
      networkFragmentation: isolatedEntities.length / unifiedEntities.length,
    },
    message: `Removing this entity would disconnect ${dependencies.connectedEntities.length} entities, of which ${isolatedEntities.length} would become isolated.`,
  };
}
```

---

### Tool 5: Compare Scenarios

```typescript
private async compareScenarios(params: {
  scenarioA: FilterParams;
  scenarioB: FilterParams;
}): Promise<ScenarioComparisonResult> {
  const scenarioA = await this.filterEntities(params.scenarioA);
  const scenarioB = await this.filterEntities(params.scenarioB);
  
  // Calculate differences
  const entityIdsA = new Set(scenarioA.entities.map(e => e.id));
  const entityIdsB = new Set(scenarioB.entities.map(e => e.id));
  
  const onlyInA = scenarioA.entities.filter(e => !entityIdsB.has(e.id));
  const onlyInB = scenarioB.entities.filter(e => !entityIdsA.has(e.id));
  const inBoth = scenarioA.entities.filter(e => entityIdsB.has(e.id));
  
  // Calculate metrics
  const fundingA = this.calculateTotalFunding(scenarioA.entities);
  const fundingB = this.calculateTotalFunding(scenarioB.entities);
  
  return {
    scenarioA: {
      count: scenarioA.count,
      funding: fundingA,
      entities: scenarioA.entities.slice(0, 10),
    },
    scenarioB: {
      count: scenarioB.count,
      funding: fundingB,
      entities: scenarioB.entities.slice(0, 10),
    },
    differences: {
      onlyInA: onlyInA.length,
      onlyInB: onlyInB.length,
      inBoth: inBoth.length,
      fundingDifference: fundingB - fundingA,
    },
    summary: this.generateComparisonSummary(scenarioA, scenarioB),
  };
}
```

---

## Expert-Guided Chat Context

### Include Visualization State

```typescript
// When building chat context
const chatContext = {
  // Current visualization
  currentView: {
    type: 'network-graph',
    visualization: 'network',
    filters: {
      domain: 'atlas',
      trlRange: [6, 8],
    },
  },
  
  // Selected entities
  selectedEntities: [
    { id: 'ch-001', name: 'Digital Railway Signalling' },
  ],
  
  // Visible relationships
  visibleRelationships: unifiedRelationships.filter(r => 
    // Only show relationships in current view
  ),
  
  // Active filters
  activeFilters: {
    domain: 'atlas',
    entityType: 'challenge',
    trlRange: [6, 8],
  },
};
```

---

### Domain-Specific Reasoning Templates

```typescript
// src/lib/ai/expert-templates.ts
export const expertTemplates = {
  challenge_analysis: `
    Analyze this challenge considering:
    
    1. TRL gaps in the solution landscape
       - What TRL levels are missing?
       - Which technologies could address this?
    
    2. Funding distribution vs. similar challenges
       - How does funding compare?
       - Is this underfunded relative to similar challenges?
    
    3. Cross-sector solutions that could apply
       - Has this been solved in other sectors?
       - What solutions exist in other domains?
    
    4. Key stakeholders missing from the ecosystem
       - Who should be involved but isn't?
       - What capabilities are missing?
  `,
  
  stakeholder_assessment: `
    Assess this stakeholder's ecosystem position:
    
    1. Centrality in the network
       - How well-connected are they?
       - What's their influence score?
    
    2. Funding relationships
       - Who do they fund?
       - Who funds them?
       - What's their funding capacity?
    
    3. Capability gaps they could fill
       - What TRL gaps could they address?
       - What challenges align with their capabilities?
    
    4. Similar stakeholders in other domains
       - Who plays similar role in other sectors?
       - What can we learn from cross-domain patterns?
  `,
  
  scenario_modeling: `
    Model this scenario:
    
    1. Apply filters/multipliers to current data
    2. Calculate impact on key metrics
    3. Compare with baseline
    4. Highlight key differences
    5. Recommend actions based on scenario
  `,
};

// Use in chat prompt
function buildExpertPrompt(
  query: string,
  template: keyof typeof expertTemplates,
  context: RAGContext
): string {
  return `
${expertTemplates[template]}

Current Context:
- View: ${context.currentView}
- Selected: ${context.selectedEntities.map(e => e.name).join(', ')}
- Filters: ${JSON.stringify(context.activeFilters)}

User Query: ${query}

Provide analysis following the template above.
  `;
}
```

---

## Report Generator Implementation

```typescript
// src/lib/ai/report-generator.ts
export class ReportGenerator {
  /**
   * Generate comprehensive report
   */
  async generateReport(params: {
    entities: BaseEntity[];
    visualizations: string[];
    topic: string;
    audience: 'executive' | 'analyst' | 'researcher';
  }): Promise<Report> {
    // 1. Analyze entities using RAG
    const analysis = await this.analyzeEntities(params.entities);
    
    // 2. Generate narrative using expert template
    const narrative = await this.llm.generate({
      prompt: this.buildReportPrompt(params, analysis),
      complexity: 'medium',
    });
    
    // 3. Capture visualization snapshots
    const vizSnapshots = await this.captureVisualizations(
      params.visualizations,
      params.entities
    );
    
    // 4. Generate recommendations
    const recommendations = await this.generateRecommendations(
      analysis,
      params.audience
    );
    
    // 5. Structure report
    return {
      title: params.topic,
      executiveSummary: narrative.summary,
      keyFindings: analysis.keyFindings,
      visualizations: vizSnapshots,
      recommendations,
      appendix: {
        entities: params.entities.map(e => ({
          id: e.id,
          name: e.name,
          domain: e.domain,
        })),
        methodology: 'AI-generated using RAG and expert templates',
      },
    };
  }
  
  /**
   * Export as PDF/DOCX
   */
  async exportReport(
    report: Report,
    format: 'pdf' | 'docx' | 'markdown'
  ): Promise<Blob> {
    // Convert to format
    if (format === 'markdown') {
      return this.toMarkdown(report);
    }
    
    if (format === 'pdf') {
      return this.toPDF(report);
    }
    
    if (format === 'docx') {
      return this.toDOCX(report);
    }
    
    throw new Error(`Unsupported format: ${format}`);
  }
}
```

---

## Implementation Checklist

### Days 1-2: Vector Store ✅

- [ ] Implement JSONVectorStore
- [ ] Embed all entities
- [ ] Semantic search API
- [ ] Test search accuracy

### Day 3: Find Similar ✅

- [ ] "Find Similar" endpoint
- [ ] UI button on entity cards
- [ ] Results display
- [ ] "Why similar?" explanation

### Days 4-6: Chat + RAG + Tools ✅

- [ ] RAG context building
- [ ] Include visualization state
- [ ] Tool definitions (7 tools)
- [ ] Tool execution logic
- [ ] ReAct pattern implementation
- [ ] Expert templates
- [ ] Chat UI integration
- [ ] Function calling integration

### Days 7-8: Cross-Domain ✅

- [ ] Cross-domain search
- [ ] "Solved elsewhere" feature
- [ ] Solution adaptation suggestions
- [ ] UI integration

### Days 9-10: Report Generator ✅

- [ ] Template system
- [ ] AI narrative generation
- [ ] Visualization snapshots
- [ ] PDF/DOCX export
- [ ] UI for report generation

---

## Key Architecture Decisions

### 1. Tool-Augmented Chat (ReAct)

**Not just RAG:** Chat has tools to query/manipulate platform data

**Benefits:**
- ✅ Data-driven answers (not just retrieved chunks)
- ✅ Can perform calculations
- ✅ Can simulate scenarios
- ✅ Expert-level reasoning

### 2. Expert Templates

**Domain-specific reasoning:** Guide AI to think like domain expert

**Benefits:**
- ✅ Consistent analysis structure
- ✅ Covers all important angles
- ✅ Actionable insights

### 3. Visualization State in Context

**Current view matters:** Include active filters, selected entities, etc.

**Benefits:**
- ✅ Context-aware responses
- ✅ Can reference what user is seeing
- ✅ Better recommendations

---

**Ready to implement. Start with Days 1-2 (Vector Store), then build chat with tools.**

