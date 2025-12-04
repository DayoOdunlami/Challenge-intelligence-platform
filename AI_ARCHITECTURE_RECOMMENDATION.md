# AI Architecture Recommendation - Research vs Data Verification

## Your Question

You're considering using your research AI tool (Perplexity-like) for both:
1. Challenge statement scraping / horizon scanning
2. Data verification and flagging

**Should this be the same AI agent, different agents, or separate systems?**

---

## My Recommendation: **Separate AI Agents with Shared Foundation**

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              AI Foundation Layer                        │
│  - LLM Provider (Claude/OpenAI)                        │
│  - Embeddings                                           │
│  - Knowledge Base                                       │
└─────────────────────────────────────────────────────────┘
                    ↓                    ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   Research AI Agent      │  │  Verification AI Agent   │
│   (Perplexity-like)      │  │  (Data Quality)          │
└──────────────────────────┘  └──────────────────────────┘
         ↓                              ↓
┌──────────────────┐        ┌──────────────────────┐
│ - Horizon scan   │        │ - Data verification  │
│ - Scrape         │        │ - Flag issues        │
│ - Extract        │        │ - Suggest fixes      │
│ - Generate       │        │ - Cross-reference    │
└──────────────────┘        └──────────────────────┘
```

---

## Why Separate Agents?

### 1. **Different Skills & Prompts**

**Research Agent:**
- Focus: Information gathering, extraction, synthesis
- Skills: Web search, content parsing, summarization
- Output: New entities, relationships, insights
- Context: External sources, current events

**Verification Agent:**
- Focus: Data quality, validation, consistency
- Skills: Cross-referencing, validation, anomaly detection
- Output: Quality scores, flags, suggestions
- Context: Internal knowledge base, existing entities

### 2. **Different Workflows**

**Research Agent Workflow:**
```
User query → Search external sources → Extract entities → 
Create new BaseEntity → Classify → Add to dataset
```

**Verification Agent Workflow:**
```
Entity → Check against KB → Validate fields → 
Cross-reference → Flag issues → Suggest fixes
```

### 3. **Different Trust Requirements**

**Research Agent:**
- Lower initial confidence (new data)
- Needs human review before verification
- Output: `needs_review` classification

**Verification Agent:**
- Higher confidence requirements
- Uses multiple sources for validation
- Output: Verification status, confidence scores

---

## Shared Foundation Layer

Both agents can share:
- **LLM Provider** (Claude/OpenAI)
- **Embeddings** for semantic search
- **Knowledge Base** access
- **Entity Storage** (same BaseEntity format)

---

## Implementation

### Research AI Agent

```typescript
// src/lib/ai/research-agent.ts
export class ResearchAgent {
  async horizonScan(query: string): Promise<BaseEntity[]> {
    // 1. Search external sources (web, databases, APIs)
    const sources = await this.searchExternalSources(query);
    
    // 2. Extract entities using LLM
    const entities = await this.extractEntities(sources);
    
    // 3. Classify as 'needs_review'
    return entities.map(entity => 
      autoClassifyNewData(entity, {
        sourceType: 'scraped',
        sourceName: 'Research Agent',
      })
    );
  }
  
  async scrapeChallengeStatements(portal: string): Promise<BaseEntity[]> {
    // Scrape and extract challenge statements
    // Auto-classify as 'needs_review'
  }
}
```

### Verification AI Agent

```typescript
// src/lib/ai/verification-agent.ts
export class VerificationAgent {
  async verifyEntity(entity: BaseEntity): Promise<{
    verified: boolean;
    confidence: number;
    issues: string[];
    suggestions: string[];
  }> {
    // 1. Cross-reference with knowledge base
    const kbMatches = await this.searchKnowledgeBase(entity);
    
    // 2. Validate fields
    const fieldValidation = this.validateFields(entity);
    
    // 3. Check for duplicates
    const duplicates = await this.findDuplicates(entity);
    
    // 4. Use LLM to assess overall quality
    const aiAssessment = await this.assessWithLLM(entity, {
      kbMatches,
      fieldValidation,
      duplicates,
    });
    
    return {
      verified: aiAssessment.verified,
      confidence: aiAssessment.confidence,
      issues: aiAssessment.issues,
      suggestions: aiAssessment.suggestions,
    };
  }
  
