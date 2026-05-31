/**
 * useProjectDigitalTwin Hook
 * 
 * React hook for accessing and managing project digital twins.
 * Provides real-time access to complete project state.
 */

import { useState, useEffect, useCallback } from 'react';
import { digitalTwinManager } from '../services/ProjectDigitalTwin';

/**
 * Hook to access project digital twin
 * @param {string} projectId - Project ID
 * @param {Object} options - Hook options
 * @returns {Object} Digital twin data and methods
 */
export const useProjectDigitalTwin = (projectId, options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute
    onError = null
  } = options;

  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load digital twin
   */
  const loadTwin = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const digitalTwin = await digitalTwinManager.getTwin(projectId);
      setTwin(digitalTwin.getCompleteView());
      
    } catch (err) {
      console.error('Failed to load digital twin:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [projectId, onError]);

  /**
   * Refresh digital twin
   */
  const refresh = useCallback(async (section = 'all') => {
    if (!projectId) return;

    try {
      setError(null);
      const updated = await digitalTwinManager.refreshTwin(projectId, section);
      setTwin(updated);
    } catch (err) {
      console.error('Failed to refresh digital twin:', err);
      setError(err.message);
      if (onError) onError(err);
    }
  }, [projectId, onError]);

  /**
   * Get summary view
   */
  const getSummary = useCallback(() => {
    if (!twin) return null;
    
    return {
      projectId: twin.projectId,
      projectName: twin.project?.name,
      status: twin.project?.status,
      healthScore: twin.healthMetrics?.overallHealth,
      riskScore: twin.healthMetrics?.riskScore,
      criticalFindings: twin.findings?.filter(f => f.severity === 'critical').length || 0,
      pendingActions: twin.pendingActions?.length || 0,
      lastUpdate: twin.lastUpdate
    };
  }, [twin]);

  /**
   * Get critical alerts
   */
  const getCriticalAlerts = useCallback(() => {
    if (!twin) return [];

    const alerts = [];

    // Critical findings
    const criticalFindings = twin.findings?.filter(f => f.severity === 'critical') || [];
    alerts.push(...criticalFindings.map(f => ({
      type: 'finding',
      severity: 'critical',
      title: f.title,
      description: f.description,
      source: f.agentName
    })));

    // Critical recommendations
    const criticalRecs = twin.recommendations?.filter(r => r.priority === 'critical') || [];
    alerts.push(...criticalRecs.map(r => ({
      type: 'recommendation',
      severity: 'critical',
      title: r.title,
      description: r.description,
      source: r.agentName
    })));

    return alerts;
  }, [twin]);

  // Initial load
  useEffect(() => {
    loadTwin();
  }, [loadTwin]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !projectId) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, projectId, refreshInterval, refresh]);

  return {
    twin,
    loading,
    error,
    refresh,
    getSummary,
    getCriticalAlerts,
    
    // Convenience accessors
    project: twin?.project,
    budget: twin?.budget,
    proposal: twin?.proposal,
    contracts: twin?.contracts,
    payments: twin?.payments,
    findings: twin?.findings || [],
    recommendations: twin?.recommendations || [],
    pendingActions: twin?.pendingActions || [],
    executionHistory: twin?.executionHistory || [],
    activityFeed: twin?.activityFeed || [],
    timeline: twin?.timeline,
    healthMetrics: twin?.healthMetrics
  };
};

/**
 * Hook to access multiple project digital twins
 * @param {Array<string>} projectIds - Array of project IDs
 * @returns {Object} Multiple twins data and methods
 */
export const useProjectDigitalTwins = (projectIds = []) => {
  const [twins, setTwins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load all twins
   */
  const loadTwins = useCallback(async () => {
    if (!projectIds || projectIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const twinPromises = projectIds.map(id => 
        digitalTwinManager.getTwin(id)
      );

      const loadedTwins = await Promise.all(twinPromises);
      setTwins(loadedTwins.map(t => t.getCompleteView()));

    } catch (err) {
      console.error('Failed to load digital twins:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectIds]);

  /**
   * Refresh all twins
   */
  const refreshAll = useCallback(async () => {
    if (!projectIds || projectIds.length === 0) return;

    try {
      setError(null);
      
      const refreshPromises = projectIds.map(id =>
        digitalTwinManager.refreshTwin(id)
      );

      const refreshedTwins = await Promise.all(refreshPromises);
      setTwins(refreshedTwins);

    } catch (err) {
      console.error('Failed to refresh digital twins:', err);
      setError(err.message);
    }
  }, [projectIds]);

  /**
   * Get portfolio summary
   */
  const getPortfolioSummary = useCallback(() => {
    if (!twins || twins.length === 0) return null;

    return {
      totalProjects: twins.length,
      criticalProjects: twins.filter(t => 
        t.healthMetrics?.overallHealth < 60
      ).length,
      atRiskProjects: twins.filter(t => 
        t.healthMetrics?.riskScore > 70
      ).length,
      healthyProjects: twins.filter(t => 
        t.healthMetrics?.overallHealth >= 80
      ).length,
      totalFindings: twins.reduce((sum, t) => 
        sum + (t.findings?.length || 0), 0
      ),
      criticalFindings: twins.reduce((sum, t) => 
        sum + (t.findings?.filter(f => f.severity === 'critical').length || 0), 0
      ),
      totalRecommendations: twins.reduce((sum, t) => 
        sum + (t.recommendations?.length || 0), 0
      ),
      pendingActions: twins.reduce((sum, t) => 
        sum + (t.pendingActions?.length || 0), 0
      ),
      averageHealth: Math.round(
        twins.reduce((sum, t) => 
          sum + (t.healthMetrics?.overallHealth || 0), 0
        ) / twins.length
      )
    };
  }, [twins]);

  // Initial load
  useEffect(() => {
    loadTwins();
  }, [loadTwins]);

  return {
    twins,
    loading,
    error,
    refreshAll,
    getPortfolioSummary
  };
};

export default useProjectDigitalTwin;

// Made with Bob