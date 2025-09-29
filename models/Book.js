const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  // Basic book information
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    match: [/^(?:\d{10}|\d{13})$/, 'ISBN must be 10 or 13 digits']
  },
  
  // Description and details
  description: {
    type: String,
    required: [true, 'Book description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  
  // Categories and tags
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance', 
      'Thriller', 'Biography', 'History', 'Science', 'Technology', 
      'Self-Help', 'Business', 'Cooking', 'Travel', 'Children', 
      'Young Adult', 'Poetry', 'Drama', 'Comics', 'Academic'
    ]
  },
  subCategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Sub-category cannot exceed 50 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  // Publishing information
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher name cannot exceed 100 characters']
  },
  publishDate: {
    type: Date
  },
  edition: {
    type: String,
    trim: true,
    maxlength: [20, 'Edition cannot exceed 20 characters']
  },
  language: {
    type: String,
    default: 'English',
    trim: true,
    maxlength: [30, 'Language cannot exceed 30 characters']
  },
  
  // Physical details
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1'],
    max: [10000, 'Pages cannot exceed 10000']
  },
  format: {
    type: String,
    enum: ['Hardcover', 'Paperback', 'E-Book', 'Audiobook', 'Digital'],
    default: 'Paperback'
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    }
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  
  // Pricing and inventory
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
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  
  // Advanced Inventory Management
  lowStockThreshold: {
    type: Number,
    min: [0, 'Low stock threshold cannot be negative'],
    default: 5
  },
  reorderPoint: {
    type: Number,
    min: [0, 'Reorder point cannot be negative'],
    default: 10
  },
  reorderQuantity: {
    type: Number,
    min: [1, 'Reorder quantity must be at least 1'],
    default: 50
  },
  supplier: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Supplier name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true
    },
    cost: {
      type: Number,
      min: [0, 'Supplier cost cannot be negative']
    }
  },
  lastRestocked: {
    type: Date
  },
  nextRestockDate: {
    type: Date
  },
  reservedQuantity: {
    type: Number,
    min: [0, 'Reserved quantity cannot be negative'],
    default: 0
  },
  
  // Shipping Information
  shippingWeight: {
    type: Number,
    min: [0, 'Shipping weight cannot be negative']
  },
  shippingClass: {
    type: String,
    enum: ['Standard', 'Express', 'Premium'],
    default: 'Standard'
  },
  isEligibleForFreeShipping: {
    type: Boolean,
    default: false
  },
  freeShippingThreshold: {
    type: Number,
    min: [0, 'Free shipping threshold cannot be negative']
  },
  
  // Images
  coverImage: {
    type: String,
    required: [true, 'Cover image is required']
  },
  images: [{
    type: String
  }],
  
  // Ratings and reviews
  averageRating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  totalRatings: {
    type: Number,
    min: [0, 'Total ratings cannot be negative'],
    default: 0
  },
  totalReviews: {
    type: Number,
    min: [0, 'Total reviews cannot be negative'],
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Review title cannot exceed 100 characters']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    helpful: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status and visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isNewRelease: {
    type: Boolean,
    default: false
  },
  
  // SEO and metadata
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  
  // Additional information
  ageGroup: {
    type: String,
    enum: ['Children', 'Young Adult', 'Adult', 'All Ages'],
    default: 'All Ages'
  },
  readingLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  }

}, { timestamps: true });

// Virtual for discounted price
bookSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Virtual for discount percentage
bookSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return this.discount;
});

// Virtual for stock status
bookSchema.virtual('stockStatus').get(function() {
  if (this.stockQuantity === 0) return 'Out of Stock';
  if (this.stockQuantity <= this.lowStockThreshold) return 'Low Stock';
  return 'In Stock';
});

// Virtual for available stock (excluding reserved)
bookSchema.virtual('availableStock').get(function() {
  return Math.max(0, this.stockQuantity - this.reservedQuantity);
});

// Virtual for stock status with thresholds
bookSchema.virtual('detailedStockStatus').get(function() {
  if (this.stockQuantity === 0) return 'Out of Stock';
  if (this.stockQuantity <= this.lowStockThreshold) return 'Low Stock';
  if (this.stockQuantity <= this.reorderPoint) return 'Reorder Soon';
  return 'In Stock';
});

// Virtual for profit margin
bookSchema.virtual('profitMargin').get(function() {
  if (this.supplier && this.supplier.cost && this.price > 0) {
    return ((this.price - this.supplier.cost) / this.price * 100).toFixed(2);
  }
  return null;
});

// Virtual for total value in stock
bookSchema.virtual('stockValue').get(function() {
  return this.stockQuantity * this.price;
});

// Virtual for availability
bookSchema.virtual('isAvailable').get(function() {
  return this.isActive && this.stockQuantity > 0;
});

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ isFeatured: 1 });
bookSchema.index({ isBestSeller: 1 });
bookSchema.index({ isNewRelease: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ slug: 1 });

// Pre-save middleware to generate slug
bookSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  
  next();
});

// Static method to find books by category
bookSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

// Static method to find featured books
bookSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isActive: true }).sort({ createdAt: -1 });
};

// Static method to find best sellers
bookSchema.statics.findBestSellers = function() {
  return this.find({ isBestSeller: true, isActive: true }).sort({ averageRating: -1 });
};

// Static method to find new releases
bookSchema.statics.findNewReleases = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.find({
    isNewRelease: true,
    isActive: true,
    createdAt: { $gte: thirtyDaysAgo }
  }).sort({ createdAt: -1 });
};

// Static method to search books
bookSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    isActive: true
  }).sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Book', bookSchema); 