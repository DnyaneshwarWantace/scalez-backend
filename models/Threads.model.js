const mongoose = require("mongoose");

const threadsSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
      },
      description:  String,
  comments: [
    {
      comment: String,
      replies: [{
        reply: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
      }],
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ], 
  
  likedBy : [{ user: {type: mongoose.Schema.Types.ObjectId, ref: "User" }, timestamps : Date}],
  readBy: [{ user: {type: mongoose.Schema.Types.ObjectId, ref: "User" }, timestamps : Date}],
  count: {type: Number, default: 0},
  liked: {type: Boolean, default: false},
  createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },

},

{
  timestamps: true,
}
);

module.exports = mongoose.model("Threads", threadsSchema);
