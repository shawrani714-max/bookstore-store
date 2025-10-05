const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');
const { catchAsync } = require('../utils/errorResponse');

// @desc    Get all valid coupons (public)
// @route   GET /api/coupons
// @access  Public
router.get('/', catchAsync(async (req, res) => {
  const coupons = await Coupon.findValid();

  res.json({
    success: true,
    data: coupons.map(coupon => ({
      id: coupon._id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountDisplay: coupon.discountDisplay,
      minimumOrderAmount: coupon.minimumOrderAmount,
      validUntil: coupon.validUntil
    }))
  });
}));

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Private
router.post('/validate', protect, catchAsync(async (req, res) => {
  const { code, orderAmount, items = [] } = req.body;
  const userId = req.user.id;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code is required'
    });
  }

  // Find coupon
  const coupon = await Coupon.findByCode(code);
  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Invalid coupon code'
    });
  }

  // Validate coupon for this user and order
  const validation = coupon.validateForOrder(userId, orderAmount, items);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message
    });
  }

  // Calculate discount
  const discountAmount = coupon.calculateDiscount(orderAmount);

  res.json({
    success: true,
    message: 'Coupon applied successfully',
    data: {
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountDisplay: coupon.discountDisplay,
        discountAmount: discountAmount
      },
      orderSummary: {
        subtotal: orderAmount,
        discount: discountAmount,
        total: orderAmount - discountAmount
      }
    }
  });
}));

// @desc    Get coupon details by code
// @route   GET /api/coupons/:code
// @access  Public
router.get('/:code', catchAsync(async (req, res) => {
  const { code } = req.params;

  const coupon = await Coupon.findByCode(code);
  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Coupon not found'
    });
  }

  res.json({
    success: true,
    data: {
      id: coupon._id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountDisplay: coupon.discountDisplay,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maximumDiscountAmount: coupon.maximumDiscountAmount,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isActive: coupon.isActive,
      remainingUses: coupon.remainingUses
    }
  });
}));

// ===== ADMIN ROUTES =====

// @desc    Create new coupon (admin)
// @route   POST /api/coupons/admin
// @access  Private (Admin)
router.post('/admin', protect, adminOnly, catchAsync(async (req, res) => {
  const {
    code,
    name,
    description,
    discountType,
    discountValue,
    maxUses,
    maxUsesPerUser,
    minimumOrderAmount,
    maximumDiscountAmount,
    validFrom,
    validUntil,
    applicableCategories,
    applicableBooks,
    excludedCategories,
    excludedBooks,
    applicableUsers,
    userGroups,
    isPublic
  } = req.body;

  // Validate required fields
  if (!code || !name || !discountType || !discountValue || !validFrom || !validUntil) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findByCode(code);
  if (existingCoupon) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code already exists'
    });
  }

  // Create coupon
  const coupon = new Coupon({
    code: code.toUpperCase(),
    name,
    description,
    discountType,
    discountValue: parseFloat(discountValue),
    maxUses: maxUses || 1000,
    maxUsesPerUser: maxUsesPerUser || 1,
    minimumOrderAmount: minimumOrderAmount || 0,
    maximumDiscountAmount: maximumDiscountAmount || null,
    validFrom: new Date(validFrom),
    validUntil: new Date(validUntil),
    applicableCategories: applicableCategories || [],
    applicableBooks: applicableBooks || [],
    excludedCategories: excludedCategories || [],
    excludedBooks: excludedBooks || [],
    applicableUsers: applicableUsers || [],
    userGroups: userGroups || ['all'],
    isPublic: isPublic !== undefined ? isPublic : true
  });

  await coupon.save();

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: coupon
  });
}));

// @desc    Get all coupons (admin)
// @route   GET /api/coupons/admin/all
// @access  Private (Admin)
router.get('/admin/all', protect, adminOnly, catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status = 'all' } = req.query;

  let query = {};
  
  // Filter by status
  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  } else if (status === 'expired') {
    query.validUntil = { $lt: new Date() };
  } else if (status === 'upcoming') {
    query.validFrom = { $gt: new Date() };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const coupons = await Coupon.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Coupon.countDocuments(query);
  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: {
      coupons,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
}));

// @desc    Update coupon (admin)
// @route   PUT /api/coupons/admin/:id
// @access  Private (Admin)
router.put('/admin/:id', protect, adminOnly, catchAsync(async (req, res) => {
  const couponId = req.params.id;
  const updateData = req.body;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Coupon not found'
    });
  }

  // Update fields
  Object.keys(updateData).forEach(key => {
    if (key === 'code') {
      coupon.code = updateData[key].toUpperCase();
    } else if (key === 'validFrom' || key === 'validUntil') {
      coupon[key] = new Date(updateData[key]);
    } else if (key === 'discountValue') {
      coupon[key] = parseFloat(updateData[key]);
    } else if (coupon.schema.paths[key]) {
      coupon[key] = updateData[key];
    }
  });

  await coupon.save();

  res.json({
    success: true,
    message: 'Coupon updated successfully',
    data: coupon
  });
}));

// @desc    Delete coupon (admin)
// @route   DELETE /api/coupons/admin/:id
// @access  Private (Admin)
router.delete('/admin/:id', protect, adminOnly, catchAsync(async (req, res) => {
  const couponId = req.params.id;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Coupon not found'
    });
  }

  // Check if coupon has been used
  if (coupon.usedCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete coupon that has been used'
    });
  }

  await Coupon.findByIdAndDelete(couponId);

  res.json({
    success: true,
    message: 'Coupon deleted successfully'
  });
}));

// @desc    Get coupon usage statistics (admin)
// @route   GET /api/coupons/admin/stats
// @access  Private (Admin)
router.get('/admin/stats', protect, adminOnly, catchAsync(async (req, res) => {
  const stats = await Coupon.aggregate([
    {
      $group: {
        _id: null,
        totalCoupons: { $sum: 1 },
        activeCoupons: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        totalUses: { $sum: '$usedCount' },
        averageUses: { $avg: '$usedCount' }
      }
    }
  ]);

  // Get recent usage
  const recentUsage = await Coupon.aggregate([
    { $unwind: '$usageHistory' },
    {
      $sort: { 'usageHistory.usedAt': -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: 'users',
        localField: 'usageHistory.user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'orders',
        localField: 'usageHistory.order',
        foreignField: '_id',
        as: 'order'
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      stats: stats[0] || {
        totalCoupons: 0,
        activeCoupons: 0,
        totalUses: 0,
        averageUses: 0
      },
      recentUsage
    }
  });
}));

// @desc    Get coupon usage history (admin)
// @route   GET /api/coupons/admin/:id/usage
// @access  Private (Admin)
router.get('/admin/:id/usage', protect, adminOnly, catchAsync(async (req, res) => {
  const couponId = req.params.id;
  const { page = 1, limit = 10 } = req.query;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Coupon not found'
    });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const totalUsage = coupon.usageHistory.length;
  const totalPages = Math.ceil(totalUsage / parseInt(limit));

  // Sort usage history by date (newest first)
  const sortedUsage = coupon.usageHistory.sort(
    (a, b) => new Date(b.usedAt) - new Date(a.usedAt)
  );

  const paginatedUsage = sortedUsage.slice(skip, skip + parseInt(limit));

  // Populate user and order details
  await Coupon.populate(paginatedUsage, [
    { path: 'user', select: 'firstName lastName email' },
    { path: 'order', select: 'orderNumber total createdAt' }
  ]);

  res.json({
    success: true,
    data: {
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name
      },
      usage: paginatedUsage,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsage,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
}));

module.exports = router; 