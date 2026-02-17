import {
  LayoutGrid, BookOpen, Wrench, Play, ScrollText,
  Network, Palette, ArrowLeft,
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { AppLevel, DashboardView, AgentView } from '@/hooks/useCanvasState';

export type { AppLevel, DashboardView, AgentView };

const DASHBOARD_BUILD_ITEMS = [
  { id: 'home' as const, icon: LayoutGrid, label: 'Agents' },
  { id: 'knowledge' as const, icon: BookOpen, label: 'Knowledge Base' },
  { id: 'tools' as const, icon: Wrench, label: 'Tools' },
];

const DASHBOARD_TEST_ITEMS = [
  { id: 'simulate' as const, icon: Play, label: 'Simulate' },
  { id: 'logs' as const, icon: ScrollText, label: 'Logs' },
];

const AGENT_BUILD_ITEMS = [
  { id: 'workflow' as const, icon: Network, label: 'Workflow' },
  { id: 'appearance' as const, icon: Palette, label: 'Appearance' },
  { id: 'knowledge' as const, icon: BookOpen, label: 'Knowledge Base' },
  { id: 'tools' as const, icon: Wrench, label: 'Tools' },
];

const AGENT_TEST_ITEMS = [
  { id: 'simulate' as const, icon: Play, label: 'Simulate' },
  { id: 'logs' as const, icon: ScrollText, label: 'Logs' },
];

interface LeftSidebarProps {
  appLevel: AppLevel;
  dashboardView: DashboardView;
  agentView: AgentView;
  onDashboardViewChange: (view: DashboardView) => void;
  onAgentViewChange: (view: AgentView) => void;
  onBackToDashboard: () => void;
  activeAgentColor?: string;
}

export default function LeftSidebar({
  appLevel,
  dashboardView,
  agentView,
  onDashboardViewChange,
  onAgentViewChange,
  onBackToDashboard,
  activeAgentColor,
}: LeftSidebarProps) {
  const renderItem = (
    item: { id: string; icon: React.ComponentType<{ className?: string }>; label: string },
    isActive: boolean,
    onClick: () => void,
  ) => {
    const Icon = item.icon;
    return (
      <Tooltip key={item.id} delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`sidebar-item flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              isActive
                ? 'active bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            aria-label={item.label}
          >
            <Icon className="h-[18px] w-[18px]" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  if (appLevel === 'agent') {
    return (
      <div className="flex w-[60px] flex-col items-center border-r bg-background py-3 gap-1 shrink-0">
        {/* Back button */}
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              onClick={onBackToDashboard}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors mb-1"
              aria-label="Back to Agents"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Back to Agents
          </TooltipContent>
        </Tooltip>

        {/* Agent color indicator */}
        {activeAgentColor && (
          <div className="mb-1">
            <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: activeAgentColor }} />
          </div>
        )}

        {AGENT_BUILD_ITEMS.map((item) =>
          renderItem(item, agentView === item.id, () => onAgentViewChange(item.id))
        )}

        <div className="w-6 border-t my-1.5" />

        {AGENT_TEST_ITEMS.map((item) =>
          renderItem(item, agentView === item.id, () => onAgentViewChange(item.id))
        )}
      </div>
    );
  }

  return (
    <div className="flex w-[60px] flex-col items-center border-r bg-background py-3 gap-1 shrink-0">
      {DASHBOARD_BUILD_ITEMS.map((item) =>
        renderItem(item, dashboardView === item.id, () => onDashboardViewChange(item.id))
      )}

      <div className="w-6 border-t my-1.5" />

      {DASHBOARD_TEST_ITEMS.map((item) =>
        renderItem(item, dashboardView === item.id, () => onDashboardViewChange(item.id))
      )}
    </div>
  );
}
