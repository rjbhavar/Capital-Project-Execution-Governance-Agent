/**
 * Base Agent Class
 *
 * Abstract base class for all specialized agents.
 * Provides common functionality and interface.
 *
 * Production-ready architecture:
 * - ResilienceService integration (retry, circuit breaker, fallback)
 * - Comprehensive error handling and recovery
 * - Audit logging and execution tracking
 * - Escalation and approval workflows
 * - Future-ready for LLM integration (OpenAI, WatsonX, Granite)
 */

import { resilienceService, RetryStrategies } from '../services/ResilienceService';
import { auditService } from '../services/AuditService';

export class BaseAgent {
  constructor(name, description, capabilities = []) {
    this.name = name;
    this.description = description;
    this.capabilities = capabilities;
    this.version = '1.0.0';
    this.status = 'idle'; // idle, running, completed, error
    this.executionHistory = [];
    this.failureHistory = [];
    this.approvalHistory = [];
    
    // Resilience configuration
    this.resilienceConfig = {
      retry: true,
      circuitBreaker: true,
      maxRetries: 3,
      retryDelay: 1000,
      circuitBreakerThreshold: 5,
      timeout: 30000
    };
  }

  /**
   * Execute agent with full resilience (PRODUCTION-READY)
   * Wraps agent execution with retry, circuit breaker, audit, and error handling
   * @param {Object} context - Shared context from orchestrator
   * @returns {Object} Agent execution result
   */
  async executeResilient(context) {
    const executionId = `${this.name}-${Date.now()}`;
    const startTime = Date.now();
    
    this.status = 'running';
    
    try {
      // Audit: Log execution start
      await auditService.logAgentExecution({
        agentName: this.name,
        executionId,
        projectId: context.project?.id,
        action: 'start',
        timestamp: new Date()
      });
      
      // Execute with resilience patterns
      const result = await resilienceService.executeResilient(
        () => this.execute(context),
        {
          key: this.name,
          retry: this.resilienceConfig.retry,
          circuitBreaker: this.resilienceConfig.circuitBreaker,
          timeout: this.resilienceConfig.timeout,
          retryOptions: {
            maxRetries: this.resilienceConfig.maxRetries,
            delayMs: this.resilienceConfig.retryDelay,
            backoffMultiplier: 2,
            onRetry: (error, attempt, delay) => {
              console.warn(`[${this.name}] Retry attempt ${attempt} after ${delay}ms:`, error.message);
              this.logRetry(executionId, attempt, error);
            }
          },
          circuitBreakerOptions: {
            failureThreshold: this.resilienceConfig.circuitBreakerThreshold,
            resetTimeout: 60000,
            onOpen: () => {
              console.error(`[${this.name}] Circuit breaker opened`);
              this.logCircuitBreakerOpen(executionId);
            }
          },
          fallback: (error) => this.handleFallback(context, error)
        }
      );
      
      this.status = 'completed';
      const duration = Date.now() - startTime;
      
      // Log successful execution
      this.logExecution(context, result, duration);
      
      // Audit: Log execution success
      await auditService.logAgentExecution({
        agentName: this.name,
        executionId,
        projectId: context.project?.id,
        action: 'success',
        duration,
        result: {
          findingsCount: result.findings?.length || 0,
          recommendationsCount: result.recommendations?.length || 0
        },
        timestamp: new Date()
      });
      
      return result;
      
    } catch (error) {
      this.status = 'error';
      const duration = Date.now() - startTime;
      
      // Log failure
      this.logFailure(executionId, error, context);
      
      // Audit: Log execution failure
      await auditService.logAgentExecution({
        agentName: this.name,
        executionId,
        projectId: context.project?.id,
        action: 'failure',
        duration,
        error: error.message,
        timestamp: new Date()
      });
      
      // Escalate if critical
      if (this.shouldEscalate(error, context)) {
        await this.escalate(error, context, executionId);
      }
      
      // Re-throw to allow orchestrator to handle
      throw error;
    }
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
   * Handle fallback when primary execution fails
   */
  async handleFallback(context, error) {
    console.warn(`[${this.name}] Using fallback due to error:`, error.message);
    
    return {
      findings: [],
      recommendations: [{
        title: `${this.name} Execution Failed`,
        description: `Agent encountered an error: ${error.message}. Using fallback response.`,
        action: 'Review agent logs and retry',
        priority: 'high',
        category: 'System',
        agent: this.name,
        timestamp: new Date()
      }],
      risks: [],
      insights: [],
      fallback: true,
      error: error.message
    };
  }

  /**
   * Log retry attempt
   */
  logRetry(executionId, attempt, error) {
    if (!this.retryHistory) this.retryHistory = [];
    
    this.retryHistory.push({
      executionId,
      attempt,
      error: error.message,
      timestamp: new Date()
    });
    
    // Keep only last 100 retries
    if (this.retryHistory.length > 100) {
      this.retryHistory = this.retryHistory.slice(-100);
    }
  }

  /**
   * Log circuit breaker open
   */
  logCircuitBreakerOpen(executionId) {
    if (!this.circuitBreakerHistory) this.circuitBreakerHistory = [];
    
    this.circuitBreakerHistory.push({
      executionId,
      event: 'opened',
      timestamp: new Date()
    });
  }

  /**
   * Log failure
   */
  logFailure(executionId, error, context) {
    this.failureHistory.push({
      executionId,
      projectId: context.project?.id,
      error: error.message,
      stack: error.stack,
      timestamp: new Date()
    });
    
    // Keep only last 100 failures
    if (this.failureHistory.length > 100) {
      this.failureHistory = this.failureHistory.slice(-100);
    }
  }

  /**
   * Determine if error should be escalated
   */
  shouldEscalate(error, context) {
    // Escalate if:
    // 1. Multiple consecutive failures
    // 2. Critical project
    // 3. High-value budget
    
    const recentFailures = this.failureHistory.filter(f =>
      Date.now() - f.timestamp.getTime() < 3600000 // Last hour
    ).length;
    
    if (recentFailures >= 3) return true;
    
    if (context.project?.priority === 'High') return true;
    
    if (context.project?.budget > 5000000) return true;
    
    return false;
  }

  /**
   * Escalate failure to human oversight
   */
  async escalate(error, context, executionId) {
    console.error(`[${this.name}] ESCALATING: ${error.message}`);
    
    // Log escalation
    await auditService.logEscalation({
      agentName: this.name,
      executionId,
      projectId: context.project?.id,
      error: error.message,
      reason: 'Multiple failures or critical project',
      timestamp: new Date()
    });
    
    // In production, this would trigger notifications, create tickets, etc.
    // For now, just log
    console.error(`[${this.name}] Escalation logged for execution ${executionId}`);
  }

  /**
   * Request approval for agent action
   */
  async requestApproval(action, context, reason) {
    const approvalId = `${this.name}-approval-${Date.now()}`;
    
    const approval = {
      approvalId,
      agentName: this.name,
      action,
      reason,
      projectId: context.project?.id,
      status: 'pending',
      requestedAt: new Date()
    };
    
    this.approvalHistory.push(approval);
    
    // Audit approval request
    await auditService.logApprovalRequest(approval);
    
    return approvalId;
  }

  /**
   * Get agent health status
   */
  getHealthStatus() {
    const recentFailures = this.failureHistory.filter(f =>
      Date.now() - f.timestamp.getTime() < 3600000
    ).length;
    
    const circuitBreakerStatus = resilienceService.getCircuitBreakerStatus(this.name);
    
    return {
      agent: this.name,
      status: this.status,
      health: recentFailures === 0 ? 'healthy' : recentFailures < 3 ? 'degraded' : 'unhealthy',
      recentFailures,
      circuitBreaker: circuitBreakerStatus?.state || 'closed',
      executionCount: this.executionHistory.length,
      lastExecution: this.executionHistory[this.executionHistory.length - 1]?.timestamp
    };
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
  logExecution(context, result, duration) {
    this.executionHistory.push({
      timestamp: new Date(),
      projectId: context.project?.id,
      duration,
      result: {
        findingsCount: result.findings?.length || 0,
        recommendationsCount: result.recommendations?.length || 0,
        risksCount: result.risks?.length || 0,
        insightsCount: result.insights?.length || 0,
        fallback: result.fallback || false
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
