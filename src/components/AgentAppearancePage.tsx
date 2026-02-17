import { useState } from 'react';
import {
  Palette, Bot, MessageSquare, Headphones, ShieldCheck, Sparkles, Zap,
  Heart, Brain, Globe, Rocket, Star, Coffee, Check, Send, Plus, X,
  RotateCcw, Sun, Moon, AudioWaveform, Play, Square, Mic, Phone,
  PhoneCall, Volume2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Agent } from '@/hooks/useCanvasState';
import { VOICE_OPTIONS } from '@/data/mockData';

const AVATAR_OPTIONS = [
  { name: 'bot', icon: Bot },
  { name: 'message', icon: MessageSquare },
  { name: 'headphones', icon: Headphones },
  { name: 'shield', icon: ShieldCheck },
  { name: 'sparkles', icon: Sparkles },
  { name: 'zap', icon: Zap },
  { name: 'heart', icon: Heart },
  { name: 'brain', icon: Brain },
  { name: 'globe', icon: Globe },
  { name: 'rocket', icon: Rocket },
  { name: 'star', icon: Star },
  { name: 'coffee', icon: Coffee },
];

const COLOR_PRESETS = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Orange', hex: '#f97316' },
];

function getAvatarIcon(name: string) {
  return AVATAR_OPTIONS.find(a => a.name === name)?.icon || Bot;
}

type Tab = 'content' | 'style' | 'voice';

const VOICE_PROVIDERS = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'elevenlabs', label: 'ElevenLabs' },
  { id: 'google', label: 'Google Cloud' },
  { id: 'azure', label: 'Azure' },
];

const VOICE_LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'pt-BR', label: 'Portuguese (BR)' },
  { value: 'zh-CN', label: 'Chinese' },
];

interface AgentAppearancePageProps {
  agent: Agent;
  onUpdateAgent: (updates: Partial<Agent>) => void;
}

