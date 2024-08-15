const { Router } = require("express");
const userRouter = Router();
const db = require("../db/queries");
const prisma = require("../db/prisma");

// Render the login page

userRouter.get("/", (req, res) => {
  res.json({ user: req.user });
});

userRouter.post("/", async (req, res) => {
  const { firstName, lastName, username, password } = req.body;
  await db.createUser(firstName, lastName, username, password);

  const user = await prisma.user.findUnique({ where: { username } });
  await prisma.normal.create({
    data: {
      userId: user.id,
    },
  });
  res.json({ user: user });
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
