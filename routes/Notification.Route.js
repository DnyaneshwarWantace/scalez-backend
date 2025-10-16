const router = require("express").Router();
const Controller = require("../controllers/Notification.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.get("/read", verifyAccessToken, Controller.readNotifications);
router.put("/mark/:id", verifyAccessToken, Controller.markNotification);

module.exports = router;
