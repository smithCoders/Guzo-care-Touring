const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");


router.route("/signup")
.post(authController.signUp);
router.route("/login")
.post(authController.login);
router.route("/forgotpassword")
.post(authController.forgotPassword);
router.route("/resetpassword/:token")
.patch(authController.resetPassword);
// making all  routes protected.
router.use(authController.protect)
router
  .route("/updateMe")
  .patch(userController.uploadImg,
    userController.resizeUserImg,
    userController.updateMe);
  router.route("/me")
  .get( userController.getMe, 
    userController.getSingleUser)
router
  .route("/deleteMe")
  .delete( userController.deleteMe);
router
  .route("/updateMyPassword")
  .patch( authController.updatePassword);
  // allowed  routes only for admin.
  router.use(authController.restrcitedTo("admin"));

router
  .route("/")
  .get(userController.getAllUser)
router.route("/:id")
.get(userController.getSingleUser)
.delete(  userController.deleteUser)
.patch(userController.updateUser)


module.exports = router;
