import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, MessageSquare } from 'lucide-react';
import RightPanel from './RightPanel';
import EdgePanel from './EdgePanel';
import TestAgentPanel from './TestAgentPanel';
import type { WorkflowNode, WorkflowEdge, ToolItem, TestScenario, ConversationLog } from '@/hooks/useCanvasState';

interface InspectorEmulatorPanelProps {
  selectedNode: WorkflowNode | undefined;
  selectedEdge: WorkflowEdge | undefined;
  nodes: WorkflowNode[];
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onUpdateNodeConfig: (nodeId: string, updates: Record<string, any>) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<WorkflowEdge>) => void;
  onDeleteEdge: (edgeId: string) => void;
  toolLibrary: ToolItem[];
  onAddTool: (tool: Omit<ToolItem, 'id'>) => void;
  onUpdateTool: (id: string, updates: Partial<ToolItem>) => void;
  onRemoveTool: (id: string) => void;
  testScenarios: TestScenario[];
  conversationLogs: ConversationLog[];
  onAddScenario: (scenario: Omit<TestScenario, 'id'>) => void;
  onUpdateScenario: (id: string, updates: Partial<TestScenario>) => void;
  onRemoveScenario: (id: string) => void;
  onAddLog: (log: Omit<ConversationLog, 'id'>) => void;
  agentMode?: 'chat' | 'voice';
  agentName?: string;
  agentColor?: string;
}

export default function InspectorEmulatorPanel({
  selectedNode,
  selectedEdge,
  nodes,
  onClose,
  onUpdateNode,
  onUpdateNodeConfig,
  onDeleteNode,
  onUpdateEdge,
  onDeleteEdge,
  toolLibrary,
  onAddTool,
  onUpdateTool,
  onRemoveTool,
  testScenarios,
  conversationLogs,
  onAddScenario,
  onUpdateScenario,
  onRemoveScenario,
  onAddLog,
  agentMode,
  agentName,
  agentColor,
}: InspectorEmulatorPanelProps) {
  const [activeTab, setActiveTab] = useState<'inspector' | 'emulator'>('emulator');
  const prevSelectionRef = useRef<string | null>(null);

  const hasSelection = !!(selectedNode || selectedEdge);

  // Auto-switch to inspector when a node/edge is selected, emulator when deselected
  useEffect(() => {
    const currentId = selectedNode?.id || selectedEdge?.id || null;
    if (currentId && currentId !== prevSelectionRef.current) {
      setActiveTab('inspector');
    } else if (!currentId && prevSelectionRef.current) {
      setActiveTab('emulator');
    }
    prevSelectionRef.current = currentId;
  }, [selectedNode?.id, selectedEdge?.id]);

  return (
    <div className="flex h-full w-[520px] max-w-full flex-col border-l bg-background shrink-0">
      {/* Tab switcher — always visible */}
      <div className="flex items-center px-3 py-2 border-b shrink-0">
        <div className="flex gap-0.5 bg-muted rounded-lg p-0.5 flex-1">
          {([
            { id: 'inspector' as const, label: 'Inspector', icon: SlidersHorizontal },
            { id: 'emulator' as const, label: 'Emulator', icon: MessageSquare },
          ]).map((tab) => {
            const Icon = tab.icon;
            const isDisabled = tab.id === 'inspector' && !hasSelection;
            const isActive = activeTab === tab.id && !isDisabled;
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setActiveTab(tab.id)}
                disabled={isDisabled}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : isDisabled
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inspector — only when selected and on inspector tab */}
      {hasSelection && (
        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab !== 'inspector' ? 'hidden' : ''}`}>
          {selectedNode ? (
            <RightPanel
              key={selectedNode.id}
              node={selectedNode}
              onClose={onClose}
              onUpdateNode={onUpdateNode}
              onUpdateNodeConfig={onUpdateNodeConfig}
              onDeleteNode={onDeleteNode}
              toolLibrary={toolLibrary}
              onAddTool={onAddTool}
              onUpdateTool={onUpdateTool}
              onRemoveTool={onRemoveTool}
              agentMode={agentMode}
            />
          ) : selectedEdge ? (
            <EdgePanel
              key={selectedEdge.id}
              edge={selectedEdge}
              nodes={nodes}
              onClose={onClose}
              onUpdateEdge={onUpdateEdge}
              onDeleteEdge={onDeleteEdge}
            />
          ) : null}
        </div>
      )}

      {/* Emulator — always rendered to preserve chat state */}
      <div className={`flex-1 flex flex-col overflow-hidden ${hasSelection && activeTab !== 'emulator' ? 'hidden' : ''}`}>
        <TestAgentPanel
          testScenarios={testScenarios}
          conversationLogs={conversationLogs}
          onAddScenario={onAddScenario}
          onUpdateScenario={onUpdateScenario}
          onRemoveScenario={onRemoveScenario}
          onAddLog={onAddLog}
          agentMode={agentMode}
          agentName={agentName}
          agentColor={agentColor}
        />
      </div>
    </div>
  );
}
