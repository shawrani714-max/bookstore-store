const express = require('express');
const { query, validationResult } = require('express-validator');
const { analyticsService } = require('../services/analyticsService');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

// @desc    Get analytics data
// @route   GET /api/analytics
// @access  Private/Admin
router.get('/', protect, [
  query('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  query('metrics').optional().isString().withMessage('Metrics must be a string')
], cacheMiddleware(1800), asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { startDate, endDate, metrics } = req.query;
  const metricsArray = metrics ? metrics.split(',') : ['sessions', 'users', 'pageviews'];

  try {
    const data = await analyticsService.getAnalyticsData(startDate, endDate, metricsArray);

    res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        metrics: metricsArray,
        ...data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics data',
      error: error.message
    });
  }
}));

// @desc    Get e-commerce analytics
// @route   GET /api/analytics/ecommerce
// @access  Private/Admin
router.get('/ecommerce', protect, [
  query('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date')
], cacheMiddleware(1800), asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { startDate, endDate } = req.query;

  try {
    const data = await analyticsService.getEcommerceAnalytics(startDate, endDate);

    res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        ...data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get e-commerce analytics',
      error: error.message
    });
  }
}));

// @desc    Get top pages
// @route   GET /api/analytics/top-pages
// @access  Private/Admin
router.get('/top-pages', protect, [
  query('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], cacheMiddleware(1800), asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { startDate, endDate, limit = 10 } = req.query;

  try {
    const data = await analyticsService.getTopPages(startDate, endDate, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        limit: parseInt(limit),
        ...data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get top pages',
      error: error.message
    });
  }
}));

// @desc    Get user demographics
// @route   GET /api/analytics/demographics
// @access  Private/Admin
router.get('/demographics', protect, [
  query('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date')
], cacheMiddleware(1800), asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { startDate, endDate } = req.query;

  try {
    const data = await analyticsService.getUserDemographics(startDate, endDate);

    res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        ...data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user demographics',
      error: error.message
    });
  }
}));

// @desc    Track page view
// @route   POST /api/analytics/track
// @access  Public
router.post('/track', [
  query('type').isIn(['pageview', 'event']).withMessage('Type must be pageview or event'),
  query('page').optional().isString().withMessage('Page must be a string'),
  query('title').optional().isString().withMessage('Title must be a string'),
  query('event').optional().isString().withMessage('Event must be a string')
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

  const { type, page, title, event } = req.query;
  const userId = req.user ? req.user.id : null;

  try {
    if (type === 'pageview') {
      await analyticsService.trackPageView(page, title, userId);
    } else if (type === 'event') {
      await analyticsService.trackEvent(event, req.body, userId);
    }

    res.status(200).json({
      success: true,
      message: 'Analytics event tracked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to track analytics event',
      error: error.message
    });
  }
}));

module.exports = router;
