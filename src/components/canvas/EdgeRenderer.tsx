import { useState } from 'react';
import { X } from 'lucide-react';
import type { WorkflowNode, WorkflowEdge } from '@/hooks/useCanvasState';

const NODE_WIDTH = 252;
const NODE_HEIGHT = 68;

function getPortPosition(node: WorkflowNode, position: 'top' | 'bottom') {
  const x = node.x + NODE_WIDTH / 2;
  const y = position === 'top' ? node.y : node.y + NODE_HEIGHT;
  return { x, y };
}

function getBezierPath(source: { x: number; y: number }, target: { x: number; y: number }) {
  const dy = Math.abs(target.y - source.y);
  const controlOffset = Math.max(40, Math.min(dy * 0.5, 80));
  return `M ${source.x} ${source.y} C ${source.x} ${source.y + controlOffset}, ${target.x} ${target.y - controlOffset}, ${target.x} ${target.y}`;
}

function getMidpoint(source: { x: number; y: number }, target: { x: number; y: number }) {
  return {
    x: (source.x + target.x) / 2,
    y: (source.y + target.y) / 2,
  };
}

interface DrawingEdge {
  sourceId: string;
  sourcePosition: 'top' | 'bottom';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface EdgeRendererProps {
  edges: WorkflowEdge[];
  nodes: WorkflowNode[];
  selectedEdgeId: string | null;
  onSelectEdge: (edgeId: string) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<WorkflowEdge>) => void;
  onDeleteEdge: (edgeId: string) => void;
  drawingEdge: DrawingEdge | null;
}

export default function EdgeRenderer({
  edges,
  nodes,
  selectedEdgeId,
  onSelectEdge,
  onUpdateEdge,
  onDeleteEdge,
  drawingEdge,
}: EdgeRendererProps) {
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleLabelDoubleClick = (edge: WorkflowEdge) => {
    setEditingEdgeId(edge.id);
    setEditValue(edge.label || '');
  };

  const handleLabelSubmit = (edgeId: string) => {
    onUpdateEdge(edgeId, { label: editValue });
    setEditingEdgeId(null);
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ width: '100%', height: '100%' }}
    >
      {edges.map((edge) => {
        const sourceNode = nodes.find(n => n.id === edge.sourceId);
        const targetNode = nodes.find(n => n.id === edge.targetId);
        if (!sourceNode || !targetNode) return null;

        const source = getPortPosition(sourceNode, 'bottom');
        const target = getPortPosition(targetNode, 'top');
        const path = getBezierPath(source, target);
        const mid = getMidpoint(source, target);
        const isSelected = edge.id === selectedEdgeId;
        const isFromStart = sourceNode.type === 'start';

        return (
          <g key={edge.id}>
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={16}
              className="pointer-events-auto cursor-pointer"
              onClick={() => !isFromStart && onSelectEdge(edge.id)}
            />
            <path
              d={path}
              className={`bezier-path ${isSelected ? 'selected' : ''}`}
            />
            {!isFromStart && (
            <foreignObject
              x={mid.x - 80}
              y={mid.y - 14}
              width={160}
              height={28}
              className="pointer-events-auto overflow-visible"
            >
              <div className="flex items-center justify-center">
                {editingEdgeId === edge.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleLabelSubmit(edge.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLabelSubmit(edge.id);
                      if (e.key === 'Escape') setEditingEdgeId(null);
                    }}
                    className="w-36 rounded-full border border-border bg-background px-2.5 py-0.5 text-center text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    autoFocus
                    placeholder="Transition label..."
                  />
                ) : (edge.label || (edge.type !== 'default' && edge.type !== 'llm')) ? (
                  <div
                    className="group relative flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground cursor-pointer hover:border-gray-400"
                    onDoubleClick={() => handleLabelDoubleClick(edge)}
                    onClick={() => onSelectEdge(edge.id)}
                  >
                    <span className="truncate max-w-[120px]">{edge.label || edge.type}</span>
                    {isSelected && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteEdge(edge.id); }}
                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className="rounded-full border border-dashed border-border bg-background/80 px-2.5 py-0.5 text-xs text-muted-foreground cursor-pointer hover:border-gray-400 hover:text-foreground/60"
                    onDoubleClick={() => handleLabelDoubleClick(edge)}
                    onClick={() => onSelectEdge(edge.id)}
                  >
                    + configure
                  </div>
                )}
              </div>
            </foreignObject>
            )}
          </g>
        );
      })}

      {drawingEdge && (
        <path
          d={`M ${drawingEdge.startX} ${drawingEdge.startY} C ${drawingEdge.startX} ${drawingEdge.startY + 50}, ${drawingEdge.currentX} ${drawingEdge.currentY - 50}, ${drawingEdge.currentX} ${drawingEdge.currentY}`}
          className="bezier-path drawing"
        />
      )}
    </svg>
  );
}
