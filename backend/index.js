require("dotenv").config();
const express = require("express");
const cors = require("cors");  // ⬅️ add this
const connectDB = require("./config/db");
const mapDetailsRoute = require("./routes/mapDetails");


const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// ✅ Allow frontend requests
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // React frontend URLs
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
app.use("/api/proxy", require("./routes/proxy"));
app.use("/api/mapDetails", require("./routes/mapDetails"));
app.use("/api/mandi", require("./routes/mandiPrices"));
app.use("/api/chatbot", require("./routes/aiChatbot"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
