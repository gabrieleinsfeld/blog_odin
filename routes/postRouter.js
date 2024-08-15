const { Router } = require("express");
const postRouter = Router();
const db = require("../db/queries");
const prisma = require("../db/prisma");

// Render the login page

postRouter.get("/", (req, res) => {});

postRouter.post("/", async (req, res) => {});

postRouter.put("/", async (req, res) => {});

postRouter.delete("/", async (req, res) => {});

module.exports = postRouter;
