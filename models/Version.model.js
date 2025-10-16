const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const VersionSchema = new mongoose.Schema(
  {
    // Version fields
    versionName: {
      type: String,
      default: "Version 1",
    },

    // Scenario fields
    name: {
      type: String,
      default: "New Scenario",
    },
    nodes: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    edges: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    expenses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "expense",
      },
    ],
    products: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("Version", VersionSchema);
