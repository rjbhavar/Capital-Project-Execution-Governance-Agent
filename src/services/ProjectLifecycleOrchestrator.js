/**
 * Project Lifecycle Orchestrator
 * 
 * Orchestrates the complete end-to-end project lifecycle from funding approval to closeout.
 * Coordinates multiple agents to execute workflows autonomously with human-in-the-loop approvals.
 */

import { eventBus, EVENT_TYPES } from './EventBus';
import { workflowEngine } from './WorkflowEngine';
import { agentOrchestrator } from './AgentOrchestratorService';
import { 
  capitalProjectService,
  budgetService,
  fundingService,
  costCodeService,
  procurementService,
  contractService,
  riskService,
  meetingService,
  taskService
} from './oslc';

class ProjectLifecycleOrchestrator {
  constructor() {
    this.activeLifecycles = new Map();
    this.lifecycleStages = [
      'FUNDING_APPROVAL',
      'PROJECT_CREATION',
      'BUDGET_SETUP',
      'COST_CODE_GENERATION',
      'PROCUREMENT_PLANNING',
      'CONTRACT_EXECUTION',
      'EXECUTION_MONITORING',
      'RISK_MANAGEMENT',
      'PROJECT_CLOSEOUT'
    ];
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for funding approval to trigger lifecycle
    eventBus.subscribe(EVENT_TYPES.FUNDING_APPROVED, (data) => {
      this.startProjectLifecycle(data);
    });

    // Listen for stage completions
    eventBus.subscribe(EVENT_TYPES.WORKFLOW_COMPLETED, (data) => {
      this.handleStageCompletion(data);
    });

    // Listen for approval decisions
    eventBus.subscribe(EVENT_TYPES.APPROVAL_DECISION, (data) => {
      this.handleApprovalDecision(data);
    });
  }

  /**
   * Start complete project lifecycle
   */
  async startProjectLifecycle(fundingData) {
    const lifecycleId = `lifecycle-${Date.now()}`;
    
    const lifecycle = {
      id: lifecycleId,
      fundingId: fundingData.fundingId,
      currentStage: 'FUNDING_APPROVAL',
      stages: {},
      startTime: new Date(),
      status: 'IN_PROGRESS',
      projectId: null,
      budgetId: null,
      contractIds: [],
      metadata: fundingData
    };

    this.activeLifecycles.set(lifecycleId, lifecycle);

    console.log(`🚀 Starting project lifecycle: ${lifecycleId}`);
    
    // Execute lifecycle stages sequentially
    try {
      await this.executeFundingApprovalStage(lifecycle);
      await this.executeProjectCreationStage(lifecycle);
      await this.executeBudgetSetupStage(lifecycle);
      await this.executeCostCodeGenerationStage(lifecycle);
      await this.executeProcurementPlanningStage(lifecycle);
      await this.executeContractExecutionStage(lifecycle);
      await this.executeExecutionMonitoringStage(lifecycle);
      await this.executeRiskManagementStage(lifecycle);
      await this.executeProjectCloseoutStage(lifecycle);

      lifecycle.status = 'COMPLETED';
      lifecycle.endTime = new Date();
      
      eventBus.publish(EVENT_TYPES.LIFECYCLE_COMPLETED, lifecycle);
      console.log(`✅ Project lifecycle completed: ${lifecycleId}`);
      
    } catch (error) {
      lifecycle.status = 'FAILED';
      lifecycle.error = error.message;
      
      eventBus.publish(EVENT_TYPES.LIFECYCLE_FAILED, lifecycle);
      console.error(`❌ Project lifecycle failed: ${lifecycleId}`, error);
    }

    return lifecycle;
  }

  /**
   * Stage 1: Funding Approval
   */
  async executeFundingApprovalStage(lifecycle) {
    console.log('📋 Stage 1: Funding Approval');
    
    lifecycle.currentStage = 'FUNDING_APPROVAL';
    lifecycle.stages.fundingApproval = {
      status: 'IN_PROGRESS',
      startTime: new Date()
    };

    // Create funding request
    const funding = await fundingService.create({
      projectName: lifecycle.metadata.projectName,
      requestedAmount: lifecycle.metadata.amount,
      justification: lifecycle.metadata.justification,
      priority: lifecycle.metadata.priority,
      status: 'APPROVED' // Already approved in this scenario
    });

    lifecycle.fundingId = funding.id;
    lifecycle.stages.fundingApproval.status = 'COMPLETED';
    lifecycle.stages.fundingApproval.endTime = new Date();
    lifecycle.stages.fundingApproval.fundingId = funding.id;

    eventBus.publish(EVENT_TYPES.STAGE_COMPLETED, {
      lifecycleId: lifecycle.id,
      stage: 'FUNDING_APPROVAL',
      data: funding
    });

    return funding;
  }

