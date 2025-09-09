const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');

// Register as affiliate
router.post('/register', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.affiliate && user.affiliate.code) {
    return res.status(400).json({ success: false, message: 'Already registered as affiliate' });
  }
  // Generate unique affiliate code
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  user.affiliate = {
    code,
    commissionRate: 0.05,
    totalEarnings: 0,
    referredOrders: [],
    registeredAt: new Date(),
    isActive: true
  };
  await user.save();
  res.json({ success: true, code });
});

// Get affiliate dashboard
router.get('/dashboard', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || !user.affiliate || !user.affiliate.code) {
    return res.status(404).json({ success: false, message: 'Not an affiliate' });
  }
  res.json({
    success: true,
    affiliate: user.affiliate,
    referralLink: `${process.env.BASE_URL || 'http://localhost:5000'}/?ref=${user.affiliate.code}`
  });
});

module.exports = router;
