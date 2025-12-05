// src/services/locationService.js

const ERROR_MESSAGES = {
  1: 'Location permission denied. Please enable location access.',
  2: 'Location information is unavailable.',
  3: 'Location request timed out.'
};

/**
 * Gets the user's current geographic location using the browser's Geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>} User's coordinates
 * @throws {Error} When geolocation fails or is not supported
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }),
      (error) => reject(new Error(ERROR_MESSAGES[error.code] || 'An unknown error occurred.')),
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
};