const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
router
  .route("/top-5-cheap-tour")
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route("/tour-statics").get(tourController.tourStatstics);
router.route("/monthly-plans/:year").get(tourController.getMonthlyPlan);
router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route("/:id")
  .get(tourController.getSingleTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);
module.exports = router;
