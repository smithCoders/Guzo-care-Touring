const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../Model/userModel");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appErrors");
const sendEmail = require("../utils/email");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIREs_IN,
  });
};

const validateRole = (role) => {
  const allowedRoles = ["user", "admin", "lead-guide", "guide"];

  // if (!allowedRoles.includes(role)) {
  //   throw new Error("Invalid role. Please provide a valid role.");
  // }
};

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;

  // Validate the role
  validateRole(role);

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role, // Assign the role provided in the request body
  });

  const token = signToken(newUser._id);
  res.status(201).json({ status: "success", token, data: { user: newUser } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if email and password exist.
  if (!email || !password) {
    return next(new appError("please provide email and password", 400));
  }

  // 2) check if user exist and password is correct.
  //   used to  find user with his email and passord(but the password is exported implicitly  without sedning to client)
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError("incorrect email or password", 401));
  }
  console.log(user);
  const token = signToken(user._id);
  //   3.send res and token when user login.
  res.status(200).json({ status: "sucess", token });
});
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting tokens and checking if it's there.

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // // If no token is found, return an error.
  if (!token) {
    return next(
      new appError("You are not logged in! Please log in to get access.", 401)
    );
  }
  // // Verify the token.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check if the user is still exist.
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new appError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  // // check if user changed password after the token was issued.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new appError("User recently changed password! please login again.", 401)
    );
  }

  // Call next() to continue to the next middleware.
  req.user = currentUser;
  next();
});
// we wrape the middleware  with, another  function ,sicne we want  to pass wole of  the registered man, and middlewares doesn't accept any arguments.

exports.restrcitedTo = function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      //403==forbidden
      return next(
        new appError("you don't have permission to do this operation", 403)
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1.get user based on posted email.
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new appError("there is no user with this email", 404));
  }

  // 2.Generate random token.
  const resetToken = user.createPasswordResetGenerator();
  //validateBeforeSave:false=deactivate  the previous validation
  await user.save({ validateBeforeSave: false });

  // 3.send token to user email.
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? submit your password and confirm it  and  send PATCH request to ${resetURL}.\n if  you didn't  forgot your password  just ignore this email.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "your password reset token(N.B:- it valid only for 10 min.",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "password reset token sent successfully.",
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new appError("error occurred while sending as email", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1.Get user based on tokens.
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    // checking if token is expired or not
    passwordResetExpires: { gt: Date.now() },
  });
  // 2.if the token isn't expired and the user is found then set new password.
  if (!user) {
    return next(new appError("the token is expired or  invalid", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3.update passordChangedAT field of User Model.
  // 4.log the user and send JWT.
});
