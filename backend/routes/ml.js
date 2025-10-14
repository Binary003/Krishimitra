const express = require('express');
const axios = require('axios');
const router = express.Router();

// ML Service URL - this should be set as an environment variable in production
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'https://krishimitra-ml-service.onrender.com';

// Plant Disease Detection Route
router.post('/predict-disease', async (req, res) => {
  try {
    console.log('🔄 Contacting ML Service:', ML_SERVICE_URL);
    
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });
    
    console.log('✅ ML Service Response:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('❌ ML Service Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    res.status(500).json({ 
      error: 'ML Service unavailable',
      message: error.message,
      details: 'The ML service may be starting up. Please try again in a moment.'
    });
  }
});

// Health check for ML service
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/ping`, { timeout: 30000 });
    res.json({ 
      status: 'ML Service Connected',
      mlService: response.data 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ML Service Disconnected',
      error: error.message 
    });
  }
});

// Wake up ML service (for Render free tier)
router.post('/wake-up', async (req, res) => {
  try {
    console.log('🌅 Waking up ML service...');
    const response = await axios.get(`${ML_SERVICE_URL}/ping`, { timeout: 45000 });
    res.json({ 
      status: 'ML Service awake',
      message: 'ML service is now ready to receive requests'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'Wake-up failed',
      error: error.message 
    });
  }
});

module.exports = router;
