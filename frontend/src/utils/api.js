/**
 * API Utility
 * Centralized API configuration for making requests to the backend
 */

// Get API URL from environment variable or use default
const getApiUrl = () => {
  // In production, use VITE_API_URL if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use relative path (Vite proxy will handle it)
  // In production build without VITE_API_URL, use relative path (same domain)
  return '';
};

const API_BASE_URL = getApiUrl();

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (e.g., '/threat-intel')
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response;
};

/**
 * Post request helper
 */
export const apiPost = async (endpoint, data) => {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
};

/**
 * Get request helper
 */
export const apiGet = async (endpoint) => {
  const response = await apiRequest(endpoint, {
    method: 'GET',
  });
  return response.json();
};

