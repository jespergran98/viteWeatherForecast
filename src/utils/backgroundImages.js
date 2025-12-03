// src/utils/backgroundImages.js

/**
 * Gets the background image path based on temperature and weather symbol code
 * @param {number} temperature - Current temperature in Celsius
 * @param {string} symbolCode - Weather symbol code (e.g., 'clearsky_day', '45n')
 * @param {boolean} darkMode - Whether dark mode is active
 * @returns {string} Path to background image
 */
export const getBackgroundImage = (temperature, symbolCode, darkMode) => {
  if (!symbolCode || temperature === null || temperature === undefined) {
    return '/assets/heroBackgrounds/placeholder.jpg';
  }

  // Determine temperature folder (plus or minus)
  const tempFolder = temperature >= 0 ? 'plus' : 'minus';

  // Icon mapping for background images (same as weather icons)
  const iconMap = {
    'clearsky': '01',
    'fair': '02',
    'partlycloudy': '03',
    'cloudy': '04',
    'rainshowers': '05',
    'rainshowersandthunder': '06',
    'sleetshowers': '07',
    'snowshowers': '08',
    'rain': '09',
    'heavyrain': '10',
    'heavyrainandthunder': '11',
    'sleet': '12',
    'snow': '13',
    'snowandthunder': '14',
    'fog': '15',
    'sleetshowersandthunder': '20',
    'snowshowersandthunder': '21',
    'rainandthunder': '22',
    'sleetandthunder': '23',
    'lightrainshowersandthunder': '24',
    'heavyrainshowersandthunder': '25',
    'lightsleetshowersandthunder': '26',
    'heavysleetshowersandthunder': '27',
    'lightsnowshowersandthunder': '28',
    'heavysnowshowersandthunder': '29',
    'lightrainandthunder': '30',
    'lightsleetandthunder': '31',
    'heavysleetandthunder': '32',
    'lightsnowandthunder': '33',
    'heavysnowandthunder': '34',
    'lightrainshowers': '40',
    'heavyrainshowers': '41',
    'lightsleetshowers': '42',
    'heavysleetshowers': '43',
    'lightsnowshowers': '44',
    'heavysnowshowers': '45',
    'lightrain': '46',
    'lightsleet': '47',
    'heavysleet': '48',
    'lightsnow': '49',
    'heavysnow': '50'
  };

  // Icons that have time variants (day/night/polartwilight)
  const iconsWithTimeVariants = [
    '01', '02', '03', '05', '06', '07', '08', 
    '24', '25', '26', '27', '28', '29', 
    '40', '41', '42', '43', '44', '45'
  ];

  let weatherType;
  let timeVariant;

  // Parse symbol code
  if (symbolCode.includes('_')) {
    const parts = symbolCode.split('_');
    timeVariant = parts[parts.length - 1];
    weatherType = parts.slice(0, -1).join('_');
  } else {
    weatherType = symbolCode;
    timeVariant = null;
  }

  const iconNumber = iconMap[weatherType] || '01';

  // Determine time variant for backgrounds
  if (iconsWithTimeVariants.includes(iconNumber)) {
    let variant = 'd';

    if (timeVariant === 'night') {
      variant = 'n';
    } else if (timeVariant === 'polartwilight') {
      variant = 'm';
    } else if (!timeVariant) {
      // Determine based on current time
      const hour = new Date().getHours();
      variant = (hour >= 6 && hour < 20) ? 'd' : 'n';
    }

    return `/assets/heroBackgrounds/${tempFolder}/${iconNumber}${variant}.webp`;
  } else {
    // Icons without time variants
    return `/assets/heroBackgrounds/${tempFolder}/${iconNumber}.webp`;
  }
};