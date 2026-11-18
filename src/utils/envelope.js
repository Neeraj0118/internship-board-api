/**
 * Standard API Response Envelope Helpers
 */

/**
 * Standard Success Response
 * @param {object} res - Express response object
 * @param {any} data - Payload data
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {object|null} pagination - Optional pagination metadata
 * @param {string|null} message - Optional human-readable message
 */
function sendSuccess(res, data = null, statusCode = 200, pagination = null, message = null) {
  const envelope = {
    status: "success",
    data
  };

  if (pagination) {
    envelope.pagination = pagination;
  }

  if (message) {
    envelope.message = message;
  }

  return res.status(statusCode).json(envelope);
}

/**
 * Standard Error Response
 * @param {object} res - Express response object
 * @param {string} message - Human-readable error summary
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {Array|null} errors - Array of field-specific validation errors
 */
function sendError(res, message = "An unexpected error occurred", statusCode = 500, errors = null) {
  const envelope = {
    status: "error",
    message
  };

  if (errors && Array.isArray(errors) && errors.length > 0) {
    envelope.errors = errors;
  }

  return res.status(statusCode).json(envelope);
}

module.exports = {
  sendSuccess,
  sendError
};
