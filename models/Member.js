const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const memberSchema = new Schema(
  {
    membername: {
      type: String,
      unique: true,
      default: function () {
        return this.googleId ? `user_${this.googleId}` : null;
      },
    },
    password: {
      type: String,
      default: function () {
        return this.googleId ? `password_${this.googleId}` : null;
      },
    },
    name: { type: String },
    YOB: { type: Number },
    googleId: { type: String, default: null },
    email: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

memberSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

memberSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Member", memberSchema);
