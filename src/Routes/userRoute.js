const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);
router.route("/forgotpassword").post(authController.forgotPassword);
router.route("/resetpassword/:token").patch(authController.resetPassword);
router
  .route("/updateMe")
  .patch(authController.protect, userController.updateMe);
router
  .route("/deleteMe")
  .delete(authController.protect, userController.deleteMe);
router
  .route("/updateMyPassword")
  .patch(authController.protect, authController.updatePassword);
router
  .route("/")
  .get(userController.getAllUser)
  .post(userController.createUser);
router.route("/:id").get(userController.getSingleUser);

module.exports = router;
