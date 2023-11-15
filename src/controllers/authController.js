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

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    // sedn the cookie  to https  header ony
    // secure: true,

    // restrict the cookie  from being accessed or modifeid   by browser(prevent cross site scripting(xss) attacks)
    httpOnly: true,
  };
  // if the app is in production we set secure=true, unless it should be false
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  // create cookies.
  res.cookie("jwt", token, cookieOptions);
  // remove password.
  user.password = undefined;
  res.status(statusCode).json({ status: "sucess", token, data: { user } });
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
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if email and password exist.
  if (!email || !password) {
    return next(new appError("please provide email and password", 400));
  }

  // 2) check if user exist and password is correct.
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError("incorrect email or password", 401));
  }


  createSendToken(user, 200, res);
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
        "The user belonging to this token  no longer exist.",
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
// we wrape the middleware  with, another  function ,sicne we want  to pass whole of  the registered man, and middlewares doesn't accept any arguments.

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
  // 1. Find the user based on the provided email.
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    // 2. If no user is found, return a 404 error.
    return next(new appError("No user found with this email address", 404));
  }

  // 3. Generate a random password reset token.
  const resetToken = user.createPasswordResetGenerator();

  // 4. Deactivate validation before saving the user to avoid validation issues.
  await user.save({ validateBeforeSave: false });

  // 5. Construct the password reset URL.
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  // 6. Compose the email message.
  const subject = "Password Reset Request";
  const message =
    `Dear ${user.name},\n\n` +
    "We received a request to reset your password. If this wasn't you, please ignore this message.\n\n" +
    `To reset your password, click the following link (valid for 10 minutes):\n${resetURL}`;

  try {
    // 7. Send the password reset email.
    await sendEmail({
      email: user.email,
      subject,
      message,
    });

    // 8. Respond with a success message.
    res.status(200).json({
      status: "success",
      message: "Password reset instructions sent successfully.",
    });
  } catch (err) {
    console.log(err);

    // 9. Handle email sending errors.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new appError(
        "An error occurred while sending the password reset email",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Hash the token provided in the request parameters.
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // 2. Find the user based on the hashed token and check if the token is not expired.
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    // 3. Handle the case when the token is expired or invalid.
    return next(new appError("The token is expired or invalid.", 400));
  }

  // 4. Set the new password and clear the password reset fields.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 5. Update the passwordChangedAt field of the User Model.
  user.passwordChangedAt = Date.now();
  await user.save();

  // 7. Send the password reset email with the new access token.
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${hashedToken}`;
  const message = `Your password has been reset successfully. Please log in again using your new password.\n\n${resetURL}`;
  await sendEmail({
    email: user.email,
    subject: "Password Reset Successful",
    message,
  });
  // 8. Send a success response with the new access token.

  createSendToken(token, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get the user from the collection.
  const user = await User.findById(req.user.id).select("+password");
  // 2. Check if the posted password is correct.
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new appError("Your current password is wrong.", 401));
  }

  // 3. If the password is correct, update the password.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4. Log the user in, send the JWT.
  createSendToken(token, 200, res);
});
