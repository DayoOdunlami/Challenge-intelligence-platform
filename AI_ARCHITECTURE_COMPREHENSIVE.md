# Comprehensive AI Architecture - Platform Overview

**Complete guide to AI capabilities, agents, and their interactions**

---

## Executive Summary

Your platform uses **multiple specialized AI agents** working together to enable:
- Challenge intelligence (Atlas)
- Ecosystem mapping (Navigate)
- Data quality management
- Research and discovery
- Report generation

**Current Status:** Foundation in place, several features planned but not yet implemented.

---

## AI Landscape Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   AI Foundation Layer                        │
│  - LLM Providers (OpenAI GPT-4o, Claude Sonnet 4)           │
│  - Embeddings (OpenAI, Sentence Transformers)                │
│  - Knowledge Base (Markdown dossiers, structured data)       │
│  - Function Calling (UI control, data manipulation)          │
└─────────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│ Research Agents  │  │ Verification │  │ User Agents  │
│                  │  │    Agents    │  │              │
└──────────────────┘  └──────────────┘  └──────────────┘
        ↓                 ↓                 ↓
┌─────────────────────────────────────────────────────────────┐
│              Application Layer                                │
│  - Visualizations                                            │
│  - User Interface                                            │
│  - Data Pipeline                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Current AI Features

### ✅ **Implemented Features**

#### 1. **AI Function Calling / UI Control**

**Status:** ✅ **Implemented**

**What it does:**
- AI can control visualizations via function calls
- Switch between visualizations
- Adjust filters and controls
- Highlight entities

**Location:**
- `src/lib/ai-functions.ts` - Function definitions
- `src/components/layouts/AIChatPanel.tsx` - UI integration

**Capabilities:**
```typescript
// AI can call these functions:
- switch_visualization(id)
- set_control(controlId, value)
- filter_data(criteria)
- highlight_entities(entityIds)
```

**Example:**
```
User: "Show me the network graph filtered to TRL 6-8 technologies"
AI: Calls switch_visualization('network') + filter_data({ trlRange: [6, 8] })
```

---

#### 2. **Static Insights (Rule-Based)**

**Status:** ✅ **Implemented**

**What it does:**
- Rule-based insights (no AI needed)
- Funding gaps detection
- TRL bottlenecks
- Key players identification

**Location:**
- Various utility functions throughout codebase

**Example Output:**
- "3 technologies at TRL 6-7 are underfunded"
- "DfT is connected to 15+ entities"
- "Hydrogen production has highest funding concentration"

---

### ⚠️ **Planned but Not Yet Implemented**

#### 3. **Conversational AI Chat**

**Status:** ⚠️ **Planned (AI_FEATURES.chat = false)**

**What it will do:**
- Natural language queries
- Context-aware responses
- Multi-turn conversations
- Integration with visualizations

**Implementation Plan:**
- OpenAI/Claude API integration
- Conversation history management
- Context building from current view

---

#### 4. **AI-Generated Insights**

**Status:** ⚠️ **Planned (AI_FEATURES.ai_insights = false)**

**What it will do:**
- Generate insights from current data view
- Identify patterns and anomalies
- Suggest actions

**Fallback:** Static insights (already implemented)

---

#### 5. **Voice Interface**

**Status:** ⚠️ **Planned (Phase 2, AI_FEATURES.voice = false)**

**What it will do:**
- Voice commands
- Full conversation with interruption handling
- Hands-free exploration

**Technology:** Pipecat + Deepgram + 11Labs

---

## Part 2: Specialized AI Agents

### Agent 1: **Challenge Scraping Agent (Atlas)**

**Purpose:** Extract and process challenge statements from portals

**Status:** ⚠️ **Not Yet Implemented** (Referenced in docs, not built)

**Current Process:**
- Manual challenge entry
- Keywords manually tagged
- Similarity computed from keywords

**Proposed AI-Enhanced Process:**

