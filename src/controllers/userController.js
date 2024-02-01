const User = require("../Model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appErrors");
const factory=require("./handlerFactory");
const multer=require("multer");
const sharp=require("sharp");

// configuring multer.
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user?.id}-${Date.now()}.${extension}`);
//   },
// });
 const multerStorage=multer.memoryStorage();
const multerFilter=(req,file,cb)=>{
  // check if the file is image and if that is image pass true else throw an error.
  if(file.mimetype.startsWith("image")){
    cb(null,true)
  }
  else{
    cb(new AppError("please upload only image",400),false)
  }
}
const upload=multer({storage:multerStorage, fileFilter:multerFilter});
exports.uploadImg=upload.single("photo");
exports.resizeUserImg=catchAsync(async(req,res,next)=>{
  if(!req.file) return next();
  req.file.filename=`user-${req.user?.id}-${Date.now()}.jpeg`;
 await sharp(req.file.buffer).
  resize(500,500).
  toFormat("jpeg").
  jpeg({quality:90}).
  toFile(`public/img/users/${req.file.filename}`);
  next();
})

const updateObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
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
  // adding the photo  to the user db.
  if(req.file){
    allowedUpdates.photo=req.file.filename;
  }
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