const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchmea = new Schema({
  postId: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  commentDate: {
    type: String,
    required: true,
  },
  replies: {
    messages: [
      {
        message: {
          type: String,
          required: true,
        },
        commentId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        replyDate: {
          type: String,
          required: true,
        },
      },
    ],
  },
});

module.exports = mongoose.model("Comment", commentSchmea);
