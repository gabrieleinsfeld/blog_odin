const { Router } = require("express");
const usersController = require("../controllers/userController");
const mainRouter = Router();
const passport = require("passport");

// Render the login page

mainRouter.get("/", (req, res) => {
  res.render("index");
});
mainRouter.get("/log-in", (req, res) => {
  res.render("log-in");
});

// Handle login form submission
mainRouter.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  })
);

mainRouter.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

mainRouter.get("/sign-up", usersController.signUpGet);
mainRouter.post("/sign-up", usersController.signUpPost);

module.exports = mainRouter;
