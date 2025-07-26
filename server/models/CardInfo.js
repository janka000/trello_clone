// models/CardInfo.js
const mongoose = require("mongoose");

const cardInfoSchema = new mongoose.Schema({
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
  desc: { type: String, default: "No description" },
});

module.exports = mongoose.model("CardInfo", cardInfoSchema);
