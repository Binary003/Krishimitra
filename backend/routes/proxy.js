// backend/routes/location.js
const express = require("express");
const router = express.Router();
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Add CORS headers for all requests in this router
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // allow all origins for dev
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

router.get("/location", async (req, res) => {
  let { query } = req.query;
  if (!query) return res.status(400).json({ msg: "Query parameter 'query' is required" });

  query = query.replace(/[:]/g, "");

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "KrishiMitraApp/1.0 vermaanuj973@gmail.com",
          Referer: "http://localhost:5173",
        },
      }
    );

    if (!response.ok)
      return res.status(response.status).json({ msg: "Error fetching location from Nominatim" });

    const data = await response.json();
    if (!data || data.length === 0)
      return res.status(404).json({ msg: "Location not found" });

    const { lat, lon, display_name } = data[0];

    // Return clean JSON to frontend
    res.json({ lat, lon, display_name });
  } catch (err) {
    console.error("Nominatim API error:", err.message);
    res.status(500).json({ msg: "Nominatim API error" });
  }
});

module.exports = router;
