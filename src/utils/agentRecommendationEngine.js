/**
 * Agent Recommendation Engine
 * 
 * Rule-based intelligence system that generates actionable recommendations
 * across multiple domains:
 * - Budget Intelligence
 * - Procurement Intelligence
 * - Payment Intelligence
 * - Project Planning Intelligence
 * - Risk & Compliance Intelligence
 */

/**
 * Generate all recommendations for a project
 * @param {Object} project - Project with all related data
 * @returns {Array} Array of recommendation objects
 */
export const generateProjectRecommendations = (project) => {
  if (!project) return [];

  const recommendations = [
    ...generateBudgetRecommendations(project),
    ...generateProcurementRecommendations(project),
    ...generatePaymentRecommendations(project),
    ...generatePlanningRecommendations(project),
    ...generateRiskComplianceRecommendations(project)
  ];

  // Sort by priority (error > warning > info > success)
  const priorityOrder = { error: 0, warning: 1, info: 2, success: 3 };
  return recommendations.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);
};

/**
 * Budget Intelligence Agent
 */
const generateBudgetRecommendations = (project) => {
  const recommendations = [];

  if (!project.hasBudget || !project.budgetDetails) {
    recommendations.push({
      type: 'warning',
      category: 'Budget',
      title: 'No Budget Assigned',
      description: 'This project does not have an assigned budget. Budget allocation is required for financial tracking and governance.',
      action: 'Assign budget to project',
      priority: 'high'
    });
    return recommendations;
  }

  const budget = project.budgetDetails;
  const budgetAmount = budget.budgetAmount || 0;
  const incurredCost = budget.incurredCost || 0;
  const forecastCost = budget.forecastCost || 0;

  if (budgetAmount === 0) {
    recommendations.push({
      type: 'warning',
      category: 'Budget',
      title: 'Zero Budget Amount',
      description: 'Budget is assigned but has zero amount. Update budget allocation.',
      action: 'Update budget amount',
      priority: 'high'
    });
    return recommendations;
  }

  const utilization = (incurredCost / budgetAmount) * 100;
  const forecastVariance = forecastCost > 0 ? ((forecastCost - budgetAmount) / budgetAmount) * 100 : 0;

  // Budget utilization above threshold
  if (utilization > 100) {
    recommendations.push({
      type: 'error',
      category: 'Budget',
      title: 'Budget Exceeded',
      description: `Project has exceeded budget by ${(utilization - 100).toFixed(1)}%. Immediate action required to address cost overrun.`,
      action: 'Review budget variance and request additional funding',
      priority: 'critical',
      metrics: { utilization: utilization.toFixed(1), overrun: (incurredCost - budgetAmount) }
    });
  } else if (utilization > 95) {
    recommendations.push({
      type: 'error',
      category: 'Budget',
      title: 'Budget Critical',
      description: `Budget utilization at ${utilization.toFixed(1)}%. Less than 5% remaining. Urgent review required.`,
      action: 'Freeze non-essential spending and review remaining work',
      priority: 'critical',
      metrics: { utilization: utilization.toFixed(1), remaining: budgetAmount - incurredCost }
    });
  } else if (utilization > 90) {
    recommendations.push({
      type: 'warning',
      category: 'Budget',
      title: 'Budget High Utilization',
      description: `Budget utilization at ${utilization.toFixed(1)}%. Monitor spending closely to avoid overrun.`,
      action: 'Review remaining commitments and forecast',
      priority: 'high',
      metrics: { utilization: utilization.toFixed(1) }
    });
  } else if (utilization > 75) {
    recommendations.push({
      type: 'info',
      category: 'Budget',
      title: 'Budget Tracking Normal',
      description: `Budget utilization at ${utilization.toFixed(1)}%. Continue monitoring spending patterns.`,
      action: 'Maintain current budget controls',
      priority: 'medium',
      metrics: { utilization: utilization.toFixed(1) }
    });
  }

  // Forecast variance risk
  if (forecastVariance > 20) {
    recommendations.push({
      type: 'error',
      category: 'Budget',
      title: 'Forecast Overrun Risk',
      description: `Forecast cost exceeds budget by ${forecastVariance.toFixed(1)}%. Significant variance detected.`,
      action: 'Review forecast assumptions and request budget adjustment',
      priority: 'high',
      metrics: { variance: forecastVariance.toFixed(1) }
    });
  } else if (forecastVariance > 10) {
    recommendations.push({
      type: 'warning',
      category: 'Budget',
      title: 'Forecast Variance Detected',
      description: `Forecast cost ${forecastVariance.toFixed(1)}% above budget. Monitor closely.`,
      action: 'Review forecast and identify cost reduction opportunities',
      priority: 'medium',
      metrics: { variance: forecastVariance.toFixed(1) }
    });
  }

  // Budget status check
  const budgetStatus = budget.status?.toLowerCase() || '';
  if (budgetStatus.includes('pending')) {
    recommendations.push({
      type: 'warning',
      category: 'Budget',
      title: 'Budget Pending Approval',
      description: 'Project budget is pending approval. This may delay procurement and execution.',
      action: 'Follow up on budget approval status',
      priority: 'high'
    });
  } else if (budgetStatus.includes('rejected')) {
    recommendations.push({
      type: 'error',
      category: 'Budget',
      title: 'Budget Rejected',
      description: 'Project budget has been rejected. Project execution is blocked.',
      action: 'Address rejection reasons and resubmit budget',
      priority: 'critical'
    });
  }

  return recommendations;
};

