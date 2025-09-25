const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  // Coupon identification
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Coupon code cannot exceed 20 characters']
  },
  
  // Coupon details
  name: {
    type: String,
    required: [true, 'Coupon name is required'],
    trim: true,
    maxlength: [100, 'Coupon name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Discount type and amount
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  
  // Usage limits
  maxUses: {
    type: Number,
    min: [1, 'Max uses must be at least 1'],
    default: 1000
  },
  usedCount: {
    type: Number,
    min: [0, 'Used count cannot be negative'],
    default: 0
  },
  maxUsesPerUser: {
    type: Number,
    min: [1, 'Max uses per user must be at least 1'],
    default: 1
  },
  
  // Minimum order requirements
  minimumOrderAmount: {
    type: Number,
    min: [0, 'Minimum order amount cannot be negative'],
    default: 0
  },
  maximumDiscountAmount: {
    type: Number,
    min: [0, 'Maximum discount amount cannot be negative']
  },
  
  // Validity period
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  
  // Applicability
  applicableCategories: [{
    type: String,
    trim: true
  }],
  applicableBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  excludedCategories: [{
    type: String,
    trim: true
  }],
  excludedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  
  // User restrictions
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  userGroups: [{
    type: String,
    enum: ['new_users', 'existing_users', 'vip_users', 'all']
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Usage tracking
  usageHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    discountAmount: {
      type: Number,
      required: true
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for remaining uses
couponSchema.virtual('remainingUses').get(function() {
  return Math.max(0, this.maxUses - this.usedCount);
});

// Virtual for is valid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         now >= this.validFrom && 
         now <= this.validUntil && 
         this.usedCount < this.maxUses;
});

// Virtual for discount display
couponSchema.virtual('discountDisplay').get(function() {
  if (this.discountType === 'percentage') {
    return `${this.discountValue}% OFF`;
  } else if (this.discountType === 'fixed') {
    return `₹${this.discountValue} OFF`;
  } else if (this.discountType === 'free_shipping') {
    return 'FREE SHIPPING';
  }
  return '';
});

// Indexes for better query performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isPublic: 1 });

// Pre-save middleware to validate dates
couponSchema.pre('save', function(next) {
  if (this.validFrom >= this.validUntil) {
    return next(new Error('Valid from date must be before valid until date'));
  }
  next();
});

// Static method to find valid coupons
couponSchema.statics.findValid = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    isPublic: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $expr: { $lt: ['$usedCount', '$maxUses'] }
  });
};

// Static method to find coupon by code
couponSchema.statics.findByCode = function(code) {
  return this.findOne({ 
    code: code.toUpperCase(),
    isActive: true
  });
};

// Instance method to validate coupon for user and order
couponSchema.methods.validateForOrder = function(userId, orderAmount, items = []) {
  // Check if coupon is valid
  if (!this.isValid) {
    return { valid: false, message: 'Coupon is not valid' };
  }
  
  // Check minimum order amount
  if (orderAmount < this.minimumOrderAmount) {
    return { 
      valid: false, 
      message: `Minimum order amount of ₹${this.minimumOrderAmount} required` 
    };
  }
  
  // Check user usage limit
  const userUsageCount = this.usageHistory.filter(
    usage => usage.user.toString() === userId.toString()
  ).length;
  
  if (userUsageCount >= this.maxUsesPerUser) {
    return { 
      valid: false, 
      message: 'You have already used this coupon maximum times' 
    };
  }
  
  // Check if user is applicable
  if (this.applicableUsers.length > 0 && 
      !this.applicableUsers.some(id => id.toString() === userId.toString())) {
    return { valid: false, message: 'Coupon not applicable for this user' };
  }
  
  return { valid: true };
};

// Instance method to calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
  } else if (this.discountType === 'fixed') {
    discount = this.discountValue;
  } else if (this.discountType === 'free_shipping') {
    // This would be handled separately in shipping calculation
    discount = 0;
  }
  
  // Apply maximum discount limit
  if (this.maximumDiscountAmount && discount > this.maximumDiscountAmount) {
    discount = this.maximumDiscountAmount;
  }
  
  return Math.min(discount, orderAmount);
};

// Instance method to use coupon
couponSchema.methods.useCoupon = function(userId, orderId, discountAmount) {
  this.usedCount += 1;
  this.usageHistory.push({
    user: userId,
    order: orderId,
    discountAmount: discountAmount
  });
  
  return this.save();
};

module.exports = mongoose.model('Coupon', couponSchema); 
