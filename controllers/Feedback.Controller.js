const Feedback = require("../models/Feedback.model");
const SuperOwner = require("../models/SuperOwner.model");
const createError = require("http-errors");

module.exports = {
  // create feedback
  create: async (req, res, next) => {
    try {
      const feedback = new Feedback({
        category: req.body.category,
        description: req.body.description,
        title: req.body.title,
        user: req.payload.aud,
      });

      const result = await feedback.save();

      res.status(200).json({
        message:
          "Feedback submitted, Our team will get in touch with you via email",
      });
    } catch (err) {
      next(err);
    }
  },

  // get all feedbacks
  getAll: async (req, res, next) => {
    try {
      const superOwner = await SuperOwner.findById(req.payload.aud);
      if (!superOwner) {
        throw createError(401, "Invalid token");
      }

      const feedbacks = await Feedback.find()
        .populate("user", "firstName lastName email")
        .populate("user.owner");

      res.status(200).json(feedbacks);
    } catch (err) {
      next(err);
    }
  },

  // resolve feedback
  resolve: async (req, res, next) => {
    try {
      const superOwner = await SuperOwner.findById(req.payload.aud);
      if (!superOwner) {
        throw createError(401, "Invalid token");
      }

      const feedback = await Feedback.findById(req.params.id);
      if (!feedback) {
        throw createError(404, "Feedback not found");
      }

      feedback.status = "resolved";
      const result = await feedback.save();

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};
