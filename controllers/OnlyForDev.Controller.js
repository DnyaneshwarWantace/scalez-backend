const Project = require("../models/Project.model");
const Goal = require("../models/Goal.model");
const Learning = require("../models/Learning.model");
const User = require("../models/User.model");
const Role = require("../models/Role.model");
const Test = require("../models/Test.model");
const Idea = require("../models/Idea.model");
const Keymetric = require("../models/Keymetric.model");
const Lever = require("../models/Lever.model");

const SuperOwner = require("../models/SuperOwner.model");
const createError = require("http-errors");
const moment = require("moment");

module.exports = {
  // Fix Keymetric
  fixKeymetrics: async (req, res, next) => {
    const { keyMetricName, metricType, metricTime, description } = req.body;

    const allOwnerRoles = await Role.find({ $toLower: { name: "owner" } });
    console.log(allOwnerRoles);

    const allOwners = await User.find({ role: { $in: allOwnerRoles } });
    console.log(allOwners);

    await Promise.all(
      allOwners.map(async (owner) => {
        const targetKeymetrics = await Keymetric.find({ owner }).lean();
        if (targetKeymetrics.filter((k) => k.name == keyMetricName).length == 0) {
          const keymetric = new Keymetric({
            name: keyMetricName,
            shortName: keyMetricName,
            description: description,
            metricType: metricType,
            metricTime: metricTime,
            type: metricType,
            // createdBy: owner,
            owner: owner,
          });

          await keymetric.save();
        }
      })
    );

    return res.send({
      message: "Fixed Keymetrics",
    });
  },

  // Fix Growth Levers
  fixGrowthLevers: async (req, res, next) => {
    const { name, color } = req.body;

    const allOwnerRoles = await Role.find({ $toLower: { name: "owner" } });
    console.log(allOwnerRoles);

    const allOwners = await User.find({ role: { $in: allOwnerRoles } });
    console.log(allOwners);

    await Promise.all(
      allOwners.map(async (owner) => {
        const targetLevers = await Lever.find({ owner }).lean();
        if (targetLevers.filter((k) => k.name == name).length == 0) {
          const newLever = new Lever({
            name: name,
            color: color,
            owner: owner,
            // createdBy: owner,
          });

          await newLever.save();
        }
      })
    );

    return res.send({
      message: "Fixed Lever",
    });
  },

  // Fix Role
  fixRole: async (req, res, next) => {
    const { name, permissions } = req.body;

    const allOwnerRoles = await Role.find({ $toLower: { name: "owner" } });
    console.log(allOwnerRoles);

    const allOwners = await User.find({ role: { $in: allOwnerRoles } });
    console.log(allOwners);

    await Promise.all(
      allOwners.map(async (owner) => {
        const targetRoles = await Role.find({ owner }).lean();
        if (targetRoles.filter((k) => k.name == name).length == 0) {
          const newRole = new Role({
            name: name,
            permissions: permissions,
            owner: owner,
          });

          await newRole.save();
        }
      })
    );

    return res.send({
      message: "Fixed Role",
    });
  },
};
