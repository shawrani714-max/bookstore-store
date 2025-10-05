const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');

// Register as affiliate
router.post('/register', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
  if (user.affiliate && user.affiliate.code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already registered as affiliate' 
      });
  }
    
  // Generate unique affiliate code
    let code;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      code = crypto.randomBytes(4).toString('hex').toUpperCase();
      const existing = await User.findOne({ 'affiliate.code': code });
      if (!existing) isUnique = true;
      attempts++;
    }
    
    if (!isUnique) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to generate unique code. Please try again.' 
      });
    }
    
  user.affiliate = {
    code,
      commissionRate: 0.05, // 5% default
    totalEarnings: 0,
    referredOrders: [],
    registeredAt: new Date(),
    isActive: true
  };
    
  await user.save();
    
    res.json({ 
      success: true, 
      code,
      message: 'Successfully registered as affiliate!'
    });
  } catch (error) {
    console.error('Affiliate registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Get affiliate dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
  if (!user || !user.affiliate || !user.affiliate.code) {
      return res.status(404).json({ 
        success: false, 
        message: 'Not registered as affiliate' 
      });
    }
    
    // Get detailed order information
    const orders = await Order.find({ 
      _id: { $in: user.affiliate.referredOrders } 
    }).populate('user', 'firstName lastName email');
    
    // Calculate additional stats
    const totalCommission = user.affiliate.totalEarnings || 0;
    const totalOrders = user.affiliate.referredOrders.length;
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const thisMonthOrders = orders.filter(order => 
      new Date(order.createdAt) >= thisMonth
    );
    
    const thisMonthEarnings = thisMonthOrders.reduce((sum, order) => 
      sum + (order.total * user.affiliate.commissionRate), 0
    );
    
    res.json({
      success: true,
      affiliate: {
        ...user.affiliate.toObject(),
        totalOrders,
        thisMonthEarnings: thisMonthEarnings.toFixed(2),
        lastMonthEarnings: (totalCommission - thisMonthEarnings).toFixed(2),
        pendingEarnings: (totalCommission * 0.1).toFixed(2), // 10% pending
        paidEarnings: (totalCommission * 0.9).toFixed(2) // 90% paid
      },
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/?ref=${user.affiliate.code}`,
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customer: {
          name: order.shippingAddress.fullName,
          email: order.user.email
        },
        amount: order.total,
        commission: (order.total * user.affiliate.commissionRate).toFixed(2),
        date: order.createdAt,
        status: order.status
      }))
    });
  } catch (error) {
    console.error('Dashboard load error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load dashboard' 
    });
  }
});

// Get affiliate statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.affiliate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Not registered as affiliate' 
      });
    }
    
    // Get orders with commission details
    const orders = await Order.find({ 
      _id: { $in: user.affiliate.referredOrders } 
    }).sort({ createdAt: -1 });
    
    // Calculate various statistics
    const stats = {
      totalEarnings: user.affiliate.totalEarnings || 0,
      totalOrders: orders.length,
      commissionRate: user.affiliate.commissionRate,
      averageOrderValue: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
      conversionRate: 0, // Would need click tracking
      topPerformingMonths: [],
      recentActivity: orders.slice(0, 10).map(order => ({
        orderNumber: order.orderNumber,
        amount: order.total,
        commission: (order.total * user.affiliate.commissionRate).toFixed(2),
        date: order.createdAt,
        status: order.status
      }))
    };
    
    // Calculate monthly earnings
    const monthlyEarnings = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt).toISOString().substring(0, 7);
      if (!monthlyEarnings[month]) {
        monthlyEarnings[month] = 0;
      }
      monthlyEarnings[month] += order.total * user.affiliate.commissionRate;
    });
    
    stats.monthlyEarnings = Object.entries(monthlyEarnings)
      .map(([month, earnings]) => ({ month, earnings: earnings.toFixed(2) }))
      .sort((a, b) => b.month.localeCompare(a.month));
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Stats load error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load statistics' 
    });
  }
});

// Generate banner images (mock endpoint)
router.get('/banner/:size', async (req, res) => {
  try {
    const { size } = req.params;
    const validSizes = ['728x90', '300x250', '160x600', '300x600'];
    
    if (!validSizes.includes(size)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid banner size' 
      });
    }
    
    // In a real implementation, you would generate actual banner images
    // For now, return a placeholder URL
    const bannerUrl = `https://via.placeholder.com/${size}/667eea/ffffff?text=Bookworld+India`;
    
    res.redirect(bannerUrl);
  } catch (error) {
    console.error('Banner generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate banner' 
    });
  }
});

