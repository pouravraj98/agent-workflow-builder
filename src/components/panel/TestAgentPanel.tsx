import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, RotateCcw, User, Bot, Bug, ChevronDown, ChevronRight,
  Plus, Play, Trash2, FlaskConical, Save, Check, X, ArrowLeft,
  Zap, BookOpen, Hash, Clock, Mic, MicOff, Volume2, Square, Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TestScenario, ConversationLog } from '@/hooks/useCanvasState';
import { PERSONAS, getMockResponse, getRandomTranscription, type MockDebugTrace } from '@/data/mockData';
import CreateSimulationDialog from './CreateSimulationDialog';
import VoiceCallPanel from './VoiceCallPanel';

// ── Types ──

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  debug?: MockDebugTrace;
  isVoice?: boolean;
}

type ScenarioResult = 'pass' | 'fail' | null;

interface ScenarioRunState {
  lastRun: Date | null;
  results: ScenarioResult[]; // per-step results
}

// ── Props ──

interface TestAgentPanelProps {
  testScenarios: TestScenario[];
  conversationLogs: ConversationLog[];
  onAddScenario: (scenario: Omit<TestScenario, 'id'>) => void;
  onUpdateScenario: (id: string, updates: Partial<TestScenario>) => void;
  onRemoveScenario: (id: string) => void;
  onAddLog: (log: Omit<ConversationLog, 'id'>) => void;
  agentMode?: 'chat' | 'voice';
  agentName?: string;
  agentColor?: string;
}

// ── Component ──

