import { apiClient } from './api';

export const authService = {
  register: async (registerData) => {
    try {
      const response = await apiClient.post('/auth/register', {
        fullName: registerData.fullName,
        nim: registerData.nim,
        password: registerData.password
      });

      if (response.success && response.token) {
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        console.log('✅ Registration successful');
      }

      return response;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  },

  login: async (loginData) => {
    try {
      const response = await apiClient.post('/auth/login', {
        nim: loginData.nim,
        password: loginData.password
      });

      if (response.success && response.token) {
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        console.log('✅ Login successful');
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },


  logout: async () => {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');

      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  
  getToken: () => {
    return localStorage.getItem('access_token');
  },

  
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  
  getProfile: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await apiClient.get('/auth/profile', token);
      
      if (response.success && response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: error.message };
    }
  },

  
  initializeSession: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');

      console.log('🔍 Checking session:', { 
        hasToken: !!token, 
        hasUser: !!user 
      });

      if (token && user) {
        console.log('✅ Session found');
        return true;
      }

      console.log('❌ No session found');
      return false;
    } catch (error) {
      console.error('❌ Initialize session error:', error);
      authService.logout();
      return false;
    }
  }
};