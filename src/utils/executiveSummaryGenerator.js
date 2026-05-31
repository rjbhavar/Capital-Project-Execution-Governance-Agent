/**
 * Executive Summary Generator
 * 
 * Generates dynamic, context-aware executive summaries for projects
 * based on current status, health, risks, and activities
 */

/**
 * Generate executive summary for a project
 * @param {Object} project - Project with all related data
 * @returns {string} Executive summary text
 */
export const generateExecutiveSummary = (project) => {
  if (!project) return 'No project data available.';

  const sections = [];

  // Section 1: Status and Phase
  sections.push(generateStatusSection(project));

  // Section 2: Health Assessment
  sections.push(generateHealthSection(project));

  // Section 3: Budget Status
  sections.push(generateBudgetSection(project));

  // Section 4: Activity Status
  sections.push(generateActivitySection(project));

  // Section 5: Risk Assessment
  sections.push(generateRiskSection(project));

  // Section 6: Critical Issues
  const criticalIssues = generateCriticalIssuesSection(project);
  if (criticalIssues) {
    sections.push(criticalIssues);
  }

  return sections.filter(s => s).join(' ');
};

/**
 * Generate status section
 */
const generateStatusSection = (project) => {
  const status = project.status || 'Unknown';
  const phase = project.phase || 'Not specified';
  
  let statusDescription = '';
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('in progress') || statusLower.includes('active')) {
    statusDescription = 'currently active and in execution';
  } else if (statusLower.includes('planning')) {
    statusDescription = 'in planning phase';
  } else if (statusLower.includes('approved')) {
    statusDescription = 'approved and ready for execution';
  } else if (statusLower.includes('revision')) {
    statusDescription = 'under revision with pending changes';
  } else if (statusLower.includes('hold')) {
    statusDescription = 'on hold pending resolution';
  } else if (statusLower.includes('complete') || statusLower.includes('closed')) {
    statusDescription = 'completed';
  } else {
    statusDescription = `in ${status} status`;
  }

  return `This project is ${statusDescription}, currently in the ${phase} phase.`;
};

/**
 * Generate health section
 */
const generateHealthSection = (project) => {
  const healthScore = project.healthScore || 0;
  const healthRating = project.healthRating || 'Unknown';
  
  let healthDescription = '';
  
  if (healthScore >= 90) {
    healthDescription = 'excellent health with all indicators performing well';
  } else if (healthScore >= 80) {
    healthDescription = 'good health with minor areas for improvement';
  } else if (healthScore >= 70) {
    healthDescription = 'fair health with some concerns requiring attention';
  } else if (healthScore >= 60) {
    healthDescription = 'moderate health with several areas needing improvement';
  } else if (healthScore >= 50) {
    healthDescription = 'at-risk status with significant concerns';
  } else {
    healthDescription = 'critical health requiring immediate intervention';
  }

  return `The project demonstrates ${healthDescription} (health score: ${healthScore}/100).`;
};

/**
 * Generate budget section
 */
