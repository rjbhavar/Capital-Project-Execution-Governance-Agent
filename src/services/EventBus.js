/**
 * Event Bus - Pub/Sub System
 * 
 * Enables decoupled communication between agents, services, and components.
 * Supports event publishing, subscription, and filtering.
 */

class EventBus {
  constructor() {
    this.subscribers = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Subscribe to events
   */
  subscribe(eventType, callback, filter = null) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }

    const subscription = {
      id: `sub-${Date.now()}-${Math.random()}`,
      callback,
      filter,
      subscribedAt: new Date()
    };

    this.subscribers.get(eventType).push(subscription);

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, subscription.id);
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(eventType, subscriptionId) {
    if (!this.subscribers.has(eventType)) return;

    const subs = this.subscribers.get(eventType);
    const index = subs.findIndex(s => s.id === subscriptionId);
    
    if (index !== -1) {
      subs.splice(index, 1);
    }

    if (subs.length === 0) {
      this.subscribers.delete(eventType);
    }
  }

  /**
   * Publish an event
   */
  async publish(eventType, data, metadata = {}) {
    const event = {
      type: eventType,
      data,
      metadata: {
        ...metadata,
        timestamp: new Date(),
        eventId: `evt-${Date.now()}-${Math.random()}`
      }
    };

    // Store in history
    this.addToHistory(event);

    // Notify subscribers
    if (this.subscribers.has(eventType)) {
      const subscribers = this.subscribers.get(eventType);
      
      for (const sub of subscribers) {
        try {
          // Apply filter if present
          if (sub.filter && !sub.filter(event)) {
            continue;
          }

          // Call subscriber callback
          await sub.callback(event);
        } catch (error) {
          console.error(`EventBus: Error in subscriber for ${eventType}:`, error);
        }
      }
    }

    return event;
  }

  /**
   * Publish multiple events
   */
  async publishBatch(events) {
    const results = [];
    for (const { eventType, data, metadata } of events) {
      const result = await this.publish(eventType, data, metadata);
      results.push(result);
    }
    return results;
  }

  /**
   * Get event history
   */
  getHistory(filter = null) {
    if (!filter) return [...this.eventHistory];

    return this.eventHistory.filter(event => {
      if (filter.eventType && event.type !== filter.eventType) return false;
      if (filter.since && new Date(event.metadata.timestamp) < new Date(filter.since)) return false;
      if (filter.until && new Date(event.metadata.timestamp) > new Date(filter.until)) return false;
      return true;
    });
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = [];
  }

  /**
   * Add event to history
   */
  addToHistory(event) {
    this.eventHistory.push(event);

    // Maintain max history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get subscriber count for event type
   */
  getSubscriberCount(eventType) {
    return this.subscribers.has(eventType) ? this.subscribers.get(eventType).length : 0;
  }

  /**
   * Get all event types
   */
  getEventTypes() {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Clear all subscribers
   */
  clearSubscribers() {
    this.subscribers.clear();
  }
}

/**
 * Event Types - Standard event catalog
 */
export const EventTypes = {
  // Project Events
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  PROJECT_STATUS_CHANGED: 'project.status_changed',
  PROJECT_PHASE_CHANGED: 'project.phase_changed',

  // Budget Events
  BUDGET_CREATED: 'budget.created',
  BUDGET_UPDATED: 'budget.updated',
  BUDGET_EXCEEDED: 'budget.exceeded',
  BUDGET_WARNING: 'budget.warning',

  // Funding Events
  FUNDING_REQUESTED: 'funding.requested',
  FUNDING_APPROVED: 'funding.approved',
  FUNDING_REJECTED: 'funding.rejected',

  // Contract Events
  CONTRACT_CREATED: 'contract.created',
  CONTRACT_EXECUTED: 'contract.executed',
  CONTRACT_EXPIRED: 'contract.expired',

  // Invoice Events
  INVOICE_RECEIVED: 'invoice.received',
  INVOICE_APPROVED: 'invoice.approved',
  INVOICE_REJECTED: 'invoice.rejected',
  INVOICE_PAID: 'invoice.paid',

  // Payment Events
  PAYMENT_SCHEDULED: 'payment.scheduled',
  PAYMENT_PROCESSED: 'payment.processed',
  PAYMENT_FAILED: 'payment.failed',

  // Risk Events
  RISK_IDENTIFIED: 'risk.identified',
  RISK_ESCALATED: 'risk.escalated',
  RISK_MITIGATED: 'risk.mitigated',

  // Approval Events
  APPROVAL_REQUESTED: 'approval.requested',
  APPROVAL_GRANTED: 'approval.granted',
  APPROVAL_DENIED: 'approval.denied',

  // Agent Events
  AGENT_STARTED: 'agent.started',
  AGENT_COMPLETED: 'agent.completed',
  AGENT_FAILED: 'agent.failed',
  AGENT_FINDING: 'agent.finding',
  AGENT_RECOMMENDATION: 'agent.recommendation',

  // Workflow Events
  WORKFLOW_STARTED: 'workflow.started',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_FAILED: 'workflow.failed',

  // Notification Events
  NOTIFICATION_SENT: 'notification.sent',
  ALERT_TRIGGERED: 'alert.triggered',

  // Audit Events
  AUDIT_LOG_CREATED: 'audit.log_created',

  // System Events
  SYSTEM_ERROR: 'system.error',
  SYSTEM_WARNING: 'system.warning'
};

// Export singleton instance
export const eventBus = new EventBus();

export default eventBus;

// Made with Bob
