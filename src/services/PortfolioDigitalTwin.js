/**
 * Portfolio Digital Twin
 * 
 * Maintains a complete digital representation of the entire capital project portfolio.
 * Provides executive-level insights, trends, and predictive analytics.
 */

import { analyticsService } from './AnalyticsService';
import { eventBus, EVENT_TYPES } from './EventBus';
import { auditService } from './AuditService';

class PortfolioDigitalTwin {
  constructor() {
    this.state = {
      portfolioHealth: null,
      financialState: null,
      riskState: null,
      procurementState: null,
      vendorState: null,
      forecastState: null,
      lastUpdated: null
    };

    this.history = [];
    this.maxHistorySize = 100;

    // Subscribe to portfolio events
    this.subscribeToEvents();
  }

  /**
   * Subscribe to portfolio-level events
   */
  subscribeToEvents() {
    eventBus.subscribe(EVENT_TYPES.PROJECT_CREATED, () => this.refresh());
    eventBus.subscribe(EVENT_TYPES.PROJECT_UPDATED, () => this.refresh());
    eventBus.subscribe(EVENT_TYPES.BUDGET_UPDATED, () => this.refresh());
    eventBus.subscribe(EVENT_TYPES.RISK_IDENTIFIED, () => this.refresh());
    eventBus.subscribe(EVENT_TYPES.CONTRACT_CREATED, () => this.refresh());
  }

  /**
   * Refresh portfolio state
   */
  async refresh() {
    try {
      const [portfolio, financial, risk, procurement] = await Promise.all([
        analyticsService.getPortfolioMetrics(),
        analyticsService.getFinancialMetrics(),
        analyticsService.getRiskMetrics(),
        analyticsService.getProcurementMetrics()
      ]);

      this.state = {
        portfolioHealth: portfolio,
        financialState: financial,
        riskState: risk,
        procurementState: procurement,
        vendorState: await this.calculateVendorState(),
        forecastState: await this.calculateForecastState(),
        lastUpdated: new Date().toISOString()
      };

      // Add to history
      this.addToHistory(this.state);

      // Publish update event
      eventBus.publish(EVENT_TYPES.PORTFOLIO_UPDATED, { state: this.state });

      return this.state;
    } catch (error) {
      console.error('Failed to refresh portfolio twin:', error);
      throw error;
    }
  }

  /**
   * Get current portfolio state
   */
  async getCurrentState() {
    if (!this.state.lastUpdated) {
      await this.refresh();
    }
    return this.state;
  }

  /**
   * Get portfolio health trend
   */
  getHealthTrend(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.history
      .filter(h => new Date(h.lastUpdated) >= cutoff)
      .map(h => ({
        date: h.lastUpdated,
        health: h.portfolioHealth?.avgHealth || 0,
        atRisk: h.portfolioHealth?.atRiskCount || 0,
        onTrack: h.portfolioHealth?.onTrackCount || 0
      }));
  }

