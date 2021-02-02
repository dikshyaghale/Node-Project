const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    posts: [{ type: mongoose.Types.ObjectId, required: true, ref: "Post" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
