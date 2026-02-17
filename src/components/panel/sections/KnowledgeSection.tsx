import { useState } from 'react';
import { FileText, Link as LinkIcon, FileUp, Plus, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import type { KnowledgeItem } from '@/hooks/useCanvasState';

const TYPE_CONFIG = {
  text: { icon: FileText, label: 'Text', color: '#22c55e', bg: '#f0fdf4' },
  link: { icon: LinkIcon, label: 'Link', color: '#3b82f6', bg: '#eff6ff' },
  file: { icon: FileUp, label: 'File', color: '#f59e0b', bg: '#fffbeb' },
} as const;

const ADD_OPTIONS: { type: KnowledgeItem['type']; icon: typeof FileText; label: string; description: string }[] = [
  { type: 'text', icon: FileText, label: 'Text Snippet', description: 'Paste text content' },
  { type: 'link', icon: LinkIcon, label: 'Link / URL', description: 'External resource' },
  { type: 'file', icon: FileUp, label: 'Upload Document', description: 'Attach a file' },
];

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function KnowledgeSection({
  items,
  onUpdate,
}: {
  items: KnowledgeItem[];
  onUpdate: (items: KnowledgeItem[]) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);

  const handleAdd = (type: KnowledgeItem['type']) => {
    onUpdate([...items, { id: generateId('k'), type, title: '', content: '' }]);
    setAddOpen(false);
  };

  const handleItemUpdate = (id: string, updates: Partial<KnowledgeItem>) => {
    onUpdate(items.map(k => k.id === id ? { ...k, ...updates } : k));
  };

  const handleRemove = (id: string) => {
    onUpdate(items.filter(k => k.id !== id));
  };

  return (
    <div>
      <div className="section-label mb-3">Knowledge</div>
      {items.length === 0 ? (
        <p className="text-[12px] text-muted-foreground mb-3">
          No knowledge sources. Add context for this agent.
        </p>
      ) : (
        <div className="space-y-2 mb-3">
          {items.map((item) => {
            const cfg = TYPE_CONFIG[item.type];
            const Icon = cfg.icon;
            return (
              <div key={item.id} className="rounded-lg border p-2.5 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 font-medium shrink-0 gap-0.5"
                    style={{ color: cfg.color }}
                  >
                    <Icon className="h-2.5 w-2.5" />
                    {cfg.label}
                  </Badge>
                  <Input
                    value={item.title}
                    onChange={(e) => handleItemUpdate(item.id, { title: e.target.value })}
                    placeholder="Untitled"
                    className="h-6 text-[12px] font-medium border-0 shadow-none px-1 focus-visible:ring-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemove(item.id)}
                    className="h-5 w-5 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {item.type === 'text' ? (
                  <Textarea
                    value={item.content}
                    onChange={(e) => handleItemUpdate(item.id, { content: e.target.value })}
                    placeholder="Paste text content..."
                    rows={3}
                    className="text-[12px] resize-none"
                  />
                ) : item.type === 'link' ? (
                  <Input
                    value={item.content}
                    onChange={(e) => handleItemUpdate(item.id, { content: e.target.value })}
                    placeholder="https://..."
                    className="text-[12px] h-7"
                  />
                ) : (
                  <Input
                    value={item.content}
                    onChange={(e) => handleItemUpdate(item.id, { content: e.target.value })}
                    placeholder="filename.pdf"
                    className="text-[12px] h-7 bg-muted"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      <Popover open={addOpen} onOpenChange={setAddOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-[12px] gap-1.5">
            <Plus className="h-3 w-3" />
            Add Source
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" sideOffset={6} className="w-48 p-1.5">
          {ADD_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const cfg = TYPE_CONFIG[opt.type];
            return (
              <button
                key={opt.type}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-accent"
                onClick={() => handleAdd(opt.type)}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: cfg.color }} />
                <div className="min-w-0">
                  <div className="text-[12px] font-medium leading-tight">{opt.label}</div>
                </div>
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}
