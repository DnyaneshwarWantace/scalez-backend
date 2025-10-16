const User = require("../models/User.model");
const Goal = require("../models/Goal.model");
const Integration = require("../models/Integration.model");
const { google } = require("googleapis");

module.exports = {
  readAllIntegrations: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud);
      let allIntegrations = await Integration.find({ project: req.query.projectId }).populate("project goal keymetric createdBy").lean();

      const data = await Promise.all(
        allIntegrations.map(async (singleIntegration) => {
          singleIntegration["aaa"] = await singleIntegration.goal.keymetric.filter((k) => k._id == singleIntegration.keymetric)[0];
          return singleIntegration;
        })
      );

      return res.status(200).json({ allIntegrations: data });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  createIntegration: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud);
      const targetGoal = await Goal.findById(req.body.goalId).populate("keymetric");
      const targetKeyMetric = targetGoal.keymetric.filter((k) => k._id == req.body.keymetricId)[0];

      const newIntegration = Integration({
        project: req.body.projectId,
        goal: req.body.goalId,
        keymetric: targetKeyMetric,
        createdBy: user,
      });
      await newIntegration.save();

      return res.status(200).json({ newIntegration });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  deleteIntegration: async (req, res, next) => {
    try {
      const newIntegration = await Integration.findById(req.params.id);
      newIntegration.remove();

      return res.status(200).json();
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};
