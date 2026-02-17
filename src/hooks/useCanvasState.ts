import { useState, useCallback } from 'react';
import {
  SAMPLE_SCENARIOS, SAMPLE_SIMULATIONS, SAMPLE_LOGS,
  SAMPLE_VOICE_SCENARIOS, SAMPLE_VOICE_SIMULATIONS, SAMPLE_VOICE_LOGS,
} from '@/data/mockData';

export type NodeType = 'start' | 'agent' | 'tool' | 'end';

export type EdgeType = 'llm' | 'handoff' | 'escalate' | 'delegate' | 'conditional' | 'fallback' | 'default';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  label: string;
  condition: string;
}

export interface KnowledgeItem {
  id: string;
  type: 'text' | 'link' | 'file';
  title: string;
  content: string;
}

export type ToolCategory = 'predefined' | 'integration' | 'webhook' | 'custom_api';

export interface ToolItem {
  id: string;
  category: ToolCategory;
  name: string;
  description: string;
  enabled: boolean;
  config: Record<string, string>;
}

const INITIAL_TOOLS: ToolItem[] = [
  { id: 'tool_search_web', category: 'predefined', name: 'Search Web', description: 'Search the internet for real-time information', enabled: false, config: {} },
  { id: 'tool_calculator', category: 'predefined', name: 'Calculator', description: 'Perform mathematical calculations', enabled: false, config: {} },
  { id: 'tool_code_interpreter', category: 'predefined', name: 'Code Interpreter', description: 'Execute code snippets in a sandbox', enabled: false, config: {} },
  { id: 'tool_get_weather', category: 'predefined', name: 'Get Weather', description: 'Fetch current weather for a location', enabled: false, config: {} },
  { id: 'tool_send_email', category: 'predefined', name: 'Send Email', description: 'Send emails on behalf of the user', enabled: false, config: {} },
  { id: 'tool_read_file', category: 'predefined', name: 'Read File', description: 'Read and parse uploaded file contents', enabled: false, config: {} },
  { id: 'tool_generate_image', category: 'predefined', name: 'Generate Image', description: 'Create images from text descriptions', enabled: false, config: {} },
  { id: 'tool_text_to_speech', category: 'predefined', name: 'Text to Speech', description: 'Convert text into spoken audio', enabled: false, config: {} },
  { id: 'int_slack', category: 'integration', name: 'Slack', description: 'Send messages and manage channels', enabled: false, config: {} },
  { id: 'int_gmail', category: 'integration', name: 'Gmail', description: 'Read and send emails via Gmail', enabled: false, config: {} },
  { id: 'int_google_calendar', category: 'integration', name: 'Google Calendar', description: 'Create and manage calendar events', enabled: false, config: {} },
  { id: 'int_salesforce', category: 'integration', name: 'Salesforce', description: 'Access CRM data and manage leads', enabled: false, config: {} },
  { id: 'int_notion', category: 'integration', name: 'Notion', description: 'Read and update Notion pages and databases', enabled: false, config: {} },
  { id: 'int_github', category: 'integration', name: 'GitHub', description: 'Manage repositories, issues, and PRs', enabled: false, config: {} },
];

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: { userMessage: string; expectedBehavior: string }[];
  scenario?: string;
  successCriteria?: string;
  maxTurns?: number;
  persona?: string;
  variables?: { key: string; value: string }[];
  result?: 'passed' | 'failed' | null;
  notes?: string[];
  conversation?: { role: 'user' | 'agent'; content: string; timestamp: string }[];
  lastRunAt?: string | null;
  createdAt?: string;
  agentId?: string;
}

export interface ConversationMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  debug?: { node?: string; edge?: string; tools?: string[]; guardrails?: string[] };
  // Voice-specific per-turn fields
  confidence?: number;       // STT confidence 0–1
  interrupted?: boolean;     // Was this turn interrupted / barged-in
  latencyMs?: number;        // Time-to-first-byte for agent turns (ms)
  isSilence?: boolean;       // Silence / no-speech detected
}

