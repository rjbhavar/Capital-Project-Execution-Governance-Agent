/**
 * Risk Monitoring Workflow Service
 * 
 * Automated risk identification, assessment, monitoring, and mitigation
 * for capital projects with real-time alerts and agent coordination.
 */

import { eventBus, EVENT_TYPES } from './EventBus';
import { workflowEngine } from './WorkflowEngine';
import { agentOrchestrator } from './AgentOrchestratorService';
import { riskService, issueService } from './oslc';

class RiskMonitoringWorkflow {
  constructor() {
    this.activeRisks = new Map();
    this.riskCategories = [
      'FINANCIAL',
      'SCHEDULE',
      'TECHNICAL',
      'RESOURCE',
      'VENDOR',
      'REGULATORY',
      'SAFETY',
      'ENVIRONMENTAL'
    ];
    
    this.riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    this.monitoringIntervals = new Map();
    
    this.setupEventListeners();
    this.startContinuousMonitoring();
  }

  setupEventListeners() {
    // Listen for risk identification
    eventBus.subscribe(EVENT_TYPES.RISK_IDENTIFIED, (data) => {
      this.registerRisk(data);
    });

    // Listen for risk escalations
    eventBus.subscribe(EVENT_TYPES.RISK_ESCALATED, (data) => {
      this.handleRiskEscalation(data);
    });

    // Listen for risk mitigation
    eventBus.subscribe(EVENT_TYPES.RISK_MITIGATED, (data) => {
      this.handleRiskMitigation(data);
    });

    // Listen for project events that may trigger risks
    eventBus.subscribe(EVENT_TYPES.BUDGET_EXCEEDED, (data) => {
      this.identifyFinancialRisk(data);
    });

    eventBus.subscribe(EVENT_TYPES.SCHEDULE_DELAYED, (data) => {
      this.identifyScheduleRisk(data);
    });

    eventBus.subscribe(EVENT_TYPES.VENDOR_ISSUE, (data) => {
      this.identifyVendorRisk(data);
    });
  }

  /**
   * Start continuous risk monitoring
   */
  startContinuousMonitoring() {
    // Monitor all active risks every 5 minutes
    setInterval(() => {
      this.monitorAllRisks();
    }, 5 * 60 * 1000);

    console.log('🔍 Risk monitoring started');
  }

  /**
   * Identify and register a new risk
   */
  async identifyRisk(riskData) {
    const riskId = `RISK-${Date.now()}`;
    
    const risk = {
      id: riskId,
      projectId: riskData.projectId,
      category: riskData.category,
      title: riskData.title,
      description: riskData.description,
      identifiedBy: riskData.identifiedBy || 'SYSTEM',
      identifiedDate: new Date(),
      status: 'IDENTIFIED',
      probability: riskData.probability || 'MEDIUM',
      impact: riskData.impact || 'MEDIUM',
      riskScore: 0,
      triggers: riskData.triggers || [],
      indicators: riskData.indicators || [],
      mitigationPlan: null,
      contingencyPlan: null,
      owner: null,
      reviewDate: null,
      history: []
    };

    // Calculate risk score
    risk.riskScore = this.calculateRiskScore(risk.probability, risk.impact);
    risk.riskLevel = this.determineRiskLevel(risk.riskScore);

    this.activeRisks.set(riskId, risk);

    // Publish event
    eventBus.publish(EVENT_TYPES.RISK_IDENTIFIED, risk);

    console.log(`⚠️ Risk identified: ${riskId} - ${risk.title} (${risk.riskLevel})`);
    
    // Automatically assess the risk
    await this.assessRisk(risk);
    
    return risk;
  }

  /**
   * Register an existing risk
   */
  registerRisk(risk) {
    this.activeRisks.set(risk.id, risk);
    
    // Start monitoring this risk
    this.startRiskMonitoring(risk);
  }

