import axios from 'axios';

// Global API response interceptor for handling 401 errors
let isRedirecting = false;

const handleUnauthorized = () => {
  if (!isRedirecting) {
    isRedirecting = true;
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/auth/login';
  }
};

// Override fetch to intercept responses
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    
    if (response.status === 401) {
      handleUnauthorized();
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// Axios response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default handleUnauthorized;