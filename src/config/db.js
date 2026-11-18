const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const env = require("./env");

let dbInstance = null;

function initializeSchema(db) {
  const schemaPath = path.resolve(__dirname, "../../database/schema.sql");
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    db.exec(schemaSql);
  }
}

function getDb(customDbPath = null) {
  if (dbInstance && !customDbPath) {
    return dbInstance;
  }

  const dbPath = customDbPath || env.DB_PATH;

  // Ensure parent directory exists (e.g. database/)
  if (dbPath !== ":memory:") {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);

  // Configure SQLite Pragmas
  db.exec("PRAGMA foreign_keys = ON;");
  if (dbPath !== ":memory:") {
    db.exec("PRAGMA journal_mode = WAL;");
  }

  // Ensure tables and indexes exist safely
  initializeSchema(db);

  if (!customDbPath) {
    dbInstance = db;
  }

  return db;
}

function closeDb() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore if already closed
    }
    dbInstance = null;
  }
}

module.exports = {
  getDb,
  closeDb,
  initializeSchema
};
