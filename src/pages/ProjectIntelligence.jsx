import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  X, Building2, DollarSign, FileText, ShoppingCart, CreditCard,
  AlertTriangle, TrendingUp, Calendar, MapPin, User, CheckCircle,
  Clock, Brain, Sparkles, Download
} from 'lucide-react';

const ProjectIntelligence = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects } = useData();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const foundProject = projects.find(p => p.id === parseInt(projectId));
    setProject(foundProject);
  }, [projectId, projects]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
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

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export functionality will be implemented in next phase');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Project Intelligence</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>ID: {project.id}</span>
                <span>•</span>
                <span className="font-medium text-gray-900">{project.name}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            <p className="text-lg leading-relaxed">
              {project.executiveSummary || 'Executive summary not available'}
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
              <p className="text-base font-semibold text-gray-900 mt-1">{project.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Project Manager</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.projectManager}</p>
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
              <p className="text-sm font-medium text-gray-500">Start Date</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(project.startDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">End Date</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(project.endDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Timeline</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.timeline}</p>
            </div>
          </div>
        </div>

        {/* 3. Budget Intelligence */}
        {project.hasBudget && project.budgetDetails && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Budget Intelligence</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Budget Amount</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(project.budgetDetails.budgetAmount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Incurred Cost</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(project.budgetDetails.incurredCost)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Forecast Cost</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(project.budgetDetails.forecastCost)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Budget Status</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.budgetDetails.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Budget Type</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.budgetDetails.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Currency</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.budgetDetails.currency}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500 mb-2">Budget Utilization</p>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full ${
                    (project.budgetDetails.incurredCost / project.budgetDetails.budgetAmount) > 0.9 ? 'bg-red-600' :
                    (project.budgetDetails.incurredCost / project.budgetDetails.budgetAmount) > 0.75 ? 'bg-yellow-600' :
                    'bg-green-600'
                  }`}
                  style={{ width: `${Math.min((project.budgetDetails.incurredCost / project.budgetDetails.budgetAmount) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {((project.budgetDetails.incurredCost / project.budgetDetails.budgetAmount) * 100).toFixed(1)}% utilized
              </p>
            </div>
          </div>
        )}

        {/* 4. Proposal Intelligence */}
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
                <p className="text-sm font-medium text-gray-500">Proposal Status</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.proposalDetails.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Proposal Type</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{project.proposalDetails.type}</p>
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
            </div>
          </div>
        )}

        {/* 5. Contract Intelligence */}
        {project.hasContracts && project.contractDetails && project.contractDetails.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Contract Intelligence</h2>
            </div>
            
            <div className="space-y-4">
              {project.contractDetails.map((contract, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contract Name</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{contract.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{contract.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{contract.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Approved Amount</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(contract.approvedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Change Orders</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(contract.changeOrders)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">State</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{contract.state}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Payment Intelligence */}
        {project.hasPayments && project.paymentDetails && project.paymentDetails.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payment Intelligence</h2>
            </div>
            
            <div className="space-y-4">
              {project.paymentDetails.map((payment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Name</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{payment.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{payment.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Invoice Amount</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{formatCurrency(payment.invoiceAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payee</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{payment.payee}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Date</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(payment.paymentDate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Agent Recommendations */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-xl font-bold">Agent Recommendations</h2>
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
                      <p className="text-xs text-white text-opacity-75 mt-2">Action: {rec.action}</p>
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
                    <p className="text-sm text-white text-opacity-90 mt-1">No critical issues detected.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 8. Risks & Governance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Risks & Governance</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">Risk Assessment</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Risk Score</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    project.riskScore >= 60 ? 'bg-red-100 text-red-800' :
                    project.riskScore >= 30 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {project.riskScore}/100
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Health Score</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    project.healthScore >= 80 ? 'bg-green-100 text-green-800' :
                    project.healthScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {project.healthScore}/100
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">Governance Status</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Timeline</p>
                    <p className="text-xs text-blue-700 mt-1">{project.timeline}</p>
                  </div>
                </div>
                {project.hasProposal && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Proposal Status</p>
                      <p className="text-xs text-green-700 mt-1">{project.proposalDetails?.status || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 9. Timeline Intelligence */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Timeline Intelligence</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Start Date</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(project.startDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">End Date</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{formatDate(project.endDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Timeline Status</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{project.timeline}</p>
            </div>
    
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectIntelligence;

// Made with Bob