/**
 * Procurement Agent
 */
const generateProcurementRecommendations = (project) => {
  const recommendations = [];

  // Check if project should have contracts
  const projectValue = project.budget || 0;
  const requiresContracts = projectValue > 100000; // Projects over $100k typically need contracts

  if (!project.hasContracts && requiresContracts) {
    recommendations.push({
      type: 'warning',
      category: 'Procurement',
      title: 'No Contracts Assigned',
      description: `Project budget of $${(projectValue / 1000000).toFixed(1)}M typically requires procurement contracts. No contracts found.`,
      action: 'Initiate procurement process and assign contracts',
      priority: 'high'
    });
    return recommendations;
  }

  if (!project.hasContracts) {
    return recommendations; // Small projects may not need contracts
  }

  const contracts = project.contractDetails || [];
  
  // Contract pending approval
  const pendingContracts = contracts.filter(c => 
    c.status?.toLowerCase().includes('pending') || 
    c.state?.toLowerCase().includes('pending')
  );
  
  if (pendingContracts.length > 0) {
    recommendations.push({
      type: 'warning',
      category: 'Procurement',
      title: 'Contracts Pending Approval',
      description: `${pendingContracts.length} contract${pendingContracts.length > 1 ? 's are' : ' is'} pending approval. This may delay project execution.`,
      action: 'Expedite contract approval process',
      priority: 'high',
      metrics: { pendingCount: pendingContracts.length }
    });
  }

  // Draft contracts
  const draftContracts = contracts.filter(c => c.status?.toLowerCase().includes('draft'));
  if (draftContracts.length > 0) {
    recommendations.push({
      type: 'info',
      category: 'Procurement',
      title: 'Draft Contracts Exist',
      description: `${draftContracts.length} contract${draftContracts.length > 1 ? 's are' : ' is'} in draft status. Complete and submit for approval.`,
      action: 'Finalize draft contracts',
      priority: 'medium',
      metrics: { draftCount: draftContracts.length }
    });
  }

  // Cancelled contracts
  const cancelledContracts = contracts.filter(c => c.status?.toLowerCase().includes('cancelled'));
  if (cancelledContracts.length > 0) {
    recommendations.push({
      type: 'warning',
      category: 'Procurement',
      title: 'Cancelled Contracts Detected',
      description: `${cancelledContracts.length} contract${cancelledContracts.length > 1 ? 's have' : ' has'} been cancelled. Review impact on project delivery.`,
      action: 'Assess impact and initiate replacement procurement if needed',
      priority: 'high',
      metrics: { cancelledCount: cancelledContracts.length }
    });
  }

  // Proposal awaiting response
  if (project.hasProposal && project.proposalDetails) {
    const proposalStatus = project.proposalDetails.status?.toLowerCase() || '';
    if (proposalStatus.includes('pending') || proposalStatus.includes('submitted')) {
      recommendations.push({
        type: 'info',
        category: 'Procurement',
        title: 'Proposal Awaiting Response',
        description: 'Project proposal is pending review. Follow up to expedite decision.',
        action: 'Contact stakeholders for proposal status update',
        priority: 'medium'
      });
    }
  }

  // Procurement bottleneck detection
  if (project.status?.toLowerCase().includes('in progress') && contracts.length === 0) {
    recommendations.push({
      type: 'error',
      category: 'Procurement',
      title: 'Procurement Bottleneck',
      description: 'Project is in progress but has no active contracts. This indicates a procurement bottleneck.',
      action: 'Investigate procurement delays and expedite contract execution',
      priority: 'critical'
    });
  }

  return recommendations;
};

/**
 * Payment Agent
 */
