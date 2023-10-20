const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);
router.route("/forgotpassword").post(authController.forgotPassword);
router.route("/resetpassword/:token").patch(authController.resetPassword);
router
  .route("/")
  .get(userController.getAllUser)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getSingleUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
