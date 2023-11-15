const mongoose = require("mongoose");
// const User = require("./userModel");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      sparse: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal than 40 characters"],
      minlength: [10, "A tour name must have more or equal than 10 characters"],
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
      min: 0,
    },
    priceDiscount: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: [true, "tour must have  duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "tour  must have  Group size"],
    },
    difficulty: {
      type: String,
      required: [true, "tour must have diffculty"],
      enum:{values:["easy","medium","diffcult"], message:"diffculy is either easy, medium, diffcult"}
    },
    description: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "tour must have  summary"],
    },
    imageCover: {
      type: String,
      required: [false, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // hide the createdAt from User
      select: false,
    },
    startDates: [Date],
    secretTour: { type: Boolean, default: false },
    // Geospatail locations
    startLocation: {
      // GeoJSON=
      type: { type: String, default: "point", enum:["point"] },
      // coordinates===lat, long
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: { type: String, default: "point", enum:["point"] },
        coordinates: [Number],
        address: String,
        description: String,
        // day of tour=>people travel
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  {
    // used to show virtual property in  output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
  // {
  //   // return created and updared time of the  model.
  //   timestamps: true,
  // }
);
// QUERY MIDDLEWARE.
// tourSchema.pre("save", async function (next) {
//   const guidePromise = this.guides.map(async (id) => await User.findById(id));
//   // await all promises.
//   this.guides = await Promise.all(guidePromise);

//   next();
// });
tourSchema.pre(/^find/, function (next) {
  this.populate({ path: "guides", select: "-__v -passwordChangedAt" });
  next();
});
// VIRTUAL-property.
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});
// VIRTUAL POPULATE.
tourSchema.virtual("review", {
  ref: "Reviews",
  localField: "_id",
  foreignField: "tour",
});
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
