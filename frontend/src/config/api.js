// API Configuration
const API_CONFIG = {
  // Backend API base URL
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://krishimitra-backend-94fh.onrender.com',
  
  // API endpoints
  ENDPOINTS: {
    LOCATION: '/api/proxy/location',
    MAP_DETAILS: '/api/mapDetails/map-details', 
    CHATBOT_DISEASE: '/api/chatbot/detect-disease',
    MANDI_PRICES: '/api/mandi/prices',
    MANDI_REFRESH: '/api/mandi/refresh',
    ML_PREDICT: '/api/ml/predict-disease',
    ML_HEALTH: '/api/ml/health'
  }
};

// Helper function to build full API URL
export const getApiUrl = (endpoint, params = '') => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}${params}`;
};

export default API_CONFIG;