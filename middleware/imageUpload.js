const multer = require('multer');
const { imageOptimizer } = require('../utils/imageOptimizer');
const { asyncHandler } = require('./error');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: fileFilter
});

// Single file upload middleware
const uploadSingle = (fieldName = 'image') => {
  return [
    upload.single(fieldName),
    asyncHandler(async (req, res, next) => {
      if (req.file) {
        try {
          // Process and optimize the image
          const result = await imageOptimizer.processAndUpload(req.file);
          
          if (result.success) {
            req.imageData = result;
            next();
          } else {
            return res.status(400).json({
              success: false,
              message: 'Image processing failed',
              error: result.error
            });
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Image processing error',
            error: error.message
          });
        }
      } else {
        next();
      }
    })
  ];
};

// Multiple files upload middleware
const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return [
    upload.array(fieldName, maxCount),
    asyncHandler(async (req, res, next) => {
      if (req.files && req.files.length > 0) {
        try {
          // Process and optimize all images
          const result = await imageOptimizer.batchProcess(req.files);
          
          if (result.success) {
            req.imagesData = result;
            next();
          } else {
            return res.status(400).json({
              success: false,
              message: 'Images processing failed',
              error: result.error
            });
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Images processing error',
            error: error.message
          });
        }
      } else {
        next();
      }
    })
  ];
};

// Book cover upload middleware
const uploadBookCover = () => {
  return [
    upload.single('coverImage'),
    asyncHandler(async (req, res, next) => {
      if (req.file) {
        try {
          // Process book cover specifically
          const result = await imageOptimizer.processBookCover(req.file);
          
          if (result.success) {
            req.bookCoverData = result;
            next();
          } else {
            return res.status(400).json({
              success: false,
              message: 'Book cover processing failed',
              error: result.error
            });
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Book cover processing error',
            error: error.message
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Book cover image is required'
        });
      }
    })
  ];
};

// User avatar upload middleware
const uploadUserAvatar = () => {
  return [
    upload.single('avatar'),
    asyncHandler(async (req, res, next) => {
      if (req.file) {
        try {
          // Process user avatar specifically
          const result = await imageOptimizer.processUserAvatar(req.file);
          
          if (result.success) {
            req.avatarData = result;
            next();
          } else {
            return res.status(400).json({
              success: false,
              message: 'Avatar processing failed',
              error: result.error
            });
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Avatar processing error',
            error: error.message
          });
        }
      } else {
        next();
      }
    })
  ];
};

// Banner upload middleware
const uploadBanner = () => {
  return [
    upload.single('bannerImage'),
    asyncHandler(async (req, res, next) => {
      if (req.file) {
        try {
          // Process banner specifically
          const result = await imageOptimizer.processBanner(req.file);
          
          if (result.success) {
            req.bannerData = result;
            next();
          } else {
            return res.status(400).json({
              success: false,
              message: 'Banner processing failed',
              error: result.error
            });
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Banner processing error',
            error: error.message
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Banner image is required'
        });
      }
    })
  ];
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed!'
    });
  }
  
  next(error);
};

// Utility function to validate image dimensions
const validateImageDimensions = (minWidth, minHeight, maxWidth, maxHeight) => {
  return asyncHandler(async (req, res, next) => {
    if (req.file) {
      try {
        const imageInfo = await imageOptimizer.getImageInfo(req.file.buffer);
        
        if (imageInfo.width < minWidth || imageInfo.height < minHeight) {
          return res.status(400).json({
            success: false,
            message: `Image dimensions too small. Minimum: ${minWidth}x${minHeight}px`
          });
        }
        
        if (imageInfo.width > maxWidth || imageInfo.height > maxHeight) {
          return res.status(400).json({
            success: false,
            message: `Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}px`
          });
        }
        
        next();
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Failed to validate image dimensions',
          error: error.message
        });
      }
    } else {
      next();
    }
  });
};

// Utility function to validate image format
const validateImageFormat = (allowedFormats = ['jpeg', 'jpg', 'png', 'webp']) => {
  return asyncHandler(async (req, res, next) => {
    if (req.file) {
      try {
        const imageInfo = await imageOptimizer.getImageInfo(req.file.buffer);
        
        if (!allowedFormats.includes(imageInfo.format)) {
          return res.status(400).json({
            success: false,
            message: `Invalid image format. Allowed formats: ${allowedFormats.join(', ')}`
          });
        }
        
        next();
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Failed to validate image format',
          error: error.message
        });
      }
    } else {
      next();
    }
  });
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadBookCover,
  uploadUserAvatar,
  uploadBanner,
  handleUploadError,
  validateImageDimensions,
  validateImageFormat
};