  /**
   * Stage 2: Project Creation
   */
  async executeProjectCreationStage(lifecycle) {
    console.log('🏗️ Stage 2: Project Creation');
    
    lifecycle.currentStage = 'PROJECT_CREATION';
    lifecycle.stages.projectCreation = {
      status: 'IN_PROGRESS',
      startTime: new Date()
    };

    // Use Planning Agent to create project
    const projectData = {
      name: lifecycle.metadata.projectName,
      description: lifecycle.metadata.description,
      fundingId: lifecycle.fundingId,
      estimatedCost: lifecycle.metadata.amount,
      priority: lifecycle.metadata.priority,
      region: lifecycle.metadata.region,
      building: lifecycle.metadata.building,
      status: 'PLANNING'
    };

    const project = await capitalProjectService.create(projectData);
    lifecycle.projectId = project.id;

    // Generate project plan using Planning Agent
    await agentOrchestrator.executeAgentAction('PlanningAgent', 'generateProjectPlan', {
      projectId: project.id,
      scope: lifecycle.metadata.scope
    });

    lifecycle.stages.projectCreation.status = 'COMPLETED';
    lifecycle.stages.projectCreation.endTime = new Date();
    lifecycle.stages.projectCreation.projectId = project.id;

    eventBus.publish(EVENT_TYPES.PROJECT_CREATED, project);
    eventBus.publish(EVENT_TYPES.STAGE_COMPLETED, {
      lifecycleId: lifecycle.id,
      stage: 'PROJECT_CREATION',
      data: project
    });

    return project;
  }

  /**
   * Stage 3: Budget Setup
   */
  async executeBudgetSetupStage(lifecycle) {
    console.log('💰 Stage 3: Budget Setup');
    
    lifecycle.currentStage = 'BUDGET_SETUP';
    lifecycle.stages.budgetSetup = {
      status: 'IN_PROGRESS',
      startTime: new Date()
    };

    // Use Budget Intelligence Agent to create budget
    const budget = await budgetService.create({
      projectId: lifecycle.projectId,
      budgetAmount: lifecycle.metadata.amount,
      estimatedCost: lifecycle.metadata.amount,
      fiscalYear: new Date().getFullYear(),
      status: 'DRAFT'
    });

    lifecycle.budgetId = budget.id;

    // Generate budget breakdown using Budget Intelligence Agent
    await agentOrchestrator.executeAgentAction('BudgetIntelligenceAgent', 'generateBudgetBreakdown', {
      budgetId: budget.id,
      projectId: lifecycle.projectId
    });

    lifecycle.stages.budgetSetup.status = 'COMPLETED';
    lifecycle.stages.budgetSetup.endTime = new Date();
    lifecycle.stages.budgetSetup.budgetId = budget.id;

    eventBus.publish(EVENT_TYPES.BUDGET_CREATED, budget);
    eventBus.publish(EVENT_TYPES.STAGE_COMPLETED, {
      lifecycleId: lifecycle.id,
      stage: 'BUDGET_SETUP',
      data: budget
    });

    return budget;
  }

  /**
   * Stage 4: Cost Code Generation
   */
  async executeCostCodeGenerationStage(lifecycle) {
    console.log('🔢 Stage 4: Cost Code Generation');
    
    lifecycle.currentStage = 'COST_CODE_GENERATION';
    lifecycle.stages.costCodeGeneration = {
      status: 'IN_PROGRESS',
      startTime: new Date()
    };

    // Use Cost Code Agent to generate cost codes
    const costCodes = await agentOrchestrator.executeAgentAction('CostCodeAgent', 'generateCostCodes', {
      projectId: lifecycle.projectId,
      budgetId: lifecycle.budgetId
    });

    lifecycle.stages.costCodeGeneration.status = 'COMPLETED';
    lifecycle.stages.costCodeGeneration.endTime = new Date();
    lifecycle.stages.costCodeGeneration.costCodes = costCodes;

    eventBus.publish(EVENT_TYPES.STAGE_COMPLETED, {
      lifecycleId: lifecycle.id,
      stage: 'COST_CODE_GENERATION',
      data: costCodes
    });

    return costCodes;
  }

