const mongoose = require("mongoose");

const LeverSchema = new mongoose.Schema(
  {
  
    name: String,
    color: String,
    type: String,   
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lever", LeverSchema);