  /**
   * Assess risk in detail
   */
  async assessRisk(risk) {
    console.log(`📊 Assessing risk: ${risk.id}`);
    
    risk.status = 'UNDER_ASSESSMENT';

    try {
      // Use Risk Agent for detailed assessment
      const assessment = await agentOrchestrator.executeAgentAction(
        'RiskAgent',
        'assessRisk',
        {
          risk,
          projectId: risk.projectId
        }
      );

      risk.assessment = assessment;
      risk.probability = assessment.probability;
      risk.impact = assessment.impact;
      risk.riskScore = this.calculateRiskScore(risk.probability, risk.impact);
      risk.riskLevel = this.determineRiskLevel(risk.riskScore);

      // Generate mitigation plan
      const mitigationPlan = await this.generateMitigationPlan(risk);
      risk.mitigationPlan = mitigationPlan;

      // Generate contingency plan
      const contingencyPlan = await this.generateContingencyPlan(risk);
      risk.contingencyPlan = contingencyPlan;

      // Assign risk owner
      risk.owner = this.assignRiskOwner(risk);

      // Set review date
      risk.reviewDate = this.calculateReviewDate(risk.riskLevel);

      risk.status = 'ASSESSED';
      
      // Route for approval if high or critical
      if (risk.riskLevel === 'HIGH' || risk.riskLevel === 'CRITICAL') {
        await this.routeForApproval(risk);
      } else {
        risk.status = 'ACTIVE';
        this.startRiskMonitoring(risk);
      }

      eventBus.publish(EVENT_TYPES.RISK_ASSESSED, risk);
      
    } catch (error) {
      risk.status = 'ASSESSMENT_FAILED';
      risk.error = error.message;
      
      eventBus.publish(EVENT_TYPES.RISK_ASSESSMENT_FAILED, risk);
      console.error(`❌ Risk assessment failed: ${risk.id}`, error);
    }
  }

  /**
   * Generate mitigation plan
   */
  async generateMitigationPlan(risk) {
    console.log(`🛡️ Generating mitigation plan for ${risk.id}`);
    
    const plan = {
      strategies: [],
      actions: [],
      resources: [],
      timeline: [],
      cost: 0,
      effectiveness: 0
    };

    // Use Risk Agent to generate strategies
    const strategies = await agentOrchestrator.executeAgentAction(
      'RiskAgent',
      'generateMitigationStrategies',
      { risk }
    );

    plan.strategies = strategies;

    // Generate specific actions based on risk category
    switch (risk.category) {
      case 'FINANCIAL':
        plan.actions.push('Implement cost controls');
        plan.actions.push('Secure contingency funding');
        plan.actions.push('Review budget allocations');
        break;
      case 'SCHEDULE':
        plan.actions.push('Add buffer time');
        plan.actions.push('Increase resources');
        plan.actions.push('Optimize critical path');
        break;
      case 'VENDOR':
        plan.actions.push('Identify backup vendors');
        plan.actions.push('Strengthen contract terms');
        plan.actions.push('Increase oversight');
        break;
      case 'TECHNICAL':
        plan.actions.push('Conduct technical review');
        plan.actions.push('Engage subject matter experts');
        plan.actions.push('Prototype solution');
        break;
    }

    return plan;
  }

  /**
   * Generate contingency plan
   */
  async generateContingencyPlan(risk) {
    console.log(`🚨 Generating contingency plan for ${risk.id}`);
    
    const plan = {
      triggers: [],
      actions: [],
      resources: [],
      escalation: [],
      communication: []
    };

    // Define triggers that activate contingency
    plan.triggers = [
      `Risk probability exceeds ${this.getProbabilityThreshold(risk.riskLevel)}%`,
      `Risk impact increases to ${this.getImpactThreshold(risk.riskLevel)}`,
      'Mitigation plan fails to reduce risk',
      'Risk materializes into an issue'
    ];

    // Define contingency actions
    plan.actions = [
      'Activate contingency budget',
      'Implement emergency procedures',
      'Escalate to senior management',
      'Engage crisis management team'
    ];

    return plan;
  }

  /**
   * Start monitoring a specific risk
   */
  startRiskMonitoring(risk) {
    console.log(`👁️ Starting monitoring for risk: ${risk.id}`);
    
    // Set monitoring frequency based on risk level
    const interval = this.getMonitoringInterval(risk.riskLevel);
    
    const monitoringId = setInterval(async () => {
      await this.monitorRisk(risk);
    }, interval);

    this.monitoringIntervals.set(risk.id, monitoringId);
  }

