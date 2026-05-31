/**
 * Agent Explanation Engine
 * 
 * Provides detailed explanations for agent recommendations and findings.
 * Every recommendation must explain WHY to build user trust.
 * 
 * Explanation Structure:
 * - Primary Reason: Main cause for the recommendation
 * - Supporting Factors: Additional evidence
 * - Data Points: Concrete metrics and thresholds
 * - Alternatives: Other possible actions
 * - Impact: Expected outcome
 */

class AgentExplanationEngine {
  constructor() {
    this.explanationTemplates = this.initializeTemplates();
  }

  /**
   * Initialize explanation templates for common scenarios
   */
  initializeTemplates() {
    return {
      budget_overrun: {
        primary: "Budget utilization has exceeded {threshold}%",
        supporting: [
          "Current spending rate suggests overrun by project end",
          "No contingency budget allocated",
          "Historical data shows similar projects exceeded budget"
        ],
        alternatives: [
          "Request budget increase",
          "Reduce project scope",
          "Extend timeline to reduce burn rate",
          "Reallocate funds from other projects"
        ]
      },
      schedule_delay: {
        primary: "Project is {days} days behind schedule",
        supporting: [
          "Multiple milestones missed",
          "Critical path activities delayed",
          "Resource constraints identified"
        ],
        alternatives: [
          "Add resources to critical path",
          "Adjust timeline expectations",
          "Reduce scope to meet deadline",
          "Implement fast-tracking strategies"
        ]
      },
      procurement_bottleneck: {
        primary: "Procurement process is delaying project progress",
        supporting: [
          "Contract approval pending for {days} days",
          "Vendor selection not completed",
          "Purchase orders not issued"
        ],
        alternatives: [
          "Expedite approval process",
          "Use alternative vendors",
          "Adjust project schedule",
          "Escalate to procurement leadership"
        ]
      },
      risk_escalation: {
        primary: "Risk score has increased to {score}",
        supporting: [
          "Multiple high-severity issues identified",
          "Mitigation strategies not effective",
          "External factors increasing risk"
        ],
        alternatives: [
          "Implement additional risk controls",
          "Escalate to executive leadership",
          "Pause project for risk assessment",
          "Adjust project approach"
        ]
      },
      governance_gap: {
        primary: "Critical governance requirement not met",
        supporting: [
          "Required documentation missing",
          "Approval workflow not followed",
          "Compliance requirements not satisfied"
        ],
        alternatives: [
          "Complete missing documentation",
          "Initiate approval workflow",
          "Request compliance waiver",
          "Assign governance owner"
        ]
      }
    };
  }

  /**
   * Generate comprehensive explanation for a recommendation
   * @param {Object} recommendation - Agent recommendation
   * @returns {Object} Detailed explanation
   */
  explain(recommendation) {
    const explanation = {
      recommendation: recommendation.title,
      
      reasoning: {
        primary: this.generatePrimaryReason(recommendation),
        supporting: this.generateSupportingFactors(recommendation),
        dataPoints: this.extractDataPoints(recommendation),
        threshold: this.identifyThreshold(recommendation)
      },
      
      confidence: {
        score: recommendation.confidence || 0,
        level: this.getConfidenceLevel(recommendation.confidence),
        factors: this.getConfidenceFactors(recommendation)
      },
      
      impact: {
        level: recommendation.impact || 'medium',
        description: this.generateImpactDescription(recommendation),
        affectedAreas: this.identifyAffectedAreas(recommendation)
      },
      
      urgency: {
        score: recommendation.urgency || 0.5,
        level: this.getUrgencyLevel(recommendation.urgency),
        timeframe: this.estimateTimeframe(recommendation)
      },
      
      alternatives: this.generateAlternatives(recommendation),
      
      evidence: this.compileEvidence(recommendation),
      
      historicalContext: this.getHistoricalContext(recommendation)
    };

    return explanation;
  }

  /**
   * Generate primary reason for recommendation
   */
  generatePrimaryReason(recommendation) {
    const { type, data } = recommendation;

    // Use template if available
    if (this.explanationTemplates[type]) {
      let reason = this.explanationTemplates[type].primary;
      
      // Replace placeholders with actual data
      if (data) {
        Object.keys(data).forEach(key => {
          reason = reason.replace(`{${key}}`, data[key]);
        });
      }
      
      return reason;
    }

    // Fallback to recommendation description
    return recommendation.description || recommendation.title;
  }

