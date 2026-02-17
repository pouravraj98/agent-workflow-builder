import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export default function CanvasToolbar({ zoom, onZoomIn, onZoomOut, onResetView }: CanvasToolbarProps) {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
      <div className="flex items-center gap-0.5 rounded-full border bg-background/90 backdrop-blur-sm p-1 shadow-sm">
        <Button variant="ghost" size="icon-xs" className="rounded-full" onClick={onZoomOut} aria-label="Zoom out">
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="w-10 text-center text-[11px] font-medium text-muted-foreground tabular-nums">
          {zoomPercent}%
        </span>
        <Button variant="ghost" size="icon-xs" className="rounded-full" onClick={onZoomIn} aria-label="Zoom in">
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <div className="mx-0.5 h-3.5 w-px bg-border" />
        <Button variant="ghost" size="icon-xs" className="rounded-full" onClick={onResetView} aria-label="Reset zoom">
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
