/**
 * All Specialized Agents
 * 
 * Contains all 6 specialized agents:
 * 1. PlanningAgent (imported from separate file)
 * 2. BudgetIntelligenceAgent
 * 3. ProcurementCoordinationAgent
 * 4. ScheduleMonitoringAgent
 * 5. RiskComplianceAgent
 * 6. ReportingAgent
 */

import { BaseAgent } from '../BaseAgent';

/**
 * Budget Intelligence Agent
 */
export class BudgetIntelligenceAgent extends BaseAgent {
  constructor() {
    super(
      'Budget Intelligence Agent',
      'Analyzes budget utilization, variance, and forecasts',
      ['budget_analysis', 'variance_detection', 'forecast_review', 'cost_tracking']
    );
  }

  async execute(context) {
    this.status = 'running';
    const startTime = Date.now();

    try {
      const { project, budget } = this.analyzeContext(context);
      const findings = [];
      const recommendations = [];
      const risks = [];

      if (!budget) {
        findings.push(this.createFinding('no_budget', 'No Budget Assigned', 'Project does not have an assigned budget', 'high'));
        recommendations.push(this.createRecommendation('Assign Budget', 'Allocate budget to enable financial tracking', 'Create and assign project budget', 'high', 'budget'));
      } else {
        const utilization = this.calculatePercentage(budget.incurredCost, budget.budgetAmount);
        
        if (utilization > 100) {
          findings.push(this.createFinding('over_budget', 'Budget Exceeded', `Budget exceeded by ${(utilization - 100).toFixed(1)}%`, 'critical'));
          recommendations.push(this.createRecommendation('Address Budget Overrun', 'Immediate action required for budget overrun', 'Request additional funding or reduce scope', 'critical', 'budget'));
          risks.push(this.createRisk('Budget Overrun', 'Project has exceeded allocated budget', 'critical', 'high', 'high', 'Secure additional funding or implement cost controls'));
        } else if (utilization > 90) {
          findings.push(this.createFinding('budget_critical', 'Budget Critical', `Budget utilization at ${utilization.toFixed(1)}%`, 'high'));
          recommendations.push(this.createRecommendation('Monitor Budget Closely', 'Less than 10% budget remaining', 'Review remaining commitments and freeze non-essential spending', 'high', 'budget'));
        }

        if (budget.forecastCost > budget.budgetAmount * 1.1) {
          risks.push(this.createRisk('Forecast Overrun', 'Forecast indicates potential budget overrun', 'high', 'high', 'high', 'Review forecast assumptions and implement cost controls'));
        }
      }

      const result = { findings, recommendations, risks, insights: [], executionTime: Date.now() - startTime };
      this.logExecution(context, result);
      this.status = 'completed';
      return result;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }
}

/**
 * Procurement Coordination Agent
 */
export class ProcurementCoordinationAgent extends BaseAgent {
  constructor() {
    super(
      'Procurement Coordination Agent',
      'Monitors proposals, contracts, and procurement processes',
      ['proposal_tracking', 'contract_monitoring', 'procurement_analysis', 'vendor_coordination']
    );
  }

  async execute(context) {
    this.status = 'running';
    const startTime = Date.now();

    try {
      const { project, proposal, contracts } = this.analyzeContext(context);
      const findings = [];
      const recommendations = [];

      if (project.budget > 100000 && (!contracts || contracts.length === 0)) {
        findings.push(this.createFinding('no_contracts', 'No Contracts Assigned', 'High-value project without contracts', 'high'));
        recommendations.push(this.createRecommendation('Initiate Procurement', 'Start procurement process for project execution', 'Begin vendor selection and contract negotiation', 'high', 'procurement'));
      }

      if (contracts && contracts.length > 0) {
        const pendingContracts = contracts.filter(c => c.status?.toLowerCase().includes('pending'));
        if (pendingContracts.length > 0) {
          findings.push(this.createFinding('pending_contracts', 'Contracts Pending Approval', `${pendingContracts.length} contracts awaiting approval`, 'medium'));
          recommendations.push(this.createRecommendation('Expedite Contract Approvals', 'Pending contracts may delay execution', 'Follow up on contract approval process', 'medium', 'procurement'));
        }
      }

      if (proposal && proposal.status?.toLowerCase().includes('pending')) {
        findings.push(this.createFinding('pending_proposal', 'Proposal Pending', 'Project proposal awaiting approval', 'medium'));
      }

      const result = { findings, recommendations, risks: [], insights: [], executionTime: Date.now() - startTime };
      this.logExecution(context, result);
      this.status = 'completed';
      return result;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }
}

/**
 * Schedule Monitoring Agent
 */
export class ScheduleMonitoringAgent extends BaseAgent {
  constructor() {
    super(
      'Schedule Monitoring Agent',
      'Monitors project schedules, delays, and timeline adherence',
      ['delay_detection', 'timeline_monitoring', 'schedule_analysis', 'execution_health']
    );
  }

