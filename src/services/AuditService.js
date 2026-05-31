/**
 * Audit Service
 * 
 * Comprehensive audit logging for compliance and security.
 * Tracks all user actions, system events, and data changes.
 */

import { eventBus, EventTypes } from './EventBus';

class AuditService {
  constructor() {
    this.auditLogs = [];
    this.maxLogSize = 10000;
    this.retentionDays = 90;
  }

  /**
   * Log audit entry
   */
  log(entry) {
    const auditEntry = {
      id: `audit-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      ...entry
    };

    this.auditLogs.unshift(auditEntry);

    // Maintain max log size
    if (this.auditLogs.length > this.maxLogSize) {
      this.auditLogs = this.auditLogs.slice(0, this.maxLogSize);
    }

    // Publish event
    eventBus.publish(EventTypes.AUDIT_LOG_CREATED, auditEntry);

    // In production, send to audit database
    console.log('AUDIT:', auditEntry);

    return auditEntry;
  }

  /**
   * Log user action
   */
  logUserAction(userId, userName, action, resource, details = {}) {
    return this.log({
      type: 'user_action',
      userId,
      userName,
      action,
      resource,
      details,
      severity: 'info'
    });
  }

  /**
   * Log data access
   */
  logDataAccess(userId, userName, resource, resourceId, action) {
    return this.log({
      type: 'data_access',
      userId,
      userName,
      resource,
      resourceId,
      action,
      severity: 'info'
    });
  }

  /**
   * Log data modification
   */
  logDataModification(userId, userName, resource, resourceId, action, before, after) {
    return this.log({
      type: 'data_modification',
      userId,
      userName,
      resource,
      resourceId,
      action,
      before,
      after,
      severity: 'medium'
    });
  }

  /**
   * Log security event
   */
  logSecurityEvent(userId, userName, event, details = {}) {
    return this.log({
      type: 'security',
      userId,
      userName,
      event,
      details,
      severity: 'high'
    });
  }

  /**
   * Log authentication event
   */
  logAuthentication(userId, userName, action, success, details = {}) {
    return this.log({
      type: 'authentication',
      userId,
      userName,
      action,
      success,
      details,
      severity: success ? 'info' : 'high'
    });
  }

  /**
   * Log authorization event
   */
  logAuthorization(userId, userName, resource, action, granted, reason = null) {
    return this.log({
      type: 'authorization',
      userId,
      userName,
      resource,
      action,
      granted,
      reason,
      severity: granted ? 'info' : 'medium'
    });
  }

  /**
   * Log system event
   */
  logSystemEvent(event, details = {}) {
    return this.log({
      type: 'system',
      event,
      details,
      severity: 'info'
    });
  }

  /**
   * Log error
   */
  logError(error, context = {}) {
    return this.log({
      type: 'error',
      error: error.message,
      stack: error.stack,
      context,
      severity: 'high'
    });
  }

  /**
   * Log agent execution
   */
  logAgentExecution(agentName, projectId, action, result, duration) {
    return this.log({
      type: 'agent_execution',
      agentName,
      projectId,
      action,
      result,
      duration,
      severity: 'info'
    });
  }

  /**
   * Log workflow execution
   */
  logWorkflowExecution(workflowId, instanceId, status, details = {}) {
    return this.log({
      type: 'workflow_execution',
      workflowId,
      instanceId,
      status,
      details,
      severity: 'info'
    });
  }

  /**
   * Log approval action
   */
  logApproval(userId, userName, approvalId, action, reason = null) {
    return this.log({
      type: 'approval',
      userId,
      userName,
      approvalId,
      action,
      reason,
      severity: 'medium'
    });
  }

  /**
   * Log financial transaction
   */
  logFinancialTransaction(userId, userName, transactionType, amount, details = {}) {
    return this.log({
      type: 'financial_transaction',
      userId,
      userName,
      transactionType,
      amount,
      details,
      severity: 'high'
    });
  }

  /**
   * Log contract action
   */
  logContractAction(userId, userName, contractId, action, details = {}) {
    return this.log({
      type: 'contract_action',
      userId,
      userName,
      contractId,
      action,
      details,
      severity: 'medium'
    });
  }

  /**
   * Log budget change
   */
  logBudgetChange(userId, userName, budgetId, changeType, amount, details = {}) {
    return this.log({
      type: 'budget_change',
      userId,
      userName,
      budgetId,
      changeType,
      amount,
      details,
      severity: 'high'
    });
  }

  /**
   * Get audit logs
   */
  getLogs(filter = {}) {
    let logs = [...this.auditLogs];

    if (filter.type) {
      logs = logs.filter(log => log.type === filter.type);
    }

    if (filter.userId) {
      logs = logs.filter(log => log.userId === filter.userId);
    }

    if (filter.resource) {
      logs = logs.filter(log => log.resource === filter.resource);
    }

    if (filter.severity) {
      logs = logs.filter(log => log.severity === filter.severity);
    }

    if (filter.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(filter.startDate));
    }

    if (filter.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(filter.endDate));
    }

    if (filter.limit) {
      logs = logs.slice(0, filter.limit);
    }

    return logs;
  }

  /**
   * Get audit trail for resource
   */
  getResourceAuditTrail(resource, resourceId) {
    return this.auditLogs.filter(log => 
      log.resource === resource && log.resourceId === resourceId
    );
  }

  /**
   * Get user activity
   */
  getUserActivity(userId, startDate = null, endDate = null) {
    let logs = this.auditLogs.filter(log => log.userId === userId);

    if (startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(endDate));
    }

    return logs;
  }

  /**
   * Get security events
   */
  getSecurityEvents(startDate = null, endDate = null) {
    let logs = this.auditLogs.filter(log => 
      log.type === 'security' || log.severity === 'high'
    );

    if (startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(endDate));
    }

    return logs;
  }

  /**
   * Generate audit report
   */
  generateReport(startDate, endDate, options = {}) {
    const logs = this.getLogs({ startDate, endDate });

    const report = {
      period: { startDate, endDate },
      totalEvents: logs.length,
      byType: {},
      bySeverity: {},
      byUser: {},
      topUsers: [],
      securityEvents: logs.filter(log => log.type === 'security').length,
      failedAuthentications: logs.filter(log => 
        log.type === 'authentication' && !log.success
      ).length,
      deniedAuthorizations: logs.filter(log => 
        log.type === 'authorization' && !log.granted
      ).length
    };

    // Count by type
    logs.forEach(log => {
      report.byType[log.type] = (report.byType[log.type] || 0) + 1;
      report.bySeverity[log.severity] = (report.bySeverity[log.severity] || 0) + 1;
      if (log.userId) {
        report.byUser[log.userId] = (report.byUser[log.userId] || 0) + 1;
      }
    });

    // Top users
    report.topUsers = Object.entries(report.byUser)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));

    return report;
  }

  /**
   * Export audit logs
   */
  exportLogs(format = 'json', filter = {}) {
    const logs = this.getLogs(filter);

    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2);
      case 'csv':
        return this.convertToCSV(logs);
      default:
        return logs;
    }
  }

  /**
   * Convert logs to CSV
   */
  convertToCSV(logs) {
    if (logs.length === 0) return '';

    const headers = ['timestamp', 'type', 'userId', 'userName', 'action', 'resource', 'severity'];
    const rows = logs.map(log => 
      headers.map(header => log[header] || '').join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Clear old logs (retention policy)
   */
  applyRetentionPolicy() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    this.auditLogs = this.auditLogs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );
  }

  /**
   * Clear all logs (admin only)
   */
  clearAll() {
    this.auditLogs = [];
  }
}

// Export singleton instance
export const auditService = new AuditService();

export default auditService;

// Made with Bob
