// 404 Not Found Middleware
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

// Global Error Handler Middleware
export const globalErrorHandler = (err, req, res, next) => {
  console.error('Server Error:', err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
};
