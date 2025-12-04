# NAVIGATE 1.0 - Technical Audit for AI Integration
**Generated for external AI assistant (Claude) integration**

---

## 1. Architecture Overview

### Framework and Key Dependencies

**Framework:** Next.js 15.5.5 with React 19.1.0
- Uses Turbopack for fast development builds
- App Router architecture (`app/` directory)
- API routes for backend functionality (`app/api/`)

**Key Dependencies:**
```json
{
  "next": "15.5.5",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  
  // Visualization Libraries
  "@nivo/*": "^0.99.0",  // Multiple chart types (Sankey, Radar, Bar, Treemap, etc.)
  "react-force-graph-2d": "^1.29.0",
  "react-force-graph-3d": "^1.29.0",
  "d3": "^7.9.0",
  "echarts": "^6.0.0",
  "@xyflow/react": "^12.9.3",
  "three": "^0.181.2",
  
  // UI Components
  "@radix-ui/*": "Multiple",  // Dialog, Select, Tabs, Tooltip, Slot
  "framer-motion": "^12.23.24",
  "lucide-react": "^0.545.0",
  
  // AI & Data
  "openai": "^6.9.0",
  "zod": "^3.25.76",
  "react-markdown": "^10.1.0"
}
```

### Folder Structure

```
Navigate1.0/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── navigate/            # Main platform page (page.tsx - 1677 lines)
│   │   ├── api/                 # API routes
│   │   │   ├── ai/              # AI-related endpoints
│   │   │   └── chat/            # Chat API route (route.ts)
│   │   ├── admin/               # Admin panel pages
│   │   └── test-*/              # Test/demo pages for various visualizations
│   │
│   ├── components/
│   │   ├── visualizations/      # 46 visualization components (see section 3)
│   │   ├── layouts/             # Layout components (AIChatPanel, LayoutRenderer, etc.)
│   │   ├── controls/            # Control panels (GlobalControlsPanel, NetworkControlsV7, etc.)
│   │   ├── ui/                  # 33 shadcn/ui components
│   │   └── filters/             # Filter components
│   │
│   ├── lib/
│   │   ├── adapters/            # Data transformation adapters (8 files)
│   │   ├── ai/                  # AI integration (7 files)
│   │   │   ├── tools/           # AI function definitions
│   │   │   └── vector-store-*.ts # Vector store implementations (JSON, Vercel KV, Supabase)
│   │   ├── navigate-types.ts    # Core entity type definitions
│   │   ├── navigate-adapters.ts # NAVIGATE data adapters
│   │   ├── ai-functions.ts      # AI function definitions for OpenAI
│   │   └── knowledge-base-search.ts # Knowledge base search
│   │
│   ├── data/
│   │   ├── navigate-dummy-data.ts  # Primary dummy dataset
│   │   ├── challenges.ts           # Challenge entities
│   │   ├── cpc_domain/             # CPC domain JSON files
│   │   ├── toolkit/                # Toolkit data files
│   │   └── knowledge-base/         # Markdown knowledge base content
│   │
│   ├── contexts/
│   │   └── AppContext.tsx          # React Context for Challenge data
│   │
│   ├── config/
│   │   ├── ai-guardrails.ts        # AI system prompt and guardrails
│   │   └── domainTaxonomyConfig.ts # Domain taxonomy configuration
│   │
│   └── types/
│       └── visualization-controls.ts # Visualization control type definitions
│
├── docs/                           # Documentation files (many .md files)
└── package.json
```

### State Management Approach

**Current State:** React Context API (not Zustand)

- **`AppContext`** (`src/contexts/AppContext.tsx`): Manages Challenge-based data filtering
  - Stores: `challenges`, `filteredChallenges`, `filters`, `selectedChallenge`
  - Used for: Challenge filtering and selection

**Note:** Documentation mentions Zustand stores (`graphStore.ts`, `scenarioStore.ts`, `uiStore.ts`), but these are **NOT currently implemented**. The codebase uses React Context instead.

