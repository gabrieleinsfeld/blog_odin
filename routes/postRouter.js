const { Router } = require("express");
const postRouter = Router();
const db = require("../db/queries");
const prisma = require("../db/prisma");
const passport = require("passport");

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
  const posts = await db.getPosts();
  res.json(posts);
});

postRouter.get("/:postId", async (req, res) => {
  const posts = await db.getPost(req.params.postId);
  res.json(posts);
});

postRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authenticateAuthor,
  async (req, res) => {
    try {
      const { title, content, description, img } = req.body;
      const id = req.user.author.id;
      await db.createPost(title, content, id, description, img);
      res.json({ message: "Post Created" });
    } catch (err) {
      res.status(500).json({ message: "User was not able to be created", err });
    }
  }
);

postRouter.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  authenticateAuthor,
  async (req, res) => {
    try {
      const { title, content, id, description, img } = req.body;
      await db.updatePost(title, content, id, description, img);
      res.json({ message: "Post Updated" });
    } catch (err) {
      res.status(500).json({ message: "User was not able to be created", err });
    }
  }
);

postRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authenticateAuthor,
  async (req, res) => {
    try {
      const id = req.params.id;

      await db.deletePost(id);
      res.json({ message: "Post Deleted" });
    } catch (err) {
      res.status(500).json({ message: "User was not able to be created", err });
    }
  }
);

module.exports = postRouter;
