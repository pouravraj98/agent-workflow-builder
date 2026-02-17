import { useState, useEffect } from 'react';
import { Braces, Search, X, ArrowLeft, Hash, ToggleLeft, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export interface Variable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  defaultValue: string;
  scope: 'session' | 'global';
  description: string;
}

const TYPE_CONFIG = {
  string:  { icon: Braces,     label: 'String',  desc: 'Text values like names or messages', color: '#22c55e', bg: '#f0fdf4' },
  number:  { icon: Hash,       label: 'Number',  desc: 'Numeric values like counts or totals', color: '#3b82f6', bg: '#eff6ff' },
  boolean: { icon: ToggleLeft, label: 'Boolean', desc: 'True/false flags and toggles', color: '#f59e0b', bg: '#fffbeb' },
  array:   { icon: List,       label: 'Array',   desc: 'Lists of items', color: '#8b5cf6', bg: '#f5f3ff' },
} as const;

const TYPES: Variable['type'][] = ['string', 'number', 'boolean', 'array'];

interface ManageVariablesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variables: Variable[];
  onAdd: (v: Omit<Variable, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Variable>) => void;
  onRemove: (id: string) => void;
}

type View = 'list' | 'form';

export default function ManageVariablesDialog({
  open,
  onOpenChange,
  variables,
  onAdd,
  onUpdate,
  onRemove,
}: ManageVariablesDialogProps) {
  const [view, setView] = useState<View>('list');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<Variable | null>(null);

  // Form fields
  const [formType, setFormType] = useState<Variable['type']>('string');
  const [name, setName] = useState('');
  const [defaultValue, setDefaultValue] = useState('');
  const [scope, setScope] = useState<'session' | 'global'>('session');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      setView('list');
      setSearch('');
      setEditingItem(null);
      setName('');
      setDefaultValue('');
      setScope('session');
      setDescription('');
    }
  }, [open]);

  const filteredItems = search
    ? variables.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.description.toLowerCase().includes(search.toLowerCase())
      )
    : variables;

  const openAddForm = (type: Variable['type']) => {
    setEditingItem(null);
    setFormType(type);
    setName('');
    setDefaultValue('');
    setScope('session');
    setDescription('');
    setView('form');
  };

  const openEditForm = (item: Variable) => {
    setEditingItem(item);
    setFormType(item.type);
    setName(item.name);
    setDefaultValue(item.defaultValue);
    setScope(item.scope);
    setDescription(item.description);
    setView('form');
  };

  const handleSave = () => {
    if (editingItem) {
      onUpdate(editingItem.id, { type: formType, name, defaultValue, scope, description });
    } else {
      onAdd({ type: formType, name, defaultValue, scope, description });
    }
    setView('list');
    setEditingItem(null);
  };

  const hasItems = variables.length > 0;

  const defaultPlaceholder =
    formType === 'string' ? 'e.g. John Doe'
    : formType === 'number' ? 'e.g. 0'
    : formType === 'boolean' ? 'e.g. true or false'
    : 'e.g. item1, item2, item3';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        {/* List View */}
        {view === 'list' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-[16px]">Variables</DialogTitle>
            </DialogHeader>

            {hasItems ? (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search variables..."
                    className="pl-8 text-[13px]"
                  />
                </div>

                {/* Items list */}
                <div className="flex-1 overflow-y-auto -mx-6 min-h-0">
                  <div className="divide-y">
                    {filteredItems.map((item) => {
                      const cfg = TYPE_CONFIG[item.type];
                      return (
                        <button
                          key={item.id}
                          onClick={() => openEditForm(item)}
                          className="group flex items-center gap-3 px-6 py-3 w-full text-left hover:bg-accent/40 transition-colors"
                        >
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                            style={{ backgroundColor: cfg.bg }}
                          >
                            {(() => { const Icon = cfg.icon; return <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />; })()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium font-mono leading-tight truncate">
                                {item.name || 'unnamed'}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0 h-4 font-medium shrink-0"
                                style={{ color: cfg.color }}
                              >
                                {cfg.label}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 h-4 font-medium shrink-0"
                              >
                                {item.scope === 'global' ? 'Global' : 'Session'}
                              </Badge>
                            </div>
                            {item.description && (
                              <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">
                                {item.description}
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
                        <p className="text-[12px] text-muted-foreground">No variables match your search.</p>
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
                        {cfg.label}
                      </Button>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Empty State */
              <>
                <p className="text-[13px] text-muted-foreground">
                  Add variables the agent can read and write during conversations.
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
                          <div className="text-[13px] font-medium leading-tight">{cfg.label}</div>
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

        {/* Form View */}
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
                  {editingItem ? 'Edit Variable' : 'Add Variable'}
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
              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-[12px]">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. user_name, order_total"
                  className="text-[13px] font-mono"
                  autoFocus
                />
              </div>

              {/* Type chips */}
              <div className="space-y-1.5">
                <Label className="text-[12px]">Type</Label>
                <div className="flex flex-wrap gap-1.5">
                  {TYPES.map((type) => {
                    const cfg = TYPE_CONFIG[type];
                    const isSelected = formType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setFormType(type)}
                        className={`rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div className="text-[11px] font-medium leading-none">{cfg.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Default Value */}
              <div className="space-y-1.5">
                <Label className="text-[12px]">Default Value</Label>
                <Input
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder={defaultPlaceholder}
                  className="text-[13px]"
                />
              </div>

              {/* Scope chips */}
              <div className="space-y-1.5">
                <Label className="text-[12px]">Scope</Label>
                <div className="flex gap-1.5">
                  {(['session', 'global'] as const).map((s) => {
                    const isSelected = scope === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setScope(s)}
                        className={`rounded-lg border px-2.5 py-1.5 text-left transition-colors flex-1 ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div className="text-[11px] font-medium leading-none capitalize">{s}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5 leading-none">
                          {s === 'session' ? 'Resets each conversation' : 'Persists across conversations'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-[12px]">Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this variable's purpose"
                  className="text-[13px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setView('list'); setEditingItem(null); }} className="text-[13px]">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!name.trim()} className="text-[13px]">
                {editingItem ? 'Save Changes' : 'Add Variable'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