**State Management Locations:**
- Global app state: `AppContext.tsx`
- Component-level state: React hooks (`useState`, `useMemo`, etc.)
- URL state: Next.js `useSearchParams` for visualization selection

### Data Flow

```
Data Source → Adapter → Components
     ↓
JSON Files / Dummy Data
     ↓
Adapter Functions (lib/adapters/*.ts)
     ↓
React Context (AppContext) or Props
     ↓
Visualization Components
     ↓
User Interactions → State Updates
```

**Example Flow:**
1. Data loaded from `navigate-dummy-data.ts` or JSON files
2. Adapters transform NAVIGATE entities → visualization formats
3. Components receive data via props or context
4. User interactions update URL params or component state
5. Visualizations re-render with new data/filters

---

## 2. Data Layer

### Entity Types / Interfaces

**Primary Types Defined in:** `src/lib/navigate-types.ts`

#### Core Entity Types

```typescript
// Stakeholder (Organization)
interface Stakeholder {
  id: string;                    // e.g., "org-dft-001"
  name: string;
  type: StakeholderType;         // 'Government' | 'Research' | 'Industry' | 'Intermediary' | 'Working Group'
  sector: string;
  funding_capacity: 'High' | 'Medium' | 'Low';
  total_funding_received?: number;  // Calculated
  total_funding_provided?: number;  // Calculated
  location: {
    city?: string;
    region: string;
    country: string;
  };
  contact: {
    email?: string;
    website?: string;
    contact_person?: string;
  };
  description: string;
  tags: string[];
  relationship_count?: number;      // Calculated
  influence_score?: number;         // Calculated
  knowledge_base?: KnowledgeBase;   // Optional markdown content
  data_quality: DataQuality;
  capacity_scenarios?: {
    optimistic: number;
    conservative: number;
    current: number;
  };
  created_at: string;
  updated_at: string;
}

// Technology
interface Technology {
  id: string;                      // e.g., "tech-h2-storage-001"
  name: string;
  category: TechnologyCategory;    // 'H2Production' | 'H2Storage' | 'FuelCells' | 'Aircraft' | 'Infrastructure'
  trl_current: number;             // 1-9
  trl_color: TRLColor;             // 'red' | 'amber' | 'green' (computed)
  trl_projected_2030?: number;
  maturity_risk: string;
  deployment_ready: boolean;
  total_funding?: number;
  funding_by_type?: {
    public: number;
    private: number;
    mixed: number;
  };
  stakeholder_count?: number;
  project_count?: number;
  description: string;
  tags: string[];
  regional_availability?: string[];
  knowledge_base?: KnowledgeBase;
  data_quality: DataQuality;
  created_at: string;
  updated_at: string;
}

// Project
interface Project {
  id: string;                      // e.g., "proj-zeroavia-h2-001"
  name: string;
  status: ProjectStatus;           // 'Active' | 'Completed' | 'Planned'
  start_date: string;
  end_date?: string;
  duration_months?: number;
  participants: string[];          // Stakeholder IDs
  lead_organization?: string;      // Stakeholder ID
  technologies: string[];          // Technology IDs
  primary_technology?: string;
  total_budget?: number;
  funding_events?: string[];       // Funding Event IDs
  description: string;
  objectives: string[];
  tags: string[];
  outcomes?: {
    trl_advancement?: number;
    publications?: number;
    patents?: number;
    commercial_impact?: string;
  };
  knowledge_base?: KnowledgeBase;
  data_quality: DataQuality;
  created_at: string;
  updated_at: string;
}

// Funding Event
interface FundingEvent {
  id: string;
  amount: number;                  // £
  currency: 'GBP';
  funding_type: FundingType;       // 'Public' | 'Private' | 'Mixed'
  source_id: string;               // Stakeholder ID (funder)
  recipient_id: string;            // Stakeholder or Project ID
  recipient_type: 'stakeholder' | 'project';
  program: string;
  program_type?: 'grant' | 'contract' | 'SBRI' | 'innovation_voucher' | 'partnership';
  date: string;
  start_date?: string;
  end_date?: string;
  status: 'Active' | 'Completed' | 'Planned';
  impact_description: string;
  technologies_supported?: string[];
  trl_impact?: {
    before: number;
    after: number;
  };
  data_quality: DataQuality;
  created_at: string;
  updated_at: string;
}

// Relationship
interface Relationship {
  id: string;
  source: string;                  // Entity ID
  target: string;                  // Entity ID
  type: RelationshipType;          // 'funds' | 'researches' | 'collaborates_with' | 'advances' | 'participates_in' | 'owns' | 'supplies'
  weight: number;                  // 0-1 or amount in £
  strength: 'strong' | 'medium' | 'weak';
  metadata: {
    start_date?: string;
    end_date?: string;
    amount?: number;
    description?: string;
    program?: string;
    project_id?: string;
  };
  bidirectional: boolean;
  created_at: string;
  updated_at: string;
}

// Shared Types
interface KnowledgeBase {
  content: string;                 // Markdown
  sources: Array<{
    title: string;
    url: string;
    date: string;
    type: 'report' | 'news' | 'interview' | 'internal_doc';
  }>;
  last_updated: string;
  contributors: string[];
  tags: string[];
  confidence: 'verified' | 'unverified' | 'speculative';
}

interface DataQuality {
  confidence: 'verified' | 'estimated' | 'placeholder';
  last_verified: string;
  verified_by?: string;
  notes?: string;
}

// Complete Dataset
interface NavigateDataset {
  stakeholders: Stakeholder[];
  technologies: Technology[];
  funding_events: FundingEvent[];
  projects: Project[];
  relationships: Relationship[];
  metadata: {
    version: string;
    created_at: string;
    updated_at: string;
    total_entities: number;
    total_relationships: number;
  };
}
```

