import { useState } from 'react';
import { X, Trash2, Play, Bot, Wrench, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import GeneralTab from './GeneralTab';
import type { WorkflowNode, ToolItem } from '@/hooks/useCanvasState';

interface RightPanelProps {
  node: WorkflowNode;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onUpdateNodeConfig: (nodeId: string, updates: Record<string, any>) => void;
  onDeleteNode: (nodeId: string) => void;
  toolLibrary?: ToolItem[];
  onAddTool?: (tool: Omit<ToolItem, 'id'>) => void;
  onUpdateTool?: (id: string, updates: Partial<ToolItem>) => void;
  onRemoveTool?: (id: string) => void;
  agentMode?: 'chat' | 'voice';
}

export default function RightPanel({
  node,
  onClose,
  onUpdateNode,
  onUpdateNodeConfig,
  onDeleteNode,
  toolLibrary,
  onAddTool,
  onUpdateTool,
  onRemoveTool,
  agentMode,
}: RightPanelProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(node.label);

  const handleNameSubmit = () => {
    if (nameValue.trim()) {
      onUpdateNode(node.id, { label: nameValue.trim() });
    }
    setEditingName(false);
  };

  const canDelete = node.type !== 'start';

  const iconMap: Record<string, typeof Play> = { start: Play, agent: Bot, tool: Wrench, end: StopCircle };
  const colorMap: Record<string, string> = {
    start: 'var(--node-start)', agent: 'var(--node-agent)',
    tool: 'var(--node-tool)', end: 'var(--node-end)',
  };
  const bgMap: Record<string, string> = {
    start: 'var(--node-start-light)', agent: 'var(--node-agent-light)',
    tool: 'var(--node-tool-light)', end: 'var(--node-end-light)',
  };
  const typeLabelMap: Record<string, string> = { start: 'Start', agent: 'Agent', tool: 'Tool', end: 'End' };

  const accentColor = colorMap[node.type] || colorMap.agent;
  const accentBg = bgMap[node.type] || bgMap.agent;
  const IconComponent = iconMap[node.type] || Bot;
  const typeLabel = typeLabelMap[node.type] || 'Node';

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: accentBg }}
          >
            <IconComponent className="h-3.5 w-3.5" style={{ color: accentColor }} />
          </div>
          <div className="min-w-0 flex-1">
            {editingName ? (
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSubmit();
                  if (e.key === 'Escape') { setNameValue(node.label); setEditingName(false); }
                }}
                className="h-7 text-[14px] font-semibold"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <h3
                  className="truncate text-[14px] font-semibold cursor-pointer hover:text-primary transition-colors"
                  onDoubleClick={() => { setNameValue(node.label); setEditingName(true); }}
                >
                  {node.label}
                </h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium shrink-0">
                  {typeLabel}
                </Badge>
              </div>
            )}
          </div>
        </div>
        <div className="ml-3 flex items-center gap-0.5">
          {canDelete && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDeleteNode(node.id)}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete node"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground"
            aria-label="Close panel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 min-h-0 ${node.type === 'agent' ? 'flex flex-col' : 'overflow-y-auto px-4 py-5'}`}>
        <GeneralTab
          node={node}
          onUpdateConfig={(updates) => onUpdateNodeConfig(node.id, updates)}
          toolLibrary={toolLibrary}
          onAddTool={onAddTool}
          onUpdateTool={onUpdateTool}
          onRemoveTool={onRemoveTool}
          agentMode={agentMode}
        />
      </div>
    </div>
  );
}
