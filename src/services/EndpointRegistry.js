/**
 * Endpoint Registry
 * 
 * Central registry for all MREF OSLC endpoints.
 * Provides dynamic endpoint construction based on instance URL.
 * 
 * Benefits:
 * - Single source of truth for all endpoints
 * - Easy to add new endpoints
 * - Instance-independent
 * - Type-safe endpoint access
 */

class EndpointRegistry {
  constructor() {
    this.baseUrl = null;
    this.endpoints = this.initializeEndpoints();
  }

  /**
   * Initialize endpoint definitions
   */
  initializeEndpoints() {
    return {
      // Authentication
      auth: {
        signon: '/p/websignon/signon',
        signout: '/p/websignon/signout'
      },

      // OSLC Service Provider
      serviceProvider: {
        catalog: '/oslc/spq'
      },

      // Capital Project Management
      capitalProjects: {
        query: '/oslc/spq/cstCapitalProjectQC',
        resource: '/oslc/so/cstCapitalProject'
      },

      // Budget Management
      budgets: {
        query: '/oslc/spq/cstBudgetQC',
        resource: '/oslc/so/cstBudget'
      },

      // Proposal Management
      proposals: {
        query: '/oslc/spq/cstProposalQC',
        resource: '/oslc/so/cstProposal'
      },

      // Contract Management
      contracts: {
        query: '/oslc/spq/cstContractQC',
        resource: '/oslc/so/cstContract'
      },

      // Payment Management
      payments: {
        query: '/oslc/spq/cstPaymentQC',
        resource: '/oslc/so/cstPayment'
      },

      // Task Management
      tasks: {
        query: '/oslc/spq/cstProjectTaskQC',
        resource: '/oslc/so/cstProjectTask'
      },

      // Activity Management
      activities: {
        query: '/oslc/spq/cstActivityQC',
        resource: '/oslc/so/cstActivity'
      },

      // Milestone Management
      milestones: {
        query: '/oslc/spq/cstMilestoneQC',
        resource: '/oslc/so/cstMilestone'
      },

      // Schedule Management
      schedules: {
        query: '/oslc/spq/cstScheduleQC',
        resource: '/oslc/so/cstSchedule'
      },

      // Organization Management
      organizations: {
        query: '/oslc/spq/triOrganizationQC',
        resource: '/oslc/so/triOrganization'
      },

      // People Management
      people: {
        query: '/oslc/spq/triPeopleQC',
        resource: '/oslc/so/triPeople'
      },

      // Document Management
      documents: {
        query: '/oslc/spq/triDocumentQC',
        resource: '/oslc/so/triDocument'
      },

      // Location Management
      locations: {
        query: '/oslc/spq/triLocationQC',
        resource: '/oslc/so/triLocation'
      },

      // Asset Management
      assets: {
        query: '/oslc/spq/triAssetQC',
        resource: '/oslc/so/triAsset'
      },

      // Work Order Management
      workOrders: {
        query: '/oslc/spq/triWorkOrderQC',
        resource: '/oslc/so/triWorkOrder'
      },

      // Workflow Actions
      actions: {
        approve: '/oslc/actions/approve',
        reject: '/oslc/actions/reject',
        submit: '/oslc/actions/submit',
        revise: '/oslc/actions/revise',
        close: '/oslc/actions/close',
        cancel: '/oslc/actions/cancel'
      },

      // Approvals
      approvals: {
        query: '/oslc/spq/triApprovalQC',
        resource: '/oslc/so/triApproval'
      },

      // Notifications
      notifications: {
        query: '/oslc/spq/triNotificationQC',
        resource: '/oslc/so/triNotification'
      }
    };
  }

