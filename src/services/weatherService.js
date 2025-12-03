// src/services/weatherService.js

/**
 * Fetches weather forecast data from MET Norway's Locationforecast API
 * @param {number} latitude - Rounded to 4 decimal places
 * @param {number} longitude - Rounded to 4 decimal places
 * @returns {Promise<Object>} Weather data object
 */
export const getWeatherData = async (latitude, longitude) => {
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
 * Parses the MET Norway API response to extract current weather and forecast
 * @param {Object} data - Raw API response
 * @returns {Object} Parsed weather data with current conditions and 24h forecast
 */
const parseWeatherData = (data) => {
  if (!data.properties || !data.properties.timeseries || data.properties.timeseries.length === 0) {
    throw new Error('Invalid weather data format');
  }

  const timeseries = data.properties.timeseries;
  
  // Get current weather (first entry)
  const current = timeseries[0];
  const instant = current.data.instant.details;
  
  const next1h = current.data.next_1_hours;
  const next6h = current.data.next_6_hours;
  const next12h = current.data.next_12_hours;

  const symbolData = next1h || next6h || next12h;
  const symbolCode = symbolData?.summary?.symbol_code || 'clearsky_day';

  // Parse 24-hour forecast data
  const forecast24h = timeseries.slice(0, 25).map(entry => {
    const time = new Date(entry.time);
    const details = entry.data.instant.details;
    const precipitation = entry.data.next_1_hours?.details?.precipitation_amount || 0;

    return {
      time: time,
      temperature: details.air_temperature,
      windSpeed: details.wind_speed,
      precipitation: precipitation,
      hour: time.getHours()
    };
  });

  // Build the weather object
  const weatherData = {
    temperature: instant.air_temperature,
    symbolCode: symbolCode,
    humidity: instant.relative_humidity,
    windSpeed: instant.wind_speed,
    windDirection: instant.wind_from_direction,
    pressure: instant.air_pressure_at_sea_level,
    cloudiness: instant.cloud_area_fraction,
    updatedAt: new Date(current.time),
    forecast24h: forecast24h
  };

  // Add feels like temperature if available in the API
  // The MET API may include percentile temperatures which can be used as "feels like"
  if (instant.air_temperature_percentile_10 !== undefined) {
    weatherData.feelsLike = instant.air_temperature_percentile_10;
  } else if (instant.air_temperature_percentile_90 !== undefined) {
    weatherData.feelsLike = instant.air_temperature_percentile_90;
  }
  // Note: The MET API doesn't typically include a direct "feels like" value
  // If these percentiles aren't available, we simply don't include feels like

  return weatherData;
};

/**
 * Determines if it's currently daytime based on time of day
 * @returns {boolean} true if daytime, false if nighttime
 */
export const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20;
};

/**
 * Converts Celsius to Fahrenheit
 * @param {number} celsius 
 * @returns {number} Temperature in Fahrenheit
 */
export const celsiusToFahrenheit = (celsius) => {
  return (celsius * 9/5) + 32;
};