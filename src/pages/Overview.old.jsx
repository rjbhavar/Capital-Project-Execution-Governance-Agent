import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, 
  DollarSign, FileText, ShoppingCart, Zap, ArrowRight,
  Activity, Target, Shield, BarChart3
} from 'lucide-react';

const Overview = () => {
  const navigate = useNavigate();
  const { projects, loading } = useData();

  // Calculate portfolio metrics
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

    return {
      totalProjects,
      activeProjects,
      totalBudget,
      totalSpent,
      avgHealth,
      atRisk,
      onTrack,
      needsAttention,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
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

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const username = sessionStorage.getItem('user_fullname') || sessionStorage.getItem('mref_username') || 'Executive';
  const firstName = username.split(' ')[0];

  const agentInsights = [
    {
      agent: 'Budget Intelligence',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      findings: metrics.atRisk,
      message: `${metrics.atRisk} projects require budget review`,
      action: 'Review Budget',
      route: '/budgets'
    },
    {
      agent: 'Risk & Compliance',
      icon: Shield,
      color: 'from-red-500 to-rose-600',
      findings: metrics.atRisk,
      message: `${metrics.atRisk} projects flagged as high risk`,
      action: 'View Risks',
      route: '/projects'
    },
    {
      agent: 'Schedule Monitoring',
      icon: Clock,
      color: 'from-yellow-500 to-orange-600',
      findings: metrics.needsAttention,
      message: `${metrics.needsAttention} projects need attention`,
      action: 'Check Schedule',
      route: '/projects'
    },
    {
      agent: 'Procurement Coordination',
      icon: ShoppingCart,
      color: 'from-purple-500 to-violet-600',
      findings: 0,
      message: 'All procurement activities on track',
      action: 'View Contracts',
      route: '/procurement'
    }
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
              <span className="text-gray-700">Connecting Budget Agent</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Connecting Risk Agent</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Loading Digital Twins</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Building Executive Briefing</span>
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
        {/* Background Pattern */}
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
                <p className="text-blue-200 text-lg mt-1">{metrics.totalProjects} Projects Under Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">All Systems Operational</span>
            </div>
          </div>

          {/* Key Executive Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-sm text-blue-200 mb-2">Portfolio Health</div>
              <div className="text-4xl font-bold text-white">{metrics.avgHealth}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-sm text-blue-200 mb-2">Projects Requiring Action</div>
              <div className="text-4xl font-bold text-yellow-400">{metrics.atRisk + metrics.needsAttention}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-sm text-blue-200 mb-2">Budget Exposure</div>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(metrics.totalBudget - metrics.totalSpent)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-sm text-blue-200 mb-2">Upcoming Decisions</div>
              <div className="text-4xl font-bold text-purple-400">{metrics.atRisk}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-sm text-blue-200 mb-2">Active Projects</div>
              <div className="text-4xl font-bold text-blue-400">{metrics.activeProjects}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Executive Briefing */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Daily Executive Briefing</h2>
              <p className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/executive-briefing')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            Full Briefing →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Portfolio Health */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-blue-600" />
              <div className={`text-3xl font-bold ${
                metrics.avgHealth >= 80 ? 'text-green-600' :
                metrics.avgHealth >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.avgHealth}%
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-700">Portfolio Health Score</div>
            <div className="text-xs text-gray-600 mt-1">
              Average across {metrics.totalProjects} projects
            </div>
          </div>

          {/* Budget Status */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{formatCurrency(metrics.totalBudget)}</div>
                <div className="text-xs text-gray-600">Total Budget</div>
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-700">Budget Utilization</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    metrics.budgetUtilization > 90 ? 'bg-red-500' :
                    metrics.budgetUtilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(metrics.budgetUtilization, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {metrics.budgetUtilization.toFixed(1)}% utilized
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="text-3xl font-bold text-purple-600">{metrics.activeProjects}</div>
            </div>
            <div className="text-sm font-semibold text-gray-700">Active Projects</div>
            <div className="text-xs text-gray-600 mt-1">
              Currently in progress
            </div>
          </div>
        </div>
      </div>

      {/* Agent Intelligence Network */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Agent Intelligence Network</h2>
              <p className="text-sm text-gray-600">Real-time findings from autonomous agents</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            4 Agents Active
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentInsights.map((insight, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => navigate(insight.route)}
            >
              {/* Gradient Accent */}
              <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${insight.color}`} />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-gradient-to-br ${insight.color} rounded-xl shadow-lg`}>
                    <insight.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{insight.agent}</div>
                    <div className="text-xs text-gray-500">Autonomous Agent</div>
                  </div>
                </div>
                {insight.findings > 0 && (
                  <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                    {insight.findings}
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-700 mb-4">{insight.message}</p>

              <button className="flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all">
                {insight.action}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
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

export default Overview;

// Made with Bob
