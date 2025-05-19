// Base API URL - använder relativ URL för att fungera med Vite proxy
export const API_BASE_URL = '/api';

// API URL för direkt anslutning (används för debugging)
export const DIRECT_API_URL = (() => {
  if (window.location.hostname.includes('replit')) {
    return `https://${window.location.hostname.replace('00-', '')}/api`;
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
})();

// Andra konfigurationsvariabler kan läggas till här
