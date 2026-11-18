const { getDb } = require("../config/db");

function formatInternship(row) {
  if (!row) return null;

  let parsedSkills = [];
  try {
    parsedSkills = JSON.parse(row.skills || "[]");
  } catch {
    parsedSkills = [];
  }

  return {
    id: row.id,
    title: row.title,
    company: row.company,
    domain: row.domain,
    location: row.location,
    mode: row.mode,
    locationType: row.mode, // frontend compatibility alias
    duration: row.duration,
    duration_months: row.duration_months,
    durationMonths: row.duration_months, // frontend compatibility alias
    stipend: row.stipend,
    posted_date: row.posted_date,
    postedDate: row.posted_date, // frontend compatibility alias
    description: row.description,
    skills: parsedSkills,
    openings: row.openings,
    applications_open: Boolean(row.applications_open),
    featured: Boolean(row.featured),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

class InternshipsService {
  listInternships({ search, domain, mode, sort, page = 1, limit = 10 }) {
    const db = getDb();
    const whereClauses = [];
    const params = [];

    // Search filter across title, company, skills, description
    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      whereClauses.push(
        "(LOWER(title) LIKE ? OR LOWER(company) LIKE ? OR LOWER(skills) LIKE ? OR LOWER(description) LIKE ?)"
      );
      params.push(term, term, term, term);
    }

    // Domain filter (case-insensitive)
    if (domain && domain.trim() && domain.toLowerCase() !== "all") {
      whereClauses.push("LOWER(domain) = LOWER(?)");
      params.push(domain.trim());
    }

    // Mode filter (Remote, Hybrid, On-site)
    if (mode && mode.trim() && mode.toLowerCase() !== "all") {
      whereClauses.push("LOWER(mode) = LOWER(?)");
      params.push(mode.trim());
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Count total matching items
    const countQuery = `SELECT COUNT(*) AS total FROM internships ${whereSQL}`;
    const countRow = db.prepare(countQuery).get(...params);
    const totalItems = countRow ? Number(countRow.total) : 0;

    // Sorting logic
    let orderSQL = "ORDER BY featured DESC, created_at DESC";
    switch (sort) {
      case "title-asc":
        orderSQL = "ORDER BY title ASC";
        break;
      case "title-desc":
        orderSQL = "ORDER BY title DESC";
        break;
      case "company-asc":
        orderSQL = "ORDER BY company ASC";
        break;
      case "duration-asc":
        orderSQL = "ORDER BY duration_months ASC, duration ASC";
        break;
      case "duration-desc":
        orderSQL = "ORDER BY duration_months DESC, duration DESC";
        break;
      case "featured":
      default:
        orderSQL = "ORDER BY featured DESC, created_at DESC";
        break;
    }

    const totalPages = Math.ceil(totalItems / limit) || 1;
    const safePage = Math.min(Math.max(1, page), totalPages);
    const offset = (safePage - 1) * limit;

    const selectQuery = `
      SELECT * FROM internships
      ${whereSQL}
      ${orderSQL}
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(selectQuery).all(...params, limit, offset);
    const formatted = rows.map(formatInternship);

    return {
      items: formatted,
      pagination: {
        page: safePage,
        limit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1
      }
    };
  }

  getInternshipById(id) {
    const db = getDb();
    const row = db.prepare("SELECT * FROM internships WHERE id = ?").get(String(id));
    if (!row) return null;

    const formatted = formatInternship(row);

    // Live applications count for this role
    const appCount = db
      .prepare("SELECT COUNT(*) AS count FROM applications WHERE internship_id = ?")
      .get(String(id));
    formatted.applications_count = appCount ? Number(appCount.count) : 0;

    return formatted;
  }

  createInternship(data) {
    const db = getDb();

    // Preserve supplied ID or generate a unique ID
    let newId = data.id ? String(data.id) : null;
    if (!newId) {
      // Find highest numeric ID or generate INT-xxx
      const maxRow = db.prepare("SELECT id FROM internships ORDER BY rowid DESC LIMIT 1").get();
      newId = `INT-${Date.now().toString().slice(-4)}`;
    }

    // Check if ID already exists
    const existing = db.prepare("SELECT id FROM internships WHERE id = ?").get(newId);
    if (existing) {
      throw new Error(`Internship with ID '${newId}' already exists.`);
    }

    const skillsJson = JSON.stringify(Array.isArray(data.skills) ? data.skills : []);
    const applicationsOpen = data.applications_open !== undefined ? (data.applications_open ? 1 : 0) : 1;
    const featured = data.featured ? 1 : 0;

    const stmt = db.prepare(`
      INSERT INTO internships (
        id, title, company, domain, location, mode,
        duration, duration_months, stipend, posted_date,
        description, skills, openings, applications_open, featured
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      newId,
      data.title.trim(),
      data.company ? data.company.trim() : "Undisclosed",
      data.domain.trim(),
      data.location ? data.location.trim() : "Remote",
      data.mode.trim(),
      data.duration ? data.duration.trim() : "3 Months",
      data.duration_months ? Number(data.duration_months) : 3,
      data.stipend ? data.stipend.trim() : "Competitive",
      data.posted_date ? data.posted_date.trim() : "Just now",
      data.description ? data.description.trim() : "",
      skillsJson,
      data.openings ? Number(data.openings) : 1,
      applicationsOpen,
      featured
    );

    return this.getInternshipById(newId);
  }

  updateInternship(id, data, isPartial = false) {
    const db = getDb();
    const existing = db.prepare("SELECT * FROM internships WHERE id = ?").get(String(id));
    if (!existing) return null;

    const title = data.title !== undefined ? data.title.trim() : (isPartial ? existing.title : "");
    const company = data.company !== undefined ? data.company.trim() : (isPartial ? existing.company : "Undisclosed");
    const domain = data.domain !== undefined ? data.domain.trim() : (isPartial ? existing.domain : "");
    const location = data.location !== undefined ? data.location.trim() : (isPartial ? existing.location : "Remote");
    const mode = data.mode !== undefined ? data.mode.trim() : (isPartial ? existing.mode : "Remote");
    const duration = data.duration !== undefined ? data.duration.trim() : (isPartial ? existing.duration : "3 Months");
    const duration_months = data.duration_months !== undefined ? Number(data.duration_months) : (isPartial ? existing.duration_months : 3);
    const stipend = data.stipend !== undefined ? data.stipend.trim() : (isPartial ? existing.stipend : "Competitive");
    const posted_date = data.posted_date !== undefined ? data.posted_date.trim() : (isPartial ? existing.posted_date : existing.posted_date);
    const description = data.description !== undefined ? data.description.trim() : (isPartial ? existing.description : "");
    const skills = data.skills !== undefined ? JSON.stringify(data.skills) : (isPartial ? existing.skills : "[]");
    const openings = data.openings !== undefined ? Number(data.openings) : (isPartial ? existing.openings : 1);
    const applications_open = data.applications_open !== undefined
      ? (data.applications_open ? 1 : 0)
      : (isPartial ? existing.applications_open : 1);
    const featured = data.featured !== undefined ? (data.featured ? 1 : 0) : (isPartial ? existing.featured : 0);

    const stmt = db.prepare(`
      UPDATE internships SET
        title = ?,
        company = ?,
        domain = ?,
        location = ?,
        mode = ?,
        duration = ?,
        duration_months = ?,
        stipend = ?,
        posted_date = ?,
        description = ?,
        skills = ?,
        openings = ?,
        applications_open = ?,
        featured = ?,
        updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      WHERE id = ?
    `);

    stmt.run(
      title,
      company,
      domain,
      location,
      mode,
      duration,
      duration_months,
      stipend,
      posted_date,
      description,
      skills,
      openings,
      applications_open,
      featured,
      String(id)
    );

    return this.getInternshipById(id);
  }

  deleteInternship(id) {
    const db = getDb();
    const existing = db.prepare("SELECT id FROM internships WHERE id = ?").get(String(id));
    if (!existing) return false;

    db.prepare("DELETE FROM internships WHERE id = ?").run(String(id));
    return true;
  }

  getDomains() {
    const db = getDb();
    const rows = db
      .prepare(`
        SELECT domain, COUNT(*) AS count
        FROM internships
        GROUP BY domain
        ORDER BY domain ASC
      `)
      .all();

    return rows.map((r) => ({
      domain: r.domain,
      count: Number(r.count)
    }));
  }
}

module.exports = new InternshipsService();
