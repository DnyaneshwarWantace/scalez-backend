const Project = require("../models/Project.model");
const User = require("../models/User.model");
const createError = require("http-errors");
const Idea = require("../models/Idea.model");
const Test = require("../models/Test.model");
const moment = require("moment");
const Learning = require("../models/Learning.model");
const Goal = require("../models/Goal.model");
const Count = require("../models/Count.model");

module.exports = {
  // get ideas and tests for a project by project id for specific time period
  getIdeasAndTests: async (req, res, next) => {
    try {
      const id = req.params.id;
      const { span } = req.query || "4";

      var ideasData = {
        labels: [],
        data: [],
      };

      var testsData = {
        labels: [],
        data: [],
      };

      //   ideas and tests created within 4 weeks of the current date
      if (span === "4") {
        const ideas = await Idea.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(4, "weeks").toDate(),
          },
        });

        const tests = await Test.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(4, "weeks").toDate(),
          },
        });

        // 4 weeks data
        for (let i = 0; i < 4; i++) {
          //      ideas created within 4 weeks of the current date
          const ideasCreated = ideas.filter((idea) => {
            return moment(idea.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          //      tests created within 4 weeks of the current date
          const testsCreated = tests.filter((test) => {
            return moment(test.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          ideasData.labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          ideasData.data.push(ideasCreated);
          testsData.labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          testsData.data.push(testsCreated);
        }
      }

      if (span === "8") {
        const ideas = await Idea.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(8, "weeks").toDate(),
          },
        });

        const tests = await Test.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(8, "weeks").toDate(),
          },
        });

        // 8 weeks data
        for (let i = 0; i < 8; i++) {
          //      ideas created within 8 weeks of the current date
          const ideasCreated = ideas.filter((idea) => {
            return moment(idea.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          //      tests created within 8 weeks of the current date
          const testsCreated = tests.filter((test) => {
            return moment(test.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          ideasData.labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          ideasData.data.push(ideasCreated);
          testsData.labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          testsData.data.push(testsCreated);
        }
      }

      if (span === "12") {
        const ideas = await Idea.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(12, "weeks").toDate(),
          },
        });

        const tests = await Test.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(12, "weeks").toDate(),
          },
        });

        // 12 weeks data
        for (let i = 0; i < 12; i++) {
          //      ideas created within 12 weeks of the current date
          const ideasCreated = ideas.filter((idea) => {
            return moment(idea.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          //      tests created within 12 weeks of the current date
          const testsCreated = tests.filter((test) => {
            return moment(test.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          ideasData.labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          ideasData.data.push(ideasCreated);
          testsData.labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          testsData.data.push(testsCreated);
        }
      }

      if (span === "all") {
        const ideas = await Idea.find({
          project: id,
        });

        const tests = await Test.find({
          project: id,
        });

        // all time data
        for (let i = 0; i < 12; i++) {
          //      ideas created within 12 weeks of the current date
          const ideasCreated = ideas.filter((idea) => {
            return moment(idea.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          //      tests created within 12 weeks of the current date
          const testsCreated = tests.filter((test) => {
            return moment(test.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          ideasData.labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          ideasData.data.push(ideasCreated);
          testsData.labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          testsData.data.push(testsCreated);
        }
      }

      res.status(200).json({
        message: "Ideas and tests fetched successfully",
        // reverse the data so it is in chronological order
        ideasData: {
          labels: ideasData.labels.reverse(),
          data: ideasData.data.reverse(),
        },
        testsData: {
          labels: testsData.labels.reverse(),
          data: testsData.data.reverse(),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  //   get all learnings for a project
  getAllLearnings: async (req, res, next) => {
    try {
      const id = req.params.id;
      const { span } = req.query || "4";

      var labels = [];
      var data = [];

      // find all learnings created within the last 4 weeks

      if (span === "4") {
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(4, "weeks").toDate(),
          },
        });

        // 4 weeks data
        for (let i = 0; i < 4; i++) {
          //      learnings created within 4 weeks of the current date
          const learningsCreated = learnings.filter((learning) => {
            return moment(learning.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          data.push(learningsCreated);
        }
      }
      if (span === "8") {
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(8, "weeks").toDate(),
          },
        });

        // 8 weeks data
        for (let i = 0; i < 8; i++) {
          //      learnings created within 8 weeks of the current date
          const learningsCreated = learnings.filter((learning) => {
            return moment(learning.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          data.push(learningsCreated);
        }
      }
      if (span === "12") {
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(12, "weeks").toDate(),
          },
        });

        // 12 weeks data
        for (let i = 0; i < 12; i++) {
          //      learnings created within 12 weeks of the current date
          const learningsCreated = learnings.filter((learning) => {
            return moment(learning.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          data.push(learningsCreated);
        }
      }

      res.status(200).json({
        message: "Learnings fetched successfully",
        // reverse the data so it is in chronological order
        labels: labels.reverse(),
        data: data.reverse(),
      });
    } catch (err) {
      next(err);
    }
  },

  //   read learnings by growth lever
  getLearningsByGrowthLever: async (req, res, next) => {
    try {
      const id = req.params.id;
      const { span } = req.query || "4";

      var Acquisition = 0;
      var Activation = 0;
      var Referral = 0;
      var Retention = 0;
      var Revenue = 0;

      if (span === "4") {
        // find all learnings created within the last 4 weeks and group by growth lever
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(4, "weeks").toDate(),
          },
        });

        // filter by growth lever
        for (let i = 0; i < learnings.length; i++) {
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
      }

      if (span === "8") {
        // find all learnings created within the last 8 weeks and group by growth lever
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(8, "weeks").toDate(),
          },
        });

        // filter by growth lever
        for (let i = 0; i < learnings.length; i++) {
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
      }

      if (span === "12") {
        // find all learnings created within the last 12 weeks and group by growth lever
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(12, "weeks").toDate(),
          },
        });

        // filter by growth lever
        for (let i = 0; i < learnings.length; i++) {
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
      }

      res.status(200).json({
        message: "Learnings fetched successfully",
        payload: {
          Acquisition,
          Activation,
          Referral,
          Retention,
          Revenue,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // weekly team participation
  getTeamParticipation: async (req, res, next) => {
    try {
      const id = req.params.id;
      const { span } = req.query || "4";

      var labels = [];
      var data = [];

      if (span === "4") {
        // find all learnings , tests ideas and goals created within the last 4 weeks and group by team
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(4, "weeks").toDate(),
          },
        });
        const tests = await Test.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(4, "weeks").toDate(),
          },
        });
        const ideas = await Idea.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(4, "weeks").toDate(),
          },
        });
        const goals = await Goal.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(4, "weeks").toDate(),
          },
        });
        // 4 weeks data
        for (let i = 0; i < 4; i++) {
          //      learnings created within 4 weeks of the current date
          const learningsCreated = learnings.filter((learning) => {
            return moment(learning.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;
                   //      tests created within 4 weeks of the current date
          const testsCreated = tests.filter((test) => {
            return moment(test.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;
          //      ideas created within 4 weeks of the current date
          const ideasCreated = ideas.filter((idea) => {
            return moment(idea.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;
          //      goals created within 4 weeks of the current date
          const goalsCreated = goals.filter((goal) => {
            return moment(goal.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;
          labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          data.push(
            learningsCreated + testsCreated + ideasCreated + goalsCreated
          );
        }
      }

      if (span === "8") {
        // find all learnings , tests ideas and goals created within the last 8 weeks and group by team
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(8, "weeks").toDate(),
          },
        });
        const tests = await Test.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(8, "weeks").toDate(),
          },
        });
        const ideas = await Idea.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(8, "weeks").toDate(),
          },
        });
        const goals = await Goal.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(8, "weeks").toDate(),
          },
        });
        // 8 weeks data
        for (let i = 0; i < 8; i++) {
          //      learnings created within 8 weeks of the current date
          const learningsCreated = learnings.filter((learning) => {
            return moment(learning.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;
          //      tests created within 8 weeks of the current date
          const testsCreated = tests.filter((test) => {
            return moment(test.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;
          //      ideas created within 8 weeks of the current date
          const ideasCreated = ideas.filter((idea) => {
            return moment(idea.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          //      goals created within 8 weeks of the current date
          const goalsCreated = goals.filter((goal) => {
            return moment(goal.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          labels.push(
            moment().subtract(i, "weeks").startOf("week").format("MMM DD")
          );
          data.push(
            learningsCreated + testsCreated + ideasCreated + goalsCreated
          );
        }
      }

      if (span === "12") {
        // find all learnings , tests ideas and goals created within the last 12 weeks and group by team
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(12, "weeks").toDate(),
          },
        });
        const tests = await Test.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(12, "weeks").toDate(),
          },
        });
        const ideas = await Idea.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(12, "weeks").toDate(),
          },
        });
        const goals = await Goal.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(12, "weeks").toDate(),
          },
        });
        // 12 weeks data
        for (let i = 0; i < 12; i++) {
          //      learnings created within 12 weeks of the current date
          const learningsCreated = learnings.filter((learning) => {
            return moment(learning.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;
          //      tests created within 12 weeks of the current date
          const testsCreated = tests.filter((test) => {
            return moment(test.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;
          //      ideas created within 12 weeks of the current date
          const ideasCreated = ideas.filter((idea) => {
            return moment(idea.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          //      goals created within 12 weeks of the current date
          const goalsCreated = goals.filter((goal) => {
            return moment(goal.createdAt).isBetween(
              moment().subtract(i, "weeks").startOf("week"),
              moment().subtract(i, "weeks").endOf("week")
            );
          }).length;

          labels.push(
            moment().subtract(i, "weeks").endOf("week").format("MMM DD")
          );
          data.push(
            learningsCreated + testsCreated + ideasCreated + goalsCreated
          );
        }
      }

      // res
      res.status(200).json({
        message: "Team participation fetched successfully",
        payload: {
        labels: labels.reverse(),
        data: data.reverse(),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // get Growth Health
  getGrowthHealth: async (req, res, next) => {
    try {
      const id = req.params.id;
      const span = req.query.span || 1;
    
      var ideasCreated = 0;
      var testsCreated = 0;
      var learningsCreated = 0;
      var userData = [];

      // read project and get all users in the project
      const project = await Project.findById(id).populate("team");
      const users = await User.find({
        _id: {
          $in: [...project.team.map(x => x._id), project.owner],
        },
      });
      const count = await Count.find({ project:project._id }).populate("project").populate("user")
      // console.log("count ---", count)
      if (span == 1) {
        // find all learnings , tests ideas and goals created within the last 1 week and group by team
        const ideas = await Idea.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(1, "weeks").toDate(),
          },
        });

        const tests = await Test.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(1, "weeks").toDate(),
          },
        });
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(1, "weeks").toDate(),
          },
        });

        // get all users and count the number of ideas, tests and learnings created within the last 1 week and group by user and get user id
        for (let i = 0; i < users.length; i++) {
          //     ideas created within 1 week of the current date and get user who created the idea
          const ideasCreatedByUser = ideas.filter((idea) => {
            return idea.createdBy.toString() === users[i]._id.toString();
          }).length;

          //     tests created within 1 week of the current date and get user who created the test
          const testsCreatedByUser = tests.filter((test) => {
            return test.createdBy.toString() === users[i]._id.toString();
          }).length;

          // get all ideas created by user and count total nominations

          const ideasNominated = ideas.filter((idea) => {
            return (
              idea.nominatedBy?.length > 0 &&
              idea.createdBy.toString() === users[i]._id.toString()
            );
          }).length;
          // get all tests created by user and count total nominations

          project.workedLearnings = learnings.filter(
            (learning) => learning.result === "Successful"
          ).length;
          project.didntWorkedLearnings = learnings.filter(
            (learning) => learning.result === "Unsuccessful"
          ).length;

          project.inconclusiveLearnings = learnings.filter(
            (learning) => learning.result === "Inconclusive"
          ).length;

          userData.push({
            user: users[i],
            ideasCreated: ideasCreatedByUser,
            testsCreated: testsCreatedByUser,
            nominations: ideasNominated,
            workedLearnings: project.workedLearnings,
            didntWorkedLearnings: project.didntWorkedLearnings,
            inconclusiveLearnings:project.inconclusiveLearnings,
           
          });
        }


        res.status(200).json({
          message: "Growth Health fetched successfully",
          payload: {
            ideasCreated: ideas.length,
            testsCreated: tests.length,
            learningsCreated: learnings.length,
            userData,
            projectCount: count
          },
        });
      }

      if (span == 2) {
        // find all learnings , tests ideas and goals created within the last 1 week and group by team
        const ideas = await Idea.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(2, "weeks").toDate(),
          },
        });

        const tests = await Test.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(2, "weeks").toDate(),
          },
        });
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(2, "weeks").toDate(),
          },
        });

        // get all users and count the number of ideas, tests and learnings created within the last 1 week and group by user and get user id
        for (let i = 0; i < users.length; i++) {
          //     ideas created within 1 week of the current date and get user who created the idea
          const ideasCreatedByUser = ideas.filter((idea) => {
            return idea.createdBy.toString() === users[i]._id.toString();
          }).length;

          console.log("ideasCreatedByUser", ideasCreatedByUser);

          //     tests created within 1 week of the current date and get user who created the test
          const testsCreatedByUser = tests.filter((test) => {
            return test.createdBy.toString() === users[i]._id.toString();
          }).length;

          // get all ideas created by user and count total nominations

          console.log("users[i]._id.toString()", users[i]._id.toString());
          

          const ideasNominated = ideas.filter((idea) => {
            return (
              idea.nominations?.length > 0 &&
              idea.nominations?.includes(users[i]._id.toString())
              // idea.createdBy.toString() === users[i]._id.toString()
            );
          }).length;
          // get all tests created by user and count total nominations

          userData.push({
            user: users[i],
            ideasCreated: ideasCreatedByUser,
            testsCreated: testsCreatedByUser,
            nominations: ideasNominated,
          });
        }

        res.status(200).json({
          message: "Growth Health fetched successfully",
          payload: {
            ideasCreated: ideas.length,
            testsCreated: tests.length,
            learningsCreated: learnings.length,
            projectCount: count,
            userData,
          },
        });
      }
      if (span == 4) {
        // find all learnings , tests ideas and goals created within the last 1 week and group by team
        const ideas = await Idea.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(4, "weeks").toDate(),
          },
        });
        const tests = await Test.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(4, "weeks").toDate(),
          },
        });
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(4, "weeks").toDate(),
          },
        });

        // console.log("learnings 4", learnings);

        // get all users and count the number of ideas, tests and learnings created within the last 1 week and group by user and get user id
        for (let i = 0; i < users.length; i++) {
          //     ideas created within 1 week of the current date and get user who created the idea
          const ideasCreatedByUser = ideas.filter((idea) => {
            return idea.createdBy.toString() === users[i]._id.toString();
          }).length;

          // console.log("ideasCreatedByUser 4", ideasCreatedByUser);


          //     tests created within 1 week of the current date and get user who created the test
          const testsCreatedByUser = tests.filter((test) => {
            return test.createdBy.toString() === users[i]._id.toString();
          }).length;

          // get all ideas created by user and count total nominations

          const ideasNominated = ideas.filter((idea) => {
            return (
              idea.nominations?.length > 0 &&
              idea.nominations?.includes(users[i]._id.toString())
            );
          }).length;

          project.workedLearnings = learnings.filter(
            (learning) => learning.result === "Successful"
          ).length;
          project.didntWorkedLearnings = learnings.filter(
            (learning) => learning.result === "Unsuccessful"
          ).length;

          project.inconclusiveLearnings = learnings.filter(
            (learning) => learning.result === "Inconclusive"
          ).length;

          // get all tests created by user and count total nominations


          userData.push({
            user: users[i],
            ideasCreated: ideasCreatedByUser,
            testsCreated: testsCreatedByUser,
            nominations: ideasNominated,
            workedLearnings: project.workedLearnings,
            didntWorkedLearnings: project.didntWorkedLearnings,
            inconclusiveLearnings: project.inconclusiveLearnings
          });
        }

        console.log("userData", userData);

        res.status(200).json({
          message: "Growth Health fetched successfully",
          payload: {
            ideasCreated: ideas.length,
            testsCreated: tests.length,
            projectCount: count,
            learningsCreated: learnings.length,
            userData,
          },
        });
      }
      if (span == 6) {
        // find all learnings , tests ideas and goals created within the last 1 week and group by team
        const ideas = await Idea.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(6, "weeks").toDate(),
          },
        });
        const tests = await Test.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(6, "weeks").toDate(),
          },
        });
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(6, "weeks").toDate(),
          },
        });

        // get all users and count the number of ideas, tests and learnings created within the last 1 week and group by user and get user id
        for (let i = 0; i < users.length; i++) {
          //     ideas created within 1 week of the current date and get user who created the idea
          const ideasCreatedByUser = ideas.filter((idea) => {
            return idea.createdBy.toString() === users[i]._id.toString();
          }).length;

          //     tests created within 1 week of the current date and get user who created the test
          const testsCreatedByUser = tests.filter((test) => {
            return test.createdBy.toString() === users[i]._id.toString();
          }).length;

          // get all ideas created by user and count total nominations

          const ideasNominated = ideas.filter((idea) => {
            return (
              idea.nominations?.length > 0 &&
              idea.nominations?.includes(users[i]._id.toString())
            );
          }).length;
          // get all tests created by user and count total nominations

          userData.push({
            user: users[i],
            ideasCreated: ideasCreatedByUser,
            testsCreated: testsCreatedByUser,
            nominations: ideasNominated,
          });
        }

        res.status(200).json({
          message: "Growth Health fetched successfully",
          payload: {
            ideasCreated: ideas.length,
            testsCreated: tests.length,
            projectCount: count,
            learningsCreated: learnings.length,
            userData,
          },
        });
      }
      if (span == 8) {
        // find all learnings , tests ideas and goals created within the last 1 week and group by team
        const ideas = await Idea.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(8, "weeks").toDate(),
          },
        });
        const tests = await Test.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(8, "weeks").toDate(),
          },
        });
        const learnings = await Learning.find({
          project: id,
          createdAt: {
            $gte: moment().subtract(8, "weeks").toDate(),
          },
        });

        // get all users and count the number of ideas, tests and learnings created within the last 1 week and group by user and get user id
        for (let i = 0; i < users.length; i++) {
          //     ideas created within 1 week of the current date and get user who created the idea
          const ideasCreatedByUser = ideas.filter((idea) => {
            return idea.createdBy.toString() === users[i]._id.toString();
          }).length;

          //     tests created within 1 week of the current date and get user who created the test
          const testsCreatedByUser = tests.filter((test) => {
            return test.createdBy.toString() === users[i]._id.toString();
          }).length;

          // get all ideas created by user and count total nominations

          const ideasNominated = ideas.filter((idea) => {
            return (
              idea.nominations?.length > 0 &&
              idea.nominations?.includes(users[i]._id.toString())
            );
          }).length;
          // get all tests created by user and count total nominations

          userData.push({
            user: users[i],
            ideasCreated: ideasCreatedByUser,
            testsCreated: testsCreatedByUser,
            nominations: ideasNominated,
          });
        }

        res.status(200).json({
          message: "Growth Health fetched successfully",
          payload: {
            ideasCreated: ideas.length,
            testsCreated: tests.length,
            projectCount: count,
            learningsCreated: learnings.length,
            userData,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  },
};
