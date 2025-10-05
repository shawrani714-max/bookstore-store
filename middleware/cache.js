const { cacheService } = require('../config/redis');
const logger = require('../utils/logger');

// Cache middleware for API responses
const cacheMiddleware = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    try {
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(req) 
        : `api:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;

      // Check if data exists in cache
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        logger.debug(`Cache hit for: ${cacheKey}`);
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (data.success && data.data) {
          cacheService.set(cacheKey, data.data, ttl).catch(err => {
            logger.error('Cache set error:', err);
          });
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next(); // Continue without caching on error
    }
  };
};

// Cache invalidation middleware
const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    try {
      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to invalidate cache after successful response
      res.json = async function(data) {
        // Only invalidate on successful responses
        if (data.success) {
          for (const pattern of patterns) {
            await cacheService.delPattern(pattern);
            logger.debug(`Cache invalidated for pattern: ${pattern}`);
          }
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache invalidation error:', error);
      next(); // Continue without invalidation on error
    }
  };
};

// Specific cache middleware for different endpoints
const bookCache = cacheMiddleware(1800, (req) => {
  const { id, category, search, page = 1, limit = 10 } = req.params;
  if (id) return `book:${id}`;
  if (category) return `books:category:${category}:${page}:${limit}`;
  if (search) return `books:search:${search}:${page}:${limit}`;
  return `books:all:${page}:${limit}`;
});

const userCache = cacheMiddleware(900, (req) => {
  const userId = req.user?.id || req.params.id;
  return `user:${userId}`;
});

const categoryCache = cacheMiddleware(3600, () => 'categories:all');

const featuredBooksCache = cacheMiddleware(1800, () => 'books:featured');

const bestsellersCache = cacheMiddleware(1800, () => 'books:bestsellers');

const newReleasesCache = cacheMiddleware(1800, () => 'books:new-releases');

// Cache invalidation patterns
const bookCacheInvalidation = invalidateCache([
  'books:*',
  'book:*',
  'categories:*'
]);

const userCacheInvalidation = invalidateCache([
  'user:*',
  'users:*'
]);

// Cache warming function
const warmCache = async () => {
  try {
    logger.info('Starting cache warming...');
    
    // Import models
    const Book = require('../models/Book');
    const Category = require('../models/Category');
    
    // Warm featured books cache
    const featuredBooks = await Book.find({ isFeatured: true, isActive: true })
      .limit(12)
      .sort({ createdAt: -1 });
    await cacheService.set('books:featured', featuredBooks, 1800);
    
    // Warm bestsellers cache
    const bestsellers = await Book.find({ isBestSeller: true, isActive: true })
      .limit(12)
      .sort({ averageRating: -1 });
    await cacheService.set('books:bestsellers', bestsellers, 1800);
    
    // Warm new releases cache
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newReleases = await Book.find({ 
      isNewRelease: true, 
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo }
    }).limit(12).sort({ createdAt: -1 });
    await cacheService.set('books:new-releases', newReleases, 1800);
    
    // Warm categories cache
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    await cacheService.set('categories:all', categories, 3600);
    
    logger.info('Cache warming completed successfully');
  } catch (error) {
    logger.error('Cache warming error:', error);
  }
};

// Cache health check
const cacheHealthCheck = async (req, res) => {
  try {
    const isHealthy = await cacheService.healthCheck();
    const stats = await cacheService.getStats();
    
    res.json({
      success: true,
      data: {
        healthy: isHealthy,
        stats: stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cache health check failed',
      error: error.message
    });
  }
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  bookCache,
  userCache,
  categoryCache,
  featuredBooksCache,
  bestsellersCache,
  newReleasesCache,
  bookCacheInvalidation,
  userCacheInvalidation,
  warmCache,
  cacheHealthCheck
};
