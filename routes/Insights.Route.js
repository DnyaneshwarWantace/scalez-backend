const router = require("express").Router();
const Controller = require("../controllers/Insight.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.get(
  "/getIdeasAndTests/:id",
  verifyAccessToken,
  Controller.getIdeasAndTests
);
router.get(
  "/getLearningsChart/:id",
  verifyAccessToken,
  Controller.getAllLearnings
);

router.get(
  "/getLearningslever/:id",
  verifyAccessToken,
  Controller.getLearningsByGrowthLever
);

router.get(
  "/teamparticipation/:id",
  verifyAccessToken,
  Controller.getTeamParticipation
);

router.get("/getGrowth/:id", verifyAccessToken, Controller.getGrowthHealth);

module.exports = router;
