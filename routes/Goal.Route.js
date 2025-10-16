const router = require("express").Router();
const Controller = require("../controllers/Goal.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/create", verifyAccessToken, Controller.create);
router.post("/createMultiple", verifyAccessToken, Controller.createMultipleGoals);
router.get("/read/:id", verifyAccessToken, Controller.read);
router.post("/requestIdeas/:id", verifyAccessToken, Controller.requestIdeas);
router.get("/readOne/:id", verifyAccessToken, Controller.readById);

router.put("/updateValue/:id", verifyAccessToken, Controller.updateMetric);
router.put(
  "/updateStatus/:id",
  verifyAccessToken,
  Controller.updateKeymetricStatus
);
router.post("/addComment/:id", verifyAccessToken, Controller.addComment);
router.put("/updateComment/:id", verifyAccessToken, Controller.editComment);
router.delete(
  "/deleteComment/:id",
  verifyAccessToken,
  Controller.deleteComment
);
router.put("/update/:id", verifyAccessToken, Controller.update);
router.delete("/delete/:id", verifyAccessToken, Controller.delete);

router.put("/update-metric/:id", verifyAccessToken, Controller.editMetric);
router.delete("/delete-metric/:id", verifyAccessToken, Controller.deleteMetric);
router.post("/readAll", verifyAccessToken, Controller.readAllGoals);

module.exports = router;
