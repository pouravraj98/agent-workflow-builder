import { useState, useCallback, useRef, useEffect } from 'react';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useNodeDrag } from '@/hooks/useNodeDrag';
import StartNode from './StartNode';
import AgentNode from './AgentNode';
import ToolNode from './ToolNode';
import EndNode from './EndNode';
import EdgeRenderer from './EdgeRenderer';
import CanvasToolbar from './CanvasToolbar';
import type { WorkflowNode, WorkflowEdge, NodeType } from '@/hooks/useCanvasState';

const NODE_WIDTH = 252;
const NODE_HEIGHT = 68;

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onSelectEdge: (edgeId: string) => void;
  onClearSelection: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<WorkflowEdge>) => void;
  onDeleteEdge: (edgeId: string) => void;
  onAddEdge: (sourceId: string, targetId: string) => void;
  onAddNode: (type: NodeType, parentNodeId: string) => void;
  setNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>;
}

export default function WorkflowCanvas({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  onClearSelection,
  onUpdateNode,
  onUpdateEdge,
  onDeleteEdge,
  onAddEdge,
  onAddNode,
  setNodes,
}: WorkflowCanvasProps) {
  const { pan, zoom, handleWheel, handleMouseDown: handlePanMouseDown, handleMouseMove: handlePanMove, handleMouseUp: handlePanUp, zoomIn, zoomOut, resetView } = usePanZoom();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [drawingEdge, setDrawingEdge] = useState<{
    sourceId: string;
    sourcePosition: 'top' | 'bottom';
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const updateNodePosition = useCallback((nodeId: string, dx: number, dy: number) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, x: n.x + dx, y: n.y + dy } : n
    ));
  }, [setNodes]);

  const { startDrag } = useNodeDrag(zoom, updateNodePosition);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target instanceof HTMLElement && e.target.classList.contains('canvas-grid-inner'))) {
      onClearSelection();
      handlePanMouseDown(e);
    }
  }, [onClearSelection, handlePanMouseDown]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    handlePanMove(e);
    if (drawingEdge) {
      const rect = canvasRef.current!.getBoundingClientRect();
      setDrawingEdge(prev => prev ? ({
        ...prev,
        currentX: (e.clientX - rect.left - pan.x) / zoom,
        currentY: (e.clientY - rect.top - pan.y) / zoom,
      }) : null);
    }
  }, [handlePanMove, drawingEdge, pan, zoom]);

  const handleCanvasMouseUp = useCallback((_e: React.MouseEvent) => {
    handlePanUp();
    if (drawingEdge) {
      setDrawingEdge(null);
    }
  }, [handlePanUp, drawingEdge]);

  const handlePortDragStart = useCallback((nodeId: string, position: 'top' | 'bottom', e: React.MouseEvent) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const startX = node.x + NODE_WIDTH / 2;
    const startY = position === 'bottom' ? node.y + NODE_HEIGHT : node.y;

    const rect = canvasRef.current!.getBoundingClientRect();
    const currentX = (e.clientX - rect.left - pan.x) / zoom;
    const currentY = (e.clientY - rect.top - pan.y) / zoom;

    setDrawingEdge({
      sourceId: nodeId,
      sourcePosition: position,
      startX,
      startY,
      currentX,
      currentY,
    });
  }, [nodes, pan, zoom]);

  const handlePortDragEnd = useCallback((nodeId: string, _position: 'top' | 'bottom', _e: React.MouseEvent) => {
    if (drawingEdge && drawingEdge.sourceId !== nodeId) {
      const sourceId = drawingEdge.sourcePosition === 'bottom' ? drawingEdge.sourceId : nodeId;
      const targetId = drawingEdge.sourcePosition === 'bottom' ? nodeId : drawingEdge.sourceId;
      onAddEdge(sourceId, targetId);
    }
    setDrawingEdge(null);
  }, [drawingEdge, onAddEdge]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const renderNode = (node: WorkflowNode) => {
    const commonProps = {
      key: node.id,
      node,
      isSelected: node.id === selectedNodeId,
      onSelect: onSelectNode,
      onMouseDown: startDrag,
      onPortDragStart: handlePortDragStart,
      onPortDragEnd: handlePortDragEnd,
      isDrawing: !!drawingEdge,
      onAddNode,
    };

    switch (node.type) {
      case 'start':
        return <StartNode {...commonProps} hasChild={edges.some(e => e.sourceId === node.id)} />;
      case 'agent':
        return <AgentNode {...commonProps} />;
      case 'tool':
        return <ToolNode {...commonProps} />;
      case 'end':
        return <EndNode {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={canvasRef}
      className="relative flex-1 overflow-hidden canvas-grid cursor-default"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      style={{
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
      }}
    >
      <div
        className="canvas-grid-inner absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <EdgeRenderer
          edges={edges}
          nodes={nodes}
          selectedEdgeId={selectedEdgeId}
          onSelectEdge={onSelectEdge}
          onUpdateEdge={onUpdateEdge}
          onDeleteEdge={onDeleteEdge}
          drawingEdge={drawingEdge}
        />

        {nodes.map(renderNode)}
      </div>

      <CanvasToolbar
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
      />
    </div>
  );
}
