/**
 * Capability Detection Screen
 * 
 * Displays discovered MREF instance capabilities after connection.
 * Shows available resources, queries, actions, and missing APIs.
 * 
 * This helps users understand what automation is possible
 * in their specific MREF environment.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Database,
  Search,
  Zap,
  Info,
  ArrowRight
} from 'lucide-react';
import { instanceMetadataService } from '../services/InstanceMetadataService';
import { useConnection } from '../context/ConnectionContext';

const CapabilityDetection = () => {
  const navigate = useNavigate();
  const { connected, url, instanceMetadata, setInstanceMetadata } = useConnection();
  const [discovering, setDiscovering] = useState(true);
  const [discovery, setDiscovery] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!connected) {
      navigate('/connect');
      return;
    }

    performDiscovery();
  }, [connected, navigate]);

  const performDiscovery = async () => {
    setDiscovering(true);
    setError(null);

    try {
      console.log('🔍 Starting capability discovery...');
      const metadata = await instanceMetadataService.discover();
      setDiscovery(metadata);
      setInstanceMetadata(metadata);
      console.log('✅ Discovery complete', metadata);
    } catch (err) {
      console.error('❌ Discovery failed', err);
      setError(err.message);
    } finally {
      setDiscovering(false);
    }
  };

  const handleContinue = () => {
    navigate('/');
  };

  const handleRetry = () => {
    performDiscovery();
  };

  if (discovering) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Discovering Capabilities
          </h2>
          <p className="text-gray-600">
            Analyzing your MREF instance to determine available resources and actions...
          </p>
          <div className="mt-6 space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              Testing OSLC resources
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              Identifying available queries
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              Mapping workflow actions
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Discovery Failed
            </h2>
            <p className="text-gray-600">
              {error}
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all"
            >
              Retry Discovery
            </button>
            <button
              onClick={handleContinue}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!discovery) {
    return null;
  }

  const availableResources = Object.entries(discovery.resources || {})
    .filter(([_, resource]) => resource.available);
  
  const unavailableResources = Object.entries(discovery.resources || {})
    .filter(([_, resource]) => !resource.available);

  const totalQueries = Object.keys(discovery.queries || {}).length;
  const totalActions = Object.keys(discovery.actions || {}).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Instance Capabilities Detected
          </h1>
          <p className="text-blue-100 text-lg">
            Connected to: {url}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-8 h-8 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{availableResources.length}</p>
            <p className="text-sm text-gray-600">Available OSLC resources</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-8 h-8 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Queries</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalQueries}</p>
            <p className="text-sm text-gray-600">Configured queries</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-8 h-8 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalActions}</p>
            <p className="text-sm text-gray-600">Workflow actions</p>
          </div>
        </div>

        {/* Available Resources */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Available Resources ({availableResources.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableResources.map(([name, resource]) => (
              <div key={name} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 capitalize">{name}</p>
                  <p className="text-sm text-gray-600 truncate">{resource.description}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">{resource.path}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Resources */}
        {unavailableResources.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-600" />
              Missing Resources ({unavailableResources.length})
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  These resources are not available in your MREF instance. 
                  Some agent features may be limited.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unavailableResources.map(([name, resource]) => (
                <div key={name} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 capitalize">{name}</p>
                    <p className="text-sm text-gray-600 truncate">{resource.description}</p>
                    <p className="text-xs text-red-600 mt-1">{resource.error || 'Not accessible'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Capabilities Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Capabilities Summary
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Service Provider Catalog</span>
              {discovery.capabilities?.hasServiceProviderCatalog ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Capital Projects</span>
              {discovery.resources?.capitalProjects?.available ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Budget Management</span>
              {discovery.resources?.budgets?.available ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Contract Management</span>
              {discovery.resources?.contracts?.available ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Workflow Actions</span>
              {totalActions > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-blue-50 transition-all shadow-lg inline-flex items-center gap-2"
          >
            Continue to Platform
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-blue-100 text-sm mt-4">
            Discovery completed at {new Date(discovery.discoveredAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CapabilityDetection;

// Made with Bob