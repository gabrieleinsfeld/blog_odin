const { Router } = require("express");
const postRouter = Router();
const db = require("../db/queries");
const prisma = require("../db/prisma");

// Render the login page

function authenticateAuthor(req, res, next) {
  const { author } = req.user;
  if (author) {
    next();
  } else {
    res.json({ messgae: "Access Denied" });
  }
}

postRouter.get("/", async (req, res) => {
  const posts = await db.getPosts(req.user.author.id);
  res.json(posts);
});

postRouter.post("/", authenticateAuthor, async (req, res) => {
  try {
    const { title, content } = req.body;
    const id = req.user.author.id;
    await db.createPost(title, content, id);
    res.json({ message: "Post Created" });
  } catch (err) {
    res.status(500).json({ message: "User was not able to be created", err });
  }
});

postRouter.put("/", authenticateAuthor, async (req, res) => {
  try {
    const { title, content, id } = req.body;
    await db.updatePost(title, content, id);
    res.json({ message: "Post Updated" });
  } catch (err) {
    res.status(500).json({ message: "User was not able to be created", err });
  }
});

postRouter.delete("/", authenticateAuthor, async (req, res) => {
  try {
    const { id } = req.body;
    await db.deletePost(id);
    res.json({ message: "Post Deleted" });
  } catch (err) {
    res.status(500).json({ message: "User was not able to be created", err });
  }
});

module.exports = postRouter;
