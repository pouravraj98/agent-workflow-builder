import { ArrowRight, ArrowLeft, Bot, Play, Wrench, StopCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WorkflowNode, WorkflowEdge, EdgeType } from '@/hooks/useCanvasState';

const EDGE_TYPE_OPTIONS: { value: EdgeType; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'handoff', label: 'Handoff' },
  { value: 'escalate', label: 'Escalate' },
  { value: 'delegate', label: 'Delegate' },
  { value: 'conditional', label: 'Conditional' },
  { value: 'fallback', label: 'Fallback' },
];

const EDGE_TYPE_COLORS: Record<EdgeType, string> = {
  default: '#6b7280',
  handoff: '#3b82f6',
  escalate: '#ef4444',
  delegate: '#8b5cf6',
  conditional: '#f59e0b',
  fallback: '#6b7280',
};

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

interface EdgesTabProps {
  node: WorkflowNode;
  edges: WorkflowEdge[];
  nodes: WorkflowNode[];
  onUpdateEdge: (edgeId: string, updates: Partial<WorkflowEdge>) => void;
}

export default function EdgesTab({ node, edges, nodes, onUpdateEdge }: EdgesTabProps) {
  const outgoing = edges.filter(e => e.sourceId === node.id);
  const incoming = edges.filter(e => e.targetId === node.id);

  const allEdges = [
    ...outgoing.map(e => ({ ...e, direction: 'outgoing' as const, otherNode: nodes.find(n => n.id === e.targetId) })),
    ...incoming.map(e => ({ ...e, direction: 'incoming' as const, otherNode: nodes.find(n => n.id === e.sourceId) })),
  ];

  if (allEdges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-2 text-[13px] text-muted-foreground">No connections yet</div>
        <p className="text-[11px] text-muted-foreground">
          Drag from a port to connect nodes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="section-label">
        Connections ({allEdges.length})
      </div>
      <div className="space-y-3">
        {allEdges.map((edge) => {
          const otherType = edge.otherNode?.type || 'agent';
          const OtherIcon = nodeIconMap[otherType] || Bot;
          const otherColor = nodeColorMap[otherType] || nodeColorMap.agent;
          const otherBg = nodeBgMap[otherType] || nodeBgMap.agent;
          const edgeTypeColor = EDGE_TYPE_COLORS[edge.type] || EDGE_TYPE_COLORS.default;

          return (
            <div key={edge.id} className="rounded-lg border p-3 space-y-2.5">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                {edge.direction === 'outgoing' ? (
                  <ArrowRight className="h-3 w-3 shrink-0" />
                ) : (
                  <ArrowLeft className="h-3 w-3 shrink-0" />
                )}
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                  style={{ backgroundColor: otherBg }}
                >
                  <OtherIcon className="h-2.5 w-2.5" style={{ color: otherColor }} />
                </div>
                <span className="flex-1">
                  {edge.direction === 'outgoing' ? 'To' : 'From'}:{' '}
                  <span className="font-medium text-foreground">{edge.otherNode?.label}</span>
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 font-medium"
                  style={{ color: edgeTypeColor }}
                >
                  {edge.type}
                </Badge>
              </div>

              <div className="space-y-2">
                <Select
                  value={edge.type}
                  onValueChange={(value) => onUpdateEdge(edge.id, { type: value as EdgeType })}
                >
                  <SelectTrigger className="text-[13px] h-8">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDGE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={edge.label || ''}
                  onChange={(e) => onUpdateEdge(edge.id, { label: e.target.value })}
                  placeholder="Transition label..."
                  className="text-[13px] h-8"
                />

                <Input
                  value={edge.condition || ''}
                  onChange={(e) => onUpdateEdge(edge.id, { condition: e.target.value })}
                  placeholder="Routing condition (natural language)..."
                  className="text-[13px] h-8"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