export interface CallCost {
  total: number;      // USD
  stt: number;
  llm: number;
  tts: number;
  telephony: number;
}

export interface CallLatency {
  e2e: number;   // Average end-to-end ms
  stt: number;   // Average STT ms
  llm: number;   // Average LLM ms
  tts: number;   // Average TTS ms
}

export interface ConversationLog {
  id: string;
  timestamp: string;
  persona: string;
  messages: ConversationMessage[];
  agentId?: string;
  // Voice call metadata
  callType?: 'phone' | 'web';
  direction?: 'inbound' | 'outbound';
  fromNumber?: string;
  toNumber?: string;
  duration?: number;          // Seconds
  endReason?: 'caller_hangup' | 'agent_hangup' | 'timeout' | 'error' | 'transfer' | 'voicemail';
  recordingUrl?: string;
  // Post-call analysis
  summary?: string;           // AI-generated call summary
  sentiment?: number;         // –1 to 1
  successEvaluation?: 'success' | 'failure' | 'unknown';
  // Cost & latency
  cost?: CallCost;
  latency?: CallLatency;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  llmModel: string;
  createdAt: string;
  color: string;
  avatar: string;
  firstMessage: string;
  suggestedMessages: string[];
  messagePlaceholder: string;
  theme: 'light' | 'dark';
  useColorForHeader: boolean;
  bubbleColor: string;
  bubbleAlign: 'left' | 'right';
  mode: 'chat' | 'voice';
  voiceEnabled: boolean;
  voiceProvider: string;
  voiceId: string;
  voiceLanguage: string;
  voiceSpeed: number;
  voiceGreeting: string;
}

export interface AgentState {
  agent: Agent;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  knowledgeBase: KnowledgeItem[];
  toolLibrary: ToolItem[];
  testScenarios: TestScenario[];
  conversationLogs: ConversationLog[];
  isDirty: boolean;
  savedState: { nodes: WorkflowNode[]; edges: WorkflowEdge[] } | null;
}

