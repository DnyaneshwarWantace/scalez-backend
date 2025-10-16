const router = require("express").Router();
const Controller = require("../controllers/Project.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/create", verifyAccessToken, Controller.create);
router.get("/read", verifyAccessToken, Controller.getAll);
router.patch("/status/:id", verifyAccessToken, Controller.updateStatus);
router.delete("/delete/:id", verifyAccessToken, Controller.delete);
router.patch("/archive/:id", verifyAccessToken, Controller.archive);
router.patch("/unarchive/:id", verifyAccessToken, Controller.unarchive);
router.get("/readArchived", verifyAccessToken, Controller.getArchived);
router.put("/update/:id", verifyAccessToken, Controller.update);
router.get("/readusers/:id", verifyAccessToken, Controller.getUsers);
router.get(
  "/readCollaborators/:id",
  verifyAccessToken,
  Controller.getCollaborators
);
router.delete("/deleteUserId/:id", verifyAccessToken, Controller.deleteUserId);
router.post("/deleteMultiple", verifyAccessToken, Controller.deleteMultipleProjects);
router.post("/createProjects", verifyAccessToken, Controller.createMultipleProjects);



module.exports = router;
