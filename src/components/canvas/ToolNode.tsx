import { Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ConnectionPort from './ConnectionPort';
import AddNodeButton from './AddNodeButton';
import type { WorkflowNode, NodeType } from '@/hooks/useCanvasState';

interface ToolNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onMouseDown: (nodeId: string, e: React.MouseEvent) => void;
  onPortDragStart: (nodeId: string, position: 'top' | 'bottom', e: React.MouseEvent) => void;
  onPortDragEnd: (nodeId: string, position: 'top' | 'bottom', e: React.MouseEvent) => void;
  isDrawing: boolean;
  onAddNode: (type: NodeType, parentNodeId: string) => void;
}

export default function ToolNode({
  node,
  isSelected,
  onSelect,
  onMouseDown,
  onPortDragStart,
  onPortDragEnd,
  isDrawing,
  onAddNode,
}: ToolNodeProps) {
  const toolsCount = (node.config?.enabledTools as string[] || []).length;
  const subtitle = toolsCount > 0
    ? `${toolsCount} tool${toolsCount !== 1 ? 's' : ''} configured`
    : 'No tools configured';

  return (
    <div
      className="group absolute select-none cursor-grab active:cursor-grabbing node-enter"
      style={{ left: node.x, top: node.y, width: 252, willChange: 'transform' }}
      onMouseDown={(e) => {
        if (e.target instanceof HTMLElement && (e.target.closest('[data-port]') || e.target.closest('[data-add-node]'))) return;
        onSelect(node.id);
        onMouseDown(node.id, e);
      }}
    >
      <div
        className={`relative rounded-lg border bg-background transition-all duration-150
          ${isSelected
            ? 'border-node-tool shadow-md ring-2 ring-node-tool/20'
            : 'border-border shadow-sm hover:shadow-md hover:border-gray-300'
          }
        `}
      >
        <div
          className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full"
          style={{ backgroundColor: 'var(--node-tool)' }}
        />

        <div className="flex items-center gap-3 px-4 py-3.5">
          <div data-port>
            <ConnectionPort nodeId={node.id} position="top" onDragStart={onPortDragStart} onDragEnd={onPortDragEnd} isDrawing={isDrawing} />
          </div>

          <div
            className="ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--node-tool-light)' }}
          >
            <Wrench className="h-4 w-4" style={{ color: 'var(--node-tool)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[13px] font-semibold leading-tight">{node.label}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">Tool</Badge>
            </div>
            <div className="truncate text-[11px] text-muted-foreground mt-0.5">{subtitle}</div>
          </div>

          <div data-port>
            <ConnectionPort nodeId={node.id} position="bottom" onDragStart={onPortDragStart} onDragEnd={onPortDragEnd} isDrawing={isDrawing} />
          </div>
        </div>

        {toolsCount > 0 && (
          <div className="flex items-center gap-3 px-4 pb-2.5 pt-0 ml-[22px]">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Wrench className="h-3 w-3" />
              <span>+{toolsCount}</span>
            </div>
          </div>
        )}
      </div>

      <AddNodeButton parentNodeId={node.id} onAddNode={onAddNode} />
    </div>
  );
}
