import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Simple Line Chart Component
 */
export const LineChart = ({ data, height = 200, color = '#3b82f6' }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = ((max - d.value) / range) * 80 + 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative" style={{ height }}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={`0,100 ${points} 100,100`}
          fill={color}
          fillOpacity="0.1"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
};

/**
 * Bar Chart Component
 */
export const BarChart = ({ data, height = 200, color = '#3b82f6' }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '100%' }}>
            <div
              className="absolute bottom-0 w-full rounded-t-lg transition-all duration-500"
              style={{
                height: `${(item.value / max) * 100}%`,
                backgroundColor: color
              }}
            />
          </div>
          <span className="text-xs text-gray-600 text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Donut Chart Component
 */
export const DonutChart = ({ data, size = 120, thickness = 20 }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (currentAngle * Math.PI) / 180;

    const x1 = size / 2 + radius * Math.cos(startRad);
    const y1 = size / 2 + radius * Math.sin(startRad);
    const x2 = size / 2 + radius * Math.cos(endRad);
    const y2 = size / 2 + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...item,
      path: `M ${size / 2} ${size / 2} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      percentage: percentage.toFixed(1)
    };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={thickness}
        />
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            opacity="0.9"
          />
        ))}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - thickness / 2}
          fill="white"
        />
      </svg>
      <div className="space-y-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-700">{segment.label}</span>
            <span className="text-gray-500 ml-auto">{segment.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Trend Indicator Component
 */
export const TrendIndicator = ({ value, previousValue, format = 'number' }) => {
  const change = value - previousValue;
  const percentChange = previousValue !== 0 ? (change / previousValue) * 100 : 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val);
    }
    if (format === 'percent') {
      return `${val.toFixed(1)}%`;
    }
    return val.toLocaleString();
  };

  return (
    <div className="flex items-center gap-2">
      {isNeutral ? (
        <Minus className="w-4 h-4 text-gray-400" />
      ) : isPositive ? (
        <TrendingUp className="w-4 h-4 text-green-600" />
      ) : (
        <TrendingDown className="w-4 h-4 text-red-600" />
      )}
      <span className={`text-sm font-semibold ${
        isNeutral ? 'text-gray-600' :
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive && '+'}{formatValue(change)} ({percentChange.toFixed(1)}%)
      </span>
    </div>
  );
};

/**
 * Heat Map Component
 */
export const HeatMap = ({ data, rows = 5, cols = 5 }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {data.map((cell, index) => {
        const intensity = (cell.value / max) * 100;
        return (
          <div
            key={index}
            className="aspect-square rounded flex items-center justify-center text-xs font-semibold transition-all hover:scale-110 cursor-pointer"
            style={{
              backgroundColor: `rgba(239, 68, 68, ${intensity / 100})`,
              color: intensity > 50 ? 'white' : '#374151'
            }}
            title={`${cell.label}: ${cell.value}`}
          >
            {cell.value}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Progress Ring Component
 */
export const ProgressRing = ({ percentage, size = 100, strokeWidth = 8, color = '#3b82f6', label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

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
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</span>
        </div>
      </div>
      {label && <span className="text-sm text-gray-600 mt-2">{label}</span>}
    </div>
  );
};

/**
 * Sparkline Component
 */
export const Sparkline = ({ data, width = 100, height = 30, color = '#3b82f6' }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = ((max - value) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

/**
 * Gauge Chart Component
 */
export const GaugeChart = ({ value, max = 100, size = 120, color = '#3b82f6', label }) => {
  const percentage = (value / max) * 100;
  const angle = (percentage / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 }}>
        <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
          {/* Background arc */}
          <path
            d={`M 10 ${size / 2} A ${size / 2 - 10} ${size / 2 - 10} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M 10 ${size / 2} A ${size / 2 - 10} ${size / 2 - 10} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * Math.PI * (size / 2 - 10)} ${Math.PI * (size / 2 - 10)}`}
            className="transition-all duration-1000"
          />
          {/* Needle */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2 + (size / 2 - 20) * Math.cos((angle * Math.PI) / 180)}
            y2={size / 2 + (size / 2 - 20) * Math.sin((angle * Math.PI) / 180)}
            stroke="#374151"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx={size / 2} cy={size / 2} r="4" fill="#374151" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {label && <div className="text-xs text-gray-600">{label}</div>}
        </div>
      </div>
    </div>
  );
};

export default {
  LineChart,
  BarChart,
  DonutChart,
  TrendIndicator,
  HeatMap,
  ProgressRing,
  Sparkline,
  GaugeChart
};

// Made with Bob
