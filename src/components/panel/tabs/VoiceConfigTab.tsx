import { useState, useEffect, useCallback } from 'react';
import { Play, Square, AudioWaveform, Mic, PhoneCall, MessageCircle, Volume2, Shield } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VOICE_OPTIONS } from '@/data/mockData';

interface VoiceConfigTabProps {
  config: Record<string, any>;
  onUpdateConfig: (updates: Record<string, any>) => void;
}

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'elevenlabs', label: 'ElevenLabs' },
  { id: 'google', label: 'Google Cloud' },
  { id: 'azure', label: 'Azure' },
];

const LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en-AU', label: 'English (AU)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'es-MX', label: 'Spanish (Mexico)' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'pt-BR', label: 'Portuguese (BR)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'hi-IN', label: 'Hindi' },
  { value: 'ar-SA', label: 'Arabic' },
  { value: 'multi', label: 'Multilingual (auto-detect)' },
];

const AMBIENT_SOUNDS = [
  { value: 'off', label: 'None' },
  { value: 'office', label: 'Office' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'call-center', label: 'Call Center' },
  { value: 'outdoor', label: 'Outdoor' },
];

const NOISE_CANCEL_OPTIONS = [
  { value: 'off', label: 'Off', desc: 'No filtering' },
  { value: 'noise', label: 'Noise only', desc: 'Filter background noise' },
  { value: 'noise-speech', label: 'Noise + Speech', desc: 'Filter noise & crosstalk' },
];

const STT_MODE_OPTIONS = [
  { value: 'fast', label: 'Speed', desc: 'Lowest latency' },
  { value: 'balanced', label: 'Balanced', desc: 'Good accuracy & speed' },
  { value: 'accurate', label: 'Accuracy', desc: 'Highest accuracy' },
];

const FIRST_MSG_OPTIONS = [
  { value: 'agent-first', label: 'Agent speaks first', desc: 'Agent greets the user on connect' },
  { value: 'wait-for-user', label: 'Wait for user', desc: 'Agent listens before responding' },
];

