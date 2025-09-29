const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const adminSchema = new mongoose.Schema({
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
  
  // Role and permissions
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'manager', 'staff'],
    default: 'staff'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_books',
      'manage_orders',
      'manage_inventory',
      'manage_coupons',
      'view_analytics',
      'manage_settings',
      'manage_reviews',
      'manage_shipping',
      'manage_payments'
    ]
  }],
  
  // Profile information
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Department cannot exceed 50 characters']
  },
  
  // Status and activity
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  
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
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
adminSchema.virtual('displayName').get(function() {
  return this.fullName;
});

// Virtual for role display
adminSchema.virtual('roleDisplay').get(function() {
  const roleMap = {
    'super_admin': 'Super Admin',
    'admin': 'Administrator',
    'manager': 'Manager',
    'staff': 'Staff'
  };
  return roleMap[this.role] || this.role;
});

// Virtual for permission check
adminSchema.virtual('hasPermission').get(function() {
  return (permission) => {
    if (this.role === 'super_admin') return true;
    return this.permissions.includes(permission);
  };
});

// Indexes for better query performance
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
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

// Instance method to check password
adminSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after token was issued
adminSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
adminSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Instance method to update last login
adminSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Instance method to add session
adminSchema.methods.addSession = function(token, device, ipAddress) {
  this.activeSessions.push({
    token,
    device,
    ipAddress,
    lastActivity: new Date()
  });
  return this.save();
};

// Instance method to remove session
adminSchema.methods.removeSession = function(token) {
  this.activeSessions = this.activeSessions.filter(
    session => session.token !== token
  );
  return this.save();
};

// Instance method to clean old sessions
adminSchema.methods.cleanOldSessions = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  this.activeSessions = this.activeSessions.filter(
    session => session.lastActivity > thirtyDaysAgo
  );
  return this.save();
};

// Static method to find by email
adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active admins
adminSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to find by role
adminSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true }).sort({ createdAt: -1 });
};

// Static method to get admin statistics
adminSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalAdmins: { $sum: 1 },
        activeAdmins: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        superAdmins: {
          $sum: { $cond: [{ $eq: ['$role', 'super_admin'] }, 1, 0] }
        },
        admins: {
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        },
        managers: {
          $sum: { $cond: [{ $eq: ['$role', 'manager'] }, 1, 0] }
        },
        staff: {
          $sum: { $cond: [{ $eq: ['$role', 'staff'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalAdmins: 0,
    activeAdmins: 0,
    superAdmins: 0,
    admins: 0,
    managers: 0,
    staff: 0
  };
};

module.exports = mongoose.model('Admin', adminSchema); 