```typescript
// src/lib/ai/agents/challenge-scraping-agent.ts
export class ChallengeScrapingAgent {
  /**
   * Scrape challenge statements from portals
   */
  async scrapeChallenges(portal: string): Promise<Challenge[]> {
    // 1. Web scraping to get raw HTML
    const rawContent = await this.scraper.fetch(portal);
    
    // 2. LLM extracts structured data
    const extracted = await this.llm.extract({
      prompt: `
        Extract challenge statements from this HTML.
        For each challenge, identify:
        - Title
        - Problem description
        - Sector
        - Problem type
        - Funding amount
        - Deadline
        - Keywords
      `,
      content: rawContent,
    });
    
    // 3. AI classifies into unified schema
    const challenges = await this.classifyToSchema(extracted);
    
    // 4. Auto-classify as 'needs_review'
    return challenges.map(c => 
      autoClassifyNewData(c, {
        sourceType: 'scraped',
        sourceName: portal,
      })
    );
  }
  
  /**
   * Taxonomy conversion - AI maps to unified schema
   */
  async classifyToSchema(rawChallenge: any): Promise<Challenge> {
    // AI maps raw challenge to BaseEntity format
    // Handles:
    // - Sector mapping (portal sector → unified sector)
    // - Problem type normalization
    // - TRL extraction
    // - Funding normalization
    
    return this.llm.mapToSchema({
      source: rawChallenge,
      targetSchema: Challenge,
      context: this.knowledgeBase,
    });
  }
}
```

**Key Responsibilities:**
1. **Scraping** - Fetch challenge statements from portals
2. **Extraction** - Use LLM to extract structured data from unstructured HTML/PDF
3. **Taxonomy Conversion** - Map portal-specific taxonomy to unified BaseEntity schema
4. **Classification** - Auto-classify as `needs_review` for verification

---

### Agent 2: **Challenge Similarity Agent**

**Purpose:** Compute semantic similarity between challenges

**Current Implementation:**
```typescript
// Current: Keyword-based (Jaccard similarity)
function calculateSimilarity(ch1: Challenge, ch2: Challenge): number {
  // Keyword overlap (exact match only)
  const keywordScore = intersection / union;
  
  // Problem type match bonus
  const problemScore = ch1.problem_type === ch2.problem_type ? 0.3 : 0;
  
  // Cross-sector bonus
  const crossSectorMatch = ... ? 0.2 : 0;
  
  return keywordScore + problemScore + crossSectorMatch;
}
```

**Problem:** 
- ❌ **Keywords only** - Won't catch "carbon isotope" vs "decarbonisation"
- ❌ **No semantic understanding** - "energy production" vs "energy reduction" treated as different
- ❌ **Limited context** - Doesn't understand challenge intent

**Proposed AI-Enhanced Solution:**

```typescript
// src/lib/ai/agents/similarity-agent.ts
export class ChallengeSimilarityAgent {
  private embeddings: EmbeddingService;
  
  /**
   * Compute semantic similarity using embeddings
   */
  async computeSimilarity(
    ch1: Challenge,
    ch2: Challenge
  ): Promise<number> {
    // 1. Create embeddings for challenge statements
    const embedding1 = await this.embeddings.create({
      text: `${ch1.title} ${ch1.description} ${ch1.keywords.join(' ')}`,
    });
    
    const embedding2 = await this.embeddings.create({
      text: `${ch2.title} ${ch2.description} ${ch2.keywords.join(' ')}`,
    });
    
    // 2. Cosine similarity of embeddings
    const semanticSimilarity = cosineSimilarity(embedding1, embedding2);
    
    // 3. Hybrid approach: Combine semantic + keyword + metadata
    const keywordScore = this.computeKeywordSimilarity(ch1, ch2);
    const metadataScore = this.computeMetadataSimilarity(ch1, ch2);
    
    // Weighted combination
    return (
      semanticSimilarity * 0.6 +  // 60% semantic (catches meaning)
      keywordScore * 0.2 +         // 20% keyword (exact matches)
      metadataScore * 0.2          // 20% metadata (sector, problem type)
    );
  }
  
  /**
   * LLM-based similarity explanation
   */
  async explainSimilarity(ch1: Challenge, ch2: Challenge): Promise<string> {
    // Use LLM to explain why challenges are similar
    return this.llm.generate({
      prompt: `
        Explain why these challenges are similar:
        Challenge 1: ${ch1.title} - ${ch1.description}
        Challenge 2: ${ch2.title} - ${ch2.description}
        
        Provide a brief explanation of the semantic relationship.
      `,
    });
  }
}
```

