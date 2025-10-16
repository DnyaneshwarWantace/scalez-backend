const User = require("../models/User.model");
const superOwner = require("../models/SuperOwner.model");
const createError = require("http-errors");
const Role = require("../models/Role.model");
const _ = require("lodash");

module.exports = {
  // check user role
  checkRole: async (id) => {
    const user = await User.findById(id).populate("role");
    if (!user) {
      throw createError(401, "Invalid user");
    }
    return user.role;
  },

  // check user permission
  checkPermission: async (id, permission) => {
    const user = await User.findById(id);
    const SuperOwner = await superOwner.findById(id);
    if (!user && !SuperOwner) {
      throw createError(401, "Invalid user");
    }
    // const role = await Role.findById(user.role);
    // if (!role) {
    //   throw createError(401, "Invalid role");
    // }

    // const permissions = role.permissions;

    // // check if keyvalue pair is true or false in permissions object
    // const hasPermission = _.find(permissions, (value, key) => {
    //   return key === permission && value === true;
    // });

    // if (!hasPermission) {
    //   throw createError(403, "You are not authorized to perform this action");
    // }
  },

  getUsersFromTags: (text) => {
    let displayText = _.clone(text);
    const tags = text.match(/@\{\{[^\}]+\}\}/gi) || [];
    const allUserIds = tags.map((myTag) => {
      const tagData = myTag.slice(3, -2);
      const tagDataArray = tagData.split("||");
      return { _id: tagDataArray[1], name: tagDataArray[2] };
    });
    return _.uniqBy(allUserIds, (myUser) => myUser._id);
  },
};
