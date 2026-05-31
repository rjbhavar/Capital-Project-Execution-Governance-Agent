import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Loader2, CheckCircle, XCircle, AlertCircle, Shield, Zap, TrendingUp, BarChart3, FileCheck, X, Info, User } from 'lucide-react';
import { useConnection } from '../context/ConnectionContext';

const ConnectionScreen = () => {
  const navigate = useNavigate();
  const { connect, testConnection } = useConnection();
  const [formData, setFormData] = useState({
    url: '',
    username: '',
    password: ''
  });
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

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
      const result = await connect({
        url: formData.url,
        username: formData.username,
        password: formData.password,
        environment: 'Production'
      });

      if (result.success) {
        navigate('/overview');
      } else {
        setError(result.error || 'Connection failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Authentication failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  const agentCapabilities = [
    { 
      icon: Brain, 
      label: 'Project Planning Agent', 
      color: 'text-blue-400',
      bgGradient: 'from-blue-500 to-blue-600',
      description: 'Autonomous agent that monitors project planning activities, identifies schedule risks, and recommends optimization strategies.',
      capabilities: [
        'Real-time schedule analysis',
        'Resource allocation optimization',
        'Milestone tracking and alerts',
        'Critical path identification'
      ]
    },
    { 
      icon: TrendingUp, 
      label: 'Budget Intelligence Agent', 
      color: 'text-green-400',
      bgGradient: 'from-green-500 to-emerald-600',
      description: 'AI-powered financial monitoring agent that tracks budget utilization, forecasts overruns, and provides cost optimization recommendations.',
      capabilities: [
        'Budget variance detection',
        'Cost forecast modeling',
        'Spend pattern analysis',
        'Financial risk assessment'
      ]
    },
    { 
      icon: BarChart3, 
      label: 'Procurement Coordination Agent', 
      color: 'text-purple-400',
      bgGradient: 'from-purple-500 to-violet-600',
      description: 'Intelligent procurement agent that monitors contract execution, vendor performance, and identifies procurement bottlenecks.',
      capabilities: [
        'Contract compliance monitoring',
        'Vendor performance tracking',
        'Procurement workflow optimization',
        'Purchase order analysis'
      ]
    },
    { 
      icon: Zap, 
      label: 'Schedule Monitoring Agent', 
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-500 to-orange-600',
      description: 'Proactive scheduling agent that detects delays, analyzes timeline impacts, and recommends corrective actions.',
      capabilities: [
        'Delay detection and alerts',
        'Timeline impact analysis',
        'Activity dependency tracking',
        'Schedule recovery planning'
      ]
    },
    { 
      icon: Shield, 
      label: 'Risk & Compliance Agent', 
      color: 'text-red-400',
      bgGradient: 'from-red-500 to-rose-600',
      description: 'Governance agent that continuously assesses project risks, monitors compliance requirements, and flags potential issues.',
      capabilities: [
        'Risk score calculation',
        'Compliance monitoring',
        'Issue prediction and prevention',
        'Governance reporting'
      ]
    },
    { 
      icon: FileCheck, 
      label: 'Executive Reporting Agent', 
      color: 'text-indigo-400',
      bgGradient: 'from-indigo-500 to-purple-600',
      description: 'Executive intelligence agent that generates insights, creates executive summaries, and provides decision support.',
      capabilities: [
        'Automated executive briefings',
        'Portfolio health analysis',
        'KPI tracking and reporting',
        'Strategic recommendations'
      ]
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
          {/* IBM Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8 w-fit">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Powered by IBM Maximo Real Estate & Facilities</span>
          </div>

          {/* Main Title */}
          <div className="mb-8">
            <h1 className="text-6xl xl:text-7xl font-black mb-4 leading-none">
              <span className="block text-white">Capital Project</span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                Execution & Governance
              </span>
            </h1>
            <div className="flex items-center gap-3 mt-6">
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              <span className="text-2xl font-bold text-blue-300">AI Agent Platform</span>
            </div>
          </div>

          {/* Subtitle */}
          <div className="mb-10 max-w-xl">
            <p className="text-xl text-blue-100 leading-relaxed font-medium">
              The Future of Capital Project Management
            </p>
            <p className="text-lg text-gray-300 mt-2 leading-relaxed">
              Autonomous AI agents working 24/7 to optimize your portfolio
            </p>
          </div>

          {/* Agent Capabilities */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-6">
              Intelligent Agent Capabilities
            </p>
            <div className="grid grid-cols-1 gap-3">
              {agentCapabilities.map((capability, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAgent(capability)}
                  className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group text-left"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${capability.bgGradient} shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                    <capability.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium flex-1">{capability.label}</span>
                  <Info className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-10 pt-8 border-t border-white/10">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <div className="text-sm text-gray-400 mt-1">Monitoring</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">AI</div>
                <div className="text-sm text-gray-400 mt-1">Powered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">Real-time</div>
                <div className="text-sm text-gray-400 mt-1">Insights</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl mb-4">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Capital Project Agent</h2>
            <p className="text-sm text-gray-600 mt-2">Powered by IBM MREF</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-10">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl mb-6">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-3">
                Agent Command Center
              </h2>
              <p className="text-lg text-gray-600">
                AI-Powered Capital Project Intelligence
              </p>
            </div>

            <form onSubmit={handleConnect} className="space-y-6">
              {/* MREF URL */}
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <label htmlFor="url" className="text-base font-bold text-gray-800">
                    Server URL
                  </label>
                </div>
                <input
                  type="text"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://your-mref-server.com"
                  className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium bg-white shadow-sm"
                  required
                />
              </div>

              {/* Username */}
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <label htmlFor="username" className="text-base font-bold text-gray-800">
                    Username
                  </label>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="your.username"
                  className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium bg-white shadow-sm"
                  required
                />
              </div>

              {/* Password */}
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <label htmlFor="password" className="text-base font-bold text-gray-800">
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium bg-white shadow-sm"
                  required
                />
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-start gap-3">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                        {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                      </p>
                      <p className={`text-sm mt-1 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                        {testResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900">Connection Failed</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4 pt-6">
                <button
                  type="submit"
                  disabled={connecting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-5 px-8 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-xl transform hover:scale-[1.02]"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-7 h-7 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-7 h-7" />
                      <span>Connect</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing || connecting}
                  className="w-full bg-white text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              © 2026 IBM Corporation
            </p>
          </div>
        </div>
      </div>

      {/* Agent Info Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedAgent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative transform transition-all animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedAgent(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${selectedAgent.bgGradient} shadow-lg`}>
                <selectedAgent.icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedAgent.label}</h3>
                <p className="text-gray-600 leading-relaxed">{selectedAgent.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">Key Capabilities:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedAgent.capabilities.map((capability, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{capability}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Agent Status: Active & Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ConnectionScreen;

// Made with Bob
