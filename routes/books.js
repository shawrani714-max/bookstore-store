const express = require('express');
const { body, query, validationResult } = require('express-validator');

const Book = require('../models/Book');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// @desc    Get all books
// @route   GET /api/books
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('sort').optional().isIn(['price', '-price', 'title', '-title', 'author', '-author', 'createdAt', '-createdAt', 'averageRating', '-averageRating']).withMessage('Invalid sort parameter'),
  query('format').optional().isIn(['Hardcover', 'Paperback', 'E-Book', 'Audiobook', 'Digital']).withMessage('Invalid format'),
  query('language').optional().isString().withMessage('Language must be a string'),
  query('ageGroup').optional().isIn(['Children', 'Young Adult', 'Adult', 'All Ages']).withMessage('Invalid age group'),
  query('readingLevel').optional().isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert']).withMessage('Invalid reading level')
], asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    page = 1,
    limit = 12,
    category,
    search,
    minPrice,
    maxPrice,
    sort = '-createdAt',
    format,
    language,
    ageGroup,
    readingLevel
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  if (format) {
    query.format = format;
  }

  if (language) {
    query.language = language;
  }

  if (ageGroup) {
    query.ageGroup = ageGroup;
  }

  if (readingLevel) {
    query.readingLevel = readingLevel;
  }

  // Build sort object
  let sortObj = {};
  if (sort.startsWith('-')) {
    sortObj[sort.substring(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  // Execute query
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const books = await Book.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Book.countDocuments(query);

  res.status(200).json({
    success: true,
    count: books.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    },
    data: {
      books
    }
  });
}));

// @desc    Get featured books
// @route   GET /api/books/featured
// @access  Public
router.get('/featured', asyncHandler(async (req, res, next) => {
  const books = await Book.findFeatured().limit(8);

  res.status(200).json({
    success: true,
    count: books.length,
    data: {
      books
    }
  });
}));

// @desc    Get best sellers
// @route   GET /api/books/bestsellers
// @access  Public
router.get('/bestsellers', asyncHandler(async (req, res, next) => {
  const books = await Book.findBestSellers().limit(8);

  res.status(200).json({
    success: true,
    count: books.length,
    data: {
      books
    }
  });
}));

// @desc    Get new releases
// @route   GET /api/books/new-releases
// @access  Public
router.get('/new-releases', asyncHandler(async (req, res, next) => {
  const books = await Book.findNewReleases().limit(8);

  res.status(200).json({
    success: true,
    count: books.length,
    data: {
      books
    }
  });
}));

// @desc    Get categories
// @route   GET /api/books/categories
// @access  Public
router.get('/categories', asyncHandler(async (req, res, next) => {
  const categories = await Book.distinct('category', { isActive: true });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: {
      categories
    }
  });
}));

// @desc    Get books by category
// @route   GET /api/books/category/:category
// @access  Public
router.get('/category/:category', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['price', '-price', 'title', '-title', 'author', '-author', 'createdAt', '-createdAt', 'averageRating', '-averageRating']).withMessage('Invalid sort parameter')
], asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { page = 1, limit = 12, sort = '-createdAt' } = req.query;
  const { category } = req.params;

  // Build sort object
  let sortObj = {};
  if (sort.startsWith('-')) {
    sortObj[sort.substring(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const books = await Book.find({ category, isActive: true })
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Book.countDocuments({ category, isActive: true });

  res.status(200).json({
    success: true,
    count: books.length,
    total,
    category,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    },
    data: {
      books
    }
  });
}));

// @desc    Search books
// @route   GET /api/books/search
// @access  Public
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { q, page = 1, limit = 12 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const books = await Book.search(q)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Book.countDocuments({
    $text: { $search: q },
    isActive: true
  });

  res.status(200).json({
    success: true,
    count: books.length,
    total,
    query: q,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    },
    data: {
      books
    }
  });
}));

// @desc    Get book by slug
// @route   GET /api/books/slug/:slug
// @access  Public
router.get('/slug/:slug', asyncHandler(async (req, res, next) => {
  const book = await Book.findOne({ slug: req.params.slug });

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  if (!book.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Book not available'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      book
    }
  });
}));

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res, next) => {
  console.log('Book ID requested:', req.params.id);
  const book = await Book.findById(req.params.id);
  console.log('Book found:', book);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  if (!book.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Book not available'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      book
    }
  });
}));

