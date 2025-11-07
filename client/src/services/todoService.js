import { apiClient } from './api';
import { authService } from './authService';

export const todoService = {
  // Get all todos
  getTodos: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await apiClient.get('/todos', token);
      return response;
    } catch (error) {
      console.error('Get todos error:', error);
      return { success: false, error: error.message };
    }
  },

  // Create new todo
  createTodo: async (todoData) => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await apiClient.post('/todos', todoData, token);
      return response;
    } catch (error) {
      console.error('Create todo error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update todo
  updateTodo: async (id, updateData) => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await apiClient.put(`/todos/${id}`, updateData, token);
      return response;
    } catch (error) {
      console.error('Update todo error:', error);
      return { success: false, error: error.message };
    }
  },

  // Reorder todos
  reorderTodos: async (todos) => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await apiClient.put('/todos/reorder', { todos }, token);
      return response;
    } catch (error) {
      console.error('Reorder todos error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete todo
  deleteTodo: async (id) => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await apiClient.delete(`/todos/${id}`, token);
      return response;
    } catch (error) {
      console.error('Delete todo error:', error);
      return { success: false, error: error.message };
    }
  }
};