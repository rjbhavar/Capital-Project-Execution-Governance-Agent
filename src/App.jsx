import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConnectionProvider } from './context/ConnectionContext';
import { DataProvider } from './context/DataContext';
import MainLayout from './layouts/MainLayout';
import ConnectionScreen from './pages/ConnectionScreen';
import CapabilityDetection from './pages/CapabilityDetection';
import Overview from './pages/Overview';
import Projects from './pages/Projects';
import ProjectIntelligence from './pages/ProjectIntelligence';
import Budgets from './pages/Budgets';
import Procurement from './pages/Procurement';
import Reports from './pages/Reports';
import AgentWorkbench from './pages/AgentWorkbench';
import ExecutiveBriefing from './pages/ExecutiveBriefing';
import ProjectCommandCenter from './pages/ProjectCommandCenter';
import AgentOperationsCenter from './pages/AgentOperationsCenter';
import PortfolioIntelligence from './pages/PortfolioIntelligence';
import ApprovalWorkbench from './pages/ApprovalWorkbench';
import NotificationCenter from './pages/NotificationCenter';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const connection = sessionStorage.getItem('mref_connection');
  
  if (!connection) {
    return <Navigate to="/connect" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <ConnectionProvider>
        <Routes>
          {/* Connection Screen - First screen */}
          <Route path="/connect" element={<ConnectionScreen />} />
          
          {/* Capability Detection - Admin/Debug only (hidden from regular users) */}
          <Route path="/admin/capabilities" element={
            <ProtectedRoute>
              <CapabilityDetection />
            </ProtectedRoute>
          } />
          
          {/* Protected Routes - Require authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <DataProvider>
                <MainLayout />
              </DataProvider>
            </ProtectedRoute>
          }>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId/intelligence" element={<ProjectIntelligence />} />
          <Route path="projects/:projectId/command" element={<ProjectCommandCenter />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="procurement" element={<Procurement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="agent-workbench" element={<AgentWorkbench />} />
          <Route path="agent-operations" element={<AgentOperationsCenter />} />
          <Route path="portfolio-intelligence" element={<PortfolioIntelligence />} />
          <Route path="approvals" element={<ApprovalWorkbench />} />
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="executive-briefing" element={<ExecutiveBriefing />} />
          </Route>
          
          {/* Redirect root to connection screen if not authenticated */}
          <Route path="*" element={<Navigate to="/connect" replace />} />
        </Routes>
      </ConnectionProvider>
    </Router>
  );
}

export default App;

// Made with Bob
