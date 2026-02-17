# Agent Workflow Builder — Development Guide

Quick reference for where to make changes. Use this instead of reading the full codebase.

## Commands

```bash
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build
npx tsc --noEmit   # Type check (run after every change)
npx gh-pages -d dist  # Deploy to GitHub Pages
```

## Where to Change What

### Adding a New Agent Template

**File**: `src/data/agentTemplates.ts`

Add to `CHAT_TEMPLATES` or `VOICE_TEMPLATES` array. Each template needs:
- `id`, `name`, `description`, `systemPrompt` — Pre-fills the wizard
- `icon` — Key from lucide (must be added to `ICON_MAP` in `CreateAgentWizard.tsx`)
- `color` — Hex accent color
- `buildWorkflow(agentName, agentConfig, genId)` — Returns `{ nodes, edges }`

The wizard and state hook automatically pick up new templates. No other files need changes.

### Adding a New Node Type

1. **Type**: `src/hooks/useCanvasState.ts` — Add to `NodeType` union, `labelMap`, `configMap` in `addNode()`
2. **Component**: Create `src/components/canvas/NewNode.tsx` (copy from `AgentNode.tsx` or `ToolNode.tsx`)
3. **Canvas**: `src/components/canvas/WorkflowCanvas.tsx` — Import + add `case` in `renderNode()`
4. **Add Menu**: `src/components/canvas/AddNodeButton.tsx` — Add to `nodeOptions` array
5. **Inspector**: `src/components/panel/RightPanel.tsx` — Add to `iconMap`, `colorMap`, `bgMap`, `typeLabelMap`

### Adding a New Edge Type

1. **Type**: `src/hooks/useCanvasState.ts` — Add to `EdgeType` union
2. **Edge Panel**: `src/components/panel/EdgePanel.tsx` — Add to type selector options
3. **Edge Renderer**: `src/components/canvas/EdgeRenderer.tsx` — Add color/style mapping

### Adding a New Agent Config Field

1. **Default value**: `src/hooks/useCanvasState.ts` — Add to `agentConfig` object in `createAgent()` AND to `configMap.agent` in `addNode()`
2. **UI**: Add to the appropriate tab in `src/components/panel/tabs/`:
   - Core config → `CoreTab.tsx`
   - Voice config → `VoiceConfigTab.tsx`
   - Knowledge/Tools → `ResourcesTab.tsx`
   - Guardrails → `SafetyTab.tsx`
   - Output/Response → `OutputTab.tsx`

### Adding a New Tab to Agent Inspector

1. **Tab trigger + content**: `src/components/panel/GeneralTab.tsx` — Add `TabsTrigger` and `TabsContent`
2. **Tab component**: Create in `src/components/panel/tabs/NewTab.tsx`
3. Props flow: `App.tsx` → `InspectorEmulatorPanel` → `RightPanel` → `GeneralTab` → Your tab

### Changing the Wizard Flow

**File**: `src/components/CreateAgentWizard.tsx`

Steps are controlled by `step` state: `'pick-type' | 'pick-template' | 'details'`. Add new steps by extending the union and adding a conditional render block.

### Adding a New Sidebar View

1. **Type**: `src/hooks/useCanvasState.ts` — Add to `DashboardView` or `AgentView` union
2. **Sidebar icon**: `src/components/LeftSidebar.tsx` — Add to `dashboardItems` or `agentItems` array
3. **Route**: `src/App.tsx` — Add conditional render block in dashboard or agent section
4. **Page component**: Create in `src/components/NewPage.tsx`

### Modifying Voice Call Logs

- **Types**: `src/hooks/useCanvasState.ts` — `ConversationLog`, `ConversationMessage`, `CallCost`, `CallLatency`
- **Sample data**: `src/data/mockData.ts` — `SAMPLE_VOICE_LOGS`
- **Display**: `src/components/LogsPage.tsx` — Voice-specific rendering (recording player, transcript, analysis tabs)

### Modifying the Emulator

- **Chat emulator**: `src/components/panel/TestAgentPanel.tsx` — Chat tab with message input, persona selector, debug mode
- **Voice emulator**: `src/components/panel/VoiceCallPanel.tsx` — Full call state machine (idle → connecting → connected → ended)
- **Tab container**: `src/components/panel/InspectorEmulatorPanel.tsx` — Inspector/Emulator tab switcher
- **Mock responses**: `src/data/mockData.ts` — `RESPONSE_MAP`, `generateMockConversation()`

