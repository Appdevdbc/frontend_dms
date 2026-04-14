import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { useNotify } from 'src/composables/useNotify';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    currentUser: (state) => state.user,
    userNik: (state) => state.user?.nik,
    userName: (state) => state.user?.name,
    userEmail: (state) => state.user?.email,
    isLoggedIn: (state) => state.isAuthenticated && !!state.token
  },

  actions: {
    /**
     * Login with username and password
     */
    async login(username, password) {
      const { success, error } = useNotify();
      this.loading = true;
      
      try {
        const response = await api.post('/wjs/auth/login', {
          username,
          password
        });

        if (response.data.success) {
          const { token, user } = response.data.data;

          this.token = token;
          this.user = user;
          this.isAuthenticated = true;

          // Store in localStorage
          localStorage.setItem('wjs_token', token);
          localStorage.setItem('wjs_user', JSON.stringify(user));
          localStorage.setItem('token', token); // For compatibility
          localStorage.setItem('empid', user.id);
          localStorage.setItem('nik', user.nik);

          success('Login berhasil');
          return { success: true };
        } else {
          error(response.data.message || 'Login gagal');
          return {
            success: false,
            message: response.data.message || 'Login gagal'
          };
        }
      } catch (err) {
        console.error('Login error:', err);
        const message = err.response?.data?.message || 'Login gagal. Silakan coba lagi.';
        error(message);
        return {
          success: false,
          message
        };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Logout user
     */
    async logout() {
      const { success } = useNotify();
      
      try {
        await api.post('/wjs/auth/logout');
        success('Logout berhasil');
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        this.clearAuth();
      }
    },

    /**
     * Verify token validity
     */
    async verifyToken() {
      try {
        const response = await api.get('/wjs/auth/verify');
        return response.data.success;
      } catch (err) {
        this.clearAuth();
        return false;
      }
    },

    /**
     * Get current user data
     */
    async getCurrentUser() {
      try {
        const response = await api.get('/wjs/auth/me');
        
        if (response.data.success) {
          this.user = response.data.data;
          this.isAuthenticated = true;
          
          // Update localStorage
          localStorage.setItem('wjs_user', JSON.stringify(response.data.data));
          
          return true;
        }
        
        return false;
      } catch (err) {
        console.error('Get current user error:', err);
        this.clearAuth();
        return false;
      }
    },

    /**
     * Refresh token
     */
    async refreshToken() {
      try {
        const response = await api.post('/wjs/auth/refresh');
        
        if (response.data.success) {
          const { token } = response.data.data;
          this.token = token;
          localStorage.setItem('wjs_token', token);
          localStorage.setItem('token', token);
          return true;
        }
        
        return false;
      } catch (err) {
        console.error('Refresh token error:', err);
        return false;
      }
    },

    /**
     * Clear authentication data
     */
    clearAuth() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      
      // Clear localStorage
      localStorage.removeItem('wjs_token');
      localStorage.removeItem('wjs_user');
      localStorage.removeItem('token');
      localStorage.removeItem('empid');
      localStorage.removeItem('nik');
      localStorage.removeItem('nama');
      localStorage.removeItem('domain');
      localStorage.removeItem('role');
    },

    /**
     * Initialize auth from localStorage
     */
    initFromStorage() {
      const token = localStorage.getItem('wjs_token') || localStorage.getItem('token');
      const userStr = localStorage.getItem('wjs_user');

      if (token && userStr) {
        try {
          this.token = token;
          this.user = JSON.parse(userStr);
          this.isAuthenticated = true;
        } catch (err) {
          console.error('Error parsing user data:', err);
          this.clearAuth();
        }
      }
    },

    /**
     * Set user data
     */
    setUser(user) {
      this.user = user;
      this.isAuthenticated = true;
      localStorage.setItem('wjs_user', JSON.stringify(user));
    },

    /**
     * Set token
     */
    setToken(token) {
      this.token = token;
      localStorage.setItem('wjs_token', token);
      localStorage.setItem('token', token);
    }
  }
});

