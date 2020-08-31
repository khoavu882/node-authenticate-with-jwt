const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      min: 10,
      max: 64,
      required: true,
    },
    password: {
      type: String,
      min: 7,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = { User };
