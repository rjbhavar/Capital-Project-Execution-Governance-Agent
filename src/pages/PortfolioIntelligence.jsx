import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users,
  Target,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import PremiumCard from '../components/common/PremiumCard';
import { analyticsService } from '../services/AnalyticsService';
import { eventBus, EVENT_TYPES } from '../services/EventBus';

const PortfolioIntelligence = () => {
  const [portfolioMetrics, setPortfolioMetrics] = useState(null);
  const [financialMetrics, setFinancialMetrics] = useState(null);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Subscribe to real-time updates
    const unsubscribe = eventBus.subscribe(EVENT_TYPES.PROJECT_UPDATED, () => {
      loadDashboardData();
    });

    return () => unsubscribe();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all analytics in parallel
      const [portfolio, financial, risk] = await Promise.all([
        analyticsService.getPortfolioMetrics(),
        analyticsService.getFinancialMetrics(),
        analyticsService.getRiskMetrics()
      ]);

      setPortfolioMetrics(portfolio);
      setFinancialMetrics(financial);
      setRiskMetrics(risk);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading Portfolio Intelligence...</p>
        </div>
      </div>
    );
  }

  const MetricCard = ({ title, value, change, icon: Icon, trend, color = 'blue' }) => (
    <PremiumCard className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </PremiumCard>
  );

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Intelligence</h1>
        <p className="text-gray-600">Real-time insights across your capital project portfolio</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Projects"
          value={portfolioMetrics?.totalProjects || 0}
          change={`${portfolioMetrics?.projectGrowth || 0}% vs last month`}
          icon={Target}
          trend="up"
          color="blue"
        />
        <MetricCard
          title="Total Budget"
          value={`$${((financialMetrics?.totalBudget || 0) / 1000000).toFixed(1)}M`}
          change={`${financialMetrics?.budgetUtilization || 0}% utilized`}
          icon={DollarSign}
          trend="up"
          color="green"
        />
        <MetricCard
          title="At Risk"
          value={riskMetrics?.highRiskCount || 0}
          change={`${riskMetrics?.riskTrend || 0}% from last week`}
          icon={AlertTriangle}
          trend="down"
          color="red"
        />
        <MetricCard
          title="On Schedule"
          value={`${portfolioMetrics?.onSchedulePercentage || 0}%`}
          change={`${portfolioMetrics?.scheduleImprovement || 0}% improvement`}
          icon={Clock}
          trend="up"
          color="purple"
        />
      </div>

      {/* Portfolio Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Project Status Distribution</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {portfolioMetrics?.statusDistribution?.map((status, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{status.name}</span>
                  <span className="text-sm font-bold text-gray-900">{status.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      status.name === 'On Track' ? 'bg-green-500' :
                      status.name === 'At Risk' ? 'bg-yellow-500' :
                      status.name === 'Critical' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Budget Performance</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Allocated</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${((financialMetrics?.totalBudget || 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Spent to Date</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${((financialMetrics?.totalSpent || 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(((financialMetrics?.totalBudget || 0) - (financialMetrics?.totalSpent || 0)) / 1000000).toFixed(1)}M
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Risk Analysis */}
      <PremiumCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Risk Analysis</h2>
          <AlertTriangle className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{riskMetrics?.highRiskCount || 0}</p>
            <p className="text-sm text-gray-600">High Risk Projects</p>
          </div>
          <div className="text-center p-6 bg-yellow-50 rounded-lg">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{riskMetrics?.mediumRiskCount || 0}</p>
            <p className="text-sm text-gray-600">Medium Risk Projects</p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{riskMetrics?.lowRiskCount || 0}</p>
            <p className="text-sm text-gray-600">Low Risk Projects</p>
          </div>
        </div>
      </PremiumCard>

      {/* Team Performance */}
      <PremiumCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Team Performance</h2>
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{portfolioMetrics?.activeTeams || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Active Teams</p>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{portfolioMetrics?.totalResources || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Total Resources</p>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{portfolioMetrics?.utilizationRate || 0}%</p>
            <p className="text-sm text-gray-600 mt-1">Utilization Rate</p>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{portfolioMetrics?.avgProductivity || 0}%</p>
            <p className="text-sm text-gray-600 mt-1">Avg Productivity</p>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
};

export default PortfolioIntelligence;

// Made with Bob
