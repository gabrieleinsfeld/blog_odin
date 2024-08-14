const db = require("../db/queries");
const { body, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");

const validateUser = [
  body("first_name")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage(`Youtuber name has to be between 1 and 30 characters`),
  body("last_name")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage(`Youtuber Channel has to be between 1 and 30 characters`),
  body("username")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage(`Topic name has to be between 1 and 30 characters`),
];

async function signUpPost(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("log-in", {
      title: "Failed to update Youtuber:",
      errors: errors.array(),
    });
  }
  console.log(req.body.password, req.body.confirmed_password);
  if (req.body.password === req.body.confirmed_password) {
    bcryptjs.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        res.redirect("index", { errors: [{ error: err }] });
      }
      await db.insertUser(
        req.body.first_name,
        req.body.last_name,
        req.body.username,
        hashedPassword
      );
      console.log("user inserted");
    });
    res.render("log-in");
  } else {
    res.render("signUp", {
      title: "Failed to update Youtuber:",
      errors: "Password is not the same",
    });
  }
}

function signUpGet(req, res) {
  res.render("signUp");
}

function mainGet(req, res) {
  res.render("index");
}

module.exports = {
  signUpPost: [validateUser, signUpPost],
  signUpGet,
  signUpPost,
};
