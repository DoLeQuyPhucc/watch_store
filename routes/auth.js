const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  getLogout,
} = require("../controllers/authController");

// Register route
router.get("/register", getRegister);
router.post("/register", postRegister);

// Login route
router.get("/login", getLogin);
router.post("/login", postLogin);

// Logout route
router.get("/logout", getLogout);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success_msg", "You are now logged in");
    res.redirect("/");
  }
);

module.exports = router;
