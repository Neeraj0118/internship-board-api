/**
 * PII Masking Utilities
 * Protects applicant data from exposure in application logs.
 */

function maskEmail(email) {
  if (!email || typeof email !== "string") return "[REDACTED]";
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 1) return "***" + trimmed.slice(atIndex);

  const localPart = trimmed.slice(0, atIndex);
  const domainPart = trimmed.slice(atIndex);

  if (localPart.length <= 2) {
    return `${localPart[0]}***${domainPart}`;
  }
  return `${localPart[0]}***${localPart[localPart.length - 1]}${domainPart}`;
}

function sanitizeLogData(data) {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }

  const sanitized = { ...data };
  const sensitiveKeys = [
    "applicant_name",
    "applicant_email",
    "email",
    "notes",
    "portfolio_url",
    "password",
    "token",
    "admin_api_key",
    "key"
  ];

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.includes(lowerKey)) {
      if (lowerKey.includes("email")) {
        sanitized[key] = maskEmail(sanitized[key]);
      } else {
        sanitized[key] = "[REDACTED]";
      }
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }

  return sanitized;
}

module.exports = {
  maskEmail,
  sanitizeLogData
};
