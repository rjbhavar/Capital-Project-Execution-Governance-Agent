import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Brain, TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { GradientCard } from '../components/common/PremiumCard';
import ApprovalQueue from '../components/agent/ApprovalQueue';
import ExecutionHistory from '../components/agent/ExecutionHistory';
import { agentActionExecutor, ACTION_TYPES } from '../services/agentActions';

const ProjectCommandCenter = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load project data
    // In real implementation, fetch from API
    setProject({
      id: projectId,
      name: 'HQ HVAC Modernization',
      status: 'Active',
      budget: 2500000,
      spent: 1875000,
      progress: 75,
      healthScore: 85,
      startDate: '2024-03-01',
      endDate: '2024-12-31'
    });

    // Create some demo agent actions for this project
    createDemoActions();
  }, [projectId]);

  const createDemoActions = () => {
    // Check if demo actions already exist
    const existingActions = agentActionExecutor.getProjectActions(projectId);
    if (existingActions.length > 0) return;

    // Create demo pending actions
    agentActionExecutor.createAction({
      agentName: 'Budget Intelligence Agent',
      actionType: ACTION_TYPES.ADJUST_BUDGET,
      title: 'Increase Budget Allocation',
      description: 'Recommend increasing budget by $250,000 to cover unexpected HVAC equipment costs',
      projectId: projectId,
      projectName: 'HQ HVAC Modernization',
      payload: {
        projectId: projectId,
        adjustment: {
          amount: 250000,
          reason: 'Unexpected equipment costs due to supply chain issues',
          category: 'Equipment'
        }
      },
      impact: 'Prevents project delay and ensures quality equipment procurement',
      confidence: 92,
      priority: 'high'
    });

    agentActionExecutor.createAction({
      agentName: 'Schedule Monitoring Agent',
      actionType: ACTION_TYPES.UPDATE_TIMELINE,
      title: 'Adjust Project Timeline',
      description: 'Extend completion date by 2 weeks to accommodate equipment delivery delays',
      projectId: projectId,
      projectName: 'HQ HVAC Modernization',
      payload: {
        projectId: projectId,
        timelineChanges: {
          milestones: [
            { name: 'Equipment Installation', newDate: '2024-11-15', reason: 'Delivery delay' },
            { name: 'System Testing', newDate: '2024-12-01', reason: 'Cascading from installation' }
          ]
        }
      },
      impact: 'Maintains realistic schedule and prevents rushed installation',
      confidence: 88,
      priority: 'medium'
    });

    agentActionExecutor.createAction({
      agentName: 'Procurement Coordination Agent',
      actionType: ACTION_TYPES.ROUTE_PROPOSAL,
      title: 'Route Equipment Proposal for Approval',
      description: 'Submit equipment procurement proposal to finance and operations for approval',
      projectId: projectId,
      projectName: 'HQ HVAC Modernization',
      payload: {
        proposalId: 'PROP_HVAC_2024_001',
        approvers: ['finance_director', 'operations_manager', 'project_sponsor']
      },
      impact: 'Enables equipment procurement to proceed, critical path item',
      confidence: 95,
      priority: 'critical'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'approvals', label: 'Approval Queue', icon: CheckCircle },
    { id: 'history', label: 'Execution History', icon: Brain },
    { id: 'agents', label: 'Agent Findings', icon: Zap }
  ];

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">Project Command Center</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {project.status}
          </span>
          <span className="text-sm text-gray-600">Health: {project.healthScore}%</span>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GradientCard gradient="blue" className="p-6">
          <p className="text-sm text-gray-600 mb-1">Budget</p>
          <p className="text-2xl font-bold text-gray-900">${(project.budget / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-gray-600 mt-1">Allocated</p>
        </GradientCard>
        <GradientCard gradient="green" className="p-6">
          <p className="text-sm text-gray-600 mb-1">Spent</p>
          <p className="text-2xl font-bold text-gray-900">${(project.spent / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-gray-600 mt-1">{Math.round((project.spent / project.budget) * 100)}% utilized</p>
        </GradientCard>
        <GradientCard gradient="purple" className="p-6">
          <p className="text-sm text-gray-600 mb-1">Progress</p>
          <p className="text-2xl font-bold text-gray-900">{project.progress}%</p>
          <p className="text-xs text-gray-600 mt-1">Complete</p>
        </GradientCard>
        <GradientCard gradient="orange" className="p-6">
          <p className="text-sm text-gray-600 mb-1">Health Score</p>
          <p className="text-2xl font-bold text-gray-900">{project.healthScore}%</p>
          <p className="text-xs text-green-600 mt-1">Healthy</p>
        </GradientCard>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-ibm-blue text-ibm-blue'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <GradientCard gradient="gray" className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Current State</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-semibold">{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-semibold">{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days Remaining:</span>
                  <span className="font-semibold">
                    {Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </GradientCard>

            <GradientCard gradient="gray" className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Agent Summary</h2>
              <p className="text-gray-600 mb-4">
                6 specialized agents are continuously monitoring this project and generating actionable recommendations.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">Planning Agent</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">Budget Agent</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">Procurement Agent</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">Schedule Agent</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">Risk Agent</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">Reporting Agent</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>
            </GradientCard>
          </div>
        )}

        {activeTab === 'approvals' && (
          <ApprovalQueue projectId={projectId} />
        )}

        {activeTab === 'history' && (
          <ExecutionHistory projectId={projectId} limit={20} />
        )}

        {activeTab === 'agents' && (
          <GradientCard gradient="gray" className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Agent Findings</h2>
            <p className="text-gray-600">
              Detailed agent findings and analysis will be displayed here.
            </p>
          </GradientCard>
        )}
      </div>
    </div>
  );
};

export default ProjectCommandCenter;

// Made with Bob
