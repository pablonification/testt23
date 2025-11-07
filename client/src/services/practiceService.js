import { apiClient } from './api';
import { authService } from './authService';

export const practiceService = {
  getSections: async () => {
    const token = authService.getToken();
    const response = await apiClient.get('/practice/sections', token);
    return response;
  },
  getCompletedNodes: async () => {
    const token = authService.getToken();
    const response = await apiClient.get('/practice/completed', token);
    return response;
  },

  getQuestions: async (sectionId, nodeId) => {
    const token = authService.getToken();
    const response = await apiClient.get(`/practice/questions/${sectionId}/${nodeId}`, token);
    return response;
  },

  completeNode: async (sectionId, nodeId, score = 100, timeSpent = 0) => {
    const token = authService.getToken();
    const response = await apiClient.post('/practice/complete',
      { sectionId, nodeId, score, timeSpent },
      token
    );

    if (response.success && response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  updateHearts: async (hearts) => {
    const token = authService.getToken();
    const response = await apiClient.put('/practice/hearts',
      { hearts },
      token
    );

    if (response.success && response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }
};