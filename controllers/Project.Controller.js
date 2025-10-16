const User = require("../models/User.model");
const Project = require("../models/Project.model");
const createError = require("http-errors");
const { checkRole, checkPermission } = require("../helpers/role_helper");
const Goal = require("../models/Goal.model");
const Notification = require("../models/Notification.model");
const { MongoClient, ObjectId } = require('mongodb');
const io = require("../app");

module.exports = {
  // create project
  create: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      await checkPermission(req.payload.aud, "create_project");
    
      const project = new Project({
        name: req.body.name,
        description: req.body.description,
        owner: user.role.name.toLowerCase() === "owner" ? req.payload.aud : user.owner, 
        team: req.body.team,
        createdBy: req.payload.aud,
      });
      await project.save();

      const notification = new Notification({
        audience: project.owner,
        project: project._id,
        message: `${user.firstName} has created a new project ${project.name}`,
        type: "Created",
        user: req.payload.aud,
      });
      await notification.save();

      const notificationData = await Notification.findOne({
        _id: notification._id,
      }).populate("user", "-password");

      io.emit("notification", notificationData);

      res.status(201).json({
        message: "Project created successfully",
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          owner: project.owner,
          team: project.team,
          createdBy: project.createdBy,
        },
      });

    } catch (err) {
      next(err);
      console.log(err);
    }
  },  

  //create multiple projects 
  createMultipleProjects: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      await checkPermission(req.payload.aud, "create_project");

      const projects = req.body;
    // const projectIds = req.body.projectIds; // Assuming there is an array of project IDs in the request body

    const createdProjects = [];

    // for (const id of projects) {
    //   const newProjects = projects.map((proj) => {
    //     return {
    //       id: id,
    //       name: proj.name,
    //       description: proj.description,
    //       owner: user.role.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
    //       team: proj.team,
    //       createdBy: req.payload.aud,
    //       dataType: proj.dataType
    //     };
    //   });
    const newProjects = projects.map((proj) => {
      return {
        name: proj.name,
        description: proj.description,
        owner: user.role.name.toLowerCase() === "owner" ? req.payload.aud : user.owner,
        team: proj.selectedTeamMembers || proj.team || [],
        createdBy: req.payload.aud,
        dataType: proj.dataType
      };
    });

      const created = await Project.create(newProjects);
      createdProjects.push(...created);
    // }
               
      // Function to create a project based on ID
    //   const notification = new Notification({
    //   audience: createdProjects[0].owner,
    //   project: createdProjects[0]._id,
    //   message: `${user.firstName} has created a new project ${createdProjects.map((x) => x.name)}`,
    //   type: "Created",
    //   user: req.payload.aud,
    // });

    // Create notifications for each created project
    const notifications = createdProjects.map((project) => {
      return {
        audience: project.owner,
        project: project._id,
        message: `${user.firstName} has created a new project ${project.name}`,
        type: "Created",
        user: req.payload.aud,
      };
    });

    // Create notifications in database
    const createdNotifications = await Notification.create(notifications);
    
    // Emit notifications
    createdNotifications.forEach(notification => {
      io.emit("notification", notification);
    });

    res.status(201).json({
      message: "Projects created successfully",
      projects: createdProjects
    });
     
    } catch (err) {
      next(err);
      console.log(err);
    }
  },  
  // get all projects
  getAll: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");
      console.log("user --", user)

      const status = req.query.status || "All";
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search || "";

      var query = {};
      if (status !== "All") {
        query.status = status;
      }
      if (search !== "") {
        query.name = { $regex: search, $options: "i" };
      }
      if (user.role?.name.toLowerCase() === "owner") {
        query.owner = req.payload.aud;
        const projects = await Project.find({...query })
          .populate("team", "firstName lastName email avatar")
          .populate("createdBy", "firstName lastName email avatar");
        // console.log("user",user)
        // console.log("project",projects)
        // console.log("projects ---", projects)

        // calculate number of gaols per project
        const projectsWithGoals = await Promise.all(
          projects.map(async (project) => {
            const goals = await Goal.find({ project: project._id });
            return { ...project._doc, goals: goals.length };
          })
        );

        res.status(200).json({
          message: "Projects retrieved successfully",
          projects: projectsWithGoals,
        });
      }
      if (user?.role?.name.toLowerCase() !== "owner") {
        query.owner = user?.owner;
        const projects = await Project.find({ ...query, $or: [{ team: { $in: user } }, { createdBy: user }] })
          .populate("team", "firstName lastName email avatar")
          .populate("createdBy", "firstName lastName email avatar");
        console.log("projects --", projects)
        // calculate number of gaols per project
        const projectsWithGoals = await Promise.all(
          projects.map(async (project) => {
            const goals = await Goal.find({ project: project._id });
            return { ...project._doc, goals: goals.length };
          })
        );

        res.status(200).json({
          message: "Projects retrieved successfully",
          projects: projectsWithGoals,
        });
      }
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // update status
  updateStatus: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_project");

      const project = await Project.findById(req.params.id);
      if (!project) {
        throw createError(404, "Project not found");
      }
      project.status = req.body.status;
      await project.save();
      res.status(200).json({
        message: "Project status updated successfully",
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          owner: project.owner,
          team: project.team,
          status: project.status,
        },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // project delete
  delete: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "delete_project");

      console.log('req.body :>> ', req.body);

      const project = await Project.findById(req.params.id);
      if (!project) {
        throw createError(404, "Project not found");
      }
      await project.remove();
      res.status(200).json({
        message: "Project deleted successfully",
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // project archive
  archive: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "delete_project");
      console.log("userrr", req.payload.aud);

      const project = await Project.findById(req.params.id);
      if (!project) {
        throw createError(404, "Project not found");
      }
      project.isArchived = true;
      await project.save();
      res.status(200).json({
        message: "Project archived successfully",
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          owner: project.owner,
          team: project.team,
          status: project.status,
          isArchived: project.isArchived,
        },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // unarchive project
  unarchive: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "delete_project");

      const project = await Project.findById(req.params.id);
      if (!project) {
        throw createError(404, "Project not found");
      }
      project.isArchived = false;
      await project.save();
      res.status(200).json({
        message: "Project unarchived successfully",
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          owner: project.owner,
          team: project.team,
          status: project.status,
          isArchived: project.isArchived,
        },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // read archived projects
  getArchived: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");

      await checkPermission(req.payload.aud, "delete_project");

      const search = req.query.search || "";
      var query = {};
      if (search !== "") {
        query.name = { $regex: search, $options: "i" };
        query.isArchived = true;
      } else {
        query.isArchived = true;
      }

      if (user.role.name.toLowerCase() !== "owner") {
        query.owner = user.owner;
        const projects = await Project.find({ ...query, $or: [{ team: { $in: user } }, { createdBy: user }] })
          .populate("team", "firstName lastName email")
          .populate("owner", "firstName lastName email");
        res.status(200).json({
          message: "Projects retrieved successfully",
          projects: projects,
        });
      }
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // update project
  update: async (req, res, next) => {
    try {
      await checkPermission(req.payload.aud, "create_project");

      const project = await Project.findById(req.params.id);
      if (!project) {
        throw createError(404, "Project not found");
      }

      await Project.updateOne(
        { _id: req.params.id },
        {
          $set: {
            name: req.body.name,
            description: req.body.description,
            team: req.body.team,
          },
        }
      );

      const newProject = await Project.findById(req.params.id);

      res.status(200).json({
        message: "Project updated successfully",
        project: {
          id: newProject._id,
          name: newProject.name,
          description: newProject.description,
          owner: newProject.owner,
          team: newProject.team,
          status: newProject.status,
        },
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // read project users
  getUsers: async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate("team", "-password")
        .populate("team.role")
        .populate("owner", "-password");
      if (!project) {
        throw createError(404, "Project not found");
      }

      var users = [];
      users.push(project.owner);
      users = users.concat(project.team);

      res.status(200).json({
        message: "Project users retrieved successfully",
        users,
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // get collaborators
  getCollaborators: async (req, res, next) => {
    try {
      const collaborators = await User.find({
        project: req.params.id,
        type: "collaborator",
      }).populate("role");

      res.status(200).json({
        message: "Collaborators retrieved successfully",
        collaborators: collaborators,
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  // user delete
  deleteUserId: async (req, res, next) => {
    try {
      // await checkPermission(req.payload.aud, "delete_project");

      const user = await User.findById(req.params.id);
      if (!user) {
        throw createError(404, "User not found");
      }
      await user.remove();
      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

   // project delete
   deleteMultipleProjects: async (req, res, next) => {
    try {
      const { projectIds } = req.body; // Assuming the payload contains an array of document IDs
  
      const objectIds = projectIds.map((id) => ObjectId(id));
      const result = await Project.deleteMany({ _id: { $in: objectIds } });

      console.log('result deleteMultipleProjects:>> ', result);
  
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'Data deleted successfully' });
      } else {
        res.status(404).json({ message: 'Data not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
