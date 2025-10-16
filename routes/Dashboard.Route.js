const router = require("express").Router();
const Controller = require("../controllers/Dashboard.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.get("/readTasks", verifyAccessToken, Controller.readAll);
router.get("/readCheckins", verifyAccessToken, Controller.readKeymetrics);
router.get("/readTests", verifyAccessToken, Controller.readAllTests);
router.get("/readGoals", verifyAccessToken, Controller.readGoals);
router.get("/readLearnings", verifyAccessToken, Controller.readAllLearnings);
router.put("/update-widgets", verifyAccessToken, Controller.updateWidgets);
router.get("/readIdeas", verifyAccessToken, Controller.readAllIdeas);

module.exports = router;
