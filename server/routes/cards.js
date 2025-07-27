const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

// Get cards by listId
router.get('/:listId', async (req, res) => {
  const cards = await Card.find({ listId: req.params.listId }).sort({ order: 1 }); // ✅ Sort by order
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

// Move card between lists and reorder
router.put('/:cardId/move', async (req, res) => {
  const { cardId } = req.params;
  const { destinationListId, destinationOrder, sourceOrder } = req.body;

  try {
    // Find the index of the moved card in the destination order array
    const newOrderIndex = destinationOrder.indexOf(cardId);

    // Update moved card's listId and order
    await Card.findByIdAndUpdate(cardId, {
      listId: destinationListId,
      order: newOrderIndex,
    });

    // Adjust order for cards in source list
    for (let i = 0; i < sourceOrder.length; i++) {
      await Card.findByIdAndUpdate(sourceOrder[i], { order: i });
    }

    // Adjust order for cards in destination list
    for (let i = 0; i < destinationOrder.length; i++) {
      await Card.findByIdAndUpdate(destinationOrder[i], { order: i });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to move card" });
  }
});



module.exports = router;
