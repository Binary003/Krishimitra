const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// ML Service URL - force production URL
const ML_SERVICE_URL = 'https://krishimitra-ml-service.onrender.com';

console.log('🔧 ML Service configured:', ML_SERVICE_URL);

// Plant Disease Detection Route
router.post('/predict-disease', upload.single('image'), async (req, res) => {
  try {
    console.log('🔄 Contacting ML Service:', ML_SERVICE_URL);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    
    // Create form data to send to ML service
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname || 'image.jpg',
      contentType: req.file.mimetype || 'image/jpeg'
    });
    
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 second timeout
      maxBodyLength: 50 * 1024 * 1024, // 50MB limit for images
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

// Debug endpoint to check ML service URL
router.get('/debug', (req, res) => {
  res.json({
    ML_SERVICE_URL,
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
