const mongoose = require("mongoose");

const superOwnerSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    avatar: "String",
    organization: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SuperOwner", superOwnerSchema);
