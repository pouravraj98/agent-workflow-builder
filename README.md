# Agent Workflow Builder

A visual canvas-based tool for designing AI agent workflows. Build multi-agent systems by connecting nodes on a drag-and-drop canvas, configuring agent behavior, knowledge, tools, guardrails, and testing conversations in an integrated emulator. Supports both **chat** and **voice** agent modes with a unified configuration experience.

## Tech Stack

- **React 19** + **TypeScript** — UI framework
- **Vite 7** — Build tool and dev server
- **Tailwind CSS v4** — Utility-first styling (OKLCH color system, `@theme inline`)
- **Radix UI** — Headless primitives (Dialog, Select, Tabs, Popover, Switch, Slider, Tooltip, Sheet)
- **shadcn/ui** — Styled component library built on Radix
- **Lucide React** — Icon library

## Getting Started

```bash
npm install
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── App.tsx                          # Root — two-level routing, callback binding, keyboard shortcuts
├── main.tsx                         # React entry point
├── index.css                        # Tailwind config, theme variables, utility classes
│
├── hooks/
│   ├── useCanvasState.ts            # Central state: multi-agent map, global resources, navigation
│   ├── useNodeDrag.ts               # Node drag-and-drop logic
│   └── usePanZoom.ts                # Canvas pan/zoom with mouse wheel + drag
│
├── data/
│   └── mockData.ts                  # Mock personas, responses, voice options, sample data, helpers
│
├── components/
│   ├── AgentDashboard.tsx           # Landing page — agent card grid, create/delete agents
│   ├── CreateAgentWizard.tsx        # Two-step agent creation wizard (Chat/Voice → details)
│   ├── LeftSidebar.tsx              # Icon-only sidebar (60px) — dual-mode (dashboard vs agent)
│   ├── TopBar.tsx                   # Breadcrumb header — Agents > Agent Name + action buttons
│   ├── BottomBar.tsx                # Save/discard bar (shown when dirty)
│   ├── KnowledgeBasePage.tsx        # Full-page knowledge base manager (scope-aware)
│   ├── ToolsPage.tsx                # Full-page tools & integrations manager (scope-aware)
│   ├── SimulatePage.tsx             # Full-page simulation testing (supports global aggregate view)
│   ├── LogsPage.tsx                 # Full-page conversation logs (supports global aggregate view)
│   ├── AgentAppearancePage.tsx      # Full-page agent identity editor (+ voice tab for voice agents)
│   │
│   ├── canvas/                      # Workflow canvas components
│   │   ├── WorkflowCanvas.tsx       # Main canvas with pan/zoom, grid, node/edge rendering
│   │   ├── AgentNode.tsx            # Agent node card (blue/teal accent for chat/voice)
│   │   ├── ToolNode.tsx             # Tool node card (amber accent)
│   │   ├── StartNode.tsx            # Start node (indigo accent)
│   │   ├── EndNode.tsx              # End node (red accent)
│   │   ├── EdgeRenderer.tsx         # SVG edge lines with labels and selection
│   │   ├── ConnectionPort.tsx       # Draggable connection ports on nodes
│   │   ├── AddNodeButton.tsx        # "+" button below nodes to add children
│   │   └── CanvasToolbar.tsx        # Zoom controls overlay
│   │
│   ├── panel/                       # Right-side panels
│   │   ├── InspectorEmulatorPanel.tsx # Unified right panel with Inspector/Emulator tabs
│   │   ├── BottomPanel.tsx          # Collapsible bottom panel (Debugger, Logs, JSON)
│   │   ├── RightPanel.tsx           # Node inspector — header, name editing, delete/close
│   │   ├── GeneralTab.tsx           # Tab container for agent config (routes to sub-tabs)
│   │   ├── EdgePanel.tsx            # Edge type, label, and condition editor
│   │   ├── EdgesTab.tsx             # List of incoming/outgoing edges for a node
│   │   ├── TestAgentPanel.tsx       # Emulator — mode-aware (Chat or Voice) + Scenarios
│   │   ├── VoiceCallPanel.tsx       # Full voice call experience with state machine
│   │   ├── CreateSimulationDialog.tsx # Dialog form for creating new simulations
│   │   │
│   │   ├── tabs/                    # Agent config sub-tabs
│   │   │   ├── CoreTab.tsx          # Instructions, Personality, Model (+ Voice config for voice agents)
│   │   │   ├── VoiceConfigTab.tsx   # Voice provider, voice gallery, language, sliders, STT, behavior
│   │   │   ├── ResourcesTab.tsx     # Knowledge base overview, Tools browse
│   │   │   ├── SafetyTab.tsx        # Guidelines, Topic Controls, Escalation
│   │   │   └── OutputTab.tsx        # Chat: format/variables/instructions — Voice: timing/behavior/transcript
│   │   │
│   │   ├── dialogs/                 # Dialog & Sheet components for CRUD operations
│   │   │   ├── AddKnowledgeDialog.tsx    # Knowledge base manager (list + add/edit form views)
│   │   │   ├── AddToolDialog.tsx         # Tool library browser (search, categories, toggles)
│   │   │   ├── ConfigureToolDialog.tsx   # Webhook/Custom API config (Sheet slide-over)
│   │   │   └── ManageVariablesDialog.tsx # Variable CRUD (list + add/edit form views)
│   │   │
│   │   └── sections/                # Reusable config sections
│   │       ├── KnowledgeSection.tsx  # Knowledge item CRUD (text, link, file)
│   │       └── ToolsSection.tsx      # Tool library with search, categories, inline config
│   │
│   └── ui/                          # shadcn/ui primitives
│       ├── badge.tsx
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx                # Right-side slide-over panel (Radix Dialog-based)
│       ├── slider.tsx               # Range slider (Radix Slider)
│       ├── switch.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
│
├── lib/
│   └── utils.ts                     # cn() class merge utility
│
└── assets/
    └── react.svg
```

