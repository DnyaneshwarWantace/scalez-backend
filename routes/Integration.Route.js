const router = require("express").Router();
const Controller = require("../controllers/Integration.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.get("/read", verifyAccessToken, Controller.readAllIntegrations);
router.post("/create", verifyAccessToken, Controller.createIntegration);
router.delete("/delete", verifyAccessToken, Controller.deleteIntegration);

module.exports = router;
