const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
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


router.post("/:id/saved-places", authenticate, async (req, res) => {
  try {
    const { locationName, lat, lng } = req.body;

    if (!locationName || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "locationName, lat and lng are required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.savedPlaces.set(locationName, { lat, lng });

    await user.save();

    res.json({ savedPlaces: user.savedPlaces });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;