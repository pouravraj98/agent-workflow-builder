import { useState } from 'react';
import {
  Plus, Wrench, BookOpen,
  FileText, FileUp, Globe, Type,
  Calculator, Code, Cloud, Mail, Image, Volume2,
  MessageSquare, Calendar, Database, Github,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import AddKnowledgeDialog from '@/components/panel/dialogs/AddKnowledgeDialog';
import AddToolDialog from '@/components/panel/dialogs/AddToolDialog';
import type { KnowledgeItem, ToolItem } from '@/hooks/useCanvasState';

const TYPE_ICONS: Record<string, typeof FileText> = {
  text: Type,
  link: Globe,
  file: FileUp,
};

const TYPE_COLORS: Record<string, string> = {
  text: '#22c55e',
  link: '#3b82f6',
  file: '#f59e0b',
};

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

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface ResourcesTabProps {
  config: Record<string, any>;
  onUpdateConfig: (updates: Record<string, any>) => void;
  toolLibrary?: ToolItem[];
  onAddTool?: (tool: Omit<ToolItem, 'id'>) => void;
  onUpdateTool?: (id: string, updates: Partial<ToolItem>) => void;
  onRemoveTool?: (id: string) => void;
}

export default function ResourcesTab({
  config,
  onUpdateConfig,
  toolLibrary,
  onAddTool,
  onUpdateTool,
  onRemoveTool,
}: ResourcesTabProps) {
  const knowledge: KnowledgeItem[] = config.knowledge || [];
  const enabledTools: string[] = config.enabledTools || [];
  const inheritKnowledge: boolean = config.inheritKnowledge ?? true;

  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false);
  const [toolDialogOpen, setToolDialogOpen] = useState(false);

  // Knowledge CRUD
  const handleAddKnowledge = (item: { type: KnowledgeItem['type']; title: string; content: string }) => {
    onUpdateConfig({ knowledge: [...knowledge, { id: generateId('k'), ...item }] });
  };

  const handleUpdateKnowledge = (id: string, updates: Partial<KnowledgeItem>) => {
    onUpdateConfig({ knowledge: knowledge.map(k => k.id === id ? { ...k, ...updates } : k) });
  };

  const handleRemoveKnowledge = (id: string) => {
    onUpdateConfig({ knowledge: knowledge.filter(k => k.id !== id) });
  };

  // Tool toggle
  const handleToggleTool = (toolId: string) => {
    if (enabledTools.includes(toolId)) {
      onUpdateConfig({ enabledTools: enabledTools.filter(id => id !== toolId) });
    } else {
      onUpdateConfig({ enabledTools: [...enabledTools, toolId] });
    }
  };

  const enabledToolItems = toolLibrary
    ? enabledTools.map(id => toolLibrary.find(t => t.id === id)).filter((t): t is ToolItem => !!t)
    : [];

  return (
    <div className="space-y-6">
      {/* ── Knowledge Section ── */}
      <div>
        {/* Inherit toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[12px] font-medium">Inherit knowledge base</span>
          <Switch
            checked={inheritKnowledge}
            onCheckedChange={(checked) => onUpdateConfig({ inheritKnowledge: checked })}
            className="scale-90"
          />
        </div>

        {/* Additional knowledge */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[12px] font-medium">Additional knowledge base</span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2.5"
            onClick={() => setKnowledgeDialogOpen(true)}
          >
            {knowledge.length > 0 ? 'Manage' : 'Add document'}
          </Button>
        </div>

        {/* Summary / preview */}
        {knowledge.length === 0 ? (
          <button
            onClick={() => setKnowledgeDialogOpen(true)}
            className="w-full rounded-lg border border-dashed p-4 text-center hover:border-primary/30 hover:bg-accent/30 transition-colors"
          >
            <BookOpen className="h-5 w-5 text-muted-foreground/40 mx-auto mb-1.5" />
            <p className="text-[12px] text-muted-foreground">No documents added yet.</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Click to add URLs, files, or text.</p>
          </button>
        ) : (
          <button
            onClick={() => setKnowledgeDialogOpen(true)}
            className="w-full rounded-lg border hover:border-primary/30 hover:bg-accent/20 transition-colors text-left"
          >
            <div className="divide-y">
              {knowledge.slice(0, 3).map((item) => {
                const Icon = TYPE_ICONS[item.type] || FileText;
                const color = TYPE_COLORS[item.type] || '#6b7280';
                return (
                  <div key={item.id} className="flex items-center gap-2.5 px-3 py-2">
                    <div className="shrink-0" style={{ color }}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-medium leading-tight truncate">
                        {item.title || 'Untitled'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {knowledge.length > 3 && (
              <div className="px-3 py-1.5 border-t">
                <span className="text-[10px] text-muted-foreground">
                  +{knowledge.length - 3} more document{knowledge.length - 3 !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </button>
        )}
      </div>

      <Separator />

      {/* ── Tools Section ── */}
      {toolLibrary && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="section-label">Tools</div>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[11px] gap-1 px-2"
              onClick={() => setToolDialogOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Browse
            </Button>
          </div>

          {enabledToolItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <Wrench className="h-5 w-5 text-muted-foreground/40 mx-auto mb-1.5" />
              <p className="text-[12px] text-muted-foreground">No tools enabled.</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">Browse the tool library to enable tools for this agent.</p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {enabledToolItems.map((tool) => {
                  const Icon = TOOL_ICONS[tool.id] || Wrench;
                  const isIntegration = tool.category === 'integration';
                  const isUserCreated = tool.category === 'webhook' || tool.category === 'custom_api';
                  const brandColor = isIntegration ? (INTEGRATION_COLORS[tool.id] || '#6b7280') : undefined;
                  const iconBg = brandColor
                    ? `${brandColor}15`
                    : isUserCreated
                      ? (tool.category === 'webhook' ? '#eff6ff' : '#f3e8ff')
                      : '#fffbeb';
                  const iconColor = brandColor
                    || (isUserCreated ? (tool.category === 'webhook' ? '#2563eb' : '#9333ea') : '#d97706');

                  return (
                    <div key={tool.id} className="flex items-center gap-2.5 rounded-lg border p-2 transition-colors">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                        style={{ backgroundColor: iconBg }}
                      >
                        <Icon className="h-3 w-3" style={{ color: iconColor }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-medium leading-tight truncate">{tool.name || 'Unnamed'}</div>
                      </div>
                      <Switch
                        checked={true}
                        onCheckedChange={() => handleToggleTool(tool.id)}
                        className="scale-75"
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                {enabledToolItems.length} tool{enabledToolItems.length !== 1 ? 's' : ''} enabled
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Dialogs ── */}
      <AddKnowledgeDialog
        open={knowledgeDialogOpen}
        onOpenChange={setKnowledgeDialogOpen}
        items={knowledge}
        onAdd={handleAddKnowledge}
        onUpdate={handleUpdateKnowledge}
        onRemove={handleRemoveKnowledge}
      />

      {toolLibrary && (
        <AddToolDialog
          open={toolDialogOpen}
          onOpenChange={setToolDialogOpen}
          enabledTools={enabledTools}
          toolLibrary={toolLibrary}
          onToggleTool={handleToggleTool}
          onAddTool={onAddTool}
          onUpdateTool={onUpdateTool}
          onRemoveTool={onRemoveTool}
        />
      )}
    </div>
  );
}
