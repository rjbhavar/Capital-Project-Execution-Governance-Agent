/**
 * Change Management Workflow Service
 * 
 * Handles change requests, impact analysis, approvals, and implementation tracking
 * for capital projects with automated workflows and agent coordination.
 */

import { eventBus, EVENT_TYPES } from './EventBus';
import { workflowEngine } from './WorkflowEngine';
import { agentOrchestrator } from './AgentOrchestratorService';
import { changeRequestService, budgetService, scheduleService } from './oslc';

class ChangeManagementWorkflow {
  constructor() {
    this.activeChangeRequests = new Map();
    this.changeTypes = [
      'SCOPE_CHANGE',
      'BUDGET_CHANGE',
      'SCHEDULE_CHANGE',
      'DESIGN_CHANGE',
      'VENDOR_CHANGE',
      'RESOURCE_CHANGE'
    ];
    
    this.impactLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for change request submissions
    eventBus.subscribe(EVENT_TYPES.CHANGE_REQUEST_SUBMITTED, (data) => {
      this.processChangeRequest(data);
    });

    // Listen for approval decisions
    eventBus.subscribe(EVENT_TYPES.APPROVAL_DECISION, (data) => {
      if (data.type === 'CHANGE_REQUEST') {
        this.handleChangeApproval(data);
      }
    });

    // Listen for change implementations
    eventBus.subscribe(EVENT_TYPES.CHANGE_IMPLEMENTED, (data) => {
      this.finalizeChange(data);
    });
  }

  /**
   * Submit a new change request
   */
  async submitChangeRequest(changeData) {
    const changeId = `CR-${Date.now()}`;
    
    const changeRequest = {
      id: changeId,
      projectId: changeData.projectId,
      type: changeData.type,
      title: changeData.title,
      description: changeData.description,
      requestedBy: changeData.requestedBy,
      requestDate: new Date(),
      status: 'SUBMITTED',
      priority: changeData.priority || 'MEDIUM',
      estimatedCost: changeData.estimatedCost || 0,
      estimatedDuration: changeData.estimatedDuration || 0,
      justification: changeData.justification,
      attachments: changeData.attachments || []
    };

    this.activeChangeRequests.set(changeId, changeRequest);

    // Publish event
    eventBus.publish(EVENT_TYPES.CHANGE_REQUEST_SUBMITTED, changeRequest);

    console.log(`📝 Change request submitted: ${changeId}`);
    
    return changeRequest;
  }

  /**
   * Process change request through workflow
   */
  async processChangeRequest(changeRequest) {
    console.log(`🔄 Processing change request: ${changeRequest.id}`);
    
    try {
      // Step 1: Impact Analysis
      const impactAnalysis = await this.performImpactAnalysis(changeRequest);
      changeRequest.impactAnalysis = impactAnalysis;
      changeRequest.impactLevel = impactAnalysis.overallImpact;

      // Step 2: Cost Analysis
      const costAnalysis = await this.performCostAnalysis(changeRequest);
      changeRequest.costAnalysis = costAnalysis;

      // Step 3: Schedule Impact
      const scheduleImpact = await this.analyzeScheduleImpact(changeRequest);
      changeRequest.scheduleImpact = scheduleImpact;

      // Step 4: Risk Assessment
      const riskAssessment = await this.assessChangeRisks(changeRequest);
      changeRequest.riskAssessment = riskAssessment;

      // Step 5: Generate Recommendations
      const recommendations = await this.generateRecommendations(changeRequest);
      changeRequest.recommendations = recommendations;

      // Update status
      changeRequest.status = 'UNDER_REVIEW';
      
      // Step 6: Route for approval based on impact level
      await this.routeForApproval(changeRequest);

      eventBus.publish(EVENT_TYPES.CHANGE_REQUEST_ANALYZED, changeRequest);
      
    } catch (error) {
      changeRequest.status = 'ANALYSIS_FAILED';
      changeRequest.error = error.message;
      
      eventBus.publish(EVENT_TYPES.CHANGE_REQUEST_FAILED, changeRequest);
      console.error(`❌ Change request analysis failed: ${changeRequest.id}`, error);
    }
  }

