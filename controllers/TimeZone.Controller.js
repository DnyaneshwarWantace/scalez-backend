const User = require("../models/User.model");
const TimeZone = require("../models/TimeZone.model");
const createError = require("http-errors");
const { checkRole } = require("../helpers/role_helper");
module.exports = {
  //   read timezone
  read: async (req, res, next) => {
    try {
      // const role = await checkRole(req.payload.aud);
      // if (role.name.toLowerCase() !== "owner") {
      //   throw createError(401, "Unauthorized");
      // }
      // const timezone = await TimeZone.findOne({ owner: req.payload.aud });

      res.status(200).json({
        message: "Timezone retrieved successfully",
        // timezone: timezone,
      });
    } catch (err) {
      next(err);
    }
  },

  //   update timezone
  update: async (req, res, next) => {
    try {
      const role = await checkRole(req.payload.aud);
      if (role.name.toLowerCase() !== "owner") {
        throw createError(401, "Unauthorized");
      }
      const timezone = await TimeZone.findOne({ owner: req.payload.aud });
      timezone.name = req.body.name;
      await timezone.save();

      res.status(200).json({
        message: "Timezone updated successfully",
        timezone: timezone,
      });
    } catch (err) {
      next(err);
    }
  },
};
