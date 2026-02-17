import { StopCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ConnectionPort from './ConnectionPort';
import type { WorkflowNode, NodeType } from '@/hooks/useCanvasState';

interface EndNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onMouseDown: (nodeId: string, e: React.MouseEvent) => void;
  onPortDragStart: (nodeId: string, position: 'top' | 'bottom', e: React.MouseEvent) => void;
  onPortDragEnd: (nodeId: string, position: 'top' | 'bottom', e: React.MouseEvent) => void;
  isDrawing: boolean;
  onAddNode: (type: NodeType, parentNodeId: string) => void;
}

export default function EndNode({
  node,
  isSelected,
  onSelect,
  onMouseDown,
  onPortDragStart,
  onPortDragEnd,
  isDrawing,
}: EndNodeProps) {
  return (
    <div
      className="group absolute select-none cursor-grab active:cursor-grabbing node-enter"
      style={{ left: node.x, top: node.y, width: 252, willChange: 'transform' }}
      onMouseDown={(e) => {
        if (e.target instanceof HTMLElement && e.target.closest('[data-port]')) return;
        onSelect(node.id);
        onMouseDown(node.id, e);
      }}
    >
      <div
        className={`relative flex items-center gap-3 rounded-lg border bg-background px-4 py-3.5 transition-all duration-150
          ${isSelected
            ? 'border-node-end shadow-md ring-2 ring-node-end/20'
            : 'border-border shadow-sm hover:shadow-md hover:border-gray-300'
          }
        `}
      >
        <div
          className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full"
          style={{ backgroundColor: 'var(--node-end)' }}
        />

        <div data-port>
          <ConnectionPort nodeId={node.id} position="top" onDragStart={onPortDragStart} onDragEnd={onPortDragEnd} isDrawing={isDrawing} />
        </div>

        <div
          className="ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'var(--node-end-light)' }}
        >
          <StopCircle className="h-4 w-4" style={{ color: 'var(--node-end)' }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold leading-tight">{node.label}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">End</Badge>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Terminates flow</div>
        </div>
      </div>
    </div>
  );
}
