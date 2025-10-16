const User = require("../models/User.model");
const Goal = require("../models/Goal.model");
const Project = require("../models/Project.model");
const createError = require("http-errors");
const {
  checkRole,
  getUsersFromTags,
  checkPermission,
} = require("../helpers/role_helper");
const Idea = require("../models/Idea.model");
const Test = require("../models/Test.model");
const Learning = require("../models/Learning.model");
const Notification = require("../models/Notification.model");
const mongoose = require("mongoose");
const { MongoClient, ObjectId } = require('mongodb');


let goalsKM = [];
let goalsData  = [];
module.exports = {
  // create goal
  create: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      await checkPermission(req.payload.aud, "create_goals");

      const goal = new Goal({
        name: req.body.name,
        description: req.body.description,
        startDate: req.body.startDate || null,
        endDate: req.body.endDate || null,
        members: req.body.members,
        project: req.body.project,
        keymetric: req.body.keymetric,
        confidence: req.body.confidence,
        owner: user.role?.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
        createdBy: req.payload.aud,
      });

      const result = await goal.save();

      console.log("result create goal ", result);
      goalsData = Object.assign(result);

      console.log("goalsData", goalsData);

      // find goal and return users populated
      const goalWithMembers = await Goal.findById(result._id).populate(
        "members",
        "-password"
      );

      res.status(201).json({
        message: "Goal created successfully",
        users: goalWithMembers.members,
        goal: result._id,
      });
    } catch (err) {
      next(err);
    }
  },
  createMultipleGoals: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      await checkPermission(req.payload.aud, "create_goals");


      let goals = req.body;

        // const goal = new Goal({
        //   name: req.body.name,
        //   description: req.body.description,
        //   startDate: req.body.startDate || null,
        //   endDate: req.body.endDate || null,
        //   members: req.body.members,
        //   project: req.body.projectId,
        //   keymetric: req.body.keymetric,
        //   confidence: req.body.confidence,
        //   owner: user.role?.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
        //   createdBy: req.payload.aud,
        // });
        let createdGoals = [];
        // let newGoals = [];
        // for (const id of goals) {
        //    newGoals = goals.map((goal) => {
        //     return {
        //     id: id,
        //     name: goal.name,
        //     description: goal.description,
        //     startDate: goal.startDate || null,
        //     endDate: goal.endDate || null,
        //     members: goal.members,
        //     project: goal.projectId,
        //     keymetric: goal.keymetric,
        //     confidence: goal.confidence,
        //     owner: user.role?.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
        //     createdBy: req.payload.aud,
        //     };
        //   });
        const newGoals = goals.map((goal) =>{
          return {
            name: goal.name,
            description: goal.description,
            startDate: goal.startDate || null,
            endDate: goal.endDate || null,
            members: goal.members,
            project: goal.projectId,
            keymetric: goal.keymetric,
            confidence: goal.confidence,
            owner: user.role?.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
            createdBy: req.payload.aud,
          }
        })
    
          const created = await Goal.create(newGoals);
          createdGoals.push(...created);
        // }
  
       let goalsData = newGoals.map((x) => 
          x.createdBy
        )
  
        console.log("goalsData", goalsData);
  
        // find goal and return users populated
        const goalWithMembers = await Goal.find({ _id: { $in: goalsData.map(id => ObjectId(id)) } }).populate(
          "members",
          "-password"
        );
        console.log("HEREEEEE");

        res.status(201).json({
          message: "Goal created successfully",
          users: goalWithMembers.members,
          goal: createdGoals,
        });
       
      
     
  }catch (err) {
      next(err);
    }
  },

  // request ideas from team
  requestIdeas: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud);

      const goal = await Goal.findById(req.params.id);
      if (!goal) {
        throw createError(404, "Goal not found");
      }

      const { members, message } = req.body;

      const notification = new Notification({
        audience: members,
        message: `${user.firstName} has requested ideas for a goal in ${goal.name}`,
        project: goal.project,
        type: "Assigned",
        user: req.payload.aud,
      });

      const notificationData = await Notification.findOne({
        _id: notification._id,
      }).populate("user", "-password");

      io.emit("notification", notificationData);

      await notification.save();

      res.status(200).json({
        message: "Ideas requested successfully",
      });
    } catch (err) {
      next(err);
    }
  },

  // get all goals
  read: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      const projectId = req.params.id;
      console.log('projectId :>> ', projectId);

      if (user.type === "user") {
        // get all goals where user is member
        const goals = await Goal.find({
          members: { $in: [req.payload.aud] },
          project: projectId,
        })
          .populate("members", "-password")
          .populate("owner", "-password")
          .populate("createdBy", "-password");

        // calculate number of ideas per goal
        const goalsWithIdeas = await Promise.all(
          goals.map(async (goal) => {
            const ideas = await Idea.find({ goal: goal._id });
            return { ...goal._doc, ideas: ideas.length };
          })
        );

        return res.status(200).json({
          message: "Goals retrieved successfully",
          goals: goalsWithIdeas,
        });
      } else {
        const goals = await Goal.find({
          project: projectId,
        })
          .populate("members", "-password")
          .populate("owner", "-password")
          .populate("createdBy", "-password");

        // calculate number of ideas per goal
        const goalsWithIdeas = await Promise.all(
          goals.map(async (goal) => {
            const ideas = await Idea.find({ goal: goal._id });
            return { ...goal._doc, ideas: ideas.length };
          })
        );

        res.status(200).json({
          message: "Goals retrieved successfully",
          goals: goalsWithIdeas,
        });
      }
    } catch (err) {
      next(err);
    }
  },

  readAllGoals: async (req, res, next) => {
  
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
  
      const goalIds = req.body.projectId; // Assuming the payload contains an array of project IDs
      console.log('req.body readAllGoals:', req.body);

      const objectIds = goalIds.map((g) => g._id); // Remove the ObjectId conversion
    const goals = await Goal.find({ _id: { $in: objectIds } }) // Modify the query to use "_id" instead of "project"
      .populate('members', '-password')
      .populate('owner', '-password')
      .populate('createdBy', '-password');

    const goalsWithIdeas = await Promise.all(
      goals.map(async (goal) => {
        const ideas = await Idea.find({ goal: goal._id });
        return { ...goal._doc, ideas: ideas.length };
      })
    );
  
      res.status(200).json({
        message: "Goals retrieved successfully",
        goals: goalsWithIdeas,
      });
    } catch (err) {
      next(err);
    }
  },
  
  // get goal by id
  readById: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud);
      const goalId = req.params.id;

      if (!user.quickstart.create_goal) {
        await User.updateOne(
          { _id: req.payload.aud },
          {
            $set: {
              "quickstart.create_goal": true,
            },
          }
        );
      }

      if (user.role.name !== "Owner") {
        // get goal where user is member
        var goal = await Goal.findOne({
          _id: goalId,
          $in: { members: req.payload.aud },
        })
          .populate("members", "-password")
          .populate("members.role")
          .populate("owner", "-password")
          .populate("comments.createdBy", "-password")
          .populate("project")
          .lean()

        if (!goal) {
          throw createError(404, "Goal not found");
        }

        if(goal.keymetric.length != 0){
          goal['keymetric'] = await Promise.all(goal.keymetric.map(async(key) => {
            if(key.metrics.length != 0){

            key.metrics = await Promise.all(key.metrics.map(async(singleKeymetric) => {
                singleKeymetric.createdBy = await User.findById(singleKeymetric.createdBy)
                return singleKeymetric
                           
              }))
              return key;
            }

            else {
              return key;
            }
            }))
        }
        // append tests to goal
        const tests = await Test.find({ goal: goalId }).populate("createdBy").populate("assignedTo").populate("createdBy");

        // append ideas to goal
        const ideas = await Idea.find({ goal: goalId }).populate("createdBy");

        // append learnings to goal
        const learnings = await Learning.find({ goal: goalId }).populate("createdBy");

        const result = {
          ...goal,
          tests: tests,
          ideas: ideas,
          learnings: learnings,
        };

        return res.status(200).json({
          message: "Goal retrieved successfully",
          goal: result,
        });
      } else {
        var goal = await Goal.findOne({ _id: goalId })
          .populate("members", "-password")
          .populate("members.role")
          .populate("owner", "-password")
          .populate("comments.createdBy", "-password").lean()

        if (!goal) {
          throw createError(404, "Goal not found");
        }

        if(goal.keymetric.length != 0){
          goal['keymetric'] = await Promise.all(goal.keymetric.map(async(key) => {
            if(key.metrics.length != 0){

            key.metrics = await Promise.all(key.metrics.map(async(singleKeymetric) => {
                singleKeymetric.createdBy = await User.findById(singleKeymetric.createdBy)
                return singleKeymetric
                           
              }))
              return key;
            }

            else {
              return key;
            }
            }))
        }
       
        // append tests to goal
        const tests = await Test.find({ goal: goalId }).populate("assignedTo").populate("createdBy");
        const ideas = await Idea.find({ goal: goalId }).populate("createdBy");
        
        // append learnings to goal
        const learnings = await Learning.find({ goal: goalId }).populate("createdBy");

        res.status(200).json({
          message: "Goal retrieved successfully",
          goal: {
            ...goal,
            tests: tests,
            ideas: ideas,
            learnings: learnings,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  },

  // update metric
  updateMetric: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_goals");

      const goal = await Goal.findById(req.params.id);
      if (!goal) {
        throw createError(404, "Goal not found");
      }
      const { keymetricId, value, date } = req.body;

      const metric = goal.keymetric.find((metric) => {
        return metric._id.toString() === keymetricId;
      });

      if (!metric) {
        throw createError(404, "Metric not found");
      }

      const newMetric = {
        date,
        value,
        updatedAt: new Date(),
        createdBy: req.payload.aud,
      };

      // await newMetric.save();

      metric.metrics.push(newMetric);

      await metric.save();

      console.log("metric", metric)



      const result = await Goal.updateOne(
        { _id: req.params.id },
        {
          $set: {
            keymetric: goal.keymetric,
          },
        }
      );

      console.log("result metric", result);

      goalsKM = Object.assign(metric);

      console.log("goalsKM", goalsKM);

      res.status(200).json({
        message: "Metric updated successfully",
        goal: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // update keymetric status
  updateKeymetricStatus: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_goals");

      const goal = await Goal.findById(req.params.id);
      if (!goal) {
        throw createError(404, "Goal not found");
      }
      const { keymetricId, status } = req.body;

      const keymetric = goal.keymetric.find((metric) => {
        return metric._id.toString() === keymetricId;
      });

      keymetric.status = status;

      const result = await Goal.updateOne(
        { _id: req.params.id },
        {
          $set: {
            keymetric: goal.keymetric,
          },
        }
      );

      res.status(200).json({
        message: "Metric status updated successfully",
        goal: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // add comment
  addComment: async (req, res, next) => {
    try {
      const goal = await Goal.findById(req.params.id);
      if (!goal) {
        throw createError(404, "Goal not found");
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

      goal.comments.push(newComment);

      const result = await Goal.updateOne(
        { _id: req.params.id },
        {
          $set: {
            comments: goal.comments,
          },
        }
      );

      res.status(200).json({
        message: "Comment added successfully",
        goal: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // delete comment
  deleteComment: async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await Goal.updateOne(
        { "comments._id": id },
        {
          $pull: {
            comments: { _id: id },
          },
        }
      );
      res.status(200).json({
        message: "Comment deleted successfully",
        goal: result,
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

      const result = await Goal.updateOne(
        { "comments._id": id },
        {
          $set: {
            "comments.$.comment": comment,
          },
        }
      );
      res.status(200).json({
        message: "Comment edited successfully",
        goal: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // update goal
  // update: async (req, res, next) => {
  //   try {

  //      const goal = await Goal.findById(req.params.id);
  //     // const goal = await Goal.findById(req.params.id);


  //     // console.log("existingUser", existingUser);


  //     if(goal){
  //      await Goal.findByIdAndUpdate(
  //         { _id: req.params.id },
  //         {
  //           name: req.body.name,
  //           description: req.body.description,
  //           members: req.body.members,
  //           keymetric: req.body.keymetric,
  //           confidence: req.body.confidence,
  //         }
  //       );
  //       // console.log("data", data);

  //     }


  //     let user = await Goal.findOne({_id: req.params.id});
  //     console.log("user", user);


  //     console.log("goalsKM",goalsKM);



  //     // await checkPermission(req.payload.aud, "create_goals");
  //     // const goalId = req.params.id;

  //     // const goal = await Goal.findById(req.params.id);

  //     // console.log("req.params.id", req.params.id);


  //     // if (!goal) {
  //     //   throw createError(404, "Goal not found");
  //     // }
  //     // const {
  //     //   name,
  //     //   description,
  //     //   members,
  //     //   projectId,
  //     //   startDate,
  //     //   confidence,
  //     //   keymetric,
  //     // } = req.body;

     

  //     // goal.name = name;
  //     // goal.description = description;
  //     // goal.members = members;
  //     // goal.keymetric = keymetric;
  //     // goal.confidence = confidence;
      

  //     // const goalData = await Goal.findByIdAndUpdate(req.params.id);
  //     // await Goal.findByIdAndUpdate(
  //     //   { _id: req.payload.aud },
  //     //   {
  //     //     name: req.body.name,
  //     //     description: req.body.description,
  //     //     members: req.body.members,
  //     //     keymetric: req.body.keymetric,
  //     //     confidence: req.body.confidence,
  //     //   }
  //     // );

  //     //   const user = await Goal.findOne({_id: req.payload.aud});

  //     //   console.log("user", user);

  //     const result = await Goal.updateOne(
  //       { _id: req.params.id },
  //       {
  //         $set: {
  //           keymetric: goal.keymetric,
  //         },
  //       }
  //     );

  //      console.log("result Goal updated", result);

  //     goal.save();

  //     res.status(200).json({
  //       message: "Goal updated successfully",
  //        goal: goal,
  //     });
  //   } catch (err) {
  //     console.log(err);
  //     next(err);
  //   }
  // },

  update: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_goals");

      const goal = await Goal.findById(req.params.id);
      if (!goal) {
        throw createError(404, "Goal not found");
      }
      const {
        name,
        description,
        members,
        projectId,
        startDate,
        confidence,
        keymetric,
      } = req.body;

      // console.log("req.body", req.body);
      // const updateGoal = await Goal.findByIdAndUpdate({_id : req.params.id}, {
      //   name, description
      // })
      goal.name = name;
      goal.description = description;
      goal.members = members;
      goal.keymetric = keymetric.filter(x => x.name !== "");
      goal.keymetric.metric = goalsKM;
      goal.confidence = confidence;
      goal.save();

      console.log("goal 123", goal); 

      res.status(200).json({
        message: "Goal updated successfully",
        goal: goal,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },



  // delete goal
  delete: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_goals");

      const goal = await Goal.findById(req.params.id);
      if (!goal) {
        throw createError(404, "Goal not found");
      }
      goal.remove();
      res.status(200).json({
        message: "Goal deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },

  // edit metric
  editMetric: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { value } = req.body;
      const user = await User.findById(req.payload.aud);


      const result = await Goal.updateOne(
        { "keymetric.metrics._id": id },
        {
          $set: {
            "keymetric.$[outer].metrics.$[inner].value": value,
            "keymetric.$[outer].metrics.$[inner].updatedAt": new Date(),
            "keymetric.$[outer].metrics.$[inner].createdBy": user,
          },
        },
        {
          arrayFilters: [
            { "outer.metrics._id": id },
            { "inner._id": id }
          ]
        }
      );
      
       console.log("result", result);

       res.status(200).json({
        message: "Metric edited successfully",
        goal: result,
      });
    } catch (err) {
      next(err);
    }

      // const result = await Goal.updateOne(
      //   { "keymetric.metrics._id": id },
      //   {
      //     $set: {
      //       "keymetric.metrics.$[elem].value": value,
      //       "keymetric.metrics.$[elem].updatedAt": new Date(),
      //     },
      //   },
      //   {
      //     arrayFilters: [{ "elem._id": id }],
      //   }
      // );


      // const result = await Goal.findOne(
      //   {
      //     "keymetric.metrics._id": ObjectId(id)
      //   },
      //   {
      //     $set: {
      //       "keymetric.metrics.$.value": value,
      //       "keymetric.metrics.$.updatedAt": new Date()
      //     }
      //   }
      // );
      

      // console.log("result 888", result);

      // const result = await Goal.findById(
      //   { _id: id }
        // {
        //   $set:
        //   {
        //     "keymetric.metrics.$.value": value,
        //     "keymetric.metrics.$.updatedAt": new Date(),
        //   }
        // }
    //  )

  },

  // delete metric
  deleteMetric: async (req, res, next) => {
    try {
      const { id } = req.params;
      console.log("id", id)

      const result = await Goal.updateOne(
        { "keymetric.metrics._id": id },

        { $pull: { 'keymetric.$.metrics': { _id: id } } }       
      );
      res.status(200).json({
        message: "Metric deleted successfully",
        goal: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
