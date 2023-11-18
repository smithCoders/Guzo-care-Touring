const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const  reviewRouter=require("../Routes/reviewRoute")
// nested routes.
router.use("/:tourId/review", reviewRouter)
router
  .route("/top-5-cheap-tour")
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route("/tour-statics").get(tourController.tourStatstics);
router.route("/monthly-plans/:year").get(tourController.getMonthlyPlan);
router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route("/:id")
  .get(tourController.getSingleTour)
  .patch(authController.protect ,
     authController.restrcitedTo("admin","lead-guide"),
     tourController.allowedUpdat,
  tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrcitedTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
