const { getDb } = require("../config/db");

class ApplicationsService {
  createApplication({ internship_id, applicant_name, applicant_email, portfolio_url, notes }) {
    const db = getDb();

    // 1. Check if internship exists
    const internship = db
      .prepare("SELECT id, title, applications_open FROM internships WHERE id = ?")
      .get(String(internship_id));

    if (!internship) {
      return {
        status: "NOT_FOUND",
        message: `Internship position with ID '${internship_id}' does not exist.`
      };
    }

    // 2. Check if applications are open
    if (!internship.applications_open) {
      return {
        status: "APPLICATIONS_CLOSED",
        message: `Applications are currently closed for '${internship.title}'.`
      };
    }

    // 3. Duplicate application check (internship_id + applicant_email)
    const normalizedEmail = applicant_email.trim().toLowerCase();
    const existing = db
      .prepare("SELECT id FROM applications WHERE internship_id = ? AND applicant_email = ?")
      .get(String(internship_id), normalizedEmail);

    if (existing) {
      return {
        status: "DUPLICATE",
        message: "You have already submitted an application for this internship position."
      };
    }

    // 4. Insert application
    const stmt = db.prepare(`
      INSERT INTO applications (
        internship_id, applicant_name, applicant_email, portfolio_url, notes, status
      ) VALUES (
        ?, ?, ?, ?, ?, 'pending'
      )
    `);

    const result = stmt.run(
      String(internship_id),
      applicant_name.trim(),
      normalizedEmail,
      portfolio_url || null,
      notes || null
    );

    const created = db
      .prepare(`
        SELECT a.id, a.internship_id, a.applicant_name, a.applicant_email, a.portfolio_url, a.notes, a.status, a.created_at,
               i.title AS internship_title, i.company AS internship_company
        FROM applications a
        JOIN internships i ON a.internship_id = i.id
        WHERE a.id = ?
      `)
      .get(result.lastInsertRowid);

    return {
      status: "SUCCESS",
      data: created
    };
  }

  listApplications({ internship_id, page = 1, limit = 10 }) {
    const db = getDb();
    const whereClauses = [];
    const params = [];

    if (internship_id) {
      whereClauses.push("a.internship_id = ?");
      params.push(String(internship_id));
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) AS total FROM applications a ${whereSQL}`;
    const countRow = db.prepare(countQuery).get(...params);
    const totalItems = countRow ? Number(countRow.total) : 0;

    const totalPages = Math.ceil(totalItems / limit) || 1;
    const safePage = Math.min(Math.max(1, page), totalPages);
    const offset = (safePage - 1) * limit;

    const query = `
      SELECT a.id, a.internship_id, a.applicant_name, a.applicant_email, a.portfolio_url, a.notes, a.status, a.created_at,
             i.title AS internship_title, i.company AS internship_company
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      ${whereSQL}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(query).all(...params, limit, offset);

    return {
      items: rows,
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

  getApplicationById(id) {
    const db = getDb();
    const row = db
      .prepare(`
        SELECT a.id, a.internship_id, a.applicant_name, a.applicant_email, a.portfolio_url, a.notes, a.status, a.created_at,
               i.title AS internship_title, i.company AS internship_company
        FROM applications a
        JOIN internships i ON a.internship_id = i.id
        WHERE a.id = ?
      `)
      .get(Number(id));

    return row || null;
  }
}

module.exports = new ApplicationsService();
