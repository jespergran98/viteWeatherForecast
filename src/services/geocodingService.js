// src/services/geocodingService.js

/**
 * Converts geographic coordinates to a human-readable location name
 */
export const getLocationName = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location name');
    }

    const data = await response.json();
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