import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  DollarSign,
  ShoppingCart,
  FileText,
  Bell,
  Brain,
  Zap,
  Briefcase,
  Target,
  Shield,
  TrendingUp,
  CheckSquare
} from 'lucide-react';

const Sidebar = () => {
  const navSections = [
    {
      title: 'EXECUTIVE INTELLIGENCE',
      items: [
        { path: '/', icon: LayoutDashboard, label: 'Intelligence Center' },
        { path: '/portfolio-intelligence', icon: TrendingUp, label: 'Portfolio Intelligence' },
        { path: '/executive-briefing', icon: Briefcase, label: 'Executive Briefing' }
      ]
    },
    {
      title: 'PORTFOLIO OPERATIONS',
      items: [
        { path: '/projects', icon: FolderKanban, label: 'Projects' },
        { path: '/agent-workbench', icon: Zap, label: 'Agent Workbench' },
        { path: '/agent-operations', icon: Target, label: 'Agent Operations' }
      ]
    },
    {
      title: 'FINANCIAL CONTROL',
      items: [
        { path: '/budgets', icon: DollarSign, label: 'Budgets' }
      ]
    },
    {
      title: 'GOVERNANCE',
      items: [
        { path: '/approvals', icon: CheckSquare, label: 'Approvals' },
        { path: '/procurement', icon: ShoppingCart, label: 'Procurement' },
        { path: '/reports', icon: FileText, label: 'Reports' },
        { path: '/notifications', icon: Bell, label: 'Notifications' }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-ibm-gray text-white h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Capital Project</h1>
            <p className="text-xs text-blue-400">Operations Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="px-4 mb-2">
              <p className="text-xs font-bold text-gray-500 tracking-wider">{section.title}</p>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          <p className="font-semibold text-gray-300">Enterprise Edition</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

// Made with Bob
