const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const FormData = require("form-data");

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// CORS middleware
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Update to specific origin in production
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  next();
});

// ML service health check endpoint
router.get("/ml-service-status", async (req, res) => {
  try {
    const response = await fetch("http://localhost:5001/health"); // ✅ Flask on 5001
    if (response.ok) {
      res.json({ status: "available" });
    } else {
      res
        .status(503)
        .json({
          status: "unavailable",
          error: "ML service not responding properly",
        });
    }
  } catch (error) {
    console.error("ML service health check failed:", error);
    res
      .status(503)
      .json({ status: "unavailable", error: "ML service not running" });
  }
});

// Load disease treatment database
const DISEASE_TREATMENTS = {
  "Apple - Apple Scab": {
    chemical: "Captan 50% WP @ 2g/L or Dodine 65% WP @ 1g/L",
    organic: "Neem oil spray @ 3ml/L + Trichoderma @ 5g/L",
    prevention: "Plant resistant varieties, prune trees regularly, remove fallen leaves",
  },
  "Apple - Black Rot": {
    chemical: "Carbendazim 50% WP @ 1g/L or Thiophanate methyl @ 1g/L",
    organic: "Copper oxychloride @ 2g/L + Neem extract",
    prevention: "Remove infected fruits, prune dead branches, maintain proper spacing",
  },
  "Apple - Cedar Apple Rust": {
    chemical: "Myclobutanil 10% WP @ 1g/L or Propiconazole 25% EC @ 1ml/L",
    organic: "Bordeaux mixture @ 1% + Garlic extract spray",
    prevention: "Remove cedar trees nearby, plant resistant varieties",
  },
  "Blueberry - Healthy": {
    chemical: "No treatment needed",
    organic: "Continue regular care",
    prevention: "Maintain proper watering and fertilization",
  },
  "Cherry - Powdery Mildew": {
    chemical: "Sulfur 80% WP @ 2g/L or Tebuconazole 10% + Sulphur 65% WG @ 2g/L",
    organic: "Milk spray (1:10 ratio) or Neem oil @ 3ml/L",
    prevention: "Ensure good air circulation, avoid overhead watering",
  },
  "Corn - Cercospora Leaf Spot Gray Leaf Spot": {
    chemical: "Azoxystrobin 23% SC @ 1ml/L or Propiconazole 25% EC @ 1ml/L",
    organic: "Trichoderma viride @ 5g/L + Pseudomonas @ 5ml/L",
    prevention: "Crop rotation, use resistant varieties, proper field sanitation",
  },
  "Corn - Common Rust": {
    chemical: "Propiconazole 25% EC @ 1ml/L or Tebuconazole 2% DS @ 2g/kg seed",
    organic: "Sulphur dust @ 20kg/ha or Neem cake @ 100kg/ha",
    prevention: "Use resistant varieties, timely sowing, balanced fertilization",
  },
  "Corn - Northern Leaf Blight": {
    chemical: "Carbendazim 50% WP @ 1g/L or Mancozeb 75% WP @ 2g/L",
    organic: "Bacillus subtilis @ 5g/L + organic fungicide",
    prevention: "Deep plowing, crop rotation, use certified seeds",
  },
  "Grape - Black Rot": {
    chemical: "Mancozeb 75% WP @ 2g/L or Captan 50% WP @ 2g/L",
    organic: "Bordeaux mixture @ 1% or Copper hydroxide @ 2g/L",
    prevention: "Remove mummified berries, prune for air circulation",
  },
  "Grape - Esca Black Measles": {
    chemical: "Carbendazim 50% WP @ 1g/L + Copper oxychloride @ 2g/L",
    organic: "Trichoderma harzianum @ 5g/L + Neem extract",
    prevention: "Proper pruning wounds treatment, avoid water stress",
  },
  "Grape - Leaf Blight Isariopsis Leaf Spot": {
    chemical: "Azoxystrobin 23% SC @ 1ml/L or Hexaconazole 5% EC @ 2ml/L",
    organic: "Pseudomonas fluorescens @ 5g/L + organic copper",
    prevention: "Remove infected leaves, ensure proper drainage",
  },
  "Orange - Haunglongbing Citrus Greening": {
    chemical: "Control vector insects with Imidacloprid 17.8% SL @ 0.3ml/L",
    organic: "Neem oil @ 3ml/L + Yellow sticky traps for psyllids",
    prevention: "Use certified disease-free plants, control Asian citrus psyllid",
  },
  "Peach - Bacterial Spot": {
    chemical: "Streptocyclin 9% + Tetracycline 1% @ 0.5g/L",
    organic: "Copper hydroxide @ 2g/L + Bacillus subtilis @ 5g/L",
    prevention: "Use resistant varieties, avoid overhead irrigation, prune for air circulation",
  },
  "Pepper Bell - Bacterial Spot": {
    chemical: "Copper oxychloride 50% WP @ 2g/L or Streptocyclin @ 0.5g/L",
    organic: "Pseudomonas fluorescens @ 5g/L + Neem extract @ 3ml/L",
    prevention: "Use pathogen-free seeds, drip irrigation, crop rotation",
  },
  "Potato - Early Blight": {
    chemical: "Mancozeb 75% WP @ 2g/L or Azoxystrobin 23% SC @ 1ml/L",
    organic: "Neem oil @ 3ml/L + Trichoderma viride @ 5g/L",
    prevention: "Crop rotation, remove infected plants, balanced fertilization",
  },
  "Potato - Late Blight": {
    chemical: "Metalaxyl 8% + Mancozeb 64% WP @ 2g/L or Cymoxanil 8% + Mancozeb 64% @ 2g/L",
    organic: "Copper oxychloride @ 2g/L + Bacillus subtilis @ 5g/L",
    prevention: "Plant resistant varieties, avoid overhead watering, proper spacing",
  },
  "Squash - Powdery Mildew": {
    chemical: "Hexaconazole 5% EC @ 2ml/L or Myclobutanil 10% WP @ 1g/L",
    organic: "Milk spray (1:10) or Potassium bicarbonate @ 5g/L",
    prevention: "Ensure good air circulation, avoid water on leaves, resistant varieties",
  },
  "Strawberry - Leaf Scorch": {
    chemical: "Carbendazim 50% WP @ 1g/L or Propiconazole 25% EC @ 1ml/L",
    organic: "Trichoderma harzianum @ 5g/L + Neem extract @ 3ml/L",
    prevention: "Remove infected leaves, proper plant spacing, drip irrigation",
  },
  "Tomato - Bacterial Spot": {
    chemical: "Streptocyclin 9% + Tetracycline 1% @ 0.5g/L",
    organic: "Copper hydroxide @ 2g/L + Pseudomonas @ 5g/L",
    prevention: "Use certified seeds, avoid overhead watering, crop rotation",
  },
  "Tomato - Early Blight": {
    chemical: "Mancozeb 75% WP @ 2g/L or Chlorothalonil 75% WP @ 2g/L",
    organic: "Neem oil @ 3ml/L + Trichoderma @ 5g/L",
    prevention: "Crop rotation, remove infected leaves, proper staking",
  },
  "Tomato - Late Blight": {
    chemical: "Metalaxyl 8% + Mancozeb 64% @ 2g/L or Cymoxanil + Mancozeb @ 2g/L",
    organic: "Bordeaux mixture @ 1% or Copper oxychloride @ 2g/L",
    prevention: "Use resistant varieties, avoid overhead irrigation, proper ventilation",
  },
  "Tomato - Leaf Mold": {
    chemical: "Hexaconazole 5% EC @ 2ml/L or Carbendazim 50% WP @ 1g/L",
    organic: "Bacillus subtilis @ 5g/L + Neem extract @ 3ml/L",
    prevention: "Ensure good ventilation, avoid leaf wetness, use resistant varieties",
  },
  "Tomato - Septoria Leaf Spot": {
    chemical: "Chlorothalonil 75% WP @ 2g/L or Azoxystrobin 23% SC @ 1ml/L",
    organic: "Copper fungicide @ 2g/L + Trichoderma @ 5g/L",
    prevention: "Remove infected debris, mulching, avoid water splash",
  },
  "Tomato - Spider Mites Two Spotted Spider Mite": {
    chemical: "Spiromesifen 22.9% SC @ 1ml/L or Abamectin 1.9% EC @ 1ml/L",
    organic: "Neem oil @ 5ml/L + insecticidal soap @ 5ml/L",
    prevention: "Maintain humidity, predatory mites, avoid water stress",
  },
  "Tomato - Target Spot": {
    chemical: "Azoxystrobin 23% SC @ 1ml/L or Difenoconazole 25% EC @ 1ml/L",
    organic: "Bacillus amyloliquefaciens @ 5g/L + organic copper",
    prevention: "Crop rotation, remove plant debris, proper plant spacing",
  },
  "Tomato - Tomato Yellow Leaf Curl Virus": {
    chemical: "Control whiteflies with Imidacloprid 17.8% SL @ 0.5ml/L",
    organic: "Neem oil @ 5ml/L + Yellow sticky traps for whiteflies",
    prevention: "Use virus-free plants, control whitefly vectors, reflective mulch",
  },
  "Tomato - Tomato Mosaic Virus": {
    chemical: "No direct chemical control - focus on vector control",
    organic: "Remove infected plants, disinfect tools with 10% bleach",
    prevention: "Use resistant varieties, control aphid vectors, sanitation",
  },
  "healthy": {
    chemical: "No treatment needed - continue preventive care",
    organic: "Regular organic fertilization and bio-enhancers",
    prevention: "Maintain proper nutrition, watering, and plant hygiene",
  }
};

