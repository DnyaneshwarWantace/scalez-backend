const router = require("express").Router();
const Controller = require("../controllers/Plan.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/create", verifyAccessToken, Controller.create);
router.get("/read", verifyAccessToken, Controller.getAll);
router.put("/update/:id", verifyAccessToken, Controller.update);
router.delete("/delete/:id", verifyAccessToken, Controller.delete);
router.post("/addUser/:id", verifyAccessToken, Controller.addUsers);
router.get("/readUsers/:id", verifyAccessToken, Controller.readUsers);
router.post("/deleteUser/:id", verifyAccessToken, Controller.deleteUser);

// external plans
router.post("/createExternal", verifyAccessToken, Controller.createAdminPlan);
router.get("/readExternal", verifyAccessToken, Controller.readExternalPlans);
router.patch("/mark/:id", verifyAccessToken, Controller.markChecked);

module.exports = router;
