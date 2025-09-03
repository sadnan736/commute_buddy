const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: "User registered", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

//For_Updating_Avatar

router.put("/:id/avatar", authenticate, async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { avatar }, { new: true }).select("-password");
    res.json({ message: "Avatar updated", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});




//For Updating Locations
router.put("/:id/locations", authenticate, async (req, res) => {
  try {
    const { homeLocation, workLocation } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { homeLocation, workLocation },
      { new: true }
    ).select("-password");
    res.json({ message: "Locations updated", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


//Updating Notification Preferences

router.put("/:id/notifications", authenticate, async (req, res) => {
  try {
    const { notificationPreferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { notificationPreferences },
      { new: true }
    ).select("-password");
    res.json({ message: "Notification preferences updated", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


//Submitting Documents
router.post("/verify", authenticate, upload.array("documents", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No documents were uploaded." });
    }

    const documentsToStore = req.files.map((file) => ({
      name: file.originalname,
      data: file.buffer, // Get the file content from the buffer
      contentType: file.mimetype,
    }));

    const user = await User.findByIdAndUpdate(
      req.user.id, // Use ID from authenticated user for security
      {
        $push: { verifiedDocuments: { $each: documentsToStore } },
        isVerified: false,
        verificationStatus: "pending",
        verificationSubmittedAt: new Date(),
      },
      { new: true }
    ).select("-password -verifiedDocuments"); // Exclude all verifiedDocuments from response

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Verification documents submitted successfully", user });
  } catch (err) {
    console.error(err);
    if (err.message.startsWith("Error: File upload only supports")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error during file upload" });
  }
});


// GET
router.get("/:id/followed-routes", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("followedRoutes");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



// PUT
router.put("/:id/followed-routes", authenticate, async (req, res) => {
  try {
    const { routes } = req.body; // array of route names
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { followedRoutes: routes },
      { new: true }
    ).select("-password");
    res.json({ message: "Followed routes updated", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



// DELETE
router.delete("/:id/followed-routes/:rid", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.followedRoutes = user.followedRoutes.filter(r => r !== req.params.rid);
    await user.save();
    res.json({ message: "Route removed", followedRoutes: user.followedRoutes });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



//Prefered Regions


// GET
router.get("/:id/preferred-regions", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("preferredRegions");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



// PUT
router.put("/:id/preferred-regions", authenticate, async (req, res) => {
  try {
    const { regions } = req.body; // array of region names
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { preferredRegions: regions },
      { new: true }
    ).select("-password");
    res.json({ message: "Preferred regions updated", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;