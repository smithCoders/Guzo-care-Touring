const Tour = require("../Model/tourModel");
exports.getAllTours = async (req, res) => {
  try {
    // Build Query

    const queryObj = { ...req.query };
    const excludedFields = ["page", "limit", "sort", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1. Advanced Filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    let query = Tour.find(JSON.parse(queryString));
    // SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    }
    const tourList = await query;

    if (!tourList || tourList.length === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }
    // Send success response with the list of tours
    res
      .status(200)
      .json({ status: true, result: tourList.length, data: { tourList } });
  } catch (error) {
    // Log the error to the console
    console.log(error);
    // Send error response
    res.status(500).json({ error: error.message });
  }
};

exports.getSingleTour = async (req, res) => {
  try {
    // get single tour from DB
    const tour = await Tour.findById(req.params.id);
    // check the avalaibility of the tour
    if (!tour) {
      return res.status(404).json({ error: "Tour not found" });
    }
    // send sucess response  with the  tour
    res.status(200).json({ status: true, data: { tour } });
  } catch (error) {
    // log error to the console
    console.log(error);
    // send error  response
    res.status(500).json({ error: error.message });
  }
};

exports.createTour = async (req, res) => {
  try {
    // create tour to the DB
    const newTour = await Tour.create(req.body);
    // send sucess response with the  newly created tour
    res.status(201).json({ status: true, data: { newTour } });
  } catch (error) {
    // log error  to the console
    console.log(error);
    // send error response
    res.status(500).json({ error: error.message });
  }
};
exports.updateTour = async (req, res) => {
  // property user can updates
  const allowedUpdates = ["tourName", "price"];
  const updates = Object.keys(req.body);
  const isValid = updates.every((update) => allowedUpdates.includes(update));
  // check if the user insert  allowed property
  if (!isValid) {
    return res.status(400).json({ error: "Invalid updates" });
  }
  try {
    // update tour
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    // check  if the user  is  updating avaliable  tour
    if (!updatedTour) {
      return res.status(404).json({ error: "Tour not found" });
    }
    // send sucess message with  newly  updated tour
    res.status(200).json({ status: true, data: { updatedTour } });
  } catch (error) {
    // log error to the console
    console.log(error);
    // log error message to the console
    res.status(500).json({ error: error.message });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    // delete tour  from DB
    const tour = await Tour.findByIdAndDelete(req.params.id);
    // check if the user is deleteing avaliabnle tour in DB
    if (!tour) {
      return res.status(404).json({ error: "Tour not found" });
    }
    // send  sucess  response  with  null
    res.status(200).json({ status: true, data: null });
  } catch (error) {
    // log error to the console
    console.log(error);
    // send error response
    res.status(500).json({ error: error.message });
  }
};