  /**
   * Perform comprehensive impact analysis
   */
  async performImpactAnalysis(changeRequest) {
    console.log(`📊 Performing impact analysis for ${changeRequest.id}`);
    
    const analysis = {
      scopeImpact: 'NONE',
      budgetImpact: 'NONE',
      scheduleImpact: 'NONE',
      qualityImpact: 'NONE',
      resourceImpact: 'NONE',
      stakeholderImpact: 'NONE',
      overallImpact: 'LOW'
    };

    // Use Change Management Agent for analysis
    const agentAnalysis = await agentOrchestrator.executeAgentAction(
      'ChangeManagementAgent',
      'analyzeImpact',
      {
        changeRequest,
        projectId: changeRequest.projectId
      }
    );

    // Determine scope impact
    if (changeRequest.type === 'SCOPE_CHANGE') {
      analysis.scopeImpact = this.calculateImpactLevel(changeRequest.estimatedCost, 50000);
    }

    // Determine budget impact
    if (changeRequest.estimatedCost > 0) {
      analysis.budgetImpact = this.calculateImpactLevel(changeRequest.estimatedCost, 100000);
    }

    // Determine schedule impact
    if (changeRequest.estimatedDuration > 0) {
      analysis.scheduleImpact = this.calculateImpactLevel(changeRequest.estimatedDuration, 30);
    }

    // Calculate overall impact (highest of all impacts)
    const impacts = [
      analysis.scopeImpact,
      analysis.budgetImpact,
      analysis.scheduleImpact,
      analysis.qualityImpact,
      analysis.resourceImpact,
      analysis.stakeholderImpact
    ];

    analysis.overallImpact = this.getHighestImpact(impacts);
    analysis.details = agentAnalysis;

    return analysis;
  }

  /**
   * Perform cost analysis
   */
  async performCostAnalysis(changeRequest) {
    console.log(`💰 Performing cost analysis for ${changeRequest.id}`);
    
    // Use Budget Intelligence Agent
    const costAnalysis = await agentOrchestrator.executeAgentAction(
      'BudgetIntelligenceAgent',
      'analyzeChangeCost',
      {
        changeRequest,
        projectId: changeRequest.projectId
      }
    );

    return {
      directCosts: changeRequest.estimatedCost,
      indirectCosts: changeRequest.estimatedCost * 0.15, // 15% overhead
      contingency: changeRequest.estimatedCost * 0.10, // 10% contingency
      totalEstimatedCost: changeRequest.estimatedCost * 1.25,
      budgetAvailability: costAnalysis.budgetAvailability,
      fundingSource: costAnalysis.fundingSource,
      costBreakdown: costAnalysis.breakdown
    };
  }

  /**
   * Analyze schedule impact
   */
  async analyzeScheduleImpact(changeRequest) {
    console.log(`📅 Analyzing schedule impact for ${changeRequest.id}`);
    
    // Use Schedule Agent
    const scheduleAnalysis = await agentOrchestrator.executeAgentAction(
      'ScheduleAgent',
      'analyzeChangeImpact',
      {
        changeRequest,
        projectId: changeRequest.projectId
      }
    );

    return {
      delayDays: changeRequest.estimatedDuration,
      criticalPathImpact: scheduleAnalysis.criticalPathImpact,
      milestoneImpact: scheduleAnalysis.milestoneImpact,
      resourceConflicts: scheduleAnalysis.resourceConflicts,
      mitigationOptions: scheduleAnalysis.mitigationOptions
    };
  }

  /**
   * Assess change risks
   */
  async assessChangeRisks(changeRequest) {
    console.log(`⚠️ Assessing risks for ${changeRequest.id}`);
    
    // Use Risk Agent
    const riskAssessment = await agentOrchestrator.executeAgentAction(
      'RiskAgent',
      'assessChangeRisks',
      {
        changeRequest,
        projectId: changeRequest.projectId
      }
    );

    return {
      identifiedRisks: riskAssessment.risks,
      riskLevel: riskAssessment.overallRiskLevel,
      mitigationStrategies: riskAssessment.mitigationStrategies,
      contingencyPlans: riskAssessment.contingencyPlans
    };
  }

