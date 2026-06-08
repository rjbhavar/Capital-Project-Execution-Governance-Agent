/**
 * Project Digital Twin Service
 * 
 * Maintains a complete digital representation of a capital project.
 * Aggregates all project data, findings, recommendations, and history
 * into a single unified view.
 * 
 * The Digital Twin is the single source of truth for project state.
 */

import { mcpLayer } from './MCPLayer';
import { agentMemory } from './AgentMemoryService';
import { agentActionExecutor } from './agentActions';

class ProjectDigitalTwin {
  constructor(projectId) {
    this.projectId = projectId;
    this.data = {};
    this.findings = [];
    this.recommendations = [];
    this.history = [];
    this.timeline = {};
    this.activityFeed = [];
    this.isHydrated = false;
    this.lastUpdate = null;
  }

  /**
   * Hydrate the digital twin with all project data
   */
  async hydrate() {
    console.log(`ProjectDigitalTwin: Hydrating project ${this.projectId}`);
    const startTime = Date.now();

    try {
      // Load core project data
      await this.loadProjectData();

      // Load linked resources
      await this.loadLinkedResources();

      // Load agent data
      await this.loadAgentData();

      // Load execution history
      await this.loadExecutionHistory();

      // Load activity feed
      await this.loadActivityFeed();

      // Build timeline
      await this.buildTimeline();

      // Calculate health metrics
      this.calculateHealthMetrics();

      this.isHydrated = true;
      this.lastUpdate = new Date();

      const duration = Date.now() - startTime;
      console.log(`ProjectDigitalTwin: Hydration complete in ${duration}ms`);

      return this.getCompleteView();

    } catch (error) {
      console.error('ProjectDigitalTwin: Hydration failed', error);
      throw error;
    }
  }

  /**
   * Load core project data
   */
  async loadProjectData() {
    try {
      this.data.project = await mcpLayer.getProjectById(this.projectId);
      
      if (!this.data.project) {
        throw new Error(`Project not found: ${this.projectId}`);
      }

      console.log(`ProjectDigitalTwin: Loaded project data for ${this.data.project.name}`);
    } catch (error) {
      console.error('Failed to load project data:', error);
      throw error;
    }
  }

  /**
   * Load all linked resources
   */
  async loadLinkedResources() {
    const project = this.data.project;

    try {
      // Load budget (from embedded data or API)
      if (project.hasBudget) {
        this.data.budget = project.budgetDetails || (project.budgetId ? await mcpLayer.getBudget(project.budgetId) : null);
      }

      // Load proposal (from embedded data or API)
      if (project.hasProposal) {
        this.data.proposal = project.proposalDetails || (project.proposalId ? await mcpLayer.getProposal(project.proposalId) : null);
      }

      // Load contracts with line items (from embedded data or API)
      if (project.hasContracts) {
        this.data.contracts = project.contractDetails || await mcpLayer.getContracts(this.projectId);
      }

      // Load payments (from embedded data or API)
      if (project.hasPayments) {
        this.data.payments = project.paymentDetails || await mcpLayer.getPayments(this.projectId);
      }

      // Load contact roles (from embedded data)
      if (project.hasContactRoles) {
        this.data.contactRoles = project.contactRoles || [];
      }

      // Load purchase orders with line items (from embedded data or API)
      if (project.hasPurchaseOrders) {
        this.data.purchaseOrders = project.purchaseOrderDetails || await mcpLayer.getPurchaseOrders(this.projectId);
      }

      // Load tasks/milestones (when API available)
      // this.data.tasks = await mcpLayer.getTasks(this.projectId);
      // this.data.milestones = await mcpLayer.getMilestones(this.projectId);

      console.log('ProjectDigitalTwin: Loaded linked resources');
      console.log(`  - Budget: ${this.data.budget ? 'Yes' : 'No'}`);
      console.log(`  - Proposal: ${this.data.proposal ? 'Yes' : 'No'}`);
      console.log(`  - Contracts: ${this.data.contracts?.length || 0}`);
      console.log(`  - Payments: ${this.data.payments?.length || 0}`);
      console.log(`  - Contact Roles: ${this.data.contactRoles?.length || 0}`);
      console.log(`  - Purchase Orders: ${this.data.purchaseOrders?.length || 0}`);
    } catch (error) {
      console.error('Failed to load linked resources:', error);
      // Don't throw - partial data is acceptable
    }
  }

