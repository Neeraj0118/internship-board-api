const express = require("express");
const { sendSuccess } = require("../utils/envelope");
const env = require("../config/env");

const router = express.Router();
const processStartTime = Date.now();

function handleHealth(req, res) {
  const uptimeSeconds = Math.floor((Date.now() - processStartTime) / 1000);

  const healthData = {
    service: "internship-board-api",
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    environment: env.NODE_ENV,
    nodeVersion: process.version
  };

  return sendSuccess(
    res,
    healthData,
    200,
    null,
    "InternSphere API service is healthy and operating normally."
  );
}

router.get("/", handleHealth);
router.get("/health", handleHealth);

module.exports = router;
