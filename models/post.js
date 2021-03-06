const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  age: {
    type: String,
    required: true,
  },

  height: {
    type: String,
    required: true,
  },

  weight: {
    type: String,
    required: true,
  },

  phoneNumber: {
    type: String,
    required: true,
  },

  gender: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("GymWebsiteDummy", PostSchema);
