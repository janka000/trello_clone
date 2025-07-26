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

module.exports = router;
