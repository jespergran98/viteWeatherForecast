// src/services/geocodingService.js

import ky from 'ky';

/**
 * Converts geographic coordinates to a human-readable location name
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<string>} Human-readable location name
 */
export const getLocationName = async (latitude, longitude) => {
  try {
    const data = await ky.get('https://nominatim.openstreetmap.org/reverse', {
      searchParams: {
        format: 'json',
        lat: latitude,
        lon: longitude,
        zoom: 10,
        'accept-language': 'en'
      },
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000,
      retry: {
        limit: 2,
        methods: ['get'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504]
      }
    }).json();

    const address = data.address || {};
    
    return address.city || 
           address.town || 
           address.village || 
           address.municipality ||
           address.county ||
           address.state ||
           'Unknown Location';
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Unknown Location';
  }
};