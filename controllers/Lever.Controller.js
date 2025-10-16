const Lever = require("../models/Lever.model");
const { checkRole, checkPermission } = require("../helpers/role_helper");
const User = require("../models/User.model");
module.exports = {
  // create lever
  create: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_workspace");
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");

      const lever = new Lever({
        name: req.body.name,
        color: req.body.color,
        createdBy: req.payload.aud,
        workspace: req.body.workspace,
        owner: user.role.name.toLowerCase() === "owner" ? req.payload.aud : user.owner, 
      });

      const result = await lever.save();

      console.log("result", result);
      res.status(200).json({
        message: "Lever created successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  //   read all levers
  readAll: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
       const levers = await Lever.find({owner:  user.role.name.toLowerCase() === "owner" ? req.payload.aud : user.owner}).populate("createdBy", "-password");
     
      //  let leversData = [{
      //   name: "Acquisition",
      //   color: "Blue",
      //   type: "default"
      // },
      // {
      //   name: "Activation",
      //   color: "Orange",
      //   type: "default"
      // },
      // {
      //   name: "Referral",
      //   color: "Green",
      //   type: "default"
      // },
      // {
      //   name: "Retention",
      //   color: "Red",
      //   type: "default"
      // },
      // {
      //   name: "Revenue",
      //   color: "Yellow",
      //   type: "default"
      // }
      
      // ]

      let leversData = [
        {
          name: "Acquisition",
          color: "Blue",
          type: "default",
        },
        {
          name: "Activation",
          color: "Orange",
          type: "default",
        },
        {
          name: "Referral",
          color: "Green",
          type: "default",
        },
        {
          name: "Retention",
          color: "Red",
          type: "default",
        },
        {
          name: "Revenue",
          color: "Yellow",
          type: "default",
        },
      ];

      let data = [...leversData, ...levers];

      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  },

  //   update lever
  update: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_workspace");
      const user = await User.findById(req.payload.aud);

      const lever = await Lever.findById(req.params.id);

      await lever.updateOne({
        name: req.body.name,
        color: req.body.color,
        createdBy: req.payload.aud,
        workspace: req.body.workspace,
      });

      res.status(200).json({
        message: "Lever updated successfully",
      });
    } catch (err) {
      next(err);
    }
  },

  //   delete lever
  delete: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_workspace");
      const user = await User.findById(req.payload.aud);

      const lever = await Lever.findById(req.params.id);

      await lever.deleteOne();

      res.status(200).json({
        message: "Lever deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },
};