### Modifying Agent Appearance

**File**: `src/components/AgentAppearancePage.tsx`

Two-column layout. Left = settings form, right = live preview. Voice agents get an extra "Voice" tab.

Agent fields are in `src/hooks/useCanvasState.ts` → `Agent` interface.

### Adding Mock Data

**File**: `src/data/mockData.ts`

- `SAMPLE_SCENARIOS` / `SAMPLE_VOICE_SCENARIOS` — Test scenarios
- `SAMPLE_SIMULATIONS` / `SAMPLE_VOICE_SIMULATIONS` — Pre-built simulations
- `SAMPLE_LOGS` / `SAMPLE_VOICE_LOGS` — Conversation/call logs
- `RESPONSE_MAP` — Keyword-matched mock agent responses
- `VOICE_OPTIONS` — Voice provider cards (OpenAI, ElevenLabs, Google, Azure)

## Architecture Quick Reference

### State Management

All state in one hook: `src/hooks/useCanvasState.ts` → `useCanvasState()`

```
agents: Record<string, AgentState>    ← Per-agent: workflow, knowledge, tools, scenarios, logs
globalKnowledge / globalTools         ← Shared across all agents
appLevel / dashboardView / agentView  ← Navigation
selectedNodeId / selectedEdgeId       ← Selection (one at a time)
```

No context providers. Props flow down from `App.tsx`.

### Prop Threading Pattern

Agent-scoped callbacks take `agentId` as first param. `App.tsx` binds `activeAgentId` into closures:

```typescript
// In useCanvasState: addNode(agentId, type, parentNodeId)
// In App.tsx: handleAddNode = (type, parentNodeId) => addNode(activeAgentId, type, parentNodeId)
```

### Mode-Aware Rendering

`agentMode` prop threaded: `App.tsx` → `InspectorEmulatorPanel` → `RightPanel` → `GeneralTab` → sub-tabs

Check `agentMode === 'voice'` to conditionally render voice-specific UI.

### ID Generation

`generateId(prefix)` → `prefix_timestamp_random6` (e.g., `node_1708123456789_a3f2k1`)

## File Map

| What you want to change | File(s) |
|--------------------------|---------|
| Agent creation wizard | `src/components/CreateAgentWizard.tsx` |
| Agent templates | `src/data/agentTemplates.ts` |
| State/types/CRUD | `src/hooks/useCanvasState.ts` |
| Callback binding | `src/App.tsx` |
| Canvas rendering | `src/components/canvas/WorkflowCanvas.tsx` |
| Node components | `src/components/canvas/{Agent,Tool,Start,End}Node.tsx` |
| Edge rendering | `src/components/canvas/EdgeRenderer.tsx` |
| Node inspector | `src/components/panel/RightPanel.tsx` → `GeneralTab.tsx` |
| Agent config tabs | `src/components/panel/tabs/{Core,Resources,Safety,Output,VoiceConfig}Tab.tsx` |
| Edge inspector | `src/components/panel/EdgePanel.tsx` |
| Chat emulator | `src/components/panel/TestAgentPanel.tsx` |
| Voice emulator | `src/components/panel/VoiceCallPanel.tsx` |
| Inspector/Emulator tabs | `src/components/panel/InspectorEmulatorPanel.tsx` |
| Sidebar navigation | `src/components/LeftSidebar.tsx` |
| Top bar / breadcrumb | `src/components/TopBar.tsx` |
| Agent appearance | `src/components/AgentAppearancePage.tsx` |
| Simulation testing | `src/components/SimulatePage.tsx` |
| Conversation logs | `src/components/LogsPage.tsx` |
| Knowledge base | `src/components/KnowledgeBasePage.tsx` |
| Tools & integrations | `src/components/ToolsPage.tsx` |
| Mock data / responses | `src/data/mockData.ts` |
| Theme / CSS variables | `src/index.css` |
| UI primitives | `src/components/ui/*.tsx` (shadcn) |
| Vite / build config | `vite.config.ts` |
