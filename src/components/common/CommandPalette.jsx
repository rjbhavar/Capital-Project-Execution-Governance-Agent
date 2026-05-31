import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import {
  Search,
  Command,
  ArrowRight,
  Home,
  FolderKanban,
  DollarSign,
  ShoppingCart,
  FileText,
  Bot,
  BarChart3,
  CheckSquare,
  Bell,
  Briefcase,
  TrendingUp,
  Settings,
  Users,
  Calendar,
  FileCheck,
  AlertTriangle,
  X
} from 'lucide-react';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { projects } = useData();

  // Define all available commands
  const commands = useMemo(() => {
    const baseCommands = [
      // Navigation
      { id: 'nav-overview', label: 'Overview Dashboard', icon: Home, action: () => navigate('/overview'), category: 'Navigation' },
      { id: 'nav-projects', label: 'Projects', icon: FolderKanban, action: () => navigate('/projects'), category: 'Navigation' },
      { id: 'nav-budgets', label: 'Budget Management', icon: DollarSign, action: () => navigate('/budgets'), category: 'Navigation' },
      { id: 'nav-procurement', label: 'Procurement', icon: ShoppingCart, action: () => navigate('/procurement'), category: 'Navigation' },
      { id: 'nav-reports', label: 'Reports', icon: FileText, action: () => navigate('/reports'), category: 'Navigation' },
      { id: 'nav-agent-workbench', label: 'Agent Workbench', icon: Bot, action: () => navigate('/agent-workbench'), category: 'Navigation' },
      { id: 'nav-agent-ops', label: 'Agent Operations Center', icon: Settings, action: () => navigate('/agent-operations'), category: 'Navigation' },
      { id: 'nav-portfolio', label: 'Portfolio Intelligence', icon: BarChart3, action: () => navigate('/portfolio-intelligence'), category: 'Navigation' },
      { id: 'nav-approvals', label: 'Approval Workbench', icon: CheckSquare, action: () => navigate('/approvals'), category: 'Navigation' },
      { id: 'nav-notifications', label: 'Notification Center', icon: Bell, action: () => navigate('/notifications'), category: 'Navigation' },
      { id: 'nav-executive', label: 'Executive Briefing', icon: Briefcase, action: () => navigate('/executive-briefing'), category: 'Navigation' },
      
      // Quick Actions
      { id: 'action-refresh', label: 'Refresh Data', icon: TrendingUp, action: () => window.location.reload(), category: 'Actions' },
      { id: 'action-export', label: 'Export Current View', icon: FileCheck, action: () => alert('Export functionality'), category: 'Actions' },
      
      // Help
      { id: 'help-shortcuts', label: 'Keyboard Shortcuts', icon: Command, action: () => alert('Cmd+K: Command Palette\nCmd+/: Search\nEsc: Close'), category: 'Help' },
    ];

    // Add project-specific commands
    const projectCommands = projects.slice(0, 10).map(project => ({
      id: `project-${project.id}`,
      label: `Go to ${project.name}`,
      icon: FolderKanban,
      action: () => navigate(`/projects/${project.id}/intelligence`),
      category: 'Projects',
      subtitle: project.building
    }));

    return [...baseCommands, ...projectCommands];
  }, [navigate, projects]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(lowerQuery))
    );
  }, [query, commands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-lg"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No commands found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {category}
                </div>
                {cmds.map((cmd, index) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  const isSelected = globalIndex === selectedIndex;
                  const Icon = cmd.icon;

                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="flex-1 text-left">
                        <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {cmd.label}
                        </div>
                        {cmd.subtitle && (
                          <div className="text-sm text-gray-500">{cmd.subtitle}</div>
                        )}
                      </div>
                      <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-300'}`} />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">↵</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;

// Made with Bob