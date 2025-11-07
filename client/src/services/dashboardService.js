import { apiClient } from './api.js';

export const dashboardService = {
  getFeaturedNews: async (token) => {
    return await apiClient.get('/dashboard/featured-news', token);
  },
  getMaterials: async (token, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.chapter) params.append('chapter', filters.chapter);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/dashboard/materials?${queryString}` : '/dashboard/materials';
    
    return await apiClient.get(endpoint, token);
  },

  getStats: async (token) => {
    return await apiClient.get('/dashboard/stats', token);
  },

  getMaterialFilters: async (token) => {
    return await apiClient.get('/dashboard/material-filters', token);
  }
};