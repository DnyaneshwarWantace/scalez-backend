const router = require("express").Router();
const Controller = require("../controllers/Idea.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");
const ShareIdea = require("../controllers/ShareIdea.Controller");

router.post("/create", verifyAccessToken, Controller.createIdea);
router.post("/createMultipleIdeas", verifyAccessToken, Controller.createMultipleIdeas);
router.get("/read/:projectId", verifyAccessToken, Controller.getAllIdeas);
router.get(
  "/readByGoals/:projectId",
  verifyAccessToken,
  Controller.readAllGoalsBasedIdeas
);
router.put("/nominate/:id", verifyAccessToken, Controller.nominateIdea);
router.put("/unnominate/:id", verifyAccessToken, Controller.unnominateIdea);
router.put("/test/:id", verifyAccessToken, Controller.testIdea);
router.get("/readOne/:id", verifyAccessToken, Controller.readIdea);
router.post("/addComment/:id", verifyAccessToken, Controller.addComment);
router.put("/updateComment/:id", verifyAccessToken, Controller.editComment);
router.delete(
  "/deleteComment/:id",
  verifyAccessToken,
  Controller.deleteComment
);
router.put("/update/:id", verifyAccessToken, Controller.updateIdea);
router.delete("/delete/:id", verifyAccessToken, Controller.deleteIdea);

// share idea
router.get("/read/public/:id", ShareIdea.readIdeaPublic);
router.get("/read/private/:id", verifyAccessToken, ShareIdea.readIdeaPrivate);
router.post("/readAllIdeas", verifyAccessToken, Controller.getMultipleIdeas);

module.exports = router;
