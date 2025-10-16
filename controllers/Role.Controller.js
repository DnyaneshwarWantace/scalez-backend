const User = require("../models/User.model");
const Role = require("../models/Role.model");

module.exports = {
  // create role
  createRole: async (req, res, next) => {
    try {
      const user = await User.findOne({ _id: req.payload.aud }).populate("owner").populate("role");

      if (user.role?.name.toLowerCase() !== "owner") {
        return res.status(401).json({
          message: "You are not authorized to create a role",
        });
      }

      const { name, permissions } = req.body;

      const role = await Role.create({
        name,
        permissions,
        owner: user._id,
      });

      res.status(201).json({
        message: "Role created successfully",
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  // read roles
  readRoles: async (req, res, next) => {
    try {

      const user = await User.findOne({ _id: req.payload.aud }).populate("owner").populate("role");
      var roles = [];
      roles = [
        //   {
        //     name : "admin",
        //     permissions :{
        //       company_access: true,
        //       create_workspace: true,
        //       create_actionPlans: true,
        //       share_ideas: true,
        //       add_teammates: true,
        //       // add_collaborators: true,
        //       create_project: true,
        //       delete_project: true,
        //       create_goals: true,
        //       create_ideas: true,
        //       create_tests: true,
        //       create_learnings: true,
        //       create_comments: true,
        //       mention_everyone: true,
        //      }
        //   },{
        //   name : "member",
        //   permissions :{
        //     create_actionPlans: true,
        //      create_goals: true,
        //      create_ideas: true,
        //      create_tests: true,
        //      create_learnings: true,
        //      create_comments: true,
        //      mention_everyone: true,
        //    }
        // },
        // {
        //   name : "viewer",
        //   permissions: {}
        // }
      ]
      if (user.role?.name.toLowerCase() !== "owner") {
        roles = await Role.find({ owner: user.owner });
      }
      else {
        roles = await Role.find({ owner: user._id });
      }

      res.status(200).json({
        message: "Roles List",
        roles,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },


  findRole: async (req, res, next) => {
    try {
      const user = await User.findOne({ _id: req.payload.aud }).populate("owner").populate("role");

      if (user.role?.name.toLowerCase() !== "owner") {
        return res.status(401).json({
          message: "You are not authorized to delete roles",
        });
      }

      const roleUser = await User.find({ role: req.params.id }).populate("owner").populate("role");
        return res.status(200).json({
          message: "Get users according to roles",
          roleUser
        });
 
    } catch (err) {
      console.log(err);
      next(err)
    }
  },

  // update role
  updateRole: async (req, res, next) => {
    try {
      const user = await User.findOne({ _id: req.payload.aud }).populate("owner").populate("role");

      if (user.role?.name.toLowerCase() !== "owner") {
        return res.status(401).json({
          message: "You are not authorized to update roles",
        });
      }

      const { name, permissions } = req.body;

      const role = await Role.findOneAndUpdate(
        { _id: req.params.id },
        {
          name,
          permissions,
        }
      );

      res.status(200).json({
        message: "Role updated successfully",
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  // delete role
  deleteRole: async (req, res, next) => {
    try {
      const user = await User.findOne({ _id: req.payload.aud }).populate("owner").populate("role");

      if (user.role?.name.toLowerCase() !== "owner") {
        return res.status(401).json({
          message: "You are not authorized to delete roles",
        });
      }

      const roleUser = await User.find({ role: req.params.id });
      // const role = await Role.find({ _id: req.params.id });
      if (roleUser.length === 0) {
        const role = await Role.findOneAndDelete({ _id: req.params.id });

        res.status(200).json({
          message: "Role deleted successfully",
        });
      } 

      
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};
