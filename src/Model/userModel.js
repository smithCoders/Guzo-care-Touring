const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  photo: String,
  role: {
    type: String,
    default: "user",
  },
  password: {
    type: String,
    required: [
      function () {
        // Validation function: only require during new document creation or if the field is explicitly set
        return this.isNew || this.isModified("password");
      },
      "Please provide your password",
    ],
    minLength: [8, "your password should be grater than 7 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [
      function () {
        // Require passwordConfirm if password is explicitly being set
        return this.isModified("password");
      },
      "Please confirm your password",
    ],
    validate: {
      validator: function (el) {
        return !this.isNew || el === this.password;
      },
      message: "Passwords do not match",
    },
    // ...
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    deafult: true,
    select: false,
  },
});

// Password encryption middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.passwordChangedAt = Date.now() - 1000;

  try {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
  } catch (err) {
    return next(err);
  }
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
});
// Password comparison method for authentication
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
// QUERY-PARAMS=>used to make the userModel insync.
userSchema.pre(/^find/, function (next) {
  //   /^find/====>  this find all query start  with  find
  // this points to the current query.
  this.find({ active: { $ne: false } });
  next();
});
// Check if the password was changed after a certain timestamp
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
// PASSWORD reset generator.
userSchema.methods.createPasswordResetGenerator = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // 10min=10*60s*1000ms
  this.passwordResetExpires = Date.now() + 20 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetExpires);
  return resetToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
