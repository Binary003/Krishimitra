const express = require('express');
const axios = require('axios');
const router = express.Router();

// ML Service URL - this should be set as an environment variable in production
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// Plant Disease Detection Route
router.post('/predict-disease', async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('ML Service Error:', error.message);
    res.status(500).json({ 
      error: 'ML Service unavailable',
      message: error.message 
    });
  }
});

// Health check for ML service
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/ping`);
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

module.exports = router;
