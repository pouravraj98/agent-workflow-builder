import { useState } from 'react';
import {
  LayoutGrid, Plus, Trash2, Network, Clock, AudioWaveform,
  Bot, MessageSquare, Headphones, ShieldCheck, Sparkles, Zap,
  Heart, Brain, Globe, Rocket, Star, Coffee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateAgentWizard from '@/components/CreateAgentWizard';
import type { AgentState } from '@/hooks/useCanvasState';

const AVATAR_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  bot: Bot, message: MessageSquare, headphones: Headphones, shield: ShieldCheck,
  sparkles: Sparkles, zap: Zap, heart: Heart, brain: Brain,
  globe: Globe, rocket: Rocket, star: Star, coffee: Coffee,
};

interface AgentDashboardProps {
  agents: Record<string, AgentState>;
  onCreateAgent: (name: string, description: string, systemPrompt: string, mode: 'chat' | 'voice') => void;
  onDeleteAgent: (agentId: string) => void;
  onSelectAgent: (agentId: string) => void;
}

export default function AgentDashboard({
  agents,
  onCreateAgent,
  onDeleteAgent,
  onSelectAgent,
}: AgentDashboardProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const agentList = Object.values(agents).sort(
    (a, b) => new Date(b.agent.createdAt).getTime() - new Date(a.agent.createdAt).getTime()
  );

  const handleDelete = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete === agentId) {
      onDeleteAgent(agentId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(agentId);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <LayoutGrid className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold">Agents</h1>
            <p className="text-[13px] text-muted-foreground">
              Create and manage your AI agents.
            </p>
          </div>
        </div>
        <Button size="sm" className="h-8 text-[12px] gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" /> Create Agent
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full px-8 py-6">
        {agentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <Bot className="h-7 w-7 text-muted-foreground" />
            </div>
            <h4 className="text-[16px] font-semibold mb-1">No agents yet</h4>
            <p className="text-[13px] text-muted-foreground max-w-[320px] mb-4">
              Create your first agent to start building AI workflows.
            </p>
            <Button size="sm" className="h-8 text-[12px] gap-1.5" onClick={() => setShowCreate(true)}>
              <Plus className="h-3.5 w-3.5" /> Create Agent
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agentList.map(({ agent, nodes }) => {
              const AgentIcon = AVATAR_ICONS[agent.avatar] || Bot;
              const isConfirming = confirmDelete === agent.id;

              return (
                <button
                  key={agent.id}
                  onClick={() => onSelectAgent(agent.id)}
                  className="group relative text-left rounded-xl border bg-background p-5 transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  {/* Delete button */}
                  <div
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDelete(agent.id, e)}
                    onMouseLeave={() => setConfirmDelete(null)}
                  >
                    <div
                      className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] cursor-pointer transition-colors ${
                        isConfirming
                          ? 'bg-destructive/10 text-destructive'
                          : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5'
                      }`}
                    >
                      <Trash2 className="h-3 w-3" />
                      {isConfirming && <span>Confirm</span>}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl mb-3"
                    style={{ backgroundColor: agent.color + '15' }}
                  >
                    <AgentIcon className="h-5 w-5" style={{ color: agent.color }} />
                  </div>

                  {/* Info */}
                  <div className="text-[14px] font-semibold leading-tight truncate mb-0.5">
                    {agent.name}
                  </div>
                  {agent.description && (
                    <div className="text-[12px] text-muted-foreground leading-snug line-clamp-2 mb-3">
                      {agent.description}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {agent.mode === 'voice' ? <AudioWaveform className="h-3 w-3" /> : <Network className="h-3 w-3" />}
                      {agent.mode === 'voice' ? 'Voice' : `${nodes.length} nodes`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Create card */}
            <button
              onClick={() => setShowCreate(true)}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-5 min-h-[160px] transition-colors hover:border-primary/30 hover:bg-muted/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted mb-2">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-[13px] font-medium text-muted-foreground">New Agent</span>
            </button>
          </div>
        )}
        </div>
      </div>

      <CreateAgentWizard
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreateAgent={onCreateAgent}
      />
    </div>
  );
}
