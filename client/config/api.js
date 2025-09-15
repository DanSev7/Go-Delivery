import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

// Base API URL from environment variables
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  async (config) => {
    // Don't add token for login/register requests
    const isAuthRequest = config.url?.includes('/login') || config.url?.includes('/register');
    
    if (!isAuthRequest) {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
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
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userId');
      Alert.alert('Session Expired', 'Please login again.');
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

// API endpoints configuration
export const endpoints = {
  // Authentication
  auth: {
    login: '/users/login',
    register: '/users/register',
    profile: '/users/profile',
    changePassword: (userId) => `/users/${userId}/change-password`,
  },
  
  // Restaurants
  restaurants: {
    list: '/restaurants',
    get: (id) => `/restaurants/${id}`,
  },
  
  // Categories
  categories: {
    list: '/categories',
  },
  
  // Menu Items
  menuItems: {
    byRestaurant: (restaurantId) => `/menu-items/restaurants/${restaurantId}`,
  },
  
  // Orders
  orders: {
    list: '/orders',
    create: '/orders',
    byCustomer: (customerId) => `/order-items/customers/${customerId}`,
  },
  
  // Reviews
  reviews: {
    create: '/reviews',
  },
  
  // Payment
  payment: {
    initiate: '/chapa/api/pay',
  },
};

export default api;