  /**
   * Monitor a specific risk
   */
  async monitorRisk(risk) {
    if (risk.status === 'CLOSED' || risk.status === 'MITIGATED') {
      this.stopRiskMonitoring(risk.id);
      return;
    }

    // Check risk indicators
    const indicators = await this.checkRiskIndicators(risk);
    
    // Update risk status based on indicators
    if (indicators.escalate) {
      await this.escalateRisk(risk, indicators.reason);
    }

    // Check if risk has materialized
    if (indicators.materialized) {
      await this.convertRiskToIssue(risk);
    }

    // Update risk history
    risk.history.push({
      timestamp: new Date(),
      status: risk.status,
      riskScore: risk.riskScore,
      indicators: indicators
    });

    eventBus.publish(EVENT_TYPES.RISK_MONITORED, {
      riskId: risk.id,
      indicators
    });
  }

  /**
   * Monitor all active risks
   */
  async monitorAllRisks() {
    const activeRisks = Array.from(this.activeRisks.values())
      .filter(r => r.status === 'ACTIVE' || r.status === 'UNDER_MITIGATION');

    console.log(`🔍 Monitoring ${activeRisks.length} active risks`);

    for (const risk of activeRisks) {
      await this.monitorRisk(risk);
    }
  }

  /**
   * Check risk indicators
   */
  async checkRiskIndicators(risk) {
    const indicators = {
      escalate: false,
      materialized: false,
      reason: null,
      metrics: {}
    };

    // Use Risk Agent to check indicators
    const agentCheck = await agentOrchestrator.executeAgentAction(
      'RiskAgent',
      'checkIndicators',
      { risk }
    );

    indicators.metrics = agentCheck.metrics;

    // Check for escalation conditions
    if (agentCheck.probabilityIncreased || agentCheck.impactIncreased) {
      indicators.escalate = true;
      indicators.reason = 'Risk parameters increased';
    }

    // Check if risk has materialized
    if (agentCheck.triggered) {
      indicators.materialized = true;
      indicators.reason = 'Risk trigger activated';
    }

    return indicators;
  }

  /**
   * Escalate risk
   */
  async escalateRisk(risk, reason) {
    console.log(`🚨 Escalating risk: ${risk.id} - ${reason}`);
    
    const previousLevel = risk.riskLevel;
    
    // Increase risk level
    risk.riskScore = Math.min(risk.riskScore * 1.5, 100);
    risk.riskLevel = this.determineRiskLevel(risk.riskScore);

    risk.history.push({
      timestamp: new Date(),
      action: 'ESCALATED',
      previousLevel,
      newLevel: risk.riskLevel,
      reason
    });

    // Notify stakeholders
    eventBus.publish(EVENT_TYPES.RISK_ESCALATED, {
      risk,
      previousLevel,
      newLevel: risk.riskLevel,
      reason
    });

    // If now critical, require immediate attention
    if (risk.riskLevel === 'CRITICAL') {
      await this.triggerCrisisResponse(risk);
    }
  }

  /**
   * Convert risk to issue
   */
  async convertRiskToIssue(risk) {
    console.log(`🔴 Converting risk to issue: ${risk.id}`);
    
    // Create issue from risk
    const issue = await issueService.create({
      projectId: risk.projectId,
      title: `RISK MATERIALIZED: ${risk.title}`,
      description: risk.description,
      severity: risk.riskLevel,
      category: risk.category,
      sourceRiskId: risk.id,
      status: 'OPEN'
    });

    risk.status = 'MATERIALIZED';
    risk.issueId = issue.id;
    risk.materializationDate = new Date();

    // Stop monitoring this risk
    this.stopRiskMonitoring(risk.id);

    eventBus.publish(EVENT_TYPES.RISK_MATERIALIZED, {
      risk,
      issue
    });

    // Activate contingency plan
    await this.activateContingencyPlan(risk);
  }

  /**
   * Activate contingency plan
   */
  async activateContingencyPlan(risk) {
    console.log(`🚨 Activating contingency plan for ${risk.id}`);
    
    if (!risk.contingencyPlan) {
      console.warn(`No contingency plan for risk: ${risk.id}`);
      return;
    }

    // Execute contingency actions
    for (const action of risk.contingencyPlan.actions) {
      await agentOrchestrator.executeAgentAction(
        'RiskAgent',
        'executeContingencyAction',
        {
          risk,
          action
        }
      );
    }

    eventBus.publish(EVENT_TYPES.CONTINGENCY_ACTIVATED, {
      riskId: risk.id,
      plan: risk.contingencyPlan
    });
  }

