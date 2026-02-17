import { useCallback, useEffect, useMemo } from 'react';
import { useCanvasState } from '@/hooks/useCanvasState';
import type { NodeType } from '@/hooks/useCanvasState';
import LeftSidebar from '@/components/LeftSidebar';
import TopBar from '@/components/TopBar';
import BottomBar from '@/components/BottomBar';
import AgentDashboard from '@/components/AgentDashboard';
import WorkflowCanvas from '@/components/canvas/WorkflowCanvas';
import InspectorEmulatorPanel from '@/components/panel/InspectorEmulatorPanel';
import KnowledgeBasePage from '@/components/KnowledgeBasePage';
import ToolsPage from '@/components/ToolsPage';
import SimulatePage from '@/components/SimulatePage';
import LogsPage from '@/components/LogsPage';
import AgentAppearancePage from '@/components/AgentAppearancePage';

export default function App() {
  const state = useCanvasState();
  const {
    // Navigation
    appLevel,
    dashboardView,
    agentView,
    activeAgentId,
    setDashboardView,
    setAgentView,
    navigateToDashboard,
    navigateToAgent,

    // Agents
    agents,
    createAgent,
    deleteAgent,
    updateAgent,

    // Global resources
    globalKnowledge,
    addGlobalKnowledgeItem,
    updateGlobalKnowledgeItem,
    removeGlobalKnowledgeItem,
    globalTools,
    addGlobalTool,
    updateGlobalTool,
    removeGlobalTool,

    // Agent-scoped workflow
    addNode,
    updateNode,
    updateNodeConfig,
    deleteNode,
    setNodes,
    addEdge,
    updateEdge,
    deleteEdge,

    // Selection
    selectedNodeId,
    selectedEdgeId,
    selectNode,
    selectEdge,
    clearSelection,

    // Agent-scoped save
    save,
    clearChanges,

    // Agent-scoped knowledge
    addAgentKnowledgeItem,
    updateAgentKnowledgeItem,
    removeAgentKnowledgeItem,

    // Agent-scoped tools
    addAgentTool,
    updateAgentTool,
    removeAgentTool,

    // Agent-scoped scenarios & logs
    addTestScenario,
    updateTestScenario,
    removeTestScenario,
    addConversationLog,
    removeConversationLog,
    clearConversationLogs,

    // Computed helpers
    getMergedKnowledge,
    getMergedTools,
    getAllTestScenarios,
    getAllConversationLogs,
  } = state;

  // ── Active agent data ──

  const activeAgent = activeAgentId ? agents[activeAgentId] : null;
  const agentNodes = activeAgent?.nodes ?? [];
  const agentEdges = activeAgent?.edges ?? [];
  const agentIsDirty = activeAgent?.isDirty ?? false;

  const selectedNode = agentNodes.find(n => n.id === selectedNodeId);
  const selectedEdge = agentEdges.find(e => e.id === selectedEdgeId);

  // ── Bound callbacks (bind activeAgentId so children don't need it) ──

  const handleAddNode = useCallback(
    (type: NodeType, parentNodeId: string) => {
      if (activeAgentId) addNode(activeAgentId, type, parentNodeId);
    },
    [activeAgentId, addNode]
  );

  const handleUpdateNode = useCallback(
    (nodeId: string, updates: any) => {
      if (activeAgentId) updateNode(activeAgentId, nodeId, updates);
    },
    [activeAgentId, updateNode]
  );

  const handleUpdateNodeConfig = useCallback(
    (nodeId: string, configUpdates: any) => {
      if (activeAgentId) updateNodeConfig(activeAgentId, nodeId, configUpdates);
    },
    [activeAgentId, updateNodeConfig]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (activeAgentId) deleteNode(activeAgentId, nodeId);
    },
    [activeAgentId, deleteNode]
  );

  const handleSetNodes = useCallback(
    (updater: any) => {
      if (activeAgentId) setNodes(activeAgentId, updater);
    },
    [activeAgentId, setNodes]
  );

  const handleAddEdge = useCallback(
    (sourceId: string, targetId: string) => {
      if (activeAgentId) return addEdge(activeAgentId, sourceId, targetId);
      return null;
    },
    [activeAgentId, addEdge]
  );

  const handleUpdateEdge = useCallback(
    (edgeId: string, updates: any) => {
      if (activeAgentId) updateEdge(activeAgentId, edgeId, updates);
    },
    [activeAgentId, updateEdge]
  );

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      if (activeAgentId) deleteEdge(activeAgentId, edgeId);
    },
    [activeAgentId, deleteEdge]
  );

  const handleSave = useCallback(() => {
    if (activeAgentId) save(activeAgentId);
  }, [activeAgentId, save]);

  const handleClearChanges = useCallback(() => {
    if (activeAgentId) clearChanges(activeAgentId);
  }, [activeAgentId, clearChanges]);

  const handleUpdateAgent = useCallback(
    (updates: any) => {
      if (activeAgentId) updateAgent(activeAgentId, updates);
    },
    [activeAgentId, updateAgent]
  );

  // Agent-scoped knowledge (bound)
  const handleAddKnowledgeItem = useCallback(
    (item: any) => { if (activeAgentId) addAgentKnowledgeItem(activeAgentId, item); },
    [activeAgentId, addAgentKnowledgeItem]
  );
  const handleUpdateKnowledgeItem = useCallback(
    (id: string, updates: any) => {
      if (!activeAgentId) return;
      // Route to global or agent based on whether ID exists in global
      const isGlobal = globalKnowledge.some(k => k.id === id);
      if (isGlobal) updateGlobalKnowledgeItem(id, updates);
      else updateAgentKnowledgeItem(activeAgentId, id, updates);
    },
    [activeAgentId, globalKnowledge, updateGlobalKnowledgeItem, updateAgentKnowledgeItem]
  );
  const handleRemoveKnowledgeItem = useCallback(
    (id: string) => {
      if (!activeAgentId) return;
      const isGlobal = globalKnowledge.some(k => k.id === id);
      if (isGlobal) removeGlobalKnowledgeItem(id);
      else removeAgentKnowledgeItem(activeAgentId, id);
    },
    [activeAgentId, globalKnowledge, removeGlobalKnowledgeItem, removeAgentKnowledgeItem]
  );

  // Agent-scoped tools (bound)
  const handleAddTool = useCallback(
    (tool: any) => { if (activeAgentId) addAgentTool(activeAgentId, tool); },
    [activeAgentId, addAgentTool]
  );
  const handleUpdateTool = useCallback(
    (id: string, updates: any) => {
      if (!activeAgentId) return;
      const isGlobal = globalTools.some(t => t.id === id);
      if (isGlobal) updateGlobalTool(id, updates);
      else updateAgentTool(activeAgentId, id, updates);
    },
    [activeAgentId, globalTools, updateGlobalTool, updateAgentTool]
  );
  const handleRemoveTool = useCallback(
    (id: string) => {
      if (!activeAgentId) return;
      const isGlobal = globalTools.some(t => t.id === id);
      if (isGlobal) removeGlobalTool(id);
      else removeAgentTool(activeAgentId, id);
    },
    [activeAgentId, globalTools, removeGlobalTool, removeAgentTool]
  );

  // Agent-scoped scenarios (bound)
  const handleAddScenario = useCallback(
    (scenario: any) => { if (activeAgentId) addTestScenario(activeAgentId, scenario); },
    [activeAgentId, addTestScenario]
  );
  const handleUpdateScenario = useCallback(
    (id: string, updates: any) => { if (activeAgentId) updateTestScenario(activeAgentId, id, updates); },
    [activeAgentId, updateTestScenario]
  );
  const handleRemoveScenario = useCallback(
    (id: string) => { if (activeAgentId) removeTestScenario(activeAgentId, id); },
    [activeAgentId, removeTestScenario]
  );

  // Agent-scoped logs (bound)
  const handleAddLog = useCallback(
    (log: any) => { if (activeAgentId) addConversationLog(activeAgentId, log); },
    [activeAgentId, addConversationLog]
  );
  const handleRemoveLog = useCallback(
    (id: string) => { if (activeAgentId) removeConversationLog(activeAgentId, id); },
    [activeAgentId, removeConversationLog]
  );
  const handleClearLogs = useCallback(
    () => { if (activeAgentId) clearConversationLogs(activeAgentId); },
    [activeAgentId, clearConversationLogs]
  );

  // Merged data for agent-level views
  const mergedKnowledge = activeAgentId ? getMergedKnowledge(activeAgentId) : [];
  const mergedTools = activeAgentId ? getMergedTools(activeAgentId) : [];
  const globalKnowledgeIds = useMemo(() => new Set(globalKnowledge.map(k => k.id)), [globalKnowledge]);
  const globalToolIds = useMemo(() => new Set(globalTools.map(t => t.id)), [globalTools]);

  // ── Keyboard shortcuts ──

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'Escape') {
        clearSelection();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeAgentId) {
        if (selectedNodeId) {
          const node = agentNodes.find(n => n.id === selectedNodeId);
          if (node && node.type !== 'start') {
            deleteNode(activeAgentId, selectedNodeId);
          }
        }
        if (selectedEdgeId) {
          deleteEdge(activeAgentId, selectedEdgeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, agentNodes, activeAgentId, clearSelection, deleteNode, deleteEdge]);

  return (
    <div className="flex h-screen bg-background">
      <LeftSidebar
        appLevel={appLevel}
        dashboardView={dashboardView}
        agentView={agentView}
        onDashboardViewChange={setDashboardView}
        onAgentViewChange={setAgentView}
        onBackToDashboard={navigateToDashboard}
        activeAgentColor={activeAgent?.agent.color}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Dashboard Level ── */}
        {appLevel === 'dashboard' && (
          <>
            {dashboardView === 'home' && (
              <AgentDashboard
                agents={agents}
                onCreateAgent={createAgent}
                onDeleteAgent={deleteAgent}
                onSelectAgent={navigateToAgent}
              />
            )}

            {dashboardView === 'knowledge' && (
              <KnowledgeBasePage
                items={globalKnowledge}
                onAdd={addGlobalKnowledgeItem}
                onUpdate={updateGlobalKnowledgeItem}
                onRemove={removeGlobalKnowledgeItem}
              />
            )}

            {dashboardView === 'tools' && (
              <ToolsPage
                tools={globalTools}
                onAdd={addGlobalTool}
                onUpdate={updateGlobalTool}
                onRemove={removeGlobalTool}
              />
            )}

            {dashboardView === 'simulate' && (
              <SimulatePage
                testScenarios={getAllTestScenarios()}
                conversationLogs={getAllConversationLogs()}
                onAddScenario={handleAddScenario}
                onUpdateScenario={handleUpdateScenario}
                onRemoveScenario={handleRemoveScenario}
                onAddLog={handleAddLog}
                isGlobalView
              />
            )}

            {dashboardView === 'logs' && (
              <LogsPage
                conversationLogs={getAllConversationLogs()}
                onRemoveLog={handleRemoveLog}
                onClearLogs={handleClearLogs}
                onAddScenario={handleAddScenario}
                isGlobalView
              />
            )}
          </>
        )}

        {/* ── Agent Level ── */}
        {appLevel === 'agent' && activeAgent && (
          <>
            {agentView === 'workflow' && (
              <>
                <TopBar
                  agent={activeAgent.agent}
                  onViewChange={setAgentView}
                  onBackToDashboard={navigateToDashboard}
                />
                <div className="flex flex-1 overflow-hidden">
                  <WorkflowCanvas
                    nodes={agentNodes}
                    edges={agentEdges}
                    selectedNodeId={selectedNodeId}
                    selectedEdgeId={selectedEdgeId}
                    onSelectNode={selectNode}
                    onSelectEdge={selectEdge}
                    onClearSelection={clearSelection}
                    onUpdateNode={handleUpdateNode}
                    onUpdateEdge={handleUpdateEdge}
                    onDeleteEdge={handleDeleteEdge}
                    onAddEdge={handleAddEdge}
                    onAddNode={handleAddNode}
                    setNodes={handleSetNodes}
                  />
                  <InspectorEmulatorPanel
                    selectedNode={selectedNode}
                    selectedEdge={selectedEdge}
                    nodes={agentNodes}
                    onClose={clearSelection}
                    onUpdateNode={handleUpdateNode}
                    onUpdateNodeConfig={handleUpdateNodeConfig}
                    onDeleteNode={handleDeleteNode}
                    onUpdateEdge={handleUpdateEdge}
                    onDeleteEdge={handleDeleteEdge}
                    toolLibrary={mergedTools}
                    onAddTool={handleAddTool}
                    onUpdateTool={handleUpdateTool}
                    onRemoveTool={handleRemoveTool}
                    testScenarios={activeAgent.testScenarios}
                    conversationLogs={activeAgent.conversationLogs}
                    onAddScenario={handleAddScenario}
                    onUpdateScenario={handleUpdateScenario}
                    onRemoveScenario={handleRemoveScenario}
                    onAddLog={handleAddLog}
                    agentMode={activeAgent.agent.mode}
                    agentName={activeAgent.agent.name}
                    agentColor={activeAgent.agent.color}
                  />
                </div>
                <BottomBar isDirty={agentIsDirty} onSave={handleSave} onClear={handleClearChanges} />
              </>
            )}

            {agentView === 'appearance' && (
              <AgentAppearancePage agent={activeAgent.agent} onUpdateAgent={handleUpdateAgent} />
            )}

            {agentView === 'knowledge' && (
              <KnowledgeBasePage
                items={mergedKnowledge}
                onAdd={handleAddKnowledgeItem}
                onUpdate={handleUpdateKnowledgeItem}
                onRemove={handleRemoveKnowledgeItem}
                globalItemIds={globalKnowledgeIds}
                scope="agent"
                agentName={activeAgent.agent.name}
              />
            )}

            {agentView === 'tools' && (
              <ToolsPage
                tools={mergedTools}
                onAdd={handleAddTool}
                onUpdate={handleUpdateTool}
                onRemove={handleRemoveTool}
                globalToolIds={globalToolIds}
                scope="agent"
                agentName={activeAgent.agent.name}
              />
            )}

            {agentView === 'simulate' && (
              <SimulatePage
                testScenarios={activeAgent.testScenarios}
                conversationLogs={activeAgent.conversationLogs}
                onAddScenario={handleAddScenario}
                onUpdateScenario={handleUpdateScenario}
                onRemoveScenario={handleRemoveScenario}
                onAddLog={handleAddLog}
                agentName={activeAgent.agent.name}
                agentMode={activeAgent.agent.mode}
              />
            )}

            {agentView === 'logs' && (
              <LogsPage
                conversationLogs={activeAgent.conversationLogs}
                onRemoveLog={handleRemoveLog}
                onClearLogs={handleClearLogs}
                onAddScenario={handleAddScenario}
                agentName={activeAgent.agent.name}
                agentMode={activeAgent.agent.mode}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