**Benefits:**
- ✅ **Semantic understanding** - "carbon isotope" and "decarbonisation" linked
- ✅ **Intent recognition** - "production" vs "reduction" still similar (both about energy)
- ✅ **Context-aware** - Understands challenge meaning, not just keywords

**Implementation Strategy:**
1. **Phase 1:** Add embedding-based similarity alongside keyword
2. **Phase 2:** Hybrid scoring (combine both)
3. **Phase 3:** LLM-based explanation for high-confidence matches

---

### Agent 3: **Data Verification Agent**

**Purpose:** Verify data quality, flag issues, suggest fixes

**Status:** ⚠️ **Planned** (See `AI_ARCHITECTURE_RECOMMENDATION.md`)

**Use Cases:**

```typescript
// src/lib/ai/agents/verification-agent.ts
export class VerificationAgent {
  /**
   * Verify entity against knowledge base
   */
  async verifyEntity(entity: BaseEntity): Promise<VerificationResult> {
    // 1. Cross-reference with KB
    const kbMatches = await this.searchKnowledgeBase(entity);
    
    // 2. Field validation
    const fieldValidation = await this.validateFields(entity);
    
    // 3. Duplicate detection
    const duplicates = await this.findDuplicates(entity);
    
    // 4. LLM assessment
    const aiAssessment = await this.assessWithLLM({
      entity,
      context: { kbMatches, fieldValidation, duplicates },
    });
    
    return {
      verified: aiAssessment.confidence > 0.8,
      confidence: aiAssessment.confidence,
      issues: aiAssessment.issues,
      suggestions: aiAssessment.suggestions,
    };
  }
  
  /**
   * Batch verification for provenance dashboard
   */
  async verifyBatch(entities: BaseEntity[]): Promise<BaseEntity[]> {
    // Process in batches to manage rate limits
    const results = await Promise.all(
      entities.map(entity => this.verifyEntity(entity))
    );
    
    return entities.map((entity, idx) => {
      const result = results[idx];
      if (result.verified) {
        return {
          ...entity,
          provenance: markAsVerified(
            entity.provenance,
            'verification-ai-agent',
            result.confidence
          ),
        };
      } else if (result.issues.length > 0) {
        return {
          ...entity,
          provenance: addQualityFlag(entity.provenance, {
            type: 'custom',
            severity: result.confidence < 0.5 ? 'error' : 'warning',
            message: result.issues.join('; '),
            flaggedBy: 'verification-ai-agent',
          }),
        };
      }
      return entity;
    });
  }
}
```

**Integration:**
- Called from Provenance Dashboard
- Can verify single entities or batches
- Updates provenance automatically

---

### Agent 4: **Research Agent (Horizon Scanning)**

**Purpose:** Discover new entities, solutions, opportunities

**Status:** ⚠️ **Planned** (Referenced, not built)

**Proposed Capabilities:**

