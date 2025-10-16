const mongoose = require("mongoose");

const countSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    countTest: {
        type: Number,
        default: 0
    },
    countIdea: {
        type: Number,
        default: 0
    },
    countNominate: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model("Count", countSchema);