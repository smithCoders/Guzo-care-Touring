const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
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
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrcitedTo("admin", "lead-guide"),
    // async (req, res) => {
    //   try {
    //     if (!req.params.id) {
    //       return res.status(400).json({ error: "ID parameter is missing" });
    //     }
    tourController.deleteTour
    //   res.status(204).json();
    // } catch (error) {
    //   // Log or handle the error
    //   console.log(error);
    //   res.status(500).json({ error: "Something went wrong" });
    //   }
    // }
  );

module.exports = router;
