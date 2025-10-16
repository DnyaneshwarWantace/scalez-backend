const router = require("express").Router();
const Controller = require("../controllers/Analytics.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.get("/read", verifyAccessToken, Controller.read);
router.get(
  "/readAdminAnalytics",
  verifyAccessToken,
  Controller.readAdminAnalytics
);

module.exports = router;
