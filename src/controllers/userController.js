const User = require("../Model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appErrors");
const factory=require("./handlerFactory")
const updateObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getAllUser = catchAsync(async (req, res, next) => {
  // get all user from the DB.
  const userList = await User.find();
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
exports.createUser = factory.createOne(User)
// exports.updateUser = catchAsync(async (req, res) => {
//   const allowedUpdates = ["name", "email", "photo"];
//   const updates = Object.keys(req.body);
//   const isValid = updates.every((update) => allowedUpdates.includes(update));
//   if (!isValid) {
//     res
//       .status(400)
//       .json({ error: "the propety you are updating isn't allowed" });
//   }

//   // upate user by their id and also    display newly updated values, it also  add validators  set on User Model  on newly updatd values
//   const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
//     new: true,
//     runvalidators: true,
//   });

//   if (!updatedUser) {
//     res.status(404).json({ error: "user not found" });
//   }
//   res.status(200).json({ sucess: "sucess", data: { updatedUser } });
// });



exports.deleteMe = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({ sucess: "sucess", data: null });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1.throw error if user try to update password.
  if (req.body.password || req.body.passwordConfirm) {
    next(
      new AppError(
        "you can't update  your password, please use /updateMyPassword route to update password",
        400
      )
    );
  }
  //  2. filtered out unallowed  fields to be updated by users.
  const allowedUpdates = updateObject(req.body, "name", "email");
  // 3.update user document.
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    allowedUpdates,
    { new: true, runValidators: false }
  );
  res.status(200).json({ status: "sucess", data: { user: updatedUser } });
});
// Admin only
exports.deleteUser=factory.deleteOne(User);
exports.updateUser=factory.updateOne(User)