## Architecture

### Multi-Agent State Management

All application state lives in a single custom hook: **`useCanvasState`** (`src/hooks/useCanvasState.ts`).

The app supports **multiple agents**, each with their own workflow, resources, and configuration. Global shared resources (knowledge, tools) are inherited by all agents.

#### State Shape

```typescript
// Per-agent state bundle
interface AgentState {
  agent: Agent;                       // Name, description, prompt, model, color, avatar, mode, voice config
  nodes: WorkflowNode[];              // Workflow nodes with position, type, config
  edges: WorkflowEdge[];              // Connections between nodes
  knowledgeBase: KnowledgeItem[];     // Agent-local knowledge additions
  toolLibrary: ToolItem[];            // Agent-local tool additions
  testScenarios: TestScenario[];      // Agent-scoped simulations (seeded with samples on creation)
  conversationLogs: ConversationLog[];// Agent-scoped logs (seeded with samples on creation)
  isDirty: boolean;
  savedState: { nodes: WorkflowNode[]; edges: WorkflowEdge[] } | null;
}

// Top-level state
agents: Record<string, AgentState>    // All agents keyed by ID
globalKnowledge: KnowledgeItem[]      // Shared across all agents
globalTools: ToolItem[]               // Shared across all agents (initialized with built-in tools)
appLevel: 'dashboard' | 'agent'       // Current navigation level
dashboardView: DashboardView          // Active view at dashboard level
agentView: AgentView                  // Active view inside an agent
activeAgentId: string | null          // Currently opened agent
selectedNodeId / selectedEdgeId       // Global selection (one at a time)
```

#### Agent Modes

Each agent has a `mode: 'chat' | 'voice'` property set at creation time. Both modes share the same workflow canvas, knowledge base, tools, safety, and output configuration. The difference:

