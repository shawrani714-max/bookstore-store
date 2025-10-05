const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required']
  },
  title: {
    type: String,
    required: [true, 'Book title is required']
  },
  author: {
    type: String,
    required: [true, 'Author name is required']
  },
  coverImage: {
    type: String,
    required: [true, 'Cover image is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  // Partial fulfillment fields
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'refunded', 'cancelled'],
    default: 'pending'
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative'],
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'requested'],
    default: 'pending'
  },
  extraPaymentRequested: {
    type: Number,
    min: [0, 'Extra payment cannot be negative'],
    default: 0
  }
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for item total
orderItemSchema.virtual('itemTotal').get(function() {
  const discountedPrice = this.price - (this.price * this.discount / 100);
  return discountedPrice * this.quantity;
});

// Virtual for item savings
orderItemSchema.virtual('itemSavings').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    const savingsPerItem = this.originalPrice - this.price;
    return savingsPerItem * this.quantity;
  }
  return 0;
});

const orderSchema = new mongoose.Schema({
  // Order identification
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // User information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  
  // Order items
  items: [orderItemSchema],
  
  // Order totals
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    default: 0
  },
  shippingCost: {
    type: Number,
    min: [0, 'Shipping cost cannot be negative'],
    default: 0
  },
  tax: {
    type: Number,
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  
  // Coupon information
  couponCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  couponDiscount: {
    type: Number,
    min: [0, 'Coupon discount cannot be negative'],
    default: 0
  },
  
  // Shipping information
  shippingAddress: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [100, 'Street address cannot exceed 100 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
      maxlength: [10, 'ZIP code cannot exceed 10 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'India',
      maxlength: [50, 'Country cannot exceed 50 characters']
    }
  },
  
  // Shipping method
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight'],
    default: 'standard'
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'card', 'upi', 'netbanking'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    trim: true
  },
  paymentDate: Date,
  
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  
  // Tracking information
  trackingNumber: {
    type: String,
    trim: true
  },
  trackingUrl: {
    type: String,
    trim: true
  },
  estimatedDelivery: Date,
  deliveredAt: Date,
  
  // Order notes
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Cancellation/return information
  cancelledAt: Date,
  cancelledBy: {
    type: String,
    enum: ['customer', 'admin', 'system']
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  },
  
  // Return information
  returnedAt: Date,
  returnReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Return reason cannot exceed 200 characters']
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative'],
    default: 0
  },
  refundDate: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order status display
orderSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'returned': 'Returned'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for payment status display
orderSchema.virtual('paymentStatusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending',
    'processing': 'Processing',
    'completed': 'Completed',
    'failed': 'Failed',
    'refunded': 'Refunded'
  };
  return statusMap[this.paymentStatus] || this.paymentStatus;
});

// Virtual for shipping address display
orderSchema.virtual('shippingAddressDisplay').get(function() {
  const addr = this.shippingAddress;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Virtual for customer name
orderSchema.virtual('customerName').get(function() {
  return this.shippingAddress.fullName;
});

// Virtual for item count
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((count, item) => {
    return count + item.quantity;
  }, 0);
});

// Virtual for unique book count
orderSchema.virtual('uniqueItemCount').get(function() {
  return this.items.length;
});

// Virtual for total savings
orderSchema.virtual('totalSavings').get(function() {
  const itemSavings = this.items.reduce((total, item) => {
    return total + item.itemSavings;
  }, 0);
  
  return itemSavings + this.couponDiscount;
});

// ===== PERFORMANCE OPTIMIZED INDEXES =====

// Compound indexes for common queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ orderNumber: 1, user: 1 });
orderSchema.index({ 'shippingAddress.city': 1, status: 1 });
orderSchema.index({ 'shippingAddress.state': 1, status: 1 });

// Single field indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ updatedAt: -1 });
orderSchema.index({ deliveredAt: -1 });
orderSchema.index({ cancelledAt: -1 });
orderSchema.index({ returnedAt: -1 });

// Sparse indexes for optional fields
orderSchema.index({ trackingNumber: 1 }, { sparse: true });
orderSchema.index({ paymentId: 1 }, { sparse: true });
orderSchema.index({ couponCode: 1 }, { sparse: true });

// TTL index for old orders (optional - keep orders for 7 years)
// orderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 220752000 }); // 7 years

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  next();
});

