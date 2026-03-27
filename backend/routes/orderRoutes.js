const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET /mine/:userId - Get all orders placed by an authenticated user
router.get('/mine/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.params.userId })
      .populate('seller', 'name email')
      .populate('book', 'title imageUrl')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
