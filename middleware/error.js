const { ErrorResponse } = require('../utils/errorResponse');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} already exists with value: ${value}`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ErrorResponse(message, 401);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = new ErrorResponse(message, 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = new ErrorResponse(message, 400);
  }

  // Cloudinary errors
  if (err.http_code) {
    const message = err.message || 'File upload failed';
    error = new ErrorResponse(message, err.http_code);
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFound = (req, res, next) => {
  // Ignore Chrome DevTools and browser-specific requests
  if (req.originalUrl.includes('.well-known') || 
      req.originalUrl.includes('favicon.ico') ||
      req.originalUrl.includes('robots.txt') ||
      req.originalUrl.includes('sitemap.xml')) {
    return res.status(404).end();
  }
  
  const error = new ErrorResponse(`Route not found - ${req.originalUrl}`, 404);
  next(error);
};

// Validation error handler
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(error => error.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ErrorResponse(message, 400);
};

// Duplicate key error handler
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} already exists with value: ${value}`;
  return new ErrorResponse(message, 400);
};

// Cast error handler
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ErrorResponse(message, 400);
};

// JWT error handlers
const handleJWTError = () => {
  return new ErrorResponse('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = () => {
  return new ErrorResponse('Your token has expired! Please log in again.', 401);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  handleValidationError,
  handleDuplicateKeyError,
  handleCastError,
  handleJWTError,
  handleJWTExpiredError
}; 
