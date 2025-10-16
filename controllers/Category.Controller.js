const Category = require("../models/Category.model");
const Plan = require("../models/Plan.model");
const Content = require("../models/Content.model");
const { checkRole, checkPermission } = require("../helpers/role_helper");
const createError = require("http-errors");
module.exports = {
  // create category
  create: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_actionPlans");

      const { name, plan } = req.body;

      // find plan
      const planFound = await Plan.findById(plan);
      if (!planFound) throw createError(404, "Plan not found");

      const category = new Category({
        name,
        plan,
      });

      await category.save();

      //update plan
      await Plan.findByIdAndUpdate(plan, {
        $push: { category: category._id },
      });

      return res.status(200).json({
        message: "Category created successfully",
        category,
      });
    } catch (error) {
      next(error);
    }
  },

  // update category
  update: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_actionPlans");

      const { id } = req.params;
      const { name, isOpened } = req.body;

      let data = { name };

      if (isOpened !== null && isOpened !== undefined) {
        data = {
          name,
          isOpened,
        };
      }

      const category = await Category.findByIdAndUpdate(id, data, {
        new: true,
      });

      return res.status(200).json({
        message: "Category updated successfully",
        category,
      });
    } catch (error) {
      next(error);
    }
  },

  // delete category
  delete: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_actionPlans");

      const { id } = req.params;

      const category = await Category.findById(id);

      // delete contents
      await Content.deleteMany({ category: id });

      // delete category from plan
      await Plan.findByIdAndUpdate(category.plan, {
        $pull: { category: id },
      });

      await category.remove();

      return res.status(200).json({
        message: "Category deleted successfully",
        category,
      });
    } catch (error) {
      next(error);
    }
  },

  // mark category
  markChecked: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { checked } = req.body;

      const category = await Category.findByIdAndUpdate(id, {
        checked,
      });

      return res.status(200).json({
        message: "Category updated successfully",
        category,
      });
    } catch (error) {
      next(error);
    }
  },
};
