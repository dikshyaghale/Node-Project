const express = require("express");
const router = express.Router();
const isAuth = require("../../middleware/is-Auth");

const { body } = require("express-validator");

const authController = require("../../controllers/auth/auth");
const User = require("../../models/User");

router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please Enter a valid email."),
    body("password", "Password has to be valid.")
      .isLength({ min: 5 })
      .isString()
      .trim(),
  ],
  authController.postSignIn
);

router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    body("username")
      .isLength({ min: 2, max: 100 })
      .withMessage("Please Enter a username of atleast 2 character long."),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please Enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email already exits..Please try a different one."
            );
          }
          return true;
        });
      }),
    body(
      "password",
      "Please enter a password with only numbers and text and at leaset 5 character long.."
    )
      .isLength({ min: 5 })
      .isString()
      .trim(),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password do not matched!!");
        }
        return true;
      })
      .trim(),
  ],
  authController.postSignUp
);

router.get("/logout", authController.postLogout);
router.get("/reset", authController.getResetpassword);
router.post("/reset", authController.postResetPassword);
router.get("/reset/:token", authController.getNewPassword);
router.post(
  "/new-password",
  [
    body(
      "password",
      "Please enter a password with only numbers and text and at leaset 5 character long.."
    )
      .isLength({ min: 5 })
      .isString()
      .trim(),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password do not matched!!");
        }
        return true;
      })
      .trim(),
  ],
  authController.postNewPassword
);

module.exports = router;
