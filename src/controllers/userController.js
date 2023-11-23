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
// middleware  to  retrive currently loggedin user id.
exports.getMe=(req,res,next)=>{
  req.params.id=req.user.id;
  next()
}
exports.getAllUser = factory.getAll(User)
exports.getSingleUser = factory.getOne(User)
exports.createUser = factory.createOne(User)
// Admin only
exports.deleteUser=factory.deleteOne(User);
exports.updateUser=factory.updateOne(User)