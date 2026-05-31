import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useConnection } from '../context/ConnectionContext';

const ConnectionScreen = () => {
  const navigate = useNavigate();
  const { connect, testConnection } = useConnection();
  const [formData, setFormData] = useState({
    url: '',
    username: '',
    password: '',
    environment: 'Production'
  });
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setTestResult(null);
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleTestConnection = async () => {
    if (!validateUrl(formData.url)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setTesting(true);
    setError(null);
    setTestResult(null);

    try {
      const result = await testConnection(formData.url);
      
      if (result.reachable) {
        setTestResult({
          success: true,
          message: 'Connection successful! Server is reachable.'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Connection failed. Please check network and server URL.'
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Connection failed. Please check network and server URL.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!validateUrl(formData.url)) {
      setError('Please enter a valid URL');
      return;
    }
    if (!formData.username.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!formData.password.trim()) {
      setError('Please enter your password');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      // Connect via ConnectionContext
      const result = await connect({
        url: formData.url,
        username: formData.username,
        password: formData.password,
        environment: formData.environment
      });

      if (result.success) {
        // Navigate to Capability Detection screen
        navigate('/capabilities');
      } else {
        setError(result.error || 'Connection failed');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-6">
            <Brain className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Capital Project Execution &<br />Governance Agent
          </h1>
          <p className="text-blue-100 text-lg">
            Powered by IBM Maximo Real Estate & Facilities
          </p>
        </div>

        {/* Connection Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleConnect} className="space-y-6">
            {/* MREF URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2">
                MREF Server URL *
              </label>
              <input
                type="text"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://your-mref-server.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the full URL of your MREF/TRIRIGA server
              </p>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your.username"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Environment */}
            <div>
              <label htmlFor="environment" className="block text-sm font-semibold text-gray-700 mb-2">
                Environment (Optional)
              </label>
              <select
                id="environment"
                name="environment"
                value={formData.environment}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="Development">Development</option>
                <option value="Test">Test</option>
                <option value="Staging">Staging</option>
                <option value="Production">Production</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select environment for better organization
              </p>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                      {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
                    </p>
                    <p className={`text-sm mt-1 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {testResult.message}
                    </p>
                    {!testResult.success && (
                      <div className="mt-2 text-sm text-red-700">
                        <p className="font-medium">Possible causes:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Incorrect server URL</li>
                          <li>Network connectivity issues</li>
                          <li>Server not accessible</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={connecting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Connect to MREF
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || connecting}
                className="w-full bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-blue-100 text-sm">
            Version 1.0.0 • © 2026 IBM Corporation
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionScreen;

// Made with Bob
