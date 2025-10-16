const router = require("express").Router();
const Controller = require("../controllers/TimeZone.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.get("/read", verifyAccessToken, Controller.read);
router.post("/update", verifyAccessToken, Controller.update);

module.exports = router;
