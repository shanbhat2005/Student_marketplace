const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /signup - Register a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Create user
    const user = new User({ name, email, password });
    const savedUser = await user.save();

    // Exclude password from response
    const userData = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      createdAt: savedUser.createdAt
    };

    return res.status(201).json({
      message: 'User registered successfully.',
      user: userData
    });
  } catch (error) {
    console.error('Error in /signup:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /login - Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    return res.status(200).json({ message: 'Login successful.', user: userData });
  } catch (error) {
    console.error('Error in /login:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

