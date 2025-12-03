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
 * Parses the MET Norway API response to extract current weather, hourly forecast, and daily forecast
 * @param {Object} data - Raw API response
 * @returns {Object} Parsed weather data with current conditions, hourly and daily forecasts
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

  // Parse hourly forecast data (all available hours)
  const hourlyForecast = timeseries.map(entry => {
    const time = new Date(entry.time);
    const details = entry.data.instant.details;
    const precipitation = entry.data.next_1_hours?.details?.precipitation_amount || 0;
    
    // Get symbol code for this hour
    const hourSymbolData = entry.data.next_1_hours || entry.data.next_6_hours || entry.data.next_12_hours;
    const hourSymbolCode = hourSymbolData?.summary?.symbol_code || 'clearsky_day';

    return {
      time: time,
      temperature: details.air_temperature,
      windSpeed: details.wind_speed,
      precipitation: precipitation,
      symbolCode: hourSymbolCode,
      hour: time.getHours(),
      date: time.toDateString()
    };
  });

  // Parse 7-day forecast
  const dailyForecast = parseDailyForecast(timeseries);

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
    hourlyForecast: hourlyForecast,
    dailyForecast: dailyForecast
  };

  // Add feels like temperature if available
  if (instant.air_temperature_percentile_10 !== undefined) {
    weatherData.feelsLike = instant.air_temperature_percentile_10;
  } else if (instant.air_temperature_percentile_90 !== undefined) {
    weatherData.feelsLike = instant.air_temperature_percentile_90;
  }

  return weatherData;
};

/**
 * Parses daily forecast from hourly timeseries data
 * @param {Array} timeseries - Raw timeseries data
 * @returns {Array} Array of daily forecast objects
 */
const parseDailyForecast = (timeseries) => {
  const dailyData = {};
  
  timeseries.forEach(entry => {
    const time = new Date(entry.time);
    const dateKey = time.toDateString();
    const details = entry.data.instant.details;
    
    // Get symbol code (prefer next_6_hours for daily overview)
    const symbolData = entry.data.next_6_hours || entry.data.next_12_hours || entry.data.next_1_hours;
    const symbolCode = symbolData?.summary?.symbol_code || 'clearsky_day';
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: time,
        temperatures: [],
        symbolCodes: [],
        precipitations: []
      };
    }
    
    dailyData[dateKey].temperatures.push(details.air_temperature);
    dailyData[dateKey].symbolCodes.push(symbolCode);
    
    const precipitation = entry.data.next_1_hours?.details?.precipitation_amount || 
                         entry.data.next_6_hours?.details?.precipitation_amount || 0;
    dailyData[dateKey].precipitations.push(precipitation);
  });
  
  // Convert to array and calculate min/max for each day
  const dailyForecast = Object.keys(dailyData).slice(0, 8).map(dateKey => {
    const dayData = dailyData[dateKey];
    const temps = dayData.temperatures;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    
    // Choose the most common symbol code for the day (mode)
    const symbolCode = getMostFrequent(dayData.symbolCodes);
    
    return {
      date: dayData.date,
      maxTemp: maxTemp,
      minTemp: minTemp,
      symbolCode: symbolCode,
      totalPrecipitation: dayData.precipitations.reduce((a, b) => a + b, 0)
    };
  });
  
  return dailyForecast;
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