  /**
   * Load agent findings and recommendations
   */
  async loadAgentData() {
    try {
      // Load findings from agent memory
      this.findings = await agentMemory.getFindings(this.projectId) || [];

      // Load recommendations from agent memory
      this.recommendations = await agentMemory.getRecommendations(this.projectId) || [];

      // Load pending actions
      this.data.pendingActions = agentActionExecutor.getProjectActions(this.projectId)
        .filter(action => action.status === 'pending');

      console.log(`ProjectDigitalTwin: Loaded ${this.findings.length} findings, ${this.recommendations.length} recommendations`);
    } catch (error) {
      console.error('Failed to load agent data:', error);
      this.findings = [];
      this.recommendations = [];
    }
  }

  /**
   * Load execution history
   */
  async loadExecutionHistory() {
    try {
      this.history = await agentMemory.getExecutionHistory(this.projectId) || [];
      console.log(`ProjectDigitalTwin: Loaded ${this.history.length} execution records`);
    } catch (error) {
      console.error('Failed to load execution history:', error);
      this.history = [];
    }
  }

  /**
   * Load activity feed
   */
  async loadActivityFeed() {
    try {
      // Aggregate activities from multiple sources
      const activities = [];

      // Agent executions
      this.history.forEach(exec => {
        activities.push({
          type: 'agent_execution',
          timestamp: exec.timestamp,
          actor: 'System',
          action: 'Agent Analysis',
          details: `${exec.agentName} completed analysis`,
          result: exec.status
        });
      });

      // Agent actions
      const allActions = agentActionExecutor.getProjectActions(this.projectId);
      allActions.forEach(action => {
        activities.push({
          type: 'agent_action',
          timestamp: action.createdAt,
          actor: action.agentName,
          action: action.actionType,
          details: action.title,
          result: action.status
        });

        if (action.status === 'approved' || action.status === 'rejected') {
          activities.push({
            type: 'approval',
            timestamp: action.updatedAt,
            actor: action.approvedBy || 'User',
            action: action.status === 'approved' ? 'Approved' : 'Rejected',
            details: action.title,
            result: action.status
          });
        }
      });

      // Sort by timestamp (newest first)
      this.activityFeed = activities.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      console.log(`ProjectDigitalTwin: Loaded ${this.activityFeed.length} activities`);
    } catch (error) {
      console.error('Failed to load activity feed:', error);
      this.activityFeed = [];
    }
  }

  /**
   * Build project timeline
   */
  async buildTimeline() {
    const project = this.data.project;

    this.timeline = {
      plannedStart: project.startDate,
      plannedEnd: project.endDate,
      actualStart: project.actualStartDate || project.startDate,
      actualEnd: project.actualEndDate,
      
      // Calculate progress
      totalDays: this.calculateDaysBetween(project.startDate, project.endDate),
      elapsedDays: this.calculateDaysBetween(project.startDate, new Date()),
      remainingDays: this.calculateDaysBetween(new Date(), project.endDate),
      
      // Status
      isDelayed: project.actualEndDate && project.actualEndDate > project.endDate,
      isOnTrack: !project.actualEndDate && new Date() <= new Date(project.endDate),
      isComplete: !!project.actualEndDate,
      
      // Milestones (placeholder - will be populated when API available)
      milestones: [],
      
      // Activities (placeholder - will be populated when API available)
      activities: []
    };

    console.log('ProjectDigitalTwin: Built timeline');
  }

  /**
   * Calculate health metrics
   */
  calculateHealthMetrics() {
    const project = this.data.project;
    const budget = this.data.budget;

    this.data.healthMetrics = {
      // Overall health score (from project or calculated)
      overallHealth: project.healthScore || this.calculateOverallHealth(),
      
      // Budget health
      budgetHealth: budget ? this.calculateBudgetHealth(budget) : null,
      
      // Schedule health
      scheduleHealth: this.calculateScheduleHealth(),
      
      // Risk score
      riskScore: project.riskScore || this.calculateRiskScore(),
      
      // Governance health
      governanceHealth: this.calculateGovernanceHealth(),
      
      // Agent confidence
      agentConfidence: this.calculateAgentConfidence()
    };

    console.log('ProjectDigitalTwin: Calculated health metrics');
  }

