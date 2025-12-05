// src/components/WeatherCard/WeatherCard.jsx
import React, { useState } from 'react';
import { celsiusToFahrenheit } from '../../services/weatherService';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';
import { getWeatherDescription } from '../../utils/weatherDescriptions';
import TabNavigation from '../TabNavigation/TabNavigation';
import WeatherGraph from '../WeatherGraph/WeatherGraph';
import WeeklyForecast from '../WeeklyForecast/WeeklyForecast';
import './WeatherCard.css';

const WeatherCard = ({ 
  darkMode, 
  weatherData, 
  locationName, 
  precipitationData,
  loading,
  error,
  selectedDay,
  onDaySelect
}) => {
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [activeTab, setActiveTab] = useState('temperature');
  const { language } = useLanguage();

  const t = (key) => getTranslation(language, key);

  const getWeatherIcon = (symbolCode) => {
    const BASE_URL = import.meta.env.BASE_URL;
    
    if (!symbolCode) return null;

    const iconMap = {
      'clearsky': '01', 'fair': '02', 'partlycloudy': '03', 'cloudy': '04',
      'rainshowers': '05', 'rainshowersandthunder': '06', 'sleetshowers': '07',
      'snowshowers': '08', 'rain': '09', 'heavyrain': '10', 'heavyrainandthunder': '11',
      'sleet': '12', 'snow': '13', 'snowandthunder': '14', 'fog': '15',
      'sleetshowersandthunder': '20', 'snowshowersandthunder': '21',
      'rainandthunder': '22', 'sleetandthunder': '23',
      'lightrainshowersandthunder': '24', 'heavyrainshowersandthunder': '25',
      'lightsleetshowersandthunder': '26', 'heavysleetshowersandthunder': '27',
      'lightsnowshowersandthunder': '28', 'heavysnowshowersandthunder': '29',
      'lightrainandthunder': '30', 'lightsleetandthunder': '31',
      'heavysleetandthunder': '32', 'lightsnowandthunder': '33',
      'heavysnowandthunder': '34', 'lightrainshowers': '40',
      'heavyrainshowers': '41', 'lightsleetshowers': '42',
      'heavysleetshowers': '43', 'lightsnowshowers': '44',
      'heavysnowshowers': '45', 'lightrain': '46', 'lightsleet': '47',
      'heavysleet': '48', 'lightsnow': '49', 'heavysnow': '50'
    };

    const iconsWithTimeVariants = [
      '01', '02', '03', '05', '06', '07', '08', '24', '25', '26', 
      '27', '28', '29', '40', '41', '42', '43', '44', '45'
    ];

    const [weatherType, timeVariant] = symbolCode.includes('_')
      ? [symbolCode.substring(0, symbolCode.lastIndexOf('_')), symbolCode.split('_').pop()]
      : [symbolCode, null];
    
    const iconNumber = iconMap[weatherType] || '01';
    const theme = darkMode ? 'darkmode' : 'lightmode';
    
    if (iconsWithTimeVariants.includes(iconNumber)) {
      let variant = 'd';
      
      if (timeVariant === 'night') {
        variant = 'n';
      } else if (timeVariant === 'polartwilight') {
        variant = 'm';
      } else if (!timeVariant) {
        const hour = new Date().getHours();
        variant = (hour >= 6 && hour < 20) ? 'd' : 'n';
      }
      
      return `${BASE_URL}assets/weatherIcons/${theme}/${iconNumber}${variant}.svg`;
    }
    
    return `${BASE_URL}assets/weatherIcons/${theme}/${iconNumber}.svg`;
  };

  const displayTemperature = (temp) => {
    return isFahrenheit 
      ? Math.round(celsiusToFahrenheit(temp))
      : Math.round(temp);
  };

  const getDayLabel = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((compareDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('tomorrow');
    
    return t('fullDays')[compareDate.getDay()];
  };

  const isToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    return today.getTime() === compareDate.getTime();
  };

  const calculateFeelsLike = (temp, windSpeed, humidity) => {
    const windSpeedKmh = windSpeed * 3.6;
    
    // Wind chill formula (temp ≤ 10°C and wind > 4.8 km/h)
    if (temp <= 10 && windSpeedKmh > 4.8) {
      return 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeedKmh, 0.16) + 
             0.3965 * temp * Math.pow(windSpeedKmh, 0.16);
    }
    
    // Heat index formula (temp ≥ 27°C)
    if (temp >= 27) {
      const T = temp;
      const RH = humidity;
      return -8.78469475556 + 1.61139411 * T + 2.33854883889 * RH - 
             0.14611605 * T * RH - 0.012308094 * T * T - 
             0.0164248277778 * RH * RH + 0.002211732 * T * T * RH + 
             0.00072546 * T * RH * RH - 0.000003582 * T * T * RH * RH;
    }
    
    return temp;
  };

  const getSelectedDayData = () => {
    if (!weatherData?.dailyForecast) return null;
    
    // Use current weather data for today
    if (isToday(selectedDay)) {
      const feelsLike = weatherData.feelsLike ?? 
        calculateFeelsLike(weatherData.temperature, weatherData.windSpeed, weatherData.humidity);
      
      return {
        temperature: weatherData.temperature,
        symbolCode: weatherData.symbolCode,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        feelsLike
      };
    }
    
    // Find matching day in forecast
    const selectedDayData = weatherData.dailyForecast.find(day => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      const selDate = new Date(selectedDay);
      selDate.setHours(0, 0, 0, 0);
      return dayDate.getTime() === selDate.getTime();
    });
    
    if (!selectedDayData) return null;
    
    // Get hourly data for the selected day
    const dayHourlyData = weatherData.hourlyForecast.filter(hour => {
      const hourDate = new Date(hour.time);
      hourDate.setHours(0, 0, 0, 0);
      const selDate = new Date(selectedDay);
      selDate.setHours(0, 0, 0, 0);
      return hourDate.getTime() === selDate.getTime();
    });
    
    const avgTemp = (selectedDayData.maxTemp + selectedDayData.minTemp) / 2;
    
    if (dayHourlyData.length === 0) {
      return {
        temperature: avgTemp,
        symbolCode: selectedDayData.symbolCode,
        humidity: 50,
        windSpeed: 0,
        feelsLike: avgTemp
      };
    }
    
    // Calculate averages from hourly data
    const avgHumidity = dayHourlyData.reduce((sum, h) => sum + (h.humidity || 50), 0) / dayHourlyData.length;
    const avgWindSpeed = dayHourlyData.reduce((sum, h) => sum + (h.windSpeed || 0), 0) / dayHourlyData.length;
    const feelsLike = calculateFeelsLike(avgTemp, avgWindSpeed, avgHumidity);
    
    return {
      temperature: avgTemp,
      symbolCode: selectedDayData.symbolCode,
      humidity: avgHumidity,
      windSpeed: avgWindSpeed,
      feelsLike
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="weather-card">
        <div className="loading-spinner">
          <svg className="spinner" viewBox="0 0 50 50">
            <circle className="spinner-path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
          </svg>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="weather-card">
        <div className="error-message">
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3>{t('errorTitle')}</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // No data state
  const selectedDayData = getSelectedDayData();
  if (!weatherData || !selectedDayData) {
    return (
      <div className="weather-card">
        <div className="error-message">
          <p>{t('noData')}</p>
        </div>
      </div>
    );
  }

  const weatherDescription = getWeatherDescription(selectedDayData.symbolCode, language);
  const dayLabel = getDayLabel(selectedDay);

  return (
    <div className="weather-card">
      <div className="card-layout">
        {/* Left Section */}
        <div className="card-left">
          {/* Location Header */}
          <div className="location-header">
            <svg className="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="location-info">
              <h2 className="location-name">{locationName}</h2>
              <span className="day-label-text">{dayLabel}</span>
            </div>
          </div>

          {/* Weather Main */}
          <div className="weather-main">
            {/* Left: Icon and Temperature */}
            <div className="weather-left-group">
              <img
                src={getWeatherIcon(selectedDayData.symbolCode)}
                alt="Weather icon"
                className="weather-icon"
                onError={(e) => {
                  e.target.src = `${import.meta.env.BASE_URL}assets/weatherIcons/lightmode/01d.svg`;
                }}
              />
              
              <div className="temp-section">
                <div className="temperature-display">
                  <span className="temp-value">{displayTemperature(selectedDayData.temperature)}</span>
                  <div className="temp-units">
                    <button
                      className={`unit-button ${!isFahrenheit ? 'active' : ''}`}
                      onClick={() => setIsFahrenheit(false)}
                    >
                      {t('celsius')}
                    </button>
                    <span className="unit-divider">|</span>
                    <button
                      className={`unit-button ${isFahrenheit ? 'active' : ''}`}
                      onClick={() => setIsFahrenheit(true)}
                    >
                      {t('fahrenheit')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Description and Details */}
            <div className="weather-right-group">
              {weatherDescription && (
                <div className="weather-description">
                  <p className="description-text">{weatherDescription}</p>
                </div>
              )}

              <div className="weather-details">
                <div className="detail-item">
                  <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{t('feelsLike')}: {displayTemperature(selectedDayData.feelsLike)}°</span>
                </div>

                <div className="detail-item">
                  <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <span>{t('humidity')}: {Math.round(selectedDayData.humidity)}{t('percent')}</span>
                </div>

                <div className="detail-item">
                  <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span>{t('windSpeed')}: {Math.round(selectedDayData.windSpeed)} {t('metersPerSecond')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="card-right">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="graph-container">
            <WeatherGraph 
              type={activeTab}
              hourlyData={weatherData.hourlyForecast}
              precipitationData={precipitationData}
              selectedDay={selectedDay}
            />
          </div>
        </div>
      </div>

      {/* Weekly Forecast */}
      {weatherData.dailyForecast?.length > 0 && (
        <WeeklyForecast
          dailyForecast={weatherData.dailyForecast}
          selectedDay={selectedDay}
          onDaySelect={onDaySelect}
          isFahrenheit={isFahrenheit}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default WeatherCard;