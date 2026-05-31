import React, { useState, useMemo } from 'react';
import { X, Building2, DollarSign, FileText, ShoppingCart, CreditCard, AlertTriangle, TrendingUp, Clock, Target, Zap, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { GradientCard, RadialProgress, InsightCard } from '../common/PremiumCard';

const ProjectAnalysisModal = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});

  if (!project) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Field label mapping for OSLC technical names to business-friendly labels
  const fieldLabelMap = {
    // Project fields
    'dcterms:identifier': 'Identifier',
    'spi:triIdTX': 'Project ID',
    'spi:triNameTX': 'Name',
    'spi:triStatusCL': 'Status',
    'spi:triPhaseCL': 'Phase',
    'spi:triProjectClassificationLI': 'Classification',
    'spi:triProjectTypeLI': 'Project Type',
    'spi:triProjectLeadTX': 'Project Lead',
    'spi:triCountryTX': 'Country',
    'spi:triStateProvTX': 'State/Province',
    'spi:triCityTX': 'City',
    'spi:triProjectLocationTX': 'Location',
    'spi:triCurrencyUO': 'Currency',
    'spi:triProjectPlanStartDA': 'Planned Start Date',
    'spi:triProjectPlanEndDA': 'Planned End Date',
    'spi:triProjectActualStartDA': 'Actual Start Date',
    'spi:triProjectActualEndDA': 'Actual End Date',
    'spi:triBudgetOriginalRollupFR': 'Original Budget',
    'spi:triBudgetSpentRollupFR': 'Budget Spent',
    'spi:triIncurredInvoiceRollupFR': 'Incurred Invoice',
    'spi:triIncurredPaidRollupFR': 'Incurred Paid',
    'spi:triCommitmentOriginalRollupFR': 'Commitment Original',
    'spi:triCommitmentChangesRollupFR': 'Commitment Changes',
    'spi:OrgName': 'Organization',
    'spi:triGrossAreaNU': 'Gross Area',
    'spi:triUsableAreaNU': 'Usable Area',
    'spi:triWorkflowStateCL': 'Workflow State',
    'dcterms:created': 'Created Date',
    'dcterms:modified': 'Modified Date',
    'spi:triTimeZoneTX': 'Time Zone',
    
    // Budget fields
    'spi:triBudgetTypeCL': 'Budget Type',
    'spi:triForecastTypeCL': 'Forecast Type',
    'spi:triEstimatedCostFR': 'Estimated Cost',
    'spi:triTotalCostFR': 'Total Cost',
    'spi:triBudgetAmountFR': 'Budget Amount',
    'spi:triForecastCostFR': 'Forecast Cost',
    'spi:triIncurredCostFR': 'Incurred Cost',
    'spi:triBudgetChangesFR': 'Budget Changes',
    'spi:triBudgetTransfersFR': 'Budget Transfers',
    'spi:triCommitmentsFR': 'Commitments',
    'spi:triInvoiceRollupFR': 'Invoice Rollup',
    'spi:triPaidRollupFR': 'Paid Rollup',
    'spi:triVarianceFR': 'Variance',
    'spi:triBudgetOwnerTX': 'Budget Owner',
    'spi:triBudgetWorkflowCL': 'Budget Workflow',
    
    // Proposal fields
    'spi:triProposalTypeCL': 'Proposal Type',
    'spi:triContactNameTX': 'Contact Name',
    'spi:triContactEmailTX': 'Contact Email',
    'spi:triContactPhoneTX': 'Contact Phone',
    'spi:triProposalDateDA': 'Proposal Date',
    'spi:triBidAmountFR': 'Bid Amount',
    'spi:triRoutingStatusCL': 'Routing Status',
    'spi:triApprovalStateCL': 'Approval State',
    'spi:triProposalWorkflowCL': 'Proposal Workflow',
    'spi:triSubmittedDateDA': 'Submitted Date',
    'spi:triApprovedDateDA': 'Approved Date',
    
    // Contract fields
    'spi:triContractTypeCL': 'Contract Type',
    'spi:triApprovedAmountFR': 'Approved Amount',
    'spi:triChangeOrdersFR': 'Change Orders',
    'spi:triContractStateCL': 'Contract State',
    'spi:triRevisionNumberNU': 'Revision Number',
    'spi:triVendorNameTX': 'Vendor Name',
    'spi:triVendorCodeTX': 'Vendor Code',
    'spi:triContractStartDA': 'Contract Start Date',
    'spi:triContractEndDA': 'Contract End Date',
    'spi:triProcurementValueFR': 'Procurement Value',
    'spi:triContractWorkflowCL': 'Contract Workflow',
    
    // Payment fields
    'spi:triInvoiceAmountFR': 'Invoice Amount',
    'spi:triPayeeTX': 'Payee',
    'spi:triPaymentDateDA': 'Payment Date',
    'spi:triInvoiceNumberTX': 'Invoice Number',
    'spi:triInvoiceDateDA': 'Invoice Date',
    'spi:triBillingAmountFR': 'Billing Amount',
    'spi:triPaymentStatusCL': 'Payment Status',
    'spi:triPaymentWorkflowCL': 'Payment Workflow',
    'spi:triApprovalDateDA': 'Approval Date',
    'spi:triPaymentMethodCL': 'Payment Method'
  };

  // Group fields by category
  const categorizeFields = (data) => {
    const categories = {
      identification: [],
      financial: [],
      timeline: [],
      location: [],
      governance: [],
      workflow: [],
      metadata: [],
      other: []
    };

    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith('_') || key === 'rdf:resource' || key === 'rdf:about') return;
      if (value === null || value === undefined || value === '') return;
      if (typeof value === 'object' && !Array.isArray(value)) return;

      const field = { key, value, label: fieldLabelMap[key] || formatFieldName(key) };

      // Categorize based on field name patterns
      if (key.includes('Id') || key.includes('identifier') || key.includes('Name') || key.includes('Type')) {
        categories.identification.push(field);
      } else if (key.includes('Amount') || key.includes('Cost') || key.includes('Budget') || key.includes('Currency') || key.includes('Variance') || key.includes('Rollup')) {
        categories.financial.push(field);
      } else if (key.includes('Date') || key.includes('Start') || key.includes('End') || key.includes('Timeline')) {
        categories.timeline.push(field);
      } else if (key.includes('Country') || key.includes('State') || key.includes('City') || key.includes('Location') || key.includes('Area')) {
        categories.location.push(field);
      } else if (key.includes('Status') || key.includes('State') || key.includes('Phase') || key.includes('Approval')) {
        categories.governance.push(field);
      } else if (key.includes('Workflow') || key.includes('Routing')) {
        categories.workflow.push(field);
      } else if (key.includes('created') || key.includes('modified') || key.includes('Owner') || key.includes('Lead')) {
        categories.metadata.push(field);
      } else {
        categories.other.push(field);
      }
    });

    return categories;
  };

  // Format technical field names to readable labels
  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/^(spi:|dcterms:|rdf:)/, '')
      .replace(/([A-Z])/g, ' $1')
      .replace(/([A-Z]{2,})/g, ' $1')
      .replace(/(TX|CL|FR|NU|DA|LI|UO)$/g, '')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Format field value for display
  const formatFieldValue = (value, key) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Currency fields
    if (key.includes('Amount') || key.includes('Cost') || key.includes('Budget') || key.includes('Rollup') || key.includes('Variance')) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return formatCurrency(numValue);
      }
    }
    
    // Date fields
    if (key.includes('Date') || key.includes('DA')) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
      } catch (e) {
        return value;
      }
    }
    
    // Number fields
    if (key.includes('NU') && !isNaN(value)) {
      return parseFloat(value).toLocaleString();
    }
    
    return value.toString();
  };

  // Render field group
  const FieldGroup = ({ title, fields, gradient = 'gray' }) => {
    if (fields.length === 0) return null;
    
    const sectionId = title.toLowerCase().replace(/\s+/g, '-');
    const isExpanded = expandedSections[sectionId] !== false; // Default to expanded

    return (
      <GradientCard gradient={gradient} className="p-6">
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
        >
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field, index) => (
              <div key={index} className="bg-white/60 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">{field.label}</p>
                <p className="font-semibold text-gray-900 break-words">
                  {formatFieldValue(field.value, field.key)}
                </p>
              </div>
            ))}
          </div>
        )}
      </GradientCard>
    );
  };

  // Generate recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    
    if (project.budget > 0) {
      const utilization = (project.spent / project.budget) * 100;
      if (utilization > 90) {
        recs.push({
          type: 'error',
          title: 'Budget Utilization Critical',
          message: `Project has spent ${utilization.toFixed(1)}% of allocated budget. Immediate review recommended.`,
          icon: AlertTriangle
        });
      } else if (utilization > 75) {
        recs.push({
          type: 'warning',
          title: 'High Budget Utilization',
          message: `Budget utilization at ${utilization.toFixed(1)}%. Monitor spending closely.`,
          icon: DollarSign
        });
      }
    }

    if (project.riskScore >= 60) {
      recs.push({
        type: 'error',
        title: 'High Risk Project',
        message: `Risk score of ${project.riskScore}% requires immediate governance attention.`,
        icon: AlertTriangle
      });
    }

    if (project.status?.toLowerCase().includes('revision')) {
      recs.push({
        type: 'warning',
        title: 'Revision In Progress',
        message: 'Project is under revision. Ensure timely completion of review process.',
        icon: FileText
      });
    }

    if (project.hasProposal && project.proposalDetails?.status?.toLowerCase().includes('pending')) {
      recs.push({
        type: 'warning',
        title: 'Proposal Approval Pending',
        message: 'Proposal awaiting approval. Expedite routing to avoid delays.',
        icon: FileText
      });
    }

    if (recs.length === 0) {
      recs.push({
        type: 'success',
        title: 'Project On Track',
        message: 'All governance parameters within acceptable thresholds.',
        icon: CheckCircle
      });
    }

    return recs;
  }, [project]);

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: Building2 },
    { id: 'budget', label: 'Budget Intelligence', icon: DollarSign },
    { id: 'procurement', label: 'Procurement & Contracts', icon: ShoppingCart },
    { id: 'proposal', label: 'Proposal Management', icon: FileText },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
    { id: 'risks', label: 'Risks & Governance', icon: AlertTriangle },
    { id: 'recommendations', label: 'Agent Recommendations', icon: Zap },
    { id: 'timeline', label: 'Timeline & Activity', icon: Clock }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-ibm-blue to-blue-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Zap className="w-7 h-7" />
              Capital Project Intelligence Workspace
            </h2>
            <p className="text-blue-100 mt-1">{project.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-ibm-blue border-b-2 border-ibm-blue bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GradientCard gradient="blue" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Health</h3>
                  <div className="flex justify-center">
                    <RadialProgress
                      value={project.healthScore}
                      max={100}
                      size={120}
                      strokeWidth={10}
                      color={project.healthScore >= 80 ? 'green' : project.healthScore >= 60 ? 'orange' : 'red'}
                      label="Health"
                    />
                  </div>
                </GradientCard>

                <GradientCard gradient="red" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                  <div className="flex justify-center">
                    <RadialProgress
                      value={project.riskScore}
                      max={100}
                      size={120}
                      strokeWidth={10}
                      color={project.riskScore >= 60 ? 'red' : project.riskScore >= 40 ? 'orange' : 'green'}
                      label="Risk"
                    />
                  </div>
                </GradientCard>

                <GradientCard gradient="green" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Status</h3>
                  <div className="flex justify-center">
                    <RadialProgress
                      value={(project.spent / project.budget) * 100}
                      max={100}
                      size={120}
                      strokeWidth={10}
                      color="green"
                      label="Utilized"
                    />
                  </div>
                </GradientCard>
              </div>

              {(() => {
                const rawData = project._raw || project;
                const categories = categorizeFields(rawData);
                
                return (
                  <>
                    <FieldGroup title="Project Identification" fields={categories.identification} gradient="blue" />
                    <FieldGroup title="Financial Information" fields={categories.financial} gradient="green" />
                    <FieldGroup title="Timeline & Dates" fields={categories.timeline} gradient="purple" />
                    <FieldGroup title="Location Details" fields={categories.location} gradient="orange" />
                    <FieldGroup title="Governance & Status" fields={categories.governance} gradient="red" />
                    <FieldGroup title="Workflow Information" fields={categories.workflow} gradient="gray" />
                    <FieldGroup title="Metadata" fields={categories.metadata} gradient="gray" />
                    {categories.other.length > 0 && (
                      <FieldGroup title="Additional Information" fields={categories.other} gradient="gray" />
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-6">
              {project.hasBudget && project.budgetDetails ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GradientCard gradient="green" className="p-6">
                      <p className="text-sm text-gray-600 mb-2">Budget Amount</p>
                      <p className="text-3xl font-bold text-gray-900">{formatCurrency(project.budgetDetails.budgetAmount)}</p>
                      <p className="text-sm text-gray-600 mt-2">{project.budgetDetails.status || 'Active'}</p>
                    </GradientCard>
                    <GradientCard gradient="blue" className="p-6">
                      <p className="text-sm text-gray-600 mb-2">Incurred Cost</p>
                      <p className="text-3xl font-bold text-gray-900">{formatCurrency(project.budgetDetails.incurredCost)}</p>
                      <p className="text-sm text-gray-600 mt-2">Actual spending</p>
                    </GradientCard>
                    <GradientCard gradient="purple" className="p-6">
                      <p className="text-sm text-gray-600 mb-2">Forecast Cost</p>
                      <p className="text-3xl font-bold text-gray-900">{formatCurrency(project.budgetDetails.forecastCost)}</p>
                      <p className="text-sm text-gray-600 mt-2">Projected total</p>
                    </GradientCard>
                  </div>

                  {(() => {
                    const rawData = project.budgetDetails._raw || project.budgetDetails;
                    const categories = categorizeFields(rawData);
                    
                    return (
                      <>
                        <FieldGroup title="Budget Identification" fields={categories.identification} gradient="blue" />
                        <FieldGroup title="Financial Details" fields={categories.financial} gradient="green" />
                        <FieldGroup title="Budget Timeline" fields={categories.timeline} gradient="purple" />
                        <FieldGroup title="Budget Governance" fields={categories.governance} gradient="red" />
                        <FieldGroup title="Budget Workflow" fields={categories.workflow} gradient="gray" />
                        <FieldGroup title="Budget Metadata" fields={categories.metadata} gradient="gray" />
                        {categories.other.length > 0 && (
                          <FieldGroup title="Additional Budget Information" fields={categories.other} gradient="gray" />
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <GradientCard gradient="gray" className="p-12 text-center">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Budget Data Available</h3>
                  <p className="text-gray-600">Budget information has not been linked to this project.</p>
                </GradientCard>
              )}
            </div>
          )}

          {activeTab === 'procurement' && (
            <div className="space-y-6">
              {project.hasContracts && project.contractDetails && project.contractDetails.length > 0 ? (
                <>
                  {project.contractDetails.map((contract, index) => {
                    const rawData = contract._raw || contract;
                    const categories = categorizeFields(rawData);
                    
                    return (
                      <div key={index} className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-gray-900">
                            Contract {index + 1}: {contract.name || 'Unnamed Contract'}
                          </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <GradientCard gradient="orange" className="p-6">
                            <p className="text-sm text-gray-600 mb-2">Approved Amount</p>
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(contract.approvedAmount)}</p>
                            <p className="text-sm text-gray-600 mt-2">{contract.status || 'Active'}</p>
                          </GradientCard>
                          <GradientCard gradient="blue" className="p-6">
                            <p className="text-sm text-gray-600 mb-2">Change Orders</p>
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(contract.changeOrders || 0)}</p>
                            <p className="text-sm text-gray-600 mt-2">Modifications</p>
                          </GradientCard>
                          <GradientCard gradient="purple" className="p-6">
                            <p className="text-sm text-gray-600 mb-2">Contract State</p>
                            <p className="text-2xl font-bold text-gray-900">{contract.contractState || 'N/A'}</p>
                            <p className="text-sm text-gray-600 mt-2">Current status</p>
                          </GradientCard>
                        </div>

                        <FieldGroup title="Contract Identification" fields={categories.identification} gradient="blue" />
                        <FieldGroup title="Financial Details" fields={categories.financial} gradient="green" />
                        <FieldGroup title="Contract Timeline" fields={categories.timeline} gradient="purple" />
                        <FieldGroup title="Contract Governance" fields={categories.governance} gradient="red" />
                        <FieldGroup title="Contract Workflow" fields={categories.workflow} gradient="gray" />
                        <FieldGroup title="Contract Metadata" fields={categories.metadata} gradient="gray" />
                        {categories.other.length > 0 && (
                          <FieldGroup title="Additional Contract Information" fields={categories.other} gradient="gray" />
                        )}
                        
                        {index < project.contractDetails.length - 1 && (
                          <div className="border-t-2 border-gray-300 my-8"></div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <GradientCard gradient="gray" className="p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contract Data Available</h3>
                  <p className="text-gray-600">No procurement contracts have been linked to this project.</p>
                </GradientCard>
              )}
            </div>
          )}

          {activeTab === 'proposal' && (
            <div className="space-y-6">
              {project.hasProposal && project.proposalDetails ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GradientCard gradient="blue" className="p-6">
                      <p className="text-sm text-gray-600 mb-2">Proposal Status</p>
                      <p className="text-2xl font-bold text-gray-900">{project.proposalDetails.status || 'N/A'}</p>
                      <p className="text-sm text-gray-600 mt-2">Current state</p>
                    </GradientCard>
                    <GradientCard gradient="green" className="p-6">
                      <p className="text-sm text-gray-600 mb-2">Bid Amount</p>
                      <p className="text-3xl font-bold text-gray-900">{formatCurrency(project.proposalDetails.bidAmount || 0)}</p>
                      <p className="text-sm text-gray-600 mt-2">Proposed value</p>
                    </GradientCard>
                    <GradientCard gradient="purple" className="p-6">
                      <p className="text-sm text-gray-600 mb-2">Proposal Type</p>
                      <p className="text-2xl font-bold text-gray-900">{project.proposalDetails.proposalType || 'N/A'}</p>
                      <p className="text-sm text-gray-600 mt-2">Category</p>
                    </GradientCard>
                  </div>

                  {(() => {
                    const rawData = project.proposalDetails._raw || project.proposalDetails;
                    const categories = categorizeFields(rawData);
                    
                    return (
                      <>
                        <FieldGroup title="Proposal Identification" fields={categories.identification} gradient="blue" />
                        <FieldGroup title="Financial Details" fields={categories.financial} gradient="green" />
                        <FieldGroup title="Proposal Timeline" fields={categories.timeline} gradient="purple" />
                        <FieldGroup title="Proposal Governance" fields={categories.governance} gradient="red" />
                        <FieldGroup title="Proposal Workflow" fields={categories.workflow} gradient="gray" />
                        <FieldGroup title="Proposal Metadata" fields={categories.metadata} gradient="gray" />
                        {categories.other.length > 0 && (
                          <FieldGroup title="Additional Proposal Information" fields={categories.other} gradient="gray" />
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <GradientCard gradient="gray" className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Proposal Data Available</h3>
                  <p className="text-gray-600">No proposals have been linked to this project.</p>
                </GradientCard>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              {project.hasPayments && project.paymentDetails && project.paymentDetails.length > 0 ? (
                <>
                  {project.paymentDetails.map((payment, index) => {
                    const rawData = payment._raw || payment;
                    const categories = categorizeFields(rawData);
                    
                    return (
                      <div key={index} className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-gray-900">
                            Payment {index + 1}: {payment.name || 'Unnamed Payment'}
                          </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <GradientCard gradient="green" className="p-6">
                            <p className="text-sm text-gray-600 mb-2">Invoice Amount</p>
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(payment.invoiceAmount || 0)}</p>
                            <p className="text-sm text-gray-600 mt-2">Total billed</p>
                          </GradientCard>
                          <GradientCard gradient="blue" className="p-6">
                            <p className="text-sm text-gray-600 mb-2">Payment Status</p>
                            <p className="text-2xl font-bold text-gray-900">{payment.status || 'N/A'}</p>
                            <p className="text-sm text-gray-600 mt-2">Current state</p>
                          </GradientCard>
                          <GradientCard gradient="purple" className="p-6">
                            <p className="text-sm text-gray-600 mb-2">Payee</p>
                            <p className="text-xl font-bold text-gray-900">{payment.payee || 'N/A'}</p>
                            <p className="text-sm text-gray-600 mt-2">Recipient</p>
                          </GradientCard>
                        </div>

                        <FieldGroup title="Payment Identification" fields={categories.identification} gradient="blue" />
                        <FieldGroup title="Financial Details" fields={categories.financial} gradient="green" />
                        <FieldGroup title="Payment Timeline" fields={categories.timeline} gradient="purple" />
                        <FieldGroup title="Payment Governance" fields={categories.governance} gradient="red" />
                        <FieldGroup title="Payment Workflow" fields={categories.workflow} gradient="gray" />
                        <FieldGroup title="Payment Metadata" fields={categories.metadata} gradient="gray" />
                        {categories.other.length > 0 && (
                          <FieldGroup title="Additional Payment Information" fields={categories.other} gradient="gray" />
                        )}
                        
                        {index < project.paymentDetails.length - 1 && (
                          <div className="border-t-2 border-gray-300 my-8"></div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <GradientCard gradient="gray" className="p-12 text-center">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Data Available</h3>
                  <p className="text-gray-600">No payment records have been linked to this project.</p>
                </GradientCard>
              )}
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-6">
              <GradientCard gradient="red" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/60 mb-3">
                      <span className="text-3xl font-bold text-gray-900">{project.riskScore}%</span>
                    </div>
                    <p className="text-sm text-gray-700">Risk Score</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/60 mb-3">
                      <span className="text-3xl font-bold text-gray-900">{project.healthScore}%</span>
                    </div>
                    <p className="text-sm text-gray-700">Health Score</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/60 mb-3">
                      {project.riskScore >= 60 ? (
                        <XCircle className="w-10 h-10 text-red-600" />
                      ) : (
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700">Governance Status</p>
                  </div>
                </div>
              </GradientCard>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <GradientCard gradient="blue" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  AI-Powered Governance Recommendations
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Intelligent insights generated from project data analysis
                </p>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <InsightCard key={index} {...rec} />
                  ))}
                </div>
              </GradientCard>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <GradientCard gradient="gray" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
                <div className="space-y-4">
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Timeline</p>
                    <p className="font-semibold text-gray-900">{project.timeline}</p>
                  </div>
                  {project.startDate && (
                    <div className="bg-white/60 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Start Date</p>
                      <p className="font-semibold text-gray-900">{new Date(project.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {project.endDate && (
                    <div className="bg-white/60 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">End Date</p>
                      <p className="font-semibold text-gray-900">{new Date(project.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </GradientCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalysisModal;

// Made with Bob
