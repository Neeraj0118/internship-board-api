const { sendError } = require("../utils/envelope");

const VALID_MODES = ["Remote", "Hybrid", "On-site"];
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const URL_REGEX = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

function validateInternshipCreate(req, res, next) {
  const errors = [];
  const body = req.body || {};

  if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.push({ field: "title", message: "Title is required and must not be empty." });
  }

  if (body.company !== undefined && (typeof body.company !== "string" || body.company.trim().length === 0)) {
    errors.push({ field: "company", message: "Company must not be empty if provided." });
  }

  if (!body.domain || typeof body.domain !== "string" || body.domain.trim().length === 0) {
    errors.push({ field: "domain", message: "Domain is required and must not be empty." });
  }

  if (!body.mode || typeof body.mode !== "string" || !VALID_MODES.includes(body.mode)) {
    errors.push({
      field: "mode",
      message: `Mode is required and must be one of: ${VALID_MODES.join(", ")}.`
    });
  }

  if (body.duration_months !== undefined) {
    const months = Number(body.duration_months);
    if (!Number.isInteger(months) || months <= 0) {
      errors.push({ field: "duration_months", message: "duration_months must be a positive integer." });
    }
  }

  if (body.openings !== undefined) {
    const openings = Number(body.openings);
    if (!Number.isInteger(openings) || openings <= 0) {
      errors.push({ field: "openings", message: "Openings must be a positive integer." });
    }
  }

  if (body.skills !== undefined) {
    if (!Array.isArray(body.skills)) {
      errors.push({ field: "skills", message: "Skills must be an array of strings." });
    } else {
      for (let i = 0; i < body.skills.length; i++) {
        if (typeof body.skills[i] !== "string" || body.skills[i].trim().length === 0) {
          errors.push({ field: `skills[${i}]`, message: "Each skill must be a non-empty string." });
          break;
        }
      }
    }
  }

  if (errors.length > 0) {
    return sendError(res, "Validation failed", 400, errors);
  }

  next();
}

function validateInternshipUpdate(req, res, next) {
  const errors = [];
  const body = req.body || {};

  if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim().length === 0)) {
    errors.push({ field: "title", message: "Title must not be empty if provided." });
  }

  if (body.company !== undefined && (typeof body.company !== "string" || body.company.trim().length === 0)) {
    errors.push({ field: "company", message: "Company must not be empty if provided." });
  }

  if (body.domain !== undefined && (typeof body.domain !== "string" || body.domain.trim().length === 0)) {
    errors.push({ field: "domain", message: "Domain must not be empty if provided." });
  }

  if (body.mode !== undefined && (!VALID_MODES.includes(body.mode))) {
    errors.push({
      field: "mode",
      message: `Mode must be one of: ${VALID_MODES.join(", ")}.`
    });
  }

  if (body.duration_months !== undefined) {
    const months = Number(body.duration_months);
    if (!Number.isInteger(months) || months <= 0) {
      errors.push({ field: "duration_months", message: "duration_months must be a positive integer." });
    }
  }

  if (body.openings !== undefined) {
    const openings = Number(body.openings);
    if (!Number.isInteger(openings) || openings <= 0) {
      errors.push({ field: "openings", message: "Openings must be a positive integer." });
    }
  }

  if (body.skills !== undefined) {
    if (!Array.isArray(body.skills)) {
      errors.push({ field: "skills", message: "Skills must be an array of strings." });
    } else {
      for (let i = 0; i < body.skills.length; i++) {
        if (typeof body.skills[i] !== "string" || body.skills[i].trim().length === 0) {
          errors.push({ field: `skills[${i}]`, message: "Each skill must be a non-empty string." });
          break;
        }
      }
    }
  }

  if (errors.length > 0) {
    return sendError(res, "Validation failed", 400, errors);
  }

  next();
}

function validateApplicationCreate(req, res, next) {
  const errors = [];
  const body = req.body || {};

  // Internship ID check
  if (!body.internship_id || typeof body.internship_id !== "string" && typeof body.internship_id !== "number") {
    errors.push({ field: "internship_id", message: "internship_id is required." });
  }

  // Name check: trimmed, 2-100 characters
  const name = typeof body.applicant_name === "string" ? body.applicant_name.trim() : "";
  if (!name || name.length < 2 || name.length > 100) {
    errors.push({ field: "applicant_name", message: "applicant_name is required and must be between 2 and 100 characters." });
  }

  // Email check: trimmed, lowercase, valid RFC email
  const email = typeof body.applicant_email === "string" ? body.applicant_email.trim().toLowerCase() : "";
  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push({ field: "applicant_email", message: "A valid email address is required." });
  }

  // Optional Portfolio URL check: must use safe HTTP/HTTPS URL
  if (body.portfolio_url) {
    const url = String(body.portfolio_url).trim();
    if (!URL_REGEX.test(url)) {
      errors.push({ field: "portfolio_url", message: "portfolio_url must be a valid HTTP or HTTPS URL." });
    }
  }

  // Optional Notes check: max 1000 characters
  if (body.notes && typeof body.notes === "string" && body.notes.length > 1000) {
    errors.push({ field: "notes", message: "notes cannot exceed 1000 characters." });
  }

  if (errors.length > 0) {
    return sendError(res, "Validation failed", 400, errors);
  }

  // Normalize inputs on req.body
  req.body.internship_id = String(body.internship_id);
  req.body.applicant_name = name;
  req.body.applicant_email = email;
  req.body.portfolio_url = body.portfolio_url ? String(body.portfolio_url).trim() : null;
  req.body.notes = body.notes ? String(body.notes).trim() : null;

  next();
}

function validatePagination(req, res, next) {
  const errors = [];
  let page = 1;
  let limit = 10;

  if (req.query.page !== undefined) {
    page = Number(req.query.page);
    if (!Number.isInteger(page) || page <= 0) {
      errors.push({ field: "page", message: "Page must be a positive integer greater than or equal to 1." });
    }
  }

  if (req.query.limit !== undefined) {
    limit = Number(req.query.limit);
    if (!Number.isInteger(limit) || limit <= 0 || limit > 50) {
      errors.push({ field: "limit", message: "Limit must be a positive integer between 1 and 50." });
    }
  }

  if (errors.length > 0) {
    return sendError(res, "Invalid pagination parameters", 400, errors);
  }

  req.pagination = { page, limit };
  next();
}

module.exports = {
  validateInternshipCreate,
  validateInternshipUpdate,
  validateApplicationCreate,
  validatePagination
};
