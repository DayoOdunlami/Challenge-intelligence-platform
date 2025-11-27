# Network View - Purpose & Distinction

## Question: What's the purpose of Network view in Innovation Tracker vs Stakeholder Dynamics?

### **Stakeholder Dynamics Network View**
**Purpose:** Show organizational relationships and ecosystem connections

**What it shows:**
- Entities (Stakeholders, Technologies, Projects)
- Relationship types: `collaborates_with`, `researches`, `participates_in`, `advances`
- Multi-dimensional relationships (not just funding)
- Helps identify: partnerships, knowledge sharing, collaboration opportunities

**Use case:** "Who works with whom?" "What are the collaboration patterns?"

---

### **Innovation Tracker Network View (Proposed)**
**Purpose:** Show funding flow relationships

**What it could show:**
- Entities (same entities, but funding-focused)
- Relationship type: Primarily `funds` relationships
- Link weights = funding amounts (£)
- Helps identify: funding patterns, funding gaps, funding concentration

**Use case:** "Who funds whom?" "Where are the funding bottlenecks?"

---

## **The Problem: Significant Overlap**

Since Innovation Tracker already has:
- ✅ **Sankey Diagram**: Shows funding flows directionally (source → intermediary → recipient)
- ✅ **Stakeholder Dynamics**: Has a network view showing all relationships

**Adding another network view might be:**
- Redundant (similar to Sankey but less structured)
- Confusing (users might not understand the difference)
- Unnecessary (Sankey already shows funding relationships well)

---

## **Recommendation**

### **Option A: Skip Network View** ✅ **RECOMMENDED**
**Reasoning:**
- Sankey already shows funding relationships effectively
- Waterfall chart is more valuable for scenario modeling
- Keeps interface simpler and more focused

**Replace with:**
- ✅ Waterfall Chart (for scenario comparison)
- ✅ Keep Sankey as primary funding visualization
- Remove Network tab (or repurpose it)

### **Option B: Repurpose Network View**
**Alternative purpose:** Programme/Project Network
- Shows programmes as nodes
- Shows project relationships
- Shows which programmes fund which projects
- Different perspective: programme-centric rather than entity-centric

**This would be distinct because:**
- Focuses on programmes/projects (not individual entities)
- Shows programme portfolios
- Shows cross-programme relationships

---

## **Decision Matrix**

| Visualization | Innovation Tracker | Stakeholder Dynamics | Overlap? |
|---------------|-------------------|---------------------|----------|
| **Sankey** | ✅ Funding flows | ❌ | No overlap |
| **Network (Entity-focused)** | ❓ Funding relationships | ✅ All relationships | **High overlap** |
| **Network (Programme-focused)** | ✅ Programme networks | ❌ | **No overlap** |

---

## **Final Recommendation**

1. **Remove Network tab** (or keep placeholder for future)
2. **Build Waterfall Chart** (clear value for scenario modeling)
3. **Consider Programme Network later** (if needed, distinct from Stakeholder Network)

**Waterfall Chart Value:**
- Perfect for scenario modeling
- Shows incremental changes clearly
- Better for "what-if" analysis than Sankey
- Shows cause-and-effect visually

