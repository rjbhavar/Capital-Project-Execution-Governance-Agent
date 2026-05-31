/**
 * Security Service
 * 
 * Implements comprehensive security and authorization framework.
 * Supports:
 * - Organization hierarchy
 * - Role-based access control (RBAC)
 * - Row-level security
 * - Data entitlements
 * - Permission inheritance
 */

class SecurityService {
  constructor() {
    this.currentUser = null;
    this.permissions = new Map();
    this.roles = new Map();
    this.organizationHierarchy = new Map();
    this.dataEntitlements = new Map();
  }

  /**
   * Initialize security context
   */
  initialize(user) {
    this.currentUser = user;
    this.loadUserPermissions(user);
    this.loadOrganizationHierarchy(user);
    this.loadDataEntitlements(user);
  }

  /**
   * Load user permissions
   */
  loadUserPermissions(user) {
    // In production, this would load from MREF
    const userPermissions = {
      projects: {
        view: true,
        create: user.role === 'admin' || user.role === 'project_manager',
        edit: user.role === 'admin' || user.role === 'project_manager',
        delete: user.role === 'admin'
      },
      budgets: {
        view: true,
        create: user.role === 'admin' || user.role === 'finance',
        edit: user.role === 'admin' || user.role === 'finance',
        approve: user.role === 'admin' || user.role === 'finance_director'
      },
      contracts: {
        view: true,
        create: user.role === 'admin' || user.role === 'procurement',
        edit: user.role === 'admin' || user.role === 'procurement',
        approve: user.role === 'admin' || user.role === 'procurement_director'
      },
      invoices: {
        view: true,
        create: user.role === 'admin' || user.role === 'accounts_payable',
        approve: user.role === 'admin' || user.role === 'finance_director'
      },
      payments: {
        view: user.role === 'admin' || user.role === 'finance',
        process: user.role === 'admin' || user.role === 'finance_director'
      },
      reports: {
        view: true,
        executive: user.role === 'admin' || user.role === 'executive'
      }
    };

    this.permissions.set(user.id, userPermissions);
  }

  /**
   * Load organization hierarchy
   */
  loadOrganizationHierarchy(user) {
    // In production, this would load from MREF
    const hierarchy = {
      organization: user.organization || 'Default Org',
      region: user.region || 'North America',
      country: user.country || 'USA',
      facility: user.facility || 'HQ',
      building: user.building || 'Main Building',
      department: user.department || 'Engineering'
    };

    this.organizationHierarchy.set(user.id, hierarchy);
  }

  /**
   * Load data entitlements
   */
  loadDataEntitlements(user) {
    // In production, this would load from MREF
    const entitlements = {
      organizations: [user.organization],
      regions: [user.region],
      countries: [user.country],
      facilities: user.role === 'admin' ? ['*'] : [user.facility],
      buildings: user.role === 'admin' ? ['*'] : [user.building],
      projects: user.role === 'admin' ? ['*'] : user.assignedProjects || []
    };

    this.dataEntitlements.set(user.id, entitlements);
  }

  /**
   * Check if user has permission
   */
  hasPermission(resource, action) {
    if (!this.currentUser) return false;

    const userPermissions = this.permissions.get(this.currentUser.id);
    if (!userPermissions) return false;

    const resourcePermissions = userPermissions[resource];
    if (!resourcePermissions) return false;

    return resourcePermissions[action] === true;
  }

  /**
   * Check if user can access data
   */
  canAccessData(dataType, dataValue) {
    if (!this.currentUser) return false;

    const entitlements = this.dataEntitlements.get(this.currentUser.id);
    if (!entitlements) return false;

    const allowedValues = entitlements[dataType];
    if (!allowedValues) return false;

    // Wildcard access
    if (allowedValues.includes('*')) return true;

    // Specific value access
    return allowedValues.includes(dataValue);
  }

  /**
   * Filter data based on entitlements
   */
  filterByEntitlements(data, dataType) {
    if (!this.currentUser) return [];

    const entitlements = this.dataEntitlements.get(this.currentUser.id);
    if (!entitlements) return [];

    const allowedValues = entitlements[dataType];
    if (!allowedValues) return [];

    // Wildcard access - return all
    if (allowedValues.includes('*')) return data;

    // Filter by allowed values
    return data.filter(item => {
      const itemValue = this.getDataTypeValue(item, dataType);
      return allowedValues.includes(itemValue);
    });
  }

