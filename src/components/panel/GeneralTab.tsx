import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ToolsSection from '@/components/panel/sections/ToolsSection';
import CoreTab from '@/components/panel/tabs/CoreTab';
import ResourcesTab from '@/components/panel/tabs/ResourcesTab';
import SafetyTab from '@/components/panel/tabs/SafetyTab';
import OutputTab from '@/components/panel/tabs/OutputTab';
import type { WorkflowNode, ToolItem } from '@/hooks/useCanvasState';

interface GeneralTabProps {
  node: WorkflowNode;
  onUpdateConfig: (updates: Record<string, any>) => void;
  toolLibrary?: ToolItem[];
  onAddTool?: (tool: Omit<ToolItem, 'id'>) => void;
  onUpdateTool?: (id: string, updates: Partial<ToolItem>) => void;
  onRemoveTool?: (id: string) => void;
  agentMode?: 'chat' | 'voice';
}

export default function GeneralTab({ node, onUpdateConfig, toolLibrary, onAddTool, onUpdateTool, onRemoveTool, agentMode }: GeneralTabProps) {
  if (node.type === 'start') {
    return (
      <div className="space-y-6">
        <div>
          <div className="section-label mb-3">Configuration</div>
          <div className="rounded-lg border bg-muted p-3 text-[13px] text-muted-foreground">
            Entry point of the workflow. Connect this to your main agent to begin the flow.
          </div>
        </div>
      </div>
    );
  }

  if (node.type === 'tool') {
    const config = node.config || {};
    return (
      <div className="space-y-6">
        {toolLibrary ? (
          <ToolsSection
            enabledTools={config.enabledTools || []}
            toolLibrary={toolLibrary}
            onUpdate={(tools) => onUpdateConfig({ enabledTools: tools })}
            onAddTool={onAddTool}
            onUpdateTool={onUpdateTool}
            onRemoveTool={onRemoveTool}
          />
        ) : (
          <div>
            <div className="section-label mb-3">Tool Configuration</div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[12px]">Tool Name</Label>
                <Input
                  value={config.toolName || ''}
                  onChange={(e) => onUpdateConfig({ toolName: e.target.value })}
                  placeholder="e.g. search_web, get_weather"
                  className="text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[12px]">Tool Description</Label>
                <Textarea
                  value={config.toolDescription || ''}
                  onChange={(e) => onUpdateConfig({ toolDescription: e.target.value })}
                  placeholder="What does this tool do?"
                  rows={3}
                  className="text-[13px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (node.type === 'end') {
    return (
      <div className="space-y-6">
        <div>
          <div className="section-label mb-3">Configuration</div>
          <div className="rounded-lg border bg-muted p-3 text-[13px] text-muted-foreground">
            This node terminates the workflow. Any path reaching this node will end.
          </div>
        </div>
      </div>
    );
  }

  const config = node.config || {};

  return (
    <Tabs defaultValue="core" className="flex-1 min-h-0">
      <TabsList variant="line" className="w-full justify-start px-4 border-b shrink-0">
        <TabsTrigger value="core" className="text-[12px] px-3">Core</TabsTrigger>
        <TabsTrigger value="resources" className="text-[12px] px-3">Resources</TabsTrigger>
        <TabsTrigger value="safety" className="text-[12px] px-3">Safety</TabsTrigger>
        <TabsTrigger value="output" className="text-[12px] px-3">Output</TabsTrigger>
      </TabsList>

      <TabsContent value="core" className="overflow-y-auto px-4 pt-5 pb-5 mt-0 min-h-0">
        <CoreTab config={config} onUpdateConfig={onUpdateConfig} agentMode={agentMode} />
      </TabsContent>

      <TabsContent value="resources" className="overflow-y-auto px-4 pt-5 pb-5 mt-0 min-h-0">
        <ResourcesTab
          config={config}
          onUpdateConfig={onUpdateConfig}
          toolLibrary={toolLibrary}
          onAddTool={onAddTool}
          onUpdateTool={onUpdateTool}
          onRemoveTool={onRemoveTool}
        />
      </TabsContent>

      <TabsContent value="safety" className="overflow-y-auto px-4 pt-5 pb-5 mt-0 min-h-0">
        <SafetyTab config={config} onUpdateConfig={onUpdateConfig} agentMode={agentMode} />
      </TabsContent>

      <TabsContent value="output" className="overflow-y-auto px-4 pt-5 pb-5 mt-0 min-h-0">
        <OutputTab config={config} onUpdateConfig={onUpdateConfig} agentMode={agentMode} />
      </TabsContent>

    </Tabs>
  );
}
