import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { mcpLayer } from '../services/MCPLayer';
import { instanceMetadataService } from '../services/InstanceMetadataService';
import { useConnection } from './ConnectionContext';
import { calculateProjectHealth } from '../utils/projectHealthEngine';
import { generateProjectRecommendations } from '../utils/agentRecommendationEngine';
import { generateExecutiveSummary, generateShortSummary } from '../utils/executiveSummaryGenerator';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { connected, setInstanceMetadata } = useConnection();
  const [rawProjects, setRawProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [discoveryComplete, setDiscoveryComplete] = useState(false);

  // Calculate health scores, recommendations, and summaries for all projects
  const projects = useMemo(() => {
    return rawProjects.map(project => {
      const health = calculateProjectHealth(project);
      const recommendations = generateProjectRecommendations(project);
      const executiveSummary = generateExecutiveSummary(project);
      const shortSummary = generateShortSummary(project);
      return {
        ...project,
        healthScore: health.score,
        healthRating: health.rating,
        healthColor: health.color,
        healthFactors: health.factors,
        recommendations,
        executiveSummary,
        shortSummary
      };
    });
  }, [rawProjects]);

  // Perform instance discovery after connection
  const performDiscovery = useCallback(async () => {
    if (!connected || discoveryComplete) {
      return;
    }

    try {
      console.log('🔍 Performing instance discovery...');
      const metadata = await instanceMetadataService.discover();
      setInstanceMetadata(metadata);
      setDiscoveryComplete(true);
      console.log('✅ Instance discovery complete');
    } catch (error) {
      console.error('❌ Instance discovery failed:', error);
      // Continue anyway - discovery is optional
      setDiscoveryComplete(true);
    }
  }, [connected, discoveryComplete, setInstanceMetadata]);

  // Load data once on mount or when connection changes
  const loadData = useCallback(async (force = false) => {
    // Skip if not connected
    if (!connected) {
      console.log('⚠️ Not connected to MREF');
      setLoading(false);
      return;
    }

    // Skip if already loaded and not forcing refresh
    if (!force && rawProjects.length > 0) {
      console.log('✅ Using cached data');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Perform discovery if not done yet
      if (!discoveryComplete) {
        await performDiscovery();
      }
      
      // Fetch all data via MCP Layer
      console.log('📡 Fetching all project data via MCP...');
      const projectData = await mcpLayer.getCapitalProjects({
        includeRelated: true,
        forceRefresh: force
      });
      
      setRawProjects(projectData);
      setLastFetch(new Date());
      console.log(`✅ Loaded ${projectData.length} projects into cache`);
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(err.message || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [connected, rawProjects.length, discoveryComplete, performDiscovery]);

  // Load data when connected
  useEffect(() => {
    if (connected) {
      loadData();
    }
  }, [connected]); // Run when connection status changes

  // Refresh function for manual refresh
  const refresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    return loadData(true);
  }, [loadData]);

  const value = {
    projects,
    loading,
    error,
    connected,
    lastFetch,
    refresh,
    discoveryComplete
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Made with Bob