```typescript
// src/lib/ai/agents/research-agent.ts
export class ResearchAgent {
  /**
   * Horizon scan for SMEs/solutions related to challenge
   */
  async horizonScanSMEs(challenge: Challenge): Promise<{
    smes: BaseEntity[];
    solutions: SolutionCandidate[];
  }> {
    // 1. Search external sources (web, databases, APIs)
    const sources = await this.searchExternalSources({
      query: `${challenge.title} solution SME startup`,
      filters: {
        geography: 'UK',
        sector: challenge.sector.primary,
      },
    });
    
    // 2. Extract entities using LLM
    const extracted = await this.llm.extract({
      prompt: `
        Find SMEs, startups, or solutions addressing this challenge:
        ${challenge.title}
        ${challenge.description}
        
        For each, extract:
        - Company/SME name
        - Solution description
        - TRL/readiness level
        - Location
        - Funding status
        - Technology category
      `,
      sources,
    });
    
    // 3. Classify readiness and potential
    const solutions = await this.assessReadiness(extracted);
    
    // 4. Categorize by opportunity type
    const categorized = this.categorizeByPotential(solutions);
    
    return {
      smes: solutions.map(s => this.toBaseEntity(s)),
      solutions: categorized,
    };
  }
  
  /**
   * Assess SME readiness and solution potential
   */
  async assessReadiness(
    smes: ExtractedEntity[]
  ): Promise<SolutionCandidate[]> {
    return Promise.all(
      smes.map(async sme => {
        const assessment = await this.llm.assess({
          prompt: `
            Assess this SME/solution:
            ${sme.description}
            
            Categorize by:
            1. Readiness: Blue sky | Early stage | Proven | Commercial
            2. Opportunity: Low-hanging fruit | High-risk high-reward | Obvious | Cross-sector proven
            3. TRL estimate
            4. Market readiness
          `,
        });
        
        return {
          ...sme,
          readiness: assessment.readiness,
          opportunity: assessment.opportunity,
          trl: assessment.trl,
        };
      })
    );
  }
  
  /**
   * Categorize solutions by potential
   */
  categorizeByPotential(solutions: SolutionCandidate[]): {
    blueSky: SolutionCandidate[];
    lowHangingFruit: SolutionCandidate[];
    highRiskHighReward: SolutionCandidate[];
    crossSectorProven: SolutionCandidate[];
  } {
    return {
      blueSky: solutions.filter(s => s.readiness === 'blue_sky'),
      lowHangingFruit: solutions.filter(s => s.opportunity === 'low_hanging_fruit'),
      highRiskHighReward: solutions.filter(s => s.opportunity === 'high_risk_high_reward'),
      crossSectorProven: solutions.filter(s => s.opportunity === 'cross_sector_proven'),
    };
  }
}
```

**Integration:**
- Called from challenge detail pages
- Creates new BaseEntity entries
- Auto-classified as `needs_review`
- Appears in verification queue

---

### Agent 5: **Solution Potential Analyzer**

**Purpose:** Analyze solution potential across multiple dimensions

**Status:** ⚠️ **Not Yet Implemented**

**Capabilities:**

