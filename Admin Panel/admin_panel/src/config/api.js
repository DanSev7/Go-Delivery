import axios from 'axios';

// Base API URL - can be configured for different environments
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Don't add token for login/register requests
    const isAuthRequest = config.url?.includes('/login') || config.url?.includes('/register');
    
    if (!isAuthRequest) {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminId');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/users/login',
    register: '/users/register',
    profile: '/users/profile',
    updateProfile: (userId) => `/users/update/${userId}`,
    changePassword: (userId) => `/users/${userId}/change-password`,
  },
  
  // Admin
  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    deleteUser: (userId) => `/admin/users/${userId}`,
  },
  
  // Restaurants
  restaurants: {
    list: '/restaurants',
    create: '/restaurants',
    get: (id) => `/restaurants/${id}`,
    update: (id) => `/restaurants/${id}`,
    delete: (id) => `/restaurants/${id}`,
    dashboard: (id) => `/restaurants/${id}/dashboard`,
  },
  
  // Categories
  categories: {
    list: '/categories',
    create: '/categories',
    update: (id) => `/categories/update/${id}`,
    delete: (id) => `/categories/${id}`,
  },
  
  // Orders
  orders: {
    list: '/orders',
    create: '/orders',
    get: (id) => `/orders/${id}`,
    update: (id) => `/orders/${id}`,
    delete: (id) => `/orders/${id}`,
    updateStatus: (id) => `/orders/${id}/status`,
    byRestaurant: (restaurantId) => `/orders/restaurant/${restaurantId}`,
  },
  
  // Menu Items
  menuItems: {
    byRestaurant: (restaurantId) => `/menu-items/restaurants/${restaurantId}`,
    create: (restaurantId) => `/menu-items/${restaurantId}`,
    update: (id) => `/menu-items/${id}`,
    delete: (id) => `/menu-items/${id}`,
  },
  
  // Riders
  riders: {
    list: '/riders',
    create: '/riders',
    get: (id) => `/riders/${id}`,
    update: (id) => `/riders/${id}`,
    delete: (id) => `/riders/${id}`,
  },
  
  // Reviews
  reviews: {
    list: '/reviews',
    create: '/reviews',
    byRestaurant: (restaurantId) => `/reviews/restaurant/${restaurantId}`,
  },
  
  // Payment
  payment: {
    initiate: '/chapa/initiate-payment',
    verify: '/chapa/verify-payment',
  },
};

export default api;