const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { catchAsync } = require('../utils/errorResponse');

// @desc    Add a review to a book
// @route   POST /api/reviews/:bookId
// @access  Private
router.post('/:bookId', protect, catchAsync(async (req, res) => {
  const { rating, title, comment } = req.body;
  const bookId = req.params.bookId;
  const userId = req.user.id;

  // Validate input
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5'
    });
  }

  if (!comment || comment.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Review comment must be at least 10 characters long'
    });
  }

  // Check if book exists
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Check if user has already reviewed this book
  const existingReview = book.reviews.find(
    review => review.user.toString() === userId
  );

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this book'
    });
  }

  // Check if user has purchased this book (for verified purchase badge)
  const user = await User.findById(userId);
  const hasPurchased = user.orders && user.orders.some(order => 
    order.items.some(item => item.book.toString() === bookId)
  );

  // Add review
  const newReview = {
    user: userId,
    rating: parseInt(rating),
    title: title ? title.trim() : '',
    comment: comment.trim(),
    isVerifiedPurchase: hasPurchased
  };

  book.reviews.push(newReview);

  // Update book's average rating and total counts
  const totalRating = book.reviews.reduce((sum, review) => sum + review.rating, 0);
  book.averageRating = totalRating / book.reviews.length;
  book.totalRatings = book.reviews.length;
  book.totalReviews = book.reviews.length;

  await book.save();

  // Populate user info for response
  await book.populate('reviews.user', 'firstName lastName');

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: {
      review: newReview,
      book: {
        id: book._id,
        title: book.title,
        averageRating: book.averageRating,
        totalReviews: book.totalReviews
      }
    }
  });
}));

// @desc    Get all reviews for a book
// @route   GET /api/reviews/:bookId
// @access  Public
router.get('/:bookId', catchAsync(async (req, res) => {
  const bookId = req.params.bookId;
  const { page = 1, limit = 10, sort = 'newest' } = req.query;

  // Check if book exists
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const totalReviews = book.reviews.length;
  const totalPages = Math.ceil(totalReviews / parseInt(limit));

  // Sort reviews
  let sortedReviews = [...book.reviews];
  switch (sort) {
    case 'newest':
      sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest':
      sortedReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'highest':
      sortedReviews.sort((a, b) => b.rating - a.rating);
      break;
    case 'lowest':
      sortedReviews.sort((a, b) => a.rating - b.rating);
      break;
    case 'helpful':
      sortedReviews.sort((a, b) => b.helpful - a.helpful);
      break;
  }

  // Apply pagination
  const paginatedReviews = sortedReviews.slice(skip, skip + parseInt(limit));

  // Populate user info
  await Book.populate(paginatedReviews, {
    path: 'user',
    select: 'firstName lastName avatar'
  });

  // Calculate rating distribution
  const ratingDistribution = {
    5: book.reviews.filter(r => r.rating === 5).length,
    4: book.reviews.filter(r => r.rating === 4).length,
    3: book.reviews.filter(r => r.rating === 3).length,
    2: book.reviews.filter(r => r.rating === 2).length,
    1: book.reviews.filter(r => r.rating === 1).length
  };

  res.json({
    success: true,
    data: {
      reviews: paginatedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      summary: {
        averageRating: book.averageRating,
        totalReviews: book.totalReviews,
        ratingDistribution
      }
    }
  });
}));

// @desc    Update a review
// @route   PUT /api/reviews/:bookId/:reviewId
// @access  Private
router.put('/:bookId/:reviewId', protect, catchAsync(async (req, res) => {
  const { rating, title, comment } = req.body;
  const { bookId, reviewId } = req.params;
  const userId = req.user.id;

  // Validate input
  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5'
    });
  }

  if (comment && comment.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Review comment must be at least 10 characters long'
    });
  }

  // Find book and review
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  const review = book.reviews.id(reviewId);
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user owns the review
  if (review.user.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You can only edit your own reviews'
    });
  }

  // Update review
  if (rating) review.rating = parseInt(rating);
  if (title !== undefined) review.title = title.trim();
  if (comment) review.comment = comment.trim();

  // Update book's average rating
  const totalRating = book.reviews.reduce((sum, r) => sum + r.rating, 0);
  book.averageRating = totalRating / book.reviews.length;

  await book.save();

  // Populate user info for response
  await book.populate('reviews.user', 'firstName lastName');

  res.json({
    success: true,
    message: 'Review updated successfully',
    data: {
      review,
      book: {
        id: book._id,
        title: book.title,
        averageRating: book.averageRating,
        totalReviews: book.totalReviews
      }
    }
  });
}));

// @desc    Delete a review
// @route   DELETE /api/reviews/:bookId/:reviewId
// @access  Private
router.delete('/:bookId/:reviewId', protect, catchAsync(async (req, res) => {
  const { bookId, reviewId } = req.params;
  const userId = req.user.id;

  // Find book and review
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  const review = book.reviews.id(reviewId);
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user owns the review
  if (review.user.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own reviews'
    });
  }

  // Remove review
  review.remove();

  // Update book's average rating and counts
  if (book.reviews.length > 0) {
    const totalRating = book.reviews.reduce((sum, r) => sum + r.rating, 0);
    book.averageRating = totalRating / book.reviews.length;
  } else {
    book.averageRating = 0;
  }
  book.totalRatings = book.reviews.length;
  book.totalReviews = book.reviews.length;

  await book.save();

  res.json({
    success: true,
    message: 'Review deleted successfully',
    data: {
      book: {
        id: book._id,
        title: book.title,
        averageRating: book.averageRating,
        totalReviews: book.totalReviews
      }
    }
  });
}));

// @desc    Mark review as helpful
// @route   POST /api/reviews/:bookId/:reviewId/helpful
// @access  Private
router.post('/:bookId/:reviewId/helpful', protect, catchAsync(async (req, res) => {
  const { bookId, reviewId } = req.params;
  const userId = req.user.id;

  // Find book and review
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  const review = book.reviews.id(reviewId);
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user is not the review author
  if (review.user.toString() === userId) {
    return res.status(400).json({
      success: false,
      message: 'You cannot mark your own review as helpful'
    });
  }

  // Increment helpful count
  review.helpful += 1;
  await book.save();

  res.json({
    success: true,
    message: 'Review marked as helpful',
    data: {
      helpfulCount: review.helpful
    }
  });
}));

// @desc    Get user's reviews
// @route   GET /api/reviews/user/me
// @access  Private
router.get('/user/me', protect, catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  // Find books with reviews by this user
  const books = await Book.find({
    'reviews.user': userId
  }).populate('reviews.user', 'firstName lastName');

  // Extract user's reviews
  let userReviews = [];
  books.forEach(book => {
    const review = book.reviews.find(r => r.user._id.toString() === userId);
    if (review) {
      userReviews.push({
        review,
        book: {
          id: book._id,
          title: book.title,
          coverImage: book.coverImage,
          author: book.author
        }
      });
    }
  });

  // Sort by newest first
  userReviews.sort((a, b) => new Date(b.review.createdAt) - new Date(a.review.createdAt));

  // Apply pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const totalReviews = userReviews.length;
  const totalPages = Math.ceil(totalReviews / parseInt(limit));
  const paginatedReviews = userReviews.slice(skip, skip + parseInt(limit));

  res.json({
    success: true,
    data: {
      reviews: paginatedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
}));

module.exports = router; 
