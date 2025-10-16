const User = require("../models/User.model");
const Test = require("../models/Test.model");
const Goal = require("../models/Goal.model");
const Learning = require("../models/Learning.model");
const Idea = require("../models/Idea.model");

module.exports = {
  // read all tasks assigned to user
  readAll: async (req, res, next) => {
    try {
      const userId = req.payload.aud;
      const tests = await Test.find({
        assignedTo: { $in: [userId] },
      }).populate("project");

      var tasks = [];
      for (var i = 0; i < tests.length; i++) {
        tasks = tasks.concat(tests[i].tasks);
      }

      const tasksAssigned = tasks.filter((task) => {
        return task.status === false;
      });

      const tasksCompleted = tasks.filter((task) => {
        return task.status === true;
      });

      res.status(200).json({
        message: "Tests fetched successfully",
        tasksAssigned,
        tasksCompleted,
      });
    } catch (err) {
      next(err);
    }
  },

  // read all goals assigned to user
  readKeymetrics: async (req, res, next) => {
    try {
      const userId = req.payload.aud;
      const goals = await Goal.find({
        members: { $in: [userId] },
      });

      keymetrics = [];
      for (var i = 0; i < goals.length; i++) {
        keymetrics = keymetrics.concat(goals[i].keymetric);
      }

      res.status(200).json({
        Checkins: keymetrics,
      });
    } catch (err) {
      next(err);
    }
  },

  // read all goals
  readGoals: async (req, res, next) => {
    try {
      // const userId = req.payload.aud;
      // const goals = await Goal.find({
      //   members: { $in: [userId] },
      // })
      //   .populate("project")
      //   .populate("members");
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      const goals = await Goal.find({
        owner: user.role?.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
      })
        .populate("project")
        .populate("members");

      const filteredGoals = goals.filter((goal) => {
        return goal.project?.isArchived === false;
      });

      res.status(200).json({
        goals: filteredGoals,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  // read all tests assigned to user
  readAllTests: async (req, res, next) => {
    try {
      // const userId = req.payload.aud;
      // const tests = await Test.find({
      //   assignedTo: { $in: [userId] },
      // }).populate("project");

      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      const tests = await Test.find({
        owner: user.role?.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
      })
        .populate("project")
        .populate("assignedTo");

      const filteredTests = tests.filter((test) => {
        return test.project?.isArchived === false;
      });

      res.status(200).json({
        message: "Tests fetched successfully",
        tests: filteredTests,
      });
    } catch (err) {
      next(err);
    }
  },

  // read ideas
  readAllIdeas: async (req, res, next) => {
    try {
      // const userId = req.payload.aud;
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");

      const ideas = await Idea.find({
        owner: user.role?.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
      })
        .populate("project")
        .populate("createdBy");

      const filteredIdeas = ideas.filter((idea) => {
        return idea.project?.isArchived === false;
      });

      res.status(200).json({
        message: "Ideas fetched successfully",
        ideas: filteredIdeas,
      });
    } catch (err) {
      next(err);
    }
  },

  // read all learnings assigned to user
  readAllLearnings: async (req, res, next) => {
    try {
      // const userId = req.payload.aud;
      // const learnings = await Learning.find({
      //   assignedTo: { $in: [userId] },
      // }).populate("project");

      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      const learnings = await Learning.find({
        owner: user.role?.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
      }).populate("project");

      const filteredLearnings = learnings.filter((learning) => {
        return learning.project?.isArchived === false;
      });

      res.status(200).json({
        message: "Learnings fetched successfully",
        learnings: filteredLearnings,
      });
    } catch (err) {
      next(err);
    }
  },

  // enable or disable widgets
  updateWidgets: async (req, res, next) => {
    try {
      const userId = req.payload.aud;

      await User.updateOne(
        { _id: userId },
        {
          $set: {
            widgets: req.body.widgets,
          },
        }
      );

      const user = await User.findById(userId).select("-password").populate("role");

      res.status(200).json({
        message: "Widgets updated successfully",
        user,
      });
    } catch (err) {
      next(err);
    }
  },
};
