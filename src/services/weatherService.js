// src/services/weatherService.js

import ky from 'ky';

const WEATHER_API_BASE = 'https://api.met.no/weatherapi';
const USER_AGENT = 'VaerVarsel/1.0 github.com/weather-app';

/**
 * Unified ky instance for MET Norway API with shared configuration
 */
const weatherAPI = ky.create({
  prefixUrl: WEATHER_API_BASE,
  headers: {
    'User-Agent': USER_AGENT
  },
  timeout: 15000,
  retry: {
    limit: 3,
    methods: ['get'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504]
  }
});

/**
 * Unified fetch helper for MET Norway API
 * @param {string} endpoint - API endpoint path
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} When API request fails
 */
const fetchWeatherAPI = async (endpoint, latitude, longitude) => {
  const lat = parseFloat(latitude.toFixed(4));
  const lon = parseFloat(longitude.toFixed(4));

  try {
    return await weatherAPI.get(endpoint, {
      searchParams: { lat, lon }
    }).json();
  } catch (error) {
    console.error(`Weather API error for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Fetches weather forecast data from MET Norway's Locationforecast API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Parsed weather data
 * @throws {Error} When API request or parsing fails
 */
export const getWeatherData = async (latitude, longitude) => {
  try {
    const data = await fetchWeatherAPI('locationforecast/2.0/compact', latitude, longitude);
    return parseWeatherData(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Fetches precipitation nowcast data from MET Norway's Nowcast API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Array>} Array of precipitation data points
 * @throws {Error} When API request or parsing fails
 */
export const getNowcastData = async (latitude, longitude) => {
  try {
    const data = await fetchWeatherAPI('nowcast/2.0/complete', latitude, longitude);
    return parseNowcastData(data);
  } catch (error) {
    console.error('Error fetching nowcast data:', error);
    throw error;
  }
};

/**
 * Parses the MET Norway API response to extract weather data
 * @param {Object} data - Raw API response
 * @returns {Object} Structured weather data with current conditions and forecasts
 * @throws {Error} When data format is invalid
 */
const parseWeatherData = (data) => {
  const timeseries = data?.properties?.timeseries;
  if (!timeseries?.length) {
    throw new Error('Invalid weather data format');
  }

  const current = timeseries[0];
  const instant = current.data.instant.details;
  const symbolData = current.data.next_1_hours || current.data.next_6_hours || current.data.next_12_hours;

  // Parse hourly forecast - includes temperature, wind, humidity, precipitation
  const hourlyForecast = timeseries.map(entry => {
    const time = new Date(entry.time);
    const details = entry.data.instant.details;
    const hourSymbolData = entry.data.next_1_hours || entry.data.next_6_hours || entry.data.next_12_hours;

    return {
      time,
      temperature: details.air_temperature,
      windSpeed: details.wind_speed,
      humidity: details.relative_humidity,
      precipitation: entry.data.next_1_hours?.details?.precipitation_amount || 0,
      symbolCode: hourSymbolData?.summary?.symbol_code || 'clearsky_day',
      hour: time.getHours(),
      date: time.toDateString()
    };
  });

  const dailyForecast = parseDailyForecast(timeseries);

  return {
    temperature: instant.air_temperature,
    symbolCode: symbolData?.summary?.symbol_code || 'clearsky_day',
    humidity: instant.relative_humidity,
    windSpeed: instant.wind_speed,
    windDirection: instant.wind_from_direction,
    pressure: instant.air_pressure_at_sea_level,
    cloudiness: instant.cloud_area_fraction,
    updatedAt: new Date(current.time),
    feelsLike: instant.air_temperature_percentile_10 ?? instant.air_temperature_percentile_90,
    hourlyForecast,
    dailyForecast
  };
};

/**
 * Parses daily forecast from hourly timeseries data
 * @param {Array} timeseries - Array of hourly forecast entries
 * @returns {Array} Array of daily forecast objects
 */
const parseDailyForecast = (timeseries) => {
  const dailyData = {};
  
  timeseries.forEach(entry => {
    const time = new Date(entry.time);
    const dateKey = time.toDateString();
    const details = entry.data.instant.details;
    const symbolData = entry.data.next_6_hours || entry.data.next_12_hours || entry.data.next_1_hours;
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: time,
        temperatures: [],
        symbolCodes: [],
        precipitations: []
      };
    }
    
    dailyData[dateKey].temperatures.push(details.air_temperature);
    dailyData[dateKey].symbolCodes.push(symbolData?.summary?.symbol_code || 'clearsky_day');
    
    const precipitation = entry.data.next_1_hours?.details?.precipitation_amount || 
                         entry.data.next_6_hours?.details?.precipitation_amount || 0;
    dailyData[dateKey].precipitations.push(precipitation);
  });
  
  return Object.values(dailyData).slice(0, 8).map(dayData => {
    const temps = dayData.temperatures;
    return {
      date: dayData.date,
      maxTemp: Math.max(...temps),
      minTemp: Math.min(...temps),
      symbolCode: getMostFrequent(dayData.symbolCodes),
      totalPrecipitation: dayData.precipitations.reduce((a, b) => a + b, 0)
    };
  });
};

/**
 * Parses nowcast API response to extract precipitation data
 * @param {Object} data - Raw API response
 * @returns {Array} Array of precipitation data points
 * @throws {Error} When data format is invalid
 */
const parseNowcastData = (data) => {
  const timeseries = data?.properties?.timeseries;
  if (!timeseries) {
    throw new Error('Invalid nowcast data format');
  }

  return timeseries.map(entry => {
    const time = new Date(entry.time);
    return {
      time,
      precipitation: entry.data.next_1_hours?.details?.precipitation_amount || 0,
      hour: time.getHours(),
      minute: time.getMinutes()
    };
  });
};

/**
 * Gets the most frequently occurring item in an array
 * @param {Array} arr - Array of items
 * @returns {*} Most frequent item
 */
const getMostFrequent = (arr) => {
  const frequency = {};
  let maxCount = 0;
  let mostFrequent = arr[0];
  
  arr.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
    if (frequency[item] > maxCount) {
      maxCount = frequency[item];
      mostFrequent = item;
    }
  });
  
  return mostFrequent;
};

/**
 * Converts Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export const celsiusToFahrenheit = (celsius) => (celsius * 9/5) + 32;

/**
 * Determines if it's currently daytime based on time of day
 * @returns {boolean} True if daytime (6 AM - 8 PM), false otherwise
 */
export const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20;
};