import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, Server, Activity, Clock, CheckCircle } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  
  // Get user info from session
  const userInitials = sessionStorage.getItem('user_initials') || 'U';
  const username = sessionStorage.getItem('user_fullname') || sessionStorage.getItem('mref_username') || 'User';
  const environment = sessionStorage.getItem('mref_environment') || 'Production';
  const mrefUrl = sessionStorage.getItem('mref_url') || '';
  const isDemoMode = sessionStorage.getItem('demo_mode') === 'true';
  
  // Truncate URL for display
  const displayUrl = mrefUrl ? new URL(mrefUrl).hostname : 'Not Connected';
  
  // Get user role (default to Capital Project Director for now)
  const userRole = 'Capital Project Director';
  
  // Session info
  const sessionStart = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const handleLogout = () => {
    // Clear session
    sessionStorage.clear();
    // Navigate to connection screen
    navigate('/connect');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 right-0 left-64 z-10 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Global Command Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Global Command Search: Projects, Contracts, Budgets, Risks..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Demo Mode Indicator */}
          {isDemoMode && (
            <div className="px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-300">
              🎭 Demo Mode
            </div>
          )}
          
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 pl-4 border-l-2 border-gray-200 hover:bg-gray-50 rounded-lg transition-colors p-2"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{username}</p>
                <p className="text-xs text-blue-600 font-medium">{userRole}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-blue-100">
                {userInitials}
              </div>
            </button>

            {/* Enhanced Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                {/* User Header */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 px-5 py-4 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/30">
                      {userInitials}
                    </div>
                    <div>
                      <p className="font-bold text-base">{username}</p>
                      <p className="text-xs text-blue-100">{userRole}</p>
                    </div>
                  </div>
                </div>

                {/* Connection Info */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Environment:</span>
                      <span className="text-gray-900 font-semibold">{environment}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Server:</span>
                      <span className="text-gray-900 font-semibold truncate ml-2 max-w-[180px]" title={displayUrl}>
                        {displayUrl}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Session Status */}
                <div className="px-5 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-gray-700">Session Status</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Connected Since:</span>
                      <span className="text-gray-900 font-medium">{sessionStart}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last Refresh:</span>
                      <span className="text-gray-900 font-medium">Just now</span>
                    </div>
                  </div>
                </div>
                
                {/* Disconnect Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </header>
  );
};

export default Navbar;

// Made with Bob
