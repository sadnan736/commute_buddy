const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const authenticate = require("../middleware/auth");
const router = express.Router();

router.get("/:id/saved-places", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("savedPlaces");

    const savedPlaces = {};
    for (let [key, value] of user.savedPlaces) {
      savedPlaces[key] = { lat: value.lat, lng: value.lng };
    }
    res.json(savedPlaces);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/saved-places",  async (req, res) => {
  try {
    const { locationName, lat, lng, wayId } = req.body;

    if (!locationName || lat === undefined || lng === undefined || wayId === undefined) {
      return res
        .status(400)
        .json({ error: "locationName, lat and lng are required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.savedPlaces.set(locationName, { lat, lng, wayId });
    
    await user.save();
    res.json({ [locationName] :{ lat, lng, wayId }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id/saved-places", authenticate, async (req, res) => {
  try {
    const { locationName } = req.body; // key to delete

    if (!locationName) {
      return res.status(400).json({ error: "locationName is required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Delete key from Map
    if (!user.savedPlaces.has(locationName)) {
      return res.status(404).json({ error: "Location not found" });
    }

    user.savedPlaces.delete(locationName);
    await user.save();

    // Return updated savedPlaces
    const savedPlaces = {};
    for (let [key, value] of user.savedPlaces) {
      savedPlaces[key] = { lat: value.lat, lng: value.lng };
    }

    res.json({ message: "Location deleted", savedPlaces });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
