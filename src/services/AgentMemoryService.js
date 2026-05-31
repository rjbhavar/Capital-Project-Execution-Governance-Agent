/**
 * AgentMemoryService - Shared memory system for all agents
 * 
 * Stores:
 * - Agent findings
 * - Agent recommendations
 * - Execution history
 * - Project observations
 * - Agent collaboration notes
 * - Cross-agent insights
 */

class AgentMemoryService {
  constructor() {
    this.storageKey = 'agent_memory';
    this.memory = this.loadMemory();
  }

  /**
   * Load memory from localStorage
   */
  loadMemory() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.initializeMemory();
    } catch (error) {
      console.error('Failed to load agent memory:', error);
      return this.initializeMemory();
    }
  }

  /**
   * Initialize empty memory structure
   */
  initializeMemory() {
    return {
      executions: {},           // executionId -> execution data
      projectFindings: {},      // projectId -> findings[]
      projectRecommendations: {}, // projectId -> recommendations[]
      projectObservations: {},  // projectId -> observations[]
      agentResults: {},         // projectId -> agentName -> results
      collaborationNotes: {},   // projectId -> notes[]
      crossAgentInsights: {},   // projectId -> insights[]
      patterns: [],             // Detected patterns across projects
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      }
    };
  }

  /**
   * Save memory to localStorage
   */
  saveMemory() {
    try {
      this.memory.metadata.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.memory));
    } catch (error) {
      console.error('Failed to save agent memory:', error);
    }
  }

  /**
   * Store agent execution
   */
  async storeExecution(executionId, executionData) {
    this.memory.executions[executionId] = {
      ...executionData,
      timestamp: new Date().toISOString()
    };
    this.saveMemory();
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId) {
    return this.memory.executions[executionId];
  }

  /**
   * Get execution history for a project
   */
  getExecutionHistory(projectId, limit = 10) {
    const executions = Object.values(this.memory.executions)
      .filter(exec => exec.projectId === projectId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    
    return executions;
  }

  /**
   * Store findings for a project
   */
  async storeFindings(projectId, findings) {
    if (!this.memory.projectFindings[projectId]) {
      this.memory.projectFindings[projectId] = [];
    }

    // Add timestamp to each finding
    const timestampedFindings = findings.map(f => ({
      ...f,
      storedAt: new Date().toISOString()
    }));

    // Keep only last 50 findings per project
    this.memory.projectFindings[projectId] = [
      ...timestampedFindings,
      ...this.memory.projectFindings[projectId]
    ].slice(0, 50);

    this.saveMemory();
  }

  /**
   * Get findings for a project
   */
  getFindings(projectId, options = {}) {
    const findings = this.memory.projectFindings[projectId] || [];
    
    let filtered = findings;

    // Filter by agent
    if (options.agentName) {
      filtered = filtered.filter(f => f.agentName === options.agentName);
    }

    // Filter by severity
    if (options.severity) {
      filtered = filtered.filter(f => f.severity === options.severity);
    }

    // Filter by type
    if (options.type) {
      filtered = filtered.filter(f => f.type === options.type);
    }

    // Limit results
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Store recommendations for a project
   */
  async storeRecommendations(projectId, recommendations) {
    if (!this.memory.projectRecommendations[projectId]) {
      this.memory.projectRecommendations[projectId] = [];
    }

    const timestampedRecommendations = recommendations.map(r => ({
      ...r,
      storedAt: new Date().toISOString()
    }));

    // Keep only last 50 recommendations per project
    this.memory.projectRecommendations[projectId] = [
      ...timestampedRecommendations,
      ...this.memory.projectRecommendations[projectId]
    ].slice(0, 50);

    this.saveMemory();
  }

  /**
   * Get recommendations for a project
   */
  getRecommendations(projectId, options = {}) {
    const recommendations = this.memory.projectRecommendations[projectId] || [];
    
    let filtered = recommendations;

    // Filter by agent
    if (options.agentName) {
      filtered = filtered.filter(r => r.agentName === options.agentName);
    }

    // Filter by priority
    if (options.priority) {
      filtered = filtered.filter(r => r.priority === options.priority);
    }

    // Filter by confidence threshold
    if (options.minConfidence) {
      filtered = filtered.filter(r => r.confidence >= options.minConfidence);
    }

    // Limit results
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Store agent-specific result
   */
  async storeAgentResult(projectId, agentName, result) {
    if (!this.memory.agentResults[projectId]) {
      this.memory.agentResults[projectId] = {};
    }

    this.memory.agentResults[projectId][agentName] = {
      ...result,
      timestamp: new Date().toISOString()
    };

    this.saveMemory();
  }

  /**
   * Get agent result for a project
   */
  getAgentResult(projectId, agentName) {
    return this.memory.agentResults[projectId]?.[agentName];
  }

  /**
   * Get all agent results for a project
   */
  getAllAgentResults(projectId) {
    return this.memory.agentResults[projectId] || {};
  }

  /**
   * Store observation about a project
   */
  async storeObservation(projectId, observation) {
    if (!this.memory.projectObservations[projectId]) {
      this.memory.projectObservations[projectId] = [];
    }

    this.memory.projectObservations[projectId].push({
      ...observation,
      timestamp: new Date().toISOString()
    });

    // Keep only last 100 observations
    this.memory.projectObservations[projectId] = 
      this.memory.projectObservations[projectId].slice(-100);

    this.saveMemory();
  }

  /**
   * Get observations for a project
   */
  getObservations(projectId, limit = 20) {
    const observations = this.memory.projectObservations[projectId] || [];
    return observations.slice(-limit);
  }

  /**
   * Store collaboration note (cross-agent insight)
   */
  async storeCollaborationNote(projectId, note) {
    if (!this.memory.collaborationNotes[projectId]) {
      this.memory.collaborationNotes[projectId] = [];
    }

    this.memory.collaborationNotes[projectId].push({
      ...note,
      timestamp: new Date().toISOString()
    });

    this.saveMemory();
  }

  /**
   * Get collaboration notes for a project
   */
  getCollaborationNotes(projectId) {
    return this.memory.collaborationNotes[projectId] || [];
  }

  /**
   * Store cross-agent insight
   */
  async storeCrossAgentInsight(projectId, insight) {
    if (!this.memory.crossAgentInsights[projectId]) {
      this.memory.crossAgentInsights[projectId] = [];
    }

    this.memory.crossAgentInsights[projectId].push({
      ...insight,
      timestamp: new Date().toISOString()
    });

    this.saveMemory();
  }

  /**
   * Get cross-agent insights for a project
   */
  getCrossAgentInsights(projectId) {
    return this.memory.crossAgentInsights[projectId] || [];
  }

  /**
   * Detect patterns across projects
   */
  detectPatterns() {
    const patterns = [];

    // Analyze findings across all projects
    const allFindings = Object.values(this.memory.projectFindings).flat();
    
    // Group by type
    const findingsByType = {};
    allFindings.forEach(finding => {
      if (!findingsByType[finding.type]) {
        findingsByType[finding.type] = [];
      }
      findingsByType[finding.type].push(finding);
    });

    // Identify recurring patterns
    for (const [type, findings] of Object.entries(findingsByType)) {
      if (findings.length >= 3) {
        patterns.push({
          type: 'recurring_issue',
          issueType: type,
          occurrences: findings.length,
          projects: [...new Set(findings.map(f => f.projectId))],
          severity: this.calculateAverageSeverity(findings),
          detectedAt: new Date().toISOString()
        });
      }
    }

    this.memory.patterns = patterns;
    this.saveMemory();

    return patterns;
  }

  /**
   * Calculate average severity
   */
  calculateAverageSeverity(findings) {
    const severityScores = { critical: 4, high: 3, medium: 2, low: 1 };
    const avgScore = findings.reduce((sum, f) => sum + (severityScores[f.severity] || 0), 0) / findings.length;
    
    if (avgScore >= 3.5) return 'critical';
    if (avgScore >= 2.5) return 'high';
    if (avgScore >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Get detected patterns
   */
  getPatterns() {
    return this.memory.patterns;
  }

  /**
   * Get project context (all memory for a project)
   */
  getProjectContext(projectId) {
    return {
      findings: this.getFindings(projectId),
      recommendations: this.getRecommendations(projectId),
      observations: this.getObservations(projectId),
      agentResults: this.getAllAgentResults(projectId),
      collaborationNotes: this.getCollaborationNotes(projectId),
      crossAgentInsights: this.getCrossAgentInsights(projectId),
      executionHistory: this.getExecutionHistory(projectId)
    };
  }

  /**
   * Search memory across all projects
   */
  search(query, options = {}) {
    const results = {
      findings: [],
      recommendations: [],
      observations: []
    };

    const searchText = query.toLowerCase();

    // Search findings
    Object.values(this.memory.projectFindings).flat().forEach(finding => {
      if (finding.title?.toLowerCase().includes(searchText) ||
          finding.description?.toLowerCase().includes(searchText)) {
        results.findings.push(finding);
      }
    });

    // Search recommendations
    Object.values(this.memory.projectRecommendations).flat().forEach(rec => {
      if (rec.title?.toLowerCase().includes(searchText) ||
          rec.description?.toLowerCase().includes(searchText)) {
        results.recommendations.push(rec);
      }
    });

    // Search observations
    Object.values(this.memory.projectObservations).flat().forEach(obs => {
      if (obs.note?.toLowerCase().includes(searchText) ||
          obs.description?.toLowerCase().includes(searchText)) {
        results.observations.push(obs);
      }
    });

    return results;
  }

  /**
   * Clear memory for a specific project
   */
  clearProjectMemory(projectId) {
    delete this.memory.projectFindings[projectId];
    delete this.memory.projectRecommendations[projectId];
    delete this.memory.projectObservations[projectId];
    delete this.memory.agentResults[projectId];
    delete this.memory.collaborationNotes[projectId];
    delete this.memory.crossAgentInsights[projectId];

    // Remove executions for this project
    Object.keys(this.memory.executions).forEach(execId => {
      if (this.memory.executions[execId].projectId === projectId) {
        delete this.memory.executions[execId];
      }
    });

    this.saveMemory();
  }

  /**
   * Clear all memory
   */
  clearAllMemory() {
    this.memory = this.initializeMemory();
    this.saveMemory();
  }

  /**
   * Export memory for backup
   */
  exportMemory() {
    return JSON.stringify(this.memory, null, 2);
  }

  /**
   * Import memory from backup
   */
  importMemory(memoryJson) {
    try {
      this.memory = JSON.parse(memoryJson);
      this.saveMemory();
      return true;
    } catch (error) {
      console.error('Failed to import memory:', error);
      return false;
    }
  }

  /**
   * Get memory statistics
   */
  getStatistics() {
    return {
      totalExecutions: Object.keys(this.memory.executions).length,
      totalProjects: new Set([
        ...Object.keys(this.memory.projectFindings),
        ...Object.keys(this.memory.projectRecommendations),
        ...Object.keys(this.memory.agentResults)
      ]).size,
      totalFindings: Object.values(this.memory.projectFindings).flat().length,
      totalRecommendations: Object.values(this.memory.projectRecommendations).flat().length,
      totalObservations: Object.values(this.memory.projectObservations).flat().length,
      totalPatterns: this.memory.patterns.length,
      lastUpdated: this.memory.metadata.lastUpdated
    };
  }
}

// Export singleton instance
export const agentMemory = new AgentMemoryService();

export default AgentMemoryService;

// Made with Bob