- **Chat agents**: Text-based emulator, response format/instructions output tab
- **Voice agents**: Voice call emulator, voice config in Core tab, speech timing/turn behavior output tab

#### Seed Data

New agents are automatically seeded with sample test scenarios (4), simulations (12), and conversation logs (5) from `mockData.ts`. Each sample gets a unique ID and is scoped to the new agent.

#### Resource Model: Shared + Override

- **Global resources** (knowledge, tools) are shared across all agents
- Each agent can have **additional resources** on top of the global ones
- Computed helpers merge them for display:
  - `getMergedKnowledge(agentId)` → `[...globalKnowledge, ...agent.knowledgeBase]`
  - `getMergedTools(agentId)` → `[...globalTools, ...agent.toolLibrary]`
- When editing merged resources in an agent view, App.tsx routes updates to the correct scope (global vs agent-local) based on item ID

#### Aggregate Helpers

- `getAllTestScenarios()` — Flattened from all agents with `agentId`/`agentName` attached
- `getAllConversationLogs()` — Flattened from all agents with `agentId`/`agentName` attached

#### Callback Binding Pattern

All agent-scoped CRUD callbacks in `useCanvasState` take `agentId` as their first parameter. App.tsx binds `activeAgentId` into closures so child components keep their existing prop interfaces unchanged:

```typescript
const handleAddNode = useCallback(
  (type, parentNodeId) => {
    if (activeAgentId) addNode(activeAgentId, type, parentNodeId);
  }, [activeAgentId, addNode]
);
```

State flows down from `App.tsx` through props. No context providers or external state libraries.

### Navigation Model

Two-level navigation that switches modes based on whether you're at the dashboard or inside an agent:

```
DASHBOARD LEVEL                    AGENT LEVEL
┌──────┬─────────────────┐        ┌──────┬─────────────────┐
│  🏠  │                 │        │  ←   │ Back to agents   │
│  📚  │  Agent cards    │        │  ──  │ ─────────────── │
│  🔧  │  or Global      │        │  🔀  │  Workflow canvas │
│  ──  │  resource page   │        │  🎨  │  or Agent page  │
│  ▶   │                 │        │  📚  │                 │
│  📜  │                 │        │  🔧  │                 │
│      │                 │        │  ──  │                 │
│ 60px │                 │        │  ▶   │                 │
│      │                 │        │  📜  │                 │
└──────┴─────────────────┘        └──────┴─────────────────┘

Dashboard items:                   Agent items:
  Home (LayoutGrid)                  ← Back (ArrowLeft) — returns to dashboard
  Knowledge (BookOpen) — global      ── separator ──
  Tools (Wrench) — global            Workflow (Network)
  ── separator ──                    Appearance (Palette)
  Simulate (Play) — all agents       Knowledge (BookOpen) — merged
  Logs (ScrollText) — all agents     Tools (Wrench) — merged
                                     ── separator ──
                                     Simulate (Play) — agent-scoped
                                     Logs (ScrollText) — agent-scoped
```

- **Dashboard level**: Agent list/grid, global knowledge base, global tools, aggregate simulations, aggregate logs
- **Agent level**: Workflow canvas, appearance editor, merged knowledge/tools, agent-scoped simulations/logs
- **TopBar**: Breadcrumb when inside agent — clickable "Agents" > agent avatar + name. Action buttons for Simulate, Logs, Analytics, Deploy.
- **Colored dot**: Small indicator in agent sidebar showing the agent's accent color

### Agent Dashboard

**AgentDashboard** (`src/components/AgentDashboard.tsx`) — Landing page:
- Grid of agent cards showing avatar (colored icon), name, description, node count (chat) or "Voice" label (voice), creation date
- Click card → enters agent (sidebar switches to agent mode, workflow canvas loads)
- "Create Agent" button opens `CreateAgentWizard` as a Dialog
- Delete button on each card (double-click confirmation)
- Empty state with CTA to create first agent

### Agent Creation

