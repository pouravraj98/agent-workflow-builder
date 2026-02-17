import { useState, useEffect } from 'react';
import {
  Wrench, Search, Plus, X, Globe, Calculator, Code, Cloud, Mail, FileText, Image, Volume2,
  MessageSquare, Calendar, Database, BookOpen, Github, Webhook, Plug, Pencil, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ToolItem, ToolCategory } from '@/hooks/useCanvasState';

const TOOL_ICONS: Record<string, typeof Wrench> = {
  tool_search_web: Globe,
  tool_calculator: Calculator,
  tool_code_interpreter: Code,
  tool_get_weather: Cloud,
  tool_send_email: Mail,
  tool_read_file: FileText,
  tool_generate_image: Image,
  tool_text_to_speech: Volume2,
  int_slack: MessageSquare,
  int_gmail: Mail,
  int_google_calendar: Calendar,
  int_salesforce: Database,
  int_notion: BookOpen,
  int_github: Github,
};

const INTEGRATION_COLORS: Record<string, string> = {
  int_slack: '#4A154B',
  int_gmail: '#EA4335',
  int_google_calendar: '#4285F4',
  int_salesforce: '#00A1E0',
  int_notion: '#000000',
  int_github: '#24292E',
};

interface ToolsPageProps {
  tools: ToolItem[];
  onAdd: (tool: Omit<ToolItem, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<ToolItem>) => void;
  onRemove: (id: string) => void;
  globalToolIds?: Set<string>;
  scope?: 'global' | 'agent';
  agentName?: string;
}

type DialogMode = 'pick' | 'webhook' | 'custom_api';

