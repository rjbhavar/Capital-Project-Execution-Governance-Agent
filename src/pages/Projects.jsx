import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { StatusBadge, RiskBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { GradientCard, ProgressRing } from '../components/common/PremiumCard';
import ProjectAnalysisModal from '../components/insights/ProjectAnalysisModal';
import BatchAnalysisModal from '../components/insights/BatchAnalysisModal';
import { useData } from '../context/DataContext';
import { exportProjects } from '../utils/exportUtils';
import {
  Building2,
  Brain,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  CheckCircle,
  FileText,
  ShoppingCart,
  CreditCard,
  AlertTriangle,
  Search,
  Sparkles
} from 'lucide-react';

const Projects = () => {
  const navigate = useNavigate();
  const { projects, loading, error, refresh } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [selectedProjectForAnalysis, setSelectedProjectForAnalysis] = useState(null);
  const [showBatchAnalysis, setShowBatchAnalysis] = useState(false);

  // Memoize filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.building.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const handleRunAI = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProjectForAnalysis(project);
    }
  };

  const toggleProjectSelection = (projectId) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const handleExportReport = () => {
    const projectsToExport = selectedProjects.size > 0
      ? projects.filter(p => selectedProjects.has(p.id))
      : projects;
    
    const result = exportProjects(projectsToExport, true);
    
    if (result.success) {
      alert(`✅ ${result.message}`);
    } else {
      alert(`❌ Export failed: ${result.message}`);
    }
  };

  const handleBatchAnalysis = () => {
    if (selectedProjects.size === 0) {
      alert('Please select at least one project for batch analysis');
      return;
    }
    
    setShowBatchAnalysis(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Capital Projects</h1>
          <p className="text-gray-600 mt-1">Operational workspace for project management</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={refresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            icon={Download}
            onClick={handleExportReport}
          >
            Export {selectedProjects.size > 0 && `(${selectedProjects.size})`}
          </Button>
          <Button
            variant="primary"
            icon={Brain}
            onClick={handleBatchAnalysis}
            disabled={selectedProjects.size === 0}
          >
            Batch Analysis {selectedProjects.size > 0 && `(${selectedProjects.size})`}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <GradientCard gradient="blue" className="p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-ibm-blue mr-3" />
            <span className="text-lg text-gray-600">Loading projects...</span>
          </div>
        </GradientCard>
      )}

      {/* Info Banner - Using Mock Data */}
      {import.meta.env.VITE_USE_MOCK_DATA === 'true' && !loading && (
        <GradientCard gradient="blue" className="p-4">
          <div className="flex items-start gap-4">
            <Brain className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Demo Mode Active</h3>
              <p className="text-blue-700 text-sm">
                Currently showing demo data. To connect to live MREF API, set <code className="bg-blue-100 px-2 py-1 rounded">VITE_USE_MOCK_DATA=false</code> in your .env file.
              </p>
            </div>
          </div>
        </GradientCard>
      )}

      {/* Error State */}
      {error && !loading && import.meta.env.VITE_USE_MOCK_DATA !== 'true' && (
        <GradientCard gradient="orange" className="p-4">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">API Connection Issue</h3>
              <p className="text-yellow-700 mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={refresh}>
                Retry Connection
              </Button>
            </div>
          </div>
        </GradientCard>
      )}

      {/* Filters and Search */}
      <GradientCard gradient="gray" className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by name or building..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ibm-blue focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ibm-blue focus:border-transparent transition-all font-medium"
            >
              <option value="All">All Status</option>
              <option value="Planning">Planning</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completing">Completing</option>
            </select>
            <Button variant="outline" icon={Filter}>
              More Filters
            </Button>
          </div>
        </div>
      </GradientCard>

      {/* Projects Table */}
      {!loading && !error && (
        <GradientCard gradient="gray" className="overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-white/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Capital Projects</h2>
              <span className="text-sm font-medium text-gray-600">{filteredProjects.length} projects found</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 w-12">
                    <input
                      type="checkbox"
                      checked={selectedProjects.size === filteredProjects.length && filteredProjects.length > 0}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 text-ibm-blue border-gray-300 rounded focus:ring-ibm-blue cursor-pointer"
                    />
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Project Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Building</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Budget</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Timeline</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Health</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Risk</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects.has(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        className="w-5 h-5 text-ibm-blue border-gray-300 rounded focus:ring-ibm-blue cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.projectManager}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {project.hasBudget && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Budget
                            </span>
                          )}
                          {project.hasProposal && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              <FileText className="w-3 h-3" />
                              Proposal
                            </span>
                          )}
                          {project.hasContracts && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              <ShoppingCart className="w-3 h-3" />
                              Contracts
                            </span>
                          )}
                          {project.hasPayments && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              <CreditCard className="w-3 h-3" />
                              Payments
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{project.building}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{formatCurrency(project.budget)}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(project.spent)} spent</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="py-4 px-4 text-gray-700 text-sm font-medium">{project.timeline}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <ProgressRing
                          percentage={project.healthScore}
                          size={50}
                          strokeWidth={5}
                          color={project.healthScore >= 80 ? 'green' : project.healthScore >= 60 ? 'orange' : 'red'}
                        />
                        <span className="text-sm font-semibold text-gray-700">{project.healthScore}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <RiskBadge score={project.riskScore} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Sparkles}
                          onClick={() => navigate(`/projects/${project.id}/intelligence`)}
                          className="shadow-md hover:shadow-lg transition-shadow"
                        >
                          Intelligence
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Brain}
                          onClick={() => handleRunAI(project.id)}
                          className="shadow-sm hover:shadow-md transition-shadow"
                        >
                          AI
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GradientCard>
      )}
      
      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <GradientCard gradient="gray" className="p-12">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600 mb-4">No capital projects available in MREF system.</p>
            <Button variant="primary" onClick={refresh}>
              Refresh Data
            </Button>
          </div>
        </GradientCard>
      )}

      {/* AI Analysis Modal */}
      {selectedProjectForAnalysis && (
        <ProjectAnalysisModal
          project={selectedProjectForAnalysis}
          onClose={() => setSelectedProjectForAnalysis(null)}
        />
      )}

      {/* Batch Analysis Modal */}
      {showBatchAnalysis && (
        <BatchAnalysisModal
          projects={projects.filter(p => selectedProjects.has(p.id))}
          onClose={() => setShowBatchAnalysis(false)}
        />
      )}
    </div>
  );
};

export default Projects;

// Made with Bob
