const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const safeLogger = require("./middleware/safe-logger.middleware");
const errorHandler = require("./middleware/error.middleware");
const apiRouter = require("./routes/index");
const healthRoutes = require("./routes/health.routes");
const { sendSuccess, sendError } = require("./utils/envelope");

const app = express();

// Disable X-Powered-By header
app.disable("x-powered-by");

// Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// CORS Configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
    credentials: true
  })
);

// Standard Body Parsers (with safe payload size limits)
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Safe Logger Middleware (zero PII exposure)
app.use(safeLogger);

// Static frontend serving if public folder exists
const publicDir = path.resolve(__dirname, "../public");
app.use(express.static(publicDir));

// Top-level health check shortcut
app.use("/health", healthRoutes);

// Mount API v1 Routes
app.use("/api/v1", apiRouter);

// Root informational endpoint
app.get("/", (req, res) => {
  return sendSuccess(
    res,
    {
      name: "InternSphere REST API",
      version: "1.0.0",
      description: "Backend REST API and Persistent Data Service for Responsive Internship Board",
      health: "/api/v1/health",
      internships: "/api/v1/internships",
      domains: "/api/v1/domains"
    },
    200,
    null,
    "Welcome to the InternSphere API service."
  );
});

// 404 Handler for undefined routes
app.use((req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