```typescript
// src/lib/ai/agents/solution-analyzer.ts
export class SolutionAnalyzer {
  /**
   * Comprehensive solution potential analysis
   */
  async analyzeSolutionPotential(
    challenge: Challenge,
    solutions: BaseEntity[]
  ): Promise<SolutionAnalysis> {
    // 1. Blue sky opportunities
    const blueSky = await this.identifyBlueSky(solutions);
    
    // 2. Low-hanging fruit
    const lowHangingFruit = await this.identifyLowHangingFruit(
      challenge,
      solutions
    );
    
    // 3. High-risk high-reward
    const highRiskHighReward = await this.identifyHighRiskHighReward(
      solutions
    );
    
    // 4. Cross-sector proven
    const crossSectorProven = await this.identifyCrossSectorProven(
      challenge,
      solutions
    );
    
    // 5. Generate report
    const report = await this.generateAnalysisReport({
      challenge,
      blueSky,
      lowHangingFruit,
      highRiskHighReward,
      crossSectorProven,
    });
    
    return {
      categories: {
        blueSky,
        lowHangingFruit,
        highRiskHighReward,
        crossSectorProven,
      },
      report,
    };
  }
  
  /**
   * Identify blue sky opportunities (early stage, high potential)
   */
  async identifyBlueSky(solutions: BaseEntity[]): Promise<BaseEntity[]> {
    return solutions.filter(s => {
      const trl = getTRL(s);
      const funding = getFunding(s);
      
      // Blue sky = low TRL (1-3), but high potential/interest
      return trl <= 3 && this.hasHighPotential(s);
    });
  }
  
  /**
   * Identify low-hanging fruit (proven, easy to implement)
   */
  async identifyLowHangingFruit(
    challenge: Challenge,
    solutions: BaseEntity[]
  ): Promise<BaseEntity[]> {
    return solutions.filter(s => {
      const trl = getTRL(s);
      const provenInOtherSectors = this.isProvenInOtherSectors(s);
      
      // Low-hanging = high TRL (7-9), proven elsewhere, adaptable
      return trl >= 7 && provenInOtherSectors && this.isAdaptable(challenge, s);
    });
  }
  
  /**
   * Identify high-risk high-reward (innovative, transformative)
   */
  async identifyHighRiskHighReward(
    solutions: BaseEntity[]
  ): Promise<BaseEntity[]> {
    return solutions.filter(s => {
      const trl = getTRL(s);
      const impact = this.assessImpact(s);
      const risk = this.assessRisk(s);
      
      // High-risk high-reward = medium TRL (4-6), high impact, high risk
      return trl >= 4 && trl <= 6 && impact > 0.7 && risk > 0.6;
    });
  }
  
  /**
   * Identify cross-sector proven solutions
   */
  async identifyCrossSectorProven(
    challenge: Challenge,
    solutions: BaseEntity[]
  ): Promise<BaseEntity[]> {
    return solutions.filter(s => {
      const provenSectors = this.getProvenSectors(s);
      const challengeSector = challenge.sector.primary;
      
      // Proven in other sectors, applicable to challenge sector
      return (
        provenSectors.length > 0 &&
        !provenSectors.includes(challengeSector) &&
        this.isApplicable(challenge, s)
      );
    });
  }
}
```

**Use Case:**
- User views a challenge
- Clicks "Analyze Solution Potential"
- AI scans for solutions, categorizes them
- Displays categorized view with recommendations

---

### Agent 6: **Report Generation Agent**

**Purpose:** Generate comprehensive reports using data and visualizations

**Status:** ⚠️ **Planned** (Referenced in docs)

**Capabilities:**

```typescript
// src/lib/ai/agents/report-agent.ts
export class ReportGenerationAgent {
  /**
   * Generate comprehensive report
   */
  async generateReport(
    context: {
      entities: BaseEntity[];
      visualizations: string[];
      topic: string;
      audience: 'executive' | 'analyst' | 'researcher';
    }
  ): Promise<Report> {
    // 1. Analyze data
    const analysis = await this.analyzeData(context.entities);
    
    // 2. Generate insights
    const insights = await this.generateInsights(analysis);
    
    // 3. Create visualizations
    const vizSnapshots = await this.captureVisualizations(
      context.visualizations
    );
    
    // 4. Generate narrative
    const narrative = await this.generateNarrative({
      analysis,
      insights,
      topic: context.topic,
      audience: context.audience,
    });
    
    // 5. Structure report
    return {
      executiveSummary: narrative.summary,
      insights,
      visualizations: vizSnapshots,
      recommendations: narrative.recommendations,
      appendix: analysis,
    };
  }
}
```

**Integration:**
- Called from "Generate Report" button
- Can include current view or selected entities
- Exports as PDF/Markdown

---

## Part 3: How Agents Work Together

### Workflow 1: Challenge Discovery & Verification

```
1. Challenge Scraping Agent
   → Scrapes portal
   → Extracts challenges
   → Maps to unified schema
   → Creates BaseEntity (needs_review)

2. Challenge Similarity Agent
   → Computes semantic similarity
   → Creates relationships
   → Identifies clusters

3. Research Agent
   → Horizon scans for solutions
   → Finds SMEs
   → Assesses readiness

4. Solution Analyzer
   → Categorizes solutions
   → Analyzes potential

5. Verification Agent
   → Verifies challenge data
   → Verifies solution data
   → Updates classification (needs_review → real)
```