  /**
   * Calculate overall health score
   */
  calculateOverallHealth() {
    const metrics = [];

    // Budget health (30% weight)
    if (this.data.budget) {
      const budgetHealth = this.calculateBudgetHealth(this.data.budget);
      metrics.push({ score: budgetHealth, weight: 0.30 });
    }

    // Schedule health (30% weight)
    const scheduleHealth = this.calculateScheduleHealth();
    metrics.push({ score: scheduleHealth, weight: 0.30 });

    // Risk score (20% weight) - inverted (lower risk = higher health)
    const riskScore = this.calculateRiskScore();
    metrics.push({ score: 100 - riskScore, weight: 0.20 });

    // Governance health (20% weight)
    const governanceHealth = this.calculateGovernanceHealth();
    metrics.push({ score: governanceHealth, weight: 0.20 });

    // Weighted average
    const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
    const weightedSum = metrics.reduce((sum, m) => sum + (m.score * m.weight), 0);

    return Math.round(weightedSum / totalWeight);
  }

  /**
   * Calculate budget health
   */
  calculateBudgetHealth(budget) {
    const utilization = budget.incurredCost / budget.budgetAmount;
    
    if (utilization > 1.0) return 40; // Over budget
    if (utilization > 0.95) return 60; // Near budget limit
    if (utilization > 0.85) return 75; // High utilization
    if (utilization > 0.70) return 90; // Good utilization
    return 95; // Healthy utilization
  }

  /**
   * Calculate schedule health
   */
  calculateScheduleHealth() {
    const timeline = this.timeline;
    
    if (timeline.isComplete) {
      return timeline.isDelayed ? 70 : 100;
    }

    if (timeline.remainingDays < 0) return 40; // Overdue
    if (timeline.remainingDays < 7) return 60; // Due soon
    if (timeline.remainingDays < 30) return 80; // On track
    return 95; // Healthy timeline
  }

  /**
   * Calculate risk score
   */
  calculateRiskScore() {
    let riskScore = 0;

    // Critical findings increase risk
    const criticalFindings = this.findings.filter(f => f.severity === 'critical').length;
    riskScore += criticalFindings * 15;

    // High priority recommendations increase risk
    const highPriorityRecs = this.recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length;
    riskScore += highPriorityRecs * 10;

    // Budget overrun increases risk
    if (this.data.budget) {
      const utilization = this.data.budget.incurredCost / this.data.budget.budgetAmount;
      if (utilization > 1.0) riskScore += 20;
      else if (utilization > 0.95) riskScore += 10;
    }

    // Schedule delay increases risk
    if (this.timeline.isDelayed) riskScore += 20;
    else if (this.timeline.remainingDays < 7) riskScore += 10;

    return Math.min(riskScore, 100);
  }

  /**
   * Calculate governance health
   */
  calculateGovernanceHealth() {
    const project = this.data.project;
    let score = 100;

    // Missing project manager
    if (!project.projectManager) score -= 30;

    // Missing budget
    if (!project.hasBudget) score -= 20;

    // Missing proposal
    if (!project.hasProposal) score -= 15;

    // No recent activity
    if (this.activityFeed.length === 0) score -= 15;

    return Math.max(score, 0);
  }

  /**
   * Calculate agent confidence
   */
  calculateAgentConfidence() {
    if (this.recommendations.length === 0) return 0;

    const avgConfidence = this.recommendations.reduce((sum, r) => 
      sum + (r.confidence || 0), 0
    ) / this.recommendations.length;

    return Math.round(avgConfidence * 100);
  }

  /**
   * Calculate days between two dates
   */
  calculateDaysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2 - d1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get complete digital twin view
   */
  getCompleteView() {
    return {
      projectId: this.projectId,
      isHydrated: this.isHydrated,
      lastUpdate: this.lastUpdate,
      
      // Core data
      project: this.data.project,
      budget: this.data.budget,
      proposal: this.data.proposal,
      contracts: this.data.contracts,
      payments: this.data.payments,
      contactRoles: this.data.contactRoles,
      purchaseOrders: this.data.purchaseOrders,
      
      // Agent data
      findings: this.findings,
      recommendations: this.recommendations,
      pendingActions: this.data.pendingActions,
      
      // History
      executionHistory: this.history,
      activityFeed: this.activityFeed,
      
      // Timeline
      timeline: this.timeline,
      
      // Health metrics
      healthMetrics: this.data.healthMetrics
    };
  }

