const env = require("../config/env");
const { sendError } = require("../utils/envelope");

/**
 * Admin API Key Authentication Middleware
 * Protects administrative and applicant-data endpoints.
 */
function requireAdminKey(req, res, next) {
  const headerKey = req.header("x-admin-key");
  const authHeader = req.header("authorization");

  let providedKey = headerKey;
  if (!providedKey && authHeader && authHeader.startsWith("Bearer ")) {
    providedKey = authHeader.substring(7).trim();
  }

  if (!providedKey || providedKey !== env.ADMIN_API_KEY) {
    return sendError(
      res,
      "Unauthorized: Valid admin API key required in 'x-admin-key' header.",
      401
    );
  }

  next();
}

module.exports = {
  requireAdminKey
};
