// src/services/nowcastService.js

/**
 * Fetches precipitation nowcast data from MET Norway's Nowcast API
 * Provides minute-by-minute precipitation forecast for the next 2 hours
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Array>} Array of precipitation data points
 */
export const getNowcastData = async (latitude, longitude) => {
  const lat = parseFloat(latitude.toFixed(4));
  const lon = parseFloat(longitude.toFixed(4));

  const url = `https://api.met.no/weatherapi/nowcast/2.0/complete?lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VaerVarsel/1.0 github.com/weather-app'
      }
    });

    if (!response.ok) {
      throw new Error(`Nowcast API error: ${response.status}`);
    }

    const data = await response.json();
    return parseNowcastData(data);
  } catch (error) {
    console.error('Error fetching nowcast data:', error);
    throw error;
  }
};

/**
 * Parses nowcast API response to extract precipitation data
 * @param {Object} data - Raw API response
 * @returns {Array} Array of {time, precipitation} objects
 */
const parseNowcastData = (data) => {
  if (!data.properties || !data.properties.timeseries) {
    throw new Error('Invalid nowcast data format');
  }

  const timeseries = data.properties.timeseries;
  const precipitationData = [];

  timeseries.forEach(entry => {
    const time = new Date(entry.time);
    const details = entry.data.instant.details;
    
    // Get precipitation from next_1_hours if available
    const precipitation = entry.data.next_1_hours?.details?.precipitation_amount || 0;

    precipitationData.push({
      time: time,
      precipitation: precipitation,
      hour: time.getHours(),
      minute: time.getMinutes()
    });
  });

  return precipitationData;
};