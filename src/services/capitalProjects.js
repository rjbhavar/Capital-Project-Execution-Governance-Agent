import apiClient from './api';

/**
 * Parse Budget data from embedded response
 */
const parseBudgetData = (budgetData) => {
  if (!budgetData || typeof budgetData !== 'object') return null;
  
  const parseNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };
  
  return {
    id: budgetData['dcterms:identifier'] || null,
    name: budgetData['spi:triNameTX'] || 'Unnamed Budget',
    status: budgetData['spi:triStatusCL'] || 'Unknown',
    budgetType: budgetData['spi:triBudgetTypeCL'] || 'N/A',
    estimatedCost: parseNumber(budgetData['spi:triEstimatedCostFR']),
    totalCost: parseNumber(budgetData['spi:triTotalCostFR']),
    budgetAmount: parseNumber(budgetData['spi:triBudgetAmountFR']),
    currency: budgetData['spi:triCurrencyUO'] || 'USD',
    forecastCost: parseNumber(budgetData['spi:triForecastCostFR']),
    incurredCost: parseNumber(budgetData['spi:triIncurredCostFR']),
    _raw: budgetData
  };
};

/**
 * Parse Proposal data from embedded response
 */
const parseProposalData = (proposalData) => {
  if (!proposalData || typeof proposalData !== 'object') return null;
  
  const parseNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };
  
  return {
    id: proposalData['dcterms:identifier'] || null,
    name: proposalData['spi:triNameTX'] || 'Unnamed Proposal',
    status: proposalData['spi:triStatusCL'] || 'Unknown',
    proposalType: proposalData['spi:triProposalTypeCL'] || 'N/A',
    contactName: proposalData['spi:triContactNameTX'] || 'N/A',
    contactEmail: proposalData['spi:triContactEmailTX'] || 'N/A',
    proposalDate: proposalData['spi:triProposalDateDA'] || null,
    bidAmount: parseNumber(proposalData['spi:triBidAmountFR']),
    _raw: proposalData
  };
};

/**
 * Parse Contracts data from embedded response
 */
const parseContractsData = (contractsData) => {
  if (!contractsData) return [];
  
  const parseNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };
  
  const contracts = Array.isArray(contractsData) ? contractsData : [contractsData];
  
  return contracts
    .filter(contract => contract && typeof contract === 'object' && !contract['rdf:resource'])
    .map(contract => ({
      id: contract['dcterms:identifier'] || null,
      name: contract['spi:triNameTX'] || 'Unnamed Contract',
      status: contract['spi:triStatusCL'] || 'Unknown',
      contractType: contract['spi:triContractTypeCL'] || 'N/A',
      vendor: contract['spi:triVendorTX'] || 'N/A',
      approvedAmount: parseNumber(contract['spi:triApprovedAmountFR']),
      changeOrders: parseNumber(contract['spi:triChangeOrdersFR']),
      contractState: contract['spi:triContractStateCL'] || 'N/A',
      startDate: contract['spi:triStartDateDA'] || null,
      endDate: contract['spi:triEndDateDA'] || null,
      lineItems: parseContractLineItems(contract['spi:cstContractLineItem']),
      _raw: contract
    }));
};

/**
 * Parse Payment data from embedded response
 */
const parsePaymentData = (paymentData) => {
  if (!paymentData) return [];
  
  const parseNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };
  
  const payments = Array.isArray(paymentData) ? paymentData : [paymentData];
  
  return payments
    .filter(payment => payment && typeof payment === 'object' && !payment['rdf:resource'])
    .map(payment => ({
      id: payment['dcterms:identifier'] || null,
      name: payment['spi:triNameTX'] || 'Unnamed Payment',
      status: payment['spi:triStatusCL'] || 'Unknown',
      invoiceAmount: parseNumber(payment['spi:triInvoiceAmountFR']),
      payee: payment['spi:triPayeeTX'] || 'N/A',
      paymentDate: payment['spi:triPaymentDateDA'] || null,
      _raw: payment
    }));
};

/**
 * Parse Contact Roles data from embedded response
 */
