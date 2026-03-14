const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  userId: String,
  filename: String,
  originalname: String,
  path: String,

  category: {
    type: String,
    default: "Personal",
  },

  expiryDate: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", fileSchema);