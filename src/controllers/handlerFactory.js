const API_FEATURE = require("../utils/apiFeatures");
const appError = require("../utils/appErrors");
const catchAsync = require("../utils/catchAsync");


exports.deleteOne=Model=>catchAsync(async (req, res, next) => {
  // delete doc  from DB
  const doc = await Model.findByIdAndDelete(req.params.id);
  // check if the user is deleting available doc in DB
  if (!doc) {
    return next(new appError("document  not found ", 404));
  }
  // send  success  response  with  null
  res.status(200).json({ status: "success", data: null });
});
exports.updateOne=Model=> catchAsync(async(req,res,next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    });
  if (!doc) {
    return next(new appError("document  not found ", 404));
  }
    // send success message with  newly  updated tour
  res.status(200).json({ status: "success", data: { doc } });
})
 exports.createOne=Model=>catchAsync(async(req,res,next)=>{
  const doc=await Model.create(req.body);
  res.status(201).json({status:"success",data:{doc}})

 })
 exports.getOne=(Model, popOption)=> catchAsync(async (req, res, next) => {
 let query=Model.findById(req.params.id);
 if(popOption) query=query.populate(popOption)
 const doc=await  query
  if (!doc) {
    return next(new appError("document  not found ", 404));
  }
  res.status(200).json({ status: "success", data: { doc } });
});
exports.getAll=Model=>catchAsync(async (req, res, next) => {
 
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const features = new API_FEATURE(Model.find(filter), req.query)
    .filter()
    .sort()
    .fieldLimiting()
    .pagination();
    const doc = await features.query;

    if (!doc || doc.length === 0) {
        return res.status(404).json({ error: "document not found" });
    }
    res
        .status(200)
        .json({ status: "success", result: doc.length, data: { doc } });



});
