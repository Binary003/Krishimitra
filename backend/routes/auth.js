const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Helper function to validate email
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Helper function to validate phone number (simple regex for 10 digits)
const isPhone = (value) => /^\d{10}$/.test(value);

// ================== SIGNUP ==================
router.post("/signup", async (req, res) => {
  try {
    const { name, contact, password } = req.body;

    if (!name || !contact || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Decide if contact is email or phone
    let userData = { name, password: await bcrypt.hash(password, 10) };

    if (isEmail(contact)) {
      userData.email = contact;
      // Check if email exists
      if (await User.findOne({ email: contact })) {
        return res.status(400).json({ msg: "Email already registered" });
      }
    } else if (isPhone(contact)) {
      userData.phone = contact;
      // Check if phone exists
      if (await User.findOne({ phone: contact })) {
        return res.status(400).json({ msg: "Phone already registered" });
      }
    } else {
      return res.status(400).json({ msg: "Enter a valid email or 10-digit phone number" });
    }

    // Save user
    const user = new User(userData);
    await user.save();

    res.json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================== LOGIN ==================
router.post("/login", async (req, res) => {
  try {
    const { contact, password } = req.body;

    if (!contact || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Find user by email or phone
    let user;
    if (isEmail(contact)) {
      user = await User.findOne({ email: contact });
    } else if (isPhone(contact)) {
      user = await User.findOne({ phone: contact });
    }

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

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
