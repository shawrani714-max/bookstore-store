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

// Indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.email': 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  next();
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

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId })
    .populate('items.book')
    .sort({ createdAt: -1 });
};

// Static method to find order by order number
orderSchema.statics.findByOrderNumber = function(orderNumber) {
  return this.findOne({ orderNumber }).populate('items.book');
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('user', 'firstName lastName email')
    .populate('items.book')
    .sort({ createdAt: -1 });
};

// Static method to find orders by payment status
orderSchema.statics.findByPaymentStatus = function(paymentStatus) {
  return this.find({ paymentStatus })
    .populate('user', 'firstName lastName email')
    .populate('items.book')
    .sort({ createdAt: -1 });
};

// Static method to get order statistics
orderSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
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
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0
  };
};

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
