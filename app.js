var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Method Override
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

// Config passport
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
require("./config/Passport")(passport);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Helper to handlebars
const hbs = require("hbs");

hbs.registerPartials(__dirname + "/views/partials");

hbs.registerHelper("eq", function (a, b) {
  return a.equals(b);
});

hbs.registerHelper("containerColorClass", function (index) {
  return "container-" + (index % 4);
});

// Connect to DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log(
      `MongoDB connected, Listening on port: http://localhost:${process.env.PORT}. Ready to gooo!!`
    )
  )
  .catch((err) => console.log(err));

// Define routes
app.use("/", require("./routes/public"));
app.use("/auth", require("./routes/auth"));
app.use("/admin", require("./routes/admin"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.use((req, res, next) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

module.exports = app;
