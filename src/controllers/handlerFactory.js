const appError = require("../utils/appErrors");
const catchAsync = require("../utils/catchAsync");

exports.deleteOne=Model=>catchAsync(async (req, res, next) => {
  // delete doc  from DB
  const doc = await Model.findByIdAndDelete(req.params.id);
  // check if the user is deleteing avaliabnle doc in DB
  if (!doc) {
    return next(new appError("document  not found ", 404));
  }
  // send  sucess  response  with  null
  res.status(200).json({ status: "sucess", data: null });
});
exports.updateOne=Model=> catchAsync(async(req,res,next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
   // check  if the user  is  updating avaliable  tour
  if (!doc) {
    return next(new appError("Tour not found ", 404));
  }
    // check  if the user  is  updating avaliable  tour
  if (!doc) {
    return next(new appError("Tour not found ", 404));
  }
    // send sucess message with  newly  updated tour
  res.status(200).json({ status: "sucess", data: { doc } });
})
 exports.createOne=Model=>catchAsync(async(req,res,next)=>{
  const doc=await Model.create(req.body);
  res.status(201).json({status:"sucess",data:{doc}})
 })
 

