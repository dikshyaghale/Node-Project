const Post = require("../../models/Post");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const fileHelper = require("../../util/file/deleteFile");
const { validationResult } = require("express-validator");
const User = require("../../models/User");
const moment = require("moment");
const session = require("express-session");
moment.locale("en-in");

exports.getDashboard = async (req, res, next) => {
  // const posts = await Post.find({ userId: req.user._id }).sort({ _id: -1 });
  const posts = await req.user.populate("posts").execPopulate();
  res.render("Dashboard/dashboard", {
    pageTitle: "Admin Panel",
    path: "/dashboard",
    posts: posts.posts,
  });
};
exports.getAddPost = (req, res, next) => {
  res.render("Dashboard/addPost", {
    pageTitle: "Add Post",
    path: "/admin/add-post",
    editing: false,
    errorMessage: "",
    oldInput: "",
    validationErrors: [],
  });
};

exports.postAddPost = async (req, res, next) => {
  const title = req.body.title;
  const tagline = req.body.tagline;
  const name = req.body.name;
  const category = req.body.category;
  const image = req.file;
  const description = req.body.description;
  const postDate = moment().format("llll");

  if (!image) {
    return res.render("Dashboard/addPost", {
      pageTitle: "Error in Add Post",
      path: "/admin/add-post",
      oldInput: {
        title,
        name,
        description,
        tagline,
        category,
      },
      editing: false,
      errorMessage: "Attached file is not a image..",
      validationErrors: [],
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("Dashboard/addPost", {
      pageTitle: "Error Adding Post",
      path: "/admin/add-post",
      errorMessage: errors.array()[0].msg,
      editing: false,
      validationErrors: errors.array(),
      oldInput: {
        name,
        title,
        description,
        tagline,
        category,
      },
    });
  }
  const imageUrl = "images/" + image.filename;
  const userId = req.user._id;

  const createdPost = new Post({
    title,
    name,
    imageUrl,
    description,
    tagline,
    category,
    postDate,
    userId,
  });

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    return next(new Error("Could not find the user"));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPost.save({ session: sess });

    user.posts.push(createdPost);
    await user.save({ session: sess });

    sess.commitTransaction();
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.log(err);
  }
};

exports.getEditPost = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/admin/dashboard");
  }
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.redirect("/admin/dashboard");
    }
    res.render("Dashboard/addPost", {
      pageTitle: "Edit Post",
      path: "/admin/add-post",
      oldInput: post,
      editing: editMode,
      errorMessage: "",
      validationErrors: [],
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postEditPost = async (req, res, next) => {
  const postId = req.body.postId;
  const updatedName = req.body.name;
  const updatedTagline = req.body.tagline;
  const updatedCategory = req.body.category;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedDescription = req.body.description;
  const postDate = moment().format("llll");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("Dashboard/addPost", {
      pageTitle: "Error in Edit post",
      path: "/admin/add-post",
      editing: true,
      validationErrors: errors.array(),
      oldInput: {
        title: updatedTitle,
        name: updatedName,
        category: updatedCategory,
        tagline: updatedTagline,
        description: updatedDescription,
        _id: postId,
      },
      errorMessage: errors.array()[0].msg,
    });
  }

  try {
    const post = await Post.findById(postId);
    post.name = updatedName;
    post.title = updatedTitle;
    post.tagline = updatedTagline;
    post.description = updatedDescription;
    post.category = updatedCategory;
    post.postDate = postDate;
    if (image) {
      fileHelper.deleteFile(post.imageUrl);
      post.imageUrl = "images/" + image.filename;
    }

    await post.save();
    console.log("Post Updated Successfully!!");
    res.redirect("/admin/dashboard");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postDeletePost = async (req, res, next) => {
  const postId = req.body.postId;
  let post;
  try {
    post = await Post.findById(postId).populate("userId");
  } catch (err) {
    console.log(err);
  }
  if (!post) {
    throw new Error("No Posts Found..");
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await post.deleteOne({ session: sess });
    post.userId.posts.pull(post);
    await post.userId.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return next(err);
  }
  fileHelper.deleteFile(post.imageUrl);
  res.redirect("/admin/dashboard");
};

exports.getUserprofile = (req, res, next) => {
  const user = req.user;
  res.render("Dashboard/user", {
    pageTitle: "User profile",
    path: "/admin/user",
    user,
    validationErrors: [],
    errorMessage: "",
    oldInput: user,
  });
};

exports.postUserProfile = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.onfirmPassword;
  const email = req.body.email;
  const errors = validationResult(req);
  console.log(errors.array());
  if (!errors.isEmpty()) {
    return res.render("Dashboard/user", {
      pageTitle: "Error In New Password",
      path: "/admin/user",
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      oldInput: {
        password,
        username,
        email,
        confirmPassword,
      },
    });
  }
  try {
    const userInfo = req.user;
    const hashedPassword = await bcrypt.hash(password, 12);
    userInfo.password = hashedPassword;
    userInfo.username = username;
    userInfo.email = email;
    await userInfo.save();
    console.log(userInfo);

    res.redirect("/admin/user");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// exports.getTable = (req, res, next) => {
//   res.render("Dashboard/tables", {
//     pageTitle: "Posts",
//   });
// };

// exports.clearImage = (filePath) => {
//   const path = process.
// }
