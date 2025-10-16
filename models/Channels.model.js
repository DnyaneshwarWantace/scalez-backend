const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
      },
      description:  String,
      threads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Threads",
      }],
      owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Channels", channelSchema);
