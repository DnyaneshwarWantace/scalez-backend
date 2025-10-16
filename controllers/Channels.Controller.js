const User = require("../models/User.model");
const Channels = require("../models/Channels.model");
const createError = require("http-errors");
const { checkRole, checkPermission } = require("../helpers/role_helper");
const Thread = require("../models/Threads.model");


module.exports = {

 createChannel : async(req,res, next) => {

    try {
        const user = await User.findById(req.payload.aud);
        //   await checkPermission(req.payload.aud, "create_channel");

        if (!req.body.name) {
            throw createError(400, "name is required");
          }
        console.log("req.body.name", req.body.name);
  
        const channel = new Channels({
          name: req.body.name,
          description: req.body.description,
          threads: req.body.threads,
        //   owner: user.type === "owner" ? req.payload.aud : user.owner,
        //   team: req.body.team,
          createdBy: req.payload.aud,
        });

        //channel.comments.push(newComment);


        await channel.save();
        res.status(201).json({
            message: "Channel created successfully",
            channel: {
              id: channel._id,
              name: channel.name,
              description: channel.description,
              threads: channel.threads,
            //   owner: project.owner,
            //   team: project.team,
              createdBy: channel.createdBy,
            },
          });
        } catch (err) {
          next(err);
          console.log(err);
        }
    // if(!req.body.name){
    //     res.status(400)
    //     throw new Error('Please add name field')
    // }
    // res.status(200).json({message: 'Create channels'})
},

 // get all channels
 getAllChannels: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner");
      console.log("user", user);
      if (!user) {
        throw createError(401, "Invalid token");
      }

      let team = await User.find({owner : user.role === "owner" ? user._id : user.owner})
      if(user.role !== "owner"){
        team = [...team, user.owner]
      }
      else{
        team = [...team, user._id]
      }
      const channel = await Channels.find({createdBy: {$in : [...team]}})
        .populate("name description").populate("threads");

        // console.log("channel", channel);

      res.status(200).json(channel);
    } catch (err) {
      next(err);
    }
  },


  getChannel: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud);
      if (!user) {
        throw createError(401, "Invalid token");
      }

      const channel = await Channels.findById(req.params.id)
      .populate("name description").populate({ 
        path: 'threads',
        populate: {
          path: 'comments',
          populate: {
            path: 'replies',
            populate: {
              path: 'createdBy'
            }
          }
        } })

        await channel.save();

        // console.log("channel", channel);

      res.status(200).json(channel);
    } catch (err) {
      next(err);
    }
  },

 // update channel
 updateChannel: async (req, res, next) => {
    try {
    //   await checkPermission(req.payload.aud, "create_project");
        console.log("req.params.id", req.params.id)
      const channel = await Channels.findById(req.params.id);
      if (!channel) {
        throw createError(404, "Channel not found");
      }

      await Channels.updateOne(
        { _id: req.params.id },
        {
          $set: {
            name: req.body.name,
            description: req.body.description,
          },
        }
      );

      const newChannel = await Channels.findById(req.params.id);

      res.status(200).json({
        message: "Channel updated successfully",
        channel: {
            id: newChannel._id,
            name: newChannel.name,
            description: newChannel.description,
          //   owner: project.owner,
          //   team: project.team,
            createdBy: newChannel.createdBy,
          },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },


   // channel delete
   deleteChannel: async (req, res, next) => {
    try {
    //   await checkPermission(req.payload.aud, "delete_project");

      const channel = await Channels.findById(req.params.id);
      if (!channel) {
        throw createError(404, "Channel not found");
      }
      await channel.remove();
      res.status(200).json({
        message: "Channel deleted successfully",
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

}

