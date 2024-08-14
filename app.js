const express = require("express");
const app = express();

const path = require("node:path");
const assetsPath = path.join(__dirname, "public");

const { sessionMiddleware, initializePassport } = require("./auth");

app.use(sessionMiddleware());
app.use(...initializePassport());

require("dotenv").config();

// Views and req
app.use(express.static(assetsPath));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

// Routes
const mainRouter = require("./routes/mainRouter");
app.use("/", mainRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));