### Relationship Structures

Entities connect through:
1. **Relationships** table: Explicit source → target connections with types and weights
2. **Funding Events**: Link funders (stakeholders) → recipients (stakeholders/projects)
3. **Projects**: Link participants (stakeholders) + technologies used
4. **Calculated relationships**: Derived from shared projects, funding flows, etc.

**Relationship Types:**
- `funds`: Stakeholder funds another entity
- `researches`: Stakeholder researches technology
- `collaborates_with`: Bidirectional collaboration
- `advances`: Technology advancement relationship
- `participates_in`: Stakeholder participates in project
- `owns`: Ownership relationship
- `supplies`: Supply chain relationship

### Data Sources

**Primary Data Sources:**

1. **Dummy Data** (`src/data/navigate-dummy-data.ts`)
   - 30+ stakeholders
   - 15+ technologies
   - 20+ funding events
   - 10+ projects
   - 40+ relationships
   - Includes knowledge base content for key entities

2. **JSON Files** (`src/data/cpc_domain/*.json`)
   - `stakeholders.json`
   - `focus_areas.json`
   - `milestones.json`
   - `stage_framework.json`

3. **Toolkit Data** (`src/data/toolkit/*`)
   - Various JSON/TS files for toolkit visualizations

4. **Knowledge Base** (`src/data/knowledge-base/`)
   - Markdown files in subdirectories:
     - `policies/` - Policy documents
     - `stakeholders/` - Stakeholder information
     - `technologies/` - Technology details
     - `statistics/` - Statistical data

**Note:** Currently using in-memory data. No database integration yet. Production would use PostgreSQL/Neo4j.

### Adapter Functions

**Location:** `src/lib/adapters/`

Adapters transform NAVIGATE entities into visualization-specific formats:

1. **`stakeholder-adapter.ts`**: Converts Stakeholder → visualization nodes
2. **`technology-adapter.ts`**: Converts Technology → visualization nodes
3. **`project-adapter.ts`**: Converts Project → visualization nodes
4. **`relationship-adapter.ts`**: Converts Relationship → visualization links
5. **`challenge-adapter.ts`**: Adapts Challenge entities
6. **`navigate-adapters.ts`**: Main adapter file with `toNetworkGraphFromNavigate()` and others

