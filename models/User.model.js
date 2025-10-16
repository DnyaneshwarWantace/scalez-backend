const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    ideaCount:{
      type:Number,
      default:0
    },
    ideaNominate:{
      type:Number,
      default:0
    },
    ideaTest:{
      type:Number,
      default:0
    },
  
    resetPasswordToken: {
      type: String,
    },
    resetPasswordRequested: {
      type: Boolean,
      default: false,
    },
    resetPasswordRequestedOn: {
      type: Date,
    },
    resetPasswordTokenUsed: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
    role: {
      type: mongoose.Schema.Types.ObjectId,
      // type: String,
      // enum: ["owner", "admin", "member", "viewer"],
      ref: "Role",
      default: "owner"
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    about: String,
    ideaNominations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Idea",
      },
    ],
    avatar: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User",default:null },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    status: String,
    limit: Number,
    token: String,
    organization: String,
    joined: Date,
    type: {
      type: String,
      enum: ["user", "owner", "collaborator"],
      default: "user",
    },
    company: String,
    timezone:String,
    address: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    currency:String,
    domain:String,
    employees: String,
    phone: String,
    industry: String,
    fevicon:{
      type:String,
      default:null
    },
    logo:{
      type:String,
      default:null
    },

    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    levers: {type: mongoose.Schema.Types.ObjectId, ref: "Lever"},
    notificationSettings: {
      acceptInvitation: {
        type: Boolean,
        default: false,
      },
      invitation_2days: {
        type: Boolean,
        default: false,
      },
      team_activated: {
        type: Boolean,
        default: false,
      },
      workspace_created: {
        type: Boolean,
        default: false,
      },
      goal_created: {
        type: Boolean,
        default: false,
      },
      idea_created: {
        type: Boolean,
        default: false,
      },
      idea_updated: {
        type: Boolean,
        default: false,
      },
      idea_deleted: {
        type: Boolean,
        default: false,
      },
      idea_sent_to_test: {
        type: Boolean,
        default: false,
      },
      idea_nominated: {
        type: Boolean,
        default: false,
      },
      test_sent_to_idea: {
        type: Boolean,
        default: false,
      },
      test_ready: {
        type: Boolean,
        default: false,
      },
      test_sent_to_learning: {
        type: Boolean,
        default: false,
      },
      learning_created: {
        type: Boolean,
        default: false,
      },
      learning_sent_to_test: {
        type: Boolean,
        default: false,
      },
    },
    widgets: {
      activeGoals: {
        type: Boolean,
        default: false,
      },
      recentIdeas: {
        type: Boolean,
        default: false,
      },
      activeTests: {
        type: Boolean,
        default: false,
      },
      keyMetrics: {
        type: Boolean,
        default: false,
      },
      recentLearnings: {
        type: Boolean,
        default: false,
      },
      activity: {
        type: Boolean,
        default: false,
      },
    },
    quickstart: {
      create_goal: {
        type: Boolean,
        default: false,
      },
      create_idea: {
        type: Boolean,
        default: false,
      },
      create_test: {
        type: Boolean,
        default: false,
      },
      create_learning: {
        type: Boolean,
        default: false,
      },
      view_insights: {
        type: Boolean,
        default: false,
      },
    },
  },
  
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.password === "") {
    next();
  } else {
    if (this.isModified("password")) {
      this.password = bcrypt.hash(this.password, 10);
      next();
    }
  }
});

module.exports = mongoose.model("User", userSchema);
