const express = require("express");
const router = express.Router();
const auth = require("../auth.js");
const { login } = require("../middleware");
const view = require("../view.js");

router.get("/coming-soon", (req, res) => {
  res.render("simple-message", view.comingSoon(req));
});

// auth for new users is working but password reset funtionality needs to be implemented

router.get("/signup", (req, res) => {
  res.render("user", view.signUp(req, res));
});

router.post("/signup", auth.crypto);

router.get("/login", (req, res) => {
  res.render("user", view.login(req, res));
});

router.post(
  "/login/password",
  auth.passport.authenticate("local", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  login
);

router.post("/logout", function (req, res, next) {
  req.logout();
  res.redirect("/");
});

router.get("/about", (req, res) => {
  res.render("simple-message", view.about(req))
})

module.exports = router;
