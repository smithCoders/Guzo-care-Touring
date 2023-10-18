const Tour = require("../Model/tourModel");
const API_FEATURE = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appErrors");
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price ratingsAverage";
  req.query.fields = "name price ratingsAverage summary difficulty";
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new API_FEATURE(Tour.find(), req.query)
    .filter()
    .sort()
    .fieldLimiting()
    .pagination();
  const tourList = await features.query;

  if (!tourList || tourList.length === 0) {
    return res.status(404).json({ error: "Tour not found" });
  }
  // Send success response with the list of tours
  res
    .status(200)
    .json({ status: "sucess", result: tourList.length, data: { tourList } });
});

exports.getSingleTour = catchAsync(async (req, res, next) => {
  // get single tour from DB
  const tour = await Tour.findById(req.params.id);
  // check the avalaibility of the tour
  if (!tour) {
    return next(new appError("Tour not found ", 404));
  }
  // send sucess response  with the  tour
  res.status(200).json({ status: "sucess", data: { tour } });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // create tour to the DB
  const newTour = await Tour.create(req.body);
  // send sucess response with the  newly created tour
  res.status(201).json({ status: "sucess", data: { newTour } });
});
exports.updateTour = catchAsync(async (req, res) => {
  // property user can updates
  const allowedUpdates = [
    "name",
    "price",
    "priceDiscount",
    "duration",
    "maxGroupSize",
    "summary",
    "description",
    "imageCover",
    "images",
    "startDates",
    "difficulty",
  ];
  const updates = Object.keys(req.body);
  const isValid = updates.every((update) => allowedUpdates.includes(update));
  // check if the user insert  allowed property
  if (!isValid) {
    return res.status(400).json({ error: "Invalid updates" });
  }

  // update tour
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  // check  if the user  is  updating avaliable  tour
  if (!updatedTour) {
    return next(new appError("Tour not found ", 404));
  }
  // send sucess message with  newly  updated tour
  res.status(200).json({ status: "sucess", data: { updatedTour } });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  // delete tour  from DB
  const tour = await Tour.findByIdAndDelete(req.params.id);
  // check if the user is deleteing avaliabnle tour in DB
  if (!tour) {
    return next(new appError("Tour not found ", 404));
  }
  // send  sucess  response  with  null
  res.status(200).json({ status: "sucess", data: null });
});
exports.tourStatstics = catchAsync(async (req, res, next) => {
  // get tour stats from DB
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id===used to specifiy the propety we want to group based on it.
        _id: "$difficulty",
        // this  count total numbe rof tours in DB
        numTours: { $sum: 1 },
        numRating: { $sum: "$ratingQuantity" },
        avgRating: { $avg: "$ratingAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  // send sucess response with the  tour stats
  res.status(200).json({ status: "sucess", data: { stats } });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const plan = await Tour.aggregate([
    {
      // descruct array of documents in to single document.
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        // extract month  from give year.
        _id: { $month: "$startDates" },
        // count number tours in that month
        numTourStart: { $sum: 1 },
        // push name of the tour as array.
        tours: { $push: "$name" },
      },
    },
    // add  a filed called month and ngherit properties of _id
    { $addFields: { month: "$_id" } },
    // hide _id
    { $project: { _id: 0 } },
    { $sort: { numTourStart: -1 } },
  ]);
  res.status(200).json({ status: "sucess", data: { plan } });
});
