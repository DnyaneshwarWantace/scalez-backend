const SuperOwner = require("../models/SuperOwner.model");
const createError = require("http-errors");
const { signAccessToken } = require("../helpers/jwt_helper");
const bcrypt = require("bcryptjs");
// const formData = require("form-data");
// const Mailgun = require("mailgun.js");
// const mailgun = new Mailgun(formData);
const User = require("../models/User.model");
const Role = require("../models/Role.model");
// const mg = mailgun.client({
//   username: "api",
//   key: process.env.MAILGUN_API_KEY,
//   url: "https://api.eu.mailgun.net",
// });
module.exports = {
  // create
  create: async (req, res, next) => {
    try {
      const superOwner = new SuperOwner({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        avatar: "",
      });

      await superOwner.save();

      res.status(201).json({
        message: "SuperOwner created successfully",
        superOwner: {
          id: superOwner._id,
          firstName: superOwner.firstName,
          lastName: superOwner.lastName,
          email: superOwner.email,
          password: superOwner.password,
          avatar: superOwner.avatar,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  //   login
  login: async (req, res, next) => {
    try {
      const superOwner = await SuperOwner.findOne({ email: req.body.email });
      if (!superOwner) {
        throw createError(401, "Invalid email or password");
      }
      const isMatch = bcrypt.compare(req.body.password, superOwner.password);
      if (!isMatch) {
        throw createError(401, "Invalid email or password");
      }
      const token = await signAccessToken(superOwner.id);
      res.status(200).json({
        message: "Logged in successfully",
        token: token,
        superOwner: {
          id: superOwner._id,
          firstName: superOwner.firstName,
          lastName: superOwner.lastName,
          email: superOwner.email,
          password: superOwner.password,
          avatar: superOwner.avatar,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  //  create customer
  createCustomer: async (req, res, next) => {
    try {
      const superOwner = await SuperOwner.findById(req.payload.aud);
      if (!superOwner) {
        throw createError(401, "Invalid token");
      }
      // if email is already registered
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        throw createError(409, "Email already registered");
      }

      // generate a 10 character random string
      const randomString = Math.random().toString(36).slice(-10);

      // create owner role
      const role = await Role.create({
        name: "Owner",
        // owner:
        permissions: {
          company_access: true,
          create_workspace: true,
          create_actionPlans: true,
          create_roles: true,
          // share_ideas: true,
          add_user: true,
          remove_user: true,
          create_models: true,
          // add_collaborators: true,
          create_project: true,
          delete_project: true,
          create_goals: true,
          create_ideas: true,
          nominate_ideas: true,
          create_tests: true,
          create_learnings: true,
          create_comments: true,
          mention_everyone: true,
        },
      });


      const roleAdmin = await Role.create({
        name:"Admin",
        permissions:{
          company_access: true,
          create_workspace: true,
          create_actionPlans: true,
          create_roles: true,
          // share_ideas: true,
          add_user: true,
          remove_user: true,
          create_models: true,
          // add_collaborators: true,
          create_project: true,
          delete_project: true,
          create_goals: true,
          create_ideas: true,
          nominate_ideas: true,
          create_tests: true,
          create_learnings: true,
          create_comments: true,
          mention_everyone: true,
        },
        // owner: user._id,
      });

      const roleMember = await Role.create({
        name:"Member",
        permissions:{
          create_actionPlans: true,
          create_goals: true,
          create_ideas: true,
          nominate_ideas: true,
          create_tests: true,
          create_learnings: true,
          create_comments: true,
          mention_everyone: true,
        },
        // owner: user._id,
      });
      const roleViewer = await Role.create({
        name:"Viewer",
        permissions:{
          company_access: false,
          create_workspace: false,
          create_actionPlans: false,
          create_roles: false,
          // share_ideas: false,
          add_user: false,
        remove_user: false,
        create_models: false,
          // add_collaborators: false,
          create_project: false,
          delete_project: false,
          create_goals: false,
          create_ideas: false,
          nominate_ideas: false,
          create_tests: false,
          create_learnings: false,
          create_comments: false,
          mention_everyone: false,
        },
        // owner: user._id,
      });

      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: "",
        role: role,
        designation: "",
        avatar: "uploads/default.png",
        owner: null,
        status: "invited",
        limit: req.body.limit,
        type: "owner",
        token: randomString,
        organization: req.body.organization,
      });
      const result = await newUser.save();

      await Role.updateMany(
        {
          _id:{$in:[role._id,roleAdmin._id,roleMember._id,roleViewer._id]}
        },
        {
          $set: {
            owner: result._id,
          },
        }
      );

      // const mailOptions = {
      //   from: "noreply<admin@app.scalezmedia.com>",
      //   to: newUser.email,
      //   subject: "Invitation to join Scalez.in",
      //   text: `Hello ${newUser.firstName},
      //   You have been invited to join Scalez panel.
      //   Please click on the following link to join:
      //   https://app.scalez.in/complete-profile/${newUser.token}`,
      // };

      //  await create("app.scalezmedia.com").then((result) => {
       console.log(result, result);
       res.status(201).json({
          message: "User invited successfully",
          user: {
            id: result._id,
            firstName: result.firstName,
            lastName: result.lastName,
            email: result.email,
            role: result.role,
            designation: result.designation,
            avatar: result.avatar,
            owner: result.owner,
            status: result.status,
            limit: result.limit,
            token: result.token,
          },
        });
      //  })
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // read customers
  readCustomers: async (req, res, next) => {
    try {
      const superOwner = await SuperOwner.findById(req.payload.aud);
      if (!superOwner) {
        throw createError(401, "Invalid token");
      }

      let roles = await Role.find({name:"Owner"})

      const users = await User.find({ roles:{$in:roles}});
      const clients = await User.find();

      for (let i = 0; i < users.length; i++) {
        const client = clients.filter((client) => client.owner === users[i]._id);
        users[i].clients = client.length;
      }

      // for (let i = 0; i < users.length; i++) {
      //   const clients = await User.find({ owner: users[i]._id });
      //   console.log(clients);
      //   users[i].clients = clients.count;
      // }

      res.status(200).json({
        message: "Customers retrieved successfully",
        users: users.map((user) => {
          return {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            designation: user.designation,
            avatar: user.avatar,
            status: user.status,
            limit: user.limit,
            token: user.token,
            joined: user.joined || null,
            clients: user.clients,
            organization: user.organization
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  },

  // disable customer
  disableCustomer: async (req, res, next) => {
    try {
      const superOwner = await SuperOwner.findById(req.payload.aud);
      if (!superOwner) {
        throw createError(401, "Invalid token");
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        throw createError(404, "User not found");
      }
      if (user.status !== "enabled") {
        throw createError(409, "User is already disabled");
      }

      await User.findByIdAndUpdate(req.params.id, {
        status: "disabled",
      });

      res.status(200).json({
        message: "User disabled successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
          avatar: user.avatar,
          owner: user.owner,
          status: "disabled",
          limit: user.limit,
          token: user.token,
          joined: user.joined || null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // enable customer
  enableCustomer: async (req, res, next) => {
    try {
      const superOwner = await SuperOwner.findById(req.payload.aud);
      if (!superOwner) {
        throw createError(401, "Invalid token");
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        throw createError(404, "User not found");
      }
      if (user.status !== "disabled") {
        throw createError(409, "User is already enabled");
      }

      await User.findByIdAndUpdate(req.params.id, {
        status: "enabled",
      });

      res.status(200).json({
        message: "User enabled successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
          avatar: user.avatar,
          owner: user.owner,
          status: "enabled",
          limit: user.limit,
          token: user.token,
          joined: user.joined || null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // edit customer
  editCustomer: async (req, res, next) => {
    try {
      const superOwner = await SuperOwner.findById(req.payload.aud);
      if (!superOwner) {
        throw createError(401, "Invalid token");
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        throw createError(404, "User not found");
      }
      if (user.status !== "enabled") {
        throw createError(409, "User is disabled");
      }

      if (user.email !== req.body.email) {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
          throw createError(409, "Email already registered");
        }
      }

      await User.updateOne(
        { _id: req.params.id },
        {
          $set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            limit: req.body.limit,
            organization: req.body.organization,
          },
        }
      );

      res.status(200).json({
        message: "User updated successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
          avatar: user.avatar,
          owner: user.owner,
          status: user.status,
          limit: user.limit,
          token: user.token,
          joined: user.joined || null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getAllResetPasswordRequests: async (req, res) => {
    try {
      return res.status(200).json({
        message: "Reset password request discarded successfully",
        data: await User.find({ resetPasswordRequested: true }).sort({ resetPasswordRequestedOn: -1 }).populate("organization"),
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Reset password request sent successfully",
        data: { error: e.message },
      });
    }
  },

  discardResetPasswordRequest: async (req, res) => {
    try {
      const { userId } = req.query;
      const targetUser = await User.findById(userId);
      targetUser.resetPasswordRequested = false;
      await targetUser.save();

      return res.status(200).json({
        message: "Reset password request discarded successfully",
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Reset password request sent successfully",
        data: { error: e.message },
      });
    }
  },
};
