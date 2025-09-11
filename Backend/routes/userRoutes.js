const fs = require("fs");
const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const authenticate = require("../middleware/auth");
const multer = require("multer");

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
console.log("Uploads folder ready:", uploadDir);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


router.get("/hello", (req, res) => {
  res.json("working");
});


// ------------------ REGISTER ------------------
router.post("/register", upload.single("avatar"), async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { name = "", email = "", password = "" } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email, and password are required" });

    const avatar = req.file ? `/uploads/${req.file.filename}` : null;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
    });

    res.status(201).json({ message: "User registered", userId: user._id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// ------------------ LOGIN ------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;


// ------------------ GET USER ------------------
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



// ------------------ UPDATE USER ------------------
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

// ------------------ UPDATE AVATAR ------------------
router.put("/:id/avatar", authenticate, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const avatarPath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: avatarPath },
      { new: true }
    ).select("-password");

    res.json({ message: "Avatar updated", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------ UPDATE LOCATIONS ------------------
router.put("/:id/locations", authenticate, async (req, res) => {
  try {
    const { homeLocation = "", workLocation = "" } = req.body;
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

// ------------------ UPDATE NOTIFICATIONS ------------------
router.put("/:id/notifications", authenticate, async (req, res) => {
  try {
    const { notificationPreferences = {} } = req.body;
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

// ------------------ SUBMIT DOCUMENTS ------------------
router.post("/:id/verify", authenticate, async (req, res) => {
  try {
    const { documents = [] } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verifiedDocuments: documents, isVerified: false },
      { new: true }
    ).select("-password");
    res.json({ message: "Verification documents submitted", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------ FOLLOWED ROUTES ------------------
router.get("/:id/followed-routes", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("followedRoutes");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id/followed-routes", authenticate, async (req, res) => {
  try {
    const { routes = [] } = req.body;
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

// ------------------ PREFERRED REGIONS ------------------
router.get("/:id/preferred-regions", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("preferredRegions");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id/preferred-regions", authenticate, async (req, res) => {
  try {
    const { regions = [] } = req.body;
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
