/**
 * Analytics Service
 * 
 * Provides comprehensive analytics and reporting capabilities.
 * Supports portfolio, financial, procurement, and executive analytics.
 */

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Portfolio Analytics
   */
  async getPortfolioAnalytics(projects) {
    const cacheKey = 'portfolio-analytics';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const analytics = {
      overview: this.calculatePortfolioOverview(projects),
      byStatus: this.groupByStatus(projects),
      byPhase: this.groupByPhase(projects),
      byRegion: this.groupByRegion(projects),
      byType: this.groupByType(projects),
      healthDistribution: this.calculateHealthDistribution(projects),
      riskDistribution: this.calculateRiskDistribution(projects),
      budgetAnalysis: this.calculatePortfolioBudgetAnalysis(projects),
      timeline: this.calculatePortfolioTimeline(projects),
      trends: this.calculatePortfolioTrends(projects)
    };

    this.setCache(cacheKey, analytics);
    return analytics;
  }

  /**
   * Calculate portfolio overview
   */
  calculatePortfolioOverview(projects) {
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const totalCommitments = projects.reduce((sum, p) => sum + (p.commitments || 0), 0);

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status?.toLowerCase().includes('progress')).length,
      completedProjects: projects.filter(p => p.status?.toLowerCase().includes('complete')).length,
      totalBudget,
      totalSpent,
      totalCommitments,
      totalRemaining: totalBudget - totalSpent - totalCommitments,
      avgHealthScore: this.calculateAverage(projects.map(p => p.healthScore)),
      avgRiskScore: this.calculateAverage(projects.map(p => p.riskScore)),
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };
  }

  /**
   * Financial Analytics
   */
  async getFinancialAnalytics(projects) {
    const cacheKey = 'financial-analytics';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const analytics = {
      budgetPerformance: this.calculateBudgetPerformance(projects),
      costTrends: this.calculateCostTrends(projects),
      forecastAnalysis: this.calculateForecastAnalysis(projects),
      varianceAnalysis: this.calculateVarianceAnalysis(projects),
      cashflowProjection: this.calculateCashflowProjection(projects),
      costByCategory: this.calculateCostByCategory(projects),
      budgetHealth: this.calculateBudgetHealth(projects)
    };

    this.setCache(cacheKey, analytics);
    return analytics;
  }

  /**
   * Calculate budget performance
   */
  calculateBudgetPerformance(projects) {
    return projects.map(project => ({
      projectId: project.id,
      projectName: project.name,
      budget: project.budget,
      spent: project.spent,
      commitments: project.commitments,
      remaining: project.budget - project.spent - project.commitments,
      utilization: project.budget > 0 ? (project.spent / project.budget) * 100 : 0,
      variance: project.budget - project.spent,
      variancePercent: project.budget > 0 ? ((project.budget - project.spent) / project.budget) * 100 : 0,
      status: this.getBudgetStatus(project)
    }));
  }

  /**
   * Get budget status
   */
  getBudgetStatus(project) {
    const utilization = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
    if (utilization > 100) return 'over_budget';
    if (utilization > 90) return 'critical';
    if (utilization > 75) return 'warning';
    return 'healthy';
  }

  /**
   * Procurement Analytics
   */
  async getProcurementAnalytics(projects) {
    const cacheKey = 'procurement-analytics';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const analytics = {
      contractSummary: this.calculateContractSummary(projects),
      vendorPerformance: this.calculateVendorPerformance(projects),
      procurementTimeline: this.calculateProcurementTimeline(projects),
      costSavings: this.calculateCostSavings(projects),
      complianceMetrics: this.calculateComplianceMetrics(projects)
    };

    this.setCache(cacheKey, analytics);
    return analytics;
  }

  /**
   * Calculate contract summary
   */
  calculateContractSummary(projects) {
    const allContracts = projects.flatMap(p => p.contractDetails || []);
    
    return {
      totalContracts: allContracts.length,
      activeContracts: allContracts.filter(c => c.status?.toLowerCase().includes('active')).length,
      pendingContracts: allContracts.filter(c => c.status?.toLowerCase().includes('pending')).length,
      totalValue: allContracts.reduce((sum, c) => sum + (c.approvedAmount || 0), 0),
      avgContractValue: allContracts.length > 0 
        ? allContracts.reduce((sum, c) => sum + (c.approvedAmount || 0), 0) / allContracts.length 
        : 0
    };
  }

  /**
   * Executive Analytics
   */
  async getExecutiveAnalytics(projects) {
    const cacheKey = 'executive-analytics';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const analytics = {
      kpis: this.calculateKPIs(projects),
      strategicMetrics: this.calculateStrategicMetrics(projects),
      riskSummary: this.calculateRiskSummary(projects),
      performanceIndicators: this.calculatePerformanceIndicators(projects),
      executiveSummary: this.generateExecutiveSummary(projects)
    };

    this.setCache(cacheKey, analytics);
    return analytics;
  }

  /**
   * Calculate KPIs
   */
  calculateKPIs(projects) {
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const onTimeProjects = projects.filter(p => !this.isDelayed(p)).length;
    const onBudgetProjects = projects.filter(p => this.isOnBudget(p)).length;

    return {
      portfolioValue: totalBudget,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      onTimeDelivery: projects.length > 0 ? (onTimeProjects / projects.length) * 100 : 0,
      onBudgetDelivery: projects.length > 0 ? (onBudgetProjects / projects.length) * 100 : 0,
      avgProjectHealth: this.calculateAverage(projects.map(p => p.healthScore)),
      portfolioRisk: this.calculateAverage(projects.map(p => p.riskScore)),
      activeProjectCount: projects.filter(p => p.status?.toLowerCase().includes('progress')).length,
      completionRate: projects.length > 0 
        ? (projects.filter(p => p.status?.toLowerCase().includes('complete')).length / projects.length) * 100 
        : 0
    };
  }

  /**
   * Schedule Analytics
   */
  async getScheduleAnalytics(projects) {
    return {
      onTimeProjects: projects.filter(p => !this.isDelayed(p)).length,
      delayedProjects: projects.filter(p => this.isDelayed(p)).length,
      avgDelay: this.calculateAverageDelay(projects),
      criticalPath: this.identifyCriticalPath(projects),
      milestoneCompletion: this.calculateMilestoneCompletion(projects)
    };
  }

  /**
   * Risk Analytics
   */
  async getRiskAnalytics(projects) {
    return {
      highRiskProjects: projects.filter(p => p.riskScore >= 70).length,
      mediumRiskProjects: projects.filter(p => p.riskScore >= 40 && p.riskScore < 70).length,
      lowRiskProjects: projects.filter(p => p.riskScore < 40).length,
      riskTrends: this.calculateRiskTrends(projects),
      topRisks: this.identifyTopRisks(projects)
    };
  }

  /**
   * Helper: Group by status
   */
  groupByStatus(projects) {
    const grouped = {};
    projects.forEach(project => {
      const status = project.status || 'Unknown';
      if (!grouped[status]) {
        grouped[status] = { count: 0, budget: 0, spent: 0 };
      }
      grouped[status].count++;
      grouped[status].budget += project.budget || 0;
      grouped[status].spent += project.spent || 0;
    });
    return grouped;
  }

  /**
   * Helper: Group by phase
   */
  groupByPhase(projects) {
    const grouped = {};
    projects.forEach(project => {
      const phase = project.phase || 'Unknown';
      if (!grouped[phase]) {
        grouped[phase] = { count: 0, budget: 0 };
      }
      grouped[phase].count++;
      grouped[phase].budget += project.budget || 0;
    });
    return grouped;
  }

  /**
   * Helper: Group by region
   */
  groupByRegion(projects) {
    const grouped = {};
    projects.forEach(project => {
      const region = project.state || 'Unknown';
      if (!grouped[region]) {
        grouped[region] = { count: 0, budget: 0 };
      }
      grouped[region].count++;
      grouped[region].budget += project.budget || 0;
    });
    return grouped;
  }

  /**
   * Helper: Group by type
   */
  groupByType(projects) {
    const grouped = {};
    projects.forEach(project => {
      const type = project.projectType || 'Unknown';
      if (!grouped[type]) {
        grouped[type] = { count: 0, budget: 0 };
      }
      grouped[type].count++;
      grouped[type].budget += project.budget || 0;
    });
    return grouped;
  }

  /**
   * Helper: Calculate health distribution
   */
  calculateHealthDistribution(projects) {
    return {
      healthy: projects.filter(p => p.healthScore >= 80).length,
      warning: projects.filter(p => p.healthScore >= 60 && p.healthScore < 80).length,
      critical: projects.filter(p => p.healthScore < 60).length
    };
  }

  /**
   * Helper: Calculate risk distribution
   */
  calculateRiskDistribution(projects) {
    return {
      low: projects.filter(p => p.riskScore < 40).length,
      medium: projects.filter(p => p.riskScore >= 40 && p.riskScore < 70).length,
      high: projects.filter(p => p.riskScore >= 70).length
    };
  }

  /**
   * Helper: Calculate average
   */
  calculateAverage(values) {
    const validValues = values.filter(v => v != null && !isNaN(v));
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
  }

  /**
   * Helper: Is project delayed
   */
  isDelayed(project) {
    if (!project.endDate) return false;
    return new Date(project.endDate) < new Date() && !project.status?.toLowerCase().includes('complete');
  }

  /**
   * Helper: Is project on budget
   */
  isOnBudget(project) {
    if (!project.budget) return true;
    return project.spent <= project.budget;
  }

  /**
   * Helper: Calculate average delay
   */
  calculateAverageDelay(projects) {
    const delayedProjects = projects.filter(p => this.isDelayed(p));
    if (delayedProjects.length === 0) return 0;
    
    const totalDelay = delayedProjects.reduce((sum, p) => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      const delay = Math.ceil((today - endDate) / (1000 * 60 * 60 * 24));
      return sum + delay;
    }, 0);
    
    return totalDelay / delayedProjects.length;
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Placeholder methods (to be implemented with real data)
   */
  calculatePortfolioBudgetAnalysis(projects) {
    return { totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0) };
  }

  calculatePortfolioTimeline(projects) {
    return { projects: projects.length };
  }

  calculatePortfolioTrends(projects) {
    return { trend: 'stable' };
  }

  calculateCostTrends(projects) {
    return { trend: 'increasing' };
  }

  calculateForecastAnalysis(projects) {
    return { forecast: 'on_track' };
  }

  calculateVarianceAnalysis(projects) {
    return { variance: 0 };
  }

  calculateCashflowProjection(projects) {
    return { projection: [] };
  }

  calculateCostByCategory(projects) {
    return {};
  }

  calculateBudgetHealth(projects) {
    return { healthy: projects.length };
  }

  calculateVendorPerformance(projects) {
    return { vendors: [] };
  }

  calculateProcurementTimeline(projects) {
    return { timeline: [] };
  }

  calculateCostSavings(projects) {
    return { savings: 0 };
  }

  calculateComplianceMetrics(projects) {
    return { compliant: projects.length };
  }

  calculateStrategicMetrics(projects) {
    return { metrics: {} };
  }

  calculateRiskSummary(projects) {
    return { risks: [] };
  }

  calculatePerformanceIndicators(projects) {
    return { indicators: {} };
  }

  generateExecutiveSummary(projects) {
    return { summary: 'Portfolio performing well' };
  }

  identifyCriticalPath(projects) {
    return { path: [] };
  }

  calculateMilestoneCompletion(projects) {
    return { completion: 0 };
  }

  calculateRiskTrends(projects) {
    return { trend: 'stable' };
  }

  identifyTopRisks(projects) {
    return [];
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

export default analyticsService;

// Made with Bob