export type AppLevel = 'dashboard' | 'agent';
export type DashboardView = 'home' | 'knowledge' | 'tools' | 'simulate' | 'logs';
export type AgentView = 'workflow' | 'appearance' | 'knowledge' | 'tools' | 'simulate' | 'logs';

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useCanvasState() {
  // Navigation
  const [appLevel, setAppLevel] = useState<AppLevel>('dashboard');
  const [dashboardView, setDashboardView] = useState<DashboardView>('home');
  const [agentView, setAgentView] = useState<AgentView>('workflow');
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  // Global shared resources
  const [globalKnowledge, setGlobalKnowledge] = useState<KnowledgeItem[]>([]);
  const [globalTools, setGlobalTools] = useState<ToolItem[]>(INITIAL_TOOLS);

  // Multi-agent state
  const [agents, setAgents] = useState<Record<string, AgentState>>({});

  // Selection (global — only one at a time)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // ── Internal helper ──

  const updateAgentState = useCallback(
    (agentId: string, updater: (prev: AgentState) => AgentState) => {
      setAgents(prev => {
        const existing = prev[agentId];
        if (!existing) return prev;
        return { ...prev, [agentId]: updater(existing) };
      });
    },
    []
  );

  // ── Navigation ──

  const navigateToDashboard = useCallback(() => {
    setAppLevel('dashboard');
    setActiveAgentId(null);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const navigateToAgent = useCallback((agentId: string) => {
    setAppLevel('agent');
    setActiveAgentId(agentId);
    setAgentView('workflow');
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  // ── Agent CRUD ──

  const createAgent = useCallback((name: string, description: string, systemPrompt: string, mode: 'chat' | 'voice' = 'chat') => {
    const newAgent: Agent = {
      id: generateId('agent'),
      name,
      description,
      systemPrompt,
      llmModel: 'gpt-4',
      createdAt: new Date().toISOString(),
      color: mode === 'voice' ? '#14b8a6' : '#3b82f6',
      avatar: mode === 'voice' ? 'headphones' : 'bot',
      firstMessage: '',
      suggestedMessages: [],
      messagePlaceholder: '',
      theme: 'light',
      useColorForHeader: false,
      bubbleColor: '#000000',
      bubbleAlign: 'right',
      mode,
      voiceEnabled: mode === 'voice',
      voiceProvider: 'openai',
      voiceId: 'alloy',
      voiceLanguage: 'en-US',
      voiceSpeed: 1.0,
      voiceGreeting: '',
    };
    const agentConfig = {
      conversationGoal: description, persona: '', tone: '', responseStyle: '',
      llmModel: 'gpt-4', knowledge: [], enabledTools: [],
      variables: [], guidelines: [], topicControls: [], escalationRules: [],
      maxTurns: 0, timeoutSeconds: 0,
      responseFormat: '', maxResponseLength: 0, includeSourceCitations: false,
      memoryEnabled: true, jsonSchema: '', responseInstructions: '',
      overridePrompt: true, customPrompt: systemPrompt,
      // Voice / TTS
      voiceProvider: 'openai', voiceId: 'alloy', language: 'en-US',
      speed: 1.0, stability: 0.75,
      ambientSound: 'off', ambientVolume: 0.5,
      normalizeForSpeech: true, pronunciationGuide: '',
      // Transcription / STT
      enableSTT: true, sttLanguage: 'en-US', sttMode: 'balanced',
      noiseCancellation: 'noise', keywordBoost: '',
      endpointingMs: 200, confidenceThreshold: 0.6,
      // Turn-Taking
      firstMessageMode: 'agent-first', responsiveness: 0.5,
      interruptionSensitivity: 0.5, enableBackchannel: true,
      backchannelFrequency: 0.6, backoffSeconds: 1.0, silenceReminderMs: 10000,
      // Call Settings
      greeting: '', maxCallDuration: 30, endCallAfterSilence: 30, enableRecording: true,
      // Voice output config
      maxSpeechDuration: 60, endOfTurnPause: 1.5,
      bargeIn: true, confirmBeforeAction: true, fillerPhrases: true,
      transcriptEnabled: true, transcriptFormat: 'plain',
      // Voice safety / compliance
      piiRedactionEnabled: false,
      piiRedactNames: true, piiRedactSSN: true, piiRedactCreditCard: true,
      piiRedactPhone: true, piiRedactEmail: true, piiRedactAddress: true, piiRedactDOB: true,
      recordingConsentMode: 'none', consentMessage: '',
      aiDisclosureEnabled: true, aiDisclosureMessage: '',
      hipaaMode: false,
      profanityFilterEnabled: false, profanityFilterStrength: 'medium',
      sentimentEscalationEnabled: false, sentimentThreshold: 0.7,
      maxConsecutiveFailures: 3, failureAction: 'escalate',
    };

    // Build sample workflow nodes
    const startNode: WorkflowNode = { id: generateId('node'), type: 'start', label: 'Start', x: 400, y: 60, config: {} };
    const mainAgentNode: WorkflowNode = { id: generateId('node'), type: 'agent', label: name, x: 400, y: 280, config: agentConfig };

    let initialNodes: WorkflowNode[];
    let initialEdges: WorkflowEdge[];

    if (mode === 'voice') {
      // Voice workflow: Start → Main Agent → (Tool: Lookup) → (Escalation Agent) → End
      const lookupTool: WorkflowNode = { id: generateId('node'), type: 'tool', label: 'Lookup Order', x: 160, y: 520, config: { toolName: 'lookup_order', toolDescription: 'Look up order status by order number' } };
      const escalationAgent: WorkflowNode = { id: generateId('node'), type: 'agent', label: 'Escalation', x: 640, y: 520, config: { ...agentConfig, conversationGoal: 'Handle escalated calls that require human-level support', overridePrompt: true, customPrompt: 'You are an escalation specialist. The caller has been transferred to you because the primary agent could not resolve their issue. Review the context, empathize, and work toward a resolution.' } };
      const endNode: WorkflowNode = { id: generateId('node'), type: 'end', label: 'End Call', x: 400, y: 740, config: {} };

      initialNodes = [startNode, mainAgentNode, lookupTool, escalationAgent, endNode];
      initialEdges = [
        { id: generateId('edge'), sourceId: startNode.id, targetId: mainAgentNode.id, type: 'default', label: '', condition: '' },
        { id: generateId('edge'), sourceId: mainAgentNode.id, targetId: lookupTool.id, type: 'conditional', label: 'Needs lookup', condition: 'User asks about order status' },
        { id: generateId('edge'), sourceId: mainAgentNode.id, targetId: escalationAgent.id, type: 'escalate', label: 'Escalate', condition: 'User requests manager or agent cannot resolve' },
        { id: generateId('edge'), sourceId: mainAgentNode.id, targetId: endNode.id, type: 'default', label: 'Resolved', condition: 'Issue resolved successfully' },
        { id: generateId('edge'), sourceId: lookupTool.id, targetId: mainAgentNode.id, type: 'default', label: 'Return result', condition: '' },
        { id: generateId('edge'), sourceId: escalationAgent.id, targetId: endNode.id, type: 'default', label: 'Done', condition: '' },
      ];
    } else {
      // Chat workflow: Start → Main Agent → (Tool: Search KB) → (Handoff Agent) → End
      const searchTool: WorkflowNode = { id: generateId('node'), type: 'tool', label: 'Search Knowledge Base', x: 160, y: 520, config: { toolName: 'search_kb', toolDescription: 'Search the knowledge base for relevant articles and documentation' } };
      const handoffAgent: WorkflowNode = { id: generateId('node'), type: 'agent', label: 'Specialist', x: 640, y: 520, config: { ...agentConfig, conversationGoal: 'Provide in-depth technical support for complex issues', overridePrompt: true, customPrompt: 'You are a technical specialist. The user has been handed off to you for a complex issue. Review the conversation context and provide detailed, expert-level assistance.' } };
      const endNode: WorkflowNode = { id: generateId('node'), type: 'end', label: 'End', x: 400, y: 740, config: {} };

      initialNodes = [startNode, mainAgentNode, searchTool, handoffAgent, endNode];
      initialEdges = [
        { id: generateId('edge'), sourceId: startNode.id, targetId: mainAgentNode.id, type: 'default', label: '', condition: '' },
        { id: generateId('edge'), sourceId: mainAgentNode.id, targetId: searchTool.id, type: 'conditional', label: 'Needs info', condition: 'User question requires knowledge base lookup' },
        { id: generateId('edge'), sourceId: mainAgentNode.id, targetId: handoffAgent.id, type: 'handoff', label: 'Handoff', condition: 'Complex issue requiring specialist' },
        { id: generateId('edge'), sourceId: mainAgentNode.id, targetId: endNode.id, type: 'default', label: 'Resolved', condition: 'Issue resolved successfully' },
        { id: generateId('edge'), sourceId: searchTool.id, targetId: mainAgentNode.id, type: 'default', label: 'Return result', condition: '' },
        { id: generateId('edge'), sourceId: handoffAgent.id, targetId: endNode.id, type: 'default', label: 'Done', condition: '' },
      ];
    }

    // Seed with sample data — voice agents get voice-specific data
    const isVoiceAgent = mode === 'voice';
    const scenarioSource = isVoiceAgent ? SAMPLE_VOICE_SCENARIOS : SAMPLE_SCENARIOS;
    const simulationSource = isVoiceAgent ? SAMPLE_VOICE_SIMULATIONS : SAMPLE_SIMULATIONS;
    const logSource = isVoiceAgent ? SAMPLE_VOICE_LOGS : SAMPLE_LOGS;

    const seededScenarios = scenarioSource.map(s => ({
      ...s,
      id: generateId('scenario'),
      agentId: newAgent.id,
    }));
    const seededSimulations = simulationSource.map(s => ({
      ...s,
      id: generateId('sim'),
      agentId: newAgent.id,
    }));
    const seededLogs = logSource.map(l => ({
      ...l,
      id: generateId('log'),
      agentId: newAgent.id,
    }));

    const newState: AgentState = {
      agent: newAgent,
      nodes: initialNodes,
      edges: initialEdges,
      knowledgeBase: [],
      toolLibrary: [],
      testScenarios: [...seededScenarios, ...seededSimulations],
      conversationLogs: seededLogs,
      isDirty: false,
      savedState: { nodes: [...initialNodes], edges: [...initialEdges] },
    };

    setAgents(prev => ({ ...prev, [newAgent.id]: newState }));
    return newAgent;
  }, []);

  const deleteAgent = useCallback((agentId: string) => {
    setAgents(prev => {
      const next = { ...prev };
      delete next[agentId];
      return next;
    });
    if (activeAgentId === agentId) {
      setAppLevel('dashboard');
      setActiveAgentId(null);
    }
  }, [activeAgentId]);

  const updateAgent = useCallback((agentId: string, updates: Partial<Agent>) => {
    updateAgentState(agentId, s => ({ ...s, agent: { ...s.agent, ...updates } }));
  }, [updateAgentState]);

  // ── Workflow: Nodes ──

  const addNode = useCallback((agentId: string, type: NodeType, parentNodeId?: string) => {
    const agentState = agents[agentId];
    if (!agentState) return null;

    const { nodes, edges } = agentState;
    const parentNode = parentNodeId
      ? nodes.find(n => n.id === parentNodeId)
      : nodes.find(n => n.type === 'start');

    if (parentNode?.type === 'start' && edges.some(e => e.sourceId === parentNode.id)) {
      return null;
    }

    let x: number, y: number;
    if (parentNode) {
      const childrenOfParent = edges
        .filter(e => e.sourceId === parentNode.id)
        .map(e => nodes.find(n => n.id === e.targetId))
        .filter(Boolean) as WorkflowNode[];

      if (childrenOfParent.length === 0) {
        x = parentNode.x;
        y = parentNode.y + 240;
      } else {
        const rightmostChild = childrenOfParent.reduce((max, n) => n.x > max.x ? n : max, childrenOfParent[0]);
        x = rightmostChild.x + 280;
        y = rightmostChild.y;
      }
    } else {
      x = 400;
      y = 300;
    }

    const labelMap: Record<NodeType, string> = {
      start: 'Start', agent: 'New Agent', tool: 'New Tool', end: 'End',
    };
    const configMap: Record<NodeType, Record<string, any>> = {
      start: {},
      agent: {
        conversationGoal: '', persona: '', tone: '', responseStyle: '',
        llmModel: '', knowledge: [], enabledTools: [],
        variables: [], guidelines: [], topicControls: [], escalationRules: [],
        maxTurns: 0, timeoutSeconds: 0,
        responseFormat: '', maxResponseLength: 0, includeSourceCitations: false,
        memoryEnabled: true, jsonSchema: '', responseInstructions: '',
        overridePrompt: false, customPrompt: '',
        // Voice / TTS
        voiceProvider: 'openai', voiceId: 'alloy', language: 'en-US',
        speed: 1.0, stability: 0.75,
        ambientSound: 'off', ambientVolume: 0.5,
        normalizeForSpeech: true, pronunciationGuide: '',
        // Transcription / STT
        enableSTT: true, sttLanguage: 'en-US', sttMode: 'balanced',
        noiseCancellation: 'noise', keywordBoost: '',
        endpointingMs: 200, confidenceThreshold: 0.6,
        // Turn-Taking
        firstMessageMode: 'agent-first', responsiveness: 0.5,
        interruptionSensitivity: 0.5, enableBackchannel: true,
        backchannelFrequency: 0.6, backoffSeconds: 1.0, silenceReminderMs: 10000,
        // Call Settings
        greeting: '', maxCallDuration: 30, endCallAfterSilence: 30, enableRecording: true,
        // Voice output config
        maxSpeechDuration: 60, endOfTurnPause: 1.5,
        bargeIn: true, confirmBeforeAction: true, fillerPhrases: true,
        transcriptEnabled: true, transcriptFormat: 'plain',
        // Voice safety / compliance
        piiRedactionEnabled: false,
        piiRedactNames: true, piiRedactSSN: true, piiRedactCreditCard: true,
        piiRedactPhone: true, piiRedactEmail: true, piiRedactAddress: true, piiRedactDOB: true,
        recordingConsentMode: 'none', consentMessage: '',
        aiDisclosureEnabled: true, aiDisclosureMessage: '',
        hipaaMode: false,
        profanityFilterEnabled: false, profanityFilterStrength: 'medium',
        sentimentEscalationEnabled: false, sentimentThreshold: 0.7,
        maxConsecutiveFailures: 3, failureAction: 'escalate',
      },
      tool: { toolName: '', toolDescription: '' },
      end: {},
    };

    const newNode: WorkflowNode = {
      id: generateId('node'), type, label: labelMap[type], x, y, config: configMap[type],
    };
    const newEdge: WorkflowEdge | null = parentNode ? {
      id: generateId('edge'), sourceId: parentNode.id, targetId: newNode.id,
      type: 'llm', label: '', condition: '',
    } : null;

    updateAgentState(agentId, s => ({
      ...s,
      nodes: [...s.nodes, newNode],
      edges: newEdge ? [...s.edges, newEdge] : s.edges,
      isDirty: true,
    }));
    setSelectedNodeId(newNode.id);
    setSelectedEdgeId(null);
    return newNode;
  }, [agents, updateAgentState]);

  const updateNode = useCallback((agentId: string, nodeId: string, updates: Partial<WorkflowNode>) => {
    updateAgentState(agentId, s => ({
      ...s,
      nodes: s.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n),
      isDirty: true,
    }));
  }, [updateAgentState]);

  const updateNodeConfig = useCallback((agentId: string, nodeId: string, configUpdates: Record<string, any>) => {
    updateAgentState(agentId, s => ({
      ...s,
      nodes: s.nodes.map(n =>
        n.id === nodeId ? { ...n, config: { ...n.config, ...configUpdates } } : n
      ),
      isDirty: true,
    }));
  }, [updateAgentState]);

  const deleteNode = useCallback((agentId: string, nodeId: string) => {
    const agentState = agents[agentId];
    if (!agentState) return;
    const node = agentState.nodes.find(n => n.id === nodeId);
    if (!node || node.type === 'start') return;

    updateAgentState(agentId, s => ({
      ...s,
      nodes: s.nodes.filter(n => n.id !== nodeId),
      edges: s.edges.filter(e => e.sourceId !== nodeId && e.targetId !== nodeId),
      isDirty: true,
    }));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  }, [agents, updateAgentState, selectedNodeId]);

  const setNodes = useCallback((agentId: string, updater: WorkflowNode[] | ((prev: WorkflowNode[]) => WorkflowNode[])) => {
    updateAgentState(agentId, s => ({
      ...s,
      nodes: typeof updater === 'function' ? updater(s.nodes) : updater,
    }));
  }, [updateAgentState]);

  // ── Workflow: Edges ──

  const addEdge = useCallback((agentId: string, sourceId: string, targetId: string) => {
    const agentState = agents[agentId];
    if (!agentState) return null;
    if (sourceId === targetId) return null;
    if (agentState.edges.find(e => e.sourceId === sourceId && e.targetId === targetId)) return null;
    const sourceNode = agentState.nodes.find(n => n.id === sourceId);
    if (sourceNode?.type === 'start' && agentState.edges.some(e => e.sourceId === sourceId)) return null;

    const newEdge: WorkflowEdge = {
      id: generateId('edge'), sourceId, targetId, type: 'llm', label: '', condition: '',
    };
    updateAgentState(agentId, s => ({ ...s, edges: [...s.edges, newEdge], isDirty: true }));
    return newEdge;
  }, [agents, updateAgentState]);

  const updateEdge = useCallback((agentId: string, edgeId: string, updates: Partial<WorkflowEdge>) => {
    updateAgentState(agentId, s => ({
      ...s,
      edges: s.edges.map(e => e.id === edgeId ? { ...e, ...updates } : e),
      isDirty: true,
    }));
  }, [updateAgentState]);

  const deleteEdge = useCallback((agentId: string, edgeId: string) => {
    updateAgentState(agentId, s => ({
      ...s,
      edges: s.edges.filter(e => e.id !== edgeId),
      isDirty: true,
    }));
    if (selectedEdgeId === edgeId) setSelectedEdgeId(null);
  }, [updateAgentState, selectedEdgeId]);

  // ── Selection ──

  const selectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
  }, []);

  const selectEdge = useCallback((edgeId: string) => {
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  // ── Save / Clear ──

  const save = useCallback((agentId: string) => {
    updateAgentState(agentId, s => ({
      ...s,
      isDirty: false,
      savedState: { nodes: [...s.nodes], edges: [...s.edges] },
    }));
  }, [updateAgentState]);

  const clearChanges = useCallback((agentId: string) => {
    updateAgentState(agentId, s => ({
      ...s,
      nodes: s.savedState ? s.savedState.nodes : s.nodes,
      edges: s.savedState ? s.savedState.edges : s.edges,
      isDirty: false,
    }));
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [updateAgentState]);

  // ── Global Knowledge ──

  const addGlobalKnowledgeItem = useCallback((item: Omit<KnowledgeItem, 'id'>) => {
    setGlobalKnowledge(prev => [...prev, { ...item, id: generateId('kb') }]);
  }, []);

  const updateGlobalKnowledgeItem = useCallback((id: string, updates: Partial<KnowledgeItem>) => {
    setGlobalKnowledge(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
  }, []);

  const removeGlobalKnowledgeItem = useCallback((id: string) => {
    setGlobalKnowledge(prev => prev.filter(k => k.id !== id));
  }, []);

  // ── Global Tools ──

  const addGlobalTool = useCallback((tool: Omit<ToolItem, 'id'>) => {
    setGlobalTools(prev => [...prev, { ...tool, id: generateId('tool') }]);
  }, []);

  const updateGlobalTool = useCallback((id: string, updates: Partial<ToolItem>) => {
    setGlobalTools(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const removeGlobalTool = useCallback((id: string) => {
    setGlobalTools(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Agent-scoped Knowledge ──

  const addAgentKnowledgeItem = useCallback((agentId: string, item: Omit<KnowledgeItem, 'id'>) => {
    updateAgentState(agentId, s => ({
      ...s,
      knowledgeBase: [...s.knowledgeBase, { ...item, id: generateId('kb') }],
    }));
  }, [updateAgentState]);

  const updateAgentKnowledgeItem = useCallback((agentId: string, id: string, updates: Partial<KnowledgeItem>) => {
    updateAgentState(agentId, s => ({
      ...s,
      knowledgeBase: s.knowledgeBase.map(k => k.id === id ? { ...k, ...updates } : k),
    }));
  }, [updateAgentState]);

  const removeAgentKnowledgeItem = useCallback((agentId: string, id: string) => {
    updateAgentState(agentId, s => ({
      ...s,
      knowledgeBase: s.knowledgeBase.filter(k => k.id !== id),
    }));
  }, [updateAgentState]);

  // ── Agent-scoped Tools ──

  const addAgentTool = useCallback((agentId: string, tool: Omit<ToolItem, 'id'>) => {
    updateAgentState(agentId, s => ({
      ...s,
      toolLibrary: [...s.toolLibrary, { ...tool, id: generateId('tool') }],
    }));
  }, [updateAgentState]);

  const updateAgentTool = useCallback((agentId: string, id: string, updates: Partial<ToolItem>) => {
    updateAgentState(agentId, s => ({
      ...s,
      toolLibrary: s.toolLibrary.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, [updateAgentState]);

  const removeAgentTool = useCallback((agentId: string, id: string) => {
    updateAgentState(agentId, s => ({
      ...s,
      toolLibrary: s.toolLibrary.filter(t => t.id !== id),
    }));
  }, [updateAgentState]);

  // ── Agent-scoped Test Scenarios ──

  const addTestScenario = useCallback((agentId: string, scenario: Omit<TestScenario, 'id'>) => {
    updateAgentState(agentId, s => ({
      ...s,
      testScenarios: [...s.testScenarios, { ...scenario, id: generateId('scenario'), agentId }],
    }));
  }, [updateAgentState]);

  const updateTestScenario = useCallback((agentId: string, id: string, updates: Partial<TestScenario>) => {
    updateAgentState(agentId, s => ({
      ...s,
      testScenarios: s.testScenarios.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, [updateAgentState]);

  const removeTestScenario = useCallback((agentId: string, id: string) => {
    updateAgentState(agentId, s => ({
      ...s,
      testScenarios: s.testScenarios.filter(t => t.id !== id),
    }));
  }, [updateAgentState]);

  // ── Agent-scoped Conversation Logs ──

  const addConversationLog = useCallback((agentId: string, log: Omit<ConversationLog, 'id'>) => {
    updateAgentState(agentId, s => ({
      ...s,
      conversationLogs: [{ ...log, id: generateId('log'), agentId }, ...s.conversationLogs],
    }));
  }, [updateAgentState]);

  const removeConversationLog = useCallback((agentId: string, id: string) => {
    updateAgentState(agentId, s => ({
      ...s,
      conversationLogs: s.conversationLogs.filter(l => l.id !== id),
    }));
  }, [updateAgentState]);

  const clearConversationLogs = useCallback((agentId: string) => {
    updateAgentState(agentId, s => ({ ...s, conversationLogs: [] }));
  }, [updateAgentState]);

  // ── Computed helpers ──

  const getMergedKnowledge = useCallback((agentId: string): KnowledgeItem[] => {
    const agentState = agents[agentId];
    return [...globalKnowledge, ...(agentState?.knowledgeBase ?? [])];
  }, [agents, globalKnowledge]);

  const getMergedTools = useCallback((agentId: string): ToolItem[] => {
    const agentState = agents[agentId];
    return [...globalTools, ...(agentState?.toolLibrary ?? [])];
  }, [agents, globalTools]);

  const getAllTestScenarios = useCallback((): (TestScenario & { agentName: string })[] => {
    return Object.values(agents).flatMap(s =>
      s.testScenarios.map(t => ({ ...t, agentId: s.agent.id, agentName: s.agent.name }))
    );
  }, [agents]);

  const getAllConversationLogs = useCallback((): (ConversationLog & { agentName: string })[] => {
    return Object.values(agents).flatMap(s =>
      s.conversationLogs.map(l => ({ ...l, agentId: s.agent.id, agentName: s.agent.name }))
    );
  }, [agents]);

  return {
    // Navigation
    appLevel,
    dashboardView,
    agentView,
    activeAgentId,
    setDashboardView,
    setAgentView,
    navigateToDashboard,
    navigateToAgent,

    // Agents
    agents,
    createAgent,
    deleteAgent,
    updateAgent,

    // Global resources
    globalKnowledge,
    addGlobalKnowledgeItem,
    updateGlobalKnowledgeItem,
    removeGlobalKnowledgeItem,
    globalTools,
    addGlobalTool,
    updateGlobalTool,
    removeGlobalTool,

    // Agent-scoped workflow
    addNode,
    updateNode,
    updateNodeConfig,
    deleteNode,
    setNodes,
    addEdge,
    updateEdge,
    deleteEdge,

    // Selection
    selectedNodeId,
    selectedEdgeId,
    selectNode,
    selectEdge,
    clearSelection,

    // Agent-scoped save
    save,
    clearChanges,

    // Agent-scoped knowledge
    addAgentKnowledgeItem,
    updateAgentKnowledgeItem,
    removeAgentKnowledgeItem,

    // Agent-scoped tools
    addAgentTool,
    updateAgentTool,
    removeAgentTool,

    // Agent-scoped scenarios & logs
    addTestScenario,
    updateTestScenario,
    removeTestScenario,
    addConversationLog,
    removeConversationLog,
    clearConversationLogs,

    // Computed helpers
    getMergedKnowledge,
    getMergedTools,
    getAllTestScenarios,
    getAllConversationLogs,
  };
}