const generateBudgetSection = (project) => {
  if (!project.hasBudget || !project.budgetDetails) {
    return 'Budget information is not available for this project.';
  }

  const budget = project.budgetDetails;
  const budgetAmount = budget.budgetAmount || 0;
  const incurredCost = budget.incurredCost || 0;
  const forecastCost = budget.forecastCost || 0;

  if (budgetAmount === 0) {
    return 'No budget has been allocated to this project.';
  }

  const utilization = (incurredCost / budgetAmount) * 100;
  const remaining = budgetAmount - incurredCost;
  const forecastVariance = forecastCost > 0 ? ((forecastCost - budgetAmount) / budgetAmount) * 100 : 0;

  let budgetStatus = '';
  
  if (utilization > 100) {
    const overrun = incurredCost - budgetAmount;
    budgetStatus = `has exceeded budget by $${formatCurrency(overrun)} (${(utilization - 100).toFixed(1)}% over)`;
  } else if (utilization > 95) {
    budgetStatus = `is critically close to budget limit with only ${(100 - utilization).toFixed(1)}% remaining`;
  } else if (utilization > 90) {
    budgetStatus = `is approaching budget limit at ${utilization.toFixed(1)}% utilization`;
  } else if (utilization > 75) {
    budgetStatus = `remains healthy at ${utilization.toFixed(1)}% utilization with $${formatCurrency(remaining)} remaining`;
  } else if (utilization > 50) {
    budgetStatus = `is tracking well at ${utilization.toFixed(1)}% utilization`;
  } else {
    budgetStatus = `is in early stages with ${utilization.toFixed(1)}% budget utilized`;
  }

  let forecastNote = '';
  if (forecastVariance > 20) {
    forecastNote = ` Forecast indicates potential overrun of ${forecastVariance.toFixed(1)}%.`;
  } else if (forecastVariance > 10) {
    forecastNote = ` Forecast shows moderate variance of ${forecastVariance.toFixed(1)}%.`;
  } else if (forecastCost > 0) {
    forecastNote = ' Forecast aligns with budget allocation.';
  }

  return `Budget ${budgetStatus}.${forecastNote}`;
};

/**
 * Generate activity section
 */
const generateActivitySection = (project) => {
  const activities = [];

  // Contract activity
  if (project.hasContracts && project.contractDetails && project.contractDetails.length > 0) {
    const contracts = project.contractDetails;
    const activeContracts = contracts.filter(c => c.status?.toLowerCase().includes('active')).length;
    const pendingContracts = contracts.filter(c => 
      c.status?.toLowerCase().includes('pending') || 
      c.state?.toLowerCase().includes('pending')
    ).length;

    if (activeContracts > 0) {
      activities.push(`${activeContracts} active contract${activeContracts > 1 ? 's' : ''}`);
    }
    if (pendingContracts > 0) {
      activities.push(`${pendingContracts} pending contract${pendingContracts > 1 ? 's' : ''}`);
    }
  } else if (project.budget > 100000) {
    activities.push('no contracts assigned');
  }

  // Payment activity
  if (project.hasPayments && project.paymentDetails && project.paymentDetails.length > 0) {
    const payments = project.paymentDetails;
    const paidPayments = payments.filter(p => p.status?.toLowerCase().includes('paid')).length;
    const pendingPayments = payments.filter(p => p.status?.toLowerCase().includes('pending')).length;

    if (paidPayments > 0) {
      activities.push(`${paidPayments} completed payment${paidPayments > 1 ? 's' : ''}`);
    }
    if (pendingPayments > 0) {
      activities.push(`${pendingPayments} pending payment${pendingPayments > 1 ? 's' : ''}`);
    }
  }

  // Proposal activity
  if (project.hasProposal && project.proposalDetails) {
    const proposalStatus = project.proposalDetails.status?.toLowerCase() || '';
    if (proposalStatus.includes('approved')) {
      activities.push('approved proposal');
    } else if (proposalStatus.includes('pending') || proposalStatus.includes('submitted')) {
      activities.push('proposal pending approval');
    }
  }

  if (activities.length === 0) {
    return 'No significant contract, payment, or proposal activity recorded.';
  }

  return `Current activities include ${formatList(activities)}.`;
};

/**
 * Generate risk section
 */
const generateRiskSection = (project) => {
  const riskScore = project.riskScore || 0;
  const healthScore = project.healthScore || 0;

  let riskLevel = '';
  let riskDescription = '';

  if (riskScore >= 70) {
    riskLevel = 'high';
    riskDescription = 'requiring immediate risk mitigation actions';
  } else if (riskScore >= 50) {
    riskLevel = 'elevated';
    riskDescription = 'requiring close monitoring and proactive management';
  } else if (riskScore >= 30) {
    riskLevel = 'moderate';
    riskDescription = 'with standard risk management protocols in place';
  } else {
    riskLevel = 'low';
    riskDescription = 'with minimal concerns';
  }

  // Check for specific risk factors
  const riskFactors = [];
  
  if (project.hasBudget && project.budgetDetails) {
    const utilization = (project.budgetDetails.incurredCost / project.budgetDetails.budgetAmount) * 100;
    if (utilization > 90) {
      riskFactors.push('budget pressure');
    }
  }

  if (project.endDate) {
    const now = new Date();
    const endDate = new Date(project.endDate);
    if (endDate < now && !['closed', 'complete', 'completed'].includes(project.status?.toLowerCase())) {
      riskFactors.push('schedule delays');
    }
  }

  if (healthScore < 60) {
    riskFactors.push('health concerns');
  }

  let riskFactorNote = '';
  if (riskFactors.length > 0) {
    riskFactorNote = ` Key risk factors include ${formatList(riskFactors)}.`;
  }

  return `Overall risk assessment is ${riskLevel} (risk score: ${riskScore}/100)${riskDescription}.${riskFactorNote}`;
};

