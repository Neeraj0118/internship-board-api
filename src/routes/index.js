const express = require("express");
const healthRoutes = require("./health.routes");
const internshipsRoutes = require("./internships.routes");
const applicationsRoutes = require("./applications.routes");
const domainsRoutes = require("./domains.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/internships", internshipsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/domains", domainsRoutes);

module.exports = router;
