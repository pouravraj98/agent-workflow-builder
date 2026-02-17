import { useState } from 'react';
import { ChevronUp, ChevronDown, Bug, ScrollText, Braces, Bot, User, Clock, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ConversationLog, WorkflowNode, WorkflowEdge } from '@/hooks/useCanvasState';

interface BottomPanelProps {
  conversationLogs: ConversationLog[];
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onRemoveLog: (id: string) => void;
  onClearLogs: () => void;
}

const TABS = [
  { id: 'debugger' as const, label: 'Event Debugger', icon: Bug },
  { id: 'logs' as const, label: 'Logs', icon: ScrollText },
  { id: 'json' as const, label: 'JSON', icon: Braces },
];

export default function BottomPanel({ conversationLogs, nodes, edges, onRemoveLog, onClearLogs }: BottomPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<'debugger' | 'logs' | 'json'>('debugger');

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleTabClick = (tabId: typeof activeTab) => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    setActiveTab(tabId);
  };

  return (
    <div
      className="border-t bg-background shrink-0 flex flex-col"
      style={{ height: isCollapsed ? 36 : 240 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-9 shrink-0">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  !isCollapsed && activeTab === tab.id
                    ? 'text-foreground bg-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3 w-3" />
                {tab.label}
                {tab.id === 'logs' && conversationLogs.length > 0 && (
                  <span className="text-[9px] bg-muted-foreground/20 rounded-full px-1.5 min-w-[16px] text-center">
                    {conversationLogs.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleCollapse}
          className="h-6 w-6 text-muted-foreground"
        >
          {isCollapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto border-t">
          {/* Debugger Tab */}
          {activeTab === 'debugger' && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Sparkles className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-[12px] text-muted-foreground">
                Click on any message in emulator to inspect it.
              </p>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <>
              {conversationLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <ScrollText className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-[12px] text-muted-foreground">
                    No conversation logs yet.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between px-4 py-1.5 border-b">
                    <span className="text-[10px] text-muted-foreground">
                      {conversationLogs.length} conversation{conversationLogs.length !== 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 text-[10px] text-destructive hover:text-destructive px-1.5"
                      onClick={onClearLogs}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="divide-y">
                    {conversationLogs.map((log) => {
                      const date = new Date(log.timestamp);
                      return (
                        <div key={log.id} className="flex items-center justify-between px-4 py-2 hover:bg-accent/50">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">{log.persona}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {log.messages.length} msg{log.messages.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onRemoveLog(log.id)}
                            className="h-5 w-5 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* JSON Tab */}
          {activeTab === 'json' && (
            <pre className="px-4 py-3 text-[10px] font-mono text-muted-foreground leading-relaxed overflow-auto h-full">
              {JSON.stringify({ nodes: nodes.map(n => ({ id: n.id, type: n.type, label: n.label })), edges: edges.map(e => ({ id: e.id, type: e.type, source: e.sourceId, target: e.targetId })) }, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
