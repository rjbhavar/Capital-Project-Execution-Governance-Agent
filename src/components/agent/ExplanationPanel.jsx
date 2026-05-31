/**
 * Explanation Panel Component
 * 
 * Displays detailed explanations for agent recommendations.
 * Shows WHY the agent made the recommendation with supporting evidence.
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { agentExplanationEngine } from '../../services/AgentExplanationEngine';

const ExplanationPanel = ({ recommendation, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  
  if (!recommendation) return null;

  const explanation = agentExplanationEngine.explain(recommendation);

  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Why this recommendation?</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Primary Reason:</span> {explanation.reasoning.primary}
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span>Confidence: {(recommendation.confidence * 100).toFixed(0)}%</span>
              <span>Impact: {explanation.impact.level}</span>
              <span>Urgency: {explanation.urgency.level}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recommendation Explanation</h3>
          <p className="text-sm text-gray-600 mt-1">
            Understanding why {recommendation.agentName || 'the agent'} made this recommendation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            explanation.confidence.level === 'very high' ? 'bg-green-100 text-green-800' :
            explanation.confidence.level === 'high' ? 'bg-blue-100 text-blue-800' :
            explanation.confidence.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {(recommendation.confidence * 100).toFixed(0)}% Confident
          </span>
        </div>
      </div>

      {/* Primary Reason */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Primary Reason</h4>
            <p className="text-gray-700">{explanation.reasoning.primary}</p>
          </div>
        </div>
      </div>

      {/* Supporting Factors */}
      {explanation.reasoning.supporting.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Supporting Factors</h4>
          <ul className="space-y-2">
            {explanation.reasoning.supporting.map((factor, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Points */}
      {Object.keys(explanation.reasoning.dataPoints).length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Key Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(explanation.reasoning.dataPoints).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-lg font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threshold */}
      {explanation.reasoning.threshold && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-900">Threshold Exceeded</span>
          </div>
          <p className="text-sm text-gray-700 mt-1">{explanation.reasoning.threshold}</p>
        </div>
      )}

      {/* Impact & Urgency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Impact */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className={`w-5 h-5 ${
              explanation.impact.level === 'critical' ? 'text-red-600' :
              explanation.impact.level === 'high' ? 'text-orange-600' :
              explanation.impact.level === 'medium' ? 'text-yellow-600' :
              'text-blue-600'
            }`} />
            <h4 className="font-semibold text-gray-900">Impact</h4>
          </div>
          <p className="text-sm text-gray-700 mb-2">{explanation.impact.description}</p>
          {explanation.impact.affectedAreas.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {explanation.impact.affectedAreas.map((area, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {area}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Urgency */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className={`w-5 h-5 ${
              explanation.urgency.level === 'immediate' ? 'text-red-600' :
              explanation.urgency.level === 'urgent' ? 'text-orange-600' :
              explanation.urgency.level === 'soon' ? 'text-yellow-600' :
              'text-blue-600'
            }`} />
            <h4 className="font-semibold text-gray-900">Urgency</h4>
          </div>
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Level:</span> {explanation.urgency.level}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Timeframe:</span> {explanation.urgency.timeframe}
          </p>
        </div>
      </div>

      {/* Alternative Actions */}
      {explanation.alternatives.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Alternative Actions</h4>
          <div className="space-y-2">
            {explanation.alternatives.map((alternative, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-500 mt-0.5">{index + 1}.</span>
                <span className="text-sm text-gray-700">{alternative}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Factors */}
      {explanation.confidence.factors.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Confidence Factors</h4>
          <ul className="space-y-1">
            {explanation.confidence.factors.map((factor, index) => (
              <li key={index} className="text-sm text-gray-700">• {factor}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-semibold text-gray-900 mb-2">Evidence</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Source:</span>
            <span className="ml-2 text-gray-900">{explanation.evidence.agentName}</span>
          </div>
          <div>
            <span className="text-gray-600">Timestamp:</span>
            <span className="ml-2 text-gray-900">
              {new Date(explanation.evidence.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Historical Context */}
      {explanation.historicalContext.previousOccurrences > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <h4 className="font-semibold text-gray-900 mb-1">Historical Context</h4>
          <p className="text-sm text-gray-700">{explanation.historicalContext.note}</p>
        </div>
      )}
    </div>
  );
};

export default ExplanationPanel;

// Made with Bob