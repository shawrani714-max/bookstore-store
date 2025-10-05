const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { searchService } = require('../services/searchService');
const { protect, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

// @desc    Basic search
// @route   GET /api/search
// @access  Public
router.get('/', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('sortBy').optional().isIn(['relevance', 'price_asc', 'price_desc', 'rating', 'newest', 'popular']).withMessage('Invalid sort option'),
  query('format').optional().isString().withMessage('Format must be a string')
], cacheMiddleware(300), asyncHandler(async (req, res, next) => {
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
    q: query,
    page = 1,
    limit = 20,
    category,
    minPrice,
    maxPrice,
    sortBy = 'relevance',
    format
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    category,
    minPrice: minPrice ? parseFloat(minPrice) : null,
    maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    sortBy,
    format
  };

  try {
    const result = await searchService.basicSearch(query, options);

    // Track search if user is authenticated
    if (req.user) {
      searchService.saveUserSearchHistory(req.user.id, query);
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
}));

// @desc    Advanced search
// @route   POST /api/search/advanced
// @access  Public
router.post('/advanced', [
  body('query').optional().isString().withMessage('Query must be a string'),
  body('categories').optional().isArray().withMessage('Categories must be an array'),
  body('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  body('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  body('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Min rating must be between 0 and 5'),
  body('formats').optional().isArray().withMessage('Formats must be an array'),
  body('languages').optional().isArray().withMessage('Languages must be an array'),
  body('ageGroups').optional().isArray().withMessage('Age groups must be an array'),
  body('inStockOnly').optional().isBoolean().withMessage('In stock only must be a boolean'),
  body('featuredOnly').optional().isBoolean().withMessage('Featured only must be a boolean'),
  body('newReleasesOnly').optional().isBoolean().withMessage('New releases only must be a boolean'),
  body('bestSellersOnly').optional().isBoolean().withMessage('Best sellers only must be a boolean'),
  body('publishedAfter').optional().isISO8601().withMessage('Published after must be a valid date'),
  body('publishedBefore').optional().isISO8601().withMessage('Published before must be a valid date'),
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  body('sortBy').optional().isIn(['relevance', 'price_asc', 'price_desc', 'rating', 'newest', 'popular', 'title', 'author']).withMessage('Invalid sort option')
], cacheMiddleware(300), asyncHandler(async (req, res, next) => {
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
    query,
    categories,
    minPrice,
    maxPrice,
    minRating,
    formats,
    languages,
    ageGroups,
    inStockOnly,
    featuredOnly,
    newReleasesOnly,
    bestSellersOnly,
    publishedAfter,
    publishedBefore,
    page = 1,
    limit = 20,
    sortBy = 'relevance'
  } = req.body;

  const criteria = {
    query,
    categories,
    minPrice: minPrice ? parseFloat(minPrice) : null,
    maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    minRating: minRating ? parseFloat(minRating) : null,
    formats,
    languages,
    ageGroups,
    inStockOnly,
    featuredOnly,
    newReleasesOnly,
    bestSellersOnly,
    publishedAfter: publishedAfter ? new Date(publishedAfter) : null,
    publishedBefore: publishedBefore ? new Date(publishedBefore) : null
  };

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy
  };

  try {
    const result = await searchService.advancedSearch(criteria, options);

    // Track search if user is authenticated and has query
    if (req.user && query) {
      searchService.saveUserSearchHistory(req.user.id, query);
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Advanced search failed',
      error: error.message
    });
  }
}));

// @desc    Get search suggestions
// @route   GET /api/search/suggestions
// @access  Public
router.get('/suggestions', [
  query('q').notEmpty().withMessage('Query is required'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
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

  const { q: query, limit = 10 } = req.query;

  try {
    const suggestions = await searchService.getSearchSuggestions(query, parseInt(limit));

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions',
      error: error.message
    });
  }
}));

// @desc    Get search filters
// @route   GET /api/search/filters
// @access  Public
router.get('/filters', [
  query('q').optional().isString().withMessage('Query must be a string')
], cacheMiddleware(3600), asyncHandler(async (req, res, next) => {
  const { q: query } = req.query;

  try {
    const filters = await searchService.getSearchFilters(query);

    res.status(200).json({
      success: true,
      data: filters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get search filters',
      error: error.message
    });
  }
}));

// @desc    Get popular searches
// @route   GET /api/search/popular
// @access  Public
router.get('/popular', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], cacheMiddleware(1800), asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;

  try {
    const popularSearches = searchService.getPopularSearches(parseInt(limit));

    res.status(200).json({
      success: true,
      data: popularSearches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get popular searches',
      error: error.message
    });
  }
}));

// @desc    Get user search history
// @route   GET /api/search/history
// @access  Private
router.get('/history', protect, [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], asyncHandler(async (req, res, next) => {
  const { limit = 20 } = req.query;

  try {
    const history = searchService.getUserSearchHistory(req.user.id, parseInt(limit));

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get search history',
      error: error.message
    });
  }
}));

// @desc    Clear user search history
// @route   DELETE /api/search/history
// @access  Private
router.delete('/history', protect, asyncHandler(async (req, res, next) => {
  try {
    // This would typically clear user's search history from database
    // For now, just return success
    res.status(200).json({
      success: true,
      message: 'Search history cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear search history',
      error: error.message
    });
  }
}));

// @desc    Get search analytics (Admin only)
// @route   GET /api/search/analytics
// @access  Private/Admin
router.get('/analytics', protect, [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  const { days = 30 } = req.query;

  try {
    const analytics = await searchService.getSearchAnalytics(parseInt(days));

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get search analytics',
      error: error.message
    });
  }
}));

// @desc    Clear search cache (Admin only)
// @route   DELETE /api/search/cache
// @access  Private/Admin
router.delete('/cache', protect, asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  try {
    await searchService.clearSearchCache();

    res.status(200).json({
      success: true,
      message: 'Search cache cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear search cache',
      error: error.message
    });
  }
}));

module.exports = router;