const parseContactRolesData = (contactRolesData) => {
  if (!contactRolesData) return [];
  
  const roles = Array.isArray(contactRolesData) ? contactRolesData : [contactRolesData];
  
  return roles
    .filter(role => role && typeof role === 'object' && !role['rdf:resource'])
    .map(role => ({
      id: role['dcterms:identifier'] || null,
      roleName: role['spi:triRoleNameTX'] || 'Unknown Role',
      personName: role['spi:triPersonNameTX'] || 'N/A',
      organization: role['spi:triOrganizationTX'] || 'N/A',
      email: role['spi:triEmailTX'] || 'N/A',
      phone: role['spi:triPhoneTX'] || 'N/A',
      isPrimary: role['spi:triIsPrimaryBO'] === 'true' || role['spi:triIsPrimaryBO'] === true,
      _raw: role
    }));
};

/**
 * Parse Contract Line Items from contract data
 */
const parseContractLineItems = (lineItemsData) => {
  if (!lineItemsData) return [];
  
  const parseNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };
  
  const lineItems = Array.isArray(lineItemsData) ? lineItemsData : [lineItemsData];
  
  return lineItems
    .filter(item => item && typeof item === 'object' && !item['rdf:resource'])
    .map(item => ({
      id: item['dcterms:identifier'] || null,
      description: item['spi:triDescriptionTX'] || 'N/A',
      quantity: parseNumber(item['spi:triQuantityNU']),
      rate: parseNumber(item['spi:triRateFR']),
      total: parseNumber(item['spi:triTotalFR']),
      costCode: item['spi:triCostCodeTX'] || 'N/A',
      unit: item['spi:triUnitTX'] || 'N/A',
      _raw: item
    }));
};

/**
 * Parse Purchase Order Line Items from PO data
 */
const parsePurchaseOrderLineItems = (lineItemsData) => {
  if (!lineItemsData) return [];
  
  const parseNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };
  
  const lineItems = Array.isArray(lineItemsData) ? lineItemsData : [lineItemsData];
  
  return lineItems
    .filter(item => item && typeof item === 'object' && !item['rdf:resource'])
    .map(item => ({
      id: item['dcterms:identifier'] || null,
      description: item['spi:triDescriptionTX'] || 'N/A',
      quantity: parseNumber(item['spi:triQuantityNU']),
      rate: parseNumber(item['spi:triRateFR']),
      total: parseNumber(item['spi:triTotalFR']),
      itemDescription: item['spi:triItemDescriptionTX'] || 'N/A',
      unit: item['spi:triUnitTX'] || 'N/A',
      _raw: item
    }));
};

/**
 * Parse Purchase Orders data from embedded response
 */
const parsePurchaseOrdersData = (poData) => {
  if (!poData) return [];
  
  const parseNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };
  
  const purchaseOrders = Array.isArray(poData) ? poData : [poData];
  
  return purchaseOrders
    .filter(po => po && typeof po === 'object' && !po['rdf:resource'])
    .map(po => ({
      id: po['dcterms:identifier'] || null,
      name: po['spi:triNameTX'] || 'Unnamed PO',
      poNumber: po['spi:triPONumberTX'] || 'N/A',
      status: po['spi:triStatusCL'] || 'Unknown',
      vendor: po['spi:triVendorTX'] || 'N/A',
      amount: parseNumber(po['spi:triAmountFR']),
      issueDate: po['spi:triIssueDateDA'] || null,
      lineItems: parsePurchaseOrderLineItems(po['spi:cstPurchaseLineItem']),
      _raw: po
    }));
};

/**
 * Fetch all capital projects from MREF OSLC API with all related data
 * Uses comprehensive query that includes Budget, Proposal, Contracts, Payments, ContactRoles, and Purchase Orders
 */
