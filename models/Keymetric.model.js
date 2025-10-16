const mongoose = require("mongoose");

const keymetricSchema = new mongoose.Schema(
  {
    name: String,
    shortName: String,
    description: String,
    metricType: String,
    metricTime: String,
    type: String,
    mode: String,
    metrics: [
      {
        type: mongoose.Schema.Types.ObjectId, ref: "Goal" 
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Keymetric", keymetricSchema);