  /**
   * Trigger crisis response
   */
  async triggerCrisisResponse(risk) {
    console.log(`🚨🚨 CRISIS: Triggering crisis response for ${risk.id}`);
    
    // Notify executive team
    eventBus.publish(EVENT_TYPES.CRISIS_ALERT, {
      risk,
      severity: 'CRITICAL',
      requiresImmediateAction: true
    });

    // Create emergency meeting
    await agentOrchestrator.executeAgentAction(
      'MeetingAgent',
      'scheduleEmergencyMeeting',
      {
        projectId: risk.projectId,
        reason: `Critical Risk: ${risk.title}`,
        attendees: ['EXECUTIVE_TEAM', 'PROJECT_MANAGER', 'RISK_OWNER']
      }
    );
  }

  /**
   * Mitigate risk
   */
  async mitigateRisk(riskId, mitigationData) {
    const risk = this.activeRisks.get(riskId);
    
    if (!risk) {
      console.error(`Risk not found: ${riskId}`);
      return;
    }

    console.log(`🛡️ Mitigating risk: ${riskId}`);
    
    risk.status = 'UNDER_MITIGATION';
    risk.mitigationStartDate = new Date();
    risk.mitigationActions = mitigationData.actions;

    // Execute mitigation actions
    for (const action of mitigationData.actions) {
      await agentOrchestrator.executeAgentAction(
        'RiskAgent',
        'executeMitigationAction',
        {
          risk,
          action
        }
      );
    }

    // Reassess risk after mitigation
    await this.reassessRisk(risk);

    eventBus.publish(EVENT_TYPES.RISK_MITIGATED, risk);
  }

  /**
   * Reassess risk after mitigation
   */
  async reassessRisk(risk) {
    const previousScore = risk.riskScore;
    
    // Use Risk Agent to reassess
    const reassessment = await agentOrchestrator.executeAgentAction(
      'RiskAgent',
      'reassessRisk',
      { risk }
    );

    risk.riskScore = reassessment.newScore;
    risk.riskLevel = this.determineRiskLevel(risk.riskScore);

    if (risk.riskScore < 20) {
      risk.status = 'MITIGATED';
      this.stopRiskMonitoring(risk.id);
    } else {
      risk.status = 'ACTIVE';
    }

    risk.history.push({
      timestamp: new Date(),
      action: 'REASSESSED',
      previousScore,
      newScore: risk.riskScore,
      effectiveness: ((previousScore - risk.riskScore) / previousScore) * 100
    });
  }

  /**
   * Close risk
   */
  closeRisk(riskId, reason) {
    const risk = this.activeRisks.get(riskId);
    
    if (!risk) {
      console.error(`Risk not found: ${riskId}`);
      return;
    }

    console.log(`✅ Closing risk: ${riskId}`);
    
    risk.status = 'CLOSED';
    risk.closureDate = new Date();
    risk.closureReason = reason;

    this.stopRiskMonitoring(riskId);

    eventBus.publish(EVENT_TYPES.RISK_CLOSED, risk);
  }

  /**
   * Stop monitoring a risk
   */
  stopRiskMonitoring(riskId) {
    const intervalId = this.monitoringIntervals.get(riskId);
    if (intervalId) {
      clearInterval(intervalId);
      this.monitoringIntervals.delete(riskId);
      console.log(`🛑 Stopped monitoring risk: ${riskId}`);
    }
  }

  /**
   * Helper: Calculate risk score
   */
  calculateRiskScore(probability, impact) {
    const probValues = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    const impactValues = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    
    return (probValues[probability] || 2) * (impactValues[impact] || 2) * 6.25;
  }

