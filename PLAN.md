# Agent Robustness Plan — Guardrails, Testing & Config Expansion

## Overview
Expand agent nodes with guardrails, testing capabilities, and richer configuration sections. Two major areas: (A) new config sections in the agent right panel, (B) overhauled test emulator.

---

## Part A: Agent Config Expansion (GeneralTab)

Current sections: Behavior → Model → Knowledge → Tools → Advanced

New section order:
**Behavior → Personality → Model → Knowledge → Tools → Variables → Guardrails → Escalation → Response Format → Advanced**

### A1. Personality & Tone *(after Behavior)*
New config fields:
- `persona` (textarea) — "You are a friendly customer support agent..."
- `tone` (select) — Professional / Friendly / Casual / Formal / Empathetic
- `responseStyle` (select) — Concise / Detailed / Conversational / Step-by-step

### A2. Variables & Memory *(after Tools)*
New config fields:
- `variables` (array of `{ key: string, defaultValue: string, scope: 'session' | 'global' }`)
- Add/remove variable rows with key, default value, and scope selector
- These represent data the agent can read/write during conversation

### A3. Guardrails *(after Variables)*
New config fields:
- **Input Rules** — `inputRules` (array of `{ type: 'block' | 'warn', pattern: string }`)
  - Each rule: type toggle (Block/Warn) + pattern text input
  - Add rule button
- **Output Rules** — `outputRules` (array of `{ type: 'block' | 'rewrite', pattern: string }`)
  - Each rule: type toggle (Block/Rewrite) + pattern text input
- **Topics** — `allowedTopics` (textarea, comma-separated), `blockedTopics` (textarea, comma-separated)
- **Limits** — `maxTurns` (number input), `timeoutSeconds` (number input)

### A4. Escalation Rules *(after Guardrails)*
New config fields:
- `escalationEnabled` (switch)
- `escalationRules` (array of `{ trigger: string, action: 'human' | 'agent', target: string }`)
  - trigger = condition text (e.g. "user requests manager")
  - action = escalate to human or another agent
  - target = agent name / human queue name
  - Add rule button

### A5. Response Format *(after Escalation)*
New config fields:
- `responseFormat` (select) — Auto / Plain Text / Markdown / JSON
- `maxResponseLength` (number input) — character limit (0 = unlimited)
- `includeSourceCitations` (switch) — whether to cite knowledge sources

### A6. Canvas Badge Update
Show guardrail count (shield icon) on agent node cards alongside tool/knowledge counts.

---

## Part B: Testing Overhaul (TestAgentPanel)

### B1. Tabbed Layout
Replace current single-chat view with 3 tabs:
- **Chat** — Improved emulator (default)
- **Scenarios** — Saved test cases
- **Logs** — Conversation history

### B2. Improved Chat Tab
- Persona selector dropdown at top (test as: "New User", "Angry Customer", "VIP", custom)
- Debug mode toggle (bug icon)
- When debug ON: each agent message shows expandable debug info:
  - Which node handled the message
  - Edge/transition that fired
  - Tools called (if any)
  - Guardrails triggered (if any)
- Better typing indicator
- Message timestamps
- Export conversation button

### B3. Test Scenarios Tab
- List of saved scenarios with name + description
- Each scenario: sequence of user messages with expected agent behavior
- "Run" button to execute scenario and show pass/fail
- "New Scenario" button to create:
  - Name, description
  - Steps: array of `{ userMessage: string, expectedBehavior: string }`
- Results show green/red status per step

### B4. Conversation Logs Tab
- List of past test conversations
- Each log: timestamp, message count, persona used, duration
- Click to expand and view full conversation
- Delete individual logs
- Clear all button

---

## Implementation Order

1. **Step 1** — State: Add all new config field defaults to useCanvasState
2. **Step 2** — Personality & Tone section in GeneralTab
3. **Step 3** — Variables & Memory section in GeneralTab
4. **Step 4** — Guardrails section in GeneralTab (input rules, output rules, topics, limits)
5. **Step 5** — Escalation Rules section in GeneralTab
6. **Step 6** — Response Format section in GeneralTab
7. **Step 7** — Update AgentNode canvas card with guardrail badge
8. **Step 8** — Overhaul TestAgentPanel with tabs + improved chat + debug mode
9. **Step 9** — Test Scenarios tab
10. **Step 10** — Conversation Logs tab
11. **Step 11** — Verify build

---

## Files Changed
- `src/hooks/useCanvasState.ts` — new config defaults, scenario/log state
- `src/components/panel/GeneralTab.tsx` — 5 new sections
- `src/components/canvas/AgentNode.tsx` — guardrail badge
- `src/components/panel/TestAgentPanel.tsx` — full rewrite with tabs
- `src/App.tsx` — pass new state to TestAgentPanel
