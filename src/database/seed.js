const fs = require("fs");
const path = require("path");
const { getDb, closeDb } = require("../config/db");

const FRONTEND_SEED_PATH = path.resolve(__dirname, "../../data/seed-frontend.json");
const API_SEED_PATH = path.resolve(__dirname, "../../data/seed-api-sample.json");

function seedDataset(db, datasetType = "frontend") {
  const insertStmt = db.prepare(`
    INSERT INTO internships (
      id, title, company, domain, location, mode,
      duration, duration_months, stipend, posted_date,
      description, skills, openings, applications_open, featured,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      company = excluded.company,
      domain = excluded.domain,
      location = excluded.location,
      mode = excluded.mode,
      duration = excluded.duration,
      duration_months = excluded.duration_months,
      stipend = excluded.stipend,
      posted_date = excluded.posted_date,
      description = excluded.description,
      skills = excluded.skills,
      openings = excluded.openings,
      applications_open = excluded.applications_open,
      featured = excluded.featured,
      updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  `);

  let seededCount = 0;

  // 1. Seed Dataset A: Frontend primary dataset (IDs 1-15)
  if (datasetType === "frontend" || datasetType === "all") {
    if (!fs.existsSync(FRONTEND_SEED_PATH)) {
      throw new Error(`Frontend seed file not found at ${FRONTEND_SEED_PATH}`);
    }
    const frontendData = JSON.parse(fs.readFileSync(FRONTEND_SEED_PATH, "utf8"));
    console.log(`--> Seeding Dataset A (Frontend, ${frontendData.length} records)...`);

    for (const item of frontendData) {
      insertStmt.run(
        String(item.id),
        item.title,
        item.company || "Undisclosed",
        item.domain,
        item.location || "Remote",
        item.locationType || item.mode || "Remote",
        item.duration || "3 Months",
        item.durationMonths || 3,
        item.stipend || "Competitive",
        item.postedDate || "Recently",
        item.description || "",
        JSON.stringify(Array.isArray(item.skills) ? item.skills : []),
        item.openings || 2,
        item.applications_open !== undefined ? (item.applications_open ? 1 : 0) : 1,
        item.featured ? 1 : 0
      );
      seededCount++;
    }
    console.log(`✅ Dataset A seeded successfully (IDs 1-${frontendData.length}).`);
  }

  // 2. Seed Dataset B: API sample reference dataset (IDs INT-101 to INT-105)
  if (datasetType === "api" || datasetType === "all") {
    if (!fs.existsSync(API_SEED_PATH)) {
      throw new Error(`API sample seed file not found at ${API_SEED_PATH}`);
    }
    const rawApiData = JSON.parse(fs.readFileSync(API_SEED_PATH, "utf8"));
    const apiRecords = Array.isArray(rawApiData) ? rawApiData : rawApiData.internships || [];
    console.log(`--> Seeding Dataset B (API Sample, ${apiRecords.length} records)...`);

    for (const item of apiRecords) {
      insertStmt.run(
        String(item.id),
        item.title,
        item.company || "Undisclosed",
        item.domain,
        item.location || "Remote",
        item.mode || "Remote",
        item.duration || "Flexible",
        item.duration_months || 3,
        item.stipend || "Unpaid",
        item.posted_date || "Recently",
        item.description || `Internship opportunity in ${item.domain}.`,
        JSON.stringify(Array.isArray(item.skills) ? item.skills : []),
        item.openings || 1,
        1,
        0
      );
      seededCount++;
    }
    console.log(`✅ Dataset B seeded successfully (IDs INT-101 to INT-105).`);
  }

  return seededCount;
}

function runSeed() {
  const args = process.argv.slice(2);
  let datasetType = "frontend";

  for (const arg of args) {
    if (arg.startsWith("--dataset=")) {
      datasetType = arg.split("=")[1].toLowerCase();
    }
  }

  console.log(`==> InternSphere Database Seeder [Target: ${datasetType}]`);
  try {
    const db = getDb();
    const count = seedDataset(db, datasetType);
    console.log(`🎉 Total records seeded / synchronized: ${count}`);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  } finally {
    closeDb();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = {
  seedDataset
};
