const applicationsService = require("../services/applications.service");
const { sendSuccess, sendError } = require("../utils/envelope");

class ApplicationsController {
  create(req, res, next) {
    try {
      const result = applicationsService.createApplication(req.body);

      if (result.status === "NOT_FOUND") {
        return sendError(res, result.message, 404);
      }

      if (result.status === "APPLICATIONS_CLOSED") {
        return sendError(res, result.message, 400);
      }

      if (result.status === "DUPLICATE") {
        return sendError(res, result.message, 409);
      }

      return sendSuccess(
        res,
        result.data,
        201,
        null,
        "Application submitted successfully. We will review your profile shortly!"
      );
    } catch (err) {
      next(err);
    }
  }

  list(req, res, next) {
    try {
      const { internship_id } = req.query;
      const { page, limit } = req.pagination;

      const result = applicationsService.listApplications({
        internship_id,
        page,
        limit
      });

      return sendSuccess(
        res,
        result.items,
        200,
        result.pagination,
        `Retrieved ${result.items.length} applications.`
      );
    } catch (err) {
      next(err);
    }
  }

  getById(req, res, next) {
    try {
      const { id } = req.params;
      const application = applicationsService.getApplicationById(id);

      if (!application) {
        return sendError(res, `Application not found with ID '${id}'`, 404);
      }

      return sendSuccess(res, application, 200, null, "Application retrieved successfully.");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ApplicationsController();
