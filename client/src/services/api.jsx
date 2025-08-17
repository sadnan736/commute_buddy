import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:1565/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Profile Service
export const profileService = {
  getProfile: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateProfile: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  updateAvatar: async (id, avatar) => {
    const response = await api.put(`/users/${id}/avatar`, { avatar });
    return response.data;
  },

  updateLocations: async (id, locations) => {
    const response = await api.put(`/users/${id}/locations`, locations);
    return response.data;
  },

  updateNotifications: async (id, preferences) => {
    const response = await api.put(`/users/${id}/notifications`, { notificationPreferences: preferences });
    return response.data;
  },

  submitVerification: async (id, documents) => {
    const response = await api.post(`/users/${id}/verify`, { documents });
    return response.data;
  },

  getFollowedRoutes: async (id) => {
    const response = await api.get(`/users/${id}/followed-routes`);
    return response.data;
  },

  updateFollowedRoutes: async (id, routes) => {
    const response = await api.put(`/users/${id}/followed-routes`, { routes });
    return response.data;
  },

  removeFollowedRoute: async (id, routeId) => {
    const response = await api.delete(`/users/${id}/followed-routes/${routeId}`);
    return response.data;
  },

  getPreferredRegions: async (id) => {
    const response = await api.get(`/users/${id}/preferred-regions`);
    return response.data;
  },

  updatePreferredRegions: async (id, regions) => {
    const response = await api.put(`/users/${id}/preferred-regions`, { regions });
    return response.data;
  },
};

// Admin Service
export const adminService = {
  getPendingVerifications: async () => {
    const response = await api.get('/admin/pending-verifications');
    return response.data;
  },

  getVerificationDetails: async (userId) => {
    const response = await api.get(`/admin/verification/${userId}`);
    return response.data;
  },

  approveVerification: async (userId, comments) => {
    const response = await api.put(`/admin/verification/${userId}/approve`, { comments });
    return response.data;
  },

  rejectVerification: async (userId, reason) => {
    const response = await api.put(`/admin/verification/${userId}/reject`, { reason });
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
};

export default api;
