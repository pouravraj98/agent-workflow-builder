import { useState } from 'react';
import { Braces, FileOutput, ScrollText, Hash, ToggleLeft, List, AudioWaveform, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import ManageVariablesDialog from '@/components/panel/dialogs/ManageVariablesDialog';
import type { Variable } from '@/components/panel/dialogs/ManageVariablesDialog';

const FORMAT_OPTIONS = [
  { value: '',         label: 'Auto',     desc: 'Let the agent decide' },
  { value: 'plain',    label: 'Plain',    desc: 'No formatting' },
  { value: 'markdown', label: 'Markdown', desc: 'Rich text markup' },
  { value: 'json',     label: 'JSON',     desc: 'Structured data' },
];

const TYPE_CONFIG: Record<string, { icon: typeof Braces; color: string; bg: string; label: string }> = {
  string:  { icon: Braces,     color: '#22c55e', bg: '#f0fdf4', label: 'String' },
  number:  { icon: Hash,       color: '#3b82f6', bg: '#eff6ff', label: 'Number' },
  boolean: { icon: ToggleLeft, color: '#f59e0b', bg: '#fffbeb', label: 'Boolean' },
  array:   { icon: List,       color: '#8b5cf6', bg: '#f5f3ff', label: 'Array' },
};

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Normalize legacy variables (old {key, defaultValue, scope}) to new shape */
function normalizeVariables(raw: any[]): Variable[] {
  return (raw || []).map((v: any, i: number) => ({
    id: v.id || `var_legacy_${i}`,
    name: v.name || v.key || '',
    type: v.type || 'string',
    defaultValue: v.defaultValue || '',
    scope: v.scope || 'session',
    description: v.description || '',
  }));
}

interface OutputTabProps {
  config: Record<string, any>;
  onUpdateConfig: (updates: Record<string, any>) => void;
  agentMode?: 'chat' | 'voice';
}

export default function OutputTab({ config, onUpdateConfig, agentMode }: OutputTabProps) {
  const [variablesDialogOpen, setVariablesDialogOpen] = useState(false);

  const variables = normalizeVariables(config.variables);

  // Variable CRUD (shared by both voice & chat branches)
  const handleAddVariable = (v: Omit<Variable, 'id'>) => {
    onUpdateConfig({ variables: [...variables, { id: generateId('var'), ...v }] });
  };

  const handleUpdateVariable = (id: string, updates: Partial<Variable>) => {
    onUpdateConfig({ variables: variables.map(v => v.id === id ? { ...v, ...updates } : v) });
  };

  const handleRemoveVariable = (id: string) => {
    onUpdateConfig({ variables: variables.filter(v => v.id !== id) });
  };

  // ── Voice Output ──
  if (agentMode === 'voice') {
    const transcriptEnabled = config.transcriptEnabled !== false;
    const transcriptFormat = (config.transcriptFormat as string) || 'plain';
    const confirmBeforeAction = config.confirmBeforeAction !== false;
    const fillerPhrases = config.fillerPhrases !== false;

    const TRANSCRIPT_FORMATS = [
      { value: 'plain', label: 'Plain Text', desc: 'Simple text transcript' },
      { value: 'timestamped', label: 'Timestamped', desc: 'With speaker + time' },
      { value: 'srt', label: 'SRT', desc: 'Subtitle format' },
    ];

    return (
      <div className="space-y-6">
        {/* Conversation Behavior */}
        <div>
          <div className="section-label flex items-center gap-1.5 mb-2">
            <AudioWaveform className="h-3.5 w-3.5" />
            Conversation Behavior
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            High-level agent behavior during calls
          </p>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[12px] font-medium">Confirm before actions</div>
                <div className="text-[10px] text-muted-foreground">
                  Agent asks for verbal confirmation before executing tool calls.
                </div>
              </div>
              <Switch
                checked={confirmBeforeAction}
                onCheckedChange={(checked) => onUpdateConfig({ confirmBeforeAction: checked })}
                className="mt-0.5 scale-90"
              />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[12px] font-medium">Filler phrases</div>
                <div className="text-[10px] text-muted-foreground">
                  Use "Let me check..." and similar while processing.
                </div>
              </div>
              <Switch
                checked={fillerPhrases}
                onCheckedChange={(checked) => onUpdateConfig({ fillerPhrases: checked })}
                className="mt-0.5 scale-90"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Transcript */}
        <div>
          <div className="section-label flex items-center gap-1.5 mb-2">
            <MessageSquare className="h-3.5 w-3.5" />
            Transcript
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[12px] font-medium">Save transcript</div>
                <div className="text-[10px] text-muted-foreground">
                  Log the full conversation transcript after each call.
                </div>
              </div>
              <Switch
                checked={transcriptEnabled}
                onCheckedChange={(checked) => onUpdateConfig({ transcriptEnabled: checked })}
                className="mt-0.5 scale-90"
              />
            </div>

            {transcriptEnabled && (
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground block">Format</Label>
                <div className="flex flex-wrap gap-1.5">
                  {TRANSCRIPT_FORMATS.map((opt) => {
                    const isSelected = transcriptFormat === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onUpdateConfig({ transcriptFormat: opt.value })}
                        className={`rounded-lg border px-2.5 py-1.5 text-left transition-colors flex-1 min-w-0 ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div className="text-[11px] font-medium leading-none">{opt.label}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5 leading-none">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Variables (shared) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="section-label flex items-center gap-1.5">
              <Braces className="h-3.5 w-3.5" />
              Variables & Memory
            </div>
            {variables.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] px-2.5"
                onClick={() => setVariablesDialogOpen(true)}
              >
                Manage
              </Button>
            )}
          </div>

          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-[12px] font-medium">Conversation memory</div>
              <div className="text-[10px] text-muted-foreground">
                Retain conversation history across turns.
              </div>
            </div>
            <Switch
              checked={config.memoryEnabled ?? true}
              onCheckedChange={(checked) => onUpdateConfig({ memoryEnabled: checked })}
              className="mt-0.5 scale-90"
            />
          </div>

          {variables.length === 0 ? (
            <button
              onClick={() => setVariablesDialogOpen(true)}
              className="w-full rounded-lg border border-dashed p-4 text-center hover:border-primary/30 hover:bg-accent/30 transition-colors"
            >
              <Braces className="h-5 w-5 text-muted-foreground/40 mx-auto mb-1.5" />
              <p className="text-[12px] text-muted-foreground">No variables defined yet.</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">Click to add variables.</p>
            </button>
          ) : (
            <button
              onClick={() => setVariablesDialogOpen(true)}
              className="w-full rounded-lg border hover:border-primary/30 hover:bg-accent/20 transition-colors text-left"
            >
              <div className="divide-y">
                {variables.slice(0, 3).map((v) => {
                  const cfg = TYPE_CONFIG[v.type] || TYPE_CONFIG.string;
                  const Icon = cfg.icon;
                  return (
                    <div key={v.id} className="flex items-center gap-2.5 px-3 py-2">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                        style={{ backgroundColor: cfg.bg }}
                      >
                        <Icon className="h-3 w-3" style={{ color: cfg.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-medium font-mono leading-tight truncate">
                            {v.name || 'unnamed'}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0 h-3.5 font-medium shrink-0"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {variables.length > 3 && (
                <div className="px-3 py-1.5 border-t">
                  <span className="text-[10px] text-muted-foreground">
                    +{variables.length - 3} more
                  </span>
                </div>
              )}
            </button>
          )}
        </div>

        <ManageVariablesDialog
          open={variablesDialogOpen}
          onOpenChange={setVariablesDialogOpen}
          variables={variables}
          onAdd={handleAddVariable}
          onUpdate={handleUpdateVariable}
          onRemove={handleRemoveVariable}
        />
      </div>
    );
  }

  // ── Chat Output (default) ──
  const responseFormat = config.responseFormat || '';

  return (
    <div className="space-y-6">
      {/* ── Variables & Memory ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="section-label flex items-center gap-1.5">
            <Braces className="h-3.5 w-3.5" />
            Variables & Memory
          </div>
          {variables.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] px-2.5"
              onClick={() => setVariablesDialogOpen(true)}
            >
              Manage
            </Button>
          )}
        </div>

        {/* Memory toggle */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[12px] font-medium">Conversation memory</div>
            <div className="text-[10px] text-muted-foreground">
              Retain conversation history across turns. Disable for stateless interactions.
            </div>
          </div>
          <Switch
            checked={config.memoryEnabled ?? true}
            onCheckedChange={(checked) => onUpdateConfig({ memoryEnabled: checked })}
            className="mt-0.5 scale-90"
          />
        </div>

        {/* Variables sub-header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground font-medium">Variables</span>
        </div>

        {variables.length === 0 ? (
          <button
            onClick={() => setVariablesDialogOpen(true)}
            className="w-full rounded-lg border border-dashed p-4 text-center hover:border-primary/30 hover:bg-accent/30 transition-colors"
          >
            <Braces className="h-5 w-5 text-muted-foreground/40 mx-auto mb-1.5" />
            <p className="text-[12px] text-muted-foreground">No variables defined yet.</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Click to add variables for your agent.</p>
          </button>
        ) : (
          <button
            onClick={() => setVariablesDialogOpen(true)}
            className="w-full rounded-lg border hover:border-primary/30 hover:bg-accent/20 transition-colors text-left"
          >
            <div className="divide-y">
              {variables.slice(0, 3).map((v) => {
                const cfg = TYPE_CONFIG[v.type] || TYPE_CONFIG.string;
                const Icon = cfg.icon;
                return (
                  <div key={v.id} className="flex items-center gap-2.5 px-3 py-2">
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: cfg.bg }}
                    >
                      <Icon className="h-3 w-3" style={{ color: cfg.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-medium font-mono leading-tight truncate">
                          {v.name || 'unnamed'}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1 py-0 h-3.5 font-medium shrink-0"
                          style={{ color: cfg.color }}
                        >
                          {cfg.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-3.5 font-medium shrink-0"
                        >
                          {v.scope === 'global' ? 'Global' : 'Session'}
                        </Badge>
                      </div>
                      {v.description && (
                        <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
                          {v.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {variables.length > 3 && (
              <div className="px-3 py-1.5 border-t">
                <span className="text-[10px] text-muted-foreground">
                  +{variables.length - 3} more variable{variables.length - 3 !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </button>
        )}
      </div>

      <Separator />

      {/* ── Response Format ── */}
      <div>
        <div className="section-label flex items-center gap-1.5 mb-2">
          <FileOutput className="h-3.5 w-3.5" />
          Response Format
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Configure how the agent structures its output.
        </p>

        <div className="space-y-4">
          {/* Format chips */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground mb-1.5 block">Format</Label>
            <div className="flex flex-wrap gap-1.5">
              {FORMAT_OPTIONS.map((opt) => {
                const isSelected = responseFormat === opt.value;
                return (
                  <button
                    key={opt.value || '_auto'}
                    onClick={() => onUpdateConfig({ responseFormat: opt.value })}
                    className={`rounded-lg border px-2.5 py-1.5 text-left transition-colors flex-1 min-w-0 ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="text-[11px] font-medium leading-none">{opt.label}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 leading-none">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* JSON Schema (conditional) */}
          {responseFormat === 'json' && (
            <div className="rounded-lg border p-3 space-y-2">
              <Label className="text-[11px] font-medium">JSON Structure</Label>
              <Textarea
                value={config.jsonSchema || ''}
                onChange={(e) => onUpdateConfig({ jsonSchema: e.target.value })}
                placeholder={'{\n  "response": "string",\n  "confidence": "number",\n  "sources": ["string"]\n}'}
                rows={5}
                className="text-[12px] font-mono resize-none"
              />
              <p className="text-[10px] text-muted-foreground">
                Define the expected JSON shape. The agent will conform its output to this structure.
              </p>
            </div>
          )}

          {/* Max Response Length */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Max Response Length</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={config.maxResponseLength || 0}
                onChange={(e) => onUpdateConfig({ maxResponseLength: parseInt(e.target.value) || 0 })}
                className="h-8 text-[12px] flex-1"
              />
              <span className="text-[11px] text-muted-foreground shrink-0">tokens</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Set to 0 for unlimited.</p>
          </div>

          {/* Cite Sources */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[12px] font-medium">Cite Knowledge Sources</div>
              <div className="text-[10px] text-muted-foreground">
                Include source citations when the agent references knowledge base documents.
              </div>
            </div>
            <Switch
              checked={!!config.includeSourceCitations}
              onCheckedChange={(checked) => onUpdateConfig({ includeSourceCitations: checked })}
              className="mt-0.5 scale-90"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Response Instructions ── */}
      <div>
        <div className="section-label flex items-center gap-1.5 mb-2">
          <ScrollText className="h-3.5 w-3.5" />
          Response Instructions
        </div>
        <p className="text-[11px] text-muted-foreground mb-2.5">
          Additional guidance for how the agent should structure its responses.
        </p>
        <Textarea
          value={config.responseInstructions || ''}
          onChange={(e) => onUpdateConfig({ responseInstructions: e.target.value })}
          placeholder="e.g. Always start with a brief summary. Use bullet points for action items. End with next steps."
          rows={4}
          className="text-[13px] leading-relaxed resize-none"
        />
      </div>

      {/* ── Dialog ── */}
      <ManageVariablesDialog
        open={variablesDialogOpen}
        onOpenChange={setVariablesDialogOpen}
        variables={variables}
        onAdd={handleAddVariable}
        onUpdate={handleUpdateVariable}
        onRemove={handleRemoveVariable}
      />
    </div>
  );
}
