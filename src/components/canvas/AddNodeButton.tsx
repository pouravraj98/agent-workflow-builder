import { Plus, Bot, Wrench, StopCircle } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import type { NodeType } from '@/hooks/useCanvasState';
import { useState } from 'react';

interface AddNodeButtonProps {
  parentNodeId: string;
  onAddNode: (type: NodeType, parentNodeId: string) => void;
}

const nodeOptions: { type: NodeType; icon: typeof Bot; label: string; description: string; color: string }[] = [
  { type: 'agent', icon: Bot, label: 'Agent', description: 'Transfer to another agent', color: 'var(--node-agent)' },
  { type: 'tool', icon: Wrench, label: 'Tool', description: 'Call a tool or function', color: 'var(--node-tool)' },
  { type: 'end', icon: StopCircle, label: 'End', description: 'Terminate the flow', color: 'var(--node-end)' },
];

export default function AddNodeButton({ parentNodeId, onAddNode }: AddNodeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 z-20" data-add-node>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full border bg-background text-muted-foreground/60 shadow-sm transition-all duration-150 hover:scale-110 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md"
            onClick={(e) => e.stopPropagation()}
            aria-label="Add node"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="center" sideOffset={8} className="w-52 p-1.5">
          {nodeOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddNode(opt.type, parentNodeId);
                  setOpen(false);
                }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `color-mix(in srgb, ${opt.color} 12%, transparent)` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: opt.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium leading-tight">{opt.label}</div>
                  <div className="text-[11px] text-muted-foreground leading-tight">{opt.description}</div>
                </div>
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}
