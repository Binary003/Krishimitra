require("dotenv").config();
const express = require("express");
const cors = require("cors");  // ⬅️ add this
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// ✅ Allow frontend requests
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Test Root Route
app.get("/", (req, res) => {
  res.send("Backend is running and connected to MongoDB");
});

// Use Auth routes
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
