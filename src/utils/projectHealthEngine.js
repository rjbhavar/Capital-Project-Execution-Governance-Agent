/**
 * Project Health Engine
 * 
 * Calculates comprehensive project health scores (0-100) based on multiple factors:
 * - Project Status & Phase
 * - Budget Health
 * - Contract Status
 * - Payment Activity
 * - Timeline Adherence
 * - Proposal Status
 */

/**
 * Calculate project health score
 * @param {Object} project - Project object with all related data
 * @returns {Object} { score: number, rating: string, color: string, factors: Object }
 */
export const calculateProjectHealth = (project) => {
  if (!project) {
    return { score: 0, rating: 'Unknown', color: 'gray', factors: {} };
  }

  const factors = {
    status: calculateStatusScore(project),
    phase: calculatePhaseScore(project),
    budget: calculateBudgetScore(project),
    contracts: calculateContractScore(project),
    payments: calculatePaymentScore(project),
    timeline: calculateTimelineScore(project),
    proposal: calculateProposalScore(project)
  };

  // Weighted average
  const weights = {
    status: 0.20,    // 20%
    phase: 0.15,     // 15%
    budget: 0.25,    // 25%
    contracts: 0.15, // 15%
    payments: 0.10,  // 10%
    timeline: 0.10,  // 10%
    proposal: 0.05   // 5%
  };

  const totalScore = Object.keys(factors).reduce((sum, key) => {
    return sum + (factors[key] * weights[key]);
  }, 0);

  const score = Math.round(totalScore);
  const rating = getHealthRating(score);
  const color = getHealthColor(score);

  return {
    score,
    rating,
    color,
    factors,
    weights
  };
};

/**
 * Calculate status score (0-100)
 */
const calculateStatusScore = (project) => {
  const status = project.status?.toLowerCase() || '';
  
  // Status scoring
  const statusScores = {
    'approved': 100,
    'in progress': 90,
    'active': 90,
    'planning': 80,
    'design': 80,
    'construction': 85,
    'completing': 75,
    'revision in progress': 60,
    'revision': 60,
    'on hold': 40,
    'hold': 40,
    'cancelled': 20,
    'closed': 100
  };

  for (const [key, score] of Object.entries(statusScores)) {
    if (status.includes(key)) {
      return score;
    }
  }

  return 50; // Default for unknown status
};

/**
 * Calculate phase score (0-100)
 */
const calculatePhaseScore = (project) => {
  const phase = project.phase?.toLowerCase() || '';
  
  const phaseScores = {
    'planning': 70,
    'design': 80,
    'procurement': 85,
    'construction': 90,
    'closeout': 95,
    'complete': 100,
    'cancelled': 20
  };

  for (const [key, score] of Object.entries(phaseScores)) {
    if (phase.includes(key)) {
      return score;
    }
  }

  return 60; // Default
};

/**
 * Calculate budget health score (0-100)
 */
