import { X, Trash2, ArrowRight, Play, Bot, Wrench, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WorkflowNode, WorkflowEdge, EdgeType } from '@/hooks/useCanvasState';

const EDGE_TYPE_OPTIONS: { value: EdgeType; label: string }[] = [
  { value: 'llm', label: 'LLM Condition' },
  { value: 'handoff', label: 'Handoff' },
  { value: 'escalate', label: 'Escalate' },
  { value: 'delegate', label: 'Delegate' },
  { value: 'conditional', label: 'Conditional' },
  { value: 'fallback', label: 'Fallback' },
  { value: 'default', label: 'Default' },
];

const nodeIconMap: Record<string, typeof Bot> = {
  start: Play, agent: Bot, tool: Wrench, end: StopCircle,
};
const nodeColorMap: Record<string, string> = {
  start: 'var(--node-start)', agent: 'var(--node-agent)',
  tool: 'var(--node-tool)', end: 'var(--node-end)',
};
const nodeBgMap: Record<string, string> = {
  start: 'var(--node-start-light)', agent: 'var(--node-agent-light)',
  tool: 'var(--node-tool-light)', end: 'var(--node-end-light)',
};

interface EdgePanelProps {
  edge: WorkflowEdge;
  nodes: WorkflowNode[];
  onClose: () => void;
  onUpdateEdge: (edgeId: string, updates: Partial<WorkflowEdge>) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export default function EdgePanel({
  edge,
  nodes,
  onClose,
  onUpdateEdge,
  onDeleteEdge,
}: EdgePanelProps) {
  const sourceNode = nodes.find(n => n.id === edge.sourceId);
  const targetNode = nodes.find(n => n.id === edge.targetId);

  const renderNodeChip = (node: WorkflowNode | undefined) => {
    if (!node) return <span className="text-muted-foreground">Unknown</span>;
    const Icon = nodeIconMap[node.type] || Bot;
    const color = nodeColorMap[node.type] || nodeColorMap.agent;
    const bg = nodeBgMap[node.type] || nodeBgMap.agent;
    return (
      <div className="flex items-center gap-1.5">
        <div
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
          style={{ backgroundColor: bg }}
        >
          <Icon className="h-2.5 w-2.5" style={{ color }} />
        </div>
        <span className="text-[13px] font-medium truncate">{node.label}</span>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[14px] font-semibold">
                {edge.label || 'Connection'}
              </h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium shrink-0">
                {edge.type}
              </Badge>
            </div>
          </div>
        </div>
        <div className="ml-3 flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDeleteEdge(edge.id)}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete connection"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground"
            aria-label="Close panel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Route */}
        <div>
          <div className="section-label mb-3">Route</div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            {renderNodeChip(sourceNode)}
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {renderNodeChip(targetNode)}
          </div>
        </div>

        {/* Type */}
        <div>
          <div className="section-label mb-3">Transition</div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[12px]">Type</Label>
              <Select
                value={edge.type}
                onValueChange={(value) => onUpdateEdge(edge.id, { type: value as EdgeType })}
              >
                <SelectTrigger className="text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EDGE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[12px]">Label</Label>
              <Input
                value={edge.label}
                onChange={(e) => onUpdateEdge(edge.id, { label: e.target.value })}
                placeholder="e.g. On success, User frustrated..."
                className="text-[13px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[12px]">Condition</Label>
              <Textarea
                value={edge.condition}
                onChange={(e) => onUpdateEdge(edge.id, { condition: e.target.value })}
                placeholder="Routing condition (natural language)..."
                rows={3}
                className="text-[13px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
