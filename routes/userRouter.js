const { Router } = require("express");
const userRouter = Router();
const db = require("../db/queries");
const prisma = require("../db/prisma");
require("dotenv").config();
// Render the login page

userRouter.get("/", (req, res) => {
  res.json({ user: req.user });
});

userRouter.put("/turn-into-author", async (req, res) => {
  const { id } = req.user;
  const { password } = req.body;
  if (password == process.env.PASSWORD_AUTHOR) {
    const userType = "author";
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { userType },
    });
    await prisma.author.create({
      data: { userId: updatedUser.id },
    });
    res.json(updatedUser);
  } else {
    res.json({ message: "Not allowed" });
  }
});

userRouter.put("/", async (req, res) => {
  const { id } = req.user;
  const { firstName, lastName, username } = req.body;
  try {
    await db.updateUser(id, firstName, lastName, username);
    res.json({ message: "User Updated" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

userRouter.put("/password", async (req, res) => {
  const { id } = req.user;
  const { password } = req.body;

  try {
    await db.updateUserPassword(id, password);
    res.json({ message: "Password Updated" });
  } catch (err) {
    res.json({ err });
  }
});

userRouter.delete("/:username", async (req, res) => {
  const username = req.params.username;
  try {
    await db.deleteUser(username);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = userRouter;
