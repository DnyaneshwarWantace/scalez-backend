const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    name: String,
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    status: String,
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    keymetric: {},
    lever: String,
    description: String,
    media: [],
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tasks: [
      {
        name: String,
        status: Boolean,
      },
    ],
    nominations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }],
    impact: Number,
    confidence: Number,
    ease: Number,
    score: Number,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dueDate: Date,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Test", testSchema);
