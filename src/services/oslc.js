/**
 * Complete OSLC Service Layer
 * 
 * Provides abstraction for all OSLC operations.
 * Currently uses mock implementations that can be replaced with actual MREF endpoints.
 * 
 * All business logic is independent of the data source.
 * Only endpoint URLs need to be changed when connecting to real MREF.
 */

import apiClient from './api';

/**
 * Base OSLC Service
 */
class OSLCService {
  constructor(resourceType, endpoint) {
    this.resourceType = resourceType;
    this.endpoint = endpoint;
    this.useMock = false; // Production mode - use real MREF API
  }

  /**
   * Create a resource
   */
  async create(data) {
    if (this.useMock) {
      return this.mockCreate(data);
    }
    const response = await apiClient.post(this.endpoint, data);
    return response.data;
  }

  /**
   * Read a resource by ID
   */
  async read(id) {
    if (this.useMock) {
      return this.mockRead(id);
    }
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Update a resource
   */
  async update(id, data) {
    if (this.useMock) {
      return this.mockUpdate(id, data);
    }
    const response = await apiClient.put(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Delete a resource
   */
  async delete(id) {
    if (this.useMock) {
      return this.mockDelete(id);
    }
    const response = await apiClient.delete(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Query resources
   */
  async query(filters = {}) {
    if (this.useMock) {
      return this.mockQuery(filters);
    }
    const response = await apiClient.get(this.endpoint, { params: filters });
    return response.data;
  }

  // Mock implementations (to be replaced with real API calls)
  mockCreate(data) {
    return { success: true, id: `mock-${Date.now()}`, ...data };
  }

  mockRead(id) {
    return { success: true, id, resourceType: this.resourceType };
  }

  mockUpdate(id, data) {
    return { success: true, id, ...data };
  }

  mockDelete(id) {
    return { success: true, id };
  }

  mockQuery(filters) {
    return { success: true, results: [], filters };
  }
}

/**
 * Capital Project Service
 */
export class CapitalProjectService extends OSLCService {
  constructor() {
    super('CapitalProject', '/oslc/spq/cstCapitalProjectQC');
  }

  async createProject(projectData) {
    return await this.create({
      'spi:triNameTX': projectData.name,
      'spi:triStatusCL': projectData.status || 'Draft',
      'spi:triPhaseCL': projectData.phase || 'Planning',
      'spi:triProjectLeadTX': projectData.projectManager,
      'spi:triProjectLocationTX': projectData.location,
      'spi:triCityTX': projectData.city,
      'spi:triStateProvTX': projectData.state,
      'spi:triCountryTX': projectData.country,
      'spi:triProjectClassificationLI': projectData.classification,
      'spi:triProjectTypeLI': projectData.projectType,
      'spi:triProjectPlanStartDA': projectData.startDate,
      'spi:triProjectPlanEndDA': projectData.endDate
    });
  }

  async updateProjectStatus(projectId, status) {
    return await this.update(projectId, { 'spi:triStatusCL': status });
  }

  async updateProjectPhase(projectId, phase) {
    return await this.update(projectId, { 'spi:triPhaseCL': phase });
  }
}

/**
 * Budget Service
 */
export class BudgetService extends OSLCService {
  constructor() {
    super('Budget', '/oslc/spq/cstBudgetQC');
  }

  async createBudget(budgetData) {
    return await this.create({
      'spi:triNameTX': budgetData.name,
      'spi:triStatusCL': budgetData.status || 'Draft',
      'spi:triBudgetTypeCL': budgetData.budgetType,
      'spi:triBudgetAmountFR': budgetData.budgetAmount,
      'spi:triEstimatedCostFR': budgetData.estimatedCost,
      'spi:triCurrencyUO': budgetData.currency || 'USD'
    });
  }

  async updateBudgetAmount(budgetId, amount) {
    return await this.update(budgetId, { 'spi:triBudgetAmountFR': amount });
  }
}

/**
 * Funding Request Service
 */
export class FundingRequestService extends OSLCService {
  constructor() {
    super('FundingRequest', '/oslc/spq/cstFundingRequestQC');
  }

  async createFundingRequest(fundingData) {
    return await this.create({
      'spi:triNameTX': fundingData.name,
      'spi:triStatusCL': fundingData.status || 'Pending',
      'spi:triRequestAmountFR': fundingData.requestAmount,
      'spi:triJustificationTX': fundingData.justification,
      'spi:triRequestDateDA': fundingData.requestDate || new Date().toISOString()
    });
  }

  async approveFundingRequest(requestId, approvalData) {
    return await this.update(requestId, {
      'spi:triStatusCL': 'Approved',
      'spi:triApprovedAmountFR': approvalData.approvedAmount,
      'spi:triApprovedByTX': approvalData.approvedBy,
      'spi:triApprovalDateDA': new Date().toISOString()
    });
  }
}

/**
 * Contract Service
 */
export class ContractService extends OSLCService {
  constructor() {
    super('Contract', '/oslc/spq/cstContractQC');
  }

  async createContract(contractData) {
    return await this.create({
      'spi:triNameTX': contractData.name,
      'spi:triStatusCL': contractData.status || 'Draft',
      'spi:triContractTypeCL': contractData.contractType,
      'spi:triApprovedAmountFR': contractData.approvedAmount,
      'spi:triContractStateCL': contractData.contractState || 'Pending',
      'spi:triVendorTX': contractData.vendor,
      'spi:triStartDateDA': contractData.startDate,
      'spi:triEndDateDA': contractData.endDate
    });
  }

  async executeContract(contractId) {
    return await this.update(contractId, {
      'spi:triContractStateCL': 'Executed',
      'spi:triExecutionDateDA': new Date().toISOString()
    });
  }
}

/**
 * Purchase Order Service
 */
export class PurchaseOrderService extends OSLCService {
  constructor() {
    super('PurchaseOrder', '/oslc/spq/cstPurchaseOrderQC');
  }

  async createPurchaseOrder(poData) {
    return await this.create({
      'spi:triNameTX': poData.name,
      'spi:triStatusCL': poData.status || 'Draft',
      'spi:triPONumberTX': poData.poNumber,
      'spi:triAmountFR': poData.amount,
      'spi:triVendorTX': poData.vendor,
      'spi:triIssueDateDA': poData.issueDate || new Date().toISOString()
    });
  }

  async approvePurchaseOrder(poId) {
    return await this.update(poId, {
      'spi:triStatusCL': 'Approved',
      'spi:triApprovalDateDA': new Date().toISOString()
    });
  }
}

/**
 * Invoice Service
 */
export class InvoiceService extends OSLCService {
  constructor() {
    super('Invoice', '/oslc/spq/cstInvoiceQC');
  }

  async createInvoice(invoiceData) {
    return await this.create({
      'spi:triNameTX': invoiceData.name,
      'spi:triStatusCL': invoiceData.status || 'Pending',
      'spi:triInvoiceNumberTX': invoiceData.invoiceNumber,
      'spi:triInvoiceAmountFR': invoiceData.invoiceAmount,
      'spi:triVendorTX': invoiceData.vendor,
      'spi:triInvoiceDateDA': invoiceData.invoiceDate || new Date().toISOString()
    });
  }

  async approveInvoice(invoiceId) {
    return await this.update(invoiceId, {
      'spi:triStatusCL': 'Approved',
      'spi:triApprovalDateDA': new Date().toISOString()
    });
  }
}

/**
 * Payment Service
 */
export class PaymentService extends OSLCService {
  constructor() {
    super('Payment', '/oslc/spq/cstPaymentQC');
  }

  async createPayment(paymentData) {
    return await this.create({
      'spi:triNameTX': paymentData.name,
      'spi:triStatusCL': paymentData.status || 'Pending',
      'spi:triPaymentAmountFR': paymentData.paymentAmount,
      'spi:triPayeeTX': paymentData.payee,
      'spi:triPaymentDateDA': paymentData.paymentDate || new Date().toISOString()
    });
  }

  async processPayment(paymentId) {
    return await this.update(paymentId, {
      'spi:triStatusCL': 'Processed',
      'spi:triProcessedDateDA': new Date().toISOString()
    });
  }
}

/**
 * Risk Service
 */
export class RiskService extends OSLCService {
  constructor() {
    super('Risk', '/oslc/spq/cstRiskQC');
  }

  async createRisk(riskData) {
    return await this.create({
      'spi:triNameTX': riskData.name,
      'spi:triStatusCL': riskData.status || 'Open',
      'spi:triRiskTypeCL': riskData.riskType,
      'spi:triSeverityCL': riskData.severity,
      'spi:triLikelihoodCL': riskData.likelihood,
      'spi:triImpactCL': riskData.impact,
      'spi:triDescriptionTX': riskData.description,
      'spi:triMitigationTX': riskData.mitigation
    });
  }

  async mitigateRisk(riskId, mitigationPlan) {
    return await this.update(riskId, {
      'spi:triMitigationTX': mitigationPlan,
      'spi:triStatusCL': 'Mitigated'
    });
  }
}

/**
 * Meeting Service
 */
export class MeetingService extends OSLCService {
  constructor() {
    super('Meeting', '/oslc/spq/cstMeetingQC');
  }

  async createMeeting(meetingData) {
    return await this.create({
      'spi:triNameTX': meetingData.name,
      'spi:triStatusCL': meetingData.status || 'Scheduled',
      'spi:triMeetingTypeCL': meetingData.meetingType,
      'spi:triMeetingDateDA': meetingData.meetingDate,
      'spi:triLocationTX': meetingData.location,
      'spi:triAgendaTX': meetingData.agenda
    });
  }
}

/**
 * Task Service
 */
export class TaskService extends OSLCService {
  constructor() {
    super('Task', '/oslc/spq/cstTaskQC');
  }

  async createTask(taskData) {
    return await this.create({
      'spi:triNameTX': taskData.name,
      'spi:triStatusCL': taskData.status || 'Not Started',
      'spi:triTaskTypeCL': taskData.taskType,
      'spi:triAssignedToTX': taskData.assignedTo,
      'spi:triDueDateDA': taskData.dueDate,
      'spi:triPriorityCL': taskData.priority,
      'spi:triDescriptionTX': taskData.description
    });
  }

  async completeTask(taskId) {
    return await this.update(taskId, {
      'spi:triStatusCL': 'Completed',
      'spi:triCompletionDateDA': new Date().toISOString()
    });
  }
}

/**
 * Approval Service
 */
export class ApprovalService extends OSLCService {
  constructor() {
    super('Approval', '/oslc/spq/cstApprovalQC');
  }

  async createApproval(approvalData) {
    return await this.create({
      'spi:triNameTX': approvalData.name,
      'spi:triStatusCL': approvalData.status || 'Pending',
      'spi:triApprovalTypeCL': approvalData.approvalType,
      'spi:triApproverTX': approvalData.approver,
      'spi:triRequestDateDA': approvalData.requestDate || new Date().toISOString(),
      'spi:triDescriptionTX': approvalData.description
    });
  }

  async approve(approvalId, approverName, comments) {
    return await this.update(approvalId, {
      'spi:triStatusCL': 'Approved',
      'spi:triApprovedByTX': approverName,
      'spi:triApprovalDateDA': new Date().toISOString(),
      'spi:triCommentsTX': comments
    });
  }

  async reject(approvalId, approverName, reason) {
    return await this.update(approvalId, {
      'spi:triStatusCL': 'Rejected',
      'spi:triRejectedByTX': approverName,
      'spi:triRejectionDateDA': new Date().toISOString(),
      'spi:triRejectionReasonTX': reason
    });
  }
}

/**
 * Change Request Service
 */
export class ChangeRequestService extends OSLCService {
  constructor() {
    super('ChangeRequest', '/oslc/spq/cstChangeRequestQC');
  }

  async createChangeRequest(changeData) {
    return await this.create({
      'spi:triNameTX': changeData.name,
      'spi:triStatusCL': changeData.status || 'Pending',
      'spi:triChangeTypeCL': changeData.changeType,
      'spi:triImpactCL': changeData.impact,
      'spi:triCostImpactFR': changeData.costImpact,
      'spi:triScheduleImpactNU': changeData.scheduleImpact,
      'spi:triDescriptionTX': changeData.description,
      'spi:triJustificationTX': changeData.justification
    });
  }

  async approveChangeRequest(changeId) {
    return await this.update(changeId, {
      'spi:triStatusCL': 'Approved',
      'spi:triApprovalDateDA': new Date().toISOString()
    });
  }
}

/**
 * Vendor Service
 */
export class VendorService extends OSLCService {
  constructor() {
    super('Vendor', '/oslc/spq/cstVendorQC');
  }

  async createVendor(vendorData) {
    return await this.create({
      'spi:triNameTX': vendorData.name,
      'spi:triStatusCL': vendorData.status || 'Active',
      'spi:triVendorTypeCL': vendorData.vendorType,
      'spi:triContactNameTX': vendorData.contactName,
      'spi:triContactEmailTX': vendorData.contactEmail,
      'spi:triContactPhoneTX': vendorData.contactPhone,
      'spi:triAddressTX': vendorData.address
    });
  }
}

/**
 * RFQ Service
 */
export class RFQService extends OSLCService {
  constructor() {
    super('RFQ', '/oslc/spq/cstRFQQC');
  }

  async createRFQ(rfqData) {
    return await this.create({
      'spi:triNameTX': rfqData.name,
      'spi:triStatusCL': rfqData.status || 'Draft',
      'spi:triRFQNumberTX': rfqData.rfqNumber,
      'spi:triIssueDateDA': rfqData.issueDate || new Date().toISOString(),
      'spi:triDueDateDA': rfqData.dueDate,
      'spi:triDescriptionTX': rfqData.description
    });
  }

  async issueRFQ(rfqId) {
    return await this.update(rfqId, {
      'spi:triStatusCL': 'Issued',
      'spi:triIssueDateDA': new Date().toISOString()
    });
  }
}

/**
 * RFP Service
 */
export class RFPService extends OSLCService {
  constructor() {
    super('RFP', '/oslc/spq/cstRFPQC');
  }

  async createRFP(rfpData) {
    return await this.create({
      'spi:triNameTX': rfpData.name,
      'spi:triStatusCL': rfpData.status || 'Draft',
      'spi:triRFPNumberTX': rfpData.rfpNumber,
      'spi:triIssueDateDA': rfpData.issueDate || new Date().toISOString(),
      'spi:triDueDateDA': rfpData.dueDate,
      'spi:triDescriptionTX': rfpData.description
    });
  }

  async issueRFP(rfpId) {
    return await this.update(rfpId, {
      'spi:triStatusCL': 'Issued',
      'spi:triIssueDateDA': new Date().toISOString()
    });
  }
}

/**
 * Bid Service
 */
export class BidService extends OSLCService {
  constructor() {
    super('Bid', '/oslc/spq/cstBidQC');
  }

  async createBid(bidData) {
    return await this.create({
      'spi:triNameTX': bidData.name,
      'spi:triStatusCL': bidData.status || 'Submitted',
      'spi:triBidAmountFR': bidData.bidAmount,
      'spi:triVendorTX': bidData.vendor,
      'spi:triSubmissionDateDA': bidData.submissionDate || new Date().toISOString()
    });
  }

  async acceptBid(bidId) {
    return await this.update(bidId, {
      'spi:triStatusCL': 'Accepted',
      'spi:triAcceptanceDateDA': new Date().toISOString()
    });
  }
}

/**
 * Cost Code Service
 */
export class CostCodeService extends OSLCService {
  constructor() {
    super('CostCode', '/oslc/spq/cstCostCodeQC');
  }

  async createCostCode(costCodeData) {
    return await this.create({
      'spi:triNameTX': costCodeData.name,
      'spi:triCostCodeTX': costCodeData.costCode,
      'spi:triCostCodeTypeCL': costCodeData.costCodeType,
      'spi:triBudgetAmountFR': costCodeData.budgetAmount,
      'spi:triDescriptionTX': costCodeData.description
    });
  }
}

/**
 * Milestone Service
 */
export class MilestoneService extends OSLCService {
  constructor() {
    super('Milestone', '/oslc/spq/cstMilestoneQC');
  }

  async createMilestone(milestoneData) {
    return await this.create({
      'spi:triNameTX': milestoneData.name,
      'spi:triStatusCL': milestoneData.status || 'Not Started',
      'spi:triPlannedDateDA': milestoneData.plannedDate,
      'spi:triActualDateDA': milestoneData.actualDate,
      'spi:triDescriptionTX': milestoneData.description
    });
  }

  async completeMilestone(milestoneId) {
    return await this.update(milestoneId, {
      'spi:triStatusCL': 'Completed',
      'spi:triActualDateDA': new Date().toISOString()
    });
  }
}

// Export service instances
export const capitalProjectService = new CapitalProjectService();
export const budgetService = new BudgetService();
export const fundingRequestService = new FundingRequestService();
export const contractService = new ContractService();
export const purchaseOrderService = new PurchaseOrderService();
export const invoiceService = new InvoiceService();
export const paymentService = new PaymentService();
export const riskService = new RiskService();
export const meetingService = new MeetingService();
export const taskService = new TaskService();
export const approvalService = new ApprovalService();
export const changeRequestService = new ChangeRequestService();
export const vendorService = new VendorService();
export const rfqService = new RFQService();
export const rfpService = new RFPService();
export const bidService = new BidService();
export const costCodeService = new CostCodeService();
export const milestoneService = new MilestoneService();

// Made with Bob
