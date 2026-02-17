import { useState, useEffect } from 'react';
import { FileText, Globe, FileUp, Upload, Search, Plus, X, ArrowLeft, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { KnowledgeItem } from '@/hooks/useCanvasState';

const TYPE_CONFIG = {
  text: { icon: Type, label: 'Text', fullLabel: 'Create Text', desc: 'Paste text content or instructions', color: '#22c55e', bg: '#f0fdf4' },
  link: { icon: Globe, label: 'URL', fullLabel: 'Add URL', desc: 'Reference an external resource', color: '#3b82f6', bg: '#eff6ff' },
  file: { icon: FileUp, label: 'File', fullLabel: 'Add Files', desc: 'Attach a file (PDF, DOCX, etc.)', color: '#f59e0b', bg: '#fffbeb' },
} as const;

const TYPES: (KnowledgeItem['type'])[] = ['link', 'file', 'text'];

interface AddKnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: KnowledgeItem[];
  onAdd: (item: { type: KnowledgeItem['type']; title: string; content: string }) => void;
  onUpdate: (id: string, updates: Partial<KnowledgeItem>) => void;
  onRemove: (id: string) => void;
}

type View = 'list' | 'form';

export default function AddKnowledgeDialog({ open, onOpenChange, items, onAdd, onUpdate, onRemove }: AddKnowledgeDialogProps) {
  const [view, setView] = useState<View>('list');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [formType, setFormType] = useState<KnowledgeItem['type']>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setView('list');
      setSearch('');
      setEditingItem(null);
      setTitle('');
      setContent('');
    }
  }, [open]);

  const filteredItems = search
    ? items.filter(i =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.content.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  const openAddForm = (type: KnowledgeItem['type']) => {
    setEditingItem(null);
    setFormType(type);
    setTitle('');
    setContent('');
    setView('form');
  };

  const openEditForm = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormType(item.type);
    setTitle(item.title);
    setContent(item.content);
    setView('form');
  };

  const handleSave = () => {
    if (editingItem) {
      onUpdate(editingItem.id, { type: formType, title, content });
    } else {
      onAdd({ type: formType, title, content });
    }
    setView('list');
    setEditingItem(null);
  };

  const hasItems = items.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        {/* ── List View ── */}
        {view === 'list' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-[16px]">Knowledge Base</DialogTitle>
            </DialogHeader>

            {hasItems ? (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search documents..."
                    className="pl-8 text-[13px]"
                  />
                </div>

                {/* Items list */}
                <div className="flex-1 overflow-y-auto -mx-6 min-h-0">
                  <div className="divide-y">
                    {filteredItems.map((item) => {
                      const cfg = TYPE_CONFIG[item.type];
                      const Icon = cfg.icon;
                      const preview = item.content
                        ? item.content.length > 50 ? item.content.slice(0, 50) + '...' : item.content
                        : '';

                      return (
                        <button
                          key={item.id}
                          onClick={() => openEditForm(item)}
                          className="group flex items-center gap-3 px-6 py-3 w-full text-left hover:bg-accent/40 transition-colors"
                        >
                          <div className="shrink-0" style={{ color: cfg.color }}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-medium leading-tight truncate">
                              {item.title || 'Untitled'}
                            </div>
                            {preview && (
                              <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">
                                {preview}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                            className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </button>
                      );
                    })}
                    {filteredItems.length === 0 && (
                      <div className="px-6 py-8 text-center">
                        <p className="text-[12px] text-muted-foreground">No documents match your search.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom action bar */}
                <div className="flex items-center gap-2 pt-2 border-t -mx-6 px-6 -mb-2">
                  {TYPES.map((type) => {
                    const cfg = TYPE_CONFIG[type];
                    const Icon = cfg.icon;
                    return (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-[12px] gap-1.5"
                        onClick={() => openAddForm(type)}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {cfg.fullLabel}
                      </Button>
                    );
                  })}
                </div>
              </>
            ) : (
              /* ── Empty State: Prominent add options ── */
              <>
                <p className="text-[13px] text-muted-foreground">
                  Add documents, URLs, or text to give this agent context and knowledge.
                </p>
                <div className="space-y-2 py-2">
                  {TYPES.map((type) => {
                    const cfg = TYPE_CONFIG[type];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => openAddForm(type)}
                        className="flex items-center gap-3 w-full rounded-xl border-2 border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/50 text-left"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: cfg.bg }}
                        >
                          <Icon className="h-5 w-5" style={{ color: cfg.color }} />
                        </div>
                        <div>
                          <div className="text-[13px] font-medium leading-tight">{cfg.fullLabel}</div>
                          <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{cfg.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Form View ── */}
        {view === 'form' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setView('list'); setEditingItem(null); }}
                  className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <DialogTitle className="text-[16px]">
                  {editingItem ? 'Edit Document' : TYPE_CONFIG[formType].fullLabel}
                </DialogTitle>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-2 py-0.5 h-5 font-medium gap-1"
                  style={{ color: TYPE_CONFIG[formType].color }}
                >
                  {(() => { const Icon = TYPE_CONFIG[formType].icon; return <Icon className="h-3 w-3" />; })()}
                  {TYPE_CONFIG[formType].label}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-[12px]">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    formType === 'text' ? 'e.g. FAQ Content, Product Info'
                      : formType === 'link' ? 'e.g. API Documentation, Help Center'
                      : 'e.g. User Manual, Policy Document'
                  }
                  className="text-[13px]"
                  autoFocus
                />
              </div>

              {/* Content — varies by type */}
              <div className="space-y-1.5">
                <Label className="text-[12px]">
                  {formType === 'text' ? 'Content' : formType === 'link' ? 'URL' : 'File'}
                </Label>
                {formType === 'text' ? (
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your text content here..."
                    rows={8}
                    className="text-[13px] resize-none"
                  />
                ) : formType === 'link' ? (
                  <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="https://docs.example.com/api"
                    className="text-[13px]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-primary/30 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-[12px] text-muted-foreground mb-1">
                      Drop a file here or click to browse
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      PDF, DOCX, TXT up to 10MB
                    </p>
                    <Input
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Or enter filename manually..."
                      className="text-[12px] mt-3 max-w-[240px]"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setView('list'); setEditingItem(null); }} className="text-[13px]">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!title.trim()} className="text-[13px]">
                {editingItem ? 'Save Changes' : 'Add Document'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
