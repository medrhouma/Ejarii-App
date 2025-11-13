// Pour navigateur web (localhost)
export const API_URL = 'http://localhost:5000/api';

// Pour téléphone Android via Expo Go
// export const API_URL = 'http://192.168.1.15:5000/api'; // Remplacez par votre IP

// Pour téléphone iOS via Expo Go
// export const API_URL = 'http://192.168.1.15:5000/api';

export const ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  UPDATE_PROFILE: '/auth/update-profile',
  PROPERTIES: '/properties',
  MY_PROPERTIES: '/properties/user/my-properties',
  FAVORITES: '/favorites',
  MESSAGES: '/messages',
  CONVERSATIONS: '/messages/conversations',
};