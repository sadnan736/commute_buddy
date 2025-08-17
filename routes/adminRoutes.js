const express = require("express");
const User = require("../models/users");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

// GET /api/admin/pending-verifications - List all users with pending verification
router.get("/pending-verifications", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find({ verificationStatus: "pending" })
      .select("name email verifiedDocuments verificationSubmittedAt")
      .sort({ verificationSubmittedAt: -1 }); // Most recent first
    
    res.json({ 
      message: "Pending verifications retrieved", 
      count: users.length,
      users 
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/admin/verification/:userId - Get specific user's verification details
router.get("/verification/:userId", authenticate, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("name email verifiedDocuments isVerified verificationStatus verificationSubmittedAt verificationComments");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ message: "User verification details", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/admin/verification/:userId/approve - Approve user verification
router.put("/verification/:userId/approve", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { comments } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { 
        isVerified: true, 
        role: "verifiedReporter", 
        verificationStatus: "approved", 
        verificationComments: comments || "Documents verified successfully" 
      },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ 
      message: "User verification approved", 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/admin/verification/:userId/reject - Reject user verification
router.put("/verification/:userId/reject", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { 
        isVerified: false, 
        verificationStatus: "rejected", 
        verificationComments: reason || "Documents did not meet verification requirements",
        // Clear documents so user can resubmit
        verifiedDocuments: []
      },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ 
      message: "User verification rejected", 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        verificationComments: user.verificationComments
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/admin/users - Get all users
router.get("/users", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/admin/users/:id/role - Admin-only endpoint to change user roles (moved from userRoutes)
router.put("/users/:id/role", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "verifiedReporter", "moderator", "admin"].includes(role)) {
      return res.status(400).json({ error: "Unknown role" });
    }

    // Prevent self-downgrade or self-upgrade
    if (req.user._id.equals(req.params.id)) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ message: "Role updated", user: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/*
# Admin routes have been moved to routes/adminRoutes.js
# This includes:
# - User role management: PUT /api/admin/users/:id/role
# - Verification management: GET/PUT /api/admin/verification/*

# How to create the first admin:
1. Open MongoDB Atlas → Collections → users.
2. Edit the trusted user document.
3. Add/modify: "role": "admin"

Note: New sign-ups automatically get role: "user"
Admin endpoints are now at /api/admin/*
*/

module.exports = router;