const calculateBudgetScore = (project) => {
  if (!project.hasBudget || !project.budgetDetails) {
    return 50; // No budget data = neutral score
  }

  const budget = project.budgetDetails;
  const budgetAmount = budget.budgetAmount || 0;
  const incurredCost = budget.incurredCost || 0;
  const forecastCost = budget.forecastCost || 0;

  if (budgetAmount === 0) {
    return 50; // No budget assigned
  }

  // Calculate utilization
  const utilization = (incurredCost / budgetAmount) * 100;
  
  // Calculate forecast variance
  const forecastVariance = forecastCost > 0 ? ((forecastCost - budgetAmount) / budgetAmount) * 100 : 0;

  let score = 100;

  // Penalize high utilization
  if (utilization > 100) {
    score -= 40; // Over budget
  } else if (utilization > 95) {
    score -= 30;
  } else if (utilization > 90) {
    score -= 20;
  } else if (utilization > 85) {
    score -= 10;
  } else if (utilization > 75) {
    score -= 5;
  }

  // Penalize forecast overruns
  if (forecastVariance > 20) {
    score -= 20;
  } else if (forecastVariance > 10) {
    score -= 10;
  } else if (forecastVariance > 5) {
    score -= 5;
  }

  // Check budget status
  const budgetStatus = budget.status?.toLowerCase() || '';
  if (budgetStatus.includes('approved')) {
    score += 0; // No change
  } else if (budgetStatus.includes('pending')) {
    score -= 10;
  } else if (budgetStatus.includes('rejected')) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate contract health score (0-100)
 */
const calculateContractScore = (project) => {
  if (!project.hasContracts || !project.contractDetails || project.contractDetails.length === 0) {
    return 60; // No contracts = neutral/slightly negative
  }

  const contracts = project.contractDetails;
  let totalScore = 0;

  contracts.forEach(contract => {
    let contractScore = 100;
    const status = contract.status?.toLowerCase() || '';
    const state = contract.state?.toLowerCase() || '';

    // Status scoring
    if (status.includes('active')) {
      contractScore = 100;
    } else if (status.includes('pending')) {
      contractScore = 70;
    } else if (status.includes('draft')) {
      contractScore = 60;
    } else if (status.includes('cancelled')) {
      contractScore = 30;
    }

    // State scoring
    if (state.includes('approved')) {
      contractScore = Math.max(contractScore, 90);
    } else if (state.includes('pending')) {
      contractScore -= 10;
    }

    totalScore += contractScore;
  });

  return Math.round(totalScore / contracts.length);
};

/**
 * Calculate payment activity score (0-100)
 */
const calculatePaymentScore = (project) => {
  if (!project.hasPayments || !project.paymentDetails || project.paymentDetails.length === 0) {
    return 70; // No payments yet = neutral
  }

  const payments = project.paymentDetails;
  let totalScore = 0;

  payments.forEach(payment => {
    let paymentScore = 100;
    const status = payment.status?.toLowerCase() || '';

    if (status.includes('paid')) {
      paymentScore = 100;
    } else if (status.includes('approved')) {
      paymentScore = 90;
    } else if (status.includes('pending')) {
      paymentScore = 70;
    } else if (status.includes('rejected')) {
      paymentScore = 40;
    } else if (status.includes('overdue')) {
      paymentScore = 30;
    }

    totalScore += paymentScore;
  });

  return Math.round(totalScore / payments.length);
};

/**
 * Calculate timeline adherence score (0-100)
 */
const calculateTimelineScore = (project) => {
  const now = new Date();
  const startDate = project.startDate ? new Date(project.startDate) : null;
  const endDate = project.endDate ? new Date(project.endDate) : null;

  if (!startDate || !endDate) {
    return 60; // No timeline data = neutral
  }

  let score = 100;

  // Check if project has started
  if (startDate > now) {
    return 100; // Not started yet = perfect score
  }

  // Check if project is delayed
  if (endDate < now && project.status?.toLowerCase() !== 'closed' && project.status?.toLowerCase() !== 'complete') {
    const daysDelayed = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
    
    if (daysDelayed > 90) {
      score = 20;
    } else if (daysDelayed > 60) {
      score = 40;
    } else if (daysDelayed > 30) {
      score = 60;
    } else if (daysDelayed > 14) {
      score = 75;
    } else if (daysDelayed > 7) {
      score = 85;
    }
  }

  // Check timeline status
  const timeline = project.timeline?.toLowerCase() || '';
  if (timeline.includes('on track') || timeline.includes('on schedule')) {
    score = Math.max(score, 95);
  } else if (timeline.includes('at risk')) {
    score = Math.min(score, 70);
  } else if (timeline.includes('delayed')) {
    score = Math.min(score, 50);
  }

  return score;
};

/**
 * Calculate proposal status score (0-100)
 */
const calculateProposalScore = (project) => {
  if (!project.hasProposal || !project.proposalDetails) {
    return 80; // No proposal = slightly negative
  }

  const proposal = project.proposalDetails;
  const status = proposal.status?.toLowerCase() || '';

  if (status.includes('approved')) {
    return 100;
  } else if (status.includes('submitted')) {
    return 85;
  } else if (status.includes('pending')) {
    return 70;
  } else if (status.includes('draft')) {
    return 60;
  } else if (status.includes('rejected')) {
    return 30;
  }

  return 75; // Default
};

/**
 * Get health rating from score
 */
const getHealthRating = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  if (score >= 60) return 'Moderate';
  if (score >= 50) return 'At Risk';
  return 'Critical';
};

/**
 * Get health color from score
 */
const getHealthColor = (score) => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
};

/**
 * Get health badge color classes
 */
export const getHealthBadgeClasses = (score) => {
  if (score >= 80) {
    return 'bg-green-100 text-green-800 border-green-200';
  } else if (score >= 60) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  } else {
    return 'bg-red-100 text-red-800 border-red-200';
  }
};

/**
 * Get health icon color
 */
export const getHealthIconColor = (score) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Batch calculate health for multiple projects
 */
export const calculatePortfolioHealth = (projects) => {
  if (!projects || projects.length === 0) {
    return {
      averageScore: 0,
      distribution: { excellent: 0, good: 0, fair: 0, moderate: 0, atRisk: 0, critical: 0 },
      healthyProjects: 0,
      atRiskProjects: 0,
      criticalProjects: 0
    };
  }

  const healthScores = projects.map(p => calculateProjectHealth(p));
  const totalScore = healthScores.reduce((sum, h) => sum + h.score, 0);
  const averageScore = Math.round(totalScore / projects.length);

  const distribution = {
    excellent: healthScores.filter(h => h.score >= 90).length,
    good: healthScores.filter(h => h.score >= 80 && h.score < 90).length,
    fair: healthScores.filter(h => h.score >= 70 && h.score < 80).length,
    moderate: healthScores.filter(h => h.score >= 60 && h.score < 70).length,
    atRisk: healthScores.filter(h => h.score >= 50 && h.score < 60).length,
    critical: healthScores.filter(h => h.score < 50).length
  };

  return {
    averageScore,
    distribution,
    healthyProjects: distribution.excellent + distribution.good,
    atRiskProjects: distribution.atRisk,
    criticalProjects: distribution.critical,
    totalProjects: projects.length
  };
};

// Made with Bob
