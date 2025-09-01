const express = require("express");
const authenticate = require("../middleware/auth");
const Notification = require("../models/notification");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(notifications);
});

router.put("/:id/read", authenticate, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ message: "Marked as read" });
});

module.exports = router;
