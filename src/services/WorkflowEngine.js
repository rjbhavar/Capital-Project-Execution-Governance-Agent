/**
 * Workflow Engine
 * 
 * Orchestrates complex business processes through configurable workflows.
 * Supports sequential, parallel, and conditional execution.
 */

import { eventBus, EventTypes } from './EventBus';

/**
 * Workflow Step
 */
class WorkflowStep {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type; // action, decision, parallel, wait
    this.action = config.action;
    this.condition = config.condition;
    this.nextSteps = config.nextSteps || [];
    this.onSuccess = config.onSuccess;
    this.onFailure = config.onFailure;
    this.retryConfig = config.retryConfig || { maxRetries: 3, delayMs: 1000 };
  }

  async execute(context) {
    if (this.condition && !this.condition(context)) {
      return { skipped: true, reason: 'Condition not met' };
    }

    try {
      const result = await this.action(context);
      if (this.onSuccess) await this.onSuccess(result, context);
      return { success: true, result };
    } catch (error) {
      if (this.onFailure) await this.onFailure(error, context);
      throw error;
    }
  }
}

/**
 * Workflow Definition
 */
class Workflow {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.steps = config.steps.map(step => new WorkflowStep(step));
    this.startStep = config.startStep;
    this.version = config.version || '1.0.0';
  }

  getStep(stepId) {
    return this.steps.find(s => s.id === stepId);
  }
}

/**
 * Workflow Instance
 */
class WorkflowInstance {
  constructor(workflow, context) {
    this.id = `wf-${Date.now()}-${Math.random()}`;
    this.workflow = workflow;
    this.context = context;
    this.status = 'pending'; // pending, running, completed, failed, cancelled
    this.currentStep = null;
    this.completedSteps = [];
    this.failedSteps = [];
    this.startTime = null;
    this.endTime = null;
    this.error = null;
  }

  async execute() {
    this.status = 'running';
    this.startTime = new Date();

    await eventBus.publish(EventTypes.WORKFLOW_STARTED, {
      workflowId: this.workflow.id,
      instanceId: this.id,
      context: this.context
    });

    try {
      await this.executeStep(this.workflow.startStep);
      this.status = 'completed';
      this.endTime = new Date();

      await eventBus.publish(EventTypes.WORKFLOW_COMPLETED, {
        workflowId: this.workflow.id,
        instanceId: this.id,
        duration: this.endTime - this.startTime,
        completedSteps: this.completedSteps.length
      });

      return { success: true, context: this.context };
    } catch (error) {
      this.status = 'failed';
      this.endTime = new Date();
      this.error = error;

      await eventBus.publish(EventTypes.WORKFLOW_FAILED, {
        workflowId: this.workflow.id,
        instanceId: this.id,
        error: error.message,
        failedStep: this.currentStep
      });

      throw error;
    }
  }

