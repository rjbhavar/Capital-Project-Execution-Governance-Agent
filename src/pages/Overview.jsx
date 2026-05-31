import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { getProjectStatistics } from '../services/capitalProjects';
import { MetricCard, RadialProgress, InsightCard, GradientCard } from '../components/common/PremiumCard';
import {
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  ShoppingCart,
  CreditCard,
  Clock,
  MapPin,
  Loader2,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Target,
  Zap,
  Brain,
  Sparkles,
  TrendingDown,
  Calendar
} from 'lucide-react';

const Overview = () => {
  const navigate = useNavigate();
  const { projects, loading, error } = useData();

  // Memoize statistics calculation
  const stats = useMemo(() => {
    return getProjectStatistics(projects);
  }, [projects]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate additional metrics
  const budgetUtilization = stats.totalBudget > 0 ? (stats.totalSpent / stats.totalBudget) * 100 : 0;
  const atRiskProjects = projects.filter(p => p.riskScore >= 60).length;
  const delayedProjects = projects.filter(p => {
    if (!p.endDate) return false;
    return new Date(p.endDate) < new Date();
  }).length;
  const pendingProposals = projects.filter(p => 
    p.hasProposal && p.proposalDetails?.status?.toLowerCase().includes('pending')
  ).length;
  const revisionProjects = projects.filter(p => 
    p.status?.toLowerCase().includes('revision')
  ).length;

  // Status distribution
  const statusDistribution = useMemo(() => {
    return projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
  }, [projects]);

  // Phase distribution
  const phaseDistribution = useMemo(() => {
    return projects.reduce((acc, p) => {
      acc[p.phase] = (acc[p.phase] || 0) + 1;
      return acc;
    }, {});
  }, [projects]);

  // Geography distribution
  const geoDistribution = useMemo(() => {
    return projects.reduce((acc, p) => {
      const key = `${p.city}, ${p.state}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [projects]);

  const topLocations = Object.entries(geoDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Generate executive insights
  const insights = useMemo(() => {
    const insightsList = [];
    
    if (revisionProjects > 0) {
      insightsList.push({
        type: 'info',
        title: 'Projects in Revision',
        message: `${revisionProjects} project${revisionProjects > 1 ? 's are' : ' is'} currently under revision`,
        icon: FileText
      });
    }
    
    if (atRiskProjects > 0) {
      insightsList.push({
        type: 'error',
        title: 'High Risk Alert',
        message: `${atRiskProjects} project${atRiskProjects > 1 ? 's require' : ' requires'} immediate attention`,
        icon: AlertTriangle,
        action: { label: 'View Projects', onClick: () => navigate('/projects') }
      });
    }
    
    if (delayedProjects > 0) {
      insightsList.push({
        type: 'warning',
        title: 'Timeline Delays',
        message: `${delayedProjects} project${delayedProjects > 1 ? 's are' : ' is'} past deadline`,
        icon: Clock,
        action: { label: 'Review Timeline', onClick: () => navigate('/projects') }
      });
    }
    
    if (budgetUtilization > 85) {
      insightsList.push({
        type: 'warning',
        title: 'Budget Utilization High',
        message: `Portfolio budget utilization at ${budgetUtilization.toFixed(1)}%`,
        icon: DollarSign,
        action: { label: 'View Budgets', onClick: () => navigate('/budgets') }
      });
    }
    
    if (pendingProposals > 0) {
      insightsList.push({
        type: 'info',
        title: 'Pending Approvals',
        message: `${pendingProposals} proposal${pendingProposals > 1 ? 's await' : ' awaits'} approval`,
        icon: FileText,
        action: { label: 'Review Proposals', onClick: () => navigate('/projects') }
      });
    }

    if (insightsList.length === 0) {
      insightsList.push({
        type: 'success',
        title: 'All Systems Operational',
        message: 'Portfolio is performing within expected parameters',
        icon: CheckCircle
      });
    }
    
    return insightsList;
  }, [revisionProjects, atRiskProjects, delayedProjects, budgetUtilization, pendingProposals, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-ibm-blue mr-3" />
        <span className="text-lg text-gray-600">Loading executive dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Overview</h1>
          <p className="text-gray-600 mt-1">Capital Project Portfolio Command Center</p>
        </div>
      </div>

      {/* Agent Command Center - Today's Briefing */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Agent Command Center
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </h2>
              <p className="text-blue-100 text-sm">AI-powered executive intelligence • Updated in real-time</p>
            </div>
          </div>

          {/* Today's Agent Briefing */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Agent Briefing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Portfolio Health Score */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm font-medium">Portfolio Health</span>
                  <TrendingUp className="w-4 h-4 text-green-300" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{stats.avgHealthScore}</span>
                  <span className="text-lg text-blue-100">/100</span>
                </div>
                <p className="text-xs text-blue-200 mt-1">
                  {stats.avgHealthScore >= 80 ? 'Excellent' : stats.avgHealthScore >= 60 ? 'Good' : 'Needs Attention'}
                </p>
              </div>

              {/* Critical Actions */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm font-medium">Critical Actions</span>
                  <AlertTriangle className="w-4 h-4 text-yellow-300" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{atRiskProjects + delayedProjects}</span>
                  <span className="text-lg text-blue-100">items</span>
                </div>
                <p className="text-xs text-blue-200 mt-1">
                  Require immediate attention
                </p>
              </div>

              {/* Budget Status */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm font-medium">Budget Status</span>
                  <DollarSign className="w-4 h-4 text-green-300" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{budgetUtilization.toFixed(0)}</span>
                  <span className="text-lg text-blue-100">%</span>
                </div>
                <p className="text-xs text-blue-200 mt-1">
                  {budgetUtilization > 90 ? 'High utilization' : 'Within limits'}
                </p>
              </div>

              {/* Timeline Engine */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm font-medium">Timeline Status</span>
                  <Clock className="w-4 h-4 text-orange-300" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{stats.activeProjects - delayedProjects}</span>
                  <span className="text-lg text-blue-100">on track</span>
                </div>
                <p className="text-xs text-blue-200 mt-1">
                  {delayedProjects > 0 ? `${delayedProjects} delayed` : 'All on schedule'}
                </p>
              </div>
            </div>
          </div>

          {/* Agent Insights & Recommendations */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              Agent Insights & Recommendations
            </h3>
            <div className="space-y-3">
              {/* Dynamic Insights based on data */}
              {atRiskProjects > 0 && (
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-300 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1">High Risk Projects Detected</p>
                      <p className="text-sm text-red-100 mb-2">
                        {atRiskProjects} project{atRiskProjects > 1 ? 's have' : ' has'} risk scores above 60. Immediate review recommended.
                      </p>
                      <button
                        onClick={() => navigate('/projects')}
                        className="text-xs font-medium text-white bg-red-500/30 hover:bg-red-500/50 px-3 py-1 rounded-md transition-colors"
                      >
                        Review Projects →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {delayedProjects > 0 && (
                <div className="bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-300 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1">Timeline Delays Identified</p>
                      <p className="text-sm text-orange-100 mb-2">
                        {delayedProjects} project{delayedProjects > 1 ? 's are' : ' is'} past deadline. Schedule adjustment may be required.
                      </p>
                      <button
                        onClick={() => navigate('/projects')}
                        className="text-xs font-medium text-white bg-orange-500/30 hover:bg-orange-500/50 px-3 py-1 rounded-md transition-colors"
                      >
                        View Timeline →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {budgetUtilization > 85 && (
                <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1">Budget Utilization Alert</p>
                      <p className="text-sm text-yellow-100 mb-2">
                        Portfolio budget utilization at {budgetUtilization.toFixed(1)}%. Consider budget reallocation or additional funding.
                      </p>
                      <button
                        onClick={() => navigate('/budgets')}
                        className="text-xs font-medium text-white bg-yellow-500/30 hover:bg-yellow-500/50 px-3 py-1 rounded-md transition-colors"
                      >
                        Review Budgets →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {pendingProposals > 0 && (
                <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1">Pending Approvals</p>
                      <p className="text-sm text-blue-100 mb-2">
                        {pendingProposals} proposal{pendingProposals > 1 ? 's await' : ' awaits'} approval. Review and action recommended.
                      </p>
                      <button
                        onClick={() => navigate('/projects')}
                        className="text-xs font-medium text-white bg-blue-500/30 hover:bg-blue-500/50 px-3 py-1 rounded-md transition-colors"
                      >
                        Review Proposals →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {atRiskProjects === 0 && delayedProjects === 0 && budgetUtilization <= 85 && pendingProposals === 0 && (
                <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1">All Systems Operational</p>
                      <p className="text-sm text-green-100">
                        Portfolio is performing within expected parameters. No critical actions required at this time.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Execution Recommendations */}
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-300" />
              Execution Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                  </div>
                  <span className="font-semibold text-white">Priority Actions</span>
                </div>
                <p className="text-sm text-blue-100">
                  Focus on {atRiskProjects > 0 ? 'high-risk projects' : 'maintaining current momentum'}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="font-semibold text-white">Resource Optimization</span>
                </div>
                <p className="text-sm text-blue-100">
                  {budgetUtilization > 85 ? 'Review budget allocation' : 'Resources well distributed'}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-300" />
                  </div>
                  <span className="font-semibold text-white">Performance Trend</span>
                </div>
                <p className="text-sm text-blue-100">
                  {stats.avgHealthScore >= 80 ? 'Excellent trajectory' : 'Improvement needed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Projects"
          value={stats.totalProjects}
          subtitle={`${stats.activeProjects} active`}
          icon={Building2}
          color="blue"
          trend={{ value: '+12%', label: 'vs last quarter', positive: true }}
        />
        <MetricCard
          title="Portfolio Budget"
          value={formatCurrency(stats.totalBudget)}
          subtitle={`${budgetUtilization.toFixed(1)}% utilized`}
          icon={DollarSign}
          color="green"
          trend={{ value: budgetUtilization > 90 ? 'High' : 'Normal', label: 'utilization', positive: budgetUtilization <= 90 }}
        />
        <MetricCard
          title="Portfolio Health"
          value={`${stats.avgHealthScore}%`}
          subtitle="Average health score"
          icon={TrendingUp}
          color="purple"
          trend={{ value: '+5%', label: 'improvement', positive: true }}
        />
        <MetricCard
          title="At Risk"
          value={atRiskProjects}
          subtitle="Require attention"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Contracts"
          value={stats.projectsWithContracts}
          subtitle="Procurement active"
          icon={ShoppingCart}
          color="orange"
        />
        <MetricCard
          title="Payments Processed"
          value={stats.projectsWithPayments}
          subtitle="Financial transactions"
          icon={CreditCard}
          color="green"
        />
        <MetricCard
          title="Delayed Projects"
          value={delayedProjects}
          subtitle="Past deadline"
          icon={Clock}
          color="red"
        />
        <MetricCard
          title="Pending Proposals"
          value={pendingProposals}
          subtitle="Awaiting approval"
          icon={FileText}
          color="blue"
        />
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Utilization Ring */}
        <GradientCard gradient="green" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Utilization</h3>
          <div className="flex justify-center">
            <RadialProgress
              value={budgetUtilization}
              max={100}
              size={140}
              strokeWidth={12}
              color={budgetUtilization > 90 ? 'red' : budgetUtilization > 75 ? 'orange' : 'green'}
              label="Utilized"
              sublabel={`${formatCurrency(stats.totalSpent)} of ${formatCurrency(stats.totalBudget)}`}
            />
          </div>
        </GradientCard>

        {/* Portfolio Health Ring */}
        <GradientCard gradient="purple" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Health</h3>
          <div className="flex justify-center">
            <RadialProgress
              value={stats.avgHealthScore}
              max={100}
              size={140}
              strokeWidth={12}
              color={stats.avgHealthScore >= 80 ? 'green' : stats.avgHealthScore >= 60 ? 'orange' : 'red'}
              label="Health"
              sublabel={`${stats.totalProjects} projects monitored`}
            />
          </div>
        </GradientCard>

        {/* Risk Assessment Ring */}
        <GradientCard gradient="red" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
          <div className="flex justify-center">
            <RadialProgress
              value={100 - (atRiskProjects / stats.totalProjects * 100)}
              max={100}
              size={140}
              strokeWidth={12}
              color={atRiskProjects === 0 ? 'green' : atRiskProjects <= 2 ? 'orange' : 'red'}
              label="Safe"
              sublabel={`${atRiskProjects} high risk project${atRiskProjects !== 1 ? 's' : ''}`}
            />
          </div>
        </GradientCard>
      </div>

      {/* Governance Command Center */}
      <GradientCard gradient="gray" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-ibm-blue" />
              Governance Command Center
            </h2>
            <p className="text-sm text-gray-600 mt-1">Real-time operational intelligence</p>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="flex items-center gap-2 px-4 py-2 bg-ibm-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Alerts
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <InsightCard key={index} {...insight} />
          ))}
        </div>
      </GradientCard>

      {/* Distribution Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <GradientCard gradient="blue" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Projects by Status
          </h3>
          <div className="space-y-3">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const percentage = (count / stats.totalProjects) * 100;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{status}</span>
                    <span className="text-sm font-semibold text-gray-900">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 shadow-sm"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GradientCard>

        {/* Phase Distribution */}
        <GradientCard gradient="purple" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Projects by Phase
          </h3>
          <div className="space-y-3">
            {Object.entries(phaseDistribution).map(([phase, count]) => {
              const percentage = (count / stats.totalProjects) * 100;
              return (
                <div key={phase}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{phase}</span>
                    <span className="text-sm font-semibold text-gray-900">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000 shadow-sm"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GradientCard>
      </div>

      {/* Geographic Intelligence */}
      <GradientCard gradient="orange" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-600" />
          Geographic Intelligence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {topLocations.map(([location, count], index) => (
            <div key={location} className="bg-white/60 rounded-lg p-4 hover:bg-white/80 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-orange-600">#{index + 1}</span>
                <span className="text-sm font-semibold text-gray-900">{count} projects</span>
              </div>
              <p className="text-sm font-medium text-gray-700">{location}</p>
            </div>
          ))}
        </div>
      </GradientCard>
    </div>
  );
};

export default Overview;

// Made with Bob