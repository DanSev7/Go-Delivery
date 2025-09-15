// middlewares/errorHandler.js

// Professional SaaS Error Handler
const errorHandler = (err, req, res, next) => {
  console.error('=== ERROR HANDLER ===');
  console.error('Error Stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request Method:', req.method);
  console.error('Error Code:', err.code);
  console.error('Error Name:', err.name);
  console.error('===================');

  // Define default error message and status code
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = 'SERVER_ERROR';
  let details = null;

  // Handle specific database errors
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Resource already exists';
    code = 'DUPLICATE_ENTRY';
    details = 'This record violates a unique constraint';
  } else if (err.code === '23503') {
    statusCode = 400;
    message = 'Invalid reference to related resource';
    code = 'FOREIGN_KEY_VIOLATION';
    details = 'Referenced record does not exist';
  } else if (err.code === '23514') {
    statusCode = 400;
    message = 'Invalid data value';
    code = 'CHECK_CONSTRAINT_VIOLATION';
    details = 'Data does not meet validation requirements';
  } else if (err.code === '23502') {
    statusCode = 400;
    message = 'Required field missing';
    code = 'NOT_NULL_VIOLATION';
    details = 'A required field was not provided';
  }

  // Handle validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = err.details || 'Invalid data provided';
  } 

  // Handle cast errors (invalid data format)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    code = 'INVALID_FORMAT';
    details = 'The provided data format is incorrect';
  }

  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Handle multer file upload errors
  else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large';
    code = 'FILE_TOO_LARGE';
    details = 'Uploaded file exceeds maximum size limit';
  }

  // Professional SaaS error response format
  const errorResponse = {
    success: false,
    error: {
      code,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    }
  };

  // Add details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = details;
    errorResponse.error.stack = err.stack;
  } else if (details) {
    errorResponse.error.details = details;
  }

  // Add request ID if available (for tracing)
  if (req.requestId) {
    errorResponse.error.requestId = req.requestId;
  }

  // Send the professional error response
  res.status(statusCode).json(errorResponse);
};
  
  module.exports = errorHandler;
  