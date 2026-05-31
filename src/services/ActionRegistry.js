/**
 * ActionRegistry - Maps agent actions to actual MREF OSLC operations
 *
 * This registry defines the real MREF operations available and how to execute them.
 * NO SIMULATION - only real MREF API mappings.
 */

import apiClient from './api';

/**
 * Action Type Definitions
 * Each action type maps to a specific MREF OSLC endpoint and operation
 */
export const ACTION_TYPES = {
  // Project Operations
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  UPDATE_PROJECT_STATUS: 'UPDATE_PROJECT_STATUS',
  UPDATE_PROJECT_DATES: 'UPDATE_PROJECT_DATES',
  
  // Budget Operations
  UPDATE_BUDGET: 'UPDATE_BUDGET',
  ADJUST_BUDGET_LINE: 'ADJUST_BUDGET_LINE',
  TRANSFER_BUDGET: 'TRANSFER_BUDGET',
  
  // Proposal Operations
  CREATE_PROPOSAL: 'CREATE_PROPOSAL',
  ROUTE_PROPOSAL: 'ROUTE_PROPOSAL',
  APPROVE_PROPOSAL: 'APPROVE_PROPOSAL',
  
  // Contract Operations
  UPDATE_CONTRACT: 'UPDATE_CONTRACT',
  EXTEND_CONTRACT: 'EXTEND_CONTRACT',
  
  // Milestone Operations
  UPDATE_MILESTONE: 'UPDATE_MILESTONE',
  ADD_MILESTONE: 'ADD_MILESTONE',
  
  // Risk & Issue Operations
  CREATE_RISK: 'CREATE_RISK',
  ESCALATE_ISSUE: 'ESCALATE_ISSUE',
  
  // Reporting Operations
  GENERATE_REPORT: 'GENERATE_REPORT',
  SEND_NOTIFICATION: 'SEND_NOTIFICATION'
};

/**
 * MREF OSLC Endpoint Registry
 * Maps action types to OSLC endpoints and HTTP methods
 */
export const OSLC_ENDPOINTS = {
  [ACTION_TYPES.UPDATE_PROJECT]: {
    method: 'PUT',
    endpoint: (projectId) => `/oslc/so/cstCapitalProjectRS/${projectId}`,
    fields: ['spi:triBudgetRevisedFR', 'spi:triProjectStatusCL', 'spi:triEndDateDA', 'spi:triChangeReasonTX']
  },
  
  [ACTION_TYPES.UPDATE_PROJECT_STATUS]: {
    method: 'PUT',
    endpoint: (projectId) => `/oslc/so/cstCapitalProjectRS/${projectId}`,
    fields: ['spi:triProjectStatusCL', 'spi:triChangeReasonTX']
  },
  
  [ACTION_TYPES.UPDATE_PROJECT_DATES]: {
    method: 'PUT',
    endpoint: (projectId) => `/oslc/so/cstCapitalProjectRS/${projectId}`,
    fields: ['spi:triStartDateDA', 'spi:triEndDateDA', 'spi:triChangeReasonTX']
  },
  
  [ACTION_TYPES.UPDATE_BUDGET]: {
    method: 'PUT',
    endpoint: (projectId) => `/oslc/so/cstCapitalProjectRS/${projectId}`,
    fields: ['spi:triBudgetRevisedFR', 'spi:triChangeReasonTX']
  },
  
  [ACTION_TYPES.ADJUST_BUDGET_LINE]: {
    method: 'PUT',
    endpoint: (budgetLineId) => `/oslc/so/cstBudgetLineRS/${budgetLineId}`,
    fields: ['spi:triAmountFR', 'spi:triReasonTX']
  },
  
  [ACTION_TYPES.CREATE_PROPOSAL]: {
    method: 'POST',
    endpoint: () => `/oslc/so/cstProposalRS`,
    fields: ['spi:triNameTX', 'spi:triProjectID', 'spi:triAmountFR', 'spi:triDescriptionTX', 'spi:triVendorTX']
  },
  
  [ACTION_TYPES.ROUTE_PROPOSAL]: {
    method: 'PUT',
    endpoint: (proposalId) => `/oslc/so/cstProposalRS/${proposalId}`,
    fields: ['spi:triStatusCL', 'spi:triApproverID', 'spi:triPriorityCL']
  },
  
  [ACTION_TYPES.UPDATE_CONTRACT]: {
    method: 'PUT',
    endpoint: (contractId) => `/oslc/so/cstContractRS/${contractId}`,
    fields: ['spi:triAmountFR', 'spi:triEndDateDA', 'spi:triChangeReasonTX']
  },
  
  [ACTION_TYPES.UPDATE_MILESTONE]: {
    method: 'PUT',
    endpoint: (milestoneId) => `/oslc/so/cstMilestoneRS/${milestoneId}`,
    fields: ['spi:triTargetDateDA', 'spi:triReasonTX', 'spi:triStatusCL']
  },
  
  [ACTION_TYPES.CREATE_RISK]: {
    method: 'POST',
    endpoint: () => `/oslc/so/cstRiskRS`,
    fields: ['spi:triProjectID', 'spi:triRiskTypeCL', 'spi:triSeverityCL', 'spi:triDescriptionTX']
  },
  
  [ACTION_TYPES.ESCALATE_ISSUE]: {
    method: 'POST',
    endpoint: () => `/oslc/so/cstIssueRS`,
    fields: ['spi:triProjectID', 'spi:triIssueTypeCL', 'spi:triAssignedToID', 'spi:triPriorityCL', 'spi:triDescriptionTX']
  }
};