const generatePaymentRecommendations = (project) => {
  const recommendations = [];

  if (!project.hasPayments || !project.paymentDetails || project.paymentDetails.length === 0) {
    // Check if project should have payments
    const projectAge = project.startDate ? 
      Math.floor((new Date() - new Date(project.startDate)) / (1000 * 60 * 60 * 24)) : 0;
    
    if (projectAge > 90 && project.status?.toLowerCase().includes('in progress')) {
      recommendations.push({
        type: 'warning',
        category: 'Payment',
        title: 'No Payment Activity',
        description: `Project has been active for ${Math.floor(projectAge / 30)} months with no recorded payments. Verify payment processing.`,
        action: 'Review payment status with finance team',
        priority: 'medium',
        metrics: { projectAge }
      });
    }
    return recommendations;
  }

  const payments = project.paymentDetails;

  // Delayed payments
  const pendingPayments = payments.filter(p => p.status?.toLowerCase().includes('pending'));
  if (pendingPayments.length > 0) {
    recommendations.push({
      type: 'warning',
      category: 'Payment',
      title: 'Pending Payments',
      description: `${pendingPayments.length} payment${pendingPayments.length > 1 ? 's are' : ' is'} pending processing. Delays may impact vendor relationships.`,
      action: 'Expedite payment approvals',
      priority: 'medium',
      metrics: { pendingCount: pendingPayments.length }
    });
  }

  // Rejected payments
  const rejectedPayments = payments.filter(p => p.status?.toLowerCase().includes('rejected'));
  if (rejectedPayments.length > 0) {
    recommendations.push({
      type: 'error',
      category: 'Payment',
      title: 'Rejected Payments',
      description: `${rejectedPayments.length} payment${rejectedPayments.length > 1 ? 's have' : ' has'} been rejected. Address issues immediately.`,
      action: 'Review rejection reasons and resubmit corrected payments',
      priority: 'high',
      metrics: { rejectedCount: rejectedPayments.length }
    });
  }

  // Overdue payments
  const overduePayments = payments.filter(p => p.status?.toLowerCase().includes('overdue'));
  if (overduePayments.length > 0) {
    recommendations.push({
      type: 'error',
      category: 'Payment',
      title: 'Overdue Payments',
      description: `${overduePayments.length} payment${overduePayments.length > 1 ? 's are' : ' is'} overdue. This may damage vendor relationships and project delivery.`,
      action: 'Process overdue payments immediately',
      priority: 'critical',
      metrics: { overdueCount: overduePayments.length }
    });
  }

  return recommendations;
};

/**
 * Project Planning Agent
 */
const generatePlanningRecommendations = (project) => {
  const recommendations = [];

  // Missing planned dates
  if (!project.startDate || !project.endDate) {
    recommendations.push({
      type: 'warning',
      category: 'Planning',
      title: 'Missing Project Dates',
      description: 'Project is missing start or end dates. Timeline tracking is not possible.',
      action: 'Define project start and end dates',
      priority: 'high'
    });
    return recommendations;
  }

  const now = new Date();
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);

  // Project inactive (not started)
  if (startDate > now && project.status?.toLowerCase() !== 'planning') {
    const daysUntilStart = Math.floor((startDate - now) / (1000 * 60 * 60 * 24));
    recommendations.push({
      type: 'info',
      category: 'Planning',
      title: 'Project Not Yet Started',
      description: `Project is scheduled to start in ${daysUntilStart} days. Ensure all prerequisites are met.`,
      action: 'Verify readiness for project kickoff',
      priority: 'medium',
      metrics: { daysUntilStart }
    });
  }

  // Delayed completion
  if (endDate < now && !['closed', 'complete', 'completed'].includes(project.status?.toLowerCase())) {
    const daysDelayed = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
    
    if (daysDelayed > 90) {
      recommendations.push({
        type: 'error',
        category: 'Planning',
        title: 'Severely Delayed Project',
        description: `Project is ${daysDelayed} days past deadline. Critical intervention required.`,
        action: 'Conduct project recovery assessment and update timeline',
        priority: 'critical',
        metrics: { daysDelayed }
      });
    } else if (daysDelayed > 30) {
      recommendations.push({
        type: 'error',
        category: 'Planning',
        title: 'Delayed Project',
        description: `Project is ${daysDelayed} days past deadline. Immediate action required.`,
        action: 'Review delays and develop recovery plan',
        priority: 'high',
        metrics: { daysDelayed }
      });
    } else if (daysDelayed > 7) {
      recommendations.push({
        type: 'warning',
        category: 'Planning',
        title: 'Project Past Deadline',
        description: `Project is ${daysDelayed} days past deadline. Review timeline and update status.`,
        action: 'Assess remaining work and revise completion date',
        priority: 'medium',
        metrics: { daysDelayed }
      });
    }
  }

  // Milestone risk (approaching deadline)
  const daysRemaining = Math.floor((endDate - now) / (1000 * 60 * 60 * 24));
  if (daysRemaining > 0 && daysRemaining <= 30 && project.status?.toLowerCase() === 'in progress') {
    recommendations.push({
      type: 'warning',
      category: 'Planning',
      title: 'Approaching Deadline',
      description: `Project deadline is in ${daysRemaining} days. Ensure completion activities are on track.`,
      action: 'Review remaining tasks and resource allocation',
      priority: 'high',
      metrics: { daysRemaining }
    });
  }

  return recommendations;
};

