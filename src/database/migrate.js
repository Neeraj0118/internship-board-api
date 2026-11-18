const { getDb, closeDb } = require("../config/db");

function migrate() {
  console.log("==> Running SQLite Database Migration...");
  try {
    const db = getDb();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log("✅ Database initialized successfully. Active tables:", tables.map((t) => t.name).join(", "));
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    closeDb();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
