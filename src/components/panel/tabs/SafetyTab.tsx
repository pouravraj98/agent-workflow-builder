import { useState } from 'react';
import { BookOpen, Tag, ArrowUpRight, Plus, X, Shield, Eye, ShieldAlert, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface Guideline {
  id: string;
  title: string;
  instruction: string;
  category: 'behavior' | 'communication' | 'content';
  enabled: boolean;
}

interface TopicControl {
  id: string;
  name: string;
  status: 'allowed' | 'blocked';
}

interface EscalationRule {
  id: string;
  condition: string;
  action: 'escalate_immediately' | 'offer_escalation' | 'ask_followup';
  targetType: 'human' | 'agent' | 'phone';
  target: string;
  enabled: boolean;
}

const CATEGORY_CONFIG = {
  behavior: { label: 'Behavior', color: '#6366f1', bg: '#eef2ff' },
  communication: { label: 'Communication', color: '#3b82f6', bg: '#eff6ff' },
  content: { label: 'Content', color: '#f59e0b', bg: '#fffbeb' },
} as const;

const PRESET_TOPICS = ['Billing', 'Support', 'Product', 'Technical', 'Account', 'Pricing', 'Refunds', 'Security'];

const ACTION_LABELS: Record<string, string> = {
  escalate_immediately: 'Escalate immediately',
  offer_escalation: 'Offer escalation',
  ask_followup: 'Ask follow-up first',
};

const PII_FIELDS = [
  { key: 'piiRedactNames', label: 'Names' },
  { key: 'piiRedactSSN', label: 'SSN / National ID' },
  { key: 'piiRedactCreditCard', label: 'Credit card numbers' },
  { key: 'piiRedactPhone', label: 'Phone numbers' },
  { key: 'piiRedactEmail', label: 'Email addresses' },
  { key: 'piiRedactAddress', label: 'Physical addresses' },
  { key: 'piiRedactDOB', label: 'Date of birth' },
] as const;

interface SafetyTabProps {
  config: Record<string, any>;
  onUpdateConfig: (updates: Record<string, any>) => void;
  agentMode?: 'chat' | 'voice';
}

export default function SafetyTab({ config, onUpdateConfig, agentMode }: SafetyTabProps) {
  const isVoice = agentMode === 'voice';
  const guidelines: Guideline[] = config.guidelines || [];
  const topicControls: TopicControl[] = config.topicControls || [];
  const escalationRules: EscalationRule[] = config.escalationRules || [];

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'behavior' | 'communication' | 'content'>('all');
  const [customTopic, setCustomTopic] = useState('');

  const filteredGuidelines = categoryFilter === 'all'
    ? guidelines
    : guidelines.filter(g => g.category === categoryFilter);

  const existingTopicNames = new Set(topicControls.map(t => t.name.toLowerCase()));

  // --- Guidelines ---
  const addGuideline = () => {
    const category = categoryFilter === 'all' ? 'behavior' : categoryFilter;
    const newGuideline: Guideline = {
      id: generateId('guide'),
      title: '',
      instruction: '',
      category,
      enabled: true,
    };
    onUpdateConfig({ guidelines: [...guidelines, newGuideline] });
  };

  const updateGuideline = (id: string, updates: Partial<Guideline>) => {
    onUpdateConfig({
      guidelines: guidelines.map(g => g.id === id ? { ...g, ...updates } : g),
    });
  };

  const removeGuideline = (id: string) => {
    onUpdateConfig({ guidelines: guidelines.filter(g => g.id !== id) });
  };

  // --- Topic Controls ---
  const addTopic = (name: string, status: 'allowed' | 'blocked' = 'allowed') => {
    if (!name.trim() || existingTopicNames.has(name.trim().toLowerCase())) return;
    const newTopic: TopicControl = {
      id: generateId('topic'),
      name: name.trim(),
      status,
    };
    onUpdateConfig({ topicControls: [...topicControls, newTopic] });
  };

  const toggleTopic = (id: string) => {
    onUpdateConfig({
      topicControls: topicControls.map(t =>
        t.id === id ? { ...t, status: t.status === 'allowed' ? 'blocked' : 'allowed' } : t
      ),
    });
  };

  const removeTopic = (id: string) => {
    onUpdateConfig({ topicControls: topicControls.filter(t => t.id !== id) });
  };

  // --- Escalation ---
  const addEscalationRule = () => {
    const newRule: EscalationRule = {
      id: generateId('esc'),
      condition: '',
      action: 'escalate_immediately',
      targetType: 'human',
      target: '',
      enabled: true,
    };
    onUpdateConfig({ escalationRules: [...escalationRules, newRule] });
  };

  const updateEscalationRule = (id: string, updates: Partial<EscalationRule>) => {
    onUpdateConfig({
      escalationRules: escalationRules.map(r => r.id === id ? { ...r, ...updates } : r),
    });
  };

  const removeEscalationRule = (id: string) => {
    onUpdateConfig({ escalationRules: escalationRules.filter(r => r.id !== id) });
  };

  // Voice config values
  const piiRedactionEnabled = config.piiRedactionEnabled ?? false;
  const recordingConsentMode = config.recordingConsentMode ?? 'none';
  const consentMessage = config.consentMessage ?? '';
  const aiDisclosureEnabled = config.aiDisclosureEnabled ?? true;
  const aiDisclosureMessage = config.aiDisclosureMessage ?? '';
  const hipaaMode = config.hipaaMode ?? false;
  const profanityFilterEnabled = config.profanityFilterEnabled ?? false;
  const profanityFilterStrength = config.profanityFilterStrength ?? 'medium';
  const sentimentEscalationEnabled = config.sentimentEscalationEnabled ?? false;
  const sentimentThreshold = config.sentimentThreshold ?? 0.7;
  const maxConsecutiveFailures = config.maxConsecutiveFailures ?? 3;
  const failureAction = config.failureAction ?? 'escalate';

  return (
    <div className="space-y-6">
      {/* Guidelines */}
      <div>
        <div className="section-label mb-1 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          Guidelines
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Natural language instructions for agent behavior
        </p>

        {/* Category filter */}
        <div className="flex items-center gap-1 mb-3">
          {(['all', 'behavior', 'communication', 'content'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              {cat === 'all' ? 'All' : CATEGORY_CONFIG[cat].label}
            </button>
          ))}
        </div>

        {filteredGuidelines.length === 0 ? (
          <p className="text-[11px] text-muted-foreground py-3 text-center">
            {guidelines.length === 0
              ? 'No guidelines yet. Add instructions to guide agent behavior.'
              : 'No guidelines in this category.'}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredGuidelines.map((g) => {
              const catConfig = CATEGORY_CONFIG[g.category];
              return (
                <div key={g.id} className="rounded-lg border p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="text-[9px] px-1.5 h-4 font-medium"
                      style={{ backgroundColor: catConfig.bg, color: catConfig.color }}
                    >
                      {catConfig.label}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={g.enabled}
                        onCheckedChange={(checked) => updateGuideline(g.id, { enabled: checked })}
                        className="scale-75"
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeGuideline(g.id)}
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Input
                    value={g.title}
                    onChange={(e) => updateGuideline(g.id, { title: e.target.value })}
                    placeholder="Guideline title..."
                    className={`h-6 text-[12px] font-medium border-0 px-0 shadow-none focus-visible:ring-0 ${!g.enabled ? 'opacity-50' : ''}`}
                  />
                  <Textarea
                    value={g.instruction}
                    onChange={(e) => updateGuideline(g.id, { instruction: e.target.value })}
                    placeholder="Write your instruction, e.g. 'Never discuss competitor pricing. If asked, redirect to our features and advantages.'"
                    rows={2}
                    className={`text-[11px] min-h-[44px] resize-y ${!g.enabled ? 'opacity-50' : ''}`}
                  />
                </div>
              );
            })}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 mt-2"
          onClick={addGuideline}
        >
          <Plus className="h-3 w-3" /> Add Guideline
        </Button>
      </div>

      {/* Topic Controls */}
      <div>
        <div className="section-label mb-1 flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" />
          Topic Controls
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Define which topics the agent can discuss
        </p>

        {topicControls.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {topicControls.map((topic) => (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`group inline-flex items-center gap-1.5 rounded-full pl-2 pr-1 py-0.5 text-[11px] font-medium border transition-colors ${
                  topic.status === 'allowed'
                    ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300'
                    : 'border-red-200 bg-red-50 text-red-700 hover:border-red-300'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    topic.status === 'allowed' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {topic.name}
                <span
                  onClick={(e) => { e.stopPropagation(); removeTopic(topic.id); }}
                  className="ml-0.5 rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity"
                >
                  <X className="h-2.5 w-2.5" />
                </span>
              </button>
            ))}
          </div>
        )}

        {topicControls.length === 0 && (
          <p className="text-[11px] text-muted-foreground py-2 text-center mb-2">
            No topic controls. Add topics to manage what the agent discusses.
          </p>
        )}

        {/* Preset topics */}
        {PRESET_TOPICS.filter(p => !existingTopicNames.has(p.toLowerCase())).length > 0 && (
          <div className="mb-2.5">
            <Label className="text-[10px] text-muted-foreground mb-1.5 block">Quick add</Label>
            <div className="flex flex-wrap gap-1">
              {PRESET_TOPICS.filter(p => !existingTopicNames.has(p.toLowerCase())).map((preset) => (
                <button
                  key={preset}
                  onClick={() => addTopic(preset)}
                  className="rounded-md border border-dashed px-2 py-0.5 text-[10px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom topic */}
        <div className="flex gap-1.5">
          <Input
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Custom topic..."
            className="h-6 text-[11px] flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customTopic.trim()) {
                addTopic(customTopic);
                setCustomTopic('');
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[10px] px-2 shrink-0"
            disabled={!customTopic.trim() || existingTopicNames.has(customTopic.trim().toLowerCase())}
            onClick={() => { addTopic(customTopic); setCustomTopic(''); }}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Voice-specific: Privacy & Compliance */}
      {isVoice && (
        <>
          <Separator />
          <div>
            <div className="section-label mb-1 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Privacy & Compliance
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Protect sensitive data in calls and transcripts
            </p>

            {/* PII Redaction */}
            <div className="rounded-lg border p-3 space-y-3 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[12px] font-medium">PII Redaction</Label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Mask sensitive data in transcripts & recordings
                  </p>
                </div>
                <Switch
                  checked={piiRedactionEnabled}
                  onCheckedChange={(checked) => onUpdateConfig({ piiRedactionEnabled: checked })}
                />
              </div>
              {piiRedactionEnabled && (
                <div className="space-y-2 pt-1">
                  {PII_FIELDS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">{label}</Label>
                      <Switch
                        checked={config[key] ?? true}
                        onCheckedChange={(checked) => onUpdateConfig({ [key]: checked })}
                        className="scale-90"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recording Consent */}
            <div className="rounded-lg border p-3 space-y-2.5 mb-3">
              <div>
                <Label className="text-[12px] font-medium">Recording Consent</Label>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  How to obtain caller consent before recording
                </p>
              </div>
              <div className="flex gap-1.5">
                {(['none', 'stay-on-line', 'verbal'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onUpdateConfig({ recordingConsentMode: mode })}
                    className={`flex-1 rounded-md border px-2 py-1.5 text-[10px] font-medium transition-colors ${
                      recordingConsentMode === mode
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {mode === 'none' ? 'None' : mode === 'stay-on-line' ? 'Stay on line' : 'Verbal yes/no'}
                  </button>
                ))}
              </div>
              {recordingConsentMode !== 'none' && (
                <Textarea
                  value={consentMessage}
                  onChange={(e) => onUpdateConfig({ consentMessage: e.target.value })}
                  placeholder={recordingConsentMode === 'stay-on-line'
                    ? 'e.g. "This call may be recorded for quality assurance. By staying on the line, you consent to recording."'
                    : 'e.g. "This call may be recorded. Do you consent to being recorded?"'}
                  rows={2}
                  className="text-[11px] min-h-[40px] resize-y"
                />
              )}
            </div>

            {/* AI Disclosure */}
            <div className="rounded-lg border p-3 space-y-2.5 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[12px] font-medium">AI Disclosure</Label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Inform callers they are speaking with an AI
                  </p>
                </div>
                <Switch
                  checked={aiDisclosureEnabled}
                  onCheckedChange={(checked) => onUpdateConfig({ aiDisclosureEnabled: checked })}
                />
              </div>
              {aiDisclosureEnabled && (
                <Textarea
                  value={aiDisclosureMessage}
                  onChange={(e) => onUpdateConfig({ aiDisclosureMessage: e.target.value })}
                  placeholder='e.g. "Hi, you are speaking with an AI assistant. How can I help you today?"'
                  rows={2}
                  className="text-[11px] min-h-[40px] resize-y"
                />
              )}
            </div>

            {/* HIPAA Mode */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[12px] font-medium">HIPAA Mode</Label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    No transcripts, recordings, or logs stored
                  </p>
                </div>
                <Switch
                  checked={hipaaMode}
                  onCheckedChange={(checked) => onUpdateConfig({ hipaaMode: checked })}
                />
              </div>
              {hipaaMode && (
                <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1.5">
                  <p className="text-[10px] text-amber-800">
                    When enabled, call data passes through the pipeline but is not persisted. Ensure all connected providers (LLM, STT, TTS) are also HIPAA-compliant.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Voice-specific: Content Moderation */}
      {isVoice && (
        <>
          <Separator />
          <div>
            <div className="section-label mb-1 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Content Moderation
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Filter harmful content and detect caller distress
            </p>

            {/* Profanity Filter */}
            <div className="rounded-lg border p-3 space-y-2.5 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[12px] font-medium">Profanity Filter</Label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Block or mask profane language in agent responses
                  </p>
                </div>
                <Switch
                  checked={profanityFilterEnabled}
                  onCheckedChange={(checked) => onUpdateConfig({ profanityFilterEnabled: checked })}
                />
              </div>
              {profanityFilterEnabled && (
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1.5 block">Strength</Label>
                  <div className="flex gap-1.5">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => onUpdateConfig({ profanityFilterStrength: level })}
                        className={`flex-1 rounded-md border px-2 py-1.5 text-[10px] font-medium capitalize transition-colors ${
                          profanityFilterStrength === level
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {profanityFilterStrength === 'low' && 'Blocks severe profanity only'}
                    {profanityFilterStrength === 'medium' && 'Blocks most profanity and slurs'}
                    {profanityFilterStrength === 'high' && 'Blocks all profanity, slurs, and mild expletives'}
                  </p>
                </div>
              )}
            </div>

            {/* Sentiment-based Escalation */}
            <div className="rounded-lg border p-3 space-y-2.5 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[12px] font-medium">Sentiment Detection</Label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Detect frustration from tone, pace, and interruptions
                  </p>
                </div>
                <Switch
                  checked={sentimentEscalationEnabled}
                  onCheckedChange={(checked) => onUpdateConfig({ sentimentEscalationEnabled: checked })}
                />
              </div>
              {sentimentEscalationEnabled && (
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-[11px]">Escalation sensitivity</Label>
                      <span className="text-[10px] text-muted-foreground font-mono">{sentimentThreshold.toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[sentimentThreshold]}
                      min={0.3}
                      max={1.0}
                      step={0.1}
                      onValueChange={([val]) => onUpdateConfig({ sentimentThreshold: val })}
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                      <span>More sensitive</span>
                      <span>Less sensitive</span>
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-[10px] text-muted-foreground">
                      Analyzes acoustic signals (tone, pitch, pacing) and conversational patterns (interruptions, repeated complaints) to detect caller frustration.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Failure Handling */}
            <div className="rounded-lg border p-3 space-y-2.5">
              <div>
                <Label className="text-[12px] font-medium">Failure Handling</Label>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  What happens when the agent can't understand or respond
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-[11px]">Max consecutive failures</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">{maxConsecutiveFailures}</span>
                </div>
                <Slider
                  value={[maxConsecutiveFailures]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([val]) => onUpdateConfig({ maxConsecutiveFailures: val })}
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1.5 block">Then...</Label>
                <div className="flex gap-1.5">
                  {([
                    { value: 'escalate', label: 'Escalate to human' },
                    { value: 'end-call', label: 'End call politely' },
                    { value: 'retry', label: 'Rephrase & retry' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onUpdateConfig({ failureAction: opt.value })}
                      className={`flex-1 rounded-md border px-2 py-1.5 text-[10px] font-medium transition-colors ${
                        failureAction === opt.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Escalation */}
      <Separator />
      <div>
        <div className="section-label mb-1 flex items-center gap-1.5">
          <ArrowUpRight className="h-3.5 w-3.5" />
          Escalation
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          {isVoice ? 'Define when to transfer calls or hand off' : 'Define when to hand off conversations'}
        </p>

        {escalationRules.length === 0 ? (
          <p className="text-[11px] text-muted-foreground py-3 text-center">
            No escalation rules. Define when the agent should hand off.
          </p>
        ) : (
          <div className="space-y-2">
            {escalationRules.map((rule) => (
              <div key={rule.id} className="rounded-lg border p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">When...</Label>
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => updateEscalationRule(rule.id, { enabled: checked })}
                      className="scale-75"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeEscalationRule(rule.id)}
                      className="h-5 w-5 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={rule.condition}
                  onChange={(e) => updateEscalationRule(rule.id, { condition: e.target.value })}
                  placeholder={isVoice
                    ? "e.g. 'Caller sounds frustrated or requests a supervisor'"
                    : "e.g. 'Customer mentions legal action or threatens to sue'"}
                  rows={2}
                  className={`text-[11px] min-h-[40px] resize-y ${!rule.enabled ? 'opacity-50' : ''}`}
                />
                <div className={`flex gap-1.5 ${!rule.enabled ? 'opacity-50' : ''}`}>
                  <Select
                    value={rule.action}
                    onValueChange={(val) => updateEscalationRule(rule.id, { action: val as EscalationRule['action'] })}
                  >
                    <SelectTrigger className="h-6 text-[10px] flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ACTION_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={`flex gap-1.5 ${!rule.enabled ? 'opacity-50' : ''}`}>
                  <Select
                    value={rule.targetType}
                    onValueChange={(val) => updateEscalationRule(rule.id, { targetType: val as 'human' | 'agent' | 'phone' })}
                  >
                    <SelectTrigger className="w-[76px] h-6 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="human">Human</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      {isVoice && <SelectItem value="phone">Phone #</SelectItem>}
                    </SelectContent>
                  </Select>
                  <Input
                    value={rule.target}
                    onChange={(e) => updateEscalationRule(rule.id, { target: e.target.value })}
                    placeholder={
                      rule.targetType === 'human' ? 'Queue name...'
                      : rule.targetType === 'agent' ? 'Agent name...'
                      : '+1 (555) 123-4567'
                    }
                    className={`h-6 text-[11px] flex-1 ${!rule.enabled ? 'opacity-50' : ''}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {isVoice && escalationRules.length === 0 && (
          <div className="rounded-md bg-muted/50 p-2 mb-2">
            <p className="text-[10px] text-muted-foreground">
              Tip: Add rules like "Caller requests a supervisor", "Caller mentions legal action", or "3+ failed attempts to resolve" with targets like a human queue or transfer phone number.
            </p>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 mt-2"
          onClick={addEscalationRule}
        >
          <Plus className="h-3 w-3" /> Add Rule
        </Button>
      </div>

    </div>
  );
}
