const router = require("express").Router();
const Controller = require("../controllers/Learning.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.get("/read/:id", verifyAccessToken, Controller.readAll);
router.get("/readOne/:id", verifyAccessToken, Controller.readOne);
router.put("/update/:id", verifyAccessToken, Controller.update);
router.put("/sendBackToTest/:id", verifyAccessToken, Controller.sendBack);

router.post("/addComment/:id", verifyAccessToken, Controller.addComment);
router.put("/updateComment/:id", verifyAccessToken, Controller.editComment);
router.delete(
  "/deleteComment/:id",
  verifyAccessToken,
  Controller.deleteComment
);
router.put("/updateLearningTask/:id", verifyAccessToken, Controller.updateLearningTask);

module.exports = router;
