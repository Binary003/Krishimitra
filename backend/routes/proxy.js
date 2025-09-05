const express = require("express");
const fetch = require("node-fetch"); // ensure you have installed node-fetch
const router = express.Router();

/**
 * @route   GET /api/proxy/nominatim
 * @desc    Search for locations using OpenStreetMap Nominatim API
 * @query   q => search query string
 * @return  JSON array of places
 */
router.get("/nominatim", async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ msg: "Query parameter 'q' is required" });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Nominatim API error:", err.message);
    res.status(500).json({ msg: "Nominatim API error" });
  }
});

/**
 * TODO: Add other proxy routes here
 * Example:
 * router.get("/weather", async (req, res) => { ... });
 */

module.exports = router;