/**
 * ActionRegistry Class
 * Manages action execution against real MREF OSLC APIs
 */
class ActionRegistry {
  constructor() {
    this.executionMode = 'real'; // 'real' or 'demo'
  }

  /**
   * Set execution mode
   * @param {string} mode - 'real' for MREF execution, 'demo' for simulation
   */
  setExecutionMode(mode) {
    this.executionMode = mode;
    console.log(`ActionRegistry: Execution mode set to ${mode}`);
  }

  /**
   * Check if action type is supported
   */
  isActionSupported(actionType) {
    return OSLC_ENDPOINTS.hasOwnProperty(actionType);
  }

  /**
   * Get OSLC configuration for action type
   */
  getOSLCConfig(actionType) {
    return OSLC_ENDPOINTS[actionType];
  }

  /**
   * Build OSLC request body from action payload
   */
  buildRequestBody(actionType, payload) {
    const config = this.getOSLCConfig(actionType);
    if (!config) {
      throw new Error(`Unsupported action type: ${actionType}`);
    }

    const body = {};
    
    // Map payload to OSLC fields based on action type
    switch (actionType) {
      case ACTION_TYPES.UPDATE_PROJECT:
        if (payload.newBudget) body['spi:triBudgetRevisedFR'] = payload.newBudget;
        if (payload.status) body['spi:triProjectStatusCL'] = payload.status;
        if (payload.endDate) body['spi:triEndDateDA'] = payload.endDate;
        if (payload.reason) body['spi:triChangeReasonTX'] = payload.reason;
        break;

      case ACTION_TYPES.UPDATE_BUDGET:
        body['spi:triBudgetRevisedFR'] = payload.newBudget;
        body['spi:triChangeReasonTX'] = payload.reason || 'Budget adjustment';
        break;

      case ACTION_TYPES.ADJUST_BUDGET_LINE:
        body['spi:triAmountFR'] = payload.newAmount;
        body['spi:triReasonTX'] = payload.reason || 'Budget line adjustment';
        break;

      case ACTION_TYPES.CREATE_PROPOSAL:
        body['spi:triNameTX'] = payload.title;
        body['spi:triProjectID'] = payload.projectId;
        body['spi:triAmountFR'] = payload.amount;
        body['spi:triDescriptionTX'] = payload.description;
        body['spi:triVendorTX'] = payload.vendor;
        break;

      case ACTION_TYPES.ROUTE_PROPOSAL:
        body['spi:triStatusCL'] = 'Pending Approval';
        body['spi:triApproverID'] = payload.approver;
        if (payload.priority) body['spi:triPriorityCL'] = payload.priority;
        break;

      case ACTION_TYPES.UPDATE_MILESTONE:
        if (payload.newDate) body['spi:triTargetDateDA'] = payload.newDate;
        if (payload.status) body['spi:triStatusCL'] = payload.status;
        if (payload.reason) body['spi:triReasonTX'] = payload.reason;
        break;

      case ACTION_TYPES.CREATE_RISK:
        body['spi:triProjectID'] = payload.projectId;
        body['spi:triRiskTypeCL'] = payload.riskType;
        body['spi:triSeverityCL'] = payload.severity;
        body['spi:triDescriptionTX'] = payload.description;
        break;

      case ACTION_TYPES.ESCALATE_ISSUE:
        body['spi:triProjectID'] = payload.projectId;
        body['spi:triIssueTypeCL'] = payload.issueType;
        body['spi:triAssignedToID'] = payload.escalateTo;
        body['spi:triPriorityCL'] = 'Critical';
        body['spi:triDescriptionTX'] = payload.description;
        break;

      default:
        throw new Error(`No request body builder for action type: ${actionType}`);
    }

    return body;
  }

