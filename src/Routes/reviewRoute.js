const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");
// enabling   nested route  using  mergeparams.
const router = express.Router({mergeParams:true});
router.use(authController.protect)
router
  .route("/")
  .get(reviewController.getAllReview)
  .post(
    authController.restrcitedTo("user"),
    reviewController.setUserTourId,
    reviewController.createReview
  );
  router.route("/:id")
  .delete(authController.restrcitedTo("admin","user"),
  reviewController.deleteReview)
  .patch( authController.restrcitedTo("admin","user"),
  reviewController.updateReview)
module.exports = router;
