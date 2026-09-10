import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotify } from '../composables/useNotify';
import { setSession, getSession, clearSession, isLoggedIn as sessionIsLoggedIn } from '../session.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    // token TIDAK lagi disimpan di frontend (httpOnly cookie).
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    currentUser: (state) => state.user,
    userNik: (state) => state.user?.nik,
    userName: (state) => state.user?.name,
    userEmail: (state) => state.user?.email,
    userEmpId: (state) => state.user?.empid || state.user?.id || getSession().empid,
    // Status login berdasarkan session facade (cookie yang mengotorisasi request)
    isLoggedIn: () => sessionIsLoggedIn()
  },

  actions: {
    /**
     * Login with username and password
     */
    async login(username, password) {
      const { success, error } = useNotify();
      this.loading = true;
      
      try {
        // withCredentials default global → Set-Cookie token httpOnly tersimpan
        const response = await axios.post('/wjs/auth/login', {
          username,
          password
        });

        if (response.data.success) {
          // Body tidak lagi berisi token; hanya data user
          const { user } = response.data.data;

          this.user = user;
          this.isAuthenticated = true;

          // Simpan identitas sebagai blob terenkripsi (tanpa token)
          setSession({
            ...user,
            empid: user?.empid || user?.id,
            nik: user?.nik,
            nama: user?.name,
            domain: user?.domain || user?.bu_id,
            role: user?.role,
          });

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
        await axios.post('/wjs/auth/logout');
        success('Logout berhasil');
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        this.clearAuth();
      }
    },

    /**
     * Verify token validity (via cookie)
     */
    async verifyToken() {
      try {
        const response = await axios.get('/wjs/auth/verify');
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
        const response = await axios.get('/wjs/auth/me');
        
        if (response.data.success) {
          this.user = response.data.data;
          this.isAuthenticated = true;
          
          // Perbarui blob identitas
          setSession({
            ...getSession(),
            ...response.data.data,
          });
          
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
     * Refresh token (cookie diperbarui backend, tidak ada token di body)
     */
    async refreshToken() {
      try {
        const response = await axios.post('/wjs/auth/refresh');
        return !!response.data?.success;
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
      this.isAuthenticated = false;
      // Hapus session identitas + flag (preferensi UI non-auth tetap)
      clearSession();
    },

    /**
     * Initialize auth from session (dipanggil saat app start / guard)
     */
    initFromStorage() {
      if (sessionIsLoggedIn()) {
        try {
          this.user = getSession();
          this.isAuthenticated = true;
        } catch (err) {
          console.error('Error reading session:', err);
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
      setSession({ ...getSession(), ...user });
    }
  }
});