  async flagIssues(entities: BaseEntity[]): Promise<BaseEntity[]> {
    // Batch flagging using verification agent
    return Promise.all(entities.map(async entity => {
      const verification = await this.verifyEntity(entity);
      
      if (verification.issues.length > 0) {
        return {
          ...entity,
          provenance: addQualityFlag(entity.provenance, {
            type: 'custom',
            severity: verification.confidence < 0.5 ? 'error' : 'warning',
            message: verification.issues.join('; '),
            flaggedBy: 'verification-ai-agent',
          }),
        };
      }
      
      return entity;
    }));
  }
}
```

---

## Unified AI Service (Optional)

If you want a unified interface:

```typescript
// src/lib/ai/ai-service.ts
export class AIService {
  private researchAgent: ResearchAgent;
  private verificationAgent: VerificationAgent;
  
  async research(query: string): Promise<BaseEntity[]> {
    return this.researchAgent.horizonScan(query);
  }
  
  async verify(entity: BaseEntity): Promise<VerificationResult> {
    return this.verificationAgent.verifyEntity(entity);
  }
  
  async generateReport(entities: BaseEntity[], visualization: string): Promise<string> {
    // Can use either agent or a separate report generation agent
    // This uses research agent's summarization skills
    return this.researchAgent.generateReport(entities, visualization);
  }
}
```

---

## Benefits of This Architecture

### ✅ Separation of Concerns
- Each agent has clear purpose
- Easier to optimize each independently
- Different prompts/instructions for each

### ✅ Reusability
- Shared foundation (LLM, embeddings, KB)
- Both agents produce BaseEntity format
- Can combine workflows

### ✅ Scalability
- Can optimize verification agent for speed
- Research agent can use different LLM models
- Independent rate limiting/quotas

### ✅ Flexibility
- Add new agents (e.g., Report Generation Agent)
- Swap LLM providers per agent
- Different quality thresholds per agent

---

## Integration with Provenance

### Research Agent Integration

```typescript
// Research agent creates entities with classification
const newEntity = await researchAgent.horizonScan('hydrogen aviation');
// → Entity classified as 'needs_review'
// → Added to verification queue
```

### Verification Agent Integration

```typescript
// Verification agent verifies entities
const result = await verificationAgent.verifyEntity(entity);
if (result.verified) {
  entity.provenance = markAsVerified(entity.provenance, 'verification-ai-agent', result.confidence);
  entity.metadata.custom.baselineClassification = 'real';
}
```

---

## Recommendation Summary

### ✅ Use Separate Agents

**Research Agent:**
- Horizon scanning
- Challenge scraping
- Entity extraction
- Report generation

**Verification Agent:**
- Data quality checks
- Cross-referencing
- Issue flagging
- Verification scoring

### ✅ Shared Foundation
- Same LLM provider
- Same knowledge base
- Same entity format (BaseEntity)
- Unified API if needed

### ✅ Workflow
1. Research Agent → Creates entities → Auto-classified as `needs_review`
2. Entities appear in verification queue
3. Verification Agent → Verifies entities → Updates classification to `real`
4. Verified entities appear in high-quality views

---

## Alternative: Single Agent with Different Modes

If you want to simplify:

```typescript
// Single agent with modes
export class UnifiedAIAgent {
  async execute(task: {
    mode: 'research' | 'verification' | 'report';
    input: any;
  }) {
    switch (task.mode) {
      case 'research':
        return this.horizonScan(task.input);
      case 'verification':
        return this.verifyEntity(task.input);
      case 'report':
        return this.generateReport(task.input);
    }
  }
}
```

**But I still recommend separate agents** for clarity, optimization, and maintenance.

---

**Start with separate agents, add a unified API layer if needed. This gives you flexibility and clarity.**

