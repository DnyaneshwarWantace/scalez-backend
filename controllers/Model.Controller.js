const Model = require("../models/Model.model");

module.exports = {
  // create
  create: async (req, res, next) => {
    try {
      const userId = req.payload.aud;

      const { name, values } = req.body;

      const model = new Model({
        name,
        creator: userId,
        data: values,
      });

      await model.save();

      res.status(201).json({
        message: "Model created successfully",
        model,
      });
    } catch (error) {
      next(error);
    }
  },

  // read
  read: async (req, res, next) => {
    try {
      const userId = req.payload.aud;
      const models = await Model.find({ creator: userId }).populate(
        "creator",
        "-password"
      );
      res.status(200).json({
        message: "Models fetched successfully",
        models,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  // read single model
  readSingle: async (req, res, next) => {
    try {
      const userId = req.payload.aud;
      const { id } = req.params;
      const model = await Model.findOne({
        _id: id,
        creator: userId,
      }).populate("creator", "-password");
      res.status(200).json({
        message: "Model fetched successfully",
        model,
      });
    } catch (error) {
      next(error);
    }
  },

  // update model
  update: async (req, res, next) => {
    try {
      const userId = req.payload.aud;
      const { id } = req.params;
      const { name, values } = req.body;
      const model = await Model.findOneAndUpdate(
        { _id: id, creator: userId },
        { name, data: values },
        { new: true }
      ).populate("creator", "name");
      res.status(200).json({
        message: "Model updated successfully",
        model,
      });
    } catch (error) {
      next(error);
    }
  },

  // delete model
  delete: async (req, res, next) => {
    try {
      const userId = req.payload.aud;
      const { id } = req.params;
      const model = await Model.findOneAndDelete({
        _id: id,
        creator: userId,
      }).populate("creator", "name");
      res.status(200).json({
        message: "Model deleted successfully",
        model,
      });
    } catch (error) {
      next(error);
    }
  },
};
