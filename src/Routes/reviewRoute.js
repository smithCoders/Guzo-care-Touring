const express = require("express");

const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");
// enabling   nested route  using  mergeparams.
const router = express.Router({mergeParams:true});

router
  .route("/")
  .get(reviewController.getAllReview)
  .post(
    authController.protect,
    authController.restrcitedTo("user"),
    reviewController.setUserTourId,
    reviewController.createReview
  );
  router.route("/:id").delete(authController.restrcitedTo("admin"),reviewController.deleteReview).patch(authController.restrcitedTo("admin"), reviewController.updateReview)
module.exports = router;