  /**
   * Execute action against MREF OSLC API
   */
  async executeAction(action) {
    if (this.executionMode === 'demo') {
      return this.simulateExecution(action);
    }

    const { actionType, payload } = action;
    
    if (!this.isActionSupported(actionType)) {
      throw new Error(`Action type not supported: ${actionType}`);
    }

    const config = this.getOSLCConfig(actionType);
    const resourceId = this.extractResourceId(actionType, payload);
    const endpoint = config.endpoint(resourceId);
    const requestBody = this.buildRequestBody(actionType, payload);

    try {
      let response;
      
      if (config.method === 'POST') {
        response = await apiClient.post(endpoint, requestBody);
      } else if (config.method === 'PUT') {
        response = await apiClient.put(endpoint, requestBody);
      } else {
        throw new Error(`Unsupported HTTP method: ${config.method}`);
      }

      return {
        success: true,
        mrefResponse: response.data,
        updatedFields: Object.keys(requestBody),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('MREF execution error:', error);
      throw {
        success: false,
        error: error.message,
        mrefError: error.response?.data,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extract resource ID from payload based on action type
   */
  extractResourceId(actionType, payload) {
    switch (actionType) {
      case ACTION_TYPES.UPDATE_PROJECT:
      case ACTION_TYPES.UPDATE_PROJECT_STATUS:
      case ACTION_TYPES.UPDATE_PROJECT_DATES:
      case ACTION_TYPES.UPDATE_BUDGET:
        return payload.projectId;
      
      case ACTION_TYPES.ADJUST_BUDGET_LINE:
        return payload.budgetLineId;
      
      case ACTION_TYPES.ROUTE_PROPOSAL:
        return payload.proposalId;
      
      case ACTION_TYPES.UPDATE_CONTRACT:
        return payload.contractId;
      
      case ACTION_TYPES.UPDATE_MILESTONE:
        return payload.milestoneId;
      
      case ACTION_TYPES.CREATE_PROPOSAL:
      case ACTION_TYPES.CREATE_RISK:
      case ACTION_TYPES.ESCALATE_ISSUE:
        return null; // POST operations don't need resource ID
      
      default:
        return null;
    }
  }

  /**
   * Simulate execution for demo mode
   */
  async simulateExecution(action) {
    console.log('ActionRegistry: Simulating execution in demo mode', action);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    return {
      success: true,
      simulated: true,
      message: 'Action simulated successfully (demo mode)',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate action payload before execution
   */
  validatePayload(actionType, payload) {
    const config = this.getOSLCConfig(actionType);
    if (!config) {
      return { valid: false, error: `Unknown action type: ${actionType}` };
    }

    // Basic validation - ensure required fields are present
    const resourceId = this.extractResourceId(actionType, payload);
    if (config.method !== 'POST' && !resourceId) {
      return { valid: false, error: 'Missing resource ID for update operation' };
    }

    try {
      this.buildRequestBody(actionType, payload);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get list of all supported action types
   */
  getSupportedActions() {
    return Object.keys(ACTION_TYPES);
  }

  /**
   * Get action metadata
   */
  getActionMetadata(actionType) {
    const config = this.getOSLCConfig(actionType);
    if (!config) return null;

    return {
      actionType,
      method: config.method,
      fields: config.fields,
      requiresResourceId: config.method !== 'POST'
    };
  }
}

// Export singleton instance
export const actionRegistry = new ActionRegistry();

// Export for testing
export default ActionRegistry;

// Made with Bob