  /**
   * Helper: Determine risk level
   */
  determineRiskLevel(score) {
    if (score < 25) return 'LOW';
    if (score < 50) return 'MEDIUM';
    if (score < 75) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Helper: Get monitoring interval
   */
  getMonitoringInterval(riskLevel) {
    switch (riskLevel) {
      case 'CRITICAL': return 5 * 60 * 1000; // 5 minutes
      case 'HIGH': return 15 * 60 * 1000; // 15 minutes
      case 'MEDIUM': return 60 * 60 * 1000; // 1 hour
      case 'LOW': return 4 * 60 * 60 * 1000; // 4 hours
      default: return 60 * 60 * 1000;
    }
  }

  /**
   * Helper: Calculate review date
   */
  calculateReviewDate(riskLevel) {
    const days = {
      'CRITICAL': 1,
      'HIGH': 3,
      'MEDIUM': 7,
      'LOW': 14
    };
    
    return new Date(Date.now() + (days[riskLevel] || 7) * 24 * 60 * 60 * 1000);
  }

  /**
   * Helper: Assign risk owner
   */
  assignRiskOwner(risk) {
    // Logic to assign appropriate owner based on risk category
    const owners = {
      'FINANCIAL': 'BUDGET_MANAGER',
      'SCHEDULE': 'PROJECT_MANAGER',
      'TECHNICAL': 'TECHNICAL_LEAD',
      'VENDOR': 'PROCUREMENT_MANAGER',
      'REGULATORY': 'COMPLIANCE_OFFICER',
      'SAFETY': 'SAFETY_OFFICER'
    };
    
    return owners[risk.category] || 'PROJECT_MANAGER';
  }

  /**
   * Helper: Route for approval
   */
  async routeForApproval(risk) {
    eventBus.publish(EVENT_TYPES.APPROVAL_REQUIRED, {
      type: 'RISK_MITIGATION',
      riskId: risk.id,
      riskLevel: risk.riskLevel,
      mitigationPlan: risk.mitigationPlan
    });
  }

  /**
   * Helper: Get probability threshold
   */
  getProbabilityThreshold(riskLevel) {
    return { 'LOW': 25, 'MEDIUM': 50, 'HIGH': 75, 'CRITICAL': 90 }[riskLevel] || 50;
  }

  /**
   * Helper: Get impact threshold
   */
  getImpactThreshold(riskLevel) {
    return { 'LOW': 'MEDIUM', 'MEDIUM': 'HIGH', 'HIGH': 'CRITICAL', 'CRITICAL': 'CRITICAL' }[riskLevel] || 'HIGH';
  }

  /**
   * Identify financial risk
   */
  async identifyFinancialRisk(data) {
    await this.identifyRisk({
      projectId: data.projectId,
      category: 'FINANCIAL',
      title: 'Budget Overrun Risk',
      description: `Budget exceeded by ${data.amount}`,
      probability: 'HIGH',
      impact: 'HIGH',
      triggers: ['BUDGET_EXCEEDED']
    });
  }

  /**
   * Identify schedule risk
   */
  async identifyScheduleRisk(data) {
    await this.identifyRisk({
      projectId: data.projectId,
      category: 'SCHEDULE',
      title: 'Schedule Delay Risk',
      description: `Project delayed by ${data.days} days`,
      probability: 'HIGH',
      impact: 'MEDIUM',
      triggers: ['SCHEDULE_DELAYED']
    });
  }

  /**
   * Identify vendor risk
   */
  async identifyVendorRisk(data) {
    await this.identifyRisk({
      projectId: data.projectId,
      category: 'VENDOR',
      title: 'Vendor Performance Risk',
      description: data.description,
      probability: 'MEDIUM',
      impact: 'HIGH',
      triggers: ['VENDOR_ISSUE']
    });
  }

  /**
   * Get risk by ID
   */
  getRisk(riskId) {
    return this.activeRisks.get(riskId);
  }

  /**
   * Get all active risks
   */
  getAllActiveRisks() {
    return Array.from(this.activeRisks.values())
      .filter(r => r.status !== 'CLOSED' && r.status !== 'MITIGATED');
  }

  /**
   * Get risks by project
   */
  getRisksByProject(projectId) {
    return Array.from(this.activeRisks.values())
      .filter(r => r.projectId === projectId);
  }

  /**
   * Get risks by level
   */
  getRisksByLevel(level) {
    return Array.from(this.activeRisks.values())
      .filter(r => r.riskLevel === level && r.status === 'ACTIVE');
  }
}

// Export singleton instance
export const riskMonitoringWorkflow = new RiskMonitoringWorkflow();

// Made with Bob