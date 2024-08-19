const { Router } = require("express");
const likeRouter = Router();
const db = require("../db/queries");
const passport = require("passport");

likeRouter.get("/post/:postId", async (req, res) => {
  const likes = await db.getLikesOnPost(req.params.postId);
  res.json({ likes });
});

likeRouter.get(
  "/post/status/:postId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.user;
    const { liked, likeId } = await db.getLikesOnPostStatus(
      id,
      req.params.postId
    );
    res.json({ liked, likeId });
  }
);

likeRouter.get("/comment/:messageId", async (req, res) => {
  const likes = await db.getLikesOnComment(req.params.messageId);
  res.json({ likes });
});

likeRouter.post(
  "/comment",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { messageId } = req.body;
      const { id } = req.user;
      await db.createLikeOnComment(id, messageId);
      res.json({ message: "Liked Comment" });
    } catch (err) {
      res.status(500).json({ message: "", err: err.message });
    }
  }
);

likeRouter.post(
  "/post",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { postId } = req.body;
      const { id } = req.user;
      const like = await db.createLikeOnPost(id, postId);
      res.json({ message: "Liked Post", like });
    } catch (err) {
      res.status(500).json({ message: "", err: err.message });
    }
  }
);

likeRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const id = req.params.id;
    await db.deleteLike(id);
    res.json({ message: "Like deleted" });
  }
);

module.exports = likeRouter;
