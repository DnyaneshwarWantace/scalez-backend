const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const FunnelProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    processingRatePercent: {
      type: Number,
      default: 2.9,
    },
    perTransactionFee: {
      type: Number,
      default: 0.3,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scenario: [
      {
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
        versions: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Version",
          },
        ],
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
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("FunnelProject", FunnelProjectSchema);
