/**
 * Notification Service
 * 
 * Manages notifications, alerts, and user communications.
 * Supports multiple channels: in-app, email, SMS, push.
 */

import { eventBus, EventTypes } from './EventBus';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.subscribers = new Map();
    this.channels = {
      inApp: true,
      email: false, // Would be enabled in production
      sms: false,   // Would be enabled in production
      push: false   // Would be enabled in production
    };
  }

  /**
   * Send notification
   */
  async send(notification) {
    const enrichedNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
      ...notification
    };

    // Store notification
    this.notifications.unshift(enrichedNotification);

    // Limit stored notifications
    if (this.notifications.length > 1000) {
      this.notifications = this.notifications.slice(0, 1000);
    }

    // Publish event
    await eventBus.publish(EventTypes.NOTIFICATION_SENT, enrichedNotification);

    // Send through enabled channels
    if (this.channels.inApp) {
      this.sendInApp(enrichedNotification);
    }
    if (this.channels.email) {
      await this.sendEmail(enrichedNotification);
    }
    if (this.channels.sms) {
      await this.sendSMS(enrichedNotification);
    }
    if (this.channels.push) {
      await this.sendPush(enrichedNotification);
    }

    return enrichedNotification;
  }

  /**
   * Send in-app notification
   */
  sendInApp(notification) {
    const userId = notification.userId;
    if (this.subscribers.has(userId)) {
      const callbacks = this.subscribers.get(userId);
      callbacks.forEach(callback => callback(notification));
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(notification) {
    console.log('EMAIL:', notification);
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
  }

  /**
   * Send SMS notification
   */
  async sendSMS(notification) {
    console.log('SMS:', notification);
    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
  }

  /**
   * Send push notification
   */
  async sendPush(notification) {
    console.log('PUSH:', notification);
    // In production, integrate with push service (Firebase, OneSignal, etc.)
  }

  /**
   * Subscribe to notifications
   */
  subscribe(userId, callback) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, []);
    }
    this.subscribers.get(userId).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(userId);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get notifications for user
   */
  getNotifications(userId, filter = {}) {
    let notifications = this.notifications.filter(n => n.userId === userId);

    if (filter.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    if (filter.type) {
      notifications = notifications.filter(n => n.type === filter.type);
    }

    if (filter.severity) {
      notifications = notifications.filter(n => n.severity === filter.severity);
    }

    return notifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead(userId) {
    this.notifications
      .filter(n => n.userId === userId)
      .forEach(n => n.read = true);
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  /**
   * Get unread count
   */
  getUnreadCount(userId) {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  /**
   * Send alert
   */
  async sendAlert(alert) {
    return await this.send({
      ...alert,
      type: 'alert',
      priority: 'high'
    });
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(message, userId) {
    return await this.send({
      userId,
      type: 'system',
      title: 'System Notification',
      message,
      severity: 'info'
    });
  }

  /**
   * Send agent notification
   */
  async sendAgentNotification(agentName, finding, userId) {
    return await this.send({
      userId,
      type: 'agent',
      title: `${agentName} Finding`,
      message: finding.description,
      severity: finding.severity,
      data: finding
    });
  }

  /**
   * Send approval notification
   */
  async sendApprovalNotification(approvalRequest, userId) {
    return await this.send({
      userId,
      type: 'approval',
      title: 'Approval Required',
      message: approvalRequest.description,
      severity: 'high',
      data: approvalRequest
    });
  }

  /**
   * Send budget alert
   */
  async sendBudgetAlert(project, message, userId) {
    return await this.send({
      userId,
      type: 'budget',
      title: `Budget Alert: ${project.name}`,
      message,
      severity: 'high',
      data: { projectId: project.id }
    });
  }

  /**
   * Send schedule alert
   */
  async sendScheduleAlert(project, message, userId) {
    return await this.send({
      userId,
      type: 'schedule',
      title: `Schedule Alert: ${project.name}`,
      message,
      severity: 'high',
      data: { projectId: project.id }
    });
  }

  /**
   * Clear all notifications for user
   */
  clearAll(userId) {
    this.notifications = this.notifications.filter(n => n.userId !== userId);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

export default notificationService;

// Made with Bob
