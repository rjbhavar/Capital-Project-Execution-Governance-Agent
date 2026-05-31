/**
 * Agent Orchestrator
 * 
 * The brain of the multi-agent platform.
 * Coordinates all specialized agents, aggregates outputs, and generates executive briefings.
 * 
 * Architecture:
 * - Receives project context
 * - Coordinates agent execution
 * - Collects agent outputs
 * - Aggregates recommendations
 * - Generates executive briefing
 * - Manages agent memory
 */

import {
  PlanningAgent,
  BudgetIntelligenceAgent,
  ProcurementCoordinationAgent,
  ScheduleMonitoringAgent,
  RiskComplianceAgent,
  ReportingAgent
} from './specialized/AllAgents';
import { AgentMemory } from './AgentMemory';

/**
 * Agent Orchestrator Class
 */
export class AgentOrchestrator {
  constructor() {
    // Initialize specialized agents
    this.agents = {
      planning: new PlanningAgent(),
      budget: new BudgetIntelligenceAgent(),
      procurement: new ProcurementCoordinationAgent(),
      schedule: new ScheduleMonitoringAgent(),
      risk: new RiskComplianceAgent(),
      reporting: new ReportingAgent()
    };

    // Initialize agent memory
    this.memory = new AgentMemory();

    // Execution state
    this.executionState = {
      status: 'idle', // idle, running, completed, error
      currentAgent: null,
      startTime: null,
      endTime: null,
      results: {}
    };
  }

  /**
   * Execute all agents for a project
   * @param {Object} project - Project data with all linked resources
   * @param {Object} options - Execution options
   * @returns {Object} Orchestrated results
   */
  async executeAgents(project, options = {}) {
    const {
      enableMemory = true,
      parallel = false,
      agentFilter = null
    } = options;

    // Initialize execution
    this.executionState.status = 'running';
    this.executionState.startTime = new Date();
    this.executionState.results = {};

    try {
      // Load historical context from memory
      const historicalContext = enableMemory 
        ? await this.memory.getProjectContext(project.id)
        : null;

      // Build shared context
      const sharedContext = this.buildSharedContext(project, historicalContext);

      // Determine which agents to run
      const agentsToRun = agentFilter 
        ? Object.keys(this.agents).filter(key => agentFilter.includes(key))
        : Object.keys(this.agents);

      // Execute agents
      let agentResults;
      if (parallel) {
        agentResults = await this.executeAgentsParallel(agentsToRun, sharedContext);
      } else {
        agentResults = await this.executeAgentsSequential(agentsToRun, sharedContext);
      }

      // Aggregate results
      const aggregatedResults = this.aggregateResults(agentResults, sharedContext);

      // Generate executive briefing
      const executiveBriefing = this.generateExecutiveBriefing(aggregatedResults, sharedContext);

      // Store in memory
      if (enableMemory) {
        await this.memory.storeExecution(project.id, {
          timestamp: new Date(),
          agentResults,
          aggregatedResults,
          executiveBriefing
        });
      }

      // Update execution state
      this.executionState.status = 'completed';
      this.executionState.endTime = new Date();
      this.executionState.results = aggregatedResults;

      return {
        success: true,
        projectId: project.id,
        projectName: project.name,
        executionTime: this.executionState.endTime - this.executionState.startTime,
        agentResults,
        aggregatedResults,
        executiveBriefing,
        sharedContext
      };

    } catch (error) {
      this.executionState.status = 'error';
      this.executionState.endTime = new Date();
      
      console.error('Agent orchestration error:', error);
      
      return {
        success: false,
        error: error.message,
        projectId: project.id
      };
    }
  }

  /**
   * Execute agents sequentially (pipeline)
   */
  async executeAgentsSequential(agentKeys, sharedContext) {
    const results = {};

    for (const agentKey of agentKeys) {
      this.executionState.currentAgent = agentKey;
      
      const agent = this.agents[agentKey];
      const agentStartTime = Date.now();

      try {
        // Execute agent with shared context
        const agentResult = await agent.execute(sharedContext);
        
        // Update shared context with agent findings
        sharedContext.agentFindings[agentKey] = agentResult.findings;
        
        results[agentKey] = {
          ...agentResult,
          executionTime: Date.now() - agentStartTime,
          status: 'completed'
        };
      } catch (error) {
        results[agentKey] = {
          status: 'error',
          error: error.message,
          executionTime: Date.now() - agentStartTime
        };
      }
    }

    this.executionState.currentAgent = null;
    return results;
  }