### Workflow 2: User Query & Discovery

```
1. User asks: "Show me solutions to decarbonisation challenges"

2. User Agent (Chat)
   → Parses query
   → Calls Challenge Similarity Agent (find similar challenges)
   → Calls Research Agent (find solutions)
   → Calls Solution Analyzer (categorize)

3. UI updates
   → Highlights relevant entities
   → Switches to network view
   → Shows categorized solutions

4. User clicks "Generate Report"
   → Report Generation Agent creates comprehensive report
```

---

## Part 4: Implementation Status

### ✅ Fully Implemented

| Feature | Status | Location |
|---------|--------|----------|
| AI Function Calling | ✅ | `src/lib/ai-functions.ts` |
| Static Insights | ✅ | Various utilities |
| UI Control Capabilities | ✅ | `AIChatPanel.tsx` |

### ⚠️ Planned / Partially Implemented

| Feature | Status | Priority | Effort |
|---------|--------|----------|--------|
| Conversational Chat | ⚠️ | High | Medium |
| AI-Generated Insights | ⚠️ | High | Medium |
| Challenge Scraping Agent | ⚠️ | High | High |
| Challenge Similarity (AI) | ⚠️ | High | Medium |
| Verification Agent | ⚠️ | High | Medium |
| Research Agent | ⚠️ | Medium | High |
| Solution Analyzer | ⚠️ | Medium | High |
| Report Generation | ⚠️ | Medium | Medium |
| Voice Interface | ⚠️ | Low | High |

---

## Part 5: Recommendations

### ✅ **DO Implement**

#### 1. **Semantic Similarity for Challenges** (HIGH PRIORITY)

**Why:** Current keyword-based approach misses semantic relationships.

**Implementation:**
- Add embedding-based similarity
- Hybrid scoring (60% semantic + 40% keyword/metadata)
- Batch compute nightly, store in database

**Effort:** Medium (2-3 days)

#### 2. **Verification Agent** (HIGH PRIORITY)

**Why:** Essential for data quality as you scale.

**Implementation:**
- Start simple: cross-reference KB + field validation
- Add LLM assessment later
- Integrate with provenance dashboard

**Effort:** Medium (3-4 days)

#### 3. **Research Agent** (MEDIUM PRIORITY)

**Why:** Unlocks discovery of new entities/solutions.

**Implementation:**
- Start with web search APIs (Perplexity, Tavily)
- Extract entities with LLM
- Categorize with simple rules first, enhance later

**Effort:** High (1-2 weeks)

### ❌ **AVOID or Delay**

#### 1. **Voice Interface** (Delay)

**Why:** Lower priority, complex, requires infrastructure.

**Wait until:**
- Text chat is fully working
- User demand is proven
- Platform is stable

#### 2. **Complex Multi-Agent Orchestration** (Start Simple)

**Why:** Don't over-engineer. Start with simple agents, add complexity later.

**Instead:**
- Implement agents independently
- Use simple API calls between them
- Add orchestration layer later if needed

#### 3. **Too Many AI Providers** (Start with One)

**Why:** Managing multiple providers adds complexity.

**Recommendation:**
- Start with OpenAI (GPT-4o)
- Add Claude as alternative later if needed
- Keep Mock provider for testing

---

## Part 6: Is This Doable?

### ✅ **YES - If Done Incrementally**

**Your vision is:**
1. ✅ **Harmonious** - All agents share same foundation
2. ✅ **Elegant** - Unified BaseEntity schema works across all agents
3. ✅ **Feasible** - Each agent can be built independently

### 📋 **Recommended Implementation Order**

#### Phase 1: Foundation (Weeks 1-2)
- ✅ Semantic similarity for challenges
- ✅ Verification agent (basic)
- ✅ Conversational chat

