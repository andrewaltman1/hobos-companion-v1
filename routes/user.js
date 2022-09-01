const express = require("express");
const router = express.Router();
const auth = require("../auth.js");
const { login, isAdmin, isLoggedIn } = require("../middleware");
const { catchAsync, toCamel } = require("../utils");
const Show = require("../models/show");
const User = require("../models/user");

router.get("/coming-soon", (req, res) => {
  res.render("coming-soon", { user: req.user });
});

// auth for new users is working but password reset funtionality needs to be implemented

// router.get("/signup", (req, res) => {
//   res.render("signup");
// });

// router.post("/signup", auth.crypto);

// router.get("/login", (req, res) => {
//   res.render("login", { msg: res.locals.messages });
// });

// router.post(
//   "/login/password",
//   auth.passport.authenticate("local", {
//     failureRedirect: "/login",
//     failureMessage: true,
//   }),
//   login
// );

// router.post("/logout", function (req, res, next) {
//   req.logout();
//   res.redirect("/");
// });

module.exports = router;
