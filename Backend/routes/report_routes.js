const express = require("express");
const Report = require("../models/reports");
const authenticate = require("../middleware/auth");
const router = express.Router();
const User = require("../models/users");

const { notifyNearbyUsers } = require("../utils/notifications");

// Get user name by ID
router.get("/:id/name", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name");
    res.json({ name: user.name });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new report
router.post("/", authenticate, async (req, res) => {
  try {
    const { type, severity, validity, reportedBy, reportedByUID, location, description, photoUrl } = req.body || {};

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
      reportedByUID: String(reportedByUID),
      location: { lat: location.lat, lng: location.lng },
      description,
      ...(photoUrl ? { photoUrl } : {}),
    });

    await notifyNearbyUsers(report);

    return res.status(201).json(report);
  } catch (err) {
    console.error("Create report error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Get all reports
router.get("/", async (req, res) => {
  try {
    const { activeOnly, sort, keyword, category, severity, timeWindow } = req.query;

    const filter = {};
    if (String(activeOnly).toLowerCase() === "true") {
      filter.expiresAt = { $gt: new Date() };
    }

    if (keyword) {
      filter.description = { $regex: keyword, $options: "i" };
    }

    if (category) {
      // Case-insensitive search for category
      filter.type = { $regex: `^${category}$`, $options: "i" };
    }

    if (severity) {
      // Case-insensitive search for severity
      filter.severity = { $regex: `^${severity}$`, $options: "i" };
    }

    if (timeWindow) {
      const now = new Date();
      let startDate;
      switch (timeWindow) {
        case "24h":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
      if (startDate) {
        filter.createdAt = { $gte: startDate };
      }
    }

    let sortSpec = { createdAt: -1 };
    if (sort === "expiresAt") sortSpec = { expiresAt: 1 };

    const reports = await Report.find(filter).sort(sortSpec).lean();
    res.json(reports);
  } catch (err) {
    console.error("Fetch reports error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user's activity history (their submitted reports)
router.get("/my-reports", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sort, limit = 50, page = 1 } = req.query;

    let sortSpec = { createdAt: -1 };
    if (sort === "createdAt") sortSpec = { createdAt: -1 };
    if (sort === "expiresAt") sortSpec = { expiresAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find({ reportedByUID: userId })
      .sort(sortSpec)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const totalReports = await Report.countDocuments({ reportedByUID: userId });
    const totalPages = Math.ceil(totalReports / parseInt(limit));

    res.json({
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReports,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error("Fetch user reports error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
