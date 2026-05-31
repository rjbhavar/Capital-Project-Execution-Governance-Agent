import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  Brain, Activity, Zap, CheckCircle, AlertTriangle, Clock, 
  TrendingUp, Shield, DollarSign, Package, FileText, Target,
  Play, Pause, RefreshCw, Eye, ChevronRight, Sparkles
} from 'lucide-react';
import { getOrchestrator } from '../agents/AgentOrchestrator';
import { allAgents } from '../agents/specialized/AllSpecializedAgents';

const AgentOperationsCenter = () => {
  const { projects } = useData();
  const [activeAgents, setActiveAgents] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Get agent status
  const agentList = Object.entries(allAgents).map(([key, agent]) => ({
    id: key,
    name: agent.name,
    description: agent.description,
    capabilities: agent.capabilities,
    status: agent.status,
    executionCount: agent.executionHistory?.length || 0,
    lastExecution: agent.executionHistory?.[0]?.timestamp || null
  }));

  const executeAgentsForProject = async (projectId) => {
    setIsExecuting(true);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      setIsExecuting(false);
      return;
    }

    try {
      const orchestrator = getOrchestrator();
      const result = await orchestrator.executeAgents(project, {
        enableMemory: true,
        parallel: false
      });

      setExecutionHistory(prev => [result, ...prev].slice(0, 50));
      setSelectedExecution(result);
    } catch (error) {
      console.error('Agent execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getAgentIcon = (agentName) => {
    if (agentName.includes('Budget')) return DollarSign;
    if (agentName.includes('Risk')) return Shield;
    if (agentName.includes('Schedule')) return Clock;
    if (agentName.includes('Procurement')) return Package;
    if (agentName.includes('Contract')) return FileText;
    return Brain;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <Zap className="w-10 h-10 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Agent Operations Center</h1>
              <p className="text-blue-200 text-lg mt-1">Autonomous Intelligence Network</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-400/30">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">{agentList.length} Agents Active</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-sm text-blue-200 mb-1">Total Agents</div>
            <div className="text-3xl font-bold">{agentList.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-sm text-blue-200 mb-1">Executions Today</div>
            <div className="text-3xl font-bold">{executionHistory.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-sm text-blue-200 mb-1">Findings Generated</div>
            <div className="text-3xl font-bold">
              {executionHistory.reduce((sum, ex) => 
                sum + Object.values(ex.agentResults || {}).reduce((s, r) => 
                  s + (r.findings?.length || 0), 0), 0)}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-sm text-blue-200 mb-1">Recommendations</div>
            <div className="text-3xl font-bold">
              {executionHistory.reduce((sum, ex) => 
                sum + (ex.aggregatedResults?.recommendations?.length || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Active Agents</h2>
          <button
            onClick={() => projects.length > 0 && executeAgentsForProject(projects[0].id)}
            disabled={isExecuting || projects.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Execute All Agents
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentList.map((agent) => {
            const Icon = getAgentIcon(agent.name);
            return (
              <div
                key={agent.id}
                className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{agent.name}</div>
                      <div className="text-xs text-gray-500">Autonomous Agent</div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(agent.status)}`}>
                    {agent.status || 'idle'}
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4">{agent.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{agent.executionCount} executions</span>
                  {agent.lastExecution && (
                    <span>{new Date(agent.lastExecution).toLocaleDateString()}</span>
                  )}
                </div>

                {agent.capabilities && agent.capabilities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((cap, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {cap.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Execution History */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Execution History</h2>
        
        {executionHistory.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No executions yet. Run agents to see results.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {executionHistory.map((execution, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedExecution(execution)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">{execution.projectName}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(execution.executiveBriefing?.generatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-700">
                        {Object.keys(execution.agentResults || {}).length} agents executed
                      </span>
                      <span className="text-gray-700">
                        {execution.aggregatedResults?.findings?.length || 0} findings
                      </span>
                      <span className="text-gray-700">
                        {execution.aggregatedResults?.recommendations?.length || 0} recommendations
                      </span>
                      <span className="text-gray-700">
                        {execution.executionTime}ms
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Execution Details */}
      {selectedExecution && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Execution Details</h2>
            <button
              onClick={() => setSelectedExecution(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          <div className="space-y-6">
            {/* Executive Briefing */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Executive Briefing</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Overall Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedExecution.executiveBriefing?.overallStatus === 'healthy' ? 'bg-green-100 text-green-700' :
                    selectedExecution.executiveBriefing?.overallStatus === 'attention_required' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedExecution.executiveBriefing?.overallStatus}
                  </span>
                </div>
                <p className="text-gray-700">{selectedExecution.executiveBriefing?.summaryText}</p>
              </div>
            </div>

            {/* Recommendations */}
            {selectedExecution.aggregatedResults?.recommendations?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {selectedExecution.aggregatedResults.recommendations.slice(0, 5).map((rec, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{rec.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{rec.description}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {rec.priority}
                            </span>
                            <span className="text-xs text-gray-500">by {rec.agent}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentOperationsCenter;

// Made with Bob
