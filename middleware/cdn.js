const { cdnService } = require('../services/cdnService');
const { asyncHandler } = require('./error');
const logger = require('../utils/logger');

// CDN middleware for serving static assets
const cdnMiddleware = (options = {}) => {
  const {
    enabled = true,
    fallbackToLocal = true,
    cacheControl = 'public, max-age=31536000',
    prefix = '/cdn'
  } = options;

  return asyncHandler(async (req, res, next) => {
    if (!enabled || !cdnService.isConfigured) {
      return next();
    }

    // Check if request is for CDN assets
    if (req.path.startsWith(prefix)) {
      try {
        const assetKey = req.path.replace(prefix, '').substring(1); // Remove leading slash
        
        // Get signed URL for the asset
        const result = await cdnService.getSignedUrl(assetKey, 3600); // 1 hour expiry
        
        if (result.success) {
          // Redirect to CDN URL
          res.redirect(302, result.url);
          return;
        } else {
          logger.warn(`CDN asset not found: ${assetKey}`);
          if (fallbackToLocal) {
            return next();
          } else {
            return res.status(404).json({
              success: false,
              message: 'Asset not found'
            });
          }
        }
      } catch (error) {
        logger.error('CDN middleware error:', error);
        if (fallbackToLocal) {
          return next();
        } else {
          return res.status(500).json({
            success: false,
            message: 'CDN error'
          });
        }
      }
    }

    next();
  });
};

// CDN upload middleware
const cdnUploadMiddleware = (options = {}) => {
  const {
    folder = 'uploads',
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize = 10 * 1024 * 1024, // 10MB
    generateKey = true
  } = options;

  return asyncHandler(async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    try {
      // Validate file type
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type'
        });
      }

      // Validate file size
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'File too large'
        });
      }

      // Generate unique key
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = req.file.originalname.split('.').pop();
      const key = generateKey 
        ? `${folder}/${timestamp}-${randomString}.${extension}`
        : `${folder}/${req.file.originalname}`;

      // Upload to CDN
      const result = await cdnService.uploadBuffer(
        req.file.buffer,
        key,
        req.file.mimetype,
        {
          metadata: {
            originalName: req.file.originalname,
            uploadedAt: new Date().toISOString()
          },
          cacheControl: 'public, max-age=31536000'
        }
      );

      if (result.success) {
        req.cdnData = {
          url: result.url,
          key: result.key,
          bucket: result.bucket
        };
        next();
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload to CDN',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('CDN upload middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'CDN upload error',
        error: error.message
      });
    }
  });
};

// CDN delete middleware
const cdnDeleteMiddleware = (keyField = 'cdnKey') => {
  return asyncHandler(async (req, res, next) => {
    const key = req.body[keyField] || req.params[keyField];
    
    if (!key) {
      return next();
    }

    try {
      const result = await cdnService.deleteFile(key);
      
      if (result.success) {
        req.cdnDeleteResult = result;
        next();
      } else {
        logger.warn(`Failed to delete CDN file: ${key}`, result.error);
        // Continue even if deletion fails
        next();
      }
    } catch (error) {
      logger.error('CDN delete middleware error:', error);
      // Continue even if deletion fails
      next();
    }
  });
};

// CDN cache invalidation middleware
const cdnInvalidationMiddleware = (paths = []) => {
  return asyncHandler(async (req, res, next) => {
    // Store original res.json method
    const originalJson = res.json;

    // Override res.json to invalidate cache after successful response
    res.json = async function(data) {
      // Only invalidate on successful responses
      if (data.success && paths.length > 0) {
        try {
          await cdnService.invalidateCache(paths);
          logger.debug(`CDN cache invalidated for paths: ${paths.join(', ')}`);
        } catch (error) {
          logger.error('CDN cache invalidation error:', error);
        }
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  });
};

// CDN health check middleware
const cdnHealthCheck = asyncHandler(async (req, res) => {
  try {
    const health = await cdnService.healthCheck();
    
    res.json({
      success: true,
      data: {
        cdn: health,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'CDN health check failed',
      error: error.message
    });
  }
});

// Utility function to get CDN URL
const getCDNUrl = (key) => {
  return cdnService.getCDNUrl(key);
};

// Utility function to upload file to CDN
const uploadToCDN = async (file, key, options = {}) => {
  return await cdnService.uploadFile(file, key, options);
};

// Utility function to delete file from CDN
const deleteFromCDN = async (key) => {
  return await cdnService.deleteFile(key);
};

module.exports = {
  cdnMiddleware,
  cdnUploadMiddleware,
  cdnDeleteMiddleware,
  cdnInvalidationMiddleware,
  cdnHealthCheck,
  getCDNUrl,
  uploadToCDN,
  deleteFromCDN
};