export default function ToolsPage({ tools, onAdd, onUpdate, onRemove, globalToolIds, scope, agentName }: ToolsPageProps) {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('pick');
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMethod, setFormMethod] = useState('POST');
  const [formUrl, setFormUrl] = useState('');
  const [formHeaders, setFormHeaders] = useState('');

  const filtered = search
    ? tools.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
    : tools;

  const predefined = filtered.filter(t => t.category === 'predefined');
  const integrations = filtered.filter(t => t.category === 'integration');
  const webhooks = filtered.filter(t => t.category === 'webhook');
  const customApis = filtered.filter(t => t.category === 'custom_api');

  const totalEnabled = tools.filter(t => t.enabled).length;

  const openAddDialog = () => {
    setEditingTool(null);
    resetForm();
    setDialogMode('pick');
    setDialogOpen(true);
  };

  const pickMode = (mode: 'webhook' | 'custom_api') => {
    setFormMethod(mode === 'webhook' ? 'POST' : 'GET');
    setDialogMode(mode);
  };

  const openEditDialog = (tool: ToolItem) => {
    setEditingTool(tool);
    setFormName(tool.name);
    setFormDescription(tool.description);
    setFormMethod(tool.config?.method || (tool.category === 'webhook' ? 'POST' : 'GET'));
    setFormUrl(tool.config?.url || '');
    setFormHeaders(tool.config?.headers || '');
    setDialogMode(tool.category === 'webhook' ? 'webhook' : 'custom_api');
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormMethod('POST');
    setFormUrl('');
    setFormHeaders('');
  };

  const handleSave = () => {
    if (editingTool) {
      onUpdate(editingTool.id, {
        name: formName,
        description: formDescription,
        config: {
          url: formUrl,
          method: formMethod,
          ...(dialogMode === 'custom_api' ? { headers: formHeaders } : {}),
        },
      });
    } else {
      const category: ToolCategory = dialogMode === 'webhook' ? 'webhook' : 'custom_api';
      onAdd({
        category,
        name: formName,
        description: formDescription || (category === 'webhook' ? 'Custom webhook' : 'Custom API tool'),
        enabled: true,
        config: {
          url: formUrl,
          method: formMethod,
          ...(category === 'custom_api' ? { headers: formHeaders } : {}),
        },
      });
    }
    setDialogOpen(false);
  };

  useEffect(() => {
    if (!dialogOpen) {
      setEditingTool(null);
      resetForm();
    }
  }, [dialogOpen]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Page header */}
      <div className="flex items-center justify-between px-8 py-5 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Wrench className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold">
              {scope === 'agent' ? 'Tools & Integrations' : 'Global Tools & Integrations'}
            </h1>
            <p className="text-[13px] text-muted-foreground">
              {scope === 'agent'
                ? `Tools available to ${agentName || 'this agent'} (includes global tools).`
                : 'Shared tools available to all agents.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="pl-8 h-8 w-56 text-[13px]"
            />
          </div>
          <Button size="sm" className="h-8 text-[13px] gap-1.5" onClick={openAddDialog}>
            <Plus className="h-3.5 w-3.5" />
            Add Tool
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full px-8 py-6 space-y-8">
        {/* Predefined Tools */}
        {predefined.length > 0 && (
          <section>
            <div className="section-label mb-4">Predefined Tools</div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {predefined.map((tool) => {
                const Icon = TOOL_ICONS[tool.id] || Wrench;
                return (
                  <div
                    key={tool.id}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                      tool.enabled ? 'bg-background border-border' : 'bg-muted/30 border-border/60'
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                      <Icon className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium leading-tight">{tool.name}</div>
                      <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{tool.description}</div>
                    </div>
                    <Switch
                      checked={tool.enabled}
                      onCheckedChange={(checked) => onUpdate(tool.id, { enabled: checked })}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Integrations */}
        {integrations.length > 0 && (
          <section>
            <div className="section-label mb-4">Integrations</div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {integrations.map((tool) => {
                const Icon = TOOL_ICONS[tool.id] || Plug;
                const brandColor = INTEGRATION_COLORS[tool.id] || '#6b7280';
                return (
                  <div key={tool.id} className="flex items-center gap-3 rounded-xl border bg-background p-3.5">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${brandColor}15` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: brandColor }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium leading-tight">{tool.name}</div>
                      <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{tool.description}</div>
                    </div>
                    {tool.enabled ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium text-green-600 bg-green-50">
                          Connected
                        </Badge>
                        <Switch
                          checked={tool.enabled}
                          onCheckedChange={(checked) => onUpdate(tool.id, { enabled: checked })}
                        />
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[12px] shrink-0"
                        onClick={() => onUpdate(tool.id, { enabled: true })}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Webhooks */}
        <section>
          <div className="section-label mb-4">Webhooks</div>
          {webhooks.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <Webhook className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground mb-3">No webhooks configured yet.</p>
              <Button variant="outline" size="sm" className="h-7 text-[12px] gap-1" onClick={() => { resetForm(); setFormMethod('POST'); setDialogMode('webhook'); setEditingTool(null); setDialogOpen(true); }}>
                <Plus className="h-3 w-3" /> Add Webhook
              </Button>
            </div>
          ) : (
            <div className="divide-y rounded-xl border overflow-hidden">
              {webhooks.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => openEditDialog(tool)}
                  className="group flex items-center gap-3 px-4 py-3.5 w-full text-left hover:bg-accent/30 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Webhook className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-medium leading-tight truncate">
                        {tool.name || 'Untitled webhook'}
                      </span>
                      <Badge variant="secondary" className="text-[9px] px-1.5 h-4 font-medium shrink-0 font-mono">
                        {tool.config?.method || 'POST'}
                      </Badge>
                    </div>
                    {tool.config?.url && (
                      <div className="text-[11px] text-muted-foreground leading-tight truncate font-mono">
                        {tool.config.url}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Switch
                      checked={tool.enabled}
                      onCheckedChange={(checked) => { onUpdate(tool.id, { enabled: checked }); }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent">
                      <Pencil className="h-3.5 w-3.5" />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(tool.id); }}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Custom API */}
        <section>
          <div className="section-label mb-4">Custom API</div>
          {customApis.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <Plug className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground mb-3">No custom APIs configured yet.</p>
              <Button variant="outline" size="sm" className="h-7 text-[12px] gap-1" onClick={() => { resetForm(); setFormMethod('GET'); setDialogMode('custom_api'); setEditingTool(null); setDialogOpen(true); }}>
                <Plus className="h-3 w-3" /> Add API Tool
              </Button>
            </div>
          ) : (
            <div className="divide-y rounded-xl border overflow-hidden">
              {customApis.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => openEditDialog(tool)}
                  className="group flex items-center gap-3 px-4 py-3.5 w-full text-left hover:bg-accent/30 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                    <Plug className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-medium leading-tight truncate">
                        {tool.name || 'Untitled API'}
                      </span>
                      <Badge variant="secondary" className="text-[9px] px-1.5 h-4 font-medium shrink-0 font-mono">
                        {tool.config?.method || 'GET'}
                      </Badge>
                    </div>
                    {tool.config?.url && (
                      <div className="text-[11px] text-muted-foreground leading-tight truncate font-mono">
                        {tool.config.url}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Switch
                      checked={tool.enabled}
                      onCheckedChange={(checked) => { onUpdate(tool.id, { enabled: checked }); }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent">
                      <Pencil className="h-3.5 w-3.5" />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(tool.id); }}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t px-8 py-2.5">
        <span className="text-[12px] text-muted-foreground">
          {tools.length} tool{tools.length !== 1 ? 's' : ''} &middot; {totalEnabled} enabled
          {search && ` (${filtered.length} shown)`}
        </span>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {/* ── Type Picker ── */}
          {dialogMode === 'pick' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[16px]">Add Tool</DialogTitle>
              </DialogHeader>
              <p className="text-[13px] text-muted-foreground -mt-1">
                Choose the type of tool to add.
              </p>
              <div className="space-y-2 py-1">
                <button
                  onClick={() => pickMode('webhook')}
                  className="flex items-center gap-3 w-full rounded-xl border-2 border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/50 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <Webhook className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium leading-tight">Webhook</div>
                    <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">Trigger an external URL on events</div>
                  </div>
                </button>
                <button
                  onClick={() => pickMode('custom_api')}
                  className="flex items-center gap-3 w-full rounded-xl border-2 border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/50 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                    <Plug className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium leading-tight">Custom API</div>
                    <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">Connect to any REST API endpoint</div>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* ── Webhook / Custom API Form ── */}
          {(dialogMode === 'webhook' || dialogMode === 'custom_api') && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {!editingTool && (
                    <button
                      onClick={() => setDialogMode('pick')}
                      className="flex items-center text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <DialogTitle className="text-[16px]">
                    {editingTool
                      ? `Edit ${dialogMode === 'webhook' ? 'Webhook' : 'API Tool'}`
                      : `Add ${dialogMode === 'webhook' ? 'Webhook' : 'API Tool'}`}
                  </DialogTitle>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 h-5 font-medium gap-1"
                    style={{ color: dialogMode === 'webhook' ? '#3b82f6' : '#9333ea' }}
                  >
                    {dialogMode === 'webhook' ? <Webhook className="h-3 w-3" /> : <Plug className="h-3 w-3" />}
                    {dialogMode === 'webhook' ? 'Webhook' : 'API'}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Name</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={dialogMode === 'webhook' ? 'e.g. Notify Slack, Update CRM' : 'e.g. Fetch User Data, Search Products'}
                    className="text-[13px]"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Description</Label>
                  <Input
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="What does this tool do?"
                    className="text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Endpoint</Label>
                  <div className="flex gap-2">
                    <Select value={formMethod} onValueChange={setFormMethod}>
                      <SelectTrigger className="w-24 h-9 text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        {dialogMode === 'custom_api' && (
                          <>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <Input
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      placeholder={dialogMode === 'webhook' ? 'https://example.com/webhook' : 'https://api.example.com/endpoint'}
                      className="h-9 text-[13px] flex-1 font-mono"
                    />
                  </div>
                </div>
                {dialogMode === 'custom_api' && (
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Headers (JSON)</Label>
                    <Input
                      value={formHeaders}
                      onChange={(e) => setFormHeaders(e.target.value)}
                      placeholder='{"Authorization": "Bearer ..."}'
                      className="h-9 text-[13px] font-mono"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-[13px]">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!formName.trim()} className="text-[13px]">
                  {editingTool ? 'Save Changes' : `Add ${dialogMode === 'webhook' ? 'Webhook' : 'API Tool'}`}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
