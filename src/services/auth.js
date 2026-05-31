import axios from 'axios';

// Store session globally
let sessionId = null;

/**
 * Get base URL from session storage or env
 */
const getBaseUrl = () => {
  const storedUrl = sessionStorage.getItem('mref_url');
  if (storedUrl) {
    return import.meta.env.DEV ? '/api' : storedUrl;
  }
  return import.meta.env.DEV ? '/api' : import.meta.env.VITE_MREF_BASE_URL;
};

/**
 * Authenticate with MREF and create JSESSION
 * @param {string} username - MREF username
 * @param {string} password - MREF password
 */
export const login = async (username, password) => {
  try {
    console.log('🔐 Attempting authentication...');
    
    const BASE_URL = getBaseUrl();
    
    const response = await axios.post(
      `${BASE_URL}/p/websignon/signon`,
      {
        userName: username,
        password: password
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('✅ Authentication response received:', response.status);
    console.log('📋 Response headers:', response.headers);
    console.log('📋 Response data:', response.data);

    // Try to extract JSESSIONID from various sources
    
    // Method 1: From Set-Cookie header
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      console.log('🍪 Set-Cookie header found:', setCookieHeader);
      const jsessionCookie = Array.isArray(setCookieHeader) 
        ? setCookieHeader.find(cookie => cookie.includes('JSESSIONID'))
        : setCookieHeader.includes('JSESSIONID') ? setCookieHeader : null;
        
      if (jsessionCookie) {
        const match = jsessionCookie.match(/JSESSIONID=([^;]+)/);
        if (match) {
          sessionId = match[1];
          console.log('✅ JSESSIONID captured from Set-Cookie:', sessionId);
        }
      }
    }

    // Method 2: Check if browser stored it automatically
    if (!sessionId) {
      const cookies = document.cookie;
      console.log('🍪 Document cookies:', cookies);
      const match = cookies.match(/JSESSIONID=([^;]+)/);
      if (match) {
        sessionId = match[1];
        console.log('✅ JSESSIONID found in document.cookie:', sessionId);
      }
    }

    // Method 3: From response data
    if (!sessionId && response.data?.sessionId) {
      sessionId = response.data.sessionId;
      console.log('✅ JSESSIONID from response data:', sessionId);
    }

    if (!sessionId) {
      console.warn('⚠️ JSESSIONID not found - authentication may have failed');
      console.log('💡 Tip: Check if credentials are correct in .env file');
    }

    return {
      success: !!sessionId || response.status === 200,
      sessionId,
      message: sessionId ? 'Authentication successful' : 'Authentication completed but no session ID'
    };
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    console.error('📋 Error response:', error.response?.data);
    console.error('📋 Error status:', error.response?.status);
    
    return {
      success: false,
      error: error.message,
      message: 'Authentication failed - check credentials'
    };
  }
};

/**
 * Get current session ID
 */
export const getSessionId = () => sessionId;

/**
 * Check if session exists
 */
export const hasSession = () => !!sessionId;

/**
 * Clear session
 */
export const clearSession = () => {
  sessionId = null;
};

/**
 * Create authenticated session
 * @param {string} username - MREF username (optional, uses env if not provided)
 * @param {string} password - MREF password (optional, uses env if not provided)
 */
export const createSession = async (username, password) => {
  if (hasSession()) {
    console.log('✅ Session already exists:', sessionId);
    return { success: true, sessionId };
  }

  console.log('🔐 Creating new session...');
  
  // Use provided credentials or fall back to env variables
  const user = username || import.meta.env.VITE_MREF_USERNAME;
  const pass = password || import.meta.env.VITE_MREF_PASSWORD;
  
  if (!user || !pass) {
    throw new Error('Username and password are required');
  }
  
  return await login(user, pass);
};

// Made with Bob
