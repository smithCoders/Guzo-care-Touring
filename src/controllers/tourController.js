const Tour = require("../Model/tourModel");
const API_FEATURE = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appErrors");
const factory=require("./handlerFactory");
const multer=require("multer");
const sharp=require("sharp");
// save  to memory.
const multerStorage=multer.memoryStorage();
const multerFilter=(req,file,cb)=>{
  if(file.mimetype.startsWith("image")){
    cb(null,true)
  }
  else{
    cb(new appError("Please upload images only",400))
  }
}
const upload=multer({diskStorage:multerStorage, fileFilter:multerFilter});
exports.uploadTourImage=upload.
fields([{name:"imageCover", maxCount:1},{name:"images",maxCount:3}]);
// if we want to upload multiple images for just one field.
// upload.array("image",3)
exports.resizeTourImg=catchAsync(async(req,res,next)=>{
  if(!req.files.imageCover||!req.files.images) return next();
 const imageCoverfilename=`tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  // sharp cover image
 await sharp(req.files.imageCover[0].buffer).
  resize(2000,1333).
  toFormat("jpeg").
  jpeg({quality:90}).
  toFile(`public/img/tours/${imageCoverfilename}`);
  // put the cover image on the updated tour.
  req.body.imageCover=imageCoverfilename;
  // 2.Images
  req.body.images=[];
  await Promise.all(req.files.images.map(async(file,i)=>{
    const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
    await sharp(file.buffer).
    resize(2000,1333).
    toFormat("jpeg").
    jpeg({quality:90}).
    toFile(`public/img/tours/${filename}`);
    req.body.images.push(filename);
  }))
  next()

})

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price ratingsAverage";
  req.query.fields = "name price ratingsAverage summary difficulty";
  next();
};
exports.allowedUpdat =async (req, res) => {
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
    "guides"
  ];
  const updates = Object.keys(req.body);
  const isValid = updates.every((update) => allowedUpdates.includes(update));
  // check if the user insert  allowed property
  if (!isValid) {
    return res.status(400).json({ error: "Invalid updates" });
  }
}
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
exports.getTourWithin=catchAsync(async(req,res,next)=>{
  // /tour-within/:distance/center:/latlng/unit:/unit
  // 1. accepting urls from params.
  const{distance,latlng,unit}=req.params;
  const[lat,lng]=latlng.split(",");
  // 3963.2 =earth  raduis  in mile
  // 6378.1;=earth raduis in km
  // since mongo expect the radius in spehre  we should  chage the distance in raduius by diving by earth raduis.
  const radius=unit==="mi"? distance/3963.2 : distance/6378.1;
  // check if the lat and lng are valid
 if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
  return next(new appError("Please provide valid latitude and longitude in the format lat,lng", 400));
}

  const tours=await Tour.find({startLocation:
    {$geoWithin:{$centerSphere:[[lng,lat],radius]}}});
  res.status(200).json({
    status:"sucess",
    result:tours.length,
    data:{tours}
  })


})

exports.getAllTours = factory.getAll(Tour)
exports.getSingleTour =factory.getOne(Tour,{path:"review"})
exports.createTour=factory.createOne(Tour)
exports.updateTour=factory.updateOne(Tour)
 exports.deleteTour=factory.deleteOne(Tour)