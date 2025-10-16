const router = require("express").Router();
const Controller = require("../controllers/Test.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.get("/read/:projectId", verifyAccessToken, Controller.readTests);
router.put("/updateStatus/:testId", verifyAccessToken, Controller.updateStatus);
router.put("/updateIdea/:testId", verifyAccessToken, Controller.updateIdea);
router.put("/updateTest/:testId", verifyAccessToken, Controller.editTest);
router.get("/readOne/:testId", verifyAccessToken, Controller.readTest);
router.post("/sendback/:testId", verifyAccessToken, Controller.sendTestBack);
router.post(
  "/movetolearning/:testId",
  verifyAccessToken,
  Controller.moveToLearning
);

router.post("/addComment/:id", verifyAccessToken, Controller.addComment);
router.put("/updateComment/:id", verifyAccessToken, Controller.editComment);
router.delete(
  "/deleteComment/:id",
  verifyAccessToken,
  Controller.deleteComment
);
router.put(
  "/updateTestStatus/:id",
  verifyAccessToken,
  Controller.updateTestStatus
);

module.exports = router;