// Post-save middleware to update cache
orderSchema.post('save', function(doc) {
  // Invalidate related caches
  const { cacheService } = require('../config/redis');
  if (cacheService) {
    cacheService.delPattern('orders:*').catch(err => {
      console.error('Cache invalidation error:', err);
    });
  }
});

// Instance method to update order status
orderSchema.methods.updateStatus = function(status, notes = '') {
  this.status = status;
  if (notes) this.notes = notes;
  
  // Set timestamps for specific status changes
  if (status === 'delivered') {
    this.deliveredAt = new Date();
  } else if (status === 'cancelled') {
    this.cancelledAt = new Date();
  } else if (status === 'returned') {
    this.returnedAt = new Date();
  }
  
  return this.save();
};

// Instance method to update payment status
orderSchema.methods.updatePaymentStatus = function(status, paymentId = null) {
  this.paymentStatus = status;
  if (paymentId) this.paymentId = paymentId;
  
  if (status === 'completed') {
    this.paymentDate = new Date();
  }
  
  return this.save();
};

// Instance method to add tracking information
orderSchema.methods.addTracking = function(trackingNumber, trackingUrl = null, estimatedDelivery = null) {
  this.trackingNumber = trackingNumber;
  if (trackingUrl) this.trackingUrl = trackingUrl;
  if (estimatedDelivery) this.estimatedDelivery = estimatedDelivery;
  
  return this.save();
};

// Instance method to cancel order
orderSchema.methods.cancelOrder = function(reason, cancelledBy = 'customer') {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  
  return this.save();
};

// Instance method to return order
orderSchema.methods.returnOrder = function(reason, refundAmount = 0) {
  this.status = 'returned';
  this.returnedAt = new Date();
  this.returnReason = reason;
  this.refundAmount = refundAmount;
  
  if (refundAmount > 0) {
    this.paymentStatus = 'refunded';
    this.refundDate = new Date();
  }
  
  return this.save();
};

// Static method to find orders by user (optimized)
orderSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.status) query.status = options.status;
  if (options.paymentStatus) query.paymentStatus = options.paymentStatus;
  
  return this.find(query)
    .populate('items.book', 'title author coverImage')
    .select('orderNumber status paymentStatus total createdAt items')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20)
    .lean();
};

// Static method to find order by order number (optimized)
orderSchema.statics.findByOrderNumber = function(orderNumber) {
  return this.findOne({ orderNumber })
    .populate('user', 'firstName lastName email')
    .populate('items.book', 'title author coverImage')
    .lean();
};

// Static method to find orders by status (optimized)
orderSchema.statics.findByStatus = function(status, options = {}) {
  return this.find({ status })
    .populate('user', 'firstName lastName email')
    .populate('items.book', 'title author coverImage')
    .select('orderNumber user status paymentStatus total createdAt shippingAddress')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .lean();
};

// Static method to find orders by payment status (optimized)
orderSchema.statics.findByPaymentStatus = function(paymentStatus, options = {}) {
  return this.find({ paymentStatus })
    .populate('user', 'firstName lastName email')
    .populate('items.book', 'title author coverImage')
    .select('orderNumber user status paymentStatus total createdAt')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .lean();
};

// Static method to get order statistics (optimized)
orderSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get sales analytics
orderSchema.statics.getSalesAnalytics = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['delivered', 'shipped'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalRevenue: { $sum: '$total' },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: '$total' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to get top selling books
orderSchema.statics.getTopSellingBooks = function(limit = 10, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['delivered', 'shipped'] }
      }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.book',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        bookTitle: { $first: '$items.title' },
        bookAuthor: { $first: '$items.author' }
      }
    },
    {
      $sort: { totalQuantity: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Static method to get orders with pagination (optimized)
orderSchema.statics.getOrdersWithPagination = function(filters = {}, options = {}) {
  const query = {};
  
  // Apply filters
  if (filters.user) query.user = filters.user;
  if (filters.status) query.status = filters.status;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.startDate) query.createdAt = { $gte: filters.startDate };
  if (filters.endDate) query.createdAt = { ...query.createdAt, $lte: filters.endDate };
  
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 20;
  const skip = (page - 1) * limit;
  
  const sort = options.sort || { createdAt: -1 };
  
  return this.find(query)
    .populate('user', 'firstName lastName email')
    .populate('items.book', 'title author coverImage')
    .select('orderNumber user status paymentStatus total createdAt shippingAddress')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);