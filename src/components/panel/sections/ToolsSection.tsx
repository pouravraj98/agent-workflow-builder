import { useState } from 'react';
import {
  Search, ChevronDown, ChevronRight, Plus, X,
  Globe, Calculator, Code, Cloud, Mail, FileText, Image, Volume2,
  MessageSquare, Calendar, Database, BookOpen, Github, Wrench, Plug, Webhook,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
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

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  predefined: 'Built-in Tools',
  integration: 'Integrations',
  webhook: 'Webhooks',
  custom_api: 'Custom API',
};

const INTEGRATION_COLORS: Record<string, string> = {
  int_slack: '#4A154B',
  int_gmail: '#EA4335',
  int_google_calendar: '#4285F4',
  int_salesforce: '#00A1E0',
  int_notion: '#000000',
  int_github: '#24292E',
};

export default function ToolsSection({
  enabledTools,
  toolLibrary,
  onUpdate,
  onAddTool,
  onUpdateTool,
  onRemoveTool,
}: {
  enabledTools: string[];
  toolLibrary: ToolItem[];
  onUpdate: (tools: string[]) => void;
  onAddTool?: (tool: Omit<ToolItem, 'id'>) => void;
  onUpdateTool?: (id: string, updates: Partial<ToolItem>) => void;
  onRemoveTool?: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [addOpen, setAddOpen] = useState(false);

  const toggleTool = (toolId: string) => {
    if (enabledTools.includes(toolId)) {
      onUpdate(enabledTools.filter(id => id !== toolId));
    } else {
      onUpdate([...enabledTools, toolId]);
    }
  };

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleAddWebhook = () => {
    onAddTool?.({ category: 'webhook', name: '', description: 'Custom webhook', enabled: true, config: { url: '', method: 'POST' } });
    setAddOpen(false);
  };

  const handleAddCustomApi = () => {
    onAddTool?.({ category: 'custom_api', name: '', description: 'Custom API tool', enabled: true, config: { url: '', method: 'GET', headers: '' } });
    setAddOpen(false);
  };

  const filtered = search
    ? toolLibrary.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      )
    : toolLibrary;

  const categories: ToolCategory[] = ['predefined', 'integration', 'webhook', 'custom_api'];
  const grouped = categories
    .map(cat => ({ cat, tools: filtered.filter(t => t.category === cat) }))
    .filter(g => g.tools.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="section-label">Tools</div>
        {onAddTool && (
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-6 text-[11px] gap-1 px-2">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" sideOffset={6} className="w-48 p-1.5">
              <button
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-accent"
                onClick={handleAddWebhook}
              >
                <Webhook className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[12px] font-medium leading-tight">Webhook</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">Trigger an external URL</div>
                </div>
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-accent"
                onClick={handleAddCustomApi}
              >
                <Plug className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[12px] font-medium leading-tight">Custom API</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">Connect to any REST API</div>
                </div>
              </button>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="pl-7 h-7 text-[12px]"
        />
      </div>

      {grouped.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">No tools found.</p>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ cat, tools }) => {
            const isCollapsed = collapsed[cat];
            return (
              <div key={cat}>
                <button
                  className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 hover:text-foreground transition-colors"
                  onClick={() => toggleCategory(cat)}
                >
                  {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {CATEGORY_LABELS[cat]}
                  <span className="text-[10px] font-normal normal-case tracking-normal ml-1">
                    ({tools.filter(t => enabledTools.includes(t.id)).length}/{tools.length})
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="space-y-2">
                    {tools.map((tool) => {
                      const isActive = enabledTools.includes(tool.id);
                      const Icon = TOOL_ICONS[tool.id] || Wrench;
                      const isUserCreated = cat === 'webhook' || cat === 'custom_api';
                      const isIntegration = cat === 'integration';
                      const brandColor = isIntegration ? (INTEGRATION_COLORS[tool.id] || '#6b7280') : undefined;

                      return (
                        <div
                          key={tool.id}
                          className={`rounded-lg border p-2.5 transition-colors ${
                            isActive ? 'border-primary/30 bg-primary/5' : 'bg-background'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                              style={{
                                backgroundColor: brandColor ? `${brandColor}15` : (isUserCreated ? (cat === 'webhook' ? '#eff6ff' : '#f3e8ff') : '#fffbeb'),
                              }}
                            >
                              <Icon
                                className="h-3.5 w-3.5"
                                style={{
                                  color: brandColor || (isUserCreated ? (cat === 'webhook' ? '#2563eb' : '#9333ea') : '#d97706'),
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              {isUserCreated ? (
                                <Input
                                  value={tool.name}
                                  onChange={(e) => onUpdateTool?.(tool.id, { name: e.target.value })}
                                  placeholder={cat === 'webhook' ? 'Webhook name' : 'API tool name'}
                                  className="h-5 text-[12px] font-medium border-0 shadow-none px-0 focus-visible:ring-0"
                                />
                              ) : (
                                <div className="text-[12px] font-medium leading-tight">{tool.name}</div>
                              )}
                              <div className="text-[10px] text-muted-foreground leading-tight">{tool.description}</div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {isIntegration && !isActive ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-[10px] px-2"
                                  onClick={() => toggleTool(tool.id)}
                                >
                                  Connect
                                </Button>
                              ) : (
                                <Switch
                                  checked={isActive}
                                  onCheckedChange={() => toggleTool(tool.id)}
                                  className="scale-90"
                                />
                              )}
                              {isUserCreated && onRemoveTool && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => {
                                    onRemoveTool(tool.id);
                                    onUpdate(enabledTools.filter(id => id !== tool.id));
                                  }}
                                  className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {isUserCreated && isActive && (
                            <div className="mt-2 space-y-2 pl-9">
                              <div className="flex gap-1.5">
                                <Select
                                  value={tool.config.method || (cat === 'webhook' ? 'POST' : 'GET')}
                                  onValueChange={(value) => onUpdateTool?.(tool.id, { config: { ...tool.config, method: value } })}
                                >
                                  <SelectTrigger className="w-[72px] h-6 text-[11px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    {cat === 'custom_api' && <SelectItem value="PUT">PUT</SelectItem>}
                                    {cat === 'custom_api' && <SelectItem value="DELETE">DELETE</SelectItem>}
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={tool.config.url || ''}
                                  onChange={(e) => onUpdateTool?.(tool.id, { config: { ...tool.config, url: e.target.value } })}
                                  placeholder="https://..."
                                  className="h-6 text-[11px] flex-1"
                                />
                              </div>
                              {cat === 'custom_api' && (
                                <Input
                                  value={tool.config.headers || ''}
                                  onChange={(e) => onUpdateTool?.(tool.id, { config: { ...tool.config, headers: e.target.value } })}
                                  placeholder='Headers: {"Authorization": "..."}'
                                  className="h-6 text-[11px] font-mono"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {enabledTools.length > 0 && (
        <div className="mt-3 text-[11px] text-muted-foreground">
          {enabledTools.length} tool{enabledTools.length !== 1 ? 's' : ''} enabled
        </div>
      )}
    </div>
  );
}
