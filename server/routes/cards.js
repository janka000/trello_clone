const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

// Get cards by listId
router.get('/:listId', async (req, res) => {
  const cards = await Card.find({ listId: req.params.listId });
  res.json(cards);
});

// Create card
router.post('/', async (req, res) => {
  const card = new Card(req.body);
  await card.save();
  res.json(card);
});

// GET /api/cards - list all cards
router.get('/', async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Update card by ID
router.put('/:cardId', async (req, res) => {
  try {
    const updatedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      req.body,           // expects updated fields in req.body
      { new: true }       // return the updated document
    );

    if (!updatedCard) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json(updatedCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
