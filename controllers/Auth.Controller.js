const User = require("../models/User.model");
const createError = require("http-errors");
const { signAccessToken } = require("../helpers/jwt_helper");
const bcrypt = require("bcryptjs");
const { uploadAvatar, uploadFeviconIcon, uploadLogo } = require("../helpers/avatar_upload");
const fs = require("fs");
const { checkRole } = require("../helpers/role_helper");
const Lever = require("../models/Lever.model");
const Keymetric = require("../models/Keymetric.model");
const axios = require("axios");
function makeid(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = {
  // create a new user
  create: async (req, res, next) => {
    try {
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        designation: req.body.designation,
      });
      await user.save();

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
        },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  //   login
  login: async (req, res, next) => {
    console.log("checkRole");

    try {
      const user = await User.findOne({ email: req.body.email }).populate("owner").populate("role");
      if (!user) {
        return res.status(401).json({
          message: "User doesn't exist",
        });
      }
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        throw createError(401, "User doesn't exist");
      }

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            lastLogin: new Date(),
          },
        }
      );

      const token = await signAccessToken(user.id);
      res.status(200).json({
        message: "User logged in successfully",
        token: token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
          avatar: user.avatar,
          widgets: user.widgets,
          company: user.company,
          timezone: user.timezone,
          address: user.address,
          address2: user.address2,
          city: user.city,
          state: user.state,
          zip: user.zip,
          country: user.country,
          currency: user.currency,
          domain: user.domain,
          fevicon: user.fevicon,
          logo: user.logo,
        },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  sendForgotPasswordLink: async (req, res) => {
    try {
      // Get validated data
      const { email } = req.body;

      // Check if this user exists
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({
          message: "This email is not associated with any account",
        });
      }

      // Generate new reset password token
      let resetPasswordToken = makeid(32);
      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordRequested = true;
      user.resetPasswordRequestedOn = new Date();
      user.resetPasswordTokenUsed = false;
      await user.save();

      return res.status(200).json({
        message: "Reset password request sent successfully",
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Reset password request sent successfully",
        data: { error: e.message },
      });
    }
  },

  setNewPassword: async (req, res) => {
    try {
      // Get validated data
      const { resetPasswordToken, newPassword } = req.body;

      // Check if this user exists
      const user = await User.findOne({ resetPasswordToken: resetPasswordToken });
      if (!user) {
        return res.status(400).json({
          message: "Invalid Token",
        });
      }

      // Update password
      const passwordSalt = await bcrypt.genSalt(10);
      user.resetPasswordTokenUsed = true;
      user.password = await bcrypt.hash(newPassword, passwordSalt);
      user.loginSessionId = makeid(32);
      user.salt = "";
      await user.save();

      return res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Reset password request sent successfully",
        data: { error: e.message },
      });
    }
  },

  // update profile picture
  updateProfilePicture: async (req, res, next) => {
    try {
      uploadAvatar(req, res, async (err) => {
        if (err) {
          next(err);
          console.log(err);
        } else {
          const path = req.file.path.replace(/\\/g, "/");
          const existingUser = await User.findById(req.payload.aud);
          if (existingUser.avatar !== "uploads/default.png") {
            fs.unlink(existingUser.avatar.replace(/\\/g, "/"), (err) => {
              if (err) {
                next(err);
                console.log(err);
              }
            });
          }

          await User.updateOne({ _id: req.payload.aud }, { avatar: path });

          const user = await User.findById(req.payload.aud).populate("role");

          res.status(200).json({
            message: "Profile picture updated successfully",
            user: {
              id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              designation: user.designation,
              avatar: user.avatar,
              company: user.company,
              timezone: user.timezone,
              address: user.address,
              address2: user.address2,
              city: user.city,
              state: user.state,
              zip: user.zip,
              country: user.country,
              currency: user.currency,
              domain: user.domain,
              fevicon: user.fevicon,
              logo: user.logo,
            },
          });
        }
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // delete profile picture
  deleteProfilePicture: async (req, res, next) => {
    try {
      const existingUser = await User.findById(req.payload.aud);
      if (existingUser.avatar !== "uploads/default.png") {
        fs.unlink(existingUser.avatar.replace(/\\/g, "/"), (err) => {
          if (err) {
            next(err);
            console.log(err);
          }
        });
      }
      await User.updateOne({ _id: req.payload.aud }, { avatar: "uploads/default.png" });

      const user = await User.findById(req.payload.aud).populate("role");

      res.status(200).json({
        message: "Profile picture deleted successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
          avatar: user.avatar,
          company: user.company,
          timezone: user.timezone,
          address: user.address,
          address2: user.address2,
          city: user.city,
          state: user.state,
          zip: user.zip,
          country: user.country,
          currency: user.currency,
          domain: user.domain,
          fevicon: user.fevicon,
          logo: user.logo,
        },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // read users
  read: async (req, res, next) => {
    try {
      const role = await checkRole(req.payload.aud);
      if (role.name.toLowerCase() !== "admin") {
        throw createError(401, "Unauthorized");
      }
      const users = await User.find();
      res.status(200).json({
        message: "Users retrieved successfully",
        users: users.map((user) => {
          return {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            designation: user.designation,
            avatar: user.avatar,
          };
        }),
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // read profile with invite token
  readProfileByToken: async (req, res, next) => {
    try {
      const user = await User.findOne({ token: req.params.token }).populate("owner").populate("role");

      if (!user) {
        throw createError(404, "User not found");
      }
      res.status(200).json({
        message: "User retrieved successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
          avatar: user.avatar,
        },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // update profile with invite token
  updateProfileByToken: async (req, res, next) => {
    try {


      const user = await User.findOne({ token: req.params.token }).populate("owner").populate("role");

      if (!user) {
        throw createError(404, "User not found");
      }

      await User.updateOne(
        { _id: user._id },
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          password: bcrypt.hashSync(req.body.password, 10),
          token: "",
          status: "enabled",
          joined: new Date(),
          employees: req.body.employees,
          company: req.body.company,
          phone: req.body.phone,
          industry: req.body.industry,
        }
      );

      const token = await signAccessToken(user?._id?.toString());

      // let permission =
      //   user.role === "owner"
      //     ? {
      //         company_access: true,
      //         create_workspace: true,
      //         create_actionPlans: true,
      //         share_ideas: true,
      //         add_teammates: true,
      //         // add_collaborators: true,
      //         create_project: true,
      //         delete_project: true,
      //         create_goals: true,
      //         create_ideas: true,
      //         create_tests: true,
      //         create_learnings: true,
      //         create_comments: true,
      //         mention_everyone: true,
      //       }
      //     : user.role === "admin"
      //     ? {
      //         company_access: true,
      //         create_workspace: true,
      //         create_actionPlans: true,
      //         share_ideas: true,
      //         add_teammates: true,
      //         // add_collaborators: true,
      //         create_project: true,
      //         delete_project: true,
      //         create_goals: true,
      //         create_ideas: true,
      //         create_tests: true,
      //         create_learnings: true,
      //         create_comments: true,
      //         mention_everyone: true,
      //       }
      //     : user.role === "member"
      //     ? {
      //         create_actionPlans: true,
      //         create_goals: true,
      //         create_ideas: true,
      //         create_tests: true,
      //         create_learnings: true,
      //         create_comments: true,
      //         mention_everyone: true,
      //       }
      //     : user.role === "viewer"
      //     ? {}
      //     : {};

      // const levers = [];
      // let leversData = [
      //   {
      //     name: "Acquisition",
      //     color: "Blue",
      //     type: "default",
      //   },
      //   {
      //     name: "Activation",
      //     color: "Orange",
      //     type: "default",
      //   },
      //   {
      //     name: "Referral",
      //     color: "Green",
      //     type: "default",
      //   },
      //   {
      //     name: "Retention",
      //     color: "Red",
      //     type: "default",
      //   },
      //   {
      //     name: "Revenue",
      //     color: "Yellow",
      //     type: "default",
      //   },
      // ];

      // let leversData =
      // let levers = await Lever.find().populate("createdBy", "-password");

      // levers.push(leversData);
      // console.log("levers", levers);

      let permission = user.role?.name.toLowerCase() === "owner" ? 
        {
        company_access: true,
        create_workspace: true,
        create_actionPlans: true,
        share_ideas: true,
        add_teammates: true,
        // add_collaborators: true,
        create_project: true,
        delete_project: true,
        create_goals: true,
        create_ideas: true,
        create_tests: true,
        create_learnings: true,
        create_comments: true,
        mention_everyone: true,
        
        } : user.role?.name.toLowerCase() === "admin" ? 
          {
          company_access: true,
          create_workspace: true,
          create_actionPlans: true,
          share_ideas: true,
          add_teammates: true,
          // add_collaborators: true,
          create_project: true,
          delete_project: true,
          create_goals: true,
          create_ideas: true,
          create_tests: true,
          create_learnings: true,
          create_comments: true,
          mention_everyone: true,
          
         }
         :
          user.role?.name.toLowerCase() === "member"  ? 
         {
           create_actionPlans: true,
            create_goals: true,
            create_ideas: true,
            create_tests: true,
            create_learnings: true,
            create_comments: true,
            mention_everyone: true,
          }:
            user.role?.name.toLowerCase() === "viewer" ?
          {} : {}

      // let metricsData = [
      //   {
      //     name: "Bounce Rate",
      //     shortName: "BR",
      //     metricType: "Rate",
      //     mode: "default",
      //   },
      //   {
      //     name: "Click Through Rate",
      //     shortName: "CTR",
      //     metricType: "Rate",
      //     mode: "default",
      //   },
      //   {
      //     name: "Conversion Rate",
      //     shortName: "CR",
      //     metricType: "Rate",
      //     mode: "default",
      //   },
      //   {
      //     name: "Cost Per Acquisition",
      //     shortName: "CPA",
      //     metricType: "Currency",
      //     mode: "default",
      //   },
      //   {
      //     name: "Cost Per Lead",
      //     shortName: "CPL",
      //     metricType: "Currency",
      //     mode: "default",
      //   },
      //   {
      //     name: "Monthly Revenue Rate",
      //     shortName: "MRR",
      //     metricType: "Rate",
      //     mode: "default",
      //   },
      // ];

      // console.log("metricsData", metricsData);

          let metricsData = [{
            name: "Bounce Rate",
            shortName: "BR",
            metricType: "Rate",
            mode: "default"
          },
          {
            name: "Click Through Rate",
            shortName: "CTR",
            metricType: "Rate",
            mode: "default"
          },
          {
            name: "Conversion Rate",
            shortName: "CR",
            metricType: "Rate",
            mode: "default"
          },
          {
            name: "Cost Per Acquisition",
            shortName: "CPA",
            metricType: "Currency",
            mode: "default"
          },
          {
            name: "Cost Per Lead",
            shortName: "CPL",
            metricType: "Currency",
            mode: "default"
          },
          {
            name: "Monthly Revenue Rate",
            shortName: "MRR",
            metricType: "Rate",
            mode: "default"
          }
          ]
    
          console.log("metricsData", metricsData);

      if (user.role?.name.toLowerCase() === "owner"){
          await Promise.all(
          metricsData.map(async(x) => {
            const newMetric = Keymetric()
            newMetric.name = x.name;
            newMetric.shortName = x.shortName;
            newMetric.metricType = x.metricType;
            newMetric.mode = x.mode;
            newMetric.owner = user;
            await newMetric.save();

            console.log("newMetric", newMetric);
          })
        );
      }

      let levers = await Lever.find().populate("createdBy", "-password");

      // levers.push(leversData);

      res.status(200).json({
        message: "Profile updated successfully, proceed to login",
        token: token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
          avatar: user.avatar,
          widgets: user.widgets,
          permissions: permission,
          levers: levers,

          permissions: permission,
          levers: levers,
          keyMetrics: await Keymetric.find({ owner: user.role?.name.toLowerCase() === "owner" ? user : user.owner}).populate(
            "createdBy",
            "-password"
          ),
          organization: user.organization,
          avatar: user.avatar,
        },
      });

      // },
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // update profile
  updateProfile: async (req, res, next) => {
    try {
      const existingUser = await User.findById(req.payload.aud).populate("role");

      // email
      if (req.body.email) {
        const user = await User.findOne({ email: req.body.email }).populate("role");

        if (user && user._id.toString() !== existingUser._id.toString()) {
          throw createError(409, "Email already exists");
        }
      }

      await User.updateOne(
        { _id: req.payload.aud },
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          designation: req.body.designation,
          about: req.body.about,
        }
      );

      const user = await User.findById(req.payload.aud).populate("role");

      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
          avatar: user.avatar,
          about: user.about,
          widgets: user.widgets,
          company: user.company,
          timezone: user.timezone,
          address: user.address,
          address2: user.address2,
          city: user.city,
          state: user.state,
          zip: user.zip,
          country: user.country,
          currency: user.currency,
          domain: user.domain,
          fevicon: user.fevicon,
          logo: user.logo,
        },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // update password
  updatePassword: async (req, res, next) => {
    try {
      const existingUser = await User.findById(req.payload.aud);

      if (!bcrypt.compareSync(req.body.oldPassword, existingUser.password)) {
        throw createError(401, "Old password is incorrect");
      }
      await User.updateOne({ _id: req.payload.aud }, { password: bcrypt.hashSync(req.body.newPassword, 10) });

      res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // update company
  updateCompany: async (req, res, next) => {
    try {
      const existingUser = await User.findById(req.payload.aud).populate("owner").populate("role");
      if (existingUser && existingUser.role?.name.toLowerCase() === "owner") {
      let domainCount =  await User.countDocuments({domain:req.body.domain})
        if(domainCount!==0){
          res.status(403).send({message:"Domain already in use"})
        }
        // for domain with hardcoded url
        let response = await axios.post(`http://localhost:4000/manager/create-organization`, {
          domain: req.body.domain + ".scalez.in",
        });
        await User.findByIdAndUpdate(
          { _id: req.payload.aud },
          {
            company: req.body.company,
            timezone: req.body.timezone,
            address: req.body.address,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            country: req.body.country,
            currency: req.body.currency,
            domain: req.body.domain,
          }
        );
        const user = await User.findOne({ _id: req.payload.aud }).populate("role");
        // console.log(user)
        res.status(200).json({
          message: "Company updated successfully",
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            designation: user.designation,
            avatar: user.avatar,
            widgets: user.widgets,
            company: user.company,
            timezone: user.timezone,
            address: user.address,
            address2: user.address2,
            city: user.city,
            state: user.state,
            zip: user.zip,
            country: user.country,
            currency: user.currency,
            domain: user.domain,
            fevicon: user.fevicon,
            logo: user.logo,
          },
        });
      } else {
        res.status(400).json({ message: "User Not Authorized" });
      }
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // upload fevicon
  updateFeviconPicture: async (req, res, next) => {
    try {
      uploadFeviconIcon(req, res, async (err) => {
        if (err) {
          next(err);
          console.log(err);
        } else {
          const path = req.file.path.replace(/\\/g, "/");
          const existingUser = await User.findById(req.payload.aud);
          if (existingUser.fevicon !== null) {
            fs.unlink(existingUser.fevicon.replace(/\\/g, "/"), (err) => {
              if (err) {
                next(err);
                console.log(err);
              }
            });
          }

          await User.updateOne({ _id: req.payload.aud }, { fevicon: path });

          const user = await User.findById(req.payload.aud).populate("role");

          res.status(200).json({
            message: "Fevicon picture updated successfully",
            user: {
              id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              designation: user.designation,
              avatar: user.avatar,
              company: user.company,
              timezone: user.timezone,
              address: user.address,
              address2: user.address2,
              city: user.city,
              state: user.state,
              zip: user.zip,
              country: user.country,
              currency: user.currency,
              domain: user.domain,
              fevicon: user.fevicon,
              logo: user.logo,
            },
          });
        }
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // logo
  updateLogoPicture: async (req, res, next) => {
    try {
      uploadLogo(req, res, async (err) => {
        if (err) {
          next(err);
          console.log(err);
        } else {
          const path = req.file.path.replace(/\\/g, "/");
          const existingUser = await User.findById(req.payload.aud);
          if (existingUser.logo !== null) {
            fs.unlink(existingUser.logo.replace(/\\/g, "/"), (err) => {
              if (err) {
                next(err);
                console.log(err);
              }
            });
          }

          await User.updateOne({ _id: req.payload.aud }, { logo: path });

          const user = await User.findById(req.payload.aud).populate("role");

          res.status(200).json({
            message: "Logo picture updated successfully",
            user: {
              id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              designation: user.designation,
              avatar: user.avatar,
              company: user.company,
              timezone: user.timezone,
              address: user.address,
              address2: user.address2,
              city: user.city,
              state: user.state,
              zip: user.zip,
              country: user.country,
              currency: user.currency,
              domain: user.domain,
              fevicon: user.fevicon,
              logo: user.logo,
            },
          });
        }
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // delete fevicon
  deleteFeviconPicture: async (req, res, next) => {
    try {
      const existingUser = await User.findById(req.payload.aud);
      if (existingUser.fevicon !== null) {
        fs.unlink(existingUser.fevicon.replace(/\\/g, "/"), (err) => {
          if (err) {
            next(err);
            console.log(err);
          }
        });
      }
      await User.updateOne({ _id: req.payload.aud }, { fevicon: null });

      const user = await User.findById(req.payload.aud).populate("role");

      res.status(200).json({
        message: "Fevicon picture deleted successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
          avatar: user.avatar,
          company: user.company,
          timezone: user.timezone,
          address: user.address,
          address2: user.address2,
          city: user.city,
          state: user.state,
          zip: user.zip,
          country: user.country,
          currency: user.currency,
          domain: user.domain,
          fevicon: user.fevicon,
          logo: user.logo,
        },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // delete logo
  deleteLogoPicture: async (req, res, next) => {
    try {
      const existingUser = await User.findById(req.payload.aud);
      if (existingUser.logo !== null) {
        fs.unlink(existingUser.logo.replace(/\\/g, "/"), (err) => {
          if (err) {
            next(err);
            console.log(err);
          }
        });
      }
      await User.updateOne({ _id: req.payload.aud }, { logo: null });

      const user = await User.findById(req.payload.aud).populate("role");

      res.status(200).json({
        message: "Logo picture deleted successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
          avatar: user.avatar,
          company: user.company,
          timezone: user.timezone,
          address: user.address,
          address2: user.address2,
          city: user.city,
          state: user.state,
          zip: user.zip,
          country: user.country,
          currency: user.currency,
          domain: user.domain,
          fevicon: user.fevicon,
          logo: user.logo,
        },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // update notification settings
  updateNotificationSettings: async (req, res, next) => {
    try {
      const existingUser = await User.findById(req.payload.aud);

      await User.updateOne(
        { _id: req.payload.aud },
        {
          notificationSettings: req.body.notificationSettings,
        }
      );

      res.status(200).json({
        message: "Notification settings updated successfully",
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  me: async (req, res, next) => {
    try {
      let user = await User.findById(req.payload.aud).populate("role");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      const token = await signAccessToken(user.id);

      // user = {
      //   ...user
      // }
      user = user.toObject();
      user["id"] = user._id;
      res.status(200).json({
        message: "User retrieved successfully",
        user,
        token: token,
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },
};
