const { Router } = require("express");
const route = Router();

// Render the login page

route.get("/folder", (req, res) => {
  res.send("HI");
});

module.exports = route;
