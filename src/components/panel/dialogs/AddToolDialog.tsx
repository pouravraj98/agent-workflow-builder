import { useState } from 'react';
import {
  Search, Plus, X,
  Globe, Calculator, Code, Cloud, Mail, FileText, Image, Volume2,
  MessageSquare, Calendar, Database, BookOpen, Github, Wrench, Webhook, Plug,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ToolItem, ToolCategory } from '@/hooks/useCanvasState';
import ConfigureToolDialog from './ConfigureToolDialog';

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

interface AddToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabledTools: string[];
  toolLibrary: ToolItem[];
  onToggleTool: (toolId: string) => void;
  onAddTool?: (tool: Omit<ToolItem, 'id'>) => void;
  onUpdateTool?: (id: string, updates: Partial<ToolItem>) => void;
  onRemoveTool?: (id: string) => void;
}

export default function AddToolDialog({
  open,
  onOpenChange,
  enabledTools,
  toolLibrary,
  onToggleTool,
  onAddTool,
  onUpdateTool,
  onRemoveTool,
}: AddToolDialogProps) {
  const [search, setSearch] = useState('');
  const [configureOpen, setConfigureOpen] = useState(false);
  const [configureMode, setConfigureMode] = useState<'webhook' | 'custom_api'>('webhook');
  const [configureTool, setConfigureTool] = useState<ToolItem | null>(null);

  const filtered = search
    ? toolLibrary.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      )
    : toolLibrary;

  const categories: ToolCategory[] = ['predefined', 'integration', 'webhook', 'custom_api'];
  const grouped = categories
    .map(cat => ({ cat, tools: filtered.filter(t => t.category === cat) }))
    .filter(g => g.tools.length > 0 || (g.cat === 'webhook' || g.cat === 'custom_api'));

  const enabledCount = enabledTools.length;

  const openConfigureDialog = (mode: 'webhook' | 'custom_api', tool?: ToolItem) => {
    setConfigureMode(mode);
    setConfigureTool(tool || null);
    onOpenChange(false); // close library dialog
    // small delay so the library dialog animates out before the sheet opens
    requestAnimationFrame(() => setConfigureOpen(true));
  };

  const handleConfigureSave = (tool: Omit<ToolItem, 'id'>) => {
    onAddTool?.(tool);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[16px]">Tool Library</DialogTitle>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="pl-8 text-[13px]"
            />
          </div>

          {/* Scrollable tool list */}
          <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-6 min-h-0">
            {grouped.map(({ cat, tools }) => {
              const isUserCreated = cat === 'webhook' || cat === 'custom_api';

              return (
                <section key={cat}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="section-label">{CATEGORY_LABELS[cat]}</div>
                    {isUserCreated && onAddTool && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[11px] gap-1 px-2"
                        onClick={() => openConfigureDialog(cat as 'webhook' | 'custom_api')}
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </Button>
                    )}
                  </div>

                  {tools.length === 0 && isUserCreated ? (
                    <button
                      onClick={() => openConfigureDialog(cat as 'webhook' | 'custom_api')}
                      className="w-full rounded-lg border border-dashed p-4 text-center hover:border-primary/30 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {cat === 'webhook'
                          ? <Webhook className="h-4 w-4 text-muted-foreground/40" />
                          : <Plug className="h-4 w-4 text-muted-foreground/40" />
                        }
                        <p className="text-[12px] text-muted-foreground">
                          {cat === 'webhook' ? 'No webhooks configured.' : 'No custom APIs configured.'}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Click to add one.</p>
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      {tools.map((tool) => (
                        <ToolRow
                          key={tool.id}
                          tool={tool}
                          category={cat}
                          isEnabled={enabledTools.includes(tool.id)}
                          onToggle={() => onToggleTool(tool.id)}
                          onEdit={isUserCreated ? () => openConfigureDialog(cat as 'webhook' | 'custom_api', tool) : undefined}
                          onRemoveTool={onRemoveTool}
                          onDisable={() => {
                            if (enabledTools.includes(tool.id)) onToggleTool(tool.id);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* Footer */}
          <DialogFooter className="flex-row items-center justify-between sm:justify-between border-t -mx-6 px-6 pt-4 -mb-2">
            <span className="text-[12px] text-muted-foreground">
              {enabledCount} tool{enabledCount !== 1 ? 's' : ''} enabled
            </span>
            <Button onClick={() => onOpenChange(false)} className="text-[13px]">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Tool Dialog (renders outside the library dialog) */}
      <ConfigureToolDialog
        open={configureOpen}
        onOpenChange={setConfigureOpen}
        mode={configureMode}
        editTool={configureTool}
        onSave={handleConfigureSave}
        onUpdate={onUpdateTool}
      />
    </>
  );
}

function ToolRow({
  tool,
  category,
  isEnabled,
  onToggle,
  onEdit,
  onRemoveTool,
  onDisable,
}: {
  tool: ToolItem;
  category: ToolCategory;
  isEnabled: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  onRemoveTool?: (id: string) => void;
  onDisable: () => void;
}) {
  const Icon = TOOL_ICONS[tool.id] || Wrench;
  const isIntegration = category === 'integration';
  const isUserCreated = category === 'webhook' || category === 'custom_api';
  const brandColor = isIntegration ? (INTEGRATION_COLORS[tool.id] || '#6b7280') : undefined;

  const iconBg = brandColor
    ? `${brandColor}15`
    : isUserCreated
      ? (category === 'webhook' ? '#eff6ff' : '#f3e8ff')
      : '#fffbeb';

  const iconColor = brandColor
    || (isUserCreated ? (category === 'webhook' ? '#2563eb' : '#9333ea') : '#d97706');

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${isEnabled ? 'border-primary/20 bg-primary/[0.02]' : ''} ${isUserCreated ? 'cursor-pointer hover:border-primary/30 hover:bg-accent/20' : ''}`}
      onClick={isUserCreated ? onEdit : undefined}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium leading-tight truncate">
            {tool.name || (isUserCreated ? (category === 'webhook' ? 'Unnamed webhook' : 'Unnamed API') : tool.name)}
          </div>
          <div className="text-[11px] text-muted-foreground leading-tight truncate">{tool.description}</div>
          {isUserCreated && tool.config.url && (
            <div className="text-[10px] text-muted-foreground/60 font-mono leading-tight mt-0.5 truncate">
              {tool.config.method || 'GET'} {tool.config.url}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {isIntegration && !isEnabled ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] px-2.5"
              onClick={onToggle}
            >
              Connect
            </Button>
          ) : (
            <Switch
              checked={isEnabled}
              onCheckedChange={onToggle}
            />
          )}
          {isUserCreated && onRemoveTool && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDisable();
                onRemoveTool(tool.id);
              }}
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
