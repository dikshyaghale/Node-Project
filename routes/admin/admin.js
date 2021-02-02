const express = require("express");
const router = express.Router();

const { body } = require("express-validator");
const isAuth = require("../../middleware/is-Auth");

const adminController = require("../../controllers/admin/admin");

router.get("/dashboard", isAuth, adminController.getDashboard);
router.get("/addpost", isAuth, adminController.getAddPost);
router.post(
  "/addpost",
  isAuth,
  [
    body("name")
      .isLength({ min: 3, max: 50 })
      .withMessage("Please, Enter A Name of atleast 3 chracter long."),
    body("title")
      .isLength({ min: 3, max: 100 })
      .withMessage("Please, Enter A title of atleast 3 chracter long."),
    body("tagline")
      .isLength({ min: 3, max: 1000 })
      .withMessage("Please, Enter A tagline of atleast 3 chracter long."),
    body("description")
      .isLength({ min: 5 })
      .withMessage("Please, Enter A Description of atleast 5 chracter long."),
  ],
  adminController.postAddPost
);

router.get("/edit-post/:postId", isAuth, adminController.getEditPost);
router.post(
  "/edit-post",
  isAuth,
  [
    body("name")
      .isLength({ min: 3, max: 50 })
      .withMessage("Please, Enter A Name of atleast 3 chracter long."),
    body("title")
      .isLength({ min: 3, max: 100 })
      .withMessage("Please, Enter A title of atleast 3 chracter long."),
    body("tagline")
      .isLength({ min: 3, max: 1000 })
      .withMessage("Please, Enter A Tagline of atleast 3 chracter long."),
    body("description")
      .isLength({ min: 5 })
      .withMessage("Please, Enter A Description of atleast 5 chracter long."),
  ],
  adminController.postEditPost
);
router.post("/delete", isAuth, adminController.postDeletePost);

// router.get("/addpost/table", adminController.getTable);

router.get("/user", adminController.getUserprofile);
router.post(
  "/user",
  [
    body(
      "password",
      "Please enter a password with only numbers and text and at leaset 5 character long.."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
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
  adminController.postUserProfile
);
module.exports = router;
