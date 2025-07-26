// routes/cardInfo.js
const express = require("express");
const router = express.Router();
const CardInfo = require("../models/CardInfo");

// Add card description
router.post("/", async (req, res) => {
  const { cardId, desc } = req.body;
  try {
    const newInfo = await CardInfo.create({ cardId, desc });
    res.status(201).json(newInfo);
  } catch (err) {
    res.status(500).json({ message: "Error saving description", error: err });
  }
});

// Get card description by cardId
router.get("/:cardId", async (req, res) => {
  try {
    const info = await CardInfo.findOne({ cardId: req.params.cardId });
    res.json(info || {});
  } catch (err) {
    res.status(500).json({ message: "Error fetching description" });
  }
});

// GET /api/cardinfos - get all card descriptions
router.get('/', async (req, res) => {
  try {
    const cardInfos = await CardInfo.find(); // get all card descriptions
    res.json(cardInfos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
