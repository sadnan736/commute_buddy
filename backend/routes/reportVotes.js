// routes/reportVotes.js

const express = require("express");
const Report = require("../models/reports");
const authenticate = require("../middleware/auth");
const router = express.Router();

/**
 * Helper function to check if user has already voted
 */
function hasUserVoted(report, userId) {
  return report.votedUsers.some((voter) => voter.userId === userId);
}

/**
 * Upvote a report
 */
router.post("/:id/upvote", authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId from auth middleware
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    // Check if user already voted
    if (hasUserVoted(report, userId)) {
      return res.status(400).json({ error: "User has already voted on this report" });
    }

    report.votes.upvotes += 1;
    report.votedUsers.push({ userId, voteType: "upvote" });
    await report.save();

    res.json({
      upvotes: report.votes.upvotes,
      downvotes: report.votes.downvotes,
    });
  } catch (err) {
    console.error("Upvote error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Downvote a report
 */
router.post("/:id/downvote", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    if (hasUserVoted(report, userId)) {
      return res.status(400).json({ error: "User has already voted on this report" });
    }

    report.votes.downvotes += 1;
    report.votedUsers.push({ userId, voteType: "downvote" });
    await report.save();

    res.json({
      upvotes: report.votes.upvotes,
      downvotes: report.votes.downvotes,
    });
  } catch (err) {
    console.error("Downvote error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