#### Phase 2: Discovery (Weeks 3-4)
- ✅ Research agent (basic horizon scanning)
- ✅ Solution analyzer (categorization)

#### Phase 3: Enhancement (Weeks 5-6)
- ✅ Challenge scraping agent
- ✅ Report generation
- ✅ AI-generated insights

#### Phase 4: Advanced (Weeks 7+)
- ⚠️ Voice interface
- ⚠️ Advanced multi-agent orchestration
- ⚠️ Real-time collaboration

### 🎯 **Key Success Factors**

1. **Start Simple** - Basic agents first, enhance later
2. **Incremental** - One agent at a time
3. **Shared Foundation** - All use BaseEntity schema
4. **User Testing** - Validate each agent before adding next
5. **Gradual Enhancement** - Start with rules, add AI later

---

## Part 7: Similarity Algorithm Deep Dive

### Current Implementation Analysis

**Algorithm:** Jaccard similarity on keywords + metadata bonuses

**Limitations:**
```typescript
// Example failures:
Challenge A: "Carbon isotope tracking for emissions"
Challenge B: "Decarbonisation monitoring"

Keywords A: ["carbon", "isotope", "tracking", "emissions"]
Keywords B: ["decarbonisation", "monitoring"]

// Result: 0% similarity (no keyword overlap!)
// But semantically: 90% similar (both about tracking carbon/emissions)
```

**Another Example:**
```typescript
Challenge A: "Energy production optimization"
Challenge B: "Energy reduction strategies"

Keywords A: ["energy", "production", "optimization"]
Keywords B: ["energy", "reduction", "strategies"]

// Result: ~33% similarity (only "energy" matches)
// But semantically: Related (both about energy management)
```

### Proposed Solution: Hybrid Approach

```typescript
async function computeSimilarity(ch1: Challenge, ch2: Challenge): Promise<number> {
  // 1. Semantic similarity (60% weight)
  const semanticScore = await computeSemanticSimilarity(ch1, ch2);
  
  // 2. Keyword overlap (20% weight)
  const keywordScore = computeKeywordSimilarity(ch1, ch2);
  
  // 3. Metadata match (20% weight)
  const metadataScore = computeMetadataSimilarity(ch1, ch2);
  
  // Weighted combination
  return (
    semanticScore * 0.6 +
    keywordScore * 0.2 +
    metadataScore * 0.2
  );
}
```

**Benefits:**
- ✅ Catches semantic relationships
- ✅ Still values exact keyword matches
- ✅ Maintains metadata importance

**Implementation:**
1. Use OpenAI embeddings (ada-002 or text-embedding-3-small)
2. Compute cosine similarity
3. Cache embeddings in database
4. Recompute nightly for new challenges

---

## Part 8: SME Horizon Scanning Architecture

### Comprehensive Solution Discovery

