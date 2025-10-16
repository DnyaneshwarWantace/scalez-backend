const Content = require("../models/Content.model");
const Plan = require("../models/Plan.model");
const Category = require("../models/Category.model");
const { checkRole, checkPermission } = require("../helpers/role_helper");
const createError = require("http-errors");

module.exports = {
  // create content
  create: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_actionPlans");

      const { name, plan, category } = req.body;

      const content = new Content({
        name,
        plan,
        category,
      });

      await content.save();

      //update plan
      await Plan.findByIdAndUpdate(plan, {
        $push: { content: content._id },
      });

      //update category
      await Category.findByIdAndUpdate(category, {
        $push: { content: content._id },
      });

      return res.status(200).json({
        message: "Content created successfully",
        content,
      });
    } catch (error) {
      next(error);
    }
  },

  //   read content
  read: async (req, res, next) => {
    try {
      const { id } = req.params;

      const content = await Content.findById(id);

      return res.status(200).json({
        message: "Content fetched successfully",
        content,
      });
    } catch (error) {
      next(error);
    }
  },

  //   update content
  update: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_actionPlans");

      const { id } = req.params;
      const { name, data, isOpened } = req.body;

      let reqData = { name, data };

      if (isOpened !== null && isOpened !== undefined) {
        reqData = {
          name,
          data,
          isOpened,
        };
      }

      const content = await Content.findByIdAndUpdate(id, reqData, {
        new: true,
      });

      return res.status(200).json({
        message: "Content updated successfully",
        content,
      });
    } catch (error) {
      next(error);
    }
  },

  //   delete content
  delete: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_actionPlans");

      const { id } = req.params;

      const content = await Content.findById(id);

      // delete content from plan
      await Plan.findByIdAndUpdate(content.plan, {
        $pull: { content: id },
      });

      // delete content from category
      await Category.findByIdAndUpdate(content.category, {
        $pull: { content: id },
      });

      await content.remove();

      return res.status(200).json({
        message: "Content deleted successfully",
        content,
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

      const content = await Content.findByIdAndUpdate(id, {
        checked,
      });

      return res.status(200).json({
        message: "Content updated successfully",
        content,
      });
    } catch (error) {
      next(error);
    }
  },
};
