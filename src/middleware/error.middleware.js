const { sendError } = require("../utils/envelope");
const env = require("../config/env");

/**
 * Global Error Handling Middleware
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || err.status || 500;
  
  // Safe operational logging - never log request body or secrets
  console.error(`[Error] ${req.method} ${req.originalUrl} - Status: ${statusCode} - ${err.message}`);

  // Do not expose stack traces or raw DB errors to the client
  const userMessage = statusCode === 500 && env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message || "An unexpected error occurred";

  return sendError(res, userMessage, statusCode, err.errors || null);
}

module.exports = errorHandler;
