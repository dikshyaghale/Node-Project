const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tagline: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    postDate: {
      type: String,
      required: true,
    },
    postComment: {
      comments: [
        {
          type: Object,
          ref: "Comment",
          required: true,
        },
      ],
    },

    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
// const mongoose = require("mongoose");

// const Schema = mongoose.Schema;

// const postSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     tagline: {
//       type: String,
//       required: true,
//     },
//     category: {
//       type: String,
//       required: true,
//     },
//     imageUrl: {
//       type: String,
//       required: true,
//     },
//     postComment: {
//       comments: [
//         {
//           postId: {
//             type: Schema.Types.ObjectId,
//             ref: "Post",
//             required: true,
//           },
//           name: {
//             type: String,
//             required: true,
//           },
//           email: {
//             type: String,
//             required: true,
//           },
//           message: {
//             type: String,
//             required: true,
//           },
//           replies: {
//             messages: [
//               {
//                 message: {
//                   type: String,
//                   required: true,
//                 },
//                 commentId: {
//                   type: Schema.Types.ObjectId,
//                   required: true,
//                 },
//               },
//             ],
//           },
//         },
//       ],
//     },

//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Post", postSchema);
