// src/services/nowcastService.js

import ky from 'ky';

const NOWCAST_API_BASE = 'https://api.met.no/weatherapi/nowcast/2.0/complete';
const USER_AGENT = 'VaerVarsel/1.0 github.com/weather-app';

/**
 * Fetches precipitation nowcast data from MET Norway's Nowcast API
 * Provides minute-by-minute precipitation forecast for the next 2 hours
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Array>} Array of precipitation data points
 * @throws {Error} When API request fails
 */
export const getNowcastData = async (latitude, longitude) => {
  const lat = parseFloat(latitude.toFixed(4));
  const lon = parseFloat(longitude.toFixed(4));

  try {
    const data = await ky.get(NOWCAST_API_BASE, {
      searchParams: {
        lat,
        lon
      },
      headers: {
        'User-Agent': USER_AGENT
      },
      timeout: 15000,
      retry: {
        limit: 3,
        methods: ['get'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504]
      }
    }).json();

    return parseNowcastData(data);
  } catch (error) {
    console.error('Error fetching nowcast data:', error);
    throw error;
  }
};

/**
 * Parses nowcast API response to extract precipitation data
 * @param {Object} data - Raw API response
 * @returns {Array} Array of {time, precipitation, hour, minute} objects
 * @throws {Error} When data format is invalid
 */
const parseNowcastData = (data) => {
  if (!data.properties || !data.properties.timeseries) {
    throw new Error('Invalid nowcast data format');
  }

  const timeseries = data.properties.timeseries;
  const precipitationData = [];

  timeseries.forEach(entry => {
    const time = new Date(entry.time);
    
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