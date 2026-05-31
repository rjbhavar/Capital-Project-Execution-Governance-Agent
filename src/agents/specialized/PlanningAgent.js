/**
 * Project Planning Agent
 * 
 * Responsibilities:
 * - Milestone generation
 * - Schedule validation
 * - Execution tracking
 * - Timeline analysis
 */

import { BaseAgent } from '../BaseAgent';

export class PlanningAgent extends BaseAgent {
  constructor() {
    super(
      'Planning Agent',
      'Analyzes project planning, schedules, and execution tracking',
      ['milestone_analysis', 'schedule_validation', 'timeline_tracking', 'execution_monitoring']
    );
  }

  async execute(context) {
    this.status = 'running';
    const startTime = Date.now();

    try {
      const analysis = this.analyzeContext(context);
      const findings = [];
      const recommendations = [];
      const risks = [];
      const insights = [];

      // Analyze project timeline
      const timelineAnalysis = this.analyzeTimeline(analysis.project);
      findings.push(...timelineAnalysis.findings);
      recommendations.push(...timelineAnalysis.recommendations);
      risks.push(...timelineAnalysis.risks);

      // Analyze milestones
      const milestoneAnalysis = this.analyzeMilestones(analysis.project);
      findings.push(...milestoneAnalysis.findings);
      recommendations.push(...milestoneAnalysis.recommendations);

      // Analyze execution status
      const executionAnalysis = this.analyzeExecution(analysis.project, analysis.historical);
      findings.push(...executionAnalysis.findings);
      insights.push(...executionAnalysis.insights);

      // Generate planning insights
      const planningInsights = this.generatePlanningInsights(analysis);
      insights.push(...planningInsights);

      const result = {
        findings,
        recommendations,
        risks,
        insights,
        executionTime: Date.now() - startTime
      };

      this.logExecution(context, result);
      this.status = 'completed';

      return result;

    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  analyzeTimeline(project) {
    const findings = [];
    const recommendations = [];
    const risks = [];

    // Check if dates are defined
    if (!project.startDate || !project.endDate) {
      findings.push(this.createFinding(
        'missing_dates',
        'Missing Project Dates',
        'Project does not have defined start or end dates',
        'high'
      ));
      recommendations.push(this.createRecommendation(
        'Define Project Timeline',
        'Establish clear start and end dates for project planning and tracking',
        'Schedule planning meeting to define project timeline',
        'high',
        'planning'
      ));
      return { findings, recommendations, risks };
    }

    const now = new Date();
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const daysRemaining = this.daysBetween(now, endDate);
    const totalDuration = this.daysBetween(startDate, endDate);
    const daysElapsed = this.daysBetween(startDate, now);

    // Project not started
    if (startDate > now) {
      findings.push(this.createFinding(
        'not_started',
        'Project Not Yet Started',
        `Project is scheduled to start in ${this.daysBetween(now, startDate)} days`,
        'low',
        { daysUntilStart: this.daysBetween(now, startDate) }
      ));
    }

    // Project delayed
    if (endDate < now && !['closed', 'complete', 'completed'].includes(project.status?.toLowerCase())) {
      const daysDelayed = Math.abs(daysRemaining);
      const severity = daysDelayed > 90 ? 'critical' : daysDelayed > 30 ? 'high' : 'medium';
      
      findings.push(this.createFinding(
        'delayed',
        'Project Delayed',
        `Project is ${daysDelayed} days past deadline`,
        severity,
        { daysDelayed }
      ));

      recommendations.push(this.createRecommendation(
        'Address Project Delay',
        `Project is ${daysDelayed} days overdue. Conduct recovery assessment and update timeline`,
        'Schedule project recovery meeting and revise completion date',
        severity === 'critical' ? 'critical' : 'high',
        'planning'
      ));

      risks.push(this.createRisk(
        'Schedule Overrun',
        `Project timeline has exceeded planned completion by ${daysDelayed} days`,
        severity,
        'high',
        'high',
        'Implement accelerated execution plan or revise timeline expectations'
      ));
    }

    // Approaching deadline
    if (daysRemaining > 0 && daysRemaining <= 30 && project.status?.toLowerCase() === 'in progress') {
      findings.push(this.createFinding(
        'approaching_deadline',
        'Approaching Deadline',
        `Project deadline is in ${daysRemaining} days`,
        'medium',
        { daysRemaining }
      ));

      recommendations.push(this.createRecommendation(
        'Monitor Completion Activities',
        `With ${daysRemaining} days remaining, ensure all completion activities are on track`,
        'Review remaining tasks and resource allocation',
        'high',
        'planning'
      ));
    }

    return { findings, recommendations, risks };
  }

  analyzeMilestones(project) {
    const findings = [];
    const recommendations = [];

    // Check project phase progression
    const phase = project.phase?.toLowerCase() || '';
    const status = project.status?.toLowerCase() || '';

    if (phase === 'planning' && status === 'in progress') {
      findings.push(this.createFinding(
        'phase_mismatch',
        'Phase-Status Mismatch',
        'Project is in progress but still in planning phase',
        'medium'
      ));
      recommendations.push(this.createRecommendation(
        'Update Project Phase',
        'Project status indicates execution has started. Update phase to reflect current state',
        'Review and update project phase to match execution status',
        'medium',
        'planning'
      ));
    }

    // Milestone recommendations based on phase
    if (phase === 'planning') {
      recommendations.push(this.createRecommendation(
        'Define Execution Milestones',
        'Establish clear milestones for project execution phases',
        'Create milestone schedule with deliverables and dates',
        'medium',
        'planning'
      ));
    }

    return { findings, recommendations };
  }

  analyzeExecution(project, historical) {
    const findings = [];
    const insights = [];

    // Execution health based on status
    const status = project.status?.toLowerCase() || '';
    
    if (status.includes('revision')) {
      findings.push(this.createFinding(
        'under_revision',
        'Project Under Revision',
        'Project is currently under revision. Execution may be paused',
        'medium'
      ));
    }

    if (status.includes('hold')) {
      findings.push(this.createFinding(
        'on_hold',
        'Project On Hold',
        'Project execution is on hold. Identify blockers and resolution path',
        'high'
      ));
    }

    // Historical trend analysis
    if (historical && historical.riskHistory && historical.riskHistory.length > 1) {
      const recentHistory = historical.riskHistory.slice(-3);
      const healthTrend = this.analyzeTrend(recentHistory.map(h => h.healthScore));
      
      if (healthTrend === 'declining') {
        insights.push(this.createInsight(
          'Declining Health Trend',
          'Project health score has been declining over recent executions',
          'alert',
          'high'
        ));
      } else if (healthTrend === 'improving') {
        insights.push(this.createInsight(
          'Improving Health Trend',
          'Project health score shows positive improvement trend',
          'observation',
          'high'
        ));
      }
    }

    return { findings, insights };
  }

  generatePlanningInsights(analysis) {
    const insights = [];
    const { project } = analysis;

    // Timeline efficiency insight
    if (project.startDate && project.endDate) {
      const duration = this.daysBetween(new Date(project.startDate), new Date(project.endDate));
      if (duration < 30) {
        insights.push(this.createInsight(
          'Short Timeline',
          `Project has a short timeline of ${duration} days. Ensure adequate resource allocation`,
          'observation',
          'medium'
        ));
      } else if (duration > 365) {
        insights.push(this.createInsight(
          'Long Timeline',
          `Project spans ${Math.floor(duration / 30)} months. Consider phase-based milestone tracking`,
          'recommendation',
          'medium'
        ));
      }
    }

    return insights;
  }

  analyzeTrend(values) {
    if (values.length < 2) return 'stable';
    
    const recent = values[values.length - 1];
    const previous = values[values.length - 2];
    
    if (recent > previous + 5) return 'improving';
    if (recent < previous - 5) return 'declining';
    return 'stable';
  }
}

// Made with Bob