  /**
   * Get budget burn trend
   */
  getBudgetBurnTrend(days = 90) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.history
      .filter(h => new Date(h.lastUpdated) >= cutoff)
      .map(h => ({
        date: h.lastUpdated,
        budget: h.financialState?.totalBudget || 0,
        spent: h.financialState?.totalSpent || 0,
        committed: h.financialState?.totalCommitted || 0,
        forecast: h.forecastState?.projectedSpend || 0
      }));
  }

  /**
   * Get cash flow forecast
   */
  getCashFlowForecast(months = 12) {
    const forecast = [];
    const currentDate = new Date();
    const monthlyBurn = this.state.financialState?.monthlyBurnRate || 0;

    for (let i = 0; i < months; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() + i);

      forecast.push({
        month: date.toISOString().slice(0, 7),
        projected: monthlyBurn * (i + 1),
        committed: this.state.financialState?.totalCommitted || 0,
        available: (this.state.financialState?.totalBudget || 0) - (monthlyBurn * (i + 1))
      });
    }

    return forecast;
  }

  /**
   * Get risk heat map data
   */
  getRiskHeatMap() {
    const projects = this.state.portfolioHealth?.projects || [];
    
    return projects.map(project => ({
      id: project.id,
      name: project.name,
      probability: project.riskProbability || 0,
      impact: project.riskImpact || 0,
      severity: (project.riskProbability || 0) * (project.riskImpact || 0),
      category: project.category || 'Unknown'
    }));
  }

  /**
   * Get vendor concentration risk
   */
  getVendorConcentration() {
    const vendors = this.state.vendorState?.vendors || [];
    const totalSpend = vendors.reduce((sum, v) => sum + (v.totalSpend || 0), 0);

    return vendors.map(vendor => ({
      name: vendor.name,
      spend: vendor.totalSpend || 0,
      percentage: totalSpend > 0 ? ((vendor.totalSpend || 0) / totalSpend) * 100 : 0,
      projectCount: vendor.projectCount || 0,
      performance: vendor.performanceScore || 0
    })).sort((a, b) => b.spend - a.spend);
  }

  /**
   * Get project dependency graph
   */
  getProjectDependencies() {
    const projects = this.state.portfolioHealth?.projects || [];
    
    return projects.map(project => ({
      id: project.id,
      name: project.name,
      dependencies: project.dependencies || [],
      dependents: projects.filter(p => 
        (p.dependencies || []).includes(project.id)
      ).map(p => p.id),
      criticalPath: project.onCriticalPath || false
    }));
  }

  /**
   * Get delivery confidence score
   */
  getDeliveryConfidence() {
    const portfolio = this.state.portfolioHealth || {};
    const financial = this.state.financialState || {};
    const risk = this.state.riskState || {};

    // Calculate confidence based on multiple factors
    const healthScore = portfolio.avgHealth || 0;
    const budgetScore = financial.budgetUtilization < 90 ? 100 : (100 - financial.budgetUtilization);
    const riskScore = 100 - ((risk.highRiskCount || 0) * 10);
    const scheduleScore = portfolio.onSchedulePercentage || 0;

    const confidence = (healthScore * 0.3 + budgetScore * 0.25 + riskScore * 0.25 + scheduleScore * 0.2);

    return {
      overall: Math.round(confidence),
      factors: {
        health: Math.round(healthScore),
        budget: Math.round(budgetScore),
        risk: Math.round(riskScore),
        schedule: Math.round(scheduleScore)
      },
      trend: this.calculateConfidenceTrend()
    };
  }

  /**
   * Get executive KPIs
   */
  getExecutiveKPIs() {
    const portfolio = this.state.portfolioHealth || {};
    const financial = this.state.financialState || {};
    const risk = this.state.riskState || {};
    const procurement = this.state.procurementState || {};

    return {
      portfolioHealth: portfolio.avgHealth || 0,
      projectsOnTrack: portfolio.onTrackCount || 0,
      projectsAtRisk: portfolio.atRiskCount || 0,
      totalBudget: financial.totalBudget || 0,
      budgetUtilization: financial.budgetUtilization || 0,
      forecastAccuracy: this.state.forecastState?.accuracy || 0,
      vendorPerformance: this.state.vendorState?.avgPerformance || 0,
      contractCompliance: procurement.complianceRate || 0,
      riskExposure: risk.totalExposure || 0,
      deliveryConfidence: this.getDeliveryConfidence().overall
    };
  }

  /**
   * Calculate vendor state
   */
  async calculateVendorState() {
    // Mock vendor data - in real implementation, would fetch from OSLC
    return {
      totalVendors: 45,
      activeVendors: 32,
      avgPerformance: 87,
      vendors: []
    };
  }

  /**
   * Calculate forecast state
   */
  async calculateForecastState() {
    const financial = this.state.financialState || {};
    const monthlyBurn = financial.monthlyBurnRate || 0;
    const remainingBudget = (financial.totalBudget || 0) - (financial.totalSpent || 0);
    const monthsRemaining = monthlyBurn > 0 ? remainingBudget / monthlyBurn : 0;

    return {
      projectedSpend: financial.totalSpent + (monthlyBurn * 3),
      projectedCompletion: new Date(Date.now() + (monthsRemaining * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      accuracy: 92,
      confidence: 85
    };
  }

  /**
   * Calculate confidence trend
   */
  calculateConfidenceTrend() {
    if (this.history.length < 2) return 0;

    const recent = this.history.slice(-5);
    const confidences = recent.map(h => {
      const portfolio = h.portfolioHealth || {};
      return portfolio.avgHealth || 0;
    });

    const avg = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    const latest = confidences[confidences.length - 1];

    return latest - avg;
  }

  /**
   * Add state to history
   */
  addToHistory(state) {
    this.history.push({
      ...state,
      timestamp: new Date().toISOString()
    });

    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get portfolio scorecard
   */
  getPortfolioScorecard() {
    const kpis = this.getExecutiveKPIs();
    
    return {
      overall: Math.round((
        kpis.portfolioHealth * 0.3 +
        kpis.deliveryConfidence * 0.25 +
        kpis.vendorPerformance * 0.15 +
        kpis.contractCompliance * 0.15 +
        (100 - kpis.budgetUtilization) * 0.15
      )),
      categories: {
        execution: Math.round((kpis.portfolioHealth + kpis.deliveryConfidence) / 2),
        financial: Math.round(100 - kpis.budgetUtilization),
        risk: Math.round(100 - (kpis.projectsAtRisk * 5)),
        governance: Math.round((kpis.vendorPerformance + kpis.contractCompliance) / 2)
      }
    };
  }
}

// Export singleton instance
export const portfolioDigitalTwin = new PortfolioDigitalTwin();

export default portfolioDigitalTwin;

// Made with Bob