  async execute(context) {
    this.status = 'running';
    const startTime = Date.now();

    try {
      const { project } = this.analyzeContext(context);
      const findings = [];
      const recommendations = [];
      const risks = [];

      if (project.endDate && this.isDatePast(project.endDate) && !['closed', 'complete'].includes(project.status?.toLowerCase())) {
        const daysDelayed = this.daysBetween(new Date(project.endDate), new Date());
        findings.push(this.createFinding('delayed', 'Schedule Delay', `Project is ${daysDelayed} days past deadline`, 'high'));
        recommendations.push(this.createRecommendation('Address Delay', 'Project past deadline', 'Conduct schedule recovery assessment', 'high', 'schedule'));
        risks.push(this.createRisk('Schedule Overrun', `Project ${daysDelayed} days overdue`, 'high', 'high', 'high', 'Implement recovery plan or revise timeline'));
      }

      const result = { findings, recommendations, risks, insights: [], executionTime: Date.now() - startTime };
      this.logExecution(context, result);
      this.status = 'completed';
      return result;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }
}

/**
 * Risk & Compliance Agent
 */
export class RiskComplianceAgent extends BaseAgent {
  constructor() {
    super(
      'Risk & Compliance Agent',
      'Monitors governance, compliance, and risk factors',
      ['governance_review', 'compliance_checks', 'risk_scoring', 'policy_validation']
    );
  }

  async execute(context) {
    this.status = 'running';
    const startTime = Date.now();

    try {
      const { project } = this.analyzeContext(context);
      const findings = [];
      const recommendations = [];
      const risks = [];

      if (!project.projectManager) {
        findings.push(this.createFinding('no_pm', 'No Project Manager', 'Project lacks assigned project manager', 'critical'));
        recommendations.push(this.createRecommendation('Assign Project Manager', 'Critical governance gap', 'Assign qualified project manager immediately', 'critical', 'governance'));
        risks.push(this.createRisk('Governance Gap', 'No project manager assigned', 'critical', 'high', 'high', 'Assign project manager'));
      }

      if (project.riskScore >= 70) {
        findings.push(this.createFinding('high_risk', 'High Risk Score', `Risk score is ${project.riskScore}/100`, 'high'));
        recommendations.push(this.createRecommendation('Mitigate Risks', 'High risk score detected', 'Conduct risk assessment and implement mitigation strategies', 'high', 'risk'));
      }

      const result = { findings, recommendations, risks, insights: [], executionTime: Date.now() - startTime };
      this.logExecution(context, result);
      this.status = 'completed';
      return result;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }
}

/**
 * Reporting Agent
 */
export class ReportingAgent extends BaseAgent {
  constructor() {
    super(
      'Reporting Agent',
      'Generates executive summaries and decision support reports',
      ['executive_summaries', 'portfolio_reports', 'decision_support', 'insight_generation']
    );
  }

  async execute(context) {
    this.status = 'running';
    const startTime = Date.now();

    try {
      const { project, agentFindings } = this.analyzeContext(context);
      const insights = [];

      // Aggregate insights from other agents
      const totalFindings = Object.values(agentFindings).reduce((sum, findings) => sum + (findings?.findings?.length || 0), 0);
      
      insights.push(this.createInsight(
        'Multi-Agent Analysis Complete',
        `Analysis generated ${totalFindings} findings across all agents`,
        'observation',
        'high'
      ));

      if (project.healthScore >= 80) {
        insights.push(this.createInsight('Healthy Project', 'Project demonstrates strong health indicators', 'observation', 'high'));
      } else if (project.healthScore < 60) {
        insights.push(this.createInsight('Project Needs Attention', 'Project health score indicates areas requiring improvement', 'alert', 'high'));
      }

      const result = { findings: [], recommendations: [], risks: [], insights, executionTime: Date.now() - startTime };
      this.logExecution(context, result);
      this.status = 'completed';
      return result;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }
}

// Export all agents
export { PlanningAgent } from './PlanningAgent';

// Made with Bob
