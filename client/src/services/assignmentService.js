import { apiClient } from './api';
import { authService } from './authService';

export const assignmentService = {
  getAssignments: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await apiClient.get('/assignments', token);
      return response;
    } catch (error) {
      console.error('Get assignments error:', error);
      return { success: false, error: error.message };
    }
  },

  getAssignmentDetails: async (id) => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await apiClient.get(`/assignments/${id}`, token);
      return response;
    } catch (error) {
      console.error('Get assignment details error:', error);
      return { success: false, error: error.message };
    }
  },

  uploadFile: async (file) => {
    try {
      console.log('📤 Starting file upload via backend...');
      console.log('📄 File:', file.name, 'Size:', file.size);

      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          error: 'Not authenticated. Please login again.' 
        };
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('🔑 Uploading with token:', token.substring(0, 20) + '...');

      const response = await fetch('http://localhost:5000/api/assignments/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('❌ Upload failed:', result);
        return { 
          success: false, 
          error: result.error || 'Failed to upload file'
        };
      }

      console.log('✅ File uploaded successfully:', result);

      return { 
        success: true, 
        fileUrl: result.fileUrl,
        fileName: result.fileName
      };
    } catch (error) {
      console.error('❌ Upload file error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to upload file'
      };
    }
  },

  submitAssignment: async (assignmentId, fileUrl, fileName, submissionText) => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await apiClient.post('/assignments/submit', 
        { 
          assignmentId, 
          fileUrl, 
          fileName,
          submissionText 
        }, 
        token
      );
      return response;
    } catch (error) {
      console.error('Submit assignment error:', error);
      return { success: false, error: error.message };
    }
  },

  markAsDone: async (assignmentId) => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await apiClient.post('/assignments/mark-done', 
        { assignmentId }, 
        token
      );
      return response;
    } catch (error) {
      console.error('Mark as done error:', error);
      return { success: false, error: error.message };
    }
  },

  addClassComment: async (assignmentId, comment) => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await apiClient.post('/assignments/class-comment', 
        { assignmentId, comment }, 
        token
      );
      return response;
    } catch (error) {
      console.error('Add class comment error:', error);
      return { success: false, error: error.message };
    }
  },

  addPrivateComment: async (submissionId, comment) => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await apiClient.post('/assignments/private-comment', 
        { submissionId, comment }, 
        token
      );
      return response;
    } catch (error) {
      console.error('Add private comment error:', error);
      return { success: false, error: error.message };
    }
  }
};