export const fetchCapitalProjects = async () => {
  try {
    console.log('📡 Fetching capital projects with related data from MREF...');
    const response = await apiClient.get(
      '/oslc/spq/cstCapitalProjectQC?oslc.select=*,spi:cstBudget{*},spi:cstProposal{*},spi:cstContracts{*,spi:cstContractLineItem{*}},spi:cstPayment{*},spi:ContactRoles{*},spi:cstPurchaseOrder{*,spi:cstPurchaseLineItem{*}}'
    );
    
    console.log('📦 Raw API Response:', response.data);
    
    // Parse OSLC response - the real API uses 'rdfs:member'
    const members = response.data?.['rdfs:member'] || [];
    
    console.log(`📊 Found ${members.length} projects in response`);
    
    if (members.length === 0) {
      console.warn('⚠️ No projects found in MREF response');
    }
    
    // Helper function to safely parse numbers
    const parseNumber = (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };
    
    // Map OSLC fields to application format with all related data
    const projects = members.map((project, index) => {
      const budget = parseNumber(project['spi:triBudgetOriginalRollupFR']);
      const incurredInvoice = parseNumber(project['spi:triIncurredInvoiceRollupFR']);
      const incurredPaid = parseNumber(project['spi:triIncurredPaidRollupFR']);
      const commitmentOriginal = parseNumber(project['spi:triCommitmentOriginalRollupFR']);
      const commitmentChanges = parseNumber(project['spi:triCommitmentChangesRollupFR']);
      
      // Calculate total spent (invoiced + paid)
      const spent = incurredInvoice + incurredPaid;
      
      // Parse embedded Budget data (now included in response)
      const budgetData = project['spi:cstBudget'];
      const budgetDetails = budgetData && typeof budgetData === 'object' && !budgetData['rdf:resource'] 
        ? parseBudgetData(budgetData) 
        : null;
      
      // Parse embedded Proposal data
      const proposalData = project['spi:cstProposal'];
      const proposalDetails = proposalData && typeof proposalData === 'object' && !proposalData['rdf:resource']
        ? parseProposalData(proposalData)
        : null;
      
      // Parse embedded Contracts data (can be array)
      const contractsData = project['spi:cstContracts'];
      const contractDetails = contractsData 
        ? parseContractsData(contractsData)
        : [];
      
      // Parse embedded Payment data (can be array)
      const paymentData = project['spi:cstPayment'];
      const paymentDetails = paymentData
        ? parsePaymentData(paymentData)
        : [];
      
      // Parse embedded Contact Roles data (can be array)
      const contactRolesData = project['spi:ContactRoles'];
      const contactRoles = contactRolesData
        ? parseContactRolesData(contactRolesData)
        : [];
      
      // Parse embedded Purchase Orders data (can be array)
      const purchaseOrderData = project['spi:cstPurchaseOrder'];
      const purchaseOrderDetails = purchaseOrderData
        ? parsePurchaseOrdersData(purchaseOrderData)
        : [];
      
      return {
        id: project['dcterms:identifier'] || `project-${index + 1}`,
        projectId: project['spi:triIdTX'] || `ID-${index + 1}`,
        name: project['spi:triNameTX'] || 'Unnamed Project',
        status: project['spi:triStatusCL'] || 'Unknown',
        budget: budget,
        spent: spent,
        commitments: commitmentOriginal + commitmentChanges,
        phase: project['spi:triPhaseCL'] || 'N/A',
        projectManager: project['spi:triProjectLeadTX'] || 'Unassigned',
        startDate: project['spi:triProjectPlanStartDA'] || null,
        endDate: project['spi:triProjectPlanEndDA'] || null,
        actualStartDate: project['spi:triProjectActualStartDA'] || null,
        actualEndDate: project['spi:triProjectActualEndDA'] || null,
        location: project['spi:triProjectLocationTX'] || 'N/A',
        city: project['spi:triCityTX'] || 'N/A',
        state: project['spi:triStateProvTX'] || 'N/A',
        country: project['spi:triCountryTX'] || 'N/A',
        classification: project['spi:triProjectClassificationLI'] || 'N/A',
        projectType: project['spi:triProjectTypeLI'] || 'N/A',
        building: project['spi:triProjectLocationTX'] || 'N/A',
        currency: project['spi:triCurrencyUO'] || 'USD',
        organization: project['spi:OrgName'] || 'N/A',
        
        // Calculate derived fields
        progress: calculateProgress(project),
        healthScore: calculateHealthScore(project),
        riskScore: calculateRiskScore(project),
        timeline: formatTimeline(
          project['spi:triProjectPlanStartDA'],
          project['spi:triProjectPlanEndDA']
        ),
        
        // Additional fields
        priority: determinePriority(project),
        description: `${project['spi:triProjectClassificationLI'] || 'Project'} in ${project['spi:triCityTX'] || 'Unknown Location'}`,
        
        // Related data
        budgetDetails: budgetDetails,
        proposalDetails: proposalDetails,
        contractDetails: contractDetails,
        paymentDetails: paymentDetails,
        contactRoles: contactRoles,
        purchaseOrderDetails: purchaseOrderDetails,
        
        // Flags
        hasBudget: budgetDetails !== null,
        hasProposal: proposalDetails !== null,
        hasContracts: contractDetails.length > 0,
        hasPayments: paymentDetails.length > 0,
        hasContactRoles: contactRoles.length > 0,
        hasPurchaseOrders: purchaseOrderDetails.length > 0,
        
        // Raw data for debugging
        _raw: project
      };
    });
    
    const projectsWithBudgets = projects.filter(p => p.hasBudget).length;
    const projectsWithProposals = projects.filter(p => p.hasProposal).length;
    const projectsWithContracts = projects.filter(p => p.hasContracts).length;
    const projectsWithPayments = projects.filter(p => p.hasPayments).length;
    const projectsWithContactRoles = projects.filter(p => p.hasContactRoles).length;
    const projectsWithPurchaseOrders = projects.filter(p => p.hasPurchaseOrders).length;
    
    console.log(`✅ Fetched ${projects.length} capital projects from MREF`);
    console.log(`   - ${projectsWithBudgets} with budgets`);
    console.log(`   - ${projectsWithProposals} with proposals`);
    console.log(`   - ${projectsWithContracts} with contracts`);
    console.log(`   - ${projectsWithPayments} with payments`);
    console.log(`   - ${projectsWithContactRoles} with contact roles`);
    console.log(`   - ${projectsWithPurchaseOrders} with purchase orders`);
    
    return projects;
    
  } catch (error) {
    console.error('❌ Error fetching capital projects:', error.message);
    throw error;
  }
};