export default function TestAgentPanel({
  testScenarios,
  conversationLogs,
  onAddScenario,
  onUpdateScenario,
  onRemoveScenario,
  onAddLog,
  agentMode = 'chat',
  agentName = 'Agent',
  agentColor = '#3b82f6',
}: TestAgentPanelProps) {
  const [subTab, setSubTab] = useState<'chat' | 'scenarios' | 'voice'>(agentMode === 'voice' ? 'voice' : 'chat');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [persona, setPersona] = useState('default');
  const [expandedDebug, setExpandedDebug] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval>>();

  // Scenario state
  const [scenarioRuns, setScenarioRuns] = useState<Record<string, ScenarioRunState>>({});
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [editingScenario, setEditingScenario] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Chat handlers ──

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const { response, debug } = getMockResponse(text);
      const agentMsg: Message = {
        id: `msg_${Date.now()}_agent`,
        role: 'agent',
        content: response,
        timestamp: new Date(),
        debug,
      };
      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleClear = () => {
    setMessages([]);
    setIsTyping(false);
    setExpandedDebug({});
  };

  const handleSaveToLogs = () => {
    if (messages.length === 0) return;
    onAddLog({
      timestamp: new Date().toISOString(),
      persona: PERSONAS.find(p => p.value === persona)?.label || persona,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
        debug: m.debug ? { node: m.debug.node, edge: '', tools: m.debug.tools, guardrails: [] } : undefined,
      })),
    });
  };

  // ── Voice handlers ──

  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    recordingTimerRef.current = setInterval(() => setRecordingDuration(d => d + 1), 1000);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setRecordingDuration(0);
    clearInterval(recordingTimerRef.current);
  };

  const stopAndTranscribe = () => {
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingDuration(0);

    const transcribed = getRandomTranscription();
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: transcribed,
      timestamp: new Date(),
      isVoice: true,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const { response, debug } = getMockResponse(transcribed);
      const agentMsg: Message = {
        id: `msg_${Date.now()}_agent`,
        role: 'agent',
        content: response,
        timestamp: new Date(),
        debug,
      };
      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handlePlayTTS = (msgId: string) => {
    if (playingMessageId === msgId) {
      setPlayingMessageId(null);
      return;
    }
    setPlayingMessageId(msgId);
    setTimeout(() => setPlayingMessageId(null), 2000 + Math.random() * 2000);
  };

  // ── Scenario handlers ──

  const handleRunScenario = (scenario: TestScenario) => {
    // Mock: randomly assign pass/fail to each step
    const results: ScenarioResult[] = scenario.steps.map(() =>
      Math.random() > 0.25 ? 'pass' : 'fail'
    );
    setScenarioRuns(prev => ({
      ...prev,
      [scenario.id]: { lastRun: new Date(), results },
    }));
  };

  const handleRunAll = () => {
    setIsRunningAll(true);
    // Stagger scenario runs
    testScenarios.forEach((s, i) => {
      setTimeout(() => {
        handleRunScenario(s);
        if (i === testScenarios.length - 1) setIsRunningAll(false);
      }, (i + 1) * 400);
    });
  };

  const getOverallStatus = (scenarioId: string): 'pass' | 'fail' | 'not_run' => {
    const run = scenarioRuns[scenarioId];
    if (!run?.results.length) return 'not_run';
    return run.results.every(r => r === 'pass') ? 'pass' : 'fail';
  };

  const STATUS_CONFIG = {
    pass: { label: 'Pass', color: '#22c55e', bg: '#f0fdf4' },
    fail: { label: 'Fail', color: '#ef4444', bg: '#fef2f2' },
    not_run: { label: 'Not run', color: '#9ca3af', bg: '#f9fafb' },
  };

  // ── Sub-tab tabs ──

  const subTabs: { id: 'chat' | 'scenarios' | 'voice'; label: string; icon: typeof MessageSquare }[] = agentMode === 'voice'
    ? [
        { id: 'voice', label: 'Voice', icon: Phone },
        { id: 'scenarios', label: 'Scenarios', icon: FlaskConical },
      ]
    : [
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'scenarios', label: 'Scenarios', icon: FlaskConical },
      ];

  return (
    <div className="flex h-full flex-col">
      {/* Sub-tab switcher */}
      <div className="px-4 py-2.5 border-b shrink-0">
        <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  subTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3 w-3" />
                {tab.label}
                {tab.id === 'scenarios' && testScenarios.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[9px] ml-0.5">{testScenarios.length}</Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat ── */}
      {subTab === 'chat' && (
        <>
          {/* Persona + actions */}
          <div className="px-4 py-2 border-b shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground shrink-0">Persona:</span>
              <Select value={persona} onValueChange={setPersona}>
                <SelectTrigger className="h-6 text-[11px] flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERSONAS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-0.5">
                <Button
                  variant={debugMode ? 'secondary' : 'ghost'}
                  size="icon-sm"
                  onClick={() => setDebugMode(!debugMode)}
                  className={`h-6 w-6 ${debugMode ? 'text-orange-600 bg-orange-50' : 'text-muted-foreground'}`}
                  aria-label="Toggle debug"
                >
                  <Bug className="h-3 w-3" />
                </Button>
                {messages.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleSaveToLogs}
                      className="h-6 w-6 text-muted-foreground"
                      aria-label="Save to logs"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleClear}
                      className="h-6 w-6 text-muted-foreground"
                      aria-label="Clear chat"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="text-[14px] font-semibold mb-1">Test your agent</h4>
                <p className="text-[12px] text-muted-foreground max-w-[220px]">
                  Send a message to simulate a conversation with your agent workflow.
                </p>
                {debugMode && (
                  <Badge variant="outline" className="mt-3 text-[10px] text-orange-600 border-orange-200 gap-1">
                    <Bug className="h-3 w-3" /> Debug mode ON
                  </Badge>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    <div className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'agent' && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                          <Bot className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      <div className={msg.role === 'user' ? 'max-w-[240px]' : 'max-w-[280px]'}>
                        <div
                          className={`rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted text-foreground rounded-bl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-0.5 px-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.role === 'user' && msg.isVoice && (
                            <Mic className="h-2.5 w-2.5" />
                          )}
                          {msg.role === 'agent' && (
                            <button
                              onClick={() => handlePlayTTS(msg.id)}
                              className={`inline-flex items-center transition-colors ${
                                playingMessageId === msg.id ? 'text-primary' : 'hover:text-foreground'
                              }`}
                            >
                              {playingMessageId === msg.id ? (
                                <Volume2 className="h-2.5 w-2.5 animate-pulse" />
                              ) : (
                                <Volume2 className="h-2.5 w-2.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Debug trace */}
                    {debugMode && msg.role === 'agent' && msg.debug && (
                      <div className="ml-8 mt-1">
                        <button
                          className="flex items-center gap-1 text-[10px] text-orange-600 hover:text-orange-700"
                          onClick={() => setExpandedDebug(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                        >
                          {expandedDebug[msg.id] ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                          <Bug className="h-2.5 w-2.5" /> Trace
                        </button>
                        {expandedDebug[msg.id] && (
                          <div className="mt-1 rounded-lg bg-orange-50 border border-orange-200 p-2.5 text-[10px] space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-orange-700">Node:</span>
                              <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">{msg.debug.node}</Badge>
                            </div>
                            {msg.debug.tools.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Zap className="h-2.5 w-2.5 text-orange-500" />
                                <span className="font-medium text-orange-700">Tools:</span>
                                <span>{msg.debug.tools.join(', ')}</span>
                              </div>
                            )}
                            {msg.debug.knowledgeSources.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="h-2.5 w-2.5 text-orange-500" />
                                <span className="font-medium text-orange-700">KB:</span>
                                <span>{msg.debug.knowledgeSources.join(', ')}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3 pt-1 border-t border-orange-200">
                              <div className="flex items-center gap-1">
                                <Hash className="h-2.5 w-2.5 text-orange-400" />
                                <span className="text-orange-600">{msg.debug.tokens} tokens</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5 text-orange-400" />
                                <span className="text-orange-600">{msg.debug.latency}s</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <div className="bg-muted rounded-xl rounded-bl-sm px-3 py-2">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t px-4 py-3">
            {isRecording ? (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
                <Button variant="ghost" size="icon-sm" onClick={cancelRecording} className="h-7 w-7 shrink-0 text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                </Button>
                <div className="flex items-center gap-2 flex-1">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-[12px] font-mono text-destructive">
                    0:{recordingDuration.toString().padStart(2, '0')}
                  </span>
                </div>
                <Button size="icon-sm" onClick={stopAndTranscribe} className="h-7 w-7 shrink-0 bg-destructive hover:bg-destructive/90">
                  <Square className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {agentMode === 'voice' && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={startRecording}
                    disabled={isTyping}
                    className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Mic className="h-3.5 w-3.5" />
                  </Button>
                )}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  disabled={isTyping}
                />
                <Button size="icon-sm" onClick={handleSend} disabled={!input.trim() || isTyping} className="shrink-0 h-8 w-8">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Scenarios ── */}
      {subTab === 'scenarios' && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Expanded scenario detail */}
          {expandedScenario && (() => {
            const scenario = testScenarios.find(s => s.id === expandedScenario);
            if (!scenario) return null;
            const run = scenarioRuns[scenario.id];
            const status = getOverallStatus(scenario.id);
            const cfg = STATUS_CONFIG[status];
            const isEditing = editingScenario === scenario.id;

            return (
              <div className="flex flex-col h-full">
                {/* Detail header */}
                <div className="px-4 py-3 border-b shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => { setExpandedScenario(null); setEditingScenario(null); }}
                      className="flex items-center text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[14px] font-semibold flex-1 truncate">{scenario.name}</span>
                    <Badge
                      className="text-[9px] px-1.5 h-4 font-medium border-0"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </Badge>
                  </div>
                  {scenario.description && (
                    <p className="text-[11px] text-muted-foreground ml-5.5">{scenario.description}</p>
                  )}
                  {run?.lastRun && (
                    <p className="text-[10px] text-muted-foreground ml-5.5 mt-0.5">
                      Last run: {run.lastRun.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                {/* Steps */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  <div className="space-y-2.5">
                    {scenario.steps.map((step, i) => {
                      const stepResult = run?.results[i] ?? null;
                      return (
                        <div key={i} className="rounded-lg border p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-muted-foreground">Step {i + 1}</span>
                            {stepResult && (
                              <div className="flex items-center gap-1">
                                {stepResult === 'pass' ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500" />
                                )}
                                <span className={`text-[9px] font-medium ${stepResult === 'pass' ? 'text-green-600' : 'text-red-500'}`}>
                                  {stepResult === 'pass' ? 'Matched' : 'Failed'}
                                </span>
                              </div>
                            )}
                          </div>

                          {isEditing ? (
                            <>
                              <Input
                                value={step.userMessage}
                                onChange={(e) => {
                                  const steps = [...scenario.steps];
                                  steps[i] = { ...step, userMessage: e.target.value };
                                  onUpdateScenario(scenario.id, { steps });
                                }}
                                placeholder="User message..."
                                className="h-7 text-[11px]"
                              />
                              <Input
                                value={step.expectedBehavior}
                                onChange={(e) => {
                                  const steps = [...scenario.steps];
                                  steps[i] = { ...step, expectedBehavior: e.target.value };
                                  onUpdateScenario(scenario.id, { steps });
                                }}
                                placeholder="Expected behavior..."
                                className="h-7 text-[11px]"
                              />
                              {scenario.steps.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 text-[9px] text-destructive hover:text-destructive px-1.5 gap-1"
                                  onClick={() => {
                                    const steps = scenario.steps.filter((_, j) => j !== i);
                                    onUpdateScenario(scenario.id, { steps });
                                  }}
                                >
                                  <Trash2 className="h-2.5 w-2.5" /> Remove
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="flex items-start gap-2">
                                <User className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="text-[12px]">{step.userMessage || <span className="text-muted-foreground italic">No message</span>}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Bot className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                                <span className="text-[11px] text-muted-foreground">{step.expectedBehavior || <span className="italic">No expected behavior</span>}</span>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-[11px] gap-1"
                        onClick={() => {
                          const steps = [...scenario.steps, { userMessage: '', expectedBehavior: '' }];
                          onUpdateScenario(scenario.id, { steps });
                        }}
                      >
                        <Plus className="h-3 w-3" /> Add Step
                      </Button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-2.5 border-t shrink-0 flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1 flex-1"
                    onClick={() => handleRunScenario(scenario)}
                  >
                    <Play className="h-3 w-3" /> Run
                  </Button>
                  <Button
                    variant={isEditing ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-[11px] gap-1 flex-1"
                    onClick={() => setEditingScenario(isEditing ? null : scenario.id)}
                  >
                    {isEditing ? 'Done' : 'Edit'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1 text-destructive hover:text-destructive"
                    onClick={() => {
                      onRemoveScenario(scenario.id);
                      setExpandedScenario(null);
                      setEditingScenario(null);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })()}

          {/* Scenario list */}
          {!expandedScenario && (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b shrink-0 flex items-center justify-between">
                <span className="text-[12px] font-medium">Test Scenarios</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[11px] gap-1 px-2"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="h-3 w-3" /> New
                </Button>
              </div>

              <CreateSimulationDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onAddScenario={onAddScenario}
              />

              {testScenarios.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
                    <FlaskConical className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="text-[14px] font-semibold mb-1">No test scenarios</h4>
                  <p className="text-[12px] text-muted-foreground max-w-[220px]">
                    Create test scenarios to validate your agent's behavior with predefined conversations.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto divide-y">
                    {testScenarios.map((scenario) => {
                      const status = getOverallStatus(scenario.id);
                      const cfg = STATUS_CONFIG[status];
                      const run = scenarioRuns[scenario.id];

                      return (
                        <button
                          key={scenario.id}
                          className="w-full px-4 py-3 text-left hover:bg-accent/30 transition-colors"
                          onClick={() => setExpandedScenario(scenario.id)}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[13px] font-medium truncate flex-1">{scenario.name}</span>
                            <Badge
                              className="text-[9px] px-1.5 h-4 font-medium border-0 shrink-0 ml-2"
                              style={{ backgroundColor: cfg.bg, color: cfg.color }}
                            >
                              {cfg.label}
                            </Badge>
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                            <span>{scenario.steps.length} step{scenario.steps.length !== 1 ? 's' : ''}</span>
                            <span>&middot;</span>
                            <span>{run?.lastRun ? `Last: ${run.lastRun.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Never run'}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Run All */}
                  <div className="px-4 py-2.5 border-t shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-[12px] gap-1.5"
                      disabled={isRunningAll || testScenarios.length === 0}
                      onClick={handleRunAll}
                    >
                      <Play className="h-3 w-3" />
                      {isRunningAll ? 'Running...' : 'Run All'}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
      {/* ── Voice Call ── */}
      {subTab === 'voice' && (
        <div className="flex-1 overflow-hidden">
          <VoiceCallPanel agentName={agentName} agentColor={agentColor} />
        </div>
      )}
    </div>
  );
}
