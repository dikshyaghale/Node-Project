const Subscribe = require("../../models/Subscribe");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");

const Contact = require("../../models/Contact");

const nodeMailer = require("nodemailer");
const sendGridTransporter = require("nodemailer-sendgrid-transport");

const { validationResult } = require("express-validator");
const moment = require("moment");
moment.locale("en-in");

const ITEMS_PER_PAGE = 4;
const transporter = nodeMailer.createTransport(
  sendGridTransporter({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getIndex = async (req, res, next) => {
  const page = +req.query.page || 1;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ _id: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    // const postDat = {
    //   day: m.format("dddd"),
    //   month: m.format("MMM"),
    //   year: m.format("yyyy"),
    // };
    // const postDate = moment().format("LLL");
    // console.log(postDate.time);
    res.render("index/index", {
      pageTitle: "Green Wind",
      path: "/",
      posts,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getContactMe = (req, res, next) => {
  res.render("index/contact", {
    pageTitle: "Contact Me",
    path: "/contact",
    errorMessage: "",
    oldInput: "",
    validationErrors: [],
  });
};

exports.postContactMe = async (req, res, next) => {
  const firstName = req.body.fname;
  const lastName = req.body.lname;
  const email = req.body.email;
  const subject = req.body.subject;
  const message = req.body.message;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("index/contact", {
      pageTitle: "Error conatct me",
      path: "/contact",
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      validationErrors: errors.array(),
      oldInput: {
        firstName,
        lastName,
        subject,
        email,
        message,
      },
    });
  }

  const contact = new Contact({ firstName, lastName, email, subject, message });
  try {
    const result = await contact.save();
    res.redirect("/");
    await transporter.sendMail({
      to: "imrnobody4665@gmail.com",
      from: "iam@rahulshah.com.np",
      subject: `New Contact Information Recevied from ${result.firstName}`,
      html: `
       <h2> hey! ${result.firstName} wants to contact you..The details is below:</h2><br>
        <ul>
        <li>First Name: ${result.firstName}</li>
        <li>Last Name: ${result.lastName}</li>
        <li>Email: ${result.email}</li>
        <li>Subject: ${result.subject}</li>
        <li>Message: ${result.message}</li>

    
    </ul>

      Hope! You take the action soon....catch u later
    `,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getabout = async (req, res, next) => {
  const posts = await Post.find().sort({ _id: -1 }).limit(ITEMS_PER_PAGE);
  // console.log(posts.length);
  res.render("index/about", {
    pageTitle: "About Me",
    path: "/about",
    posts,
  });
};

exports.postSubscriptionEmail = async (req, res, next) => {
  const email = req.body.email;
  const subscribe = new Subscribe({ email });
  try {
    const result = await subscribe.save();
    await transporter.sendMail({
      to: "imrnobody4665@gmail.com",
      from: "iam@rahulshah.com.np",
      subject: `A Person Subscribed our blog for updates, the Information Recevied from ${result.email}`,
      html: `
       <h2> hey! ${result.email} has subcribed You..Get in touch with everyday updates with this ${result.email}</h2><br>

      Hope! You take the action soon....catch u later
    `,
    });

    res.redirect("/");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getSinglePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await await Post.findById(postId).populate("userId");
    console.log(post);
    const posts = await Post.find().sort({ _id: -1 });
    const comments = await Comment.find({ postId });

    res.render("Post/single-post", {
      pageTitle: post.title,
      post,
      posts: posts.slice(0, 4),
      path: "/post",
      comments,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postComment = async (req, res, next) => {
  const postId = req.body.postId;
  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;
  const commentDate = moment().format("llll");

  try {
    const comment = new Comment({ name, email, message, postId, commentDate });
    // if (!postId) {
    //   return res.redirect("/");
    // }
    // let post = await Post.findById(postId);

    // const updatedpostComment = [...post.postComment.comments];
    // // console.log(updatedpostComment);
    // updatedpostComment.push({ postId: post._id, name, email, message });
    // // console.log(updatedpostComment);
    // const updatedPost = { comments: updatedpostComment };
    // post.postComment = updatedPost;
    // console.log(post);
    await comment.save();
    res.redirect(`/post/${postId}`);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postCommentReply = async (req, res, next) => {
  const message = req.body.message;
  const commentId = req.body.commentId;
  const replyDate = moment().format("llll");

  const postId = req.body.postId;
  try {
    const comment = await Comment.findById(commentId);

    const updatedRepliesMessage = [...comment.replies.messages];

    updatedRepliesMessage.push({
      message,
      commentId: comment._id,
      replyDate,
    });

    const updatedReplies = { messages: updatedRepliesMessage };
    comment.replies = updatedReplies;

    await comment.save();
    res.redirect(`/post/${postId}`);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPostByCategory = async (req, res, next) => {
  const page = +req.query.page || 1;
  const category = req.params.categoryName;

  try {
    const totalItems = await Post.find().countDocuments;
    const posts = await Post.find()
      .sort({ _id: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    const filteredPost = posts.filter((p) => p.category === category);
    // const m = moment();
    // const postDate = {
    //   day: m.format("dddd"),
    //   month: m.format("MMM"),
    //   year: m.format("yyyy"),
    // };
    // const postDate = moment().format("LLL");
    // console.log(filteredPost);
    res.render("Post/category", {
      pageTitle: "Category",
      path: "/category",
      posts: filteredPost,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//refrence
// exports.postCommentReply = async (req, res, next) => {
//   const message = req.body.message;
//   const commentId = req.body.commentId;
//   const postId = req.body.postId;
//   try {
//     if (!postId) {
//       return res.redirect("/");
//     }

//     let post = await Post.findById(postId);
//     // const commentsRepliestIndex = post.postComment.comments.map((comment) => {
//     //   console.log(comment);
//     //   const replies = comment.replies.messages.findIndex((cp) => {
//     //     console.log(cp);
//     //     return cp.commentId.toString() === commentId.toString();
//     //   });
//     //   console.log(replies);
//     // });

//     const updatedPostCommentReply = [...post.postComment.comments];
//     for (let comment of updatedPostCommentReply) {
//       const updatedRepliesMessage = [...comment.replies.messages];

//       updatedRepliesMessage.push({
//         message,
//         commentId: comment._id,
//       });

//       const updatedReplies = { messages: updatedRepliesMessage };
//       comment.replies = updatedReplies;
//     }
//     await post.save();
//     res.redirect(`/post/${postId}`);
//   } catch (err) {
//     if (!err.statusCode) {
//       err.statusCode = 500;
//     }
//     next(err);
//   }
// };
