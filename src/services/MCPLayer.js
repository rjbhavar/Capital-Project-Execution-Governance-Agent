/**
 * MCP Layer (Model Context Protocol)
 * 
 * This is the abstraction layer between Agents and MREF APIs.
 * 
 * Responsibilities:
 * - Provide high-level data retrieval methods
 * - Abstract OSLC complexity from agents
 * - Handle data transformation
 * - Cache frequently accessed data
 * - Provide unified interface for all MREF operations
 * 
 * AGENTS MUST USE THIS LAYER - NO DIRECT API CALLS
 */

import { mrefConnector } from './MREFConnector';
import { instanceMetadataService } from './InstanceMetadataService';

class MCPLayer {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all capital projects with related data
   */
  async getCapitalProjects(options = {}) {
    const {
      includeRelated = true,
      forceRefresh = false
    } = options;

    const cacheKey = `projects_${includeRelated}`;

    // Check cache
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📦 MCP: Returning cached projects');
        return cached.data;
      }
    }

    console.log('📡 MCP: Fetching capital projects...');

    try {
      // Build select clause
      let selectClause = '*';
      if (includeRelated) {
        selectClause = '*,spi:cstBudget{*},spi:cstProposal{*},spi:cstContracts{*},spi:cstPayment{*}';
      }

      // Fetch from MREF
      const response = await mrefConnector.oslcQuery(
        '/oslc/spq/cstCapitalProjectQC',
        selectClause
      );

      // Parse response
      const members = response?.['rdfs:member'] || [];
      const projects = members.map(this.parseCapitalProject.bind(this));

      // Cache result
      this.cache.set(cacheKey, {
        data: projects,
        timestamp: Date.now()
      });

      console.log(`✅ MCP: Retrieved ${projects.length} projects`);
      return projects;
    } catch (error) {
      console.error('❌ MCP: Failed to fetch projects', error);
      throw error;
    }
  }

  /**
   * Get single project by ID
   */
  async getProjectById(projectId) {
    console.log(`📡 MCP: Fetching project ${projectId}...`);

    try {
      const projects = await this.getCapitalProjects({ includeRelated: true });
      const project = projects.find(p => p.id === projectId || p.projectId === projectId);

      if (!project) {
        throw new Error(`Project not found: ${projectId}`);
      }

      return project;
    } catch (error) {
      console.error(`❌ MCP: Failed to fetch project ${projectId}`, error);
      throw error;
    }
  }

  /**
   * Get budget for a project
   */
  async getBudget(budgetId) {
    console.log(`📡 MCP: Fetching budget ${budgetId}...`);

    try {
      const response = await mrefConnector.oslcQuery(
        '/oslc/spq/cstBudgetQC',
        '*'
      );

      const members = response?.['rdfs:member'] || [];
      const budget = members.find(b => b['dcterms:identifier'] === budgetId);

      if (!budget) {
        throw new Error(`Budget not found: ${budgetId}`);
      }

      return this.parseBudget(budget);
    } catch (error) {
      console.error(`❌ MCP: Failed to fetch budget ${budgetId}`, error);
      throw error;
    }
  }

  /**
   * Get proposal for a project
   */
  async getProposal(proposalId) {
    console.log(`📡 MCP: Fetching proposal ${proposalId}...`);

    try {
      const response = await mrefConnector.oslcQuery(
        '/oslc/spq/cstProposalQC',
        '*'
      );

      const members = response?.['rdfs:member'] || [];
      const proposal = members.find(p => p['dcterms:identifier'] === proposalId);

      if (!proposal) {
        throw new Error(`Proposal not found: ${proposalId}`);
      }

      return this.parseProposal(proposal);
    } catch (error) {
      console.error(`❌ MCP: Failed to fetch proposal ${proposalId}`, error);
      throw error;
    }
  }

  /**
   * Get contracts for a project
   */
  async getContracts(projectId) {
    console.log(`📡 MCP: Fetching contracts for project ${projectId}...`);

    try {
      const response = await mrefConnector.oslcQuery(
        '/oslc/spq/cstContractQC',
        '*'
      );

      const members = response?.['rdfs:member'] || [];
      return members.map(this.parseContract.bind(this));
    } catch (error) {
      console.error(`❌ MCP: Failed to fetch contracts`, error);
      throw error;
    }
  }

  /**
   * Get payments for a project
   */
  async getPayments(projectId) {
    console.log(`📡 MCP: Fetching payments for project ${projectId}...`);

    try {
      const response = await mrefConnector.oslcQuery(
        '/oslc/spq/cstPaymentQC',
        '*'
      );

      const members = response?.['rdfs:member'] || [];
      return members.map(this.parsePayment.bind(this));
    } catch (error) {
      console.error(`❌ MCP: Failed to fetch payments`, error);
      throw error;
    }
  }

  /**
   * Execute workflow action
   */
  async executeAction(actionType, resourceUrl, payload = {}) {
    console.log(`🎬 MCP: Executing action ${actionType} on ${resourceUrl}`);

    try {
      const result = await mrefConnector.executeAction(resourceUrl, {
        action: actionType,
        ...payload
      });

      console.log(`✅ MCP: Action ${actionType} executed successfully`);
      
      // Clear cache to force refresh
      this.clearCache();

      return result;
    } catch (error) {
      console.error(`❌ MCP: Failed to execute action ${actionType}`, error);
      throw error;
    }
  }

  /**
   * Parse Capital Project data
   */
  parseCapitalProject(project) {
    const budget = parseFloat(project['spi:triBudgetOriginalRollupFR']) || 0;
    const incurredInvoice = parseFloat(project['spi:triIncurredInvoiceRollupFR']) || 0;
    const incurredPaid = parseFloat(project['spi:triIncurredPaidRollupFR']) || 0;
    const spent = incurredInvoice + incurredPaid;

    // Parse embedded data
    const budgetData = project['spi:cstBudget'];
    const proposalData = project['spi:cstProposal'];
    const contractsData = project['spi:cstContracts'];
    const paymentData = project['spi:cstPayment'];

    return {
      id: project['dcterms:identifier'],
      projectId: project['spi:triIdTX'],
      name: project['spi:triNameTX'] || 'Unnamed Project',
      status: project['spi:triStatusCL'] || 'Unknown',
      phase: project['spi:triPhaseCL'] || 'N/A',
      classification: project['spi:triProjectClassificationLI'] || 'N/A',
      type: project['spi:triProjectTypeLI'] || 'N/A',
      
      // Financial
      budget,
      spent,
      commitments: parseFloat(project['spi:triCommitmentOriginalRollupFR'] || 0) + 
                   parseFloat(project['spi:triCommitmentChangesRollupFR'] || 0),
      currency: project['spi:triCurrencyUO'] || 'USD',
      
      // People
      projectManager: project['spi:triProjectLeadTX'] || 'Unassigned',
      organization: project['spi:OrgName'] || 'N/A',
      
      // Location
      location: project['spi:triProjectLocationTX'] || 'N/A',
      building: project['spi:triProjectLocationTX'] || 'N/A',
      city: project['spi:triCityTX'] || 'N/A',
      state: project['spi:triStateProvTX'] || 'N/A',
      country: project['spi:triCountryTX'] || 'N/A',
      
      // Dates
      startDate: project['spi:triProjectPlanStartDA'],
      endDate: project['spi:triProjectPlanEndDA'],
      actualStartDate: project['spi:triProjectActualStartDA'],
      actualEndDate: project['spi:triProjectActualEndDA'],
      
      // Related data
      budgetDetails: budgetData && typeof budgetData === 'object' && !budgetData['rdf:resource']
        ? this.parseBudget(budgetData)
        : null,
      proposalDetails: proposalData && typeof proposalData === 'object' && !proposalData['rdf:resource']
        ? this.parseProposal(proposalData)
        : null,
      contractDetails: contractsData
        ? this.parseContracts(contractsData)
        : [],
      paymentDetails: paymentData
        ? this.parsePayments(paymentData)
        : [],
      
      // Flags
      hasBudget: budgetData && typeof budgetData === 'object' && !budgetData['rdf:resource'],
      hasProposal: proposalData && typeof proposalData === 'object' && !proposalData['rdf:resource'],
      hasContracts: Array.isArray(contractsData) ? contractsData.length > 0 : !!contractsData,
      hasPayments: Array.isArray(paymentData) ? paymentData.length > 0 : !!paymentData,
      
      // Raw data
      _raw: project
    };
  }

  /**
   * Parse Budget data
   */
  parseBudget(budgetData) {
    if (!budgetData || typeof budgetData !== 'object') return null;

    return {
      id: budgetData['dcterms:identifier'],
      name: budgetData['spi:triNameTX'],
      status: budgetData['spi:triStatusCL'],
      budgetType: budgetData['spi:triBudgetTypeCL'],
      estimatedCost: parseFloat(budgetData['spi:triEstimatedCostFR']) || 0,
      totalCost: parseFloat(budgetData['spi:triTotalCostFR']) || 0,
      budgetAmount: parseFloat(budgetData['spi:triBudgetAmountFR']) || 0,
      currency: budgetData['spi:triCurrencyUO'],
      forecastCost: parseFloat(budgetData['spi:triForecastCostFR']) || 0,
      incurredCost: parseFloat(budgetData['spi:triIncurredCostFR']) || 0,
      _raw: budgetData
    };
  }

  /**
   * Parse Proposal data
   */
  parseProposal(proposalData) {
    if (!proposalData || typeof proposalData !== 'object') return null;

    return {
      id: proposalData['dcterms:identifier'],
      name: proposalData['spi:triNameTX'],
      status: proposalData['spi:triStatusCL'],
      proposalType: proposalData['spi:triProposalTypeCL'],
      contactName: proposalData['spi:triContactNameTX'],
      contactEmail: proposalData['spi:triContactEmailTX'],
      proposalDate: proposalData['spi:triProposalDateDA'],
      bidAmount: parseFloat(proposalData['spi:triBidAmountFR']) || 0,
      _raw: proposalData
    };
  }

  /**
   * Parse Contract data
   */
  parseContract(contractData) {
    return {
      id: contractData['dcterms:identifier'],
      name: contractData['spi:triNameTX'],
      status: contractData['spi:triStatusCL'],
      contractType: contractData['spi:triContractTypeCL'],
      approvedAmount: parseFloat(contractData['spi:triApprovedAmountFR']) || 0,
      changeOrders: parseFloat(contractData['spi:triChangeOrdersFR']) || 0,
      contractState: contractData['spi:triContractStateCL'],
      _raw: contractData
    };
  }

  /**
   * Parse Contracts array
   */
  parseContracts(contractsData) {
    if (!contractsData) return [];
    const contracts = Array.isArray(contractsData) ? contractsData : [contractsData];
    return contracts
      .filter(c => c && typeof c === 'object' && !c['rdf:resource'])
      .map(this.parseContract.bind(this));
  }

  /**
   * Parse Payment data
   */
  parsePayment(paymentData) {
    return {
      id: paymentData['dcterms:identifier'],
      name: paymentData['spi:triNameTX'],
      status: paymentData['spi:triStatusCL'],
      invoiceAmount: parseFloat(paymentData['spi:triInvoiceAmountFR']) || 0,
      payee: paymentData['spi:triPayeeTX'],
      paymentDate: paymentData['spi:triPaymentDateDA'],
      _raw: paymentData
    };
  }

  /**
   * Parse Payments array
   */
  parsePayments(paymentData) {
    if (!paymentData) return [];
    const payments = Array.isArray(paymentData) ? paymentData : [paymentData];
    return payments
      .filter(p => p && typeof p === 'object' && !p['rdf:resource'])
      .map(this.parsePayment.bind(this));
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ MCP: Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const mcpLayer = new MCPLayer();

export default MCPLayer;

// Made with Bob