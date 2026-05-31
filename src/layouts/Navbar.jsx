import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, Server } from 'lucide-react';

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

  const handleLogout = () => {
    // Clear session
    sessionStorage.clear();
    // Navigate to connection screen
    navigate('/connect');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects, tasks, or insights..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ibm-blue focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Demo Mode Indicator */}
          {isDemoMode && (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
              🎭 Demo Mode
            </div>
          )}
          
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg transition-colors p-2"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{username}</p>
                <p className="text-xs text-gray-500">{environment}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {userInitials}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{username}</p>
                  <p className="text-xs text-gray-500 mt-1">Environment: {environment}</p>
                </div>
                
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-start gap-2">
                    <Server className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700">Connected to:</p>
                      <p className="text-xs text-gray-500 truncate mt-1">{displayUrl}</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
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
