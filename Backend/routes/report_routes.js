const express = require("express");
const Report = require("../models/reports");
const authenticate = require("../middleware/auth");
const router = express.Router();
const User = require("../models/users");

router.get("/:id/name", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name");

    res.json({ name: user.name });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { activeOnly, sort } = req.query;

    const filter = {};
    if (String(activeOnly).toLowerCase() === "true") {
      filter.expiresAt = { $gt: new Date() };
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

const { notifyNearbyUsers } = require("../utils/notifications");

router.post("/", async (req, res) => {
  try {
    const {
      type,
      severity,
      validity,
      reportedBy,
      reportedByUID,
      location,
      description,
      wayId,
      photoUrl,
    } = req.body || {};

    console.log(wayId);
    // validation
    if (!type || !severity || !description || !reportedBy) {
      return res
        .status(400)
        .json({
          error: "type, severity, description, and reportedBy are required",
        });
    }

    const validityNum = Number(validity);
    if (!validityNum || validityNum < 1) {
      return res
        .status(400)
        .json({ error: "validity (minutes) must be a positive number" });
    }

    if (
      !location ||
      typeof location.lat !== "number" ||
      typeof location.lng !== "number" ||
      !wayId
    ) {
      return res
        .status(400)
        .json({
          error: `location.lat and location.lng are required numbers ${location} ${location.lat} ${location.lng} $wayId}`,
        });
    }
    // before create
    const active = await Report.findOne({
      wayId: req.body.wayId,
      type: req.body.type,
      expiresAt: { $gt: new Date() },
    });
    if (active)
      return res.status(409).json({error:
            "An active report of this type already exists on this road segment.",
        });

    const report = await Report.create({
      type,
      severity,
      validity: validityNum,
      reportedBy: String(reportedBy),
      reportedByUID: String(reportedByUID),
      location: { lat: location.lat, lng: location.lng },
      description,
      wayId,
      ...(photoUrl ? { photoUrl } : {}),
    });
    await notifyNearbyUsers(report);
    return res.status(201).json(report);
  } catch (err) {
    console.error("Create report error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
