import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

// Base URL - Update this to your deployed backend URL
const BASE_URL = 'https://bookstore-5iz9.onrender.com/api';

// Create axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token and logout user
      await AsyncStorage.removeItem('token');
      store.dispatch(logout());

      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
      });
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
      return Promise.reject({
        message: 'Server error. Please try again later.',
      });
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },

  // Books
  books: {
    getAll: '/books',
    getById: (id) => `/books/${id}`,
    search: '/books/search',
    getByCategory: (category) => `/books/category/${category}`,
    getFeatured: '/books/featured',
    getBestSellers: '/books/bestsellers',
    getNewReleases: '/books/new-releases',
  },

  // Cart
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    remove: '/cart/remove',
    clear: '/cart/clear',
  },

  // Wishlist
  wishlist: {
    get: '/wishlist',
    add: '/wishlist/add',
    remove: '/wishlist/remove',
  },

  // Orders
  orders: {
    create: '/orders',
    getAll: '/orders',
    getById: (id) => `/orders/${id}`,
    cancel: (id) => `/orders/${id}/cancel`,
    track: (id) => `/orders/${id}/track`,
  },

  // Reviews
  reviews: {
    getByBook: (bookId) => `/reviews/${bookId}`,
    add: (bookId) => `/reviews/${bookId}`,
    update: (bookId, reviewId) => `/reviews/${bookId}/${reviewId}`,
    delete: (bookId, reviewId) => `/reviews/${bookId}/${reviewId}`,
    helpful: (bookId, reviewId) => `/reviews/${bookId}/${reviewId}/helpful`,
    getUserReviews: '/reviews/user/me',
  },

  // Coupons
  coupons: {
    getAll: '/coupons',
    validate: '/coupons/validate',
    getByCode: (code) => `/coupons/${code}`,
  },

  // Categories
  categories: {
    getAll: '/categories',
    getById: (id) => `/categories/${id}`,
  },

  // User
  user: {
    profile: '/user/profile',
    addresses: '/user/addresses',
    preferences: '/user/preferences',
  },

  // Notifications
  notifications: {
    getAll: '/notifications',
    markAsRead: (id) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
    settings: '/notifications/settings',
  },
};

// API helper functions
export const apiHelpers = {
  // Handle API responses
  handleResponse: (response) => {
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'API request failed');
  },

  // Handle API errors
  handleError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Create query string from object
  createQueryString: (params) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    return queryParams.toString();
  },

  // Upload file
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
};

export default api; 