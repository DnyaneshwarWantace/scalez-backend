const Project = require("../models/Project.model");
const Goal = require("../models/Goal.model");
const Learning = require("../models/Learning.model");
const User = require("../models/User.model");
const Test = require("../models/Test.model");
const Idea = require("../models/Idea.model");
const SuperOwner = require("../models/SuperOwner.model");
const createError = require("http-errors");
const moment = require("moment");
const mongoose = require("mongoose")

module.exports = {
  // read analytics
  read: async (req, res, next) => {
    try {
      const user = await User.findById(req.payload.aud).populate("owner").populate("role");

      const span = req.query.span || "1week";

      if (span === "1week") {
        const projects = await Project.find({
          owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
          // created within 1 week
          createdAt: {
            $gte: moment().subtract(1, "week").toDate(),
            $lte: moment().toDate(),
          },
        }).populate("owner");

        for (let i = 0; i < projects.length; i++) {
          var project = JSON.parse(JSON.stringify(projects[i]));
          const goals = await Goal.find({
            project: project._id,
          });

          const learnings = await Learning.find({
            project: project._id,
          });

          const tests = await Test.find({
            project: project._id,
          });

          const ideas = await Idea.find({
            project: project._id,
          });

          project.goals = goals.length;
          project.learnings = learnings.length;
          project.tests = tests.length;
          project.ideas = ideas.length;
          project.workedLearnings = learnings.filter((learning) => learning.result === "Successful").length;
          project.didntWorkedLearnings = learnings.filter((learning) => learning.result === "Unsuccessful").length;

          project.inconclusiveLearnings = learnings.filter((learning) => learning.result === "Inconclusive").length;

          projects[i] = project;

          if (i === projects.length - 1) {
            const labels = [];
            const data = [];
            const date = new Date();
            date.setDate(date.getDate() - 7);
            console.log("user --",user.owner)
            const weekIdeaData = await Idea.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);

            // console.log("weekideadata --", weekIdeaData)

            const weekTestData = await Test.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);
            const learningData = await Learning.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);

            // for team participation
            const learnings = await Learning.find({
              createdAt: {
                $gte: moment().subtract(7, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            const tests = await Test.find({
              createdAt: {
                $gte: moment().subtract(7, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            const ideas = await Idea.find({
              createdAt: {
                $gte: moment().subtract(7, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            const goals = await Goal.find({
              createdAt: {
                $gte: moment().subtract(7, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            for (let i = 0; i < 7; i++) {
              const learningsCreated = learnings.filter((el) => {
                return moment(el.createdAt).isBetween(moment().subtract(i, "days").startOf("days"), moment().subtract(i, "days").endOf("days"));
              }).length;
              const testsCreated = tests.filter((test) => {
                return moment(test.createdAt).isBetween(moment().subtract(i, "days").startOf("days"), moment().subtract(i, "days").endOf("days"));
              }).length;
              //      ideas created within 4 weeks of the current date
              const ideasCreated = ideas.filter((idea) => {
                return moment(idea.createdAt).isBetween(moment().subtract(i, "days").startOf("days"), moment().subtract(i, "days").endOf("days"));
              }).length;
              //      goals created within 4 weeks of the current date
              const goalsCreated = goals.filter((goal) => {
                return moment(goal.createdAt).isBetween(moment().subtract(i, "days").startOf("days"), moment().subtract(i, "days").endOf("days"));
              }).length;
              labels.push(moment().subtract(i, "days").startOf("days").format("MMM DD"));
              data.push(learningsCreated + testsCreated + ideasCreated + goalsCreated);
            }
            //  learning growth
            let Acquisition = 0;
            let Activation = 0;
            let Referral = 0;
            let Retention = 0;
            let Revenue = 0;
            let learningGrowthData = await Learning.find({
              createdAt: {
                $gte: moment().subtract(7, "days").toDate()
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            // filter by growth lever
            for (let i = 0; i < learningGrowthData.length; i++) {
              if (learnings[i].lever === "Acquisition") {
                Acquisition++;
              }
              if (learnings[i].lever === "Activation") {
                Activation++;
              }
              if (learnings[i].lever === "Referral") {
                Referral++;
              }
              if (learnings[i].lever === "Retention") {
                Retention++;
              }
              if (learnings[i].lever === "Revenue") {
                Revenue++;
              }
            }

            // team performance
            let ideasCreated = 0;
            let testsCreated = 0;
            let learningsCreated = 0;
            const userData = [];
            // { $or: [{ owner: user._id }, { _id: { $in: project.members } }] }
            let users = await User.find({ owner: { $in: [user._id,project.owner ] }}).populate("owner").populate("role");
            users= [...users,project.owner]
            // console.log("users -- ", project.owner)
            const ideasPerformance = await Idea.find({
              createdAt: {
                $gte: moment().subtract(7, "days").toDate()
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            for (let i = 0; i < users.length; i++) {
              const ideasCreatedByUser = ideasPerformance.filter((idea) => {
                return idea.createdBy.toString() === users[i]._id.toString();
              }).length;

              const ideasNominated = ideasPerformance.filter((idea) => {
                return idea.nominatedBy?.length > 0 && idea.createdBy.toString() === users[i]._id.toString();
              }).length;

              userData.push({
                user: users[i],
                ideasCreated: ideasCreatedByUser,
                nominations: ideasNominated,
              });
            }

            weekIdeaData.sort(function(weekIdeaData,b){
              return new Date(weekIdeaData._id) - new Date(b._id)
            })
            learningData.sort(function(learningData,b){
              return new Date(learningData._id) - new Date(b._id)
            })

            return res.send({
              message: "Projects fetched successfully",
              projects,
              idea: weekIdeaData,
              test: weekTestData,
              learning: learningData,
              labels: labels.reverse(),
              data: data.reverse(),
              acquisition: Acquisition,
              activation: Activation,
              referral: Referral,
              retention: Retention,
              revenue: Revenue,
              userData: userData,
            });
          }
        }
      }
      if (span === "2weeks") {
        console.log("111");

        const projects = await Project.find({
          owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
          // created within 1 week
          createdAt: {
            $gte: moment().subtract(2, "week").toDate(),
            $lte: moment().toDate(),
          },
        }).populate("owner");

        console.log("projects", projects);
        console.log(" user._id", user._id);
        console.log(" user.owner", user.owner);

        for (let i = 0; i < projects.length; i++) {
          console.log("222");

          var project = JSON.parse(JSON.stringify(projects[i]));
          const goals = await Goal.find({
            project: project._id,
          });

          const learnings = await Learning.find({
            project: project._id,
          });

          const tests = await Test.find({
            project: project._id,
          });

          const ideas = await Idea.find({
            project: project._id,
          });

          project.goals = goals.length;
          project.learnings = learnings.length;
          project.tests = tests.length;
          project.ideas = ideas.length;
          project.workedLearnings = learnings.filter((learning) => learning.result === "Successful").length;
          project.didntWorkedLearnings = learnings.filter((learning) => learning.result === "Unsuccessful").length;

          project.inconclusiveLearnings = learnings.filter((learning) => learning.result === "Inconclusive").length;

          projects[i] = project;

          if (i === projects.length - 1) {
            const date = new Date();
            date.setDate(date.getDate() - 14);

            const weekIdeaData = await Idea.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id :mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);
            const weekTestData = await Test.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id :mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);

            const learningData = await Learning.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id :mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);

            // for team participation
            const labels = [];
            const data = [];
            const learnings = await Learning.find({
              createdAt: {
                $gte: moment().subtract(14, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            const tests = await Test.find({
              createdAt: {
                $gte: moment().subtract(14, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            const ideas = await Idea.find({
              createdAt: {
                $gte: moment().subtract(14, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            const goals = await Goal.find({
              createdAt: {
                $gte: moment().subtract(14, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            for (let i = 0; i < 14; i++) {
              const learningsCreated = learnings.filter((el) => {
                return moment(el.createdAt).isBetween(moment().subtract(i, "days").startOf("days"), moment().subtract(i, "days").endOf("days"));
              }).length;
              const testsCreated = tests.filter((test) => {
                return moment(test.createdAt).isBetween(moment().subtract(i, "days").startOf("days"), moment().subtract(i, "days").endOf("days"));
              }).length;
              //      ideas created within 2 weeks of the current date
              const ideasCreated = ideas.filter((idea) => {
                return moment(idea.createdAt).isBetween(moment().subtract(i, "days").startOf("days"), moment().subtract(i, "days").endOf("days"));
              }).length;
              //      goals created within 2 weeks of the current date
              const goalsCreated = goals.filter((goal) => {
                return moment(goal.createdAt).isBetween(moment().subtract(i, "days").startOf("days"), moment().subtract(i, "days").endOf("days"));
              }).length;
              labels.push(moment().subtract(i, "days").startOf("days").format("MMM DD"));
              data.push(learningsCreated + testsCreated + ideasCreated + goalsCreated);
            }

            //  learning growth
            let Acquisition = 0;
            let Activation = 0;
            let Referral = 0;
            let Retention = 0;
            let Revenue = 0;
            const learningGrowthData = await Learning.find({
              createdAt: {
                $gte: moment().subtract(14, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            // filter by growth lever
            for (let i = 0; i < learningGrowthData.length; i++) {
              if (learnings[i].lever === "Acquisition") {
                Acquisition++;
              }
              if (learnings[i].lever === "Activation") {
                Activation++;
              }
              if (learnings[i].lever === "Referral") {
                Referral++;
              }
              if (learnings[i].lever === "Retention") {
                Retention++;
              }
              if (learnings[i].lever === "Revenue") {
                Revenue++;
              }
            }

            // team performance
            let ideasCreated = 0;
            let testsCreated = 0;
            let learningsCreated = 0;
            const userData = [];

            let users = await User.find({ owner: { $in: [user._id, project.owner] } }).populate("owner").populate("role");
            users = [...users, project.owner]
            // console.log("users - --" , users)
            const ideasPerformance = await Idea.find({
              createdAt: {
                $gte: moment().subtract(14, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            for (let i = 0; i < users.length; i++) {
              const ideasCreatedByUser = ideasPerformance.filter((idea) => {
                return idea.createdBy.toString() === users[i]._id.toString();
              }).length;

              const ideasNominated = ideasPerformance.filter((idea) => {
                return idea.nominatedBy?.length > 0 && idea.createdBy.toString() === users[i]._id.toString();
              }).length;

              userData.push({
                user: users[i],
                ideasCreated: ideasCreatedByUser,
                nominations: ideasNominated,
              });
            }
            weekIdeaData.sort(function(weekIdeaData,b){
              return new Date(weekIdeaData._id) - new Date(b._id)
            })
            learningData.sort(function(learningData,b){
              return new Date(learningData._id) - new Date(b._id)
            })
            return res.send({
              message: "Projects fetched successfully",
              projects,
              idea: weekIdeaData,
              test: weekTestData,
              learning: learningData,
              labels: labels.reverse(),
              data: data.reverse(),
              acquisition: Acquisition,
              activation: Activation,
              referral: Referral,
              retention: Retention,
              revenue: Revenue,
              userData: userData,
            });
          }
        }
      }
      if (span === "1month") {
        // console.log("111");

        const projects = await Project.find({
          owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
          createdAt: {
            $gte: moment().subtract(1, "months").toDate(),
            $lte: moment().toDate(),
          },
        }).populate("owner");

        console.log("projects ---", projects);

        for (let i = 0; i < projects.length; i++) {
          var project = JSON.parse(JSON.stringify(projects[i]));
          const goals = await Goal.find({
            project: project._id,
          });

          const learnings = await Learning.find({
            project: project._id,
          });

          const tests = await Test.find({
            project: project._id,
          });

          const ideas = await Idea.find({
            project: project._id,
          });

          project.goals = goals.length;
          project.learnings = learnings.length;
          project.tests = tests.length;
          project.ideas = ideas.length;
          project.workedLearnings = learnings.filter((learning) => learning.result === "Successful").length;
          project.didntWorkedLearnings = learnings.filter((learning) => learning.result === "Unsuccessful").length;

          project.inconclusiveLearnings = learnings.filter((learning) => learning.result === "Inconclusive").length;

          projects[i] = project;

          if (i === projects.length - 1) {
            const date = new Date();
            date.setDate(date.getDate() - 30);

            const weekIdeaData = await Idea.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);

            console.log("weekIdeaData", weekIdeaData);
            const weekTestData = await Test.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);
            const learningData = await Learning.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);

            // for team participation
            const labels = [];
            const data = [];
            const learnings = await Learning.find({
              createdAt: {
                $gte: moment().subtract(30, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            const tests = await Test.find({
              createdAt: {
                $gte: moment().subtract(30, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            const ideas = await Idea.find({
              createdAt: {
                $gte: moment().subtract(30, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            console.log("Ideas", ideas);
            const goals = await Goal.find({
              createdAt: {
                $gte: moment().subtract(30, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            for (let i = 0; i < 30; i++) {
              const learningsCreated = learnings.filter((el) => {
                return moment(el.createdAt).isBetween(moment().subtract(i, "days").startOf("days"), moment().subtract(i, "days").endOf("days"));
              }).length;
              const testsCreated = tests.filter((test) => {
                return moment(test.createdAt).isBetween(moment().subtract(i, "days").startOf("days"), moment().subtract(i, "days").endOf("days"));
              }).length;
              //      ideas created within 1 months of the current date
              const ideasCreated = ideas.filter((idea) => {
                return moment(idea.createdAt).isBetween(moment().subtract(i, "days").startOf("days"), moment().subtract(i, "days").endOf("days"));
              }).length;

              console.log("ideasCreated", ideasCreated);
              //      goals created within 1 months of the current date
              const goalsCreated = goals.filter((goal) => {
                return moment(goal.createdAt).isBetween(moment().subtract(i, "days").startOf("days"), moment().subtract(i, "days").endOf("days"));
              }).length;
              labels.push(moment().subtract(i, "days").startOf("days").format("MMM DD"));
              data.push(learningsCreated + testsCreated + ideasCreated + goalsCreated);
            }

            //  learning growth
            let Acquisition = 0;
            let Activation = 0;
            let Referral = 0;
            let Retention = 0;
            let Revenue = 0;
            const learningGrowthData = await Learning.find({
              createdAt: {
                $gte: moment().subtract(30, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            // filter by growth lever
            for (let i = 0; i < learningGrowthData.length; i++) {
              if (learnings[i].lever === "Acquisition") {
                Acquisition++;
              }
              if (learnings[i].lever === "Activation") {
                Activation++;
              }
              if (learnings[i].lever === "Referral") {
                Referral++;
              }
              if (learnings[i].lever === "Retention") {
                Retention++;
              }
              if (learnings[i].lever === "Revenue") {
                Revenue++;
              }
            }

            // team performance
            let ideasCreated = 0;
            let testsCreated = 0;
            let learningsCreated = 0;
            const userData = [];

            let users = await User.find({ owner: { $in: [user._id, project.owner] } }).populate("owner").populate("role");
            users = [...users, project.owner]
            const ideasPerformance = await Idea.find({
              createdAt: {
                $gte: moment().subtract(30, "days").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            for (let i = 0; i < users.length; i++) {
              const ideasCreatedByUser = ideasPerformance.filter((idea) => {
                return idea.createdBy.toString() === users[i]._id.toString();
              }).length;

              const ideasNominated = ideasPerformance.filter((idea) => {
                return idea.nominatedBy?.length > 0 && idea.createdBy.toString() === users[i]._id.toString();
              }).length;

              userData.push({
                user: users[i],
                ideasCreated: ideasCreatedByUser,
                nominations: ideasNominated,
              });
            }

            weekIdeaData.sort(function(weekIdeaData,b){
              return new Date(weekIdeaData._id) - new Date(b._id)
            })
            learningData.sort(function(learningData,b){
              return new Date(learningData._id) - new Date(b._id)
            })

            return res.send({
              message: "Projects fetched successfully",
              projects,
              idea: weekIdeaData,
              test: weekTestData,
              learning: learningData,
              labels: labels.reverse(),
              data: data.reverse(),
              acquisition: Acquisition,
              activation: Activation,
              referral: Referral,
              retention: Retention,
              revenue: Revenue,
              userData: userData,
            });
          }
        }
      }

      if (span === "3months") {
        const projects = await Project.find({
          owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
          createdAt: {
            $gte: moment().subtract(3, "months").toDate(),
            $lte: moment().toDate(),
          },
        }).populate("owner");

        for (let i = 0; i < projects.length; i++) {
          var project = JSON.parse(JSON.stringify(projects[i]));
          const goals = await Goal.find({
            project: project._id,
          });

          const learnings = await Learning.find({
            project: project._id,
          });

          const tests = await Test.find({
            project: project._id,
          });

          const ideas = await Idea.find({
            project: project._id,
          });

          project.goals = goals.length;
          project.learnings = learnings.length;
          project.tests = tests.length;
          project.ideas = ideas.length;
          project.workedLearnings = learnings.filter((learning) => learning.result === "Successful").length;
          project.didntWorkedLearnings = learnings.filter((learning) => learning.result === "Unsuccessful").length;

          project.inconclusiveLearnings = learnings.filter((learning) => learning.result === "Inconclusive").length;

          projects[i] = project;

          if (i === projects.length - 1) {
            const date = new Date();
            date.setDate(date.getDate() - 90);

            const weekIdeaData = await Idea.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);
            const weekTestData = await Test.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);
            const learningData = await Learning.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);
            // for team participation
            const labels = [];
            const data = [];
            const learnings = await Learning.find({
              createdAt: {
                $gte: moment().subtract(3, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            const tests = await Test.find({
              createdAt: {
                $gte: moment().subtract(3, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            const ideas = await Idea.find({
              createdAt: {
                $gte: moment().subtract(3, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            const goals = await Goal.find({
              createdAt: {
                $gte: moment().subtract(3, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            for (let i = 0; i < 3; i++) {
              const learningsCreated = learnings.filter((el) => {
                return moment(el.createdAt).isBetween(
                  moment().subtract(i, "months").startOf("months"),
                  moment().subtract(i, "months").endOf("months")
                );
              }).length;
              const testsCreated = tests.filter((test) => {
                return moment(test.createdAt).isBetween(
                  moment().subtract(i, "months").startOf("months"),
                  moment().subtract(i, "months").endOf("months")
                );
              }).length;
              //      ideas created within 3 months of the current date
              const ideasCreated = ideas.filter((idea) => {
                return moment(idea.createdAt).isBetween(
                  moment().subtract(i, "months").startOf("months"),
                  moment().subtract(i, "months").endOf("months")
                );
              }).length;
              //      goals created within 3 months of the current date
              const goalsCreated = goals.filter((goal) => {
                return moment(goal.createdAt).isBetween(
                  moment().subtract(i, "months").startOf("months"),
                  moment().subtract(i, "months").endOf("months")
                );
              }).length;
              labels.push(moment().subtract(i, "months").startOf("months").format("MMM DD"));
              data.push(learningsCreated + testsCreated + ideasCreated + goalsCreated);
            }

            //  learning growth
            let Acquisition = 0;
            let Activation = 0;
            let Referral = 0;
            let Retention = 0;
            let Revenue = 0;
            const learningGrowthData = await Learning.find({
              createdAt: {
                $gte: moment().subtract(3, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            // filter by growth lever
            for (let i = 0; i < learningGrowthData.length; i++) {
              if (learnings[i].lever === "Acquisition") {
                Acquisition++;
              }
              if (learnings[i].lever === "Activation") {
                Activation++;
              }
              if (learnings[i].lever === "Referral") {
                Referral++;
              }
              if (learnings[i].lever === "Retention") {
                Retention++;
              }
              if (learnings[i].lever === "Revenue") {
                Revenue++;
              }
            }

            // team performance
            let ideasCreated = 0;
            let testsCreated = 0;
            let learningsCreated = 0;
            const userData = [];

            let users = await User.find({ owner: { $in: [user._id, project.owner] } }).populate("owner").populate("role");
            users = [...users, project.owner]
            const ideasPerformance = await Idea.find({
              createdAt: {
                $gte: moment().subtract(3, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            for (let i = 0; i < users.length; i++) {
              const ideasCreatedByUser = ideasPerformance.filter((idea) => {
                return idea.createdBy.toString() === users[i]._id.toString();
              }).length;

              const ideasNominated = ideasPerformance.filter((idea) => {
                return idea.nominatedBy?.length > 0 && idea.createdBy.toString() === users[i]._id.toString();
              }).length;

              userData.push({
                user: users[i],
                ideasCreated: ideasCreatedByUser,
                nominations: ideasNominated,
              });
            }
            weekIdeaData.sort(function(weekIdeaData,b){
              return new Date(weekIdeaData._id) - new Date(b._id)
            })
            learningData.sort(function(learningData,b){
              return new Date(learningData._id) - new Date(b._id)
            })
            console.log("weekIdeaData", weekIdeaData)

            return res.send({
              message: "Projects fetched successfully",
              projects,
              idea: weekIdeaData,
              test: weekTestData,
              learning: learningData,
              labels: labels.reverse(),
              data: data.reverse(),
              acquisition: Acquisition,
              activation: Activation,
              referral: Referral,
              retention: Retention,
              revenue: Revenue,
              userData: userData,
            });
          }
        }
      }
      if (span === "6months") {
        const projects = await Project.find({
          owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,

          createdAt: {
            $gte: moment().subtract(6, "months").toDate(),
            $lte: moment().toDate(),
          },
        }).populate("owner");

        for (let i = 0; i < projects.length; i++) {
          var project = JSON.parse(JSON.stringify(projects[i]));
          const goals = await Goal.find({
            project: project._id,
          });

          const learnings = await Learning.find({
            project: project._id,
          });

          const tests = await Test.find({
            project: project._id,
          });

          const ideas = await Idea.find({
            project: project._id,
          });

          project.goals = goals.length;
          project.learnings = learnings.length;
          project.tests = tests.length;
          project.ideas = ideas.length;
          project.workedLearnings = learnings.filter((learning) => learning.result === "Successful").length;
          project.didntWorkedLearnings = learnings.filter((learning) => learning.result === "Unsuccessful").length;

          project.inconclusiveLearnings = learnings.filter((learning) => learning.result === "Inconclusive").length;

          projects[i] = project;

          if (i === projects.length - 1) {
            const date = new Date();
            date.setDate(date.getDate() - 180);

            const weekIdeaData = await Idea.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);
            const weekTestData = await Test.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);
            const learningData = await Learning.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);

            // for team participation
            const labels = [];
            const data = [];
            const learnings = await Learning.find({
              createdAt: {
                $gte: moment().subtract(6, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            const tests = await Test.find({
              createdAt: {
                $gte: moment().subtract(6, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            const ideas = await Idea.find({
              createdAt: {
                $gte: moment().subtract(6, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            const goals = await Goal.find({
              createdAt: {
                $gte: moment().subtract(6, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            for (let i = 0; i < 6; i++) {
              const learningsCreated = learnings.filter((el) => {
                return moment(el.createdAt).isBetween(
                  moment().subtract(i, "months").startOf("months"),
                  moment().subtract(i, "months").endOf("months")
                );
              }).length;
              const testsCreated = tests.filter((test) => {
                return moment(test.createdAt).isBetween(
                  moment().subtract(i, "months").startOf("months"),
                  moment().subtract(i, "months").endOf("months")
                );
              }).length;
              //      ideas created within 6 months of the current date
              const ideasCreated = ideas.filter((idea) => {
                return moment(idea.createdAt).isBetween(
                  moment().subtract(i, "months").startOf("months"),
                  moment().subtract(i, "months").endOf("months")
                );
              }).length;
              //      goals created within 6 months of the current date
              const goalsCreated = goals.filter((goal) => {
                return moment(goal.createdAt).isBetween(
                  moment().subtract(i, "months").startOf("months"),
                  moment().subtract(i, "months").endOf("months")
                );
              }).length;
              labels.push(moment().subtract(i, "months").startOf("months").format("MMM DD"));
              data.push(learningsCreated + testsCreated + ideasCreated + goalsCreated);
            }

            //  learning growth
            let Acquisition = 0;
            let Activation = 0;
            let Referral = 0;
            let Retention = 0;
            let Revenue = 0;
            const learningGrowthData = await Learning.find({
              createdAt: {
                $gte: moment().subtract(6, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            // filter by growth lever
            for (let i = 0; i < learningGrowthData.length; i++) {
              if (learnings[i].lever === "Acquisition") {
                Acquisition++;
              }
              if (learnings[i].lever === "Activation") {
                Activation++;
              }
              if (learnings[i].lever === "Referral") {
                Referral++;
              }
              if (learnings[i].lever === "Retention") {
                Retention++;
              }
              if (learnings[i].lever === "Revenue") {
                Revenue++;
              }
            }

            // team performance
            let ideasCreated = 0;
            let testsCreated = 0;
            let learningsCreated = 0;
            const userData = [];

            let users = await User.find({ owner: { $in: [user._id, project.owner] } }).populate("owner").populate("role");
            users = [...users, project.owner]
            const ideasPerformance = await Idea.find({
              createdAt: {
                $gte: moment().subtract(6, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            for (let i = 0; i < users.length; i++) {
              const ideasCreatedByUser = ideasPerformance.filter((idea) => {
                return idea.createdBy.toString() === users[i]._id.toString();
              }).length;
              console.log("ideasCreatedByUser", ideasCreatedByUser);
              const ideasNominated = ideasPerformance.filter((idea) => {
                return idea.nominatedBy?.length > 0 && idea.createdBy.toString() === users[i]._id.toString();
              }).length;

              userData.push({
                user: users[i],
                ideasCreated: ideasCreatedByUser,
                nominations: ideasNominated,
              });
            }

            weekIdeaData.sort(function(weekIdeaData,b){
              return new Date(weekIdeaData._id) - new Date(b._id)
            })
            learningData.sort(function(learningData,b){
              return new Date(learningData._id) - new Date(b._id)
            })
            
            return res.send({
              message: "Projects fetched successfully",
              projects,
              idea: weekIdeaData,
              test: weekTestData,
              learning: learningData,
              labels: labels.reverse(),
              data: data.reverse(),
              acquisition: Acquisition,
              activation: Activation,
              referral: Referral,
              retention: Retention,
              revenue: Revenue,
              userData: userData,
            });
          }
        }
      }
      if (span === "12months") {
        const projects = await Project.find({
          owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
          // created within 1 week
          createdAt: {
            $gte: moment().subtract(12, "months").toDate(),
            $lte: moment().toDate(),
          },
        }).populate("owner");

        for (let i = 0; i < projects.length; i++) {
          var project = JSON.parse(JSON.stringify(projects[i]));
          const goals = await Goal.find({
            project: project._id,
          });

          const learnings = await Learning.find({
            project: project._id,
          });

          const tests = await Test.find({
            project: project._id,
          });

          const ideas = await Idea.find({
            project: project._id,
          });

          project.goals = goals.length;
          project.learnings = learnings.length;
          project.tests = tests.length;
          project.ideas = ideas.length;
          project.workedLearnings = learnings.filter((learning) => learning.result === "Successful").length;
          project.didntWorkedLearnings = learnings.filter((learning) => learning.result === "Unsuccessful").length;

          project.inconclusiveLearnings = learnings.filter((learning) => learning.result === "Inconclusive").length;

          projects[i] = project;

          if (i === projects.length - 1) {
            const date = new Date();
            date.setDate(date.getDate() - 365);

            const weekIdeaData = await Idea.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);
            const weekTestData = await Test.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);
            const learningData = await Learning.aggregate([
              { $match: { createdAt: { $gte: date }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : mongoose.Types.ObjectId(user.owner._id.toString()) } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: 1 } } },
            ]);

            // for team participation
            const labels = [];
            const data = [];
            const learnings = await Learning.find({
              createdAt: {
                $gte: moment().subtract(12, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            const tests = await Test.find({
              createdAt: {
                $gte: moment().subtract(12, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            const ideas = await Idea.find({
              createdAt: {
                $gte: moment().subtract(12, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            const goals = await Goal.find({
              createdAt: {
                $gte: moment().subtract(12, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            for (let i = 0; i < 12; i++) {
              const learningsCreated = learnings.filter((el) => {
                return moment(el.createdAt).isBetween(
                  moment().subtract(i, "months").startOf("months"),
                  moment().subtract(i, "months").endOf("months")
                );
              }).length;
              const testsCreated = tests.filter((test) => {
                return moment(test.createdAt).isBetween(
                  moment().subtract(i, "months").startOf("months"),
                  moment().subtract(i, "months").endOf("months")
                );
              }).length;
              //      ideas created within 1 months of the current date
              const ideasCreated = ideas.filter((idea) => {
                return moment(idea.createdAt).isBetween(
                  moment().subtract(i, "months").startOf("months"),
                  moment().subtract(i, "months").endOf("months")
                );
              }).length;
              //      goals created within 1 months of the current date
              const goalsCreated = goals.filter((goal) => {
                return moment(goal.createdAt).isBetween(
                  moment().subtract(i, "months").startOf("months"),
                  moment().subtract(i, "months").endOf("months")
                );
              }).length;
              labels.push(moment().subtract(i, "months").startOf("months").format("MMM DD"));
              data.push(learningsCreated + testsCreated + ideasCreated + goalsCreated);
            }

            //  learning growth
            let Acquisition = 0;
            let Activation = 0;
            let Referral = 0;
            let Retention = 0;
            let Revenue = 0;
            const learningGrowthData = await Learning.find({
              createdAt: {
                $gte: moment().subtract(12, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });
            // filter by growth lever
            for (let i = 0; i < learningGrowthData.length; i++) {
              if (learnings[i].lever === "Acquisition") {
                Acquisition++;
              }
              if (learnings[i].lever === "Activation") {
                Activation++;
              }
              if (learnings[i].lever === "Referral") {
                Referral++;
              }
              if (learnings[i].lever === "Retention") {
                Retention++;
              }
              if (learnings[i].lever === "Revenue") {
                Revenue++;
              }
            }

            // team performance
            let ideasCreated = 0;
            let testsCreated = 0;
            let learningsCreated = 0;
            const userData = [];

            let users = await User.find({ owner: { $in: [user._id, project.owner] } }).populate("owner").populate("role");
            users = [...users, project.owner]
            const ideasPerformance = await Idea.find({
              createdAt: {
                $gte: moment().subtract(12, "months").toDate(),
              }, owner: user.role?.name.toLowerCase() === "owner" ? user._id : user.owner,
            });

            for (let i = 0; i < users.length; i++) {
              const ideasCreatedByUser = ideasPerformance.filter((idea) => {
                return idea.createdBy.toString() === users[i]._id.toString();
              }).length;

              const ideasNominated = ideasPerformance.filter((idea) => {
                return idea.nominatedBy?.length > 0 && idea.createdBy.toString() === users[i]._id.toString();
              }).length;

              userData.push({
                user: users[i],
                ideasCreated: ideasCreatedByUser,
                nominations: ideasNominated,
              });
            }

            weekIdeaData.sort(function(weekIdeaData,b){
              return new Date(weekIdeaData._id) - new Date(b._id)
            })
            learningData.sort(function(learningData,b){
              return new Date(learningData._id) - new Date(b._id)
            })

            return res.send({
              message: "Projects fetched successfully",
              projects,
              idea: weekIdeaData,
              test: weekTestData,
              learning: learningData,
              labels: labels.reverse(),
              data: data.reverse(),
              acquisition: Acquisition,
              activation: Activation,
              referral: Referral,
              retention: Retention,
              revenue: Revenue,
              userData: userData,
            });
          }
        }
      }
      return res.send({
        message: "Projects fetched successfully",
        projects: [],
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  // read admin analytics
  readAdminAnalytics: async (req, res, next) => {
    try {
      const admin = await SuperOwner.findOne({ _id: req.payload.aud });
      if (!admin) {
        throw createError(401, "Unauthorized");
      }
      let span = req.query.span || "1week";
  
      let timeSpans = {
        "1week": moment().subtract(1, "w").toDate(),
        "2weeks": moment().subtract(2, "w").toDate(),
        "1month": moment().subtract(1, "M").toDate(),
        "3months": moment().subtract(3, "M").toDate(),
        "6months": moment().subtract(6, "M").toDate(),
        "12months": moment().subtract(12, "M").toDate(),
      };
  
      if (!timeSpans.hasOwnProperty(span)) {
        return res.status(400).json({ message: "Invalid span specified" });
      }
  
      let users = await User.find({
        // type owner
        type: "owner",
        // created within the specified time span
        createdAt: {
          $gte: timeSpans[span],
          $lte: moment().toDate(),
        },
      }).populate("role").select("name email status createdAt updatedAt");
  
      let responseData = [];
      
      for (const user of users) {
        let userData = JSON.parse(JSON.stringify(user));
  
        // Fetch other data in parallel using Promise.all
        let [ideas, goals, totalLearnings, learningsWorked, learningsNotWorked, learningsInconclusive, tests] = await Promise.all([
          Idea.find({
            owner: user._id,
            createdAt: {
              $gte: timeSpans[span],
              $lte: moment().toDate(),
            },
          }),
          Goal.find({
            owner: user._id,
            createdAt: {
              $gte: timeSpans[span],
              $lte: moment().toDate(),
            },
          }),
          Learning.find({
            owner: user._id,
            createdAt: {
              $gte: timeSpans[span],
              $lte: moment().toDate(),
            },
          }),
          Learning.find({
            owner: user._id,
            createdAt: {
              $gte: timeSpans[span],
              $lte: moment().toDate(),
            },
            status: "Successful",
          }),
          Learning.find({
            owner: user._id,
            createdAt: {
              $gte: timeSpans[span],
              $lte: moment().toDate(),
            },
            status: "Unsuccessful",
          }),
          Learning.find({
            owner: user._id,
            createdAt: {
              $gte: timeSpans[span],
              $lte: moment().toDate(),
            },
            status: "Inconclusive",
          }),
          Test.find({
            owner: user._id,
            createdAt: {
              $gte: timeSpans[span],
              $lte: moment().toDate(),
            },
          }),
        ]);
  
        userData.ideas = ideas.length;
        userData.goals = goals.length;
        userData.workedLearnings = learningsWorked.length;
        userData.notWorkedLearnings = learningsNotWorked.length;
        userData.inconclusiveLearnings = learningsInconclusive.length;
        userData.totalLearnings = totalLearnings.length;
        userData.tests = tests.length;
  
        responseData.push(userData);
      }
  
      return res.send({
        message: "Users fetched successfully",
        users: responseData,
      });
    } catch (err) {
      next(err);
    }
  },
};
