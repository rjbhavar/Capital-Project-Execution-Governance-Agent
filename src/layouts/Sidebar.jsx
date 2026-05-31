import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  Flag,
  CheckSquare,
  DollarSign,
  ShoppingCart,
  Shield,
  FileText,
  Bell,
  Settings,
  Brain,
  Zap,
  Briefcase
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Overview' },
    { path: '/executive-briefing', icon: Briefcase, label: 'Executive Briefing' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/budgets', icon: DollarSign, label: 'Budgets' },
    { path: '/procurement', icon: ShoppingCart, label: 'Procurement' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/alerts', icon: Bell, label: 'Alerts' },
    { path: '/agent-workbench', icon: Zap, label: 'Agent Workbench' },
    { path: '/milestones', icon: Flag, label: 'Milestones', disabled: true },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks', disabled: true },
    { path: '/risks', icon: Shield, label: 'Risks', disabled: true },
    { path: '/settings', icon: Settings, label: 'Settings', disabled: true }
  ];

  return (
    <aside className="w-64 bg-ibm-gray text-white h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ibm-blue rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Capital Project</h1>
            <p className="text-xs text-gray-400">Command Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isDisabled = item.disabled;
          
          if (isDisabled) {
            return (
              <div
                key={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 cursor-not-allowed"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-ibm-blue text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          <p>Version 1.0.0</p>
          <p className="mt-1">© 2026 IBM Corporation</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

// Made with Bob
