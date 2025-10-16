const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    priceType: {
      type: String,
      required: true,
    },
    refundRate: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    stickRate: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("product", ProductSchema);
