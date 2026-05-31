import React, { useState, useEffect } from 'react';
import { Activity, Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { GradientCard } from '../components/common/PremiumCard';

const AgentWorkbench = () => {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'Project Planning Agent',
      icon: Brain,
      status: 'active',
      projectsReviewed: 42,
      findingsGenerated: 127,
      recommendationsGenerated: 89,
      lastRun: '2 minutes ago',
      confidenceScore: 94,
      color: 'blue'
    },
    {
      id: 2,
      name: 'Budget Intelligence Agent',
      icon: TrendingUp,
      status: 'active',
      projectsReviewed: 42,
      findingsGenerated: 156,
      recommendationsGenerated: 103,
      lastRun: '5 minutes ago',
      confidenceScore: 91,
      color: 'green'
    },
    {
      id: 3,
      name: 'Procurement Coordination Agent',
      icon: Activity,
      status: 'idle',
      projectsReviewed: 38,
      findingsGenerated: 84,
      recommendationsGenerated: 67,
      lastRun: '15 minutes ago',
      confidenceScore: 88,
      color: 'purple'
    },
    {
      id: 4,
      name: 'Schedule Monitoring Agent',
      icon: Clock,
      status: 'active',
      projectsReviewed: 42,
      findingsGenerated: 112,
      recommendationsGenerated: 78,
      lastRun: '3 minutes ago',
      confidenceScore: 92,
      color: 'orange'
    },
    {
      id: 5,
      name: 'Risk & Compliance Agent',
      icon: AlertTriangle,
      status: 'active',
      projectsReviewed: 42,
      findingsGenerated: 98,
      recommendationsGenerated: 134,
      lastRun: '1 minute ago',
      confidenceScore: 96,
      color: 'red'
    },
    {
      id: 6,
      name: 'Reporting Agent',
      icon: CheckCircle,
      status: 'idle',
      projectsReviewed: 42,
      findingsGenerated: 42,
      recommendationsGenerated: 42,
      lastRun: '10 minutes ago',
      confidenceScore: 89,
      color: 'indigo'
    }
  ]);

  const [activityFeed, setActivityFeed] = useState([
    { id: 1, agent: 'Budget Intelligence Agent', action: 'analyzed Store 4560 Buildout', time: '1 min ago', type: 'analysis' },
    { id: 2, agent: 'Risk & Compliance Agent', action: 'detected budget variance in HQ HVAC Modernization', time: '2 mins ago', type: 'alert' },
    { id: 3, agent: 'Procurement Coordination Agent', action: 'identified contract delay for Roof Replacement', time: '5 mins ago', type: 'warning' },
    { id: 4, agent: 'Reporting Agent', action: 'generated executive summary for Q2 2026', time: '10 mins ago', type: 'report' },
    { id: 5, agent: 'Schedule Monitoring Agent', action: 'detected milestone delay in Parking Lot Expansion', time: '12 mins ago', type: 'alert' },
    { id: 6, agent: 'Project Planning Agent', action: 'completed timeline analysis for 42 projects', time: '15 mins ago', type: 'analysis' },
    { id: 7, agent: 'Budget Intelligence Agent', action: 'forecasted budget overrun risk for 3 projects', time: '18 mins ago', type: 'warning' },
    { id: 8, agent: 'Risk & Compliance Agent', action: 'identified governance gap in Building A Renovation', time: '22 mins ago', type: 'alert' }
  ]);

  const [pipelineStages, setPipelineStages] = useState([
    { name: 'Project Intake', status: 'complete', agent: 'System' },
    { name: 'Planning Agent', status: 'complete', agent: 'Project Planning Agent' },
    { name: 'Budget Agent', status: 'complete', agent: 'Budget Intelligence Agent' },
    { name: 'Procurement Agent', status: 'active', agent: 'Procurement Coordination Agent' },
    { name: 'Schedule Agent', status: 'pending', agent: 'Schedule Monitoring Agent' },
    { name: 'Risk Agent', status: 'pending', agent: 'Risk & Compliance Agent' },
    { name: 'Reporting Agent', status: 'pending', agent: 'Reporting Agent' },
    { name: 'Executive Briefing', status: 'pending', agent: 'System' }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'idle': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'analysis': return 'bg-blue-100 text-blue-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'report': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPipelineStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'active': return 'bg-blue-500 animate-pulse';
      case 'pending': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Workbench</h1>
          <p className="text-gray-600 mt-1">Real-time multi-agent analysis and coordination</p>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">6 Agents Active</span>
        </div>
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const IconComponent = agent.icon;
          return (
            <GradientCard key={agent.id} gradient="gray" className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Agent Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-${agent.color}-100`}>
                      <IconComponent className={`w-6 h-6 text-${agent.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {agent.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agent Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Projects Reviewed</p>
                    <p className="text-2xl font-bold text-gray-900">{agent.projectsReviewed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-2xl font-bold text-gray-900">{agent.confidenceScore}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Findings</p>
                    <p className="text-xl font-semibold text-gray-900">{agent.findingsGenerated}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Recommendations</p>
                    <p className="text-xl font-semibold text-gray-900">{agent.recommendationsGenerated}</p>
                  </div>
                </div>

                {/* Last Run */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Last run: {agent.lastRun}</p>
                </div>
              </div>
            </GradientCard>
          );
        })}
      </div>

      {/* Agent Execution Pipeline */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Agent Execution Pipeline</h2>
        <div className="space-y-4">
          {pipelineStages.map((stage, index) => (
            <div key={index} className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className={`w-4 h-4 rounded-full ${getPipelineStatusColor(stage.status)}`}></div>
              
              {/* Stage Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{stage.name}</p>
                    <p className="text-sm text-gray-600">{stage.agent}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    stage.status === 'complete' ? 'bg-green-100 text-green-800' :
                    stage.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {stage.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GradientCard>

      {/* Agent Activity Feed */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Live Agent Activity</h2>
        <div className="space-y-3">
          {activityFeed.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">{activity.agent}</span>
                    {' '}
                    <span className="text-gray-600">{activity.action}</span>
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                    {activity.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </GradientCard>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GradientCard gradient="gray" className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Analyses</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">619</p>
            <p className="text-xs text-green-600 mt-1">+12% this week</p>
          </div>
        </GradientCard>
        <GradientCard gradient="gray" className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Findings Generated</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">619</p>
            <p className="text-xs text-blue-600 mt-1">Across all agents</p>
          </div>
        </GradientCard>
        <GradientCard gradient="gray" className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Recommendations</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">513</p>
            <p className="text-xs text-purple-600 mt-1">89% implemented</p>
          </div>
        </GradientCard>
        <GradientCard gradient="gray" className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Confidence</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">92%</p>
            <p className="text-xs text-green-600 mt-1">High accuracy</p>
          </div>
        </GradientCard>
      </div>
    </div>
  );
};

export default AgentWorkbench;

// Made with Bob
