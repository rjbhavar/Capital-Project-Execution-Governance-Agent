import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  FileText,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import PremiumCard from '../components/common/PremiumCard';
import { workflowEngine } from '../services/WorkflowEngine';
import { eventBus, EVENT_TYPES } from '../services/EventBus';
import { auditService } from '../services/AuditService';

const ApprovalWorkbench = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);

  useEffect(() => {
    loadApprovals();
    
    // Subscribe to workflow events
    const unsubscribe = eventBus.subscribe(EVENT_TYPES.WORKFLOW_STEP_COMPLETED, () => {
      loadApprovals();
    });

    return () => unsubscribe();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      
      // Get all active workflows
      const workflows = workflowEngine.getActiveWorkflows();
      
      // Extract pending approvals
      const pending = workflows
        .filter(w => w.currentStep?.type === 'approval' && w.status === 'running')
        .map(w => ({
          id: w.id,
          workflowId: w.id,
          type: w.type,
          projectName: w.context.projectName || 'Unknown Project',
          amount: w.context.amount || 0,
          requestedBy: w.context.requestedBy || 'System',
          requestedDate: w.startedAt,
          priority: w.context.priority || 'medium',
          description: w.context.description || '',
          currentStep: w.currentStep,
          status: 'pending'
        }));

      setPendingApprovals(pending);

      // Get approval history from audit logs
      const history = await auditService.getAuditLogs({
        action: 'APPROVAL_DECISION',
        limit: 50
      });

      setApprovalHistory(history);
    } catch (error) {
      console.error('Failed to load approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approval) => {
    try {
      await workflowEngine.executeStep(approval.workflowId, {
        decision: 'approved',
        approver: 'Current User',
        comments: 'Approved via Approval Workbench',
        timestamp: new Date().toISOString()
      });

      // Log the approval
      await auditService.logAction({
        action: 'APPROVAL_DECISION',
        entityType: 'workflow',
        entityId: approval.workflowId,
        details: {
          decision: 'approved',
          approvalType: approval.type
        }
      });

      // Publish event
      eventBus.publish(EVENT_TYPES.APPROVAL_COMPLETED, {
        workflowId: approval.workflowId,
        decision: 'approved'
      });

      loadApprovals();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (approval) => {
    try {
      await workflowEngine.executeStep(approval.workflowId, {
        decision: 'rejected',
        approver: 'Current User',
        comments: 'Rejected via Approval Workbench',
        timestamp: new Date().toISOString()
      });

      // Log the rejection
      await auditService.logAction({
        action: 'APPROVAL_DECISION',
        entityType: 'workflow',
        entityId: approval.workflowId,
        details: {
          decision: 'rejected',
          approvalType: approval.type
        }
      });

      // Publish event
      eventBus.publish(EVENT_TYPES.APPROVAL_COMPLETED, {
        workflowId: approval.workflowId,
        decision: 'rejected'
      });

      loadApprovals();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'budget_approval': return DollarSign;
      case 'contract_approval': return FileText;
      case 'change_request': return AlertCircle;
      default: return FileText;
    }
  };

  const filteredApprovals = pendingApprovals.filter(approval => {
    if (filter !== 'all' && approval.priority !== filter) return false;
    if (searchTerm && !approval.projectName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading Approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approval Workbench</h1>
          <p className="text-gray-600">Review and approve pending requests</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search approvals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{pendingApprovals.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </PremiumCard>
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">High Priority</p>
              <p className="text-3xl font-bold text-gray-900">
                {pendingApprovals.filter(a => a.priority === 'high').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </PremiumCard>
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved Today</p>
              <p className="text-3xl font-bold text-gray-900">
                {approvalHistory.filter(h => 
                  h.details?.decision === 'approved' && 
                  new Date(h.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </PremiumCard>
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rejected Today</p>
              <p className="text-3xl font-bold text-gray-900">
                {approvalHistory.filter(h => 
                  h.details?.decision === 'rejected' && 
                  new Date(h.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </PremiumCard>
      </div>

      {/* Pending Approvals */}
      <PremiumCard className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Approvals</h2>
        {filteredApprovals.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApprovals.map((approval) => {
              const TypeIcon = getTypeIcon(approval.type);
              return (
                <div
                  key={approval.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <TypeIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{approval.projectName}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(approval.priority)}`}>
                            {approval.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{approval.description || 'No description provided'}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{approval.requestedBy}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(approval.requestedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>${approval.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(approval)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(approval)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => setSelectedApproval(approval)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PremiumCard>

      {/* Recent History */}
      <PremiumCard className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Approval History</h2>
        <div className="space-y-3">
          {approvalHistory.slice(0, 10).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                {item.details?.decision === 'approved' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{item.details?.approvalType || 'Approval'}</p>
                  <p className="text-sm text-gray-600">{item.userId} • {new Date(item.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                item.details?.decision === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {item.details?.decision?.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </PremiumCard>
    </div>
  );
};

export default ApprovalWorkbench;

// Made with Bob
