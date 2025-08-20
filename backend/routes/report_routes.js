const express = require("express");
const Report = require("../models/reports");
const authenticate = require("../middleware/auth");
const router = express.Router();


// router.get("/:id/", authenticate, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("savedPlaces");

//     const savedPlaces = {};
//     for (let [key, value] of user.savedPlaces) {
//       savedPlaces[key] = { lat: value.lat, lng: value.lng };
//     }
//     res.json(savedPlaces);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });