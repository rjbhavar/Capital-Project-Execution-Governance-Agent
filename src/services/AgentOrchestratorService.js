/**
 * AgentOrchestratorService - Centralized agent coordination and execution
 * 
 * Responsibilities:
 * - Invoke agents in proper sequence
 * - Collect and aggregate findings
 * - Create execution plans
 * - Coordinate agent actions
 * - Manage agent lifecycle
 */

import { agentOrchestrator } from '../agents/AgentOrchestrator';
import { agentMemory } from './AgentMemoryService';
import { agentActionExecutor } from './agentActions';

class AgentOrchestratorService {
  constructor() {
    this.isRunning = false;
    this.currentExecution = null;
  }

  /**
   * Execute all agents for a project
   * @param {Object} project - Project data
   * @param {Object} options - Execution options
   * @returns {Object} Aggregated results
   */
  async executeAgentsForProject(project, options = {}) {
    if (this.isRunning) {
      throw new Error('Agent execution already in progress');
    }

    this.isRunning = true;
    const executionId = `exec-${Date.now()}`;
    
    try {
      console.log(`AgentOrchestrator: Starting execution ${executionId} for project ${project.id}`);
      
      this.currentExecution = {
        id: executionId,
        projectId: project.id,
        startTime: Date.now(),
        status: 'running'
      };

      // Execute agents through the orchestrator
      const results = options.parallel 
        ? await agentOrchestrator.executeAgentsParallel(project)
        : await agentOrchestrator.executeAgentsSequential(project);

      // Store execution in memory
      await agentMemory.storeExecution(executionId, {
        projectId: project.id,
        results,
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.currentExecution.startTime
      });

      // Extract and store findings
      const findings = this.extractFindings(results);
      await agentMemory.storeFindings(project.id, findings);

      // Extract and store recommendations
      const recommendations = this.extractRecommendations(results);
      await agentMemory.storeRecommendations(project.id, recommendations);

      // Create actions from recommendations
      const actions = await this.createActionsFromRecommendations(project, recommendations);

      this.currentExecution.status = 'completed';
      this.isRunning = false;

      return {
        executionId,
        projectId: project.id,
        findings,
        recommendations,
        actions,
        agentResults: results,
        duration: Date.now() - this.currentExecution.startTime
      };

    } catch (error) {
      console.error('AgentOrchestrator: Execution failed', error);
      this.currentExecution.status = 'failed';
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Execute agents for multiple projects (portfolio analysis)
   */
  async executeAgentsForPortfolio(projects, options = {}) {
    const results = [];
    
    for (const project of projects) {
      try {
        const result = await this.executeAgentsForProject(project, options);
        results.push(result);
      } catch (error) {
        console.error(`Failed to execute agents for project ${project.id}:`, error);
        results.push({
          projectId: project.id,
          error: error.message,
          status: 'failed'
        });
      }
    }

    // Generate portfolio-level insights
    const portfolioInsights = this.generatePortfolioInsights(results);

    return {
      projectResults: results,
      portfolioInsights,
      totalProjects: projects.length,
      successfulExecutions: results.filter(r => !r.error).length
    };
  }

  /**
   * Extract findings from agent results
   */
  extractFindings(agentResults) {
    const findings = [];

    for (const [agentName, result] of Object.entries(agentResults)) {
      if (result.findings && Array.isArray(result.findings)) {
        findings.push(...result.findings.map(f => ({
          ...f,
          agentName,
          timestamp: new Date().toISOString()
        })));
      }
    }

    // Sort by severity
    return findings.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Extract recommendations from agent results
   */
  extractRecommendations(agentResults) {
    const recommendations = [];

    for (const [agentName, result] of Object.entries(agentResults)) {
      if (result.recommendations && Array.isArray(result.recommendations)) {
        recommendations.push(...result.recommendations.map(r => ({
          ...r,
          agentName,
          timestamp: new Date().toISOString()
        })));
      }
    }

    // Sort by priority and confidence
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Create executable actions from recommendations
   */
  async createActionsFromRecommendations(project, recommendations) {
    const actions = [];

    for (const recommendation of recommendations) {
      if (recommendation.action && recommendation.action.actionType) {
        try {
          const action = agentActionExecutor.createAction({
            agentName: recommendation.agentName,
            actionType: recommendation.action.actionType,
            title: recommendation.title,
            description: recommendation.description,
            projectId: project.id,
            projectName: project.name,
            payload: recommendation.action.payload,
            impact: recommendation.impact,
            confidence: recommendation.confidence,
            priority: recommendation.priority
          });

          actions.push(action);
        } catch (error) {
          console.error('Failed to create action from recommendation:', error);
        }
      }
    }

    return actions;
  }

  /**
   * Generate portfolio-level insights
   */
  generatePortfolioInsights(projectResults) {
    const insights = {
      totalFindings: 0,
      criticalFindings: 0,
      highPriorityRecommendations: 0,
      totalActions: 0,
      commonIssues: [],
      trends: []
    };

    // Aggregate metrics
    for (const result of projectResults) {
      if (result.findings) {
        insights.totalFindings += result.findings.length;
        insights.criticalFindings += result.findings.filter(f => f.severity === 'critical').length;
      }
      if (result.recommendations) {
        insights.highPriorityRecommendations += result.recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length;
      }
      if (result.actions) {
        insights.totalActions += result.actions.length;
      }
    }

    // Identify common issues
    const issueTypes = {};
    for (const result of projectResults) {
      if (result.findings) {
        for (const finding of result.findings) {
          issueTypes[finding.type] = (issueTypes[finding.type] || 0) + 1;
        }
      }
    }

    insights.commonIssues = Object.entries(issueTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    return insights;
  }

  /**
   * Get current execution status
   */
  getExecutionStatus() {
    return this.currentExecution;
  }

  /**
   * Cancel current execution
   */
  cancelExecution() {
    if (this.isRunning && this.currentExecution) {
      this.currentExecution.status = 'cancelled';
      this.isRunning = false;
      return true;
    }
    return false;
  }

  /**
   * Get execution history for a project
   */
  async getProjectExecutionHistory(projectId) {
    return await agentMemory.getExecutionHistory(projectId);
  }

  /**
   * Get latest findings for a project
   */
  async getProjectFindings(projectId) {
    return await agentMemory.getFindings(projectId);
  }

  /**
   * Get latest recommendations for a project
   */
  async getProjectRecommendations(projectId) {
    return await agentMemory.getRecommendations(projectId);
  }

  /**
   * Execute specific agent for a project
   */
  async executeSpecificAgent(agentName, project) {
    console.log(`AgentOrchestrator: Executing ${agentName} for project ${project.id}`);
    
    const agent = agentOrchestrator.agents.find(a => a.name === agentName);
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    const result = await agent.execute(project);
    
    // Store in memory
    await agentMemory.storeAgentResult(project.id, agentName, result);
    
    return result;
  }

  /**
   * Get agent status and metrics
   */
  getAgentMetrics() {
    return agentOrchestrator.agents.map(agent => ({
      name: agent.name,
      description: agent.description,
      executionCount: agent.executionCount || 0,
      lastExecution: agent.lastExecution || null,
      averageConfidence: agent.averageConfidence || 0
    }));
  }

  /**
   * Schedule periodic agent execution
   */
  schedulePeriodicExecution(projectId, intervalMinutes = 60) {
    // TODO: Implement scheduling logic
    console.log(`Scheduling periodic execution for project ${projectId} every ${intervalMinutes} minutes`);
  }
}

// Export singleton instance
export const agentOrchestratorService = new AgentOrchestratorService();

export default AgentOrchestratorService;

// Made with Bob
