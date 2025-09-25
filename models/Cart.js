const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [100, 'Quantity cannot exceed 100']
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
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for item total price
cartItemSchema.virtual('itemTotal').get(function() {
  const discountedPrice = this.price - (this.price * this.discount / 100);
  return discountedPrice * this.quantity;
});

// Virtual for item savings
cartItemSchema.virtual('itemSavings').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    const savingsPerItem = this.originalPrice - this.price;
    return savingsPerItem * this.quantity;
  }
  return 0;
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  },
  items: [cartItemSchema],
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
  couponType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  shippingAddress: {
    street: {
      type: String,
      trim: true,
      maxlength: [100, 'Street address cannot exceed 100 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [10, 'ZIP code cannot exceed 10 characters']
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
      maxlength: [50, 'Country cannot exceed 50 characters']
    }
  },
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight'],
    default: 'standard'
  },
  shippingCost: {
    type: Number,
    min: [0, 'Shipping cost cannot be negative'],
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subtotal (before discounts)
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

// Virtual for total discount
cartSchema.virtual('totalDiscount').get(function() {
  const itemDiscounts = this.items.reduce((total, item) => {
    return total + item.itemSavings;
  }, 0);
  
  return itemDiscounts + this.couponDiscount;
});

// Virtual for total before shipping
cartSchema.virtual('totalBeforeShipping').get(function() {
  return this.subtotal - this.totalDiscount;
});

// Virtual for final total
cartSchema.virtual('total').get(function() {
  return this.totalBeforeShipping + this.shippingCost;
});

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((count, item) => {
    return count + item.quantity;
  }, 0);
});

// Virtual for unique book count
cartSchema.virtual('uniqueItemCount').get(function() {
  return this.items.length;
});

// Virtual for cart status
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Indexes for better query performance
cartSchema.index({ user: 1 });
cartSchema.index({ 'items.book': 1 });

// Pre-save middleware to update lastUpdated
cartSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Instance method to add item to cart
cartSchema.methods.addItem = function(bookId, quantity = 1, price, originalPrice = null, discount = 0) {
  const existingItemIndex = this.items.findIndex(item => 
    item.book.toString() === bookId.toString()
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price;
    if (originalPrice) this.items[existingItemIndex].originalPrice = originalPrice;
    this.items[existingItemIndex].discount = discount;
    this.items[existingItemIndex].addedAt = new Date();
  } else {
    // Add new item
    this.items.push({
      book: bookId,
      quantity,
      price,
      originalPrice,
      discount,
      addedAt: new Date()
    });
  }

  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(bookId, quantity) {
  const itemIndex = this.items.findIndex(item => 
    item.book.toString() === bookId.toString()
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      this.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      this.items[itemIndex].quantity = quantity;
    }
    return this.save();
  }
  
  throw new Error('Item not found in cart');
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(bookId) {
  const itemIndex = this.items.findIndex(item => 
    item.book.toString() === bookId.toString()
  );

  if (itemIndex > -1) {
    this.items.splice(itemIndex, 1);
    return this.save();
  }
  
  throw new Error('Item not found in cart');
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.couponCode = null;
  this.couponDiscount = 0;
  this.couponType = 'percentage';
  return this.save();
};

// Instance method to apply coupon
cartSchema.methods.applyCoupon = function(code, discount, type = 'percentage') {
  this.couponCode = code;
  this.couponDiscount = discount;
  this.couponType = type;
  return this.save();
};

// Instance method to remove coupon
cartSchema.methods.removeCoupon = function() {
  this.couponCode = null;
  this.couponDiscount = 0;
  this.couponType = 'percentage';
  return this.save();
};

// Static method to find cart by user
cartSchema.statics.findByUser = function(userId) {
  return this.findOne({ user: userId }).populate('items.book');
};

// Static method to create or get cart for user
cartSchema.statics.findOrCreateByUser = async function(userId) {
  let cart = await this.findOne({ user: userId });
  
  if (!cart) {
    cart = new this({ user: userId, items: [] });
    await cart.save();
  }
  
  return cart;
};

module.exports = mongoose.model('Cart', cartSchema); 