**Example Adapter Pattern:**
```typescript
// Converts NAVIGATE entities to NetworkGraph format
export function toNetworkGraphFromNavigate(
  stakeholders: Stakeholder[],
  technologies: Technology[],
  projects: Project[],
  relationships: Relationship[]
): { nodes: NetworkNode[], links: NetworkLink[] }
```

---

## 3. Visualization Components

### Component Catalog

**Location:** `src/components/visualizations/`

**Total Components:** 46 visualization files

### Network Graph Variants (Multiple Versions)

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `NetworkGraphV7.tsx` | **Current production** - Multi-domain network graph | ✅ Active | Uses UnifiedNetworkGraphNested, supports navigate/atlas/cpc-internal domains |
| `NetworkGraphNavigate3D.tsx` | 3D force graph | ✅ Active | Uses react-force-graph-3d |
| `NetworkGraphNavigate.tsx` | 2D network graph | ✅ Active | Uses react-force-graph-2d |
| `UnifiedNetworkGraph.tsx` | Unified network graph | ⚠️ Legacy | Older unified version |
| `UnifiedNetworkGraphNested.tsx` | Multi-domain nested clustering | ✅ Active | Used by V7 |
| `NetworkGraphDemo.tsx` | Demo version | ⚠️ Legacy | |
| `NetworkGraphDemoV5.tsx` | Demo V5 | ⚠️ Legacy | |
| `NetworkGraphDemoV6.tsx` | Demo V6 | ⚠️ Legacy | |
| `NetworkGraphDemoNested.tsx` | Demo nested | ⚠️ Legacy | |
| `NetworkGraphDemoClustered.tsx` | Demo clustered | ⚠️ Legacy | |
| `NetworkGraphD3.tsx` | D3-based network | ⚠️ Alternative | |
| `NetworkGraphECharts.tsx` | ECharts-based network | ⚠️ Alternative | |
| `D3NetworkGraphToolkit.tsx` | Toolkit D3 network | ⚠️ Toolkit-specific | |
| `D3NetworkGraphUnified.tsx` | D3 unified | ⚠️ Alternative | |
| `D3NetworkGraphUniversal.tsx` | D3 universal | ⚠️ Alternative | |

**Current Production Version:** `NetworkGraphV7.tsx`

**Props Interface Example (NetworkGraphV7):**
```typescript
export function NetworkGraphV7() {
  // State managed internally:
  const [activeDomains, setActiveDomains] = useState<SupportedDomain[]>(['navigate']);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [showDomainHulls, setShowDomainHulls] = useState(false);
  const [colorByDomain, setColorByDomain] = useState(false);
  const [clusterTightness, setClusterTightness] = useState(0.6);
  const [domainFilters, setDomainFilters] = useState<DomainFilterMap>(...);
  
  // Data sources:
  // - unifiedEntities from '@/data/unified'
  // - unifiedRelationships from '@/data/unified'
  
  // Controls via NetworkControlsV7 component
}
```

### Chart Components (Nivo-based)

