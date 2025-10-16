const User = require("../models/User.model");
const Test = require("../models/Test.model");
const Learning = require("../models/Learning.model");
const Project = require("../models/Project.model");
const createError = require("http-errors");
const { checkRole, getUsersFromTags } = require("../helpers/role_helper");
const upload = require("../helpers/file_upload");
const Notification = require("../models/Notification.model");
module.exports = {
  // read all learnings
  readAll: async (req, res, next) => {
    try {
      // const role = await checkRole(req.payload.aud);
      // if (role !== "owner") {
      //   if (role !== "admin") {
      //     return next(createError(403, "Forbidden"));
      //   }
      // }

      const learnings = await Learning.find({
        project: req.params.id,
      })
        .populate("assignedTo", "-password")
        .populate("goal");

      res.send({
        message: "Successfully read all learnings",
        learnings,
      });
    } catch (err) {
      next(err);
    }
  },

  // view learning
  readOne: async (req, res, next) => {
    try {
      const learning = await Learning.findById(req.params.id).populate("comments.createdBy")
        .populate("assignedTo", "-password")
        .populate("goal");

      res.send({
        message: "Successfully read learning",
        learning,
      });
    } catch (err) {
      next(err);
    }
  },

  // update learning
  update: async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        const { id } = req.params;
        const {
          result,
          conclusion,
          // assignedTo,
          // tasks,
          // dueDate,
          deletedMedia
        } = req.body;
       
        const learning = await Learning.findById(req.params.id);
        // console.log("learning", learning);
        if (!learning) {
          return next(createError(404, "Learning not found"));
        }
        const files = req.files;
        const filesPath = [...learning.media].filter(mediaUrl => deletedMedia.includes(mediaUrl) === false);
        files.forEach((file) => {
          filesPath.push(file.path.replace(/\\/g, "/"));
        });

        learning.result = result;
        learning.conclusion = conclusion;
        learning.media = filesPath;
        // learning.assignedTo = assignedTo;
        // learning.tasks = tasks;
        // learning.dueDate = dueDate;
        const finalResult = await learning.save();

        // await Learning.updateOne(
        //   { _id: req.params.id },
        //   {
        //     $set: {
        //       result: req.body.result,
        //       conclusion: req.body.conclusion,
        //       media: filesPath,
        //     },
        //   }
        // );

        res.send({
          message: "Learning updated",
          learning: finalResult,
        });
      });
    } catch (err) {
      next(err);
    }
  },

  updateLearningTask: async (req, res, next) => {
    try {
      // const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      // if (user.role.name.toLowerCase() === "owner") {
        const learning = await Learning.findById(req.params.id);
        if (!learning) {
          return next(createError(404, "Learning not found"));
        }
        learning.assignedTo = req.body.assignedTo;
        learning.tasks = req.body.tasks;
        learning.dueDate = req.body.dueDate;
        await learning.save();
        res.status(200).json({
          message: "Learning updated successfully",
          learning: learning,
        });
      // } 
      // else if (user.type === "user") {
      //   const learning = await Learning.findById(req.params.id);
      //   if (!learning) {
      //     return next(createError(404, "Learning not found"));
      //   }
      //   // if (test.createdBy.toString() !== req.payload.aud || user.role !== "owner" || user.role !== "admin") 
      //   if(user.role === "viewer"){
      //     return next(
      //       createError(403, "You are not allowed to update this learning")
      //     );
      //   }
      //   learning.assignedTo = req.body.assignedTo;
      //   learning.tasks = req.body.tasks;
      //   learning.dueDate = req.body.dueDate;

      //   await learning.save();
      //   res.status(200).json({
      //     message: "Learning updated successfully",
      //     learning: learning,
      //   });
      // }
    } catch (err) {
      next(err);
    }
  },

  // send back to test
  sendBack: async (req, res, next) => {
    try {
      // const role = await checkRole(req.payload.aud);
      // if (role !== "owner") {
      //   if (role !== "admin") {
      //     return next(createError(403, "Forbidden"));
      //   }
      // }

      // const user = await User.findById(req.payload.aud);
      // const idea = await Idea.findById(req.params.id);

      const learning = await Learning.findById(req.params.id);
      // console.log("learning - -", learning)
      if (!learning) {
        return next(createError(404, "Learning not found"));
      }

      const newTest = new Test({
        name: learning.name,
        description: learning.description,
        assignedTo: learning.assignedTo,
        goal: learning.goal,
        keymetric: learning.keymetric,
        lever: learning.lever,
        description: learning.description,
        media: learning.media,
        tasks: learning.tasks,
        impact: learning.impact,
        confidence: learning.confidence,
        ease: learning.ease,
        dueDate: learning.dueDate,
        score: learning.score,
        owner: learning.owner,
        createdBy: req.payload.aud,
        project: learning.project,
        status: "Up Next",
        nomination: learning.nominations

      });

      await newTest.save();

      const project = await Project.findById(learning.project._id)
      if (learning.result =="Successful"){
        await Project.updateOne({_id:project._id},{
          $set:{
            "ideaSuccessful": project.ideaSuccessful - 1
          }
        })
      }
      else if (learning.result === "Unsuccessful") {
        await Project.updateOne({ _id: project._id }, {
          "ideaUnsuccessful": project.ideaUnsuccessful - 1
        })
      } else if (learning.result === "Inconclusive") {
        await Project.updateOne({ _id: project._id }, {
          "ideaInconclusive": project.ideaInconclusive - 1
        })
      }
          console.log("project --",project._id)
      // delete learning
      await Learning.deleteOne({ _id: req.params.id });

      res.send({
        message: "Learning sent back to test",
      });
    } catch (err) {
      next(err);
    }
  },

  // add comment
  addComment: async (req, res, next) => {
    try {
      const learning = await Learning.findById(req.params.id);
      if (!learning) {
        return next(createError(404, "Learning not found"));
      }

      const user = await User.findById(req.payload.aud);

      const { comment } = req.body;

      const newComment = {
        comment,
        createdBy: req.payload.aud,
        createdAt: new Date(),
      };

      const comentUsers = getUsersFromTags(comment);
      if (comentUsers.length > 0) {
        const notification = new Notification({
          audience: comentUsers.map((user) => user._id),
          message: `${user.firstName} has mentioned you in comment`,
          project: goal.project,
          type: "Assigned",
          user: req.payload.aud,
        });

        await notification.save();

        const notificationData = await Notification.findOne({
          _id: notification._id,
        }).populate("user", "-password");

        io.emit("notification", notificationData);
      }

      learning.comments.push(newComment);

      const result = await Learning.updateOne(
        { _id: req.params.id },
        {
          $set: {
            comments: learning.comments,
          },
        }
      );

      res.status(200).json({
        message: "Comment added successfully",
        learning: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // edit comment
  editComment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;

      const result = await Learning.updateOne(
        { "comments._id": id },
        {
          $set: {
            "comments.$.comment": comment,
          },
        }
      );
      res.status(200).json({
        message: "Comment edited successfully",
        learning: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // delete comment from test
  deleteComment: async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await Learning.updateOne(
        { "comments._id": id },
        {
          $pull: {
            comments: { _id: id },
          },
        }
      );
      res.status(200).json({
        message: "Comment deleted successfully",
        learning: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
