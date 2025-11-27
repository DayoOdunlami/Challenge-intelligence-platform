# Schema Alignment Overview

This note captures the current state of Atlas vs Navigate data models, how today’s visualizations consume them, and the proposed unified approach so you (or an LLM / reviewer) can critique or refine the plan. For the complete type and adapter specification, see `SCHEMA_SPEC_V1.md`.

---

## 1. Context

- **Atlas (Challenge Intelligence)**  
  - Purpose: expose UK infrastructure “challenge statements” (buyers, problem statements, budgets) and compare them via network, heatmap, sankey, etc.  
  - Data shape: single `Challenge` table with procurement metadata, sector & problem tags, TRL ranges, scrape provenance. Relationships are *computed* at render time (keyword similarity) rather than stored.

- **Navigate (Zero-Emission Aviation)**  
  - Purpose: track stakeholders, technologies, projects, funding, and their explicit relationships inside the aviation ecosystem.  
  - Data shape: multi-entity graph (`Stakeholder`, `Technology`, `Project`, `FundingEvent`, `Relationship`) with timestamps, knowledge-base notes, data-quality flags.

- **Aspirations**  
  - Add more domains (Rail, Maritime, Innovation, etc.) without rebuilding visuals.  
  - Let visuals—and AI assistants—pull from one schema so we can render whole-of-ecosystem graphs or slice per domain (e.g., “show Navigate only”).  
  - Maintain narrative/KB context per entity for richer AI reasoning.

---

## 2. Product Concept & Experience Goals

- **Experience promise** – A decision-support cockpit that lets policy, innovation, and investment teams move from “What challenges exist?” (Atlas) to “Who’s working on solutions?” (Navigate) and eventually to “What should we fund next?” across new domains like Rail or Maritime.
- **User flows**  
  1. Explore a domain landing page (Atlas/Navigate/Rail) with curated hero visuals (network, key KPIs).  
  2. Jump into the **Toolkit** (visual library) to interrogate the same data via alternative charts (circle-packing, heatmap, sankey, etc.).  
  3. Capture narratives or AI-suggested insights (knowledge base + LLM layer) that reference the exact entities/visuals.  
  4. Export/share embeddable reports or generate AI-written summaries with linked visual snapshots.
- **AI layer** – A shared embedding and reasoning component that:  
  - Consumes `BaseEntity` + KB markdown to answer free-form questions.  
  - Calls visualization builders (e.g., “show funding flow for Rail challenges”) and returns either live components or static images.  
  - Enables “explain this insight” prompts and future auto-report generation.

This means every schema decision should serve three surfaces simultaneously: page layouts, toolkit visuals, and AI utilities.

---

## 3. Current Data & Visual Usage

| Visualization | Atlas Data Path | Navigate Data Path | Notes |
|---------------|-----------------|--------------------|-------|
| Network graph | `src/components/visualizations/NetworkGraph.tsx` builds similarity edges from the `Challenge[]` list in `src/data/challenges.ts`. | `src/components/visualizations/NetworkGraphNavigate.tsx` consumes `Stakeholder[]`, `Technology[]`, `Project[]`, `Relationship[]` from `navigate-platform/src/data/navigate-dummy-data.ts` via `toNetworkGraphFromNavigate`. | Atlas links are derived (keywords), Navigate links are explicit relationships. |
| Heatmap | `HeatmapChart` aggregates `Challenge.sector.primary` vs `Challenge.problem_type.primary`. | Not used today. Needs adapter if we want stakeholder/technology heatmaps. | Pure counts + budgets. |
| Sankey | Atlas version flows Sector → Problem Type → Urgency using only `Challenge` fields. | Navigate adapter (`toSankeyFromNavigate`) flows Stakeholder Type → Technology Category → Funding Type using funding events + relationships. | Shows mismatch in schema richness. |
| Chord / Cluster / Sunburst | All Challenge-based, pulling directly from `Challenge[]`. | Navigate equivalents exist but use bespoke adapters. | Demonstrates duplicated logic. |

Other assets:
- `navigate-platform/src/lib/navigate-types.ts` defines all Navigate entities plus shared `KnowledgeBase` and `DataQuality`.
- `Navigate1.0/src/lib/types.ts` defines Atlas `Challenge` and visualization helpers.
- Markdown dossiers for Navigate live under `Navigate1.0/src/data/knowledge-base/`.

---

### Example Entities Today

