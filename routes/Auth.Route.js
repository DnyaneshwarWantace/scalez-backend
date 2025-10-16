const router = require("express").Router();
const Controller = require("../controllers/Auth.Controller");

const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/create", Controller.create);
router.post("/login", Controller.login);
router.post("/forgot-password", Controller.sendForgotPasswordLink);
router.post("/reset-password", Controller.setNewPassword);
router.post("/uploadProfilePicture", verifyAccessToken, Controller.updateProfilePicture);
router.delete("/deleteProfilePicture", verifyAccessToken, Controller.deleteProfilePicture);

router.get("/readUsers", verifyAccessToken, Controller.read);
router.get("/readIncompleteProfile/:token", Controller.readProfileByToken);
router.put("/CompleteProfile/:token", Controller.updateProfileByToken);

router.put("/updateProfile", verifyAccessToken, Controller.updateProfile);
router.put("/updatePassword", verifyAccessToken, Controller.updatePassword);

router.put("/updateCompany", verifyAccessToken, Controller.updateCompany);
router.post("/uploadFevicon", verifyAccessToken, Controller.updateFeviconPicture);
router.post("/uploadLogo", verifyAccessToken, Controller.updateLogoPicture);
router.delete("/deleteFevicon", verifyAccessToken, Controller.deleteFeviconPicture);
router.delete("/deleteLogo", verifyAccessToken, Controller.deleteLogoPicture);




router.put("/updateNotificationSettings", verifyAccessToken, Controller.updateNotificationSettings);
router.get("/me", verifyAccessToken, Controller.me);

module.exports = router;
