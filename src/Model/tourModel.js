const mongoose = require("mongoose");

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
// VIRTUAL-property.
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
