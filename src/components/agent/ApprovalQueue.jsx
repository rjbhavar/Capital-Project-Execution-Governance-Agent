import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, DollarSign, FileText, Calendar } from 'lucide-react';
import { agentActionExecutor, ACTION_STATUS } from '../../services/agentActions';
import { GradientCard } from '../common/PremiumCard';

const ApprovalQueue = ({ projectId = null }) => {
  const [pendingActions, setPendingActions] = useState([]);
  const [processingAction, setProcessingAction] = useState(null);

  useEffect(() => {
    loadPendingActions();
  }, [projectId]);

  const loadPendingActions = () => {
    let actions;
    if (projectId) {
      actions = agentActionExecutor.getProjectActions(projectId)
        .filter(action => action.status === ACTION_STATUS.PENDING);
    } else {
      actions = agentActionExecutor.getPendingActions();
    }
    setPendingActions(actions);
  };

  const handleApprove = async (actionId) => {
    setProcessingAction(actionId);
    try {
      const userId = sessionStorage.getItem('mref_username') || 'demo_user';
      await agentActionExecutor.approveAction(actionId, userId);
      loadPendingActions();
    } catch (error) {
      console.error('Failed to approve action:', error);
      alert(`Failed to approve action: ${error.message}`);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = (actionId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setProcessingAction(actionId);
    try {
      const userId = sessionStorage.getItem('mref_username') || 'demo_user';
      agentActionExecutor.rejectAction(actionId, userId, reason);
      loadPendingActions();
    } catch (error) {
      console.error('Failed to reject action:', error);
      alert(`Failed to reject action: ${error.message}`);
    } finally {
      setProcessingAction(null);
    }
  };

  const getActionIcon = (actionType) => {
    if (actionType.includes('budget')) return DollarSign;
    if (actionType.includes('timeline') || actionType.includes('schedule')) return Calendar;
    if (actionType.includes('proposal') || actionType.includes('contract')) return FileText;
    if (actionType.includes('risk')) return AlertTriangle;
    return TrendingUp;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-600 text-white',
      medium: 'bg-yellow-600 text-white',
      low: 'bg-blue-600 text-white'
    };
    return colors[priority] || 'bg-gray-600 text-white';
  };

  if (pendingActions.length === 0) {
    return (
      <GradientCard gradient="gray" className="p-6">
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="text-gray-600">No pending actions</p>
          <p className="text-sm text-gray-500 mt-1">All agent recommendations have been reviewed</p>
        </div>
      </GradientCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Approval Queue ({pendingActions.length})
        </h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      {pendingActions.map((action) => {
        const Icon = getActionIcon(action.actionType);
        const isProcessing = processingAction === action.id;

        return (
          <div
            key={action.id}
            className={`border-2 rounded-lg p-4 ${getPriorityColor(action.priority)} transition-all duration-200`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{action.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(action.priority)}`}>
                      {action.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{action.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span className="font-medium">{action.agentName}</span>
                    {action.projectName && <span>• {action.projectName}</span>}
                    <span>• {new Date(action.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact & Confidence */}
            <div className="grid grid-cols-2 gap-3 mb-3 bg-white bg-opacity-50 rounded-lg p-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Expected Impact</p>
                <p className="text-sm font-semibold text-gray-900">{action.impact}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Agent Confidence</p>
                <p className="text-sm font-semibold text-gray-900">{action.confidence}%</p>
              </div>
            </div>

            {/* Action Details */}
            {action.payload && (
              <div className="mb-3 bg-white bg-opacity-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-2">Action Details:</p>
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(action.payload, null, 2)}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleApprove(action.id)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isProcessing ? 'Executing...' : 'Approve & Execute'}</span>
              </button>
              <button
                onClick={() => handleReject(action.id)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApprovalQueue;

// Made with Bob
