const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    category: String,
    description: String,
    title: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
