const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { cdnService } = require('../services/cdnService');
const { protect, adminOnly } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { cdnUploadMiddleware, cdnDeleteMiddleware, cdnHealthCheck } = require('../middleware/cdn');
const multer = require('multer');
// const { upload } = require('./upload'); // Commented out - not needed for CDN routes

const router = express.Router();

// Configure multer for CDN uploads
const cdnUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for CDN
    files: 10
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for CDN
    cb(null, true);
  }
});

// @desc    Upload file to CDN
// @route   POST /api/cdn/upload
// @access  Private/Admin
router.post('/upload', protect, adminOnly, cdnUpload.single('file'), cdnUploadMiddleware(), [
  body('folder').optional().isString().withMessage('Folder must be a string'),
  body('key').optional().isString().withMessage('Key must be a string')
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

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file provided'
    });
  }

  try {
    res.status(201).json({
      success: true,
      data: {
        url: req.cdnData.url,
        key: req.cdnData.key,
        bucket: req.cdnData.bucket,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
}));

// @desc    Upload multiple files to CDN
// @route   POST /api/cdn/upload-multiple
// @access  Private/Admin
router.post('/upload-multiple', protect, adminOnly, cdnUpload.array('files', 10), asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files provided'
    });
  }

  try {
    const uploadResults = [];
    
    for (const file of req.files) {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.originalname.split('.').pop();
      const key = `uploads/${timestamp}-${randomString}.${extension}`;

      const result = await cdnService.uploadBuffer(
        file.buffer,
        key,
        file.mimetype,
        {
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString()
          },
          cacheControl: 'public, max-age=31536000'
        }
      );

      uploadResults.push({
        originalName: file.originalname,
        success: result.success,
        url: result.success ? result.url : null,
        key: result.success ? result.key : null,
        error: result.success ? null : result.error
      });
    }

    const successful = uploadResults.filter(r => r.success).length;
    const failed = uploadResults.filter(r => !r.success).length;

    res.status(201).json({
      success: true,
      data: {
        results: uploadResults,
        summary: {
          total: req.files.length,
          successful: successful,
          failed: failed
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
}));

// @desc    Delete file from CDN
// @route   DELETE /api/cdn/delete
// @access  Private/Admin
router.delete('/delete', protect, adminOnly, [
  body('key').notEmpty().withMessage('Key is required')
], cdnDeleteMiddleware('key'), asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  res.status(200).json({
    success: true,
    message: 'File deleted successfully',
    data: req.cdnDeleteResult
  });
}));

// @desc    List files in CDN
// @route   GET /api/cdn/list
// @access  Private/Admin
router.get('/list', protect, adminOnly, [
  query('prefix').optional().isString().withMessage('Prefix must be a string'),
  query('maxKeys').optional().isInt({ min: 1, max: 1000 }).withMessage('MaxKeys must be between 1 and 1000')
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

  const { prefix = '', maxKeys = 100 } = req.query;

  try {
    const result = await cdnService.listFiles(prefix, parseInt(maxKeys));

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          files: result.files,
          count: result.count,
          isTruncated: result.isTruncated,
          prefix: prefix
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to list files',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to list files',
      error: error.message
    });
  }
}));

// @desc    Get signed URL for private file
// @route   GET /api/cdn/signed-url
// @access  Private
router.get('/signed-url', protect, [
  query('key').notEmpty().withMessage('Key is required'),
  query('expiresIn').optional().isInt({ min: 60, max: 86400 }).withMessage('ExpiresIn must be between 60 and 86400 seconds')
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

  const { key, expiresIn = 3600 } = req.query;

  try {
    const result = await cdnService.getSignedUrl(key, parseInt(expiresIn));

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          url: result.url,
          expiresIn: result.expiresIn,
          key: key
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate signed URL',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate signed URL',
      error: error.message
    });
  }
}));

// @desc    Invalidate CDN cache
// @route   POST /api/cdn/invalidate
// @access  Private/Admin
router.post('/invalidate', protect, adminOnly, [
  body('paths').isArray().withMessage('Paths must be an array'),
  body('paths.*').isString().withMessage('Each path must be a string')
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

  const { paths } = req.body;

  try {
    const result = await cdnService.invalidateCache(paths);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          invalidationId: result.invalidationId,
          status: result.status,
          paths: paths
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to invalidate cache',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to invalidate cache',
      error: error.message
    });
  }
}));

// @desc    Upload static assets to CDN
// @route   POST /api/cdn/upload-static
// @access  Private/Admin
router.post('/upload-static', protect, adminOnly, asyncHandler(async (req, res, next) => {
  try {
    const result = await cdnService.uploadStaticAssets();

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          assets: result.assets,
          count: result.count
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to upload static assets',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload static assets',
      error: error.message
    });
  }
}));

// @desc    CDN health check
// @route   GET /api/cdn/health
// @access  Public
router.get('/health', cdnHealthCheck);

module.exports = router;
