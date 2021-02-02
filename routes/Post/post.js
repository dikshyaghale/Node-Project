const express = require("express");
const router = express.Router();
const postController = require("../../controllers/Post/post");
const { body } = require("express-validator");
const User = require("../../models/User");

router.get("/", postController.getIndex);

router.get("/contact", postController.getContactMe);
router.post(
  "/contact",
  [
    body("fname")
      .isLength({ min: 2, max: 50 })
      .withMessage("Please, Enter the first name atleast 2 chracter long."),
    body("lname")
      .isLength({ min: 2, max: 50 })
      .withMessage("Please, Enter the last name atleast 2 chracter long."),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please, Enter valid Email and  atleast 5 chracter long."),
    body("subject")
      .isLength({ min: 5, max: 100 })
      .withMessage("Please, mention  the subject atleast 5 chracter long."),
    body("message")
      .isLength({ min: 5, max: 500 })
      .withMessage("Please, Enter Message atleast 5 chracter long."),
  ],
  postController.postContactMe
);

router.get("/about", postController.getabout);

router.post("/subscribe", postController.postSubscriptionEmail);

router.get("/post/:postId", postController.getSinglePost);
router.post("/comment-post", postController.postComment);
router.post("/comment-post-reply", postController.postCommentReply);

router.get("/category/:categoryName", postController.getPostByCategory);

module.exports = router;
