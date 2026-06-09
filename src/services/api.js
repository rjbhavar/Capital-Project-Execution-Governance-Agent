import axios from 'axios';
import { createSession, getSessionId, clearSession } from './auth';

/**
 * Get base URL dynamically from session storage
 * This ensures we connect to the user-provided MREF instance
 */
const getBaseUrl = () => {
  const storedUrl = sessionStorage.getItem('mref_url');
  if (storedUrl) {
    return import.meta.env.DEV ? '/api' : storedUrl;
  }
  // Fallback to env var only if no session URL
  return import.meta.env.DEV ? '/api' : (import.meta.env.VITE_MREF_BASE_URL || '');
};

/**
 * Create authenticated axios instance with dynamic baseURL
 */
const apiClient = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Update baseURL before each request to ensure it's always current
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseUrl();
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Request interceptor - attach JSESSIONID to all requests
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Ensure session exists before making request
    const sessionId = getSessionId();
    
    if (!sessionId) {
      console.log('🔐 No session found, creating new session...');
      await createSession();
    }

    // Attach JSESSIONID cookie
    const currentSessionId = getSessionId();
    if (currentSessionId) {
      config.headers['Cookie'] = `JSESSIONID=${currentSessionId}`;
    }

    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle session expiration
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - session expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔄 Session expired, re-authenticating...');
      clearSession();
      
      const authResult = await createSession();
      
      if (authResult.success) {
        // Retry original request with new session
        const sessionId = getSessionId();
        originalRequest.headers['Cookie'] = `JSESSIONID=${sessionId}`;
        return apiClient(originalRequest);
      }
    }

    console.error(`❌ API Error: ${error.config?.url}`, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

// Made with Bob
