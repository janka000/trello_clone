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

module.exports = router;
