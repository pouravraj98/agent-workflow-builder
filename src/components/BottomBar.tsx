import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomBarProps {
  isDirty: boolean;
  onSave: () => void;
  onClear: () => void;
}

export default function BottomBar({ isDirty, onSave, onClear }: BottomBarProps) {
  if (!isDirty) return null;

  return (
    <div className="bottom-bar-enter flex h-11 items-center justify-between border-t border-amber-200 bg-amber-50 px-5 shrink-0">
      <div className="flex items-center gap-2 text-[13px] text-amber-700">
        <AlertCircle className="h-3.5 w-3.5" />
        You have unsaved changes
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-100">
          Discard
        </Button>
        <Button size="sm" onClick={onSave} className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white">
          Save
        </Button>
      </div>
    </div>
  );
}
