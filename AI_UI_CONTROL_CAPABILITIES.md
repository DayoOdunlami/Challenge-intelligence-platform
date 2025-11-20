# AI UI Control Capabilities

## Overview

The AI assistant is now **fully aware** of available visualizations and controls, and can **interact with them** using function calling.

## What the AI Knows

### Available Visualizations (14 total)
- **Network Graph** (`network`) - Connections and relationships
- **Flow Analysis** (`sankey`) - Challenge progression and resource flows
- **Tech Maturity Radar** (`radar`) - Compare technology readiness
- **Bar Chart Analysis** (`bar`) - Funding, projects, technology breakdowns
- **Circle Packing** (`circle`) - Hierarchical stakeholder relationships
- **TRL Progression** (`bump`) - Technology readiness over time
- **Decarbonisation Roadmap** (`timeline`) - Hydrogen aviation milestones
- **Funding Breakdown** (`treemap`) - Hierarchical funding distribution
- **Intensity Map** (`heatmap`) - Challenge density and hotspots
- **Relationship Matrix** (`chord`) - Cross-sector dependencies
- **Funding Trends** (`stream`) - Funding flows over time
- **Parallel Coordinates** (`parallel`) - Multi-dimensional comparison
- **Technology Distribution** (`swarm`) - TRL and category distribution
- **Hierarchical View** (`sunburst`) - Multi-level breakdown

### Available Controls
- **TRL Range Filter** - Filter by Technology Readiness Level (1-9)
- **Data Source Toggle** - Switch between NAVIGATE and Challenge data
- **Visualization-Specific Controls** - Each visualization has its own controls (views, filters, settings)

## What the AI Can Do

### 1. Switch Visualizations
**User:** "Show me the bar chart" or "Switch to network view"
**AI Action:** Calls `switch_visualization` function
**Result:** Visualization changes immediately

### 2. Adjust Controls
**User:** "Sort the bar chart by highest funding" or "Show percentages instead of absolute values"
**AI Action:** Calls `set_control` function
**Result:** Control setting changes

### 3. Filter Data
**User:** "Show only TRL 6-7 technologies" or "Filter by hydrogen storage category"
**AI Action:** Calls `filter_data` function
**Result:** Data is filtered, visualization updates

### 4. Highlight Entities
**User:** "Highlight ZeroAvia" or "Show me DfT connections"
**AI Action:** Calls `highlight_entities` function
**Result:** Specific entities are highlighted in the visualization

## Example Interactions

### Example 1: Switching Visualizations
```
User: "Can you show me the funding breakdown?"
AI: "I'll switch to the Funding Breakdown (Treemap) visualization for you."
[AI calls switch_visualization({ visualization: 'treemap' })]
[Visualization switches to treemap]
AI: "Here's the hierarchical funding breakdown. You can see..."
```

### Example 2: Filtering Data
```
User: "Show me only technologies at TRL 6 or higher"
AI: "I'll filter to show only TRL 6-9 technologies."
[AI calls filter_data({ trlRange: [6, 9] })]
[TRL filter updates, visualization refreshes]
AI: "Now showing 12 technologies at TRL 6-9. The highest funded is..."
```

### Example 3: Adjusting Controls
```
User: "Sort the bar chart by highest funding"
AI: "I'll sort the bar chart in descending order by funding."
[AI calls set_control({ controlId: 'bar.setSort', value: 'desc' })]
[Bar chart re-sorts]
AI: "The chart is now sorted with highest funding first. DfT leads with £125M..."
```

### Example 4: Complex Query
```
User: "Show me hydrogen storage projects under £5M in the network graph"
AI: "I'll switch to the network graph and filter for hydrogen storage projects with funding under £5M."
[AI calls switch_visualization({ visualization: 'network' })]
[AI calls filter_data({ categories: ['H2Storage'], fundingMax: 5000000 })]
[Visualization updates]
AI: "I found 3 hydrogen storage projects under £5M. They are..."
```

## How It Works

### 1. AI Awareness
- System prompt includes list of all available visualizations and controls
- AI knows what each visualization does and what controls are available
- AI receives current context (active visualization, filters, selected entities)

### 2. Function Calling
- OpenAI function calling is enabled
- AI can call 4 main functions:
  - `switch_visualization`
  - `set_control`
  - `filter_data`
  - `highlight_entities`

### 3. Execution
- Function calls are streamed from the API
- Chat panel receives function calls and executes them
- UI updates immediately
- AI explains what it's doing in its response

## Current Implementation Status

### ✅ Implemented
- AI awareness of visualizations and controls
- Function calling infrastructure
- Visualization switching
- Basic filtering (TRL range, categories)
- Function call streaming and execution

### 🚧 Partially Implemented
- Control mapping (some controls need explicit mapping)
- Entity highlighting (needs visualization-specific implementation)
- Advanced filtering (funding amounts, stakeholder types)

### 📋 Future Enhancements
- Complete control mapping for all visualizations
- Entity name resolution (convert names to IDs)
- Multi-step actions (e.g., "switch to bar chart and sort by funding")
- Action confirmation for destructive operations
- Undo/redo support

## Testing

Try these commands in the AI chat:
1. "Switch to the bar chart"
2. "Show me only TRL 6-7 technologies"
3. "Sort by highest funding"
4. "Show me the network graph"
5. "Filter to hydrogen storage category"

The AI should:
- Understand your request
- Call the appropriate function
- Update the UI
- Explain what it did

## Technical Details

### Function Definitions
Located in: `src/lib/ai-functions.ts`

### Function Execution
Handled in: `src/app/navigate/page.tsx` → `onFunctionCall` callback

### API Integration
Function calling enabled in: `src/app/api/chat/route.ts`

### System Prompt
Updated in: `src/config/ai-guardrails.ts`