export default function VoiceConfigTab({ config, onUpdateConfig }: VoiceConfigTabProps) {
  // Voice / TTS
  const provider = (config.voiceProvider as string) || 'openai';
  const selectedVoiceId = (config.voiceId as string) || 'alloy';
  const language = (config.language as string) || 'en-US';
  const speed = (config.speed as number) || 1.0;
  const stability = (config.stability as number) || 0.75;
  const ambientSound = (config.ambientSound as string) || 'off';
  const ambientVolume = (config.ambientVolume as number) || 0.5;
  const normalizeForSpeech = config.normalizeForSpeech !== false;
  const pronunciationGuide = (config.pronunciationGuide as string) || '';

  // Transcription / STT
  const enableSTT = config.enableSTT !== false;
  const sttLanguage = (config.sttLanguage as string) || 'en-US';
  const sttMode = (config.sttMode as string) || 'balanced';
  const noiseCancellation = (config.noiseCancellation as string) || 'noise';
  const keywordBoost = (config.keywordBoost as string) || '';
  const endpointingMs = (config.endpointingMs as number) || 200;
  const confidenceThreshold = (config.confidenceThreshold as number) || 0.6;

  // Turn-Taking
  const firstMessageMode = (config.firstMessageMode as string) || 'agent-first';
  const responsiveness = (config.responsiveness as number) || 0.5;
  const interruptionSensitivity = (config.interruptionSensitivity as number) || 0.5;
  const enableBackchannel = config.enableBackchannel ?? true;
  const backchannelFrequency = (config.backchannelFrequency as number) || 0.6;
  const backoffSeconds = (config.backoffSeconds as number) || 1.0;
  const silenceReminderMs = (config.silenceReminderMs as number) || 10000;

  // Call Settings
  const greeting = (config.greeting as string) || '';
  const maxCallDuration = (config.maxCallDuration as number) || 30;
  const endCallAfterSilence = (config.endCallAfterSilence as number) || 30;
  const enableRecording = config.enableRecording !== false;

  const voices = VOICE_OPTIONS[provider] || [];
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlay = useCallback((voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingId === voiceId) { setPlayingId(null); return; }
    setPlayingId(voiceId);
  }, [playingId]);

  useEffect(() => {
    if (!playingId) return;
    const timer = setTimeout(() => setPlayingId(null), 2000);
    return () => clearTimeout(timer);
  }, [playingId]);

  return (
    <div className="space-y-6">

      {/* ─── Voice / TTS ─── */}
      <div>
        <div className="section-label flex items-center gap-1.5 mb-1">
          <Volume2 className="h-3.5 w-3.5" />
          Voice
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Text-to-speech provider, voice, and tuning
        </p>

        {/* Provider */}
        <div className="mb-4">
          <Label className="text-[11px] text-muted-foreground mb-1.5 block">Provider</Label>
          <div className="flex flex-wrap gap-1.5">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  const newVoices = VOICE_OPTIONS[p.id] || [];
                  onUpdateConfig({ voiceProvider: p.id, voiceId: newVoices[0]?.id || '' });
                }}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  provider === p.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Gallery */}
        <div className="mb-4">
          <Label className="text-[11px] text-muted-foreground mb-1.5 block">Voice</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {voices.map((voice) => {
              const isSelected = selectedVoiceId === voice.id;
              const isPlaying = playingId === voice.id;
              return (
                <button
                  key={voice.id}
                  onClick={() => onUpdateConfig({ voiceId: voice.id })}
                  className={`relative flex flex-col items-start rounded-lg border p-2.5 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/30 hover:bg-accent/30'
                  }`}
                >
                  <div className="flex w-full items-center gap-2 mb-1">
                    <button
                      onClick={(e) => handlePlay(voice.id, e)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isPlaying
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      {isPlaying ? <Square className="h-2 w-2" /> : <Play className="h-2 w-2 ml-0.5" />}
                    </button>
                    <span className="text-[12px] font-semibold leading-tight truncate">{voice.name}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-snug mb-1">{voice.description}</div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 font-medium">{voice.gender}</Badge>
                    <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 font-medium">{voice.accent}</Badge>
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

        {/* Language */}
        <div className="mb-4">
          <Label className="text-[11px] text-muted-foreground mb-1.5 block">Language</Label>
          <Select value={language} onValueChange={(val) => onUpdateConfig({ language: val })}>
            <SelectTrigger className="text-[12px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="text-[12px]">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speed & Stability */}
        <div className="space-y-3 mb-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-muted-foreground">Speed</Label>
              <span className="text-[10px] text-muted-foreground font-mono">{speed.toFixed(1)}x</span>
            </div>
            <Slider value={[speed]} min={0.5} max={2.0} step={0.1} onValueChange={([val]) => onUpdateConfig({ speed: val })} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-muted-foreground">Stability</Label>
              <span className="text-[10px] text-muted-foreground font-mono">{stability.toFixed(2)}</span>
            </div>
            <Slider value={[stability]} min={0} max={1} step={0.05} onValueChange={([val]) => onUpdateConfig({ stability: val })} />
            <p className="text-[10px] text-muted-foreground">Lower = more expressive, higher = more consistent.</p>
          </div>
        </div>

        {/* Ambient Sound */}
        <div className="mb-4">
          <Label className="text-[11px] text-muted-foreground mb-1.5 block">Background Sound</Label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {AMBIENT_SOUNDS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUpdateConfig({ ambientSound: opt.value })}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  ambientSound === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {ambientSound !== 'off' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Volume</Label>
                <span className="text-[10px] text-muted-foreground font-mono">{Math.round(ambientVolume * 100)}%</span>
              </div>
              <Slider value={[ambientVolume]} min={0} max={1} step={0.05} onValueChange={([val]) => onUpdateConfig({ ambientVolume: val })} />
            </div>
          )}
        </div>

        {/* Normalize & Pronunciation */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-[12px] font-medium">Normalize for speech</div>
            <div className="text-[10px] text-muted-foreground">Convert numbers, dates, currencies to spoken form.</div>
          </div>
          <Switch
            checked={normalizeForSpeech}
            onCheckedChange={(checked) => onUpdateConfig({ normalizeForSpeech: checked })}
            className="mt-0.5 scale-90"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Pronunciation Guide</Label>
          <Textarea
            value={pronunciationGuide}
            onChange={(e) => onUpdateConfig({ pronunciationGuide: e.target.value })}
            placeholder={"Acme = AK-mee\nSQL = sequel\nAPI = A.P.I."}
            rows={2}
            className="text-[12px] font-mono resize-none"
          />
          <p className="text-[10px] text-muted-foreground">Custom pronunciations for names, acronyms, and technical terms.</p>
        </div>
      </div>

      <Separator />

      {/* ─── Transcription / STT ─── */}
      <div>
        <div className="section-label flex items-center gap-1.5 mb-1">
          <Mic className="h-3.5 w-3.5" />
          Transcription
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Speech-to-text settings for understanding the user
        </p>

        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[12px] font-medium">Enable STT</div>
            <div className="text-[10px] text-muted-foreground">Process user speech input.</div>
          </div>
          <Switch checked={enableSTT} onCheckedChange={(val) => onUpdateConfig({ enableSTT: val })} className="mt-0.5 scale-90" />
        </div>

        {enableSTT && (
          <div className="space-y-4">
            {/* STT Language */}
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1.5 block">STT Language</Label>
              <Select value={sttLanguage} onValueChange={(val) => onUpdateConfig({ sttLanguage: val })}>
                <SelectTrigger className="text-[12px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value} className="text-[12px]">{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* STT Mode */}
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1.5 block">Recognition Mode</Label>
              <div className="flex gap-1.5">
                {STT_MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateConfig({ sttMode: opt.value })}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                      sttMode === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="text-[11px] font-medium leading-none">{opt.label}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 leading-none">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Noise Cancellation */}
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1.5 block">Noise Cancellation</Label>
              <div className="flex gap-1.5">
                {NOISE_CANCEL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateConfig({ noiseCancellation: opt.value })}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                      noiseCancellation === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="text-[11px] font-medium leading-none">{opt.label}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 leading-none">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Endpointing & Confidence */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-muted-foreground">Endpointing</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">{endpointingMs}ms</span>
                </div>
                <Slider value={[endpointingMs]} min={50} max={500} step={10} onValueChange={([val]) => onUpdateConfig({ endpointingMs: val })} />
                <p className="text-[10px] text-muted-foreground">Silence (ms) before finalizing a speech chunk.</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-muted-foreground">Confidence Threshold</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">{confidenceThreshold.toFixed(2)}</span>
                </div>
                <Slider value={[confidenceThreshold]} min={0.1} max={0.99} step={0.01} onValueChange={([val]) => onUpdateConfig({ confidenceThreshold: val })} />
                <p className="text-[10px] text-muted-foreground">Minimum confidence to accept a transcription.</p>
              </div>
            </div>

            {/* Keyword Boosting */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Keyword Boosting</Label>
              <Textarea
                value={keywordBoost}
                onChange={(e) => onUpdateConfig({ keywordBoost: e.target.value })}
                placeholder={"One keyword per line:\nAcme Corp\nPro Plan\nSKU-8834"}
                rows={2}
                className="text-[12px] resize-none"
              />
              <p className="text-[10px] text-muted-foreground">Improve recognition of product names, jargon, and proper nouns.</p>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* ─── Turn-Taking ─── */}
      <div>
        <div className="section-label flex items-center gap-1.5 mb-1">
          <MessageCircle className="h-3.5 w-3.5" />
          Turn-Taking
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          How the agent manages conversation flow
        </p>

        {/* First Message Mode */}
        <div className="mb-4">
          <Label className="text-[11px] text-muted-foreground mb-1.5 block">First Message</Label>
          <div className="space-y-1.5">
            {FIRST_MSG_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUpdateConfig({ firstMessageMode: opt.value })}
                className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                  firstMessageMode === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`text-[12px] font-medium leading-none ${firstMessageMode === opt.value ? 'text-primary' : ''}`}>{opt.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-none">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Max Response Duration */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">Max Response Duration</Label>
            <span className="text-[10px] text-muted-foreground font-mono">{(config.maxSpeechDuration as number) || 60}s</span>
          </div>
          <Slider value={[(config.maxSpeechDuration as number) || 60]} min={5} max={180} step={5} onValueChange={([val]) => onUpdateConfig({ maxSpeechDuration: val })} />
          <p className="text-[10px] text-muted-foreground">Max seconds the agent will speak per turn.</p>
        </div>

        {/* Responsiveness */}
        <div className="space-y-3 mb-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-muted-foreground">Responsiveness</Label>
              <span className="text-[10px] text-muted-foreground font-mono">{responsiveness.toFixed(1)}</span>
            </div>
            <Slider value={[responsiveness]} min={0} max={1} step={0.1} onValueChange={([val]) => onUpdateConfig({ responsiveness: val })} />
            <div className="flex justify-between">
              <span className="text-[9px] text-muted-foreground">Patient (waits longer)</span>
              <span className="text-[9px] text-muted-foreground">Quick (responds fast)</span>
            </div>
          </div>

          {/* Barge-in */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[12px] font-medium">Allow barge-in</div>
              <div className="text-[10px] text-muted-foreground">User can interrupt the agent mid-speech.</div>
            </div>
            <Switch
              checked={config.bargeIn !== false}
              onCheckedChange={(checked) => onUpdateConfig({ bargeIn: checked })}
              className="mt-0.5 scale-90"
            />
          </div>

          {config.bargeIn !== false && (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-muted-foreground">Interruption Sensitivity</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">{interruptionSensitivity.toFixed(1)}</span>
                </div>
                <Slider value={[interruptionSensitivity]} min={0} max={1} step={0.1} onValueChange={([val]) => onUpdateConfig({ interruptionSensitivity: val })} />
                <div className="flex justify-between">
                  <span className="text-[9px] text-muted-foreground">Ignores interruptions</span>
                  <span className="text-[9px] text-muted-foreground">Easily interrupted</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-muted-foreground">Backoff After Interruption</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">{backoffSeconds.toFixed(1)}s</span>
                </div>
                <Slider value={[backoffSeconds]} min={0} max={5} step={0.1} onValueChange={([val]) => onUpdateConfig({ backoffSeconds: val })} />
                <p className="text-[10px] text-muted-foreground">Recovery pause before agent resumes after being interrupted.</p>
              </div>
            </>
          )}
        </div>

        {/* Backchannel */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-[12px] font-medium">Backchannel</div>
            <div className="text-[10px] text-muted-foreground">
              Agent says "yeah", "uh-huh", "I see" while user speaks.
            </div>
          </div>
          <Switch
            checked={enableBackchannel}
            onCheckedChange={(checked) => onUpdateConfig({ enableBackchannel: checked })}
            className="mt-0.5 scale-90"
          />
        </div>
        {enableBackchannel && (
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Frequency</Label>
              <span className="text-[10px] text-muted-foreground font-mono">{Math.round(backchannelFrequency * 100)}%</span>
            </div>
            <Slider value={[backchannelFrequency]} min={0.1} max={1} step={0.1} onValueChange={([val]) => onUpdateConfig({ backchannelFrequency: val })} />
          </div>
        )}

        {/* Silence Reminder */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">Silence Reminder</Label>
            <span className="text-[10px] text-muted-foreground font-mono">{(silenceReminderMs / 1000).toFixed(0)}s</span>
          </div>
          <Slider value={[silenceReminderMs]} min={3000} max={30000} step={1000} onValueChange={([val]) => onUpdateConfig({ silenceReminderMs: val })} />
          <p className="text-[10px] text-muted-foreground">Seconds of silence before agent prompts the user again.</p>
        </div>
      </div>

      <Separator />

      {/* ─── Call Settings ─── */}
      <div>
        <div className="section-label flex items-center gap-1.5 mb-1">
          <PhoneCall className="h-3.5 w-3.5" />
          Call Settings
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Session-level configuration
        </p>

        {/* Greeting */}
        <div className="space-y-1.5 mb-4">
          <Label className="text-[11px] text-muted-foreground">Greeting Message</Label>
          <Textarea
            value={greeting}
            onChange={(e) => onUpdateConfig({ greeting: e.target.value })}
            placeholder="Hello! Thanks for calling Acme Support. How can I help you today?"
            rows={2}
            className="text-[12px] resize-none"
          />
          <p className="text-[10px] text-muted-foreground">Spoken when a voice call begins (requires "Agent speaks first" mode).</p>
        </div>

        {/* Max Duration */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">Max Call Duration</Label>
            <span className="text-[10px] text-muted-foreground font-mono">{maxCallDuration} min</span>
          </div>
          <Slider value={[maxCallDuration]} min={1} max={60} step={1} onValueChange={([val]) => onUpdateConfig({ maxCallDuration: val })} />
        </div>

        {/* End after silence */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">End Call After Silence</Label>
            <span className="text-[10px] text-muted-foreground font-mono">{endCallAfterSilence}s</span>
          </div>
          <Slider value={[endCallAfterSilence]} min={5} max={120} step={5} onValueChange={([val]) => onUpdateConfig({ endCallAfterSilence: val })} />
          <p className="text-[10px] text-muted-foreground">Seconds of mutual silence before the call auto-terminates.</p>
        </div>

        {/* Recording */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[12px] font-medium">Record calls</div>
            <div className="text-[10px] text-muted-foreground">Save audio recordings for review and analysis.</div>
          </div>
          <Switch
            checked={enableRecording}
            onCheckedChange={(checked) => onUpdateConfig({ enableRecording: checked })}
            className="mt-0.5 scale-90"
          />
        </div>
      </div>
    </div>
  );
}
