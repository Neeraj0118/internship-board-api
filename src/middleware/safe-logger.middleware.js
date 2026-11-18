/**
 * Safe Logger Middleware
 * Ensures logs NEVER expose applicant names, full emails, notes, or request bodies.
 */

function sanitizeUrl(rawUrl) {
  try {
    // Mask email query params if any
    return rawUrl.replace(/([?&]email=)([^&]+)/gi, (match, prefix, val) => {
      const parts = decodeURIComponent(val).split("@");
      if (parts.length === 2) {
        const namePart = parts[0];
        const masked = namePart.length > 2 ? `${namePart[0]}***${namePart[namePart.length - 1]}` : `${namePart[0]}***`;
        return `${prefix}${encodeURIComponent(`${masked}@${parts[1]}`)}`;
      }
      return `${prefix}***`;
    });
  } catch {
    return rawUrl;
  }
}

function safeLogger(req, res, next) {
  const startTime = process.hrtime();
  const safeUrl = sanitizeUrl(req.originalUrl || req.url);

  res.on("finish", () => {
    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const statusCode = res.statusCode;
    const method = req.method;
    const ip = req.ip || req.socket.remoteAddress || "-";

    // Strictly sanitize and log ONLY high-level operational metadata
    // Never print req.body, applicant names, emails, or notes
    const logLine = `[${new Date().toISOString()}] ${method} ${safeUrl} ${statusCode} ${durationMs}ms - IP: ${ip}`;

    if (statusCode >= 500) {
      console.error(logLine);
    } else if (statusCode >= 400) {
      console.warn(logLine);
    } else {
      console.log(logLine);
    }
  });

  next();
}

module.exports = safeLogger;
