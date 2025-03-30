// API Configuration
export const API_BASE_URL = 'https://api.treasurehunter.com';
export const API_TIMEOUT = 10000; // 10 seconds

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PASSWORD_RESET: '/auth/password-reset',
  },
  LISTINGS: {
    GET_ALL: '/listings',
    GET_ONE: '/listings/:id',
    CREATE: '/listings',
    UPDATE: '/listings/:id',
    DELETE: '/listings/:id',
    MERCHANT: '/listings/merchant',
  },
  DISCOVERY: {
    GET_ITEMS: '/discovery',
    INTERACTION: '/discovery/interaction',
  },
  // Add other endpoints here
};
