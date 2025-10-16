const router = require("express").Router();
const Controller = require("../controllers/Threads.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");


router.post("/create-thread/:id", verifyAccessToken, Controller.createThread);
router.get("/get-threads/:id", verifyAccessToken, Controller.getAllThreads);
router.get("/get-thread/:id", verifyAccessToken, Controller.getThread);
router.put("/update-thread/:id", verifyAccessToken, Controller.updateThread);
router.delete("/delete-thread/:id", verifyAccessToken, Controller.deleteThread);


router.post("/addComment/:id", verifyAccessToken, Controller.addComment);
router.get("/get-comments", verifyAccessToken, Controller.getAllComments);
router.get("/get-comment/:id", verifyAccessToken, Controller.getComment);
router.put("/updateComment/:id", verifyAccessToken, Controller.editComment);
router.delete(
  "/deleteComment/:id",
  verifyAccessToken,
  Controller.deleteComment
);
router.post("/:threadid/addReply/:id", verifyAccessToken, Controller.addReply);
router.get("/:threadid/get-reply/:id", verifyAccessToken, Controller.getReply);
router.put("/:threadid/edit-reply/:commentid/:replyid", verifyAccessToken, Controller.editReply);
router.delete(
  "/:threadid/delete-reply/:id",
  verifyAccessToken,
  Controller.deleteReply
);
router.post("/like-thread/:id", verifyAccessToken, Controller.likeThread);
router.get("/get-likedby-users/:id", verifyAccessToken, Controller.getRecentlyLikedUsersData);
router.post("/read-thread/:id", verifyAccessToken, Controller.postReadThreads);

module.exports = router;