**CreateAgentWizard** (`src/components/CreateAgentWizard.tsx`) — Two-step wizard:
1. **Step 1 — Mode**: Choose Chat or Voice with descriptive cards
2. **Step 2 — Details**: Name, description, system prompt fields

Both modes create the same workflow structure (Start → Agent, 2 nodes). Voice agents get teal accent color (`#14b8a6`) and headphones avatar by default.

### Workflow Canvas Layout

When inside an agent on the workflow view:

```
┌──────┬──────────────────────────────────┬──────────────┐
│  ←   │ Agents > Agent Name             │ [Inspector]  │
│  ──  ├──────────────────────────────────┤ [Emulator]   │
│  W   │                                  │              │
│  A   │        Canvas                    │  Tab Content │
│  K   │                                  │  (520px)     │
│  T   │                                  │              │
│  ──  ├──────────────────────────────────┤              │
│  S   │  Bottom Panel (collapsible)      │              │
│  L   │  Debugger | Logs | JSON          │              │
├──────┼──────────────────────────────────┴──────────────┤
│      │ BottomBar (save/discard, when dirty)            │
└──────┴─────────────────────────────────────────────────┘
```

- **Right panel** (520px, workflow view only): Inspector/Emulator tabs via `InspectorEmulatorPanel`
  - Inspector: auto-activates on node/edge selection, shows config or empty state
  - Emulator: mode-aware — Chat agents get Chat + Scenarios, Voice agents get Voice + Scenarios
- **Bottom panel** (collapsible, below canvas): Event Debugger, Logs, JSON via `BottomPanel`
- **Full-page views**: AgentAppearancePage, SimulatePage, LogsPage, KnowledgeBasePage, ToolsPage — replace the canvas when active
- **Escape key**: Clears node/edge selection

### Node Types

| Type | Color | Description |
|------|-------|-------------|
| `start` | Indigo (`#6366f1`) | Entry point — exactly one per workflow |
| `agent` | Blue (`#3b82f6`) | AI agent with full config (persona, tools, guardrails, voice) |
| `tool` | Amber (`#f59e0b`) | Tool execution node |
| `end` | Red (`#ef4444`) | Workflow termination point |

### Edge Types

| Type | Description |
|------|-------------|
| `llm` | LLM-based routing (default) |
| `handoff` | Hand off to another agent |
| `escalate` | Escalate to human |
| `delegate` | Delegate subtask |
| `conditional` | Condition-based routing |
| `fallback` | Fallback path |
| `default` | Default/catch-all route |

### Agent Configuration Panel

The right panel for agent nodes uses a tabbed interface with 4 sub-tabs. Content adapts based on agent mode (chat vs voice):

| Tab | Chat Agent | Voice Agent | Purpose |
|-----|-----------|-------------|---------|
| **Core** | Instructions, Personality, Model | Same + Voice provider, voice gallery, language, speed/pitch/stability, STT, behavior | What the agent IS |
| **Resources** | Knowledge, Tools | Same | What the agent HAS |
| **Safety** | Guidelines, Topic Controls, Escalation, Limits | Same | What the agent CAN'T do |
| **Output** | Memory, Variables, Response Format, Instructions | Memory, Variables, Speech Timing, Turn Behavior, Transcript | How the agent RESPONDS |

#### Core Tab — Voice Config (voice agents only)

When the agent mode is `voice`, the Core tab renders `VoiceConfigTab` below the standard sections:

- **Provider**: Chip selector (OpenAI, ElevenLabs, Google, Azure)
- **Voice Gallery**: 2-column card grid filtered by provider. Each card shows name, description, gender, accent, and a play preview button.
- **Language**: Dropdown selector
- **Sliders**: Speed (0.5–2.0), Pitch (0.5–2.0), Stability (0–1.0)
- **Speech-to-Text**: Enable/disable toggle, STT language, VAD sensitivity chips (Low/Medium/High)
- **Behavior**: Interruptible toggle, silence timeout slider, greeting textarea