// @desc    Create new book (Admin only)
// @route   POST /api/books
// @access  Private/Admin
router.post('/', protect, adminOnly, [
  body('title').notEmpty().trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be between 1 and 200 characters'),
  body('author').notEmpty().trim().isLength({ min: 1, max: 100 }).withMessage('Author is required and must be between 1 and 100 characters'),
  body('isbn').notEmpty().matches(/^(?:\d{10}|\d{13})$/).withMessage('ISBN must be 10 or 13 digits'),
  body('description').notEmpty().trim().isLength({ min: 10, max: 2000 }).withMessage('Description is required and must be between 10 and 2000 characters'),
  body('category').notEmpty().isIn(['Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Biography', 'History', 'Science', 'Technology', 'Self-Help', 'Business', 'Cooking', 'Travel', 'Children', 'Young Adult', 'Poetry', 'Drama', 'Comics', 'Academic']).withMessage('Valid category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('coverImage').notEmpty().isURL().withMessage('Cover image URL is required'),
  body('publisher').optional().trim().isLength({ max: 100 }).withMessage('Publisher cannot exceed 100 characters'),
  body('pages').optional().isInt({ min: 1, max: 10000 }).withMessage('Pages must be between 1 and 10000'),
  body('format').optional().isIn(['Hardcover', 'Paperback', 'E-Book', 'Audiobook', 'Digital']).withMessage('Invalid format'),
  body('language').optional().trim().isLength({ max: 30 }).withMessage('Language cannot exceed 30 characters'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('discount').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  body('isBestSeller').optional().isBoolean().withMessage('isBestSeller must be a boolean'),
  body('isNewRelease').optional().isBoolean().withMessage('isNewRelease must be a boolean')
], asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Check if ISBN already exists
  const existingBook = await Book.findOne({ isbn: req.body.isbn });
  if (existingBook) {
    return res.status(400).json({
      success: false,
      message: 'Book with this ISBN already exists'
    });
  }

  const book = await Book.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    data: {
      book
    }
  });
}));

// @desc    Update book (Admin only)
// @route   PUT /api/books/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('author').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Author must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('category').optional().isIn(['Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Biography', 'History', 'Science', 'Technology', 'Self-Help', 'Business', 'Cooking', 'Travel', 'Children', 'Young Adult', 'Poetry', 'Drama', 'Comics', 'Academic']).withMessage('Invalid category'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('coverImage').optional().isURL().withMessage('Cover image must be a valid URL'),
  body('publisher').optional().trim().isLength({ max: 100 }).withMessage('Publisher cannot exceed 100 characters'),
  body('pages').optional().isInt({ min: 1, max: 10000 }).withMessage('Pages must be between 1 and 10000'),
  body('format').optional().isIn(['Hardcover', 'Paperback', 'E-Book', 'Audiobook', 'Digital']).withMessage('Invalid format'),
  body('language').optional().trim().isLength({ max: 30 }).withMessage('Language cannot exceed 30 characters'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('discount').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  body('isBestSeller').optional().isBoolean().withMessage('isBestSeller must be a boolean'),
  body('isNewRelease').optional().isBoolean().withMessage('isNewRelease must be a boolean')
], asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  let book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Check if ISBN is being changed and if it already exists
  if (req.body.isbn && req.body.isbn !== book.isbn) {
    const existingBook = await Book.findOne({ isbn: req.body.isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }
  }

  const prevStock = book.stockQuantity;
  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Notify users if restocked
  if (typeof req.body.stockQuantity !== 'undefined' && prevStock === 0 && book.stockQuantity > 0) {
    const notifyRestock = require('../utils/notifyRestock');
    notifyRestock(book);
  }

  res.status(200).json({
    success: true,
    message: 'Book updated successfully',
    data: {
      book
    }
  });
}));

// @desc    Delete book (Admin only)
// @route   DELETE /api/books/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  await book.remove();

  res.status(200).json({
    success: true,
    message: 'Book deleted successfully'
  });
}));

module.exports = router; 