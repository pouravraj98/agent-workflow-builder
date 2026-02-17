import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Cpu } from 'lucide-react';
import VoiceConfigTab from './VoiceConfigTab';

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', desc: 'Business-appropriate' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm & approachable' },
  { value: 'casual', label: 'Casual', desc: 'Relaxed & informal' },
  { value: 'formal', label: 'Formal', desc: 'Structured & precise' },
  { value: 'empathetic', label: 'Empathetic', desc: 'Understanding & caring' },
];

const STYLE_OPTIONS = [
  { value: 'concise', label: 'Concise', desc: 'Short & direct' },
  { value: 'detailed', label: 'Detailed', desc: 'Thorough explanations' },
  { value: 'conversational', label: 'Conversational', desc: 'Natural dialogue' },
  { value: 'step-by-step', label: 'Step-by-step', desc: 'Guided walkthrough' },
];

const LLM_OPTIONS = [
  { value: 'gpt-4', label: 'GPT-4', provider: 'OpenAI' },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', provider: 'Anthropic' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'Anthropic' },
];

interface CoreTabProps {
  config: Record<string, any>;
  onUpdateConfig: (updates: Record<string, any>) => void;
  agentMode?: 'chat' | 'voice';
}

export default function CoreTab({ config, onUpdateConfig, agentMode }: CoreTabProps) {
  const selectedModel = LLM_OPTIONS.find(m => m.value === config.llmModel) || LLM_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div>
        <div className="section-label mb-1">Instructions</div>
        <p className="text-[11px] text-muted-foreground mb-2.5">
          Tell the agent what to do, how to behave, and what its role is
        </p>
        <Textarea
          value={config.conversationGoal || ''}
          onChange={(e) => onUpdateConfig({ conversationGoal: e.target.value })}
          placeholder={"You are a customer support agent for Acme Corp.\n\nYour goal is to help users resolve billing issues, answer product questions, and escalate complex problems to the support team.\n\nAlways be polite and confirm the user's issue before providing a solution."}
          rows={6}
          className="text-[13px] leading-relaxed"
        />
      </div>

      {/* Personality */}
      <div>
        <div className="section-label mb-1">Personality</div>
        <p className="text-[11px] text-muted-foreground mb-2.5">
          How the agent communicates with users
        </p>

        {/* Tone chips */}
        <div className="mb-3">
          <Label className="text-[11px] text-muted-foreground mb-1.5 block">Tone</Label>
          <div className="flex flex-wrap gap-1.5">
            {TONE_OPTIONS.map((opt) => {
              const isSelected = config.tone === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onUpdateConfig({ tone: isSelected ? '' : opt.value })}
                  className={`rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/40 text-foreground'
                  }`}
                >
                  <div className="text-[11px] font-medium leading-none">{opt.label}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 leading-none">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Response style chips */}
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1.5 block">Response Style</Label>
          <div className="flex flex-wrap gap-1.5">
            {STYLE_OPTIONS.map((opt) => {
              const isSelected = config.responseStyle === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onUpdateConfig({ responseStyle: isSelected ? '' : opt.value })}
                  className={`rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/40 text-foreground'
                  }`}
                >
                  <div className="text-[11px] font-medium leading-none">{opt.label}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 leading-none">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model */}
      <div>
        <div className="section-label mb-2">Model</div>
        <div className="flex flex-wrap gap-1.5">
          {LLM_OPTIONS.map((opt) => {
            const isSelected = (config.llmModel || 'gpt-4') === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onUpdateConfig({ llmModel: opt.value })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <Cpu className={`h-3.5 w-3.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-left">
                  <div className={`text-[11px] font-medium leading-none ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {opt.label}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 leading-none">{opt.provider}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Config — shown for voice agents */}
      {agentMode === 'voice' && (
        <VoiceConfigTab config={config} onUpdateConfig={onUpdateConfig} />
      )}
    </div>
  );
}
