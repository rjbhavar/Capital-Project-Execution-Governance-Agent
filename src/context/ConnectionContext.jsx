/**
 * Connection Context
 * 
 * Manages MREF connection state across the application.
 * Stores connection details, session info, and instance metadata.
 * 
 * This is the single source of truth for connection state.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { mrefConnector } from '../services/MREFConnector';

const ConnectionContext = createContext();

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within ConnectionProvider');
  }
  return context;
};

export const ConnectionProvider = ({ children }) => {
  const [connectionState, setConnectionState] = useState({
    connected: false,
    url: null,
    username: null,
    environment: null,
    connectedAt: null,
    instanceMetadata: null,
    error: null
  });

  /**
   * Connect to MREF instance
   */
  const connect = useCallback(async (config) => {
    const { url, username, password, environment } = config;

    try {
      setConnectionState(prev => ({
        ...prev,
        error: null
      }));

      // Connect via MREFConnector
      await mrefConnector.connect({ url, username, password });

      // Store connection details
      const newState = {
        connected: true,
        url,
        username,
        environment: environment || 'Production',
        connectedAt: new Date(),
        instanceMetadata: null,
        error: null
      };

      setConnectionState(newState);

      // Store in sessionStorage for persistence
      sessionStorage.setItem('mref_connection', JSON.stringify({
        url,
        username,
        environment: newState.environment,
        connectedAt: newState.connectedAt
      }));

      // Store user info
      const names = username.split(/[\s.]+/);
      const initials = names.length >= 2
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : username.substring(0, 2).toUpperCase();
      
      sessionStorage.setItem('user_initials', initials);
      sessionStorage.setItem('user_fullname', username);

      return { success: true };
    } catch (error) {
      const errorState = {
        connected: false,
        url: null,
        username: null,
        environment: null,
        connectedAt: null,
        instanceMetadata: null,
        error: error.message
      };

      setConnectionState(errorState);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Disconnect from MREF
   */
  const disconnect = useCallback(() => {
    mrefConnector.disconnect();
    
    setConnectionState({
      connected: false,
      url: null,
      username: null,
      environment: null,
      connectedAt: null,
      instanceMetadata: null,
      error: null
    });

    // Clear sessionStorage
    sessionStorage.removeItem('mref_connection');
    sessionStorage.removeItem('user_initials');
    sessionStorage.removeItem('user_fullname');
  }, []);

  /**
   * Update instance metadata after discovery
   */
  const setInstanceMetadata = useCallback((metadata) => {
    setConnectionState(prev => ({
      ...prev,
      instanceMetadata: metadata
    }));
  }, []);

  /**
   * Restore connection from sessionStorage
   */
  const restoreConnection = useCallback(async () => {
    const stored = sessionStorage.getItem('mref_connection');
    if (!stored) {
      return { success: false, error: 'No stored connection' };
    }

    try {
      const { url, username, environment, connectedAt } = JSON.parse(stored);
      
      // Note: We cannot restore the actual connection without password
      // This just restores the connection state for UI purposes
      // The actual connection will be re-established on first API call
      
      setConnectionState({
        connected: true,
        url,
        username,
        environment,
        connectedAt: new Date(connectedAt),
        instanceMetadata: null,
        error: null
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Test connection to a URL
   */
  const testConnection = useCallback(async (url) => {
    return await mrefConnector.testConnection(url);
  }, []);

  /**
   * Get connection status
   */
  const getStatus = useCallback(() => {
    return mrefConnector.getConnectionStatus();
  }, []);

  const value = {
    // State
    ...connectionState,
    
    // Actions
    connect,
    disconnect,
    setInstanceMetadata,
    restoreConnection,
    testConnection,
    getStatus
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export default ConnectionContext;

// Made with Bob