  /**
   * Generate supporting factors
   */
  generateSupportingFactors(recommendation) {
    const factors = [];
    const { type, data, context } = recommendation;

    // Use template if available
    if (this.explanationTemplates[type]) {
      factors.push(...this.explanationTemplates[type].supporting);
    }

    // Add context-specific factors
    if (context) {
      if (context.historicalTrend) {
        factors.push(`Historical trend shows ${context.historicalTrend}`);
      }
      if (context.similarProjects) {
        factors.push(`${context.similarProjects} similar projects experienced same issue`);
      }
      if (context.externalFactors) {
        factors.push(`External factors: ${context.externalFactors}`);
      }
    }

    // Add data-driven factors
    if (data) {
      if (data.variance && Math.abs(data.variance) > 0.1) {
        factors.push(`Variance from plan: ${(data.variance * 100).toFixed(1)}%`);
      }
      if (data.trend && data.trend !== 'stable') {
        factors.push(`Trend: ${data.trend}`);
      }
    }

    return factors.length > 0 ? factors : ['Analysis based on current project data'];
  }

  /**
   * Extract data points from recommendation
   */
  extractDataPoints(recommendation) {
    const dataPoints = {};
    const { data } = recommendation;

    if (!data) return dataPoints;

    // Extract relevant metrics
    if (data.budgetUtilization !== undefined) {
      dataPoints.budgetUtilization = `${(data.budgetUtilization * 100).toFixed(1)}%`;
    }
    if (data.scheduleVariance !== undefined) {
      dataPoints.scheduleVariance = `${data.scheduleVariance} days`;
    }
    if (data.riskScore !== undefined) {
      dataPoints.riskScore = data.riskScore;
    }
    if (data.completionPercentage !== undefined) {
      dataPoints.completionPercentage = `${data.completionPercentage}%`;
    }
    if (data.remainingBudget !== undefined) {
      dataPoints.remainingBudget = `$${data.remainingBudget.toLocaleString()}`;
    }
    if (data.daysRemaining !== undefined) {
      dataPoints.daysRemaining = data.daysRemaining;
    }

    return dataPoints;
  }

  /**
   * Identify threshold that triggered recommendation
   */
  identifyThreshold(recommendation) {
    const { type, data } = recommendation;

    const thresholds = {
      budget_overrun: 'Budget utilization threshold: 85%',
      budget_risk: 'Budget variance threshold: 10%',
      schedule_delay: 'Schedule delay threshold: 7 days',
      risk_escalation: 'Risk score threshold: 70',
      governance_gap: 'Compliance requirement: 100%'
    };

    if (thresholds[type]) {
      return thresholds[type];
    }

    if (data && data.threshold) {
      return `Threshold: ${data.threshold}`;
    }

    return 'Standard threshold applied';
  }

  /**
   * Get confidence level description
   */
  getConfidenceLevel(confidence) {
    if (!confidence) return 'unknown';
    if (confidence >= 0.9) return 'very high';
    if (confidence >= 0.75) return 'high';
    if (confidence >= 0.6) return 'medium';
    if (confidence >= 0.4) return 'low';
    return 'very low';
  }

  /**
   * Get factors affecting confidence
   */
  getConfidenceFactors(recommendation) {
    const factors = [];

    if (recommendation.dataQuality === 'high') {
      factors.push('High quality data available');
    }
    if (recommendation.historicalAccuracy) {
      factors.push(`Historical accuracy: ${(recommendation.historicalAccuracy * 100).toFixed(0)}%`);
    }
    if (recommendation.multipleAgents) {
      factors.push('Confirmed by multiple agents');
    }
    if (recommendation.recentData) {
      factors.push('Based on recent data');
    }

    return factors.length > 0 ? factors : ['Based on available data'];
  }

  /**
   * Generate impact description
   */
  generateImpactDescription(recommendation) {
    const { impact, type } = recommendation;

    const impactDescriptions = {
      critical: 'Immediate action required to prevent project failure',
      high: 'Significant impact on project success if not addressed',
      medium: 'Moderate impact on project timeline or budget',
      low: 'Minor impact, but should be monitored'
    };

    return impactDescriptions[impact] || 'Impact assessment pending';
  }

