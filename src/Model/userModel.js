const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "please provide your email"],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide valid email address"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "please provide  us your password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "please  confirm your password"],
    minLength: 8,
    validate: {
      // this fuction only  ork on CREATE AND SAVE methods
      validator: function (el) {
        // check if the current password is same as the prev password.
        return el === this.password;
      },
      message: "password aren't the same",
    },
  },
});
//   password encription.
userSchema.pre("save", async function (next) {
  const user = this;
  // run if the password is modified

  if (user.isModified("password")) {
    try {
      user.password = await bcrypt.hash(user.password, 12);
    } catch (err) {
      return next(err);
    }
  }
  //   removing passwordConform from DB.
  this.passwordConfirm = undefined;
  next();
});
// password compare.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model("User", userSchema);
module.exports = User;
