const mongoose = require("mongoose");

const timezoneSchema = new mongoose.Schema({
  name: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("TimeZone", timezoneSchema);