/**
 * Calculate project progress percentage
 */
const calculateProgress = (project) => {
  const parseNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };
  
  const budget = parseNumber(project['spi:triBudgetOriginalRollupFR']);
  const spent = parseNumber(project['spi:triBudgetSpentRollupFR']);
  
  if (budget === 0) return 0;
  const progress = Math.round((spent / budget) * 100);
  return isNaN(progress) ? 0 : Math.min(progress, 100);
};

/**
 * Calculate project health score
 */
const calculateHealthScore = (project) => {
  const status = project['spi:triStatusCL'] || '';
  const phase = project['spi:triPhaseCL'] || '';
  
  // Simple health calculation based on status
  if (status.toLowerCase().includes('complete')) return 95;
  if (status.toLowerCase().includes('progress')) return 75;
  if (status.toLowerCase().includes('planning')) return 85;
  if (status.toLowerCase().includes('approved')) return 80;
  if (status.toLowerCase().includes('draft')) return 60;
  
  return 70; // Default
};

/**
 * Calculate project risk score
 */
const calculateRiskScore = (project) => {
  const parseNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };
  
  const budget = parseNumber(project['spi:triBudgetOriginalRollupFR']);
  const spent = parseNumber(project['spi:triBudgetSpentRollupFR']);
  const status = project['spi:triStatusCL'] || '';
  
  let risk = 30; // Base risk
  
  // Budget overrun risk
  if (budget > 0 && spent > budget * 0.9) risk += 30;
  
  // Status-based risk
  if (status.toLowerCase().includes('hold')) risk += 40;
  if (status.toLowerCase().includes('risk')) risk += 35;
  
  return Math.min(risk, 100);
};

/**
 * Format timeline string
 */
const formatTimeline = (startDate, endDate) => {
  if (!startDate || !endDate) return 'N/A';
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Determine project priority
 */
const determinePriority = (project) => {
  const parseNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };
  
  const budget = parseNumber(project['spi:triBudgetOriginalRollupFR']);
  const status = project['spi:triStatusCL'] || '';
  
  if (budget > 2000000 || status.toLowerCase().includes('critical')) return 'High';
  if (budget > 1000000) return 'Medium';
  return 'Low';
};

/**
 * Fetch single project details
 */
