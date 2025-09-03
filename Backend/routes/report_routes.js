const express = require("express");
const Report = require("../models/reports");
const authenticate = require("../middleware/auth");
const router = express.Router();

// Create a new report
router.post("/", authenticate, async (req, res) => {
  try {
    const { type, severity, validity, reportedBy, reportedByUID, location, photoUrl, description } = req.body;
    const report = new Report({
      type,
      severity,
      validity,
      reportedBy,
      reportedByUID,
      location,
      photoUrl,
      description,
    });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
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