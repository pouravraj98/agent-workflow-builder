import { useState, useEffect } from 'react';
import {
  BookOpen, FileText, Link as LinkIcon, FileUp, Plus, X, Search,
  Upload, ArrowLeft, Type, Globe, Pencil,
} from 'lucide-react';
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
  file: { icon: FileUp, label: 'File', fullLabel: 'Add File', desc: 'Attach a document (PDF, DOCX, etc.)', color: '#f59e0b', bg: '#fffbeb' },
} as const;

const TYPES: (KnowledgeItem['type'])[] = ['text', 'link', 'file'];

interface KnowledgeBasePageProps {
  items: KnowledgeItem[];
  onAdd: (item: Omit<KnowledgeItem, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<KnowledgeItem>) => void;
  onRemove: (id: string) => void;
  globalItemIds?: Set<string>;
  scope?: 'global' | 'agent';
  agentName?: string;
}

export default function KnowledgeBasePage({ items, onAdd, onUpdate, onRemove, globalItemIds, scope, agentName }: KnowledgeBasePageProps) {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogView, setDialogView] = useState<'pick' | 'form'>('pick');
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [formType, setFormType] = useState<KnowledgeItem['type']>('text');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  const filtered = search
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.content.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  const openAddDialog = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormContent('');
    setDialogView('pick');
    setDialogOpen(true);
  };

  const pickType = (type: KnowledgeItem['type']) => {
    setFormType(type);
    setDialogView('form');
  };

  const openEditDialog = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormType(item.type);
    setFormTitle(item.title);
    setFormContent(item.content);
    setDialogView('form');
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      onUpdate(editingItem.id, { type: formType, title: formTitle, content: formContent });
    } else {
      onAdd({ type: formType, title: formTitle, content: formContent });
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      setEditingItem(null);
      setFormTitle('');
      setFormContent('');
    }
  }, [dialogOpen]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Page header */}
      <div className="flex items-center justify-between px-8 py-5 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold">
              {scope === 'agent' ? `Knowledge Base` : 'Global Knowledge Base'}
            </h1>
            <p className="text-[13px] text-muted-foreground">
              {scope === 'agent'
                ? `Knowledge available to ${agentName || 'this agent'} (includes global sources).`
                : 'Shared context available to all agents.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sources..."
                className="pl-8 h-8 w-56 text-[13px]"
              />
            </div>
          )}
          <Button size="sm" className="h-8 text-[13px] gap-1.5" onClick={openAddDialog}>
            <Plus className="h-3.5 w-3.5" />
            Add Source
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="text-[15px] font-semibold mb-1">No knowledge sources yet</h2>
            <p className="text-[13px] text-muted-foreground max-w-[320px] mb-5">
              Add documents, text snippets, or links to give your agents shared context and information.
            </p>
            <Button size="sm" className="gap-1.5" onClick={openAddDialog}>
              <Plus className="h-3.5 w-3.5" />
              Add your first source
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-[13px] text-muted-foreground">No sources match your search.</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto w-full px-8 py-6">
          <div className="divide-y rounded-xl border overflow-hidden">
            {filtered.map((item) => {
              const cfg = TYPE_CONFIG[item.type];
              const Icon = cfg.icon;
              const isGlobal = globalItemIds?.has(item.id);
              const preview = item.content
                ? item.content.length > 120 ? item.content.slice(0, 120) + '...' : item.content
                : '';

              return (
                <button
                  key={item.id}
                  onClick={() => openEditDialog(item)}
                  className="group flex items-center gap-4 px-4 py-4 w-full text-left hover:bg-accent/30 transition-colors"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: cfg.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] font-medium leading-tight truncate">
                        {item.title || 'Untitled'}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1.5 h-4 font-medium shrink-0"
                        style={{ color: cfg.color }}
                      >
                        {cfg.label}
                      </Badge>
                      {isGlobal && (
                        <Badge variant="outline" className="text-[9px] px-1.5 h-4 font-medium shrink-0">
                          Global
                        </Badge>
                      )}
                    </div>
                    {preview && (
                      <div className="text-[12px] text-muted-foreground leading-relaxed truncate">
                        {preview}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent">
                      <Pencil className="h-3.5 w-3.5" />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
          </div>
        )}
      </div>

      {/* Footer count */}
      {items.length > 0 && (
        <div className="shrink-0 border-t px-8 py-2.5">
          <span className="text-[12px] text-muted-foreground">
            {items.length} source{items.length !== 1 ? 's' : ''}
            {search && ` (${filtered.length} shown)`}
          </span>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {/* ── Type Picker ── */}
          {dialogView === 'pick' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[16px]">Add Knowledge Source</DialogTitle>
              </DialogHeader>
              <p className="text-[13px] text-muted-foreground -mt-1">
                Choose the type of source to add.
              </p>
              <div className="space-y-2 py-1">
                {TYPES.map((type) => {
                  const cfg = TYPE_CONFIG[type];
                  const TypeIcon = cfg.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => pickType(type)}
                      className="flex items-center gap-3 w-full rounded-xl border-2 border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/50 text-left"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: cfg.bg }}
                      >
                        <TypeIcon className="h-5 w-5" style={{ color: cfg.color }} />
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

          {/* ── Form ── */}
          {dialogView === 'form' && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {!editingItem && (
                    <button
                      onClick={() => setDialogView('pick')}
                      className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <DialogTitle className="text-[16px]">
                    {editingItem ? 'Edit Source' : TYPE_CONFIG[formType].fullLabel}
                  </DialogTitle>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 h-5 font-medium gap-1"
                    style={{ color: TYPE_CONFIG[formType].color }}
                  >
                    {(() => { const FIcon = TYPE_CONFIG[formType].icon; return <FIcon className="h-3 w-3" />; })()}
                    {TYPE_CONFIG[formType].label}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Title</Label>
                  <Input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
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
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="Paste your text content here..."
                      rows={8}
                      className="text-[13px] resize-none"
                    />
                  ) : formType === 'link' ? (
                    <Input
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
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
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        placeholder="Or enter filename manually..."
                        className="text-[12px] mt-3 max-w-[240px]"
                      />
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-[13px]">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!formTitle.trim()} className="text-[13px]">
                  {editingItem ? 'Save Changes' : 'Add Source'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
