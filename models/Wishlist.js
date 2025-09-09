const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required']
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  },
  items: [wishlistItemSchema],
  isPublic: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Wishlist name cannot exceed 100 characters'],
    default: 'My Wishlist'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
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

// Virtual for item count
wishlistSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Virtual for wishlist status
wishlistSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Indexes for better query performance
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.book': 1 });
wishlistSchema.index({ isPublic: 1 });

// Pre-save middleware to update lastUpdated
wishlistSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Instance method to add book to wishlist
wishlistSchema.methods.addBook = function(bookId, notes = '') {
  const existingItemIndex = this.items.findIndex(item => 
    item.book.toString() === bookId.toString()
  );

  if (existingItemIndex > -1) {
    // Update existing item notes if provided
    if (notes) {
      this.items[existingItemIndex].notes = notes;
    }
    this.items[existingItemIndex].addedAt = new Date();
  } else {
    // Add new item
    this.items.push({
      book: bookId,
      notes,
      addedAt: new Date()
    });
  }

  return this.save();
};

// Instance method to remove book from wishlist
wishlistSchema.methods.removeBook = function(bookId) {
  const itemIndex = this.items.findIndex(item => 
    item.book.toString() === bookId.toString()
  );

  if (itemIndex > -1) {
    this.items.splice(itemIndex, 1);
    return this.save();
  }
  
  throw new Error('Book not found in wishlist');
};

// Instance method to update book notes
wishlistSchema.methods.updateBookNotes = function(bookId, notes) {
  const itemIndex = this.items.findIndex(item => 
    item.book.toString() === bookId.toString()
  );

  if (itemIndex > -1) {
    this.items[itemIndex].notes = notes;
    return this.save();
  }
  
  throw new Error('Book not found in wishlist');
};

// Instance method to clear wishlist
wishlistSchema.methods.clearWishlist = function() {
  this.items = [];
  return this.save();
};

// Instance method to check if book is in wishlist
wishlistSchema.methods.hasBook = function(bookId) {
  return this.items.some(item => 
    item.book.toString() === bookId.toString()
  );
};

// Instance method to move book to cart (remove from wishlist)
wishlistSchema.methods.moveToCart = function(bookId) {
  const itemIndex = this.items.findIndex(item => 
    item.book.toString() === bookId.toString()
  );

  if (itemIndex > -1) {
    const book = this.items[itemIndex];
    this.items.splice(itemIndex, 1);
    return this.save().then(() => book);
  }
  
  throw new Error('Book not found in wishlist');
};

// Static method to find wishlist by user
wishlistSchema.statics.findByUser = function(userId) {
  return this.findOne({ user: userId }).populate('items.book');
};

// Static method to create or get wishlist for user
wishlistSchema.statics.findOrCreateByUser = async function(userId) {
  let wishlist = await this.findOne({ user: userId });
  
  if (!wishlist) {
    wishlist = new this({ 
      user: userId, 
      items: [],
      name: 'My Wishlist'
    });
    await wishlist.save();
  }
  
  return wishlist;
};

// Static method to find public wishlists
wishlistSchema.statics.findPublic = function() {
  return this.find({ isPublic: true })
    .populate('user', 'firstName lastName')
    .populate('items.book')
    .sort({ lastUpdated: -1 });
};

// Static method to find wishlists by book
wishlistSchema.statics.findByBook = function(bookId) {
  return this.find({ 'items.book': bookId })
    .populate('user', 'firstName lastName')
    .populate('items.book');
};

module.exports = mongoose.model('Wishlist', wishlistSchema); 