| Component | File | Props Interface | Data Shape | Controls |
|-----------|------|-----------------|------------|----------|
| **Sankey** | `SankeyChartNavigate.tsx` | `{ data: SankeyData, ... }` | Nodes + Links | View mode, flow direction |
| **Radar** | `RadarChartNavigate.tsx` | `{ technologies: Technology[], ... }` | Technology dimensions | Dimension selection, technology toggles |
| **Bar Chart** | `BarChartNavigate.tsx` | `{ data: BarData, ... }` | Aggregated values | View mode, sort order, value mode |
| **Treemap** | `TreemapNavigate.tsx` | `{ data: TreemapData, ... }` | Hierarchical tree | View mode, color scheme |
| **Circle Packing** | `CirclePackingNavigate.tsx` | `{ data: CirclePackingData, ... }` | Hierarchical nodes | View mode, size metric |
| **Sunburst** | `SunburstChart.tsx` | `{ data: SunburstData, ... }` | Hierarchical tree | Depth, color scheme |
| **Chord Diagram** | `ChordDiagramNavigate.tsx` | `{ matrix: number[][], ... }` | Relationship matrix | View mode, threshold |
| **Bump Chart** | `BumpChartNavigate.tsx` | `{ data: BumpData, ... }` | Time series ranking | Mode, category filter |
| **Stream Graph** | `StreamGraphNavigate.tsx` | `{ data: StreamData, ... }` | Time series stacked | View mode, date range |
| **Parallel Coordinates** | `ParallelCoordinatesNavigate.tsx` | `{ data: MultiDimData[], ... }` | Multi-dimensional | Dimension selection |
| **Swarm Plot** | `SwarmPlotNavigate.tsx` | `{ data: ScatterData[], ... }` | Scatter plot | View mode, grouping |
| **Heatmap** | `HeatmapNavigate.tsx` | `{ matrix: number[][], ... }` | 2D matrix | Matrix type, color mode |
| **Timeline** | `TimelineNavigate.tsx` | `{ tracks: TimelineTrack[], ... }` | Timeline events | Track toggles, date range |

### Other Visualization Components

| Component | File | Purpose |
|-----------|------|---------|
| `VisualizationRenderer.tsx` | Main renderer component that switches between visualizations |
| `UnifiedInsightsPanel.tsx` | Insights panel component |
| `FocusAreaMatrix.tsx` | Focus area matrix visualization |
| `StagePipeline.tsx` | Stage pipeline visualization |
| `PortfolioTreemap.tsx` | Portfolio-specific treemap |
| `StakeholderNetwork.tsx` | Stakeholder-specific network view |
| `StakeholderSunburst.tsx` | Stakeholder sunburst |
| `TreemapSunburstExplorer.tsx` | Combined treemap/sunburst explorer |
| `TreemapSunburstTransition.tsx` | Animated transition between treemap/sunburst |

### Controls Configuration

**Location:** `src/components/controls/`

1. **`GlobalControlsPanel.tsx`**: Global filters (TRL range, data source toggle)
2. **`NetworkControlsV7.tsx`**: Network graph specific controls (domain filters, clustering, view mode)
3. **`VisualizationControlSections.tsx`**: Control sections for different visualization types

**Control Types Available:**
- TRL range filter
- Data source toggle (NAVIGATE vs Challenge data)
- Domain selection (navigate/atlas/cpc-internal)
- Taxonomy filters (by domain)
- View mode toggles
- Color scheme selection
- Clustering controls
- Dimension selection (for multi-dimensional charts)

---

## 4. AI Integration (Current State)

### AI Provider Setup

**Current Implementation:** OpenAI (GPT-4o)

**API Route:** `src/app/api/chat/route.ts`

**Configuration Files:**
- `src/config/ai-guardrails.ts`: System prompt, guardrails, model/temperature config
- `src/lib/ai-functions.ts`: Function definitions for OpenAI function calling

**Current Provider:**
```typescript
// src/app/api/chat/route.ts
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model selection priority:
// 1. Request body (user/admin override)
// 2. Guardrails config (localStorage on client, env on server)
// 3. Environment variable (OPENAI_MODEL)
// 4. Default: 'gpt-4o'
```

**Note:** Documentation mentions Claude/Anthropic provider support, but only OpenAI is currently implemented in the API route.

### AI Features

**Implemented:**
1. ✅ **Chat Interface** (`AIChatPanel.tsx`)
   - Text-based chat
   - Streaming responses
   - Markdown rendering
   - Context awareness (active viz, selected entities)

2. ✅ **Function Calling**
   - `switch_visualization`: Change active visualization
   - `set_control`: Adjust visualization controls
   - `filter_data`: Filter by TRL, categories, funding
   - `highlight_entities`: Highlight specific entities

3. ✅ **Knowledge Base Integration**
   - Keyword-based search (always available)
   - Vector store semantic search (optional, via JSON vector store)

