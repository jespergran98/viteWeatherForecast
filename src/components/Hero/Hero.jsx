// src/components/Hero/Hero.jsx
import React, { useState, useEffect } from 'react';
import WeatherCard from '../WeatherCard/WeatherCard';
import SideMenu from '../SideMenu/SideMenu';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';
import { getUserLocation } from '../../services/locationService';
import { getWeatherData } from '../../services/weatherService';
import { getLocationName } from '../../services/geocodingService';
import { getNowcastData } from '../../services/nowcastService';
import { getBackgroundImage } from '../../utils/backgroundImages';
import './Hero.css';

const Hero = ({ darkMode, setDarkMode }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [precipitationData, setPrecipitationData] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState('/assets/heroBackgrounds/placeholder.jpg');
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const { language } = useLanguage();

  const t = (key) => getTranslation(language, key);

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

      // Set background based on current weather (today)
      const bgImage = getBackgroundImage(
        weather.temperature,
        weather.symbolCode,
        darkMode
      );
      setBackgroundImage(bgImage);

      // Reset selected day to today on refresh
      setSelectedDay(new Date());

      // Fetch nowcast data
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
      // Only set placeholder if no current background exists
      if (!backgroundImage || backgroundImage === '/assets/heroBackgrounds/placeholder.jpg') {
        setBackgroundImage('/assets/heroBackgrounds/placeholder.jpg');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchWeatherData();
    }
  }, [refreshTrigger]);

  // Update background when dark mode changes OR selected day changes
  useEffect(() => {
    if (weatherData) {
      updateBackgroundForSelectedDay();
    }
  }, [darkMode, weatherData, selectedDay]);

  // Function to update background based on selected day
  const updateBackgroundForSelectedDay = () => {
    if (!weatherData) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(selectedDay);
    compareDate.setHours(0, 0, 0, 0);
    
    const isToday = today.getTime() === compareDate.getTime();

    if (isToday) {
      // Use current weather data for today
      const bgImage = getBackgroundImage(
        weatherData.temperature,
        weatherData.symbolCode,
        darkMode
      );
      setBackgroundImage(bgImage);
    } else {
      // Find the matching day in dailyForecast
      const selectedDayData = weatherData.dailyForecast?.find(day => {
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
        return dayDate.getTime() === compareDate.getTime();
      });

      if (selectedDayData) {
        // Use average temperature for the selected day
        const avgTemp = (selectedDayData.maxTemp + selectedDayData.minTemp) / 2;
        const bgImage = getBackgroundImage(
          avgTemp,
          selectedDayData.symbolCode,
          darkMode
        );
        setBackgroundImage(bgImage);
      }
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMenuToggle = () => {
    setMenuOpen(prev => !prev);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  const handleDaySelect = (date) => {
    setSelectedDay(date);
  };

  return (
    <div className="hero-container">
      {/* Hero Background */}
      <div 
        className="hero-background"
        style={{
          backgroundImage: `linear-gradient(var(--color-bg-overlay), var(--color-bg-overlay)), url('${backgroundImage}')`
        }}
      >
        
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="navbar-content">
            {/* Logo Section */}
            <div className="logo-section">
              <div className="logo-icon">
                <img src="/assets/logo/logo.png" alt={`${t('appName')} Logo`} />
              </div>
              <span className="logo-text">{t('appName')}</span>
            </div>

            {/* Action Buttons */}
            <div className="nav-actions">
              {/* Refresh Button */}
              <button 
                className="nav-btn" 
                onClick={handleRefresh}
                aria-label={t('refresh')}
                disabled={loading}
              >
                <svg 
                  className={`icon refresh-icon ${loading ? 'spinning' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </button>

              {/* Dark Mode Toggle */}
              <button 
                className="nav-btn" 
                onClick={() => setDarkMode(!darkMode)}
                aria-label={t('toggleDarkMode')}
              >
                {darkMode ? (
                  <svg 
                    className="icon" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                    />
                  </svg>
                ) : (
                  <svg 
                    className="icon" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                    />
                  </svg>
                )}
              </button>

              {/* Hamburger Menu */}
              <button 
                className="nav-btn" 
                onClick={handleMenuToggle}
                aria-label={t('menu')}
              >
                <svg 
                  className="icon" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Glass Card Container */}
        <div className="hero-content">
          <div className="glass-card">
            <div className="card-inner">
              <WeatherCard 
                darkMode={darkMode}
                weatherData={weatherData}
                locationName={locationName}
                precipitationData={precipitationData}
                loading={loading}
                error={error}
                selectedDay={selectedDay}
                onDaySelect={handleDaySelect}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Side Menu */}
      <SideMenu isOpen={menuOpen} onClose={handleMenuClose} />
    </div>
  );
};

export default Hero;