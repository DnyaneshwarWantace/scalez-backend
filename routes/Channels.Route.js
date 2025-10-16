const router = require("express").Router();
const Controller = require("../controllers/Channels.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");


router.post("/create-channel/:id", verifyAccessToken, Controller.createChannel);
router.get("/get-channels", verifyAccessToken, Controller.getAllChannels);
router.get("/get-channel/:id", verifyAccessToken, Controller.getChannel);
router.put("/update-channel/:id", verifyAccessToken, Controller.updateChannel);
router.delete("/delete-channel/:id", verifyAccessToken, Controller.deleteChannel);


module.exports = router;