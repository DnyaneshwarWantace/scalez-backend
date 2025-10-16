const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    startDate: Date,
    endDate: Date,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    keymetric: [
      {
        name: String,
        startValue: Number,
        targetValue: Number,
        metrics: [
          {
            date: Date,
            value: Number,
            updatedAt: Date,
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          },
        ],
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          default: "On-Track",
        },
      },
    ],
    comments: [
      {
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    confidence: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    goalsAccess: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Goal", goalSchema);
