const User = require("../models/User.model");
const createError = require("http-errors");
const { checkRole, checkPermission } = require("../helpers/role_helper");
const Project = require("../models/Project.model");
// const formData = require("form-data");
// const Mailgun = require("mailgun.js");
// const mailgun = new Mailgun(formData);
// const mg = mailgun.client({
//   username: "api",
//   key: process.env.MAILGUN_API_KEY,
//   url: "https://api.eu.mailgun.net",
// });

module.exports = {
  // Get all users
  getAllUsers: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role").populate("invitedBy", "-password");


      if(!User){
        window.location.pathname = '/';
      }
      if (user.role?.name.toLowerCase() === "owner") {
        // const users = await User.find({
        //   owner: req.payload.aud
        //   // type: "user",
        // })
        let users = await User.find({
          owner: {
            $in: [req.payload.aud],
          },
        })
          .populate("invitedBy", "-password")
          .populate("role")
          .populate("owner").lean();
        users = [...users, user]
        res.status(200).json({
          message: "Users retrieved successfully",
          users: users,
          limit: user.role.name?.toLowerCase() === "owner" ? user.limit || 0 : user.owner?.limit || 0,
        });
      } 
      else if (user.role?.name.toLowerCase() !== "owner") {
        let users = await User.find({
          owner: {
            $in: [user.owner],
          },
        })
          .populate("invitedBy", "-password")
          .populate("role")
          .populate("owner").lean();
          users=[...users,user.owner]
        res.status(200).json({
          message: "Users retrieved successfully",
          users: users,
          limit: user.owner?.limit || 0,
        });
      } 
      else {
        throw createError(401, "Unauthorized");
      }
    } catch (err) {
      next(err);
    }
  },

  // invite user
  inviteUser: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      // console.log("user  - ",user)
      // check for permission
      await checkPermission(req.payload.aud, "add_teammates");

      const invitedUsers = await User.find({
        owner: user.role.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
      }).populate("owner").populate("role");
      const { emails, role } = req.body;

      // check if owner has limit to invite new user
      if (
        invitedUsers.length + req.body.emails.length >=
        (user.role.name.toLowerCase() === "owner" ? user.limit : user.owner.limit)
      ) {
        throw createError(400, "Limit exceeded");
      }

      const users = await User.find({
        email: {
          $in: emails,
        },
      });

      // console.log("users", users)

      if (users.length > 0) {
        throw createError(409, "Email already taken");
      }

      const newUsers = emails.map((email) => {
        const randomString = Math.random().toString(36).slice(-10);
        return {
          firstName: "",
          lastName: "",
          email: email,
          role: role,
          owner: user.type === "user" ? user.owner : req.payload.aud,
          status: "invited",
          token: randomString,
          password: "",
          avatar: "uploads/default.png",
          designation: "",
          invitedBy: req.payload.aud,
        };
      });
      const createdUsers = await User.create(newUsers);

      // send email to each user
      // const emailsToSend = createdUsers.map((user) => {
      //   return {
      //     from: "noreply<admin@app.scalezmedia.com>",
      //     to: user.email,
      //     subject: "Invitation to join",
      //     text: `Hello,
      //     You have been invited to join the team.
      //     Please click the link below to join the team.
      //     https://app.scalez.in/complete-profile/${user.token}`,
      //   };
      // });

      // for (let i = 0; i < emailsToSend.length; i++) {
      //   mg.messages.create("app.scalezmedia.com", emailsToSend[i]);
      // }

      res.status(200).json({
        message: "Users invited successfully",
        users: createdUsers,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  // invite collaborator
  inviteCollaborator: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      // check for permission
      await checkPermission(req.payload.aud, "add_collaborators");

      const invitedUsers = await User.find({
        owner: user.role?.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
      }).populate("owner").populate("role");
      const { emails, project } = req.body;

      // check if owner has limit to invite new user
      if (
        invitedUsers.length + req.body.emails.length >=
        (user.role?.name.toLowerCase() === "owner" ? user.limit : user.owner.limit)
      ) {
        throw createError(400, "Limit exceeded");
      }

      const users = await User.find({
        email: {
          $in: emails,
        },
      });

      console.log("users", users);

      if (users.length > 0) {
        throw createError(409, "Email already taken");
      }

      const newUsers = emails.map((email) => {
        const randomString = Math.random().toString(36).slice(-10);
        return {
          firstName: "",
          lastName: "",
          email: email,
          type: "collaborator",
          owner: user.role.name?.toLowerCase() === "admin" ? user.owner : req.payload.aud,
          status: "invited",
          token: randomString,
          password: "",
          avatar: "uploads/default.png",
          designation: "",
          project: project,
          invitedBy: req.payload.aud,
        };
      });
      const createdUsers = await User.create(newUsers);

      // send email to each user
      // const emailsToSend = createdUsers.map((user) => {
      //   return {
      //     email: user.email,
      //     subject: "Invitation to join",
      //     text: `Hello,
      //     You have been invited to join the team.
      //     Please click the link below to join the team.
      //     http://localhost:3000/complete-profile/${user.token}`,
      //   };
      // });

      res.status(201).json({
        message: "Collaborators invited",
        users: createdUsers,
      });
    } catch (err) {
      next(err);
    }
  },

  // get all collaborators
  getAllCollaborators: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      if (user.role?.name.toLowerCase() === "owner") {
        const collaborators = await User.find({
          owner: req.payload.aud,
          type: "collaborator",
        });
        res.status(200).json({
          message: "Collaborators retrieved successfully",
          collaborators: collaborators,
        });
      } else {
        const collaborators = await User.find({
          owner: user.owner,
          type: "collaborator",
        });
        res.status(200).json({
          message: "Collaborators retrieved successfully",
          collaborators: collaborators,
        });
      }
    } catch (err) {
      next(err);
    }
  },

  // read registered users
  readRegisteredUsers: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      if (user.role?.name.toLowerCase() === "owner") {
        const users = await User.find({
          owner: req.payload.aud,
          type: "user",
          status: {
            $ne: "invited",
          },
        }).populate("owner").populate("role");
        res.status(200).json({
          message: "Users retrieved successfully",
          users: users,
        });
      } else {
        const users = await User.find({
          owner: user.owner,
          type: "user",
          status: {
            $ne: "invited",
          },
        }).populate("owner").populate("role");
        res.status(200).json({
          message: "Users retrieved successfully",
          users: users,
        });
      }
    } catch (err) {
      next(err);
    }
  },

  // update user
  updateUser: async (req, res, next) => {
    try {
      const { role } = req.body;
      const { id } = req.params;

      await User.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            role: role,
          },
        }
      );
      const user = await User.findById(id).populate("role").select("-password");
      res.status(200).json({
        message: "User updated successfully",
        role: user.role,
      });
    } catch (err) {
      next(err);
    }
  },
};
