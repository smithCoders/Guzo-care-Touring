const User = require("../Model/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllUser = catchAsync(async (req, res, next) => {
  // get all user from the DB.
  const userList = await User.find({});
  // check if userLIst is emptyCells:
  if (!userList || userList.length === 0) {
    // send error response.
    res.status(404).json({ error: "user not found" });
  }
  // send sucess status and user data.
  res.status(200).json({ sucess: "sucess", data: { userList } });
});
exports.getSingleUser = catchAsync(async (req, res, next) => {
  // get single user form the DB.
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ error: "user not  found" });
  }
  res.status(200).json({ sucess: "sucess", data: { user } });
});
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = User.create(req.body);

  res.status(201).json({ sucess: "sucess", data: { newUser } });
});
exports.updateUser = catchAsync(async (req, res) => {
  const allowedUpdates = ["name", "email", "password", "photo"];
  const updates = Object.keys(req.body);
  const isValid = updates.every((update) => allowedUpdates.includes(update));
  if (!isValid) {
    res
      .status(400)
      .json({ error: "the propety you are updating isn't allowed" });
  }

  // upate user by their id and also    display newly updated values, it also  add validators  set on User Model  on newly updatd values
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runvalidators: true,
  });

  if (!updatedUser) {
    res.status(404).json({ error: "user not found" });
  }
  res.status(200).json({ sucess: "sucess", data: { updatedUser } });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) {
    res.status(404).json({ error: "user not found" });
  }
  res.status(200).json({ sucess: "sucess", data: null });
});
