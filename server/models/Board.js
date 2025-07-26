// server/models/Board.js

const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // You can add more fields later: lists, users, etc.
}, { timestamps: true });

module.exports = mongoose.model('Board', BoardSchema);