#### Output Tab — Mode Differences

**Chat mode:**
- Variables & Memory (memory toggle, variable CRUD)
- Response Format (Auto/Plain/Markdown/JSON chip selector, JSON schema editor)
- Max Response Length (tokens)
- Cite Knowledge Sources toggle
- Response Instructions textarea

**Voice mode:**
- Speech Timing (max response duration slider 5–180s, end-of-turn pause slider 0.5–5.0s)
- Turn Behavior (allow barge-in, confirm before actions, filler phrases toggles)
- Transcript (save transcript toggle, format chips: Plain Text/Timestamped/SRT)
- Variables & Memory (same as chat)

#### Resources Tab

Compact overview with two dialog-driven sections:

- **Knowledge Base**: Inherit toggle + summary card showing first 3 items. Click opens `AddKnowledgeDialog` — a multi-view dialog with list management (search, items, delete) and add/edit forms for text, URLs, and files.
- **Tools**: Browse button opens `AddToolDialog` — a searchable library with categories (Built-in, Integrations, Webhooks, Custom API). Predefined tools toggle on/off. Adding/editing webhooks or custom APIs opens `ConfigureToolDialog` as a right-side slide-over Sheet with Configuration (name, description, method, URL, headers), Behavior (timeout, interruptions, execution mode), and Parameters sections.

### Voice Call Emulator

**VoiceCallPanel** (`src/components/panel/VoiceCallPanel.tsx`) — Full voice call experience:

State machine: `idle → connecting → connected ↔ agent_speaking/user_speaking → ended`

- **Idle**: Start call button with agent avatar
- **Connecting**: Pulse animation with "Connecting..." status
- **Connected**: Live call UI with animated pulse rings, mute/end buttons, live transcript
- **Agent speaking / User speaking**: Visual state indicators
- **Ended**: Call summary with duration, call again button

The voice emulator replaces the chat emulator entirely for voice agents — there is no text chat interface for voice agents.

### Agent Appearance

**AgentAppearancePage** (full-page, from sidebar) — Two-column layout:
- **Left column**: Settings form with sections:
  - **Identity**: Name input and description textarea
  - **Avatar**: 12 preset Lucide icons in a 6-column grid. Selected state uses agent's accent color.
  - **Accent Color**: 8 preset color swatches with custom hex input.
  - **First Message**: Textarea for the automatic greeting when a conversation starts.
  - **Voice** (voice agents only): Provider chips, voice gallery, language, speed slider, greeting textarea, play sample button.
- **Right column** (400px): Live chat widget preview. Voice agents show a mic icon in the preview.

### Scope-Aware Pages

**KnowledgeBasePage** and **ToolsPage** support two modes:
- **Global scope** (dashboard level): Shows only global items, fully editable. Header: "Global Knowledge Base" / "Global Tools & Integrations"
- **Agent scope** (agent level): Shows merged items (global + agent-local). Global items display a "Global" badge and are read-only from the agent view. Agent-local items are fully editable. Header includes agent name.

**SimulatePage** and **LogsPage** support two modes:
- **Global view** (dashboard level): Aggregated data from all agents. Header: "All Simulations" / "All Conversation Logs"
- **Agent view** (agent level): Only that agent's data. Header includes agent name.

### Simulation Testing

Two access points for simulation functionality:

- **SimulatePage** (full-page, from sidebar or TopBar) — Three-view architecture:
  - **List view**: Table of all simulations with columns for opening question, persona (Testing as), result badges (Passed/Failed/Not run), and notes count. Filter by result status. "Run all" executes all simulations in batch.
  - **Create view**: Two-column form (test name, scenario description, success criteria, max turns, persona, dynamic variables) with conversation preview on the right.
  - **Detail view**: Pre-populated form for an existing simulation with Run/Delete actions. Right side shows the simulated conversation with chat bubbles and result indicator.

