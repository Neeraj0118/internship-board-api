const express = require("express");
const internshipsController = require("../controllers/internships.controller");

const router = express.Router();

router.get("/", (req, res, next) => {
  internshipsController.getDomains(req, res, next);
});

module.exports = router;
