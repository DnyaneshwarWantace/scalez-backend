const User = require("../models/User.model");
const Goal = require("../models/Goal.model");
const Idea = require("../models/Idea.model");
const Project = require("../models/Project.model");
const createError = require("http-errors");
const { checkRole, getUsersFromTags, checkPermission,
} = require("../helpers/role_helper");
const upload = require("../helpers/file_upload");
const Test = require("../models/Test.model");
const Notification = require("../models/Notification.model");
const ProjectModel = require("../models/Project.model");
const Count = require("../models/Count.model");
const { MongoClient, ObjectId } = require('mongodb');

module.exports = {
  // create idea
  
  createIdea: async (req, res, next) => {
    
    try {
      console.log('req.body :>> ', req.body);

      let ideas = req.body;

      

      if(ideas.length >= 1){
        upload(req, res, async (err) => {
          if (err) {
            return next(err);
          }

      //     let mediaImages = ideas.map((x) => x.files);
      // console.log('mediaImages :>> ', mediaImages);

      // console.log('req.files 1:>> ', req.files);
      //     const files = req.files;
      //     const filesPath = [];
      //     files.forEach((file) => {
      //       console.log('file :>> ', file);
      //       filesPath.push(file.path.replace(/\\/g, "/"));
      //     });
          // console.log('files :>> ', files);
          // console.log("filesPath create", filesPath);
          const role = await checkRole(req.payload.aud);
     
          const user = await User.findById(req.payload.aud);
  
          if (!user.quickstart.create_idea) {
            await User.updateOne(
              { _id: req.payload.aud },
              {
                $set: {
                  "quickstart.create_idea": true,
                },
              }
            );
          }
  
          const idea = new Idea({
            name: req.body.name,
            description: req.body.description,
            goal: req.body.goal,
            owner: role.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
            createdBy: req.payload.aud,
            keymetric: req.body.keymetric,
            lever: req.body.lever,
            media: [],
            impact: req.body.impact,
            confidence: req.body.confidence,
            ease: req.body.ease,
            score: req.body.score,
            project: req.body.projectId,
          });

          const newIdeas = ideas.map((ideaData) =>{
            return {
              name: ideaData.name,
              description: ideaData.description,
              goal: ideaData.goal,
              owner: role.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
              createdBy: req.payload.aud,
              keymetric: ideaData.keymetric,
              lever: ideaData.lever,
              media: [],
              impact: ideaData.impact,
              confidence: ideaData.confidence,
              ease: ideaData.ease,
              score: ideaData.score,
              project: ideaData.project,
            }
          })
          
          // Save the ideas to database
          const createdIdeas = await Idea.create(newIdeas);
          
          // user.ideaCount =  user.ideaCount+ 1
          // await user.save()
          // console.log("user",user)
        let count =  await Count.updateOne(
          { user: req.payload.aud, project: newIdeas[0].project },
            
             { $inc: { 'countIdea': 1 } , 
            }
            ,
          { upsert: true, setDefaultsOnInsert: true }
          );
          // console.log("count --",count)

          await User.updateOne(
            { _id: req.payload.aud },
            {
              $set: {
                "ideaCount": user.ideaCount+1,
              },
            }
          );

          const project = await Project.findById(newIdeas[0].project)
          await Project.updateOne({ _id: project._id},{
            $set: {
              "ideaCount": project.ideaCount + 1,
            },
          })
          
          // console.log("project --",project)

          res.status(201).json({
            message: "Idea created successfully",
            idea: createdIdeas,
          });
        });
      }
      else{
      upload(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        console.log('req.files :>> ', req.files);
        const files = req.files;
        const filesPath = [];
        if (files && files.length > 0) {
          files.forEach((file) => {
            console.log('file 2:>> ', file);
            filesPath.push(file.path.replace(/\\/g, "/"));
          });
        }

        console.log('files 2 :>> ', files);
        console.log("filesPath create", filesPath);
        const role = await checkRole(req.payload.aud);
   
        const user = await User.findById(req.payload.aud);

        if (!user.quickstart.create_idea) {
          await User.updateOne(
            { _id: req.payload.aud },
            {
              $set: {
                "quickstart.create_idea": true,
              },
            }
          );
        }

        const idea = new Idea({
          name: req.body.name,
          description: req.body.description,
          goal: req.body.goal,
          owner: role.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
          createdBy: req.payload.aud,
          keymetric: req.body.keymetric,
          lever: req.body.lever,
          media: filesPath,
          impact: req.body.impact,
          confidence: req.body.confidence,
          ease: req.body.ease,
          score: req.body.score,
          project: req.body.projectId,
        });
        const result = await idea.save();



        // user.ideaCount =  user.ideaCount+ 1
        // await user.save()
        // console.log("user",user)
      let count =  await Count.updateOne(
        { user: req.payload.aud, project: req.body.projectId },
          
           { $inc: { 'countIdea': 1 } , 
          }
          ,
        { upsert: true, setDefaultsOnInsert: true }
        );
        // console.log("count --",count)

        await User.updateOne(
          { _id: req.payload.aud },
          {
            $set: {
              "ideaCount": user.ideaCount+1,
            },
          }
        );

        const project = await Project.findById(req.body.projectId)
        await Project.updateOne({ _id: project._id},{
          $set: {
            "ideaCount": project.ideaCount + 1,
          },
        })
        
        // console.log("project --",project)

        res.status(201).json({
          message: "Idea created successfully",
          idea: result,
        });
      });
    }
    } catch (err) {
      next(err);
    }
  },

  createMultipleIdeas: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      await checkPermission(req.payload.aud, "create_ideas");

      let ideas = req.body;
      console.log('ideas 111 :>> ', ideas);

        let createdIdeas = [];

        const newIdeas = ideas.map((idea) =>{
          return {
            name: idea.name,
            description: idea.description,
            goal: idea.goal,
            owner: user.role?.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
            createdBy: req.payload.aud,
            keymetric: idea.keymetric,
            lever: idea.lever,
            media: idea.media,
            impact: idea.impact,
            confidence: idea.confidence,
            ease: idea.ease,
            score: idea.score,
            project: idea.projectId,
          }
        })
    
          const created = await Idea.create(newIdeas);
          createdIdeas.push(...created);
        // }

        res.status(201).json({
          message: "Ideas created successfully",
          ideas: createdIdeas,
        });
       
      
     
  }catch (err) {
      next(err);
    }
  },

  // get all ideas
  getAllIdeas: async (req, res, next) => {
    try {
      console.log('req.body getAllIdeas:>> ', req.body);
      const ideas = await Idea.find({
        project: req.params.projectId,
      })
        .populate("createdBy", "-password")
        .populate("goal", "name");
  
      
      res.status(200).json({
        message: "All ideas fetched successfully",
        ideas,
      });
    } catch (err) {
      next(err);
    }
  },


  getMultipleIdeas: async (req, res, next) => {
    try {

      const goalIds = req.body.projectId;
    const objectIds = goalIds.map((g) => g.goal); // Access the 'goal' property instead of '_id'
    const ideas = await Idea.find({ goal: { $in: objectIds } }) // Match the 'goal' field instead of '_id'
      .populate("createdBy", "-password")
      .populate("goal", "name");

    res.status(200).json({
      message: "Multiple ideas fetched successfully",
      ideas,
    });
    } catch (err) {
      next(err);
    }
  },
  // nominate idea
  nominateIdea: async (req, res, next) => {
    try {
      const idea = await Idea.findById(req.params.id).populate("createdBy");
      if (!idea) {
        return next(createError(404, "Idea not found"));
      }
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      if (idea.nominations.includes(user._id)) {
        return next(createError(400, "You have already nominated this idea"));
      }

      idea.nominations.push(user._id);
      const result = await idea.save();

      let temp = await User.findById(idea.createdBy._id)
      await User.updateOne(
        { _id: idea.createdBy._id },
        {
          $set: {
            "ideaNominate": temp.ideaNominate + 1,
          },
        }
      );

      let count = await Count.updateOne(
        { user: idea.createdBy._id, project: idea.project._id },

        {
          $inc: { 'countNominate': 1 },
        }
        ,
        { upsert: true, setDefaultsOnInsert: true }
      );

      console.log("count --",count)


      // temp.ideaNominate = temp.ideaNominate + 1
      // await temp.save()
      res.status(200).json({
        message: "Idea nominated successfully",
        idea: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // unnominate idea
  unnominateIdea: async (req, res, next) => {
    try {
      const idea = await Idea.findById(req.params.id).populate("createdBy");
      if (!idea) {
        return next(createError(404, "Idea not found"));
      }
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      if (!idea.nominations.includes(user._id)) {
        return next(createError(400, "You have not nominated this idea"));
      }

      idea.nominations.pull(user._id);
      const result = await idea.save();
      let temp = await User.findById(idea.createdBy._id)
      await User.updateOne(
        { _id: idea.createdBy._id },
        {
          $set: {
            "ideaNominate": temp.ideaNominate - 1,
          },
        }
      );

      let count = await Count.updateOne(
        { user: idea.createdBy._id, project: idea.project._id },

        {
          $inc: { 'countNominate': -1 },
        }
        ,
        { upsert: true, setDefaultsOnInsert: true }
      );

      res.status(200).json({
        message: "Idea unnominated successfully",
        idea: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // test idea
  testIdea: async (req, res, next) => {
    try {
      const idea = await Idea.findById(req.params.id);
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      // console.log("idea - -" , idea)
      if (!idea) {
        return next(createError(404, "Idea not found"));
      }

      console.log("req.payload.aud", req.payload.aud);
      console.log("idea.createdBy.toString()", idea.createdBy.toString());
      // if (idea.createdBy.toString() !== req.payload.aud || user.role !== "owner" || user.role !== "admin")
      // if (user.role === "viewer") {
      //   return next(createError(403, "You are not allowed to test this idea"));
      // }

      if (!user.quickstart.create_test) {
        await User.updateOne(
          { _id: req.payload.aud },
          {
            $set: {
              "quickstart.create_test": true,
            },
          }
        );
      }

      const newTest = new Test({
        name: idea.name,
        project: idea.project,
        description: idea.description,
        createdBy: idea.createdBy,
        owner: idea.owner,
        goal: idea.goal,
        keymetric: idea.keymetric,
        lever: idea.lever,
        media: idea.media,
        impact: idea.impact,
        confidence: idea.confidence,
        ease: idea.ease,
        score: idea.score,
        status: "Up Next",
        assignedTo: req.body.assignedTo,
        dueDate: req.body.dueDate,
        tasks: req.body.tasks,
        nomination:idea.nominations
      });

      const result = await newTest.save();
console.log("result", result);
      // await User.updateOne(
      //   { _id: req.payload.aud },
      //   {
      //     $set: {
      //       "ideaTest": user.ideaTest + 1,
      //     },
      //   }
      // );

      let count = await Count.updateOne(
        { user: idea.createdBy._id, project: idea.project._id },

        {
          $inc: { 'countTest': 1 },
        }
        ,
        { upsert: true, setDefaultsOnInsert: true }
      );

      console.log("count ---",count)

      const project = await Project.findById(idea.project._id)
      await Project.updateOne({ _id: project._id}, {
        $set: {
          "ideaTest": project.ideaTest + 1,
        },
      })


      const notification = new Notification({
        audience: newTest.assignedTo,
        message: `${user.firstName} has assigned you a test for ${idea.name}`,
        project: idea.project,
        type: "Assigned",
        user: req.payload.aud,
      });
      await notification.save();
      const notificationData = await Notification.findOne({
        _id: notification._id,
      }).populate("user", "-password");

      io.emit("notification", notificationData);

      // delete idea
      await Idea.findByIdAndDelete(req.params.id);

      res.status(200).json({
        message: "Idea assigned as test",
        test: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // read single idea
  readIdea: async (req, res, next) => {
    try {
      const idea = await Idea.findById(req.params.id)
        .populate("createdBy", "-password")
        .populate("goal", "name")
        .populate("keymetric.metrics.createdBy", "-password")
        .populate("comments.createdBy", "-password");

      const goal = await Goal.findById(idea.goal._id);
      // find keymetric
      const keymetric = goal.keymetric.find((keymetric) => keymetric._id.toString() === idea.keymetric);

      idea.keymetric = keymetric;

      if (!idea) {
        return next(createError(404, "Idea not found"));
      }
      res.status(200).json({
        message: "Idea fetched successfully",
        idea,
      });
    } catch (err) {
      next(err);
    }
  },

  // add comment to idea
  addComment: async (req, res, next) => {
    try {
      const idea = await Idea.findById(req.params.id);
      if (!idea) {
        return next(createError(404, "Idea not found"));
      }
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");

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
          project: idea.project,
          type: "Assigned",
          user: req.payload.aud,
        });

        await notification.save();

        const notificationData = await Notification.findOne({
          _id: notification._id,
        }).populate("user", "-password");

        io.emit("notification", notificationData);
      }

      idea.comments.push(newComment);

      const result = await Idea.updateOne(
        { _id: req.params.id },
        {
          $set: {
            comments: idea.comments,
          },
        }
      );

      res.status(200).json({
        message: "Comment added successfully",
        idea: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // edit comment to idea
  editComment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;

      const result = await Idea.updateOne(
        { "comments._id": id },
        {
          $set: {
            "comments.$.comment": comment,
          },
        }
      );
      res.status(200).json({
        message: "Comment edited successfully",
        idea: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // delete comment to idea
  deleteComment: async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await Idea.updateOne(
        { "comments._id": id },
        {
          $pull: {
            comments: { _id: id },
          },
        }
      );
      res.status(200).json({
        message: "Comment deleted successfully",
        idea: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // update
  updateIdea: async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return next(err);
        }
        const { id } = req.params;
        const { name, description, impact, confidence, ease, goal, lever, projectId, score, deletedMedia } = req.body;
        const idea = await Idea.findById(id);
        const user = await User.findById(req.payload.aud).populate("owner").populate("role");

        if (!idea) {
          return next(createError(404, "Idea not found"));
        }
        // if (user.role === "viewer") {
        //   return next(createError(403, "You are not allowed to update this idea"));
        // }
        const files = req.files;
        const filesPath = [...idea.media].filter((mediaUrl) => deletedMedia.includes(mediaUrl) === false);
        files.forEach((file) => {
          filesPath.push(file.path.replace(/\\/g, "/"));
        });
        idea.name = name;
        idea.description = description;
        idea.goal = goal;
        idea.impact = impact;
        idea.confidence = confidence;
        idea.ease = ease;
        idea.media = filesPath;
        idea.lever = lever;
        idea.score = score;
        const result = await idea.save();
        res.status(200).json({
          message: "Idea updated successfully",
          idea: result,
        });
      });
    } catch (err) {
      next(err);
    }
  },

  // delete idea
  deleteIdea: async (req, res, next) => {
    try {
      const role = await checkRole(req.payload.aud);
      console.log("roleee", role);
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      // console.log("user =====>", user);

      // if (user.role.name.toLowerCase() !== "owner") {
      //   if (user.role.name.toLowerCase() !== "admin") {
      //     return next(createError(403, "You are not allowed to delete this idea"));
      //   }
      // }
      const idea = await Idea.findById(req.params.id).populate("createdBy");
      console.log("idea ---",idea)
      if (!idea) {
        return next(createError(404, "Idea not found"));
      }

      const ideaCount = Math.max(user.ideaCount - 1, 0);
      const ideaNominate = Math.max(user.ideaNominate - idea.nominations.length, 0);

// Alternative for update
    //   $inc: {
    //     ideaCount: -1,
    //       ideaNominate: -1 * idea.nominations.length,
    // },

      await User.updateMany(
        { _id: idea.createdBy._id },
        {
          $set: {
            ideaCount,
            ideaNominate,
          },
        }
      );

      let count = await Count.updateOne(
        { user: idea.createdBy._id, project: idea.project._id },

        {
          $inc: { 'countIdea': -1,},
        }
        ,
        { upsert: true, setDefaultsOnInsert: true }
      );


      let countNominate = await Count.updateOne(
        { user: idea.createdBy._id, project: idea.project._id },

        {
          $inc: { 'countNominate': -1 * idea.nominations.length,},
        }
        ,
        { upsert: true, setDefaultsOnInsert: true }
      );

      const project = await Project.findById(idea.project._id)
      await Project.updateOne({ _id: project._id }, {
        $set: {
          "ideaCount": project.ideaCount - 1,
        },
      })

      // console.log("project --", idea.nominations.length )
      // console.log("project -",project)

      // idea.createdBy.ideaCount = idea.createdBy.ideaCount - 1
      // await idea.createdBy.save()
      await Idea.findByIdAndDelete(req.params.id);
      
      res.status(200).json({
        message: "Idea deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },

  // read all goals based ideas
  readAllGoalsBasedIdeas: async (req, res, next) => {
    try {
      var goals = await Goal.find({
        project: req.params.projectId,
      });

      // append ideas to goals
      const goalsWithIdeas = await Promise.all(
        goals.map(async (goal) => {
          const ideas = await Idea.find({
            goal: goal._id,
          }).populate("createdBy", "-password");
          return { ...goal._doc, ideas };
        })
      );

      res.status(200).json({
        message: "Ideas fetched successfully",
        goals: goalsWithIdeas,
      });
    } catch (err) {
      next(err);
    }
  },
};
