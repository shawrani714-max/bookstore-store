const multer = require('multer');
const path = require('path');
const { ErrorResponse } = require('../utils/errorResponse');

// Configure multer for file uploads
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ErrorResponse('Only image files are allowed!', 400), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Single file upload
const uploadSingle = upload.single('image');

// Multiple files upload
const uploadMultiple = upload.array('images', 10);

// Handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (err.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

// Validate uploaded files
const validateUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file.'
    });
  }
  
  next();
};

// Process uploaded files for Cloudinary
const processUpload = (req, res, next) => {
  try {
    if (req.file) {
      // Single file
      req.file.buffer = req.file.buffer;
      req.file.originalname = req.file.originalname;
    } else if (req.files) {
      // Multiple files
      req.files.forEach(file => {
        file.buffer = file.buffer;
        file.originalname = file.originalname;
      });
    }
    
    next();
  } catch (error) {
    next(new ErrorResponse('Error processing uploaded files', 500));
  }
};

// Clean up uploaded files (if needed)
const cleanupUpload = (req, res, next) => {
  try {
    // Clean up any temporary files if needed
    next();
  } catch (error) {
    console.error('Cleanup error:', error);
    next();
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  validateUpload,
  processUpload,
  cleanupUpload
}; 