/**
 * Generate critical issues section
 */
const generateCriticalIssuesSection = (project) => {
  const criticalIssues = [];

  // Check for critical recommendations
  if (project.recommendations && project.recommendations.length > 0) {
    const critical = project.recommendations.filter(r => 
      r.type === 'error' || r.priority === 'critical'
    );
    
    if (critical.length > 0) {
      critical.slice(0, 2).forEach(issue => {
        criticalIssues.push(issue.title.toLowerCase());
      });
    }
  }

  if (criticalIssues.length === 0) {
    return null; // No critical issues
  }

  return `Critical issues detected: ${formatList(criticalIssues)}.`;
};

/**
 * Helper: Format currency
 */
const formatCurrency = (amount) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toFixed(0);
};

/**
 * Helper: Format list with proper grammar
 */
const formatList = (items) => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1).join(', ');
  return `${otherItems}, and ${lastItem}`;
};

/**
 * Generate short summary (one sentence)
 */
export const generateShortSummary = (project) => {
  if (!project) return 'No data available.';

  const status = project.status || 'Unknown';
  const healthScore = project.healthScore || 0;
  const riskScore = project.riskScore || 0;

  let healthTerm = healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'moderate' : 'concerning';
  let riskTerm = riskScore >= 60 ? 'high risk' : riskScore >= 30 ? 'moderate risk' : 'low risk';

  return `${status} project with ${healthTerm} performance and ${riskTerm} profile.`;
};

/**
 * Generate portfolio executive summary
 */
export const generatePortfolioSummary = (projects) => {
  if (!projects || projects.length === 0) {
    return 'No projects in portfolio.';
  }

  const totalProjects = projects.length;
  const avgHealth = Math.round(
    projects.reduce((sum, p) => sum + (p.healthScore || 0), 0) / totalProjects
  );
  const highRiskCount = projects.filter(p => p.riskScore >= 60).length;
  const delayedCount = projects.filter(p => {
    if (!p.endDate) return false;
    const endDate = new Date(p.endDate);
    return endDate < new Date() && !['closed', 'complete', 'completed'].includes(p.status?.toLowerCase());
  }).length;

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projects.reduce((sum, p) => {
    if (p.hasBudget && p.budgetDetails) {
      return sum + (p.budgetDetails.incurredCost || 0);
    }
    return sum + (p.spent || 0);
  }, 0);

  const portfolioUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  let summary = `Portfolio consists of ${totalProjects} capital projects with an average health score of ${avgHealth}/100. `;
  
  if (highRiskCount > 0) {
    summary += `${highRiskCount} project${highRiskCount > 1 ? 's are' : ' is'} classified as high risk. `;
  }
  
  if (delayedCount > 0) {
    summary += `${delayedCount} project${delayedCount > 1 ? 's are' : ' is'} past deadline. `;
  }

  summary += `Total portfolio budget is $${formatCurrency(totalBudget)} with ${portfolioUtilization.toFixed(1)}% utilization.`;

  if (portfolioUtilization > 90) {
    summary += ' Portfolio budget utilization is high and requires close monitoring.';
  } else if (avgHealth >= 80 && highRiskCount === 0) {
    summary += ' Portfolio is performing well with strong health indicators.';
  }

  return summary;
};

// Made with Bob
