const internshipsService = require("../services/internships.service");
const { sendSuccess, sendError } = require("../utils/envelope");

class InternshipsController {
  list(req, res, next) {
    try {
      const { search, domain, mode, sort } = req.query;
      const { page, limit } = req.pagination;

      const result = internshipsService.listInternships({
        search,
        domain,
        mode,
        sort,
        page,
        limit
      });

      return sendSuccess(
        res,
        result.items,
        200,
        result.pagination,
        `Retrieved ${result.items.length} internship positions.`
      );
    } catch (err) {
      next(err);
    }
  }

  getById(req, res, next) {
    try {
      const { id } = req.params;
      const internship = internshipsService.getInternshipById(id);

      if (!internship) {
        return sendError(res, `Internship not found with ID '${id}'`, 404);
      }

      return sendSuccess(res, internship, 200, null, "Internship retrieved successfully.");
    } catch (err) {
      next(err);
    }
  }

  create(req, res, next) {
    try {
      const created = internshipsService.createInternship(req.body);
      return sendSuccess(res, created, 201, null, "Internship position created successfully.");
    } catch (err) {
      if (err.message && err.message.includes("already exists")) {
        return sendError(res, err.message, 409);
      }
      next(err);
    }
  }

  update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = internshipsService.updateInternship(id, req.body, false);

      if (!updated) {
        return sendError(res, `Internship not found with ID '${id}'`, 404);
      }

      return sendSuccess(res, updated, 200, null, "Internship updated successfully.");
    } catch (err) {
      next(err);
    }
  }

  patch(req, res, next) {
    try {
      const { id } = req.params;
      const updated = internshipsService.updateInternship(id, req.body, true);

      if (!updated) {
        return sendError(res, `Internship not found with ID '${id}'`, 404);
      }

      return sendSuccess(res, updated, 200, null, "Internship updated successfully.");
    } catch (err) {
      next(err);
    }
  }

  delete(req, res, next) {
    try {
      const { id } = req.params;
      const success = internshipsService.deleteInternship(id);

      if (!success) {
        return sendError(res, `Internship not found with ID '${id}'`, 404);
      }

      return sendSuccess(
        res,
        { id: String(id) },
        200,
        null,
        `Internship '${id}' and associated applications deleted successfully.`
      );
    } catch (err) {
      next(err);
    }
  }

  getDomains(req, res, next) {
    try {
      const domains = internshipsService.getDomains();
      return sendSuccess(res, domains, 200, null, "Domains list retrieved successfully.");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InternshipsController();
