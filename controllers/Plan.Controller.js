const Plan = require("../models/Plan.model");
const Content = require("../models/Content.model");
const Category = require("../models/Category.model");
const User = require("../models/User.model");
const { checkRole } = require("../helpers/role_helper");
const createError = require("http-errors");
const SuperOwner = require("../models/SuperOwner.model");

module.exports = {
  // create plan
  create: async (req, res, next) => {
    try {
      // const role = await checkRole(req.payload.aud);
      // if (role !== "owner") throw createError(401, "Unauthorized");

      const user = await User.findById(req.payload.aud)
        .populate("owner")
        .populate("role");

      const { name } = req.body;

      const plan = new Plan({
        name,
        owner:
          user.role.name.toLowerCase() === "owner"
            ? req.payload.aud
            : user.owner,
      });

      await plan.save();

      return res.status(200).json({
        message: "Plan created successfully",
        plan,
      });
    } catch (err) {
      return res.status(400).json({
        message: err.message,
      });
    }
  },

  // get all plans
  getAll: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud)
        .populate("owner")
        .populate("role");
      var plans = [];
      if (user.role?.name.toLowerCase() === "owner") {
        plans = await Plan.find({
          owner: req.payload.aud,
        })
          .populate({
            path: "category",
            populate: {
              path: "content",
            },
          })

          // .sort((a, b) =>
          // a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
          // )

          .populate("users", "-password");

        // var data2 = [...plans].sort((a, b) =>
        // a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
        // );

        // data2.map((d) => d.name);
      } else {
        plans = await Plan.find({
          owner: user.owner,
        }).populate({
          path: "category",
          populate: {
            path: "content",
          },
        });
      }

      return res.status(200).json({
        message: "Plans fetched successfully",
        plans,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  // update plan by id
  update: async (req, res, next) => {
    try {
      // const role = await checkRole(req.payload.aud);
      // if (role !== "owner") throw createError(401, "Unauthorized");

      const { id } = req.params;
      const { name, isOpened } = req.body;

      let data = { name };

      if (isOpened !== null && isOpened !== undefined) {
        data = {
          name,
          isOpened,
        };
      }

      const plan = await Plan.findByIdAndUpdate(id, data);

      return res.status(200).json({
        message: "Plan updated successfully",
        plan,
      });
    } catch (error) {
      next(error);
    }
  },

  // delete plan
  delete: async (req, res, next) => {
    try {
      // const role = await checkRole(req.payload.aud);
      // if (role !== "owner") throw createError(401, "Unauthorized");
      const { id } = req.params;

      const plan = await Plan.findById(id);
      if (!plan) throw createError(404, "Plan not found");

      // delete categories and contents
      await Category.deleteMany({ _id: { $in: plan.category } });
      await Content.deleteMany({ _id: { $in: plan.content } });

      await plan.remove();

      return res.status(200).json({
        message: "Plan deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // add user to plan
  addUsers: async (req, res, next) => {
    try {
      const role = await checkRole(req.payload.aud);
      // if (role !== "owner") throw createError(401, "Unauthorized");

      const { id } = req.params;
      const { users } = req.body;

      const plan = await Plan.findById(id);
      if (!plan) throw createError(404, "Plan not found");

      // check if users exist in plan already
      const usersInPlan = plan.users;
      const usersToAdd = users.filter((user) => !usersInPlan.includes(user));

      // add users to plan
      plan.users = [...usersInPlan, ...usersToAdd];
      await plan.save();

      return res.status(200).json({
        message: "Users added successfully",
        plan,
      });
    } catch (error) {
      next(error);
    }
  },

  // read users of a plan
  readUsers: async (req, res, next) => {
    try {
      const role = await checkRole(req.payload.aud);
      if (role.name.toLowerCase() !== "owner")
        throw createError(401, "You are not authorized");

      const { id } = req.params;

      const plan = await Plan.findById(id).populate("users", "-password");
      const users = plan.users;

      return res.status(200).json({
        message: "Users fetched successfully",
        users,
      });
    } catch (error) {
      next(error);
    }
  },

  // delete user from plan
  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { user } = req.body;

      const plan = await Plan.findById(id);

      // check if user exists in plan
      if (!plan.users.includes(user)) {
        return res.status(400).json({
          message: "User does not exist in plan",
        });
      }

      // remove user from plan
      plan.users.pull(user);
      await plan.save();

      return res.status(200).json({
        message: "User deleted from plan successfully",
        plan,
      });
    } catch (error) {
      next(error);
    }
  },

  // create admin plan
  createAdminPlan: async (req, res, next) => {
    try {
      const superOwner = await SuperOwner.findOne({ _id: req.payload.aud });
      if (!superOwner) throw createError(401, "Unauthorized");

      const { name } = req.body;

      const plan = new Plan({
        name,
        owner: req.payload.aud,
        type: "external",
      });

      await plan.save();

      return res.status(200).json({
        message: "Plan created successfully",
        plan,
      });
    } catch (err) {
      next(err);
    }
  },

  // read external plans
  readExternalPlans: async (req, res, next) => {
    try {
      const plans = await Plan.find({
        type: "external",
      }).populate({
        path: "category",
        populate: {
          path: "content",
        },
      });

      return res.status(200).json({
        message: "Plans fetched successfully",
        plans,
      });
    } catch (error) {
      next(error);
    }
  },

  // mark
  markChecked: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { checked } = req.body;

      const plan = await Plan.findByIdAndUpdate(id, {
        checked,
      });

      return res.status(200).json({
        message: "Plan updated successfully",
        plan,
      });
    } catch (error) {
      next(error);
    }
  },
};
