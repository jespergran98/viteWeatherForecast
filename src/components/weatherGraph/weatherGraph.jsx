// src/components/WeatherGraph/WeatherGraph.jsx
import React from 'react';
import './WeatherGraph.css';

const WeatherGraph = ({ type, data, precipitationData }) => {
  const getChartData = () => {
    if (type === 'precipitation' && precipitationData) {
      return precipitationData.slice(0, 24).map(item => ({
        label: `${String(item.hour).padStart(2, '0')}:${String(item.minute).padStart(2, '0')}`,
        value: item.precipitation,
        unit: 'mm'
      }));
    } else if (type === 'temperature') {
      return data.map(item => ({
        label: `${String(item.hour).padStart(2, '0')}:00`,
        value: item.temperature,
        unit: '°C'
      }));
    } else if (type === 'wind') {
      return data.map(item => ({
        label: `${String(item.hour).padStart(2, '0')}:00`,
        value: item.windSpeed,
        unit: 'm/s'
      }));
    }
    return [];
  };

  const chartData = getChartData();
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="weather-graph">
        <p className="no-data">No data available</p>
      </div>
    );
  }

  // Get color based on type
  const getColor = () => {
    switch(type) {
      case 'temperature': return { fill: 'rgba(255, 193, 7, 0.3)', stroke: 'rgba(255, 193, 7, 1)' };
      case 'precipitation': return { fill: 'rgba(33, 150, 243, 0.3)', stroke: 'rgba(33, 150, 243, 1)' };
      case 'wind': return { fill: 'rgba(156, 39, 176, 0.3)', stroke: 'rgba(156, 39, 176, 1)' };
      default: return { fill: 'rgba(255, 255, 255, 0.3)', stroke: 'rgba(255, 255, 255, 1)' };
    }
  };

  const colors = getColor();

  // Calculate dimensions
  const width = 400;
  const height = 180;
  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Calculate scale
  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  // Generate points for the area
  const points = chartData.map((item, index) => {
    const x = padding.left + (index / (chartData.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - ((item.value - minValue) / range) * graphHeight;
    return { x, y, value: item.value, label: item.label };
  });

  // Create SVG path for area
  const createAreaPath = () => {
    if (points.length === 0) return '';
    
    let path = `M ${padding.left} ${height - padding.bottom}`;
    path += ` L ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    path += ` L ${padding.left + graphWidth} ${height - padding.bottom}`;
    path += ' Z';
    
    return path;
  };

  // Create SVG path for line
  const createLinePath = () => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };

  return (
    <div className="weather-graph">
      <svg 
        className="graph-svg" 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {/* Area fill */}
        <path
          d={createAreaPath()}
          fill={colors.fill}
          className="area-path"
        />
        
        {/* Line stroke */}
        <path
          d={createLinePath()}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="2"
          className="line-path"
        />
        
        {/* Data points */}
        {points.map((point, index) => {
          const showLabel = index % 3 === 0;
          return (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill={colors.stroke}
                className="data-point"
              />
              {showLabel && (
                <>
                  <text
                    x={point.x}
                    y={point.y - 8}
                    textAnchor="middle"
                    className="point-value"
                    fill="white"
                  >
                    {Math.round(point.value * 10) / 10}
                  </text>
                  <text
                    x={point.x}
                    y={height - padding.bottom + 20}
                    textAnchor="middle"
                    className="point-label"
                    fill="rgba(255, 255, 255, 0.7)"
                  >
                    {point.label}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default WeatherGraph;