4. ✅ **Context Building**
   - Current visualization context
   - Selected entities
   - Active filters
   - Knowledge base results

**Not Yet Implemented:**
- ❌ Voice interface
- ❌ Claude/Anthropic provider (code exists in docs, not in API)
- ❌ Mock provider for development

### AI Function Definitions

**Location:** `src/lib/ai-functions.ts`

**Available Functions:**
```typescript
export const AI_FUNCTION_DEFINITIONS = [
  {
    name: 'switch_visualization',
    description: 'Switch to a different visualization',
    parameters: {
      visualization: { enum: ['network', 'sankey', 'radar', ...] }
    }
  },
  {
    name: 'set_control',
    description: 'Change a control setting for the current visualization',
    parameters: {
      controlId: { enum: AVAILABLE_CONTROLS.map(c => c.id) },
      value: { /* flexible value type */ }
    }
  },
  {
    name: 'filter_data',
    description: 'Filter the data shown in visualizations',
    parameters: {
      trlRange: { type: 'array' },
      categories: { type: 'array' },
      stakeholderTypes: { type: 'array' },
      fundingMin: { type: 'number' },
      fundingMax: { type: 'number' }
    }
  },
  {
    name: 'highlight_entities',
    description: 'Highlight specific entities',
    parameters: {
      entityIds: { type: 'array' },
      entityNames: { type: 'array' }
    }
  }
];
```

### AI System Prompt

**Location:** `src/config/ai-guardrails.ts`

**Default System Prompt** (excerpt):
```
You are an AI assistant for the NAVIGATE platform, an interactive intelligence platform for the UK's zero-emission aviation ecosystem.

## Your Capabilities
1. Data Exploration: Answer questions about stakeholders, technologies, funding events, projects, and relationships
2. Visualization Control: You can switch visualizations, adjust controls, filter data, and highlight entities using function calls
3. Knowledge Base Queries: Access and cite information from the knowledge base
4. Insights & Analysis: Provide contextual insights based on the current visualization
5. Interactive Assistance: When users ask to "show", "switch to", "filter by", or "highlight", use the appropriate function

## Guidelines
- Be Data-Driven: Always reference specific numbers, entities, or data points
- Cite Sources: When referencing knowledge base content, cite the source document
- Be Concise: Provide clear, actionable answers
- Acknowledge Uncertainty: If data is missing or uncertain, clearly state this
- Stay On-Topic: Focus on zero-emission aviation, hydrogen, sustainable fuels
```

### AI Configuration

**Guardrails Interface:**
```typescript
interface AIGuardrails {
  systemPrompt: string;
  allowedTopics: string[];
  restrictedTopics: string[];
  tone: 'professional' | 'friendly' | 'technical' | 'conversational';
  maxContextLength: number;
  citationRequired: boolean;
  model: string;           // OpenAI model name
  temperature: number;     // 0.0 - 1.0
}
```

**Configuration Storage:**
- Server-side: Environment variables + defaults
- Client-side: localStorage (for admin panel overrides)

---

## 5. Search/RAG Implementation

### Vector Store Setup

**Location:** `src/lib/ai/vector-store-*.ts`

**Available Implementations:**

1. **JSON Vector Store** (`vector-store-json.ts`)
   - Current implementation
   - Stores embeddings in JSON file
   - Suitable for < 500 entities
   - No external dependencies

2. **Vercel KV Vector Store** (`vector-store-vercel-kv.ts`)
   - For 500-2000 entities
   - Uses Vercel KV for storage
   - Not yet implemented

3. **Supabase Vector Store** (`vector-store-supabase.ts`)
   - For 2000+ entities
   - Uses Supabase pgvector
   - Not yet implemented

**Abstraction Layer:** `vector-store-abstraction.ts`
- Factory pattern to create appropriate store
- Auto-selects based on entity count or env var
- Interface allows swapping implementations

