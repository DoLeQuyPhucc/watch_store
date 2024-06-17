const passport = require("passport");
const { body, validationResult } = require("express-validator");
const Member = require("../models/Member");

// Register route
const getRegister = (req, res) => {
  res.render("register");
};

const postRegister = [
  body("membername", "Username must be at least 10 characters long.")
    .trim()
    .isLength({ min: 10 })
    .escape(),
  body("password", "Password must be at least 3 characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("name", "Name must be at least 4 characters long.")
    .trim()
    .isLength({ min: 4 })
    .escape(),
  body("YOB", "Year of Birth must be a valid year.")
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array()); // Log validation errors for debugging
      return res.status(400).render("register", { errors: errors.array() });
    }

    const { membername, password, name, YOB } = req.body;

    try {
      const existingUser = await Member.findOne({ membername });
      if (existingUser) {
        console.log("Username already exists");
        return res
          .status(400)
          .render("register", { errors: [{ msg: "Username already exists" }] });
      }

      const member = new Member({ membername, password, name, YOB });
      await member.save();

      req.flash("success_msg", "You are now registered and can log in");
      res.redirect("/auth/login");
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).render("register", { errors: [{ msg: "Server error" }] });
    }
  },
];

// Login route
const getLogin = (req, res) => {
  res.render("login");
};

const postLogin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/auth/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success_msg", "You are now logged in");
      return res.redirect("/");
    });
  })(req, res, next);
};

// Logout route
const getLogout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You are logged out");
    res.redirect("/auth/login");
  });
};

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  getLogout,
};
