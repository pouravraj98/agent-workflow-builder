import { useState, useRef, useEffect } from 'react';
import {
  Play, Plus, ArrowLeft, Trash2, FlaskConical, Check, X,
  ChevronDown, ChevronRight, MessageSquare, User, Bot,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { TestScenario, ConversationLog } from '@/hooks/useCanvasState';
import { PERSONAS, generateMockConversation, deriveOpeningQuestion } from '@/data/mockData';

type PageView = 'list' | 'create' | 'detail';
type ResultFilter = 'any' | 'passed' | 'failed';

const PERSONA_LABELS: Record<string, string> = {
  default: 'Customer',
  frustrated: 'Customer',
  new_user: 'Driver',
  vip: 'VIP',
  technical: 'Store',
};

interface SimulatePageProps {
  testScenarios: TestScenario[];
  conversationLogs: ConversationLog[];
  onAddScenario: (scenario: Omit<TestScenario, 'id'>) => void;
  onUpdateScenario: (id: string, updates: Partial<TestScenario>) => void;
  onRemoveScenario: (id: string) => void;
  onAddLog: (log: Omit<ConversationLog, 'id'>) => void;
  isGlobalView?: boolean;
  agentName?: string;
  agentMode?: 'chat' | 'voice';
}

export default function SimulatePage({
  testScenarios,
  onAddScenario,
  onUpdateScenario,
  onRemoveScenario,
  isGlobalView,
  agentName,
  agentMode,
}: SimulatePageProps) {
  const isVoice = agentMode === 'voice';
  const [view, setView] = useState<PageView>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resultFilter, setResultFilter] = useState<ResultFilter>('any');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Form state (create view)
  const [formName, setFormName] = useState('');
  const [formScenario, setFormScenario] = useState('');
  const [formCriteria, setFormCriteria] = useState('');
  const [formMaxTurns, setFormMaxTurns] = useState(5);
  const [formPersona, setFormPersona] = useState('default');
  const [formVariables, setFormVariables] = useState<{ key: string; value: string }[]>([]);
  const [showVariables, setShowVariables] = useState(false);

  // Running state
  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Filtered list
  const filtered = testScenarios.filter(s => {
    if (resultFilter === 'any') return true;
    return s.result === resultFilter;
  });

  const passedCount = testScenarios.filter(s => s.result === 'passed').length;
  const failedCount = testScenarios.filter(s => s.result === 'failed').length;

  const selectedSim = selectedId ? testScenarios.find(s => s.id === selectedId) : null;

  // Auto-scroll conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSim?.conversation?.length]);

  const resetForm = () => {
    setFormName('');
    setFormScenario('');
    setFormCriteria('');
    setFormMaxTurns(5);
    setFormPersona('default');
    setFormVariables([]);
    setShowVariables(false);
  };

  const handleCreate = () => {
    onAddScenario({
      name: formName,
      description: '',
      steps: [],
      scenario: formScenario,
      successCriteria: formCriteria,
      maxTurns: formMaxTurns,
      persona: formPersona,
      variables: formVariables.filter(v => v.key.trim()),
      result: null,
      notes: [],
      conversation: [],
      lastRunAt: null,
      createdAt: new Date().toISOString(),
    });
    resetForm();
    setView('list');
  };

  const handleRunSingle = (sim: TestScenario) => {
    const id = sim.id;
    setRunningIds(prev => new Set([...prev, id]));

    setTimeout(() => {
      const { conversation, result } = generateMockConversation(
        sim.scenario || sim.name,
        sim.maxTurns || 5,
      );
      onUpdateScenario(id, {
        conversation,
        result,
        lastRunAt: new Date().toISOString(),
      });
      setRunningIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1200 + Math.random() * 800);
  };

  const handleRunAll = () => {
    const toRun = filtered.filter(s => !runningIds.has(s.id));
    toRun.forEach((sim, i) => {
      setTimeout(() => handleRunSingle(sim), i * 400);
    });
  };

  const handleOpenDetail = (id: string) => {
    setSelectedId(id);
    setView('detail');
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(s => s.id)));
    }
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold">
                {isGlobalView ? 'All Simulations' : agentName ? `Simulations` : 'Simulations'}
              </h1>
              <p className="text-[13px] text-muted-foreground">
                {isGlobalView
                  ? 'Simulations across all agents.'
                  : isVoice
                    ? `Run simulated calls to test ${agentName || 'your agent'} against scenarios.`
                    : `Run simulated conversations to test ${agentName || 'your agent'} against scenarios.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {testScenarios.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[12px] gap-1.5"
                onClick={handleRunAll}
                disabled={runningIds.size > 0}
              >
                <Play className="h-3 w-3" />
                Run all
              </Button>
            )}
            <Button
              size="sm"
              className="h-8 text-[12px] gap-1.5"
              onClick={() => { resetForm(); setView('create'); }}
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
        </div>

        {testScenarios.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <FlaskConical className="h-7 w-7 text-muted-foreground" />
            </div>
            <h4 className="text-[16px] font-semibold mb-1">No simulations yet</h4>
            <p className="text-[13px] text-muted-foreground max-w-[320px] mb-4">
              {isVoice
                ? 'Create simulation tests to verify your agent handles different call scenarios correctly.'
                : 'Create simulation tests to verify your agent handles different scenarios correctly.'}
            </p>
            <Button size="sm" className="h-8 text-[12px] gap-1.5" onClick={() => { resetForm(); setView('create'); }}>
              <Plus className="h-3 w-3" />
              Create simulation
            </Button>
          </div>
        ) : (
          <>
            {/* Filter row */}
            <div className="px-8 py-2.5 border-b shrink-0 flex items-center gap-3">
              <Select value={resultFilter} onValueChange={(v) => setResultFilter(v as ResultFilter)}>
                <SelectTrigger className="w-[180px] h-8 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Result is any</SelectItem>
                  <SelectItem value="passed">Passed ({passedCount})</SelectItem>
                  <SelectItem value="failed">Failed ({failedCount})</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-[12px] text-muted-foreground ml-auto">
                {filtered.length} simulation{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-[11px] text-muted-foreground uppercase tracking-wider">
                    <th className="pl-6 pr-2 py-3 w-10 text-left font-medium">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                        onChange={handleSelectAll}
                        className="h-3.5 w-3.5 rounded border-border"
                      />
                    </th>
                    <th className="px-3 py-3 text-left font-medium">Opening question</th>
                    <th className="px-3 py-3 text-left font-medium w-[120px]">Testing as</th>
                    <th className="px-3 py-3 text-left font-medium w-[100px]">Result</th>
                    <th className="px-3 py-3 text-left font-medium pr-6 w-[80px]">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(sim => {
                    const isRunning = runningIds.has(sim.id);
                    const personaLabel = PERSONA_LABELS[sim.persona || 'default'] || sim.persona || 'Customer';

                    return (
                      <tr
                        key={sim.id}
                        className="border-b hover:bg-accent/30 transition-colors cursor-pointer group"
                        onClick={() => handleOpenDetail(sim.id)}
                      >
                        <td className="pl-6 pr-2 py-3" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(sim.id)}
                            onChange={() => handleToggleSelect(sim.id)}
                            className="h-3.5 w-3.5 rounded border-border"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-[13px] font-medium text-foreground">
                            {sim.name || deriveOpeningQuestion(sim.scenario || '')}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                            <User className="h-3 w-3" />
                            {personaLabel}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {isRunning ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Running
                            </div>
                          ) : sim.result === 'passed' ? (
                            <Badge className="text-[11px] px-2 h-5 font-medium border-0" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
                              <Check className="h-3 w-3 mr-0.5" />
                              Passed
                            </Badge>
                          ) : sim.result === 'failed' ? (
                            <Badge className="text-[11px] px-2 h-5 font-medium border-0" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
                              <X className="h-3 w-3 mr-0.5" />
                              Failed
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Not run</span>
                          )}
                        </td>
                        <td className="px-3 py-3 pr-6">
                          {(sim.notes?.length || 0) > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-medium">
                              {sim.notes!.length}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Create View ──
  if (view === 'create') {
    const canCreate = formName.trim() && formScenario.trim();

    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Two-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Form */}
          <div className="flex-1 border-r flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="max-w-lg space-y-5">
                <div>
                  <Label className="text-[13px] font-semibold mb-1.5 block">Test name</Label>
                  <Input
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Your test name"
                    className="text-[13px]"
                  />
                </div>

                <div>
                  <Label className="text-[13px] font-semibold mb-1.5 block">
                    {isVoice ? 'Describe simulated caller scenario' : 'Describe simulated user scenario'}
                  </Label>
                  <Textarea
                    value={formScenario}
                    onChange={e => setFormScenario(e.target.value)}
                    placeholder={isVoice
                      ? "Describe how the caller will interact with the agent. We will use your instructions to generate a realistic call scenario.\nExample: A customer calls to reschedule their appointment and is in a noisy environment."
                      : "Describe how the user will interact with the agent. We will use your instructions to generate a realistic conversation scenario.\nExample: A tourist struggling with English as his foreign language is trying to make an order at a restaurant."}
                    rows={4}
                    className="text-[13px] resize-none"
                  />
                </div>

                <div>
                  <Label className="text-[13px] font-semibold mb-1.5 block">Describe success criteria</Label>
                  <Textarea
                    value={formCriteria}
                    onChange={e => setFormCriteria(e.target.value)}
                    placeholder="Describe successful outcome of the simulation. This will be used to evaluate if the agent passed the test, or not."
                    rows={3}
                    className="text-[13px] resize-none"
                  />
                </div>

                <div>
                  <Label className="text-[13px] font-semibold mb-1.5 block">Maximum conversation turns</Label>
                  <Input
                    type="number"
                    value={formMaxTurns}
                    onChange={e => setFormMaxTurns(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={20}
                    className="text-[13px] w-24"
                  />
                </div>

                <div>
                  <Label className="text-[13px] font-semibold mb-1.5 block">Persona</Label>
                  <Select value={formPersona} onValueChange={setFormPersona}>
                    <SelectTrigger className="w-[200px] text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONAS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic variables */}
                <div>
                  <button
                    onClick={() => setShowVariables(!showVariables)}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {showVariables ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    Dynamic variables
                    <span className="text-[11px] text-muted-foreground font-normal">(optional)</span>
                  </button>
                  {showVariables && (
                    <div className="mt-2 space-y-2">
                      <p className="text-[11px] text-muted-foreground">
                        Dynamic variables will be replaced with these placeholder values when running this test.
                      </p>
                      {formVariables.map((v, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={v.key}
                            onChange={e => {
                              const updated = [...formVariables];
                              updated[i] = { ...updated[i], key: e.target.value };
                              setFormVariables(updated);
                            }}
                            placeholder="Variable name"
                            className="text-[12px] flex-1"
                          />
                          <Input
                            value={v.value}
                            onChange={e => {
                              const updated = [...formVariables];
                              updated[i] = { ...updated[i], value: e.target.value };
                              setFormVariables(updated);
                            }}
                            placeholder="Value"
                            className="text-[12px] flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => setFormVariables(formVariables.filter((_, j) => j !== i))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-[12px]"
                        onClick={() => setFormVariables([...formVariables, { key: '', value: '' }])}
                      >
                        Add New
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="px-8 py-3 border-t shrink-0 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[12px] gap-1.5"
                onClick={() => { resetForm(); setView('list'); }}
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </Button>
              <Button
                size="sm"
                className="h-8 text-[12px]"
                disabled={!canCreate}
                onClick={handleCreate}
              >
                Create
              </Button>
            </div>
          </div>

          {/* Right: Conversation preview (empty state) */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-muted/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <MessageSquare className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-[13px] text-muted-foreground max-w-[320px] leading-relaxed">
              {isVoice
                ? 'A simulated caller will interact with your agent based on the scenario you described. The call will be evaluated against your success criteria and visible to you.'
                : 'A simulated user will interact with your agent based on the scenario you described. The conversation will be evaluated against your success criteria and visible to you.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Detail View ──
  if (view === 'detail' && selectedSim) {
    const isRunning = runningIds.has(selectedSim.id);
    const conversation = selectedSim.conversation || [];

    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Two-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Form */}
          <div className="flex-1 border-r flex flex-col overflow-hidden">
            {/* Detail header */}
            <div className="px-8 py-4 border-b shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 shrink-0"
                  onClick={() => { setSelectedId(null); setView('list'); }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[15px] font-semibold truncate">{selectedSim.name}</span>
                {selectedSim.result === 'passed' && (
                  <Badge className="text-[10px] px-2 h-5 font-medium border-0 shrink-0" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
                    <Check className="h-3 w-3 mr-0.5" />Passed
                  </Badge>
                )}
                {selectedSim.result === 'failed' && (
                  <Badge className="text-[10px] px-2 h-5 font-medium border-0 shrink-0" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
                    <X className="h-3 w-3 mr-0.5" />Failed
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[12px] gap-1.5"
                  onClick={() => handleRunSingle(selectedSim)}
                  disabled={isRunning}
                >
                  {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                  {isRunning ? 'Running...' : 'Run'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => { onRemoveScenario(selectedSim.id); setSelectedId(null); setView('list'); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Editable form */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="max-w-lg space-y-5">
                <div>
                  <Label className="text-[13px] font-semibold mb-1.5 block">Test name</Label>
                  <Input
                    value={selectedSim.name}
                    onChange={e => onUpdateScenario(selectedSim.id, { name: e.target.value })}
                    className="text-[13px]"
                  />
                </div>

                <div>
                  <Label className="text-[13px] font-semibold mb-1.5 block">Describe simulated user scenario</Label>
                  <Textarea
                    value={selectedSim.scenario || ''}
                    onChange={e => onUpdateScenario(selectedSim.id, { scenario: e.target.value })}
                    placeholder="Describe how the user will interact with the agent..."
                    rows={4}
                    className="text-[13px] resize-none"
                  />
                </div>

                <div>
                  <Label className="text-[13px] font-semibold mb-1.5 block">Describe success criteria</Label>
                  <Textarea
                    value={selectedSim.successCriteria || ''}
                    onChange={e => onUpdateScenario(selectedSim.id, { successCriteria: e.target.value })}
                    placeholder="Describe successful outcome of the simulation..."
                    rows={3}
                    className="text-[13px] resize-none"
                  />
                </div>

                <div>
                  <Label className="text-[13px] font-semibold mb-1.5 block">Maximum conversation turns</Label>
                  <Input
                    type="number"
                    value={selectedSim.maxTurns || 5}
                    onChange={e => onUpdateScenario(selectedSim.id, { maxTurns: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })}
                    min={1}
                    max={20}
                    className="text-[13px] w-24"
                  />
                </div>

                <div>
                  <Label className="text-[13px] font-semibold mb-1.5 block">Persona</Label>
                  <Select
                    value={selectedSim.persona || 'default'}
                    onValueChange={v => onUpdateScenario(selectedSim.id, { persona: v })}
                  >
                    <SelectTrigger className="w-[200px] text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONAS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic variables */}
                <DetailVariables sim={selectedSim} onUpdate={onUpdateScenario} />

                {/* Notes */}
                {(selectedSim.notes?.length || 0) > 0 && (
                  <div>
                    <Label className="text-[13px] font-semibold mb-1.5 block">Notes</Label>
                    <div className="space-y-1">
                      {selectedSim.notes!.map((note, i) => (
                        <div key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                          <span className="text-amber-500 mt-0.5">-</span>
                          <span>{note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Conversation */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {conversation.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center px-8 bg-muted/20">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                  <MessageSquare className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-[13px] text-muted-foreground max-w-[320px] leading-relaxed">
                  {isRunning
                    ? 'Running simulation...'
                    : isVoice
                      ? 'Click "Run" to simulate a call based on the scenario. The call transcript will appear here.'
                      : 'Click "Run" to simulate a conversation based on the scenario. The conversation will appear here.'
                  }
                </p>
                {isRunning && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-3" />}
              </div>
            ) : (
              <>
                <div className="px-6 py-3 border-b shrink-0 flex items-center justify-between">
                  <span className="text-[12px] font-medium text-muted-foreground">
                    Conversation ({conversation.length} messages)
                  </span>
                  {selectedSim.lastRunAt && (
                    <span className="text-[11px] text-muted-foreground">
                      Last run: {new Date(selectedSim.lastRunAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <div className="space-y-3">
                    {conversation.map((msg, i) => (
                      <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'agent' && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                        <div className={msg.role === 'user' ? 'max-w-[85%]' : 'max-w-[85%]'}>
                          <div
                            className={`rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted text-foreground rounded-bl-md'
                            }`}
                          >
                            {msg.content}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {msg.role === 'user' && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={conversationEndRef} />

                    {/* Result indicator */}
                    {selectedSim.result && (
                      <div className="flex items-center justify-center py-2">
                        <div
                          className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-medium"
                          style={{
                            backgroundColor: selectedSim.result === 'passed' ? '#f0fdf4' : '#fef2f2',
                            color: selectedSim.result === 'passed' ? '#22c55e' : '#ef4444',
                          }}
                        >
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: selectedSim.result === 'passed' ? '#22c55e' : '#ef4444' }}
                          />
                          {selectedSim.result === 'passed' ? 'Passed' : 'Failed'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback (shouldn't reach)
  return null;
}

// ── Sub-component: Dynamic Variables in Detail View ──

function DetailVariables({
  sim,
  onUpdate,
}: {
  sim: TestScenario;
  onUpdate: (id: string, updates: Partial<TestScenario>) => void;
}) {
  const [open, setOpen] = useState((sim.variables?.length || 0) > 0);
  const vars = sim.variables || [];

  const handleAdd = () => {
    onUpdate(sim.id, { variables: [...vars, { key: '', value: '' }] });
  };

  const handleChange = (i: number, field: 'key' | 'value', val: string) => {
    const updated = [...vars];
    updated[i] = { ...updated[i], [field]: val };
    onUpdate(sim.id, { variables: updated });
  };

  const handleRemove = (i: number) => {
    onUpdate(sim.id, { variables: vars.filter((_, j) => j !== i) });
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground hover:text-primary transition-colors"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        Dynamic variables
        <span className="text-[11px] text-muted-foreground font-normal">(optional)</span>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Dynamic variables will be replaced with these placeholder values when running this test.
          </p>
          {vars.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={v.key}
                onChange={e => handleChange(i, 'key', e.target.value)}
                placeholder="Variable name"
                className="text-[12px] flex-1"
              />
              <Input
                value={v.value}
                onChange={e => handleChange(i, 'value', e.target.value)}
                placeholder="Value"
                className="text-[12px] flex-1"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(i)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-[12px]"
            onClick={handleAdd}
          >
            Add New
          </Button>
        </div>
      )}
    </div>
  );
}
