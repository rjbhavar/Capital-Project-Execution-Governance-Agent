import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, 
  DollarSign, FileText, ShoppingCart, Zap, ArrowRight,
  Activity, Target, Shield, BarChart3, Users, Package
} from 'lucide-react';
import { portfolioDigitalTwin } from '../services/PortfolioDigitalTwin';
import { analyticsService } from '../services/AnalyticsService';
import { LineChart, BarChart, DonutChart, ProgressRing, GaugeChart } from '../components/charts/PortfolioCharts';
import { eventBus, EVENT_TYPES } from '../services/EventBus';

const OverviewEnhanced = () => {
  const navigate = useNavigate();
  const { projects, loading } = useData();
  const [portfolioState, setPortfolioState] = useState(null);
  const [healthTrend, setHealthTrend] = useState([]);
  const [deliveryConfidence, setDeliveryConfidence] = useState(null);

  useEffect(() => {
    loadPortfolioData();

    // Subscribe to portfolio updates
    const unsubscribe = eventBus.subscribe(EVENT_TYPES.PORTFOLIO_UPDATED, () => {
      loadPortfolioData();
    });

    return () => unsubscribe();
  }, []);

  const loadPortfolioData = async () => {
    try {
      const state = await portfolioDigitalTwin.getCurrentState();
      setPortfolioState(state);
      
      const trend = portfolioDigitalTwin.getHealthTrend(30);
      setHealthTrend(trend);
      
      const confidence = portfolioDigitalTwin.getDeliveryConfidence();
      setDeliveryConfidence(confidence);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    }
  };

  // Calculate portfolio metrics with new data
  const metrics = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const avgHealth = projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + (p.healthScore || 0), 0) / projects.length)
      : 0;
    
    const atRisk = projects.filter(p => (p.healthScore || 0) < 60).length;
    const onTrack = projects.filter(p => (p.healthScore || 0) >= 80).length;
    const needsAttention = projects.filter(p =>
      (p.healthScore || 0) >= 60 && (p.healthScore || 0) < 80
    ).length;

    // Calculate new metrics from embedded data
    const totalContracts = projects.reduce((sum, p) => sum + (p.contractDetails?.length || 0), 0);
    const totalContractValue = projects.reduce((sum, p) => {
      return sum + (p.contractDetails?.reduce((cSum, c) => cSum + (c.approvedAmount || 0), 0) || 0);
    }, 0);

    const totalPOs = projects.reduce((sum, p) => sum + (p.purchaseOrderDetails?.length || 0), 0);
    const totalPOValue = projects.reduce((sum, p) => {
      return sum + (p.purchaseOrderDetails?.reduce((poSum, po) => poSum + (po.amount || 0), 0) || 0);
    }, 0);

    const totalPayments = projects.reduce((sum, p) => sum + (p.paymentDetails?.length || 0), 0);
    const totalPaymentValue = projects.reduce((sum, p) => {
      return sum + (p.paymentDetails?.reduce((pSum, pay) => pSum + (pay.invoiceAmount || 0), 0) || 0);
    }, 0);

    const projectsWithBudgets = projects.filter(p => p.hasBudget).length;
    const projectsWithProposals = projects.filter(p => p.hasProposal).length;
    const projectsWithContracts = projects.filter(p => p.hasContracts).length;
    const projectsWithPayments = projects.filter(p => p.hasPayments).length;
    const projectsWithContactRoles = projects.filter(p => p.hasContactRoles).length;
    const projectsWithPOs = projects.filter(p => p.hasPurchaseOrders).length;

    return {
      totalProjects,
      activeProjects,
      totalBudget,
      totalSpent,
      avgHealth,
      atRisk,
      onTrack,
      needsAttention,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      // New metrics
      totalContracts,
      totalContractValue,
      totalPOs,
      totalPOValue,
      totalPayments,
      totalPaymentValue,
      projectsWithBudgets,
      projectsWithProposals,
      projectsWithContracts,
      projectsWithPayments,
      projectsWithContactRoles,
      projectsWithPOs
    };
  }, [projects]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const username = sessionStorage.getItem('user_fullname') || sessionStorage.getItem('mref_username') || 'Executive';
  const firstName = username.split(' ')[0];

  // Prepare chart data
  const healthTrendData = healthTrend.slice(-7).map((h, i) => ({
    label: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: h.health
  }));

  const projectStatusData = [
    { label: 'On Track', value: metrics.onTrack, color: '#10b981' },
    { label: 'Needs Attention', value: metrics.needsAttention, color: '#f59e0b' },
    { label: 'At Risk', value: metrics.atRisk, color: '#ef4444' }
  ];

  const budgetData = [
    { label: 'Jan', value: 2500000 },
    { label: 'Feb', value: 3200000 },
    { label: 'Mar', value: 2800000 },
    { label: 'Apr', value: 3500000 },
    { label: 'May', value: 4100000 },
    { label: 'Jun', value: 3800000 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl mb-6 animate-pulse">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Initializing Portfolio Intelligence</h2>
          <div className="space-y-3 text-left bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Loading Portfolio Digital Twin</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Analyzing Financial State</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Calculating Risk Exposure</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Building Executive Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Intelligence Center Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">{getGreeting()}, {firstName}</h1>
                <p className="text-blue-200 text-lg mt-1">Portfolio Intelligence Center</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">All Systems Operational</span>
            </div>
          </div>

          {/* Key Executive Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                 onClick={() => navigate('/portfolio-intelligence')}>
              <div className="text-sm text-blue-200 mb-2">Portfolio Health</div>
              <div className="text-4xl font-bold text-white">{metrics.avgHealth}%</div>
              <div className="text-xs text-blue-300 mt-1">↑ 3% vs last week</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                 onClick={() => navigate('/projects')}>
              <div className="text-sm text-blue-200 mb-2">Requiring Action</div>
              <div className="text-4xl font-bold text-yellow-400">{metrics.atRisk + metrics.needsAttention}</div>
              <div className="text-xs text-yellow-300 mt-1">Immediate attention</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                 onClick={() => navigate('/budgets')}>
              <div className="text-sm text-blue-200 mb-2">Budget Exposure</div>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(metrics.totalBudget - metrics.totalSpent)}</div>
              <div className="text-xs text-green-300 mt-1">Available funds</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                 onClick={() => navigate('/approvals')}>
              <div className="text-sm text-blue-200 mb-2">Pending Decisions</div>
              <div className="text-4xl font-bold text-purple-400">{metrics.atRisk}</div>
              <div className="text-xs text-purple-300 mt-1">Awaiting approval</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                 onClick={() => navigate('/projects')}>
              <div className="text-sm text-blue-200 mb-2">Active Projects</div>
              <div className="text-4xl font-bold text-blue-400">{metrics.activeProjects}</div>
              <div className="text-xs text-blue-300 mt-1">In progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Health & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Health Trend */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Portfolio Health Trend</h2>
              <p className="text-sm text-gray-600">Last 7 days</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          {healthTrendData.length > 0 ? (
            <LineChart data={healthTrendData} height={200} color="#3b82f6" />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              Loading trend data...
            </div>
          )}
        </div>

        {/* Project Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Project Status</h2>
              <p className="text-sm text-gray-600">{metrics.totalProjects} total projects</p>
            </div>
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <DonutChart data={projectStatusData} size={140} thickness={25} />
        </div>
      </div>

      {/* Budget & Delivery Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Budget Burn */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Monthly Budget Burn</h2>
              <p className="text-sm text-gray-600">Last 6 months</p>
            </div>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <BarChart data={budgetData} height={200} color="#10b981" />
        </div>

        {/* Delivery Confidence */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delivery Confidence</h2>
            <p className="text-sm text-gray-600">Portfolio-wide score</p>
          </div>
          <div className="flex justify-center">
            <GaugeChart 
              value={deliveryConfidence?.overall || metrics.avgHealth} 
              max={100} 
              size={180}
              color={
                (deliveryConfidence?.overall || metrics.avgHealth) >= 80 ? '#10b981' :
                (deliveryConfidence?.overall || metrics.avgHealth) >= 60 ? '#f59e0b' : '#ef4444'
              }
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded p-2">
              <div className="text-gray-600">Health</div>
              <div className="font-bold text-gray-900">{deliveryConfidence?.factors.health || metrics.avgHealth}%</div>
            </div>
            <div className="bg-white rounded p-2">
              <div className="text-gray-600">Budget</div>
              <div className="font-bold text-gray-900">{deliveryConfidence?.factors.budget || 85}%</div>
            </div>
            <div className="bg-white rounded p-2">
              <div className="text-gray-600">Risk</div>
              <div className="font-bold text-gray-900">{deliveryConfidence?.factors.risk || 78}%</div>
            </div>
            <div className="bg-white rounded p-2">
              <div className="text-gray-600">Schedule</div>
              <div className="font-bold text-gray-900">{deliveryConfidence?.factors.schedule || 82}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Intelligence & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Intelligence */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Agent Intelligence</h2>
                <p className="text-sm text-gray-600">Real-time findings</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/agent-operations')}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {[
              { agent: 'Budget Intelligence', findings: metrics.atRisk, color: 'green', icon: DollarSign },
              { agent: 'Risk & Compliance', findings: metrics.atRisk, color: 'red', icon: Shield },
              { agent: 'Schedule Monitoring', findings: metrics.needsAttention, color: 'yellow', icon: Clock },
              { agent: 'Procurement', findings: 0, color: 'purple', icon: ShoppingCart }
            ].map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${agent.color}-100 rounded-lg`}>
                    <agent.icon className={`w-4 h-4 text-${agent.color}-600`} />
                  </div>
                  <span className="font-medium text-gray-900">{agent.agent}</span>
                </div>
                {agent.findings > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    {agent.findings}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600">Common tasks</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Review Approvals', icon: CheckCircle, route: '/approvals', count: metrics.atRisk },
              { label: 'View Projects', icon: Target, route: '/projects', count: metrics.totalProjects },
              { label: 'Check Budgets', icon: DollarSign, route: '/budgets', count: null },
              { label: 'Procurement', icon: Package, route: '/procurement', count: null },
              { label: 'Notifications', icon: AlertTriangle, route: '/notifications', count: 5 },
              { label: 'Reports', icon: FileText, route: '/reports', count: null }
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.route)}
                className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all text-left group"
              >
                <action.icon className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-semibold text-gray-900">{action.label}</div>
                {action.count !== null && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {action.count}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Requiring Attention */}
      {metrics.atRisk > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg border-2 border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-xl font-bold text-red-900">Projects Requiring Immediate Attention</h2>
              <p className="text-sm text-red-700">{metrics.atRisk} projects need executive review</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {projects
              .filter(p => (p.healthScore || 0) < 60)
              .slice(0, 3)
              .map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg p-4 border border-red-200 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}/intelligence`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{project.building}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-600">Health: {project.healthScore || 0}%</div>
                        <div className="text-xs text-gray-500">{project.status}</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {metrics.atRisk > 3 && (
            <button
              onClick={() => navigate('/projects')}
              className="mt-4 w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              View All {metrics.atRisk} At-Risk Projects
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OverviewEnhanced;

// Made with Bob
