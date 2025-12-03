// src/services/weatherService.js

/**
 * Fetches weather forecast data from MET Norway's Locationforecast API
 * @param {number} latitude - Rounded to 4 decimal places
 * @param {number} longitude - Rounded to 4 decimal places
 * @returns {Promise<Object>} Weather data object
 */
export const getWeatherData = async (latitude, longitude) => {
  // Round coordinates to 4 decimal places as required by MET API
  const lat = parseFloat(latitude.toFixed(4));
  const lon = parseFloat(longitude.toFixed(4));

  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VaerVarsel/1.0 github.com/weather-app'
      }
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    return parseWeatherData(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Parses the MET Norway API response to extract current weather information
 * @param {Object} data - Raw API response
 * @returns {Object} Parsed weather data
 */
const parseWeatherData = (data) => {
  if (!data.properties || !data.properties.timeseries || data.properties.timeseries.length === 0) {
    throw new Error('Invalid weather data format');
  }

  // Get the first timeseries entry (current weather)
  const current = data.properties.timeseries[0];
  const instant = current.data.instant.details;
  
  // Get weather symbol from next_1_hours, next_6_hours, or next_12_hours
  const next1h = current.data.next_1_hours;
  const next6h = current.data.next_6_hours;
  const next12h = current.data.next_12_hours;

  // Prefer shorter time intervals for more accurate current conditions
  const symbolData = next1h || next6h || next12h;
  const symbolCode = symbolData?.summary?.symbol_code || 'clearsky_day';

  return {
    temperature: instant.air_temperature,
    symbolCode: symbolCode,
    humidity: instant.relative_humidity,
    windSpeed: instant.wind_speed,
    windDirection: instant.wind_from_direction,
    pressure: instant.air_pressure_at_sea_level,
    cloudiness: instant.cloud_area_fraction,
    updatedAt: new Date(current.time)
  };
};

/**
 * Determines if it's currently daytime based on time of day
 * Simple heuristic: 6 AM to 8 PM is day, otherwise night
 * @returns {boolean} true if daytime, false if nighttime
 */
export const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20;
};