import axios from 'axios';
import { Product } from './productGenerator';

// Make sure this URL matches the backend server's address and port
// For Vercel deployment, API_URL will be relative to the current host
const isProduction = import.meta.env.PROD;
const API_URL = isProduction ? '/api' : 'http://localhost:3001/api';

// Configure axios instance with increased timeout and more robust settings
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Test the API connection before logging in
export const testConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Failed to connect to server:', error);
    throw new Error('Cannot connect to the server. Please make sure the backend is running.');
  }
};

// Auth API calls
export const loginUser = async (username: string, password: string) => {
  try {
    console.log('Attempting login with:', { username });
    
    // Test server connection first
    try {
      await testConnection();
      console.log('Server is reachable');
    } catch (connError) {
      console.error('Server connection failed:', connError);
      throw new Error('Cannot connect to the server. Please make sure the backend is running.');
    }
    
    const response = await api.post('/auth/login', { username, password });
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.data);
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please check your network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      throw error;
    }
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};

export const isAdmin = () => {
  const userString = localStorage.getItem('user');
  if (!userString) return false;
  try {
    const user = JSON.parse(userString);
    return user.role === 'admin';
  } catch (e) {
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

// Product API calls
export const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchProductById = async (id: string) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

// Admin API calls
export const createProduct = async (product: Product) => {
  try {
    const response = await api.post('/admin/products', product);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create product');
  }
};

export const updateProduct = async (id: string, product: Product) => {
  try {
    const response = await api.put(`/admin/products/${id}`, product);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
};

// Initialize existing products for the backend if none exist
export const initializeBackendProducts = async () => {
  // This is a one-time function to populate the backend with existing frontend products
  const existingProducts = localStorage.getItem('products');
  if (!existingProducts) return;
  
  try {
    const products = JSON.parse(existingProducts);
    
    // Check if backend already has products
    const backendProducts = await fetchProducts();
    if (backendProducts && backendProducts.length > 0) {
      return; // Don't initialize if backend already has products
    }
    
    // Add each product to the backend
    for (const product of products) {
      await createProduct(product);
    }
    
    console.log('Successfully initialized backend with frontend products');
  } catch (error) {
    console.error('Failed to initialize backend products:', error);
  }
}; 