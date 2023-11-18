const Review = require("../Model/ReviewModel");
const catchAsync = require("../utils/catchAsync");
const factory=require("./handlerFactory")
exports.getAllReview = catchAsync(async (req, res, next) => {
  // displaying reviews of a certain tour.
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviewsList = await Review.find(filter).select("-__v")
  if (!reviewsList || reviewsList.length === 0) {
    res.status(400).json({ status: "failed", error: "review isn't found" });
  }
  res.status(200).json({
    status: "sucess",
    result: reviewsList.length,
    data: { reviewsList },
  });
});
// middleware fun  to  run before  createRview.
exports.setUserTourId=async(req,res,next)=>{
 // used  to allow nestedRoutes.
  if(!req.body.tour)   req.body.tour=req.params.tourId;
  if(!req.body.user) req.body.user=req.user.id
}
exports.createReview =factory.createOne(Review)
// ADMIN only
exports.deleteReview=factory.deleteOne(Review)
exports.updateReview=factory.updateOne(Review)