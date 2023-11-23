const mongoose = require("mongoose");
const { Schema } = mongoose;
const Tour=require("./tourModel")
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
// Prevent  duplicate  reviews.
reviewSchema.index({tour:1, user:1},{unique:true});

// pre saved middleware.
reviewSchema.pre(/^find/, async function (next) {
  this.populate({ path: "user", select: "name photo" })
  // this.populate({path:"tour", select:"name"})
  next();
});
// CALCULATING  AVERAGERATING.
reviewSchema.statics.calculateAvgRating=async function(tourId){
  // pointing to the current  document.

 const  stats= await  this.aggregate([
    // step1 :- select all  reviews   corrsponds  to  current document(tour)
  {$match:{tour:tourId}},
  // 2. calculate the  stats.
  {$group:{_id:"$tour", 
  numRating:{$sum:1},
avgRating:{$avg:"$rating"}
}}
  ])
  console.log(stats)
  // update the  sats on tourModel.
  await  Tour.findByIdAndUpdate(tourId,{ratingAverage:stats[0].avgRating,ratingQuantity:stats[0].numRating})
}
reviewSchema.post("save", function(){
  // this => points to the current review document 
  this.constructor.calculateAvgRating(this.tour);

});
reviewSchema.post(/^findOneAnd/, async function(doc, next) {
  // doc => points to the current review document 
  if (doc) {
    await doc.constructor.calculateAvgRating(doc.tour);
  
  }
  next();
});
const Reviews = mongoose.model("Reviews", reviewSchema);
Reviews.ensureIndexes();
module.exports = Reviews;