/**
 * Risk & Compliance Agent
 */
const generateRiskComplianceRecommendations = (project) => {
  const recommendations = [];

  // Governance gaps
  if (!project.projectManager) {
    recommendations.push({
      type: 'error',
      category: 'Governance',
      title: 'No Project Manager Assigned',
      description: 'Project lacks assigned project manager. This is a governance gap.',
      action: 'Assign qualified project manager immediately',
      priority: 'critical'
    });
  }

  // Approval concerns
  if (project.status?.toLowerCase().includes('revision')) {
    recommendations.push({
      type: 'warning',
      category: 'Governance',
      title: 'Project Under Revision',
      description: 'Project is in revision status. Address review comments promptly.',
      action: 'Complete revisions and resubmit for approval',
      priority: 'high'
    });
  }

  // Missing project ownership
  if (!project.department && !project.organization) {
    recommendations.push({
      type: 'warning',
      category: 'Governance',
      title: 'Missing Organizational Assignment',
      description: 'Project is not assigned to a department or organization. Clarify ownership.',
      action: 'Assign project to appropriate organizational unit',
      priority: 'medium'
    });
  }

  // High risk score
  if (project.riskScore >= 70) {
    recommendations.push({
      type: 'error',
      category: 'Risk',
      title: 'High Risk Project',
      description: `Project risk score is ${project.riskScore}/100. Immediate risk mitigation required.`,
      action: 'Conduct risk assessment and implement mitigation strategies',
      priority: 'critical',
      metrics: { riskScore: project.riskScore }
    });
  } else if (project.riskScore >= 50) {
    recommendations.push({
      type: 'warning',
      category: 'Risk',
      title: 'Elevated Risk Level',
      description: `Project risk score is ${project.riskScore}/100. Monitor risk factors closely.`,
      action: 'Review risk register and update mitigation plans',
      priority: 'high',
      metrics: { riskScore: project.riskScore }
    });
  }

  return recommendations;
};

/**
 * Generate portfolio-level recommendations
 */
export const generatePortfolioRecommendations = (projects) => {
  if (!projects || projects.length === 0) return [];

  const recommendations = [];

  // High-risk projects
  const highRiskProjects = projects.filter(p => p.riskScore >= 60);
  if (highRiskProjects.length > 0) {
    recommendations.push({
      type: 'error',
      category: 'Portfolio Risk',
      title: 'High-Risk Projects Detected',
      description: `${highRiskProjects.length} project${highRiskProjects.length > 1 ? 's have' : ' has'} high risk scores. Portfolio risk exposure is elevated.`,
      action: 'Conduct portfolio risk review and prioritize mitigation',
      priority: 'critical',
      metrics: { count: highRiskProjects.length }
    });
  }

  // Budget overruns
  const overBudgetProjects = projects.filter(p => 
    p.hasBudget && p.budgetDetails && 
    p.budgetDetails.incurredCost > p.budgetDetails.budgetAmount
  );
  if (overBudgetProjects.length > 0) {
    recommendations.push({
      type: 'error',
      category: 'Portfolio Budget',
      title: 'Budget Overruns Detected',
      description: `${overBudgetProjects.length} project${overBudgetProjects.length > 1 ? 's have' : ' has'} exceeded budget. Portfolio financial health at risk.`,
      action: 'Review budget variances and implement cost controls',
      priority: 'high',
      metrics: { count: overBudgetProjects.length }
    });
  }

  // Delayed projects
  const now = new Date();
  const delayedProjects = projects.filter(p => {
    if (!p.endDate) return false;
    const endDate = new Date(p.endDate);
    return endDate < now && !['closed', 'complete', 'completed'].includes(p.status?.toLowerCase());
  });
  
  if (delayedProjects.length > 0) {
    recommendations.push({
      type: 'warning',
      category: 'Portfolio Schedule',
      title: 'Delayed Projects',
      description: `${delayedProjects.length} project${delayedProjects.length > 1 ? 's are' : ' is'} past deadline. Portfolio delivery at risk.`,
      action: 'Conduct schedule recovery analysis',
      priority: 'high',
      metrics: { count: delayedProjects.length }
    });
  }

  return recommendations;
};

// Made with Bob