  /**
   * Generate recommendations
   */
  async generateRecommendations(changeRequest) {
    console.log(`💡 Generating recommendations for ${changeRequest.id}`);
    
    const recommendations = {
      approval: 'CONDITIONAL',
      conditions: [],
      alternatives: [],
      implementation: []
    };

    // Determine approval recommendation based on impact
    if (changeRequest.impactLevel === 'LOW') {
      recommendations.approval = 'APPROVE';
    } else if (changeRequest.impactLevel === 'CRITICAL') {
      recommendations.approval = 'REJECT';
      recommendations.conditions.push('Impact too high - consider alternatives');
    } else {
      recommendations.approval = 'CONDITIONAL';
      recommendations.conditions.push('Requires executive approval');
      recommendations.conditions.push('Budget reallocation needed');
    }

    // Add implementation recommendations
    if (changeRequest.type === 'SCOPE_CHANGE') {
      recommendations.implementation.push('Update project scope document');
      recommendations.implementation.push('Revise WBS and schedule');
      recommendations.implementation.push('Communicate to all stakeholders');
    }

    if (changeRequest.estimatedCost > 0) {
      recommendations.implementation.push('Secure additional funding');
      recommendations.implementation.push('Update budget baseline');
    }

    return recommendations;
  }

  /**
   * Route change request for approval
   */
  async routeForApproval(changeRequest) {
    console.log(`📋 Routing for approval: ${changeRequest.id}`);
    
    // Determine approval chain based on impact level
    const approvalChain = this.getApprovalChain(changeRequest.impactLevel);
    
    changeRequest.approvalChain = approvalChain;
    changeRequest.currentApprover = approvalChain[0];
    changeRequest.status = 'PENDING_APPROVAL';

    // Create approval workflow
    const workflowId = await workflowEngine.startWorkflow('CHANGE_APPROVAL', {
      changeRequestId: changeRequest.id,
      approvalChain,
      impactLevel: changeRequest.impactLevel
    });

    changeRequest.workflowId = workflowId;

    // Publish approval request
    eventBus.publish(EVENT_TYPES.APPROVAL_REQUIRED, {
      type: 'CHANGE_REQUEST',
      changeRequestId: changeRequest.id,
      approver: changeRequest.currentApprover,
      impactLevel: changeRequest.impactLevel,
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    });
  }

  /**
   * Handle change approval decision
   */
  async handleChangeApproval(approvalData) {
    const changeRequest = this.activeChangeRequests.get(approvalData.changeRequestId);
    
    if (!changeRequest) {
      console.error(`Change request not found: ${approvalData.changeRequestId}`);
      return;
    }

    console.log(`✅ Approval decision for ${changeRequest.id}: ${approvalData.decision}`);
    
    if (approvalData.decision === 'APPROVED') {
      // Move to next approver or implement
      const currentIndex = changeRequest.approvalChain.indexOf(changeRequest.currentApprover);
      
      if (currentIndex < changeRequest.approvalChain.length - 1) {
        // More approvers needed
        changeRequest.currentApprover = changeRequest.approvalChain[currentIndex + 1];
        
        eventBus.publish(EVENT_TYPES.APPROVAL_REQUIRED, {
          type: 'CHANGE_REQUEST',
          changeRequestId: changeRequest.id,
          approver: changeRequest.currentApprover
        });
      } else {
        // All approvals received - implement change
        changeRequest.status = 'APPROVED';
        await this.implementChange(changeRequest);
      }
    } else if (approvalData.decision === 'REJECTED') {
      changeRequest.status = 'REJECTED';
      changeRequest.rejectionReason = approvalData.reason;
      
      eventBus.publish(EVENT_TYPES.CHANGE_REQUEST_REJECTED, changeRequest);
    }
  }