  /**
   * Get summary view (lightweight)
   */
  getSummary() {
    return {
      projectId: this.projectId,
      projectName: this.data.project?.name,
      status: this.data.project?.status,
      healthScore: this.data.healthMetrics?.overallHealth,
      riskScore: this.data.healthMetrics?.riskScore,
      criticalFindings: this.findings.filter(f => f.severity === 'critical').length,
      pendingActions: this.data.pendingActions?.length || 0,
      lastUpdate: this.lastUpdate
    };
  }

  /**
   * Refresh specific data section
   */
  async refresh(section = 'all') {
    console.log(`ProjectDigitalTwin: Refreshing ${section}`);

    switch (section) {
      case 'project':
        await this.loadProjectData();
        break;
      case 'resources':
        await this.loadLinkedResources();
        break;
      case 'agents':
        await this.loadAgentData();
        break;
      case 'history':
        await this.loadExecutionHistory();
        break;
      case 'activity':
        await this.loadActivityFeed();
        break;
      case 'all':
        await this.hydrate();
        break;
      default:
        console.warn(`Unknown section: ${section}`);
    }

    this.lastUpdate = new Date();
    return this.getCompleteView();
  }

  /**
   * Add activity to feed
   */
  addActivity(activity) {
    this.activityFeed.unshift({
      ...activity,
      timestamp: activity.timestamp || new Date().toISOString()
    });
  }

  /**
   * Get critical alerts
   */
  getCriticalAlerts() {
    const alerts = [];

    // Critical findings
    const criticalFindings = this.findings.filter(f => f.severity === 'critical');
    alerts.push(...criticalFindings.map(f => ({
      type: 'finding',
      severity: 'critical',
      title: f.title,
      description: f.description,
      source: f.agentName
    })));

    // Critical recommendations
    const criticalRecs = this.recommendations.filter(r => r.priority === 'critical');
    alerts.push(...criticalRecs.map(r => ({
      type: 'recommendation',
      severity: 'critical',
      title: r.title,
      description: r.description,
      source: r.agentName
    })));

    // Budget overrun
    if (this.data.budget) {
      const utilization = this.data.budget.incurredCost / this.data.budget.budgetAmount;
      if (utilization > 1.0) {
        alerts.push({
          type: 'budget',
          severity: 'critical',
          title: 'Budget Overrun',
          description: `Project is ${((utilization - 1) * 100).toFixed(1)}% over budget`,
          source: 'Budget Intelligence Agent'
        });
      }
    }

    // Schedule overdue
    if (this.timeline.remainingDays < 0) {
      alerts.push({
        type: 'schedule',
        severity: 'critical',
        title: 'Project Overdue',
        description: `Project is ${Math.abs(this.timeline.remainingDays)} days overdue`,
        source: 'Schedule Monitoring Agent'
      });
    }

    return alerts;
  }
}

/**
 * Digital Twin Manager - Manages multiple project twins
 */
class DigitalTwinManager {
  constructor() {
    this.twins = new Map();
  }

  /**
   * Get or create digital twin for a project
   */
  async getTwin(projectId) {
    if (!this.twins.has(projectId)) {
      const twin = new ProjectDigitalTwin(projectId);
      await twin.hydrate();
      this.twins.set(projectId, twin);
    }

    return this.twins.get(projectId);
  }

  /**
   * Refresh a twin
   */
  async refreshTwin(projectId, section = 'all') {
    const twin = this.twins.get(projectId);
    if (twin) {
      return await twin.refresh(section);
    }
    return await this.getTwin(projectId);
  }

  /**
   * Remove twin from cache
   */
  removeTwin(projectId) {
    this.twins.delete(projectId);
  }

  /**
   * Clear all twins
   */
  clearAll() {
    this.twins.clear();
  }

  /**
   * Get all twins
   */
  getAllTwins() {
    return Array.from(this.twins.values());
  }
}

// Export singleton instance
export const digitalTwinManager = new DigitalTwinManager();

export default ProjectDigitalTwin;

// Made with Bob