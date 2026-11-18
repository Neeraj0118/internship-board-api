const express = require("express");
const internshipsController = require("../controllers/internships.controller");
const {
  validateInternshipCreate,
  validateInternshipUpdate,
  validatePagination
} = require("../middleware/validate.middleware");

const router = express.Router();

// List internships with search, filters, sorting & pagination
router.get("/", validatePagination, (req, res, next) => {
  internshipsController.list(req, res, next);
});

// Get single internship by ID
router.get("/:id", (req, res, next) => {
  internshipsController.getById(req, res, next);
});

// Create new internship
router.post("/", validateInternshipCreate, (req, res, next) => {
  internshipsController.create(req, res, next);
});

// Full update of internship
router.put("/:id", validateInternshipCreate, (req, res, next) => {
  internshipsController.update(req, res, next);
});

// Partial update of internship
router.patch("/:id", validateInternshipUpdate, (req, res, next) => {
  internshipsController.patch(req, res, next);
});

// Delete internship
router.delete("/:id", (req, res, next) => {
  internshipsController.delete(req, res, next);
});

module.exports = router;
