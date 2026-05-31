import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { agentActionExecutor, ACTION_STATUS } from '../../services/agentActions';
import { GradientCard } from '../common/PremiumCard';

const ExecutionHistory = ({ projectId = null, limit = 10 }) => {
  const [history, setHistory] = useState([]);
  const [expandedActions, setExpandedActions] = useState(new Set());

  useEffect(() => {
    loadHistory();
  }, [projectId, limit]);

  const loadHistory = () => {
    let actions;
    if (projectId) {
      actions = agentActionExecutor.getProjectActions(projectId);
    } else {
      actions = Array.from(agentActionExecutor.actions.values());
    }

    // Filter to completed/failed/rejected actions and sort by completion time
    const completedActions = actions
      .filter(action => 
        action.status === ACTION_STATUS.COMPLETED ||
        action.status === ACTION_STATUS.FAILED ||
        action.status === ACTION_STATUS.REJECTED
      )
      .sort((a, b) => {
        const aTime = a.completedAt || a.approvedAt || a.createdAt;
        const bTime = b.completedAt || b.approvedAt || b.createdAt;
        return new Date(bTime) - new Date(aTime);
      })
      .slice(0, limit);

    setHistory(completedActions);
  };

  const toggleExpand = (actionId) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(actionId)) {
      newExpanded.delete(actionId);
    } else {
      newExpanded.add(actionId);
    }
    setExpandedActions(newExpanded);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ACTION_STATUS.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case ACTION_STATUS.FAILED:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case ACTION_STATUS.REJECTED:
        return <XCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ACTION_STATUS.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-300';
      case ACTION_STATUS.FAILED:
        return 'bg-red-100 text-red-800 border-red-300';
      case ACTION_STATUS.REJECTED:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const duration = new Date(end) - new Date(start);
    const seconds = Math.floor(duration / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  if (history.length === 0) {
    return (
      <GradientCard gradient="gray" className="p-6">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No execution history</p>
          <p className="text-sm text-gray-500 mt-1">Agent actions will appear here once executed</p>
        </div>
      </GradientCard>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Execution History ({history.length})
        </h3>
        <Activity className="w-5 h-5 text-gray-400" />
      </div>

      {history.map((action) => {
        const isExpanded = expandedActions.has(action.id);

        return (
          <div
            key={action.id}
            className={`border-2 rounded-lg ${getStatusColor(action.status)} transition-all duration-200`}
          >
            {/* Header - Always Visible */}
            <div
              className="p-4 cursor-pointer hover:bg-white hover:bg-opacity-30 transition-colors"
              onClick={() => toggleExpand(action.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getStatusIcon(action.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{action.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        action.status === ACTION_STATUS.COMPLETED ? 'bg-green-600 text-white' :
                        action.status === ACTION_STATUS.FAILED ? 'bg-red-600 text-white' :
                        'bg-orange-600 text-white'
                      }`}>
                        {action.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{action.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span className="font-medium">{action.agentName}</span>
                      {action.projectName && <span>• {action.projectName}</span>}
                      <span>• {new Date(action.completedAt || action.approvedAt).toLocaleString()}</span>
                      {action.executedAt && action.completedAt && (
                        <span>• Duration: {formatDuration(action.executedAt, action.completedAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-300 pt-3">
                {/* Timeline */}
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Timeline:</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">{new Date(action.createdAt).toLocaleString()}</span>
                    </div>
                    {action.approvedAt && (
                      <div className="flex justify-between">
                        <span>Approved by {action.approvedBy}:</span>
                        <span className="font-medium">{new Date(action.approvedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {action.executedAt && (
                      <div className="flex justify-between">
                        <span>Executed:</span>
                        <span className="font-medium">{new Date(action.executedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {action.completedAt && (
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-medium">{new Date(action.completedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Execution Result */}
                {action.executionResult && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Execution Result:</p>
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(action.executionResult, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Error */}
                {action.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-700 mb-1">Error:</p>
                    <p className="text-xs text-red-600">{action.error}</p>
                  </div>
                )}

                {/* Original Payload */}
                {action.payload && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Action Payload:</p>
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(action.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ExecutionHistory;

// Made with Bob
