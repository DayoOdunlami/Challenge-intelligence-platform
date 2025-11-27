# Innovation Tracker Enhancements

## Overview

This document outlines the comprehensive enhancements made to the Innovation Tracker visualization, including data enrichment, UI improvements, scenario modeling capabilities, and an admin interface with state machine management.

## What Was Built

### 1. Harmonized Entity Data Structure (`entities-harmonized.ts`)

A unified data structure that ensures consistency between Stakeholder Dynamics and Innovation Tracker:

- **Consistent IDs**: All entities use the same IDs across visualizations
- **Harmonized Colors**: Colors match the Stakeholder Dynamics palette
- **Rich Metadata**: Each entity includes metrics, knowledge base, evidence sources
- **Research-Based Figures**: All funding amounts are sourced from government publications

**Key Features:**
- 20+ harmonized entities with complete metadata
- Evidence sources with URLs for verification
- Recent announcements linked to funding amounts
- Metrics (funding received/provided, jobs supported, project counts)

### 2. Enhanced Funding Flows Data (`fundingFlows-enhanced.ts`)

Comprehensive funding flow data based on researched government publications:

**Research Sources:**
- ONS Government R&D Expenditure 2023 (£17.4bn total)
- GOV.UK Press Releases (2025):
  - £250m ATI Programme (June 2025)
  - £63m Advanced Fuels Fund (July 2025)
  - £4.4m Future Flight Programme (September 2025)
- Jet Zero Council publications
- UKRI statistics

**Data Structure:**
- Nodes with depth positioning for Sankey diagram
- Links with evidence sources, metadata, and programme information
- Optional detailed project-level data for drill-down views
- Scenario adjustment support

### 3. Enhanced Innovation Tracker Component

Main component with multiple views and interactive features:

**Features:**
- **Sankey Diagram**: Main funding flow visualization with harmonized colors
- **Waterfall View**: Placeholder for waterfall chart (coming soon)
- **Network View**: Placeholder for network visualization (coming soon)
- **Tabs**: Easy switching between visualization types
- **Harmonized Colors**: Uses entity colors from harmonized data structure
- **Interactive Click**: Click nodes/links to see detailed insights

**Components:**
- `EnhancedInnovationTracker.tsx`: Main component with tabs and layout
- `InnovationTrackerInsightPanel.tsx`: Detailed insights panel
- `InnovationTrackerControls.tsx`: Filter and scenario controls

### 4. Insight Panel

Rich information display when clicking nodes or links:

**For Nodes (Entities):**
- Entity description and category
- Funding metrics (received/provided)
- Jobs supported
- Project counts
- Key programmes
- Recent announcements with links
- Evidence sources with URLs
- Website links

**For Links (Funding Flows):**
- Source → Target flow information
- Programme details
- Funding amount with formatting
- Industry match funding
- Jobs supported
- Evidence sources with verification links

### 5. Control Panel

Advanced filtering and scenario modeling:

**Filters:**
- Fiscal Year selection (FY22, FY23, FY24)
- Funding Source (All, Public, Private)
- Programme filter (ATI, AFF, Future Flight, etc.)
- Show detailed projects toggle

**Scenario Modeling:**
- Adjust UKRI allocation (0-200%)
- Adjust ATI Programme funding (0-200%)
- Adjust Advanced Fuels Fund (0-200%)
- Real-time Sankey diagram updates
- Reset to baseline functionality

### 6. Admin Page with State Machine (`/admin/funding-flows`)

Comprehensive admin interface for managing scenarios:

**State Machine Diagram:**
```
BASELINE → EDITING → SAVED → SIMULATING → RESULTS
    ↑         ↓         ↓          ↓          ↓
    └─────────┴─────────┴──────────┴──────────┘
```

**States:**
- **BASELINE**: Initial state with original data
- **EDITING**: Modifying funding adjustments
- **SAVED**: Scenario saved for later use
- **SIMULATING**: Running scenario calculations
- **RESULTS**: Viewing simulation results

**Features:**
- Visual state machine diagram
- Scenario save/load functionality
- Funding adjustment controls
- Simulation runner
- Results viewer
- Entity management (placeholder)
- Funding flows management (placeholder)

