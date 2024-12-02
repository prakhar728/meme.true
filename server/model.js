const mongoose = require("mongoose");

// Meme Schema
const memeSchema = new mongoose.Schema({
  cid: String,
  isTemplate: Boolean,
  memeTemplate: String,
});

const Meme = mongoose.model("Meme", memeSchema);

module.exports = { Meme };
