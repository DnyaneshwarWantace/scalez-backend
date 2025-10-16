const User = require("../models/User.model");
const createError = require("http-errors");
const Notification = require("../models/Notification.model");

module.exports = {
  // read notifications for a user
  readNotifications: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud);
      if (!user) {
        return next(createError(404, "User not found"));
      }

      const notifications = await Notification.find({
        audience: [req.payload.aud],
        readAudience: { $ne: req.payload.aud },
      }).sort({ createdAt: -1 });

      return res.status(200).json(notifications);
    } catch (err) {
      next(err);
    }
  },

  // check notification as read
  markNotification: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud);
      if (!user) {
        return next(createError(404, "User not found"));
      }

      const notification = await Notification.findById(req.params.id);

      if (!notification) {
        return next(createError(404, "Notification not found"));
      }

      // check if notification is for user
      if (notification.audience.indexOf(req.payload.aud) === -1) {
        return next(createError(403, "Forbidden"));
      }

      // check if notification is already read
      if (notification.readAudience.indexOf(req.payload.aud) !== -1) {
        return next(createError(403, "Forbidden"));
      }

      notification.readAudience.push(req.payload.aud);
      await notification.save();

      return res.status(200).json(notification);
    } catch (err) {
      next(err);
    }
  },
};
