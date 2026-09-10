/**
 * Centralized Error Handling Middleware
 */

// 404 Not Found Middleware
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

// Global Error Handler Middleware
export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || undefined;

  // Handle Mongoose Invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format: '${err.value}' for field '${err.path}'`;
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
  }

  // Handle MongoDB Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const duplicatedFields = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate value entered for field(s): ${duplicatedFields}. Please use unique values.`;
  }

  // Log server errors for developer inspection
  if (statusCode === 500) {
    console.error('💥 Server Error:', err);
  }

  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  // Include stack trace only in development
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default {
  notFoundHandler,
  globalErrorHandler
};
