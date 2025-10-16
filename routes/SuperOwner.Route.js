const router = require("express").Router();
const Controller = require("../controllers/SuperOwner.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/create", Controller.create);
router.post("/login", Controller.login);
router.post("/invite", verifyAccessToken, Controller.createCustomer);
router.get("/readCustomers", verifyAccessToken, Controller.readCustomers);
router.put("/disableCustomer/:id", verifyAccessToken, Controller.disableCustomer);
router.put("/enableCustomer/:id", verifyAccessToken, Controller.enableCustomer);
router.put("/editCustomer/:id", verifyAccessToken, Controller.editCustomer);
router.get("/reset-password-request", Controller.getAllResetPasswordRequests);
router.delete("/reset-password-request", Controller.discardResetPasswordRequest);

module.exports = router;
