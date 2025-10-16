const User = require("../models/User.model");
const Thread = require("../models/Threads.model");
const createError = require("http-errors");
const { checkRole, checkPermission, getUsersFromTags } = require("../helpers/role_helper");
const Notification = require("../models/Notification.model");
const Channel = require("../models/Channels.model");

module.exports = {
 createThread : async(req,res, next) => {
    try {
        const user = await User.findById(req.payload.aud);
        const channel = await Channel.findById(req.params.id);
        // console.log("channel createThread", channel); 

        if (!req.body.name) {
            throw createError(400, "name is required");
          }  
        const thread = new Thread({
          name: req.body.name,
          description: req.body.description,
          // comments: req.body.comments,
           createdBy: req.payload.aud,
        });

        await thread.save();

        channel.threads.push(thread);

        console.log('channel 1:>> ', channel);

        await channel.save();

        // console.log("channel", channel);
        
        res.status(201).json({
            message: "Thread created successfully",
            thread: {
              id: thread._id,
              name: thread.name,
              description: thread.description,
              comments: thread.comments,
              createdBy: thread.createdBy,
            },
          });
        } catch (err) {
          next(err);
          console.log(err);
        }
},

 // get all Threads
 getAllThreads: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud);
      if (!user) {
        throw createError(401, "Invalid token");
      }
      const thread = await Thread.find()
        .populate("name description")

      res.status(200).json(thread);
    } catch (err) {
      next(err);
    }
  },

  
// get single thread 
  getThread: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud);
      if (!user) {
        throw createError(401, "Invalid token");
      }
      const thread = await Thread.findById(req.params.id).populate("name description")
      .populate("comments.createdBy", "-password").populate({ 
          path: 'comments',
          populate: {
            path: 'replies',
            populate: {
              path: 'createdBy'
            }
          }
        }).populate({path: "readBy", populate: "user"}).populate({path: "likedBy", populate: "user"}).populate("createdBy")

        console.log("thread", thread);
      res.status(200).json(thread);

    } catch (err) {
      next(err);
    }
  },

 // update thread
 updateThread: async (req, res, next) => {
    try {
      const thread = await Thread.findById(req.params.id);
      if (!thread) {
        throw createError(404, "thread not found");
      }

      await Thread.updateOne(
        { _id: req.params.id },
        {
          $set: {
            name: req.body.name,
            description: req.body.description,
          },
        }
      );
      const newThread = await Thread.findById(req.params.id);
      res.status(200).json({
        message: "Thread updated successfully",
        thread: {
            id: newThread._id,
            name: newThread.name,
            description: newThread.description,
            createdBy: newThread.createdBy,
          },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },


   // delete Thread 
   deleteThread: async (req, res, next) => {
    try {
      const thread = await Thread.findById(req.params.id);
      if (!thread) {
        throw createError(404, "Thread not found");
      }
      await thread.remove();
      res.status(200).json({
        message: "Thread deleted successfully",
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

    // add comment
    addComment: async (req, res, next) => {
      try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) {
          throw createError(404, "Thread not found");
        }
        
        const user = await User.findById(req.payload.aud);

        // let temp = [...thread.readBy];

        // temp.slice(thread.readBy.indexOf(user._id), 1);

        thread.readBy = [{user, timestamps: new Date()}];

        await thread.save();
  
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
            // project: goal.project,
            type: "Assigned",
            user: req.payload.aud,
          });
  
          await notification.save();
  
          const notificationData = await Notification.findOne({
            _id: notification._id,
          }).populate("user", "-password");
  
          io.emit("notification", notificationData);
        }
  
        thread.comments.push(newComment);
  
        const result = await Thread.updateOne(
          { _id: req.params.id },
          {
            $set: {
              comments: thread.comments,
            },
          }
        );
  
        res.status(200).json({
          message: "Comment added successfully",
          comment: result,
        });
      } catch (err) {
        next(err);
      }
    },
  
    // delete comment
    deleteComment: async (req, res, next) => {
      try {
        const { id } = req.params;
  
        const result = await Thread.updateOne(
          { "comments._id": id },
          {
            $pull: {
              comments: { _id: id },
            },
          }
        );
        res.status(200).json({
          message: "Comment deleted successfully",
          thread: result,
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
  
        const result = await Thread.updateOne(
          { "comments._id": id },
          {
            $set: {
              "comments.$.comment": comment,
            },
          }
        );
        res.status(200).json({
          message: "Comment edited successfully",
          thread: result,
        });
      } catch (err) {
        next(err);
      }
    },

    // get single thread 
  getComment: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud);
      if (!user) {
        throw createError(401, "Invalid token");
      }
      const thread = await Thread.findById(req.params.id)
        .populate("name description")
        .populate("comments.createdBy", "-password")

      res.status(200).json(thread);
    } catch (err) {
      next(err);
    }
  },

  getAllComments: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud);
      if (!user) {
        throw createError(401, "Invalid token");
      }
      const thread = await Thread.find()
        .populate("name description")

      res.status(200).json(thread);
    } catch (err) {
      next(err);
    }
  },

  likeThread : async(req,res, next) => {
    try {
        const user = await User.findById(req.payload.aud);
        const thread = await Thread.findById(req.params.id);
         let liked = req.body.liked;

         console.log("req.body.liked", req.body.liked)

        let temp = [...thread.likedBy]
        console.log('temp :>> ', temp);
        const index = thread.likedBy.filter((obj) => obj.user.toString() === user._id.toString()); // Find the index of the object
        console.log("index", index);

        if(liked && thread.likedBy.map(x => x.user.toString()).includes(user._id.toString()) === false){
          thread.likedBy.push({user, timestamps: new Date()});
        }
        console.log("thread.likedBy", thread.likedBy);

         if(!liked && thread.likedBy.map(x => x.user.toString()).includes(user._id.toString())){
          console.log("thread.likedBy", thread.likedBy);

          thread.likedBy.splice(index, 1); // Remove the object at the found index
        }

        thread.count = thread.likedBy.length;
        thread.liked = req.body.liked;
        await thread.save();

        console.log("thread 111", thread);
        
        res.status(201).json({
            message: "Thread liked successfully",
            thread: {
              id: thread._id,
              name: thread.name,
              description: thread.description,
              comments: thread.comments,
              createdBy: thread.createdBy,
              user: thread.user,
              liked: thread.liked,
              likedBy: thread.likedBy,
              count: thread.count
            }
            
          });
        } catch (err) {
          next(err);
          console.log(err);
        }
},