export default function AgentAppearancePage({ agent, onUpdateAgent }: AgentAppearancePageProps) {
  const [tab, setTab] = useState<Tab>('content');
  const [customColor, setCustomColor] = useState('');
  const [customBubbleColor, setCustomBubbleColor] = useState('');
  const [voicePlayingId, setVoicePlayingId] = useState<string | null>(null);
  const AvatarIcon = getAvatarIcon(agent.avatar);
  const isVoice = agent.mode === 'voice';

  const handleCustomColor = (value: string) => {
    setCustomColor(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      onUpdateAgent({ color: value });
    }
  };

  const handleCustomBubbleColor = (value: string) => {
    setCustomBubbleColor(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      onUpdateAgent({ bubbleColor: value });
    }
  };

  const suggestions = agent.suggestedMessages || [];
  const addSuggestion = () => onUpdateAgent({ suggestedMessages: [...suggestions, ''] });
  const updateSuggestion = (idx: number, value: string) => {
    const next = [...suggestions];
    next[idx] = value;
    onUpdateAgent({ suggestedMessages: next });
  };
  const removeSuggestion = (idx: number) => {
    onUpdateAgent({ suggestedMessages: suggestions.filter((_, i) => i !== idx) });
  };

  const isDark = agent.theme === 'dark';
  const bubbleColor = agent.bubbleColor || '#000000';

  // Preview theme colors
  const pBg = isDark ? '#1a1a1a' : '#ffffff';
  const pFg = isDark ? '#e5e5e5' : '#111111';
  const pMuted = isDark ? '#2a2a2a' : '#f4f4f5';
  const pMutedFg = isDark ? '#a1a1aa' : '#71717a';
  const pBorder = isDark ? '#333333' : '#e5e5e5';

  const tabs: Tab[] = isVoice ? ['content', 'style', 'voice'] : ['content', 'style'];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Page header */}
      <div className="flex items-center gap-3 px-8 py-5 border-b shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Palette className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-[18px] font-semibold">Agent Appearance</h1>
          <p className="text-[13px] text-muted-foreground">
            Customize how your {isVoice ? 'voice' : 'chat'} agent looks and introduces itself.
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Settings form */}
        <div className="w-[440px] shrink-0 border-r overflow-y-auto">
          {/* Tabs */}
          <div className="flex items-center gap-0 px-8 pt-5 pb-0">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors ${
                  tab === t
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'content' ? 'Content' : t === 'style' ? 'Style' : 'Voice'}
              </button>
            ))}
          </div>

          <div className="px-8 py-5">
            {/* ── Content Tab ── */}
            {tab === 'content' && (
              <>
                {/* Display name */}
                <div className="pb-5">
                  <Label className="text-[13px] font-medium mb-2 block">Display name</Label>
                  <Input
                    value={agent.name}
                    onChange={e => onUpdateAgent({ name: e.target.value })}
                    placeholder="Agent name"
                    className="text-[13px]"
                  />
                </div>

                <div className="border-t" />

                {/* Description */}
                <div className="py-5">
                  <Label className="text-[13px] font-medium mb-2 block">Description</Label>
                  <Input
                    value={agent.description}
                    onChange={e => onUpdateAgent({ description: e.target.value })}
                    placeholder="What does this agent do?"
                    className="text-[13px]"
                  />
                </div>

                <div className="border-t" />

                {isVoice ? (
                  <>
                    {/* Voice Greeting */}
                    <div className="py-5">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-[13px] font-medium">Voice greeting</Label>
                        {agent.voiceGreeting && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] text-muted-foreground gap-1 px-2"
                            onClick={() => onUpdateAgent({ voiceGreeting: '' })}
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={agent.voiceGreeting || ''}
                        onChange={e => onUpdateAgent({ voiceGreeting: e.target.value })}
                        placeholder="Hello! Thanks for calling. How can I help you today?"
                        rows={3}
                        className="text-[13px] resize-y"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Spoken when a voice call begins.
                      </p>
                    </div>

                    <div className="border-t" />

                    {/* Call-to-action */}
                    <div className="py-5">
                      <Label className="text-[13px] font-medium mb-2 block">Call button label</Label>
                      <Input
                        value={agent.messagePlaceholder || ''}
                        onChange={e => onUpdateAgent({ messagePlaceholder: e.target.value })}
                        placeholder="Talk to Agent"
                        className="text-[13px]"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Text shown on the call button in the widget.
                      </p>
                    </div>

                    <div className="border-t" />

                    {/* Hold message */}
                    <div className="py-5">
                      <Label className="text-[13px] font-medium mb-2 block">Hold message</Label>
                      <Input
                        value={agent.firstMessage || ''}
                        onChange={e => onUpdateAgent({ firstMessage: e.target.value })}
                        placeholder="Please wait while we connect you..."
                        className="text-[13px]"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Displayed while the call is connecting.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Initial message (chat) */}
                    <div className="py-5">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-[13px] font-medium">Initial messages</Label>
                        {agent.firstMessage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] text-muted-foreground gap-1 px-2"
                            onClick={() => onUpdateAgent({ firstMessage: '' })}
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={agent.firstMessage}
                        onChange={e => onUpdateAgent({ firstMessage: e.target.value })}
                        placeholder="Hi! What can I help you with?"
                        rows={2}
                        className="text-[13px] resize-y"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Enter each message in a new line.
                      </p>
                    </div>

                    <div className="border-t" />

                    {/* Suggested messages (chat only) */}
                    <div className="py-5">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-[13px] font-medium">Suggested messages</Label>
                        <Switch
                          checked={suggestions.length > 0 || false}
                          onCheckedChange={(checked) => {
                            if (!checked) onUpdateAgent({ suggestedMessages: [] });
                            else if (suggestions.length === 0) onUpdateAgent({ suggestedMessages: [''] });
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-3">
                        Quick-reply buttons shown to the user.
                      </p>
                      {suggestions.length > 0 && (
                        <>
                          <div className="space-y-2 mb-3">
                            {suggestions.map((msg, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <Input
                                  value={msg}
                                  onChange={e => updateSuggestion(i, e.target.value)}
                                  placeholder="e.g. What are your pricing plans?"
                                  className="text-[13px] flex-1"
                                />
                                <button
                                  onClick={() => removeSuggestion(i)}
                                  className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[12px] gap-1.5"
                            onClick={addSuggestion}
                          >
                            <Plus className="h-3 w-3" />
                            Add suggested message
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="border-t" />

                    {/* Message placeholder (chat only) */}
                    <div className="py-5">
                      <Label className="text-[13px] font-medium mb-2 block">Message placeholder</Label>
                      <Input
                        value={agent.messagePlaceholder || ''}
                        onChange={e => onUpdateAgent({ messagePlaceholder: e.target.value })}
                        placeholder="Message..."
                        className="text-[13px]"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── Style Tab ── */}
            {tab === 'style' && (
              <>
                {/* Theme */}
                <div className="pb-5">
                  <Label className="text-[13px] font-medium mb-3 block">Theme</Label>
                  <div className="flex gap-2">
                    {(['light', 'dark'] as const).map(t => {
                      const isActive = agent.theme === t;
                      return (
                        <button
                          key={t}
                          onClick={() => onUpdateAgent({ theme: t })}
                          className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-[13px] font-medium transition-all flex-1 justify-center ${
                            isActive
                              ? 'border-primary bg-primary/5 text-foreground'
                              : 'border-border text-muted-foreground hover:border-border hover:bg-accent/50'
                          }`}
                        >
                          {t === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                          {t === 'light' ? 'Light' : 'Dark'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t" />

                {/* Avatar */}
                <div className="py-5">
                  <Label className="text-[13px] font-medium mb-3 block">Avatar</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      const isSelected = agent.avatar === opt.name;
                      return (
                        <button
                          key={opt.name}
                          onClick={() => onUpdateAgent({ avatar: opt.name })}
                          className="flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all hover:bg-accent/40"
                          style={{
                            borderColor: isSelected ? agent.color : 'var(--border)',
                            backgroundColor: isSelected ? agent.color + '12' : 'transparent',
                          }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: isSelected ? agent.color : 'var(--muted-foreground)' }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t" />

                {/* Primary color */}
                <div className="py-5">
                  <Label className="text-[13px] font-medium mb-3 block">Primary color</Label>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      {COLOR_PRESETS.map(c => {
                        const isSelected = agent.color === c.hex;
                        return (
                          <button
                            key={c.hex}
                            onClick={() => { onUpdateAgent({ color: c.hex }); setCustomColor(''); }}
                            className="flex h-7 w-7 items-center justify-center rounded-full transition-all hover:scale-110"
                            style={{
                              backgroundColor: c.hex,
                              boxShadow: isSelected ? `0 0 0 2px var(--background), 0 0 0 3.5px ${c.hex}` : 'none',
                            }}
                            title={c.name}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 shrink-0 rounded-full border"
                      style={{ backgroundColor: agent.color }}
                    />
                    <Input
                      value={customColor || agent.color}
                      onChange={e => handleCustomColor(e.target.value)}
                      className="text-[12px] font-mono h-8 w-[100px]"
                      maxLength={7}
                    />
                    <button
                      onClick={() => { onUpdateAgent({ color: isVoice ? '#14b8a6' : '#3b82f6' }); setCustomColor(''); }}
                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors shrink-0"
                      title="Reset to default"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="border-t" />

                {/* Use primary color for header */}
                <div className="py-5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[13px] font-medium">Use primary color for header</Label>
                    <Switch
                      checked={agent.useColorForHeader}
                      onCheckedChange={checked => onUpdateAgent({ useColorForHeader: checked })}
                    />
                  </div>
                </div>

                <div className="border-t" />

                {/* Launcher button */}
                <div className="py-5">
                  <Label className="text-[13px] font-medium mb-3 block">
                    {isVoice ? 'Call button color' : 'Chat bubble button color'}
                  </Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 shrink-0 rounded-full border"
                      style={{ backgroundColor: bubbleColor }}
                    />
                    <Input
                      value={customBubbleColor || bubbleColor}
                      onChange={e => handleCustomBubbleColor(e.target.value)}
                      className="text-[12px] font-mono h-8 w-[100px]"
                      maxLength={7}
                    />
                    <button
                      onClick={() => { onUpdateAgent({ bubbleColor: '#000000' }); setCustomBubbleColor(''); }}
                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors shrink-0"
                      title="Reset to default"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="border-t" />

                {/* Align button */}
                <div className="py-5">
                  <Label className="text-[13px] font-medium mb-3 block">
                    Align {isVoice ? 'call' : 'chat bubble'} button
                  </Label>
                  <div className="space-y-2">
                    {(['left', 'right'] as const).map(align => (
                      <label key={align} className="flex items-center gap-2.5 cursor-pointer">
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          agent.bubbleAlign === align ? 'border-primary' : 'border-muted-foreground/30'
                        }`}>
                          {agent.bubbleAlign === align && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="text-[13px]">
                          {align === 'left' ? 'Left align' : 'Right align'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Voice Tab ── */}
            {tab === 'voice' && isVoice && (() => {
              const voiceProvider = agent.voiceProvider || 'openai';
              const voiceId = agent.voiceId || 'alloy';
              const voiceLanguage = agent.voiceLanguage || 'en-US';
              const voiceSpeed = agent.voiceSpeed || 1.0;
              const voices = VOICE_OPTIONS[voiceProvider] || [];

              const handleVoicePlay = (id: string, e: React.MouseEvent) => {
                e.stopPropagation();
                if (voicePlayingId === id) { setVoicePlayingId(null); return; }
                setVoicePlayingId(id);
                setTimeout(() => setVoicePlayingId(null), 2000);
              };

              return (
                <>
                  {/* Voice Provider */}
                  <div className="pb-5">
                    <Label className="text-[13px] font-medium mb-3 block">Voice Provider</Label>
                    <div className="flex flex-wrap gap-2">
                      {VOICE_PROVIDERS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            const newVoices = VOICE_OPTIONS[p.id] || [];
                            onUpdateAgent({ voiceProvider: p.id, voiceId: newVoices[0]?.id || '' });
                          }}
                          className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                            voiceProvider === p.id
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t" />

                  {/* Voice Selection Gallery */}
                  <div className="py-5">
                    <Label className="text-[13px] font-medium mb-3 block">Voice</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {voices.map(voice => {
                        const isSelected = voiceId === voice.id;
                        const isPlaying = voicePlayingId === voice.id;
                        return (
                          <button
                            key={voice.id}
                            onClick={() => onUpdateAgent({ voiceId: voice.id })}
                            className={`relative flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                : 'border-border hover:border-primary/30 hover:bg-accent/30'
                            }`}
                          >
                            <div className="flex w-full items-center gap-2 mb-1.5">
                              <button
                                onClick={(e) => handleVoicePlay(voice.id, e)}
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                                  isPlaying
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                }`}
                              >
                                {isPlaying ? <Square className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5 ml-0.5" />}
                              </button>
                              <span className="text-[13px] font-semibold leading-tight truncate">{voice.name}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground leading-snug mb-1.5">{voice.description}</div>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium">{voice.gender}</Badge>
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium">{voice.accent}</Badge>
                            </div>
                            {isPlaying && (
                              <div className="absolute top-2 right-2">
                                <AudioWaveform className="h-3 w-3 text-primary animate-pulse" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t" />

                  {/* Language */}
                  <div className="py-5">
                    <Label className="text-[13px] font-medium mb-3 block">Language</Label>
                    <Select value={voiceLanguage} onValueChange={val => onUpdateAgent({ voiceLanguage: val })}>
                      <SelectTrigger className="text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICE_LANGUAGES.map(lang => (
                          <SelectItem key={lang.value} value={lang.value} className="text-[13px]">
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t" />

                  {/* Speed */}
                  <div className="py-5">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-[13px] font-medium">Speed</Label>
                      <span className="text-[11px] text-muted-foreground font-mono">{voiceSpeed.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[voiceSpeed]}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      onValueChange={([val]) => onUpdateAgent({ voiceSpeed: val })}
                    />
                  </div>

                  <div className="border-t" />

                  {/* Play Sample */}
                  <div className="py-5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[12px] gap-1.5 w-full"
                      onClick={() => {
                        if (voicePlayingId === '__sample') { setVoicePlayingId(null); return; }
                        setVoicePlayingId('__sample');
                        setTimeout(() => setVoicePlayingId(null), 2000);
                      }}
                    >
                      {voicePlayingId === '__sample' ? (
                        <>
                          <AudioWaveform className="h-3 w-3 animate-pulse" /> Playing...
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" /> Play Sample
                        </>
                      )}
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Right: Preview area with dot grid */}
        <div className="flex-1 relative overflow-hidden bg-muted/30">
          {/* Dot grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Preview widget */}
          <div className="absolute inset-0 flex items-center justify-center p-10">
            <div className="w-full max-w-[380px] flex flex-col items-center">
              {/* Widget */}
              <div
                className="w-full rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: pBg,
                  border: `1px solid ${pBorder}`,
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center gap-3 px-5 py-4"
                  style={{
                    backgroundColor: agent.useColorForHeader ? agent.color : (isDark ? '#222222' : '#fafafa'),
                    borderBottom: `1px solid ${agent.useColorForHeader ? 'transparent' : pBorder}`,
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: agent.useColorForHeader ? 'rgba(255,255,255,0.2)' : agent.color + '18',
                    }}
                  >
                    <AvatarIcon
                      className="h-5 w-5"
                      style={{ color: agent.useColorForHeader ? '#ffffff' : agent.color }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[15px] font-semibold leading-tight truncate"
                      style={{ color: agent.useColorForHeader ? '#ffffff' : pFg }}
                    >
                      {agent.name || 'Agent'}
                    </div>
                    {agent.description && (
                      <div
                        className="text-[11px] leading-tight truncate mt-0.5"
                        style={{ color: agent.useColorForHeader ? 'rgba(255,255,255,0.7)' : pMutedFg }}
                      >
                        {agent.description}
                      </div>
                    )}
                  </div>
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: agent.useColorForHeader ? 'rgba(255,255,255,0.6)' : pMutedFg }}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                {/* Body */}
                {isVoice ? (
                  /* ── Voice widget preview ── */
                  <div className="px-5 py-8 flex flex-col items-center" style={{ minHeight: 320 }}>
                    {/* Agent avatar large */}
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-full mb-5"
                      style={{ backgroundColor: agent.color + '18' }}
                    >
                      <AvatarIcon className="h-9 w-9" style={{ color: agent.color }} />
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: '#22c55e' }}
                      />
                      <span className="text-[12px] font-medium" style={{ color: pFg }}>
                        Available
                      </span>
                    </div>

                    <p className="text-[11px] text-center mb-6 max-w-[260px]" style={{ color: pMutedFg }}>
                      {agent.voiceGreeting || 'Ready to take your call'}
                    </p>

                    {/* Call button */}
                    <button
                      className="flex items-center gap-2.5 rounded-full px-8 py-3 text-[14px] font-semibold text-white transition-transform hover:scale-105"
                      style={{ backgroundColor: agent.color }}
                    >
                      <Phone className="h-4.5 w-4.5" />
                      {agent.messagePlaceholder || 'Start Call'}
                    </button>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Audio indicator bar */}
                    <div className="flex items-center gap-1 mt-6">
                      {[0.3, 0.6, 1, 0.7, 0.4, 0.8, 0.5, 0.9, 0.3, 0.6, 1, 0.5].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full"
                          style={{
                            height: `${h * 16}px`,
                            backgroundColor: agent.color + '40',
                          }}
                        />
                      ))}
                    </div>

                    {/* Powered by line */}
                    <p className="text-[10px] mt-3" style={{ color: pMutedFg + '60' }}>
                      Powered by Voice AI
                    </p>
                  </div>
                ) : (
                  /* ── Chat widget preview ── */
                  <>
                    <div className="px-5 py-6 flex flex-col" style={{ minHeight: 280 }}>
                      {agent.firstMessage ? (
                        <>
                          {/* Agent message */}
                          <div className="flex gap-2.5 mb-4">
                            <div
                              className="rounded-2xl rounded-tl-md px-4 py-2.5 text-[13px] leading-relaxed max-w-[280px]"
                              style={{ backgroundColor: pMuted, color: pFg }}
                            >
                              {agent.firstMessage}
                            </div>
                          </div>
                          {/* Mock user reply */}
                          <div className="flex justify-end mb-4">
                            <div
                              className="rounded-2xl rounded-tr-md px-4 py-2.5 text-[13px] leading-relaxed text-white max-w-[280px]"
                              style={{ backgroundColor: agent.color }}
                            >
                              Hello
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-center">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl mb-3"
                            style={{ backgroundColor: isDark ? '#2a2a2a' : agent.color + '10' }}
                          >
                            <AvatarIcon className="h-6 w-6" style={{ color: agent.color + '50' }} />
                          </div>
                          <p className="text-[12px]" style={{ color: pMutedFg }}>
                            No initial message set
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: pMutedFg + '80' }}>
                            Add one to greet your users
                          </p>
                        </div>
                      )}

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Suggested messages */}
                      {suggestions.filter(s => s.trim()).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {suggestions.filter(s => s.trim()).map((s, i) => (
                            <div
                              key={i}
                              className="rounded-full px-3 py-1.5 text-[12px] cursor-pointer transition-colors"
                              style={{
                                border: `1px solid ${pBorder}`,
                                color: pMutedFg,
                                backgroundColor: pBg,
                              }}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chat input bar */}
                    <div className="px-5 py-3.5" style={{ borderTop: `1px solid ${pBorder}` }}>
                      <div
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                        style={{ border: `1px solid ${pBorder}`, backgroundColor: isDark ? '#222222' : '#fafafa' }}
                      >
                        <span className="text-[13px] flex-1" style={{ color: pMutedFg + '70' }}>
                          {agent.messagePlaceholder || 'Message...'}
                        </span>
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-lg"
                          style={{ backgroundColor: agent.color }}
                        >
                          <Send className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Floating launcher button */}
              <div className={`mt-6 flex w-full ${agent.bubbleAlign === 'left' ? 'justify-start' : 'justify-end'}`}>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: bubbleColor }}
                >
                  {isVoice ? (
                    <Phone className="h-6 w-6 text-white" />
                  ) : (
                    <MessageSquare className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