  /**
   * Stage 5: Procurement Planning
   */
  async executeProcurementPlanningStage(lifecycle) {
    console.log('📦 Stage 5: Procurement Planning');
    
    lifecycle.currentStage = 'PROCUREMENT_PLANNING';
    lifecycle.stages.procurementPlanning = {
      status: 'IN_PROGRESS',
      startTime: new Date()
    };

    // Use Procurement Agent to create procurement packages
    const procurementPackages = await agentOrchestrator.executeAgentAction('ProcurementAgent', 'createProcurementPackages', {
      projectId: lifecycle.projectId,
      budgetId: lifecycle.budgetId
    });

    // Generate RFQs/RFPs
    const rfqs = await agentOrchestrator.executeAgentAction('RFQAgent', 'generateRFQs', {
      projectId: lifecycle.projectId,
      packages: procurementPackages
    });

    lifecycle.stages.procurementPlanning.status = 'COMPLETED';
    lifecycle.stages.procurementPlanning.endTime = new Date();
    lifecycle.stages.procurementPlanning.packages = procurementPackages;
    lifecycle.stages.procurementPlanning.rfqs = rfqs;

    eventBus.publish(EVENT_TYPES.STAGE_COMPLETED, {
      lifecycleId: lifecycle.id,
      stage: 'PROCUREMENT_PLANNING',
      data: { procurementPackages, rfqs }
    });

    return { procurementPackages, rfqs };
  }

  /**
   * Stage 6: Contract Execution
   */
  async executeContractExecutionStage(lifecycle) {
    console.log('📝 Stage 6: Contract Execution');
    
    lifecycle.currentStage = 'CONTRACT_EXECUTION';
    lifecycle.stages.contractExecution = {
      status: 'IN_PROGRESS',
      startTime: new Date()
    };

    // Use Contract Agent to create contracts
    const contracts = await agentOrchestrator.executeAgentAction('ContractAgent', 'createContracts', {
      projectId: lifecycle.projectId,
      rfqs: lifecycle.stages.procurementPlanning.rfqs
    });

    lifecycle.contractIds = contracts.map(c => c.id);

    // Wait for contract approvals (human-in-the-loop)
    await this.waitForApprovals(lifecycle, 'CONTRACT_APPROVAL', contracts);

    lifecycle.stages.contractExecution.status = 'COMPLETED';
    lifecycle.stages.contractExecution.endTime = new Date();
    lifecycle.stages.contractExecution.contracts = contracts;

    eventBus.publish(EVENT_TYPES.STAGE_COMPLETED, {
      lifecycleId: lifecycle.id,
      stage: 'CONTRACT_EXECUTION',
      data: contracts
    });

    return contracts;
  }

  /**
   * Stage 7: Execution Monitoring
   */
  async executeExecutionMonitoringStage(lifecycle) {
    console.log('👁️ Stage 7: Execution Monitoring');
    
    lifecycle.currentStage = 'EXECUTION_MONITORING';
    lifecycle.stages.executionMonitoring = {
      status: 'IN_PROGRESS',
      startTime: new Date()
    };

    // Start monitoring workflows
    await agentOrchestrator.executeAgentAction('ScheduleAgent', 'createProjectSchedule', {
      projectId: lifecycle.projectId
    });

    await agentOrchestrator.executeAgentAction('TaskAgent', 'generateTasks', {
      projectId: lifecycle.projectId
    });

    // Setup recurring meetings
    await agentOrchestrator.executeAgentAction('MeetingAgent', 'scheduleRecurringMeetings', {
      projectId: lifecycle.projectId,
      frequency: 'WEEKLY'
    });

    lifecycle.stages.executionMonitoring.status = 'COMPLETED';
    lifecycle.stages.executionMonitoring.endTime = new Date();

    eventBus.publish(EVENT_TYPES.STAGE_COMPLETED, {
      lifecycleId: lifecycle.id,
      stage: 'EXECUTION_MONITORING',
      data: { monitoring: 'ACTIVE' }
    });

    return { monitoring: 'ACTIVE' };
  }

