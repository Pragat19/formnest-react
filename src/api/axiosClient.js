import axios from 'axios';
import { API_BASE_URL } from '../constants/config.js';
import { handleApiError } from '../utils/errorHandler.js';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor for request
axiosClient.interceptors.request.use(
  (config) => {
    // Attach token if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for response
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

export default axiosClient;
