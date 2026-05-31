/**
 * Agent Memory System
 * 
 * Stores and retrieves agent findings, recommendations, and observations
 * across sessions for historical context and learning.
 * 
 * Storage Strategy:
 * - In-memory for current session
 * - LocalStorage for persistence
 * - Future: Database/API integration
 */

export class AgentMemory {
  constructor() {
    this.memoryStore = new Map();
    this.storageKey = 'agent_memory_store';
    this.loadFromStorage();
  }

  /**
   * Store agent execution results
   */
  async storeExecution(projectId, execution) {
    const projectMemory = this.getProjectMemory(projectId);
    
    projectMemory.executions.push({
      timestamp: execution.timestamp,
      agentResults: execution.agentResults,
      aggregatedResults: execution.aggregatedResults,
      executiveBriefing: execution.executiveBriefing
    });

    // Keep only last 10 executions
    if (projectMemory.executions.length > 10) {
      projectMemory.executions = projectMemory.executions.slice(-10);
    }

    this.memoryStore.set(projectId, projectMemory);
    this.saveToStorage();
  }

  /**
   * Get project context from memory
   */
  async getProjectContext(projectId) {
    const projectMemory = this.getProjectMemory(projectId);
    
    if (projectMemory.executions.length === 0) {
      return null;
    }

    // Get last execution
    const lastExecution = projectMemory.executions[projectMemory.executions.length - 1];

    return {
      previousFindings: this.extractFindings(projectMemory.executions),
      previousRecommendations: this.extractRecommendations(projectMemory.executions),
      riskHistory: this.extractRiskHistory(projectMemory.executions),
      lastExecutionDate: lastExecution.timestamp,
      executionCount: projectMemory.executions.length
    };
  }

  /**
   * Get project memory
   */
  getProjectMemory(projectId) {
    if (!this.memoryStore.has(projectId)) {
      this.memoryStore.set(projectId, {
        projectId,
        executions: [],
        observations: [],
        learnings: []
      });
    }
    return this.memoryStore.get(projectId);
  }

  /**
   * Extract findings from execution history
   */
  extractFindings(executions) {
    const findings = [];
    executions.forEach(exec => {
      if (exec.aggregatedResults?.findings) {
        findings.push(...exec.aggregatedResults.findings.map(f => ({
          ...f,
          executionDate: exec.timestamp
        })));
      }
    });
    return findings.slice(-20); // Last 20 findings
  }

  /**
   * Extract recommendations from execution history
   */
  extractRecommendations(executions) {
    const recommendations = [];
    executions.forEach(exec => {
      if (exec.aggregatedResults?.recommendations) {
        recommendations.push(...exec.aggregatedResults.recommendations.map(r => ({
          ...r,
          executionDate: exec.timestamp
        })));
      }
    });
    return recommendations.slice(-20); // Last 20 recommendations
  }

  /**
   * Extract risk history
   */
  extractRiskHistory(executions) {
    return executions.map(exec => ({
      timestamp: exec.timestamp,
      riskScore: exec.executiveBriefing?.keyMetrics?.riskScore,
      healthScore: exec.executiveBriefing?.keyMetrics?.healthScore,
      status: exec.executiveBriefing?.overallStatus
    }));
  }

  /**
   * Store observation
   */
  async storeObservation(projectId, observation) {
    const projectMemory = this.getProjectMemory(projectId);
    projectMemory.observations.push({
      ...observation,
      timestamp: new Date()
    });
    this.saveToStorage();
  }

  /**
   * Store learning
   */
  async storeLearning(projectId, learning) {
    const projectMemory = this.getProjectMemory(projectId);
    projectMemory.learnings.push({
      ...learning,
      timestamp: new Date()
    });
    this.saveToStorage();
  }

  /**
   * Get all project memories
   */
  getAllProjectMemories() {
    return Array.from(this.memoryStore.values());
  }

  /**
   * Clear project memory
   */
  clearProjectMemory(projectId) {
    this.memoryStore.delete(projectId);
    this.saveToStorage();
  }

  /**
   * Clear all memory
   */
  clearAllMemory() {
    this.memoryStore.clear();
    this.saveToStorage();
  }

  /**
   * Save to localStorage
   */
  saveToStorage() {
    try {
      const data = Array.from(this.memoryStore.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save agent memory to storage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const entries = JSON.parse(data);
        this.memoryStore = new Map(entries);
      }
    } catch (error) {
      console.warn('Failed to load agent memory from storage:', error);
    }
  }

  /**
   * Get memory statistics
   */
  getStatistics() {
    const projects = Array.from(this.memoryStore.values());
    return {
      totalProjects: projects.length,
      totalExecutions: projects.reduce((sum, p) => sum + p.executions.length, 0),
      totalObservations: projects.reduce((sum, p) => sum + p.observations.length, 0),
      totalLearnings: projects.reduce((sum, p) => sum + p.learnings.length, 0)
    };
  }
}

// Made with Bob
