import { ENDPOINTS } from '../constants/api';
import axios from './axios';

export const authAPI = {
  register: async (userData) => {
    const response = await axios.post(ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axios.post(ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await axios.get(ENDPOINTS.ME);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await axios.put(ENDPOINTS.UPDATE_PROFILE, profileData);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post(ENDPOINTS.LOGOUT);
    return response.data;
  },
};