- **TestAgentPanel** (520px right panel, Emulator tab) — Quick-access while building:
  - **Chat agents**: Chat sub-tab (send messages, debug mode, persona selector) + Scenarios sub-tab
  - **Voice agents**: Voice sub-tab (VoiceCallPanel) + Scenarios sub-tab (no chat interface)

### Conversation Logs

**LogsPage** (full-page, from sidebar or TopBar) — Master-detail layout:
- **Left column** (360px): Filterable list of saved conversations with derived title, persona, message count, duration, and status badges (Resolved/Escalated/Pending). Search across messages and personas.
- **Right column**: Full message thread with chat bubbles, event traces (tools, guardrails), timestamps, and status indicator. "Create Test Scenario" converts a log into a new simulation.

### Mock Data System

`src/data/mockData.ts` provides realistic mock data for the emulator and simulation features:

- **Personas**: Default, Frustrated, New User, VIP, Technical
- **Voice options**: 4 providers (OpenAI, ElevenLabs, Google, Azure) with voice cards showing name, description, gender, accent
- **Voice transcriptions**: 10 pre-written user utterances for mock STT
- **Response matching**: 9 keyword-matched patterns (orders, billing, help, returns, bugs, greetings, thanks, escalation, accounts) with fallback. Each includes a debug trace with node, tools, knowledge sources, token count, and latency.
- **Conversation generation**: `generateMockConversation()` creates multi-turn conversations from scenario descriptions with ~75% pass rate.
- **Sample data**: 4 test scenarios, 12 pre-built simulations, and 5 sample conversation logs — seeded into every new agent on creation.
- **Helpers**: `deriveConversationTitle()`, `deriveConversationStatus()`, `getConversationDuration()`, `formatRelativeTime()`, `deriveOpeningQuestion()`

## Theme & Styling

CSS custom properties defined in `src/index.css` using `@theme inline`:

```
--background, --foreground          # Base colors
--primary, --primary-foreground     # Primary actions
--muted, --accent, --destructive    # Semantic colors
--node-start, --node-agent          # Node type accents
--node-tool, --node-end
--node-voice, --node-voice-light    # Voice accent (teal)
--radius: 0.625rem                  # Border radius (10px)
```

Utility classes:
- `.section-label` — 11px uppercase section headers
- `.sidebar-item` / `.sidebar-item.active` — Left sidebar nav items with active border indicator
- `.panel-slide-enter` — Slide-in animation for right panel
- `.canvas-grid` — Dot grid background pattern
- `.node-enter` — Fade-in animation for new nodes
- `.voice-pulse-ring` — Animated pulse rings for voice call UI

## Key Patterns

- **Section labels**: `<div className="section-label mb-3">TITLE</div>`
- **Dialog-based CRUD**: Complex lists use multi-view dialogs (list ↔ form) — see `AddKnowledgeDialog`, `ManageVariablesDialog`, `CreateSimulationDialog`
- **Sheet slide-overs**: Rich config forms use right-side Sheets instead of stacked dialogs — see `ConfigureToolDialog`
- **Chip selectors**: Multi-choice options use pill buttons with `border-primary bg-primary/5` selected state
- **Panel width**: Fixed 520px right panel (InspectorEmulatorPanel)
- **Font sizes**: `text-[11px]` labels, `text-[12px]` inputs, `text-[13px]` content
- **Node card width**: 252px fixed
- **ID generation**: `prefix_timestamp_random6` pattern via `generateId()`
- **Result badges**: Green (`#f0fdf4`/`#22c55e`) for Passed, Red (`#fef2f2`/`#ef4444`) for Failed
- **Callback binding**: App.tsx binds `activeAgentId` into closures so child components keep existing prop interfaces
- **Mode-aware rendering**: `agentMode` prop threaded from App.tsx → InspectorEmulatorPanel → RightPanel → GeneralTab → CoreTab/OutputTab to conditionally render voice-specific UI
