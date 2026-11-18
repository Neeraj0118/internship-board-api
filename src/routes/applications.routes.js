const express = require("express");
const applicationsController = require("../controllers/applications.controller");
const { validateApplicationCreate, validatePagination } = require("../middleware/validate.middleware");
const { requireAdminKey } = require("../middleware/auth.middleware");

const router = express.Router();

// Public: Submit an internship application
router.post("/", validateApplicationCreate, (req, res, next) => {
  applicationsController.create(req, res, next);
});

// Admin Protected: List applications (supports pagination and ?internship_id filter)
router.get("/", requireAdminKey, validatePagination, (req, res, next) => {
  applicationsController.list(req, res, next);
});

// Admin Protected: Get application details by ID
router.get("/:id", requireAdminKey, (req, res, next) => {
  applicationsController.getById(req, res, next);
});

module.exports = router;
