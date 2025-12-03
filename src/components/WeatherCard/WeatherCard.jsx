// src/components/WeatherCard/WeatherCard.jsx
import React, { useState, useEffect } from 'react';
import { getUserLocation } from '../../services/locationService';
import { getWeatherData, isDaytime } from '../../services/weatherService';
import { getLocationName } from '../../services/geocodingService';
import './WeatherCard.css';

const WeatherCard = ({ darkMode, onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('');

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's location
      const { latitude, longitude } = await getUserLocation();

      // Fetch weather data and location name in parallel
      const [weather, location] = await Promise.all([
        getWeatherData(latitude, longitude),
        getLocationName(latitude, longitude)
      ]);

      setWeatherData(weather);
      setLocationName(location);
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

  // Trigger refresh from parent component
  useEffect(() => {
    if (onRefresh) {
      fetchWeatherData();
    }
  }, [onRefresh]);

  /**
   * Gets the appropriate weather icon path based on symbol code and theme
   */
  const getWeatherIcon = (symbolCode) => {
    if (!symbolCode) return null;

    // Extract the base code and variant (e.g., "clearsky_day" -> "01" + "d")
    const iconMap = {
      'clearsky': '01',
      'fair': '02',
      'partlycloudy': '03',
      'cloudy': '04',
      'lightrainshowers': '40',
      'rainshowers': '05',
      'heavyrainshowers': '41',
      'lightrainshowersandthunder': '24',
      'rainshowersandthunder': '06',
      'heavyrainshowersandthunder': '25',
      'lightsleetshowers': '42',
      'sleetshowers': '07',
      'heavysleetshowers': '43',
      'lightsleetshowersandthunder': '26',
      'sleetshowersandthunder': '20',
      'heavysleetshowersandthunder': '27',
      'lightsnowshowers': '44',
      'snowshowers': '08',
      'heavysnowshowers': '45',
      'lightsnowshowersandthunder': '28',
      'snowshowersandthunder': '21',
      'heavysnowshowersandthunder': '29',
      'lightrain': '46',
      'rain': '09',
      'heavyrain': '10',
      'lightrainandthunder': '30',
      'rainandthunder': '22',
      'heavyrainandthunder': '11',
      'lightsleet': '47',
      'sleet': '12',
      'heavysleet': '48',
      'lightsleetandthunder': '31',
      'sleetandthunder': '23',
      'heavysleetandthunder': '32',
      'lightsnow': '49',
      'snow': '13',
      'heavysnow': '14',
      'lightsnowandthunder': '33',
      'snowandthunder': '14',
      'heavysnowandthunder': '34',
      'fog': '15'
    };

    // Parse symbol code (e.g., "clearsky_day", "rain_night")
    const parts = symbolCode.split('_');
    const weatherType = parts.slice(0, -1).join(''); // Remove time variant
    const timeVariant = parts[parts.length - 1]; // "day", "night", "polartwilight"

    // Get icon number
    const iconNumber = iconMap[weatherType] || '01';

    // Determine icon variant (d, n, m)
    let variant = 'd';
    if (timeVariant === 'night' || timeVariant === 'polartwilight') {
      variant = 'n';
    } else if (timeVariant === 'day') {
      variant = 'd';
    }

    // Choose light or dark mode icons
    const theme = darkMode ? 'darkmode' : 'lightmode';
    
    return `/assets/weatherIcons/${theme}/${iconNumber}${variant}.svg`;
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
          <svg
            className="error-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3>Unable to load weather</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-card">
      {/* Location Name */}
      <div className="location-header">
        <svg
          className="location-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
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
        <div className="temperature">
          <span className="temp-value">{Math.round(weatherData.temperature)}</span>
          <span className="temp-unit">°C</span>
        </div>
      </div>

      {/* Additional Weather Details */}
      <div className="weather-details">
        <div className="detail-item">
          <svg
            className="detail-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
          <span>{Math.round(weatherData.humidity)}% humidity</span>
        </div>

        <div className="detail-item">
          <svg
            className="detail-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
          <span>{Math.round(weatherData.windSpeed)} m/s wind</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;