/**
 * MREF Connector - Unified Connection Layer
 *
 * Enterprise-Grade Features:
 * - Manage connection to any MREF instance
 * - Handle authentication and session management
 * - Automatic session recovery on expiration
 * - Network resilience and retry logic
 * - Provide unified API for all OSLC operations
 * - Health check and connection validation
 * - Audit logging for all operations
 *
 * This is the ONLY service that should make direct HTTP calls to MREF.
 * All other services must use this connector.
 */

import axios from 'axios';

class MREFConnector {
  constructor() {
    this.connection = null;
    this.sessionId = null;
    this.axiosInstance = null;
    this.credentials = null; // Store for auto-recovery
    this.retryCount = 0;
    this.maxRetries = 3;
    this.isRecovering = false;
  }

  /**
   * Initialize connection to MREF instance
   * @param {Object} config - Connection configuration
   * @param {string} config.url - MREF base URL
   * @param {string} config.username - Username
   * @param {string} config.password - Password
   */
  async connect(config) {
    const { url, username, password } = config;

    if (!url || !username || !password) {
      throw new Error('URL, username, and password are required');
    }

    console.log('🔌 MREFConnector: Initializing connection to', url);

    // Store connection config
    this.connection = {
      url: url.replace(/\/$/, ''), // Remove trailing slash
      username,
      connectedAt: new Date(),
      status: 'connecting'
    };

    // Create axios instance for this connection
    this.axiosInstance = axios.create({
      baseURL: this.connection.url,
      withCredentials: true,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Store credentials for auto-recovery (in memory only)
    this.credentials = { username, password };

    // Authenticate
    try {
      await this.authenticate(username, password);
      this.connection.status = 'connected';
      this.connection.lastHealthCheck = new Date();
      console.log('✅ MREFConnector: Connected successfully');
      this.logAudit('CONNECT', 'Connection established', { url });
      return true;
    } catch (error) {
      this.connection.status = 'failed';
      console.error('❌ MREFConnector: Connection failed', error);
      this.logAudit('CONNECT_FAILED', 'Connection failed', { url, error: error.message });
      throw new Error(`Failed to connect to MREF: ${error.message}`);
    }
  }

  /**
   * Authenticate with MREF
   */
  async authenticate(username, password) {
    console.log('🔐 MREFConnector: Authenticating...');

    try {
      const response = await this.axiosInstance.post(
        '/p/websignon/signon',
        {
          userName: username,
          password: password
        }
      );

      // Extract session ID from response
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        const jsessionCookie = Array.isArray(setCookieHeader)
          ? setCookieHeader.find(cookie => cookie.includes('JSESSIONID'))
          : setCookieHeader.includes('JSESSIONID') ? setCookieHeader : null;

        if (jsessionCookie) {
          const match = jsessionCookie.match(/JSESSIONID=([^;]+)/);
          if (match) {
            this.sessionId = match[1];
            console.log('✅ MREFConnector: Session established');
          }
        }
      }

      // Check document.cookie as fallback
      if (!this.sessionId) {
        const cookies = document.cookie;
        const match = cookies.match(/JSESSIONID=([^;]+)/);
        if (match) {
          this.sessionId = match[1];
        }
      }

      if (!this.sessionId && response.status === 200) {
        // Authentication succeeded but no session ID captured
        // This is acceptable for some MREF configurations
        console.warn('⚠️ MREFConnector: Authenticated but no session ID captured');
      }

      return true;
    } catch (error) {
      console.error('❌ MREFConnector: Authentication failed', error);
      throw error;
    }
  }

  /**
   * Make authenticated GET request with auto-recovery
   */
  async get(path, config = {}) {
    return await this.executeWithRecovery(async () => {
      this.ensureConnected();

      const response = await this.axiosInstance.get(path, {
        ...config,
        headers: {
          ...config.headers,
          ...(this.sessionId && { 'Cookie': `JSESSIONID=${this.sessionId}` })
        }
      });
      
      this.logAudit('GET', path, { status: response.status });
      return response.data;
    }, 'GET', path);
  }

  /**
   * Make authenticated POST request with auto-recovery
   */
  async post(path, data, config = {}) {
    return await this.executeWithRecovery(async () => {
      this.ensureConnected();

      const response = await this.axiosInstance.post(path, data, {
        ...config,
        headers: {
          ...config.headers,
          ...(this.sessionId && { 'Cookie': `JSESSIONID=${this.sessionId}` })
        }
      });
      
      this.logAudit('POST', path, { status: response.status });
      return response.data;
    }, 'POST', path);
  }

  /**
   * Make authenticated PUT request with auto-recovery
   */
  async put(path, data, config = {}) {
    return await this.executeWithRecovery(async () => {
      this.ensureConnected();

      const response = await this.axiosInstance.put(path, data, {
        ...config,
        headers: {
          ...config.headers,
          ...(this.sessionId && { 'Cookie': `JSESSIONID=${this.sessionId}` })
        }
      });
      
      this.logAudit('PUT', path, { status: response.status });
      return response.data;
    }, 'PUT', path);
  }

  /**
   * Make authenticated DELETE request with auto-recovery
   */
  async delete(path, config = {}) {
    return await this.executeWithRecovery(async () => {
      this.ensureConnected();

      const response = await this.axiosInstance.delete(path, {
        ...config,
        headers: {
          ...config.headers,
          ...(this.sessionId && { 'Cookie': `JSESSIONID=${this.sessionId}` })
        }
      });
      
      this.logAudit('DELETE', path, { status: response.status });
      return response.data;
    }, 'DELETE', path);
  }

  /**
   * Execute OSLC query
   */
  async oslcQuery(resourcePath, selectClause = '*') {
    const path = `${resourcePath}?oslc.select=${encodeURIComponent(selectClause)}`;
    return await this.get(path);
  }

  /**
   * Execute workflow action
   */
  async executeAction(actionUrl, payload = {}) {
    return await this.post(actionUrl, payload);
  }

  /**
   * Ensure connection is established
   */
  ensureConnected() {
    if (!this.connection || this.connection.status !== 'connected') {
      throw new Error('Not connected to MREF. Please connect first.');
    }
  }

  /**
   * Execute request with automatic session recovery
   */
  async executeWithRecovery(operation, method, path) {
    try {
      return await operation();
    } catch (error) {
      // Check if it's a session expiration error
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (!this.isRecovering && this.credentials) {
          console.log('🔄 MREFConnector: Session expired, attempting auto-recovery...');
          this.isRecovering = true;
          
          try {
            // Re-authenticate
            await this.authenticate(this.credentials.username, this.credentials.password);
            this.isRecovering = false;
            
            // Retry the original operation
            console.log('✅ MREFConnector: Session recovered, retrying operation...');
            return await operation();
          } catch (recoveryError) {
            this.isRecovering = false;
            console.error('❌ MREFConnector: Session recovery failed', recoveryError);
            this.logAudit('SESSION_RECOVERY_FAILED', `${method} ${path}`, { error: recoveryError.message });
            throw new Error('Session expired and recovery failed. Please reconnect.');
          }
        } else {
          throw new Error('Session expired. Please reconnect.');
        }
      }

      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        this.logAudit('TIMEOUT', `${method} ${path}`, { error: error.message });
        throw new Error('Request timeout. Please check your network connection.');
      }

      if (error.code === 'ERR_NETWORK' || !error.response) {
        this.logAudit('NETWORK_ERROR', `${method} ${path}`, { error: error.message });
        throw new Error('Network error. Please check your connection and VPN status.');
      }

      // Log and rethrow other errors
      this.logAudit('ERROR', `${method} ${path}`, {
        status: error.response?.status,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Health check - verify connection is alive
   */
  async healthCheck() {
    if (!this.connection || this.connection.status !== 'connected') {
      return { healthy: false, reason: 'Not connected' };
    }

    try {
      // Try a simple request to verify connection
      await this.get('/oslc/spq', { timeout: 5000 });
      this.connection.lastHealthCheck = new Date();
      return { healthy: true, lastCheck: this.connection.lastHealthCheck };
    } catch (error) {
      return {
        healthy: false,
        reason: error.message,
        lastCheck: this.connection.lastHealthCheck
      };
    }
  }

  /**
   * Validate connection without making actual request
   */
  validateConnection() {
    return {
      isConnected: this.connection?.status === 'connected',
      hasSession: !!this.sessionId,
      url: this.connection?.url,
      username: this.connection?.username,
      connectedAt: this.connection?.connectedAt,
      lastHealthCheck: this.connection?.lastHealthCheck
    };
  }

  /**
   * Audit logging
   */
  logAudit(action, details, metadata = {}) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      user: this.connection?.username,
      instance: this.connection?.url,
      ...metadata
    };

    // Log to console (in production, send to audit service)
    console.log('📋 AUDIT:', JSON.stringify(auditEntry));

    // Store in sessionStorage for debugging
    try {
      const auditLog = JSON.parse(sessionStorage.getItem('mref_audit_log') || '[]');
      auditLog.push(auditEntry);
      // Keep only last 100 entries
      if (auditLog.length > 100) {
        auditLog.shift();
      }
      sessionStorage.setItem('mref_audit_log', JSON.stringify(auditLog));
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Get audit log
   */
  getAuditLog() {
    try {
      return JSON.parse(sessionStorage.getItem('mref_audit_log') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear audit log
   */
  clearAuditLog() {
    sessionStorage.removeItem('mref_audit_log');
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      connected: this.connection?.status === 'connected',
      url: this.connection?.url,
      username: this.connection?.username,
      connectedAt: this.connection?.connectedAt,
      hasSession: !!this.sessionId
    };
  }

  /**
   * Disconnect from MREF
   */
  disconnect() {
    console.log('🔌 MREFConnector: Disconnecting...');
    this.logAudit('DISCONNECT', 'User disconnected');
    this.connection = null;
    this.sessionId = null;
    this.axiosInstance = null;
    this.credentials = null; // Clear credentials on disconnect
    this.retryCount = 0;
    this.isRecovering = false;
  }

  /**
   * Test connection
   */
  async testConnection(url) {
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        validateStatus: () => true // Accept any status
      });
      return {
        success: true,
        reachable: true,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        reachable: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const mrefConnector = new MREFConnector();

export default MREFConnector;

// Made with Bob