import {
  Bot, MessageSquare, Headphones, ShieldCheck, Sparkles, Zap,
  Heart, Brain, Globe, Rocket, Star, Coffee,
  Play, ScrollText, BarChart3, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { AgentView } from '@/hooks/useCanvasState';

const AVATAR_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  bot: Bot, message: MessageSquare, headphones: Headphones, shield: ShieldCheck,
  sparkles: Sparkles, zap: Zap, heart: Heart, brain: Brain,
  globe: Globe, rocket: Rocket, star: Star, coffee: Coffee,
};

interface TopBarProps {
  agent: { id: string; name: string; description?: string; color?: string; avatar?: string } | null;
  onViewChange: (view: AgentView) => void;
  onBackToDashboard: () => void;
}

export default function TopBar({ agent, onViewChange, onBackToDashboard }: TopBarProps) {
  const AgentIcon = AVATAR_ICONS[agent?.avatar || 'bot'] || Bot;
  const agentColor = agent?.color || '#6366f1';

  return (
    <div className="flex h-12 items-center justify-between border-b bg-background shrink-0 px-5">
      {/* Left: Breadcrumb + Agent info */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onBackToDashboard}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          Agents
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: agentColor + '15' }}
          >
            <AgentIcon className="h-3 w-3" style={{ color: agentColor }} />
          </div>
          <span className="text-[13px] font-semibold leading-tight truncate">{agent?.name}</span>
        </div>
      </div>

      {/* Right: Workflow actions */}
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" className="h-7 text-[12px] gap-1.5" onClick={() => onViewChange('simulate')}>
          <Play className="h-3 w-3" />
          Simulate
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-[12px] gap-1.5" onClick={() => onViewChange('logs')}>
          <ScrollText className="h-3 w-3" />
          Logs
        </Button>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-[12px] gap-1.5" disabled>
              <BarChart3 className="h-3 w-3" />
              Analytics
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            Coming soon
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-[12px] gap-1.5" disabled>
              <Rocket className="h-3 w-3" />
              Deploy
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            Coming soon
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
