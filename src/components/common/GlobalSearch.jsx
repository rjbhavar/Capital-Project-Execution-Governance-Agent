import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import {
  Search,
  X,
  FolderKanban,
  DollarSign,
  ShoppingCart,
  FileText,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { projects } = useData();

  // Search across all data
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search projects
    projects.forEach(project => {
      const matchScore = 
        (project.name.toLowerCase().includes(lowerQuery) ? 10 : 0) +
        (project.building?.toLowerCase().includes(lowerQuery) ? 5 : 0) +
        (project.status?.toLowerCase().includes(lowerQuery) ? 3 : 0) +
        (project.region?.toLowerCase().includes(lowerQuery) ? 2 : 0);

      if (matchScore > 0) {
        results.push({
          id: `project-${project.id}`,
          type: 'project',
          title: project.name,
          subtitle: project.building,
          metadata: `${project.status} • ${project.region}`,
          icon: FolderKanban,
          action: () => navigate(`/projects/${project.id}/intelligence`),
          score: matchScore
        });
      }
    });

    // Search budgets
    projects.filter(p => p.hasBudget).forEach(project => {
      if (
        project.name.toLowerCase().includes(lowerQuery) ||
        project.budgetDetails?.budgetStatus?.toLowerCase().includes(lowerQuery) ||
        'budget'.includes(lowerQuery)
      ) {
        results.push({
          id: `budget-${project.id}`,
          type: 'budget',
          title: `${project.name} - Budget`,
          subtitle: `$${(project.budgetDetails?.budgetAmount || 0).toLocaleString()}`,
          metadata: project.budgetDetails?.budgetStatus || 'Unknown',
          icon: DollarSign,
          action: () => navigate('/budgets'),
          score: 5
        });
      }
    });

    // Search contracts
    projects.filter(p => p.hasContracts).forEach(project => {
      if (
        project.name.toLowerCase().includes(lowerQuery) ||
        project.contractDetails?.contractName?.toLowerCase().includes(lowerQuery) ||
        'contract'.includes(lowerQuery) ||
        'procurement'.includes(lowerQuery)
      ) {
        results.push({
          id: `contract-${project.id}`,
          type: 'contract',
          title: project.contractDetails?.contractName || `${project.name} - Contract`,
          subtitle: project.name,
          metadata: project.contractDetails?.contractStatus || 'Unknown',
          icon: ShoppingCart,
          action: () => navigate('/procurement'),
          score: 5
        });
      }
    });

    // Sort by score and limit results
    return results.sort((a, b) => b.score - a.score).slice(0, 20);
  }, [query, projects, navigate]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups = {
      project: [],
      budget: [],
      contract: []
    };

    searchResults.forEach(result => {
      if (groups[result.type]) {
        groups[result.type].push(result);
      }
    });

    return groups;
  }, [searchResults]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            searchResults[selectedIndex].action();
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
  }, [isOpen, selectedIndex, searchResults, onClose]);

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

  const typeLabels = {
    project: 'Projects',
    budget: 'Budgets',
    contract: 'Contracts'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Panel */}
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, budgets, contracts..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-lg"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query.trim() ? (
            <div className="px-4 py-12 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Start typing to search</p>
              <p className="text-sm mt-1">Search across projects, budgets, and contracts</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            Object.entries(groupedResults).map(([type, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={type} className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {typeLabels[type]} ({items.length})
                  </div>
                  {items.map((result) => {
                    const globalIndex = searchResults.indexOf(result);
                    const isSelected = globalIndex === selectedIndex;
                    const Icon = result.icon;

                    return (
                      <button
                        key={result.id}
                        onClick={() => {
                          result.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full flex items-start gap-3 px-4 py-3 transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className="flex-1 text-left min-w-0">
                          <div className={`font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                            {result.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">{result.subtitle}</div>
                          <div className="text-xs text-gray-400 mt-1">{result.metadata}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })
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
            <Search className="w-3 h-3" />
            <span>{searchResults.length} results</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;

// Made with Bob