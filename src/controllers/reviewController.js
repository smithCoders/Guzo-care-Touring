const Review = require("../Model/ReviewModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllReview = catchAsync(async (req, res, next) => {
  const reviewsList = await Review.find({});
  if (!reviewsList || reviewsList.length === 0) {
    res.status(400).json({ status: "failed", error: "review isn't found" });
  }
  res.status(200).json({
    status: "sucess",
    result: reviewsList.length,
    data: { reviewsList },
  });
});
exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);
  res.status(201).json({ sucess: "sucess", data: { review: newReview } });
});
