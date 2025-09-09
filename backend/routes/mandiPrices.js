const express = require("express");
const axios = require("axios");
const router = express.Router();

// Cache
let priceCache = {
  data: [],
  lastUpdated: null,
  cacheValidFor: 30 * 60 * 1000, // 30 min
};

// 🔑 API key
const GOV_API_KEY =
  process.env.GOV_API_KEY ||
  "579b464db66ec23bdd000001484fe39052964c436a409787981357c4";

// Resource ID
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

// --- Normalize crop names
const normalizeCropName = (name) => {
  const cropMapping = {
    paddy: "Rice",
    rice: "Rice",
    wheat: "Wheat",
    maize: "Maize",
    corn: "Maize",
    sugarcane: "Sugarcane",
    cotton: "Cotton",
    soybean: "Soybean",
    groundnut: "Groundnut",
    mustard: "Mustard",
    gram: "Gram",
    tur: "Tur",
    arhar: "Tur",
  };
  const normalized = name.toLowerCase().trim();
  return cropMapping[normalized] || name;
};

// --- Mock data fallback
function generateRealisticMockData() {
  console.log("⚠️ Using mock mandi price data (gov API unavailable)");
  const crops = [
    { name: "Wheat", baseMin: 2100, baseMax: 2500, unit: "₹/Quintal" },
    { name: "Rice", baseMin: 1800, baseMax: 2300, unit: "₹/Quintal" },
    { name: "Maize", baseMin: 1600, baseMax: 2000, unit: "₹/Quintal" },
    { name: "Sugarcane", baseMin: 3500, baseMax: 4200, unit: "₹/Ton" },
    { name: "Cotton", baseMin: 5500, baseMax: 6200, unit: "₹/Quintal" },
  ];
  const mandis = ["UP", "Punjab", "MP", "Maharashtra", "Gujarat"];
  const mockData = [];

  crops.forEach((crop) => {
    mandis.forEach((mandi) => {
      const variation = (Math.random() - 0.5) * 0.3;
      const minPrice = Math.round(crop.baseMin * (1 + variation));
      const maxPrice = Math.round(crop.baseMax * (1 + variation));
      mockData.push({
        crop: crop.name,
        state: mandi,
        district: "Sample",
        mandi: mandi + " Mandi",
        minPrice,
        maxPrice,
        unit: crop.unit,
        lastUpdated: new Date().toISOString(),
        source: "mock",
      });
    });
  });
  return mockData;
}

// --- Fetch govt API
async function fetchGovernmentData() {
  try {
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}`;
    const response = await axios.get(url, {
      params: {
        "api-key": GOV_API_KEY,
        format: "json",
        limit: 1000,
      },
      timeout: 10000,
    });

    if (response.data && response.data.records) {
      console.log(`✅ Govt API returned ${response.data.records.length} records`);
      return processPrimaryAPIData(response.data.records);
    }

    throw new Error("Empty response from govt API");
  } catch (err) {
    console.error("❌ Govt API fetch failed:", err.message);
    return generateRealisticMockData();
  }
}

// --- Process API data
function processPrimaryAPIData(records) {
  const processedData = [];

  records.forEach((record) => {
    try {
      const crop = normalizeCropName(record.commodity || "");
      const state = record.state || "Unknown";
      const district = record.district || "Unknown";
      const mandi = record.market || "Unknown";
      const minPrice = parseFloat(record.min_price || record.modal_price || 0);
      const maxPrice = parseFloat(record.max_price || minPrice * 1.2);

      if (crop && mandi && minPrice > 0) {
        processedData.push({
          crop,
          state,
          district,
          mandi,
          minPrice: Math.round(minPrice),
          maxPrice: Math.round(maxPrice),
          unit: getUnitForCrop(crop),
          lastUpdated: new Date().toISOString(),
          source: "government",
        });
      }
    } catch (err) {
      console.error("⚠️ Error processing record:", err.message);
    }
  });

  return processedData.length > 0 ? processedData : generateRealisticMockData();
}

// --- Helper: unit type
function getUnitForCrop(crop) {
  const tonCrops = ["sugarcane", "potato", "onion"];
  return tonCrops.includes(crop.toLowerCase()) ? "₹/Ton" : "₹/Quintal";
}

// --- Routes ---

// ✅ All prices
router.get("/prices", async (req, res) => {
  try {
    const now = Date.now();

    if (
      priceCache.data.length > 0 &&
      priceCache.lastUpdated &&
      now - priceCache.lastUpdated < priceCache.cacheValidFor
    ) {
      return res.json({
        success: true,
        data: priceCache.data,
        cached: true,
        lastUpdated: priceCache.lastUpdated,
      });
    }

    const freshData = await fetchGovernmentData();
    priceCache.data = freshData;
    priceCache.lastUpdated = now;

    res.json({
      success: true,
      data: freshData,
      cached: false,
      lastUpdated: now,
    });
  } catch (err) {
    console.error("❌ /prices failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Specific crop
router.get("/prices/:crop", async (req, res) => {
  try {
    const crop = req.params.crop;
    let allPrices = priceCache.data;

    if (allPrices.length === 0) {
      allPrices = await fetchGovernmentData();
      priceCache.data = allPrices;
      priceCache.lastUpdated = Date.now();
    }

    const cropPrices = allPrices.filter((item) =>
      item.crop.toLowerCase().includes(crop.toLowerCase())
    );

    res.json({ success: true, data: cropPrices, count: cropPrices.length });
  } catch (err) {
    console.error("❌ /prices/:crop failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Refresh
router.post("/refresh", async (req, res) => {
  try {
    const freshData = await fetchGovernmentData();
    priceCache.data = freshData;
    priceCache.lastUpdated = Date.now();

    res.json({
      success: true,
      message: "Cache refreshed",
      count: freshData.length,
      lastUpdated: priceCache.lastUpdated,
    });
  } catch (err) {
    console.error("❌ /refresh failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Health check
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Mandi Prices API working",
    timestamp: new Date().toISOString(),
    cache: {
      hasData: priceCache.data.length > 0,
      lastUpdated: priceCache.lastUpdated,
      count: priceCache.data.length,
    },
  });
});

// ✅ State → District → Mandi hierarchy
router.get("/hierarchy", async (req, res) => {
  try {
    let allPrices = priceCache.data;
    if (allPrices.length === 0) {
      allPrices = await fetchGovernmentData();
      priceCache.data = allPrices;
      priceCache.lastUpdated = Date.now();
    }

    const hierarchy = {};

    allPrices.forEach((item) => {
      if (!hierarchy[item.state]) {
        hierarchy[item.state] = {};
      }
      if (!hierarchy[item.state][item.district]) {
        hierarchy[item.state][item.district] = new Set();
      }
      hierarchy[item.state][item.district].add(item.mandi);
    });

    // Convert to array format
    const formatted = Object.entries(hierarchy).map(([state, districts]) => ({
      state,
      districts: Object.entries(districts).map(([district, mandis]) => ({
        district,
        mandis: Array.from(mandis),
      })),
    }));

    res.json({ success: true, hierarchy: formatted });
  } catch (err) {
    console.error("❌ /hierarchy failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
