const express = require("express");
const router = express.Router();
const User = require("../models/users");
const auth = require("../middleware/auth");

// Get saved places
router.get("/:userId/saved-places", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.savedPlaces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a saved place
router.post("/:userId/saved-places", auth, async (req, res) => {
  const { name, address, coordinates } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.savedPlaces.push({ name, address, coordinates });
    await user.save();
    res.status(201).json(user.savedPlaces);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a saved place
router.delete("/:userId/saved-places", auth, async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.savedPlaces = user.savedPlaces.filter(place => place.name !== name);
    await user.save();
    res.json({ message: "Place deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
