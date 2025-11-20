# NAVIGATE Controls Registry

The registry lives in `src/config/visualization-control-registry.tsx` and is the single source of truth for every visualization-specific control rendered inside the `GlobalControlsPanel`.

## Structure

```ts
export interface VisualizationControlGroup {
  id: string;
  title: string;
  description?: string;
  appliesTo: VisualizationType[];
  render: (ctx: VisualizationControlContext) => React.ReactNode;
}
```

- **`appliesTo`**: array of visualization ids (e.g., `['timeline']`). The group is rendered automatically whenever one of these visualizations is active.
- **`render(ctx)`**: receives the control context (current values + setters) declared in `VisualizationControlSections`. It should return the inner UI for that control block. The wrapper (title, description, padding) is handled for you.

## Adding a control
1. Open `VisualizationControlSections.tsx` and add any missing fields to `VisualizationControlContext`.
2. Pass those fields from the page (e.g., `navigate/page.tsx`) into the `context` prop.
3. In `src/config/visualization-control-registry.tsx`, add a new `VisualizationControlGroup` entry:
   ```ts
   {
     id: 'stream-smoothing',
     title: 'Stream Graph Smoothing',
     description: 'Adjust rolling average applied to series.',
     appliesTo: ['stream'],
     render: ({ streamSmoothing, setStreamSmoothing }) => (
       <input type="range" ... />
     ),
   }
   ```
4. The control will now appear automatically in both `/navigate` and any other layout that uses the shared panel.

## AI / Voice intents
- `controlIntentCatalog` (also in `visualization-control-registry.tsx`) exposes a lightweight descriptor for every control group. Each descriptor includes an intent `id`, the `controlGroupId` it maps to, the interaction `type` (toggle, single-select, multi-select), and any canonical option values.
- The chat/voice layer can look up an intent by id (e.g., `timeline.toggleTrack`) and call the same setters as the UI. This keeps voice actions aligned with the panel controls.

## Notes
- Use the registry for **all** visualization-specific controls so AI/voice intents can enumerate them later.
- Global controls (data source toggle, TRL filter, etc.) remain inside `GlobalControlsPanel`.
- If a control needs to be disabled for NAVIGATE data (e.g., the legacy network similarity slider), check `ctx.useNavigateData` inside the render function.