  /**
   * Set base URL for the MREF instance
   */
  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
    console.log('📍 EndpointRegistry: Base URL set to', this.baseUrl);
  }

  /**
   * Get full URL for an endpoint
   */
  getUrl(category, type = 'query') {
    if (!this.baseUrl) {
      throw new Error('Base URL not set. Call setBaseUrl() first.');
    }

    const endpoint = this.endpoints[category];
    if (!endpoint) {
      throw new Error(`Unknown endpoint category: ${category}`);
    }

    const path = typeof endpoint === 'string' ? endpoint : endpoint[type];
    if (!path) {
      throw new Error(`Unknown endpoint type: ${type} for category: ${category}`);
    }

    return `${this.baseUrl}${path}`;
  }

  /**
   * Get authentication signon URL
   */
  getSignonUrl() {
    return this.getUrl('auth', 'signon');
  }

  /**
   * Get capital projects query URL
   */
  getCapitalProjectsUrl() {
    return this.getUrl('capitalProjects', 'query');
  }

  /**
   * Get budgets query URL
   */
  getBudgetsUrl() {
    return this.getUrl('budgets', 'query');
  }

  /**
   * Get proposals query URL
   */
  getProposalsUrl() {
    return this.getUrl('proposals', 'query');
  }

  /**
   * Get contracts query URL
   */
  getContractsUrl() {
    return this.getUrl('contracts', 'query');
  }

  /**
   * Get payments query URL
   */
  getPaymentsUrl() {
    return this.getUrl('payments', 'query');
  }

  /**
   * Get tasks query URL
   */
  getTasksUrl() {
    return this.getUrl('tasks', 'query');
  }

  /**
   * Get activities query URL
   */
  getActivitiesUrl() {
    return this.getUrl('activities', 'query');
  }

  /**
   * Get milestones query URL
   */
  getMilestonesUrl() {
    return this.getUrl('milestones', 'query');
  }

  /**
   * Get schedules query URL
   */
  getSchedulesUrl() {
    return this.getUrl('schedules', 'query');
  }

  /**
   * Get organizations query URL
   */
  getOrganizationsUrl() {
    return this.getUrl('organizations', 'query');
  }

  /**
   * Get people query URL
   */
  getPeopleUrl() {
    return this.getUrl('people', 'query');
  }

  /**
   * Get documents query URL
   */
  getDocumentsUrl() {
    return this.getUrl('documents', 'query');
  }

  /**
   * Get action URL
   */
  getActionUrl(actionType, resourceId) {
    const actionPath = this.endpoints.actions[actionType];
    if (!actionPath) {
      throw new Error(`Unknown action type: ${actionType}`);
    }
    return `${this.baseUrl}${actionPath}/${resourceId}`;
  }

  /**
   * Get all registered endpoints
   */
  getAllEndpoints() {
    return { ...this.endpoints };
  }

  /**
   * Get all endpoint categories
   */
  getCategories() {
    return Object.keys(this.endpoints);
  }

  /**
   * Check if endpoint category exists
   */
  hasCategory(category) {
    return category in this.endpoints;
  }

  /**
   * Add custom endpoint (for future extensibility)
   */
  addEndpoint(category, paths) {
    if (this.endpoints[category]) {
      console.warn(`⚠️ EndpointRegistry: Overwriting existing category: ${category}`);
    }
    this.endpoints[category] = paths;
    console.log(`✅ EndpointRegistry: Added endpoint category: ${category}`);
  }

  /**
   * Remove endpoint category
   */
  removeEndpoint(category) {
    if (this.endpoints[category]) {
      delete this.endpoints[category];
      console.log(`🗑️ EndpointRegistry: Removed endpoint category: ${category}`);
    }
  }

  /**
   * Get endpoint summary
   */
  getSummary() {
    const categories = this.getCategories();
    return {
      baseUrl: this.baseUrl,
      totalCategories: categories.length,
      categories: categories.map(cat => ({
        name: cat,
        types: Object.keys(this.endpoints[cat])
      }))
    };
  }

  /**
   * Reset registry
   */
  reset() {
    this.baseUrl = null;
    this.endpoints = this.initializeEndpoints();
    console.log('🔄 EndpointRegistry: Reset complete');
  }
}

// Export singleton instance
export const endpointRegistry = new EndpointRegistry();

export default EndpointRegistry;

// Made with Bob