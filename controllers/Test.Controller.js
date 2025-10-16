const User = require("../models/User.model");
const Goal = require("../models/Goal.model");
const Idea = require("../models/Idea.model");
const Project = require("../models/Project.model");
const createError = require("http-errors");
const { getUsersFromTags } = require("../helpers/role_helper");
const upload = require("../helpers/file_upload");
const Test = require("../models/Test.model");
const Learning = require("../models/Learning.model");
const Notification = require("../models/Notification.model");
const moment = require("moment");
const Count = require("../models/Count.model");

module.exports = {
  // read tests
  readTests: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      if (user.role?.name.toLowerCase() === "owner") {
        const tests = await Test.find({
          project: req.params.projectId,
        })
          .populate("createdBy", "-password")
          .populate("assignedTo", "-password");
        res.status(200).json({
          message: "Tests found successfully",
          tests: tests,
        });
        // console.log("tests ====>", tests);
      } else if (user.role?.name.toLowerCase() !== "owner") {
        const tests = await Test.find({
          project: req.params.projectId,
          $or: [{ createdBy: req.payload.aud }, { assignedTo: { $in: [req.payload.aud] } }],
        }).populate("assignedTo").populate("createdBy");
        res.status(200).json({
          message: "Tests found successfully",
          tests: tests,
        });
      }
    } catch (err) {
      next(err);
    }
  },

  // read single test
  readTest: async (req, res, next) => {
    try {
      // const user = await User.findById(req.payload.aud).populate("owner").populate("role");

      // if (user.role?.name.toLowerCase() === "owner") {
      var test = await Test.findById(req.params.testId)
        .populate("goal", "name")
        .populate("createdBy")
        .populate("assignedTo", "-password").populate("comments.createdBy");


console.log("test --",test)

      if (!test) {
        throw createError(404, "Test not found");
      }
      const goal = await Goal.findById(test.goal._id);
      // find keymetric
      const keymetric = goal.keymetric?.find((keymetric) => keymetric._id.toString() === test.keymetric);

      // append keymetric to test
      test.keymetric = keymetric;

      res.status(200).json({
        message: "Test found successfully",
        test: test,
      });
      // }
      //  else if (user.type === "user") {
      //   var test = await Test.findById(req.params.testId)
      //     .populate("goal", "name")
      //     .populate("createdBy", "-password")
      //     .populate("assignedTo", "-password");

      //   if (!test) {
      //     throw createError(404, "Test not found");
      //   }
      //   const goal = await Goal.findById(test.goal._id);
      //   // find keymetric
      //   const keymetric = goal.keymetric.find((keymetric) => keymetric._id.toString() === test.keymetric);

      //   // append keymetric to test
      //   test.keymetric = keymetric;

      //   res.status(200).json({
      //     message: "Test found successfully",
      //     test: test,
      //   });
      // }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  //   update status
  updateStatus: async (req, res, next) => {
    try {
      // const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      // if (user.role?.name.toLowerCase() === "owner") {
      const test = await Test.findById(req.params.testId).populate("createdBy");
      if (!test) {
        return next(createError(404, "Test not found"));
      }
      test.status = req.body.status;
      await test.save();
      res.status(200).json({
        message: "Test status updated successfully",
        test: test,
      });
      // } 
      // else if (user.type === "user") {
      //   const test = await Test.findById(req.params.testId);
      //   if (!test) {
      //     return next(createError(404, "Test not found"));
      //   }
      //   // if (test.createdBy.toString() !== req.payload.aud|| user.role !== "owner" || user.role !== "admin")
      //   if (user.role.name.toLowerCase() === "viewer") {
      //     return next(createError(403, "You are not allowed to update this test"));
      //   }
      //   test.status = req.body.status;
      //   await test.save();
      //   res.status(200).json({
      //     message: "Test status updated successfully",
      //     test: test,
      //   });
      // }
    } catch (err) {
      next(err);
    }
  },

  //   update idea
  updateIdea: async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        // const user = await User.findById(req.payload.aud).populate("owner").populate("role");
        // if (user.role?.name.toLowerCase() === "owner") {
        const test = await Test.findById(req.params.testId).populate("createdBy");
        if (!test) {
          return next(createError(404, "Test not found"));
        }
        const files = req.files;
        const filesPath = [];
        files.forEach((file) => {
          filesPath.push(file.path.replace(/\\/g, "/"));
        });

        test.name = req.body.name;
        test.description = req.body.description;
        test.goal = req.body.goal;
        test.lever = req.body.lever;
        test.keymetric = req.body.keymetric;
        test.impact = req.body.impact;
        test.confidence = req.body.confidence;
        test.ease = req.body.ease;
        test.score = req.body.score;
        test.media = filesPath;

        await test.save();

        res.status(200).json({
          message: "Test idea updated successfully",
          test: test,
        });
        // } 
        // else if (user.type === "user") {
        //   const test = await Test.findById(req.params.testId);
        //   if (!test) {
        //     return next(createError(404, "Test not found"));
        //   }
        //   // if (test.createdBy.toString() !== req.payload.aud || user.role !== "owner" || user.role !== "admin")
        //   if (user.role === "viewer") {
        //     return next(createError(403, "You are not allowed to update this test"));
        //   }
        //   const files = req.files;
        //   const filesPath = [];
        //   files.forEach((file) => {
        //     filesPath.push(file.path.replace(/\\/g, "/"));
        //   });

        //   test.name = req.body.name;
        //   test.description = req.body.description;
        //   test.goal = req.body.goal;
        //   test.lever = req.body.lever;
        //   test.keymetric = req.body.keymetric;
        //   test.impact = req.body.impact;
        //   test.confidence = req.body.confidence;
        //   test.ease = req.body.ease;
        //   test.score = req.body.score;
        //   test.files = filesPath;

        //   await test.save();
        //   res.status(200).json({
        //     message: "Test idea updated successfully",
        //     test: test,
        //   });
        // }
      });
    } catch (err) {
      next(err);
    }
  },

  // edit test
  editTest: async (req, res, next) => {
    try {
      // const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      // if (user.type === "owner") {
      const test = await Test.findById(req.params.testId).populate("createdBy");
      if (!test) {
        return next(createError(404, "Test not found"));
      }
      test.assignedTo = req.body.assignedTo;
      test.tasks = req.body.tasks;
      test.dueDate = req.body.dueDate;
      await test.save();
      res.status(200).json({
        message: "Test updated successfully",
        test: test,
      });
      // } 
      // else if (user.type === "user") {
      //   const test = await Test.findById(req.params.testId);
      //   if (!test) {
      //     return next(createError(404, "Test not found"));
      //   }
      //   // if (test.createdBy.toString() !== req.payload.aud || user.role !== "owner" || user.role !== "admin")
      //   if (user.role === "viewer") {
      //     return next(createError(403, "You are not allowed to update this test"));
      //   }
      //   test.assignedTo = req.body.assignedTo;
      //   test.tasks = req.body.tasks;
      //   test.dueDate = req.body.dueDate;

      //   await test.save();
      //   res.status(200).json({
      //     message: "Test updated successfully",
      //     test: test,
      //   });
      // }
    } catch (err) {
      next(err);
    }
  },

  // send test back to idea
  sendTestBack: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      // if (user.type === "owner") {
      const test = await Test.findById(req.params.testId).populate("createdBy");
      if (!test) {
        return next(createError(404, "Test not found"));
      }

      const idea = new Idea({
        name: test.name,
        project: test.project,
        description: test.description,
        createdBy: req.payload.aud,
        owner: test.owner,
        goal: test.goal,
        keymetric: test.keymetric,
        lever: test.lever,
        media: test.media,
        impact: test.impact,
        confidence: test.confidence,
        ease: test.ease,
        score: test.score,
        nomination: test.nominations
      });

      await idea.save();
      // await User.updateOne(
      //   { _id: req.payload.aud },
      //   {
      //     $set: {
      //       "ideaTest": user.ideaTest - 1,
      //     },
      //   }
      // );
      let count = await Count.updateMany(
        { user: req.payload.aud, project: test.project._id },

        {
          $inc: { 'countIdea': -1, "countTest": -1, "countNominate": -1 * test.nominations.length },
        }
        ,
        { upsert: true, setDefaultsOnInsert: true }
      );

      const project = await Project.findById(idea.project._id)
      await Project.updateOne({ _id: project._id }, {
        $set: {
          "ideaTest": project.ideaTest - 1,
        },
      })


      // delete test
      await Test.findByIdAndDelete(req.params.testId);
      res.status(200).json({
        message: "Test sent back to idea successfully",
        test: test,
      });
      // }
      //  else if (user.type === "user") {
      //   const test = await Test.findById(req.params.testId);
      //   if (!test) {
      //     return next(createError(404, "Test not found"));
      //   }
      //   // if (test.createdBy.toString() !== req.payload.aud || user.role !== "owner" || user.role !== "admin")
      //   if (user.role === "viewer") {
      //     return next(createError(403, "You are not allowed to update this test"));
      //   }
      //   const idea = new Idea({
      //     name: test.name,
      //     project: test.project,
      //     description: test.description,
      //     createdBy: req.payload.aud,
      //     owner: test.owner,
      //     goal: test.goal,
      //     keymetric: test.keymetric,
      //     lever: test.lever,
      //     media: test.media,
      //     impact: test.impact,
      //     confidence: test.confidence,
      //     ease: test.ease,
      //     score: test.score,
      //   });

      //   await idea.save();

      //   // delete test
      //   await Test.findByIdAndDelete(req.params.testId);

      //   res.status(200).json({
      //     message: "Test sent back to idea successfully",
      //     test: test,
      //   });
      // }
    } catch (err) {
      next(err);
    }
  },

  // move to learning
  moveToLearning: async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        const user = await User.findById(req.payload.aud);

        if (!user.quickstart.create_learning) {
          await User.updateOne(
            { _id: req.payload.aud },
            {
              $set: {
                "quickstart.create_learning": true,
              },
            }
          );
        }

        const test = await Test.findById(req.params.testId).populate("createdBy");
        console.log("test", test);
        if (!test) {
          return next(createError(404, "Test not found"));
        }
        const files = req.files;
        const filesPath = [...test.media];
        if (files && files.length > 0) {
          files.forEach((file) => {
            filesPath.push(file.path.replace(/\\/g, "/"));
          });
        }

        const learning = new Learning({
          name: test.name,
          project: test.project,
          description: test.description,
          createdBy: test.createdBy,
          owner: test.owner,
          goal: test.goal,
          keymetric: test.keymetric,
          lever: test.lever,
          media: filesPath,
          impact: test.impact,
          confidence: test.confidence,
          ease: test.ease,
          dueDate: test.dueDate,
          score: test.score,
          result: req.body.result,
          conclusion: req.body.conclusion,
          assignedTo: test.assignedTo,
          nomination: test.nominations,
          tasks: test.tasks
        });

        await learning.save();

        // console.log("conclusion --",req.body.result)
        const project = await Project.findById(test.project._id)
        // console.log("project ---", project)
        if (req.body.result == "Successful"){
          await Project.updateOne({_id:project._id},{
            "ideaSuccessful": project.ideaSuccessful + 1
          })
    
        } 
        else if (req.body.result ==="Unsuccessful"){
          await Project.updateOne({ _id: project._id }, {
            "ideaUnsuccessful": project.ideaUnsuccessful + 1
          })
        } else if (req.body.result ==="Inconclusive"){
          await Project.updateOne({ _id: project._id }, {
            "ideaInconclusive": project.ideaInconclusive + 1
          })
        }

        console.log("project --",req.body.result,project._id)
        // delete test
        await Test.findByIdAndDelete(req.params.testId);

        res.status(200).json({
          message: "Test moved to learning successfully",
          test: test,
        });
      });
    } catch (err) {
      next(err);
    }
  },

  // add comment to test
  addComment: async (req, res, next) => {
    try {
      const test = await Test.findById(req.params.id).populate("createdBy");
      if (!test) {
        throw createError(404, "Test not found");
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
          project: test.project,
          type: "Assigned",
          user: req.payload.aud,
        });

        await notification.save();

        const notificationData = await Notification.findOne({
          _id: notification._id,
        }).populate("user", "-password");

        io.emit("notification", notificationData);
      }

      test.comments.push(newComment);

      const result = await Test.updateOne(
        { _id: req.params.id },
        {
          $set: {
            comments: test.comments,
          },
        }
      ).populate("createdBy");

      res.status(200).json({
        message: "Comment added successfully",
        test: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // delete comment from test
  deleteComment: async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await Test.updateOne(
        { "comments._id": id },
        {
          $pull: {
            comments: { _id: id },
          },
        }
      );
      res.status(200).json({
        message: "Comment deleted successfully",
        test: result,
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

      const result = await Test.updateOne(
        { "comments._id": id },
        {
          $set: {
            "comments.$.comment": comment,
          },
        }
      );
      res.status(200).json({
        message: "Comment edited successfully",
        test: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // update status of task in test
  updateTestStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await Test.updateOne(
        { "tasks._id": id },
        {
          $set: {
            "tasks.$.status": status,
          },
        }
      );
      res.status(200).json({
        message: "Status updated successfully",
        test: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
