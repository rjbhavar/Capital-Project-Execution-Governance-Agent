import React from 'react';

export const GradientCard = ({ children, gradient = 'blue', className = '' }) => {
  const gradients = {
    blue: 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 border-blue-200',
    green: 'bg-gradient-to-br from-green-50 via-emerald-100 to-teal-100 border-green-200',
    purple: 'bg-gradient-to-br from-purple-50 via-violet-100 to-purple-100 border-purple-200',
    orange: 'bg-gradient-to-br from-orange-50 via-amber-100 to-yellow-100 border-orange-200',
    red: 'bg-gradient-to-br from-red-50 via-rose-100 to-pink-100 border-red-200',
    gray: 'bg-gradient-to-br from-gray-50 via-slate-100 to-gray-100 border-gray-200'
  };

  return (
    <div className={`rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${gradients[gradient]} ${className}`}>
      {children}
    </div>
  );
};

export const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
    yellow: 'text-yellow-600 bg-yellow-100'
  };

  return (
    <GradientCard gradient={color} className="p-6 hover:scale-105 transition-transform duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-2 text-sm">
          <span className={`font-semibold ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value}
          </span>
          <span className="text-gray-600">{trend.label}</span>
        </div>
      )}
    </GradientCard>
  );
};

export const RadialProgress = ({ value, max = 100, size = 120, strokeWidth = 8, color = 'blue', label, sublabel }) => {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    blue: '#2563eb',
    green: '#10b981',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    red: '#ef4444',
    yellow: '#eab308'
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors[color]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</span>
          {label && <span className="text-xs text-gray-600 mt-1">{label}</span>}
        </div>
      </div>
      {sublabel && <p className="text-sm text-gray-600 mt-2 text-center">{sublabel}</p>}
    </div>
  );
};

export const InsightCard = ({ type = 'info', title, message, action, icon: Icon }) => {
  const styles = {
    info: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-900',
    warning: 'bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-300 text-yellow-900',
    error: 'bg-gradient-to-br from-red-50 to-rose-100 border-red-300 text-red-900',
    success: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 text-green-900'
  };

  const iconColors = {
    info: 'text-blue-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    success: 'text-green-600'
  };

  return (
    <div className={`rounded-xl border-2 p-4 shadow-md hover:shadow-lg transition-all duration-300 ${styles[type]}`}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[type]}`} />}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm opacity-90">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProgressRing = ({ percentage, size = 60, strokeWidth = 4, color = 'blue' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    blue: '#2563eb',
    green: '#10b981',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    red: '#ef4444'
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors[color]}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
};

// Default export for convenience (exports GradientCard as default)
const PremiumCard = GradientCard;
export default PremiumCard;

// Made with Bob