```5:75:Navigate1.0/src/data/challenges.ts
{
  id: 'rail-001',
  title: 'Digital Railway Signalling Modernisation',
  sector: { primary: 'rail', secondary: ['transport'], cross_sector_signals: [...] },
  problem_type: { primary: 'Infrastructure Modernisation', ... },
  keywords: ['digital signalling','ETCS','railway safety',...],
  buyer: { organization: 'Network Rail', org_type: 'national_infrastructure' },
  timeline: { deadline: new Date('2025-06-30'), urgency: 'critical' },
  funding: { type: 'range', amount_min: 2000000, amount_max: 5000000, mechanism: 'contract' },
  maturity: { trl_min: 6, trl_max: 8, deployment_ready: true },
  geography: { scope: 'UK-wide' },
  metadata: { scraped_date: new Date('2024-12-15'), source_portal: 'Network Rail Innovation Portal' }
}
```

```19:120:navigate-platform/src/data/navigate-dummy-data.ts
{
  id: 'org-dft-001',
  name: 'Department for Transport',
  type: 'Government',
  sector: 'Transport',
  funding_capacity: 'High',
  location: { city: 'London', region: 'London', country: 'UK' },
  tags: ['policy', 'funding', 'infrastructure', 'aviation'],
  data_quality: { confidence: 'verified', last_verified: now },
  capacity_scenarios: { optimistic: 150000000, conservative: 80000000, current: 125000000 },
  knowledge_base: { content: '# Strategic Position …', sources: [...] },
  created_at: twoYearsAgo,
  updated_at: now
}
```

Toolkit-specific data (e.g., circle packing) also derives from the same challenge list but currently lives in separate files like `src/data/toolkit/circlePackingData.ts`, emphasising the need for reusable builders.

---

## 4. Pain Points

1. **Two incompatible schemas** – Visual components expect domain-specific types, so each new dataset means new plumbing.  
2. **Relationships parity** – Navigate stores explicit edges; Atlas recomputes similarity per render, so there is nothing to reuse or combine across domains.  
3. **Redundant components** – We now have two `NetworkGraph` implementations, two Sankey builders, etc., each tied to its dataset.  
4. **Scaling risk** – Future domains (Rail, Maritime…) would multiply the redundancy unless we introduce a universal interface.

---

## 5. Proposed Unified Schema (Hybrid Approach)

1. **BaseEntity interface** – Minimal fields all entities share:
   ```ts
   interface BaseEntity {
     id: string;
     name: string;
     description?: string;
     entityType: 'challenge' | 'stakeholder' | 'technology' | 'project' | ...;
     sector?: string;
     tags?: string[];
     trl?: number | { min: number; max: number };
     funding?: { amountMin?: number; amountMax?: number; currency?: string };
     metadata?: Record<string, unknown>;
     knowledgeBase?: KnowledgeBase;
     domain: 'atlas' | 'navigate' | 'rail' | ...;
   }
   ```

2. **UniversalRelationship interface** – Explicit edges across domains:
   ```ts
   interface UniversalRelationship {
     id: string;
     sourceId: string;
     targetId: string;
     type: 'similar_to' | 'funds' | 'collaborates_with' | 'addresses' | ...;
     weight?: number;
     metadata?: {
       amount?: number;
       startDate?: string;
       endDate?: string;
       provenance?: 'computed' | 'manual' | 'scraped';
     };
     domain?: string;
   }
   ```

3. **Adapters per domain**  
   - `challengesToBaseEntities(challenges: Challenge[]): BaseEntity[]`  
   - `navigateToBaseEntities(dataset: NavigateDataset): BaseEntity[]`  
   - `challengesToRelationships(similarityMatrix): UniversalRelationship[]` (persist precomputed similarities)  
   - `navigateRelationshipsToUniversal(relationships: Relationship[]): UniversalRelationship[]`

4. **Visualization builders**  
   All visual components read from this universal contract. Examples:
   - `buildNetworkGraph(baseEntities, relationships, filters)`  
   - `buildHeatmap(baseEntities, xField, yField)`  
   - `buildSankey(baseEntities, relationships, pathConfig)`  
   Building a shared “Visual Library” (likely using ECharts or Nivo) ensures any dataset mapped to `BaseEntity` gets automatic coverage.

---

## 6. Visualization Stack Considerations

