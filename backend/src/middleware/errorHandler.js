/**
 * Centralized error handler middleware for Express.js API
 */
module.exports = (err, req, res, next) => {
  // Log the full stack trace inside the server terminal for developers to inspect
  console.error('API Error Exception:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Default response settings
  let statusCode = err.statusCode || 500;
  let responsePayload = {
    success: false,
    message: err.message || 'An unexpected server error occurred.',
    errors: err.errors || null
  };

  // If running in development mode, append the full error stack details to assist debugging
  if (process.env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};