  /**
   * Execute agents in parallel
   */
  async executeAgentsParallel(agentKeys, sharedContext) {
    const agentPromises = agentKeys.map(async (agentKey) => {
      const agent = this.agents[agentKey];
      const agentStartTime = Date.now();

      try {
        const agentResult = await agent.execute(sharedContext);
        return {
          agentKey,
          result: {
            ...agentResult,
            executionTime: Date.now() - agentStartTime,
            status: 'completed'
          }
        };
      } catch (error) {
        return {
          agentKey,
          result: {
            status: 'error',
            error: error.message,
            executionTime: Date.now() - agentStartTime
          }
        };
      }
    });

    const agentOutputs = await Promise.all(agentPromises);
    
    // Convert array to object
    const results = {};
    agentOutputs.forEach(({ agentKey, result }) => {
      results[agentKey] = result;
    });

    return results;
  }

  /**
   * Build shared context for all agents
   */
  buildSharedContext(project, historicalContext) {
    return {
      // Project data
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        phase: project.phase,
        classification: project.classification,
        type: project.type,
        projectManager: project.projectManager,
        building: project.building,
        city: project.city,
        state: project.state,
        country: project.country,
        startDate: project.startDate,
        endDate: project.endDate,
        timeline: project.timeline,
        budget: project.budget,
        spent: project.spent,
        riskScore: project.riskScore,
        healthScore: project.healthScore
      },

      // Linked resources
      budget: project.hasBudget ? project.budgetDetails : null,
      proposal: project.hasProposal ? project.proposalDetails : null,
      contracts: project.hasContracts ? project.contractDetails : [],
      payments: project.hasPayments ? project.paymentDetails : [],

      // Historical context
      historical: historicalContext || {
        previousFindings: [],
        previousRecommendations: [],
        riskHistory: []
      },

      // Shared findings (populated by agents during execution)
      agentFindings: {},

      // Execution metadata
      executionTimestamp: new Date(),
      orchestratorVersion: '1.0.0'
    };
  }

  /**
   * Aggregate results from all agents
   */
  aggregateResults(agentResults, sharedContext) {
    const aggregated = {
      // Collect all findings
      findings: [],
      
      // Collect all recommendations
      recommendations: [],
      
      // Collect all risks
      risks: [],
      
      // Collect all insights
      insights: [],
      
      // Agent execution summary
      agentSummary: {},
      
      // Cross-agent insights
      crossAgentInsights: []
    };

    // Process each agent's results
    Object.entries(agentResults).forEach(([agentKey, result]) => {
      if (result.status === 'completed') {
        // Collect findings
        if (result.findings) {
          aggregated.findings.push(...result.findings.map(f => ({
            ...f,
            source: agentKey,
            timestamp: new Date()
          })));
        }

        // Collect recommendations
        if (result.recommendations) {
          aggregated.recommendations.push(...result.recommendations.map(r => ({
            ...r,
            source: agentKey,
            timestamp: new Date()
          })));
        }

        // Collect risks
        if (result.risks) {
          aggregated.risks.push(...result.risks.map(r => ({
            ...r,
            source: agentKey,
            timestamp: new Date()
          })));
        }

        // Collect insights
        if (result.insights) {
          aggregated.insights.push(...result.insights.map(i => ({
            ...i,
            source: agentKey,
            timestamp: new Date()
          })));
        }

        // Agent summary
        aggregated.agentSummary[agentKey] = {
          status: result.status,
          executionTime: result.executionTime,
          findingsCount: result.findings?.length || 0,
          recommendationsCount: result.recommendations?.length || 0,
          risksCount: result.risks?.length || 0
        };
      } else {
        aggregated.agentSummary[agentKey] = {
          status: result.status,
          error: result.error
        };
      }
    });

    // Generate cross-agent insights
    aggregated.crossAgentInsights = this.generateCrossAgentInsights(aggregated, sharedContext);

    // Sort by priority
    aggregated.recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    });

    return aggregated;
  }

  /**
   * Generate cross-agent insights
   */
  generateCrossAgentInsights(aggregated, sharedContext) {
    const insights = [];

    // Budget + Risk correlation
    const budgetRisks = aggregated.risks.filter(r => r.source === 'budget');
    const riskRisks = aggregated.risks.filter(r => r.source === 'risk');
    if (budgetRisks.length > 0 && riskRisks.length > 0) {
      insights.push({
        type: 'correlation',
        title: 'Budget and Risk Correlation',
        description: 'Budget concerns detected by Budget Agent correlate with risk factors identified by Risk Agent',
        agents: ['budget', 'risk'],
        severity: 'high'
      });
    }

    // Schedule + Procurement correlation
    const scheduleDelays = aggregated.findings.filter(f => 
      f.source === 'schedule' && f.type === 'delay'
    );
    const procurementIssues = aggregated.findings.filter(f => 
      f.source === 'procurement' && f.type === 'bottleneck'
    );
    if (scheduleDelays.length > 0 && procurementIssues.length > 0) {
      insights.push({
        type: 'correlation',
        title: 'Schedule and Procurement Correlation',
        description: 'Schedule delays may be related to procurement bottlenecks',
        agents: ['schedule', 'procurement'],
        severity: 'medium'
      });
    }

    // Multi-agent consensus
    const criticalRecommendations = aggregated.recommendations.filter(r => r.priority === 'critical');
    if (criticalRecommendations.length >= 3) {
      insights.push({
        type: 'consensus',
        title: 'Multi-Agent Critical Consensus',
        description: `${criticalRecommendations.length} agents have identified critical issues requiring immediate attention`,
        agents: [...new Set(criticalRecommendations.map(r => r.source))],
        severity: 'critical'
      });
    }

    return insights;
  }

  /**
   * Generate executive briefing
   */
  generateExecutiveBriefing(aggregated, sharedContext) {
    const { project } = sharedContext;

    // Count critical items
    const criticalRecommendations = aggregated.recommendations.filter(r => r.priority === 'critical').length;
    const highRisks = aggregated.risks.filter(r => r.severity === 'high' || r.severity === 'critical').length;
    const totalFindings = aggregated.findings.length;

    // Determine overall status
    let overallStatus = 'healthy';
    let statusColor = 'green';
    if (criticalRecommendations > 0 || highRisks > 2) {
      overallStatus = 'critical';
      statusColor = 'red';
    } else if (highRisks > 0 || criticalRecommendations > 0) {
      overallStatus = 'attention_required';
      statusColor = 'yellow';
    }

    // Generate summary text
    let summaryText = `Multi-agent analysis of ${project.name} completed. `;
    
    if (overallStatus === 'critical') {
      summaryText += `CRITICAL: ${criticalRecommendations} critical issue${criticalRecommendations > 1 ? 's' : ''} identified requiring immediate action. `;
    } else if (overallStatus === 'attention_required') {
      summaryText += `ATTENTION: ${highRisks} high-risk factor${highRisks > 1 ? 's' : ''} detected. `;
    } else {
      summaryText += `Project is performing within expected parameters. `;
    }

    summaryText += `${totalFindings} finding${totalFindings > 1 ? 's' : ''} generated across ${Object.keys(aggregated.agentSummary).length} specialized agents.`;

    // Top recommendations
    const topRecommendations = aggregated.recommendations.slice(0, 5);

    // Key metrics
    const keyMetrics = {
      healthScore: project.healthScore,
      riskScore: project.riskScore,
      budgetUtilization: sharedContext.budget 
        ? (sharedContext.budget.incurredCost / sharedContext.budget.budgetAmount * 100).toFixed(1)
        : 'N/A',
      agentsExecuted: Object.keys(aggregated.agentSummary).length,
      findingsGenerated: totalFindings,
      recommendationsGenerated: aggregated.recommendations.length
    };

    return {
      projectId: project.id,
      projectName: project.name,
      overallStatus,
      statusColor,
      summaryText,
      keyMetrics,
      topRecommendations,
      crossAgentInsights: aggregated.crossAgentInsights,
      agentSummary: aggregated.agentSummary,
      generatedAt: new Date()
    };
  }

  /**
   * Get current execution state
   */
  getExecutionState() {
    return { ...this.executionState };
  }

  /**
   * Execute agents for multiple projects (portfolio analysis)
   */
  async executePortfolioAnalysis(projects, options = {}) {
    const results = [];

    for (const project of projects) {
      const result = await this.executeAgents(project, options);
      results.push(result);
    }

    // Generate portfolio-level insights
    const portfolioInsights = this.generatePortfolioInsights(results);

    return {
      success: true,
      projectCount: projects.length,
      results,
      portfolioInsights
    };
  }

  /**
   * Generate portfolio-level insights
   */
  generatePortfolioInsights(projectResults) {
    const insights = {
      totalProjects: projectResults.length,
      criticalProjects: projectResults.filter(r => 
        r.executiveBriefing?.overallStatus === 'critical'
      ).length,
      attentionProjects: projectResults.filter(r => 
        r.executiveBriefing?.overallStatus === 'attention_required'
      ).length,
      healthyProjects: projectResults.filter(r => 
        r.executiveBriefing?.overallStatus === 'healthy'
      ).length,
      totalRecommendations: projectResults.reduce((sum, r) => 
        sum + (r.aggregatedResults?.recommendations?.length || 0), 0
      ),
      totalRisks: projectResults.reduce((sum, r) => 
        sum + (r.aggregatedResults?.risks?.length || 0), 0
      )
    };

    return insights;
  }
}

// Singleton instance
let orchestratorInstance = null;

/**
 * Get orchestrator instance (singleton)
 */
export const getOrchestrator = () => {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator();
  }
  return orchestratorInstance;
};

/**
 * Execute agents for a project (convenience function)
 */
export const executeAgentsForProject = async (project, options) => {
  const orchestrator = getOrchestrator();
  return await orchestrator.executeAgents(project, options);
};

/**
 * Execute portfolio analysis (convenience function)
 */
export const executePortfolioAnalysis = async (projects, options) => {
  const orchestrator = getOrchestrator();
  return await orchestrator.executePortfolioAnalysis(projects, options);
};

// Made with Bob
