const router = require("express").Router();
const Role = require("../controllers/Role.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/create", verifyAccessToken, Role.createRole);
router.get("/read", verifyAccessToken, Role.readRoles);
router.put("/update/:id", verifyAccessToken, Role.updateRole);
router.delete("/delete/:id", verifyAccessToken, Role.deleteRole);
router.get("/findrole/:id", verifyAccessToken, Role.findRole);

module.exports = router;
