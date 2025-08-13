const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {type: String,required: true },

  email: {type: String, required: true, unique: true },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["user", "verifiedReporter", "moderator", "admin"],
    default: "user",
  },

  avatar: { type: String},

  homeLocation: { type: String},

  workLocation: { type: String },

  notificationPreferences: { type: Object,default: {} },

  profileCompleted: {
    type: Boolean,
    default: false,
  },

  followedRoutes: {
    type: [String], // e.g., route names or IDs
    default: [],
  },

  preferredRegions: {
    type: [String], // e.g., zone names or IDs
    default: [],
  },

  verifiedDocuments: {
    type: [String], // filenames or URLs
    default: [],
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  verificationStatus: { 
    type: String, 
    enum: ["none", "pending", "approved", "rejected"],
    default: "none" 
  },

  verificationSubmittedAt: { type: Date },

  verificationComments: { type: String },

  savedPlaces: {type: [
      {
        name: String,
        address: String,
        coordinates: { lat: Number, lng: Number },
      }
    ],
    default: [],
  },
});

module.exports = mongoose.model("User", userSchema);
