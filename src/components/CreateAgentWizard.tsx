import { useState } from 'react';
import {
  Bot, ArrowRight, ArrowLeft, MessageSquare, AudioWaveform,
  Headphones, Sparkles, Brain, Globe, Rocket, FileText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { CHAT_TEMPLATES, VOICE_TEMPLATES, type AgentTemplate } from '@/data/agentTemplates';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  headphones: Headphones,
  sparkles: Sparkles,
  brain: Brain,
  globe: Globe,
  rocket: Rocket,
  bot: Bot,
};

interface CreateAgentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAgent: (name: string, description: string, systemPrompt: string, mode: 'chat' | 'voice', templateId?: string) => void;
}

export default function CreateAgentWizard({ open, onOpenChange, onCreateAgent }: CreateAgentWizardProps) {
  const [step, setStep] = useState<'pick-type' | 'pick-template' | 'details'>('pick-type');
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  const canCreate = name.trim().length > 0;

  const reset = () => {
    setStep('pick-type');
    setMode('chat');
    setSelectedTemplate(null);
    setName('');
    setDescription('');
    setSystemPrompt('');
  };

  const handlePickMode = (picked: 'chat' | 'voice') => {
    setMode(picked);
    setStep('pick-template');
  };

  const handlePickTemplate = (template: AgentTemplate | null) => {
    setSelectedTemplate(template);
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setSystemPrompt(template.systemPrompt);
    } else {
      setName('');
      setDescription('');
      setSystemPrompt('');
    }
    setStep('details');
  };

  const handleCreate = () => {
    if (!canCreate) return;
    onCreateAgent(name.trim(), description.trim(), systemPrompt.trim(), mode, selectedTemplate?.id);
    reset();
    onOpenChange(false);
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const templates = mode === 'voice' ? VOICE_TEMPLATES : CHAT_TEMPLATES;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-hidden flex flex-col gap-0 p-0">
        {/* ── Step 1: Pick Type ── */}
        {step === 'pick-type' && (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
              <DialogTitle className="text-[16px]">Create Agent</DialogTitle>
              <DialogDescription className="text-[12px]">
                Choose the type of agent to build.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6 space-y-3">
              <button
                onClick={() => handlePickMode('chat')}
                className="flex items-center gap-4 w-full rounded-xl border-2 border-border p-5 transition-colors hover:border-primary/40 hover:bg-accent/50 text-left"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: '#eff6ff' }}
                >
                  <MessageSquare className="h-6 w-6" style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold leading-tight">Chat Agent</div>
                  <div className="text-[12px] text-muted-foreground leading-snug mt-0.5">
                    Build a text-based conversational agent for messaging and chat interfaces.
                  </div>
                </div>
              </button>
              <button
                onClick={() => handlePickMode('voice')}
                className="flex items-center gap-4 w-full rounded-xl border-2 border-border p-5 transition-colors hover:border-primary/40 hover:bg-accent/50 text-left"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: '#f0fdfa' }}
                >
                  <AudioWaveform className="h-6 w-6" style={{ color: '#14b8a6' }} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold leading-tight">Voice Agent</div>
                  <div className="text-[12px] text-muted-foreground leading-snug mt-0.5">
                    Build a real-time voice agent with speech recognition and text-to-speech.
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Pick Template ── */}
        {step === 'pick-template' && (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={() => setStep('pick-type')}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: mode === 'voice' ? '#f0fdfa' : '#eff6ff' }}
                >
                  {mode === 'voice'
                    ? <AudioWaveform className="h-5 w-5" style={{ color: '#14b8a6' }} />
                    : <MessageSquare className="h-5 w-5" style={{ color: '#3b82f6' }} />
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-[16px]">Choose a Template</DialogTitle>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 h-5 font-medium"
                      style={{ color: mode === 'voice' ? '#14b8a6' : '#3b82f6' }}
                    >
                      {mode === 'voice' ? 'Voice' : 'Chat'}
                    </Badge>
                  </div>
                  <DialogDescription className="text-[12px]">
                    Start with a template or build from scratch.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-2.5">
                {templates.map((tmpl) => {
                  const Icon = ICON_MAP[tmpl.icon] || Bot;
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => handlePickTemplate(tmpl)}
                      className="flex items-center gap-4 w-full rounded-xl border-2 border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/50 text-left"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: tmpl.color + '15' }}
                      >
                        <Icon className="h-5 w-5" style={{ color: tmpl.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold leading-tight">{tmpl.name}</div>
                        <div className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                          {tmpl.description}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Blank option */}
                <button
                  onClick={() => handlePickTemplate(null)}
                  className="flex items-center gap-4 w-full rounded-xl border-2 border-dashed border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/30 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold leading-tight">Start Blank</div>
                    <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      Start with an empty canvas and configure everything from scratch.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Step 3: Details ── */}
        {step === 'details' && (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={() => setStep('pick-template')}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: mode === 'voice' ? '#f0fdfa' : '#eff6ff',
                  }}
                >
                  {mode === 'voice'
                    ? <AudioWaveform className="h-5 w-5" style={{ color: '#14b8a6' }} />
                    : <MessageSquare className="h-5 w-5" style={{ color: '#3b82f6' }} />
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-[16px]">Create Agent</DialogTitle>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 h-5 font-medium"
                      style={{ color: mode === 'voice' ? '#14b8a6' : '#3b82f6' }}
                    >
                      {mode === 'voice' ? 'Voice' : 'Chat'}
                    </Badge>
                    {selectedTemplate && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 h-5 font-medium"
                      >
                        {selectedTemplate.name}
                      </Badge>
                    )}
                  </div>
                  <DialogDescription className="text-[12px]">
                    Define your {mode === 'voice' ? 'voice' : 'chat'} agent.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="agent-name" className="text-[12px]">Agent Name</Label>
                  <Input
                    id="agent-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={mode === 'voice' ? 'e.g. Phone Support Agent' : 'e.g. Customer Support Agent'}
                    className="text-[13px]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.metaKey && canCreate) handleCreate();
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-desc" className="text-[12px]">Description</Label>
                  <Textarea
                    id="agent-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this agent do?"
                    rows={2}
                    className="text-[13px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-prompt" className="text-[12px]">System Prompt</Label>
                  <Textarea
                    id="agent-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant that..."
                    rows={5}
                    className="text-[13px]"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Instructions that guide the agent's behavior and responses.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCreate}
                disabled={!canCreate}
                className="mt-6 w-full"
              >
                Create {mode === 'voice' ? 'Voice' : 'Chat'} Agent
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Press <kbd className="rounded border px-1 py-0.5 text-[10px] font-mono">Cmd + Enter</kbd> to create
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
