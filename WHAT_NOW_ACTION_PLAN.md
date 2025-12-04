# What Now? - Action Plan & Parallel Development Guide

**Clear next steps and what can be built in parallel**

---

## Immediate Next Steps (This Week)

### Priority 1: Foundation Setup (2-3 days)

**Can be done in parallel:**

#### Track A: Provenance System ⚡
**Who:** You  
**Time:** 1 day  
**Dependencies:** None

- [ ] Tag existing data as baseline
- [ ] Update adapters to include provenance
- [ ] Add ProvenanceControls to visualizations
- [ ] Create provenance dashboard page

**Status:** ✅ Components already created, just need integration

---

#### Track B: Vector Store (JSON) ⚡
**Who:** You  
**Time:** 2-3 days  
**Dependencies:** None

- [ ] Implement JSON vector store
- [ ] Embed all existing entities
- [ ] Test semantic search
- [ ] Add to entity creation hooks

**Status:** ✅ Code ready, needs implementation

---

### Priority 2: Quick Wins (1-2 days)

**Can be done in parallel:**

#### Track C: "Find Similar" Feature ⚡
**Who:** You  
**Time:** 1 day  
**Dependencies:** Track B (vector store)

- [ ] Add "Find Similar" button to entity cards
- [ ] Use vector store search
- [ ] Display results in sidebar/modal
- [ ] Add "Why similar?" explanation (simple)

**Impact:** Immediate user value

---

#### Track D: Provenance Dashboard UI ⚡
**Who:** You  
**Time:** 1 day  
**Dependencies:** Track A (provenance)

- [ ] Create `/provenance` route
- [ ] Integrate ProvenanceDashboard component
- [ ] Add navigation link
- [ ] Test workflows

**Impact:** Data quality management

---

## Week 1-2: Foundation Complete

**After completing Priority 1 & 2:**
- ✅ Provenance system working
- ✅ Vector store operational
- ✅ Semantic search functional
- ✅ "Find Similar" feature live

**Next:** Start AI agents (can build in parallel)

---

## AI Agents - Parallel Development Plan

### Independent Components (Can Build Simultaneously)

#### 1. **Semantic Similarity Agent** 🔄
**Status:** ⚠️ Partially implemented (keyword-based)  
**Time:** 2-3 days  
**Dependencies:** ✅ Vector store (Track B)  
**Can start:** After vector store is working

**What to build:**
- Hybrid similarity (60% semantic, 40% keyword/metadata)
- Batch computation job
- Store relationships
- Update existing similarity code

**Parallel with:** #2, #3

---

#### 2. **Verification Agent (Basic)** 🔄
**Status:** ⚠️ Not started  
**Time:** 2-3 days  
**Dependencies:** ✅ Provenance system (Track A)  
**Can start:** After provenance dashboard

**What to build:**
- KB cross-reference (simple)
- Field validation (rules-based)
- Flag/verify logic
- Integration with provenance dashboard

**Parallel with:** #1, #3

**Note:** Start simple (no LLM), add AI later

---

#### 3. **Entity Resolution** 🔄
**Status:** ⚠️ Not started  
**Time:** 2 days  
**Dependencies:** ✅ Vector store (Track B)  
**Can start:** After vector store is working

**What to build:**
- Similarity-based duplicate detection
- Auto-merge logic (high confidence)
- Flag-for-review (medium confidence)
- Integration hooks (on entity create)

**Parallel with:** #1, #2

---

#### 4. **Conversational Chat + RAG** 🔄
**Status:** ⚠️ Partially implemented (function calling exists)  
**Time:** 3-4 days  
**Dependencies:** ✅ Vector store (Track B)  
**Can start:** After vector store is working

**What to build:**
- RAG context building
- Chat interface UI
- LLM integration (OpenAI)
- Conversation history
- Function calling integration (already exists)

**Parallel with:** #1, #2, #3

**Note:** Can build UI first, add RAG later

---

### Dependent Components (Build After Dependencies)

