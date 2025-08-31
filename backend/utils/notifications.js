const Notification = require("../models/notification");
const User = require("../models/users");

// Calculate distance between two lat/lng points in km (Haversine formula)
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function notifyNearbyUsers(report) {
  const users = await User.find(); // load all users or optimize in real app

  for (const user of users) {
    const savedPlaces = user.savedPlaces || new Map();

    for (const [, loc] of savedPlaces) {
      if (
        getDistanceKm(report.location.lat, report.location.lng, loc.lat, loc.lng) <=
        2 // 2 km radius
      ) {
        // Check if notification already exists for this user and incident to avoid duplicates if needed
        
        // Create in-app notification document
        await Notification.create({
          userId: user._id,
          message: `New nearby incident: ${report.type} - ${report.description.slice(
            0,
            50
          )}...`,
          incidentId: report._id,
        });
        break; // notify user once per report
      }
    }
  }
}

module.exports = { notifyNearbyUsers };
