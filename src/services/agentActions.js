/**
 * Agent Action Framework
 *
 * Enables agents to execute actions in MREF through OSLC API
 * Supports approve/reject workflow for agent recommendations
 * Integrates with ActionRegistry for real MREF execution
 */

import { actionRegistry } from './ActionRegistry';

/**
 * Agent Action Types - imported from ActionRegistry
 */
export const ACTION_TYPES = actionRegistry.getSupportedActions().reduce((acc, type) => {
  acc[type] = type;
  return acc;
}, {});

/**
 * Agent Action Status
 */
export const ACTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Agent Action Class
 */
export class AgentAction {
  constructor({
    id,
    agentName,
    actionType,
    title,
    description,
    projectId,
    projectName,
    payload,
    impact,
    confidence,
    priority = 'medium'
  }) {
    this.id = id || `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.agentName = agentName;
    this.actionType = actionType;
    this.title = title;
    this.description = description;
    this.projectId = projectId;
    this.projectName = projectName;
    this.payload = payload;
    this.impact = impact;
    this.confidence = confidence;
    this.priority = priority;
    this.status = ACTION_STATUS.PENDING;
    this.createdAt = new Date().toISOString();
    this.approvedAt = null;
    this.executedAt = null;
    this.completedAt = null;
    this.approvedBy = null;
    this.executionResult = null;
    this.error = null;
  }

  approve(userId) {
    this.status = ACTION_STATUS.APPROVED;
    this.approvedAt = new Date().toISOString();
    this.approvedBy = userId;
  }

  reject(userId, reason) {
    this.status = ACTION_STATUS.REJECTED;
    this.approvedAt = new Date().toISOString();
    this.approvedBy = userId;
    this.error = reason;
  }

  startExecution() {
    this.status = ACTION_STATUS.EXECUTING;
    this.executedAt = new Date().toISOString();
  }

  complete(result) {
    this.status = ACTION_STATUS.COMPLETED;
    this.completedAt = new Date().toISOString();
    this.executionResult = result;
  }

  fail(error) {
    this.status = ACTION_STATUS.FAILED;
    this.completedAt = new Date().toISOString();
    this.error = error;
  }
}

/**
 * Agent Action Executor
 */
export class AgentActionExecutor {
  constructor() {
    this.actions = new Map();
    this.executionHistory = [];
    this.loadFromStorage();
  }

  /**
   * Create a new agent action
   */
  createAction(actionData) {
    const action = new AgentAction(actionData);
    this.actions.set(action.id, action);
    this.saveToStorage();
    return action;
  }

  /**
   * Get action by ID
   */
  getAction(actionId) {
    return this.actions.get(actionId);
  }

  /**
   * Get all pending actions
   */
  getPendingActions() {
    return Array.from(this.actions.values())
      .filter(action => action.status === ACTION_STATUS.PENDING)
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  /**
   * Get actions by project
   */
  getProjectActions(projectId) {
    return Array.from(this.actions.values())
      .filter(action => action.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get actions by agent
   */
  getAgentActions(agentName) {
    return Array.from(this.actions.values())
      .filter(action => action.agentName === agentName)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Approve an action
   */
  async approveAction(actionId, userId) {
    const action = this.getAction(actionId);
    if (!action) {
      throw new Error('Action not found');
    }

    if (action.status !== ACTION_STATUS.PENDING) {
      throw new Error('Action is not pending');
    }

    action.approve(userId);
    this.saveToStorage();

    // Execute the action
    try {
      await this.executeAction(action);
    } catch (error) {
      console.error('Action execution failed:', error);
      action.fail(error.message);
      this.saveToStorage();
      throw error;
    }

    return action;
  }

  /**
   * Reject an action
   */
  rejectAction(actionId, userId, reason) {
    const action = this.getAction(actionId);
    if (!action) {
      throw new Error('Action not found');
    }

    if (action.status !== ACTION_STATUS.PENDING) {
      throw new Error('Action is not pending');
    }

    action.reject(userId, reason);
    this.saveToStorage();
    return action;
  }

  /**
   * Execute an approved action using ActionRegistry
   */
  async executeAction(action) {
    action.startExecution();
    this.saveToStorage();

    try {
      // Use ActionRegistry for execution
      const result = await actionRegistry.executeAction(action);

      action.complete(result);
      this.executionHistory.push({
        actionId: action.id,
        timestamp: new Date().toISOString(),
        result
      });
      this.saveToStorage();

      return result;
    } catch (error) {
      action.fail(error.message);
      this.saveToStorage();
      throw error;
    }
  }

  /**
   * Set execution mode (real or demo)
   */
  setExecutionMode(mode) {
    actionRegistry.setExecutionMode(mode);
  }

  /**
   * Validate action before execution
   */
  validateAction(action) {
    return actionRegistry.validatePayload(action.actionType, action.payload);
  }

  /**
   * DEPRECATED: Legacy execution methods below
   * These are kept for backward compatibility but should not be used
   * All execution now goes through ActionRegistry
   */

  async executeUpdateProject(action) {
    console.warn('DEPRECATED: Use ActionRegistry instead');
    return await actionRegistry.executeAction(action);
  }

  async executeUpdateBudget(action) {
    console.warn('DEPRECATED: Use ActionRegistry instead');
    return await actionRegistry.executeAction(action);
  }

  async executeAdjustBudget(action) {
    console.warn('DEPRECATED: Use ActionRegistry instead');
    return await actionRegistry.executeAction(action);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      projectId,
      adjustmentAmount: adjustment.amount,
      reason: adjustment.reason,
      timestamp: new Date().toISOString()
    };
  }

  async executeCreateProposal(action) {
    const { projectId, proposalData } = action.payload;
    
    console.log('Executing CREATE_PROPOSAL:', { projectId, proposalData });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      projectId,
      proposalId: `PROP_${Date.now()}`,
      status: 'draft',
      timestamp: new Date().toISOString()
    };
  }

  async executeRouteProposal(action) {
    const { proposalId, approvers } = action.payload;
    
    console.log('Executing ROUTE_PROPOSAL:', { proposalId, approvers });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      proposalId,
      routedTo: approvers,
      status: 'pending_approval',
      timestamp: new Date().toISOString()
    };
  }

  async executeUpdateTimeline(action) {
    const { projectId, timelineChanges } = action.payload;
    
    console.log('Executing UPDATE_TIMELINE:', { projectId, timelineChanges });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      projectId,
      updatedMilestones: timelineChanges.milestones,
      timestamp: new Date().toISOString()
    };
  }

  async executeFlagRisk(action) {
    const { projectId, risk } = action.payload;
    
    console.log('Executing FLAG_RISK:', { projectId, risk });
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      projectId,
      riskId: `RISK_${Date.now()}`,
      severity: risk.severity,
      timestamp: new Date().toISOString()
    };
  }

  async executeGenerateReport(action) {
    const { reportType, parameters } = action.payload;
    
    console.log('Executing GENERATE_REPORT:', { reportType, parameters });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      reportType,
      reportId: `RPT_${Date.now()}`,
      downloadUrl: '/reports/download',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Storage Management
   */

  saveToStorage() {
    try {
      const data = {
        actions: Array.from(this.actions.entries()),
        executionHistory: this.executionHistory
      };
      localStorage.setItem('agent_actions', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save actions to storage:', error);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('agent_actions');
      if (data) {
        const parsed = JSON.parse(data);
        this.actions = new Map(parsed.actions.map(([id, action]) => [
          id,
          Object.assign(new AgentAction({}), action)
        ]));
        this.executionHistory = parsed.executionHistory || [];
      }
    } catch (error) {
      console.error('Failed to load actions from storage:', error);
    }
  }

  clearHistory() {
    this.actions.clear();
    this.executionHistory = [];
    this.saveToStorage();
  }
}

// Singleton instance
export const agentActionExecutor = new AgentActionExecutor();

// Made with Bob
