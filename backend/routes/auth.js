const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Helper function to validate email
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Helper function to validate phone number (simple regex for 10 digits)
const isPhone = (value) => /^\d{10}$/.test(value);

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, contact, password } = req.body;

    if (!name || !contact || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Validate contact
    if (!isEmail(contact) && !isPhone(contact)) {
      return res.status(400).json({ msg: "Enter a valid email or 10-digit phone number" });
    }

    // Check if user already exists
    let user = await User.findOne({ contact });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    user = new User({ name, contact, password: hashedPassword });
    await user.save();

    res.json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { contact, password } = req.body;

    if (!contact || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Find user by contact
    const user = await User.findOne({ contact });
    if (!user) {
      return res.status(400).json({ msg: "User not registered" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    // Sign token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: { id: user._id, name: user.name, contact: user.contact } });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