  /**
   * Identify affected areas
   */
  identifyAffectedAreas(recommendation) {
    const areas = [];
    const { type, affectsSchedule, affectsBudget, affectsQuality, affectsRisk } = recommendation;

    if (affectsSchedule || type.includes('schedule')) {
      areas.push('Schedule');
    }
    if (affectsBudget || type.includes('budget')) {
      areas.push('Budget');
    }
    if (affectsQuality || type.includes('quality')) {
      areas.push('Quality');
    }
    if (affectsRisk || type.includes('risk')) {
      areas.push('Risk');
    }

    return areas.length > 0 ? areas : ['Project Health'];
  }

  /**
   * Get urgency level
   */
  getUrgencyLevel(urgency) {
    if (!urgency) return 'normal';
    if (urgency >= 0.9) return 'immediate';
    if (urgency >= 0.7) return 'urgent';
    if (urgency >= 0.5) return 'soon';
    return 'normal';
  }

  /**
   * Estimate timeframe for action
   */
  estimateTimeframe(recommendation) {
    const { urgency, type } = recommendation;

    if (urgency >= 0.9) return 'Within 24 hours';
    if (urgency >= 0.7) return 'Within 3 days';
    if (urgency >= 0.5) return 'Within 1 week';
    return 'Within 2 weeks';
  }

  /**
   * Generate alternative actions
   */
  generateAlternatives(recommendation) {
    const { type } = recommendation;

    // Use template if available
    if (this.explanationTemplates[type]) {
      return this.explanationTemplates[type].alternatives;
    }

    // Generic alternatives
    return [
      'Accept recommendation and proceed',
      'Request additional analysis',
      'Defer decision pending more data',
      'Implement alternative solution'
    ];
  }

  /**
   * Compile evidence supporting recommendation
   */
  compileEvidence(recommendation) {
    const evidence = {
      dataPoints: this.extractDataPoints(recommendation),
      sources: recommendation.sources || ['Agent analysis'],
      timestamp: recommendation.timestamp || new Date().toISOString(),
      agentName: recommendation.agentName || 'Unknown Agent'
    };

    if (recommendation.relatedFindings) {
      evidence.relatedFindings = recommendation.relatedFindings.length;
    }

    if (recommendation.historicalComparison) {
      evidence.historicalComparison = recommendation.historicalComparison;
    }

    return evidence;
  }

  /**
   * Get historical context
   */
  getHistoricalContext(recommendation) {
    const context = {
      previousOccurrences: recommendation.previousOccurrences || 0,
      lastOccurrence: recommendation.lastOccurrence || null,
      resolutionHistory: recommendation.resolutionHistory || []
    };

    if (context.previousOccurrences > 0) {
      context.note = `This issue has occurred ${context.previousOccurrences} time(s) previously`;
    }

    return context;
  }

  /**
   * Generate explanation summary (short version)
   */
  generateSummary(recommendation) {
    const explanation = this.explain(recommendation);
    
    return {
      why: explanation.reasoning.primary,
      confidence: `${(recommendation.confidence * 100).toFixed(0)}% confident`,
      impact: explanation.impact.level,
      urgency: explanation.urgency.level,
      action: recommendation.action || 'Review and decide'
    };
  }

  /**
   * Generate natural language explanation
   */
  generateNaturalLanguage(recommendation) {
    const explanation = this.explain(recommendation);
    
    let text = `${recommendation.agentName || 'Agent'} recommends "${recommendation.title}" `;
    text += `because ${explanation.reasoning.primary}. `;
    
    if (explanation.reasoning.supporting.length > 0) {
      text += `Supporting factors include: ${explanation.reasoning.supporting.join(', ')}. `;
    }
    
    text += `This recommendation has ${explanation.confidence.level} confidence `;
    text += `and ${explanation.impact.level} impact. `;
    
    text += `Action should be taken ${explanation.urgency.timeframe.toLowerCase()}.`;
    
    return text;
  }
}

// Export singleton instance
export const agentExplanationEngine = new AgentExplanationEngine();

export default AgentExplanationEngine;

// Made with Bob