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

// PUT /api/cardinfos/:cardId
router.put('/:cardId', async (req, res) => {
  const { cardId } = req.params;
  const { desc } = req.body;

  if (typeof desc !== 'string') {
    return res.status(400).json({ message: 'Description must be a string.' });
  }

  try {
    const updatedCardInfo = await CardInfo.findOneAndUpdate(
      { cardId },         // Assuming you store the card reference as `cardId`
      { desc },
      { new: true, upsert: true } // creates if doesn't exist, returns new doc
    );

    res.json(updatedCardInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update description.' });
  }
});


module.exports = router;