- **ECharts vs Nivo**  
  - ECharts (Apache) ships with an extensive gallery (maps, sankey, sunburst, parallel sets) and strong theming/interaction primitives that match our “visual playground” ambitions. Many charts—heatmap, sankey, chord, tree map—can be configured declaratively, making it a good default for the Visual Library.[^echarts]  
  - Nivo already powers some current components; it’s React-first but less extensive for bespoke interactions (e.g., mixed glyphs, advanced legend layout). Keeping Nivo for legacy charts is fine, but net-new visuals can standardize on ECharts for consistency.
- **Network graph tech**  
  - 2D graphs: continue using `react-force-graph` (D3-force engine) or migrate to a D3 wrapper once the BaseEntity adapters land.  
  - 3D graphs: we can lean on `3d-force-graph` for immersive exploration (`ForceGraph3D`). It integrates with ThreeJS/WebGL, supports orbit/fly controls, and aligns with our plan for a shared adapter feeding both 2D and 3D contexts.[^3dforce]  
  - D3 still handles similarity computation, layout tuning, and bespoke encodings (e.g., relationship highlighting), so D3 remains in the stack as the “logic” layer.
- **Toolkit circle packing** – Once BaseEntity exposes hierarchical facets (sector → problem → buyer), the existing circle-packing component can be fed by a standard helper (`buildCirclePacking(rootFacet, valueAccessor)`) regardless of domain.

---

## 7. Implementation Roadmap

1. **Schema foundation** – Define `BaseEntity`, `UniversalRelationship`, plus validation helpers.  
2. **Adapters** – Map Atlas challenges and Navigate entities into the base schema. Store Atlas similarity edges as real relationships (even if generated nightly).  
3. **Data service / mock** – Expose the new graph as a JSON feed or API consumed by the UI.  
4. **Visualization refactor** – Rebuild the key visuals (network, heatmap, sankey, chord, etc.) against the unified contract. Create a Visual Library / Storybook page for quick QA.  
5. **Domain slices** – Add filters (by `domain`) so we can render:
   - `All domains` network graph (global view).  
   - `domain === 'navigate'` for Navigate-only.  
   - `domain === 'atlas'` for Challenge-only.  
   Same for other visuals.

6. **Future domains** – Onboard Rail, Maritime, Innovation by writing their adapters only; visuals require no changes.

---

## 8. Opportunities / Questions for Review

1. **Graph store** – Should we use Neo4j / Typesense / PostgreSQL for persistence, or is JSON adequate for now?  
2. **Similarity computation** – Best approach to persist and version the Atlas similarity edges? (Nightly batch vs on-demand).  
3. **Knowledge base integration** – How should Markdown dossiers map into `BaseEntity.knowledgeBase` for LLM indexing?  
4. **Visualization defaults** – Which ECharts/Nivo templates belong in the Visual Library by default, and what metadata do they need?  
5. **Cross-domain insights** – Once everything shares a schema, what new composites (e.g., “funding vs challenge gap”) should we plan for?

---

## 9. Future Scenarios & Product Implications

- **AI utility vs reporting** – With a unified schema, the AI layer can both (a) surface contextual insights (“Which stakeholders fund challenges similar to X?”) and (b) auto-generate report sections that embed live ECharts instances or snapshot images. This supports internal analysts and external sharing alike.
- **Embeddable widgets** – The Visual Library outputs (ECharts configs, force-graph scenes) can be packaged as embed-ready React components, making it trivial to drop them into new microsites or client portals.
- **Cross-domain “single graph view”** – Because every entity/relationship carries a `domain`, we can render a single mega-network for all data, then filter down (Navigate-only, Atlas-only) via control panels. This satisfies both the “bird’s-eye view” and “deep dive” needs without duplicating code.
- **What’s next** – After visual alignment, focus shifts to governance (entity versioning, reviewer workflows) and automation (LLM suggestions, auto-tagging). The schema should stay flexible enough to add new embedded services (e.g., simulation outputs, KPI calculators) as attributes.

---

## 10. Summary

- Atlas and Navigate serve different purposes today but can share a single graph-based schema with domain-specific adapters.  
- With the unified contract, we can render one global network of all entities, then filter down to Navigate or Atlas views instantly.  
- Rebuilding the visuals against this contract (and packaging them in a reusable library) removes current redundancies and makes future domains plug-and-play.  
- This document is ready for review by friends/LLMs to surface recommendations, risks, or alternative architectures.

---

[^echarts]: Apache ECharts examples gallery – https://echarts.apache.org/examples/en/index.html  
[^3dforce]: `3d-force-graph` (ThreeJS/WebGL force-directed graphs) – https://github.com/vasturiano/3d-force-graph

