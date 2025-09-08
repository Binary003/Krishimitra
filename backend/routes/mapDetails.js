// backend/routes/mapdetails.js
const express = require("express");
const router = express.Router();
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Allow CORS
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Weather codes mapping (UNCHANGED)
const weatherCodes = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog", 51: "Drizzle: Light", 53: "Drizzle: Moderate",
  55: "Drizzle: Dense", 61: "Rain: Slight", 63: "Rain: Moderate", 65: "Rain: Heavy",
  71: "Snow: Slight", 73: "Snow: Moderate", 75: "Snow: Heavy", 95: "Thunderstorm",
  99: "Thunderstorm with hail",
};

router.get("/map-details", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ msg: "lat and lon required" });

  try {
    // --- Weather: Open-Meteo (UNCHANGED) ---
    let weather = null;
    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,pressure_msl,dewpoint_2m,apparent_temperature,visibility&daily=sunrise,sunset`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.current_weather) {
        weather = {
          temperature: weatherData.current_weather.temperature,
          feels_like: weatherData.current_weather.apparent_temperature,
          wind_speed: weatherData.current_weather.windspeed,
          description: weatherCodes[weatherData.current_weather.weathercode] || "Unknown",
          humidity: weatherData.hourly?.relativehumidity_2m
            ? weatherData.hourly.relativehumidity_2m[0]
            : null,
          pressure: weatherData.hourly?.pressure_msl
            ? weatherData.hourly.pressure_msl[0]
            : null,
          dew_point: weatherData.hourly?.dewpoint_2m
            ? weatherData.hourly.dewpoint_2m[0]
            : null,
          visibility: weatherData.hourly?.visibility
            ? weatherData.hourly.visibility[0]
            : null,
          sunrise: weatherData.daily?.sunrise ? weatherData.daily.sunrise[0] : null,
          sunset: weatherData.daily?.sunset ? weatherData.daily.sunset[0] : null,
        };
      }
    } catch (err) {
      console.error("Weather API fetch failed:", err.message);
    }

    // --- Soil: SoilGrids ---
    // --- Soil: SoilGrids ---
// --- Soil: SoilGrids ---
let soil = {};
try {
  const soilRes = await fetch(`https://rest.soilgrids.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}`);
  const soilData = await soilRes.json();

  const getValue = (prop) => {
    // prop may contain depth layers
    if (!prop || !prop.layers) return "N/A";
    const layer = prop.layers.find(l => l.depth === "0-5cm") || prop.layers[0]; // fallback to first layer
    return layer?.value ?? "N/A";
  };

  soil = {
    nitrogen: getValue(soilData?.properties?.nitrogen),
    phosphorus: "N/A",
    potassium: "N/A",
    pH: getValue(soilData?.properties?.phh2o),
    organic_carbon: getValue(soilData?.properties?.ocd),
    clay: getValue(soilData?.properties?.clay),
    sand: getValue(soilData?.properties?.sand),
    silt: getValue(soilData?.properties?.silt),
    moisture: null,
    temperature: null,
    health_index: null,
    pest_status: null,
    water_depth: null,
  };
} catch (err) {
  console.error("SoilGrids API fetch failed:", err.message);
}


    // --- LULC: OpenLandMap / MODIS ---
    let lulc = {};
    try {
      const lulcRes = await fetch(`https://openlandmap.org/api/lulc?lat=${lat}&lon=${lon}`);
      const lulcData = await lulcRes.json();
      if (lulcData) lulc = lulcData;
    } catch (err) {
      console.error("LULC fetch failed:", err.message);
      lulc = {};
    }

    res.json({ weather, soil, lulc });
  } catch (err) {
    console.error("Backend error:", err.message);
    res.status(500).json({ msg: "Backend fetch failed" });
  }
});

module.exports = router;
