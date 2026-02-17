import { useRef, useCallback } from 'react';

export function useNodeDrag(zoom: number, onUpdatePosition: (nodeId: string, dx: number, dy: number) => void) {
  const dragState = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  const startDrag = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dragState.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };

    const handleMove = (moveEvent: MouseEvent) => {
      if (!dragState.current) return;
      const dx = (moveEvent.clientX - dragState.current.startX) / zoom;
      const dy = (moveEvent.clientY - dragState.current.startY) / zoom;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        dragState.current.moved = true;
      }
      if (dragState.current.moved) {
        onUpdatePosition(dragState.current.nodeId, dx, dy);
        dragState.current.startX = moveEvent.clientX;
        dragState.current.startY = moveEvent.clientY;
      }
    };

    const handleUp = () => {
      dragState.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [zoom, onUpdatePosition]);

  return { startDrag, isDragging: () => dragState.current?.moved ?? false };
}
