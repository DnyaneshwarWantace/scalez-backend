const User = require("../models/User.model");
const Keymetric = require("../models/Keymetric.model");
const createError = require("http-errors");
const { checkRole, checkPermission } = require("../helpers/role_helper");
const Workspace = require("../models/Workspace.model");

module.exports = {
  // create keymetric
  create: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_workspace");
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");

      const keymetric = new Keymetric({
        name: req.body.name,
        shortName: req.body.shortName,
        description: req.body.description,
        metricType: req.body.metricType,
        metricTime: req.body.metricTime,
        type: req.body.type,
        createdBy: req.payload.aud,
        workspace: req.body.workspace,
        owner: user.role.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
      });

      await keymetric.save();

      res.status(201).json({
        message: "Keymetric created successfully",
        keymetric: {
          id: keymetric._id,
          name: keymetric.name,
          shortName: keymetric.shortName,
          description: keymetric.description,
          metricType: keymetric.metricType,
          metricTime: keymetric.metricTime,
          type: keymetric.type,
          createdBy: keymetric.createdBy,
          workspace: req.body.workspace,
          owner: keymetric.owner,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // get all keymetrics
  read: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");

      const keymetrics = await Keymetric.find({ owner: user.role.name.toLowerCase() === "owner" ? req.payload.aud : user.owner }).populate("createdBy", "-password");

      let data = [...keymetrics];

      res.status(200).json({
        message: "Keymetrics retrieved successfully",
        keymetrics: data,
      });
    } catch (err) {
      next(err);
    }
  },

  // delete keymetric
  delete: async (req, res, next) => {
    try {
      const role = await checkRole(req.payload.aud).populate("owner").populate("role");
      if (role.name.toLowerCase() !== "owner") {
        throw createError(401, "Unauthorized");
      }
      const keymetric = await Keymetric.findById(req.params.id);

      if (!keymetric) {
        throw createError(404, "Keymetric not found");
      }

      await keymetric.remove();

      res.status(200).json({
        message: "Keymetric deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },
};