export const fetchProjectById = async (projectId) => {
  try {
    const projects = await fetchCapitalProjects();
    return projects.find(p => p.id === projectId || p.id === parseInt(projectId));
  } catch (error) {
    console.error(`❌ Error fetching project ${projectId}:`, error.message);
    throw error;
  }
};

/**
 * Get project statistics
 */
export const getProjectStatistics = (projects) => {
  return {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => 
      p.status.toLowerCase().includes('progress')
    ).length,
    draftProjects: projects.filter(p => 
      p.status.toLowerCase().includes('draft') || 
      p.status.toLowerCase().includes('planning')
    ).length,
    completedProjects: projects.filter(p => 
      p.status.toLowerCase().includes('complete')
    ).length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0),
    avgHealthScore: Math.round(
      projects.reduce((sum, p) => sum + p.healthScore, 0) / projects.length
    ),
    highRiskCount: projects.filter(p => p.riskScore >= 60).length,
    projectsWithBudgets: projects.filter(p => p.hasBudget).length,
    projectsWithProposals: projects.filter(p => p.hasProposal).length,
    projectsWithContracts: projects.filter(p => p.hasContracts).length,
    projectsWithPayments: projects.filter(p => p.hasPayments).length
  };
};

/**
 * Generate recommendations for a project based on real data
 */
export const generateProjectRecommendations = (project) => {
  const recommendations = [];
  
  // Budget variance analysis
  if (project.budget > 0) {
    const variance = ((project.spent / project.budget) * 100);
    if (variance > 90) {
      recommendations.push({
        type: 'warning',
        category: 'Budget',
        title: 'Budget Overrun Risk',
        description: `Project has spent ${variance.toFixed(1)}% of budget. Immediate review required.`,
        priority: 'high'
      });
    } else if (variance > 75) {
      recommendations.push({
        type: 'info',
        category: 'Budget',
        title: 'Budget Monitoring',
        description: `Project has spent ${variance.toFixed(1)}% of budget. Monitor closely.`,
        priority: 'medium'
      });
    }
  }
  
  // Phase and status analysis
  if (project.status.toLowerCase().includes('revision')) {
    recommendations.push({
      type: 'warning',
      category: 'Status',
      title: 'Revision In Progress',
      description: 'Project is under revision. Ensure timely approval to avoid delays.',
      priority: 'medium'
    });
  }
  
  // Contract analysis
  if (project.hasContracts) {
    const activeContracts = project.contractDetails.filter(c => 
      c.status && c.status.toLowerCase().includes('active')
    );
    if (activeContracts.length > 0) {
      recommendations.push({
        type: 'success',
        category: 'Contract',
        title: 'Active Contracts',
        description: `${activeContracts.length} active contract(s) in place.`,
        priority: 'low'
      });
    }
  }
  
  // Payment analysis
  if (project.hasPayments) {
    const pendingPayments = project.paymentDetails.filter(p =>
      p.status && p.status.toLowerCase().includes('pending')
    );
    if (pendingPayments.length > 0) {
      recommendations.push({
        type: 'info',
        category: 'Payment',
        title: 'Pending Payments',
        description: `${pendingPayments.length} payment(s) pending review.`,
        priority: 'medium'
      });
    }
  }
  
  // Proposal analysis
  if (project.hasProposal && project.proposalDetails) {
    if (project.proposalDetails.status && project.proposalDetails.status.toLowerCase().includes('pending')) {
      recommendations.push({
        type: 'warning',
        category: 'Proposal',
        title: 'Proposal Routing Required',
        description: 'Proposal is pending approval. Expedite routing process.',
        priority: 'high'
      });
    }
  }
  
  // Timeline analysis
  if (project.endDate) {
    const endDate = new Date(project.endDate);
    const today = new Date();
    const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEnd < 0) {
      recommendations.push({
        type: 'error',
        category: 'Timeline',
        title: 'Project Overdue',
        description: `Project is ${Math.abs(daysUntilEnd)} days overdue. Immediate action required.`,
        priority: 'high'
      });
    } else if (daysUntilEnd < 30) {
      recommendations.push({
        type: 'warning',
        category: 'Timeline',
        title: 'Approaching Deadline',
        description: `Project deadline in ${daysUntilEnd} days. Ensure timely completion.`,
        priority: 'medium'
      });
    }
  }
  
  return recommendations;
};

// Made with Bob
