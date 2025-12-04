# Development Roadmap - Visual Guide

**What to build when, and what can be done in parallel**

---

## Timeline Overview

```
Week 1: Foundation
├─ Provenance System (1 day)
├─ Vector Store (2 days)
└─ Quick Wins (1 day)

Week 2-3: Core AI (PARALLEL)
├─ Track 1: Semantic Similarity (independent)
├─ Track 2: Verification Agent (independent)
├─ Track 3: Entity Resolution (independent)
└─ Track 4: Chat + RAG (independent)

Week 4-6: Advanced Features (SEQUENTIAL)
├─ Week 4: Research Agent (needs #2, #3)
├─ Week 5: Solution Analyzer (needs Research)
└─ Week 6: Cross-domain Insights (needs #1, Research)
```

---

## Dependency Matrix

| Component | Dependencies | Can Build With |
|-----------|--------------|----------------|
| Provenance System | None | Anyone |
| Vector Store | None | Anyone |
| Semantic Similarity | Vector Store | Verification, Entity Resolution, Chat |
| Verification Agent | Provenance | Semantic Similarity, Entity Resolution, Chat |
| Entity Resolution | Vector Store | Semantic Similarity, Verification, Chat |
| Chat + RAG | Vector Store | All others |
| Research Agent | Verification + Resolution | None (wait for dependencies) |
| Solution Analyzer | Research Agent | None (wait for Research) |
| Cross-domain Insights | Similarity + Research | None (wait for dependencies) |

---

## Parallel Development Opportunities

### ✅ Week 2-3: 4 Independent Tracks

**All can be built simultaneously:**

```
Developer 1: Semantic Similarity
Developer 2: Verification Agent
Developer 3: Entity Resolution
Developer 4: Chat + RAG
```

**OR one developer can build sequentially:**

```
Day 1-2: Semantic Similarity
Day 3-4: Verification Agent
Day 5-6: Entity Resolution
Day 7-8: Chat + RAG
```

---

## What to Build Today

### Immediate Next Steps

**Choose one:**

1. **Provenance Integration** (2-4 hours)
   - Tag existing data
   - Update one adapter
   - Test

2. **Vector Store Setup** (4-6 hours)
   - Implement JSONVectorStore
   - Embed test entities
   - Test search

3. **Both** (If you have full day)
   - Provenance: Morning
   - Vector Store: Afternoon

---

## Quick Decision Matrix

**Q: What should I build first?**

| If you want... | Build this first |
|----------------|------------------|
| Quick win | Provenance (1 day) |
| Foundation for AI | Vector Store (2 days) |
| Both | Do provenance, then vector store |

**Q: Can I build AI agents now?**

- ✅ After vector store is working
- ⚠️ Need foundation first
- ❌ Don't start without foundation

**Q: Can I build agents in parallel?**

- ✅ Week 2-3: Yes (4 independent tracks)
- ⚠️ Week 4-6: Sequential (dependencies)

---

## Success Criteria

### End of Week 1
- [ ] Provenance system integrated
- [ ] Vector store operational
- [ ] Semantic search working
- [ ] "Find Similar" feature live

### End of Week 3
- [ ] All 4 core agents working
- [ ] Simple orchestration in place
- [ ] Chat interface functional
- [ ] Verification workflow complete

### End of Week 6
- [ ] Research agent operational
- [ ] Cross-domain insights working
- [ ] Solution analyzer complete
- [ ] Platform ready for beta

---

**Start with foundation. Build agents in parallel Week 2-3. Keep orchestration simple.**