  /**
   * Implement approved change
   */
  async implementChange(changeRequest) {
    console.log(`🚀 Implementing change: ${changeRequest.id}`);
    
    changeRequest.status = 'IMPLEMENTING';
    changeRequest.implementationStartDate = new Date();

    try {
      // Update project based on change type
      if (changeRequest.type === 'BUDGET_CHANGE') {
        await this.implementBudgetChange(changeRequest);
      }
      
      if (changeRequest.type === 'SCHEDULE_CHANGE') {
        await this.implementScheduleChange(changeRequest);
      }
      
      if (changeRequest.type === 'SCOPE_CHANGE') {
        await this.implementScopeChange(changeRequest);
      }

      // Create implementation tasks
      await agentOrchestrator.executeAgentAction(
        'TaskAgent',
        'createImplementationTasks',
        {
          changeRequest,
          projectId: changeRequest.projectId
        }
      );

      changeRequest.status = 'IMPLEMENTED';
      changeRequest.implementationDate = new Date();
      
      eventBus.publish(EVENT_TYPES.CHANGE_IMPLEMENTED, changeRequest);
      
    } catch (error) {
      changeRequest.status = 'IMPLEMENTATION_FAILED';
      changeRequest.error = error.message;
      
      eventBus.publish(EVENT_TYPES.CHANGE_IMPLEMENTATION_FAILED, changeRequest);
      console.error(`❌ Change implementation failed: ${changeRequest.id}`, error);
    }
  }

  /**
   * Implement budget change
   */
  async implementBudgetChange(changeRequest) {
    await budgetService.update(changeRequest.projectId, {
      budgetAmount: changeRequest.costAnalysis.totalEstimatedCost,
      changeOrderAmount: changeRequest.estimatedCost,
      lastModified: new Date()
    });
  }

  /**
   * Implement schedule change
   */
  async implementScheduleChange(changeRequest) {
    await scheduleService.update(changeRequest.projectId, {
      delayDays: changeRequest.estimatedDuration,
      revisedEndDate: new Date(Date.now() + changeRequest.estimatedDuration * 24 * 60 * 60 * 1000)
    });
  }

  /**
   * Implement scope change
   */
  async implementScopeChange(changeRequest) {
    // Update project scope document
    await agentOrchestrator.executeAgentAction(
      'DocumentIntelligenceAgent',
      'updateScopeDocument',
      {
        projectId: changeRequest.projectId,
        changes: changeRequest.description
      }
    );
  }

  /**
   * Finalize change
   */
  async finalizeChange(changeRequest) {
    console.log(`🏁 Finalizing change: ${changeRequest.id}`);
    
    // Generate change completion report
    const completionReport = {
      changeRequestId: changeRequest.id,
      implementationDate: changeRequest.implementationDate,
      actualCost: changeRequest.costAnalysis.totalEstimatedCost,
      actualDuration: changeRequest.estimatedDuration,
      lessonsLearned: [],
      recommendations: []
    };

    changeRequest.completionReport = completionReport;
    changeRequest.status = 'CLOSED';
    
    eventBus.publish(EVENT_TYPES.CHANGE_REQUEST_CLOSED, changeRequest);
  }

  /**
   * Helper: Calculate impact level
   */
  calculateImpactLevel(value, threshold) {
    if (value === 0) return 'NONE';
    if (value < threshold * 0.25) return 'LOW';
    if (value < threshold * 0.5) return 'MEDIUM';
    if (value < threshold) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Helper: Get highest impact
   */
  getHighestImpact(impacts) {
    const levels = { 'NONE': 0, 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    const highest = impacts.reduce((max, impact) => 
      levels[impact] > levels[max] ? impact : max
    , 'NONE');
    return highest;
  }

  /**
   * Helper: Get approval chain
   */
  getApprovalChain(impactLevel) {
    switch (impactLevel) {
      case 'LOW':
        return ['PROJECT_MANAGER'];
      case 'MEDIUM':
        return ['PROJECT_MANAGER', 'PROGRAM_MANAGER'];
      case 'HIGH':
        return ['PROJECT_MANAGER', 'PROGRAM_MANAGER', 'DIRECTOR'];
      case 'CRITICAL':
        return ['PROJECT_MANAGER', 'PROGRAM_MANAGER', 'DIRECTOR', 'VP'];
      default:
        return ['PROJECT_MANAGER'];
    }
  }

  /**
   * Get change request status
   */
  getChangeRequest(changeId) {
    return this.activeChangeRequests.get(changeId);
  }

  /**
   * Get all active change requests
   */
  getAllActiveChangeRequests() {
    return Array.from(this.activeChangeRequests.values());
  }

  /**
   * Get change requests by project
   */
  getChangeRequestsByProject(projectId) {
    return Array.from(this.activeChangeRequests.values())
      .filter(cr => cr.projectId === projectId);
  }
}

// Export singleton instance
export const changeManagementWorkflow = new ChangeManagementWorkflow();

// Made with Bob