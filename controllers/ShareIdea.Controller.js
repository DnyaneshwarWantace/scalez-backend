const Idea = require("../models/Idea.model");
const createError = require("http-errors");

module.exports = {
  // read idea public
  readIdeaPublic: async (req, res, next) => {
    try {
      const idea = await Idea.findOne({ _id: req.params.id }).populate(
        "createdBy",
        "-password"
      );
      if (!idea) {
        throw createError(404, "Idea not found");
      }

      res.json({
        message: "Idea found",
        idea: idea,
      });
    } catch (error) {
      next(error);
    }
  },

  //   read private idea
  readIdeaPrivate: async (req, res, next) => {
    try {
      const idea = await Idea.findOne({ _id: req.params.id }).populate(
        "createdBy",
        "-password"
      );
      if (!idea) {
        throw createError(404, "Idea not found");
      }

      res.json({
        message: "Idea found",
        idea: idea,
      });
    } catch (error) {
      next(error);
    }
  },
};
