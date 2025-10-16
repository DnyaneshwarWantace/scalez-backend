const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ExpenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    billingFrequency: {
      type: Number,
      required: true,
    },
    expenseName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("expense", ExpenseSchema);
