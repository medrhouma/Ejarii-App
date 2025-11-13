import axios from './axios';
import { ENDPOINTS } from '../constants/api';

export const messagesAPI = {
  send: async (messageData) => {
    const response = await axios.post(ENDPOINTS.MESSAGES, messageData);
    return response.data;
  },

  getConversations: async () => {
    const response = await axios.get(ENDPOINTS.CONVERSATIONS);
    return response.data;
  },

  getMessages: async (userId) => {
    const response = await axios.get(`${ENDPOINTS.MESSAGES}/${userId}`);
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await axios.put(`${ENDPOINTS.MESSAGES}/${messageId}/read`);
    return response.data;
  },
};