#### 5. **Research Agent** 🔄
**Status:** ⚠️ Not started  
**Time:** 1-2 weeks  
**Dependencies:** 
- ✅ Verification Agent (#2)
- ✅ Entity Resolution (#3)
- ⚠️ Web search API (Perplexity/Tavily)

**What to build:**
- Web search integration
- Entity extraction (LLM)
- Readiness assessment
- Solution categorization

**Can start:** After #2 and #3 are working

---

#### 6. **Solution Analyzer** 🔄
**Status:** ⚠️ Not started  
**Time:** 1 week  
**Dependencies:** 
- ✅ Research Agent (#5)
- ✅ Semantic Similarity (#1)

**What to build:**
- Solution categorization (blue sky, low-hanging fruit, etc.)
- Cross-domain matching
- Integration with Discovery Agent

**Can start:** After Research Agent

**Note:** Could be merged into Research Agent (as per review)

---

## Parallel Development Strategy

### Week 1: Foundation (Sequential)

```
Day 1-2: Track A (Provenance) + Track B (Vector Store)
Day 3-4: Track C (Find Similar) + Track D (Dashboard)
Day 5:   Testing & Integration
```

**Result:** Foundation complete

---

### Week 2-3: AI Agents (Parallel Tracks)

```
Track 1: Semantic Similarity
├─ Day 1-2: Implement hybrid similarity
├─ Day 3: Batch computation job
└─ Day 4: Integration & testing

Track 2: Verification Agent (Basic)
├─ Day 1: KB cross-reference
├─ Day 2: Field validation
├─ Day 3: Flag/verify logic
└─ Day 4: Dashboard integration

Track 3: Entity Resolution
├─ Day 1: Duplicate detection
├─ Day 2: Auto-merge logic
└─ Day 3: Integration hooks

Track 4: Chat + RAG
├─ Day 1-2: Chat UI
├─ Day 3: RAG context building
└─ Day 4: LLM integration
```

**Result:** All core agents operational

---

### Week 4-6: Advanced Features (Sequential)

```
Week 4: Research Agent
├─ Depends on: Verification + Entity Resolution
└─ Build after Week 2-3 complete

Week 5: Solution Analyzer
├─ Depends on: Research Agent
└─ Build after Week 4

Week 6: Cross-domain Insights
├─ Depends on: Semantic Similarity + Research
└─ Build after Week 5
```

---

## Dependency Graph

```
Foundation (Week 1)
├─ Provenance System
└─ Vector Store
    │
    ├─→ Semantic Similarity (Week 2, Track 1)
    │       │
    │       └─→ Cross-domain Insights (Week 6)
    │
    ├─→ Entity Resolution (Week 2, Track 3)
    │       │
    │       └─→ Research Agent (Week 4)
    │               │
    │               └─→ Solution Analyzer (Week 5)
    │
    └─→ Chat + RAG (Week 2, Track 4)
            │
            └─→ Uses all agents

Provenance System
    │
    └─→ Verification Agent (Week 2, Track 2)
            │
            └─→ Research Agent (Week 4)
```

---

## Recommended Development Order

### Phase 1: Foundation (Week 1) - Sequential

1. ✅ Provenance system integration
2. ✅ Vector store (JSON) implementation
3. ✅ Quick wins ("Find Similar", Dashboard)

**Deliverable:** Working foundation

---

### Phase 2: Core AI (Weeks 2-3) - Parallel

**All can be built simultaneously:**

1. 🔄 **Semantic Similarity** (Track 1)
   - Depends on: Vector store
   - Independent: Yes

2. 🔄 **Verification Agent** (Track 2)
   - Depends on: Provenance
   - Independent: Yes

3. 🔄 **Entity Resolution** (Track 3)
   - Depends on: Vector store
   - Independent: Yes

4. 🔄 **Chat + RAG** (Track 4)
   - Depends on: Vector store
   - Independent: Yes (can build UI first, add RAG later)

**Strategy:** One developer can work on Track 1, another on Track 2, etc.

---

### Phase 3: Advanced AI (Weeks 4-6) - Sequential

5. 🔄 **Research Agent**
   - Depends on: Verification + Entity Resolution
   - Build after: Phase 2 complete

6. 🔄 **Solution Analyzer**
   - Depends on: Research Agent
   - Build after: Week 4

7. 🔄 **Cross-domain Insights**
   - Depends on: Semantic Similarity + Research
   - Build after: Week 5

---

## Orchestration: When to Add?

### Simple Orchestration (Week 3)

**Basic coordinator for existing agents:**

```typescript
// src/lib/ai/orchestrator.ts
export class SimpleOrchestrator {
  async executeQuery(query: string) {
    // Parallel execution
    const [similarityResults, searchResults] = await Promise.all([
      this.similarityAgent.find(query),
      this.vectorStore.search(query),
    ]);
    
    // Combine results
    return this.combineResults(similarityResults, searchResults);
  }
}
```

**When:** After Track 1-4 are complete (Week 3)

---

### Advanced Orchestration (Week 6+)

**Complex workflow orchestration:**

```typescript
// Advanced: Multi-step workflows, conditionals, etc.
// Only needed when you have complex agent interactions
```

**When:** Defer until you have multiple agents with complex dependencies

**Recommendation:** Start simple, add complexity only when needed

---

## What to Build Now (Today/Tomorrow)

### Option 1: Provenance System (Recommended Start)

**Why:**
- ✅ Components already created
- ✅ No dependencies
- ✅ Quick win (1 day)
- ✅ Enables verification agent later

**Tasks:**
1. Tag existing data as baseline
2. Update one adapter (stakeholder-adapter.ts)
3. Add ProvenanceControls to one visualization
4. Create `/provenance` route

---

### Option 2: Vector Store (Also Good Start)

**Why:**
- ✅ Foundation for all AI agents
- ✅ Unblocks multiple tracks
- ✅ Can start building agents immediately after

**Tasks:**
1. Implement JSONVectorStore
2. Embed existing entities
3. Test semantic search
4. Add "Find Similar" feature

---

### Option 3: Both in Parallel (If You Have Time)

**Why:**
- ✅ Provenance (1 day) + Vector Store (2 days) = 2 days total
- ✅ Both are independent
- ✅ Both are foundational

---

## Weekly Breakdown

### Week 1: Foundation

**Days 1-2:**
- [ ] Provenance system integration
- [ ] Vector store implementation

**Days 3-4:**
- [ ] "Find Similar" feature
- [ ] Provenance dashboard
- [ ] Embed all entities

**Day 5:**
- [ ] Testing
- [ ] Documentation
- [ ] Demo prep

---

### Week 2-3: Core AI Agents (Parallel)

**Track 1: Semantic Similarity (Independent)**
- [ ] Hybrid similarity implementation
- [ ] Batch computation
- [ ] Update network graph

**Track 2: Verification Agent (Independent)**
- [ ] Basic verification logic
- [ ] Dashboard integration
- [ ] Flag/verify workflows

**Track 3: Entity Resolution (Independent)**
- [ ] Duplicate detection
- [ ] Auto-merge logic
- [ ] Integration hooks

**Track 4: Chat + RAG (Independent)**
- [ ] Chat UI
- [ ] RAG context building
- [ ] LLM integration

**Result:** All 4 agents operational by end of Week 3

---

### Week 4-6: Advanced Features

**Week 4: Research Agent**
- [ ] Web search integration
- [ ] Entity extraction
- [ ] Readiness assessment

**Week 5: Solution Analyzer**
- [ ] Solution categorization
- [ ] Cross-domain matching

**Week 6: Cross-domain Insights**
- [ ] Pattern matching
- [ ] Funding gap analysis
- [ ] Matchmaking

---

## Orchestration: Simple → Complex

### Week 3: Simple Orchestration

```typescript
// Basic parallel execution
async function handleQuery(query: string) {
  const [similarity, search, chat] = await Promise.all([
    similarityAgent.find(query),
    vectorStore.search(query),
    chatAgent.respond(query),
  ]);
  
  return combineResults(similarity, search, chat);
}
```

**When:** After agents are built, before advanced features

---

### Week 6+: Advanced Orchestration (If Needed)

```typescript
// Complex workflows with conditionals
// Multi-step agent chains
// Only if you need complex agent interactions
```

**When:** Defer until you actually need it

---

## Parallel Development Checklist

### ✅ Can Build in Parallel (Week 2-3)

- [ ] Semantic Similarity Agent
- [ ] Verification Agent (Basic)
- [ ] Entity Resolution
- [ ] Chat + RAG

**Reason:** All depend only on foundation (vector store + provenance)

---

### ⚠️ Build After Dependencies (Week 4+)

- [ ] Research Agent (needs Verification + Resolution)
- [ ] Solution Analyzer (needs Research)
- [ ] Cross-domain Insights (needs Similarity + Research)

**Reason:** Depend on other agents being complete

---

## Recommended Start (This Week)

### Day 1-2: Choose Your Track

**Option A: Start with Provenance**
- ✅ Quick (1 day)
- ✅ No dependencies
- ✅ Unblocks verification agent

**Option B: Start with Vector Store**
- ✅ Foundation for all AI
- ✅ Unblocks multiple tracks
- ✅ 2-3 days

**Option C: Do Both**
- ✅ Provenance: 1 day
- ✅ Vector Store: 2 days
- ✅ Can overlap

---

## What You Can Do Today

### Immediate (30 minutes)

1. ✅ Review architecture documents
2. ✅ Choose starting track
3. ✅ Set up environment variables

### Today (2-4 hours)

1. ✅ Start provenance integration (tag existing data)
2. ✅ OR start vector store implementation
3. ✅ Test basic functionality

### This Week

1. ✅ Complete foundation (provenance + vector store)
2. ✅ Add quick wins ("Find Similar")
3. ✅ Plan Week 2-3 parallel development

---

## Summary

### ✅ **What to Build Now**

1. **Provenance System** (1 day) - Quick win, unblocks verification
2. **Vector Store** (2 days) - Foundation for all AI

**Both can be done in parallel or sequentially - your choice**

---

### ✅ **AI Agents: When & How**

**Week 2-3: Build in Parallel**
- Semantic Similarity
- Verification Agent
- Entity Resolution
- Chat + RAG

**All are independent** - can build simultaneously or one at a time

---

### ✅ **Orchestration: Keep It Simple**

**Week 3:** Simple parallel execution (Promise.all)
**Week 6+:** Advanced orchestration (only if needed)

**Start simple, add complexity only when required**

---

## Next Action

**Right now:**
1. Choose: Provenance OR Vector Store (or both)
2. Start implementing
3. Test as you go

**This week:**
- Complete foundation
- Add quick wins
- Plan parallel development for Week 2-3

**Week 2-3:**
- Build AI agents in parallel
- Keep orchestration simple
- Test each agent independently

---

**You're ready. Pick a track and start building!** 🚀

