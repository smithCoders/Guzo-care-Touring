const jwt = require("jsonwebtoken");
const User = require("../Model/userModel");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appErrors");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIREs_IN,
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = signToken(newUser._id);
  res.status(201).json({ status: "sucess", token, data: { user: newUser } });
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if email and password exist.
  if (!email || !password) {
    return next(new appError("please provide email and password", 400));
  }

  // 2) ch eck if user exist and password is correct.
  //   used to  cfind user with his email and passord(but the password is expoerted implicitly  without sedning to client)
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError("incorrect email or password", 401));
  }
  console.log(user);
  const token = signToken(user._id);
  //   3.send res and token when user login.
  res.status(200).json({ status: "sucess", token });
});
