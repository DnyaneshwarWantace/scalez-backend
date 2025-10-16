const router = require("express").Router();
const Controller = require("../controllers/Category.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/create", verifyAccessToken, Controller.create);
router.post("/update/:id", verifyAccessToken, Controller.update);
router.delete("/delete/:id", verifyAccessToken, Controller.delete);
router.patch("/mark/:id", verifyAccessToken, Controller.markChecked);

module.exports = router;
