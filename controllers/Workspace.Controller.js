const Workspace = require("../models/Workspace.model");
const User = require("../models/User.model");
const createError = require("http-errors");

module.exports = {
  // create a new workspace
  create: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");

      if (user.role?.name.toLowerCase() !== "owner") {
        throw createError(403, "You are not authorized to create a workspace");
      }

      const foundWorkspace = await Workspace.findOne({
        $or: [{ name: req.body.name }, { owner: req.payload.aud }],
      }).populate("owner").populate("role");

      if (foundWorkspace) {
        throw createError(403, "You already have a workspace");
      }

      const workspace = new Workspace({
        name: req.body.name,
        owner: req.payload.aud,
      });
      await workspace.save();

      res.status(201).json({
        message: "Workspace created successfully",
        workspace: {
          id: workspace._id,
          name: workspace.name,
          owner: workspace.owner,
        },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // createSampleData: async (req, res, next) => {
  //   try {
  //     const user = await User.findById(req.payload.aud).populate("owner").populate("role");

  //     if (user.role?.name.toLowerCase() !== "owner") {
  //       throw createError(403, "You are not authorized to create sample data");
  //     }


  //     res.status(201).json({
  //       message: "Workspace created successfully",
  //       workspace: {
  //         id: workspace._id,
  //         name: workspace.name,
  //         owner: workspace.owner,
  //       },
  //     });
  //   } catch (err) {
  //     next(err);
  //     console.log(err);
  //   }
  // },
};