  /**
   * Stage 8: Risk Management
   */
  async executeRiskManagementStage(lifecycle) {
    console.log('⚠️ Stage 8: Risk Management');
    
    lifecycle.currentStage = 'RISK_MANAGEMENT';
    lifecycle.stages.riskManagement = {
      status: 'IN_PROGRESS',
      startTime: new Date()
    };

    // Use Risk Agent to identify and monitor risks
    const risks = await agentOrchestrator.executeAgentAction('RiskAgent', 'identifyRisks', {
      projectId: lifecycle.projectId
    });

    // Setup risk monitoring
    await agentOrchestrator.executeAgentAction('RiskAgent', 'setupRiskMonitoring', {
      projectId: lifecycle.projectId,
      risks: risks
    });

    lifecycle.stages.riskManagement.status = 'COMPLETED';
    lifecycle.stages.riskManagement.endTime = new Date();
    lifecycle.stages.riskManagement.risks = risks;

    eventBus.publish(EVENT_TYPES.STAGE_COMPLETED, {
      lifecycleId: lifecycle.id,
      stage: 'RISK_MANAGEMENT',
      data: risks
    });

    return risks;
  }

  /**
   * Stage 9: Project Closeout
   */
  async executeProjectCloseoutStage(lifecycle) {
    console.log('🏁 Stage 9: Project Closeout');
    
    lifecycle.currentStage = 'PROJECT_CLOSEOUT';
    lifecycle.stages.projectCloseout = {
      status: 'IN_PROGRESS',
      startTime: new Date()
    };

    // Use Closeout Agent to finalize project
    const closeoutReport = await agentOrchestrator.executeAgentAction('CloseoutAgent', 'generateCloseoutReport', {
      projectId: lifecycle.projectId
    });

    // Archive project documents
    await agentOrchestrator.executeAgentAction('DocumentIntelligenceAgent', 'archiveProjectDocuments', {
      projectId: lifecycle.projectId
    });

    // Update project status
    await capitalProjectService.update(lifecycle.projectId, {
      status: 'CLOSED',
      closeoutDate: new Date()
    });

    lifecycle.stages.projectCloseout.status = 'COMPLETED';
    lifecycle.stages.projectCloseout.endTime = new Date();
    lifecycle.stages.projectCloseout.closeoutReport = closeoutReport;

    eventBus.publish(EVENT_TYPES.PROJECT_CLOSED, {
      projectId: lifecycle.projectId,
      closeoutReport
    });

    eventBus.publish(EVENT_TYPES.STAGE_COMPLETED, {
      lifecycleId: lifecycle.id,
      stage: 'PROJECT_CLOSEOUT',
      data: closeoutReport
    });

    return closeoutReport;
  }

  /**
   * Wait for human approvals
   */
  async waitForApprovals(lifecycle, approvalType, items) {
    return new Promise((resolve) => {
      const approvalId = `approval-${Date.now()}`;
      
      // Publish approval request
      eventBus.publish(EVENT_TYPES.APPROVAL_REQUIRED, {
        approvalId,
        lifecycleId: lifecycle.id,
        type: approvalType,
        items,
        requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Listen for approval decision
      const unsubscribe = eventBus.subscribe(EVENT_TYPES.APPROVAL_DECISION, (data) => {
        if (data.approvalId === approvalId) {
          unsubscribe();
          resolve(data.decision);
        }
      });
    });
  }

  /**
   * Handle stage completion
   */
  handleStageCompletion(data) {
    const lifecycle = this.activeLifecycles.get(data.lifecycleId);
    if (lifecycle) {
      console.log(`✅ Stage completed: ${data.stage}`);
    }
  }

  /**
   * Handle approval decision
   */
  handleApprovalDecision(data) {
    console.log(`📋 Approval decision: ${data.decision} for ${data.approvalId}`);
  }

  /**
   * Get lifecycle status
   */
  getLifecycleStatus(lifecycleId) {
    return this.activeLifecycles.get(lifecycleId);
  }

  /**
   * Get all active lifecycles
   */
  getAllActiveLifecycles() {
    return Array.from(this.activeLifecycles.values());
  }
}

// Export singleton instance
export const projectLifecycleOrchestrator = new ProjectLifecycleOrchestrator();

// Made with Bob