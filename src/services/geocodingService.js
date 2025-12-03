// src/services/geocodingService.js

/**
 * Converts geographic coordinates to a human-readable location name
 * Uses OpenStreetMap's Nominatim reverse geocoding service
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>}
 */
export const getLocationName = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location name');
    }

    const data = await response.json();
    
    // Extract city/town/village name, fallback to other administrative levels
    const locationName = 
      data.address?.city || 
      data.address?.town || 
      data.address?.village || 
      data.address?.municipality ||
      data.address?.county ||
      data.address?.state ||
      'Unknown Location';

    return locationName;
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Unknown Location';
  }
};