const express = require('express');
const router = express.Router();
const List = require('../models/List');
const Card = require('../models/Card');

// Get lists by boardId
router.get('/:boardId', async (req, res) => {
  const lists = await List.find({ boardId: req.params.boardId });
  res.json(lists);
});

router.post('/', async (req, res) => {
  try {
    const newList = new List({
      title: req.body.title,
      boardId: req.body.boardId
    });
    const savedList = await newList.save();
    res.status(201).json(savedList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/lists - get all lists
router.get('/', async (req, res) => {
  try {
    const lists = await List.find(); // fetch all lists
    res.json(lists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT to update list title
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
    try {
        const updatedList = await List.findByIdAndUpdate(id, { title }, { new: true });
        if (!updatedList) return res.status(404).json({ message: 'List not found' });
        res.json(updatedList);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update list title' });
    }
});

// Reorder cards within the same list
router.put('/:listId/reorder', async (req, res) => {
  const { listId } = req.params;
  const { cardOrder } = req.body; // Array of card IDs in the new order

  try {
    // Update each card with its new position
    for (let i = 0; i < cardOrder.length; i++) {
      await Card.findByIdAndUpdate(cardOrder[i], { order: i });
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reorder cards" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const listId = req.params.id;

    // Delete all cards with this listId
    await Card.deleteMany({ listId });

    // Delete the list itself
    const deletedList = await List.findByIdAndDelete(listId);

    if (!deletedList) {
      return res.status(404).json({ message: "List not found" });
    }

    res.status(200).json({ message: "List and its cards deleted successfully" });
  } catch (err) {
    console.error("Error deleting list and cards:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