  /**
   * Get data type value from item
   */
  getDataTypeValue(item, dataType) {
    const mapping = {
      organizations: 'organization',
      regions: 'region',
      countries: 'country',
      facilities: 'facility',
      buildings: 'building',
      projects: 'id'
    };

    const field = mapping[dataType];
    return item[field];
  }

  /**
   * Apply row-level security to query
   */
  applyRowLevelSecurity(query, resourceType) {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    const entitlements = this.dataEntitlements.get(this.currentUser.id);
    if (!entitlements) {
      throw new Error('No entitlements found for user');
    }

    // Add security filters based on resource type
    switch (resourceType) {
      case 'projects':
        if (!entitlements.projects.includes('*')) {
          query.projectId = { $in: entitlements.projects };
        }
        break;
      case 'budgets':
        if (!entitlements.organizations.includes('*')) {
          query.organization = { $in: entitlements.organizations };
        }
        break;
      // Add more resource types as needed
    }

    return query;
  }

  /**
   * Check if user is in role
   */
  isInRole(role) {
    if (!this.currentUser) return false;
    return this.currentUser.role === role;
  }

  /**
   * Check if user is in any of the roles
   */
  isInAnyRole(roles) {
    if (!this.currentUser) return false;
    return roles.includes(this.currentUser.role);
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get user hierarchy
   */
  getUserHierarchy() {
    if (!this.currentUser) return null;
    return this.organizationHierarchy.get(this.currentUser.id);
  }

  /**
   * Get user entitlements
   */
  getUserEntitlements() {
    if (!this.currentUser) return null;
    return this.dataEntitlements.get(this.currentUser.id);
  }

  /**
   * Audit log access
   */
  auditAccess(resource, action, data = {}) {
    const auditEntry = {
      timestamp: new Date(),
      userId: this.currentUser?.id,
      userName: this.currentUser?.name,
      resource,
      action,
      data,
      ipAddress: 'N/A', // Would be captured from request
      userAgent: 'N/A'  // Would be captured from request
    };

    console.log('AUDIT:', auditEntry);
    // In production, this would be sent to audit service
    return auditEntry;
  }

  /**
   * Clear security context
   */
  clear() {
    this.currentUser = null;
    this.permissions.clear();
    this.organizationHierarchy.clear();
    this.dataEntitlements.clear();
  }
}

/**
 * Role Definitions
 */
export const Roles = {
  ADMIN: 'admin',
  EXECUTIVE: 'executive',
  PROJECT_MANAGER: 'project_manager',
  FINANCE: 'finance',
  FINANCE_DIRECTOR: 'finance_director',
  PROCUREMENT: 'procurement',
  PROCUREMENT_DIRECTOR: 'procurement_director',
  ACCOUNTS_PAYABLE: 'accounts_payable',
  VIEWER: 'viewer'
};

/**
 * Permission Definitions
 */
export const Permissions = {
  PROJECT_VIEW: 'projects.view',
  PROJECT_CREATE: 'projects.create',
  PROJECT_EDIT: 'projects.edit',
  PROJECT_DELETE: 'projects.delete',
  
  BUDGET_VIEW: 'budgets.view',
  BUDGET_CREATE: 'budgets.create',
  BUDGET_EDIT: 'budgets.edit',
  BUDGET_APPROVE: 'budgets.approve',
  
  CONTRACT_VIEW: 'contracts.view',
  CONTRACT_CREATE: 'contracts.create',
  CONTRACT_EDIT: 'contracts.edit',
  CONTRACT_APPROVE: 'contracts.approve',
  
  INVOICE_VIEW: 'invoices.view',
  INVOICE_CREATE: 'invoices.create',
  INVOICE_APPROVE: 'invoices.approve',
  
  PAYMENT_VIEW: 'payments.view',
  PAYMENT_PROCESS: 'payments.process',
  
  REPORT_VIEW: 'reports.view',
  REPORT_EXECUTIVE: 'reports.executive'
};

/**
 * Authorization Decorator
 */
export function requirePermission(resource, action) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      if (!securityService.hasPermission(resource, action)) {
        throw new Error(`Permission denied: ${resource}.${action}`);
      }

      securityService.auditAccess(resource, action);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Role-based Authorization Decorator
 */
export function requireRole(...roles) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      if (!securityService.isInAnyRole(roles)) {
        throw new Error(`Role required: ${roles.join(' or ')}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Export singleton instance
export const securityService = new SecurityService();

export default securityService;

// Made with Bob
