const router = require("express").Router();
const Controller = require("../controllers/Management.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.get("/readUsers", verifyAccessToken, Controller.getAllUsers);
router.get(
  "/readRegisteredUsers",
  verifyAccessToken,
  Controller.readRegisteredUsers
);
 router.post("/inviteUser", verifyAccessToken, Controller.inviteUser);
router.post(
  "/inviteCollaborator",
  verifyAccessToken,
  Controller.inviteCollaborator
);
router.get(
  "/readCollaborators",
  verifyAccessToken,
  Controller.getAllCollaborators
);

router.put("/updateUser/:id", verifyAccessToken, Controller.updateUser);

module.exports = router;
