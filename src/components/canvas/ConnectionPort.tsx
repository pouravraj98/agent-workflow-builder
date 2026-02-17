import { useState } from 'react';

interface ConnectionPortProps {
  nodeId: string;
  position: 'top' | 'bottom';
  onDragStart?: (nodeId: string, position: 'top' | 'bottom', e: React.MouseEvent) => void;
  onDragEnd?: (nodeId: string, position: 'top' | 'bottom', e: React.MouseEvent) => void;
  isDrawing: boolean;
}

export default function ConnectionPort({
  nodeId,
  position,
  onDragStart,
  onDragEnd,
  isDrawing,
}: ConnectionPortProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDragStart?.(nodeId, position, e);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDragEnd?.(nodeId, position, e);
  };

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 z-10 rounded-full border-2 border-background transition-all duration-150 cursor-crosshair
        ${position === 'top' ? '-top-[6px]' : '-bottom-[6px]'}
        ${isDrawing
          ? 'h-3.5 w-3.5 bg-primary ring-2 ring-primary/30'
          : isHovered
            ? 'h-3.5 w-3.5 bg-gray-400'
            : 'h-3 w-3 bg-gray-300 group-hover:bg-gray-400'
        }
      `}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}
