const Review = require("../Model/ReviewModel");
const factory=require("./handlerFactory")
// middleware fun  to  run before  createRview.
exports.setUserTourId=async(req,res,next)=>{
 // used  to allow nestedRoutes.
  if(!req.body.tour)   req.body.tour=req.params.tourId;
  if(!req.body.user) req.body.user=req.user.id;
  next()
}
exports.getAllReview = factory.getAll(Review)
exports.createReview =factory.createOne(Review)
exports.getOneReview=factory.getOne(Review)
// ADMIN only
exports.deleteReview=factory.deleteOne(Review)
exports.updateReview=factory.updateOne(Review)