getRecentlyLikedUsersData: async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.aud).select("firstName lastName _id");
    const thread = await Thread.findById(req.params.id).populate({path: "likedBy", populate: "user"});

    if (!user) {
      throw createError(401, "Invalid token");
    }
    res.status(200).json(thread.likedBy);
  } catch (err) {
    next(err);
  }
},

// getUnreadThreads: async (req, res, next) => {
//   try {
//     const user = await User.findById(req.payload.aud).populate("name _id");
//     if (!user) {
//       throw createError(401, "Invalid token");
//     }
//     const thread = await Thread.find()
//       .populate("name")

//     res.status(200).json(thread);
//   } catch (err) {
//     next(err);
//   }
// },

postReadThreads : async(req,res, next) => {
  try {
      const user = await User.findById(req.payload.aud);
      const thread = await Thread.findById(req.params.id);

      // if (!req.body.name) {
      //     throw createError(400, "name is required");
      //   }  
      // const thread = new Thread({
      //   name: req.body.name,
      //   description: req.body.description,
      //   comments: req.body.comments,
      //   createdBy: req.payload.aud,
      //   user: user,
      // });

      // await thread.save();

      // channel.threads.push(thread);
       let read = req.body.read;

    if (read === true && thread.readBy.map(x => x.user.toString()).includes(user._id.toString()) === false) {
      thread.readBy.push({ user, timestamps: new Date() });
    }

      await thread.save();
      
      res.status(201).json({
          message: "Thread read successfully",
          thread: {
            id: thread._id,
            name: thread.name,
            description: thread.description,
            comments: thread.comments,
            createdBy: thread.createdBy,
            user: thread.user,
            readBy: thread.readBy,
            read: read
          },
        });
      } catch (err) {
        next(err);
        console.log(err);
      }
},

  // add relpy
  addReply: async (req, res, next) => {
    try {
      const thread = await Thread.findById(req.params.threadid).populate("name description")
      .populate("comments.createdBy", "-password").populate({ 
        path: 'comments',
        populate: {
          path: 'replies',
          populate: {
            path: 'createdBy'
          }
        }
      });
      
      if (!thread) {
        throw createError(404, "Thread not found");
      }
      const user = await User.findById(req.payload.aud);
      thread.readBy = [{ user, timestamps: new Date() }];

      const { reply } = req.body;

      // Create a new reply
      const newReply = {
        reply,
        createdBy: user._id,
        createdAt: new Date(),
      };

      // console.log("newReply", newReply)

      // Find the comment you want to push the new reply to
      const comment = thread.comments.find((c) => c._id.toString() === req.params.id);
      // console.log("comment", comment)

      comment.replies.push(newReply);

      await thread.save();

      //  const result = await Thread.updateOne(
      //    { _id: req.params.id },
      //    {
      //      $set: {
      //        comments: comment,
      //      },
      //    }
      //  );

      res.status(200).json({
        message: "Comment added successfully",
        reply: thread,
      });
    } catch (err) {
      next(err);
    }
  },

  getReply: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud);
      if (!user) {
        throw createError(401, "Invalid token");
      }
      const thread = await Thread.findById(req.params.threadid).populate("name description").populate("comments.createdBy", "-password").populate({ 
        path: 'comments',
        populate: {
          path: 'replies',
          populate: {
            path: 'createdBy'
          }
        }
      })        
        console.log("thread getReply", thread);
      res.status(200).json(thread);
      // console.log("res getReply", res);
    } catch (err) {
      next(err);
    }
  },

    // edit reply
  editReply: async (req, res, next) => {
    try {
      const { threadid, commentid, replyid } = req.params;
   
      const { reply } = req.body;

      console.log("id", commentid);

      const result = await Thread.findOneAndUpdate(
        { "comments.replies._id": replyid }, // Update the query to match replies by their _id
        {
          $set: {
            "comments.$[comment].replies.$[reply].reply": reply,
          },
        },
        {
          arrayFilters: [
            // { "comment.replies": { $elemMatch: { _id: commentid } } },
            { "reply._id": replyid },
            { "comment._id": commentid },
          ],
        }
      );

      console.log("result", result);
      res.status(200).json({
        message: "Reply edited successfully",
        thread: result,
      });
    } catch (err) {
      next(err);
    }
  },

      // delete reply
      deleteReply: async (req, res, next) => {
        try {
          const { id } = req.params;
    
          const result = await Thread.updateOne(
            { "comments.replies._id": id }, // Update the query to match replies by their _id
            {
              $pull: {
                "comments.$.replies": { _id: id },
              },
            }
          );
          res.status(200).json({
            message: "Reply deleted successfully",
            thread: result,
          });
        } catch (err) {
          next(err);
        }
      },

}

