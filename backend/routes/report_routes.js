const express = require("express");
const Report = require("../models/reports");
const authenticate = require("../middleware/auth");
const router = express.Router();



router.post("/", async (req, res) => {
  try {
    const { type, severity, validity, reportedBy, location, description, photoUrl } = req.body || {};

    // validation
    if (!type || !severity || !description || !reportedBy) {
      return res.status(400).json({ error: "type, severity, description, and reportedBy are required" });
    }

    const validityNum = Number(validity);
    if (!validityNum || validityNum < 1) {
      return res.status(400).json({ error: "validity (minutes) must be a positive number" });
    }

    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      return res.status(400).json({ error: "location.lat and location.lng are required numbers" });
    }

    const report = await Report.create({
      type,
      severity,
      validity: validityNum,
      reportedBy: String(reportedBy),
      location: { lat: location.lat, lng: location.lng },
      description,
      ...(photoUrl ? { photoUrl } : {}),
    });

    return res.status(201).json(report);
  } catch (err) {
    console.error("Create report error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
