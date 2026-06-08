import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  X, Building2, DollarSign, FileText, ShoppingCart, CreditCard,
  AlertTriangle, TrendingUp, Calendar, MapPin, User, CheckCircle,
  Clock, Brain, Sparkles, Download, Users, Package, Receipt,
  ChevronDown, ChevronUp, Activity, Target, TrendingDown
} from 'lucide-react';

const ProjectIntelligence = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects } = useData();
  const [project, setProject] = useState(null);
  const [expandedContracts, setExpandedContracts] = useState(new Set());
  const [expandedPOs, setExpandedPOs] = useState(new Set());

  useEffect(() => {
    const foundProject = projects.find(p => p.id === parseInt(projectId));
    setProject(foundProject);
  }, [projectId, projects]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading project intelligence...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleContract = (contractId) => {
    setExpandedContracts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contractId)) {
        newSet.delete(contractId);
      } else {
        newSet.add(contractId);
      }
      return newSet;
    });
  };

  const togglePO = (poId) => {
    setExpandedPOs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(poId)) {
        newSet.delete(poId);
      } else {
        newSet.add(poId);
      }
      return newSet;
    });
  };

  const handleExport = () => {
    alert('Export functionality will be implemented in next phase');
  };

  // Calculate totals
  const totalContractValue = project.contractDetails?.reduce((sum, c) => sum + (c.approvedAmount || 0), 0) || 0;
  const totalPOValue = project.purchaseOrderDetails?.reduce((sum, po) => sum + (po.amount || 0), 0) || 0;
  const totalPaymentValue = project.paymentDetails?.reduce((sum, p) => sum + (p.invoiceAmount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="w-7 h-7 text-blue-600" />
                Project Intelligence Workspace
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{project.name}</span>
                <span>•</span>
                <span>ID: {project.projectId || project.id}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                  project.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
                <span>•</span>
                <span className="font-medium">Health: {project.healthScore || 0}/100</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        
        {/* 1. Executive Summary */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 rounded-xl shadow-xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Executive Summary
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </h2>
              <p className="text-blue-100 text-sm">AI-generated project intelligence</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-blue-100 text-sm">Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(project.budget)}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Contracts</p>
                <p className="text-2xl font-bold">{formatCurrency(totalContractValue)}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Purchase Orders</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPOValue)}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Payments</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPaymentValue)}</p>
              </div>
            </div>
            <p className="text-lg leading-relaxed">
              {project.description || `${project.classification} project in ${project.city}, ${project.state}. Managed by ${project.projectManager}. Current phase: ${project.phase}.`}
            </p>
          </div>
        </div>

        {/* 2. Project Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Project Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Project Name</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Project ID</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.projectId || project.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phase</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.phase}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Classification</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.classification}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Type</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.projectType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Building</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.building}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.city}, {project.state}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Country</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.country}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Organization</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.organization || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Currency</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.currency}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Priority</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.priority || 'Medium'}</p>
            </div>
          </div>
        </div>

        {/* 3. Project Team (Contact Roles) */}
        {project.hasContactRoles && project.contactRoles && project.contactRoles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Project Team</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.contactRoles.map((role, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{role.roleName}</p>
                      <p className="text-base font-bold text-gray-900 mt-1 truncate">{role.personName}</p>
                      <p className="text-sm text-gray-600 mt-1 truncate">{role.organization}</p>
                      {role.email && role.email !== 'N/A' && (
                        <p className="text-xs text-gray-500 mt-2 truncate">{role.email}</p>
                      )}
                      {role.phone && role.phone !== 'N/A' && (
                        <p className="text-xs text-gray-500 truncate">{role.phone}</p>
                      )}
                      {role.isPrimary && (
                        <span className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Budget Intelligence */}
        {project.hasBudget && project.budgetDetails && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Budget Intelligence</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <p className="text-sm font-medium text-green-700">Budget Amount</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(project.budgetDetails.budgetAmount)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-700">Incurred Cost</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(project.budgetDetails.incurredCost)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-700">Forecast Cost</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(project.budgetDetails.forecastCost)}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-700">Variance</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  {formatCurrency(project.budgetDetails.budgetAmount - project.budgetDetails.incurredCost)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Budget Status</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.budgetDetails.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Budget Type</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.budgetDetails.budgetType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Currency</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.budgetDetails.currency}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500 mb-2">Budget Utilization</p>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div 
                  className={`h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold ${
                    (project.budgetDetails.incurredCost / project.budgetDetails.budgetAmount) > 0.9 ? 'bg-red-600' :
                    (project.budgetDetails.incurredCost / project.budgetDetails.budgetAmount) > 0.75 ? 'bg-yellow-600' :
                    'bg-green-600'
                  }`}
                  style={{ width: `${Math.min((project.budgetDetails.incurredCost / project.budgetDetails.budgetAmount) * 100, 100)}%` }}
                >
                  {((project.budgetDetails.incurredCost / project.budgetDetails.budgetAmount) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Proposal Intelligence */}
        {project.hasProposal && project.proposalDetails && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Proposal Intelligence</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Proposal Name</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.proposalDetails.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.proposalDetails.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.proposalDetails.proposalType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Name</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.proposalDetails.contactName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Email</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.proposalDetails.contactEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Proposal Date</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(project.proposalDetails.proposalDate)}</p>
              </div>
              {project.proposalDetails.bidAmount > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Bid Amount</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(project.proposalDetails.bidAmount)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Contract Intelligence */}
        {project.hasContracts && project.contractDetails && project.contractDetails.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">Contract Intelligence</h2>
                <p className="text-sm text-gray-600">{project.contractDetails.length} contract(s) • Total Value: {formatCurrency(totalContractValue)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {project.contractDetails.map((contract, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors">
                  <div 
                    className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 cursor-pointer"
                    onClick={() => toggleContract(contract.id || index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">{contract.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            contract.status === 'Active' ? 'bg-green-100 text-green-800' :
                            contract.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {contract.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="font-medium">{contract.vendor}</span>
                          <span>•</span>
                          <span className="font-semibold text-orange-700">{formatCurrency(contract.approvedAmount)}</span>
                          <span>•</span>
                          <span>{contract.contractType}</span>
                          {contract.lineItems && contract.lineItems.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-medium">{contract.lineItems.length} line items</span>
                            </>
                          )}
                        </div>
                      </div>
                      {expandedContracts.has(contract.id || index) ? 
                        <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      }
                    </div>
                  </div>
                  
                  {expandedContracts.has(contract.id || index) && (
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Contract State</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{contract.contractState}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Change Orders</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(contract.changeOrders)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date Range</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                          </p>
                        </div>
                      </div>

                      {contract.lineItems && contract.lineItems.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Receipt className="w-4 h-4" />
                            Contract Line Items
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Description</th>
                                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Quantity</th>
                                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Rate</th>
                                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Total</th>
                                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Cost Code</th>
                                </tr>
                              </thead>
                              <tbody>
                                {contract.lineItems.map((item, idx) => (
                                  <tr key={idx} className="border-t border-gray-200">
                                    <td className="py-2 px-3 text-gray-900">{item.description}</td>
                                    <td className="py-2 px-3 text-right text-gray-900">{item.quantity} {item.unit}</td>
                                    <td className="py-2 px-3 text-right text-gray-900">{formatCurrency(item.rate)}</td>
                                    <td className="py-2 px-3 text-right font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                                    <td className="py-2 px-3 text-gray-900">{item.costCode}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Procurement Intelligence (Purchase Orders) */}
        {project.hasPurchaseOrders && project.purchaseOrderDetails && project.purchaseOrderDetails.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">Procurement Intelligence</h2>
                <p className="text-sm text-gray-600">{project.purchaseOrderDetails.length} purchase order(s) • Total Value: {formatCurrency(totalPOValue)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {project.purchaseOrderDetails.map((po, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-teal-300 transition-colors">
                  <div 
                    className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 cursor-pointer"
                    onClick={() => togglePO(po.id || index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">{po.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            po.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            po.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {po.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="font-medium">PO# {po.poNumber}</span>
                          <span>•</span>
                          <span className="font-medium">{po.vendor}</span>
                          <span>•</span>
                          <span className="font-semibold text-teal-700">{formatCurrency(po.amount)}</span>
                          {po.lineItems && po.lineItems.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-medium">{po.lineItems.length} line items</span>
                            </>
                          )}
                        </div>
                      </div>
                      {expandedPOs.has(po.id || index) ? 
                        <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      }
                    </div>
                  </div>
                  
                  {expandedPOs.has(po.id || index) && (
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Issue Date</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(po.issueDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Vendor</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{po.vendor}</p>
                        </div>
                      </div>

                      {po.lineItems && po.lineItems.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Receipt className="w-4 h-4" />
                            Purchase Order Line Items
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Description</th>
                                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Quantity</th>
                                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Rate</th>
                                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {po.lineItems.map((item, idx) => (
                                  <tr key={idx} className="border-t border-gray-200">
                                    <td className="py-2 px-3 text-gray-900">{item.description || item.itemDescription}</td>
                                    <td className="py-2 px-3 text-right text-gray-900">{item.quantity} {item.unit}</td>
                                    <td className="py-2 px-3 text-right text-gray-900">{formatCurrency(item.rate)}</td>
                                    <td className="py-2 px-3 text-right font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. Financial Intelligence (Payments) */}
        {project.hasPayments && project.paymentDetails && project.paymentDetails.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">Financial Intelligence</h2>
                <p className="text-sm text-gray-600">{project.paymentDetails.length} payment(s) • Total: {formatCurrency(totalPaymentValue)}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {project.paymentDetails.map((payment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Name</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{payment.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                        payment.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Amount</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(payment.invoiceAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payee</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{payment.payee}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. Agent Findings */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-xl font-bold">Agent Findings & Recommendations</h2>
          </div>
          
          <div className="space-y-3">
            {project.recommendations && project.recommendations.length > 0 ? (
              project.recommendations.map((rec, index) => (
                <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {rec.type === 'error' ? <AlertTriangle className="w-5 h-5 mt-0.5 text-red-300" /> :
                     rec.type === 'warning' ? <AlertTriangle className="w-5 h-5 mt-0.5 text-yellow-300" /> :
                     <CheckCircle className="w-5 h-5 mt-0.5 text-green-300" />}
                    <div className="flex-1">
                      <p className="font-semibold">{rec.title}</p>
                      <p className="text-sm text-white text-opacity-90 mt-1">{rec.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-white text-opacity-75">Category: {rec.category}</span>
                        <span className="text-xs text-white text-opacity-75">Priority: {rec.priority}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Project on Track</p>
                    <p className="text-sm text-white text-opacity-90 mt-1">No critical issues detected. All systems operational.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 10. Activity Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Activity Timeline</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Planned Start</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(project.startDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Planned End</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(project.endDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Timeline</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.timeline}</p>
            </div>
            {project.actualStartDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Actual Start</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(project.actualStartDate)}</p>
              </div>
            )}
            {project.actualEndDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Actual End</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(project.actualEndDate)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectIntelligence;

// Made with Bob
