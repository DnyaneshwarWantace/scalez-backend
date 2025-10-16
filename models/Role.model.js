const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    permissions: {
      company_access: {
        type: Boolean,
        default: false,
      },
      create_workspace: {
        type: Boolean,
        default: false,
      },
      create_actionPlans: {
        type: Boolean,
        default: false,
      },
      create_roles: {
        type: Boolean,
        default: false,
      },

      add_user: {
        type: Boolean,
        default: false,
      },
      remove_user: {
        type: Boolean,
        default: false,
      },
      create_models: {
        type: Boolean,
        default: false,
      },

      create_project: {
        type: Boolean,
        default: false,
      },
      delete_project: {
        type: Boolean,
        default: false,
      },
      create_goals: {
        type: Boolean,
        default: false,
      },
      create_ideas: {
        type: Boolean,
        default: false,
      },
      nominate_ideas: {
        type: Boolean,
        default: false,
      },
      create_tests: {
        type: Boolean,
        default: false,
      },
      create_learnings: {
        type: Boolean,
        default: false,
      },
      create_comments: {
        type: Boolean,
        default: false,
      },
      mention_everyone: {
        type: Boolean,
        default: false,
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Role", roleSchema);