## Data Sources & References

All figures include source references for verification:

1. **ONS - UK Government R&D Expenditure 2023**
   - URL: https://www.ons.gov.uk/economy/governmentpublicsectorandtaxes/researchanddevelopmentexpenditure/bulletins/ukgovernmentexpenditureonscienceengineeringandtechnology/latest
   - Total: £17.4bn (2023)
   - UKRI: £6.3bn (36.2% of total)

2. **GOV.UK - ATI Programme**
   - URL: https://www.gov.uk/government/news/250m-for-green-aerospace-projects-ahead-of-industrial-strategy
   - Date: 2025-06-17
   - Amount: £250m (19 projects, 1:1 industry match)

3. **GOV.UK - Advanced Fuels Fund**
   - URL: https://www.gov.uk/government/news/63-million-lift-off-for-clean-aviation-fuels
   - Date: 2025-07-22
   - Amount: £63m (17 companies, 1,400 jobs)

4. **GOV.UK - Future Flight Programme**
   - URL: https://www.gov.uk/government/news/over-4-million-government-backing-for-next-gen-aviation-technology-projects
   - Date: 2025-09-29
   - Amount: £4.4m

## Color Coding

Colors are harmonized with Stakeholder Dynamics:

- **Government**: `#006E51` (CPC Primary Teal)
- **Research**: `#50C878` (CPC Success Green)
- **Industry**: `#F5A623` (CPC Warning Amber)
- **Intermediary**: `#4A90E2` (CPC Info Blue)
- **Private**: `#EF4444` (Red for private funding)
- **Public**: `#6b7280` (Grey for public funding)
- **Outcome**: `#9333EA` (Purple for outcomes)

## Usage

### Using the Enhanced Innovation Tracker

```tsx
import { EnhancedInnovationTracker } from '@/components/toolkit/InnovationTracker';

// In your page component:
<EnhancedInnovationTracker />
```

### Using the Admin Page

Navigate to `/admin/funding-flows` to access:
- Scenario state machine
- Funding adjustments
- Scenario management
- Entity and flow management

### Accessing Harmonized Entities

```tsx
import { harmonizedEntities, getEntity } from '@/data/toolkit/entities-harmonized';

// Get entity by ID
const entity = getEntity('ukri');

// Get all entities of a type
const intermediaries = getEntitiesByType('intermediary');
```

## Next Steps

### Phase 1 (Quick Wins)
- [ ] Add waterfall chart visualization
- [ ] Add network graph visualization
- [ ] Enhance tooltip information
- [ ] Add export functionality

### Phase 2 (Enhancements)
- [ ] Complete entity management interface
- [ ] Complete funding flows management interface
- [ ] Add comparison view (baseline vs scenario)
- [ ] Add impact metrics calculation

### Phase 3 (Advanced Features)
- [ ] Add time-series data support
- [ ] Add multi-year comparisons
- [ ] Add forecast projections
- [ ] Integrate with real-time data sources

## File Structure

```
Navigate1.0/src/
├── data/toolkit/
│   ├── entities-harmonized.ts          # Harmonized entity database
│   └── fundingFlows-enhanced.ts        # Enhanced funding flows with evidence
├── components/toolkit/InnovationTracker/
│   ├── EnhancedInnovationTracker.tsx   # Main component
│   ├── InnovationTrackerInsightPanel.tsx
│   ├── InnovationTrackerControls.tsx
│   └── index.ts                        # Exports
└── app/admin/funding-flows/
    └── page.tsx                        # Admin page with state machine
```

## State Machine Flow

The state machine ensures controlled scenario management:

1. **Start**: Begin in BASELINE state
2. **Edit**: Click "Start Editing" → transitions to EDITING
3. **Adjust**: Modify funding sliders in EDITING state
4. **Save**: Save scenario → transitions to SAVED
5. **Simulate**: Run simulation → transitions to SIMULATING → RESULTS
6. **Reset**: Return to BASELINE or start new scenario

All transitions are validated to prevent invalid state changes.

## Evidence & Verification

Every funding figure includes:
- Source publication
- URL for verification
- Publication date
- Amount in original source
- Optional notes

This ensures transparency and allows users to verify all data through the knowledge base.