```typescript
// src/lib/ai/agents/horizon-scanning-agent.ts
export class HorizonScanningAgent {
  /**
   * Comprehensive horizon scan for challenge
   */
  async comprehensiveScan(challenge: Challenge): Promise<{
    smes: BaseEntity[];
    solutions: SolutionCandidate[];
    analysis: SolutionAnalysis;
  }> {
    // 1. Find SMEs
    const smes = await this.findSMEs(challenge);
    
    // 2. Find solutions
    const solutions = await this.findSolutions(challenge);
    
    // 3. Assess readiness
    const assessed = await this.assessReadiness([...smes, ...solutions]);
    
    // 4. Categorize by potential
    const analysis = await this.analyzePotential(challenge, assessed);
    
    // 5. Store in database
    await this.storeResults(challenge.id, {
      smes: assessed.filter(a => a.entityType === 'stakeholder'),
      solutions: assessed.filter(a => a.entityType === 'technology'),
      analysis,
    });
    
    return {
      smes: assessed.filter(a => a.entityType === 'stakeholder'),
      solutions: assessed.filter(a => a.entityType === 'technology'),
      analysis,
    };
  }
  
  /**
   * Find SMEs related to challenge
   */
  async findSMEs(challenge: Challenge): Promise<BaseEntity[]> {
    // Search:
    // - Companies House API
    // - Innovation databases
    // - Research publications
    // - Web search (Perplexity/Tavily)
    
    const results = await Promise.all([
      this.searchCompaniesHouse(challenge),
      this.searchInnovationDatabases(challenge),
      this.searchResearchPublications(challenge),
      this.searchWeb(challenge),
    ]);
    
    // Deduplicate and extract
    const unique = this.deduplicate(results);
    return unique.map(r => this.extractSME(r));
  }
  
  /**
   * Assess SME readiness
   */
  async assessReadiness(entities: BaseEntity[]): Promise<AssessedEntity[]> {
    return Promise.all(
      entities.map(async entity => {
        const assessment = await this.llm.assess({
          prompt: `
            Assess this entity:
            ${entity.name}
            ${entity.description}
            
            Determine:
            1. Readiness category:
               - Blue sky (research stage, TRL 1-3)
               - Early stage (proof of concept, TRL 4-5)
               - Proven (prototype/demo, TRL 6-7)
               - Commercial (market ready, TRL 8-9)
            
            2. Opportunity type:
               - Low-hanging fruit (proven, easy to implement)
               - High-risk high-reward (innovative, transformative)
               - Obvious (well-known solution)
               - Cross-sector proven (proven in other sectors)
            
            3. TRL estimate (1-9)
            4. Market readiness score (0-1)
          `,
        });
        
        return {
          ...entity,
          readiness: assessment.readiness,
          opportunity: assessment.opportunity,
          estimatedTRL: assessment.trl,
          marketReadiness: assessment.marketReadiness,
          provenance: {
            ...entity.provenance,
            metadata: {
              ...entity.provenance.metadata,
              horizonScanAssessment: assessment,
            },
          },
        };
      })
    );
  }
}
```

**Integration:**
- Button on challenge detail page: "Find Solutions"
- Triggers comprehensive scan
- Results stored with challenge
- Categorized view shown to user

---

## Part 9: Agent Interaction Patterns

### Pattern 1: Sequential (Current)

```
User Query → Agent 1 → Agent 2 → Agent 3 → Result
```

### Pattern 2: Parallel (Recommended)

```
User Query → {
  Agent 1 → Result 1
  Agent 2 → Result 2
  Agent 3 → Result 3
} → Combine Results
```

### Pattern 3: Orchestrated (Future)

```
Orchestrator → {
  Decide which agents needed
  Call agents in parallel/sequence
  Combine results
  Return to user
}
```

**Recommendation:** Start with Pattern 2 (Parallel), evolve to Pattern 3 if needed.

---

## Summary: Is This Too Much?

### ✅ **NO - If You:**

1. **Implement incrementally** - One agent at a time
2. **Start simple** - Basic functionality first, enhance later
3. **Reuse foundation** - Shared BaseEntity schema, LLM provider
4. **Validate each step** - Test before adding next agent
5. **Prioritize** - Focus on high-value agents first

### 🎯 **Recommended Priority Order**

1. **Semantic Similarity** (High impact, medium effort)
2. **Verification Agent** (Essential for quality)
3. **Research Agent** (Unlocks discovery)
4. **Challenge Scraping** (Automates data ingestion)
5. **Solution Analyzer** (Enhances research)
6. **Report Generation** (Nice to have)
7. **Voice Interface** (Future enhancement)

### 💡 **Key Insight**

Your vision is **harmonious and elegant** because:
- All agents work with same BaseEntity schema
- All share same LLM foundation
- Each agent can be built independently
- They complement each other naturally

**This is not too much - it's a well-architected system that grows incrementally.**

---

**Start with semantic similarity and verification agent. These two will provide immediate value and validate the approach before building more complex agents.**

