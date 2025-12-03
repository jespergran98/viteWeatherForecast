// src/components/WeatherGraph/WeatherGraph.jsx
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';
import './WeatherGraph.css';

const WeatherGraph = ({ type, hourlyData, precipitationData, selectedDay }) => {
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);

  const getChartData = () => {
    if (!hourlyData || hourlyData.length === 0) return [];

    // Filter hourly data for the selected day (24 hours)
    const selectedDateString = selectedDay.toDateString();
    const dayData = hourlyData.filter(item => 
      item.date === selectedDateString
    ).slice(0, 24);

    if (type === 'precipitation') {
      // Merge nowcast data (first 2 hours) with hourly forecast data
      const currentTime = new Date();
      const twoHoursFromNow = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
      
      let mergedData = [];

      // Check if selected day is today
      const isToday = selectedDateString === currentTime.toDateString();

      if (isToday && precipitationData && precipitationData.length > 0) {
        // Use nowcast data for the first 2 hours
        const nowcastHourly = [];
        const currentHour = currentTime.getHours();
        
        // Group nowcast data by hour and sum precipitation
        precipitationData.forEach(item => {
          const itemTime = new Date(item.time);
          if (itemTime <= twoHoursFromNow) {
            const hour = itemTime.getHours();
            const existingHour = nowcastHourly.find(h => h.hour === hour);
            
            if (existingHour) {
              existingHour.precipitation += item.precipitation;
            } else {
              nowcastHourly.push({
                hour: hour,
                precipitation: item.precipitation,
                isNowcast: true
              });
            }
          }
        });

        mergedData = nowcastHourly.map(item => ({
          label: `${String(item.hour).padStart(2, '0')}:00`,
          value: item.precipitation,
          unit: 'mm'
        }));

        // Add remaining hours from hourly forecast (after 2 hours)
        const remainingHours = dayData.filter(item => {
          const itemTime = new Date(item.time);
          return itemTime > twoHoursFromNow;
        });

        remainingHours.forEach(item => {
          mergedData.push({
            label: `${String(item.hour).padStart(2, '0')}:00`,
            value: item.precipitation,
            unit: 'mm'
          });
        });
      } else {
        // Not today or no nowcast data, use all hourly data
        mergedData = dayData.map(item => ({
          label: `${String(item.hour).padStart(2, '0')}:00`,
          value: item.precipitation,
          unit: 'mm'
        }));
      }

      return mergedData;
    } else if (type === 'temperature') {
      return dayData.map(item => ({
        label: `${String(item.hour).padStart(2, '0')}:00`,
        value: item.temperature,
        unit: '°C'
      }));
    } else if (type === 'wind') {
      return dayData.map(item => ({
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
        <p className="no-data">{t('noData')}</p>
      </div>
    );
  }

  const getColor = () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    switch(type) {
      case 'temperature': 
        return { 
          fill: computedStyle.getPropertyValue('--color-graph-temperature-fill').trim() || 'rgba(255, 193, 7, 0.3)', 
          stroke: computedStyle.getPropertyValue('--color-graph-temperature-stroke').trim() || 'rgba(255, 193, 7, 1)' 
        };
      case 'precipitation': 
        return { 
          fill: computedStyle.getPropertyValue('--color-graph-precipitation-fill').trim() || 'rgba(33, 150, 243, 0.3)', 
          stroke: computedStyle.getPropertyValue('--color-graph-precipitation-stroke').trim() || 'rgba(33, 150, 243, 1)' 
        };
      case 'wind': 
        return { 
          fill: computedStyle.getPropertyValue('--color-graph-wind-fill').trim() || 'rgba(156, 39, 176, 0.3)', 
          stroke: computedStyle.getPropertyValue('--color-graph-wind-stroke').trim() || 'rgba(156, 39, 176, 1)' 
        };
      default: 
        return { 
          fill: 'rgba(255, 255, 255, 0.3)', 
          stroke: 'rgba(255, 255, 255, 1)' 
        };
    }
  };

  const colors = getColor();

  const width = 400;
  const height = 180;
  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const points = chartData.map((item, index) => {
    const x = padding.left + (index / (chartData.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - ((item.value - minValue) / range) * graphHeight;
    return { x, y, value: item.value, label: item.label };
  });

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
        <path
          d={createAreaPath()}
          fill={colors.fill}
          className="area-path"
        />
        
        <path
          d={createLinePath()}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="2"
          className="line-path"
        />
        
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