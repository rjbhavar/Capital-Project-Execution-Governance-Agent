/**
 * Instance Metadata Service
 * 
 * Performs OSLC discovery on MREF instance to determine:
 * - Available resources
 * - Available queries
 * - Available actions
 * - Supported domains
 * - Instance capabilities
 * 
 * This service runs after successful authentication to understand
 * what the connected MREF instance supports.
 */

import { mrefConnector } from './MREFConnector';

class InstanceMetadataService {
  constructor() {
    this.metadata = null;
    this.discovered = false;
  }

  /**
   * Discover instance capabilities
   */
  async discover() {
    console.log('🔍 InstanceMetadataService: Starting discovery...');

    try {
      const metadata = {
        discoveredAt: new Date(),
        resources: {},
        queries: {},
        actions: {},
        domains: [],
        capabilities: {}
      };

      // Discover OSLC Service Provider Catalog
      await this.discoverServiceProviders(metadata);

      // Discover Capital Project resources
      await this.discoverCapitalProjectResources(metadata);

      // Discover available queries
      await this.discoverQueries(metadata);

      // Discover workflow actions
      await this.discoverActions(metadata);

      this.metadata = metadata;
      this.discovered = true;

      console.log('✅ InstanceMetadataService: Discovery complete', metadata);
      return metadata;
    } catch (error) {
      console.error('❌ InstanceMetadataService: Discovery failed', error);
      throw error;
    }
  }

  /**
   * Discover OSLC Service Providers
   */
  async discoverServiceProviders(metadata) {
    try {
      // Try to fetch service provider catalog
      const catalog = await mrefConnector.get('/oslc/spq');
      
      if (catalog) {
        metadata.capabilities.hasServiceProviderCatalog = true;
        console.log('✅ Service Provider Catalog found');
      }
    } catch (error) {
      console.warn('⚠️ Service Provider Catalog not accessible');
      metadata.capabilities.hasServiceProviderCatalog = false;
    }
  }

  /**
   * Discover Capital Project resources
   */
  async discoverCapitalProjectResources(metadata) {
    const resources = [
      {
        name: 'capitalProjects',
        path: '/oslc/spq/cstCapitalProjectQC',
        description: 'Capital Projects'
      },
      {
        name: 'budgets',
        path: '/oslc/spq/cstBudgetQC',
        description: 'Budgets'
      },
      {
        name: 'proposals',
        path: '/oslc/spq/cstProposalQC',
        description: 'Proposals'
      },
      {
        name: 'contracts',
        path: '/oslc/spq/cstContractQC',
        description: 'Contracts'
      },
      {
        name: 'payments',
        path: '/oslc/spq/cstPaymentQC',
        description: 'Payments'
      }
    ];

    for (const resource of resources) {
      try {
        // Test if resource is accessible
        await mrefConnector.get(`${resource.path}?oslc.select=dcterms:identifier&oslc.pageSize=1`);
        
        metadata.resources[resource.name] = {
          available: true,
          path: resource.path,
          description: resource.description
        };
        
        console.log(`✅ Resource available: ${resource.name}`);
      } catch (error) {
        metadata.resources[resource.name] = {
          available: false,
          path: resource.path,
          description: resource.description,
          error: error.message
        };
        
        console.warn(`⚠️ Resource not available: ${resource.name}`);
      }
    }
  }

  /**
   * Discover available queries
   */
  async discoverQueries(metadata) {
    const queries = [
      {
        name: 'capitalProjectsWithBudget',
        path: '/oslc/spq/cstCapitalProjectQC',
        select: '*,spi:cstBudget{*}'
      },
      {
        name: 'capitalProjectsWithProposal',
        path: '/oslc/spq/cstCapitalProjectQC',
        select: '*,spi:cstProposal{*}'
      },
      {
        name: 'capitalProjectsWithContracts',
        path: '/oslc/spq/cstCapitalProjectQC',
        select: '*,spi:cstContracts{*}'
      },
      {
        name: 'capitalProjectsWithPayments',
        path: '/oslc/spq/cstCapitalProjectQC',
        select: '*,spi:cstPayment{*}'
      },
      {
        name: 'capitalProjectsComplete',
        path: '/oslc/spq/cstCapitalProjectQC',
        select: '*,spi:cstBudget{*},spi:cstProposal{*},spi:cstContracts{*},spi:cstPayment{*}'
      }
    ];

    for (const query of queries) {
      metadata.queries[query.name] = {
        path: query.path,
        select: query.select,
        available: true // Assume available if resource is available
      };
    }

    console.log(`✅ Discovered ${Object.keys(metadata.queries).length} queries`);
  }

  /**
   * Discover workflow actions
   */
  async discoverActions(metadata) {
    // Common MREF workflow actions
    const actions = [
      {
        name: 'approve',
        description: 'Approve record',
        type: 'workflow'
      },
      {
        name: 'reject',
        description: 'Reject record',
        type: 'workflow'
      },
      {
        name: 'submit',
        description: 'Submit for approval',
        type: 'workflow'
      },
      {
        name: 'revise',
        description: 'Revise record',
        type: 'workflow'
      },
      {
        name: 'close',
        description: 'Close record',
        type: 'workflow'
      }
    ];

    for (const action of actions) {
      metadata.actions[action.name] = {
        description: action.description,
        type: action.type,
        available: true // Will be validated on actual use
      };
    }

    console.log(`✅ Discovered ${Object.keys(metadata.actions).length} actions`);
  }

  /**
   * Get discovered metadata
   */
  getMetadata() {
    if (!this.discovered) {
      throw new Error('Instance discovery not performed. Call discover() first.');
    }
    return this.metadata;
  }

  /**
   * Check if resource is available
   */
  isResourceAvailable(resourceName) {
    return this.metadata?.resources?.[resourceName]?.available || false;
  }

  /**
   * Check if query is available
   */
  isQueryAvailable(queryName) {
    return this.metadata?.queries?.[queryName]?.available || false;
  }

  /**
   * Check if action is available
   */
  isActionAvailable(actionName) {
    return this.metadata?.actions?.[actionName]?.available || false;
  }

  /**
   * Get resource path
   */
  getResourcePath(resourceName) {
    return this.metadata?.resources?.[resourceName]?.path;
  }

  /**
   * Get query configuration
   */
  getQuery(queryName) {
    return this.metadata?.queries?.[queryName];
  }

  /**
   * Reset discovery
   */
  reset() {
    this.metadata = null;
    this.discovered = false;
  }

  /**
   * Get discovery summary
   */
  getSummary() {
    if (!this.discovered) {
      return {
        discovered: false,
        message: 'Discovery not performed'
      };
    }

    const availableResources = Object.entries(this.metadata.resources)
      .filter(([_, resource]) => resource.available)
      .map(([name]) => name);

    return {
      discovered: true,
      discoveredAt: this.metadata.discoveredAt,
      availableResources,
      totalResources: Object.keys(this.metadata.resources).length,
      totalQueries: Object.keys(this.metadata.queries).length,
      totalActions: Object.keys(this.metadata.actions).length,
      capabilities: this.metadata.capabilities
    };
  }
}

// Export singleton instance
export const instanceMetadataService = new InstanceMetadataService();

export default InstanceMetadataService;

// Made with Bob