const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Member = require("../models/Member");
require("dotenv").config();

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "membername" },
      async (membername, password, done) => {
        const member = await Member.findOne({ membername });
        if (!member) {
          return done(null, false, { message: "No member found" });
        }
        const isMatch = await member.matchPassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, member);
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const newMember = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        };

        try {
          let member = await Member.findOne({ googleId: profile.id });

          if (member) {
            done(null, member);
          } else {
            member = await Member.create(newMember);
            done(null, member);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.serializeUser((member, done) => {
    done(null, member.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const member = await Member.findById(id);
      done(null, member);
    } catch (err) {
      done(err, null);
    }
  });
};
