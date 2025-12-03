// src/utils/translations.js

export const translations = {
  no: {
    // App name
    appName: 'VærVarsel',
    
    // Navigation
    refresh: 'Oppdater været',
    toggleDarkMode: 'Veksle mørk modus',
    menu: 'Meny',
    
    // Tabs
    temperature: 'Temperatur',
    precipitation: 'Nedbør',
    wind: 'Vind',
    
    // Weather details
    humidity: 'Fuktighet',
    windSpeed: 'Vindhastighet',
    feelsLike: 'Føles som',
    
    // Loading and errors
    loading: 'Laster værdata...',
    errorTitle: 'Kan ikke laste værdata',
    noData: 'Ingen data tilgjengelig',
    
    // Menu
    language: 'Språk',
    norwegian: 'Norsk',
    nynorsk: 'Nynorsk',
    english: 'Engelsk',
    
    // Days of week (abbreviated)
    days: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
    today: 'I dag',
    
    // Units
    celsius: '°C',
    fahrenheit: '°F',
    metersPerSecond: 'm/s',
    millimeters: 'mm',
    percent: '%'
  },
  
  nn: {
    // App name
    appName: 'VêrVarsel',
    
    // Navigation
    refresh: 'Oppdater vêret',
    toggleDarkMode: 'Veksle mørk modus',
    menu: 'Meny',
    
    // Tabs
    temperature: 'Temperatur',
    precipitation: 'Nedbør',
    wind: 'Vind',
    
    // Weather details
    humidity: 'Fukt',
    windSpeed: 'Vindhastigheit',
    feelsLike: 'Kjenst som',
    
    // Loading and errors
    loading: 'Lastar vêrdata...',
    errorTitle: 'Kan ikkje laste vêrdata',
    noData: 'Ingen data tilgjengeleg',
    
    // Menu
    language: 'Språk',
    norwegian: 'Norsk',
    nynorsk: 'Nynorsk',
    english: 'Engelsk',
    
    // Days of week (abbreviated)
    days: ['Søn', 'Mån', 'Tys', 'Ons', 'Tor', 'Fre', 'Lau'],
    today: 'I dag',
    
    // Units
    celsius: '°C',
    fahrenheit: '°F',
    metersPerSecond: 'm/s',
    millimeters: 'mm',
    percent: '%'
  },
  
  en: {
    // App name
    appName: 'WeatherForecast',
    
    // Navigation
    refresh: 'Refresh weather',
    toggleDarkMode: 'Toggle dark mode',
    menu: 'Menu',
    
    // Tabs
    temperature: 'Temperature',
    precipitation: 'Precipitation',
    wind: 'Wind',
    
    // Weather details
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    feelsLike: 'Feels like',
    
    // Loading and errors
    loading: 'Loading weather data...',
    errorTitle: 'Unable to load weather',
    noData: 'No data available',
    
    // Menu
    language: 'Language',
    norwegian: 'Norwegian',
    nynorsk: 'Nynorsk',
    english: 'English',
    
    // Days of week (abbreviated)
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    today: 'Today',
    
    // Units
    celsius: '°C',
    fahrenheit: '°F',
    metersPerSecond: 'm/s',
    millimeters: 'mm',
    percent: '%'
  }
};

export const getTranslation = (language, key) => {
  return translations[language]?.[key] || translations['no'][key] || key;
};