const mongoose = require("mongoose");
const { Schema } = mongoose;
const reviewSchema = Schema(
  {
    review: { type: String, required: [true, "tour must have review"] },

    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, deafult: Date.now },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "review must have an author"],
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "revie must belongs to certain tour"],
    },

    // used to show virtual property in  output
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
// pre saved middleware.
reviewSchema.pre(/^find/, async function (next) {
  this.populate({ path: "user", select: "name photo" }).this.populate({path:"tour", select:"name"})
  next();
});

const Reviews = mongoose.model("Reviews", reviewSchema);
module.exports = Reviews;
