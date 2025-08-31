const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {

    type: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      required: true,
    },

    validity: {
      type: Number,
      min: 1,
      required: true,
    },

    expiresAt: {
      type: Date,
      index: { expires: 0 },
      default: function () {
        return new Date(Date.now() + this.validity * 60 * 1000);
      },
    },

    reportedBy: {
      type: String,
      required: true,
    },

    reportedByUID: {
      type: String,
      required: true,
    },

    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    photoUrl: {
      type: String,
    },

    description: {
      type: String,
      required: true,
    },


    votes: {
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    },
    votedUsers: [{ userId: String }] //track users who voted to prevent multiple votes


  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