// Helper functions
async function getLocationData(lat, lon) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/mapdetails/map-details?lat=${lat}&lon=${lon}`
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Location data fetch failed:", error);
  }
  return null;
}

async function getMarketPrices(crop) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/mandi/prices/${crop}`
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Market price fetch failed:", error);
  }
  return null;
}

function generateCropRecommendations(soilData, weatherData, location) {
  const recommendations = [];
  if (!soilData || !weatherData) return recommendations;

  if (soilData.nitrogen > 50 && weatherData.temperature > 25) {
    recommendations.push("Maize, Rice, Sugarcane");
  }
  if (soilData.phosphorus > 30 && weatherData.rainfall > 200) {
    recommendations.push("Paddy, Wheat, Pulses");
  }
  if (soilData.potassium > 40 && weatherData.humidity > 60) {
    recommendations.push("Banana, Tomato, Potato");
  }

  return recommendations;
}

// Routes

// Chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, lat, lon } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, error: "Message is required" });
    }

    const locationData =
      lat && lon ? await getLocationData(lat, lon) : null;

    const response = {
      success: true,
      reply: "",
      data: {},
    };

    if (message.toLowerCase().includes("recommend crops")) {
      if (locationData?.soil && locationData?.weather) {
        const recommendations = generateCropRecommendations(
          locationData.soil,
          locationData.weather,
          locationData
        );
        response.reply = recommendations.length
          ? `Based on your location and conditions, recommended crops are: ${recommendations.join(
              ", "
            )}`
          : "Sorry, I couldn't generate specific recommendations with current data.";
        response.data.recommendations = recommendations;
      } else {
        response.reply =
          "I need soil and weather data to provide crop recommendations. Please enable location services.";
      }
    } else if (
      message.toLowerCase().includes("market price") &&
      message.toLowerCase().includes("tomato")
    ) {
      const prices = await getMarketPrices("Tomato");
      if (prices?.data?.length) {
        response.reply = `Current market prices for tomato:\n${prices.data
          .slice(0, 3)
          .map(
            (p) =>
              `${p.market} - Min: ₹${p.min_price}, Max: ₹${p.max_price}, Modal: ₹${p.modal_price}`
          )
          .join("\n")}`;
        response.data.prices = prices.data;
      } else {
        response.reply =
          "Sorry, I couldn't fetch tomato prices right now.";
      }
    } else {
      response.reply =
        "I can help with:\n- Crop recommendations (say 'recommend crops')\n- Market prices (e.g., 'tomato market price')\n- Disease detection (upload a plant image)";
    }

    res.json(response);
  } catch (error) {
    console.error("Chatbot error:", error);
    res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

// Disease detection endpoint
router.post(
  "/detect-disease",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No image file provided" });
      }

      console.log(
        "Processing image:",
        req.file.originalname,
        "Size:",
        req.file.size,
        "bytes"
      );

      const formData = new FormData();
      formData.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      // ✅ Call Flask ML service on port 5001
      let mlResponse;
      try {
        console.log("Calling ML service...");
        mlResponse = await fetch("http://localhost:5001/predict", {
          method: "POST",
          body: formData,
          headers: formData.getHeaders(),
          timeout: 30000,
        });
      } catch (error) {
        console.error("Error connecting to ML service:", error);
        return res.status(503).json({
          success: false,
          error: "ML service is unavailable. Please try again later.",
        });
      }

      if (!mlResponse.ok) {
        const errorText = await mlResponse.text();
        console.error("ML service returned error:", errorText);
        return res.status(500).json({
          success: false,
          error: "ML service error: " + errorText,
        });
      }

      const result = await mlResponse.json();
      console.log("ML service result:", result);

      // Improved disease matching logic
      const diseaseLabel = result.disease.toLowerCase();
      let diseaseKey = null;
      
      // First try exact match
      diseaseKey = Object.keys(DISEASE_TREATMENTS).find(key => 
        key.toLowerCase() === diseaseLabel
      );
      
      // If no exact match, try partial matching
      if (!diseaseKey) {
        diseaseKey = Object.keys(DISEASE_TREATMENTS).find(key => {
          const keyLower = key.toLowerCase();
          const diseaseParts = diseaseLabel.split(/[\s\-_]+/);
          return diseaseParts.some(part => keyLower.includes(part) && part.length > 3);
        });
      }
      
      // Check for healthy plants
      if (!diseaseKey && diseaseLabel.includes('healthy')) {
        diseaseKey = 'healthy';
      }

      const treatment = diseaseKey
        ? DISEASE_TREATMENTS[diseaseKey]
        : {
            chemical: "Consult local agricultural expert for specific treatment",
            organic: "Apply general organic fungicide (Neem oil @ 3ml/L)",
            prevention: "Maintain good agricultural practices and plant hygiene",
          };

      // Create comprehensive response
      const isHealthy = diseaseLabel.includes('healthy');
      const responseMessage = isHealthy 
        ? `Great news! Your ${result.disease.split(' - ')[0] || 'plant'} appears to be healthy. Keep up the excellent care!`
        : `Disease detected: ${result.disease}. Confidence: ${result.confidence_str}. Immediate treatment recommended.`;

      res.json({
        success: true,
        prediction: {
          disease: result.disease,
          confidence: result.confidence,
          confidence_str: result.confidence_str,
          is_healthy: isHealthy,
          top_predictions: result.top3
        },
        treatment: {
          ...treatment,
          disease_name: result.disease,
          severity: result.confidence > 0.8 ? 'High' : result.confidence > 0.6 ? 'Medium' : 'Low',
          matched_treatment: diseaseKey ? true : false
        },
        message: responseMessage,
      });
    } catch (error) {
      console.error("Disease detection error:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to process image" });
    }
  }
);

// Test endpoint
router.get("/test-ml-service", async (req, res) => {
  try {
    const response = await fetch("http://localhost:5001/health"); // ✅ Flask on 5001
    const data = await response.json();
    res.json({
      success: true,
      ml_service_status: data,
      connection: "OK",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: "Cannot connect to ML service",
      details: error.message,
    });
  }
});

module.exports = router;