  async executeStep(stepId) {
    const step = this.workflow.getStep(stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    this.currentStep = stepId;

    try {
      const result = await this.executeWithRetry(step);
      
      if (!result.skipped) {
        this.completedSteps.push({
          stepId,
          result: result.result,
          timestamp: new Date()
        });

        // Update context with step result
        this.context[`step_${stepId}_result`] = result.result;
      }

      // Execute next steps
      if (step.nextSteps.length > 0) {
        for (const nextStepId of step.nextSteps) {
          await this.executeStep(nextStepId);
        }
      }

      return result;
    } catch (error) {
      this.failedSteps.push({
        stepId,
        error: error.message,
        timestamp: new Date()
      });
      throw error;
    }
  }

  async executeWithRetry(step) {
    const { maxRetries, delayMs } = step.retryConfig;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await step.execute(this.context);
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await this.delay(delayMs * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  cancel() {
    this.status = 'cancelled';
    this.endTime = new Date();
  }
}

/**
 * Workflow Engine
 */
class WorkflowEngine {
  constructor() {
    this.workflows = new Map();
    this.instances = new Map();
  }

  /**
   * Register a workflow
   */
  registerWorkflow(config) {
    const workflow = new Workflow(config);
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  /**
   * Start a workflow
   */
  async startWorkflow(workflowId, context = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const instance = new WorkflowInstance(workflow, context);
    this.instances.set(instance.id, instance);

    try {
      const result = await instance.execute();
      return { instanceId: instance.id, ...result };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get workflow instance
   */
  getInstance(instanceId) {
    return this.instances.get(instanceId);
  }

  /**
   * Cancel workflow instance
   */
  cancelInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.cancel();
    }
  }

  /**
   * Get all workflows
   */
  getWorkflows() {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId) {
    return this.workflows.get(workflowId);
  }
}

/**
 * Pre-defined Workflows
 */

/**
 * Capital Project Lifecycle Workflow
 */
export const CapitalProjectLifecycleWorkflow = {
  id: 'capital-project-lifecycle',
  name: 'Capital Project Lifecycle',
  description: 'End-to-end capital project execution workflow',
  version: '1.0.0',
  startStep: 'funding_approved',
  steps: [
    {
      id: 'funding_approved',
      name: 'Funding Approved',
      type: 'action',
      action: async (context) => {
        console.log('Step: Funding Approved');
        return { fundingApproved: true };
      },
      nextSteps: ['create_project']
    },
    {
      id: 'create_project',
      name: 'Create Project',
      type: 'action',
      action: async (context) => {
        console.log('Step: Create Project');
        // Call OSLC service to create project
        return { projectCreated: true, projectId: `proj-${Date.now()}` };
      },
      nextSteps: ['generate_cost_codes']
    },
    {
      id: 'generate_cost_codes',
      name: 'Generate Cost Codes',
      type: 'action',
      action: async (context) => {
        console.log('Step: Generate Cost Codes');
        return { costCodesGenerated: true };
      },
      nextSteps: ['create_budget']
    },
    {
      id: 'create_budget',
      name: 'Create Budget',
      type: 'action',
      action: async (context) => {
        console.log('Step: Create Budget');
        return { budgetCreated: true };
      },
      nextSteps: ['allocate_funding']
    },
    {
      id: 'allocate_funding',
      name: 'Allocate Funding',
      type: 'action',
      action: async (context) => {
        console.log('Step: Allocate Funding');
        return { fundingAllocated: true };
      },
      nextSteps: ['generate_milestones']
    },
    {
      id: 'generate_milestones',
      name: 'Generate Milestones',
      type: 'action',
      action: async (context) => {
        console.log('Step: Generate Milestones');
        return { milestonesGenerated: true };
      },
      nextSteps: ['generate_tasks']
    },
    {
      id: 'generate_tasks',
      name: 'Generate Tasks',
      type: 'action',
      action: async (context) => {
        console.log('Step: Generate Tasks');
        return { tasksGenerated: true };
      },
      nextSteps: ['create_procurement_packages']
    },
    {
      id: 'create_procurement_packages',
      name: 'Create Procurement Packages',
      type: 'action',
      action: async (context) => {
        console.log('Step: Create Procurement Packages');
        return { procurementPackagesCreated: true };
      },
      nextSteps: ['generate_rfq_rfp']
    },
    {
      id: 'generate_rfq_rfp',
      name: 'Generate RFQ/RFP',
      type: 'action',
      action: async (context) => {
        console.log('Step: Generate RFQ/RFP');
        return { rfqRfpGenerated: true };
      },
      nextSteps: ['vendor_recommendations']
    },
    {
      id: 'vendor_recommendations',
      name: 'Vendor Recommendations',
      type: 'action',
      action: async (context) => {
        console.log('Step: Vendor Recommendations');
        return { vendorRecommendations: [] };
      },
      nextSteps: ['create_contracts']
    },
    {
      id: 'create_contracts',
      name: 'Create Contracts',
      type: 'action',
      action: async (context) => {
        console.log('Step: Create Contracts');
        return { contractsCreated: true };
      },
      nextSteps: ['generate_purchase_orders']
    },
    {
      id: 'generate_purchase_orders',
      name: 'Generate Purchase Orders',
      type: 'action',
      action: async (context) => {
        console.log('Step: Generate Purchase Orders');
        return { purchaseOrdersGenerated: true };
      },
      nextSteps: ['monitor_execution']
    },
    {
      id: 'monitor_execution',
      name: 'Monitor Execution',
      type: 'action',
      action: async (context) => {
        console.log('Step: Monitor Execution');
        return { monitoringActive: true };
      },
      nextSteps: ['project_closeout']
    },
    {
      id: 'project_closeout',
      name: 'Project Closeout',
      type: 'action',
      action: async (context) => {
        console.log('Step: Project Closeout');
        return { projectClosed: true };
      },
      nextSteps: []
    }
  ]
};

/**
 * Invoice Approval Workflow
 */
export const InvoiceApprovalWorkflow = {
  id: 'invoice-approval',
  name: 'Invoice Approval Workflow',
  description: 'Automated invoice approval process',
  version: '1.0.0',
  startStep: 'receive_invoice',
  steps: [
    {
      id: 'receive_invoice',
      name: 'Receive Invoice',
      type: 'action',
      action: async (context) => {
        return { invoiceReceived: true };
      },
      nextSteps: ['validate_invoice']
    },
    {
      id: 'validate_invoice',
      name: 'Validate Invoice',
      type: 'action',
      action: async (context) => {
        return { valid: true };
      },
      nextSteps: ['match_po']
    },
    {
      id: 'match_po',
      name: 'Match Purchase Order',
      type: 'action',
      action: async (context) => {
        return { matched: true };
      },
      nextSteps: ['approve_invoice']
    },
    {
      id: 'approve_invoice',
      name: 'Approve Invoice',
      type: 'action',
      action: async (context) => {
        return { approved: true };
      },
      nextSteps: ['schedule_payment']
    },
    {
      id: 'schedule_payment',
      name: 'Schedule Payment',
      type: 'action',
      action: async (context) => {
        return { paymentScheduled: true };
      },
      nextSteps: []
    }
  ]
};

/**
 * Change Request Workflow
 */
export const ChangeRequestWorkflow = {
  id: 'change-request',
  name: 'Change Request Workflow',
  description: 'Change request approval and implementation',
  version: '1.0.0',
  startStep: 'submit_change',
  steps: [
    {
      id: 'submit_change',
      name: 'Submit Change Request',
      type: 'action',
      action: async (context) => {
        return { changeSubmitted: true };
      },
      nextSteps: ['assess_impact']
    },
    {
      id: 'assess_impact',
      name: 'Assess Impact',
      type: 'action',
      action: async (context) => {
        return { impactAssessed: true, costImpact: 0, scheduleImpact: 0 };
      },
      nextSteps: ['approval_routing']
    },
    {
      id: 'approval_routing',
      name: 'Approval Routing',
      type: 'action',
      action: async (context) => {
        return { routingComplete: true };
      },
      nextSteps: ['implement_change']
    },
    {
      id: 'implement_change',
      name: 'Implement Change',
      type: 'action',
      action: async (context) => {
        return { changeImplemented: true };
      },
      nextSteps: []
    }
  ]
};

// Export singleton instance
export const workflowEngine = new WorkflowEngine();

// Register pre-defined workflows
workflowEngine.registerWorkflow(CapitalProjectLifecycleWorkflow);
workflowEngine.registerWorkflow(InvoiceApprovalWorkflow);
workflowEngine.registerWorkflow(ChangeRequestWorkflow);

export default workflowEngine;

// Made with Bob
