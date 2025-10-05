const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Affiliate marketing fields
const affiliateSchema = new mongoose.Schema({
  code: { type: String, unique: true, trim: true },
  commissionRate: { type: Number, default: 0.05 }, // 5% default
  totalEarnings: { type: Number, default: 0 },
  referredOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  registeredAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  // Basic information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [15, 'Phone number cannot exceed 15 characters']
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Profile information
  avatar: {
    type: String,
    default: null
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  
  // Address information
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  
  // Preferences
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // Status and activity
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  
  // Role and permissions
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  
  // Affiliate marketing
  affiliate: affiliateSchema,
  
  // Two-factor authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  
  // Session management
  activeSessions: [{
    token: String,
    device: String,
    ipAddress: String,
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.fullName;
});

// ===== PERFORMANCE OPTIMIZED INDEXES =====

// Compound indexes for common queries
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ isActive: 1, role: 1 });
userSchema.index({ isActive: 1, isEmailVerified: 1 });
userSchema.index({ 'affiliate.code': 1 }, { sparse: true });
userSchema.index({ lastLogin: -1, isActive: 1 });

// Single field indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ isActive: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isAdmin: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ updatedAt: -1 });

// Sparse indexes for optional fields
userSchema.index({ passwordResetToken: 1 }, { sparse: true });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ twoFactorSecret: 1 }, { sparse: true });

// TTL index for password reset tokens (expire after 10 minutes)
userSchema.index({ passwordResetExpires: 1 }, { expireAfterSeconds: 600 });

// TTL index for email verification tokens (expire after 24 hours)
userSchema.index({ emailVerificationExpires: 1 }, { expireAfterSeconds: 86400 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update cache
userSchema.post('save', function(doc) {
  // Invalidate related caches
  const { cacheService } = require('../config/redis');
  if (cacheService) {
    cacheService.delPattern('user:*').catch(err => {
      console.error('Cache invalidation error:', err);
    });
  }
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Instance method to create email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Instance method to add session
userSchema.methods.addSession = function(token, device, ipAddress) {
  this.activeSessions.push({
    token,
    device,
    ipAddress,
    lastActivity: new Date()
  });
  return this.save();
};

// Instance method to remove session
userSchema.methods.removeSession = function(token) {
  this.activeSessions = this.activeSessions.filter(
    session => session.token !== token
  );
  return this.save();
};

// Instance method to clean old sessions
userSchema.methods.cleanOldSessions = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  this.activeSessions = this.activeSessions.filter(
    session => session.lastActivity > thirtyDaysAgo
  );
  return this.save();
};

// Static method to find by email (optimized)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
    .select('+password')
    .lean();
};

// Static method to find active users (optimized)
userSchema.statics.findActive = function(options = {}) {
  const query = { isActive: true };
  
  if (options.role) query.role = options.role;
  if (options.isEmailVerified !== undefined) query.isEmailVerified = options.isEmailVerified;
  
  return this.find(query)
    .select('firstName lastName email role isEmailVerified lastLogin createdAt')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .lean();
};

// Static method to get user statistics (optimized)
userSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
        },
        adminUsers: {
          $sum: { $cond: [{ $eq: ['$isAdmin', true] }, 1, 0] }
        },
        affiliateUsers: {
          $sum: { $cond: [{ $ne: ['$affiliate.code', null] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get user growth statistics
userSchema.statics.getUserGrowth = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to find users by role (optimized)
userSchema.statics.findByRole = function(role, options = {}) {
  return this.find({ role, isActive: true })
    .select('firstName lastName email role lastLogin createdAt')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .lean();
};

// Static method to find affiliate users (optimized)
userSchema.statics.findAffiliateUsers = function(options = {}) {
  return this.find({ 
    'affiliate.code': { $exists: true },
    'affiliate.isActive': true,
    isActive: true 
  })
    .select('firstName lastName email affiliate.code affiliate.totalEarnings affiliate.registeredAt')
    .sort({ 'affiliate.totalEarnings': -1 })
    .limit(options.limit || 50)
    .lean();
};

// Instance method to get user activity summary
userSchema.methods.getActivitySummary = function() {
  return {
    totalLogins: this.loginCount,
    lastLogin: this.lastLogin,
    activeSessions: this.activeSessions.length,
    isEmailVerified: this.isEmailVerified,
    memberSince: this.createdAt,
    isAffiliate: !!this.affiliate?.code
  };
};

// Instance method to update preferences
userSchema.methods.updatePreferences = function(preferences) {
  this.preferences = { ...this.preferences, ...preferences };
  return this.save();
};

// Instance method to add address
userSchema.methods.addAddress = function(address) {
  // If this is the first address or marked as default, make it default
  if (this.addresses.length === 0 || address.isDefault) {
    // Remove default from other addresses
    this.addresses.forEach(addr => addr.isDefault = false);
    address.isDefault = true;
  }
  
  this.addresses.push(address);
  return this.save();
};

// Instance method to update address
userSchema.methods.updateAddress = function(addressId, addressData) {
  const address = this.addresses.id(addressId);
  if (!address) {
    throw new Error('Address not found');
  }
  
  // If setting as default, remove default from others
  if (addressData.isDefault) {
    this.addresses.forEach(addr => addr.isDefault = false);
  }
  
  Object.assign(address, addressData);
  return this.save();
};

// Instance method to remove address
userSchema.methods.removeAddress = function(addressId) {
  const address = this.addresses.id(addressId);
  if (!address) {
    throw new Error('Address not found');
  }
  
  const wasDefault = address.isDefault;
  address.remove();
  
  // If removed address was default, make first remaining address default
  if (wasDefault && this.addresses.length > 0) {
    this.addresses[0].isDefault = true;
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);