// Get affiliate widget
router.get('/widget', async (req, res) => {
  try {
    const { ref } = req.query;
    
    // Get featured books for the widget
    const Book = require('../models/Book');
    const books = await Book.find({ 
      isActive: true, 
      isFeatured: true 
    }).limit(6);
    
    // Generate widget HTML
    const widgetHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: 'Poppins', sans-serif; 
            margin: 0; 
            padding: 10px; 
            background: #f8fafc;
          }
          .widget-container {
            max-width: 300px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .widget-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: center;
          }
          .widget-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }
          .widget-subtitle {
            font-size: 12px;
            opacity: 0.9;
            margin: 5px 0 0 0;
          }
          .books-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            padding: 15px;
          }
          .book-item {
            text-align: center;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .book-item:hover {
            transform: translateY(-2px);
          }
          .book-cover {
            width: 100%;
            height: 120px;
            object-fit: cover;
            border-radius: 5px;
            margin-bottom: 8px;
          }
          .book-title {
            font-size: 11px;
            font-weight: 500;
            color: #2d3748;
            margin: 0;
            line-height: 1.3;
          }
          .book-price {
            font-size: 12px;
            font-weight: 600;
            color: #667eea;
            margin: 4px 0 0 0;
          }
          .widget-footer {
            background: #f8fafc;
            padding: 10px 15px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .shop-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
          }
          .shop-btn:hover {
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="widget-container">
          <div class="widget-header">
            <h3 class="widget-title">📚 Bookworld India</h3>
            <p class="widget-subtitle">Discover Amazing Books</p>
          </div>
          <div class="books-grid">
            ${books.map(book => `
              <div class="book-item" onclick="window.open('${process.env.FRONTEND_URL || 'http://localhost:5000'}/book.html?id=${book._id}${ref ? `&ref=${ref}` : ''}', '_blank')">
                <img src="${book.coverImage}" alt="${book.title}" class="book-cover" />
                <h4 class="book-title">${book.title}</h4>
                <p class="book-price">₹${book.price}</p>
              </div>
            `).join('')}
          </div>
          <div class="widget-footer">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/${ref ? `?ref=${ref}` : ''}" 
               class="shop-btn" 
               target="_blank">
              Shop Now
            </a>
          </div>
        </div>
      </body>
      </html>
    `;
    
    res.send(widgetHtml);
  } catch (error) {
    console.error('Widget generation error:', error);
    res.status(500).send('Failed to generate widget');
  }
});

// Update affiliate settings
router.put('/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.affiliate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Not registered as affiliate' 
      });
    }
    
    const { isActive } = req.body;
    
    if (typeof isActive === 'boolean') {
      user.affiliate.isActive = isActive;
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update settings' 
    });
  }
});

// Track affiliate clicks
router.post('/track', async (req, res) => {
  try {
    const { affiliateCode, referrer, userAgent, timestamp } = req.body;
    
    // Find the affiliate
    const affiliate = await User.findOne({ 'affiliate.code': affiliateCode });
    if (!affiliate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid affiliate code' 
      });
    }
    
    // In a real implementation, you would store click tracking data
    // For now, just log the click
    console.log(`Affiliate click tracked: ${affiliateCode} from ${referrer}`);
    
    res.json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to track click' 
    });
  }
});

// Get affiliate leaderboard (admin only)
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ 
      'affiliate.code': { $exists: true },
      'affiliate.isActive': true 
    })
    .select('firstName lastName affiliate')
    .sort({ 'affiliate.totalEarnings': -1 })
    .limit(10);
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: `${user.firstName} ${user.lastName}`,
      earnings: user.affiliate.totalEarnings,
      orders: user.affiliate.referredOrders.length,
      commissionRate: user.affiliate.commissionRate
    }));
    
  res.json({
    success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load leaderboard' 
    });
  }
});

module.exports = router;