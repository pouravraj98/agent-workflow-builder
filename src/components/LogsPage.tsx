import { useState } from 'react';
import {
  ScrollText, Search, Trash2, Bot, User, Clock, FlaskConical, Zap, BookOpen,
  Phone, PhoneIncoming, PhoneOutgoing, Globe, Play, Pause, Volume2,
  AlertTriangle, ArrowRightLeft, Timer, DollarSign, Activity, FileText,
  ThumbsUp, ThumbsDown, Minus, Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { ConversationLog, TestScenario } from '@/hooks/useCanvasState';
import {
  deriveConversationTitle,
  deriveConversationStatus,
  getConversationDuration,
  formatRelativeTime,
} from '@/data/mockData';

const STATUS_CONFIG = {
  resolved: { label: 'Resolved', color: '#22c55e', bg: '#f0fdf4' },
  escalated: { label: 'Escalated', color: '#f59e0b', bg: '#fffbeb' },
  pending: { label: 'Pending', color: '#9ca3af', bg: '#f9fafb' },
};

const END_REASON_LABELS: Record<string, { label: string; color: string }> = {
  caller_hangup: { label: 'Caller hung up', color: '#6b7280' },
  agent_hangup: { label: 'Agent ended', color: '#6b7280' },
  timeout: { label: 'Timed out', color: '#f59e0b' },
  error: { label: 'Error', color: '#ef4444' },
  transfer: { label: 'Transferred', color: '#3b82f6' },
  voicemail: { label: 'Voicemail', color: '#8b5cf6' },
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatConfidence(c: number): { label: string; color: string } {
  if (c >= 0.9) return { label: `${Math.round(c * 100)}%`, color: '#22c55e' };
  if (c >= 0.7) return { label: `${Math.round(c * 100)}%`, color: '#f59e0b' };
  return { label: `${Math.round(c * 100)}%`, color: '#ef4444' };
}

function formatSentiment(s: number): { label: string; icon: typeof ThumbsUp; color: string } {
  if (s >= 0.3) return { label: 'Positive', icon: ThumbsUp, color: '#22c55e' };
  if (s >= -0.3) return { label: 'Neutral', icon: Minus, color: '#9ca3af' };
  return { label: 'Negative', icon: ThumbsDown, color: '#ef4444' };
}

type StatusFilter = 'all' | 'resolved' | 'escalated';
type DetailTab = 'transcript' | 'analysis';

interface LogsPageProps {
  conversationLogs: ConversationLog[];
  onRemoveLog: (id: string) => void;
  onClearLogs: () => void;
  onAddScenario: (scenario: Omit<TestScenario, 'id'>) => void;
  isGlobalView?: boolean;
  agentName?: string;
  agentMode?: 'chat' | 'voice';
}

export default function LogsPage({
  conversationLogs,
  onRemoveLog,
  onClearLogs,
  onAddScenario,
  isGlobalView,
  agentName,
  agentMode,
}: LogsPageProps) {
  const isVoice = agentMode === 'voice';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('transcript');
  const [isPlaying, setIsPlaying] = useState(false);

  const filtered = conversationLogs.filter(log => {
    if (filter !== 'all') {
      const status = deriveConversationStatus(log.messages);
      if (status !== filter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const matchesMessage = log.messages.some(m => m.content.toLowerCase().includes(q));
      const matchesPersona = log.persona.toLowerCase().includes(q);
      const matchesTitle = deriveConversationTitle(log.messages).toLowerCase().includes(q);
      const matchesPhone = log.fromNumber?.toLowerCase().includes(q) || log.toNumber?.toLowerCase().includes(q);
      if (!matchesMessage && !matchesPersona && !matchesTitle && !matchesPhone) return false;
    }
    return true;
  });

  const selectedLog = selectedLogId ? conversationLogs.find(l => l.id === selectedLogId) : null;

  const handleCreateTest = (log: ConversationLog) => {
    const firstUserMsg = log.messages.find(m => m.role === 'user');
    const steps = log.messages
      .filter(m => m.role === 'user')
      .map(m => {
        const idx = log.messages.indexOf(m);
        const agentResponse = log.messages.slice(idx + 1).find(r => r.role === 'agent');
        return {
          userMessage: m.content,
          expectedBehavior: agentResponse ? agentResponse.content.slice(0, 80) + (agentResponse.content.length > 80 ? '...' : '') : '',
        };
      });
    onAddScenario({
      name: deriveConversationTitle(log.messages),
      description: `Created from ${log.persona} ${isVoice ? 'call' : 'conversation'}`,
      steps,
      scenario: firstUserMsg?.content || '',
      successCriteria: `Agent resolves the ${log.persona.toLowerCase()} ${isVoice ? 'call' : 'conversation'} successfully`,
      maxTurns: Math.ceil(log.messages.length / 2),
      persona: log.persona.toLowerCase().replace(/\s+/g, '_'),
      variables: [],
      result: null,
      notes: [],
      conversation: [],
      lastRunAt: null,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Page header */}
      <div className="flex items-center justify-between px-8 py-5 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            {isVoice ? <Phone className="h-5 w-5 text-primary" /> : <ScrollText className="h-5 w-5 text-primary" />}
          </div>
          <div>
            <h1 className="text-[18px] font-semibold">
              {isGlobalView ? 'All Conversation Logs' : isVoice ? 'Call Logs' : 'Conversation Logs'}
            </h1>
            <p className="text-[13px] text-muted-foreground">
              {isGlobalView
                ? 'Logs across all agents.'
                : isVoice
                  ? `Review recorded calls${agentName ? ` for ${agentName}` : ''} and create tests from them.`
                  : `Review saved conversations${agentName ? ` for ${agentName}` : ''} and create tests from them.`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isVoice ? 'Search calls...' : 'Search logs...'}
              className="pl-8 w-[220px] text-[13px]"
            />
          </div>
          {conversationLogs.length > 0 && (
            <Button variant="outline" size="sm" className="h-8 text-[12px] text-destructive hover:text-destructive gap-1" onClick={onClearLogs}>
              <Trash2 className="h-3 w-3" /> Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      {conversationLogs.length > 0 && (
        <div className="px-8 py-2.5 border-b shrink-0 flex items-center gap-1.5">
          {(['all', 'resolved', 'escalated'] as const).map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            );
          })}
          <span className="text-[11px] text-muted-foreground ml-auto">
            {filtered.length} {isVoice ? 'call' : 'conversation'}{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Master-detail layout */}
      {conversationLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            {isVoice ? <Phone className="h-7 w-7 text-muted-foreground" /> : <ScrollText className="h-7 w-7 text-muted-foreground" />}
          </div>
          <h4 className="text-[16px] font-semibold mb-1">{isVoice ? 'No call logs yet' : 'No conversations yet'}</h4>
          <p className="text-[13px] text-muted-foreground max-w-[320px]">
            {isVoice
              ? 'Call logs will appear here when calls are recorded or simulated.'
              : 'Conversations will appear here when you save them from the Simulate page.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: List */}
          <div className="w-[360px] shrink-0 border-r flex flex-col overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
                <p className="text-[13px] text-muted-foreground">No matches found.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y">
                {filtered.map((log) => {
                  const title = deriveConversationTitle(log.messages);
                  const status = deriveConversationStatus(log.messages);
                  const statusCfg = STATUS_CONFIG[status];
                  const isSelected = selectedLogId === log.id;

                  return (
                    <button
                      key={log.id}
                      className={`w-full px-5 py-3.5 text-left transition-colors ${
                        isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-accent/30'
                      }`}
                      onClick={() => { setSelectedLogId(log.id); setDetailTab('transcript'); setIsPlaying(false); }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <span className="text-[14px] font-medium truncate flex-1 leading-tight">{title}</span>
                        <Badge
                          className="text-[9px] px-1.5 h-4 font-medium border-0 shrink-0 mt-0.5"
                          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      {/* Voice: show direction + phone + duration */}
                      {isVoice && log.callType ? (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          {log.direction === 'inbound' ? (
                            <PhoneIncoming className="h-3 w-3" />
                          ) : (
                            <PhoneOutgoing className="h-3 w-3" />
                          )}
                          <span>{log.fromNumber || 'Web call'}</span>
                          <span>&middot;</span>
                          <span>{log.duration != null ? formatDuration(log.duration) : `${log.messages.length} turns`}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <span>{log.persona}</span>
                          <span>&middot;</span>
                          <span>{log.messages.length} msgs</span>
                          <span>&middot;</span>
                          <span>{getConversationDuration(log.messages)}m</span>
                        </div>
                      )}
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(log.timestamp)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Detail view */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {selectedLog ? (
              <>
                {/* Detail header */}
                <div className="px-6 py-5 border-b shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[16px] font-semibold truncate flex-1">
                      {deriveConversationTitle(selectedLog.messages)}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button variant="ghost" size="icon-sm" onClick={() => { onRemoveLog(selectedLog.id); setSelectedLogId(null); }} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Voice call metadata row */}
                  {isVoice && selectedLog.callType ? (
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        {selectedLog.direction === 'inbound' ? <PhoneIncoming className="h-3 w-3" /> : <PhoneOutgoing className="h-3 w-3" />}
                        <span className="capitalize">{selectedLog.direction}</span>
                      </div>
                      <span>&middot;</span>
                      {selectedLog.callType === 'phone' ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{selectedLog.fromNumber} → {selectedLog.toNumber}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span>Web call</span>
                        </div>
                      )}
                      <span>&middot;</span>
                      <span>{new Date(selectedLog.timestamp).toLocaleDateString()} {new Date(selectedLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
                      <span>{selectedLog.persona}</span>
                      <span>&middot;</span>
                      <span>{new Date(selectedLog.timestamp).toLocaleDateString()} {new Date(selectedLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => {
                      const s = deriveConversationStatus(selectedLog.messages);
                      const c = STATUS_CONFIG[s];
                      return <Badge className="text-[10px] px-2 h-5 font-medium border-0" style={{ backgroundColor: c.bg, color: c.color }}>{c.label}</Badge>;
                    })()}

                    {/* Voice-specific badges */}
                    {isVoice && selectedLog.duration != null && (
                      <Badge variant="secondary" className="text-[10px] px-2 h-5 font-medium gap-1">
                        <Timer className="h-3 w-3" />
                        {formatDuration(selectedLog.duration)}
                      </Badge>
                    )}
                    {isVoice && selectedLog.endReason && END_REASON_LABELS[selectedLog.endReason] && (
                      <Badge variant="secondary" className="text-[10px] px-2 h-5 font-medium gap-1">
                        <ArrowRightLeft className="h-3 w-3" />
                        {END_REASON_LABELS[selectedLog.endReason].label}
                      </Badge>
                    )}
                    {isVoice && selectedLog.successEvaluation && (
                      <Badge className="text-[10px] px-2 h-5 font-medium border-0" style={{
                        backgroundColor: selectedLog.successEvaluation === 'success' ? '#f0fdf4' : selectedLog.successEvaluation === 'failure' ? '#fef2f2' : '#f9fafb',
                        color: selectedLog.successEvaluation === 'success' ? '#22c55e' : selectedLog.successEvaluation === 'failure' ? '#ef4444' : '#9ca3af',
                      }}>
                        {selectedLog.successEvaluation === 'success' ? 'Success' : selectedLog.successEvaluation === 'failure' ? 'Failed' : 'Unknown'}
                      </Badge>
                    )}

                    {/* Non-voice: turn count */}
                    {!isVoice && (
                      <span className="text-[11px] text-muted-foreground">
                        {selectedLog.messages.length} messages &middot; {getConversationDuration(selectedLog.messages)}m
                      </span>
                    )}
                  </div>
                </div>

                {/* Recording player (voice only) */}
                {isVoice && selectedLog.recordingUrl && (
                  <div className="px-6 py-3 border-b shrink-0 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                      >
                        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                      </button>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary/60 rounded-full" style={{ width: isPlaying ? '35%' : '0%', transition: 'width 0.3s' }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{isPlaying ? '1:05' : '0:00'}</span>
                          <span>{selectedLog.duration != null ? formatDuration(selectedLog.duration) : '--:--'}</span>
                        </div>
                      </div>
                      <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                )}

                {/* Tab bar (voice only) */}
                {isVoice && (
                  <div className="px-6 border-b shrink-0 flex items-center gap-2">
                    {([
                      { key: 'transcript' as const, label: 'Transcript', icon: FileText },
                      { key: 'analysis' as const, label: 'Analysis', icon: Activity },
                    ]).map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setDetailTab(key)}
                        className={`flex items-center gap-1.5 px-3 py-3 text-[12px] font-medium border-b-2 transition-colors ${
                          detailTab === key
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Content area */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {detailTab === 'transcript' || !isVoice ? (
                    <div className="space-y-4">
                      {selectedLog.messages.map((msg, i) => (
                        <div key={i}>
                          <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'agent' && (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                                <Bot className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div className={msg.role === 'user' ? 'max-w-[85%]' : 'max-w-[85%]'}>
                              {/* Interruption indicator */}
                              {isVoice && msg.interrupted && (
                                <div className="flex items-center gap-1 text-[10px] text-amber-600 mb-1 px-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Interrupted</span>
                                </div>
                              )}
                              <div
                                className={`rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                                  msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-md'
                                    : 'bg-muted text-foreground rounded-bl-md'
                                }`}
                              >
                                {msg.content}
                              </div>
                              {/* Per-turn metadata */}
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1 px-1">
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                {/* STT confidence for user turns */}
                                {isVoice && msg.role === 'user' && msg.confidence != null && (
                                  <>
                                    <span>&middot;</span>
                                    <span className="flex items-center gap-0.5">
                                      <Mic className="h-2.5 w-2.5" />
                                      <span style={{ color: formatConfidence(msg.confidence).color }}>
                                        {formatConfidence(msg.confidence).label}
                                      </span>
                                    </span>
                                  </>
                                )}
                                {/* Latency for agent turns */}
                                {isVoice && msg.role === 'agent' && msg.latencyMs != null && (
                                  <>
                                    <span>&middot;</span>
                                    <span className="flex items-center gap-0.5">
                                      <Timer className="h-2.5 w-2.5" />
                                      {msg.latencyMs}ms
                                    </span>
                                  </>
                                )}
                              </div>
                              {/* Event trace — inside bubble container to match width */}
                              {msg.role === 'agent' && msg.debug && (msg.debug.tools?.length > 0 || msg.debug.guardrails?.length > 0) && (
                                <div className="mt-1.5">
                                  <div className="rounded-lg bg-muted/60 border p-2.5 text-[11px] space-y-1.5">
                                    {msg.debug.node && (
                                      <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="font-medium">Node:</span>
                                        <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">{msg.debug.node}</Badge>
                                      </div>
                                    )}
                                    {msg.debug.tools && msg.debug.tools.length > 0 && (
                                      <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Zap className="h-3 w-3" />
                                        <span>{msg.debug.tools.join(', ')}</span>
                                      </div>
                                    )}
                                    {msg.debug.guardrails && msg.debug.guardrails.length > 0 && (
                                      <div className="flex items-center gap-1.5 text-amber-600">
                                        <BookOpen className="h-3 w-3" />
                                        <span>{msg.debug.guardrails.join(', ')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            {msg.role === 'user' && (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Status indicator */}
                      {(() => {
                        const s = deriveConversationStatus(selectedLog.messages);
                        const c = STATUS_CONFIG[s];
                        return (
                          <div className="flex items-center justify-center py-3">
                            <div className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full" style={{ backgroundColor: c.bg, color: c.color }}>
                              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                              {c.label}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    /* Analysis tab (voice only) */
                    <div className="space-y-6">
                      {/* Post-call summary */}
                      {selectedLog.summary && (
                        <div>
                          <h3 className="text-[13px] font-semibold mb-2 flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            Call Summary
                          </h3>
                          <p className="text-[13px] text-muted-foreground leading-relaxed bg-muted/40 rounded-lg p-3 border">
                            {selectedLog.summary}
                          </p>
                        </div>
                      )}

                      {/* Sentiment */}
                      {selectedLog.sentiment != null && (
                        <div>
                          <h3 className="text-[13px] font-semibold mb-2">Caller Sentiment</h3>
                          <div className="flex items-center gap-3">
                            {(() => {
                              const s = formatSentiment(selectedLog.sentiment);
                              const Icon = s.icon;
                              return (
                                <>
                                  <div className="flex items-center gap-1.5 text-[13px]" style={{ color: s.color }}>
                                    <Icon className="h-4 w-4" />
                                    <span className="font-medium">{s.label}</span>
                                  </div>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[200px]">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${((selectedLog.sentiment + 1) / 2) * 100}%`,
                                        backgroundColor: s.color,
                                      }}
                                    />
                                  </div>
                                  <span className="text-[11px] text-muted-foreground">{selectedLog.sentiment.toFixed(2)}</span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Latency metrics */}
                      {selectedLog.latency && (
                        <div>
                          <h3 className="text-[13px] font-semibold mb-2 flex items-center gap-1.5">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            Latency (avg)
                          </h3>
                          <div className="grid grid-cols-4 gap-3">
                            {([
                              { label: 'End-to-End', value: selectedLog.latency.e2e },
                              { label: 'STT', value: selectedLog.latency.stt },
                              { label: 'LLM', value: selectedLog.latency.llm },
                              { label: 'TTS', value: selectedLog.latency.tts },
                            ] as const).map(({ label, value }) => (
                              <div key={label} className="rounded-lg border p-3 text-center">
                                <div className="text-[18px] font-semibold">{value}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{label} (ms)</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cost breakdown */}
                      {selectedLog.cost && (
                        <div>
                          <h3 className="text-[13px] font-semibold mb-2 flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            Cost Breakdown
                          </h3>
                          <table className="w-full rounded-lg border overflow-hidden text-left">
                            <thead>
                              <tr className="text-[11px] font-medium text-muted-foreground bg-muted/40">
                                <th className="px-3 py-2 font-medium">STT</th>
                                <th className="px-3 py-2 font-medium">LLM</th>
                                <th className="px-3 py-2 font-medium">TTS</th>
                                <th className="px-3 py-2 font-medium">Telephony</th>
                                <th className="px-3 py-2 font-medium text-foreground">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="text-[13px]">
                                <td className="px-3 py-2.5">${selectedLog.cost.stt.toFixed(3)}</td>
                                <td className="px-3 py-2.5">${selectedLog.cost.llm.toFixed(3)}</td>
                                <td className="px-3 py-2.5">${selectedLog.cost.tts.toFixed(3)}</td>
                                <td className="px-3 py-2.5">${selectedLog.cost.telephony.toFixed(3)}</td>
                                <td className="px-3 py-2.5 font-semibold">${selectedLog.cost.total.toFixed(3)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Call details */}
                      <div>
                        <h3 className="text-[13px] font-semibold mb-2">Call Details</h3>
                        <div className="rounded-lg border divide-y text-[12px]">
                          {selectedLog.callType && (
                            <div className="flex items-center justify-between px-3 py-2">
                              <span className="text-muted-foreground">Type</span>
                              <span className="font-medium capitalize">{selectedLog.callType === 'phone' ? 'Phone call' : 'Web call'}</span>
                            </div>
                          )}
                          {selectedLog.direction && (
                            <div className="flex items-center justify-between px-3 py-2">
                              <span className="text-muted-foreground">Direction</span>
                              <span className="font-medium capitalize">{selectedLog.direction}</span>
                            </div>
                          )}
                          {selectedLog.fromNumber && (
                            <div className="flex items-center justify-between px-3 py-2">
                              <span className="text-muted-foreground">From</span>
                              <span className="font-medium font-mono text-[11px]">{selectedLog.fromNumber}</span>
                            </div>
                          )}
                          {selectedLog.toNumber && (
                            <div className="flex items-center justify-between px-3 py-2">
                              <span className="text-muted-foreground">To</span>
                              <span className="font-medium font-mono text-[11px]">{selectedLog.toNumber}</span>
                            </div>
                          )}
                          {selectedLog.duration != null && (
                            <div className="flex items-center justify-between px-3 py-2">
                              <span className="text-muted-foreground">Duration</span>
                              <span className="font-medium">{formatDuration(selectedLog.duration)} ({selectedLog.duration}s)</span>
                            </div>
                          )}
                          {selectedLog.endReason && (
                            <div className="flex items-center justify-between px-3 py-2">
                              <span className="text-muted-foreground">End reason</span>
                              <span className="font-medium">{END_REASON_LABELS[selectedLog.endReason]?.label ?? selectedLog.endReason}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between px-3 py-2">
                            <span className="text-muted-foreground">Turns</span>
                            <span className="font-medium">{selectedLog.messages.length}</span>
                          </div>
                          {selectedLog.recordingUrl && (
                            <div className="flex items-center justify-between px-3 py-2">
                              <span className="text-muted-foreground">Recording</span>
                              <span className="font-medium text-primary text-[11px] font-mono truncate max-w-[200px]">{selectedLog.recordingUrl}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-3 border-t shrink-0">
                  <Button variant="outline" size="sm" className="h-8 text-[12px] gap-1.5" onClick={() => handleCreateTest(selectedLog)}>
                    <FlaskConical className="h-3.5 w-3.5" /> Create Test Scenario
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
                  {isVoice ? <Phone className="h-6 w-6 text-muted-foreground" /> : <ScrollText className="h-6 w-6 text-muted-foreground" />}
                </div>
                <h4 className="text-[15px] font-semibold mb-1">{isVoice ? 'Select a call' : 'Select a conversation'}</h4>
                <p className="text-[13px] text-muted-foreground max-w-[260px]">
                  {isVoice ? 'Click on a call from the list to view its details.' : 'Click on a conversation from the list to view its details.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
