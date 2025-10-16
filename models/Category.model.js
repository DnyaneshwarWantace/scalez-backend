const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: String,
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    content: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
      },
    ],
    checked: {
      type: Boolean,
      default: false,
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
