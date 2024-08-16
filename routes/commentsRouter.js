const { Router } = require("express");
const commentRouter = Router();
const db = require("../db/queries");

commentRouter.get("/:postId", async (req, res) => {
  const comments = await db.getCommentsByUserPostId(req.params.postId);
  res.json(comments);
});

commentRouter.get("/", async (req, res) => {
  const comments = await db.getCommentsByUserId(req.user.id);
  res.json(comments);
});

commentRouter.post("/", async (req, res) => {
  try {
    const { message, postId } = req.body;
    const id = req.user.id;
    await db.createComment(message, postId, id);
    res.json({ message: "Comment Created" });
  } catch (err) {
    res.status(500).json({ message: "", err: err.message });
  }
});

commentRouter.put("/", async (req, res) => {
  try {
    const { message, messageId } = req.body;
    await db.updateComment(message, messageId);
    res.json({ message: "Comment Updated" });
  } catch (err) {
    res.status(500).json({ message: "", err });
  }
});

commentRouter.delete("/", async (req, res) => {
  try {
    const { messageId } = req.body;
    await db.deleteComment(messageId);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "", err });
  }
});

module.exports = commentRouter;
