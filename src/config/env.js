const path = require("path");
const dotenv = require("dotenv");

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const projectRoot = path.resolve(__dirname, "../../");

function resolveDbPath(customPath) {
  if (!customPath) {
    return path.resolve(projectRoot, "database/internships.db");
  }
  return path.isAbsolute(customPath)
    ? customPath
    : path.resolve(projectRoot, customPath);
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,
  DB_PATH: resolveDbPath(process.env.DB_PATH),
  ADMIN_API_KEY: process.env.ADMIN_API_KEY || "adminkey_supersecret_internsphere_2026",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*"
};

module.exports = env;
