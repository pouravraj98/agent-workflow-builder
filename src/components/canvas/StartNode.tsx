import { Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ConnectionPort from './ConnectionPort';
import AddNodeButton from './AddNodeButton';
import type { WorkflowNode, NodeType } from '@/hooks/useCanvasState';

interface StartNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onMouseDown: (nodeId: string, e: React.MouseEvent) => void;
  onPortDragStart: (nodeId: string, position: 'top' | 'bottom', e: React.MouseEvent) => void;
  onPortDragEnd: (nodeId: string, position: 'top' | 'bottom', e: React.MouseEvent) => void;
  isDrawing: boolean;
  onAddNode: (type: NodeType, parentNodeId: string) => void;
  hasChild?: boolean;
}

export default function StartNode({
  node,
  isSelected,
  onSelect,
  onMouseDown,
  onPortDragStart,
  onPortDragEnd,
  isDrawing,
  onAddNode,
  hasChild,
}: StartNodeProps) {
  return (
    <div
      className="group absolute select-none cursor-grab active:cursor-grabbing"
      style={{ left: node.x, top: node.y, width: 252, willChange: 'transform' }}
      onMouseDown={(e) => {
        if (e.target instanceof HTMLElement && (e.target.closest('[data-port]') || e.target.closest('[data-add-node]'))) return;
        onSelect(node.id);
        onMouseDown(node.id, e);
      }}
    >
      <div
        className={`relative flex items-center gap-3 rounded-lg border bg-background px-4 py-3.5 transition-all duration-150
          ${isSelected
            ? 'border-node-start shadow-md ring-2 ring-node-start/20'
            : 'border-border shadow-sm hover:shadow-md hover:border-gray-300'
          }
        `}
      >
        <div
          className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full"
          style={{ backgroundColor: 'var(--node-start)' }}
        />

        <div
          className="ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'var(--node-start-light)' }}
        >
          <Play className="h-4 w-4" style={{ color: 'var(--node-start)' }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold leading-tight">{node.label}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">Entry</Badge>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Entry point</div>
        </div>

        <div data-port>
          <ConnectionPort
            nodeId={node.id}
            position="bottom"
            onDragStart={onPortDragStart}
            onDragEnd={onPortDragEnd}
            isDrawing={isDrawing}
          />
        </div>
      </div>

      {!hasChild && (
        <AddNodeButton parentNodeId={node.id} onAddNode={onAddNode} />
      )}
    </div>
  );
}
