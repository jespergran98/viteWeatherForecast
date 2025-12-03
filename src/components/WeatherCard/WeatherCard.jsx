// src/components/WeatherCard/WeatherCard.jsx
import React, { useState, useEffect } from 'react';
import { getUserLocation } from '../../services/locationService';
import { getWeatherData, celsiusToFahrenheit } from '../../services/weatherService';
import { getLocationName } from '../../services/geocodingService';
import { getNowcastData } from '../../services/nowcastService';
import TabNavigation from '../tabNavigation/tabNavigation';
import WeatherGraph from '../weatherGraph/weatherGraph';
import './WeatherCard.css';

const WeatherCard = ({ darkMode, onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [precipitationData, setPrecipitationData] = useState(null);
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [activeTab, setActiveTab] = useState('temperature');

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { latitude, longitude } = await getUserLocation();

      const [weather, location] = await Promise.all([
        getWeatherData(latitude, longitude),
        getLocationName(latitude, longitude)
      ]);

      setWeatherData(weather);
      setLocationName(location);

      try {
        const nowcast = await getNowcastData(latitude, longitude);
        setPrecipitationData(nowcast);
      } catch (nowcastError) {
        console.warn('Could not fetch nowcast data:', nowcastError);
        setPrecipitationData(null);
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  useEffect(() => {
    if (onRefresh) {
      fetchWeatherData();
    }
  }, [onRefresh]);

  const getWeatherIcon = (symbolCode) => {
    if (!symbolCode) return null;

    const iconMap = {
      'clearsky': '01', 'fair': '02', 'partlycloudy': '03', 'cloudy': '04',
      'lightrainshowers': '40', 'rainshowers': '05', 'heavyrainshowers': '41',
      'lightrainshowersandthunder': '24', 'rainshowersandthunder': '06',
      'heavyrainshowersandthunder': '25', 'lightsleetshowers': '42',
      'sleetshowers': '07', 'heavysleetshowers': '43',
      'lightsleetshowersandthunder': '26', 'sleetshowersandthunder': '20',
      'heavysleetshowersandthunder': '27', 'lightsnowshowers': '44',
      'snowshowers': '08', 'heavysnowshowers': '45',
      'lightsnowshowersandthunder': '28', 'snowshowersandthunder': '21',
      'heavysnowshowersandthunder': '29', 'lightrain': '46', 'rain': '09',
      'heavyrain': '10', 'lightrainandthunder': '30', 'rainandthunder': '22',
      'heavyrainandthunder': '11', 'lightsleet': '47', 'sleet': '12',
      'heavysleet': '48', 'lightsleetandthunder': '31', 'sleetandthunder': '23',
      'heavysleetandthunder': '32', 'lightsnow': '49', 'snow': '13',
      'heavysnow': '14', 'lightsnowandthunder': '33', 'snowandthunder': '14',
      'heavysnowandthunder': '34', 'fog': '15'
    };

    const parts = symbolCode.split('_');
    const weatherType = parts.slice(0, -1).join('');
    const timeVariant = parts[parts.length - 1];

    const iconNumber = iconMap[weatherType] || '01';
    let variant = 'd';
    
    if (timeVariant === 'night' || timeVariant === 'polartwilight') {
      variant = 'n';
    }

    const theme = darkMode ? 'darkmode' : 'lightmode';
    return `/assets/weatherIcons/${theme}/${iconNumber}${variant}.svg`;
  };

  const displayTemperature = (temp) => {
    return isFahrenheit 
      ? Math.round(celsiusToFahrenheit(temp))
      : Math.round(temp);
  };

  if (loading) {
    return (
      <div className="weather-card">
        <div className="loading-spinner">
          <svg className="spinner" viewBox="0 0 50 50">
            <circle
              className="spinner-path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="5"
            />
          </svg>
          <p>Loading weather...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-card">
        <div className="error-message">
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3>Unable to load weather</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-card">
      <div className="card-layout">
        {/* Left Section - Main Info */}
        <div className="card-left">
          {/* Location Header */}
          <div className="location-header">
            <svg className="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="location-name">{locationName}</h2>
          </div>

          {/* Weather Icon and Temperature */}
          <div className="weather-main">
            <img
              src={getWeatherIcon(weatherData.symbolCode)}
              alt="Weather icon"
              className="weather-icon"
              onError={(e) => {
                e.target.src = '/assets/weatherIcons/lightmode/01d.svg';
              }}
            />
            
            <div className="temp-section">
              <div className="temperature-display">
                <span className="temp-value">{displayTemperature(weatherData.temperature)}</span>
                <div className="temp-units">
                  <button
                    className={`unit-button ${!isFahrenheit ? 'active' : ''}`}
                    onClick={() => setIsFahrenheit(false)}
                  >
                    °C
                  </button>
                  <span className="unit-divider">|</span>
                  <button
                    className={`unit-button ${isFahrenheit ? 'active' : ''}`}
                    onClick={() => setIsFahrenheit(true)}
                  >
                    °F
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="weather-details">
            <div className="detail-item">
              <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span>{Math.round(weatherData.humidity)}%</span>
            </div>

            <div className="detail-item">
              <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span>{Math.round(weatherData.windSpeed)} m/s</span>
            </div>
          </div>
        </div>

        {/* Right Section - Graph */}
        <div className="card-right">
          <TabNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <div className="graph-container">
            <WeatherGraph 
              type={activeTab}
              data={weatherData.forecast24h}
              precipitationData={precipitationData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;