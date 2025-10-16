const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      default: "Not Defined",
    },
    ideaCount: {
      type: Number,
      default: 0
    },
    ideaSuccessful: {
      type: Number,
      default: 0
    },
    ideaUnsuccessful: {
      type: Number,
      default: 0
    },
    ideaInconclusive: {
      type: Number,
      default: 0
    },
    ideaTest: {
      type: Number,
      default: 0
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isArchived: {
      type: Boolean,
      default: false,
    },
    dataType: String
  },
  {
    timestamps: true,
  },
  
);

module.exports = mongoose.model("Project", projectSchema);
