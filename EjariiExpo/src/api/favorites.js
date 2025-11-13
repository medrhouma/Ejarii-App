import axios from './axios';
import { ENDPOINTS } from '../constants/api';

export const favoritesAPI = {
  getAll: async () => {
    const response = await axios.get(ENDPOINTS.FAVORITES);
    return response.data;
  },

  add: async (propertyId) => {
    const response = await axios.post(`${ENDPOINTS.FAVORITES}/${propertyId}`);
    return response.data;
  },

  remove: async (propertyId) => {
    const response = await axios.delete(`${ENDPOINTS.FAVORITES}/${propertyId}`);
    return response.data;
  },

  check: async (propertyId) => {
    const response = await axios.get(`${ENDPOINTS.FAVORITES}/check/${propertyId}`);
    return response.data;
  },
};