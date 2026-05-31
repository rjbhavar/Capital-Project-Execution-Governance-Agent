import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Clock, Users, FileText } from 'lucide-react';
import { GradientCard } from '../components/common/PremiumCard';

const ExecutiveBriefing = () => {
  const briefingDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Briefing</h1>
          <p className="text-gray-600 mt-1">{briefingDate}</p>
        </div>
        <button className="px-4 py-2 bg-ibm-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
          Export PDF
        </button>
      </div>

      {/* Portfolio Summary */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">42</p>
            <p className="text-sm text-gray-600">Active Projects</p>
            <p className="text-xs text-green-600 mt-1">+3 this month</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">$125M</p>
            <p className="text-sm text-gray-600">Total Budget</p>
            <p className="text-xs text-blue-600 mt-1">78% utilized</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">85%</p>
            <p className="text-sm text-gray-600">On Track</p>
            <p className="text-xs text-green-600 mt-1">+5% vs last month</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">78%</p>
            <p className="text-sm text-gray-600">Avg Health Score</p>
            <p className="text-xs text-green-600 mt-1">Healthy portfolio</p>
          </div>
        </div>
      </GradientCard>

      {/* Projects Requiring Attention */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Projects Requiring Attention</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">HQ HVAC Modernization</h3>
              <p className="text-sm text-gray-600 mt-1">Budget overrun detected: 15% over allocated budget. Immediate review required.</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500">Budget: $2.5M → $2.9M</span>
                <span className="text-xs text-gray-500">Health: 65%</span>
                <span className="text-xs text-red-600 font-medium">CRITICAL</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Clock className="w-6 h-6 text-yellow-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Parking Lot Expansion</h3>
              <p className="text-sm text-gray-600 mt-1">Schedule delay: 2 weeks behind milestone. Contractor coordination needed.</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500">Budget: $1.2M</span>
                <span className="text-xs text-gray-500">Health: 72%</span>
                <span className="text-xs text-yellow-600 font-medium">HIGH</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Users className="w-6 h-6 text-yellow-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Building A Renovation</h3>
              <p className="text-sm text-gray-600 mt-1">Governance gap: No project manager assigned. Assignment required.</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500">Budget: $3.8M</span>
                <span className="text-xs text-gray-500">Health: 68%</span>
                <span className="text-xs text-yellow-600 font-medium">HIGH</span>
              </div>
            </div>
          </div>
        </div>
      </GradientCard>

      {/* Budget Concerns */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Concerns</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">3 Projects Over Budget</p>
              <p className="text-sm text-gray-600">Combined overrun: $1.2M (4.8% of portfolio)</p>
            </div>
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">5 Projects at Risk</p>
              <p className="text-sm text-gray-600">Forecast indicates potential overrun in Q3</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Portfolio Utilization</p>
              <p className="text-sm text-gray-600">$98M spent of $125M allocated (78%)</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </GradientCard>

      {/* Contract Concerns */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contract Concerns</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">3 Contracts Pending Approval</p>
              <p className="text-sm text-gray-600">Total value: $4.2M - Approval delays may impact schedule</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">2 Contracts Expiring Soon</p>
              <p className="text-sm text-gray-600">Renewal or replacement needed within 30 days</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </GradientCard>

      {/* Payment Concerns */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Concerns</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">8 Invoices Pending</p>
              <p className="text-sm text-gray-600">Total: $2.3M - Average processing time: 12 days</p>
            </div>
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Payment Schedule On Track</p>
              <p className="text-sm text-gray-600">No overdue payments, cash flow healthy</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </GradientCard>

      {/* Governance Concerns */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Governance Concerns</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">2 Projects Missing Project Managers</p>
              <p className="text-sm text-gray-600">Critical governance gap - immediate assignment required</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Compliance Score: 94%</p>
              <p className="text-sm text-gray-600">38 of 42 projects fully compliant</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </GradientCard>

      {/* Recommended Executive Actions */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Executive Actions</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-600">
            <span className="font-bold text-red-600">1.</span>
            <div>
              <p className="font-semibold text-gray-900">Review HQ HVAC Budget Overrun</p>
              <p className="text-sm text-gray-600">Schedule emergency review meeting with project team. Consider scope reduction or additional funding.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-600">
            <span className="font-bold text-yellow-600">2.</span>
            <div>
              <p className="font-semibold text-gray-900">Assign Project Managers</p>
              <p className="text-sm text-gray-600">Building A Renovation and Store 4560 Buildout require immediate PM assignment.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-600">
            <span className="font-bold text-yellow-600">3.</span>
            <div>
              <p className="font-semibold text-gray-900">Expedite Contract Approvals</p>
              <p className="text-sm text-gray-600">3 contracts pending approval may cause schedule delays. Fast-track approval process.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
            <span className="font-bold text-blue-600">4.</span>
            <div>
              <p className="font-semibold text-gray-900">Portfolio Health Review</p>
              <p className="text-sm text-gray-600">Schedule quarterly portfolio review to assess strategic alignment and resource allocation.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
            <span className="font-bold text-blue-600">5.</span>
            <div>
              <p className="font-semibold text-gray-900">Celebrate Successes</p>
              <p className="text-sm text-gray-600">Recognize teams on 5 projects completed on-time and under-budget this quarter.</p>
            </div>
          </div>
        </div>
      </GradientCard>

      {/* Agent Analysis Summary */}
      <GradientCard gradient="gray" className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Agent Analysis Summary</h2>
        <p className="text-sm text-gray-600 mb-4">
          This briefing was generated by analyzing 42 active projects across 6 specialized AI agents:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">Planning Agent</p>
            <p className="text-xs text-gray-600">127 findings</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">Budget Agent</p>
            <p className="text-xs text-gray-600">156 findings</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">Procurement Agent</p>
            <p className="text-xs text-gray-600">84 findings</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">Schedule Agent</p>
            <p className="text-xs text-gray-600">112 findings</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">Risk Agent</p>
            <p className="text-xs text-gray-600">98 findings</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">Reporting Agent</p>
            <p className="text-xs text-gray-600">42 summaries</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Analysis completed in 8.3 seconds with 92% average confidence
        </p>
      </GradientCard>
    </div>
  );
};

export default ExecutiveBriefing;

// Made with Bob
