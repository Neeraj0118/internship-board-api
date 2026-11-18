const app = require("./app");
const env = require("./config/env");
const { getDb, closeDb } = require("./config/db");

// Verify and initialize SQLite database on startup
try {
  getDb();
  console.log(`[InternSphere API] SQLite database connected: ${env.DB_PATH}`);
} catch (err) {
  console.error(`[InternSphere API] Fatal: Database initialization failed:`, err.message);
  process.exit(1);
}

const server = app.listen(env.PORT, () => {
  console.log(`[InternSphere API] Server listening on port ${env.PORT} (${env.NODE_ENV} mode)`);
  console.log(`[InternSphere API] Health endpoint available at http://localhost:${env.PORT}/api/v1/health`);
  console.log(`[InternSphere API] Internships endpoint at http://localhost:${env.PORT}/api/v1/internships`);
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
  console.log(`\n[InternSphere API] Received ${signal}. Closing HTTP server and database gracefully...`);
  server.close(() => {
    closeDb();
    console.log("[InternSphere API] HTTP server and SQLite database connection closed.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("[InternSphere API] Forced shutdown after timeout.");
    process.exit(1);
  }, 5000);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

module.exports = server;
