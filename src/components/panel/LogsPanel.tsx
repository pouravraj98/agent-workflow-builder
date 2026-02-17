import { useState } from 'react';
import {
  Search, ArrowLeft, Trash2, Bot, User, ScrollText,
  Clock, FlaskConical, Zap, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { ConversationLog, TestScenario } from '@/hooks/useCanvasState';
import {
  deriveConversationTitle,
  deriveConversationStatus,
  getConversationDuration,
  formatRelativeTime,
} from '@/data/mockData';

// ── Status config ──

const STATUS_CONFIG = {
  resolved: { label: 'Resolved', color: '#22c55e', bg: '#f0fdf4' },
  escalated: { label: 'Escalated', color: '#f59e0b', bg: '#fffbeb' },
  pending: { label: 'Pending', color: '#9ca3af', bg: '#f9fafb' },
};

type StatusFilter = 'all' | 'resolved' | 'escalated';

// ── Props ──

interface LogsPanelProps {
  conversationLogs: ConversationLog[];
  onRemoveLog: (id: string) => void;
  onClearLogs: () => void;
  onAddScenario: (scenario: Omit<TestScenario, 'id'>) => void;
}

// ── Component ──

export default function LogsPanel({
  conversationLogs,
  onRemoveLog,
  onClearLogs,
  onAddScenario,
}: LogsPanelProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Filtering
  const filtered = conversationLogs.filter(log => {
    // Status filter
    if (filter !== 'all') {
      const status = deriveConversationStatus(log.messages);
      if (status !== filter) return false;
    }
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const matchesMessage = log.messages.some(m => m.content.toLowerCase().includes(q));
      const matchesPersona = log.persona.toLowerCase().includes(q);
      const matchesTitle = deriveConversationTitle(log.messages).toLowerCase().includes(q);
      if (!matchesMessage && !matchesPersona && !matchesTitle) return false;
    }
    return true;
  });

  const selectedLog = selectedLogId ? conversationLogs.find(l => l.id === selectedLogId) : null;

  // Create test scenario from conversation
  const handleCreateTest = (log: ConversationLog) => {
    const steps = log.messages
      .filter(m => m.role === 'user')
      .map(m => {
        // Find the next agent response
        const idx = log.messages.indexOf(m);
        const agentResponse = log.messages.slice(idx + 1).find(r => r.role === 'agent');
        return {
          userMessage: m.content,
          expectedBehavior: agentResponse ? agentResponse.content.slice(0, 80) + (agentResponse.content.length > 80 ? '...' : '') : '',
        };
      });
    onAddScenario({
      name: deriveConversationTitle(log.messages),
      description: `Created from ${log.persona} conversation`,
      steps,
    });
  };

  // ── Detail view ──

  if (selectedLog) {
    const status = deriveConversationStatus(selectedLog.messages);
    const statusCfg = STATUS_CONFIG[status];
    const duration = getConversationDuration(selectedLog.messages);
    const date = new Date(selectedLog.timestamp);

    return (
      <div className="flex h-full flex-col">
        {/* Detail header */}
        <div className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => setSelectedLogId(null)}
              className="flex items-center text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-[14px] font-semibold flex-1 truncate">
              {deriveConversationTitle(selectedLog.messages)}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => { onRemoveLog(selectedLog.id); setSelectedLogId(null); }}
              className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2 ml-5.5 text-[10px] text-muted-foreground">
            <span>{selectedLog.persona}</span>
            <span>&middot;</span>
            <span>{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-2 ml-5.5 mt-0.5">
            <Badge
              className="text-[9px] px-1.5 h-4 font-medium border-0"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {selectedLog.messages.length} messages &middot; {duration}m
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            {selectedLog.messages.map((msg, i) => (
              <div key={i}>
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
                    <div className="text-[9px] text-muted-foreground mt-0.5 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Event trace for agent messages */}
                {msg.role === 'agent' && msg.debug && (msg.debug.tools?.length > 0 || msg.debug.guardrails?.length > 0) && (
                  <div className="ml-8 mt-1">
                    <div className="rounded-lg bg-muted/60 border p-2 text-[10px] space-y-1">
                      {msg.debug.node && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="font-medium">Node:</span>
                          <Badge variant="secondary" className="h-3.5 px-1 text-[8px]">{msg.debug.node}</Badge>
                        </div>
                      )}
                      {msg.debug.tools && msg.debug.tools.length > 0 && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Zap className="h-2.5 w-2.5" />
                          <span>{msg.debug.tools.join(', ')}</span>
                        </div>
                      )}
                      {msg.debug.guardrails && msg.debug.guardrails.length > 0 && (
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <BookOpen className="h-2.5 w-2.5" />
                          <span>{msg.debug.guardrails.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Status indicator at bottom */}
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-full" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusCfg.color }} />
                {statusCfg.label}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-2.5 border-t shrink-0 flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1 flex-1"
            onClick={() => handleCreateTest(selectedLog)}
          >
            <FlaskConical className="h-3 w-3" /> Create Test
          </Button>
        </div>
      </div>
    );
  }

  // ── List view ──

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[12px] font-medium">Conversations</span>
          {conversationLogs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] text-destructive hover:text-destructive px-2"
              onClick={onClearLogs}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Search */}
        {conversationLogs.length > 0 && (
          <div className="relative mb-2.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="pl-8 text-[12px] h-8"
            />
          </div>
        )}

        {/* Filter chips */}
        {conversationLogs.length > 0 && (
          <div className="flex gap-1">
            {(['all', 'resolved', 'escalated'] as const).map((f) => {
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Conversation list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
            <ScrollText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="text-[14px] font-semibold mb-1">
            {conversationLogs.length === 0 ? 'No conversations yet' : 'No matches'}
          </h4>
          <p className="text-[12px] text-muted-foreground max-w-[220px]">
            {conversationLogs.length === 0
              ? 'Conversations will appear here when you save them from the Simulate chat.'
              : 'Try a different search term or filter.'
            }
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y">
          {filtered.map((log) => {
            const title = deriveConversationTitle(log.messages);
            const status = deriveConversationStatus(log.messages);
            const statusCfg = STATUS_CONFIG[status];
            const duration = getConversationDuration(log.messages);

            return (
              <button
                key={log.id}
                className="w-full px-4 py-3 text-left hover:bg-accent/30 transition-colors"
                onClick={() => setSelectedLogId(log.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <span className="text-[13px] font-medium truncate flex-1 leading-tight">{title}</span>
                  <Badge
                    className="text-[8px] px-1 h-3.5 font-medium border-0 shrink-0 mt-0.5"
                    style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                  >
                    {statusCfg.label}
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <span>{log.persona}</span>
                  <span>&middot;</span>
                  <span>{log.messages.length} msgs</span>
                  <span>&middot;</span>
                  <span>{duration}m</span>
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  <span>{formatRelativeTime(log.timestamp)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer count */}
      {conversationLogs.length > 0 && (
        <div className="px-4 py-2 border-t shrink-0">
          <span className="text-[10px] text-muted-foreground">
            {filtered.length} conversation{filtered.length !== 1 ? 's' : ''}
            {filter !== 'all' && ` (filtered from ${conversationLogs.length})`}
          </span>
        </div>
      )}
    </div>
  );
}
