import axios from './axios';
import { ENDPOINTS } from '../constants/api';

export const propertiesAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `${ENDPOINTS.PROPERTIES}?${params}` : ENDPOINTS.PROPERTIES;
    const response = await axios.get(url);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${ENDPOINTS.PROPERTIES}/${id}`);
    return response.data;
  },

  create: async (propertyData) => {
    const response = await axios.post(ENDPOINTS.PROPERTIES, propertyData);
    return response.data;
  },

  update: async (id, propertyData) => {
    const response = await axios.put(`${ENDPOINTS.PROPERTIES}/${id}`, propertyData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${ENDPOINTS.PROPERTIES}/${id}`);
    return response.data;
  },

  getMyProperties: async () => {
    const response = await axios.get(ENDPOINTS.MY_PROPERTIES);
    return response.data;
  },
};