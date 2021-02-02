const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const subscribeSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Subscribe", subscribeSchema);