**Vector Store Interface:**
```typescript
interface VectorStoreInterface {
  embedEntity(entity: BaseEntity): Promise<void>;
  search(query: string, options?: SearchOptions): Promise<Array<{ entity: BaseEntity; similarity: number }>>;
  deleteEmbedding(entityId: string): Promise<void>;
  embedAll(entities: BaseEntity[]): Promise<void>;
}
```

### Search Implementation

**Current Search Methods:**

1. **Keyword-Based Search** (Always Available)
   - Location: `src/lib/knowledge-base-search.ts`
   - Function: `searchKnowledgeBase(query: string)`
   - Searches markdown files in `src/data/knowledge-base/`
   - Returns: Matching content with relevance

2. **Semantic Search** (Vector Store - Optional)
   - Location: `src/app/api/chat/route.ts` (lines 49-93)
   - Uses vector store to find similar entities
   - Hybrid search: semantic + keyword matching
   - Graceful degradation if vector store unavailable

**Search Flow in Chat API:**
```typescript
// 1. Keyword search (always runs)
const kbResults = searchKnowledgeBase(lastUserMessage);

// 2. Semantic search (if vector store available)
try {
  const vectorStore = getVectorStore();
  const semanticResults = await vectorStore.hybridSearch(lastUserMessage, {
    topK: 5,
    threshold: 0.5,
  });
  
  // 3. Find similar entities (cross-domain discovery)
  if (topMatch.similarity > 0.75) {
    const similar = await vectorStore.findSimilar(topMatch.entity.id, ...);
  }
} catch (error) {
  // Graceful degradation - continue without semantic search
}
```

### Embedding Approach

**Current Status:** Embeddings are generated and stored, but the embedding model/provider is not specified in visible code.

**Embedding Text Builder:** `src/lib/ai/embedding-text-builder.ts`
- Constructs searchable text from entity properties
- Combines: name, description, tags, domain, entity type

**Embedding Storage:**
- JSON file: `public/vector-store.json` (for JSON implementation)
- Contains: entity metadata + embedding vectors

---

## 6. Key Files to Review

### Architecture & Types
1. **`src/lib/navigate-types.ts`** - Core entity type definitions (400 lines)
2. **`src/config/ai-guardrails.ts`** - AI system prompt and configuration
3. **`src/lib/ai-functions.ts`** - AI function definitions for OpenAI
4. **`src/types/visualization-controls.ts`** - Visualization control types

### Data Layer
5. **`src/data/navigate-dummy-data.ts`** - Primary dummy dataset (1868+ lines)
6. **`src/lib/adapters/navigate-adapters.ts`** - Data transformation adapters
7. **`src/lib/navigate-adapters.ts`** - NAVIGATE-specific adapters

### AI Integration
8. **`src/app/api/chat/route.ts`** - Chat API endpoint with streaming (288 lines)
9. **`src/components/layouts/AIChatPanel.tsx`** - Chat UI component (331 lines)
10. **`src/lib/ai/vector-store-abstraction.ts`** - Vector store interface

### Main Application
11. **`src/app/navigate/page.tsx`** - Main platform page (1677 lines)
12. **`src/contexts/AppContext.tsx`** - React Context for state management

### Visualization Components
13. **`src/components/visualizations/NetworkGraphV7.tsx`** - Current network graph (397 lines)
14. **`src/components/visualizations/VisualizationRenderer.tsx`** - Main renderer

### Controls & Configuration
15. **`src/components/controls/NetworkControlsV7.tsx`** - Network graph controls

---

## 7. Technical Debt / Known Issues

### Multiple Component Versions

**Network Graph Components:**
- ✅ **Current:** `NetworkGraphV7.tsx` (production)
- ⚠️ **Legacy:** Multiple demo/test versions (V5, V6, Demo, Nested, Clustered, etc.)
- ⚠️ **Alternative implementations:** D3-based, ECharts-based versions exist but may not be maintained

**Recommendation:** Archive or remove legacy demo components to reduce confusion.

### State Management Inconsistency

