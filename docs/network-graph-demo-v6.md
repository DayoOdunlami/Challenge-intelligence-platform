## Unified Network Graph V6 Reference

This note captures the current implementation of the `NetworkGraphDemoV6` experience so you can share it quickly, review the existing logic, and plan the next iteration of the clustering/colouring model.

### Where the code lives
- Entry point: `src/components/visualizations/NetworkGraphDemoV6.tsx`
- Rendering + physics: `src/components/visualizations/UnifiedNetworkGraphNested.tsx` (force simulation, hull + pod drawing)
- Data sources: `src/data/unified.ts` (`unifiedEntities`, `unifiedRelationships`)
- Shared typing: `src/lib/base-entity.ts` + `src/lib/base-entity-enhanced.ts`
- Side-panels: `AIChatPanel`, `ProvenanceControls`, `SidebarPanel/InsightsPanel` are all defined inside `NetworkGraphDemoV6.tsx`

### Current behaviour (V6)
- Dataset presets (`All`, `Navigate`, `Atlas`, `CPC`) flip a whitelist of `domains` and call `applyDomainDefaults`.
- `applyDomainDefaults` sets
  - `primaryClusterBy`: `domain` when more than one domain is visible, `entityType` for single domain views.
  - `secondaryClusterSelection`: defaults to `entityType`, `stakeholderCategory`, or `sector` depending on the active domain.
  - `colorBy`: matches whichever dimension is “primary” for that domain.
- Navigate-specific filters: TRL range, technology categories, and six stakeholder groups (`Government`, `Intermediary`, `Academia`, `Industry`, `Project`, `Working Group`). Colours are taken from `STAKEHOLDER_CATEGORY_COLORS`.
- Atlas-specific filters: sector whitelist (Rail, Energy, Local Gov, Transport, Built Env, Aviation) and similarity threshold for `similar_to` edges.
- Provenance filters and physics controls sit in the same panel which makes the state surface area fairly large.

### What is confusing today
1. **Primary vs secondary clustering** – both are driven by a mix of user controls and auto-defaults. When you toggle domains the component silently rewrites `primaryClusterBy`, `secondaryClusterSelection`, `colorBy`, and `showDomainHulls`, which makes it hard to reason about “why” the pods/hulls look a certain way.
2. **Colour palette mismatch** – colouring can be `domain`, `entityType`, `stakeholderCategory`, or “secondary cluster”. In multi-domain mode this usually aligns, but single-domain Navigate views can switch between stakeholder pods and entity-type colours, so the palette feels inconsistent.
3. **Navigate-only baseline vs unified view** – Navigate-only graphs (earlier versions) hard-coded stakeholders into the pods + palette. The unified graph tries to merge Navigate/Atlas/CPC logic together, so the Navigate experience no longer feels identical.

### Recommended reset strategy
1. **Strip clustering down to one control**  
   - Expose `Cluster mode: Domain | Entity Type | Custom taxonomy`.  
   - If `Domain` is selected, automatically enable domain hulls (primary).  
   - If `Entity Type` is selected, hide hulls and use per-domain pods (see section below).  
   - `Custom taxonomy` can later map to TRL groupings, problem types, etc.

2. **Domain-specific secondary pods (opt-in)**  
   - Navigate: pods = stakeholder category (`Government`, `Intermediary`, `Academia`, `Industry`, `Project`, `Working Group`).  
   - Atlas: pods = sector (`Rail`, `Energy`, `Local Gov`, `Transport`, `Built Env`, `Aviation`).  
   - CPC: pods = business unit (`Rail`, `Integrated Transport`, `Aviation`, etc.).  
   - Colour palette: match pod dimension; if pods are disabled, fall back to entity type colours.

3. **Decouple colouring from clustering**  
   - Provide explicit `Colour By` selector with three options: `Domain`, `Entity Type`, `Domain-specific pods`.  
   - When `Colour By = Domain-specific pods`, look up the pod taxonomy for the currently active domain(s). If more than one domain is active, either (a) draw multi-colour gradient hulls per domain or (b) split the canvas by domain first, then apply per-domain palette within each island.

4. **Domain presets = stored scenes**  
   - Navigate preset: `primaryClusterBy = entityType`, `pods = stakeholderCategory`, `colorBy = pods`, hulls off.  
   - Atlas preset: `primaryClusterBy = entityType`, `pods = sector`, `colorBy = pods`.  
   - CPC preset: `primaryClusterBy = entityType`, `pods = businessUnit`, `colorBy = pods`.  
   - Unified preset: `primaryClusterBy = domain`, `pods = entityType`, `colorBy = domain`, hulls on.

5. **Future-proofing for TRL / challenge clusters**  
   - Introduce a `taxonomy registry` object keyed by `(domain, taxonomyName)` so you can drop in “TRL buckets”, “Challenge theme”, “Funding stream”, etc.  
   - `secondaryClusterSelection` becomes `taxonomyKey | none`.  
   - Each taxonomy entry supplies `label`, `palette`, optional `filter logic`, and `assignment function`.

### Implementation steps
1. **Create a `domainTaxonomyConfig` object** in `UnifiedNetworkGraphNested` (or a new helper) that describes pods + palettes for Navigate, Atlas, CPC.  
2. **Replace `applyDomainDefaults`** with a declarative “scene config” map so you can evolve defaults without hand-written `if/else`.
3. **Add dedicated `colorPalette` helper** that reads from `domainTaxonomyConfig` and falls back gracefully when a node doesn’t belong to that taxonomy.  
4. **Update Controls panel** to show only the relevant knobs for the current domain mix:  
   - When multi-domain: show domain toggles + high-level cluster/colour selectors.  
   - When single-domain: show domain-specific taxonomies plus Navigate/Atlas advanced filters.
5. **(Optional) Document everything** – keep this file updated so collaborators can review the mapping quickly.

### Quick share snippet
If you need to send somebody the entry point quickly, point them here:

```
Navigate1.0/src/components/visualizations/NetworkGraphDemoV6.tsx
```

Feel free to append additional notes or diagrams as the new clustering approach firms up.

