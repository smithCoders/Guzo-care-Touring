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
router.route("/monthly-plans/:year").get(authController.protect,
    authController.restrcitedTo("admin","tour-leader","guide"),tourController.getMonthlyPlan);
router
  .route("/")
  .get(tourController.getAllTours)
  .post(authController.protect,
    authController.restrcitedTo("admin","tour-leader"),
    tourController.createTour);
router
  .route("/:id")
  .get(tourController.getSingleTour)
  .patch(authController.protect ,
     authController.restrcitedTo("admin","tour-leader"),
     tourController.allowedUpdat,
  tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrcitedTo("admin", "tour-leader"),
    tourController.deleteTour
  );
// geospataial routes.
router.route("/tour-within/:distance/center:/latlng/unit:/unit").get(tourController.getTourWithin);
// tour-within/250/center/40 78/unit/km

module.exports = router;