**Issue:** Documentation mentions Zustand stores, but codebase uses React Context.

**Current State:**
- Uses `AppContext` (React Context) for Challenge data
- Component-level state for visualization state
- URL params for visualization selection

**Documentation References (Not Implemented):**
- `graphStore.ts` - Should manage entities, relationships, filters
- `scenarioStore.ts` - Should manage scenario sliders, presets
- `uiStore.ts` - Should manage current view, selected entities

**Recommendation:** Either implement Zustand stores as documented, or update documentation to reflect current Context-based approach.

### Incomplete AI Provider Support

**Issue:** Documentation describes multi-provider support (OpenAI, Claude, Anthropic, Mock), but only OpenAI is implemented.

**Current State:**
- ✅ OpenAI implementation complete
- ❌ Claude/Anthropic provider: Not implemented in API route
- ❌ Mock provider: Not implemented
- ❌ Provider abstraction: Not implemented

**Recommendation:** Implement provider abstraction pattern as documented, or simplify to OpenAI-only with clear documentation.

### Vector Store Implementation Gaps

**Issue:** Vector store abstraction exists, but only JSON implementation is complete.

**Current State:**
- ✅ JSON vector store: Implemented
- ❌ Vercel KV vector store: Code exists, not verified
- ❌ Supabase vector store: Code exists, not verified
- ⚠️ Embedding generation: Model/provider not specified

**Recommendation:** Document current JSON-only state, or complete other implementations.

### Data Source Fragmentation

**Issue:** Multiple data sources (dummy data, JSON files, toolkit data) without clear hierarchy.

**Current Data Sources:**
1. `navigate-dummy-data.ts` - Primary source
2. `cpc_domain/*.json` - CPC-specific data
3. `toolkit/*` - Toolkit-specific data
4. `knowledge-base/*.md` - Markdown knowledge base
5. `unified/*` - Unified entity format

**Recommendation:** Create clear data source hierarchy and adapter layer to normalize access.

### Component Prop Inconsistency

**Issue:** Visualization components have varying prop interfaces.

**Examples:**
- Some accept raw entities (e.g., `technologies: Technology[]`)
- Others accept pre-processed data (e.g., `data: GraphData`)
- Some manage their own data loading, others receive via props

**Recommendation:** Standardize visualization component interfaces for consistency.

### Missing Production Features

**Not Yet Implemented (from documentation):**
- Database integration (PostgreSQL/Neo4j)
- Excel import/export utilities
- Admin panel for entity CRUD
- User authentication/authorization
- API rate limiting
- Caching layer
- Analytics/tracking

**Recommendation:** Prioritize and document roadmap for production features.

### Testing Coverage

**Issue:** No visible test files or testing framework setup.

**Recommendation:** Add unit tests for adapters, integration tests for API routes, and component tests for visualizations.

---

## Summary for AI Integration

### What Works Now
✅ OpenAI chat API with streaming  
✅ Function calling for UI control  
✅ Knowledge base keyword search  
✅ Context-aware responses  
✅ Vector store abstraction (JSON implementation)  

### What Needs Integration
⚠️ Provider abstraction (if adding Claude)  
⚠️ Function execution hooks in main page  
⚠️ State synchronization between AI actions and UI  
⚠️ Error handling for function calls  

### Key Integration Points
1. **Chat API:** `/api/chat` - Already functional
2. **Function Execution:** Need to wire AI function calls to actual UI actions in `page.tsx`
3. **Context Passing:** Already implemented in AIChatPanel
4. **Vector Store:** JSON implementation ready, can upgrade later

### Recommended First Steps for AI Assistant
1. Read `src/app/api/chat/route.ts` to understand current implementation
2. Review `src/lib/ai-functions.ts` for available functions
3. Examine `src/app/navigate/page.tsx` to see where function hooks should be added
4. Test current chat functionality with existing data
5. Implement function execution handlers in main page component

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-27  
**Codebase Version:** Navigate1.0 (Next.js 15.5.5, React 19.1.0)

