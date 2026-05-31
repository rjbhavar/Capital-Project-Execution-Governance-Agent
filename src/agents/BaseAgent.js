/**
 * Base Agent Class
 * 
 * Abstract base class for all specialized agents.
 * Provides common functionality and interface.
 * 
 * Future-ready architecture:
 * - Abstraction layer for LLM integration (OpenAI, WatsonX, Granite)
 * - Pluggable execution strategies
 * - Standardized input/output format
 */

export class BaseAgent {
  constructor(name, description, capabilities = []) {
    this.name = name;
    this.description = description;
    this.capabilities = capabilities;
    this.version = '1.0.0';
    this.status = 'idle'; // idle, running, completed, error
    this.executionHistory = [];
  }

  /**
   * Execute agent (must be implemented by subclasses)
   * @param {Object} context - Shared context from orchestrator
   * @returns {Object} Agent execution result
   */
  async execute(context) {
    throw new Error(`execute() must be implemented by ${this.name}`);
  }

  /**
   * Analyze context (helper method)
   */
  analyzeContext(context) {
    return {
      project: context.project,
      budget: context.budget,
      proposal: context.proposal,
      contracts: context.contracts,
      payments: context.payments,
      historical: context.historical,
      agentFindings: context.agentFindings
    };
  }

  /**
   * Generate finding
   */
  createFinding(type, title, description, severity = 'medium', data = {}) {
    return {
      type,
      title,
      description,
      severity, // low, medium, high, critical
      data,
      agent: this.name,
      timestamp: new Date()
    };
  }

  /**
   * Generate recommendation
   */
  createRecommendation(title, description, action, priority = 'medium', category = null) {
    return {
      title,
      description,
      action,
      priority, // low, medium, high, critical
      category: category || this.name,
      agent: this.name,
      timestamp: new Date()
    };
  }

  /**
   * Generate risk
   */
  createRisk(title, description, severity, likelihood, impact, mitigation = null) {
    return {
      title,
      description,
      severity, // low, medium, high, critical
      likelihood, // low, medium, high
      impact, // low, medium, high
      mitigation,
      agent: this.name,
      timestamp: new Date()
    };
  }

  /**
   * Generate insight
   */
  createInsight(title, description, type = 'observation', confidence = 'medium') {
    return {
      title,
      description,
      type, // observation, prediction, recommendation, alert
      confidence, // low, medium, high
      agent: this.name,
      timestamp: new Date()
    };
  }

  /**
   * Log execution
   */
  logExecution(context, result) {
    this.executionHistory.push({
      timestamp: new Date(),
      projectId: context.project.id,
      result: {
        findingsCount: result.findings?.length || 0,
        recommendationsCount: result.recommendations?.length || 0,
        risksCount: result.risks?.length || 0,
        insightsCount: result.insights?.length || 0
      }
    });

    // Keep only last 100 executions
    if (this.executionHistory.length > 100) {
      this.executionHistory = this.executionHistory.slice(-100);
    }
  }

  /**
   * Get agent metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: this.description,
      capabilities: this.capabilities,
      version: this.version,
      status: this.status,
      executionCount: this.executionHistory.length
    };
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  }

  /**
   * Calculate percentage
   */
  calculatePercentage(value, total) {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  /**
   * Format date
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Calculate days between dates
   */
  daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if date is in past
   */
  isDatePast(dateString) {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  }

  /**
   * Future: LLM Integration Point
   * This method can be overridden to integrate with LLMs
   */
  async queryLLM(prompt, options = {}) {
    // Placeholder for future LLM integration
    // Can be implemented with OpenAI, WatsonX, Granite, etc.
    console.log(`[${this.name}] LLM Query:`, prompt);
    return {
      response: 'LLM integration not yet implemented',
      model: options.model || 'none',
      tokens: 0
    };
  }

  /**
   * Future: Vector Store Integration Point
   * For RAG (Retrieval Augmented Generation)
   */
  async queryVectorStore(query, options = {}) {
    // Placeholder for future vector store integration
    console.log(`[${this.name}] Vector Store Query:`, query);
    return {
      results: [],
      similarity: []
    };
  }
}

// Made with Bob
