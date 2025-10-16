const router = require("express").Router();
const Controller = require("../controllers/Feedback.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/create", verifyAccessToken, Controller.create);
router.get("/read", verifyAccessToken, Controller.getAll);
router.put("/resolve/:id", verifyAccessToken, Controller.resolve);

module.exports = router;
