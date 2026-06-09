import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { portfolioDigitalTwin } from '../services/PortfolioDigitalTwin';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Clock, Users, FileText, Brain } from 'lucide-react';
import { GradientCard } from '../components/common/PremiumCard';

const ExecutiveBriefing = () => {
  const { projects, loading } = useData();
  const [portfolioState, setPortfolioState] = useState(null);
  
  const briefingDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    loadPortfolioData();
  }, [projects]);

  const loadPortfolioData = async () => {
    try {
      const state = await portfolioDigitalTwin.getCurrentState();
      setPortfolioState(state);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    }
  };

  // Calculate real metrics from projects
  const metrics = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => 
      p.status && (p.status.toLowerCase().includes('progress') || p.status.toLowerCase().includes('active'))
    ).length;
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    const avgHealth = projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + (p.healthScore || 0), 0) / projects.length)
      : 0;
    
    const onTrack = projects.filter(p => (p.healthScore || 0) >= 80).length;
    const onTrackPercent = totalProjects > 0 ? Math.round((onTrack / totalProjects) * 100) : 0;
    
    const atRisk = projects.filter(p => (p.healthScore || 0) < 60).length;
    const overBudget = projects.filter(p => {
      const budget = p.budget || 0;
      const spent = p.spent || 0;
      return budget > 0 && spent > budget;
    }).length;
    
    const totalOverrun = projects.reduce((sum, p) => {
      const budget = p.budget || 0;
      const spent = p.spent || 0;
      return sum + (spent > budget ? spent - budget : 0);
    }, 0);
    
    // Contract metrics
    const pendingContracts = projects.reduce((sum, p) => {
      return sum + (p.contractDetails?.filter(c => 
        c.status && c.status.toLowerCase().includes('pending')
      ).length || 0);
    }, 0);
    
    const totalContractValue = projects.reduce((sum, p) => {
      return sum + (p.contractDetails?.reduce((cSum, c) => cSum + (c.approvedAmount || 0), 0) || 0);
    }, 0);
    
    // Payment metrics
    const pendingPayments = projects.reduce((sum, p) => {
      return sum + (p.paymentDetails?.filter(pay => 
        pay.status && pay.status.toLowerCase().includes('pending')
      ).length || 0);
    }, 0);
    
    const totalPaymentValue = projects.reduce((sum, p) => {
      return sum + (p.paymentDetails?.reduce((pSum, pay) => pSum + (pay.invoiceAmount || 0), 0) || 0);
    }, 0);
    
    // Governance metrics
    const missingPM = projects.filter(p => !p.projectManager || p.projectManager === 'Unassigned').length;
    const compliantProjects = projects.filter(p => (p.healthScore || 0) >= 70).length;
    const complianceScore = totalProjects > 0 ? Math.round((compliantProjects / totalProjects) * 100) : 0;
    
    return {
      totalProjects,
      activeProjects,
      totalBudget,
      totalSpent,
      budgetUtilization,
      avgHealth,
      onTrack,
      onTrackPercent,
      atRisk,
      overBudget,
      totalOverrun,
      pendingContracts,
      totalContractValue,
      pendingPayments,
      totalPaymentValue,
      missingPM,
      compliantProjects,
      complianceScore
    };
  }, [projects]);

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  // Get projects requiring attention
  const criticalProjects = projects
    .filter(p => (p.healthScore || 0) < 60 || (p.spent || 0) > (p.budget || 0))
    .sort((a, b) => (a.healthScore || 0) - (b.healthScore || 0))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Generating executive briefing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Briefing</h1>
          <p className="text-gray-600 mt-1">{briefingDate}</p>
        </div>
        <button className="px-4 py-2 bg-ibm-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
          Export PDF
        </button>
      </div>

      {/* Portfolio Summary */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics.activeProjects}</p>
            <p className="text-sm text-gray-600">Active Projects</p>
            <p className="text-xs text-gray-500 mt-1">{metrics.totalProjects} total</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalBudget)}</p>
            <p className="text-sm text-gray-600">Total Budget</p>
            <p className="text-xs text-blue-600 mt-1">{metrics.budgetUtilization.toFixed(1)}% utilized</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics.onTrackPercent}%</p>
            <p className="text-sm text-gray-600">On Track</p>
            <p className="text-xs text-green-600 mt-1">{metrics.onTrack} projects</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics.avgHealth}%</p>
            <p className="text-sm text-gray-600">Avg Health Score</p>
            <p className="text-xs text-green-600 mt-1">
              {metrics.avgHealth >= 80 ? 'Healthy' : metrics.avgHealth >= 60 ? 'Fair' : 'Needs Attention'}
            </p>
          </div>
        </div>
      </GradientCard>

      {/* Projects Requiring Attention */}
      {criticalProjects.length > 0 && (
        <GradientCard gradient="gray" className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Projects Requiring Attention</h2>
          <div className="space-y-4">
            {criticalProjects.map((project, index) => {
              const isOverBudget = (project.spent || 0) > (project.budget || 0);
              const overrunPercent = project.budget > 0 
                ? (((project.spent || 0) - project.budget) / project.budget * 100).toFixed(1)
                : 0;
              
              return (
                <div 
                  key={project.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg border ${
                    isOverBudget 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <AlertTriangle className={`w-6 h-6 mt-1 ${
                    isOverBudget ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {isOverBudget 
                        ? `Budget overrun detected: ${overrunPercent}% over allocated budget. Immediate review required.`
                        : `Health score: ${project.healthScore}%. Requires attention to prevent issues.`
                      }
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        Budget: {formatCurrency(project.budget)} → {formatCurrency(project.spent)}
                      </span>
                      <span className="text-xs text-gray-500">Health: {project.healthScore}%</span>
                      <span className={`text-xs font-medium ${
                        isOverBudget ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {isOverBudget ? 'CRITICAL' : 'HIGH'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GradientCard>
      )}

      {/* Budget Concerns */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Concerns</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">{metrics.overBudget} Projects Over Budget</p>
              <p className="text-sm text-gray-600">
                Combined overrun: {formatCurrency(metrics.totalOverrun)} 
                {metrics.totalBudget > 0 && ` (${((metrics.totalOverrun / metrics.totalBudget) * 100).toFixed(1)}% of portfolio)`}
              </p>
            </div>
            {metrics.overBudget > 0 ? (
              <TrendingDown className="w-6 h-6 text-red-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">{metrics.atRisk} Projects at Risk</p>
              <p className="text-sm text-gray-600">Health score below 60% - requires monitoring</p>
            </div>
            {metrics.atRisk > 0 ? (
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Portfolio Utilization</p>
              <p className="text-sm text-gray-600">
                {formatCurrency(metrics.totalSpent)} spent of {formatCurrency(metrics.totalBudget)} allocated 
                ({metrics.budgetUtilization.toFixed(1)}%)
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </GradientCard>

      {/* Contract Concerns */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contract Concerns</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">{metrics.pendingContracts} Contracts Pending Approval</p>
              <p className="text-sm text-gray-600">
                {metrics.pendingContracts > 0 
                  ? 'Approval delays may impact schedule' 
                  : 'All contracts approved or in progress'}
              </p>
            </div>
            {metrics.pendingContracts > 0 ? (
              <Clock className="w-6 h-6 text-yellow-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Total Contract Value</p>
              <p className="text-sm text-gray-600">{formatCurrency(metrics.totalContractValue)} across all projects</p>
            </div>
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </GradientCard>

      {/* Payment Concerns */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Concerns</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">{metrics.pendingPayments} Invoices Pending</p>
              <p className="text-sm text-gray-600">
                Total: {formatCurrency(metrics.totalPaymentValue)}
              </p>
            </div>
            {metrics.pendingPayments > 0 ? (
              <DollarSign className="w-6 h-6 text-blue-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Payment Schedule</p>
              <p className="text-sm text-gray-600">
                {metrics.pendingPayments === 0 ? 'No pending payments' : `${metrics.pendingPayments} payments in queue`}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </GradientCard>

      {/* Governance Concerns */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Governance Concerns</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">{metrics.missingPM} Projects Missing Project Managers</p>
              <p className="text-sm text-gray-600">
                {metrics.missingPM > 0 
                  ? 'Critical governance gap - immediate assignment required' 
                  : 'All projects have assigned project managers'}
              </p>
            </div>
            {metrics.missingPM > 0 ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Compliance Score: {metrics.complianceScore}%</p>
              <p className="text-sm text-gray-600">
                {metrics.compliantProjects} of {metrics.totalProjects} projects meeting standards
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </GradientCard>

      {/* Agent Analysis Summary */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Agent Analysis Summary</h2>
        <p className="text-sm text-gray-600 mb-4">
          This briefing was generated by analyzing {metrics.totalProjects} projects with real-time data from MREF.
          All metrics are calculated from live project data including budgets, contracts, payments, and health scores.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Budget Agent</p>
            <p className="text-xs text-gray-600">Financial Analysis</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Brain className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Contract Agent</p>
            <p className="text-xs text-gray-600">Contract Monitoring</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Risk Agent</p>
            <p className="text-xs text-gray-600">Risk Assessment</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Brain className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Procurement Agent</p>
            <p className="text-xs text-gray-600">PO Tracking</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Brain className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Payment Agent</p>
            <p className="text-xs text-gray-600">Invoice Processing</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Brain className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Portfolio Agent</p>
            <p className="text-xs text-gray-600">Portfolio Health</p>
          </div>
        </div>
      </GradientCard>
    </div>
  );
};

export default ExecutiveBriefing;

// Made with Bob
