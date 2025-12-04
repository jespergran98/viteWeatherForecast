// src/components/WeeklyForecast/WeeklyForecast.jsx
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';
import { celsiusToFahrenheit } from '../../services/weatherService';
import './WeeklyForecast.css';

const WeeklyForecast = ({ dailyForecast, selectedDay, onDaySelect, isFahrenheit, darkMode }) => {
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);
  const days = t('days');

  const displayTemperature = (temp) => {
    return isFahrenheit 
      ? Math.round(celsiusToFahrenheit(temp))
      : Math.round(temp);
  };

const getWeatherIcon = (symbolCode) => {
  const BASE_URL = import.meta.env.BASE_URL;
  
  if (!symbolCode) return null;

    const iconMap = {
      'clearsky': '01',
      'fair': '02',
      'partlycloudy': '03',
      'cloudy': '04',
      'rainshowers': '05',
      'rainshowersandthunder': '06',
      'sleetshowers': '07',
      'snowshowers': '08',
      'rain': '09',
      'heavyrain': '10',
      'heavyrainandthunder': '11',
      'sleet': '12',
      'snow': '13',
      'snowandthunder': '14',
      'fog': '15',
      'sleetshowersandthunder': '20',
      'snowshowersandthunder': '21',
      'rainandthunder': '22',
      'sleetandthunder': '23',
      'lightrainshowersandthunder': '24',
      'heavyrainshowersandthunder': '25',
      'lightsleetshowersandthunder': '26',
      'heavysleetshowersandthunder': '27',
      'lightsnowshowersandthunder': '28',
      'heavysnowshowersandthunder': '29',
      'lightrainandthunder': '30',
      'lightsleetandthunder': '31',
      'heavysleetandthunder': '32',
      'lightsnowandthunder': '33',
      'heavysnowandthunder': '34',
      'lightrainshowers': '40',
      'heavyrainshowers': '41',
      'lightsleetshowers': '42',
      'heavysleetshowers': '43',
      'lightsnowshowers': '44',
      'heavysnowshowers': '45',
      'lightrain': '46',
      'lightsleet': '47',
      'heavysleet': '48',
      'lightsnow': '49',
      'heavysnow': '50'
    };

  const iconsWithTimeVariants = ['01', '02', '03', '05', '06', '07', '08', '24', '25', '26', '27', '28', '29', '40', '41', '42', '43', '44', '45'];

  let weatherType;
  if (symbolCode.includes('_')) {
    const parts = symbolCode.split('_');
    weatherType = parts.slice(0, -1).join('_');
  } else {
    weatherType = symbolCode;
  }

  const iconNumber = iconMap[weatherType] || '01';
  
  if (iconsWithTimeVariants.includes(iconNumber)) {
    const theme = darkMode ? 'darkmode' : 'lightmode';
    return `${BASE_URL}public/assets/weatherIcons/${theme}/${iconNumber}d.svg`;
  } else {
    const theme = darkMode ? 'darkmode' : 'lightmode';
    return `${BASE_URL}public/assets/weatherIcons/${theme}/${iconNumber}.svg`;
  }
};

  const getDayLabel = (date, index) => {
    if (index === 0) return t('today');
    const dayOfWeek = date.getDay();
    return days[dayOfWeek];
  };

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  return (
    <div className="weekly-forecast">
      <div className="forecast-scroll">
        {dailyForecast.map((day, index) => {
          const isSelected = isSameDay(day.date, selectedDay);
          
          return (
            <button
              key={day.date.toISOString()}
              className={`day-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onDaySelect(day.date)}
            >
              <div className="day-label">{getDayLabel(day.date, index)}</div>
              
              <div className="day-icon-wrapper">
                <img
                  src={getWeatherIcon(day.symbolCode)}
                  alt="Weather icon"
                  className="day-icon"
                  onError={(e) => {
                    e.target.src = `${import.meta.env.BASE_URL}public/assets/weatherIcons/lightmode/01d.svg`;
                  }}
                />
              </div>
              
              <div className="day-temps">
                <span className="temp-max">{displayTemperature(day.maxTemp)}°</span>
                <span className="temp-min">{displayTemperature(day.minTemp)}°</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyForecast;