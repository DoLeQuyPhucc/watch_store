module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "404 Not Found!!");
    res.redirect("/");
  },
  ensureAdmin: function (req, res, next) {
    if (req.user.isAdmin) {
      return next();
    }
    req.flash("error_msg", "Admin privileges required");
    res.redirect("/");
  },
};
