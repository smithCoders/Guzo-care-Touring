const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const  reviewRouter=require("../Routes/reviewRoute")
// nested routes.
router.use("/tours/:tourId/review", reviewRouter)
router
  .route("/tours/top-5-cheap-tour")
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route("/tours/tour-statics").get(tourController.tourStatstics);
router.route("/tours/monthly-plans/:year").get(authController.protect,
    authController.restrcitedTo("admin","tour-leader","guide"),tourController.getMonthlyPlan);
router
  .route("/tours")
  .get(tourController.getAllTours)
  .post(authController.protect,
    authController.restrcitedTo("admin","tour-leader"),
    tourController.createTour);
router
  .route("/tours/:id")
  .get(tourController.getSingleTour)
  .patch(authController.protect , 
     authController.restrcitedTo("admin","tour-leader"),
    //  tourController.allowedUpdat,
      tourController.uploadTourImage,
      tourController.resizeTourImg,
     tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrcitedTo("admin", "tour-leader"),
    tourController.deleteTour
  );
// geospataial routes.
router.route("/tours/tour-within/:distance/center/:latlng/unit/:unit")
.get(tourController.getTourWithin);


// tour-within/250/center/40 78/unit/km

module.exports = router;
